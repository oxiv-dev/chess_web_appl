import "./auth.css"
import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';

function Auth() {

    const Navigate = useNavigate();
    let ClickCallback = () => { 
        sessionStorage.setItem('userName', userName);
        Navigate("/pending");
    }
    const [userName, setMessage] = useState( '' );
  return (
      <div className='auth'>
      <form>
              <p><label className='ask'>ENTER YOUR NAME</label></p>
              <p><input 
                    className="inputField"
                    type="text"
                    onChange={e => setMessage(e.target.value)} 
                    required/>
              </p>
              <p><button onClick={() => { ClickCallback(); }}
              className="submitButton">OK</button></p>
          </form>
      </div> 
  )
}

export default Auth;
