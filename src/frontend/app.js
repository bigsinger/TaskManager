// app.js - Frontend JavaScript for CRUD operations

// Determine API URL based on current page location
// This works for both localhost and LAN access
const currentOrigin = window.location.origin;
const API_URL = `${currentOrigin.replace(':3001', ':3000')}/api/tasks`;

// Translations
const translations = {
    en: {
        title: 'Task Manager',
        subtitle: 'My Tasks',
        newTask: '+ New Task',
        editTask: 'Edit Task',
        settings: 'Settings',
        theme: 'Theme',
        light: 'Light',
        dark: 'Dark',
        system: 'System',
        language: 'Language',
        description: 'Description',
        status: 'Status',
        pending: 'Pending',
        inProgress: 'In Progress',
        completed: 'Completed',
        saveTask: 'Save Task',
        cancel: 'Cancel',
        edit: 'Edit',
        delete: 'Delete',
        loading: 'Loading tasks...',
        saving: 'Saving...',
        noTasks: 'No tasks yet',
        noTasksDesc: 'Click "+ New Task" to create your first task.',
        created: 'Created:',
        confirmDelete: 'Are you sure you want to delete this task?',
        deleteSuccess: 'Task deleted successfully',
        saveError: 'Failed to save task. Please try again.',
        deleteError: 'Failed to delete task. Please try again.',
        loadError: 'Failed to load task data. Please try again.',
        titleRequired: 'Title is required',
        save: 'Save',
        showing: 'Showing',
        of: 'of',
        first: 'First',
        prev: 'Previous',
        next: 'Next',
        last: 'Last',
        itemsPerPage: 'Items per page:',
        all: 'All',
        filterAll: 'All',
        filterPending: 'Pending',
        filterInProgress: 'In Progress',
        filterCompleted: 'Completed',
        tags: 'Tags',
        noTags: 'No tags yet',
        addTag: 'Add tag',
        removeTag: 'Remove tag'
    },
    zh: {
        title: '任务管理器',
        subtitle: '我的任务',
        newTask: '+ 新建任务',
        editTask: '编辑任务',
        settings: '设置',
        theme: '主题',
        light: '浅色',
        dark: '深色',
        system: '跟随系统',
        language: '语言',
        description: '描述',
        status: '状态',
        pending: '待处理',
        inProgress: '进行中',
        completed: '已完成',
        saveTask: '保存任务',
        cancel: '取消',
        edit: '编辑',
        delete: '删除',
        loading: '加载任务中...',
        saving: '保存中...',
        noTasks: '暂无任务',
        noTasksDesc: '点击"+ 新建任务"创建您的第一个任务。',
        created: '创建时间:',
        confirmDelete: '确定要删除此任务吗？',
        deleteSuccess: '任务删除成功',
        saveError: '保存任务失败，请重试。',
        deleteError: '删除任务失败，请重试。',
        loadError: '加载任务数据失败，请重试。',
        titleRequired: '标题不能为空',
        save: '保存',
        showing: '显示',
        of: '共',
        first: '首页',
        prev: '上一页',
        next: '下一页',
        last: '末页',
        itemsPerPage: '每页显示:',
        all: '全部',
        filterAll: '全部',
        filterPending: '待处理',
        filterInProgress: '进行中',
        filterCompleted: '已完成',
        tags: '标签',
        noTags: '暂无标签',
        addTag: '添加标签',
        removeTag: '移除标签'
    }
};

// DOM Elements
const taskList = document.getElementById('task-list');
const modal = document.getElementById('task-form-modal');
const settingsModal = document.getElementById('settings-modal');
const showFormBtn = document.getElementById('show-form-btn');
const settingsBtn = document.getElementById('settings-btn');
const closeBtns = document.querySelectorAll('.close');
const cancelBtn = document.getElementById('cancel-btn');
const taskForm = document.getElementById('task-form');
const formTitle = document.getElementById('form-title');
const themeSelect = document.getElementById('theme-select');
const languageSelect = document.getElementById('language-select');
const subtitleInput = document.getElementById('subtitle-input');
const subtitleElement = document.getElementById('subtitle');
const saveSettingsBtn = document.getElementById('save-settings-btn');
const cancelSettingsBtn = document.getElementById('cancel-settings-btn');
const filterButtons = document.querySelectorAll('.filter-btn');
const tagsInput = document.getElementById('tags-input');
const tagsDisplay = document.getElementById('tags-display');
const tagCloud = document.getElementById('tag-cloud');

