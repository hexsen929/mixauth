export class AutoFetcher {
    constructor(fetchFn, interval = 5000, cacheSize = 10, ttl = 60000) {
        if (typeof fetchFn !== 'function') {
            throw new Error('fetchFn must be a function');
        }

        this.fetchFn = fetchFn;
        this.interval = interval;
        this.cacheSize = cacheSize;
        this.ttl = ttl;
        this.cache = [];
        this.timer = null;

        // 如果 cacheSize 为 0，直接不启动定时任务
        if (this.cacheSize > 0) {
            this.start();
        }
    }

    isExpired(entry) {
        return Date.now() - entry.timestamp > this.ttl;
    }

    cleanup() {
        this.cache = this.cache.filter(entry => !this.isExpired(entry));
    }

    async fetchAndCache() {
        this.cleanup();

        if (this.cache.length >= this.cacheSize && !this.cache.some(this.isExpired.bind(this))) {
            return;
        }

        try {
            const data = await this.fetchFn();
            this.addToCache(data);
        } catch (err) {
            console.error('AutoFetcher fetch error:', err);
        }
    }

    addToCache(item) {
        const now = Date.now();
        this.cache.push({data: item, timestamp: now});

        while (this.cache.length > this.cacheSize) {
            this.cache.shift();
        }
    }

    start() {
        if (this.timer) return;
        this.fetchAndCache();
        this.timer = setInterval(() => this.fetchAndCache(), this.interval);
    }

    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    async consumeOldest() {
        this.cleanup();

        if (this.cache.length > 0) {
            return this.cache.shift().data;
        }

        try {
            return await this.fetchFn();
        } catch (err) {
            console.error('AutoFetcher fetch error on consume:', err);
            return null;
        }
    }

    getAll() {
        this.cleanup();
        return this.cache.map(entry => entry.data);
    }
}
