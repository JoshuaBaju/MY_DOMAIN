document.addEventListener("DOMContentLoaded", function () {
    const taskInput = document.getElementById("task-input");
    const prioritySelect = document.getElementById("priority-select");
    const reminderTimeInput = document.getElementById("reminder-time");
    const addTaskBtn = document.getElementById("add-task-btn");
    const taskList = document.getElementById("task-list");
    const progressBar = document.getElementById("progress-bar");
    const progressText = document.getElementById("progress-text");
    const restartBtn = document.getElementById("restart-btn");
    const settingsBtn = document.getElementById("settings-btn");
    const settingsPopup = document.getElementById("settings-popup");
    const settingsClose = document.getElementById("settings-close");
    const ringtonePicker = document.getElementById("ringtone-picker");
    const alarmSound = document.getElementById("alarm-sound");
    const popup = document.getElementById("popup");
    const popupText = document.getElementById("popup-text");
    const extendTimeBtn = document.getElementById("extend-time-btn");
    
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    let timers = {}; // Store timers independently for each task

    let ringtone = localStorage.getItem("ringtone") || "";
    if (ringtone) alarmSound.src = ringtone;

    ringtonePicker.addEventListener("change", function (event) {
        const file = event.target.files[0];
        if (file) {
            const objectURL = URL.createObjectURL(file);
            alarmSound.src = objectURL;
            localStorage.setItem("ringtone", objectURL);
        }
    });

    settingsBtn.addEventListener("click", () => settingsPopup.style.display = "block");
    settingsClose.addEventListener("click", () => settingsPopup.style.display = "none");

    function updateProgress() {
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.completed).length;
        const percentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

        progressBar.value = percentage;
        progressText.textContent = percentage === 100 ? "All done! 🎉" : `Progress: ${percentage}%`;
    }

    function startTimer(index) {
        const task = tasks[index];
        const timerElement = document.getElementById(`timer-${index}`);
        
        if (!task.remainingTime) {
            task.remainingTime = task.reminderTime * 60; // Convert minutes to seconds
        }

        // If a timer already exists for this task, clear it
        if (timers[index]) clearInterval(timers[index]);

        timers[index] = setInterval(() => {
            if (task.remainingTime <= 0) {
                clearInterval(timers[index]);
                delete timers[index];
                alarmSound.play();
                showPopup(`${task.name} Reminder!`, index);
            } else {
                task.remainingTime--;
                timerElement.textContent = `${Math.floor(task.remainingTime / 60)}:${task.remainingTime % 60}`;
            }
        }, 1000);
    }

    function showPopup(message, index) {
        popupText.textContent = message;
        popup.style.display = "block";

        extendTimeBtn.onclick = function () {
            tasks[index].remainingTime += 300; // Extend by 5 minutes (adjustable)
            popup.style.display = "none";
            startTimer(index);
        };
    }

    function addTask() {
        const taskName = taskInput.value.trim();
        const priority = prioritySelect.value;
        const reminderTime = parseInt(reminderTimeInput.value);

        if (!taskName) return;

        const newTask = { name: taskName, priority, reminderTime, completed: false };
        tasks.push(newTask);
        updateProgress();
        displayTasks();
    }

    function displayTasks() {
        taskList.innerHTML = "";
        tasks.forEach((task, index) => {
            const listItem = document.createElement("li");
            listItem.classList.add("task");
            if (task.completed) listItem.classList.add("completed");

            listItem.innerHTML = `
                <span>${task.priority === "high" ? "🔥" : task.priority === "medium" ? "⚡" : "💡"} ${task.name}</span>
                <span id="timer-${index}">${task.reminderTime}:00</span>
            `;

            taskList.appendChild(listItem);
            if (!task.completed) startTimer(index);
        });

        updateProgress();
    }

    restartBtn.addEventListener("click", () => {
        tasks = [];
        Object.values(timers).forEach(clearInterval); // Stop all timers
        timers = {}; // Clear timers
        displayTasks();
    });

    addTaskBtn.addEventListener("click", addTask);
    displayTasks();
});