// Pagination elements
const pagination = document.getElementById('pagination');
const paginationStart = document.getElementById('pagination-start');
const paginationEnd = document.getElementById('pagination-end');
const paginationTotal = document.getElementById('pagination-total');
const paginationPages = document.getElementById('pagination-pages');
const firstPageBtn = document.getElementById('first-page');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const lastPageBtn = document.getElementById('last-page');
const pageSizeSelect = document.getElementById('page-size');

// Initialize
let currentLanguage = localStorage.getItem('language') || 'en';
let currentTheme = localStorage.getItem('theme') || 'system';
let currentSubtitle = localStorage.getItem('subtitle') || t('subtitle');
let selectedFilters = new Set();
let selectedTags = new Set();
let currentPage = 1;
let pageSize = parseInt(localStorage.getItem('pageSize') || '20');
let totalTasks = 0;
let totalPages = 0;
let allTasks = [];
let currentTags = [];
let selectedTaskId = null;

// Load tasks on page load
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    applyTheme();
    applyLanguage();
    applySubtitle();
    initPagination();
});

// Event Listeners
showFormBtn.addEventListener('click', () => showForm(false));
settingsBtn.addEventListener('click', () => {
    subtitleInput.value = currentSubtitle;
    settingsModal.classList.add('show');
});
closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        modal.classList.remove('show');
        settingsModal.classList.remove('show');
    });
});
cancelBtn.addEventListener('click', () => hideForm());
taskForm.addEventListener('submit', handleFormSubmit);
themeSelect.addEventListener('change', (e) => {
    currentTheme = e.target.value;
    localStorage.setItem('theme', currentTheme);
    applyTheme();
});
languageSelect.addEventListener('change', (e) => {
    currentLanguage = e.target.value;
    localStorage.setItem('language', currentLanguage);
    applyLanguage();
    loadTasks(); // Reload tasks to update translations
});
saveSettingsBtn.addEventListener('click', saveSettings);
cancelSettingsBtn.addEventListener('click', () => {
    settingsModal.classList.remove('show');
});

// Filter buttons
filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const status = btn.getAttribute('data-status');
        if (selectedFilters.has(status)) {
            selectedFilters.delete(status);
            btn.classList.remove('active');
        } else {
            selectedFilters.add(status);
            btn.classList.add('active');
        }
        currentPage = 1;
        loadTasks();
    });
});

// Pagination events
firstPageBtn.addEventListener('click', () => goToPage(1));
prevPageBtn.addEventListener('click', () => goToPage(currentPage - 1));
nextPageBtn.addEventListener('click', () => goToPage(currentPage + 1));
lastPageBtn.addEventListener('click', () => goToPage(totalPages));
pageSizeSelect.addEventListener('change', (e) => {
    pageSize = parseInt(e.target.value);
    localStorage.setItem('pageSize', pageSize);
    currentPage = 1;
    loadTasks();
});

// Tags input
tagsInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        const tag = tagsInput.value.trim();
        if (tag && !currentTags.includes(tag)) {
            currentTags.push(tag);
            renderTags();
            tagsInput.value = '';
        }
    }
});

tagsInput.addEventListener('blur', () => {
    const tag = tagsInput.value.trim();
    if (tag && !currentTags.includes(tag)) {
        currentTags.push(tag);
        renderTags();
        tagsInput.value = '';
    }
});

// Close modals when clicking outside
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        hideForm();
    }
});
settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
        settingsModal.classList.remove('show');
    }
});

