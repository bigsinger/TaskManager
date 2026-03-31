/**
 * Frontend Search Module Tests
 */

// Mock DOM
document.body.innerHTML = `
  <input type="text" id="search-input" />
  <button id="search-clear" style="display: none;">✕</button>
`;

const { 
  debounce, 
  searchTasks, 
  sortTasks, 
  filterTasks, 
  highlightText 
} = require('./search');

describe('Search Module', () => {
  describe('debounce', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should delay function execution', () => {
      const fn = jest.fn();
      const debouncedFn = debounce(fn, 300);

      debouncedFn('test');
      expect(fn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(300);
      expect(fn).toHaveBeenCalledWith('test');
    });

    it('should cancel previous timer on new call', () => {
      const fn = jest.fn();
      const debouncedFn = debounce(fn, 300);

      debouncedFn('first');
      jest.advanceTimersByTime(100);
      debouncedFn('second');
      jest.advanceTimersByTime(300);

      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith('second');
    });
  });

  describe('searchTasks', () => {
    const tasks = [
      { id: '1', title: 'Buy groceries', description: 'Milk and eggs', tags: ['shopping'] },
      { id: '2', title: 'Finish report', description: 'Q4 sales report', tags: ['work'] },
      { id: '3', title: 'Call mom', description: '', tags: ['personal'] }
    ];

    it('should return all tasks when query is empty', () => {
      const result = searchTasks('', tasks);
      expect(result).toHaveLength(3);
    });

    it('should search in title', () => {
      const result = searchTasks('groceries', tasks);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('should search in description', () => {
      const result = searchTasks('sales', tasks);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    it('should search in tags', () => {
      const result = searchTasks('work', tasks);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    it('should be case insensitive', () => {
      const result = searchTasks('GROCERIES', tasks);
      expect(result).toHaveLength(1);
    });

    it('should return empty array for no matches', () => {
      const result = searchTasks('xyz', tasks);
      expect(result).toHaveLength(0);
    });
  });

  describe('sortTasks', () => {
    const tasks = [
      { id: '1', title: 'Zebra', createdAt: '2024-01-01', updatedAt: '2024-01-05' },
      { id: '2', title: 'Apple', createdAt: '2024-01-03', updatedAt: '2024-01-02' },
      { id: '3', title: 'Banana', createdAt: '2024-01-02', updatedAt: '2024-01-03' }
    ];

    it('should sort by createdAt desc by default', () => {
      const result = sortTasks(tasks, 'createdAt', 'desc');
      expect(result[0].id).toBe('2');
      expect(result[1].id).toBe('3');
      expect(result[2].id).toBe('1');
    });

    it('should sort by title asc', () => {
      const result = sortTasks(tasks, 'title', 'asc');
      expect(result[0].title).toBe('Apple');
      expect(result[1].title).toBe('Banana');
      expect(result[2].title).toBe('Zebra');
    });

    it('should sort by title desc', () => {
      const result = sortTasks(tasks, 'title', 'desc');
      expect(result[0].title).toBe('Zebra');
      expect(result[1].title).toBe('Banana');
      expect(result[2].title).toBe('Apple');
    });

    it('should not mutate original array', () => {
      const originalOrder = tasks.map(t => t.id);
      sortTasks(tasks, 'title', 'asc');
      expect(tasks.map(t => t.id)).toEqual(originalOrder);
    });
  });

  describe('filterTasks', () => {
    const tasks = [
      { id: '1', status: 'pending', tags: ['work'] },
      { id: '2', status: 'completed', tags: ['personal'] },
      { id: '3', status: 'in-progress', tags: ['work', 'urgent'] }
    ];

    it('should return all tasks when no filters', () => {
      const result = filterTasks(tasks, {});
      expect(result).toHaveLength(3);
    });

    it('should filter by status', () => {
      const result = filterTasks(tasks, { status: ['pending'] });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('should filter by multiple statuses', () => {
      const result = filterTasks(tasks, { status: ['pending', 'completed'] });
      expect(result).toHaveLength(2);
    });

    it('should filter by tags', () => {
      const result = filterTasks(tasks, { tags: ['work'] });
      expect(result).toHaveLength(2);
    });

    it('should filter by status and tags', () => {
      const result = filterTasks(tasks, { 
        status: ['pending', 'in-progress'], 
        tags: ['work'] 
      });
      expect(result).toHaveLength(2);
    });
  });

  describe('highlightText', () => {
    it('should highlight matching text', () => {
      const result = highlightText('Hello World', 'world');
      expect(result).toBe('Hello <mark>World</mark>');
    });

    it('should handle no match', () => {
      const result = highlightText('Hello World', 'xyz');
      expect(result).toBe('Hello World');
    });

    it('should be case insensitive', () => {
      const result = highlightText('Hello World', 'WORLD');
      expect(result).toBe('Hello <mark>World</mark>');
    });

    it('should handle empty query', () => {
      const result = highlightText('Hello World', '');
      expect(result).toBe('Hello World');
    });

    it('should handle special regex characters', () => {
      const result = highlightText('Price: $100.00', '$100');
      expect(result).toBe('Price: <mark>$100</mark>.00');
    });
  });
});
