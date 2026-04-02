/**
 * 手势处理 Hook
 *
 * 处理触摸和鼠标手势事件
 */

export function useSwipeGesture(element, options = {}) {
  const {
    onSwipeLeft = null,
    onSwipeRight = null,
    threshold = 50, // 滑动阈值（像素）
    preventDefault = true
  } = options;

  let startX = 0;
  let startY = 0;
  let isDragging = false;
  let startTime = 0;

  // 触摸开始
  const handleTouchStart = (e) => {
    if (preventDefault) {
      e.preventDefault();
    }

    const touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    startTime = Date.now();
    isDragging = true;
  };

  // 触摸移动
  const handleTouchMove = (e) => {
    if (!isDragging) return;

    if (preventDefault) {
      e.preventDefault();
    }

    const touch = e.touches[0];
    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;

    // 只有水平滑动才阻止默认行为
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (preventDefault) {
        e.preventDefault();
      }
    }

    // 可以在这里添加滑动动画效果
    element.style.transform = `translateX(${deltaX}px)`;
  };

  // 触摸结束
  const handleTouchEnd = (e) => {
    if (!isDragging) return;

    isDragging = false;
    element.style.transform = 'translateX(0)';

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;
    const deltaTime = Date.now() - startTime;

    // 判断是否是有效的滑动
    const isSwipe = Math.abs(deltaX) > threshold && Math.abs(deltaY) < threshold * 2 && deltaTime < 500;

    if (isSwipe) {
      if (deltaX > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }
  };

  // 鼠标开始
  const handleMouseDown = (e) => {
    if (preventDefault) {
      e.preventDefault();
    }

    startX = e.clientX;
    startY = e.clientY;
    startTime = Date.now();
    isDragging = true;

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // 鼠标移动
  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    // 只有水平滑动才处理
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      element.style.transform = `translateX(${deltaX}px)`;
    }
  };

  // 鼠标结束
  const handleMouseUp = (e) => {
    if (!isDragging) return;

    isDragging = false;
    element.style.transform = 'translateX(0)';

    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);

    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    const deltaTime = Date.now() - startTime;

    // 判断是否是有效的滑动
    const isSwipe = Math.abs(deltaX) > threshold && Math.abs(deltaY) < threshold * 2 && deltaTime < 500;

    if (isSwipe) {
      if (deltaX > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }
  };

  // 添加事件监听
  const addEventListeners = () => {
    // 触摸事件（移动端）
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });
    element.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    // 鼠标事件（PC端）
    element.addEventListener('mousedown', handleMouseDown);
  };

  // 移除事件监听
  const removeEventListeners = () => {
    element.removeEventListener('touchstart', handleTouchStart);
    element.removeEventListener('touchmove', handleTouchMove);
    element.removeEventListener('touchend', handleTouchEnd);
    element.removeEventListener('touchcancel', handleTouchEnd);

    element.removeEventListener('mousedown', handleMouseDown);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // 初始化
  addEventListeners();

  // 返回清理函数
  return () => {
    removeEventListeners();
  };
}

export default useSwipeGesture;