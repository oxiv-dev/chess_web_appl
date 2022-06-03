import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {EngineInstance} from '../SocketConnection/WebEngine'
import './pending.css'

let pendId = Math.random();
const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function Pending() {
  const navigate = useNavigate();
  const playerName = sessionStorage.getItem('userName');

  const conCallback = (event) => {
    // console.log(`Connection established: \n `,event)
  };
  const messCallback = (event) => {
      if (event.data !== 'Waiting for player...')
      {
        sessionStorage.setItem('lastGameState', event.data);
        navigate('/Game');
      }
    }

  useEffect(() => {
    //console.log(playerName);
    EngineInstance.addConnectCallback(
      conCallback
    );
    EngineInstance.addMessageCallback(
      messCallback
    );
      return () => {
        EngineInstance.delConnectCallback(conCallback);
        EngineInstance.delMessageCallback(messCallback);
      }
  });
  useEffect(() => {
    EngineInstance.establishConnection(playerName);
      return () => {
        EngineInstance.closeConnection();
      }
  });
  useEffect(() => {
    async function pendState() {
      let myId = pendId; 
      EngineInstance.establishConnection(playerName);
      while(myId === pendId)
      {
        EngineInstance.getStateFromServer();
        await sleep(5000);
      }
    }
    
    pendState();
  });
  return (
    
    <div className='scale-up-center'>
      <div className='pending-text'>
      Looking for players...
      </div>
      </div>

  )
}

export default Pending;
