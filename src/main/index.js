import { electronApp, optimizer, is } from "@electron-toolkit/utils";
const electron = require('electron');
const log = require("electron-log");
const path = require("path");
const { spawn } = require('child_process');
const fs = require("fs");
// const fsa = require("fs/promises");
// const util = require("util");
const sqlite3 = require("sqlite3").verbose();
// const fse = require("fs-extra");
// const axios = require('axios');
const ipcMain = electron.ipcMain;
const app = electron.app;
// const shell = electron.shell;
// const dialog = electron.dialog;
const os = require("os");
const BrowserWindow = electron.BrowserWindow;
const isDev = require("electron-is-dev");
const { autoUpdater, AppUpdater } = require("electron-updater");
const { exec } = require("child_process");
const https = require("https");
const url = require("url");
// const ftp = require("basic-ftp");
const bcrypt = require("bcrypt");
const saltRounds = 10;
// const tus = require("tus-js-client");
const nodemailer = require("nodemailer");
import _env from "../renderer/src/assets/js/env"

import express from "express";


// Override isPackaged property to simulate a packaged environment - DO NOT USE IN PRODUCTION MODE
Object.defineProperty(app, "isPackaged", {
  get() {
    return true;
  },
});

if (isDev) {
  console.log("Running in development mode");
  // console.log('GitHub Token loaded:', process.env.GH_TOKEN ? 'Yes' : 'No');
} else {
  console.log("Running in production mode");
  // console.log('GitHub Token loaded:', process.env.GH_TOKEN ? 'Yes' : 'No');
}




// create instances of each window
let loginWindow;
let mainWindow;
let updateApplicationWindow;

// Method to create updatewindow
function createUpdateWindow(callback) {
  if (updateApplicationWindow) return;
  // Create the browser window.
  updateApplicationWindow = new BrowserWindow({
    // parent: mainWindow, // Set the parent window if needed
    // modal: true, // Example: Open as a modal window
    width: 360,
    height: 300,
    resizable: false,
    autoHideMenuBar: true,
    show: true,
    frame: false,
    roundedCorners: true,
    // backgroundColor: '#232323',
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      sandbox: false,
      contextIsolation: true,
      // nodeIntegration: false,
      // // webSecurity: false,
      // worldSafeExecuteJavaScript: true,
      // enableRemoteModule: false,
      // worldSafeExecuteJavaScript: true //good extra security measure to ensure that JavaScript code executes in a safe context.
    },
  });


  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    updateApplicationWindow.loadURL("http://localhost:5050/#/updateapplication_window");
  } else {
    updateApplicationWindow.loadURL(
      `file://${path.join(__dirname, "../renderer/index.html")}#/updateapplication_window`,
    );
  }

  updateApplicationWindow.on("ready-to-show", () => {
    updateApplicationWindow.show();
    callback?.();
  });

  updateApplicationWindow.on("closed", () => {
    updateApplicationWindow = null; 
  });

  if (isDev) {
    updateApplicationWindow.webContents.openDevTools({ mode: "detach" });
  }

}



// --------- AUTO UPDATE METHODS --------

// Set autoDownload option to true to enable automatic downloading of updates
autoUpdater.autoDownload = false;
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = "info";

if (_env.production){
 // UPDATE SETFEEDURL WHEN IN PRODUCTION 
  autoUpdater.setFeedURL({
    provider: _env.provider,
    owner: _env.owner,
    repo: _env.repo
  });
} else {
  // SETFEEDURL WHEN TESTING UPDATES 
  autoUpdater.setFeedURL({
    provider: _env.provider,
    url: _env.url,
  });
}

app.on("ready", async () => {
  try {
    if (!is.dev) {
      const exApp = express();
      exApp.use(express.static(path.join(__dirname, "../renderer/")));
      exApp.listen(5050);
    }

    log.info("Ready!!");
    log.info("User Data Path:", app.getPath("userData"));
    log.info("Current App Version:", app.getVersion());

    if (!loginWindow && !updateApplicationWindow) {
    createUpdateWindow(() => {
      autoUpdater.checkForUpdates();
    });
  }  
  } catch (error) {
    log.error("Error in app initialization:", error); 
  }
});


autoUpdater.on("checking-for-update", () => {
  log.info("Checking for application updates...");
});

autoUpdater.on("update-available", (event, info) => {
  log.info("Update available:", info);
  setTimeout(() => {
    updateApplicationWindow.webContents.send("update-available", { message: "A new update was found" });
    setTimeout(() => {
      // starting the download
      autoUpdater.downloadUpdate(); 
    }, 500);
  }, 1500); 
});

autoUpdater.on("download-progress", (progress) => {
  log.info(`Download progress: ${progress.percent}%`);
  // if (updateApplicationWindow?.webContents) {
    updateApplicationWindow.webContents.send("download-progress", { message: "Downloading update...", progress: progress.percent });
  // }
});

autoUpdater.on("update-downloaded", (info) => {
  log.info("Update downloaded:", info);
  updateApplicationWindow.webContents.send("update-downloaded", { message: "Download completed! Preparing for restart." });
  setTimeout(() => {
    autoUpdater.quitAndInstall();
  }, 2500);
});

autoUpdater.on("error", (err) => {
  log.error("Error while checking for updates:", err);
  updateApplicationWindow.webContents.send("update-error", {
    message: `Update error: ${err.message || "Unknown error occurred"}`,
  });
});

autoUpdater.on("update-not-available", (event) => {
  log.info("No updates available");
  updateApplicationWindow.webContents.send("update-not-available", { message: "Starting..." });
});



// ------ Create Windows -------

//crate login window & close appilicationupdate window
function createLoginWindow() {
  if (loginWindow) return;
  try {
    // Create the loginWindow
    loginWindow = new BrowserWindow({
      width: 350,
      height: 480,
      resizable: false,
      show: false,
      autoHideMenuBar: true,
      webPreferences: {
        preload: path.join(__dirname, "../preload/index.js"),
        sandbox: false,
        contextIsolation: true,
        // nodeIntegration: false,
        // // webSecurity: false,
        // worldSafeExecuteJavaScript: true,
        // enableRemoteModule: false,
        // worldSafeExecuteJavaScript: true //good extra security measure to ensure that JavaScript code executes in a safe context.
      },
    });
    // Open DevTools for the new window
    if (isDev) {
      loginWindow.webContents.openDevTools({ mode: "detach" });
    }
  
    if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
      loginWindow.loadURL("http://localhost:5050/#/login_window");
    } else {
      loginWindow.loadURL(
        `file://${path.join(__dirname, "../renderer/index.html")}#/login_window`,
      );
    }
    // Show the loginWindow when it's ready
    loginWindow.once("ready-to-show", () => {
      loginWindow.show();
    });

    loginWindow.on("closed", () => {
      loginWindow = null; 
    });

     // Listen for when the DOM is ready
     loginWindow.webContents.on("dom-ready", () => {
      updateApplicationWindow.close();
    });

    // Optionally return some data back to the renderer process
    return { success: true, message: "Login window created successfully" };
  } catch (error) {
    // Handle any errors that occur while creating the new window
    console.error("Error creating login window:", error);
    throw new Error("Failed to create login window");
  }
}

ipcMain.handle("createLoginWindow", async (event, args) => {
  // updateApplicationWindow.close();
  createLoginWindow()
});



