import React, { useState, useEffect } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {  } from "@fortawesome/free-regular-svg-icons";
import { faMinus, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { } from "@fortawesome/free-regular-svg-icons/faAddressBook";
import { useNavigate } from "react-router-dom";  


function Notes({ show, list_id, tasks, listColor, listName }) {
    // define states
    const [newNoteTitle, setNewNoteTitle] = useState("");
    const [activeTaskId, setActiveTaskId] = useState("");
    const [activeListId, setActiveListId] = useState("");
    const [data, setData] = useState([]);

    const navigate = useNavigate()    


    
    // Method to fetch all tasks by list_id
    const fetchAllTaskNotes = async () => {
        const user_id = localStorage.getItem("user_id");
        try {
            const getNoteResponse = await window.api.getAllTaskNotes(user_id, list_id);
            console.log('getNoteResponse', getNoteResponse);
            if (getNoteResponse.status === 200) {
                setData(getNoteResponse.data);
            }
        } catch (error) {
            console.log('error', error);
        }
    }
    useEffect(() => {
        fetchAllTaskNotes();
    }, [list_id]);



    // Handle list name input
    const handleNewNoteTitle = (title) => {
        console.log('title', title);
        setNewNoteTitle(title)
    }
    
    const handleShowNoteTitleInput = (task_id) => {
        console.log('task_id', task_id);
        setActiveListId("")
        // setShowNoteTitleInput(!setShowNoteTitleInput)
        if (activeTaskId === task_id) {
            setActiveTaskId("")
        } else {
            setActiveTaskId(task_id)
        }
    }
    const handleShowNoteTitleInputList = () => {
      setActiveTaskId("");
      if (activeListId === list_id) {
            setActiveListId("")
        } else {
            setActiveListId(list_id)
        }
    };

        
    // Create new note title
    const handleCreateNewNoteTitle = async (task_id, list_id) => {
        if (!newNoteTitle.trim()) {
            console.error("Note title cannot be empty.");
            return;
        }
        const user_id = localStorage.getItem("user_id");
        const data = {
            user_id: user_id,
            task_id: task_id ?? null,
            list_id: list_id ?? null,
            title: newNoteTitle
        }
        try {
            const createResponse = await window.api.createNewNoteTitle(data)
            console.log('createResponse', createResponse);
            if (createResponse.status === 201) {
                setTimeout(() => {
                    fetchAllTaskNotes()
                    setNewNoteTitle("")
                }, 200);
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
            note,
            listName
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
                <div className="mb-4 d-flex justify-content-between">
                    <h5 style={{ fontWeight: "900", fontSize: "1.1em" }}>Notes</h5>
                    {/* <FontAwesomeIcon onClick={() => handleShowNoteTitleInputList()} style={{ marginTop: "0.1em" }} title="Add new list note" className="mr-1 addnote-button" icon={activeListId === list_id ? faMinus : faPlus} size="xs" /> */}
                </div>

                <hr></hr>
                <h6 style={{ marginTop: "-1em", fontSize: "0.75em" }}><em>List notes</em></h6>

                <div className="mt-3 d-flex justify-content-between">
                    <div className="d-flex">
                        <div className="mr-2 listcolor" style={{ backgroundColor: listColor }}></div>
                        <h6 title={listName}><b>{listName && listName.length > 35 ? listName.substring(0,35) + ".." : listName}</b></h6>
                    </div>   
                    <FontAwesomeIcon onClick={() => handleShowNoteTitleInputList()} style={{ marginTop: "0.1em" }} title="Add new list note" className="mr-1 addnote-button" icon={activeListId === list_id ? faMinus : faPlus} size="xs" />
                </div>
                <div className="mb-4">
                    {data &&
                        data.tasks && data.listNotes.map(note => (
                            <div key={note.note_id} className="d-flex justify-content-between">
                                <div className={`d-flex notetitles-box`} onClick={() => handleOpenNote(note.note_id, note)}>
                                    <h6 className="mr-1" style={{ color: listColor }}><FontAwesomeIcon icon={faMinus} size="xs" /></h6>
                                    <h6>{note.title}</h6>
                                </div>    
                                <FontAwesomeIcon onClick={() => deleteNoteTitle(note.note_id)} title="Delete note" className="mr-5 deletenote-button" icon={faTrash} size="xs"/>
                            </div>
                    ))}
                    {activeListId === list_id && (
                        <div className="d-flex newnotetitle">
                            <h6 className="mt-1" style={{ color: listColor }}><FontAwesomeIcon icon={faMinus} size="xs" /></h6>
                            <input value={newNoteTitle} onChange={(e) => handleNewNoteTitle(e.target.value)} className="mb-1 mx-1 newnotetitle-input" placeholder="Note title"></input>
                            <button title="Create new note" onClick={() => handleCreateNewNoteTitle(null, list_id)} className="createnotetitle-button"><FontAwesomeIcon title="Create new note" icon={faPlus} size="xs"/></button>
                        </div>
                    )}
                </div>

                <hr></hr>
                <h6 style={{ marginTop: "-1em", fontSize: "0.75em" }}><em>Task notes</em></h6>

                <div className="mt-4 pb-4">
                    {data ? (
                        data.tasks && data.tasks.map((task, index) => (
                            <div key={task.task_id} className="mb-4 notetask-box">
                                <div className="d-flex justify-content-between">
                                    <div style={{ borderLeft: `3.5px solid ${listColor}`, borderRadius: "3px" }}>
                                        <h6 className={`pl-2 notetitle ${task.is_completed === 1 ? "notetitle-completed" : ""}`}><b>{task.title}</b></h6>
                                    </div>
                                    <FontAwesomeIcon onClick={() => handleShowNoteTitleInput(task.task_id)} title="Add new task note" className="mr-1 addnote-button" icon={activeTaskId === task.task_id ? faMinus : faPlus} size="xs" />
                                </div>
                                {task.notes.length > 0 && task.notes
                                .filter(note => note.task_id !== null)
                                .map(note => (
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
                                        <input value={newNoteTitle} onChange={(e) => handleNewNoteTitle(e.target.value)} className="mb-1 mx-1 newnotetitle-input" placeholder="Note title"></input>
                                        <button title="Create new note" onClick={() => handleCreateNewNoteTitle(task.task_id, null)} className="createnotetitle-button"><FontAwesomeIcon title="Create new note" icon={faPlus} size="xs"/></button>
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
