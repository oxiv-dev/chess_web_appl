import React from 'react'
import "./auth.css"
import { useNavigate } from 'react-router-dom';


function Auth() {

    let navigate = useNavigate();
  return (
      <div className='auth'>
      <form>
              <p><label className='ask'>ENTER YOUR NAME</label></p>
              <p><input className="inputField"
              type="text" 
              required/></p>
              <p><button onClick={() => {navigate("/pending");}}
              className="submitButton">OK</button></p>
          </form>
      </div>
    
  )
}

export default Auth;
