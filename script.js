const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const emptyState = document.getElementById('emptyState');
const statsText = document.getElementById('statsText');
const dateDisplay = document.getElementById('dateDisplay');
const clearCompletedBtn = document.getElementById('clearCompleted');
const filterBtns = document.querySelectorAll('.filter-btn');

let todos = JSON.parse(localStorage.getItem('todos') || '[]');
let currentFilter = 'all';

function showDate() {
    const now = new Date();
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${weekdays[now.getDay()]}`;
    dateDisplay.textContent = dateStr;
}

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function addTodo() {
    const text = todoInput.value.trim();
    if (!text) {
        todoInput.focus();
        return;
    }
    todos.unshift({
        id: Date.now(),
        text,
        completed: false,
        createdAt: new Date().toISOString()
    });
    todoInput.value = '';
    saveTodos();
    renderTodos();
    todoInput.focus();
}

function deleteTodo(id) {
    todos = todos.filter(t => t.id !== id);
    saveTodos();
    renderTodos();
}

function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        renderTodos();
    }
}

function editTodo(id, newText) {
    const todo = todos.find(t => t.id === id);
    if (todo && newText.trim()) {
        todo.text = newText.trim();
        saveTodos();
        renderTodos();
    } else if (todo && !newText.trim()) {
        deleteTodo(id);
    }
}

function clearCompleted() {
    const completedCount = todos.filter(t => t.completed).length;
    if (completedCount === 0) return;
    if (confirm(`确定要清除 ${completedCount} 项已完成的待办事项吗？`)) {
        todos = todos.filter(t => !t.completed);
        saveTodos();
        renderTodos();
    }
}

function getFilteredTodos() {
    if (currentFilter === 'active') return todos.filter(t => !t.completed);
    if (currentFilter === 'completed') return todos.filter(t => t.completed);
    return todos;
}

function renderTodos() {
    const filtered = getFilteredTodos();
    todoList.innerHTML = '';

    if (filtered.length === 0) {
        emptyState.classList.add('show');
        if (todos.length === 0) {
            emptyState.querySelector('p').textContent = '暂无待办事项，开始添加吧！';
        } else if (currentFilter === 'active') {
            emptyState.querySelector('p').textContent = '太棒了，所有任务已完成！';
        } else {
            emptyState.querySelector('p').textContent = '还没有完成的任务';
        }
    } else {
        emptyState.classList.remove('show');
        filtered.forEach(todo => {
            const li = document.createElement('li');
            li.className = 'todo-item' + (todo.completed ? ' completed' : '');
            li.dataset.id = todo.id;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'todo-checkbox';
            checkbox.checked = todo.completed;
            checkbox.addEventListener('change', () => toggleTodo(todo.id));

            const span = document.createElement('span');
            span.className = 'todo-text';
            span.textContent = todo.text;
            span.title = '双击编辑';
            span.addEventListener('dblclick', () => startEdit(span, todo.id));

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.innerHTML = '✕';
            deleteBtn.title = '删除';
            deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

            li.appendChild(checkbox);
            li.appendChild(span);
            li.appendChild(deleteBtn);
            todoList.appendChild(li);
        });
    }

    updateStats();
}

function startEdit(span, id) {
    const input = document.createElement('input');
    input.type = 'text';
    input.value = span.textContent;
    input.className = 'todo-text editing';
    input.maxLength = 100;
    span.replaceWith(input);
    input.focus();
    input.select();

    const finish = () => {
        editTodo(id, input.value);
    };
    input.addEventListener('blur', finish);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') input.blur();
        if (e.key === 'Escape') {
            input.value = span.textContent;
            renderTodos();
        }
    });
}

function updateStats() {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    statsText.textContent = `共 ${total} 项，已完成 ${completed} 项`;
}

addBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addTodo();
});

clearCompletedBtn.addEventListener('click', clearCompleted);

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTodos();
    });
});

showDate();
renderTodos();