//crate main window & close login window
ipcMain.handle("createMainWindow", async (event, args) => {
  loginWindow.close();

  if (mainWindow) return;

  try {
    // Create the MainWindow
    const mainWindow = new BrowserWindow({
      width: 1150,
      height: 750,
      minWidth: 900,
      minHeight: 550,
      show: false,
      autoHideMenuBar: true,
      // icon: iconPath,
      webPreferences: {
        preload: path.join(__dirname, "../preload/index.js"),
        sandbox: false,
        contextIsolation: true,
        nodeIntegration: false,
        webSecurity: false,
        worldSafeExecuteJavaScript: true //good extra security measure to ensure that JavaScript code executes in a safe context.
      },
      // navigateOnDragDrop: true,
    });

    // Open DevTools for the new window
    if (isDev) {
      mainWindow.webContents.openDevTools({ mode: "detach" });
    }

    if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
      mainWindow.loadURL("http://localhost:5050/");
    } else {
      mainWindow.loadURL(
        `file://${path.join(__dirname, "../renderer/index.html")}`,
      );
    }

    // // Listen for when the DOM is ready
    // mainWindow.webContents.on("dom-ready", () => {
    //   loginWindow.close();
    // });

    // Show the MainWindow when it's ready
    mainWindow.once("ready-to-show", () => {
      mainWindow.show();
    });

    mainWindow.on("closed", () => {
      mainWindow = null; 
    });

    // Optionally return some data back to the renderer process
    return { success: true, message: "Main window created successfully" };
  } catch (error) {
    // Handle any errors that occur while creating the new window
    console.error("Error creating main window:", error);
    throw new Error("Failed to create main window");
  }
});




// Restart application
ipcMain.handle("restartApplication", () => {
  app.relaunch();
  app.quit();
})


// ------ Manual update downlaod -------

// Send app version to front end
ipcMain.handle("getCurrentAppVersion", async (event) => {
  log.info("Getting current version to front end");
  const version = app.getVersion();
  // event.sender.send('app-version', version);
  return version;
});

// Apply updates handler
ipcMain.handle("applyUpdates", async (event, downloadUrl) => {
  try {
    console.log("Received update request with URL:", downloadUrl);
    const updateSuccessful = await applyUpdate(downloadUrl);
    if (updateSuccessful) {
      console.log("Update applied successfully.");
    } else {
      console.log("Update failed.");
    }
  } catch (error) {
    console.error("Error during update process:", error);
  } finally {
    app.exit(0);
  }
});

async function applyUpdate(downloadUrl) {
  const fileExtension = path.extname(downloadUrl);
  const localFilePath = path.join(
    os.homedir(),
    "Desktop",
    `downloadedUpdate${fileExtension}`
  );

  try {
    console.log(`Downloading ${fileExtension} from: ${downloadUrl}`);
    await downloadFile(downloadUrl, localFilePath);
    console.log(`Download complete, saved to: ${localFilePath}`);

    // Verify file exists
    if (!fs.existsSync(localFilePath)) {
      throw new Error("Downloaded file does not exist.");
    }

    // Extract the base name (without extension) from the download URL
    const fileName = path.basename(downloadUrl, path.extname(downloadUrl)); 
    log.info("fileName (OS)", fileName);

    if (fileExtension === '.dmg') {
      // Handle DMG file (macOS)
      const mountPoint = path.join(
        os.homedir(),
        'Desktop',
        fileName
      );
      console.log(`Mounting DMG at: ${mountPoint}`);
      await execPromise(
        `hdiutil attach "${localFilePath}" -nobrowse -mountpoint "${mountPoint}"`
      );
      console.log('DMG mounted');

      // Open the mounted dmg location
      console.log('Opening mounted DMG location...');
      await execPromise(`open "${mountPoint}"`);
      console.log('DMG mounted successfully, please replace the application manually.');
    } else if (fileExtension === '.exe') {
      // Handle exe file (Windows)
      console.log(`Executing EXE installer from: ${localFilePath}`);
      await execPromise(`"${localFilePath}"`);
      console.log('EXE file executed successfully.');
    } else {
      throw new Error('Unsupported file type.');
    }

    return true;
  } catch (error) {
    console.error('Failed to apply update:', error);
    return false;
  }
}

function execPromise(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Execution error: ${stderr}`);
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
}

function downloadFile(fileUrl, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);

    function handleRedirect(response) {
      if (response.statusCode === 302 || response.statusCode === 301) {
        const newLocation = response.headers.location;
        console.log(`Redirecting to: ${newLocation}`);
        downloadFile(newLocation, dest).then(resolve).catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(
          new Error(
            `Failed to download file: Status code ${response.statusCode}`,
          ),
        );
        return response.resume(); 
      }

      response.pipe(file);
      file.on("finish", () => {
        file.close(() => resolve(dest));
      });
    }

    const options = url.parse(fileUrl);
    options.headers = { "User-Agent": "Mozilla/5.0" };

    https.get(options, handleRedirect).on("error", (err) => {
      fs.unlink(dest, () => reject(err)); 
    });

    file.on("error", (err) => {
      // Handle errors on file write.
      fs.unlink(dest, () => reject(err)); 
    });
  });
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createLoginWindow();
  }
});

process.on("uncaughtException", (error) => {
  log.info(`Exception: ${error}`);
  if (process.platform !== "darwin") {
    app.quit();
  }
});

log.info(process.resourcesPath);




// ------ DATABASE -----

// Import external db files
import dropTables from "./dropTables_db"
import alterTable from "./alterTable_db"
// import applySchemaUpdates from "./applySchemaUpdates_db"
import miscUpdates from "./miscUpdates_db";
//Database Connection 
let dbPath;
if (isDev) {
  // Development mode path
  dbPath = path.join(__dirname, "..", "..", "resources", "mydatabase.db");
} else {
  // Production mode path
  dbPath = path.join(app.getPath("userData"), "mydatabase.db");
}

// Create or open SQLite database
const db = new sqlite3.Database(dbPath, async (err) => {
  if (err) {
    console.log("Database path:", dbPath);
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to SQLite database");
    try {
      log.info("Running all databas methods...")
      let currentVersion;
      // Make sure the schema_table exists (even if the entire database is deleted (the getCurrentSchemaVersion will still be able to run))
      await ensureSchemaVersionTable();
      // Get currect version of updates
      currentVersion = await getCurrentSchemaVersion();
      // Run Drop tables
      const dropRes = await dropTables(db, currentVersion, fs, path, isDev, app);

      // if one or more tables has been dropped
      if (dropRes.status === 200){   
            log.info("dropRes.status === 200")     
            // Run Create tables
            await createTables();
            // Set current version to 0 to run all updates in alterTable and miscUpdates
            const resetCurrentVersion = 0; 
            // Run Alter table
            await alterTable(db, resetCurrentVersion);
            // Run Misc updates
            await miscUpdates(db, resetCurrentVersion);
      } else {
          log.info("dropRes.status !!! 200")     
            // Run Create tables
            await createTables();
            // Run Alter table
            await alterTable(db, currentVersion);
            // Run Misc updates
            await miscUpdates(db, currentVersion);
      }
    } catch (err) {
      console.error("Error during table operations:", err);
    }
  }
});
// Enable WAL mode
db.exec("PRAGMA journal_mode=WAL;", (err) => {
  if (err) {
    console.error("Failed to enable WAL mode:", err);
  } else {
    console.log("WAL mode enabled");
  }
});
async function dropSchemaVersionTable() {
  return new Promise((resolve, reject) => {
      db.run(
          `DROP TABLE IF EXISTS schema_version;`,
          (err) => {
              if (err) {
                  console.error("Error dropping schema_version table:", err.message);
                  reject(err);
              } else {
                  resolve();
              }
          }
      );
  });
}
async function ensureSchemaVersionTable() {
  return new Promise((resolve, reject) => {
      db.run(
          `CREATE TABLE IF NOT EXISTS schema_version (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              version INTEGER NOT NULL,
              applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
          );`,
          (err) => {
              if (err) {
                  console.error("Error ensuring schema_version table:", err.message);
                  reject(err);
              } else {
                  resolve();
              }
          }
      );
  });
}
// Get latest version from schema_version table
function getCurrentSchemaVersion() {
  return new Promise((resolve, reject) => {
    db.get(`SELECT MAX(version) as version FROM schema_version;`, (err, row) => {
      if (err) {
        console.error("Error fetching schema version:", err.message);
        reject(err);
      } else {
        resolve(row?.version || 0); 
      }
    });
  });
}
// Function to create tables
function createTables() {
  const tableDefinitions = [
    {
      name: "users",
      query: `
        CREATE TABLE IF NOT EXISTS users (
          user_id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT NOT NULL UNIQUE,
          firstname TEXT,
          lastname TEXT,
          password TEXT NOT NULL,
          city TEXT,
          mobile VARCHAR,
          token TEXT,
          created TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `,
    },
    {
      name: "lists",
      query: `
        CREATE TABLE IF NOT EXISTS lists (
          list_id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          color TEXT,
          is_deleted INTEGER DEFAULT 0,
          archived INTEGER DEFAULT 0,
          archived_date TEXT,
          created TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          user_id INTEGER NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users(user_id)
        )
      `,
    },
    // {
    //   name: "sublists",
    //   query: `
    //     CREATE TABLE IF NOT EXISTS sublists (
    //       sublist_id INTEGER PRIMARY KEY AUTOINCREMENT,
    //       name TEXT NOT NULL,
    //       is_deleted INTEGER DEFAULT 0,
    //       archived INTEGER DEFAULT 0,
    //       archived_date TEXT,
    //       created TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    //       list_id INTEGER NOT NULL,
    //       FOREIGN KEY (list_id) REFERENCES lists(list_id)
    //     )
    //   `,
    // },
    {
      name: "tasks",
      query: `
        CREATE TABLE IF NOT EXISTS tasks (
          task_id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT,
          due_date TEXT,
          updated TEXT,
          is_deleted INTEGER DEFAULT 0,
          is_completed INTEGER DEFAULT 0,
          created TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          list_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          FOREIGN KEY (list_id) REFERENCES lists(list_id)
          FOREIGN KEY (user_id) REFERENCES users(user_id)
        )
      `,
    },
    {
      name: "subtasks",
      query: `
        CREATE TABLE IF NOT EXISTS subtasks (
          subtask_id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT,
          due_date TEXT,
          updated TEXT,
          is_deleted INTEGER DEFAULT 0,
          is_completed INTEGER DEFAULT 0,
          created TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          task_id INTEGER NOT NULL,
          FOREIGN KEY (task_id) REFERENCES tasks(task_id)
        )
      `,
    },
    {
      name: "posts",
      query: `
        CREATE TABLE IF NOT EXISTS posts (
          post_id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          text TEXT,
          updated TEXT,
          is_deleted INTEGER DEFAULT 0,
          created TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          user_id INTEGER NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users(user_id)
        )
      `,
    },
    {
      name: "notes",
      query: `
        CREATE TABLE IF NOT EXISTS notes (
          note_id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          text TEXT,
          updated TEXT,
          is_deleted INTEGER DEFAULT 0,
          created TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          user_id INTEGER NOT NULL,
          task_id INTEGER,  
          list_id INTEGER,  
          FOREIGN KEY (user_id) REFERENCES users(user_id),
          FOREIGN KEY (task_id) REFERENCES tasks(task_id),
          FOREIGN KEY (list_id) REFERENCES lists(list_id)
        )
      `,
    },
    {
      name: "schema_version",
      query: `
      CREATE TABLE IF NOT EXISTS schema_version (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          version INTEGER NOT NULL,
          applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `
    }
  ];
  return new Promise((resolve, reject) => {
    let createdTables = 0;
    tableDefinitions.forEach(({ name, query }) => {
      // First check if the table exists
      db.get(`PRAGMA table_info(${name});`, (err, row) => {
        if (err) {
          reject(`Error checking if ${name} table exists: ${err.message}`);
        } else {
          if (row === undefined) {
            db.run(query, (err) => {
              if (err) {
                reject(`Error creating ${name} table: ${err.message}`);
              } else {
                console.log(`${name} table created successfully`);
                createdTables++;
                if (createdTables === tableDefinitions.length) {
                  resolve();
                }
              }
            });
          } else {
            createdTables++;
            if (createdTables === tableDefinitions.length) {
              resolve();
            }
          }
        }
      });
    });
  });
}





