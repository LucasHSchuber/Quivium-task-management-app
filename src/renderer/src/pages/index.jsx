import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import semver from "semver";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
const MySwal = withReactContent(Swal);

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {  } from "@fortawesome/free-regular-svg-icons";
import {  } from "@fortawesome/free-solid-svg-icons";

import Sidemenu from "../components/sidemenu";

import env from "../assets/js/env";




function Index() {
  //define states
  const [githubURL, setGithubURL] = useState("");
  const [currentVersion, setCurrentVersion] = useState("");
  const [latestVersion, setLatestVersion] = useState("");
  const [releaseNotes, setReleaseNotes] = useState("");
  const [normalizedLatestVersion, setNormalizedLatestVersion] = useState("");


  const restartApplication = () => {
    try {
      window.api.restartApplication();
    } catch (error) {
      console.log('Error restarting application');
    }
  }

  // ---------- CHECK FOR UPDATES AND UPDATES METHODS ---------- 

  // check if there is a new APP-release
  useEffect(() => {
    let env_file = env;
    let github_url = env_file.githubUrl;
    const githubToken = env_file.githubToken;
    console.log("api object:", window.api);
    console.log("env file:", env_file);
    console.log("github token:", githubToken);
    console.log("github url:", github_url);
    setGithubURL(github_url + "/latest");

    const checkForUpdates = async () => {
      // getting latest app-verson
      try {
        const response = await axios.get(github_url, {
          headers: {
            Authorization: `token ${githubToken}`,
          },
        });
        console.log('response', response);
        // Extract realase notes
        const releaseNotes = response.data[0].body;
        console.log(releaseNotes);
        setReleaseNotes(releaseNotes);
        // Extract the latest release version
        const latestReleaseVersion = response.data[0].tag_name;
        console.log("Latest release version:", latestReleaseVersion);
        setLatestVersion(latestReleaseVersion);
        const normalizedLatestReleaseVersion = latestVersion.startsWith("v")
          ? latestVersion.slice(1)
          : latestVersion;
        setNormalizedLatestVersion(normalizedLatestReleaseVersion);
      } catch (error) {
        console.error("Error fetching GitHub data:", error);
      }

      // getting latest current app-version
      try {
        const currentVersion = await window.api.getCurrentAppVersion();
        console.log("Current app version", currentVersion);
        setCurrentVersion(currentVersion);
      } catch (error) {
        console.log("error fetching app:", error);
      }

      // gtting home dir
      try {
        const homedir = window.api.homeDir();
        console.log("homedir", homedir);
      } catch (error) {
        console.log("error fetching homedir:", error);
      }
    };
    checkForUpdates();
  }, []);




  // Method to calculate the diff between the jobs project_date and the current datetime
  const getDaysSinceTimestamp = (project_date) => {
      const currentDateTime = getCurrentDateTime() 
      const projectDate = new Date(project_date)
      const currentDate = new Date(currentDateTime)
      const diffms = currentDate - projectDate;
      const diffInDays = Math.floor(diffms / (1000 * 60 * 60 * 24));
      return diffInDays;
  }
  // Method to return current datetime
  const getCurrentDateTime = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0'); 
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');    
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };


  return (
    <div className="index-wrapper">
      <div className="index-box">

       

      </div>



      <Sidemenu />

    </div>
  );
}
export default Index;
