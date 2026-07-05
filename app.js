const pendingCount = document.querySelector('#pending');
const doneCount = document.querySelector('#done');
const themeToggle = document.querySelector('#theme-toggle');
const themeIcon = document.querySelector('#theme-icon');
const themeMode = document.querySelector('#theme-mode');
const taskInput = document.querySelector('#task-input');
const taskList = document.querySelector('#taskList');
const categories = document.querySelector('#categories');
const addTaskBtn = document.querySelector('#add-task-btn');
const taskFilter = document.querySelector('.task-filter');
const searchInput = document.querySelector('#search-input');
const filterBtn = document.querySelectorAll('.filter-btn');
const clearAllBtn = document.querySelector('#clear-all-btn');
const emptyState = document.querySelector('#empty-state');
const bubbleBtn = document.querySelector('#bubble-btn');
const captureBtn = document.querySelector('#capture-btn');
const grandparent = document.querySelector('#grandparent');
const parent = document.querySelector('#parent');
const childBtn = document.querySelector('#child-btn');
const epLog = document.querySelector('#ep-log');

let tasks = [];
let currentFilter = 'all';
let searchQuery = '';
let taskCounter = 0;

const VALID_CATEGORIES = new Set(['work', 'personal', 'entertainment', 'study', 'other']);

const CATEGORY_COLORS = {
  work: 'cat-work',
  personal: 'cat-personal',
  entertainment: 'cat-entertainment',
  study: 'cat-study',
  other: 'cat-other'
};



function createTaskCard(task) {
  const frag = document.createDocumentFragment();
  const card = document.createElement('div');
  // Build the card off-DOM first so the browser does one paint when the fragment is appended.
  card.className = 'task-card';
  card.setAttribute('data-id', task.id);
  card.setAttribute('data-status', task.status);
  card.setAttribute('data-category', task.category);

  card.innerHTML = `
    <div class="task-check" title="Toggle complete">✓</div>
    <div class="task-body">
      <div class="task-title">${escapeHtml(task.title)}</div>
      <input class="task-edit-input" type="text" value="${escapeHtml(task.title)}" maxlength="80">
      <div class="task-meta">
        <span class="task-id">#${task.id}</span>
        <span class="cat-badge ${CATEGORY_COLORS[task.category] || 'cat-other'}">${task.category}</span>
      </div>
    </div>
    <div class="task-actions">
      <button type="button" class="task-btn edit" data-action="edit"><i class="ri-pencil-line"></i> Edit</button>
      <button type="button" class="task-btn save" data-action="save"><i class="ri-check-line"></i>Save</button>
      <button type="button" class="task-btn done" data-action="complete"><i class="ri-check-line"></i> Done</button>
      <button type="button" class="task-btn delete" data-action="delete"><i class="ri-delete-bin-line"></i> Del</button>
    </div>
  `;

  frag.appendChild(card);
  return frag;
}


function addTask() {
  const taskProp = taskInput.value.trim();
  const taskAttr = taskInput.getAttribute('value') ?? '(none)';

  // `value` reads the live input property, while `getAttribute('value')` reads the original HTML attribute. User edits update the property, but they do not rewrite the attribute automatically.

  if (!taskProp) {
    taskInput.focus();
    taskInput.style.borderColor = 'var(--accent-danger)';
    setTimeout(() => taskInput.style.borderColor = '', 800);
    return;
  }

  taskCounter++;
  const task = {
    id: `T${String(taskCounter).padStart(3,'0')}`,
    title: taskProp,
    category: categories.value,
    status: 'pending'
  };
  
  tasks.unshift(task);
  saveToStorage();
  renderTasks();

  taskInput.value = '';
  taskInput.focus();
  updateCounters();
}


