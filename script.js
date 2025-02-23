let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

document.addEventListener("DOMContentLoaded", () => {
    updateTaskList();
});

function addTask() {
    let taskName = document.getElementById("task-name").value.trim();
    let priority = document.getElementById("priority").value;
    let timer = document.getElementById("timer").value;

    if (!taskName) {
        alert("Task name cannot be empty!");
        return;
    }

    let priorityIcons = { high: "🔥", medium: "⚡", low: "💡" };
    let task = {
        id: Date.now(),
        name: taskName,
        priority: priorityIcons[priority],
        completed: false,
        timer: timer ? parseInt(timer) * 60 : null,
        remainingTime: timer ? parseInt(timer) * 60 : null
    };

    tasks.push(task);
    saveTasks();
    updateTaskList();
    document.getElementById("task-name").value = "";
    document.getElementById("timer").value = "";

    if (task.timer) {
        startTimer(task.id);
    }
}

function toggleTask(taskId) {
    let task = tasks.find(t => t.id === taskId);
    task.completed = !task.completed;
    saveTasks();
    updateTaskList();
}

function updateTaskList() {
    tasks.sort((a, b) => {
        let priorityOrder = { "🔥": 1, "⚡": 2, "💡": 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority] || a.completed - b.completed;
    });

    let taskList = document.getElementById("task-list");
    taskList.innerHTML = "";

    tasks.forEach(task => {
        let li = document.createElement("li");
        li.className = `task ${task.completed ? "completed" : ""}`;
        li.innerHTML = `
            <span class="priority-icon">${task.priority}</span>
            <span>${task.name}</span>
            ${task.timer ? `<span class="timer" id="timer-${task.id}">${formatTime(task.remainingTime)}</span>` : ""}
            <input type="checkbox" ${task.completed ? "checked" : ""} onclick="toggleTask(${task.id})">
        `;
        taskList.appendChild(li);
    });

    updateProgress();
}

function updateProgress() {
    let completedTasks = tasks.filter(t => t.completed).length;
    let totalTasks = tasks.length;
    let percentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    document.getElementById("progress-text").innerText = `${percentage}%`;
    document.getElementById("progress-fill").style.width = `${percentage}%`;

    let motivationText = document.getElementById("motivation-text");
    if (percentage === 100) {
        motivationText.innerText = "🎉 All done! Take a break! 🎉";
        alert("✅ ALL TASKS COMPLETED! WELL DONE!");
    } else {
        motivationText.innerText = percentage >= 50 ? "You're halfway there! 🚀" : "Keep going! You got this! 💪";
    }
}

function startTimer(taskId) {
    let task = tasks.find(t => t.id === taskId);
    let timerElement = document.getElementById(`timer-${task.id}`);

    let interval = setInterval(() => {
        task.remainingTime--;
        saveTasks(); // Save remaining time in localStorage

        if (task.remainingTime <= 0) {
            clearInterval(interval);
            document.getElementById("alarm-sound").play();
            alert(`⏰ Reminder: "${task.name}" is due!`);
        } else {
            timerElement.innerText = formatTime(task.remainingTime);
        }
    }, 1000);
}

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function formatTime(seconds) {
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}
