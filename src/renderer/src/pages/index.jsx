import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import profile from "../assets/images/photographer.png";
import semver from "semver";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquareCheck } from "@fortawesome/free-regular-svg-icons";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

import Sidemenu from "../components/sidemenu";
import Sidemenu_small from "../components/sidemenu_small";

import {
  gdprProtectionMethod,
  gdprProtectionMethod_teamshistory,
} from "../assets/js/gdprProtection";
import fetchNews from "../assets/js/fetchNews";
import env from "../assets/js/env";
import DOMPurify from "dompurify";

function Index() {
  //define states
  const [user, setUser] = useState({});
  const [homeDir, setHomeDir] = useState("");
  const [projectsArray, setProjectsArray] = useState([]);
  // const [showLoginModal, setShowLoginModal] = useState(false);
  const [githubURL, setGithubURL] = useState("");
  const [currentVersion, setCurrentVersion] = useState("");
  const [latestVersion, setLatestVersion] = useState("");
  const [normalizedLatestVersion, setNormalizedLatestVersion] = useState("");

  const [allNews, setAllNews] = useState([]);

  const handleCloseLoginModal = () => {
    setShowLoginModal(false);
  };
  const navigate = useNavigate();

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

  //fetch all news from company database
  const fetchAllNews = async () => {
    const allNews = await fetchNews();
    console.log("allnews", allNews);
    try {
      const newsFromTable = await window.api.get_news();
      console.log("News from table:", newsFromTable);
      setAllNews(newsFromTable.news);
    } catch (error) {
      console.log("Error fetching news from table:", error);
    }
  };
  useEffect(() => {
    fetchAllNews();
  }, []);

  //donwload latest version method
  const downloadLatestVersion = async () => {
    console.log("downloading latest version");
    try {
      const githubResponse = await axios.get(githubURL);
      const latestRelease = githubResponse.data;
      const downloadUrl = latestRelease.assets.find((asset) =>
        asset.name.endsWith(".dmg"),
      )?.browser_download_url;

      if (!downloadUrl) {
        throw new Error("No .dmg file found in the latest release");
      }
      console.log(downloadUrl);
      console.log("Update available, preparing to download...");
      const userConfirmed = await promptUserToCloseApp();
      if (userConfirmed) {
        console.log("User confirmed, proceeding with update...");
        localStorage.setItem("pendingUpdateUrl", downloadUrl);
        await window.api.applyUpdates(downloadUrl);
      } else {
        console.log("User canceled the update.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const promptUserToCloseApp = () => {
    return window.confirm(
      "The application will close to update. Make sure to save all your work. Do you want to continue?",
    );
  };

  //get all current projects with user_id
  useEffect(() => {
    let user_id = localStorage.getItem("user_id");
    const getAllProjects = async () => {
      try {
        const projects = await window.api.getAllCurrentProjects(user_id);
        console.log("Projects:", projects.projects);
        setProjectsArray(projects.projects);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    // fetch user data
    const fetchUser = async () => {
      try {
        const usersData = await window.api.getUser(user_id); // Fetch users data from main process
        console.log("Users Data:", usersData); // Log the users data
        setUser(usersData.user);
        console.log(usersData.user);
        localStorage.setItem(
          "user_name",
          usersData.user.firstname + " " + usersData.user.lastname,
        );
        localStorage.setItem("user_lang", usersData.user.lang);
        localStorage.setItem("token", usersData.user.token);
      } catch (error) {
        console.error("Error fetching users data:", error);
      }
    };

    //clear data - GDPR
    const runGdprProtection = async () => {
      try {
        const response = await gdprProtectionMethod();
        console.log("GDPR response:", response);

        if (response && response.statusCode === 1) {
          console.log("GDPR data cleared successfully");
        } else {
          console.error(
            "Error clearing GDPR data:",
            response?.errorMessage || "Unknown error",
          );
        }
      } catch (error) {
        console.error("Error clearing GDPR data:", error);
      }

      try {
        const response = await gdprProtectionMethod_teamshistory();
        console.log("GDPR response:", response);

        if (response && response.statusCode === 1) {
          console.log("GDPR data cleared successfully in teams_history");
        } else {
          console.error(
            "Error clearing GDPR data in teams_history:",
            response?.errorMessage || "Unknown error",
          );
        }
      } catch (error) {
        console.error("Error clearing GDPR data in teams_history:", error);
      }
    };

    fetchUser();
    getAllProjects();
    runGdprProtection();
  }, []);
  console.log(
    `Comparing versions, Current: ${currentVersion}, Latest: ${latestVersion}`,
  );

  //confirming news and updating news table
  const confirmNews = async (id) => {
    console.log("Confirm news!", id);
    try {
      const response = await window.api.confirm_news(id);
      console.log("confirm news successfully updated", response);
      fetchAllNews();
    } catch (error) {
      console.log("error updatating news", error);
    }
  };

  return (
    <div className="d-flex index-wrapper">
      <div className="index-box-left">
        <div className="index-box d-flex">
          <div className="avatar-container">
            <img
              className="profile-picture"
              src={profile}
              alt="profile picture"
            ></img>
          </div>
          <div className="mt-2 ml-2">
            <h5 style={{ fontWeight: "700", fontSize: "1.5em" }}>
              {user ? user.firstname : ""} {user ? user.lastname : ""}
            </h5>
            <h6 style={{ marginTop: "-0.25em" }}>
              <em>{user ? user.city : ""}</em>
            </h6>
          </div>
        </div>

        <div className="index-box">
          <h1 className="index-title one">Messages</h1>
          <h6>
            <b>You have 1 new message</b>
          </h6>
          <p>
            Hello Lucas, can you work 6/6 between 8:00-13:00 in Bromma?{" "}
            <br></br> <em>Recieved: 10/5/2024</em>
          </p>
        </div>

        <hr style={{ width: "75%" }} className="hr"></hr>

        {projectsArray && projectsArray.length > 0 && (
          <div className="index-box">
            <h1 className="index-title two">Alerts</h1>
            <h6>
              <b>
                You have{" "}
                {projectsArray && projectsArray.length > 0
                  ? projectsArray.length
                  : 0}{" "}
                unsent job{projectsArray.length > 1 ? "s" : ""}
              </b>
            </h6>
            <ul>
              {projectsArray && projectsArray.length > 0 ? (
                projectsArray.map((project) => (
                  <div key={project.project_id}>
                    <li>{project.projectname}</li>
                  </div>
                ))
              ) : (
                <h6> </h6>
              )}
            </ul>
          </div>
        )}
      </div>

      <div className="index-box-right">
        {/* {currentVersion !== latestVersion.substring(1, 6) ? ( */}
        {latestVersion &&
        currentVersion &&
        semver.gt(latestVersion, currentVersion) ? (
          <div className="index-box">
            <h1 className="index-title three">News & updates</h1>
            <h6>
              <b>New updates for Fotografportalen</b>
            </h6>
            <p>
              Current Version: <b>{currentVersion}</b> - Latest Version:{" "}
              <b>{latestVersion.substring(1, 6)}</b>
            </p>
            <p style={{ marginTop: "-1em" }}>
              Get the latest updates from the button below
            </p>
            <p style={{ marginTop: "-1em" }}>
              Download version 'Fotografportalen v
              {latestVersion.substring(1, 6)}' here:
            </p>
            <button className="button normal" onClick={downloadLatestVersion}>
              Download v{latestVersion.substring(1, 6)}
            </button>
          </div>
        ) : (
          <>
            <div className="index-box">
              <h1 className="index-title three">News & updates</h1>
              <h6>
                <b>You're running the application on the latest version</b>
              </h6>
              <p>You're running the application on the latest version</p>
            </div>
          </>
        )}

        <hr style={{ width: "80%" }} className="hr"></hr>

        <div className="index-box">
          {allNews &&
            allNews.map((news) => (
              <div key={news.news_id} className="mb-4">
                <div className="d-flex">
                  <h6>
                    <b>{news.title}</b>
                  </h6>
                  {news.is_read === 1 ? (
                    <>
                      <h6 className="ml-3" style={{ color: "green" }}>
                        {" "}
                        <span style={{ fontSize: "0.8em" }}>
                          Marked as read
                        </span>{" "}
                        <FontAwesomeIcon icon={faCheck} />{" "}
                      </h6>
                    </>
                  ) : (
                    <></>
                  )}
                </div>
                <div className="mb-2" style={{ marginTop: "-0.5em" }}>
                  <em>Posted: {news && news.created_at.substring(0, 10)}</em>
                </div>
                <div
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(news.content),
                  }}
                ></div>

                {news.is_read === 0 ? (
                  <>
                    <button
                      className="mt-2 confirm-news-button"
                      onClick={() => confirmNews(news.news_id)}
                    >
                      Roger that!
                    </button>
                  </>
                ) : (
                  <></>
                )}
              </div>
            ))}
        </div>
      </div>

      <Sidemenu />
      <Sidemenu_small />
    </div>
  );
}
export default Index;
