// dashboard-service.js - Task Manager Dashboard
const API_BASE_URL = 'http://localhost:8080/tasks';

// Get current user ID from meta tag
const currentUserId = document.querySelector('meta[name="user-id]')?.getAttribute('content');

// Global variables
let allTasks = [];
let currentFilter = 'ALL';
let currentStatusFilter = 'ALL';
let currentTypeFilter = 'ALL';
let currentDateFilter = 'ALL';

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    if (!currentUserId) {
        window.location.href = 'http://localhost:8080/loginpage';
        return;
    }
    
    // Load tasks on page load
    loadTasks();
    
    // Set up filter tabs
    setupFilterTabs();
    
    // Set up modal close on outside click
    setupModalClose();
});

// =============== Load all tasks from server ==================
async function loadTasks() {
    showLoading();
    
    try {
        const queryParams = new URLSearchParams({
            userId: currentUserId
        });
        
        const response = await fetch(`${API_BASE_URL}?${queryParams}`);
        
        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = 'http://localhost:8080/loginpage';
                return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        allTasks = await response.json();
        
        // Update statistics
        updateStatistics(allTasks);
        
        // Apply current filters
        applyFilters();
        
    } catch (error) {
        console.error('Error fetching tasks:', error);
        showToast('Failed to load tasks. Please try again.', 'error');
        
        // Show empty state
        showEmptyState();
    } finally {
        hideLoading();
    }
}

// ============ Render tasks in container ==============
function renderTasks(tasks) {
    const container = document.getElementById('tasksContainer');
    const emptyState = document.getElementById('emptyState');
    
    if (!tasks || tasks.length === 0) {
        container.innerHTML = '';
        showEmptyState();
        return;
    }
    
    // Hide empty state
    if (emptyState) {
        emptyState.classList.add('hidden');
    }
    
    // Sort tasks by date (most recent first)
    const sortedTasks = [...tasks].sort((a, b) => {
        const dateA = new Date(a.taskDate + (a.taskTime ? 'T' + a.taskTime : ''));
        const dateB = new Date(b.taskDate + (b.taskTime ? 'T' + b.taskTime : ''));
        return dateB - dateA;
    });
    
    // Render tasks
    container.innerHTML = sortedTasks.map(task => createTaskCard(task)).join('');
    
    // Add event listeners for action buttons
    addTaskCardEventListeners();
}

// ============ Create task card HTML ==============
function createTaskCard(task) {
    const formattedDate = formatDate(task.taskDate);
    const formattedTime = task.taskTime ? formatTime(task.taskTime) : '';
    const statusClass = getStatusClass(task.status);
    const typeClass = getTypeClass(task.taskType);
    const borderClass = getBorderStatusClass(task.status);
    const isOverdue = isTaskOverdue(task);
    
    return `
        <div class="bg-white rounded-xl shadow p-6 border-l-4 ${borderClass} card-hover">
            <div class="flex justify-between items-start mb-4">
                <div class="flex-1">
                    <h3 class="text-lg font-semibold text-gray-800 mb-2">${escapeHtml(task.title)}</h3>
                    <p class="text-gray-600 text-sm line-clamp-2">${task.description ? escapeHtml(task.description) : 'No description'}</p>
                </div>
                <div class="ml-4 flex space-x-2">
                    <button class="edit-task-btn text-blue-600 hover:text-blue-800" data-task-id="${task.taskId}" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-task-btn text-red-600 hover:text-red-800" data-task-id="${task.taskId}" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            
            <div class="space-y-3">
                <div class="flex flex-wrap gap-2">
                    <span class="status-badge ${statusClass}">
                        ${formatStatus(task.status)}
                    </span>
                    <span class="type-badge ${typeClass}">
                        ${formatTaskType(task.taskType)}
                    </span>
                    ${isOverdue ? '<span class="status-badge bg-red-100 text-red-800">Overdue</span>' : ''}
                </div>
                
                <div class="text-sm text-gray-500">
                    <div class="flex items-center">
                        <i class="far fa-calendar-alt mr-2"></i>
                        <span>${formattedDate}</span>
                    </div>
                    ${formattedTime ? `
                        <div class="flex items-center mt-1">
                            <i class="far fa-clock mr-2"></i>
                            <span>${formattedTime}</span>
                        </div>
                    ` : ''}
                </div>
                
                <div class="pt-3 border-t border-gray-100">
                    <div class="flex justify-between items-center">
                        <label class="inline-flex items-center cursor-pointer">
                            <input type="checkbox" 
                                   class="task-status-toggle h-5 w-5 text-purple-600 rounded focus:ring-purple-500"
                                   data-task-id="${task.taskId}"
                                   ${task.status === 'COMPLETED' ? 'checked' : ''}>
                            <span class="ml-2 text-sm text-gray-600">Mark as completed</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ============ Add event listeners to task cards ==============
function addTaskCardEventListeners() {
    // Edit buttons
    document.querySelectorAll('.edit-task-btn').forEach(button => {
        button.addEventListener('click', function() {
            const taskId = this.getAttribute('data-task-id');
            editTask(taskId);
        });
    });
    
    // Delete buttons
    document.querySelectorAll('.delete-task-btn').forEach(button => {
        button.addEventListener('click', function() {
            const taskId = this.getAttribute('data-task-id');
            deleteTask(taskId);
        });
    });
    
    // Status toggle checkboxes
    document.querySelectorAll('.task-status-toggle').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const taskId = this.getAttribute('data-task-id');
            const isCompleted = this.checked;
            toggleTaskStatus(taskId, isCompleted);
        });
    });
}

// ============ Create Task ==============
async function createTask(taskData) {
    showLoading();
    
    try {
        const response = await fetch(`${API_BASE_URL}/${currentUserId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(taskData)
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
        }
        
        const createdTask = await response.json();
        showToast('Task created successfully!', 'success');
        return createdTask;
        
    } catch (error) {
        console.error('Error creating task:', error);
        showToast(error.message || 'Failed to create task. Please try again.', 'error');
        throw error;
    } finally {
        hideLoading();
    }
}

