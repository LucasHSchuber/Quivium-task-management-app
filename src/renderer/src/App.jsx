
import { HashRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

//importing pages and components
//Home
import Index from "./pages/index";

import SideMenu from "./components/sidemenu"; 
import Login_window from "./pages/login_window";
import UpdateApplication_window from "./pages/updateApplication_window";
import Register_window from "./pages/register_window";

import Today from "./pages/today";
import Upcoming from "./pages/upcoming";
import List from "./pages/list"
import PostItWall from "./pages/postItWall";
import Archive from "./pages/archive";

//importing css styles
import "./App.css";
import './assets/css/global.css';
import './assets/css/main.css';
import './assets/css/components.css';
import './assets/css/buttons.css';
import './assets/css/sidemenu.css';




function App() {
  return (
    <HashRouter>
      <MainContent />
    </HashRouter>
  );
}

function MainContent() {
  const location = useLocation(); 
  const hiddenPaths = ["/updateapplication_window", "/login_window", "/register_window"];

  return (
    <>

      {!hiddenPaths.includes(location.pathname) && <SideMenu />}

      <div className="main-content">
        <div className="content">
            <div className="">
              <Routes><Route path="/" element={<Today />} /> </Routes>
            </div>
            <div className="">
              <Routes><Route path="/upcoming" element={<Upcoming />} /></Routes>
            </div>
            <div className="">
              <Routes><Route path="/postitwall" element={<PostItWall />} /></Routes>
            </div>
            <div className="">
              <Routes><Route path="/list/:list_id" element={<List />} /></Routes>
            </div>
            <div className="">
              <Routes><Route path="/archive" element={<Archive />} /></Routes>
            </div>
        </div>
      </div>

      <div>
        <Routes><Route path="/updateapplication_window" element={<UpdateApplication_window />} /></Routes>
      </div>
      <div>
        <Routes><Route path="/login_window" element={<Login_window />} /></Routes>
      </div>
      <div>
        <Routes><Route path="/register_window" element={<Register_window />} /></Routes>
      </div>

    </ >
  );
}

export default App;
