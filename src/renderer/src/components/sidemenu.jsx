import React, { useEffect, useState, useRef } from "react";
import { Link, NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";  

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWifi, faCalendarCheck, faBorderAll, faEllipsisVertical, faSquareCheck } from '@fortawesome/free-solid-svg-icons';
import { faCircleUp } from '@fortawesome/free-regular-svg-icons';
import ListMenu from "./listMenu";

import fp from "../assets/images/diaphragm.png";
import { width } from "@fortawesome/free-regular-svg-icons/faAddressBook";

function Sidemenu() {
    //define states
    const [lists, setLists] = useState([]);
    const [internetAccess, setInternetAccess] = useState(true);
    const [showNewList, setShowNewList] = useState(false);
    const [newListName, setNewListName] = useState(false);
    const [selectedColor, setSelectedColor] = useState('#000000')

    const [showListMenu, setShowListMenu] = useState(false);
    const [selectedListId, setSelectedListId] = useState(null)

    const navigate = useNavigate(); 
    const onSuccessListmenu = () => {
        fetchAllLists()
        navigate("/");
    }


    useEffect(() => {
        const checkInternetConnection = () => {
            if (navigator.onLine) {
                console.log("Internet access");
                setInternetAccess(true);
            } else {
                console.log("No internet access");
                setInternetAccess(false);
            }
        };
        checkInternetConnection();
        const intervalId = setInterval(checkInternetConnection, 15000); // run every 20 sec to make sure internet connection is still available
        return () => clearInterval(intervalId);
    }, [])


    
    // Method to fetch all lists
    const fetchAllLists = async () => {
        const user_id = localStorage.getItem("user_id");
        try {
            const getListsResponse = await window.api.getAllLists(user_id);
            console.log('getListsResponse', getListsResponse.lists);
            if (getListsResponse.status === 200) {
                setLists(getListsResponse.lists);
            }
        } catch (error) {
            console.log('error', error);
        }
    }
    useEffect(() => {
        fetchAllLists();
    }, []);



    // Show new list input
    const handleShowAddListInput = () => {
        setShowNewList(!showNewList);
        setSelectedColor("#000000")
    }
    // Handle color change
    const handleColorChange = (event) => {
        console.log('event.target.value', event.target.value);
        setSelectedColor(event.target.value);
    };
    // Handle list name input
    const handleListName = (listName) => {
        console.log('listName', listName);
        setNewListName(listName)
    }


    // Method to create new list
    const createNewList = async () => {
        const user_id = localStorage.getItem("user_id")
        console.log('user_id', user_id);
        console.log('newListName', newListName);
        console.log('selectedColor', selectedColor);
        const data = {
            user_id: user_id,
            newListName: newListName,
            selectedColor: selectedColor
        }
        try {
            const newListResponse = await window.api.createNewList(data);
            console.log('newListResponse', newListResponse);
            if (newListResponse.status === 201) {
                console.log("List created successfully!");
                setNewListName("");
                setSelectedColor("");
                setShowNewList(false);
                setTimeout(() => {
                    fetchAllLists();
                }, 300);            
            }
        } catch (error) {
            console.log('error', error);
        }
    }

    const handleListClick = (list_id) => {
        setSelectedListId(list_id);
        setShowListMenu((prev) => !prev);
    };


    return (
        <div className="sidemenu">
            {/* Alert user if no internet connection */}
            {!internetAccess && (
                <div className="nointernet-box d-flex justify-content-center">
                    <FontAwesomeIcon className="mr-1" icon={faWifi} size="xs"/>
                    <h6 style={{ fontSize: "0.7em" }}>No connection</h6>
                </div>
            )}
            
            {/* Content */}
            <div className="sidemenu-box">
                <h6>Menu</h6>
                <div className="mt-5 mb-4 sidemenu-menu">
                    <h6>TASKS</h6>
                          
                            <div title="" className="link-box">
                                <NavLink to="/" exact="true">
                                    <div className="d-flex">
                                        <FontAwesomeIcon className="link-box-icon" icon={faCalendarCheck} size="xs"/>
                                        <p>Today</p>
                                    </div>
                                </NavLink>
                            </div>
                            <div title="" className="link-box">
                                <NavLink to="/upcoming" exact="true">
                                    <div className="d-flex">
                                        <FontAwesomeIcon className="link-box-icon" icon={faCircleUp} size="xs"/>
                                        <p>Upcoming</p>
                                    </div>
                                </NavLink>
                            </div>
                            <div title="" className="link-box">
                                <NavLink to="/postitwall" exact="true">
                                <div className="d-flex">
                                        <FontAwesomeIcon className="link-box-icon" icon={faBorderAll} size="xs"/>
                                        <p>Post it wall</p>
                                    </div>
                                </NavLink>
                            </div>
                            <hr></hr>
                </div>

                <div className="sidemenu-menu">
                    <h6>LISTS</h6>
                            {lists.length > 0 ? (
                                lists.map(list => (
                                    <div key={list.list_id} className="link-box">
                                        <NavLink  to={`/list/${list.list_id}`} exact="true" >
                                            <div key={list.list_id} className="d-flex justify-content-between">
                                                <div className="d-flex">
                                                    <div className="mr-2 liscolor" style={{ backgroundColor: list.color }}></div>
                                                    <p>{list.name}</p>
                                                </div>   
                                                <FontAwesomeIcon 
                                                    style={{ color: "black", padding: "0.1em 0.2em 0.1em 0.2em", width: "1em" }} 
                                                    onClick={(event) => {
                                                        event.stopPropagation(); 
                                                        event.preventDefault(); 
                                                        handleListClick(list.list_id);
                                                    }}  className="mt-1" icon={faEllipsisVertical} size="xs"/>
                                            </div>
                                           
                                        </NavLink>
                                        {showListMenu && selectedListId === list.list_id && (
                                                <ListMenu listId={list.list_id} setShowListMenu={setShowListMenu} onSuccess={onSuccessListmenu} />
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p style={{ fontSize: "0.7em" }}><em>No created lists</em></p>
                            )}
                        <div>
                            <button onClick={handleShowAddListInput} className="addlist-button">{showNewList ? "- Add New List" : "+ Add New List"}</button>
                            {showNewList && (
                                <div className="mt-1 d-flex">
                                    <input 
                                        type="color" 
                                        id="color-picker"
                                        style={{ width: "1.3em", height: "1.3em", borderRadius: "30px", border: "none",  outline: "none", marginTop: "-0.05em", backgroundColor: selectedColor }}
                                        value={selectedColor}
                                        onChange={handleColorChange}
                                    />
                                    <input onChange={(e) => handleListName(e.target.value)} className="mb-1 newlist-input" placeholder="List name.."></input>
                                    <button onClick={createNewList} className="createlist-button">+</button>
                                </div>
                            )}
                        </div>
                        <hr></hr>
                        <div title="" className="mt-3 link-box">
                                <NavLink to="/archive" exact="true">
                                <div className="d-flex">
                                        <FontAwesomeIcon className="link-box-icon" icon={faSquareCheck} size="xs"/>
                                        <p>Archive</p>
                                    </div>
                                </NavLink>
                        </div>
                </div>
                

            </div>

        </div>
    );
}

export default Sidemenu;
