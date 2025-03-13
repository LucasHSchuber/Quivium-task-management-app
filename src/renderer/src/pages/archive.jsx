import React, { useEffect, useState } from "react";

import { useTaskContext } from "../context/taskContext";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {  } from "@fortawesome/free-regular-svg-icons";
import { faArrowRight, faPenToSquare, faRotateLeft, faTableCellsLarge } from "@fortawesome/free-solid-svg-icons";


function Archive() {
    //define states
    const [archivedLists, setArchivedLists] = useState([]);

    const { triggerTaskUpdate } = useTaskContext();


    // Method to fetch archived lists
    const fetchArchivedLists = async () => {
        const user_id = localStorage.getItem("user_id");
        try {
            const listsResponse = await window.api.getArchivedLists(user_id)
            console.log('listsResponse', listsResponse);
            if (listsResponse.status === 200){
                setArchivedLists(listsResponse.lists)
            }
        } catch (error) {
            console.log('error', error);
        }
    }
    useEffect(() => {
        fetchArchivedLists()
    }, [triggerTaskUpdate]);
    

    // Method to move back to lists from archive
    const moveBackToLists = async (list_id) => {
        console.log('list_id', list_id);
        const user_id = localStorage.getItem("user_id");
        try {
            const response = await window.api.moveBackToLists(user_id, list_id);
            console.log('response', response);
            if (response.status === 200){
                fetchArchivedLists()
                triggerTaskUpdate();  // Trigger to update sidemenu component
            }
        } catch (error) {
            console.log('error', error);
        }
    }

    return (
        <div className="page-wrapper">
            <div className="page-box">
                <h1>Archive</h1>
                <div className="mt-5">
                    {archivedLists.length > 0 ? (
                        archivedLists.map(list => (
                        <div 
                            key={list.list_id} 
                            className={`d-flex justify-content-between task-box`} 
                        >
                            <div className="d-flex">
                                <div className="mr-2" style={{ borderRadius: "30px", backgroundColor: list.color, width: "12px", height: "12px", marginTop: "0.1em" }}></div>
                                <h6 className="mr-4">{list.name}</h6>
                            </div>
                            <div className="d-flex">
                                <h6 className="mr-3 archived-date"><em>Archived: {list.archived_date.substring(0,16)}</em></h6>
                                <FontAwesomeIcon onClick={() => moveBackToLists(list.list_id)} title="Move back to lists" className="mb-1 movefromarchived-icon" icon={faRotateLeft} size="xs" />
                            </div>
                        </div>
                        ))
                    ) : (
                        <h6>No archived lists</h6>
                    )}
                </div>
            </div>
        </div>
    );
}
export default Archive;
