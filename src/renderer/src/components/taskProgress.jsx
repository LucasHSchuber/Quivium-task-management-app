import React, { useState, useEffect } from 'react';

function TaskProgress({ tasks }) {
    // Calculate completed tasks
    const completedTasks = tasks.filter(task => task.is_completed === 1).length;
    const totalTasks = tasks.length;
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return (
        <div className='mt-3 d-flex'>
            <div className="progress-bar-container">
                <div
                    className="progress-bar"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
            <p style={{ fontSize: "0.8em", marginTop: "-0.5em", marginLeft: "1em", fontWeight: "900" }}>{completedTasks}/{totalTasks}</p>
        </div>
    );
}

export default TaskProgress;
