// ==============================
// Utilidades
// ==============================
const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));

const formatDate = (iso) =>
  new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(new Date(iso));

// ==============================
// Estado
// ==============================
const STORAGE_KEY = 'todo-list-v1';
let tasks = load();

let currentFilter = 'pendentes'; // 'todas' | 'pendentes' | 'concluidas'
let sortBy = 'created_desc'; // 'created_desc' | 'created_asc' | 'prio_desc' | 'prio_asc'

// Estrutura da tarefa:
// { id, title, description, priority: 'alta'|'media'|'baixa', createdAt: ISO, done: bool }

// ==============================
// Inicialização
// ==============================
document.addEventListener('DOMContentLoaded', () => {
  bindForm();
  bindFilters();
  bindSorting();
  render();
});

// ==============================
// Persistência
// ==============================
function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}
function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

// ==============================
// Formulário
// ==============================
function bindForm() {
  const form = $('#taskForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = $('#title').value.trim();
    const description = $('#description').value.trim();
    const priority = $('#priority').value;

    if (!title) {
      $('#title').focus();
      return;
    }

    const newTask = {
      id: (crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()),
      title,
      description,
      priority, // 'alta' | 'media' | 'baixa'
      createdAt: new Date().toISOString(),
      done: false
    };
    tasks.unshift(newTask);
    save();

    form.reset();
    $('#title').focus();
    render();
  });
}

// ==============================
// Filtros
// ==============================
function bindFilters() {
  $$('.filters .chip').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.filters .chip').forEach(b => {
        b.classList.toggle('active', b === btn);
        b.setAttribute('aria-selected', b === btn ? 'true' : 'false');
      });
      currentFilter = btn.dataset.filter;
      render();
    });
  });
}

function applyFilter(list) {
  if (currentFilter === 'pendentes') return list.filter(t => !t.done);
  if (currentFilter === 'concluidas') return list.filter(t => t.done);
  return list;
}

// ==============================
// Ordenação
// ==============================
function bindSorting() {
  const sel = $('#sortBy');
  if (!sel) return; // caso o select não exista no HTML
  sel.addEventListener('change', (e) => {
    sortBy = e.target.value;
    render();
  });
}

function priorityRank(p) {
  // quanto maior o número, maior a prioridade
  const map = { alta: 3, media: 2, baixa: 1 };
  return map[p] || 0;
}

function applySort(list) {
  const copy = [...list];
  switch (sortBy) {
    case 'created_asc':
      return copy.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    case 'created_desc':
      return copy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    case 'prio_desc': // Alta → Baixa
      return copy.sort((a, b) => priorityRank(b.priority) - priorityRank(a.priority));
    case 'prio_asc': // Baixa → Alta
      return copy.sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority));
    default:
      return copy;
  }
}

// ==============================
// Renderização
// ==============================
function render() {
  const listEl = $('#taskList');
  listEl.innerHTML = '';

  const filtered = applyFilter(tasks);
  const ordered = applySort(filtered);

  if (ordered.length === 0) {
    $('#emptyState').style.display = 'block';
  } else {
    $('#emptyState').style.display = 'none';
  }

  ordered.forEach(task => {
    listEl.appendChild(renderItem(task));
  });

  updateCounters();
}

function updateCounters() {
  const total = tasks.length;
  const done = tasks.filter(t => t.done).length;
  const pending = total - done;

  $('#countTotal').textContent = total;
  $('#countDone').textContent = done;
  $('#countPending').textContent = pending;
}

