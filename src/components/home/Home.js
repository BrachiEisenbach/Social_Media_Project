import { Link, Route, Routes } from "react-router-dom";
import Albums from "../albums/Albums";
import Posts from "../posts/Posts";
import Todos from "../todos/Todos";
import React from "react";
import './Home.css'
const userls=localStorage.getItem("user")
  const user=JSON.parse(userls)
function Home() {
  
  return (
    <>
      <Navigation/>
      <h1>Welcome, {user?.name || "Guest"}!</h1>
      <Routes>
        <Route />
        <Route path="/info" element={<Infos/>}/>
        <Route path="/todos" element={<Todos />} />
        <Route path="/posts" element={<Posts />} />
        <Route path="/albums/*" element={<Albums />}/>
      </Routes>
      
    </>
  );
}
export default Home;

function Navigation() {
  return (
    <nav
      style={{
        borderBottom: "solid 1px",
        paddingBottom: "1rem",
      }}
    >
      <Link to="/home/info">Info</Link>
      <Link to="/home/todos">Todos</Link>
      <Link to="/home/posts">Posts</Link>
      <Link to="/home/albums">Albums</Link>
      <Link to="/login">Log Out</Link>
    </nav>
  );
}
function Infos(){
  console.log("to info");
  const AllInfoLS=localStorage.getItem("user");
  const AllInfo=JSON.parse(AllInfoLS);

  function returnObject(obj){
    return(
    <>
      <ul>
        {Object.entries(obj).map(([key, value]) => (
          <ol key={key}>
            {key==="website"?
            (
              <strong>password</strong>
            ):<strong>{key}:</strong>}
            {typeof value === "object" && value !== null ? (
              returnObject(value) 
            ) : (
              value.toString()
            )}
          </ol>
        ))}
      </ul>
    </>
    );
  }
  return(
    <>
    <h1>info</h1>
    {returnObject(AllInfo)}
    </>
  );
}

