let tasks = [];
let timers = {};
let selectedRingtone = null;
let activeTaskId = null; // Stores the task ID when alarm rings

// Add Task
function addTask() {
  let taskName = document.getElementById("task-input").value.trim();
  let priority = document.getElementById("priority-input").value;
  let reminderTime = document.getElementById("reminder-time").value; // Can be empty

  if (taskName === "") {
    alert("Please enter a task.");
    return;
  }

  let taskId = Date.now();
  let newTask = {
    id: taskId,
    name: taskName,
    priority: priority,
    reminderTime: reminderTime ? parseInt(reminderTime) * 60 : null,
    completed: false
  };

  tasks.push(newTask);
  renderTask(newTask);

  if (newTask.reminderTime) {
    startTimer(newTask);
  }

  updateProgress();
  document.getElementById("task-input").value = "";
  document.getElementById("reminder-time").value = "";
}

// Render Task
function renderTask(task) {
  let taskList = document.getElementById("task-list");
  let li = document.createElement("li");
  li.setAttribute("data-id", task.id);

  li.innerHTML = `
        <input type="checkbox" class="task-checkbox" onchange="toggleTask(${
          task.id
        })">
        <span class="task-name">${task.name} (${task.priority})</span>
        ${task.reminderTime ? `<span class="timer">0:00</span>` : ""}
        <button class="delete-btn" onclick="deleteTask(${task.id})">❌</button>
    `;

  li.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    undoTask(task.id);
  });

  taskList.appendChild(li);
}

// Start Timer
function startTimer(task) {
  if (!task.reminderTime) return;

  let taskElement = document.querySelector(`[data-id="${task.id}"]`);
  let timerDisplay = taskElement.querySelector(".timer");

  let endTime = Date.now() + task.reminderTime * 1000;

  timers[task.id] = setInterval(() => {
    let remainingTime = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
    let minutes = Math.floor(remainingTime / 60);
    let seconds = remainingTime % 60;

    timerDisplay.textContent = `${minutes}:${
      seconds < 10 ? "0" : ""
    }${seconds}`;

    if (remainingTime <= 0) {
      clearInterval(timers[task.id]);
      showAlarm(task.id);
    }
  }, 1000);
}

// Show Alarm Popup
function showAlarm(taskId) {
  let popup = document.getElementById("alarm-popup");
  popup.style.display = "block";

  // Store task ID globally
  activeTaskId = taskId;

  if (selectedRingtone) {
    let audio = new Audio(URL.createObjectURL(selectedRingtone));
    audio.play();
  }
}

// Stop Alarm
function stopAlarm() {
    document.getElementById("alarm-popup").style.display = "none";
    
    // Reset the active task ID
    activeTaskId = null;
}


function extend1() {
  extendTimerBy(1);
}
function extend2() {
  extendTimerBy(2);
}
function extend5() {
  extendTimerBy(5);
}
function extend10() {
  extendTimerBy(10);
}
function extend20() {
  extendTimerBy(20);
}

function extendTimerBy(minutes) {
    if (!activeTaskId) return; // Ensure a task is active

    let task = tasks.find((t) => t.id === activeTaskId);
    if (!task || task.reminderTime === null) return; // Ensure task exists & has a timer

    // Calculate remaining time based on current display
    let taskElement = document.querySelector(`[data-id="${task.id}"]`);
    let timerDisplay = taskElement.querySelector(".timer");

    if (!timerDisplay) return;

    let [min, sec] = timerDisplay.textContent.split(":").map(Number);
    let remainingTime = min * 60 + sec; // Convert to seconds

    // Add the extended time
    task.reminderTime = remainingTime + minutes * 60;

    // Restart the timer with the updated time
    startTimer(task);
}



// Toggle Task Completion
// Toggle Task Completion (Pauses or Resumes Timer)
function toggleTask(taskId) {
    let task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    task.completed = !task.completed;

    let taskElement = document.querySelector(`[data-id="${task.id}"]`);
    let checkbox = taskElement.querySelector(".task-checkbox");

    // ✅ Ensure checkbox reflects the completed state
    checkbox.checked = task.completed;

    // ✅ Apply strike-through if completed
    let taskNameElement = taskElement.querySelector(".task-name");
    if (task.completed) {
        taskNameElement.style.textDecoration = "line-through";
        clearInterval(timers[task.id]); // Pause timer
    } else {
        taskNameElement.style.textDecoration = "none";
        if (task.reminderTime) {
            startTimer(task); // Resume timer
        }
    }

    updateProgress();
}