// Apply theme
function applyTheme() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = currentTheme === 'system' ? (prefersDark ? 'dark' : 'light') : currentTheme;
    document.documentElement.setAttribute('data-theme', theme);
    themeSelect.value = currentTheme;
}

// Apply language
function applyLanguage() {
    const t = translations[currentLanguage];
    document.documentElement.lang = currentLanguage;
    languageSelect.value = currentLanguage;
    
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) {
            el.textContent = t[key];
        }
    });
    
    // Update filter buttons
    filterButtons.forEach(btn => {
        const status = btn.getAttribute('data-status');
        const key = 'filter' + status.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
        if (t[key]) {
            btn.textContent = t[key];
        }
    });
}

// Apply subtitle
function applySubtitle() {
    subtitleElement.textContent = currentSubtitle;
}

// Save settings
function saveSettings() {
    const newSubtitle = subtitleInput.value.trim();
    if (newSubtitle) {
        currentSubtitle = newSubtitle;
        localStorage.setItem('subtitle', currentSubtitle);
        applySubtitle();
    }
    settingsModal.classList.remove('show');
}

// Get translation
function t(key) {
    return translations[currentLanguage][key] || key;
}

// Load all tasks from API
async function loadTasks() {
    taskList.innerHTML = `<p class="loading">${t('loading')}</p>`;
    
    try {
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        // Backend returns { tasks: [], total: 0, page: 1, limit: 20, totalPages: 0 }
        allTasks = data.tasks || [];
        totalTasks = allTasks.length;
        
        // Filter tasks
        const filteredTasks = filterTasks(allTasks);
        
        // Calculate pagination
        totalPages = Math.ceil(filteredTasks.length / pageSize);
        if (currentPage > totalPages && totalPages > 0) {
            currentPage = totalPages;
        }
        
        // Get paginated tasks
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedTasks = filteredTasks.slice(startIndex, endIndex);
        
        renderTasks(paginatedTasks);
        updatePagination(filteredTasks.length, startIndex + 1, Math.min(endIndex, filteredTasks.length));
        renderTagCloud();
    } catch (error) {
        console.error('Error loading tasks:', error);
        taskList.innerHTML = `<p class="error">${t('loadError')}</p>`;
    }
}

// Filter tasks based on selected filters
function filterTasks(tasks) {
    let filtered = tasks;
    
    // Filter by status
    if (selectedFilters.size > 0) {
        filtered = filtered.filter(task => selectedFilters.has(task.status));
    }
    
    // Filter by tags
    if (selectedTags.size > 0) {
        filtered = filtered.filter(task => {
            let tagsArray = [];
            if (task.tags) {
                try {
                    tagsArray = typeof task.tags === 'string' ? JSON.parse(task.tags) : task.tags;
                } catch (e) {
                    tagsArray = [];
                }
            }
            
            // Check if task has any of the selected tags
            return tagsArray.some(tag => selectedTags.has(tag));
        });
    }
    
    return filtered;
}

// Render tasks to HTML
function renderTasks(tasks) {
    if (tasks.length === 0) {
        taskList.innerHTML = `
            <div class="empty-state">
                <h2>${t('noTasks')}</h2>
                <p>${t('noTasksDesc')}</p>
            </div>
        `;
        return;
    }

    taskList.innerHTML = tasks.map(task => {
        // Convert status to camelCase for translation lookup
        const statusKey = task.status.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        
        // Parse tags from JSON string
        let tagsArray = [];
        if (task.tags) {
            try {
                tagsArray = typeof task.tags === 'string' ? JSON.parse(task.tags) : task.tags;
            } catch (e) {
                tagsArray = [];
            }
        }
        
        // Render tags
        const tagsHtml = tagsArray && tagsArray.length > 0 
            ? `<div class="task-tags">${tagsArray.map(tag => `<span class="task-tag">${escapeHtml(tag)}</span>`).join('')}</div>`
            : '';
        
        // Check if this task is selected
        const isSelected = selectedTaskId === task.id;
        
        return `
        <div class="task-item status-${task.status} ${isSelected ? 'selected' : ''}" 
             data-task-id="${task.id}"
             onclick="selectTask('${task.id}')">
            <div class="task-header">
                <h3 class="task-title">${escapeHtml(task.title)}</h3>
                <span class="status-badge status-${task.status}">
                    ${t(statusKey)}
                </span>
            </div>
            <div class="task-description">
                ${task.description ? escapeHtml(task.description) : ''}
            </div>
            ${tagsHtml}
            <div class="task-meta">
                ${t('created')} ${new Date(task.createdAt + 'Z').toLocaleString()}
            </div>
            <div class="task-actions">
                <button class="btn btn-secondary" onclick="event.stopPropagation(); editTask('${task.id}')">${t('edit')}</button>
                <button class="btn btn-danger" onclick="event.stopPropagation(); deleteTask('${task.id}')">${t('delete')}</button>
            </div>
        </div>
    `}).join('');
}

