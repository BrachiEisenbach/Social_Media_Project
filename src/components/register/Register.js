import { useState, useEffect } from "react";
import "./Register.css";
import { useNavigate } from "react-router-dom";
import React from "react";
function Register() {
  //סטייט לתצוגת פרטי המשתמש
  const [inputs, setInputs] = useState({
    name: "",
    username: "",
    email: "",
    address: {
      street: "",
      suite: "",
      city: "",
      zipcode: "",
    },
    phone: "",
    website: "",
  });
  //סטייט למערך המשתמשים
  const [userArray, setUserArray] = useState([]);
  //סטייט לחיפוש היוזר הנוכחי
  const [findUser, setFindUser] = useState(false);
  //סטייט להצגת טופס פרטים מלא
  const [showCompleteForm, setShowCompleteForm] = useState(false);
  //סטייט להצגת הודעות למשתמש
  const [message, setMessage] = useState("");

  //פונקציה לניתוב
  const Navigate = useNavigate();

  //פונקציה למילוי אובייקט המשתמש בשרת
  const handleChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    if (["street", "suite", "city", "zipcode"].includes(name)) {
      setInputs((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [name]: value,
        },
      }));
    } else {
      setInputs((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  //הוצאת כל המשתמשים מהשרת
  useEffect(() => {
    fetch("http://localhost:3001/users")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setUserArray(Array.isArray(data) ? data : [data]);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  //חיפוש המשתמש במערך המשתמשים בשרת. אם הוא לא קיים - הצגת פרופיל מלא למילוי
  const check = (event) => {
    event.preventDefault();
    const userExists = userArray.some(
      (u) => inputs.username === u.username && u.website === inputs.website
    );
    if (userExists) {
      setFindUser(true);
      console.log("User already exists");
      setMessage("User already exists. Please go to the login page.");
      setInputs({
        name: "",
        username: "",
        email: "",
        address: {
          street: "",
          suite: "",
          city: "",
          zipcode: "",
        },
        phone: "",
        website: "",
      });
      return;
    } else {
      setFindUser(false);
      console.log("User not found");
      setMessage("Please complete your profile.");
      setShowCompleteForm(true);
      if (isFormComplete(inputs)) {
        addUser();
      } else {
        console.log("Please complete all fields.");
        setMessage("Please complete all fields.");
      }
    }
  };

  //פונקציה לבדיקה אם המשתמש מילא את כל השדות בפרופיל המלא
  const isFormComplete = (inputs) => {
    return (
      inputs.name &&
      inputs.username &&
      inputs.email &&
      inputs.phone &&
      inputs.website &&
      inputs.address.street &&
      inputs.address.suite &&
      inputs.address.city &&
      inputs.address.zipcode
    );
  };

  //הוספת המשתמש הנוכחי לשרת ושמירתו בלוקאל סטורג'
  const addUser = () => {
    const newUser = { ...inputs };
    fetch("http://localhost:3001/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newUser),
    })
      .then((response) => {
        if (response.ok) {
          console.log("response is ok");
          return response.json();
        }
        setMessage("error");
        throw new Error("Request failed!");
      })
      .catch((error) => console.error("Error adding user:", error))
      .then((jsonResponse) => {
        console.log("print user:");
        console.log(jsonResponse);
        localStorage.setItem("user", JSON.stringify(newUser));
        Navigate("/home");
        setInputs({
          name: "",
          username: "",
          email: "",
          address: {
            street: "",
            suite: "",
            city: "",
            zipcode: "",
          },
          phone: "",
          website: "",
        });
      });
  };
  return (
    <>
      <form>
        <label>
          Enter your Name:
          <input
            type="text"
            name="username"
            value={inputs.username || ""}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Enter your password:
          <input
            type="password"
            name="website"
            value={inputs.website || ""}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          check your verify password:
          <input
            type="password"
            name="verify"
            value={inputs.verify || ""}
            onChange={handleChange}
            required
          />
        </label>
        <button onClick={check}>Send</button>
      </form>
      {message && <p>{message}</p>}
      {showCompleteForm && (
        <form>
          <label>Complete Your Profile</label>
          <label>
            Name:
            <input
              type="text"
              name="name"
              value={inputs.name}
              onChange={handleChange}
              required
            />{" "}
          </label>
          <label>
            Email:
            <input
              type="email"
              name="email"
              value={inputs.email}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Street:
            <input
              type="text"
              name="street"
              value={inputs.address.street}
              onChange={handleChange}
              required
            />{" "}
          </label>
          <label>
            Suite:
            <input
              type="text"
              name="suite"
              value={inputs.address.suite}
              onChange={handleChange}
              required
            />{" "}
          </label>
          <label>
            City:
            <input
              type="text"
              name="city"
              value={inputs.address.city}
              onChange={handleChange}
              required
            />{" "}
          </label>
          <label>
            Zipcode:
            <input
              type="text"
              name="zipcode"
              value={inputs.address.zipcode}
              onChange={handleChange}
              required
            />{" "}
          </label>
          <label>
            Phone:
            <input
              type="tel"
              name="phone"
              value={inputs.phone}
              onChange={handleChange}
              required
            />{" "}
          </label>
          <button type="submit" onClick={addUser}>
            Submit
          </button>
        </form>
      )}
    </>
  );
}
export default Register;
