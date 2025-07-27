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
const modalTitle = $('.modal-title')

let editing = false
let marking = false
let taskList = []
let actioningElementId = -1

// handle show modal
addTaskBtn.onclick = showModal

// show modal and handle other actions
function showModal() {
    addTaskModal.classList.add('show')
    setTimeout(() => addTaskModal.querySelector('#taskTitle').focus(), 30)

    // handle hide modal
    const closingElements = [modalCloseBtn, modalCancelBtn, addTaskModalOverlay]
    addTaskModalOverlay.onclick = (e) => {
        e.stopPropagation()
        // check if clicked target is a closing element
        const isClosingElement = closingElements.find(closeTarget => {
            return e.target === closeTarget || e.target === closeTarget.querySelector('i')
        })
        isClosingElement ? hideModal() : ''
    }

    // handle submit task
    addTaskForm.onsubmit = (e) => handleSubmitTask(e)

    // handle keyboard action
    document.onkeyup = (e) => {
        if (e.key === 'Escape') {
            hideModal()
        } else if (e.key === 'Enter') {
            addTaskForm.onsubmit
        }
    }
}

// find ancester of an element
function findClosestAncestor(startElement, targetElement) {
    let current = startElement;
    while (current && current !== document) {
        if (current === targetElement) return current;
        current = current.parentElement;
    }
    return null; // Không tìm thấy
}

// hide modal
function hideModal() {
    addTaskModal.classList.remove('show')

    // check if task is editing
    // if yes, reset form, give back form title and submit button content, set editing = false
    if (editing) {
        setTimeout(() => {
            addTaskForm.reset()
            modalTitle.dataset.original ? modalTitle.textContent = modalTitle.dataset.original : ''
            modalSubmitBtn.dataset.original ? modalSubmitBtn.textContent = modalSubmitBtn.dataset.original : ''
            editing = false
        }, 200)
    }

    // reset actioning element id
    actioningElementId = -1
}

// handle when submit form
function handleSubmitTask(e) {
    e.preventDefault()

    // get form data
    const newTask = Object.fromEntries(new FormData(addTaskForm))

    saveTask(newTask) //save task to task list
    setTimeout(() => addTaskForm.reset(), 200) //reset modal form
    renderTask(newTask) //render task
    hideModal() //hide modal
}

// handle save new task, editing task and marking task
function saveTask(task) {
    // if editing or marking, replace old task by editing task
    if (editing || marking) {
        // editing task is a new task, dont have id and completed state
        // assign id for editing task
        !task.id ? task.id = actioningElementId : ''
        
        for (let i = 0; i < taskList.length; i++) {
            if (taskList[i].id === task.id) {
                // reassign completed state for editing task
                editing ? task.isCompleted = taskList[i].isCompleted : ''
                taskList[i] = task // replace task
            }
        }
    } else { // action if task is new
        task.isCompleted = false
        task.id = taskList.length + 1
        taskList.push(task)
    }

    localStorage.setItem('taskList', JSON.stringify(taskList))
    marking = false
}

// render task
function renderTask(task) {
    const taskEle = document.createElement('div')
    taskEle.className = `task-card ${task.taskColor} ${task.isCompleted ? 'completed' : ''}`
    taskEle.dataset.id = task.id

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
                    <div class="dropdown-item edit">
                        <i class="fa-solid fa-pen-to-square fa-icon"></i>
                        Edit
                    </div>
                    <div class="dropdown-item complete">
                        <i class="fa-solid fa-check fa-icon"></i>
                        Mark as ${task.isCompleted ? 'Active' : 'Completed'}
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

    // if editing, replace editing element by edited element (taskEle)
    if (editing) {
        const editingTaskEle = taskGrid.querySelector(`[data-id="${task.id}"]`)
        editingTaskEle.replaceWith(taskEle)
    } else { // else, create new task in task grid
        taskGrid.prepend(taskEle)
    }
}

function renderFirst() {
    const savedTasks = JSON.parse(localStorage.getItem('taskList'))
    if (savedTasks) {
        taskList = savedTasks
        taskList.forEach(task => renderTask(task))
    }
}
renderFirst() // render task list for the first time

// handle actions with task (edit, mark, delete)
taskGrid.onclick = (e) => {
    const editTaskBtn = e.target.closest('.edit')
    const markTaskBtn = e.target.closest('.complete')
    const deleteTaskBtn = e.target.closest('.delete')
    actioningElementId = +e.target.closest('.task-card').dataset.id

    editTaskBtn ? handleEditTask() : ''
    markTaskBtn ? handleMarkTask(markTaskBtn) : ''
    deleteTaskBtn ? handleDeleteTask() : ''
}

function handleEditTask() {
    editing = true // set to editing state

    // save and change title content and submit content
    modalTitle.dataset.original = modalTitle.textContent
    modalTitle.textContent = 'Edit Task'
    modalSubmitBtn.dataset.original = modalSubmitBtn.textContent
    modalSubmitBtn.textContent = 'Save'

    // get task form task list having the same id with editing task
    const editingTask = findTaskById(actioningElementId)
    if (editingTask) {
        // put editing task infos to the modal form
        for (key in editingTask) {
            if (key !== 'id' && key !== 'isCompleted') {
                const input = $(`[name='${key}']`)
                input.value = editingTask[key]
            }
        }
    }
    showModal()
}

function handleMarkTask(markBtn) {
    marking = true

    // get marking task
    const markingTask = findTaskById(actioningElementId)
    // get marking task element
    const markingTaskEle = findTaskElementById(actioningElementId)

    // toggle completed state
    markingTaskEle.classList.toggle('completed')

    // toggle content of edit button
    if (markingTaskEle.classList.contains('completed')) {
        markingTask.isCompleted = true
        markBtn.textContent = 'Mark as Active' 
    } else {
        markingTask.isCompleted = false
        markBtn.textContent = 'Mark as Completed'
    }

    saveTask(markingTask)
}

function handleDeleteTask() {
    // get delete task
    const deleteTask = findTaskById(actioningElementId)
    // get delete task element
    const deleteTaskEle = findTaskElementById(actioningElementId)

    // delete task by reassign task list to a new filterd task list
    taskList = taskList.filter(task => task.id !== deleteTask.id)
    // delete task in task grid
    deleteTaskEle.remove()

    localStorage.setItem('taskList', JSON.stringify(taskList))
}

// find task in task list by id
function findTaskById(id) {
    return taskList.find(task => task.id === id)
}

// find task element in task grid by id
function findTaskElementById(id) {
    return taskGrid.querySelector(`[data-id="${id}"]`)
}