// dashboard.js - Task Manager API Integration

// API Base URL
const API_BASE_URL = 'http://localhost:8080/tasks';

// Get current user from session (these would be populated by Thymeleaf)
const currentUserId =  1; 
//  document.currentScript?.getAttribute('data-user-id') || 
//                       window.currentUserId || 
//                       (() => {
//                           // Try to get from meta tag or global variable
//                           const meta = document.querySelector('meta[name="user-id"]');
//                           return meta ? meta.content : null;
//                       })();

// Initialize date/time pickers
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    // if (!currentUserId) {
    //     window.location.href = '/login';
    //     return;
    // }
    
    // Load tasks on page load
    loadTasks();
    
    // Mobile menu toggle
    document.getElementById('mobileMenuBtn')?.addEventListener('click', function() {
        const menu = document.getElementById('mobileMenu');
        if (menu) {
            menu.classList.toggle('hidden');
        }
    });
    
    // Initialize filters if they exist
    const statusFilter = document.getElementById('statusFilter');
    const typeFilter = document.getElementById('typeFilter');
    
    if (statusFilter) {
        statusFilter.addEventListener('change', () => filterTasks());
    }
    
    if (typeFilter) {
        typeFilter.addEventListener('change', () => filterTasks());
    }
});

// Load tasks from server
async function loadTasks(filters = {}) {
    showLoading();
    try {
        const queryParams = new URLSearchParams({
            userId: currentUserId,
            ...filters
        });
        
        //const response = await fetch(`${API_BASE_URL}?${queryParams}`);
        const response = await fetch(`${API_BASE_URL}?userId=1`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const tasks = await response.json();
        renderTasks(tasks);
        updateStats(tasks);
    } catch (error) {
        console.error('Error loading tasks:', error);
        showToast('Failed to load tasks', 'error');
    } finally {
        hideLoading();
    }
}

// Render tasks in the container
function renderTasks(tasks) {
    const container = document.getElementById('tasksContainer');
    const emptyState = document.getElementById('emptyState');
    
    if (!tasks || tasks.length === 0) {
        if (container) container.innerHTML = '';
        if (emptyState) emptyState.classList.remove('hidden');
        return;
    }
    
    if (emptyState) emptyState.classList.add('hidden');
    
    if (container) {
        container.innerHTML = tasks.map(task => `
            <div class="task-card bg-white rounded-xl shadow p-6 border-l-4 ${getStatusBorderClass(task.status)}">
                <div class="flex justify-between items-start mb-3">
                    <div class="flex-1">
                        <h3 class="text-lg font-semibold text-gray-800 truncate">${escapeHtml(task.title)}</h3>
                        <p class="text-gray-600 text-sm mt-1 line-clamp-2">${task.description ? escapeHtml(task.description) : 'No description'}</p>
                    </div>
                    <div class="flex space-x-2 ml-2">
                        <button onclick="editTask('${task.taskId}')" class="text-green-600 hover:text-green-800" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteTask('${task.taskId}')" class="text-red-600 hover:text-red-800" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                <div class="space-y-3">
                    <div class="flex flex-wrap gap-2">
                        <span class="px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(task.status)}">
                            ${formatStatus(task.status)}
                        </span>
                        <span class="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                            ${formatTaskType(task.taskType)}
                        </span>
                    </div>
                    
                    <div class="text-sm text-gray-500">
                        <div class="flex items-center">
                            <i class="far fa-calendar-alt mr-2"></i>
                            <span>${formatDate(task.taskDate)}</span>
                        </div>
                        ${task.taskTime ? `
                            <div class="flex items-center mt-1">
                                <i class="far fa-clock mr-2"></i>
                                <span>${formatTime(task.taskTime)}</span>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="pt-3 border-t">
                        <div class="flex justify-between items-center">
                            <label class="inline-flex items-center cursor-pointer">
                                <input type="checkbox" 
                                       ${task.status === 'COMPLETED' ? 'checked' : ''}
                                       onchange="toggleTaskStatus('${task.taskId}', this.checked)"
                                       class="h-5 w-5 text-purple-600 rounded focus:ring-purple-500">
                                <span class="ml-2 text-sm text-gray-600">Mark as completed</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

// Create new task
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
            throw new Error(errorData?.message || 'Failed to create task');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error creating task:', error);
        throw error;
    } finally {
        hideLoading();
    }
}

// Update existing task
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
            throw new Error(errorData?.message || 'Failed to update task');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error updating task:', error);
        throw error;
    } finally {
        hideLoading();
    }
}

