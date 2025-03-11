import React, { useState, useEffect } from "react";

function AddNewTask({ list_id, onSuccess }) {
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
//   const [subtaskName, setSubtaskName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [selectedList, setSelectedList] = useState("");
  const [subtasks, setSubtasks] = useState([]);

  const [lists, setLists] = useState([]);

  console.log('list_id', list_id);

  useEffect(() => {
    if (list_id && lists.length > 0) {
      setSelectedList(list_id);
    }
  }, [list_id, lists]);

//   const handleAddSubtask = () => {
//     if (subtaskName.trim()) {
//       setSubtasks([...subtasks, subtaskName]);
//       setSubtaskName(""); // Reset the input field for the next subtask
//     }
//   };

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




  const handleSubmit = async (e) => {
    e.preventDefault();
    const user_id = localStorage.getItem("user_id")
    console.log('user_id', user_id);
    const data = {
        user_id: user_id,
        title: taskTitle,
        description: taskDescription,
        due_date: dueDate,
        list_id: list_id,
    }
    console.log('data', data);
    try {
        const newTaskResponse = await window.api.createNewTask(data);
        console.log('newTaskResponse', newTaskResponse);
        if (newTaskResponse.status === 201) {
            console.log("Task created successfully!");
            setTaskTitle("");
            setTaskDescription("");
            setDueDate("");
            setSubtasks([]);
            onSuccess()
        }
    } catch (error) {
        console.log('error', error);
    }
  };





  return (
    <div className="addnewtask">
      <h6 className="mb-5" style={{ fontWeight: "900", fontSize: "1.1em" }}>New Task</h6>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Task Title:</label>
          <input
            className="form-input-field"
            type="text"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            placeholder="Task title"
            required
          />
        </div>

        <div className="form-group">
          <label>Description:</label>
          <textarea
            className="textarea"
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            placeholder="Task description"
          />
        </div>

        {/* <div className="form-group">
          <label>Subtask:</label>
          <input
            className="form-input-field"
            type="text"
            value={subtaskName}
            onChange={(e) => setSubtaskName(e.target.value)}
            placeholder="Subtask name"
          />
        </div> */}

        <div className="form-group">
          <label>Due Date:</label>
          <input
            className="form-select"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Choose List:</label>
          <select
            className="form-select"
            value={selectedList}
            onChange={(e) => setSelectedList(e.target.value)}
          >
            {/* <option value="">Select a list</option> */}
            {lists.map((list) => (
              <option key={list.list_id} value={list.list_id}>
                {list.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <button type="submit" className="mt-4 savetask-button">Save Task</button>
        </div>
      </form>
    </div>
  );
}

export default AddNewTask;
