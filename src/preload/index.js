import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
const os = require("os");
const electron = require("electron");
const app = electron.app;
const shell = electron.shell;


// Custom APIs for renderer
const api = {
  
  //PLATTFORM
  getPlatform: () => os.platform(), //NOT EXIST??
  homeDir: () => os.homedir(),
  shell: () => shell.shell(),
  app: () => app.getVersion(),
  quit: () => ipcRenderer.invoke("quit"),


  // CREATE WINDOWS:
  createLoginWindow: (args) => ipcRenderer.invoke('createLoginWindow', args), // create login window
  createMainWindow: (args) => ipcRenderer.invoke('createMainWindow', args), // create main window
  createNewuserWindow: () => ipcRenderer.invoke('createNewuserWindow'), // NOT EXISTS??? create main window
  createKnowledgebaseWindow: (url) => ipcRenderer.invoke('createknowledgebasewindow', url), // create knowledgebase window

  // RESTART
  restartApplication: () => ipcRenderer.invoke("restartApplication"),

  //UPDATES 
  applyUpdates: (downloadUrl) => ipcRenderer.invoke("applyUpdates", downloadUrl),
  getCurrentAppVersion: () => ipcRenderer.invoke('getCurrentAppVersion'), 
  installLatestVersion: (args) => ipcRenderer.invoke('installLatestVersion', args), 

  minimize: () => ipcRenderer.invoke('minimize'), // Minimize The Window
  maximize: () => ipcRenderer.invoke('maximize'), // Maximize The Window

  // USERS
  createUser: args => ipcRenderer.invoke('createUser', args),  // create user
  loginUser: args => ipcRenderer.invoke('loginUser', args),  // login user
  findUserByEmail: (email) => ipcRenderer.invoke('findUserByEmail', email), // Pass email to find a user 
  getUser: args => ipcRenderer.invoke('getUser', args), // Pass id to getUser 
  getAllUsers: args => ipcRenderer.invoke('getAllUsers', args), // getAllUsers 
  editUser: args => ipcRenderer.invoke('editUser', args), // Edit user
  verifyGlobalWithLocalPassword: (email, user_id, password, hashPassword) => ipcRenderer.invoke('verifyGlobalWithLocalPassword', email, user_id, password, hashPassword), // Check local password with global password

  // LISTS
  createNewList: args => ipcRenderer.invoke("createNewList", args), // create new list
  getAllLists: user_id => ipcRenderer.invoke("getAllLists", user_id), // fetch all list from sqlite
  getListById: (list_id, user_id) => ipcRenderer.invoke("getListById", list_id, user_id), // fetch list from sqlite
  updateList: args => ipcRenderer.invoke("updateList", args), // update list
  deleteList: (listId, user_id) => ipcRenderer.invoke("deleteList", listId, user_id), // delete list 
  setListAsArchived: args => ipcRenderer.invoke("setListAsArchived", args), // set list as archived
  getArchivedLists: user_id => ipcRenderer.invoke("getArchivedLists", user_id), // fetch all archived list from sqlite
  moveBackToLists: (user_id, list_id) => ipcRenderer.invoke("moveBackToLists", user_id, list_id), // Move back to lists

  // TASKS
  createNewTask: args => ipcRenderer.invoke("createNewTask", args), // create new task
  getAllTasks: (user_id, list_id) => ipcRenderer.invoke("getAllTasks", user_id, list_id), // fetch all tasks from sqlite
  getTaskByTaskId: (task_id, user_id) => ipcRenderer.invoke("getTaskByTaskId", task_id, user_id), 
  updateTaskCompletion: (_check, task_id, user_id) => ipcRenderer.invoke("updateTaskCompletion", _check, task_id, user_id), 
  getTasksDueToday: user_id => ipcRenderer.invoke("getTasksDueToday", user_id), // fetch  tasks due today from sqlite
  updateTask: args => ipcRenderer.invoke("updateTask", args), // update task
  deleteTask: (task_id, user_id) => ipcRenderer.invoke("deleteTask", task_id, user_id), // delete task 

  // POSTS
  createNewPost: args => ipcRenderer.invoke("createNewPost", args), // create new post
  getPosts: user_id => ipcRenderer.invoke("getPosts", user_id), // get posts
  deletePost: args => ipcRenderer.invoke("deletePost", args), // delete post 

  // SUBTASKS
  getTaskWithSubtasks: args => ipcRenderer.invoke("getTaskWithSubtasks", args), // get a task with its subtasks
  createNewSubtask: args => ipcRenderer.invoke("createNewSubtask", args), // create new subtask


  on: (channel, callback) => {
    const validChannels = ["upload-progress", "update-not-available", "update-available", "download-progress", "update-downloaded", "update-error", "upload-error", "upload-tus-progress", "success", "upload-canceled"]; 
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, callback);
    }
  },
  removeAllListeners: (channel) => { ipcRenderer.removeAllListeners(channel);},
}


// Use `contextBridge` APIs to expose Electron APIs to renderer only if context isolation is enabled, otherwise just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
