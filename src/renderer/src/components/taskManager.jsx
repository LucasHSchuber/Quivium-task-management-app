import React, { useState, useEffect } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {  } from "@fortawesome/free-regular-svg-icons";
import { faTrash, faEdit, faTimes } from "@fortawesome/free-solid-svg-icons";


function TaskManager({ show, list_id, taskId, due_date, onSuccess, onSuccessDelete }) {
    // define states
    const [isEditing, setIsEditing] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newDescription, setNewDescription] = useState("");
    const [task, setTask] = useState({});
    const [newDueDate, setNewDueDate] = useState("");
    const [selectedList, setSelectedList] = useState("");
    const [lists, setLists] = useState([]);

    
    
    // Set selected list on mount in select
    useEffect(() => {
        if (list_id && lists.length > 0) {
          setSelectedList(list_id);
        }
      }, [list_id, lists]);


    // fetch task by task id
    const fetchTaskByTaskId = async () => {
        console.log('TASKID used to fetch task', taskId);
        const user_id = localStorage.getItem("user_id")
        try {
            const listResponse = await window.api.getTaskByTaskId(taskId, user_id)
            console.log('listResponse', listResponse);
            if (listResponse.statusCode === 200) {
                setTask(listResponse.task)
                setNewTitle(listResponse.task.title)
                setNewDescription(listResponse.task.description)
                setNewDueDate(listResponse.task.due_date)
            }
        } catch (error) {
            console.log('error', error);
        }
    }
    useEffect(() => {
        fetchTaskByTaskId();
    }, [taskId]);



    // fetch all lists
    const fetchAllLists = async () => {
        const user_id = localStorage.getItem("user_id");
        try {
            const getListsResponse = await window.api.getAllLists(user_id); 
            console.log('getListsResponse', getListsResponse);
            if (getListsResponse.status === 200){
                setLists(getListsResponse.lists);
            }
        } catch (error) {
            console.log('error', error);
        }
    }
    useEffect(() => {
        fetchAllLists()
    }, [list_id]);



    // cancel
    const handleCancel = () => {
        setIsEditing(false);
    };

    
    // Method to save task
    const handleSave = async (e) => {  
        e.preventDefault();
        if (isEditing && !newTitle){console.log('Title is required'); return}
        const user_id = localStorage.getItem("user_id")
        const data = {
            user_id: user_id,
            list_id: selectedList,
            task_id: taskId,
            title: newTitle,
            description: newDescription,
            due_date: newDueDate,
        }
        console.log('data', data);
        try {
            const updateResponse = await window.api.updateTask(data)
            console.log('updateResponse', updateResponse);
            if (updateResponse.status === 200) {
                console.log('Successfully update task');
                setIsEditing(false)
                fetchTaskByTaskId()
                onSuccess()
            }
        } catch (error) {
            console.log('error', error);
        }
    };


    const deleteTask = async () => {
        console.log('taskId', taskId);
        const task_id = taskId;
        const user_id = localStorage.getItem("user_id")
        console.log('task_id', task_id);
        try {
            const deleteResponse = await window.api.deleteTask(task_id, user_id);
            console.log('deleteResponse', deleteResponse);
            if (deleteResponse.status === 200) {
                onSuccessDelete()
            }
        } catch (error) {
            console.log('error', error);
        }
    }



  return (
    <div className={`taskmanager`}>
        <h5 className="mb-5" style={{ fontWeight: "900", fontSize: "1.1em" }}>Edit Task</h5>
        <div className="mb-4">
            <div className="d-flex">
                {isEditing ? (
                        <input
                            type="text"
                            className="mb-2 form-input-field"
                            placeholder="New title"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                        />
                    ) : (
                        <h6><b>{task.title}</b></h6>
                    )}
                <button title="Edit task" className="ml-3 deletetask-button" onClick={() => setIsEditing(!isEditing)}><FontAwesomeIcon title="Edit task" icon={faEdit} size="xs"/></button>
                <button title="Delete task" className="deletetask-button" onClick={deleteTask}><FontAwesomeIcon title="Delete task" icon={faTrash} size="xs"/></button>
            </div>
            {isEditing ? (
                    <textarea
                        className="textarea"
                        placeholder="New description"
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                    />
                ) : (
                    <p>{task.description}</p>
                )}
         </div>

         <hr></hr>

        <form onSubmit={handleSave}>
            {isEditing ? (
                <div>
                    <div className="form-group">
                        <label>Due Date:</label>
                        <input
                            className="form-select"
                            type="date"
                            value={newDueDate}
                            onChange={(e) => setNewDueDate(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Choose List:</label>
                        <select
                            className="form-select"
                            value={selectedList}
                            onChange={(e) => setSelectedList(e.target.value)}
                        >
                            {lists.map((list) => (
                                <option key={list.list_id} value={list.list_id}>
                                    {list.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <>
                        <div>
                            <button onClick={handleCancel} className="mt-3 canceltask-button">Cancel</button>
                        </div>
                        <div>
                            <button type="submit" onClick={(e) => handleSave()} className="mt-2 savetask-button">Save</button>
                        </div>
                    </>
                </div>
            ) : (
                <div>
                    <p><b>Due Date:</b> {task.due_date || "No due date"}</p>
                    <p><b>List:</b> {lists.find(l => l.list_id === task.list_id)?.name || "No list selected"}</p>
                </div>
            )}
        </form>

    </div>
  );
}

export default TaskManager;
