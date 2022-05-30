import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EngineInstance from '../SocketConnection/WebEngine'
import './pending.css'

function Pending() {
  const Navigate = useNavigate();
  const playerName = sessionStorage.getItem('userName')

  const conCallback = (event) => {
    console.log(`Connection established: \n `,event)
  };
  const messCallback = (event) => {
      console.log(`Received in callback: \n `, event)
      if (event.data !== 'Looking for players...')
      {
        Navigate('/');
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
    console.log('sub');
    //console.log('I fire once');
    //isConnected = 
      return () => {
        console.log('unsub');
        EngineInstance.delConnectCallback(conCallback);
        EngineInstance.delMessageCallback(messCallback);
      }
  });
  useEffect(() => {
    EngineInstance.establishConnection(playerName);
      return () => {
        console.log('break con');
        EngineInstance.closeConnection();
      }
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
