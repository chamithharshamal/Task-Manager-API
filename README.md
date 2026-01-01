# Synapse - Task Management System
A high-performance productivity engine built with Spring Boot and React, featuring real-time collaboration and "Cyber Emerald" aesthetics.
Features

Create, read, update, and delete (CRUD) operations for tasks.
MariaDB 10.4.28 database integration via Spring Data JPA.
Configured to run with XAMPP on localhost:3307.
Test endpoint to verify database connectivity.

Prerequisites

Java: JDK 17 or higher
Maven: 3.8.x or higher
XAMPP: With MariaDB 10.4.28 (configured for port 3307)
Git: For cloning the repository
Postman or cURL: For testing API endpoints

Setup Instructions
1. Clone the Repository
   git clone https://github.com/your-username/Task-Manager-API.git
   cd Task-Manager-API

2. Configure MariaDB in XAMPP

Install XAMPP from apachefriends.org.
Start MySQL and Apache in XAMPP Control Panel.
Verify MariaDB is running on port 3307:
Edit C:\xampp\mysql\bin\my.ini:[mysqld]
port=3307
[client]
port=3307


Restart MySQL in XAMPP.


Create the database task_manager_db:
Open http://localhost/phpmyadmin.
Log in with root and no password (or your secure password).
Create a database named task_manager_db.


Configure phpMyAdmin:
Edit C:\xampp\phpMyAdmin\config.inc.php:$cfg['Servers'][$i]['host'] = 'localhost';
$cfg['Servers'][$i]['port'] = '3307';
$cfg['Servers'][$i]['user'] = 'root';
$cfg['Servers'][$i]['password'] = '';


Restart Apache.



3. Configure the Application

Ensure src/main/resources/application.yml is set up:spring:
datasource:
url: ${DB_URL:jdbc:mariadb://localhost:3307/task_manager_db}
username: ${DB_USERNAME:root}
password: ${DB_PASSWORD:}
driver-class-name: org.mariadb.jdbc.Driver
jpa:
hibernate:
ddl-auto: update
open-in-view: false


Set environment variables (optional for production):export DB_URL=jdbc:mariadb://localhost:3307/task_manager_db
export DB_USERNAME=root
export DB_PASSWORD=



4. Build and Run

Build the project:mvn clean install


Run the application:mvn spring-boot:run


The API will be available at http://localhost:8080.

5. Test the API

Test the database connection:curl http://localhost:8080/check-db-connection

Expected output: Connected to: task_manager_db
Use Postman or cURL to test other endpoints (e.g., /tasks for CRUD operations, if implemented).

Project Structure
Task-Manager-API/
├── src/
│   ├── main/
│   │   ├── java/com/example/
│   │   │   ├── controller/
│   │   │   │   └── DatabaseCheckController.java
│   │   │   └── TaskManagerApiApplication.java
│   │   └── resources/
│   │       └── application.yml
├── pom.xml
├── .gitignore
└── README.md

Dependencies

Spring Boot 3.5.3
Spring Data JPA
MariaDB JDBC Driver 3.3.3
Hibernate 6.6.18

Security Notes

The default root password is empty for local development. Before deploying to production:
Set a secure password:ALTER USER 'root'@'localhost' IDENTIFIED BY 'yourSecurePassword';
FLUSH PRIVILEGES;


Update application.yml and config.inc.php with the new password.


Use environment variables for sensitive data in production.

Troubleshooting

MariaDB Connection Issues:
Ensure XAMPP’s MySQL is running on port 3307.
Check C:\xampp\mysql\data\*.err for errors.


Spring Boot Errors:
Verify application.yml settings.
Check logs for details.


phpMyAdmin Errors:
Confirm config.inc.php uses port 3307.



Contributing

Fork the repository.
Create a feature branch (git checkout -b feature-name).
Commit changes (git commit -m "Add feature").
Push to the branch (git push origin feature-name).
Open a Pull Request.

License
This project is licensed under the MIT License.