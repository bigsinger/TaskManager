/**
 * 时间格式化工具
 *
 * 用于格式化预计时间显示
 */

/**
 * 时间单位配置
 */
const TIME_UNITS = {
  h: { label: '小时', labelEn: 'hours', factor: 1 },
  d: { label: '天', labelEn: 'days', factor: 24 },
  w: { label: '周', labelEn: 'weeks', factor: 168 },
  mo: { label: '月', labelEn: 'months', factor: 720 },
  q: { label: '季度', labelEn: 'quarters', factor: 2160 },
  y: { label: '年', labelEn: 'years', factor: 8760 }
};

/**
 * 格式化预计时间为显示字符串
 * @param {Object} estimatedTime - 预计时间对象 {value: number, unit: string}
 * @param {string} language - 语言 'zh' 或 'en'
 * @returns {string} 格式化后的字符串
 */
export function formatEstimatedTime(estimatedTime, language = 'zh') {
  if (!estimatedTime || !estimatedTime.value || !estimatedTime.unit) {
    return '';
  }

  const { value, unit } = estimatedTime;
  const unitConfig = TIME_UNITS[unit];

  if (!unitConfig) {
    return `${value} ${unit}`;
  }

  const label = language === 'zh' ? unitConfig.label : unitConfig.labelEn;

  // 中文不需要复数形式，英文需要
  if (language === 'en' && value !== 1) {
    return `${value} ${label}`;
  }

  return `${value}${label}`;
}

/**
 * 解析预计时间字符串为对象
 * @param {string} timeStr - 时间字符串，如 "8h", "3d", "2w"
 * @returns {Object|null} 预计时间对象 {value: number, unit: string} 或 null
 */
export function parseEstimatedTime(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') {
    return null;
  }

  const match = timeStr.match(/^(\d+)([hdwqmy])$/i);
  if (!match) {
    return null;
  }

  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();

  return { value, unit };
}

/**
 * 将预计时间转换为小时数
 * @param {Object} estimatedTime - 预计时间对象 {value: number, unit: string}
 * @returns {number} 小时数
 */
export function convertToHours(estimatedTime) {
  if (!estimatedTime || !estimatedTime.value || !estimatedTime.unit) {
    return 0;
  }

  const { value, unit } = estimatedTime;
  const unitConfig = TIME_UNITS[unit];

  if (!unitConfig) {
    return value;
  }

  return value * unitConfig.factor;
}

/**
 * 将小时数转换为最佳单位
 * @param {number} hours - 小时数
 * @returns {Object} 预计时间对象 {value: number, unit: string, display: string}
 */
export function convertFromHours(hours) {
  if (!hours || hours <= 0) {
    return { value: 0, unit: 'h', display: '0小时' };
  }

  // 按单位从大到小排序
  const units = Object.keys(TIME_UNITS).sort((a, b) => TIME_UNITS[b].factor - TIME_UNITS[a].factor);

  for (const unit of units) {
    const unitConfig = TIME_UNITS[unit];
    const value = Math.round(hours / unitConfig.factor);

    if (value >= 1) {
      return {
        value,
        unit,
        display: formatEstimatedTime({ value, unit })
      };
    }
  }

  // 默认返回小时
  return {
    value: Math.round(hours),
    unit: 'h',
    display: formatEstimatedTime({ value: Math.round(hours), unit: 'h' })
  };
}

/**
 * 获取所有可用的时间单位
 * @returns {Array} 时间单位数组
 */
export function getAvailableUnits() {
  return Object.keys(TIME_UNITS).map(key => ({
    key,
    label: TIME_UNITS[key].label,
    labelEn: TIME_UNITS[key].labelEn
  }));
}

/**
 * 验证预计时间是否有效
 * @param {Object} estimatedTime - 预计时间对象 {value: number, unit: string}
 * @returns {boolean} 是否有效
 */
export function isValidEstimatedTime(estimatedTime) {
  if (!estimatedTime) {
    return false;
  }

  const { value, unit } = estimatedTime;

  // value必须是正整数
  if (!value || typeof value !== 'number' || value <= 0 || !Number.isInteger(value)) {
    return false;
  }

  // unit必须是有效单位
  if (!unit || typeof unit !== 'string' || !TIME_UNITS[unit]) {
    return false;
  }

  return true;
}

// 如果使用 ES6 模块，导出所有函数
export default {
  formatEstimatedTime,
  parseEstimatedTime,
  convertToHours,
  convertFromHours,
  getAvailableUnits,
  isValidEstimatedTime
};