function renderTasks() {
  const q = searchQuery.toLowerCase();

  const filtered = tasks.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(q);
    if (!matchSearch) return false;
    if (currentFilter === 'all') return true;
    if (currentFilter === 'completed') return t.status === 'completed';
    return t.category === currentFilter;
  });

  const frag = document.createDocumentFragment();
  const hasTasks = filtered.length > 0;

  if (!hasTasks) {
    const msg = document.createElement('div');
    msg.className = 'empty-state';
    msg.innerHTML = `<span class="clipboard">🔍</span>${
      searchQuery ? `No tasks match "<strong>${escapeHtml(searchQuery)}</strong>"` : 'No tasks here'
    }`;
    emptyState.replaceChildren(msg);
    emptyState.hidden = false;
  } else {
    filtered.forEach(task => {
      frag.appendChild(createTaskCard(task));
    });
    emptyState.hidden = true;
  }

  // replaceChildren() swaps the current subtree in one step, which is easier for the browser to reconcile than mutating the list one node at a time.
  taskList.replaceChildren(frag);
  updateCounters();
}


taskList.addEventListener('click', function(e) {
  // One listener on the parent container is event delegation: clicks bubble up from buttons inside each card.
  // That avoids attaching a separate handler to every card and still works after re-rendering the list.
  const btn = e.target.closest('[data-action]');
  const check = e.target.closest('.task-check');
  const card = e.target.closest('.task-card');

  if (!card) return;

  const id = card.getAttribute('data-id');
  const taskIndex = tasks.findIndex(t => t.id === id);
  if (taskIndex === -1) return;

  if (check) {
    toggleComplete(card, taskIndex);
    return;
  }
  if (!btn) return;

  const action = btn.getAttribute('data-action');

  switch (action) {
    case 'edit': startEdit(card); break;
    case 'save': saveEdit(card, taskIndex); break;
    case 'complete': toggleComplete(card, taskIndex); break;
    case 'delete': deleteTask(card, taskIndex); break;
  }
});


function startEdit(card) {
  card.classList.add('editing');
  const inp = card.querySelector('.task-edit-input');
  inp.focus();
  inp.select();
  inp.onkeydown = (e) => { if (e.key === 'Enter') card.querySelector('[data-action="save"]').click(); };
}



function saveEdit(card, idx) {
  const inp = card.querySelector('.task-edit-input');
  const newVal = inp.value.trim();
  if (!newVal) return;

  tasks[idx].title = newVal;
  card.classList.remove('editing');
  saveToStorage();
  renderTasks();
  updateCounters();
}


function toggleComplete(card, idx) {
  const current = tasks[idx].status;
  const next = current === 'completed' ? 'pending' : 'completed';
  tasks[idx].status = next;

  // `data-*` attributes store state in the markup where CSS and selectors can read it without extra JS state.
  card.setAttribute('data-status', next);
  saveToStorage();
  renderTasks();
  updateCounters();
}

function deleteTask(card, idx) {
  card.style.transition = 'opacity .2s, transform .2s';
  card.style.opacity = '0';
  card.style.transform = 'translateX(20px)';
  setTimeout(() => {
    tasks.splice(idx, 1);
    saveToStorage();
    renderTasks();
    updateCounters();
  }, 200);
}


function clearAllTasks() {
  tasks = [];
  saveToStorage();
  renderTasks();
}


function updateCounters() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const pending = total - completed;
  pendingCount.textContent = `${pending} pending`;
  doneCount.textContent = `${completed} done`;
}

addTaskBtn.addEventListener('click', addTask);


taskInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addTask();
});


searchInput.addEventListener('input', (e) => {
  searchQuery = e.target.value;
  renderTasks();
});


taskFilter.addEventListener('click', (e) => {
  const btn = e.target.closest('.filter-btn');
  if (!btn) return;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentFilter = btn.dataset.filter;
  renderTasks();
});

clearAllBtn.addEventListener('click', () => {
  if (tasks.length && confirm('Clear all tasks?')) clearAllTasks();
});


themeToggle.addEventListener('click', () => {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';

  // A custom `data-theme` attribute lets CSS switch the page styling without hard-coding theme logic into styles.
  // localStorage keeps the preference after reloads because the DOM itself is rebuilt on every navigation.
  html.setAttribute('data-theme', next);
  themeIcon.textContent = next === 'dark' ? '☀️' : '🌙';
  themeMode.textContent = next === 'dark' ? 'Light' : 'Dark';

  localStorage.setItem('taskflow-theme', next);
});


let propMode = 'bubble'; 
let gpListener, pListener, chListener;

