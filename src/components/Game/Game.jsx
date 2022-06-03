import React, { useState, useEffect } from 'react';
import Chess from './GameClasses';
import { useNavigate } from 'react-router-dom';
import {EngineInstance, tryParseJson } from '../SocketConnection/WebEngine'
import "./game.css"

let pendingId = 0;
function Game() {
  const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  const navigate = useNavigate();
  const playerName = sessionStorage.getItem('userName');
  const Game = new Chess(playerName, null);
  let resign = false;
  const mateCallback = (isMe) => {
    let mateMes = isMe ? 'It`s mate, you lost(' : 'It`s mate, you win!';
    window.confirm(mateMes);
    navigate("/");
  }
  const checkCallback = (isMe) => {
    const checkMes = 'Check!';
    let result = window.confirm(checkMes);
  }
  const mesCallback = (event) => {
    if (event.data === 'Player quit the game!' && !resign) {
      window.confirm('It seems that your opponent resigned. Well Played!');
      navigate("/");
    }
  }
  let gameIsOn = false; 
  const quitButtonCallback = () => {
    let result = window.confirm('Do you want to end the game?');
    if (result) {
      EngineInstance.stopGameForPlayer();
      resign = true;
      navigate("/");
    }
  }
  useEffect(() => {
    const chessboardParent = document.getElementById("chessboard");
    Game.chessboardParent = chessboardParent;
    async function initSocketChecking() {
      let myId = pendingId; 
      gameIsOn = true;
      Game.onCheckMate(mateCallback);
      Game.onCheck(checkCallback);
      EngineInstance.establishConnection(playerName);
      EngineInstance.addMessageCallback(mesCallback);
      EngineInstance.addMessageCallback(Game.serverMessageCallback);
      while(gameIsOn && myId === pendingId)
      {
        EngineInstance.getStateFromServer();
        await sleep(50000);
      }
    }
    
    initSocketChecking();
    return () => { 
      gameIsOn = false;
      pendingId = pendingId + 1;
      EngineInstance.delMessageCallback(mesCallback);
      EngineInstance.delMessageCallback(Game.serverMessageCallback);
      EngineInstance.closeConnection();
    }
  }, []);
  useEffect(() => {
    Game.init();
  }, []);


  return (
    <div className = "GamePage">
	{/* <head>
		<meta charSet="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>Simple Chess Game</title>
		<link rel="stylesheet" href="game.css" />
	</head> */}
	<div className = "GameBody">
		<div id="parent">
			<div className="player-card player-2">
				<div className="rows row-1">
					<div className="icon"></div>
					<div className="text">
						<div className="headline"><h4>Player 1</h4></div>
						<div className="status">
							<span></span>
						</div>
					</div>
				</div>
				<div className="rows row-2">
					{/* <div className="timer">
						<span>00:00</span>
					</div> */}
				</div>
			</div>

			<div id="chessboard" className="chessboard"></div>

			<div className="player-card player-1">
				<div className="rows row-2">
					{/* <div className="timer">
						<span>00:00</span>
					</div> */}
				</div>
				<div className="rows row-1">
					<div className="icon"></div>
					<div className="text">
						<div className="headline"><h4>Player 1</h4></div>
						<div className="status">
							<span></span>
						</div>
					</div>
				</div>
			</div>

		</div>
		{/* <script src="GameClasses.js"></script> */}
	</div>
  <button className="button-85" role="button" onClick={() => { quitButtonCallback(); }}> Resign </button>

  </div>
  )
}

export default Game;