// Delete task
async function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    showLoading();
    try {
        const response = await fetch(`${API_BASE_URL}/${taskId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete task');
        }
        
        await loadTasks();
        showToast('Task deleted successfully!');
    } catch (error) {
        console.error('Error deleting task:', error);
        showToast('Failed to delete task', 'error');
    } finally {
        hideLoading();
    }
}

// Toggle task status (complete/incomplete)
async function toggleTaskStatus(taskId, isCompleted) {
    try {
        const response = await fetch(`${API_BASE_URL}/complete?taskId=${taskId}`, {
            method: 'PATCH'
        });
        
        if (!response.ok) {
            throw new Error('Failed to update task status');
        }
        
        await loadTasks();
    } catch (error) {
        console.error('Error updating status:', error);
        showToast('Failed to update status', 'error');
    }
}

// Open create task modal
function openCreateModal() {
    document.getElementById('modalTitle').textContent = 'Create New Task';
    document.getElementById('taskForm').reset();
    document.getElementById('taskId').value = '';
    document.getElementById('status').value = 'PENDING';
    document.getElementById('taskType').value = 'PERSONAL';
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('taskDate').value = today;
    
    document.getElementById('taskModal').style.display = 'flex';
}

// Open edit task modal
async function editTask(taskId) {
    showLoading();
    try {
        // Since there's no direct GET by taskId endpoint, we need to load all tasks and find the specific one
        const response = await fetch(`${API_BASE_URL}?userId=${currentUserId}`);
        
        if (!response.ok) {
            throw new Error('Failed to load tasks');
        }
        
        const tasks = await response.json();
        const task = tasks.find(t => t.taskId === taskId);
        
        if (!task) {
            throw new Error('Task not found');
        }
        
        document.getElementById('modalTitle').textContent = 'Edit Task';
        document.getElementById('taskId').value = task.taskId;
        document.getElementById('title').value = task.title;
        document.getElementById('description').value = task.description || '';
        document.getElementById('taskDate').value = task.taskDate;
        document.getElementById('taskTime').value = task.taskTime || '';
        document.getElementById('status').value = task.status;
        document.getElementById('taskType').value = task.taskType;
        
        document.getElementById('taskModal').style.display = 'flex';
    } catch (error) {
        console.error('Error loading task:', error);
        showToast('Failed to load task', 'error');
    } finally {
        hideLoading();
    }
}

// Handle form submission
async function handleSubmit(event) {
    event.preventDefault();
    
    const taskData = {
        taskId: document.getElementById('taskId').value,
        title: document.getElementById('title').value.trim(),
        description: document.getElementById('description').value.trim(),
        taskDate: document.getElementById('taskDate').value,
        taskTime: document.getElementById('taskTime').value || null,
        status: document.getElementById('status').value,
        taskType: document.getElementById('taskType').value
    };
    
    // Validate required fields
    if (!taskData.title) {
        showToast('Title is required', 'error');
        return;
    }
    
    if (!taskData.taskDate) {
        showToast('Task date is required', 'error');
        return;
    }
    
    try {
        if (taskData.taskId) {
            // Update existing task
            await updateTask(taskData.taskId, taskData);
            showToast('Task updated successfully!');
        } else {
            // Create new task
            await createTask(taskData);
            showToast('Task created successfully!');
        }
        
        closeModal();
        await loadTasks();
    } catch (error) {
        console.error('Error saving task:', error);
        showToast(error.message || 'Failed to save task', 'error');
    }
}

// Filter tasks
async function filterTasks() {
    const status = document.getElementById('statusFilter')?.value || 'ALL';
    const type = document.getElementById('typeFilter')?.value || 'ALL';
    
    const filters = {};
    
    if (status !== 'ALL') {
        filters.status = status;
    }
    
    if (type !== 'ALL') {
        filters.taskType = type;
    }
    
    await loadTasks(filters);
}

// Update statistics
function updateStats(tasks) {
    if (!tasks) return;
    
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
    const pendingTasks = tasks.filter(t => t.status === 'PENDING').length;
    const today = new Date().toISOString().split('T')[0];
    const overdueTasks = tasks.filter(t => 
        t.status !== 'COMPLETED' && 
        t.taskDate < today
    ).length;
    
    // Update stats cards
    const totalEl = document.querySelector('[data-stat="total"]');
    const completedEl = document.querySelector('[data-stat="completed"]');
    const pendingEl = document.querySelector('[data-stat="pending"]');
    const overdueEl = document.querySelector('[data-stat="overdue"]');
    
    if (totalEl) totalEl.textContent = totalTasks;
    if (completedEl) completedEl.textContent = completedTasks;
    if (pendingEl) pendingEl.textContent = pendingTasks;
    if (overdueEl) overdueEl.textContent = overdueTasks;
}

// Helper functions
function closeModal() {
    const modal = document.getElementById('taskModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function showLoading() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.classList.remove('hidden');
    }
}

function hideLoading() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.classList.add('hidden');
    }
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    if (!toast || !toastMessage) return;
    
    toastMessage.textContent = message;
    
    if (type === 'error') {
        toast.style.backgroundColor = '#dc2626'; // red-600
    } else {
        toast.style.backgroundColor = '#059669'; // green-600
    }
    
    toast.style.transform = 'translateX(0)';
    
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
    }, 3000);
}

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
    if (!timeString) return '';
    try {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    } catch (error) {
        return timeString;
    }
}

function formatStatus(status) {
    return status ? status.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) : '';
}

function formatTaskType(type) {
    return type ? type.charAt(0) + type.slice(1).toLowerCase() : '';
}

function getStatusClass(status) {
    switch(status) {
        case 'PENDING': return 'status-pending';
        case 'IN_PROGRESS': return 'status-in_progress';
        case 'COMPLETED': return 'status-completed';
        default: return 'bg-gray-100 text-gray-700';
    }
}

function getStatusBorderClass(status) {
    switch(status) {
        case 'PENDING': return 'border-yellow-400';
        case 'IN_PROGRESS': return 'border-blue-400';
        case 'COMPLETED': return 'border-green-400';
        default: return 'border-gray-300';
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function logout() {
    window.location.href = '/logout';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('taskModal');
    if (event.target === modal) {
        closeModal();
    }
};

// Export functions for use in HTML
window.openCreateModal = openCreateModal;
window.editTask = editTask;
window.deleteTask = deleteTask;
window.toggleTaskStatus = toggleTaskStatus;
window.handleSubmit = handleSubmit;
window.filterTasks = filterTasks;
window.closeModal = closeModal;
window.logout = logout;