// ============ Update Task ==============
async function updateTask(taskId, taskData) {
    showLoading();
    
    try {
        const response = await fetch(`${API_BASE_URL}/${taskId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(taskData)
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
        }
        
        const updatedTask = await response.json();
        showToast('Task updated successfully!', 'success');
        return updatedTask;
        
    } catch (error) {
        console.error('Error updating task:', error);
        showToast(error.message || 'Failed to update task. Please try again.', 'error');
        throw error;
    } finally {
        hideLoading();
    }
}

// ============ Delete Task ==============
async function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
        return;
    }
    
    showLoading();
    
    try {
        const response = await fetch(`${API_BASE_URL}/${taskId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Remove task from local array
        allTasks = allTasks.filter(task => task.taskId !== taskId);
        
        // Update UI
        updateStatistics(allTasks);
        applyFilters();
        
        showToast('Task deleted successfully!', 'success');
        
    } catch (error) {
        console.error('Error deleting task:', error);
        showToast('Failed to delete task. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

// ============ Toggle Task Status ==============
async function toggleTaskStatus(taskId, isCompleted) {
    try {
        const response = await fetch(`${API_BASE_URL}/complete?taskId=${taskId}`, {
            method: 'PATCH'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Update local task status
        const taskIndex = allTasks.findIndex(task => task.taskId === taskId);
        if (taskIndex !== -1) {
            allTasks[taskIndex].status = isCompleted ? 'COMPLETED' : 'PENDING';
        }
        
        // Update statistics
        updateStatistics(allTasks);
        
        // Reapply filters to update UI
        applyFilters();
        
        showToast('Task status updated!', 'success');
        
    } catch (error) {
        console.error('Error updating task status:', error);
        showToast('Failed to update task status. Please try again.', 'error');
        
        // Revert checkbox state
        const checkbox = document.querySelector(`.task-status-toggle[data-task-id="${taskId}"]`);
        if (checkbox) {
            checkbox.checked = !isCompleted;
        }
    }
}

// ============ Edit Task (Load into Modal) ==============
async function editTask(taskId) {
    const task = allTasks.find(t => t.taskId === taskId);
    
    if (!task) {
        showToast('Task not found!', 'error');
        return;
    }
    
    // Fill modal with task data
    document.getElementById('modalTitle').textContent = 'Edit Task';
    document.getElementById('taskId').value = task.taskId;
    document.getElementById('title').value = task.title;
    document.getElementById('description').value = task.description || '';
    document.getElementById('taskDate').value = task.taskDate;
    document.getElementById('taskTime').value = task.taskTime || '';
    document.getElementById('status').value = task.status;
    document.getElementById('taskType').value = task.taskType;
    
    // Show modal
    openModal();
}

// ============ Open Create Task Modal ==============
function openCreateModal() {
    document.getElementById('modalTitle').textContent = 'Create New Task';
    document.getElementById('taskForm').reset();
    document.getElementById('taskId').value = '';
    document.getElementById('status').value = 'PENDING';
    document.getElementById('taskType').value = 'PERSONAL';
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('taskDate').value = today;
    
    openModal();
}

// ============ Handle Task Form Submit ==============
async function handleTaskSubmit(event) {
    event.preventDefault();
    
    const taskId = document.getElementById('taskId').value;
    const isEditMode = !!taskId;
    
    const taskData = {
        taskId: taskId || null,
        title: document.getElementById('title').value.trim(),
        description: document.getElementById('description').value.trim(),
        taskDate: document.getElementById('taskDate').value,
        taskTime: document.getElementById('taskTime').value || null,
        status: document.getElementById('status').value,
        taskType: document.getElementById('taskType').value
    };
    
    // Validation
    if (!taskData.title) {
        showToast('Title is required!', 'error');
        return;
    }
    
    if (!taskData.taskDate) {
        showToast('Task date is required!', 'error');
        return;
    }
    
    try {
        let result;
        
        if (isEditMode) {
            result = await updateTask(taskId, taskData);
            
            // Update local task
            const taskIndex = allTasks.findIndex(task => task.taskId === taskId);
            if (taskIndex !== -1) {
                allTasks[taskIndex] = result;
            }
        } else {
            result = await createTask(taskData);
            
            // Add new task to local array
            allTasks.push(result);
        }
        
        // Close modal
        closeModal();
        
        // Update statistics
        updateStatistics(allTasks);
        
        // Reapply filters to update UI
        applyFilters();
        
    } catch (error) {
        // Error is already handled in createTask/updateTask functions
        console.error('Error in form submission:', error);
    }
}

// ============ Filter Tasks ==============
function filterTasks(filterType) {
    currentFilter = filterType;
    
    // Update filter tabs
    updateFilterTabs();
    
    // Apply all filters
    applyFilters();
}

function applyFilters() {
    // Get current filter values
    currentStatusFilter = document.getElementById('statusFilter').value;
    currentTypeFilter = document.getElementById('typeFilter').value;
    currentDateFilter = document.getElementById('dateFilter').value;
    
    let filteredTasks = [...allTasks];
    
    // Apply quick filter tab
    if (currentFilter === 'PENDING') {
        filteredTasks = filteredTasks.filter(task => task.status === 'PENDING');
    } else if (currentFilter === 'COMPLETED') {
        filteredTasks = filteredTasks.filter(task => task.status === 'COMPLETED');
    }
    
    // Apply status filter
    if (currentStatusFilter !== 'ALL') {
        filteredTasks = filteredTasks.filter(task => task.status === currentStatusFilter);
    }
    
    // Apply type filter
    if (currentTypeFilter !== 'ALL') {
        filteredTasks = filteredTasks.filter(task => task.taskType === currentTypeFilter);
    }
    
    // Apply date filter
    if (currentDateFilter !== 'ALL') {
        filteredTasks = filterTasksByDate(filteredTasks, currentDateFilter);
    }
    
    // Render filtered tasks
    renderTasks(filteredTasks);
}

// ============ Filter by Date ==============
function filterTasksByDate(tasks, dateFilter) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);
    
    const nextWeekStart = new Date(endOfWeek);
    const nextWeekEnd = new Date(nextWeekStart);
    nextWeekEnd.setDate(nextWeekEnd.getDate() + 7);
    
    return tasks.filter(task => {
        const taskDate = new Date(task.taskDate);
        
        switch (dateFilter) {
            case 'TODAY':
                return taskDate.toDateString() === today.toDateString();
                
            case 'TOMORROW':
                return taskDate.toDateString() === tomorrow.toDateString();
                
            case 'THIS_WEEK':
                return taskDate >= startOfWeek && taskDate < endOfWeek;
                
            case 'NEXT_WEEK':
                return taskDate >= nextWeekStart && taskDate < nextWeekEnd;
                
            case 'OVERDUE':
                return taskDate < today && task.status !== 'COMPLETED';
                
            default:
                return true;
        }
    });
}

// ============ Update Statistics ==============
function updateStatistics(tasks) {
    if (!tasks) return;
    
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
    const pendingTasks = tasks.filter(t => t.status === 'PENDING').length;
    
    const today = new Date().toISOString().split('T')[0];
    const overdueTasks = tasks.filter(t => 
        t.status !== 'COMPLETED' && 
        t.taskDate < today
    ).length;
    
    // Update DOM elements
    document.getElementById('totalTasks').textContent = totalTasks;
    document.getElementById('completedTasks').textContent = completedTasks;
    document.getElementById('pendingTasks').textContent = pendingTasks;
    document.getElementById('overdueTasks').textContent = overdueTasks;
}

// ============ Helper Functions ==============
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    } catch (error) {
        return dateString;
    }
}

function formatTime(timeString) {
    // if (!timeString) return '';
    // try {
    //     const [hours, minutes] = timeString.split(':');
    //     const hour =
    return null;
}   