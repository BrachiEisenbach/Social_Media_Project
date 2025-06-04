import logo from './logo.svg';
import './App.css';
import LogIn from './components/login/LogIn';
import Register from './components/register/Register';
import Home from './components/home/Home';
import { Link, Route, Routes, Navigate } from 'react-router-dom';
function App() {
 return (
    <div className="App">
      <Navigation />
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LogIn />} />
        <Route path="/register" element={<Register />} />
       <Route path="/home/*" element={ <Home /> } />
      </Routes>
    </div>
  );
}

function Navigation() {
  return (
    <nav
      style={{
        borderBottom: "solid 1px",
        paddingBottom: "1rem",
      }}
    >
      <>
        <Link to="/register">Register</Link>{" "}
        <Link to="/login">Log In</Link>
      </>
     
    </nav>
    
  );
}

export default App;
