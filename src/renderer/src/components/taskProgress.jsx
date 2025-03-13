import React, { useState, useEffect } from 'react';
import swalFire from "../assets/js/swalFire"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTaskContext } from "../context/taskContext";
import {  } from "@fortawesome/free-regular-svg-icons";
import { faCheck } from "@fortawesome/free-solid-svg-icons";


function TaskProgress({ tasks, listId, listName, onSuccess }) {
    // Calculate completed tasks
    const completedTasks = tasks.filter(task => task.is_completed === 1).length;
    const totalTasks = tasks.length;
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const { triggerTaskUpdate } = useTaskContext();

    // Show alert
    useEffect(() => {
      if (totalTasks === completedTasks && totalTasks > 0) {
        const alertKey = `alert_shown_${listName}`;
        const lastTaskCountKey = `last_task_count_${listName}`;
        const lastTaskCount = parseInt(localStorage.getItem(lastTaskCountKey) || "0", 10);
    
        if (!localStorage.getItem(alertKey) || totalTasks > lastTaskCount) {
          swalFire({
            header: "Good Job!",
            message: `You have completed all tasks for '${listName}'. Would you like to move the list to archive?`,
            type: "success",
            showCancel: true,
            confirmText: "Yes, move to archive!",
            cancelText: "Cancel",
            confirmCallback: () => {handleConfirmSwalFire()},
            cancelCallback: () => console.log("User canceled!"),
          });
          localStorage.setItem(alertKey, "true");
        }
        localStorage.setItem(lastTaskCountKey, totalTasks.toString());
      }
    }, [tasks]); 


    // Method to set list as archived
    const handleConfirmSwalFire = async () => {
        console.log("User confirmed!")
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
                onSuccess()
            }
        } catch (error) {
            console.log('error', error);
        }
    }
    
    
    return (
        <div className='mt-3 d-flex'>
            <div className="progress-bar-container">
                <div
                    className="progress-bar"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
            <p style={{ fontSize: "0.8em", marginTop: "-0.5em", marginLeft: "1em", fontWeight: "900" }}>
                {completedTasks === totalTasks && totalTasks > 0 ? (
                    <>
                    {completedTasks}/{totalTasks} <FontAwesomeIcon className="ml-1" icon={faCheck} size="sm" />
                    </>
                ) : (
                    `${completedTasks}/${totalTasks}`
                )}
            </p>
        </div>
    );
}

export default TaskProgress;
