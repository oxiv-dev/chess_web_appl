import {BrowserRouter as Router, Route, Link } from 'react-router-dom';
import {Routes} from 'react-router-dom';

import Auth from './components/Auth/Auth';
import Pending from './components/Pending/Pending';
import Game from './components/Game/Game';

import "./App.css"
const App = () => {
return(
  <Router>
    <div className="App">
      <Routes>
        <Route path="/" element={<Auth />}></Route>
        <Route path="/pending" element={<Pending />}></Route>
        <Route path="/game" element={<Game />}></Route>
      </Routes>
   </div>
   </Router>
  )
  
}

export default App


{/* <h1>FIRST PAGE</h1>   */}