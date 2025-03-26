import React, { useEffect, useState } from "react";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useTaskContext } from "../context/taskContext";
const MySwal = withReactContent(Swal);
import TaskManager from "../components/taskManager";
import AddNewTask from "../components/addNewTask";
import TaskDetails from "../components/taskDetails";
// import Notes from "../components/notes"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {  } from "@fortawesome/free-regular-svg-icons";
import { faArrowRight, faPenToSquare, faCalendarCheck,faNoteSticky, faPlus, faEye,faEyeSlash } from "@fortawesome/free-solid-svg-icons";

import env from "../assets/js/env";



function Today() {
  //define states
  const [tasksDueToday, setTasksDueToday] = useState([]);
  const [showNewTask, setShowNewTask] = useState(false);

  const [taskId, setList_id] = useState("");
  const [list_id, setTaskId] = useState("");
  const [due_date, setDue_date] = useState("");
  const [listColor, setListColor] = useState("");
  const [listName, setListName] = useState("");
  const [showTaskManager, setShowTaskManager] = useState(false);

  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [detailsTask, setDetailsTask] = useState({});

  const [hideCompletedTasks, setHideCompletedTasks] = useState(true);
  const [showNotes, setShowNotes] = useState(false);
  
  const onSuccessNewTask = () => {fetchTaskDueToday()}
  const onSuccessDelete = () => {fetchTaskDueToday(); setShowTaskManager(false); triggerTaskUpdate() }

  const { taskUpdateTrigger } = useTaskContext();
  const { triggerTaskUpdate } = useTaskContext();


  // Method to fetch all data due today from db
  const fetchTaskDueToday = async () => {
    const user_id = localStorage.getItem("user_id");
    try {
      const tasksResponse = await window.api.getTasksDueToday(user_id)
      console.log('tasksResponse', tasksResponse);
      if (tasksResponse.status === 200){
        setTasksDueToday(tasksResponse.tasks)
      }
    } catch (error) {
      console.log('error', error);
    }
  }
  useEffect(() => {
    fetchTaskDueToday()
  }, [taskUpdateTrigger]);


  
  // Show new list input
  const handleShowAddTaskInput = () => {
    setShowTaskManager(false);
    setShowNewTask(!showNewTask);
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
        if (checkResponse.status === 200) {
          fetchTaskDueToday()
        }
    } catch (error) {
        console.log('error', error);
    }
  }


  const handleShowTaskDetails = (task) => {
      console.log('task', task);
      setTaskId(task.task_id)
      setDetailsTask(task);
      setListColor(task.list_color)
      setListName(task.list_color)
      setShowNewTask(false);
      setShowTaskManager(false);
      setShowTaskDetails(true);        
  }

  const handleShowTaskManager = (task_id, list_id, due_date) => {
      console.log('task_id', task_id);
      console.log('list_id', list_id);
      console.log('due_date', due_date);
      setShowNewTask(false);
      setShowTaskDetails(false);   
      setList_id(task_id);
      setTaskId(list_id)
      setDue_date(due_date)
      setShowTaskManager(true);
  }

  // Open notes component
  const handleShowNotes = () => {
      setTaskId("")
      setShowTaskManager(false);
      setShowTaskDetails(false)
      setShowNewTask(false);
      setShowNotes(!showNotes)
  }




  return (
    <div className="page-wrapper">
      <div className="page-box">
        <div className="d-flex listinfo">
            <FontAwesomeIcon className="mr-3 header-icon" icon={faCalendarCheck} />
            <h1>Today</h1>
        </div>
        <div className="mt-2">
              <FontAwesomeIcon title="Add new task" onClick={handleShowAddTaskInput} className={`addtask-button2 ${showNewTask ? "addtask-button2-active" : ""}`} icon={faPlus} size="xs" />
              <FontAwesomeIcon title={`${hideCompletedTasks ? "Show completed tasks" : "Hide completed tasks"}`} onClick={() => setHideCompletedTasks(!hideCompletedTasks)} className={`mx-2 addtask-button2 ${hideCompletedTasks ? "addtask-button2-active" : ""}`} icon={hideCompletedTasks ? faEyeSlash : faEye} size="xs" />
              {/* <FontAwesomeIcon title="View notes" onClick={() => handleShowNotes(list_id)} className={`addtask-button2 ${showNotes ? "addtask-button2-active" : ""}`} icon={faNoteSticky} size="xs" />  */}
        </div>
        <div className="mt-5">
                <h5 className="mb-3" style={{ fontSize: "1em" }}><b>Tasks:</b></h5>
                {tasksDueToday.length > 0 ? (
                    tasksDueToday
                    .filter(task => {
                      const today = new Date().toISOString().split('T')[0];
                      return hideCompletedTasks ? task.task_is_completed === 0 : true;
                    })
                    .map(task => (
                      <div 
                          key={task.task_id} 
                          className={`d-flex justify-content-between task-box ${taskId === task.task_id && task.task_is_completed ? "task-box-active-done" : task.task_is_completed ? "task-box-done" : taskId === task.task_id ? "task-box-active" : ""}`} 
                          style={{ borderLeft: `8px solid ${task.list_color}` }} 
                          onClick={() => handleShowTaskDetails(task)}
                      >
                          <div className="d-flex">
                              <input 
                                  type="checkbox" 
                                  id={`task-checkbox-${task.task_id}`} 
                                  className="checkbox" 
                                  defaultChecked={task.task_is_completed}
                                  onClick={(e) => e.stopPropagation()} 
                                  onChange={(e) => handleUpdateIsCompleted(task.task_is_completed, task.task_id)}
                              />
                              <h6>{task.task_title}</h6>
                          </div>
                          <div className="d-flex" >
                              <h6 className="subtaskamount">{task.subtasks.length}</h6>
                              {/* <FontAwesomeIcon className="arrowright-task-box mr-1" icon={faArrowRight} size="xs"/> */}
                              <FontAwesomeIcon className="mb-1 edittask-icon" icon={faPenToSquare} size="xs" 
                                  onClick={(e) => { 
                                      e.stopPropagation();
                                      handleShowTaskManager(task.task_id, task.list_id, task.task_due_date); 
                                  }} 
                              />
                          </div>
                      </div>
                    ))
                ) : (
                    <h6 style={{ fontSize: "0.8em" }}><em>You have no tasks due today</em></h6>
                )}
                <div>
                    <button onClick={handleShowAddTaskInput} className="addlist-button">{showNewTask ? "- Add New Task" : "+ Add New Task"}</button>
                </div>
            </div>

      </div>

      {showNewTask && < AddNewTask list_id={list_id} onSuccess={onSuccessNewTask}/>}
      {showTaskManager && < TaskManager show={showTaskManager} list_id={list_id} taskId={taskId} due_date={due_date} onSuccess={onSuccessNewTask} onSuccessDelete={onSuccessDelete}/>}
      {showTaskDetails && < TaskDetails show={showTaskDetails} detailsTask={detailsTask} listColor={listColor} listName={listName} onSuccess={onSuccessNewTask}/>}
      {/* {showNotes && < Notes show={showNotes} list_id={list_id} tasks={tasks} listColor={listColor} listName={listName} />} */}

    </div>
  );
}
export default Today;