// SEND EMAIL - NODEMAILER

ipcMain.handle("sendMessage", async (event, email, message) => {
    console.log("sendMessage triggered...");
    log.info("email", email)
    if (!email || !message) {throw new Error("Missing data for sendMessage")}
    
    try {
      const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
              user: _env.GMAIL_USER,
              pass: _env.GMAIL_PASS,
          },
          logger: true,
          debug: true,
      });

      const mailOptions = {
        from: `Quivium Contact`, 
        replyTo: email, 
        to: _env.GMAIL_USER,
        subject: "Quivium",
        text: `From: ${email}\n\n${message}`,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`Success!`);

      return { success: true, status: 200, message: "Email sent successfully!" };
  } catch (error) {
      console.error("Error sending email:", error);
      return { success: false, error: "Failed to send email." };
  }
})





// USERS

//get spcific user
ipcMain.handle("getUser", async (event, id) => {
  const retrieveQuery = "SELECT * FROM users WHERE user_id = ?";

  const db = new sqlite3.Database(dbPath);

  try {
    const row = await executeGetWithRetry(db, retrieveQuery, [id]);
    if (!row) {
      await closeDatabase(db);
      return { statusCode: 0, errorMessage: "User not found" };
    }

    const user = {
      user_id: row.user_id,
      email: row.email,
      firstname: row.firstname,
      lastname: row.lastname,
      city: row.city,
      mobile: row.mobile,
      lang: row.lang,
      token: row.token,
      created: row.created,
    };

    await closeDatabase(db);
    return { statusCode: 1, user: user };
  } catch (error) {
    await closeDatabase(db);
    console.error("Error fetching user data:", error);
    return { statusCode: 0, errorMessage: error.message };
  }
});
async function executeGetWithRetry(
  db,
  query,
  params = [],
  retries = 5,
  delay = 1000,
) {
  return new Promise((resolve, reject) => {
    function attempt() {
      db.get(query, params, (error, row) => {
        if (error) {
          if (error.code === "SQLITE_BUSY" && retries > 0) {
            setTimeout(attempt, delay);
          } else {
            reject(error);
          }
        } else {
          resolve(row);
        }
      });
    }
    attempt();
  });
}


//get all users
ipcMain.handle("getAllUsers", async (event, args) => {
  const retrieveQuery = "SELECT * FROM users";
  try {
    const users = await new Promise((resolve, reject) => {
      const db = new sqlite3.Database(dbPath);

      db.all(retrieveQuery, (error, rows) => {
        if (error != null) {
          db.close();
          reject({ statusCode: 0, errorMessage: error });
        }

        const allUsers = rows.map((row) => ({
          user_id: row.user_id,
          email: row.email,
          firstname: row.firstname,
          lastname: row.lastname,
          city: row.city,
          lang: row.lang,
          created: row.created,
        }));

        db.close(() => {
          resolve({ statusCode: 1, users: allUsers });
        });
      });
    });

    return { statusCode: 1, users: users }; 
  } catch (error) {
    console.error("Error fetching user data:", error);
    return { statusCode: 0, errorMessage: error.message };
  }
});

//create new user
ipcMain.handle("createUser", async (event, args) => {
  try {
    if (!args || typeof args !== "object") {
      throw new Error("Invalid arguments received for createUser");
    }

    const { username, password, firstname, lastname } = args;

    if (!username || !password || !firstname || !lastname) {
      throw new Error("Missing required user data for createUser");
    }

    const userExists = await checkUserIdDatabase(username);
    if (userExists) {
      return { success: false, error: "User already exists" };
    } else {
      //hashing password
      const hashedPassword = await hashPassword(password);

      // Insert the new user into the database
      await db.run(
        `
        INSERT INTO users (email, password, firstname, lastname)
        VALUES (?, ?, ?, ?)
        `,
        [username, hashedPassword, firstname, lastname],
      );

      console.log("User added successfully");
      return { success: true };
    }
  } catch (err) {
    console.error("Error adding new user data:", err.message);
    return { error: err.message };
  }
});
const checkUserIdDatabase = (email) => {
  return new Promise((resolve, reject) => {
    const checkUserQuery = `SELECT COUNT(*) AS count FROM users WHERE email = ?`;
    db.get(checkUserQuery, [email], (err, row) => {
      if (err) {
        console.error("Error checking email in database:", err);
        reject(err);
        return;
      }
      resolve(row.count === 1);
    });
  });
};
async function hashPassword(password) {
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  } catch (error) {
    log.info("Hashing password error:", error);
  }
}


