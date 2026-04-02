/**
 * 抽屉式任务卡片交互
 *
 * 功能：
 * - 右滑切换任务状态（抽屉式 + 橡皮筋效果）
 * - 左滑查看任务时间线（抽屉式）
 */

const DRAWER_DRAG_THRESHOLD = 100; // 拖拽阈值（像素）
const MAX_DRAG_DISTANCE = 300; // 最大拖拽距离

let drawerIsDragging = false;
let drawerStartX = 0;
let drawerStartY = 0;
let drawerTaskElement = null;
let drawerTaskId = null;

/**
 * 初始化抽屉式交互
 */
function initDrawerInteraction() {
    const taskList = document.getElementById('task-list');
    if (!taskList) return;

    // 触摸事件（移动端）
    taskList.addEventListener('touchstart', handleDrawerTouchStart, { passive: false });
    taskList.addEventListener('touchmove', handleDrawerTouchMove, { passive: false });
    taskList.addEventListener('touchend', handleDrawerTouchEnd);
    taskList.addEventListener('touchcancel', handleDrawerTouchCancel);

    // 鼠标事件（PC端）
    taskList.addEventListener('mousedown', handleDrawerMouseDown);

    console.log('抽屉式交互已初始化');
}

/**
 * 触摸开始
 */
function handleDrawerTouchStart(e) {
    const drawerContainer = e.target.closest('.drawer-container');
    const closeButton = e.target.closest('.timeline-close');
    const actionButton = e.target.closest('.task-actions button');
    const favoriteButton = e.target.closest('.btn-favorite');

    // 如果点击的是关闭按钮、操作按钮或收藏按钮，不启动拖拽
    if (closeButton || actionButton || favoriteButton) return;
    if (!drawerContainer) return;

    drawerIsDragging = true;
    drawerStartX = e.touches[0].clientX;
    drawerStartY = e.touches[0].clientY;
    drawerTaskElement = drawerContainer;
    drawerTaskId = drawerContainer.getAttribute('data-task-id');
}

/**
 * 触摸移动
 */
function handleDrawerTouchMove(e) {
    if (!drawerIsDragging) return;
    e.preventDefault();

    handleDrawerDragMove(e.touches[0].clientX, e.touches[0].clientY);
}

/**
 * 触摸结束
 */
function handleDrawerTouchEnd(e) {
    if (!drawerIsDragging) return;
    handleDrawerDragEnd(e.changedTouches[0].clientX);
}

/**
 * 触摸取消
 */
function handleDrawerTouchCancel(e) {
    if (!drawerIsDragging) return;
    resetDrawerDragState();
}

/**
 * 鼠标按下
 */
function handleDrawerMouseDown(e) {
    const drawerContainer = e.target.closest('.drawer-container');
    const closeButton = e.target.closest('.timeline-close');
    const actionButton = e.target.closest('.task-actions button');
    const favoriteButton = e.target.closest('.btn-favorite');

    // 如果点击的是关闭按钮、操作按钮或收藏按钮，不启动拖拽
    if (closeButton || actionButton || favoriteButton) return;
    if (!drawerContainer) return;

    drawerIsDragging = true;
    drawerStartX = e.clientX;
    drawerStartY = e.clientY;
    drawerTaskElement = drawerContainer;
    drawerTaskId = drawerContainer.getAttribute('data-task-id');

    // 添加鼠标移动和释放监听器到document
    document.addEventListener('mousemove', handleDrawerMouseMove);
    document.addEventListener('mouseup', handleDrawerMouseUp);
}

/**
 * 鼠标移动
 */
function handleDrawerMouseMove(e) {
    if (!drawerIsDragging) return;
    handleDrawerDragMove(e.clientX, e.clientY);
}

/**
 * 鼠标释放
 */
function handleDrawerMouseUp(e) {
    if (!drawerIsDragging) return;

    document.removeEventListener('mousemove', handleDrawerMouseMove);
    document.removeEventListener('mouseup', handleDrawerMouseUp);

    handleDrawerDragEnd(e.clientX);
}

/**
 * 处理拖拽移动
 */
function handleDrawerDragMove(currentX, currentY) {
    if (!drawerTaskElement) return;

    const deltaX = currentX - drawerStartX;
    const deltaY = currentY - drawerStartY;

    // 只允许水平拖拽，如果垂直移动太多则取消拖拽
    if (Math.abs(deltaY) > Math.abs(deltaX) * 2) {
        resetDrawerDragState();
        return;
    }

    // 限制最大拖拽距离
    const clampedDeltaX = Math.max(-MAX_DRAG_DISTANCE, Math.min(MAX_DRAG_DISTANCE, deltaX));

    // 应用CSS变量用于动画
    drawerTaskElement.style.setProperty('--drag-x', `${clampedDeltaX}px`);

    // 根据拖拽方向添加样式类
    if (clampedDeltaX > 0) {
        drawerTaskElement.classList.add('dragging-right');
        drawerTaskElement.classList.remove('dragging-left');
    } else if (clampedDeltaX < 0) {
        drawerTaskElement.classList.add('dragging-left');
        drawerTaskElement.classList.remove('dragging-right');
    } else {
        drawerTaskElement.classList.remove('dragging-right', 'dragging-left');
    }
}

/**
 * 处理拖拽结束
 */
async function handleDrawerDragEnd(endX) {
    if (!drawerTaskElement) return;

    const deltaX = endX - drawerStartX;
    const task = allTasks.find(t => t.id === drawerTaskId);

    if (Math.abs(deltaX) > DRAWER_DRAG_THRESHOLD) {
        if (task) {
            if (deltaX > 0) {
                // 右滑：切换任务状态
                await handleDrawerSwipeRight(task);
            } else {
                // 左滑：显示时间线
                await handleDrawerSwipeLeft(task);
            }
        }
    }

    // 橡皮筋效果：回弹到原位
    resetDrawerDragState();
}

