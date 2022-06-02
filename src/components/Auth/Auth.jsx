import "./auth.css"
import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';

function Auth() {

    const Navigate = useNavigate();
    const savedName = sessionStorage.getItem('userName');
    const [userName, setMessage] = useState( savedName );
    let ClickCallback = () => { 
        if (userName === ''){
            window.confirm('name should not be empty!');
            return;
        }
        sessionStorage.setItem('userName', userName);
        Navigate("/pending");
    }
  return (
      <div className='auth'>
      <form>
              <p><label className='ask'>ENTER YOUR NAME</label></p>
              <p><input 
                    className="inputField"
                    type="text"
                    onChange={e => setMessage(e.target.value)} 
                    required
                    value = {userName}
                    /> 
              </p>
              <p><button onClick={() => { ClickCallback(); }}
              className="submitButton">OK</button></p>
          </form>
      </div> 
  )
}

export default Auth;
