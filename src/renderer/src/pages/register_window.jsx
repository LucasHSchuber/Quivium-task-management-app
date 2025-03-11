import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { getBaseUrl } from '../assets/js/utils';


function Register_window() {
  //define states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [usernameMessage, setUsernameMessage] = useState("");
  const [errorLogginginMessage, setErrorLogginginMessage] = useState("");
  const [successRegisterMessage, setSuccessRegisterMessage] = useState("");

  const navigate = useNavigate();


  
  useEffect(() => {
    setUsername(localStorage.getItem("username") ? localStorage.getItem("username") : "");  
    console.log(getBaseUrl());
  }, [])

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    console.log("e.target.value");
    setUsernameMessage("");
    setErrorLogginginMessage("");
  };
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    console.log("e.target.value");
    setPasswordMessage("");
    setErrorLogginginMessage("");
  };




  // Method to register user
  const registerUser = async () => {
    if (password === "" && username === "") {
      console.log("Enter username and password");
      setPasswordMessage(true);
      setUsernameMessage(true);
      setErrorLogginginMessage("");
      setSuccessRegisterMessage("");
    }
    if (password === "") {
      console.log("Enter password");
      setPasswordMessage(true);
      setSuccessRegisterMessage("");
    } else {
      setPasswordMessage("");
    }
    if (username === "") {
      console.log("Enter username");
      setUsernameMessage(true);
      setSuccessRegisterMessage("");
    } else {
      setUsernameMessage("");
    }

    if (password !== "" && username !== "") {
      console.log("password and username entered");

      if (!navigator.onLine) {
        // Check if email exists in local database. If it does, print message to interface
        try {
          const userExistsResponse = await window.api.findUserByEmail(username);
          console.log('userExistsResponse', userExistsResponse);
          if (userExistsResponse) {
            setErrorLogginginMessage("A user with the email already exists. Try to log in!");
            return;
          }
        } catch (error) {
          console.log('error', error);
        }
        setErrorLogginginMessage("You need an internet connection to register a new account");
        return;
      } else {
        const userData = {
          username: username,
          password: password
        }
          try {
            const responseData = await window.api.createUser(userData);
            console.log(responseData);

            if (responseData.success === true) {
              localStorage.setItem("username", username);
              console.log("User created successfully");
              setSuccessRegisterMessage("Account activated successfully. You can now proceed to log in!")
              setPassword("");
              setUsername("");
              setErrorLogginginMessage("");
            } else {
              console.log("Error creating user");
              setErrorLogginginMessage("User already exists. Proceed to log in!");
              setSuccessRegisterMessage("");
            }
          } catch (error) {
            console.log("error:", error);
          }
      }
    }
  }



  return (
    <div className="login_window-wrapper">
      <div className="login_window-content">

        <h5 className="mb-3 mr-3" ><b>Activate account</b></h5>
        <div style={{ textAlign: "left", width: "110%", marginLeft: "-1.5em" }}>
          {usernameMessage || passwordMessage || errorLogginginMessage ? (
            <ul className="error">
              {errorLogginginMessage ? <li>{errorLogginginMessage}</li> : ""}
            </ul>
          ) : (
            <>
            </>
          )}
        </div>
        <div style={{ textAlign: "left", width: "110%", marginLeft: "-1.5em" }}>
          {successRegisterMessage ? (
            <ul className="success">
              {successRegisterMessage ? <li>{successRegisterMessage}</li> : ""}
            </ul>
          ) : (
            <>
            </>
          )}
        </div>
        <div>
          <div>
            <input
              className={`form-input-field-login ${usernameMessage ? "error-border" : ""}`}
              placeholder="Email"
              type="text"
              value={username}
              onChange={handleUsernameChange}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  registerUser();
                }
              }}
            />
          </div>
          <div>
            <input
              className={`form-input-field-login ${passwordMessage ? "error-border" : ""}`}
              placeholder="Password"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  registerUser();
                }
              }}
            />
          </div>
        </div>

        <div>
          <button className="button normal fixed-width mt-3 mb-2" onClick={registerUser}>
            Activate
          </button>
        </div>
        <a 
          href="#"
          role="button"
          className="register-link-login" 
          onClick={(e) => {
            e.preventDefault();
            navigate('/login_window');
          }}
          style={{ color: "black" }}
        >
          Already activated your account? <br></br> Log in here!
        </a>

      </div>
    </div >
  );
};

export default Register_window;