//loginUser
ipcMain.handle("loginUser", async (event, args) => {
  try {
    if (!args || typeof args !== "object") {
      throw new Error("Invalid arguments received for loginUser");
    }

    const { email, password } = args;

    if (!email || !password) {
      throw new Error("Missing required user data for loginUser");
    }
    const hashedPassword = await getUserHashedPassword(email);
    log.info(hashedPassword);
    if (hashedPassword === null) {
      // event.sender.send("loginUser-response", { success: false });
      return { status: 202, success: false, message: "User with email not found in local database" };
    }

    if (hashedPassword && (await comparePassword(password, hashedPassword))) {
      // If the user exists and the password matches, send success response
      const user = await getUserDetails(email);
      log.info(user);

      // event.sender.send("loginUser-response", { success: true, user });
      return {status: 200, success: true, user };
    } else {
      // If the user doesn't exist or password doesn't match, send error response
      throw new Error("Invalid username or password");
    }
  } catch (err) {
    console.error("Error logging user:", err.message);
    // event.sender.send("loginUser-response", { error: err.message });
    return { error: err.message };
  }
});
const getUserHashedPassword = (email) => {
  return new Promise((resolve, reject) => {
    // Query to get the user's hashed password based on email
    const query = `SELECT password FROM users WHERE email = ?`;
    db.get(query, [email], (err, row) => {
      if (err) {
        console.error("Error fetching user password from database:", err);
        reject(err);
      } else if (row) {
        resolve(row.password);
      } else {
        resolve(null); // No user found
      }
    });
  });
};
const getUserDetails = (email) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT user_id, email, firstname, lastname, mobile, city, created, token FROM users WHERE email = ?`;
    db.get(query, [email], (err, row) => {
      if (err) {
        console.error("Error fetching user details from database:", err);
        reject(err);
      } else if (row) {
        resolve(row);
      } else {
        resolve(null);
      }
    });
  });
};
const comparePassword = (password, hash) => {
  try {
    return bcrypt.compare(password, hash);
  } catch (error) {
    console.error("Comparison error:", error);
    return false;
  }
};



// Check if user exists  by email
ipcMain.handle("findUserByEmail", async (event, email) => {
  if (!email) { throw new Error("Mssing required data for findUserByEmail")}
  return new Promise((resolve, reject) => {
    const query = `SELECT email FROM users WHERE email = ?`;
    
    db.get(query, [email], (err, row) => {
      if (err) {
        console.error("Error fetching user from database:", err);
        reject(err);
      } else {
        resolve(row ? row.email : null); 
      }
    });
  });
});


//edit user data
ipcMain.handle("editUser", async (event, args) => {
  try {
    if (!args || typeof args !== "object") {
      throw new Error("Invalid arguments received for editUser");
    }

    const { email, firstname, lastname, city, mobile, lang, user_id } = args;

    if (!user_id || !email || !lang) {
      throw new Error("Missing required data (user_id) for editUser");
    }

    const result = await db.run(
      `
      UPDATE users
      SET 
        email = ?, firstname = ?, lastname = ?, city = ?, mobile = ?, lang = ? WHERE user_id = ?
      `,
      [email, firstname, lastname, city, mobile, lang, user_id],
    );

    console.log(`User data edited successfully`);
    return { success: true };
  } catch (err) {
    console.error("Error editing user:", err.message);
    return { error: err.message };
  }
});



// LISTS


//create new user
ipcMain.handle("createNewList", async (event, args) => {
  try {
    if (!args || typeof args !== "object") {
      throw new Error("Invalid arguments received for createNewList");
    }

    const { newListName, selectedColor, user_id } = args;

    if (!newListName || !selectedColor || !user_id) {
      throw new Error("Missing required user data for createNewList");
    }
    // Insert the new user into the database
    await db.run(
      `
      INSERT INTO lists (name, color, user_id)
      VALUES (?, ?, ?)
      `,
      [newListName, selectedColor, user_id],
    );
    console.log("List added successfully");
    return { success: true, status: 201, message: "New list inserted successfully" };
    
  } catch (err) {
    console.error("Error adding list:", err.message);
    return { error: err.message };
  }
});


//get all lists by user_id
ipcMain.handle("getAllLists", async (event, user_id) => {
  const query = `
    SELECT 
      l.list_id, l.name, l.color, l.is_deleted AS list_deleted, 
      l.archived, l.archived_date, l.created AS list_created, 
      l.user_id,
      t.task_id, t.title, t.description, t.due_date, 
      t.updated AS task_updated, t.is_deleted AS task_deleted, 
      t.is_completed, t.created AS task_created
    FROM lists l
    LEFT JOIN tasks t ON l.list_id = t.list_id AND t.is_deleted = 0
    WHERE l.user_id = ? AND l.is_deleted = 0 AND l.archived = 0
    ORDER BY l.list_id, t.created
  `;

  try {
    const lists = await new Promise((resolve, reject) => {
      const db = new sqlite3.Database(dbPath);

      db.all(query, [user_id], (error, rows) => {
        if (error) {
          db.close();
          return reject({ statusCode: 400, errorMessage: error.message });
        }

        const listMap = new Map();

        rows.forEach(row => {
          if (!listMap.has(row.list_id)) {
            listMap.set(row.list_id, {
              list_id: row.list_id,
              name: row.name,
              color: row.color,
              is_deleted: row.list_deleted,
              archived: row.archived,
              archived_date: row.archived_date,
              created: row.list_created,
              user_id: row.user_id,
              tasks: [] 
            });
          }

          if (row.task_id) {
            listMap.get(row.list_id).tasks.push({
              task_id: row.task_id,
              title: row.title,
              description: row.description,
              due_date: row.due_date,
              updated: row.task_updated,
              is_deleted: row.task_deleted,
              is_completed: row.is_completed,
              created: row.task_created
            });
          }
        });

        db.close();
        resolve(Array.from(listMap.values()));
      });
    });

    return { status: 200, lists };
  } catch (error) {
    console.error("Error fetching lists:", error);
    return { statusCode: 500, errorMessage: error.message || "Internal Server Error" };
  }
});



// Get list by list id
ipcMain.handle("getListById", async (event, list_id, user_id) => {
  const query = "SELECT * FROM lists WHERE list_id = ? AND user_id = ? AND is_deleted = 0";

  try {
    const list = await new Promise((resolve, reject) => {
      const db = new sqlite3.Database(dbPath);
      db.get(query, [list_id, user_id], (error, row) => {
        db.close();
        if (error) reject({ statusCode: 400, errorMessage: error });
        resolve({ statusCode: 200, list: row });
      });
    });

    return list;
  } catch (error) {
    return { statusCode: 0, errorMessage: error.message };
  }
});



// Update list
ipcMain.handle("updateList", async (event, args) => {
  const { user_id, list_id, name, color } = args;
  log.info("name", name)

  if (!user_id || !list_id) {
    return { status: 400, message: "Missing required data for updateList" };
  }
  if (!name || typeof name !== "string" || !name.trim()) {
    return { status: 400, message: "Name cannot be empty" };
  }

  let query = "UPDATE lists SET ";
  let params = [];
  let updates = [];

  if (name) {
    updates.push("name = ?");
    params.push(name);
  }
  if (color) {
    updates.push("color = ?");
    params.push(color);
  }
  if (updates.length === 0) {
    return { status: 400, message: "No valid fields provided for update" };
  }
  query += updates.join(", ") + " WHERE list_id = ? AND user_id = ?";
  params.push(list_id, user_id);
  try {
    const result = await new Promise((resolve, reject) => {
      db.run(query, params, function (error) {
        if (error) {
          console.error("Error updating list:", error);
          reject(error);
        } else {
          resolve({ changes: this.changes });
        }
      });
    });

    if (result.changes === 0) {
      return { status: 404, message: "List not found or no changes made" };
    }
    return { status: 200, list_id, message: "List updated successfully" };
  } catch (error) {
    console.error("Error in updateList:", error);
    return { status: 500, message: "Failed to update list" };
  }
});


// delete list
ipcMain.handle('deleteList', async (event, listId, user_id) => {
  log.info(listId);
  if (!user_id || !listId) {
      throw new Error("Missing required user data for deleteList");
  }

  const query = 'UPDATE lists SET is_deleted = 1 WHERE user_id = ? AND list_id = ?';

  try {
      const result = await new Promise((resolve, reject) => {
          db.run(query, [user_id, listId], (error, results) => {
              if (error) {
                  console.error('Error updating task:', error);
                  reject(error);
              } else {
                  resolve(results);
              }
          });
      });

      return { status: 200, list_id: listId, message: 'List deleted successfully' };
  } catch (error) {
      console.error('Error in deleteList:', error);
      return { status: 500, message: 'Failed to deleted list' };
  }
});


// Set list as archive
ipcMain.handle('setListAsArchived', async (event, args) => {
  
  if (!args || typeof args !== "object") {
    throw new Error("Invalid arguments received for setListAsArchived");
  }
  const { user_id, list_id } = args;
  const query = 'UPDATE lists SET archived = 1, archived_date = CURRENT_TIMESTAMP WHERE user_id = ? AND list_id = ?';
  try {
      const result = await new Promise((resolve, reject) => {
          db.run(query, [user_id, list_id], (error, results) => {
              if (error) {
                  console.error('Error updating lists:', error);
                  reject(error);
              } else {
                  resolve(results);
              }
          });
      });
      
    return { status: 200, list_id: list_id, message: 'List updated to archived successfully' };
  } catch (error) {
      console.error('Error in setListAsArchived:', error);
      return { status: 500, message: 'Failed to set list to archived' };
  }
});



//get all archived lists by user_id
ipcMain.handle("getArchivedLists", async (event, user_id) => {
  if (!user_id) {throw new Error("Missing user_id for getArchivedLists")}
  const query = "SELECT * FROM lists WHERE user_id = ? AND is_deleted = 0 AND archived = 1 ORDER by archived_date";
  try {
    const lists = await new Promise((resolve, reject) => {
      const db = new sqlite3.Database(dbPath);

      db.all(query, [user_id], (error, rows) => {
        if (error) {
          console.error("Error fetching archived lists:", error);
          reject({ statusCode: 400, errorMessage: error });
        } else {
          resolve(rows);
        }
      });
    });
    return { status: 200, lists: lists };
  } catch (error) {
    console.error("Error fetching user data:", error);
    return { statusCode: 500, errorMessage: error.message || "Internal Server Error" };
  }
});


// // Get all archived lists by user_id, including tasks and subtasks
// ipcMain.handle("getArchivedLists", async (event, user_id) => {
//   if (!user_id) {
//     throw new Error("Missing user_id for getArchivedLists");
//   }

//   const query = `
//     SELECT 
//       l.list_id, l.name AS list_name, l.archived_date,
//       t.task_id, t.name AS task_name, t.completed AS task_completed,
//       s.subtask_id, s.name AS subtask_name, s.completed AS subtask_completed
//     FROM lists l
//     LEFT JOIN tasks t ON t.list_id = l.list_id
//     LEFT JOIN subtasks s ON s.task_id = t.task_id
//     WHERE l.user_id = ? AND l.is_deleted = 0 AND l.archived = 1
//     ORDER BY l.archived_date, t.task_id, s.subtask_id;
//   `;

