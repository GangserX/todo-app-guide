/**
 * To-Do List Application
 * A comprehensive example demonstrating modern JavaScript practices
 * for building interactive web applications
 */

class TodoApp {
    constructor() {
        // Application state
        this.tasks = [];
        this.currentFilter = 'all';
        this.editingTaskId = null;
        this.taskIdCounter = 0;
        
        // DOM elements
        this.elements = {
            taskInput: document.getElementById('taskInput'),
            taskDeadline: document.getElementById('taskDeadline'),
            addBtn: document.getElementById('addBtn'),
            taskList: document.getElementById('taskList'),
            taskCount: document.getElementById('taskCount'),
            emptyState: document.getElementById('emptyState'),
            inputError: document.getElementById('inputError'),
            filterBtns: document.querySelectorAll('.filter-btn'),
            clearCompleted: document.getElementById('clearCompleted'),
            clearAll: document.getElementById('clearAll'),
            confirmModal: document.getElementById('confirmModal'),
            confirmYes: document.getElementById('confirmYes'),
            confirmNo: document.getElementById('confirmNo'),
            modalTitle: document.getElementById('modalTitle'),
            modalMessage: document.getElementById('modalMessage')
        };
        
        // Pending confirmation action
        this.pendingAction = null;
        
        // Initialize the application
        this.init();
    }
    
    /**
     * Initialize the application
     */
    init() {
        this.loadTasks();
        this.bindEvents();
        this.render();
        this.elements.taskInput.focus();
    }
    
