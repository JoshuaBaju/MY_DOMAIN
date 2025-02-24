let tasks = [];
let ringtone;

function addTask() {
    let name = document.getElementById("task-name").value;
    let priority = document.getElementById("priority").value;
    let time = document.getElementById("reminder-time").value;
    if (!name || !time) return;

    let task = {
        id: Date.now(),
        name,
        priority,
        time: parseInt(time),
        completed: false,
        timer: setTimeout(() => showAlarm(task.id), time * 60000)
    };

    tasks.push(task);
    updateList();
}

function updateList() {
    let list = document.getElementById("task-list");
    list.innerHTML = "";

    tasks.sort((a, b) => b.priority.localeCompare(a.priority));

    tasks.forEach(task => {
        let li = document.createElement("li");
        li.innerHTML = `
            <input type="checkbox" ${task.completed ? "checked" : ""} onclick="toggleDone(${task.id})">
            <span class="${task.completed ? 'task-done' : ''}">${task.name} (${task.priority})</span>
            <span>${task.time} min</span>
        `;
        li.oncontextmenu = (e) => { e.preventDefault(); undoTask(task.id); };
        list.appendChild(li);
    });

    updateProgress();
}

function toggleDone(id) {
    let task = tasks.find(t => t.id === id);
    task.completed = !task.completed;
    updateList();
}

function undoTask(id) {
    let task = tasks.find(t => t.id === id);
    task.completed = false;
    alert("Task marked as undone!");
    updateList();
}

function showAlarm(id) {
    let popup = document.getElementById("alarm-popup");
    popup.style.display = "block";
    let audio = new Audio(ringtone);
    audio.play();
}

function closeAlarm() {
    document.getElementById("alarm-popup").style.display = "none";
}

function openSettings() {
    document.getElementById("settings-popup").style.display = "block";
}

function closeSettings() {
    document.getElementById("settings-popup").style.display = "none";
}

function restartApp() {
    tasks = [];
    updateList();
}
