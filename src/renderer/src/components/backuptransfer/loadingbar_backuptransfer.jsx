import React, { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { TailSpin } from "react-loader-spinner";
import { Bars } from "react-loader-spinner";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faCloudArrowUp, faCircle } from "@fortawesome/free-solid-svg-icons";

import "../../assets/css/backuptransfer/components_backuptransfer.css";

const Loadingbar_backuptransfer = ({ files, uploadProgress, uploadPercentage, uploadFile, finishedUploading }) => {
  //define states
  const [uploadedFilesArray, setUploadedFilesArray] = useState([]);

  console.log("files", files);
  console.log("finishedUploading", finishedUploading);
  console.log("uploadProgress", uploadProgress);
  console.log("uploadPercentage", uploadPercentage);
  console.log("uploadFile", uploadFile);


  useEffect(() => {
    files.forEach(file => {
      if (finishedUploading.filename === file.name) {
        console.log("Uploading:", file.name)
          if (!uploadedFilesArray.includes(file.name)) {
            setUploadedFilesArray((prevArray) => [...prevArray, file.name]);
        }
      }
    });
  }, [finishedUploading]);


  useEffect(() => {
    console.log('uploadedFilesArray', uploadedFilesArray);
  }, [finishedUploading]);

  

  return (
    <div className="loadingbar-backuptransfer">

        <div style={{ marginLeft: "5em" }}>
          <h6 className="mb-3" style={{ fontWeight: "700" }}>Uploading files:</h6>
          {files.map((file, index) => (
            <div key={index} className="d-flex ml-2">
              <FontAwesomeIcon icon={faCircle} style={{ fontSize: "0.3em", marginTop: "0.8em", marginRight: "1em" }} />
              <h6 style={{ fontSize: "0.85em" }}>{file.name}</h6>
              <div className="progress-container d-flex">
                <progress
                  className="progress-bar"
                  value={uploadedFilesArray.includes(file.name) ? 100 : (file.name === uploadFile ? uploadPercentage : 0)}
                  max="100"
                  style={{ width: "100%", height: "20px",marginTop: "-1.2em", marginLeft: "1em", backgroundColor: uploadedFilesArray.includes(file.name) ? "#69ee2a" : "",
                  }}
                ></progress>
                <div className="d-flex">
                  <h6 style={{ marginTop: "-1.6em", marginLeft: "2em", fontSize: "0.8em", color: uploadedFilesArray.includes(file.name) ? "#518b0c" : "" }}>          
                    {uploadedFilesArray.includes(file.name) ? "100%" : (file.name === uploadFile ? `${uploadPercentage}%` : "0%")}
                  </h6>
                  <h6 style={{ marginTop: "-1.6em", marginLeft: "0.5em", fontSize: "0.8em", color: uploadedFilesArray.includes(file.name) ? "#518b0c" : "" }}>
                    {uploadedFilesArray.includes(file.name) ? <FontAwesomeIcon icon={faCheck} /> : <FontAwesomeIcon icon={faCloudArrowUp} />}
                  </h6>
                </div>  
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Loadingbar_backuptransfer;
