"# To-Do-App." -> 

A simple To-Do web application built for the Senior Full Stack Engineer Take Home Assessment. Users can create tasks with a title and description, view the most recent 5 non-completed tasks, and mark tasks as completed. The application is fully Dockerized and uses MySQL, Node.js/Express, and a vanilla JavaScript frontend served by Nginx.
Features

Create tasks with a title (required) and description (optional).
List the 5 most recent non-completed tasks.
Mark tasks as completed (hidden from the UI).
Responsive and clean UI with a purple theme.
Backend REST API with error handling.
MySQL database with automatic table initialization.
Unit tests for the backend API.
Dockerized setup with docker-compose for easy deployment.

Tech Stack

Frontend: HTML, CSS, Vanilla JavaScript, Nginx
Backend: Node.js, Express, MySQL2
Database: MySQL 5.7
Other: Docker, Docker Compose, phpMyAdmin (for database management), Jest (for backend testing)

Prerequisites

Docker and Docker Compose installed on a Linux environment with Bash.
No additional dependencies are required as everything is containerized.

Setup Instructions

Clone the Repository:
git clone <>
cd todo-app


Directory Structure:Ensure the project has the following structure:
backend -> Dockerfile,db.js,package.json,server.js,tests -> server.test.js
frontend -> index.html,script.js,style.css,package.json
db -> init.sql
docker-compase.yml
README.md

Run the Application:
docker-compose up --build


This builds and starts the backend, frontend, MySQL database, and phpMyAdmin.
The database is automatically initialized with the task table.


Access the Application:

Frontend: http://localhost:8080
phpMyAdmin: http://localhost:8081 (login with user: root, password: securepassword)
Backend API: http://localhost:3000 (for testing purposes)


Run Backend Tests:
cd backend
npm install
npm test



API Endpoints

POST /api/tasks: Create a new task.
Body: { "title": "string", "description": "string" }
Response: { "message": "Task added successfully", "id": number }


GET /api/tasks: Get the 5 most recent non-completed tasks.
Response: [{ "id": number, "title": "string", "description": "string", "completed": boolean, "created_at": "timestamp" }, ...]


POST /api/tasks/:id/done: Mark a task as completed.
Response: { "message": "Task marked as done" }



Database Schema
The task table is created automatically via db/init.sql:
CREATE TABLE IF NOT EXISTS task (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

Notes

The application uses a secure MySQL password (securepassword) for the root user.
The backend retries MySQL connections up to 5 times to handle startup delays.
The frontend is a single-page application (SPA) with vanilla JavaScript for simplicity.
Basic unit tests are included for the backend API using Jest.
The UI is styled with a clean, responsive design using the Poppins font and a purple color scheme.

Troubleshooting

MySQL Connection Issues: Ensure the db service is healthy (check logs with docker-compose logs db). The backend will retry connections automatically.
Frontend Not Loading Tasks: Verify the backend is running at http://localhost:3000/api/tasks and check browser console for errors.
Database Not Initialized: Confirm the db/init.sql file is mounted correctly in the db service.

#Setup Instructions (Windows)
1. Ensure Docker Desktop is installed and running.
2. Open VS Code and navigate to the project directory:
