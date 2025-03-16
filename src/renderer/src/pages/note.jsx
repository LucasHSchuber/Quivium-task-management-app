import { useParams, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import swalFire from "../assets/js/swalFire"
import { useTaskContext } from "../context/taskContext";
import { getTextColor } from '../assets/js/getTextColor'; 
import { useNavigate } from "react-router-dom";  
import convertToLocalTime from "../assets/js/convertToLocalTime";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { } from "@fortawesome/free-regular-svg-icons";
import { faMinus, faSpinner, faLeftLong } from "@fortawesome/free-solid-svg-icons";
import Notes from "../components/notes";




function Note() {
    //define states
    const [showNotes, setShowNotes] = useState(true);
    const [noteText, setNoteText] = useState("");
    const [updatedText, setUpdatedText] = useState("");
    const [lastSaved, setLastSaved] = useState("");
    const [hasRecentlyBeenSaved, setHasRecentlyBeenSaved] = useState(false);

    const { note_id } = useParams(); 
    const location = useLocation();
    const navigate = useNavigate();
    const timeoutRef = useRef(null)
    const { list_id, tasks, listColor, note } = location.state || {};
    console.log('text', note.text);
    console.log('tasks', tasks);
    console.log('note_id', note_id);

    useEffect(() => {
      if (note && note.text !== undefined) { 
          console.log("Updating setNoteText");
          setLastSaved("")
          setNoteText(note.text);
      }
    }, [note_id, note]);
  

    
    // navigate back
    const navigateback = () => {
      navigate(`/list/${list_id}`)
    }
    

    const handleUpdateText = (value) => {
      console.log('value', value);
      setNoteText(value)
      handleSaveText(value) // trigger handleSaveText 
    }
    

    // Save text
    const handleSaveText = async (text) => {
      const user_id = localStorage.getItem("user_id");
      const data = {
          user_id: user_id,
          note_id: note_id,
          text: text
      }
      console.log('data', data);
      try {
          const updateResponse = await window.api.updateNoteText(data)
          console.log('updateResponse', updateResponse);
          if (updateResponse.status === 200) {
            setLastSaved(updateResponse.note.updated)
            getCurrentTimestamp(getCurrentTimestamp(updateResponse.note.updated))
          }
      } catch (error) {
          console.log('error', error);
      }
    }



    const getCurrentTimestamp = (saved = null) => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
    
      const currentTimestamp = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      let isRecent = false;
      
      if (saved) {
        const savedTime = new Date(saved);
        const timeDifference = (now - savedTime) / 1000;
        isRecent = timeDifference;
      }
      console.log('currentTimestamp', currentTimestamp);
      console.log('isRecent', isRecent);
      if (isRecent) {
        setHasRecentlyBeenSaved(true);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
    
        timeoutRef.current = setTimeout(() => {
          setHasRecentlyBeenSaved(false);
          timeoutRef.current = null;
        }, 1000);
      }
    };
    
  
    


  return (
    <div className="note-wrapper">
      <button onClick={navigateback} className="backbutton"><FontAwesomeIcon icon={faLeftLong} size="sm" /></button>
        <div className="note-box">
            <div className="d-flex">
                <h6 className="mr-2" style={{ color: listColor }}><FontAwesomeIcon icon={faMinus} size="sm" /></h6>
                <h6 className="mb-3">{note.title}</h6>
            </div>
            <div className="noteinfo">
                <h6><span>Created:</span> <em>{convertToLocalTime(note.created)}</em></h6>
                <div className="d-flex">
                  {hasRecentlyBeenSaved ? (
                    <h6 style={{ color: "green", fontWeight: "700" }}><b>Saving</b> <FontAwesomeIcon className={`ml-2 ${hasRecentlyBeenSaved ? "noterecentlysaved-spinner" : ""}`} icon={faSpinner} /></h6>
                  ) : (
                    <h6><span>Last saved:</span> <em className={`${hasRecentlyBeenSaved ? "noterecentlysaved" : ""}`}>{note.updated === null && !lastSaved ? "" : lastSaved ? convertToLocalTime(lastSaved) : convertToLocalTime(note.updated)}</em></h6>
                  )}                  
                </div>
            </div>
            <textarea onChange={(e) => handleUpdateText(e.target.value)} value={noteText || ""} className="textarea-notes" rows={21}></textarea>
            {/* <div className="mt-3">
                <button className="mr-1 canceltask-button">Cancel</button>
                <button onClick={handleSaveText} className="savetask-button">Save</button>
            </div> */}
        </div>

        {showNotes && < Notes show={showNotes} list_id={list_id} tasks={tasks} listColor={listColor} />}
    </div>
  );
}

export default Note;
