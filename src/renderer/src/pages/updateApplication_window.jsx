import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
import fp from "../assets/images/logo_white.png";
import q from "../assets/images/q.png"


function UpdateApplication_window() {
  //define states
  const [message, setMessage] = useState("Checking for updates..");
  const [errorMessage, setErrorMessage] = useState("");
  const [downloadProgress, setDownloadProgress] = useState("0");
  const [updateAvailable, setUpdateAvailable] = useState(false);
  console.log(window.api);


  useEffect(() => {
    const handleUpdateNotAvailable = (event, data) => {
        console.log("Message from main process (update-not-available):", data.message);
        setMessage(data.message);
        window.api.createLoginWindow();
      };

    const handleUpdateAvailable = (event, data) => {
      console.log("Message from main process (update-available):", data.message);
      setMessage(data.message);
    };
  
    const handleDownloadProgress = (event, data) => {
      console.log("Message from main process (download-progress):", data.message);
      console.log(`Download Progress: ${data.progress}%`);
      setUpdateAvailable(true);
      setMessage(`${data.message}`);
      setDownloadProgress(`${data.progress.toFixed(2)}`);
    };
  
    const handleUpdateDownloaded = (event, data) => {
      console.log("Message from main process (update-downloaded):", data.message);
      setDownloadProgress("");
      setUpdateAvailable(false);
      setMessage(data.message);
    };

    const handleUpdateError = (event, data) => {
        console.log("Error while checking for updates (update-error):", data.message);
        setErrorMessage(data.message);
        setTimeout(() => {
          setErrorMessage("");
          setMessage("Starting..");
          window.api.createLoginWindow();
        }, 5000);
    };
  
    // Add listeners for all events
    window.api.on("update-not-available", handleUpdateNotAvailable);
    window.api.on("update-available", handleUpdateAvailable);
    window.api.on("download-progress", handleDownloadProgress);
    window.api.on("update-downloaded", handleUpdateDownloaded);
    window.api.on("update-error", handleUpdateError);
  
    // Cleanup listeners on unmount
    return () => {
      window.api.removeAllListeners("update-not-available");
      window.api.removeAllListeners("update-available");
      window.api.removeAllListeners("download-progress");
      window.api.removeAllListeners("update-downloaded");
      window.api.removeAllListeners("update-error");
    };
  }, []);
  

  return (
    <div className="updateapplication_window-wrapper">
       <div className="updateapplicationspinning-logo-login">

          <img src={q} alt="fotografportalen" />

          <p className="mt-3 px-1"><em>{!errorMessage ? message : ""}</em></p>
          <p className="px-2" style={{ fontSize: "0.6em" }}>{errorMessage ? errorMessage : ""}</p>

          {updateAvailable && (
            <div className="d-flex justify-content-center mt-4">
              <progress
                className="progress-bar-updatewindow"
                value={downloadProgress}
                max="100"
              ></progress>
              <p style={{ fontSize: "0.85em", marginTop: "-0.6em", marginLeft: "0.6em" }}><em>{downloadProgress}%</em></p>
            </div>
          )}

        </div>
    </div>
  );
}

export default UpdateApplication_window;