function flashEl(el) {
  el.classList.add('flash');
  setTimeout(() => el.classList.remove('flash'), 400);
}

function logEntry(step, nodeClass, nodeLabel, phase) {
  return `<div class="log-entry">
    <span class="log-step">${step}.</span>
    <span class="log-node ${nodeClass}">${nodeLabel}</span>
    <span style="color:var(--muted-shade)">→ fired (${phase} phase)</span>
  </div>`;
}


function attachPropListeners() {
  const useCapture = (propMode === 'capture');

  gpListener = function(e) {
    flashEl(grandparent);
  };
  pListener = function(e) {
    flashEl(parent);
  };
  chListener = function(e) {
    flashEl(childBtn);
    // stopPropagation() cuts off the remaining bubbling phase so the demo can isolate the current flow order.
    e.stopPropagation();
    let order;
    if (propMode === 'bubble') {
      order = [
        logEntry(1, 'ch', 'Child', 'bubble'),
        logEntry(2, 'p', 'Parent', 'bubble'),
        logEntry(3, 'gp', 'Grandparent', 'bubble'),
      ];
    } else {
      // Capturing runs from the root down toward the target before the target's own listener fires.
      order = [
        logEntry(1, 'gp', 'Grandparent', 'capture'),
        logEntry(2, 'p', 'Parent', 'capture'),
        logEntry(3, 'ch', 'Child', 'capture'),
      ];
    }
    epLog.innerHTML = order.join('');

    if (propMode === 'bubble') {
      setTimeout(() => flashEl(parent), 100);
      setTimeout(() => flashEl(grandparent), 200);
    }
  };

  grandparent.addEventListener('click', gpListener, useCapture);
  parent.addEventListener('click', pListener, useCapture);
  childBtn.addEventListener('click', chListener, useCapture);
}

function detachPropListeners() {
  ['bubble','capture'].forEach(cap => {
    const uc = cap === 'capture';
    if (gpListener) grandparent.removeEventListener('click', gpListener, uc);
    if (pListener) parent.removeEventListener('click', pListener, uc);
    if (chListener) childBtn.removeEventListener('click', chListener, uc);
  });
}


function switchPropMode(mode) {
  detachPropListeners();
  propMode = mode;
  attachPropListeners();
  epLog.innerHTML = `<span class="log-placeholder">Mode: <strong>${mode.toUpperCase()}</strong> — click the button to see the firing order</span>`;
}

bubbleBtn.addEventListener('click', () => {
  bubbleBtn.classList.add('active');
  captureBtn.classList.remove('active');
  switchPropMode('bubble');
});
captureBtn.addEventListener('click', () => {
  captureBtn.classList.add('active');
  bubbleBtn.classList.remove('active');
  switchPropMode('capture');
});

attachPropListeners();


function saveToStorage() {
  try {
    localStorage.setItem('taskflow-tasks', JSON.stringify(tasks));
    localStorage.setItem('taskflow-counter', String(taskCounter));
  } catch(e) {}
}


function loadFromStorage() {
  try {
    const saved = localStorage.getItem('taskflow-tasks');
    if (saved) {
      tasks = JSON.parse(saved).map(task => ({
        ...task,
        category: VALID_CATEGORIES.has(task.category) ? task.category : 'other'
      }));
      taskCounter = parseInt(localStorage.getItem('taskflow-counter') || '0', 10);
    }
    const theme = localStorage.getItem('taskflow-theme');
    if (theme) {
      // Load the saved theme from localStorage so the user's previous choice is restored.
      document.documentElement.setAttribute('data-theme', theme);
      themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
      themeMode.textContent = theme === 'dark' ? 'Light' : 'Dark';
    }
  } catch(e) {}
}

function escapeHtml(str) {
  // Creating a text node forces the browser to treat user input as text, not HTML, so injected tags are not parsed.
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}


loadFromStorage();
renderTasks();

if (tasks.length === 0) {
  const seeds = [];
  seeds.forEach(s => {
    taskCounter++;
    tasks.unshift({ id: `T${String(taskCounter).padStart(3,'0')}`, title: s.title, category: s.category, status: 'pending' });
  });
  saveToStorage();
  renderTasks();
}