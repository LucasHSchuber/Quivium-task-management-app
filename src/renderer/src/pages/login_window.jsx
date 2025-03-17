import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import fp from "../assets/images/diaphragm_black.png";
import q from "../assets/images/q.png"
import {  } from "@fortawesome/free-solid-svg-icons";

function Login_window() {
  //define states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [usernameMessage, setUsernameMessage] = useState("");
  const [errorLogginginMessage, setErrorLogginginMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingConfirm, setIsLoadingConfirm] = useState(false);

  const navigate = useNavigate();

  

  //lget localstorage variables
  useEffect(() => {
    setUsername(
      localStorage.getItem("username") ? localStorage.getItem("username") : "",
    );
  }, []);

  //load loading bar on load
  useEffect(() => {
    // Check if the loading bar has been shown before
    const hasLoginLoadingBarShown = sessionStorage.getItem(
      "hasLoginLoadingBarShown",
    );
    // If it has not been shown before, show the loading bar
    if (!hasLoginLoadingBarShown) {
      const timer = setTimeout(() => {
        setIsLoading(false);
        sessionStorage.setItem("hasLoginLoadingBarShown", "true");
      }, 2500);

      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, []);


  // Handle username
  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    console.log("e.target.value");
    setUsernameMessage("");
    setErrorLogginginMessage("");
  };
  // Handle password
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setPasswordMessage("");
    setErrorLogginginMessage("");
  };




  // Method to login user
  const loginUser = async () => {
    if (password === "" && username === "") {
        console.log("Enter username and password");
        setPasswordMessage(true);
        setUsernameMessage(true);
        setErrorLogginginMessage("");
    }
    if (password === "") {
        console.log("Enter password");
        setPasswordMessage(true);
    } else {
        setPasswordMessage("");
    }
    if (username === "") {
        console.log("Enter username");
        setUsernameMessage(true);
    } else {
        setUsernameMessage("");
    }

    if (password !== "" && username !== "") {
      console.log("password and username entered");
      const data = { 
        email: username, 
        password: password 
      }
      try {
          const data = { 
              email: username, 
              password: password 
          };
          const responseData = await window.api.loginUser(data);
          console.log(responseData);
          if (responseData.status === 200) {
              console.log("Log in successful");
              localStorage.setItem("user_id", responseData.user.user_id);
              localStorage.setItem("username", username);
              localStorage.setItem("password", password);
              // localStorage.setItem("token", responseData.user.token);
              // close login window and open mainWindow
              setIsLoadingConfirm(true);
              const timeout = setTimeout(() => {
                window.api.createMainWindow();
              }, 2400);
          } else if (responseData.status === 202) { // User not found in local database
              console.log("Activate your account by clicking the 'Activate account' button below.");
              setErrorLogginginMessage("Activate your account by clicking the 'Activate account' button below.");
          } else {
              console.log("Invalid password");
              setErrorLogginginMessage("Invalid password.");
          }
      } catch (error) {
            console.log("error:", error);
      }

    } else {
        console.error("Password or Username is missing");
        return null;
    }
  };


  if (isLoading) {
    // Render loading indicator while content is loading
    return (
      <div className="loading-login">
        <div className="spinning-logo-login">
          <img src={q} alt="Quivium" />
          <p>
            <em>Quivium</em>
          </p>
        </div>
      </div>
    );
  }
  if (isLoadingConfirm) {
    // Render loading indicator while content is loading
    return (
      <div className="signing-in">
        <div className="spinning-logo-login" style={{ paddingTop: "6em" }}>
          <p>
            <em>Signing in...</em>
          </p>
        </div>
        <div className="loading-bar-container-login">
          <div className="loading-bar-login"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="login_window-wrapper">
      <div className="login_window-content">
        <h5 className="mb-3 mr-3">
          <b>Log in</b>
        </h5>
        <div style={{ textAlign: "left", width: "110%", marginLeft: "-1.5em" }}>
          {usernameMessage || passwordMessage || errorLogginginMessage ? (
            <ul className="error">
              {/* {usernameMessage ? <li>{usernameMessage}</li> : ""}
                {passwordMessage ? <li>{passwordMessage}</li> : ""} */}
              {errorLogginginMessage ? <li>{errorLogginginMessage}</li> : ""}
            </ul>
          ) : (
            <></>
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
                  loginUser();
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
                  loginUser();
                }
              }}
            />
          </div>
        </div>

        <div>
          <div>
            <button
              className="button normal fixed-width mt-3 mb-2"
              onClick={loginUser}
            >
              Log in
            </button>
          </div>
          <a 
            href="#"
            className="register-link-login" 
            role="button"
            onClick={(e) => {
              e.preventDefault();
              navigate("/register_window");
            }}
            style={{ color: "black" }}
          >
            Want to create an account? Click here!
        </a>


          {/* <button
            className="button activate-account-button fixed-width mb-2"
            onClick={(e) => {
              e.preventDefault();
              navigate("/register_window");
            }}
          >
            Activate account
          </button> */}
        </div>
      </div>
    </div>
  );
}

export default Login_window;
