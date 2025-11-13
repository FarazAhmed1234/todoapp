// Simple Todo app with timestamps, filters, edit, delete, toggle complete
const STORAGE_KEY = 'simple_todo_v2';

const newTodo = document.getElementById('newTodo');
const addBtn = document.getElementById('addBtn');
const listEl = document.getElementById('todoList');
const countEl = document.getElementById('count');
const emptyState = document.getElementById('emptyState');
const clearCompletedBtn = document.getElementById('clearCompleted');
const filters = document.querySelectorAll('.filters button');

let todos = load();
let filter = 'all';

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load todos', e);
    return [];
  }
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleString();
}

function render() {
  listEl.innerHTML = '';
  const visible = todos.filter(t => {
    if (filter === 'all') return true;
    if (filter === 'active') return !t.completed;
    return t.completed;
  });

  emptyState.style.display = visible.length === 0 ? 'block' : 'none';

  visible.forEach(t => {
    const item = document.createElement('div');
    item.className = 'todo' + (t.completed ? ' completed' : '');
    item.dataset.id = t.id;

    const topRow = document.createElement('div');
    topRow.className = 'todo-top';

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = !!t.completed;
    cb.addEventListener('change', () => toggle(t.id));

    const label = document.createElement('div');
    label.className = 'label';
    label.textContent = t.text;
    label.title = 'Double-click to edit';
    label.tabIndex = 0;
    label.addEventListener('dblclick', () => startEdit(t.id, label));
    label.addEventListener('keydown', e => {
      if (e.key === 'Enter') startEdit(t.id, label);
    });

    const actions = document.createElement('div');
    actions.className = 'actions';
    const delBtn = document.createElement('button');
    delBtn.textContent = 'Delete';
    delBtn.style.background = 'transparent';
    delBtn.style.border = 'none';
    delBtn.style.cursor = 'pointer';
    delBtn.addEventListener('click', () => remove(t.id));

    actions.appendChild(delBtn);
    topRow.appendChild(cb);
    topRow.appendChild(label);
    topRow.appendChild(actions);

    const timeEl = document.createElement('div');
    timeEl.className = 'meta';
    timeEl.textContent = 'Added: ' + formatTime(t.created);

    item.appendChild(topRow);
    item.appendChild(timeEl);
    listEl.appendChild(item);
  });

  countEl.textContent = `${todos.filter(t => !t.completed).length} active • ${todos.length} total`;
  save();
}

function add(text) {
  const trimmed = (text || '').trim();
  if (!trimmed) return;
  todos.unshift({ id: uid(), text: trimmed, completed: false, created: Date.now() });
  newTodo.value = '';
  render();
}

function toggle(id) {
  todos = todos.map(t => (t.id === id ? { ...t, completed: !t.completed } : t));
  render();
}

function remove(id) {
  todos = todos.filter(t => t.id !== id);
  render();
}

function clearCompleted() {
  todos = todos.filter(t => !t.completed);
  render();
}

function startEdit(id, labelEl) {
  const t = todos.find(x => x.id === id);
  if (!t) return;
  const input = document.createElement('input');
  input.type = 'text';
  input.value = t.text;
  input.style.width = '100%';
  labelEl.replaceWith(input);
  input.focus();
  input.select();

  function finish(saveEdit) {
    if (saveEdit) {
      const v = input.value.trim();
      if (v) t.text = v;
      else remove(id);
    }
    render();
  }

  input.addEventListener('blur', () => finish(true));
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') finish(true);
    if (e.key === 'Escape') finish(false);
  });
}

// Events
addBtn.addEventListener('click', () => add(newTodo.value));
newTodo.addEventListener('keydown', e => {
  if (e.key === 'Enter') add(newTodo.value);
});
clearCompletedBtn.addEventListener('click', clearCompleted);
filters.forEach(b =>
  b.addEventListener('click', () => {
    filters.forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    filter = b.dataset.filter;
    render();
  })
);

// Initial render
render();
