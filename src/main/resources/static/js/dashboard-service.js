const authStatus = document.getElementById('authStatus').value;
const tasks_base_url = "http://localhost:8080/tasks";
const userId = document.getElementById("userId").value;

// Check Authentication
if (authStatus === "true") {
    window.location.href = "http://localhost:8080/loginpage";
} else {
    getAllTasks();
}

// ========== DISPLAY ALL TASKS =====================
async function getAllTasks() {
    try {
        console.log("Fetching tasks for user:", userId);
        const response = await fetch(`${tasks_base_url}?userId=${userId}`);

        if(response.status === 204){
            console.log("Task list is empty");
            displayNoTaskUI();
            updateStats({total: 0, pending: 0, completed: 0});
            return;
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const tasks = await response.json();
        console.log("Tasks received:", tasks);
        displayTasksToUI(tasks);
        calculateAndUpdateStats(tasks);

    } catch (error) {
        console.error("Could not fetch tasks:", error);
        showAlert("Failed to load tasks. Please try again later.", "error");
    }
}

// ========== CALCULATE STATISTICS ==============
function calculateAndUpdateStats(tasks) {
    if (!tasks || tasks.length === 0) {
        updateStats({total: 0, pending: 0, completed: 0});
        return;
    }

    const total = tasks.length;
    const pending = tasks.filter(t => t.status === 'PENDING').length;
    const completed = tasks.filter(t => t.status === 'COMPLETED').length;
    
    updateStats({total, pending, completed});
}

// ========== MARK TASK AS COMPLETE USING PATCH API ==============
async function completeTask(taskId) {
    if (!confirm("Mark this task as complete?")) {
        return;
    }

    try {
        const response = await fetch(`${tasks_base_url}/complete?taskId=${taskId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (response.ok) {
            showAlert("Task marked as complete!", "success");
            getAllTasks(); // Refresh task list and stats
        } else if (response.status === 404) {
            showAlert("Task not found!", "error");
        } else {
            throw new Error('Failed to complete task');
        }
    } catch (error) {
        console.error("Error completing task:", error);
        showAlert("Failed to complete task. Please try again.", "error");
    }
}
// ========== UPDATE TASK USING PATCH API ==============
  async function updateTaskWithPatch(taskId, taskDto) {
      try {
          const response = await fetch(`${tasks_base_url}/${taskId}`, {
              method: 'PATCH',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify(taskDto)
          });

          if (response.ok) {
              const updatedTask = await response.json();
              showAlert("Task updated successfully!", "success");
              return updatedTask;
          } else if (response.status === 404) {
              showAlert("Task not found!", "error");
              return null;
          } else {
              throw new Error(`Failed to update task: ${response.status}`);
          }
      } catch (error) {
          console.error("Error updating task with PATCH:", error);
          showAlert("Failed to update task. Please try again.", "error");
          throw error;
      }
  }

// ========== UPDATE TASK STATUS (UPDATED) ==============
async function updateTaskStatus(taskId, newStatus) {
    try {
        // If marking as COMPLETED, use the PATCH API
        if (newStatus === 'COMPLETED') {
            await completeTask(taskId);
            return;
        }
        
        // For other status updates, use the existing PUT logic
        const response = await fetch(`${tasks_base_url}/${taskId}`);
        if (!response.ok) throw new Error('Failed to fetch task');
        
        const task = await response.json();
        
        const updatedTask = {
            ...task,
            status: newStatus
        };

        const updateResponse = await fetch(`${tasks_base_url}/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedTask)
        });

        if (updateResponse.ok) {
            showAlert(`Task marked as ${newStatus.toLowerCase()}!`, "success");
            getAllTasks(); // Refresh task list
        } else {
            throw new Error('Failed to update task status');
        }
    } catch (error) {
        console.error("Error updating task status:", error);
        showAlert("Failed to update task status. Please try again.", "error");
    }
}