//   try {
//     const listsWithTasks = await new Promise((resolve, reject) => {
//       const db = new sqlite3.Database(dbPath);

//       db.all(query, [user_id], (error, rows) => {
//         if (error) {
//           console.error("Error fetching archived lists:", error);
//           reject({ statusCode: 400, errorMessage: error.message });
//         } else {
//           // Convert the flat structure into a nested JSON format
//           const listsMap = new Map();

//           rows.forEach(row => {
//             if (!listsMap.has(row.list_id)) {
//               listsMap.set(row.list_id, {
//                 list_id: row.list_id,
//                 list_name: row.list_name,
//                 archived_date: row.archived_date,
//                 tasks: []
//               });
//             }

//             if (row.task_id && !listsMap.get(row.list_id).tasks.some(t => t.task_id === row.task_id)) {
//               listsMap.get(row.list_id).tasks.push({
//                 task_id: row.task_id,
//                 task_name: row.task_name,
//                 task_completed: row.task_completed,
//                 subtasks: []
//               });
//             }

//             if (row.subtask_id) {
//               const task = listsMap.get(row.list_id).tasks.find(t => t.task_id === row.task_id);
//               if (task) {
//                 task.subtasks.push({
//                   subtask_id: row.subtask_id,
//                   subtask_name: row.subtask_name,
//                   subtask_completed: row.subtask_completed
//                 });
//               }
//             }
//           });

//           resolve([...listsMap.values()]);
//         }
//       });

//       db.close();
//     });

//     return { status: 200, lists: listsWithTasks };
//   } catch (error) {
//     console.error("Error fetching user data:", error);
//     return { statusCode: 500, errorMessage: error.message || "Internal Server Error" };
//   }
// });



// Move lists back to lists from archived
ipcMain.handle('moveBackToLists', async (event, user_id, list_id) => {
  
  if (!user_id || !list_id) {
    throw new Error("Invalid arguments received for moveBackToLists");
  }

  const query = 'UPDATE lists SET archived = 0 WHERE user_id = ? AND list_id = ?';
  try {
      const result = await new Promise((resolve, reject) => {
          db.run(query, [user_id, list_id], (error, results) => {
              if (error) {
                  console.error('Error updating lists:', error);
                  reject(error);
              } else {
                  resolve(results);
              }
          });
      });
      
    return { status: 200, list_id: list_id, message: 'List removed from archived successfully' };
  } catch (error) {
      console.error('Error in moveBackToLists:', error);
      return { status: 500, message: 'Failed to remove list from archived' };
  }
});







// TASKS

//create new user
ipcMain.handle("createNewTask", async (event, args) => {
  try {
    if (!args || typeof args !== "object") {
      throw new Error("Invalid arguments received for createNewTask");
    }

    const { title, description, due_date, user_id, list_id } = args;

    if (!title || !user_id || !list_id) {
      throw new Error("Missing required user data for createNewTask");
    }
    // Insert the new user into the database
    await db.run(
      `
      INSERT INTO tasks (title, description, due_date, user_id, list_id)
      VALUES (?, ?, ?, ?, ?)
      `,
      [title, description, due_date, user_id, list_id],
    );
    return { success: true, status: 201, message: "New task inserted successfully" };
    
  } catch (err) {
    console.error("Error adding task:", err.message);
    return { error: err.message };
  }
});


