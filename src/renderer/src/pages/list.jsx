import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import swalFire from "../assets/js/swalFire"
import { useTaskContext } from "../context/taskContext";
import { getTextColor } from '../assets/js/getTextColor'; 
import { useNavigate } from "react-router-dom";  

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {  } from "@fortawesome/free-regular-svg-icons";
import { faArrowRight, faPenToSquare, faPlus, faNoteSticky, faSquareCheck, faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";

import AddNewTask from "../components/addNewTask";
import TaskManager from "../components/taskManager";
import TaskProgress from "../components/taskProgress";
import TaskDetails from "../components/taskDetails";
import Notes from "../components/notes"



function List() {
    const { list_id } = useParams();
    const [taskId, setTaskId] = useState("")
    const [due_date, setDue_date] = useState("");
    const [list, setList] = useState(null);
    const [listName, setListName] = useState("");
    const [listColor, setListColor] = useState("");
    const [tasks, setTasks] = useState([]);
    const [showNewTask, setShowNewTask] = useState(false);
    const [detailsTask, setDetailsTask] = useState({});
    const [showDueTasks, setShowDueTasks] = useState(false);
    const [showNotes, setShowNotes] = useState(false);

    const [showTaskManager, setShowTaskManager] = useState(false);
    const [showTaskDetails, setShowTaskDetails] = useState(false);

    const navigate = useNavigate(); 
    const { triggerTaskUpdate } = useTaskContext();

    const onSuccessArchivedList = () => {navigate("/archive")}
    const onSuccessNewTask = () => {
        fetchAllTasks()
        triggerTaskUpdate(); 
    }
    const onSuccessDelete = () => {fetchAllTasks(); setShowTaskManager(false); triggerTaskUpdate() }


    // Clear taskmManager component on mount
    useEffect(() => {
        setShowTaskManager(false)
        setShowDueTasks(false)
        setShowTaskDetails(false)
    }, [list_id]);


    // Fetch list by list_id
    const fetchList = async () => {
        const user_id = localStorage.getItem("user_id");
        try {
            const listResponse = await window.api.getListById(list_id, user_id);
            console.log("listResponse", listResponse);
            if (listResponse.statusCode === 200) {
            setList(listResponse.list);
            setListColor(listResponse.list.color)
            setListName(listResponse.list.name)
            }
        } catch (error) {
            console.log("error", error);
        }
    };
    useEffect(() => {
        fetchList();
    }, [list_id, triggerTaskUpdate]);



    
    // Method to fetch all tasks by list_id
    const fetchAllTasks = async () => {
        const user_id = localStorage.getItem("user_id");
        try {
            const getTasksResponse = await window.api.getAllTasks(user_id, list_id);
            console.log('getTasksResponse', getTasksResponse);
            if (getTasksResponse.status === 200) {
                setTasks(getTasksResponse.tasks);
            }
        } catch (error) {
            console.log('error', error);
        }
    }
    useEffect(() => {
        fetchAllTasks();
    }, [list_id]);


    // Method to set list as archived
    const handleArchiveList = async (listId) => {
        console.log('Archive list with ID:', listId);
        const user_id = localStorage.getItem("user_id")
        const data = {
            user_id: user_id,
            list_id: listId,
        }
        console.log('data', data);
        try {
            const archiveResponse = await window.api.setListAsArchived(data)
            console.log('archiveResponse', archiveResponse);
            if (archiveResponse.status === 200) {
                triggerTaskUpdate()
                navigate("/archive")
            }
        } catch (error) {
            console.log('error', error);
        }
    };

        


    // Show new list input
    const handleShowAddTaskInput = () => {
        setTaskId("")
        setShowTaskManager(false);
        setShowTaskDetails(false)
        setShowNotes(false)
        setShowNewTask(!showNewTask);
    }
   
    // Open taskManger component
    const handleShowTaskManager = (task_id, due_date) => {
        setShowNewTask(false);
        setShowTaskDetails(false);
        setShowNotes(false)
        setDue_date(due_date)
        setTaskId(task_id)
        setShowTaskManager(true);
    }

     // Open taskManger component
     const handleShowTaskDetails = (task) => {
        console.log('task', task);
        setTaskId(task.task_id)
        setDetailsTask(task);
        setShowNewTask(false);
        setShowTaskManager(false);
        setShowNotes(false)
        setShowTaskDetails(true);        
    }
    // Show new list input
    const handleShowNotes = () => {
        setTaskId("")
        setShowTaskManager(false);
        setShowTaskDetails(false)
        setShowNewTask(false);
        setShowNotes(true)
    }


    const handleUpdateIsCompleted = async (check, task_id) => {
        console.log('check', check);
        console.log('task_id', task_id);
        const user_id = localStorage.getItem("user_id");

        const _check = check === true || check === 1 ? 0 : 1; 
        console.log('_check', _check);
        try {
            const checkResponse = await window.api.updateTaskCompletion(_check, task_id, user_id)
            console.log('checkResponse', checkResponse);
            fetchAllTasks()
        } catch (error) {
            console.log('error', error);
        }
    }


  return (
    <div className="page-wrapper">
        <div className="page-box">
            {list && (
                <div className="d-flex listinfo">
                    <h1 className="mr-4"> {list.name}</h1>
                    <div className="mr-4 list-color" style={{ backgroundColor: list.color, color: getTextColor(list.color)}}>{tasks.length}</div>
                    {/* <p>Created: {list.created}</p> */}
                    <TaskProgress tasks={tasks} listId={list_id} listName={listName} onSuccess={onSuccessArchivedList} />
                </div>
            )}
            <div className="d-flex">
                <FontAwesomeIcon title="Add new task" onClick={handleShowAddTaskInput} className="addtask-button2" icon={faPlus} size="xs" />
                <FontAwesomeIcon title="View notes" onClick={() => handleShowNotes(list_id)} className="mx-2 addtask-button2" icon={faNoteSticky} size="xs" />
                <FontAwesomeIcon title="Archive list" onClick={() => handleArchiveList(list_id)} className="addtask-button2" icon={faSquareCheck} size="xs" />
            </div>
            {/* TODAYS TASKS */}
            <div className="mt-5">
                <h5 style={{ fontSize: "1em" }}><b>Today</b></h5>
                {tasks.length > 0 ? (
                    tasks
                        .filter(task => {
                            const today = new Date().toISOString().split('T')[0];
                            return task.due_date === today;
                        })
                        .map(task => (
                            <div 
                                key={task.task_id} 
                                className={`d-flex justify-content-between task-box ${taskId === task.task_id && task.is_completed ? "task-box-active-done" : task.is_completed ? "task-box-done" : taskId === task.task_id ? "task-box-active" : ""}`} 
                                style={{ borderLeft: `8px solid ${listColor}` }} 
                                onClick={() => handleShowTaskDetails(task)}
                            >
                                <div className="d-flex">
                                    <input 
                                        type="checkbox" 
                                        id={`task-checkbox-${task.task_id}`} 
                                        className="checkbox" 
                                        defaultChecked={task.is_completed}
                                        onClick={(e) => e.stopPropagation()} 
                                        onChange={(e) => handleUpdateIsCompleted(task.is_completed, task.task_id)}
                                    />
                                    <h6>{task.title}</h6>
                                </div>
                                <div className="d-flex" >
                                    <h6 className="subtaskamount">{task.subtasks.length}</h6>
                                    {/* <FontAwesomeIcon className="arrowright-task-box mr-1" icon={faArrowRight} size="xs"/> */}
                                    <FontAwesomeIcon className="mb-1 edittask-icon" icon={faPenToSquare} size="xs" 
                                        onClick={(e) => { 
                                            e.stopPropagation();
                                            handleShowTaskManager(task.task_id, task.due_date); 
                                        }} 
                                    />
                                </div>
                            </div>
                        ))
                ) : (
                    // <h6 style={{ fontSize: "0.8em" }}><em>No tasks found</em></h6>
                    null
                )}
                <div>
                    <button onClick={handleShowAddTaskInput} className="addlist-button">{showNewTask ? "- Add New Task" : "+ Add New Task"}</button>
                </div>
            </div>
            {/* UPCOMIING TASKS */}
            <div className="mt-3">
                <h5 style={{ fontSize: "1em" }}><b>Upcoming</b></h5>
                {tasks.length > 0 ? (
                    tasks
                        .filter(task => {
                            const today = new Date().toISOString().split('T')[0];
                            return task.due_date > today || task.due_date === "";
                        })
                        .map(task => (
                            <div key={task.task_id} 
                                className={`d-flex justify-content-between task-box ${taskId === task.task_id && task.is_completed ? "task-box-active-done" : task.is_completed ? "task-box-done" : taskId === task.task_id ? "task-box-active" : ""}`} 
                                style={{ borderLeft: `8px solid ${listColor}` }}  
                                onClick={() => handleShowTaskDetails(task)}
                            >
                                <div className="d-flex">
                                    <input 
                                        type="checkbox" 
                                        id={`task-checkbox-${task.task_id}`} 
                                        className="checkbox" 
                                        defaultChecked={task.is_completed}
                                        onClick={(e) => e.stopPropagation()} 
                                        onChange={(e) => handleUpdateIsCompleted(task.is_completed, task.task_id)}
                                    />
                                    <h6>{task.title}</h6>
                                </div>
                                <div className="d-flex">
                                    <h6 className="subtaskamount">{task.subtasks.length}</h6>
                                    {/* <FontAwesomeIcon className="mr-1 mb-1" icon={faArrowRight} size="xs"/> */}
                                    <FontAwesomeIcon className="mb-1 edittask-icon" icon={faPenToSquare} size="xs" 
                                        onClick={(e) => { 
                                            e.stopPropagation(); 
                                            handleShowTaskManager(task.task_id, task.due_date); 
                                        }} 
                                    />
                                </div>
                            </div>
                        ))
                ) : (
                    // <h6 style={{ fontSize: "0.8em" }}><em>No tasks found</em></h6>
                    null
                )}
                <div>
                    <button onClick={handleShowAddTaskInput} className="addlist-button">{showNewTask ? "- Add New Task" : "+ Add New Task"}</button>
                </div>
            </div>
            {/* DUE TASKS */}
            <div className="mt-4">
                <div className="d-flex">
                    <h5 style={{ fontSize: "1em" }}><b>Due Tasks</b></h5>
                    <h6 className="ml-2 duetasksamount">{tasks.filter(task => task.due_date !== "" && task.due_date < new Date().toISOString().split('T')[0]).length}</h6>
                    <button className="showduetasks-button ml-2" onClick={() => setShowDueTasks(!showDueTasks)}>
                        <FontAwesomeIcon icon={showDueTasks ? faChevronUp : faChevronDown} size="xs"/>
                    </button>
                </div>

                {showDueTasks && (() => {
                    const today = new Date().toISOString().split('T')[0];
                    const dueTasks = tasks.filter(task => task.due_date !== "" && task.due_date < today);

                    return dueTasks.length > 0 ? (
                        dueTasks.map(task => (
                            <div key={task.task_id} 
                                className={`d-flex justify-content-between task-box ${taskId === task.task_id && task.is_completed ? "task-box-active-done" : task.is_completed ? "task-box-done" : taskId === task.task_id ? "task-box-active" : ""}`} 
                                style={{ borderLeft: `8px solid ${listColor}` }}  
                                onClick={() => handleShowTaskDetails(task)}
                            >
                                <div className="d-flex">
                                    <input 
                                        type="checkbox" 
                                        id={`task-checkbox-${task.task_id}`} 
                                        className="checkbox" 
                                        defaultChecked={task.is_completed}
                                        onClick={(e) => e.stopPropagation()} 
                                        onChange={(e) => handleUpdateIsCompleted(task.is_completed, task.task_id)}
                                    />
                                    <h6>{task.title}</h6>
                                </div>
                                <div className="d-flex">
                                    <h6 className="subtaskamount">{task.subtasks.length}</h6>
                                    <FontAwesomeIcon className="mb-1 edittask-icon" icon={faPenToSquare} size="xs" 
                                        onClick={(e) => { 
                                            e.stopPropagation(); 
                                            handleShowTaskManager(task.task_id, task.due_date); 
                                        }} 
                                    />
                                </div>
                            </div>
                        ))
                    ) : (
                        <h6 style={{ fontSize: "0.8em" }}><em>No tasks past due date</em></h6>
                    );
                })()}
            </div>

        </div>
    
        {showNewTask && < AddNewTask list_id={list_id} onSuccess={onSuccessNewTask}/>}
        {showTaskManager && < TaskManager show={showTaskManager} list_id={list_id} taskId={taskId} due_date={due_date} onSuccess={onSuccessNewTask} onSuccessDelete={onSuccessDelete}/>}
        {showTaskDetails && < TaskDetails show={showTaskDetails} detailsTask={detailsTask} listColor={listColor} listName={listName} onSuccess={onSuccessNewTask}/>}
        {showNotes && < Notes show={showNotes} list_id={list_id} tasks={tasks} listColor={listColor} listName={listName} />}

    </div>
  );
}

export default List;
