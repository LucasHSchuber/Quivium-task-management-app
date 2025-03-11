import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import AddNewTask from "../components/addNewTask";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {  } from "@fortawesome/free-regular-svg-icons";
import { faArrowRight, faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import TaskManager from "../components/taskManager";
import TaskProgress from "../components/taskProgress";
import TaskDetails from "../components/taskDetails";


// import Sidemenu from "../components/sidemenu";

function List() {
    const { list_id } = useParams();
    const [taskId, setTaskId] = useState("")
    const [due_date, setDue_date] = useState("");
    const [list, setList] = useState(null);
    const [listColor, setListColor] = useState("");
    const [tasks, setTasks] = useState([]);
    const [newTaskName, setNewTaskName] = useState(false);
    const [showNewTask, setShowNewTask] = useState(false);
    const [detailsTask, setDetailsTask] = useState({});

    const [showTaskManager, setShowTaskManager] = useState(false);
    const [showTaskDetails, setShowTaskDetails] = useState(false);

    console.log('list_id', list_id);

    const onSuccessNewTask = () => {fetchAllTasks()}
    const onSuccessDelete = () => {fetchAllTasks(), setShowTaskManager(false)}


    // Clear taskmManager component on mount
    useEffect(() => {
        setShowTaskManager(false);
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
            }
        } catch (error) {
            console.log("error", error);
        }
    };
    useEffect(() => {
        fetchList();
    }, [list_id]);



    
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



    // Show new list input
    const handleShowAddTaskInput = () => {
        setShowTaskManager(false);
        setShowTaskDetails(false)
        setShowNewTask(!showNewTask);
    }
   
    // Open taskManger component
    const handleShowTaskManager = (task_id, due_date) => {
        setShowNewTask(false);
        setShowTaskDetails(false);
        setDue_date(due_date)
        setTaskId(task_id)
        setShowTaskManager(true);
    }

     // Open taskManger component
     const handleShowTaskDetails = (task) => {
        console.log('task', task);
        setDetailsTask(task);
        setShowNewTask(false);
        setShowTaskManager(false);
        setShowTaskDetails(true);        
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
                <div className="d-flex">
                    <h1 className="mr-4"> {list.name}</h1>
                    <div className="mr-4 list-color" style={{ backgroundColor: list.color}}>{tasks.length}</div>
                    {/* <p>Created: {list.created}</p> */}
                    <TaskProgress tasks={tasks} />

                </div>
            )}

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
                                className={`d-flex justify-content-between task-box ${task.is_completed ? "task-box-done" : ""}`} 
                                style={{ borderLeft: `8px solid ${listColor}` }} 
                                onClick={() => handleShowTaskDetails(task)}
                            >
                                <div className="d-flex">
                                    <input 
                                        type="checkbox" 
                                        id={`task-checkbox-${task.task_id}`} 
                                        className="checkbox" 
                                        defaultChecked={task.is_completed}
                                        onChange={() => handleUpdateIsCompleted(task.is_completed, task.task_id)}
                                    />
                                    <h6>{task.title}</h6>
                                </div>
                                <div style={{ float: "right"}}>
                                    <FontAwesomeIcon className="mr-1 mb-1" icon={faArrowRight} size="xs"/>
                                    <FontAwesomeIcon className="mr-1 ml-2 mb-1" icon={faPenToSquare} size="xs" 
                                    onClick={(e) => { 
                                        e.stopPropagation();
                                        handleShowTaskManager(task.task_id, task.due_date); 
                                    }} 
                                    />
                                </div>
                            </div>
                        ))
                ) : (
                    <h6 style={{ fontSize: "0.9em" }}><em>No tasks found</em></h6>
                )}
                <div>
                    <button onClick={handleShowAddTaskInput} className="addlist-button">{showNewTask ? "- Add New Task" : "+ Add New Task"}</button>
                </div>
            </div>

            <div className="mt-3">
                <h5 style={{ fontSize: "1em" }}><b>This week</b></h5>
                {tasks.length > 0 ? (
                    tasks
                        .filter(task => {
                            const today = new Date().toISOString().split('T')[0];
                            return task.due_date !== today;
                        })
                        .map(task => (
                            <div key={task.task_id} 
                                className={`d-flex justify-content-between task-box ${task.is_completed ? "task-box-done" : ""}`} 
                                style={{ borderLeft: `8px solid ${listColor}` }}  
                                onClick={() => handleShowTaskDetails(task)}
                            >
                                <div className="d-flex">
                                    <input 
                                        type="checkbox" 
                                        id={`task-checkbox-${task.task_id}`} 
                                        className="checkbox" 
                                        defaultChecked={task.is_completed}
                                        onChange={() => handleUpdateIsCompleted(task.is_completed, task.task_id)}
                                    />
                                    <h6>{task.title}</h6>
                                </div>
                                <div style={{ float: "right"}}>
                                    <FontAwesomeIcon className="mr-1 mb-1" icon={faArrowRight} size="xs"/>
                                    <FontAwesomeIcon className="mr-1 ml-2 mb-1" icon={faPenToSquare} size="xs" 
                                    onClick={(e) => { 
                                        e.stopPropagation(); 
                                        handleShowTaskManager(task.task_id, task.due_date); 
                                    }} 
                                    />
                                </div>
                            </div>
                        ))
                ) : (
                    <h6 style={{ fontSize: "0.9em" }}><em>No tasks found</em></h6>
                )}
                <div>
                    <button onClick={handleShowAddTaskInput} className="addlist-button">{showNewTask ? "- Add New Task" : "+ Add New Task"}</button>
                </div>
            </div>
        </div>
    
        {showNewTask && < AddNewTask list_id={list_id} onSuccess={onSuccessNewTask}/>}
        {showTaskManager && < TaskManager show={showTaskManager} list_id={list_id} taskId={taskId} due_date={due_date} onSuccess={onSuccessNewTask} onSuccessDelete={onSuccessDelete}/>}
        {showTaskDetails && < TaskDetails show={showTaskDetails} detailsTask={detailsTask} onSuccess={onSuccessNewTask}/>}
    </div>
  );
}

export default List;
