import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Modal, Button } from 'react-bootstrap';
import { faSquareCheck, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

import { useTaskContext } from "../context/taskContext";

const ListMenu = ({ listId, setShowListMenu, onSuccess, openEditListModal }) => {
    // define states

    const menuRef = useRef(null);
    console.log('listId', listId);

    const { triggerTaskUpdate } = useTaskContext();

     
    // hide listMenu when clicking  outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowListMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [setShowListMenu]);


    
    //Arhive list
    const handleArchiveList = async (listId) => {
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
                onSuccess()
                triggerTaskUpdate();
            }
        } catch (error) {
            console.log('error', error);
        }
    };
    


    // Delete list
    const handleDeleteList = async (listId) => {
        console.log('Deleting list with ID:', listId);
        const user_id = localStorage.getItem("user_id")
        try {
            const deleteList = await window.api.deleteList(listId, user_id);
            console.log('deleteList', deleteList);
            if (deleteList.status === 200){
                onSuccess()
            }
        } catch (error) {
            console.log('error', error);
        }
    };
      


    //Edit list and show editList component
    const handleEditList = (listId) => {
        console.log('Editing list with ID:', listId);
        openEditListModal()
    };



      


    return (
        <div ref={menuRef} className="list-menu" onClick={(e) => e.stopPropagation()}>
            <ul>
                <li onClick={(e) => { e.stopPropagation(); handleEditList(listId); }}><FontAwesomeIcon className="link-box-icon" icon={faEdit} size="sm"/> Edit List</li>
                <li onClick={(e) => { e.stopPropagation(); handleArchiveList(listId); }}><FontAwesomeIcon className="link-box-icon" icon={faSquareCheck} size="sm"/> Archive</li>
                <li style={{ color: "red" }} onClick={(e) => { e.stopPropagation(); handleDeleteList(listId); }}><FontAwesomeIcon className="link-box-icon" icon={faTrash} size="sm"/> Delete List</li>
            </ul>
        </div>
    );
  };

  export default ListMenu