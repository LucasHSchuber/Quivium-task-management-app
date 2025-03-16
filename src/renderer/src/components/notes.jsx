import React, { useState, useEffect } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {  } from "@fortawesome/free-regular-svg-icons";
import { faMinus, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { } from "@fortawesome/free-regular-svg-icons/faAddressBook";
import { useNavigate } from "react-router-dom";  


function Notes({ show, list_id, tasks, listColor }) {
    // define states
    const [newNoteTitle, setNewNoteTitle] = useState("");
    const [activeTaskId, setActiveTaskId] = useState("");
    const [taskNotes, setTaskNotes] = useState([]);

    const navigate = useNavigate()    


    
    // Method to fetch all tasks by list_id
    const fetchAllTaskNotes = async () => {
        const user_id = localStorage.getItem("user_id");
        try {
            const getNoteResponse = await window.api.getAllTaskNotes(user_id, list_id);
            console.log('getNoteResponse', getNoteResponse);
            if (getNoteResponse.status === 200) {
                setTaskNotes(getNoteResponse.taskNotes);
            }
        } catch (error) {
            console.log('error', error);
        }
    }
    useEffect(() => {
        fetchAllTaskNotes();
    }, [list_id]);



    // Handle list name input
    const handleNewNoteTitle = (title, task_id) => {
        console.log('task_id', task_id);
        console.log('title', title);
        setNewNoteTitle(title)
    }
    
    const handleShowNoteTitleInput = (task_id) => {
        console.log('task_id', task_id);
        // setShowNoteTitleInput(!setShowNoteTitleInput)
        if (activeTaskId === task_id) {
            setActiveTaskId("")
        } else {
            setActiveTaskId(task_id)
        }
    }

        
    // Create new note title
    const handleCreateNewNoteTitle = async (task_id) => {
        const user_id = localStorage.getItem("user_id");
        const data = {
            user_id: user_id,
            task_id: task_id,
            list_id: list_id,
            title: newNoteTitle
        }
        try {
            const createResponse = await window.api.createNewNoteTitle(data)
            console.log('createResponse', createResponse);
            if (createResponse.status === 201) {
                setTimeout(() => {
                    fetchAllTaskNotes()
                    setNewNoteTitle("")
                }, 250);
            }
        } catch (error) {
            console.log('error', error);
        }
    }




        
    const handleOpenNote = (note_id, note) => {
        console.log('note_id', note_id);
        fetchAllTaskNotes()
        navigate(`/note/${note_id}`, {
            state: {
            list_id,
            tasks,
            listColor,
            note
            },
        });
    };



    // Method to delete note
    const deleteNoteTitle = async (note_id) => {
        const user_id = localStorage.getItem("user_id")
        try {
            const deleteResponse = await window.api.deleteNote(note_id, user_id);
            console.log('deleteResponse', deleteResponse);
            if (deleteResponse.status === 200) {
                fetchAllTaskNotes()
            }
        } catch (error) {
            console.log('error', error);
        }
    }

    


    return (
        <div className="notes">

            <div className="notes-box">
                <h5 className="mb-5" style={{ fontWeight: "900", fontSize: "1.1em" }}>Notes</h5>
                <div className="pb-4">
                    {taskNotes ? (
                        taskNotes.tasks && taskNotes.tasks.map((task, index) => (
                            <div key={task.task_id} className="mb-4 notetask-box">
                                <div className="d-flex justify-content-between">
                                    <div style={{ borderLeft: `3.5px solid ${listColor}`, borderRadius: "3px" }}>
                                        <h6 className={`pl-2 notetitle ${task.is_completed === 1 ? "notetitle-completed" : ""}`}><b>{task.title}</b></h6>
                                    </div>
                                    <FontAwesomeIcon onClick={() => handleShowNoteTitleInput(task.task_id)} title="Add new task" className="mr-1 addnote-button" icon={activeTaskId === task.task_id ? faMinus : faPlus} size="xs" />
                                </div>
                                {task.notes.length > 0 && task.notes.map(note => (
                                    <div key={note.note_id} className="d-flex justify-content-between">
                                        <div className={`d-flex notetitles-box`} onClick={() => handleOpenNote(note.note_id, note)}>
                                            <h6 className="mr-1" style={{ color: listColor }}><FontAwesomeIcon icon={faMinus} size="xs" /></h6>
                                            <h6 className={`${task.is_completed === 1 ? "notetitle-completed" : ""}`}>{note.title}</h6>
                                        </div>    
                                        <FontAwesomeIcon onClick={() => deleteNoteTitle(note.note_id)} title="Delete note" className="mr-5 deletenote-button" icon={faTrash} size="xs"/>
                                    </div>
                                ))}
                                {activeTaskId === task.task_id ? (
                                    <div className="d-flex newnotetitle">
                                        <h6 className="mt-1" style={{ color: listColor }}><FontAwesomeIcon icon={faMinus} size="xs" /></h6>
                                        <input value={newNoteTitle} onChange={(e) => handleNewNoteTitle(e.target.value, task.task_id)} className="mb-1 mx-1 newnotetitle-input" placeholder="Note title"></input>
                                        <button onClick={() => handleCreateNewNoteTitle(task.task_id)} className="createnotetitle-button"><FontAwesomeIcon title="Create new note" icon={faPlus} size="xs"/></button>
                                    </div>
                                ) : null}
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
