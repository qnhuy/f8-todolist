const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const addTaskBtn = $('.add-btn')
const addTaskModal = $('#addTaskModal')
const addTaskModalOverlay = $('.modal-overlay')
const modalCloseBtn = $('.modal-close')
const modalCancelBtn = $('.modal-cancel')
const modalSubmitBtn = $('.modal-submit')
const addTaskForm = $('#todo-app-form')
const taskGrid = $('.task-grid')

let tasks = []

// handle show modal
addTaskBtn.onclick = showModal

// show modal and handle other actions
function showModal() {
    addTaskModal.classList.add('show')
    setTimeout(() => addTaskModal.querySelector('#taskTitle').focus(), 30)

    // handle hide modal
    const closingElements = [modalCloseBtn, modalCancelBtn, addTaskModalOverlay]
    closingElements.forEach(element => element.onclick = (e) => hideModal(e, element))

    // handle submit task
    addTaskForm.onsubmit = (e) => handleAddTask(e)

    // handle keyboard action
    document.onkeyup = (e) => {
        if (e.key === 'Escape') {
            hideModal(e)
        } else if (e.key === 'Enter') {
            addTaskForm.onsubmit(e)
        }
    }
}

// hide modal
function hideModal(e = new KeyboardEvent('keyup'), closingTarget = modalCloseBtn) {
    e.stopPropagation()
    if (e instanceof KeyboardEvent) {
        addTaskModal.classList.remove('show')
    } else {
        if (e.target === closingTarget || e.target === closingTarget.querySelector('i')) {
            addTaskModal.classList.remove('show')
        }
    }
}

// handle when submit modal
function handleAddTask(e) {
    e.preventDefault()

    // get form data and save to local storage
    const newTask = Object.fromEntries(new FormData(addTaskForm))
    newTask.isCompleted = false
    tasks.push(newTask)
    localStorage.setItem('tasks', JSON.stringify(tasks))

    setTimeout(() => addTaskForm.reset(), 700)
    renderTask(newTask)
    hideModal()
}

function renderTask(task) {
    const taskEle = document.createElement('div')
    taskEle.className = `task-card ${task.taskColor} ${task.isCompleted ? 'completed' : ''}`

    const taskTitleEle = document.createElement('h3')
    taskTitleEle.className = 'task-title'
    taskTitleEle.textContent = task.taskTitle

    const taskDescriptionEle = document.createElement('p')
    taskDescriptionEle.className = 'task-description'
    taskDescriptionEle.textContent = task.taskDescription

    taskEle.innerHTML = `
        <div class="task-header">
            ${taskTitleEle.outerHTML}
            <button class="task-menu">
                <i class="fa-solid fa-ellipsis fa-icon"></i>
                <div class="dropdown-menu">
                    <div class="dropdown-item">
                        <i class="fa-solid fa-pen-to-square fa-icon"></i>
                        Edit
                    </div>
                    <div class="dropdown-item complete">
                        <i class="fa-solid fa-check fa-icon"></i>
                        Mark as Active
                    </div>
                    <div class="dropdown-item delete">
                        <i class="fa-solid fa-trash fa-icon"></i>
                        Delete
                    </div>
                </div>
            </button>
        </div>
        ${taskDescriptionEle.outerHTML}
        <div class="task-time">${task.startTime} - ${task.endTime}</div>`

    taskGrid.prepend(taskEle)
}

// render tasks for the first time
function renderFirst() {
    const savedTasks = JSON.parse(localStorage.getItem('tasks')) 
    if (savedTasks) {
        tasks = savedTasks
        tasks.forEach(task => renderTask(task))
    }
}
renderFirst()