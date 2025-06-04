import './LogIn.css';
import { useState, useEffect } from "react";
import React from "react";
import { useNavigate } from "react-router-dom";
function LogIn() {
  const [inputs, setInputs] = useState({});
  const [userArray, setUserArray] = useState([]);
  const Navigate=useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setInputs((values) => ({ ...values, [name]: value }));
  };
  if(localStorage.length){
    localStorage.clear();
  }
  useEffect(() => {
    fetch("http://localhost:3001/users")
      .then((response) => response.json())
      .then((data) => {
        setUserArray(Array.isArray(data) ? data : [data]);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);
  
  const check = (event) => {
    event.preventDefault();
    const user= userArray.find(
      (u) => inputs.username === u.username && inputs.password === u.website
    );
    if (user) {
      localStorage.setItem("user",JSON.stringify(user));
      Navigate("/home")
    } else {
      console.log("You are not a member");
      alert("your username or password are wrong");
    }
  };

  return (
    <>
        <form onSubmit={check}>
          <label>
            Enter your Name:
            <input
              type="text"
              name="username"
              value={inputs.username || ""}
              onChange={handleChange}
            />
          </label>
          <label>
            Enter your Password:
            <input
              type="password"
              name="password"
              value={inputs.password || ""}
              onChange={handleChange}
            />
          </label>
          <button type="submit">Send</button>
        </form>
    </>
  );
}
export default LogIn;