// ========== DISPLAY TASKS TO UI (UPDATED) ==============
function displayTasksToUI(tasks) {
    let taskDisplayDiv = document.getElementById("taskExistDisplay");
    let taskEmptyDiv = document.getElementById("taskEmptyBlock");
    
    taskDisplayDiv.innerHTML = "";
    taskEmptyDiv.classList.add("hidden");
    
    if (!tasks || tasks.length === 0) {
        displayNoTaskUI();
        return;
    }

    // Sort tasks: PENDING first, then others
    const sortedTasks = [...tasks].sort((a, b) => {
        if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
        if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
        return 0;
    });

    sortedTasks.forEach(task => {
        const taskCard = document.createElement('div');
        taskCard.className = `bg-white rounded-xl shadow-sm p-6 task-card ${task.status === 'COMPLETED' ? 'completed' : ''}`;
        taskCard.id = `task-${task.taskId}`;
        
        // Format date and time if available
        let dateTimeHtml = '';
        if (task.taskDate) {
            dateTimeHtml += `<span class="flex items-center"><i class="far fa-calendar mr-1"></i> ${formatDate(task.taskDate)}</span>`;
        }
        if (task.taskTime) {
            dateTimeHtml += `<span class="flex items-center"><i class="far fa-clock mr-1"></i> ${task.taskTime}</span>`;
        }
        
        taskCard.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                        <h3 class="text-lg font-semibold text-gray-800 ${task.status === 'COMPLETED' ? 'line-through text-gray-400' : ''}">
                            ${task.title || "Untitled Task"}
                        </h3>
                        <span class="status-badge status-${task.status?.toLowerCase() || 'pending'}">
                            ${task.status || 'PENDING'}
                        </span>
                    </div>
                    <p class="text-gray-600 mb-4 ${task.status === 'COMPLETED' ? 'line-through text-gray-400' : ''}">
                        ${task.description || "No description provided."}
                    </p>
                    
                    <div class="flex flex-wrap gap-4 text-sm text-gray-500">
                        ${dateTimeHtml}
                        <span class="type-badge type-${task.taskType?.toLowerCase() || 'general'}">
                            <i class="fas ${getTaskTypeIcon(task.taskType)} mr-1"></i>
                            ${task.taskType || 'GENERAL'}
                        </span>
                    </div>
                </div>
            </div>
            
            <div class="flex justify-between items-center pt-4 border-t">
                <div class="flex gap-2">
                    ${task.status !== 'PENDING' ? `
                    <button onclick="updateTaskStatus('${task.taskId}', 'PENDING')" 
                            class="px-4 py-2 text-sm bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition">
                        <i class="fas fa-clock mr-1"></i>Mark as Pending
                    </button>
                    ` : ''}
                    
                    ${task.status !== 'IN_PROGRESS' ? `
                    <button onclick="updateTaskStatus('${task.taskId}', 'IN_PROGRESS')"
                            class="px-4 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition">
                        <i class="fas fa-spinner mr-1"></i>Mark as In Progress
                    </button>
                    ` : ''}
                    
                    ${task.status !== 'COMPLETED' ? `
                    <button onclick="updateTaskStatus('${task.taskId}', 'COMPLETED')"
                            class="px-4 py-2 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition">
                        <i class="fas fa-check mr-1"></i>Mark as Complete
                    </button>
                    ` : ''}
                </div>
                
                <div class="flex gap-2">
                    <button onclick="editTask('${task.taskId}')"
                            class="px-4 py-2 text-sm bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition">
                        <i class="fas fa-edit mr-1"></i>Edit
                    </button>
                    <button onclick="deleteTask('${task.taskId}')"
                            class="px-4 py-2 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition">
                        <i class="fas fa-trash mr-1"></i>Delete
                    </button>
                </div>
            </div>
        `;
        
        taskDisplayDiv.appendChild(taskCard);
    });
}

// ========== HELPER FUNCTIONS ==============
function updateStats(stats) {
    document.getElementById('totalTasks').textContent = stats.total;
    document.getElementById('pendingTasks').textContent = stats.pending;
    document.getElementById('completedTasks').textContent = stats.completed;
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function displayNoTaskUI() {
    let taskEmptyDiv = document.getElementById("taskEmptyBlock");
    let taskDisplayDiv = document.getElementById("taskExistDisplay");
    
    taskEmptyDiv.classList.remove("hidden");
    taskDisplayDiv.innerHTML = "";
}

function getTaskTypeIcon(taskType) {
    switch(taskType) {
        case 'WORK': return 'fa-briefcase';
        case 'PERSONAL': return 'fa-user';
        case 'GOAL': return 'fa-bullseye';
        default: return 'fa-tasks';
    }
}

// ========== CREATE/UPDATE TASK ==============
async function createOrUpdateTask() {
    const taskId = document.getElementById('taskId').value;
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const taskDate = document.getElementById('taskDate').value;
    const taskTime = document.getElementById('taskTime').value;
    const taskType = document.querySelector('input[name="taskType"]:checked')?.value;

    if (!title || !taskType) {
        showAlert("Please fill all required fields", "error");
        return;
    }

    const taskDto = {
        title,
        description,
        taskDate: taskDate || null,
        taskTime: taskTime || null,
        taskType
    };

    try {
        let response;
        const url = taskId ? 
            `${tasks_base_url}/${taskId}` : 
            `${tasks_base_url}/${userId}`;

        const method = taskId ? 'PATCH' : 'POST';

        response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(taskDto)
        });

        if (response.ok) {
            const savedTask = await response.json();
            showAlert(
                taskId ? "Task updated successfully!" : "Task created successfully!",
                "success"
            );
            hideAddTaskForm();
            getAllTasks(); // Refresh task list and stats
        } else {
            throw new Error('Failed to save task');
        }
    } catch (error) {
        console.error("Error saving task:", error);
        showAlert("Failed to save task. Please try again.", "error");
    }
}

// ========== DELETE TASK (FIXED VERSION) ==============
async function deleteTask(taskId) {
    // Store button reference at function scope level
    let deleteBtn = null;
    let originalText = null;

    // Add a more stylish confirmation modal instead of default confirm()
    if (!await showConfirmationModal(
        "Delete Task",
        "Are you sure you want to delete this task? This action cannot be undone.",
        "Delete",
        "Cancel"
    )) {
        return;
    }

    try {
        // Add loading state to the delete button
        // Note: event is not available in inline onclick handlers
        // We need to get the button differently
        deleteBtn = document.querySelector(`button[onclick="deleteTask('${taskId}')"]`);
        if (deleteBtn) {
            originalText = deleteBtn.innerHTML;
            deleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Deleting...';
            deleteBtn.disabled = true;
        }

        const response = await fetch(`${tasks_base_url}/${taskId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showAlert("Task deleted successfully!", "success");

            // Optional: Remove the task card with animation before refreshing
            const taskCard = document.getElementById(`task-${taskId}`);
            if (taskCard) {
                taskCard.style.opacity = '0';
                taskCard.style.transform = 'translateX(-20px)';
                setTimeout(() => {
                    getAllTasks(); // Refresh task list and stats
                }, 300);
            } else {
                getAllTasks();
            }
        } else if (response.status === 404) {
            showAlert("Task not found! It may have already been deleted.", "error");
            getAllTasks(); // Refresh to sync state
        } else {
            throw new Error(`Failed to delete task: ${response.status}`);
        }
    } catch (error) {
        console.error("Error deleting task:", error);
        showAlert("Failed to delete task. Please check your connection and try again.", "error");
    } finally {
        // Reset button state if we captured the button
        if (deleteBtn && originalText) {
            deleteBtn.innerHTML = originalText;
            deleteBtn.disabled = false;
        }
    }
}

// Optional: Custom confirmation modal function
async function showConfirmationModal(title, message, confirmText, cancelText) {
    return new Promise((resolve) => {
        // Create modal HTML
        const modalHTML = `
            <div id="confirmModal" class="fixed inset-0 z-50 modal-overlay">
                <div class="flex items-center justify-center min-h-screen">
                    <div class="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 fade-in">
                        <div class="p-6">
                            <h3 class="text-xl font-bold text-gray-800 mb-2">${title}</h3>
                            <p class="text-gray-600 mb-6">${message}</p>
                            <div class="flex justify-end gap-3">
                                <button id="confirmCancel"
                                        class="px-5 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition">
                                    ${cancelText}
                                </button>
                                <button id="confirmOk"
                                        class="px-5 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition">
                                    ${confirmText}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add modal to DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Add event listeners
        document.getElementById('confirmOk').addEventListener('click', () => {
            document.getElementById('confirmModal').remove();
            resolve(true);
        });

        document.getElementById('confirmCancel').addEventListener('click', () => {
            document.getElementById('confirmModal').remove();
            resolve(false);
        });

        // Close on overlay click
        document.getElementById('confirmModal').addEventListener('click', (e) => {
            if (e.target.id === 'confirmModal') {
                document.getElementById('confirmModal').remove();
                resolve(false);
            }
        });
    });
}

// ========== EDIT TASK ==============
async function editTask(taskId) {
    try {
        const response = await fetch(`${tasks_base_url}/${taskId}`);
        if (!response.ok) throw new Error('Failed to fetch task');
        
        const task = await response.json();
        
        // Fill form with task data
        document.getElementById('taskId').value = task.taskId;
        document.getElementById('title').value = task.title || '';
        document.getElementById('description').value = task.description || '';
        document.getElementById('taskDate').value = task.taskDate || '';
        document.getElementById('taskTime').value = task.taskTime || '';
        
        // Set task type radio button
        const taskTypeRadio = document.querySelector(`input[name="taskType"][value="${task.taskType}"]`);
        if (taskTypeRadio) {
            taskTypeRadio.checked = true;
        }
        
        // Update button text
        document.getElementById('submitBtn').textContent = 'Update Task';
        
        // Show modal
        showAddTaskForm();
    } catch (error) {
        console.error("Error fetching task for edit:", error);
        showAlert("Failed to load task for editing.", "error");
    }
}

// ========== UI FUNCTIONS ==============
function showAddTaskForm() {
    const modal = document.getElementById('addTaskModal');
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function hideAddTaskForm() {
    const modal = document.getElementById('addTaskModal');
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
    resetForm();
}

function resetForm() {
    document.getElementById('taskForm').reset();
    document.getElementById('taskId').value = '';
    document.getElementById('submitBtn').textContent = 'Create Task';
}

function showAlert(message, type) {
    // Remove existing alerts
    const existingAlert = document.querySelector('.custom-alert');
    if (existingAlert) existingAlert.remove();
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `custom-alert fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg text-white font-medium ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`;
    alertDiv.textContent = message;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

// Event Listeners
document.getElementById('taskForm').addEventListener('submit', function(e) {
    e.preventDefault();
    createOrUpdateTask();
});

// Close modal when clicking outside
document.getElementById('addTaskModal').addEventListener('click', function(e) {
    if (e.target === this) {
        hideAddTaskForm();
    }
});