ipcMain.handle("getAllTasks", async (event, user_id, list_id) => {
  if (!user_id || !list_id) {throw new Error("Missing required parameters for getAllTasks")}
  const query = `
    SELECT 
      t.task_id, t.title, t.description, t.due_date, 
      t.updated, t.is_completed, t.sticky, t.list_id,
      st.subtask_id, st.title AS subtask_title, st.description AS subtask_description, 
      st.due_date AS subtask_due_date, st.is_completed AS subtask_completed, st.created AS subtask_created
    FROM tasks t
    LEFT JOIN subtasks st ON t.task_id = st.task_id 
    WHERE t.user_id = ? AND t.list_id = ? AND t.is_deleted = 0
    ORDER BY t.is_completed ASC, t.due_date ASC;
  `;
  try {
    const tasks = await new Promise((resolve, reject) => {
      const db = new sqlite3.Database(dbPath);

      db.all(query, [user_id, list_id], (error, rows) => {
        if (error) {
          db.close();
          return reject({ status: 400, errorMessage: error.message });
        }
        const taskMap = new Map();
        rows.forEach(row => {
          if (!taskMap.has(row.task_id)) {
            taskMap.set(row.task_id, {
              task_id: row.task_id,
              title: row.title,
              description: row.description,
              due_date: row.due_date,
              updated: row.updated,
              sticky: row.sticky,
              is_completed: row.is_completed,
              subtasks: [] 
            });
          }

          if (row.subtask_id) {
            taskMap.get(row.task_id).subtasks.push({
              subtask_id: row.subtask_id,
              title: row.subtask_title,
              description: row.subtask_description,
              due_date: row.subtask_due_date,
              is_completed: row.subtask_completed,
              created: row.subtask_created
            });
          }
        });

        db.close();
        resolve(Array.from(taskMap.values())); 
      });
    });

    return { status: 200, tasks: tasks };
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return { statusCode: 500, errorMessage: error.message || "Internal Server Error" };
  }
});



// Get task by task id
ipcMain.handle("getTaskByTaskId", async (event, task_id, user_id) => {
  const query = "SELECT * FROM tasks WHERE task_id = ? AND user_id = ? AND is_deleted = 0";

  try {
    const task = await new Promise((resolve, reject) => {
      const db = new sqlite3.Database(dbPath);
      db.get(query, [task_id, user_id], (error, row) => {
        db.close();
        if (error) reject({ statusCode: 400, errorMessage: error });
        resolve({ statusCode: 200, task: row });
      });
    });

    return task;
  } catch (error) {
    return { statusCode: 0, errorMessage: error.message };
  }
});