// Show task form
function showForm(isEdit = false, taskId = null) {
    modal.classList.add('show');
    
    if (isEdit && taskId) {
        formTitle.textContent = t('editTask');
        loadTaskData(taskId);
    } else {
        formTitle.textContent = t('newTask');
        taskForm.reset();
        document.getElementById('task-id').value = '';
        currentTags = [];
        renderTags();
        
        // Clear selected state when creating new task
        selectedTaskId = null;
        document.querySelectorAll('.task-item').forEach(el => {
            el.classList.remove('selected');
        });
    }
}

// Hide task form
function hideForm() {
    modal.classList.remove('show');
    taskForm.reset();
    document.getElementById('task-id').value = '';
    currentTags = [];
    renderTags();
    
    // Clear selected state when closing form
    selectedTaskId = null;
    document.querySelectorAll('.task-item').forEach(el => {
        el.classList.remove('selected');
    });
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const taskId = document.getElementById('task-id').value;
    const taskData = {
        title: document.getElementById('task-title').value,
        description: document.getElementById('task-description').value,
        status: document.getElementById('task-status').value,
        tags: JSON.stringify(currentTags)
    };

    // Validate form
    if (!taskData.title || taskData.title.trim() === '') {
        alert(t('titleRequired') || 'Title is required');
        return;
    }

    // Disable submit button
    const submitBtn = taskForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = t('saving') || 'Saving...';

    try {
        if (taskId) {
            // Update existing task
            await updateTask(taskId, taskData);
        } else {
            // Create new task
            await createTask(taskData);
        }
        
        // Close modal without clearing selected state
        modal.classList.remove('show');
        taskForm.reset();
        document.getElementById('task-id').value = '';
        currentTags = [];
        renderTags();
        
        // Only clear selected state if creating new task
        if (!taskId) {
            selectedTaskId = null;
            document.querySelectorAll('.task-item').forEach(el => {
                el.classList.remove('selected');
            });
        }
        
        // Update tag cloud
        renderTagCloud();
    } catch (error) {
        console.error('Error saving task:', error);
        alert(`${t('saveError')}\n\n${error.message}`);
    } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// Create new task
async function createTask(taskData) {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
    });

    if (!response.ok) {
        const errorText = await response.text();
        
        let errorData;
        try {
            errorData = JSON.parse(errorText);
        } catch (e) {
            errorData = { message: errorText };
        }
        
        throw new Error(errorData.error?.message || errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
}

// Update existing task
async function updateTask(taskId, taskData) {
    const response = await fetch(`${API_URL}/${taskId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
    });

    if (!response.ok) {
        const errorText = await response.text();
        
        let errorData;
        try {
            errorData = JSON.parse(errorText);
        } catch (e) {
            errorData = { message: errorText };
        }
        
        throw new Error(errorData.error?.message || errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const updatedTask = await response.json();
    
    // Update the task in the local array instead of reloading
    const index = allTasks.findIndex(task => task.id === taskId);
    if (index !== -1) {
        allTasks[index] = updatedTask;
    }
    
    // Re-render with current filters and pagination
    const filteredTasks = filterTasks(allTasks);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedTasks = filteredTasks.slice(startIndex, endIndex);
    renderTasks(paginatedTasks);
    updatePagination(filteredTasks.length, startIndex + 1, Math.min(endIndex, filteredTasks.length));
    
    // Restore selected state
    if (selectedTaskId) {
        const selectedElement = document.querySelector(`[data-task-id="${selectedTaskId}"]`);
        if (selectedElement) {
            selectedElement.classList.add('selected');
        }
    }
    
    return updatedTask;
}

// Edit task
async function editTask(taskId) {
    // Set selected task
    selectedTaskId = taskId;
    
    // Update UI to show selected state
    document.querySelectorAll('.task-item').forEach(el => {
        el.classList.remove('selected');
    });
    const selectedElement = document.querySelector(`[data-task-id="${taskId}"]`);
    if (selectedElement) {
        selectedElement.classList.add('selected');
    }
    
    showForm(true, taskId);
}

// Select task
function selectTask(taskId) {
    // Toggle selection
    if (selectedTaskId === taskId) {
        selectedTaskId = null;
    } else {
        selectedTaskId = taskId;
    }
    
    // Update UI
    document.querySelectorAll('.task-item').forEach(el => {
        el.classList.remove('selected');
    });
    
    if (selectedTaskId) {
        const selectedElement = document.querySelector(`[data-task-id="${selectedTaskId}"]`);
        if (selectedElement) {
            selectedElement.classList.add('selected');
        }
    }
}

// Load task data into form
async function loadTaskData(taskId) {
    try {
        const response = await fetch(`${API_URL}/${taskId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const task = await response.json();
        
        document.getElementById('task-id').value = task.id;
        document.getElementById('task-title').value = task.title;
        document.getElementById('task-description').value = task.description || '';
        document.getElementById('task-status').value = task.status;
        
        // Parse tags from JSON string
        if (task.tags) {
            try {
                currentTags = typeof task.tags === 'string' ? JSON.parse(task.tags) : task.tags;
            } catch (e) {
                currentTags = [];
            }
        } else {
            currentTags = [];
        }
        
        renderTags();
    } catch (error) {
        console.error('Error loading task:', error);
        alert(`${t('loadError')}\n\n${error.message}`);
        hideForm();
    }
}

// Render tags in the form
function renderTags() {
    tagsDisplay.innerHTML = currentTags.map(tag => `
        <span class="tag-item">
            ${escapeHtml(tag)}
            <button type="button" class="tag-remove" onclick="removeTag('${escapeHtml(tag)}')">&times;</button>
        </span>
    `).join('');
}

// Remove tag
function removeTag(tag) {
    currentTags = currentTags.filter(t => t !== tag);
    renderTags();
}

// Render tag cloud
function renderTagCloud() {
    // Count tag frequencies
    const tagCounts = {};
    allTasks.forEach(task => {
        let tagsArray = [];
        if (task.tags) {
            try {
                tagsArray = typeof task.tags === 'string' ? JSON.parse(task.tags) : task.tags;
            } catch (e) {
                tagsArray = [];
            }
        }
        
        if (Array.isArray(tagsArray)) {
            tagsArray.forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        }
    });

    // Sort tags by frequency (descending) and then alphabetically
    const sortedTags = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

    if (sortedTags.length === 0) {
        tagCloud.innerHTML = `<p>${t('noTags')}</p>`;
        return;
    }

    // Calculate font sizes based on frequency
    const maxCount = Math.max(...sortedTags.map(([_, count]) => count));
    const minCount = Math.min(...sortedTags.map(([_, count]) => count));
    
    tagCloud.innerHTML = sortedTags.map(([tag, count]) => {
        // Calculate font size (12px to 24px)
        const fontSize = minCount === maxCount 
            ? 16 
            : 12 + ((count - minCount) / (maxCount - minCount)) * 12;
        
        // Calculate opacity (0.6 to 1.0)
        const opacity = minCount === maxCount 
            ? 1.0 
            : 0.6 + ((count - minCount) / (maxCount - minCount)) * 0.4;
        
        // Check if this tag is selected
        const isSelected = selectedTags.has(tag);
        
        return `
            <span class="tag-cloud-item ${isSelected ? 'selected' : ''}" 
                  style="font-size: ${fontSize}px; opacity: ${opacity};"
                  title="${count} tasks"
                  onclick="toggleTagFilter('${escapeHtml(tag)}')">
                ${escapeHtml(tag)}
            </span>
        `;
    }).join('');
}

// Toggle tag filter
function toggleTagFilter(tag) {
    if (selectedTags.has(tag)) {
        selectedTags.delete(tag);
    } else {
        selectedTags.add(tag);
    }
    
    // Reset to first page when filter changes
    currentPage = 1;
    
    // Reload tasks
    loadTasks();
}

// Delete task
async function deleteTask(taskId) {
    if (!confirm(t('confirmDelete'))) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${taskId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        // Find and remove the task element with animation
        const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
        if (taskElement) {
            // Add fade-out animation
            taskElement.style.transition = 'all 0.3s ease';
            taskElement.style.opacity = '0';
            taskElement.style.transform = 'translateX(-20px)';
            
            // Remove element after animation
            setTimeout(() => {
                // Remove from local array
                allTasks = allTasks.filter(task => task.id !== taskId);
                
                // Remove element from DOM
                taskElement.remove();
                
                // Update pagination and tag cloud
                const filteredTasks = filterTasks(allTasks);
                const startIndex = (currentPage - 1) * pageSize;
                const endIndex = startIndex + pageSize;
                const paginatedTasks = filteredTasks.slice(startIndex, endIndex);
                
                // If current page is empty after deletion, go to previous page
                if (paginatedTasks.length === 0 && currentPage > 1) {
                    currentPage--;
                    loadTasks();
                } else {
                    renderTasks(paginatedTasks);
                    updatePagination(filteredTasks.length, startIndex + 1, Math.min(endIndex, filteredTasks.length));
                    renderTagCloud();
                }
            }, 300);
        } else {
            // If element not found, reload tasks
            allTasks = allTasks.filter(task => task.id !== taskId);
            loadTasks();
        }
    } catch (error) {
        console.error('Error deleting task:', error);
        alert(`${t('deleteError')}\n\n${error.message}`);
    }
}

// Helper function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize pagination
function initPagination() {
    pageSizeSelect.value = pageSize;
}

// Go to specific page
function goToPage(page) {
    if (page < 1 || page > totalPages) {
        return;
    }
    currentPage = page;
    loadTasks();
}

// Update pagination display
function updatePagination(total, start, end) {
    paginationStart.textContent = total > 0 ? start : 0;
    paginationEnd.textContent = end;
    paginationTotal.textContent = total;
    
    // Update button states
    firstPageBtn.disabled = currentPage === 1;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
    lastPageBtn.disabled = currentPage === totalPages || totalPages === 0;
    
    // Generate page numbers
    generatePageNumbers();
    
    // Show/hide pagination
    if (total === 0) {
        pagination.style.display = 'none';
    } else {
        pagination.style.display = 'flex';
    }
}

// Generate page numbers
function generatePageNumbers() {
    paginationPages.innerHTML = '';
    
    if (totalPages === 0) {
        return;
    }
    
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // First page
    if (startPage > 1) {
        addPageButton(1);
        if (startPage > 2) {
            addEllipsis();
        }
    }
    
    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
        addPageButton(i);
    }
    
    // Last page
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            addEllipsis();
        }
        addPageButton(totalPages);
    }
}

// Add page button
function addPageButton(page) {
    const button = document.createElement('button');
    button.className = 'pagination-page';
    button.textContent = page;
    button.classList.toggle('active', page === currentPage);
    button.addEventListener('click', () => goToPage(page));
    paginationPages.appendChild(button);
}

// Add ellipsis
function addEllipsis() {
    const ellipsis = document.createElement('span');
    ellipsis.className = 'pagination-ellipsis';
    ellipsis.textContent = '...';
    paginationPages.appendChild(ellipsis);
}
