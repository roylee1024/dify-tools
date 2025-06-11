// 缓存管理相关常量
const CACHE_PREFIX = 'workflow_draft_';
const NEWEST_HASH_PREFIX = 'newest_hash_';
const MAX_CACHE_SIZE = 100;

/**
 * 管理工作流草稿缓存
 * @param {string} appId - 应用ID
 * @param {string} hash - 工作流草稿的hash值
 * @param {any} data - 要缓存的数据
 * @returns {Promise<boolean>} 是否成功缓存
 */
export async function manageDraftCache(appId, hash, data) {
  const key = `${CACHE_PREFIX}${appId}_${hash}`;
  const newest_hash_key = `${NEWEST_HASH_PREFIX}${appId}`;
  
  try {
    await chrome.storage.local.set({
      [newest_hash_key]: hash
    });
    // 检查是否已存在
    const existing = await chrome.storage.local.get(key);
    if (existing[key]) {
      return false; // 已存在，不缓存
    }
    
    // 获取所有缓存项
    const allCache = await chrome.storage.local.get(null);
    // 只获取当前appId的缓存项
    const cacheEntries = Object.entries(allCache)
      .filter(([k]) => k.startsWith(CACHE_PREFIX) && k.includes(`_${appId}_`))
      .map(([k, v]) => ({ key: k, ...v }));
    
    // 如果当前appId的缓存达到最大数量，删除最旧的
    if (cacheEntries.length >= MAX_CACHE_SIZE) {
      const oldest = cacheEntries.sort((a, b) => a.timestamp - b.timestamp)[0];
      await chrome.storage.local.remove(oldest.key);
    }
    
    // 存储新数据
    await chrome.storage.local.set({
      [key]: {
        data,
        timestamp: Date.now()
      }
    });

  
    
    return true;
  } catch (error) {
    console.error('缓存管理工作流草稿失败:', error);
    throw error;
  }
}

/**
 * 获取指定应用的所有缓存的工作流草稿
 * @param {string} appId - 应用ID
 * @returns {Promise<Array>} 缓存的工作流草稿列表
 */
export async function getCachedDrafts(appId) {
  try {
    const allCache = await chrome.storage.local.get(null);
    console.log('allCache', allCache);
    return Object.entries(allCache)
      .filter(([k]) => k.startsWith(CACHE_PREFIX) && k.includes(appId))
      .map(([k, v]) => ({
        key: k,
        ...v
      }))
      .sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('获取缓存的工作流草稿失败:', error);
    throw error;
  }
}

/**
 * 清除指定应用的所有缓存的工作流草稿
 * @param {string} appId - 应用ID
 * @returns {Promise<void>}
 */
export async function clearCachedDrafts(appId) {
  try {
    const allCache = await chrome.storage.local.get(null);
    const keysToRemove = Object.keys(allCache)
      .filter(k => k.startsWith(CACHE_PREFIX) && k.includes(appId));
    
    if (keysToRemove.length > 0) {
      await chrome.storage.local.remove(keysToRemove);
    }
  } catch (error) {
    console.error('清除缓存的工作流草稿失败:', error);
    throw error;
  }
}

let pollInterval = null;

/**
 * 开始定时轮询工作流草稿
 * @param {string} domain - API域名
 * @param {string} appId - 应用ID
 * @param {number} interval - 轮询间隔（毫秒）
 * @returns {number} 轮询间隔ID
 */
export function startPolling(domain, appId, interval = 30000) {
  if (pollInterval) {
    clearInterval(pollInterval);
  }
  
  pollInterval = setInterval(async () => {
    try {
      const response = await getDraft(domain, appId);
      if (response.data) {
        const { hash } = response.data;
        await manageDraftCache(appId, hash, response.data);
      }
    } catch (error) {
      console.error('轮询工作流草稿失败:', error);
    }
  }, interval);
  
  return pollInterval;
}

/**
 * 停止定时轮询
 */
export function stopPolling() {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
}

/**
 * 获取指定应用的最新hash值
 * @param {string} appId - 应用ID
 * @returns {Promise<string|null>} 最新的hash值，如果没有则返回null
 */
export async function getNewestHash(appId) {
  try {
    const newest_hash_key = `${NEWEST_HASH_PREFIX}${appId}`;
    const result = await chrome.storage.local.get(newest_hash_key);
    return result[newest_hash_key] || null;
  } catch (error) {
    console.error('获取最新hash值失败:', error);
    throw error;
  }
} 