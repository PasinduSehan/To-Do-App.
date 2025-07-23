const form = document.getElementById('taskForm');
const taskList = document.getElementById('taskList');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = form.title.value;
  const description = form.description.value;
  try {
    const res = await fetch('http://localhost:3000/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description })
    });
    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }
    form.reset();
    await loadTasks();
  } catch (err) {
    console.error('Error adding task:', err);
    alert('Failed to add task. Please try again.');
  }
});

async function loadTasks() {
  try {
    const res = await fetch('http://localhost:3000/api/tasks');
    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }
    const tasks = await res.json();
    taskList.innerHTML = '';
    tasks.forEach(task => {
      const div = document.createElement('div');
      div.className = 'task-item';
      div.innerHTML = `
        <div>
          <h3>${task.title}</h3>
          <p>${task.description || ''}</p>
        </div>
        <button onclick="markDone(${task.id})">Done</button>
      `;
      taskList.appendChild(div);
    });
  } catch (err) {
    console.error('Error loading tasks:', err);
    alert('Failed to load tasks. Please try again.');
  }
}

async function markDone(id) {
  try {
    const res = await fetch(`http://localhost:3000/api/tasks/${id}/done`, { method: 'POST' });
    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }
    await loadTasks();
  } catch (err) {
    console.error('Error marking task as done:', err);
    alert('Failed to mark task as done. Please try again.');
  }
}

loadTasks();
