/**
 * LazyLoad Utility - 懒加载工具
 * 用于延迟加载非关键资源
 */

class LazyLoader {
    constructor() {
        this.observer = null;
        this.init();
    }

    init() {
        // 使用 Intersection Observer 实现懒加载
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadElement(entry.target);
                        this.observer.unobserve(entry.target);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.01
            });
        }
    }

    /**
     * 懒加载图片
     * @param {string} selector - CSS选择器
     */
    lazyImages(selector = 'img[data-src]') {
        const images = document.querySelectorAll(selector);
        images.forEach(img => {
            if (this.observer) {
                this.observer.observe(img);
            } else {
                // 降级处理：直接加载
                this.loadElement(img);
            }
        });
    }

    /**
     * 懒加载脚本
     * @param {string} src - 脚本URL
     * @param {Function} callback - 加载完成回调
     */
    lazyScript(src, callback = null) {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        if (callback) {
            script.onload = callback;
        }
        document.body.appendChild(script);
    }

    /**
     * 懒加载样式
     * @param {string} href - 样式URL
     */
    lazyStyle(href) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
    }

    /**
     * 加载元素
     * @param {Element} element - DOM元素
     */
    loadElement(element) {
        const tagName = element.tagName.toLowerCase();
        
        switch (tagName) {
            case 'img':
                this.loadImage(element);
                break;
            case 'iframe':
                this.loadIframe(element);
                break;
            case 'div':
                this.loadBackground(element);
                break;
        }
    }

    loadImage(img) {
        const src = img.dataset.src;
        const srcset = img.dataset.srcset;
        
        if (src) {
            img.src = src;
            img.removeAttribute('data-src');
        }
        
        if (srcset) {
            img.srcset = srcset;
            img.removeAttribute('data-srcset');
        }
        
        img.classList.add('loaded');
    }

    loadIframe(iframe) {
        const src = iframe.dataset.src;
        if (src) {
            iframe.src = src;
            iframe.removeAttribute('data-src');
        }
    }

    loadBackground(element) {
        const bg = element.dataset.bg;
        if (bg) {
            element.style.backgroundImage = `url(${bg})`;
            element.removeAttribute('data-bg');
            element.classList.add('loaded');
        }
    }
}

// 代码分割 - 动态导入
const ModuleLoader = {
    /**
     * 动态加载模块
     * @param {string} moduleName - 模块名称
     * @returns {Promise} - 模块实例
     */
    async load(moduleName) {
        switch (moduleName) {
            case 'chart':
                return import('./modules/chart.js');
            case 'export':
                return import('./modules/export.js');
            case 'search':
                return import('./modules/search.js');
            default:
                throw new Error(`Unknown module: ${moduleName}`);
        }
    },

    /**
     * 预加载关键模块
     */
    prefetchCritical() {
        // 预加载关键资源
        const criticalModules = ['search', 'export'];
        criticalModules.forEach(module => {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = `./modules/${module}.js`;
            document.head.appendChild(link);
        });
    }
};

// Service Worker 注册 - 缓存策略
const CacheManager = {
    CACHE_NAME: 'taskmanager-v1',
    
    async register() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registered:', registration);
            } catch (error) {
                console.error('Service Worker registration failed:', error);
            }
        }
    },

    /**
     * 清除缓存
     */
    async clearCache() {
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(
                cacheNames.map(cacheName => caches.delete(cacheName))
            );
        }
    }
};

// 性能监控
const PerformanceMonitor = {
    init() {
        // 监控关键性能指标
        this.observeLCP();
        this.observeFID();
        this.observeCLS();
    },

    observeLCP() {
        // 最大内容绘制
        new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            console.log('LCP:', lastEntry.startTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });
    },

    observeFID() {
        // 首次输入延迟
        new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                const delay = entry.processingStart - entry.startTime;
                console.log('FID:', delay);
            }
        }).observe({ entryTypes: ['first-input'] });
    },

    observeCLS() {
        // 累积布局偏移
        let clsValue = 0;
        new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                }
            }
            console.log('CLS:', clsValue);
        }).observe({ entryTypes: ['layout-shift'] });
    }
};

// 初始化
if (typeof window !== 'undefined') {
    window.LazyLoader = new LazyLoader();
    window.ModuleLoader = ModuleLoader;
    window.CacheManager = CacheManager;
    window.PerformanceMonitor = PerformanceMonitor;
}