ipcMain.handle('updateTaskCompletion', async (event, _check, task_id, user_id) => {
    log.info("_check", _check);
    if (_check === undefined || !user_id || !task_id) {
        throw new Error("Missing required user data for updateTaskCompletion");
    }

    const query = 'UPDATE tasks SET is_completed = ? WHERE task_id = ? AND user_id = ?';

    try {
        const result = await new Promise((resolve, reject) => {
            db.run(query, [_check, task_id, user_id], (error, results) => {
                if (error) {
                    console.error('Error updating task:', error);
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });
        return { status: 200, task_id: task_id, message: 'Task updated successfully' };
    } catch (error) {
        console.error('Error in updateTaskCompletion:', error);
        return { status: 500, message: 'Failed to update task' };
    }
});


// Get all tasks due today with their subtasks
ipcMain.handle("getTasksDueToday", async (event, user_id) => {
  const query = `
    SELECT 
      l.list_id, l.name AS list_name, l.color AS list_color, 
      t.task_id, t.title AS task_title, t.description AS task_description, 
      t.due_date AS task_due_date, t.updated AS task_updated, 
      t.is_deleted AS task_is_deleted, t.is_completed AS task_is_completed, 
      t.created AS task_created, t.user_id AS task_user_id,
      st.subtask_id, st.title AS subtask_title, st.description AS subtask_description, 
      st.due_date AS subtask_due_date, st.is_completed AS subtask_completed, 
      st.created AS subtask_created
    FROM lists l
    LEFT JOIN tasks t ON l.list_id = t.list_id 
    LEFT JOIN subtasks st ON t.task_id = st.task_id 
    WHERE l.user_id = ? 
      AND l.archived = 0
      AND l.is_deleted = 0 
      AND t.is_deleted = 0
      AND t.due_date = date('now')
      ORDER BY t.is_completed ASC, t.due_date ASC;
  `;

  try {
    const tasks = await new Promise((resolve, reject) => {
      const db = new sqlite3.Database(dbPath);

      db.all(query, [user_id], (error, rows) => {
        if (error) {
          db.close();
          return reject({ statusCode: 400, errorMessage: error.message });
        }

        const taskMap = new Map();

        rows.forEach((row) => {
          // If task is not in map, add it
          if (!taskMap.has(row.task_id)) {
            taskMap.set(row.task_id, {
              list_id: row.list_id,
              list_name: row.list_name,
              list_color: row.list_color,
              task_id: row.task_id,
              task_title: row.task_title,
              task_description: row.task_description,
              task_due_date: row.task_due_date,
              task_updated: row.task_updated,
              task_is_deleted: row.task_is_deleted,
              task_is_completed: row.task_is_completed,
              task_created: row.task_created,
              task_user_id: row.task_user_id,
              subtasks: [],
            });
          }

          // Add subtask if it exists
          if (row.subtask_id) {
            taskMap.get(row.task_id).subtasks.push({
              subtask_id: row.subtask_id,
              subtask_title: row.subtask_title,
              subtask_description: row.subtask_description,
              subtask_due_date: row.subtask_due_date,
              subtask_completed: row.subtask_completed,
              subtask_created: row.subtask_created,
            });
          }
        });

        resolve({ status: 200, tasks: Array.from(taskMap.values()) });
      });
    });

    return tasks;
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return { statusCode: 500, errorMessage: error.message || "Internal Server Error" };
  }
});



// Get all upcoming tasks with their subtasks
ipcMain.handle("getUpcomingTasks", async (event, user_id) => {
  const query = `
    SELECT 
      l.list_id, l.name AS list_name, l.color AS list_color, 
      t.task_id, t.title AS task_title, t.description AS task_description, 
      t.due_date AS task_due_date, t.updated AS task_updated, 
      t.is_deleted AS task_is_deleted, t.is_completed AS task_is_completed, 
      t.created AS task_created, t.user_id AS task_user_id,
      st.subtask_id, st.title AS subtask_title, st.description AS subtask_description, 
      st.due_date AS subtask_due_date, st.is_completed AS subtask_completed, 
      st.created AS subtask_created
    FROM lists l
    LEFT JOIN tasks t ON l.list_id = t.list_id 
    LEFT JOIN subtasks st ON t.task_id = st.task_id 
    WHERE l.user_id = ? 
      AND l.archived = 0
      AND l.is_deleted = 0 
      AND t.is_deleted = 0
      AND (t.due_date != date('now') OR t.due_date IS NULL)
    ORDER BY t.is_completed ASC, t.due_date ASC;
  `;

  try {
    const tasks = await new Promise((resolve, reject) => {
      const db = new sqlite3.Database(dbPath);

      db.all(query, [user_id], (error, rows) => {
        if (error) {
          db.close();
          return reject({ statusCode: 400, errorMessage: error.message });
        }

        const taskMap = new Map();

        rows.forEach((row) => {
          // If task is not in map, add it
          if (!taskMap.has(row.task_id)) {
            taskMap.set(row.task_id, {
              list_id: row.list_id,
              list_name: row.list_name,
              list_color: row.list_color,
              task_id: row.task_id,
              task_title: row.task_title,
              task_description: row.task_description,
              task_due_date: row.task_due_date,
              task_updated: row.task_updated,
              task_is_deleted: row.task_is_deleted,
              task_is_completed: row.task_is_completed,
              task_created: row.task_created,
              task_user_id: row.task_user_id,
              subtasks: [],
            });
          }

          // Add subtask if it exists
          if (row.subtask_id) {
            taskMap.get(row.task_id).subtasks.push({
              subtask_id: row.subtask_id,
              subtask_title: row.subtask_title,
              subtask_description: row.subtask_description,
              subtask_due_date: row.subtask_due_date,
              subtask_completed: row.subtask_completed,
              subtask_created: row.subtask_created,
            });
          }
        });

        resolve({ status: 200, tasks: Array.from(taskMap.values()) });
      });
    });

    return tasks;
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return { statusCode: 500, errorMessage: error.message || "Internal Server Error" };
  }
});




ipcMain.handle("updateTask", async (event, args) => {
  const { user_id, list_id, task_id, title, description, due_date } = args;

  if (!user_id || !task_id) {
    return { status: 400, message: "Missing required user or task ID" };
  }

  let query = "UPDATE tasks SET ";
  let params = [];
  let updates = [];

  updates.push("description = ?");
  params.push(description);
  updates.push("due_date = ?");
  params.push(due_date);
  if (title) {
    updates.push("title = ?");
    params.push(title);
  }
  if (list_id) {
    updates.push("list_id = ?");
    params.push(list_id);
  }
  if (updates.length === 0) {
    return { status: 400, message: "No valid fields provided for update" };
  }

  query += updates.join(", ") + " WHERE task_id = ? AND user_id = ?";
  params.push(task_id, user_id);

  try {
    const result = await new Promise((resolve, reject) => {
      db.run(query, params, function (error) {
        if (error) {
          console.error("Error updating task:", error);
          reject(error);
        } else {
          resolve({ changes: this.changes });
        }
      });
    });

    if (result.changes === 0) {
      return { status: 404, message: "Task not found or no changes made" };
    }

    return { status: 200, task_id, message: "Task updated successfully" };
  } catch (error) {
    console.error("Error in updateTask:", error);
    return { status: 500, message: "Failed to update task" };
  }
});


//Delete task
ipcMain.handle('deleteTask', async (event, task_id, user_id) => {
  if (!user_id || !task_id) {
      throw new Error("Missing required user data for deleteTask");
  }
  const query = 'UPDATE tasks SET is_deleted = 1 WHERE user_id = ? AND task_id = ?';
  try {
      const result = await new Promise((resolve, reject) => {
          db.run(query, [user_id, task_id], (error, results) => {
              if (error) {
                  console.error('Error updating task:', error);
                  reject(error);
              } else {
                  resolve(results);
              }
          });
      });

      return { status: 200, task_id: task_id, message: 'Task deleted successfully' };
  } catch (error) {
      console.error('Error in deleteTask:', error);
      return { status: 500, message: 'Failed to deleted task' };
  }
});

// set task to sticky = 1
ipcMain.handle('setTaskSticky', async (event, task_id, list_id, user_id) => {
  if ( !list_id || !user_id || !task_id) {
      throw new Error("Missing required user data for setTaskSticky");
  }
  const query = 'UPDATE tasks SET sticky = 1 WHERE list_id = ? AND task_id = ? AND user_id = ?';
  try {
      const result = await new Promise((resolve, reject) => {
          db.run(query, [list_id, task_id, user_id], (error, results) => {
              if (error) {
                  console.error('Error updating task:', error);
                  reject(error);
              } else {
                  resolve(results);
              }
          });
      });
      return { status: 200, task_id: task_id, message: 'Task set to sticky successfully' };
  } catch (error) {
      console.error('Error in setTaskSticky:', error);
      return { status: 500, message: 'Failed to set task to sticky' };
  }
});

// unset task to sticky = 0
ipcMain.handle('unsetTaskSticky', async (event, task_id, list_id, user_id) => {
  if ( !list_id || !user_id || !task_id) {
      throw new Error("Missing required user data for unsetTaskSticky");
  }
  const query = 'UPDATE tasks SET sticky = 0 WHERE list_id = ? AND task_id = ? AND user_id = ?';
  try {
      const result = await new Promise((resolve, reject) => {
          db.run(query, [list_id, task_id, user_id], (error, results) => {
              if (error) {
                  console.error('Error updating task:', error);
                  reject(error);
              } else {
                  resolve(results);
              }
          });
      });
      return { status: 200, task_id: task_id, message: 'Task set to unsticky successfully' };
  } catch (error) {
      console.error('Error in unsetTaskSticky:', error);
      return { status: 500, message: 'Failed to unset task to sticky' };
  }
});




// POST


//create new post
ipcMain.handle("createNewPost", async (event, args) => {
  try {
    if (!args || typeof args !== "object") {
      throw new Error("Invalid arguments received for createNewPost");
    }

    const { user_id, title, text } = args;

    if (!user_id || !title || !text) {
      throw new Error("Missing required user data for createNewPost");
    }
    // Insert the new user into the database
    await db.run(
      `
      INSERT INTO posts (user_id, title, text)
      VALUES (?, ?, ?)
      `,
      [user_id, title, text],
    );
    console.log("Post added successfully");
    return { success: true, status: 201, message: "New post inserted successfully" };
    
  } catch (err) {
    console.error("Error adding post:", err.message);
    return { error: err.message };
  }
});


//get all posts
ipcMain.handle("getPosts", async (event, user_id) => {
  if (!user_id) {throw new Error("Missing user_id for getPosts")}

  const query = "SELECT * FROM posts WHERE user_id = ? AND is_deleted = 0";
  try {
    const posts = await new Promise((resolve, reject) => {
      const db = new sqlite3.Database(dbPath);

      db.all(query, [user_id], (error, rows) => {
        if (error) {
          reject({ statusCode: 500, errorMessage: error.message });
        } else {
          resolve({ statusCode: 200, posts: rows });
        }
      });
    });

    return posts;
  } catch (error) {
    console.error("Error fetching posts:", error);
    return { statusCode: 500, errorMessage: error.message };
  }
});

// Delete post
ipcMain.handle('deletePost', async (event, args) => {
  const { user_id, post_id } = args;
  if (!user_id || !post_id) {
      throw new Error("Missing required user data for deletePost");
  }

  const query = 'UPDATE posts SET is_deleted = 1 WHERE user_id = ? AND post_id = ?';

  try {
      const result = await new Promise((resolve, reject) => {
          db.run(query, [user_id, post_id], (error, results) => {
              if (error) {
                  console.error('Error deleting post:', error);
                  reject(error);
              } else {
                  resolve(results);
              }
          });
      });

      return { status: 200, post_id: post_id, message: 'Post deleted successfully' };
  } catch (error) {
      console.error('Error in deletePost:', error);
      return { status: 500, message: 'Failed to deleted post' };
  }
});




// SUBTASKS

ipcMain.handle('getTaskWithSubtasks', async (event, task_id) => {
  const query = `
      SELECT 
          t.task_id,
          t.title AS task_title,
          t.description AS task_description,
          t.due_date AS task_due_date,
          t.is_completed AS task_is_completed,
          t.created AS task_created,
          st.subtask_id,
          st.title AS subtask_title,
          st.description AS subtask_description,
          st.due_date AS subtask_due_date,
          st.is_completed AS subtask_is_completed,
          st.created AS subtask_created
      FROM tasks t
      LEFT JOIN subtasks st ON t.task_id = st.task_id
      WHERE t.task_id = ?
      AND t.is_deleted = 0
  `;

  try {
      const rows = await new Promise((resolve, reject) => {
          db.all(query, [task_id], (error, result) => {
              if (error) {
                  console.error('Error fetching task with subtasks:', error);
                  reject(error);
              } else {
                  resolve(result);
              }
          });
      });

      if (!rows.length) {
          return { status: 404, message: 'Task not found' };
      }

      const taskData = {
          task_id: rows[0].task_id,
          task_title: rows[0].task_title,
          task_description: rows[0].task_description,
          task_due_date: rows[0].task_due_date,
          task_is_completed: rows[0].task_is_completed,
          task_created: rows[0].task_created,
          subtasks: []
      };

      rows.forEach(row => {
          if (row.subtask_id) {
              taskData.subtasks.push({
                  subtask_id: row.subtask_id,
                  subtask_title: row.subtask_title,
                  subtask_description: row.subtask_description,
                  subtask_due_date: row.subtask_due_date,
                  subtask_is_completed: row.subtask_is_completed,
                  subtask_created: row.subtask_created
              });
          }
      });

      return { status: 200, data: taskData };
  } catch (error) {
      console.error('Error:', error);
      return { status: 500, message: 'Failed to fetch task with subtasks' };
  }
});

//create new subtask
ipcMain.handle("createNewSubtask", async (event, args) => {
  try {
    if (!args || typeof args !== "object") {
      throw new Error("Invalid arguments received for createNewSubtask");
    }

    const { task_id, title } = args;

    if (!task_id || !title) {
      throw new Error("Missing required user data for createNewSubtask");
    }
    await db.run(
      `
      INSERT INTO subtasks (task_id, title)
      VALUES (?, ?)
      `,
      [task_id, title],
    );
    console.log("Subtask added successfully");
    return { success: true, status: 201, message: "New subtask inserted successfully" };
    
  } catch (err) {
    console.error("Error adding post:", err.message);
    return { error: err.message };
  }
});




// NOTES 

//create new bote
ipcMain.handle("createNewNoteTitle", async (event, args) => {
  try {
    if (!args || typeof args !== "object") {
      throw new Error("Invalid arguments received for createNewNoteTitle");
    }
    const { user_id, task_id, list_id, title } = args;
    if (!user_id || !title) {
      throw new Error("Missing required user data for createNewNoteTitle");
    }
    const safeListId = list_id || null;
    const safeTaskId = task_id || null;
    await db.run(
      `
      INSERT INTO notes (title, user_id, list_id, task_id)
      VALUES (?, ?, ?, ?)
      `,
      [title, user_id, safeListId, safeTaskId],
    );
    return { success: true, status: 201, message: "New note title created successfully" };
    
  } catch (err) {
    console.error("Error adding task:", err.message);
    return { error: err.message };
  }
});


// Get all task notes by list_id
ipcMain.handle("getAllTaskNotes", async (event, user_id, list_id) => {
  if (!user_id || !list_id) {
    throw new Error("Missing required parameters for getAllTaskNotes");
  }
  const query = `
    SELECT 
      t.task_id, t.title, t.description, t.due_date, 
      t.updated, t.is_completed, t.list_id,
      n.note_id, n.title AS note_title, n.text AS note_text, n.updated AS note_updated, n.created AS note_created
    FROM tasks t
    LEFT JOIN notes n ON t.task_id = n.task_id AND n.is_deleted = 0
    WHERE t.user_id = ? AND t.list_id = ? AND t.is_deleted = 0 

    UNION

    SELECT 
      NULL AS task_id, NULL AS title, NULL AS description, NULL AS due_date, 
      NULL AS updated, NULL AS is_completed, n.list_id,
      n.note_id, n.title AS note_title, n.text AS note_text, n.updated AS note_updated, n.created AS note_created
    FROM notes n
    WHERE n.list_id = ? AND n.task_id IS NULL AND n.is_deleted = 0 
    ORDER BY is_completed ASC, due_date ASC;
  `;

  try {
    const data = await new Promise((resolve, reject) => {
      const db = new sqlite3.Database(dbPath);

      db.all(query, [user_id, list_id, list_id], (error, rows) => {
        if (error) {
          db.close();
          return reject({ status: 400, errorMessage: error.message });
        }

        const taskMap = new Map();
        const listNotes = [];

        rows.forEach(row => {
          if (row.task_id) {
            // Task-based notes
            if (!taskMap.has(row.task_id)) {
              taskMap.set(row.task_id, {
                task_id: row.task_id,
                title: row.title,
                description: row.description,
                due_date: row.due_date,
                updated: row.updated,
                is_completed: row.is_completed,
                notes: []
              });
            }

            if (row.note_id) {
              taskMap.get(row.task_id).notes.push({
                note_id: row.note_id,
                title: row.note_title,
                text: row.note_text,
                updated: row.note_updated,
                created: row.note_created
              });
            }
          } else {
            // Notes directly linked to the list
            if (row.note_id) {
              listNotes.push({
                note_id: row.note_id,
                title: row.note_title,
                text: row.note_text,
                updated: row.note_updated,
                created: row.note_created
              });
            }
          }
        });

        db.close();
        resolve({ tasks: Array.from(taskMap.values()), listNotes });
      });
    });

    return { status: 200, data };
  } catch (error) {
    console.error("Error fetching tasks with notes:", error);
    return { statusCode: 500, errorMessage: error.message || "Internal Server Error" };
  }
});

// // Get all task notes by list_id
// ipcMain.handle("getAllTaskNotes", async (event, user_id, list_id) => {
//   if (!user_id || !list_id) {throw new Error("Missing required parameters for getAllTaskNotes")}
//   const query = `
//     SELECT 
//       t.task_id, t.title, t.description, t.due_date, 
//       t.updated, t.is_completed, t.list_id,
//       n.note_id, n.title AS note_title, n.text AS note_text, n.updated AS note_updated, n.created AS note_created
//     FROM tasks t
//     LEFT JOIN notes n ON t.task_id = n.task_id 
//     WHERE t.user_id = ? AND t.list_id = ? AND t.is_deleted = 0
//     ORDER BY t.is_completed ASC, t.due_date ASC;
//   `;
//   try {
//     const taskNotes = await new Promise((resolve, reject) => {
//       const db = new sqlite3.Database(dbPath);

//       db.all(query, [user_id, list_id], (error, rows) => {
//         if (error) {
//           db.close();
//           return reject({ status: 400, errorMessage: error.message });
//         }
//         const taskMap = new Map();
//         rows.forEach(row => {
//           if (!taskMap.has(row.task_id)) {
//             taskMap.set(row.task_id, {
//               task_id: row.task_id,
//               title: row.title,
//               description: row.description,
//               due_date: row.due_date,
//               updated: row.updated,
//               is_completed: row.is_completed,
//               notes: [] 
//             });
//           }

//           if (row.note_id) {
//             taskMap.get(row.task_id).notes.push({
//               note_id: row.note_id,
//               title: row.note_title,
//               text: row.note_text,
//               updated: row.note_updated,
//               created: row.note_created
//             });
//           }
//         });

//         db.close();
//         resolve(Array.from(taskMap.values())); 
//       });
//     });

//     return { status: 200, taskNotes: taskNotes };
//   } catch (error) {
//     console.error("Error fetching tasks with notes:", error);
//     return { statusCode: 500, errorMessage: error.message || "Internal Server Error" };
//   }
// });


// update text in note
ipcMain.handle('updateNoteText', async (event, args) => {

  if (!args || typeof args !== "object") {
    throw new Error("Invalid arguments received for updateNoteText");
  }

  const { user_id, note_id, text } = args;

  const updateQuery = 'UPDATE notes SET text = ?, updated = CURRENT_TIMESTAMP WHERE note_id = ? AND user_id = ?';
  const selectQuery = `SELECT * FROM notes WHERE note_id = ? AND user_id = ?`;

  try {
      await new Promise((resolve, reject) => {
          db.run(updateQuery, [text, note_id, user_id], (error, results) => {
              if (error) {
                  console.error('Error updating note:', error);
                  reject(error);
              } else {
                  resolve(results);
              }
          });
      });

      const updatedNote = await new Promise((resolve, reject) => {
        db.get(selectQuery, [note_id, user_id], (error, row) => {
          if (error) {
            console.error("Error fetching updated note:", error);
            reject(error);
          } else {
            resolve(row); // Returns the updated row
          }
        });
      });

      return { status: 200, note_id: note_id, note: updatedNote, message: 'Note text updated successfully' };
  } catch (error) {
      console.error('Error in updateNoteText:', error);
      return { status: 500, message: 'Failed to updated note text' };
  }
});


// Delete note
ipcMain.handle('deleteNote', async (event, note_id, user_id) => {
  if (!user_id || !note_id) {
      throw new Error("Missing required user data for deleteNote");
  }
  const query = 'UPDATE notes SET is_deleted = 1 WHERE user_id = ? AND note_id = ?';
  try {
      const result = await new Promise((resolve, reject) => {
          db.run(query, [user_id, note_id], (error, results) => {
              if (error) {
                  console.error('Error updating note:', error);
                  reject(error);
              } else {
                  resolve(results);
              }
          });
      });
      return { status: 200, task_id: note_id, message: 'Note deleted successfully' };
  } catch (error) {
      console.error('Error in deleteNote:', error);
      return { status: 500, message: 'Failed to deleted note' };
  }
});