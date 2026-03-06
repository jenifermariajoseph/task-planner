require("dotenv").config();
const express = require("express");
const pool = require("./db");
const cron = require("node-cron");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static("public"));

// Email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.get("/api/tasks", async (req, res) => {
  const result = await pool.query("SELECT * FROM tasks ORDER BY id DESC");
  res.json(result.rows);
});

app.post("/api/tasks", async (req, res) => {
  const { title, due_time } = req.body;
  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  let timestamp = null;
  if (due_time) {
    const [hours, minutes] = due_time.split(":");
    timestamp = new Date();
    timestamp.setHours(parseInt(hours, 10));
    timestamp.setMinutes(parseInt(minutes, 10));
    timestamp.setSeconds(0);
    timestamp.setMilliseconds(0);
  }

  try {
    const result = await pool.query(
      "INSERT INTO tasks (title, due_time) VALUES ($1, $2) RETURNING *",
      [title, timestamp]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle task completion
app.patch("/api/tasks/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "UPDATE tasks SET completed = NOT completed WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a task
app.delete("/api/tasks/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM tasks WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cron job: check for due tasks every minute and send email reminders
cron.schedule("* * * * *", async () => {
  console.log("Checking for due tasks...");

  try {
    const result = await pool.query(
      "SELECT * FROM tasks WHERE completed = false AND email_sent = false AND due_time <= NOW()"
    );

    for (const task of result.rows) {
      // Mark as sent FIRST to prevent duplicates
      await pool.query(
        "UPDATE tasks SET email_sent = true WHERE id = $1",
        [task.id]
      );

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: "Task Reminder",
        text: `Reminder: ${task.title}`,
      });

      console.log("Email sent for:", task.title);
    }
  } catch (err) {
    console.error("Cron error:", err.message);
  }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));