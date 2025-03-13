import React, { useState, useEffect } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {  } from "@fortawesome/free-regular-svg-icons";
import { faTrash, faEdit, faTimes, faPlus } from "@fortawesome/free-solid-svg-icons";


function TaskDetails({ show, detailsTask, listColor, listName, onSuccess }) {
    // define states
    const [taskWithSubtasks, setTaskWithSubtasks] = useState({});
    const [newSubtask, setNewSubtask] = useState("");
    console.log('detailsTask', detailsTask);
    console.log('detailsTask.id', detailsTask.task_id);
    useEffect(() => {
      console.log('newSubtask', newSubtask);
    }, [newSubtask]);



    // Method to get tasks with subtasks
    const fetchTaskWithSubtasks = async (taskId) => {
        try {
            const subtasksResponse = await window.api.getTaskWithSubtasks(detailsTask.task_id);
            console.log('Tasks with subtasks:', subtasksResponse);
            if (subtasksResponse.status === 200) {
                setTaskWithSubtasks(subtasksResponse.data)
            }
        } catch (error) {
            console.error('Error', error);
        }
    };
    useEffect(() => {
        fetchTaskWithSubtasks()
    }, [detailsTask]);



    // Method to create new subtask
    const createSubtask = async () => {
        console.log('id', taskWithSubtasks.task_id);
        console.log('newSubtask', newSubtask);
        const data = {
            task_id: taskWithSubtasks.task_id,
            title: newSubtask
        }
        console.log('data', data);
        try {
            const createResponse = await window.api.createNewSubtask(data)
            console.log('createResponse', createResponse);
            if (createResponse.status === 201) {
                console.log('Successfully created news subtask');
                setNewSubtask("")
                fetchTaskWithSubtasks()
                onSuccess()
            }
        } catch (error) {
            console.log('error', error);
        }
    }



    return (
        <div className="taskdetails">
            <div className="taskdetails-box">
                <h5 className="mb-5" style={{ fontWeight: "900", fontSize: "1.1em" }}>Task Details</h5>
                <div className="pb-4">
                    <div className="d-flex justify-content-between">
                        <div className="d-flex link-box-left">
                            <div className="mr-2 liscolor" style={{ backgroundColor: listColor }}></div>
                            <p title={listName}><b>{listName.length > 20 ? listName.substring(0,20) + ".." : listName}</b></p>
                        </div>   
                    </div>
                    <h6><b>Task title:</b> {taskWithSubtasks.task_title}</h6>    
                    <h6 className="my-3"><b>Description:</b> {taskWithSubtasks.task_description}</h6>
                    <h6><b>Due Date:</b> {taskWithSubtasks.task_due_date || <em>No due date</em>}</h6>
                </div>
                {/* <hr style={{ marginBottom: "0" }}></hr> */}
            </div>   
            <div className="mb-3 subtask-box">
                <h6><b>Sub Tasks:</b></h6>
                {taskWithSubtasks.subtasks && taskWithSubtasks.subtasks.length > 0 ? (
                <ul className="subtask-list">
                    {taskWithSubtasks.subtasks.map(st => (
                        <li key={st.subtask_id}>{st.subtask_title}</li>
                    ))}
                </ul>
                ) : (
                    <p><em>No subtasks</em></p>
                )}
                <input className="form-input-field" placeholder="Add new subtask" value={newSubtask} onChange={(e) => setNewSubtask(e.target.value)}></input>
                <button className="createsubtask-button" onClick={createSubtask}><FontAwesomeIcon title="Create subtask" icon={faPlus} size="xs"/></button>
            </div>
           
        </div>
    );
}

export default TaskDetails;
