/**
 * 预计耗时选择器组件
 *
 * 用于选择任务的预计完成时间
 */

import { formatEstimatedTime, parseEstimatedTime, getAvailableUnits, isValidEstimatedTime } from '../utils/timeFormatter.js';

class EstimatedTimeSelector {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      language: 'zh',
      value: options.value || null,
      onChange: options.onChange || (() => {}),
      ...options
    };

    this.units = getAvailableUnits();
    this.selectedValue = this.options.value ? parseEstimatedTime(this.options.value) : null;

    this.init();
  }

  init() {
    this.render();
    this.bindEvents();
  }

  render() {
    const { value, unit } = this.selectedValue || {};
    const displayValue = this.selectedValue ? formatEstimatedTime(this.selectedValue, this.options.language) : '';

    this.container.innerHTML = `
      <div class="estimated-time-selector">
        <label class="estimated-time-label">
          ${this.options.language === 'zh' ? '预计耗时' : 'Estimated Time'}
        </label>
        <div class="estimated-time-inputs">
          <input
            type="number"
            class="estimated-time-value"
            placeholder="0"
            min="1"
            value="${value || ''}"
            data-unit="${unit || ''}"
          />
          <select class="estimated-time-unit">
            <option value="">${this.options.language === 'zh' ? '选择单位' : 'Select unit'}</option>
            ${this.units.map(u => `
              <option value="${u.key}" ${unit === u.key ? 'selected' : ''}>
                ${this.options.language === 'zh' ? u.label : u.labelEn}
              </option>
            `).join('')}
          </select>
        </div>
        ${displayValue ? `
          <div class="estimated-time-display">
            ${this.options.language === 'zh' ? '预计：' : 'Estimated: '}${displayValue}
          </div>
        ` : ''}
        <button type="button" class="estimated-time-clear" style="display: none;">
          ${this.options.language === 'zh' ? '清除' : 'Clear'}
        </button>
      </div>
    `;
  }

  bindEvents() {
    const valueInput = this.container.querySelector('.estimated-time-value');
    const unitSelect = this.container.querySelector('.estimated-time-unit');
    const clearBtn = this.container.querySelector('.estimated-time-clear');

    // 数值输入
    valueInput.addEventListener('input', () => {
      this.handleInputChange();
    });

    // 单位选择
    unitSelect.addEventListener('change', () => {
      this.handleUnitChange();
    });

    // 清除按钮
    clearBtn.addEventListener('click', () => {
      this.clear();
    });
  }

  handleInputChange() {
    const valueInput = this.container.querySelector('.estimated-time-value');
    const unitSelect = this.container.querySelector('.estimated-time-unit');
    const clearBtn = this.container.querySelector('.estimated-time-clear');

    const value = parseInt(valueInput.value, 10);
    const unit = unitSelect.value;

    // 更新清除按钮显示
    clearBtn.style.display = (value > 0 && unit) ? 'inline-block' : 'none';

    // 更新值
    if (value > 0 && unit) {
      this.selectedValue = { value, unit };
      this.updateDisplay();
      this.options.onChange(this.formatValue());
    } else {
      this.selectedValue = null;
      this.updateDisplay();
      this.options.onChange(null);
    }
  }

  handleUnitChange() {
    this.handleInputChange();
  }

  updateDisplay() {
    const display = this.container.querySelector('.estimated-time-display');

    if (this.selectedValue && isValidEstimatedTime(this.selectedValue)) {
      const formatted = formatEstimatedTime(this.selectedValue, this.options.language);
      display.innerHTML = `
        ${this.options.language === 'zh' ? '预计：' : 'Estimated: '}${formatted}
      `;
      display.style.display = 'block';
    } else {
      display.style.display = 'none';
    }
  }

  formatValue() {
    if (!this.selectedValue || !isValidEstimatedTime(this.selectedValue)) {
      return null;
    }

    const { value, unit } = this.selectedValue;
    return `${value}${unit}`;
  }

  clear() {
    const valueInput = this.container.querySelector('.estimated-time-value');
    const unitSelect = this.container.querySelector('.estimated-time-unit');
    const clearBtn = this.container.querySelector('.estimated-time-clear');

    valueInput.value = '';
    unitSelect.value = '';
    clearBtn.style.display = 'none';

    this.selectedValue = null;
    this.updateDisplay();
    this.options.onChange(null);
  }

  setValue(valueStr) {
    if (!valueStr) {
      this.clear();
      return;
    }

    const parsed = parseEstimatedTime(valueStr);
    if (parsed) {
      const valueInput = this.container.querySelector('.estimated-time-value');
      const unitSelect = this.container.querySelector('.estimated-time-unit');
      const clearBtn = this.container.querySelector('.estimated-time-clear');

      valueInput.value = parsed.value;
      unitSelect.value = parsed.unit;
      clearBtn.style.display = 'inline-block';

      this.selectedValue = parsed;
      this.updateDisplay();
    }
  }

  getValue() {
    return this.formatValue();
  }

  destroy() {
    this.container.innerHTML = '';
  }
}

export default EstimatedTimeSelector;
