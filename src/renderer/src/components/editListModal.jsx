import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';

const EditListModal = ({ showEditList, selectedListId, onCloseEditList, onSuccess }) => {
    const [newListName, setNewListName] = useState(null);
    const [listColor, setListColor] = useState('');
    // const [selectedColor, setSelectedColor] = useState('');
    const [listName, setListName] = useState('');



    
    // Fetch list by list_id
    const fetchList = async () => {
        const user_id = localStorage.getItem("user_id");
        try {
            const listResponse = await window.api.getListById(selectedListId, user_id);
            console.log("listResponse", listResponse);
            if (listResponse.statusCode === 200) {
            setListColor(listResponse.list.color)
            setListName(listResponse.list.name)
            }
        } catch (error) {
            console.log("error", error);
        }
    };
    useEffect(() => {
        fetchList();
    }, [selectedListId]);




    // Handle list name input
    const handleListName = (listName) => {
        console.log('listName', listName);
        setListName(listName);
    };

    // Handle color change
    const handleColorChange = (event) => {
        setListColor(event.target.value);
    };

    // Save changes and close the modal
    const handleSaveList = async () => {
        const user_id = localStorage.getItem("user_id");
        const data = {
            user_id: user_id,
            list_id: selectedListId,
            name: listName,
            color: listColor
        }
        try {
            const updateListResponse = await window.api.updateList(data);
            console.log('updateListResponse', updateListResponse);
            if (updateListResponse.status === 200){
                console.log('List updated successfully');
                onSuccess()
            }
        } catch (error) {
            console.log('error', error);
        }
    };




    return (
        <Modal
            style={{ top: '12em', width: '20em', margin: 'auto' }}
            show={showEditList}
            onHide={onCloseEditList}
        >
            <Modal.Header style={{ height: "3em" }}>
                <h6>Edit List</h6>
            </Modal.Header>
            <Modal.Body style={{ padding: '1.6em 1em 1.5em 3em' }}>
                <div className="d-flex">
                    <input
                        type="color"
                        className="color-picker"
                        style={{
                            width: '1.3em',
                            height: '1.3em',
                            borderRadius: '30px',
                            border: 'none',
                            outline: 'none',
                            backgroundColor: listColor,
                        }}
                        value={listColor}
                        onChange={handleColorChange}
                    />
                    <input
                        defaultValue={listName}
                        onChange={(e) => handleListName(e.target.value)}
                        className="mx-1 editlistname-input"
                        placeholder="List name.."
                    />
                </div>
            </Modal.Body>
            <div className="mb-3 d-flex justify-content-center" style={{ padding: '0 1em 1em 1em' }}>
                <button className="closemodal-button mr-1" onClick={onCloseEditList}>
                    Close
                </button>
                <button className="savemodal-button" onClick={handleSaveList}>
                    Save Changes
                </button>
            </div>
        </Modal>
    );
};

export default EditListModal;
