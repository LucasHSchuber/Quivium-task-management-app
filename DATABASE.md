# Database Schema Documentation

This document describes the database schema used in the application. The database consists of several tables that store information about users, tasks, lists, notes, and other related data.

## Tables

### 1. **users**
Stores user information and authentication details.

#### Columns:
- `user_id` (INTEGER, PRIMARY KEY, AUTOINCREMENT) - Unique identifier for each user.
- `email` (TEXT, UNIQUE, NOT NULL) - User's email address.
- `firstname` (TEXT) - User's first name.
- `lastname` (TEXT) - User's last name.
- `password` (TEXT, NOT NULL) - Hashed password for authentication.
- `city` (TEXT) - User's city.
- `mobile` (VARCHAR) - User's mobile phone number.
- `token` (TEXT) - Authentication token.
- `created` (TEXT, DEFAULT CURRENT_TIMESTAMP, NOT NULL) - Timestamp of user creation.

---

### 2. **lists**
Stores task lists created by users.

#### Columns:
- `list_id` (INTEGER, PRIMARY KEY, AUTOINCREMENT) - Unique identifier for each list.
- `name` (TEXT, NOT NULL) - Name of the list.
- `color` (TEXT) - Color associated with the list.
- `is_deleted` (INTEGER, DEFAULT 0) - Indicates if the list is deleted (0 = No, 1 = Yes).
- `archived` (INTEGER, DEFAULT 0) - Indicates if the list is archived (0 = No, 1 = Yes).
- `archived_date` (TEXT) - Timestamp when the list was archived.
- `created` (TEXT, DEFAULT CURRENT_TIMESTAMP, NOT NULL) - Timestamp of list creation.
- `user_id` (INTEGER, NOT NULL) - Reference to the user who owns the list.

---

### 3. **tasks**
Stores tasks associated with lists.

#### Columns:
- `task_id` (INTEGER, PRIMARY KEY, AUTOINCREMENT) - Unique identifier for each task.
- `title` (TEXT, NOT NULL) - Title of the task.
- `description` (TEXT) - Detailed description of the task.
- `due_date` (TEXT) - Due date for task completion.
- `updated` (TEXT) - Timestamp of last update.
- `is_deleted` (INTEGER, DEFAULT 0) - Indicates if the task is deleted.
- `is_completed` (INTEGER, DEFAULT 0) - Indicates if the task is completed.
- `created` (TEXT, DEFAULT CURRENT_TIMESTAMP, NOT NULL) - Timestamp of task creation.
- `list_id` (INTEGER, NOT NULL) - Reference to the list this task belongs to.
- `user_id` (INTEGER, NOT NULL) - Reference to the user who created the task.

---

### 4. **subtasks**
Stores subtasks associated with tasks.

#### Columns:
- `subtask_id` (INTEGER, PRIMARY KEY, AUTOINCREMENT) - Unique identifier for each subtask.
- `title` (TEXT, NOT NULL) - Title of the subtask.
- `description` (TEXT) - Detailed description of the subtask.
- `due_date` (TEXT) - Due date for subtask completion.
- `updated` (TEXT) - Timestamp of last update.
- `is_deleted` (INTEGER, DEFAULT 0) - Indicates if the subtask is deleted.
- `is_completed` (INTEGER, DEFAULT 0) - Indicates if the subtask is completed.
- `created` (TEXT, DEFAULT CURRENT_TIMESTAMP, NOT NULL) - Timestamp of subtask creation.
- `task_id` (INTEGER, NOT NULL) - Reference to the parent task.

---

### 5. **posts**
Stores user posts.

#### Columns:
- `post_id` (INTEGER, PRIMARY KEY, AUTOINCREMENT) - Unique identifier for each post.
- `title` (TEXT, NOT NULL) - Title of the post.
- `text` (TEXT) - Content of the post.
- `updated` (TEXT) - Timestamp of last update.
- `is_deleted` (INTEGER, DEFAULT 0) - Indicates if the post is deleted.
- `created` (TEXT, DEFAULT CURRENT_TIMESTAMP, NOT NULL) - Timestamp of post creation.
- `user_id` (INTEGER, NOT NULL) - Reference to the user who created the post.

---

### 6. **notes**
Stores user notes associated with tasks and lists.

#### Columns:
- `note_id` (INTEGER, PRIMARY KEY, AUTOINCREMENT) - Unique identifier for each note.
- `title` (TEXT, NOT NULL) - Title of the note.
- `text` (TEXT) - Content of the note.
- `updated` (TEXT) - Timestamp of last update.
- `is_deleted` (INTEGER, DEFAULT 0) - Indicates if the note is deleted.
- `created` (TEXT, DEFAULT CURRENT_TIMESTAMP, NOT NULL) - Timestamp of note creation.
- `user_id` (INTEGER, NOT NULL) - Reference to the user who created the note.
- `task_id` (INTEGER) - Reference to the associated task (if any).
- `list_id` (INTEGER) - Reference to the associated list (if any).

---

### 7. **schema_version**
Tracks database schema versions and updates.

#### Columns:
- `id` (INTEGER, PRIMARY KEY, AUTOINCREMENT) - Unique identifier.
- `version` (INTEGER, NOT NULL) - Schema version number.
- `applied_at` (TEXT, DEFAULT CURRENT_TIMESTAMP, NOT NULL) - Timestamp when the version was applied.

---

## Foreign Key Relationships
- `users` ↔ `lists` (1-to-Many) → A user can have multiple lists.
- `lists` ↔ `tasks` (1-to-Many) → A list can have multiple tasks.
- `tasks` ↔ `subtasks` (1-to-Many) → A task can have multiple subtasks.
- `users` ↔ `tasks` (1-to-Many) → A user can create multiple tasks.
- `tasks` ↔ `notes` (1-to-Many) → A task can have multiple notes.
- `lists` ↔ `notes` (1-to-Many) → A list can have multiple notes.

This database schema efficiently supports **task management, note-taking, and list organization**, ensuring seamless offline and online functionality.

