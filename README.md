# Daily Planner

A full-stack task management web app with time-based scheduling, email reminders, and a friendly animated UI.

## Features

- Create, complete, and delete tasks
- Time-based scheduling with due times
- Dual notification system — browser alerts + automated email reminders
- Interactive sun buddy that reacts to your task completion progress
- Responsive, whimsical design

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express
- **Database:** PostgreSQL
- **Email:** Nodemailer with Gmail SMTP
- **Scheduling:** Node-Cron
- **Deployment:** Docker & Docker Compose

## Screenshot
<img width="1440" height="820" alt="Screenshot 2026-03-06 at 8 13 06 AM" src="https://github.com/user-attachments/assets/6ad5d9e5-5193-46cc-8111-16fe939a5971" />


## Getting Started

1. Clone the repo
   ```bash
   git clone https://github.com/jenifermariajoseph/task-planner.git
   cd task-planner
   ```

2. Set up environment variables — create a `.env` file:
   ```
   PORT=3000
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_NAME=daily_planner
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

3. Run with Docker:
   ```bash
   docker-compose up
   ```

   Or run locally:
   ```bash
   npm install
   node index.js
   ```

4. Open [http://localhost:3000](http://localhost:3000)
