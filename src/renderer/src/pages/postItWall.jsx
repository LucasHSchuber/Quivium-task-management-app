import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTaskContext } from "../context/taskContext";

import convertToLocalTime from "../assets/js/convertToLocalTime"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {  } from "@fortawesome/free-regular-svg-icons";
import { faTrash, faBorderAll } from "@fortawesome/free-solid-svg-icons";


function PostItWall() {
    //define states
    const [posts, setPosts] = useState([]);
    const [title, setTitle] = useState("");
    const [text, setText] = useState("");

    const { triggerTaskUpdate } = useTaskContext();

    // Method to fetch posts
    const fetchPosts = async () => {
        const user_id = localStorage.getItem("user_id");
        try {
            const getResponse = await window.api.getPosts(user_id);
            console.log('getResponse', getResponse);
            if (getResponse.statusCode === 200) {
                setPosts(getResponse.posts)
            }
        } catch (error) {
            console.log('error', error);       
        }
    }
    useEffect(() => {
      fetchPosts()
    }, []);


    // Method to create new post
    const createPost = async () => {
        if (!title) {return}
        console.log('text', text);
        console.log('title', title);
        const user_id = localStorage.getItem("user_id");
        const data = {
            user_id: user_id,
            title: title,
            text: text
        }
        try {
            const postResponse = await window.api.createNewPost(data);
            console.log('postResponse', postResponse);
            if (postResponse.status === 201) {
                setTitle("")
                setText("")
                fetchPosts()
                triggerTaskUpdate(); 
            }
        } catch (error) {
            console.log('error', error);       
        }
    }

    const deletePost = async (post_id) => {
        const user_id = localStorage.getItem("user_id");
        const data = {
            user_id: user_id,
            post_id: post_id
        } 
        try {
            const delResponse = await window.api.deletePost(data);
            console.log('delResponse', delResponse);
            if (delResponse.status === 200) {
                fetchPosts()
                triggerTaskUpdate(); 
            }
        } catch (error) {
            console.log('error', error);
        }
    }


    return (
        <div className="postitwall-wrapper">
            <div className="postitwall-box">
                <div className="mb-5 d-flex listinfo">
                    <FontAwesomeIcon className="mr-3 header-icon" style={{ marginTop: "0.1em" }} icon={faBorderAll} />
                    <h1>Post it wall</h1>
                </div>
                    <div className="posts-container">

                        {posts.length > 0 ? (
                            posts.map(post => (
                                <div key={post.post_id} className="postit-note">
                                    <h6>{post.title}</h6>
                                    <p title={post.text}>{post.text.length > 360 ? post.text.substring(0,360) + "........" : post.text}</p>
                                    <div className="d-flex  postit-menu">
                                        <em className="mt-1" style={{ fontSize: "0.9em", color: "#4b4b4b" }}>{post.created && convertToLocalTime(post.created)}</em>
                                        <button title="Delete post" className="deletepost-button" onClick={() => deletePost(post.post_id)}><FontAwesomeIcon title="Delete post" icon={faTrash} size="xs"/></button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            // <h6><em>No posts created</em></h6>
                            null
                        )}
                    </div>
                    <div className="newpostit-note">
                            <input className="newpostitnote-title" type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)}></input>
                            <textarea className="newpostitnote-text" rows="8" placeholder="Text" value={text} onChange={(e) => setText(e.target.value)}></textarea>
                            <button className="createnewpostitnote-button" onClick={createPost}>Create</button>
                    </div>
            </div>
        </div>
    );
}

export default PostItWall;
