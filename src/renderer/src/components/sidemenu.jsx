import React, { useEffect, useState, useRef } from "react";
import { Link, NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";  
import { useTaskContext } from "../context/taskContext";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWifi, faCalendarCheck, faBorderAll, faEllipsisVertical, faSquareCheck, faPlus } from '@fortawesome/free-solid-svg-icons';
import { faCircleUp } from '@fortawesome/free-regular-svg-icons';
import ListMenu from "./listMenu";

import fp from "../assets/images/diaphragm.png";
import { width } from "@fortawesome/free-regular-svg-icons/faAddressBook";
import EditListModal from "../components/editListModal";

function Sidemenu() {
    //define states
    const { taskUpdateTrigger } = useTaskContext();
    const { triggerTaskUpdate } = useTaskContext();

    const [lists, setLists] = useState([]);
    const [posts, setPosts] = useState([]);
    const [internetAccess, setInternetAccess] = useState(true);
    const [showNewList, setShowNewList] = useState(false);
    const [newListName, setNewListName] = useState(false);
    const [selectedColor, setSelectedColor] = useState('#000000')
    const [archivedLists, setArchivedLists] = useState([]);

    const [showListMenu, setShowListMenu] = useState(false);
    const [selectedListId, setSelectedListId] = useState("")
    const [activeTab, setActiveTab] = useState("")

    const [tasksDueTodayCount, setTasksDueTodayCount] = useState(0); 
    const [tasksNotDueToday, setTasksNotDueToday] = useState(0);

    const [showEditList, setShowEditList] = useState(false);

    const navigate = useNavigate(); 

    const onSuccessListmenu = () => {fetchAllLists(); navigate("/archive"); fetchArchivedLists();}
    const openEditListModal = () => {setShowEditList(true)}
    const onCloseEditList = () => {setShowEditList(false)}
    const onSuccessEditList = () => {
        console.log('Onsuccess edit list');
        setShowEditList(false);
        triggerTaskUpdate();
    }
    
    

    // TaskTrigger
    useEffect(() => {
        console.log("Task update detected in SideMenu!");
        fetchAllLists()
        fetchPosts()
        fetchArchivedLists()
    }, [taskUpdateTrigger]); 

    // Checking internet connection
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

    // Method to fetch posts
    const fetchPosts = async () => {
        const user_id = localStorage.getItem("user_id");
        try {
            const getResponse = await window.api.getPosts(user_id);
            console.log('getResponse', getResponse);
            if (getResponse.statusCode === 200) {
                setPosts(getResponse.posts)
            }
        } catch (error) {
            console.log('error', error);       
        }
    }
    useEffect(() => {
      fetchPosts()
    }, []);

    // Method to fetch archived lists
    const fetchArchivedLists = async () => {
        const user_id = localStorage.getItem("user_id");
        try {
            const listsResponse = await window.api.getArchivedLists(user_id)
            console.log('listsResponse', listsResponse);
            if (listsResponse.status === 200){
                setArchivedLists(listsResponse.lists)
            }
        } catch (error) {
            console.log('error', error);
        }
    }
    useEffect(() => {
        fetchArchivedLists()
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


    // Get amount of tasks due today
    const getTasksDueToday = () => {
        const today = new Date().toISOString().split('T')[0]; 
        const tasks = lists.flatMap(t => t.tasks);
        const tasksDueToday = tasks.filter(task => task.due_date === today).length;
        console.log('tasksDueToday', tasksDueToday);
        const tasksNotDueToday = tasks.filter(task => task.due_date !== today).length
        return { tasksDueToday, tasksNotDueToday }; 
    }
    useEffect(() => {
        const { tasksDueToday, tasksNotDueToday } = getTasksDueToday(); 
        setTasksDueTodayCount(tasksDueToday); 
        setTasksNotDueToday(tasksNotDueToday);
    }, [lists]);



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
                    {/* TASKS */}
                    <h6>TASKS</h6>
                          
                            <div title="Today" className={`link-box ${activeTab === "today" ? "link-box-active" : "" }`}>
                                <NavLink onClick={() => setActiveTab("today")} to="/" exact="true" className="navlink">
                                    <div className="d-flex justify-content-between">
                                        <div className="d-flex">
                                            <FontAwesomeIcon className="link-box-icon" icon={faCalendarCheck} size="xs"/>
                                            <p>Today</p>
                                        </div>
                                        <p className="taskamount">{tasksDueTodayCount}</p>
                                    </div>
                                </NavLink>
                            </div>
                            <div title="Upcoming" className={`link-box ${activeTab === "upcoming" ? "link-box-active" : "" }`}>
                                <NavLink onClick={() => setActiveTab("upcoming")} to="/upcoming" exact="true" className="navlink">
                                    <div className="d-flex justify-content-between">
                                        <div className="d-flex">
                                            <FontAwesomeIcon className="link-box-icon" icon={faCircleUp} size="xs"/>
                                            <p>Upcoming</p>
                                        </div>
                                        <p className="taskamount">{tasksNotDueToday}</p>
                                    </div>
                                </NavLink>
                            </div>
                            <div title="Post it wall" className={`link-box ${activeTab === "postitwall" ? "link-box-active" : "" }`}>
                                <NavLink onClick={() => setActiveTab("postitwall")} to="/postitwall" exact="true" className="navlink">
                                <div className="d-flex justify-content-between">
                                    <div className="d-flex">
                                        <FontAwesomeIcon className="link-box-icon" icon={faBorderAll} size="xs"/>
                                        <p>Post it wall</p>
                                    </div>
                                    <p className="taskamount">{posts.length}</p>
                                </div>
                                </NavLink>
                            </div>
                            <hr></hr>
                </div>
                {/* LISTS */}
                <div className="sidemenu-menu">
                    <h6>LISTS</h6>
                        {lists.length > 0 ? (
                            lists.map(list => (
                                <div key={list.list_id} className={`link-box ${activeTab === list.list_id ? "link-box-active" : ""}`}>
                                    <NavLink onClick={() => setActiveTab(list.list_id)} to={`/list/${list.list_id}`} exact="true" className="navlink">
                                        <div className="d-flex justify-content-between">
                                            <div className="d-flex link-box-left">
                                                <div className="mr-2 liscolor" style={{ backgroundColor: list.color }}></div>
                                                <p title={list.name}>{list.name.length > 20 ? list.name.substring(0,20) + ".." : list.name}</p>
                                            </div>   
                                            <div className="d-flex">
                                                <p className="taskamount">{list.tasks.length}</p>
                                                <FontAwesomeIcon 
                                                    className="list-minimenu" 
                                                    onClick={(event) => {
                                                        event.stopPropagation(); 
                                                        event.preventDefault(); 
                                                        handleListClick(list.list_id);
                                                    }}  
                                                    icon={faEllipsisVertical} size="xs"
                                                />
                                            </div>
                                        </div>
                                    </NavLink>
                                    {showListMenu && selectedListId === list.list_id && (
                                            <ListMenu listId={list.list_id} setShowListMenu={setShowListMenu} onSuccess={onSuccessListmenu} openEditListModal={openEditListModal} />
                                    )}
                                </div>
                            ))
                        ) : (
                            <p style={{ fontSize: "0.7em" }}><em>No created lists</em></p>
                        )}
                        {/* ADD NEW LIST */}
                        <div>
                            <button onClick={handleShowAddListInput} className="addlist-button">{showNewList ? "- Hide New List" : "+ Add New List"}</button>
                            {showNewList && (
                                <div className="mt-1 d-flex">
                                    <input 
                                        type="color" 
                                        // id="color-picker"
                                        className="color-picker"
                                        style={{ width: "1.15em", height: "1.2em", borderRadius: "30px", border: "none",  outline: "none", backgroundColor: selectedColor }}
                                        value={selectedColor}
                                        onChange={handleColorChange}
                                    />
                                    <input onChange={(e) => handleListName(e.target.value)} className="mb-1 mx-1 newlist-input" placeholder="List name.."></input>
                                    <button onClick={createNewList} className="createlist-button"><FontAwesomeIcon title="Create new list" icon={faPlus} size="xs"/></button>
                                </div>
                            )}
                        </div>
                        <hr></hr>
                        {/* ARCHIVED */}
                        <div title="Archived" className={`mt-3 link-box ${activeTab === "archived" ? "link-box-active" : "" }`}>
                                <NavLink onClick={() => setActiveTab("archived")} to="/archive" exact="true" className="navlink">
                                    <div className="d-flex justify-content-between">
                                        <div className="d-flex">
                                            <FontAwesomeIcon className="link-box-icon" icon={faSquareCheck} size="xs"/>
                                            <p>Archive</p>
                                        </div>
                                        <p className="taskamount">{archivedLists.length}</p>
                                    </div>
                                </NavLink>
                        </div>
                </div>
                

            </div>

            {showEditList && <EditListModal showEditList={showEditList} selectedListId={selectedListId} onCloseEditList={onCloseEditList} onSuccess={onSuccessEditList} />}

        </div>
    );
}

export default Sidemenu;
