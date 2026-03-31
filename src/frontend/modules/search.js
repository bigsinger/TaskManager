/**
 * 搜索模块
 */

/**
 * 防抖函数
 * @param {Function} func - 要执行的函数
 * @param {number} wait - 等待时间（毫秒）
 * @returns {Function}
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * 搜索任务
 * @param {string} query - 搜索关键词
 * @param {Array} tasks - 任务列表
 * @returns {Array} - 过滤后的任务
 */
function searchTasks(query, tasks) {
  if (!query || query.trim() === '') {
    return tasks;
  }
  
  const lowerQuery = query.toLowerCase();
  return tasks.filter(task => {
    const titleMatch = task.title && task.title.toLowerCase().includes(lowerQuery);
    const descMatch = task.description && task.description.toLowerCase().includes(lowerQuery);
    const tagMatch = task.tags && task.tags.some(tag => tag.toLowerCase().includes(lowerQuery));
    return titleMatch || descMatch || tagMatch;
  });
}

/**
 * 排序任务
 * @param {Array} tasks - 任务列表
 * @param {string} sortBy - 排序字段
 * @param {string} order - 排序顺序 (asc/desc)
 * @returns {Array} - 排序后的任务
 */
function sortTasks(tasks, sortBy = 'createdAt', order = 'desc') {
  const sorted = [...tasks];
  
  sorted.sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];
    
    // 处理日期
    if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
      aVal = new Date(aVal).getTime();
      bVal = new Date(bVal).getTime();
    }
    
    // 处理字符串
    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }
    
    if (order === 'asc') {
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    } else {
      return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
    }
  });
  
  return sorted;
}

/**
 * 筛选任务
 * @param {Array} tasks - 任务列表
 * @param {Object} filters - 筛选条件
 * @returns {Array} - 筛选后的任务
 */
function filterTasks(tasks, filters = {}) {
  return tasks.filter(task => {
    // 状态筛选
    if (filters.status && filters.status.length > 0) {
      if (!filters.status.includes(task.status)) {
        return false;
      }
    }
    
    // 标签筛选
    if (filters.tags && filters.tags.length > 0) {
      const hasTag = filters.tags.some(tag => task.tags && task.tags.includes(tag));
      if (!hasTag) {
        return false;
      }
    }
    
    return true;
  });
}

/**
 * 高亮搜索结果
 * @param {string} text - 原文本
 * @param {string} query - 搜索关键词
 * @returns {string} - 高亮后的HTML
 */
function highlightText(text, query) {
  if (!query || !text) return text;
  
  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

/**
 * 转义正则表达式特殊字符
 * @param {string} string - 输入字符串
 * @returns {string} - 转义后的字符串
 */
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 初始化搜索功能
 * @param {Object} options - 配置选项
 */
function initSearch(options = {}) {
  const {
    inputSelector = '#search-input',
    onSearch = () => {},
    debounceTime = 300
  } = options;
  
  const searchInput = document.querySelector(inputSelector);
  if (!searchInput) return;
  
  const debouncedSearch = debounce((value) => {
    onSearch(value);
  }, debounceTime);
  
  searchInput.addEventListener('input', (e) => {
    debouncedSearch(e.target.value);
  });
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    debounce,
    searchTasks,
    sortTasks,
    filterTasks,
    highlightText,
    initSearch
  };
}
