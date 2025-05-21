import axios from 'axios';
import { ElMessage } from 'element-plus';

// 创建axios实例
const api = axios.create();

// 请求拦截器
api.interceptors.request.use(
  async (config) => {
    try {
      // 从Chrome Storage获取token
      const result = await chrome.storage.local.get('console_token');
      const token = result.console_token;
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.warn('未找到console_token，请确保已登录Dify控制台');
      }
      return config;
    } catch (error) {
      console.error('获取token失败:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * 从URL中提取域名和应用ID
 * @param {string} url - Dify应用URL，格式如：https://dify.mingxiangzhe.com/app/e0684868-3869-4fac-8b47-7f35248b01d5/workflow
 * @returns {{domain: string, appId: string}} 提取的域名和应用ID
 */
export function extractUrlInfo(url) {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.origin; // 获取域名，如 https://dify.mingxiangzhe.com
    
    // 从路径中提取应用ID
    const pathParts = urlObj.pathname.split('/');
    const appIndex = pathParts.findIndex(part => part === 'app');
    const appId = appIndex !== -1 && appIndex < pathParts.length - 1 ? pathParts[appIndex + 1] : null;
    
    return { domain, appId };
  } catch (error) {
    console.error('URL解析错误:', error);
    return { domain: null, appId: null };
  }
}

/**
 * 获取工作流运行数据
 * @param {string} domain - API域名，如 https://dify.mingxiangzhe.com
 * @param {string} appId - 应用ID
 * @returns {Promise<Object>} API响应数据
 */
export async function getWorkflowRuns(domain, appId) {
  try {
    const url = `${domain}/console/api/apps/${appId}/workflow-runs`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('获取工作流运行数据失败:', error);
    throw error;
  }
}

/**
 * Returns the original status string.
 * @param {string} status - The status string.
 * @returns {string} The original status string.
 */
export function mapStatusToString(status) {
  return status;
}

/**
 * 将Unix时间戳转换为日期对象
 * @param {number} timestamp - Unix时间戳（秒）
 * @returns {Date} 日期对象
 */
export function timestampToDate(timestamp) {
  return new Date(timestamp * 1000);
}

export const getWorkflowAppLogs = async (domain, appId, page, limit) => {
  if (!domain || !appId) {
    throw new Error('Domain and App ID are required');
  }
  const url = `${domain}/console/api/apps/${appId}/workflow-app-logs?page=${page}&limit=${limit}`;
  try {
    const response = await api.get(url);
    return response.data; // API响应体直接是 { page, limit, total, has_more, data }
  } catch (error) {
    console.error('Error fetching workflow app logs:', error);
    throw error;
  }
};

// 导出api实例
export { api }; 