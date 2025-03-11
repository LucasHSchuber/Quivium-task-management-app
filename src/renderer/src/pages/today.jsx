import React, { useEffect, useState } from "react";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
const MySwal = withReactContent(Swal);
import TaskManager from "../components/taskManager";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {  } from "@fortawesome/free-regular-svg-icons";
import { faArrowRight, faPenToSquare } from "@fortawesome/free-solid-svg-icons";

import env from "../assets/js/env";



function Today() {
  //define states
  const [tasksDueToday, setTasksDueToday] = useState([]);
  const [showNewTask, setShowNewTask] = useState(false);

  const [taskId, setList_id] = useState("");
  const [list_id, setTaskId] = useState("");
  const [due_date, setDue_date] = useState("");
  const [showTaskManager, setShowTaskManager] = useState(false);
  
  const onSuccessNewTask = () => {fetchTaskDueToday()}


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
  }, []);


  
  // Show new list input
  const handleShowAddTaskInput = () => {
    setShowTaskManager(false);
    setShowNewTask(!showNewTask);
  }

  const handleShowTaskManager = (task_id, list_id, due_date) => {
      console.log('task_id', task_id);
      console.log('list_id', list_id);
      console.log('due_date', due_date);
      setShowNewTask(false);
      setList_id(task_id);
      setTaskId(list_id)
      setDue_date(due_date)
      setShowTaskManager(true);
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



  return (
    <div className="page-wrapper">
      <div className="page-box">

        <h1>Today</h1>
        <div className="mt-5">
                <h5 style={{ fontSize: "1em" }}><b>Today</b></h5>
                {tasksDueToday.length > 0 ? (
                    tasksDueToday
                        .map(task => (
                            <div 
                              key={task.task_id} 
                              className={`d-flex justify-content-between task-box ${task.task_is_completed ? "task-box-done" : ""}`} 
                              style={{ borderLeft: `8px solid ${task.list_color}` }} 
                            >
                                <div className="d-flex">
                                    <input 
                                        type="checkbox" 
                                        id={`task-checkbox-${task.task_id}`} 
                                        className="checkbox" 
                                        defaultChecked={task.task_is_completed}
                                        onChange={() => handleUpdateIsCompleted(task.task_is_completed, task.task_id)}
                                    />
                                    <h6>{task.task_title}</h6>
                                </div>
                                <div style={{ float: "right"}}>
                                    <FontAwesomeIcon className="mr-1 mb-1" icon={faArrowRight} size="xs"/>
                                    <FontAwesomeIcon className="mr-1 ml-2 mb-1" icon={faPenToSquare} size="xs" onClick={() => handleShowTaskManager(task.task_id, task.task_list_id, task.task_due_date)}/>
                                </div>
                            </div>
                        ))
                ) : (
                    <h6 style={{ fontSize: "0.9em" }}><em>You have no tasks that is due today</em></h6>
                )}
                <div>
                    <button onClick={handleShowAddTaskInput} className="addlist-button">{showNewTask ? "- Add New Task" : "+ Add New Task"}</button>
                </div>
            </div>

      </div>


      {showTaskManager && < TaskManager show={showTaskManager} list_id={list_id} taskId={taskId} due_date={due_date} onSuccess={onSuccessNewTask}/>}

    </div>
  );
}
export default Today;