/**
 * 处理右滑（切换任务状态）
 */
async function handleDrawerSwipeRight(task) {
    console.log('Drawer swipe right on task:', task.id);

    // 显示状态抽屉
    const statusDrawer = drawerTaskElement?.querySelector('.status-drawer');
    if (statusDrawer) {
        statusDrawer.classList.add('open');

        // 1.5秒后切换状态
        setTimeout(async () => {
            statusDrawer.classList.remove('open');

            // 循环切换状态：pending → in-progress → completed → pending
            const statusCycle = ['pending', 'in-progress', 'completed'];
            const currentIndex = statusCycle.indexOf(task.status);
            const nextIndex = (currentIndex + 1) % statusCycle.length;
            const newStatus = statusCycle[nextIndex];

            // 更新任务状态
            await updateTaskStatus(task.id, newStatus);

            // 显示提示
            const statusLabels = {
                'pending': '未开始',
                'in-progress': '进行中',
                'completed': '已完成'
            };
            showToast(`状态已切换为：${statusLabels[newStatus]}`, 'success');
        }, 1500);
    }
}

/**
 * 处理左滑（显示时间线）
 */
async function handleDrawerSwipeLeft(task) {
    console.log('Drawer swipe left on task:', task.id);

    // 打开时间线抽屉
    await openTimelineDrawer(task.id);

    // 显示提示
    showToast('查看任务时间线', 'info');
}

/**
 * 打开时间线抽屉
 */
async function openTimelineDrawer(taskId) {
    const drawerContainer = document.querySelector(`.drawer-container[data-task-id="${taskId}"]`);
    const timelineDrawer = drawerContainer?.querySelector('.timeline-drawer');
    const timelineContainer = document.getElementById(`timeline-${taskId}`);

    if (!drawerContainer || !timelineDrawer || !timelineContainer) return;

    // 计算时间线抽屉的位置和高度
    const containerRect = drawerContainer.getBoundingClientRect();
    const taskList = document.getElementById('task-list');
    const taskListRect = taskList ? taskList.getBoundingClientRect() : null;
    
    if (taskListRect) {
        // 设置抽屉为fixed定位，覆盖从任务到任务列表底部的区域
        timelineDrawer.style.position = 'fixed';
        timelineDrawer.style.top = `${containerRect.top}px`;
        timelineDrawer.style.left = `${containerRect.right}px`;
        timelineDrawer.style.width = `${Math.min(taskListRect.right - containerRect.right, 600)}px`;
        timelineDrawer.style.height = `${taskListRect.bottom - containerRect.top}px`;
        timelineDrawer.style.zIndex = '1000';
    }

    // 打开抽屉
    timelineDrawer.classList.add('open');

    // 加载时间线数据
    try {
        const headers = addAuthHeader();
        const response = await fetch(`${API_URL}/${taskId}/activities`, { headers });

        if (response.ok) {
            const data = await response.json();
            const activities = data.data || [];

            if (activities.length === 0) {
                timelineContainer.innerHTML = `
                    <div class="timeline-empty">
                        <div class="icon">📝</div>
                        <p>暂无活动记录</p>
                    </div>
                `;
            } else {
                const actionLabels = {
                    'created': '创建任务',
                    'updated': '更新任务',
                    'deleted': '删除任务',
                    'status_changed': '状态变更',
                    'commented': '评论',
                    'assigned': '分配',
                    'favorited': '收藏',
                    'unfavorited': '取消收藏'
                };

                timelineContainer.innerHTML = activities.map(activity => {
                    const actionLabel = actionLabels[activity.action] || activity.action;
                    const time = formatDate(activity.createdAt);

                    return `
                        <div class="timeline-item">
                            <div class="timeline-time">${time}</div>
                            <div class="timeline-content">
                                <div class="timeline-action">${actionLabel}</div>
                                ${activity.new_value ? `<div class="timeline-value">${escapeHtml(activity.new_value)}</div>` : ''}
                            </div>
                        </div>
                    `;
                }).join('');
            }
        }
    } catch (error) {
        console.error('Error loading timeline:', error);
        timelineContainer.innerHTML = `
            <div class="timeline-empty">
                <div class="icon">❌</div>
                <p>加载失败</p>
            </div>
        `;
    }
}

/**
 * 关闭时间线抽屉
 */
function closeTimelineDrawer(taskId) {
    const drawerContainer = document.querySelector(`.drawer-container[data-task-id="${taskId}"]`);
    const timelineDrawer = drawerContainer?.querySelector('.timeline-drawer');
    if (timelineDrawer) {
        timelineDrawer.classList.remove('open');
        // 恢复原始样式
        timelineDrawer.style.position = '';
        timelineDrawer.style.top = '';
        timelineDrawer.style.left = '';
        timelineDrawer.style.width = '';
        timelineDrawer.style.height = '';
        timelineDrawer.style.zIndex = '';
    }
}

/**
 * 重置拖拽状态
 */
function resetDrawerDragState() {
    if (drawerTaskElement) {
        drawerTaskElement.style.removeProperty('--drag-x');
        drawerTaskElement.classList.remove('dragging-right', 'dragging-left');
    }
    drawerIsDragging = false;
    drawerStartX = 0;
    drawerStartY = 0;
    drawerTaskElement = null;
    drawerTaskId = null;
}

// 初始化抽屉式交互
initDrawerInteraction();