function renderItem(task) {
  const li = document.createElement('li');
  li.className = `task ${task.done ? 'done' : ''}`;
  li.dataset.id = task.id;

  // Checkbox
  const checkbox = document.createElement('label');
  checkbox.className = 'checkbox';
  checkbox.innerHTML = `
    <input type="checkbox" ${task.done ? 'checked' : ''} aria-label="Marcar tarefa como ${task.done ? 'pendente' : 'concluída'}">
    <span class="custom"></span>
  `;

  // Conteúdo
  const content = document.createElement('div');
  content.className = 'content';

  const topline = document.createElement('div');
  topline.className = 'topline';

  const titleSpan = document.createElement('span');
  titleSpan.className = 'title';
  titleSpan.textContent = task.title;

  const badge = document.createElement('span');
  badge.className = `badge prio-${task.priority}`;
  const labelPrio =
    task.priority === 'alta' ? 'Alta' :
    task.priority === 'baixa' ? 'Baixa' : 'Média';
  badge.textContent = `Prioridade: ${labelPrio}`;

  topline.append(titleSpan, badge);

  const desc = document.createElement('p');
  desc.className = 'desc';
  desc.textContent = task.description || 'Sem descrição.';

  const meta = document.createElement('div');
  meta.className = 'meta';
  meta.innerHTML = `<span class="timestamp">Criada em ${formatDate(task.createdAt)}</span>`;

  content.append(topline, desc, meta);

  // Ações
  const actions = document.createElement('div');
  actions.className = 'actions';
  const btnEdit = document.createElement('button');
  btnEdit.className = 'btn ghost';
  btnEdit.textContent = 'Editar';

  const btnDelete = document.createElement('button');
  btnDelete.className = 'btn danger';
  btnDelete.textContent = 'Excluir';

  actions.append(btnEdit, btnDelete);

  // Monta LI
  li.append(checkbox, content, actions);

  // Eventos
  checkbox.querySelector('input').addEventListener('change', (e) => {
    toggleDone(task.id, e.target.checked);
  });
  btnDelete.addEventListener('click', () => {
    deleteTask(task.id);
  });
  btnEdit.addEventListener('click', () => {
    enterEditMode(li, task);
  });

  return li;
}

// ==============================
// Ações
// ==============================
function toggleDone(id, checked) {
  const i = tasks.findIndex(t => t.id === id);
  if (i >= 0) {
    tasks[i].done = !!checked;
    save();
    render();
  }
}

function deleteTask(id) {
  if (!confirm("Tem certeza que deseja excluir esta tarefa?")) return;
  tasks = tasks.filter(t => t.id !== id);
  save();
  render();
}

// ==============================
// Edição inline
// ==============================
function enterEditMode(li, task) {
  if (li.classList.contains('editing')) return;
  li.classList.add('editing');

  const content = li.querySelector('.content');
  const actions = li.querySelector('.actions');

  // Guarda conteúdo original
  const originalHTML = content.innerHTML;
  const originalActionsHTML = actions.innerHTML;

  // Construir campos de edição
  content.innerHTML = '';

  const titleInput = document.createElement('input');
  titleInput.type = 'text';
  titleInput.value = task.title;
  titleInput.placeholder = 'Título da tarefa';
  titleInput.required = true;

  const descArea = document.createElement('textarea');
  descArea.rows = 3;
  descArea.placeholder = 'Descrição';
  descArea.value = task.description || '';

  const prioSelect = document.createElement('select');
  prioSelect.innerHTML = `
    <option value="alta">Alta</option>
    <option value="media">Média</option>
    <option value="baixa">Baixa</option>
  `;
  prioSelect.value = task.priority;

  const editRow = document.createElement('div');
  editRow.className = 'edit-row';
  editRow.append(titleInput, prioSelect);

  const meta = document.createElement('div');
  meta.className = 'meta';
  meta.textContent = `Criada em ${formatDate(task.createdAt)}`;

  const editActions = document.createElement('div');
  editActions.className = 'edit-actions';
  const btnSave = document.createElement('button');
  btnSave.className = 'btn primary';
  btnSave.textContent = 'Salvar';
  const btnCancel = document.createElement('button');
  btnCancel.className = 'btn';
  btnCancel.textContent = 'Cancelar';

  editActions.append(btnSave, btnCancel);

  content.append(editRow, descArea, meta, editActions);

  // Ações de editar
  btnSave.addEventListener('click', () => {
    const newTitle = titleInput.value.trim();
    if (!newTitle) {
      titleInput.focus();
      return;
    }
    const newDesc = descArea.value.trim();
    const newPrio = prioSelect.value;

    const i = tasks.findIndex(t => t.id === task.id);
    if (i >= 0) {
      tasks[i].title = newTitle;
      tasks[i].description = newDesc;
      tasks[i].priority = newPrio;
      save();
      render();
    }
  });

  btnCancel.addEventListener('click', () => {
    // Restaurar visual original
    content.innerHTML = originalHTML;
    actions.innerHTML = originalActionsHTML;
    li.classList.remove('editing');

    // Reatachar eventos do item (já que reescrevemos HTML)
    rebindItem(li, task);
  });

  // Foco inicial
  setTimeout(() => titleInput.focus(), 0);
}

function rebindItem(li, task) {
  li.querySelector('.checkbox input').addEventListener('change', (e) => {
    toggleDone(task.id, e.target.checked);
  });
  li.querySelector('.btn.danger').addEventListener('click', () => {
    deleteTask(task.id);
  });
  li.querySelector('.btn.ghost').addEventListener('click', () => {
    enterEditMode(li, task);
  });
}
