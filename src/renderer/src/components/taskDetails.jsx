import React, { useState, useEffect } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {  } from "@fortawesome/free-regular-svg-icons";
import { faTrash, faEdit, faTimes, faPlus } from "@fortawesome/free-solid-svg-icons";


function TaskDetails({ show, detailsTask, onSuccess }) {
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
            }
        } catch (error) {
            console.log('error', error);
        }
    }





    return (
        <div className="taskdetails">
            <h5 className="mb-5" style={{ fontWeight: "900", fontSize: "1.1em" }}>Task Details</h5>

            <div>
                <div className="mb-3">
                    <h6><b>{taskWithSubtasks.task_title}</b></h6>    
                    <p>{taskWithSubtasks.task_description}</p>
                    <h6><b>Due Date:</b> {taskWithSubtasks.task_due_date || "No due date"}</h6>
                </div>
                <hr></hr>
                <div className="mb-3">
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
                    <div className="d-flex">
                        <input className="form-input-field" placeholder="Add new subtask" value={newSubtask} onChange={(e) => setNewSubtask(e.target.value)}></input>
                        <button className="createsubtask-button" onClick={createSubtask}><FontAwesomeIcon title="Create subtask" icon={faPlus} size="xs"/></button>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default TaskDetails;
