const url = 'http://localhost:5173/api';
const todoTemplate = document.querySelector('.todo-template');
const todoItem = todoTemplate.content.querySelector('.todo-container');
const todoContainer = document.querySelector('.todos-container');
const delay = ms => new Promise(res => setTimeout(res, ms));

function createTodoElement({id, text, completed}) {
  const clonedTodoItem = todoItem.cloneNode(true);
  const todoText = clonedTodoItem.querySelector('.todo-text');
  todoText.textContent = text;
  const todoCheckbox = clonedTodoItem.querySelector('.todo-checkbox');
  todoCheckbox.checked = completed;
  const editInput = clonedTodoItem.querySelector('.edit-input');
  editInput.value = text;
  editInput.style.display = 'none';
  clonedTodoItem.id = id

  return clonedTodoItem
}

function renderTodos(data) {
  todoContainer.innerHTML = ''
  const todoElements = data.map(todo => {
    return createTodoElement({id: todo._id, text: todo.text, completed: todo.completed})
  });
  todoElements.forEach((todoElement) => {
    todoContainer.appendChild(todoElement)
  })
  return todoElements
}

async function fetchTodos() {
  await delay(500);
  const response = await fetch(url + '/todos', {
    method: 'GET',
    credentials: 'include',
    headers: {'Accept': 'application/json'}
  });
  return await response.json()
}

async function patchTodo(id, payload) {
  const response = await fetch(url + '/todos/' + String(id), {
    method: 'PATCH',
    credentials: 'include',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(payload)
  });
  return await response.json()
}

async function deleteTodo(id){
  const response = await fetch(url + '/todos/' + String(id), {
    method: 'DELETE',
    credentials: 'include',
  });
  return await response.json()
}

async function createTodo(payload){
  const response = await fetch(url + '/todos/', {
    method: 'POST',
    credentials: 'include',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(payload)
  });
  return await response.json()
}

function initCreateForm (){
  const creationForm = document.querySelector('.creation-form')
  const input = creationForm.querySelector('.todo-create__input')

  creationForm.addEventListener('submit', async (event) => {
    event.preventDefault()
    const postTodoMutation = await createTodo({text:input.value})
    const newTodo = postTodoMutation.result
    const createdTodoElement = createTodoElement({id:newTodo._id, text:newTodo.text, completed: newTodo.completed})
    todoContainer.appendChild(createdTodoElement)
    hydrateTodoElement(createdTodoElement)
  })
}

function hydrateTodoElement(todoItem) {
  const checkbox = todoItem.querySelector('.todo-checkbox')
  const inputEdit = todoItem.querySelector('.edit-input');
  const textElement = todoItem.querySelector('.todo-text');
  const deleteButton = todoItem.querySelector('.todo-delete')
  const editButton = todoItem.querySelector('.todo-editor')

  checkbox.addEventListener('change', (event) =>
    patchTodo(todoItem.id, {completed: event.target.checked})
  );

  editButton.addEventListener('click', async () => {
    if (inputEdit.style.display === 'none') {
      inputEdit.style.display = 'block';
      inputEdit.focus();
      textElement.style.display = 'none';
      return
    }

    if (inputEdit.value === '') {
      alert('Поле не должно быть пустым.');
      return
    }

    inputEdit.disabled = true

    const patchTodoMutation = await patchTodo(todoItem.id, {text: inputEdit.value})

    inputEdit.style.display = 'none';
    textElement.style.display = 'block';
    textElement.textContent = patchTodoMutation.result.text;

    inputEdit.disabled = false
  })

  deleteButton.addEventListener('click', async () => {
    deleteButton.disabled = true
    await deleteTodo(todoItem.id)
    todoItem.remove()
  })
}

async function init() {
  const todosQuery = await fetchTodos()

  renderTodos(todosQuery.result).forEach(hydrateTodoElement)
  initCreateForm()
}
document.addEventListener("DOMContentLoaded", init)





