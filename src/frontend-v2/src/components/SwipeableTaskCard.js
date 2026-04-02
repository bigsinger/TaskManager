/**
 * 可滑动的任务卡片组件
 *
 * 支持手势交互的任务卡片
 */

import { useSwipeGesture } from '../hooks/useSwipeGesture.js';

class SwipeableTaskCard {
  constructor(element, task, options = {}) {
    this.element = element;
    this.task = task;
    this.options = {
      onSwipeLeft: options.onSwipeLeft || (() => {}),
      onSwipeRight: options.onSwipeRight || (() => {}),
      onTaskClick: options.onTaskClick || (() => {}),
      onTaskDoubleClick: options.onTaskDoubleClick || (() => {}),
      ...options
    };

    this.init();
  }

  init() {
    // 添加样式类
    this.element.classList.add('swipeable-task-card');

    // 初始化手势
    this.cleanup = useSwipeGesture(this.element, {
      onSwipeLeft: () => {
        this.handleSwipeLeft();
      },
      onSwipeRight: () => {
        this.handleSwipeRight();
      },
      threshold: 50,
      preventDefault: false
    });

    // 添加点击事件
    this.element.addEventListener('click', (e) => {
      this.options.onTaskClick(this.task, e);
    });

    // 添加双击事件
    this.element.addEventListener('dblclick', (e) => {
      this.options.onTaskDoubleClick(this.task, e);
    });
  }

  handleSwipeLeft() {
    console.log('Swipe left on task:', this.task.id);
    this.options.onSwipeLeft(this.task);

    // 显示时间线（如果实现了）
    this.showTimelineHint();
  }

  handleSwipeRight() {
    console.log('Swipe right on task:', this.task.id);
    this.options.onSwipeRight(this.task);

    // 切换任务状态
    this.cycleTaskStatus();

    // 显示提示
    this.showStatusHint();
  }

  cycleTaskStatus() {
    const statusCycle = ['pending', 'in-progress', 'completed'];
    const currentIndex = statusCycle.indexOf(this.task.status);
    const nextIndex = (currentIndex + 1) % statusCycle.length;
    const newStatus = statusCycle[nextIndex];

    // 更新任务状态
    if (typeof this.options.updateTaskStatus === 'function') {
      this.options.updateTaskStatus(this.task.id, newStatus);
    }
  }

  showTimelineHint() {
    const hint = document.createElement('div');
    hint.className = 'swipe-hint swipe-hint-left';
    hint.textContent = '← 查看时间线';
    hint.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 20px 40px;
      border-radius: 10px;
      font-size: 18px;
      z-index: 10000;
      animation: fadeInOut 1s ease-in-out;
    `;

    document.body.appendChild(hint);

    setTimeout(() => {
      hint.remove();
    }, 1000);
  }

  showStatusHint() {
    const statusLabels = {
      'pending': '待办',
      'in-progress': '进行中',
      'completed': '已完成'
    };

    const hint = document.createElement('div');
    hint.className = 'swipe-hint swipe-hint-right';
    hint.textContent = `任务状态已切换`;
    hint.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px 40px;
      border-radius: 10px;
      font-size: 18px;
      z-index: 10000;
      animation: fadeInOut 1s ease-in-out;
    `;

    document.body.appendChild(hint);

    setTimeout(() => {
      hint.remove();
    }, 1000);
  }

  destroy() {
    // 清理手势
    if (this.cleanup) {
      this.cleanup();
    }

    // 移除样式类
    this.element.classList.remove('swipeable-task-card');
  }
}

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInOut {
    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
    20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
  }

  .swipeable-task-card {
    touch-action: pan-y; /* 允许垂直滚动，阻止水平滚动 */
    user-select: none;
    cursor: grab;
    transition: transform 0.1s ease-out;
  }

  .swipeable-task-card:active {
    cursor: grabbing;
  }

  /* 滑动时的视觉反馈 */
  .swipeable-task-card.swiping-right {
    background: rgba(16, 185, 129, 0.1); /* 绿色 */
  }

  .swipeable-task-card.swiping-left {
    background: rgba(59, 130, 246, 0.1); /* 蓝色 */
  }
`;

document.head.appendChild(style);

export default SwipeableTaskCard;