    /**
     * Bind all event listeners
     */
    bindEvents() {
        // Task input events
        this.elements.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTask();
            }
        });
        
        this.elements.taskInput.addEventListener('input', () => {
            this.clearError();
        });
        
        // Add button
        this.elements.addBtn.addEventListener('click', () => {
            this.addTask();
        });
        
        // Task list events (using event delegation)
        this.elements.taskList.addEventListener('click', (e) => {
            this.handleTaskClick(e);
        });
        
        this.elements.taskList.addEventListener('keypress', (e) => {
            this.handleTaskKeypress(e);
        });
        
        this.elements.taskList.addEventListener('change', (e) => {
            this.handleTaskChange(e);
        });
        
        // Filter buttons
        this.elements.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });
        
        // Action buttons
        this.elements.clearCompleted.addEventListener('click', () => {
            this.confirmAction(
                'Clear Completed Tasks',
                'Are you sure you want to clear all completed tasks?',
                () => this.clearCompleted()
            );
        });
        
        this.elements.clearAll.addEventListener('click', () => {
            this.confirmAction(
                'Clear All Tasks',
                'Are you sure you want to clear all tasks? This action cannot be undone.',
                () => this.clearAll()
            );
        });
        
        // Modal events
        this.elements.confirmYes.addEventListener('click', () => {
            this.executeConfirmedAction();
        });
        
        this.elements.confirmNo.addEventListener('click', () => {
            this.hideModal();
        });
        
        // Close modal on outside click
        this.elements.confirmModal.addEventListener('click', (e) => {
            if (e.target === this.elements.confirmModal) {
                this.hideModal();
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleGlobalKeydown(e);
        });
    }
    
    /**
     * Handle global keyboard shortcuts
     */
    handleGlobalKeydown(e) {
        // Escape key closes modal or cancels editing
        if (e.key === 'Escape') {
            if (this.elements.confirmModal.classList.contains('show')) {
                this.hideModal();
            } else if (this.editingTaskId) {
                this.cancelEdit();
            }
        }
        
        // Ctrl/Cmd + Enter to add task from anywhere
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            this.elements.taskInput.focus();
        }
    }
    
    /**
     * Handle clicks within the task list
     */
    handleTaskClick(e) {
        const taskItem = e.target.closest('.task-item');
        if (!taskItem) return;
        
        const taskId = parseInt(taskItem.dataset.taskId);
        
        if (e.target.classList.contains('delete-btn')) {
            this.confirmAction(
                'Delete Task',
                'Are you sure you want to delete this task?',
                () => this.deleteTask(taskId)
            );
        } else if (e.target.classList.contains('edit-btn')) {
            this.editTask(taskId);
        } else if (e.target.classList.contains('save-btn')) {
            this.saveEdit(taskId);
        } else if (e.target.classList.contains('cancel-btn')) {
            this.cancelEdit();
        } else if (e.target.classList.contains('task-text')) {
            // Double-click to edit
            if (e.detail === 2) {
                this.editTask(taskId);
            }
        }
    }
    
    /**
     * Handle keypress events within the task list
     */
    handleTaskKeypress(e) {
        if (e.target.classList.contains('task-edit-input')) {
            const taskId = parseInt(e.target.closest('.task-item').dataset.taskId);
            
            if (e.key === 'Enter') {
                this.saveEdit(taskId);
            } else if (e.key === 'Escape') {
                this.cancelEdit();
            }
        }
    }
    
    /**
     * Handle change events (checkboxes)
     */
    handleTaskChange(e) {
        if (e.target.classList.contains('task-checkbox')) {
            const taskId = parseInt(e.target.closest('.task-item').dataset.taskId);
            this.toggleTask(taskId);
        }
    }
    
    /**
     * Add a new task
     */
    addTask() {
        const text = this.elements.taskInput.value.trim();
        const deadline = this.elements.taskDeadline.value;
        
        if (!this.validateTaskInput(text)) {
            return;
        }
        
        const task = {
            id: ++this.taskIdCounter,
            text: text,
            completed: false,
            createdAt: new Date().toISOString(),
            completedAt: null,
            deadline: deadline || null
        };
        
        this.tasks.push(task);
        this.elements.taskInput.value = '';
        this.elements.taskDeadline.value = '';
        this.clearError();
        this.saveTasks();
        this.render();
        this.elements.taskInput.focus();
        
        // Show success feedback
        this.showTemporaryFeedback('Task added successfully!');
    }
    
    /**
     * Validate task input
     */
    validateTaskInput(text) {
        if (!text) {
            this.showError('Please enter a task description.');
            this.elements.taskInput.focus();
            return false;
        }
        
        if (text.length > 100) {
            this.showError('Task description must be 100 characters or less.');
            this.elements.taskInput.focus();
            return false;
        }
        
        // Check for duplicate tasks
        if (this.tasks.some(task => task.text.toLowerCase() === text.toLowerCase())) {
            this.showError('This task already exists.');
            this.elements.taskInput.focus();
            return false;
        }
        
        return true;
    }
    
    /**
     * Toggle task completion status
     */
    toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            task.completedAt = task.completed ? new Date().toISOString() : null;
            this.saveTasks();
            this.render();
        }
    }
    
    /**
     * Delete a task
     */
    deleteTask(taskId) {
        const taskIndex = this.tasks.findIndex(t => t.id === taskId);
        if (taskIndex > -1) {
            const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
            
            // Add removal animation
            if (taskElement) {
                taskElement.classList.add('removing');
                setTimeout(() => {
                    this.tasks.splice(taskIndex, 1);
                    this.saveTasks();
                    this.render();
                }, 250);
            } else {
                this.tasks.splice(taskIndex, 1);
                this.saveTasks();
                this.render();
            }
        }
    }
    
    /**
     * Start editing a task
     */
    editTask(taskId) {
        // Cancel any existing edit
        if (this.editingTaskId) {
            this.cancelEdit();
        }
        
        this.editingTaskId = taskId;
        this.renderTask(taskId);
        
        // Focus and select the edit input
        const editInput = document.querySelector(`[data-task-id="${taskId}"] .task-edit-input`);
        if (editInput) {
            editInput.focus();
            editInput.select();
        }
    }
    
    /**
     * Save task edit
     */
    saveEdit(taskId) {
        const editInput = document.querySelector(`[data-task-id="${taskId}"] .task-edit-input`);
        if (!editInput) return;
        
        const newText = editInput.value.trim();
        
        if (!newText) {
            this.showError('Task description cannot be empty.');
            editInput.focus();
            return;
        }
        
        if (newText.length > 100) {
            this.showError('Task description must be 100 characters or less.');
            editInput.focus();
            return;
        }
        
        // Check for duplicates (excluding current task)
        const isDuplicate = this.tasks.some(task => 
            task.id !== taskId && task.text.toLowerCase() === newText.toLowerCase()
        );
        
        if (isDuplicate) {
            this.showError('This task already exists.');
            editInput.focus();
            return;
        }
        
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.text = newText;
            this.editingTaskId = null;
            this.clearError();
            this.saveTasks();
            this.render();
            this.showTemporaryFeedback('Task updated successfully!');
        }
    }
    
    /**
     * Cancel task edit
     */
    cancelEdit() {
        this.editingTaskId = null;
        this.clearError();
        this.render();
    }
    
    /**
     * Set the current filter
     */
    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active filter button
        this.elements.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        this.render();
    }
    
    /**
     * Clear completed tasks
     */
    clearCompleted() {
        this.tasks = this.tasks.filter(task => !task.completed);
        this.saveTasks();
        this.render();
        this.showTemporaryFeedback('Completed tasks cleared!');
    }
    
    /**
     * Clear all tasks
     */
    clearAll() {
        this.tasks = [];
        this.editingTaskId = null;
        this.saveTasks();
        this.render();
        this.showTemporaryFeedback('All tasks cleared!');
    }
    
    /**
     * Show confirmation modal
     */
    confirmAction(title, message, action) {
        this.elements.modalTitle.textContent = title;
        this.elements.modalMessage.textContent = message;
        this.pendingAction = action;
        this.showModal();
    }
    
    /**
     * Execute confirmed action
     */
    executeConfirmedAction() {
        if (this.pendingAction) {
            this.pendingAction();
            this.pendingAction = null;
        }
        this.hideModal();
    }
    
    /**
     * Show modal
     */
    showModal() {
        this.elements.confirmModal.classList.add('show');
        this.elements.confirmModal.setAttribute('aria-hidden', 'false');
        this.elements.confirmYes.focus();
    }
    
    /**
     * Hide modal
     */
    hideModal() {
        this.elements.confirmModal.classList.remove('show');
        this.elements.confirmModal.setAttribute('aria-hidden', 'true');
        this.pendingAction = null;
    }
    
    /**
     * Show error message
     */
    showError(message) {
        this.elements.inputError.textContent = message;
        this.elements.inputError.style.display = 'block';
    }
    
    /**
     * Clear error message
     */
    clearError() {
        this.elements.inputError.textContent = '';
        this.elements.inputError.style.display = 'none';
    }
    
    /**
     * Show temporary feedback message
     */
    showTemporaryFeedback(message) {
        // Create or update feedback element
        let feedback = document.getElementById('tempFeedback');
        if (!feedback) {
            feedback = document.createElement('div');
            feedback.id = 'tempFeedback';
            feedback.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--success-color);
                color: white;
                padding: 12px 20px;
                border-radius: 6px;
                box-shadow: var(--shadow-lg);
                z-index: 1001;
                animation: slideInRight 0.3s ease-out;
                font-size: 14px;
                font-weight: 500;
            `;
            document.body.appendChild(feedback);
        }
        
        feedback.textContent = message;
        feedback.style.display = 'block';
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            if (feedback) {
                feedback.style.animation = 'slideOutRight 0.3s ease-in forwards';
                setTimeout(() => {
                    if (feedback && feedback.parentNode) {
                        feedback.parentNode.removeChild(feedback);
                    }
                }, 300);
            }
        }, 3000);
    }
    
    /**
     * Render the entire application
     */
    render() {
        this.renderTasks();
        this.renderStats();
        this.renderEmptyState();
        this.renderActionButtons();
    }
    
    /**
     * Render all tasks
     */
    renderTasks() {
        const filteredTasks = this.getFilteredTasks();
        
        this.elements.taskList.innerHTML = '';
        
        filteredTasks.forEach(task => {
            this.renderTask(task.id);
        });
    }
    
    /**
     * Render a single task
     */
    renderTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        const isEditing = this.editingTaskId === taskId;
        const isVisible = this.isTaskVisible(task);
        
        let existingElement = document.querySelector(`[data-task-id="${taskId}"]`);
        
        const taskElement = document.createElement('li');
        taskElement.className = `task-item ${task.completed ? 'completed' : ''} ${isEditing ? 'editing' : ''} ${!isVisible ? 'hidden' : ''}`;
        taskElement.dataset.taskId = taskId;
        taskElement.setAttribute('role', 'listitem');
        
        // Format deadline display
        const deadlineHTML = task.deadline ? this.formatDeadlineDisplay(task.deadline, task.completed) : '';
        
        if (isEditing) {
            taskElement.innerHTML = `
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} disabled>
                <div class="task-content">
                    <input type="text" class="task-edit-input" value="${this.escapeHtml(task.text)}" maxlength="100">
                    ${deadlineHTML}
                    <div class="task-actions">
                        <button class="task-btn save-btn" aria-label="Save task">Save</button>
                        <button class="task-btn cancel-btn" aria-label="Cancel edit">Cancel</button>
                    </div>
                </div>
            `;
        } else {
            taskElement.innerHTML = `
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} aria-label="Mark task as ${task.completed ? 'incomplete' : 'complete'}">
                <div class="task-content">
                    <span class="task-text ${task.completed ? 'completed' : ''}" title="Double-click to edit">${this.escapeHtml(task.text)}</span>
                    ${deadlineHTML}
                    <div class="task-actions">
                        <button class="task-btn edit-btn" aria-label="Edit task">Edit</button>
                        <button class="task-btn delete-btn" aria-label="Delete task">Delete</button>
                    </div>
                </div>
            `;
        }
        
        if (existingElement) {
            existingElement.replaceWith(taskElement);
        } else {
            this.elements.taskList.appendChild(taskElement);
        }
    }
    
    /**
     * Render task statistics
     */
    renderStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        const remaining = total - completed;
        
        let countText;
        if (total === 0) {
            countText = 'No tasks';
        } else if (remaining === 0) {
            countText = 'All tasks completed!';
        } else if (remaining === 1) {
            countText = '1 task remaining';
        } else {
            countText = `${remaining} tasks remaining`;
        }
        
        this.elements.taskCount.textContent = countText;
    }
    
    /**
     * Render empty state
     */
    renderEmptyState() {
        const filteredTasks = this.getFilteredTasks();
        const isEmpty = filteredTasks.length === 0;
        
        this.elements.emptyState.classList.toggle('hidden', !isEmpty);
        
        if (isEmpty && this.tasks.length > 0) {
            // Show filter-specific empty state
            const emptyMessages = {
                active: 'No active tasks! 🎉',
                completed: 'No completed tasks yet.'
            };
            
            const message = emptyMessages[this.currentFilter];
            if (message) {
                this.elements.emptyState.querySelector('h3').textContent = message;
                this.elements.emptyState.querySelector('p').textContent = 
                    this.currentFilter === 'active' ? 'All your tasks are completed!' : 'Complete some tasks to see them here.';
            }
        } else if (isEmpty) {
            // Reset to default empty state
            this.elements.emptyState.querySelector('h3').textContent = 'No tasks yet';
            this.elements.emptyState.querySelector('p').textContent = 'Add a task above to get started!';
        }
    }
    
    /**
     * Render action buttons state
     */
    renderActionButtons() {
        const hasCompleted = this.tasks.some(task => task.completed);
        const hasTasks = this.tasks.length > 0;
        
        this.elements.clearCompleted.disabled = !hasCompleted;
        this.elements.clearAll.disabled = !hasTasks;
    }
    
    /**
     * Get filtered tasks based on current filter
     */
    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'active':
                return this.tasks.filter(task => !task.completed);
            case 'completed':
                return this.tasks.filter(task => task.completed);
            default:
                return this.tasks;
        }
    }
    
    /**
     * Check if a task should be visible based on current filter
     */
    isTaskVisible(task) {
        switch (this.currentFilter) {
            case 'active':
                return !task.completed;
            case 'completed':
                return task.completed;
            default:
                return true;
        }
    }

    /**
     * Format deadline display for tasks
     */
    formatDeadlineDisplay(deadline, isCompleted) {
        if (!deadline) return '';
        
        const deadlineDate = new Date(deadline);
        const now = new Date();
        const isOverdue = deadlineDate < now && !isCompleted;
        const timeDiff = deadlineDate.getTime() - now.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        const formattedDate = deadlineDate.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        let statusClass = 'task-deadline';
        let statusText = '';
        
        if (isCompleted) {
            statusClass += ' completed';
            statusText = '✓ ';
        } else if (isOverdue) {
            statusClass += ' overdue';
            statusText = '⚠️ Overdue: ';
        } else if (daysDiff <= 1) {
            statusClass += ' urgent';
            statusText = '🔥 Due soon: ';
        } else {
            statusText = '📅 Due: ';
        }
        
        return `<div class="${statusClass}">${statusText}${formattedDate}</div>`;
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }    /**
     * Save tasks to localStorage
     */
    saveTasks() {
        try {
            const dataToSave = {
                tasks: this.tasks,
                taskIdCounter: this.taskIdCounter,
                lastSaved: new Date().toISOString()
            };
            localStorage.setItem('todoApp', JSON.stringify(dataToSave));
        } catch (error) {
            console.error('Failed to save tasks:', error);
            this.showError('Failed to save tasks. Storage might be full.');
        }
    }
    
    /**
     * Load tasks from localStorage
     */
    loadTasks() {
        try {
            const savedData = localStorage.getItem('todoApp');
            if (savedData) {
                const data = JSON.parse(savedData);
                this.tasks = data.tasks || [];
                this.taskIdCounter = data.taskIdCounter || 0;
                
                // Validate loaded data
                this.tasks = this.tasks.filter(task => 
                    task && typeof task.text === 'string' && typeof task.id === 'number'
                );
            }
        } catch (error) {
            console.error('Failed to load tasks:', error);
            this.tasks = [];
            this.taskIdCounter = 0;
        }
    }
    
    /**
     * Export tasks as JSON
     */
    exportTasks() {
        const dataToExport = {
            tasks: this.tasks,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        const dataStr = JSON.stringify(dataToExport, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `todo-tasks-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(link.href);
    }
    
    /**
     * Get application statistics
     */
    getStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        const active = total - completed;
        
        return {
            total,
            completed,
            active,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
        };
    }
}

// Add CSS animations for feedback
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.todoApp = new TodoApp();
    
    // Add some helpful console methods for debugging
    console.log('Todo App initialized! Try these commands:');
    console.log('todoApp.getStats() - Get app statistics');
    console.log('todoApp.exportTasks() - Export tasks as JSON');
    console.log('todoApp.tasks - View all tasks');
});

// Service Worker registration for offline functionality (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
