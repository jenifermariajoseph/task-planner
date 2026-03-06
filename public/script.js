const API = "/api/tasks";
const taskList = document.getElementById("task-list");
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const timeInput = document.getElementById("time-input");
const sunImg = document.getElementById("sun-img");

// Sun images based on completion ratio
const SUN_HAPPY = "images/sun-happy.png"; // all done
const SUN_MEH = "images/sun-meh.png"; // none or some done

let tasks = [];

// Request notification permission
if ("Notification" in window) {
  if (Notification.permission !== "granted") {
    Notification.requestPermission();
  }
}

// Schedule a browser notification for a task's due time
function scheduleReminder(task) {
  if (!task.due_time || task.completed) return;

  const due = new Date(task.due_time);
  const now = new Date();
  const delay = due - now;

  console.log(`Reminder for "${task.title}" in ${Math.round(delay / 1000)}s`);

  if (delay > 0) {
    setTimeout(() => {
      if (Notification.permission === "granted") {
        new Notification("Task Reminder", {
          body: task.title,
        });
      }
    }, delay);
  }
}

// Fetch and render tasks on load
async function loadTasks() {
  try {
    const res = await fetch(API);
    tasks = await res.json();
    renderTasks();
    tasks.forEach(scheduleReminder);
  } catch (err) {
    console.error("Failed to load tasks:", err);
  }
}

// Render task list
function renderTasks() {
  taskList.innerHTML = "";

  if (tasks.length === 0) {
    taskList.innerHTML =
      '<li class="empty-state">No tasks yet — add one above!</li>';
    updateSun();
    return;
  }

  tasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = "task-item" + (task.completed ? " completed" : "");

    // Checkbox
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.checked = task.completed;
    checkbox.addEventListener("change", () => toggleTask(task.id));

    // Task title
    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.title;

    // Due time
    const time = document.createElement("span");
    time.className = "task-time";
    if (task.due_time) {
      time.textContent = formatTime(task.due_time);
    }

    // Delete button
    const del = document.createElement("button");
    del.className = "task-delete";
    del.textContent = "\u00d7";
    del.title = "Delete task";
    del.addEventListener("click", () => deleteTask(task.id));

    li.appendChild(checkbox);
    li.appendChild(text);
    li.appendChild(time);
    li.appendChild(del);
    taskList.appendChild(li);
  });

  updateSun();
}

// Format timestamp to "h:MM AM/PM"
function formatTime(timeStr) {
  if (!timeStr) return "";
  const date = new Date(timeStr);
  const hour = date.getHours();
  const min = String(date.getMinutes()).padStart(2, "0");
  const ampm = hour >= 12 ? "PM" : "AM";
  const display = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return display + ":" + min + " " + ampm;
}

// Update sun image based on completion
function updateSun() {
  const total = tasks.length;
  const done = tasks.filter((t) => t.completed).length;

  let newSrc;
  if (total === 0) {
    newSrc = SUN_MEH;
  } else if (done === total) {
    newSrc = SUN_HAPPY;
  } else {
    newSrc = SUN_MEH;
  }

  if (sunImg.src !== location.origin + "/" + newSrc) {
    sunImg.src = newSrc;
    sunImg.classList.add("bounce");
    setTimeout(() => sunImg.classList.remove("bounce"), 500);
  }
}

// Add a new task
taskForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = taskInput.value.trim();
  const due_time = timeInput.value || null;

  if (!title) return;

  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, due_time }),
    });
    const newTask = await res.json();
    tasks.unshift(newTask);
    scheduleReminder(newTask);
    renderTasks();
    taskInput.value = "";
    timeInput.value = "";
    taskInput.focus();
  } catch (err) {
    console.error("Failed to add task:", err);
  }
});

// Toggle task completion
async function toggleTask(id) {
  try {
    const res = await fetch(API + "/" + id, { method: "PATCH" });
    const updated = await res.json();
    tasks = tasks.map((t) => (t.id === id ? updated : t));
    renderTasks();
  } catch (err) {
    console.error("Failed to toggle task:", err);
  }
}

// Delete a task
async function deleteTask(id) {
  try {
    await fetch(API + "/" + id, { method: "DELETE" });
    tasks = tasks.filter((t) => t.id !== id);
    renderTasks();
  } catch (err) {
    console.error("Failed to delete task:", err);
  }
}

// Load on page ready
loadTasks();
