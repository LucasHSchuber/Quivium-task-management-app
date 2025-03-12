import { createContext, useContext, useState } from "react";

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const [taskUpdateTrigger, setTaskUpdateTrigger] = useState(false);

  const triggerTaskUpdate = () => {
    setTaskUpdateTrigger((prev) => !prev); 
  };

  return (
    <TaskContext.Provider value={{ taskUpdateTrigger, triggerTaskUpdate }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => useContext(TaskContext);
