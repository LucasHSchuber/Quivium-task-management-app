import React, { useEffect, useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {  } from "@fortawesome/free-regular-svg-icons";
import { faArrowRight, faPenToSquare } from "@fortawesome/free-solid-svg-icons";


function Archive() {
    //define states
    const [archivedLists, setArchivedLists] = useState([]);

    // Method to fetch all data due today from db
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
    }, []);
    

    return (
        <div className="page-wrapper">
            <div className="page-box">
                <h1>Archive</h1>
                <div className="mt-5">
                    {archivedLists.length > 0 ? (
                        archivedLists.map(list => (
                        <div 
                            key={list.list_id} 
                            className={`d-flex justify-content-between task-box `} 
                        >
                            <div className="d-flex">
                                <div className="mr-2" style={{ borderRadius: "30px", backgroundColor: list.color, width: "12px", height: "12px", marginTop: "0.2em" }}></div>
                                <h6>{list.name}</h6>
                            </div>
                            <div>

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