// Undo Completed Task
function undoTask(taskId) {
  let task = tasks.find((t) => t.id === taskId);
  if (task.completed) {
    task.completed = false;
    let taskElement = document.querySelector(`[data-id="${task.id}"]`);
    taskElement.classList.remove("completed");
    updateProgress();
  }
}

// Delete Task
function deleteTask(taskId) {
  tasks = tasks.filter((task) => task.id !== taskId);
  document.querySelector(`[data-id="${taskId}"]`).remove();
  updateProgress();
}

// Update Progress Bar
function updateProgress() {
  let completedTasks = tasks.filter((task) => task.completed).length;
  let totalTasks = tasks.length;
  let progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  document.getElementById("progress-bar").value = progress;
  document.getElementById(
    "progress-text"
  ).textContent = `Progress: ${Math.round(progress)}%`;

  let motivationText = document.getElementById("motivation-text");
  if (progress === 100) {
    motivationText.textContent = "Great job! You completed all tasks! 🎉";
  } else {
    motivationText.textContent = "Let's get started!";
  }
}

function restartTasks() {
  // Clear all tasks and timers
  tasks = [];
  Object.keys(timers).forEach((taskId) => clearInterval(timers[taskId]));
  timers = {};

  // Remove all task elements from the DOM
  document.getElementById("task-list").innerHTML = "";

  // Reset progress bar
  document.getElementById("progress-bar").value = 0;
  document.getElementById("progress-text").textContent = "Progress: 0%";
  document.getElementById("motivation-text").textContent = "Let's get started!";

  // Reset input fields
  document.getElementById("task-input").value = "";
  document.getElementById("reminder-time").value = "";
  document.getElementById("priority-input").value = "medium"; // Default priority
}

// Open Settings
document.getElementById("settings-btn").addEventListener("click", function () {
  document.getElementById("settings-popup").style.display = "block";
});

// Close Settings
function closeSettings() {
  document.getElementById("settings-popup").style.display = "none";
}
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM fully loaded and parsed.");

  // ✅ Add Task Button (Fixed)
  let addTaskBtn = document.getElementById("add-task");
  if (addTaskBtn) {
    addTaskBtn.addEventListener("click", function () {
      console.log("Add Task button clicked.");
      addTask(); // Calls the addTask function
    });
  } else {
    console.error("Add Task button not found.");
  }

  // ✅ Restart Button
  let restartBtn = document.getElementById("restart-btn");
  if (restartBtn) {
    restartBtn.addEventListener("click", function () {
      console.log("Restart button clicked.");
      restartTasks();
    });
  } else {
    console.error("Restart button not found.");
  }

  // ✅ Settings Button (Open Settings)
  let settingsBtn = document.getElementById("settings-btn");
  if (settingsBtn) {
    settingsBtn.addEventListener("click", function () {
      console.log("Settings button clicked.");
      document.getElementById("settings-popup").style.display = "block";
    });
  } else {
    console.error("Settings button not found.");
  }

  // ✅ Close Settings Popup Button
  let closeSettingsBtn = document.querySelector("#settings-popup button");
  if (closeSettingsBtn) {
    closeSettingsBtn.addEventListener("click", function () {
      console.log("Close Settings button clicked.");
      closeSettings();
    });
  } else {
    console.error("Close Settings button not found.");
  }

  // ✅ Handle Ringtone Selection
  let ringtonePicker = document.getElementById("ringtone-picker");
  if (ringtonePicker) {
    ringtonePicker.addEventListener("change", function (event) {
      let file = event.target.files[0];
      if (file) {
        console.log("Ringtone selected:", file.name);
        selectedRingtone = file;
      }
    });
  } else {
    console.error("Ringtone picker not found.");
  }
});

// Select Ringtone
