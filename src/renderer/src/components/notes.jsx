import React, { useState, useEffect } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {  } from "@fortawesome/free-regular-svg-icons";
import { faMinus } from "@fortawesome/free-solid-svg-icons";


function Notes({ show, list_id, tasks }) {
    // define states
    const [taskWithSubtasks, setTaskWithSubtasks] = useState({});
    console.log('list_id', list_id);
    console.log('tasks', tasks);
    // const [newSubtask, setNewSubtask] = useState("");



    // Method to get tasks with subtasks
    // const fetchTaskWithSubtasks = async (taskId) => {
    //     try {
    //         const subtasksResponse = await window.api.getTaskWithSubtasks(detailsTask.task_id);
    //         console.log('Tasks with subtasks:', subtasksResponse);
    //         if (subtasksResponse.status === 200) {
    //             setTaskWithSubtasks(subtasksResponse.data)
    //         }
    //     } catch (error) {
    //         console.error('Error', error);
    //     }
    // };
    // useEffect(() => {
    //     fetchTaskWithSubtasks()
    // }, [detailsTask]);



    // // Method to create new subtask
    // const createSubtask = async () => {
    //     console.log('id', taskWithSubtasks.task_id);
    //     console.log('newSubtask', newSubtask);
    //     const data = {
    //         task_id: taskWithSubtasks.task_id,
    //         title: newSubtask
    //     }
    //     console.log('data', data);
    //     try {
    //         const createResponse = await window.api.createNewSubtask(data)
    //         console.log('createResponse', createResponse);
    //         if (createResponse.status === 201) {
    //             console.log('Successfully created news subtask');
    //             setNewSubtask("")
    //             fetchTaskWithSubtasks()
    //             onSuccess()
    //         }
    //     } catch (error) {
    //         console.log('error', error);
    //     }
    // }



    return (
        <div className="taskdetails">

            <div className="taskdetails-box">
                <h5 className="mb-5" style={{ fontWeight: "900", fontSize: "1.1em" }}>Notes</h5>
                <div className="pb-4">
                    {tasks && tasks.length > 0 ? (
                        tasks.map((task, index) => (
                            <div className="mb-4">
                                <div className="d-flex">
                                    <h6><b>{task.title}</b></h6>
                                    <button className="ml-2 addlist-button">+</button>
                                </div>
                                <h6>-</h6>
                                {/* <FontAwesomeIcon icon={faMinus} size="xs" /> */}
                                <div> 
                                    {/* <button className="ml-3 addlist-button">+ Add New Note</button> */}
                                </div>
                            </div>
                        ))
                    ) : (
                        <h6><em>No tasks to add notes to</em></h6>
                    )}
                </div>
            </div>   
        </div>
    );
}

export default Notes;
