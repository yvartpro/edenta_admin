export const createSlug = (text) => {
    if (!text) return "";
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, "")
        .replace(/--+/g, "-");
};

// Simple singleton cache for dashboard data
const cache = new Map();

export const setCachedData = (key, params, data) => {
    const cacheKey = `${key}_${JSON.stringify(params)}`;
    cache.set(cacheKey, { data, timestamp: Date.now() });
};

export const getCachedData = (key, params, maxAge = 60000) => {
    const cacheKey = `${key}_${JSON.stringify(params)}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < maxAge) {
        return cached.data;
    }
    return null;
};

export const clearCache = (key) => {
    if (key) {
        for (const k of cache.keys()) {
            if (k.startsWith(key)) cache.delete(k);
        }
    } else {
        cache.clear();
    }
};
