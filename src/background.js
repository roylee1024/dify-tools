// console.log('background.js');
import { getDraft } from './lib/api';
import { manageDraftCache } from './lib/workflow-cache';

// 监听扩展图标点击事件
chrome.action.onClicked.addListener((tab) => {
  // 检查当前标签页的URL是否包含dify工作流
  if (tab.url && tab.url.includes('/app/') && tab.url.includes('/workflow')) {
    // 如果是dify工作流页面，则传递URL参数
    chrome.tabs.create({
      url: `src/pages/popup/index.html?url=${encodeURIComponent(tab.url)}`,
      active: true
    });
  } else {
    // 否则直接打开popup页面
    chrome.tabs.create({
      url: 'src/pages/popup/index.html',
      active: true
    });
  }
});

chrome.runtime.onInstalled.addListener(async (details) => {
  // uninstall open page
  chrome.runtime.setUninstallURL('https://www.imgkits.com?utm_source=chrome_addon');

  // 创建图片模糊背景的上下文菜单项
  chrome.contextMenus.create({
    id: "blurSelectedImage",
    title: "Blur background", // "Blur background for this image"
    contexts: ["image"] // 只在右键点击图片时显示
  });
});

// 处理菜单点击事件
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "blurSelectedImage") {
    if (info.srcUrl) {
      const encodedImageUrl = encodeURIComponent(info.srcUrl);
      const targetUrl = `https://www.imgkits.com/blur-background?utm_source=chrome_addon&image_url=${encodedImageUrl}`;
      chrome.tabs.create({
        url: targetUrl,
        active: true
      });
    }
  }
});

// 轮询相关状态
let pollingInterval = 10000; // 默认10秒
let isPolling = true; // 默认开启轮询
let pollingTimer = null;
let currentAppId = null;
let currentDomain = null;

// 开始轮询
const startPolling = (domain, appId) => {
  if (pollingTimer) {
    clearInterval(pollingTimer);
  }
  
  currentDomain = domain;
  currentAppId = appId;
  
  if (isPolling && domain && appId) {
    // 立即执行一次
    fetchDrafts();
    // 设置定时器
    pollingTimer = setInterval(fetchDrafts, pollingInterval);
  }
};

// 停止轮询
const stopPolling = () => {
  if (pollingTimer) {
    clearInterval(pollingTimer);
    pollingTimer = null;
  }
};

// 更新轮询间隔
const updatePollingInterval = (interval) => {
  pollingInterval = interval;
  if (isPolling && currentDomain && currentAppId) {
    startPolling(currentDomain, currentAppId);
  }
};

// 更新轮询状态
const updatePollingState = (state) => {
  isPolling = state;
  if (isPolling && currentDomain && currentAppId) {
    startPolling(currentDomain, currentAppId);
  } else {
    stopPolling();
  }
};

// 获取草稿数据
const fetchDrafts = async () => {
  if (!currentDomain || !currentAppId) return;
  
  try {
    const response = await getDraft(currentDomain, currentAppId);
    
    // 缓存数据
    if (response.data) {
      const { hash } = response.data;
      await manageDraftCache(currentAppId, hash, response.data);
    }
    
    // 发送数据到popup
    chrome.runtime.sendMessage({
      type: 'DRAFTS_UPDATED',
      data: response.data
    });
  } catch (error) {
    console.error('Failed to fetch drafts:', error);
  }
};

// 监听来自popup的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'START_POLLING':
      startPolling(message.domain, message.appId);
      break;
    case 'STOP_POLLING':
      stopPolling();
      break;
    case 'UPDATE_POLLING_INTERVAL':
      updatePollingInterval(message.interval);
      break;
    case 'UPDATE_POLLING_STATE':
      updatePollingState(message.state);
      break;
  }
});

// 监听标签页更新
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const url = new URL(tab.url);
    const pathParts = url.pathname.split('/');
    const appIndex = pathParts.indexOf('app');
    
    if (appIndex !== -1 && pathParts[appIndex + 1]) {
      const domain = url.origin;
      const appId = pathParts[appIndex + 1];
      
      // 如果URL包含工作流相关路径，自动开始轮询
      if (pathParts.includes('workflow') || pathParts.includes('logs')) {
        startPolling(domain, appId);
      }
    }
  }
});

// 监听标签页关闭
chrome.tabs.onRemoved.addListener((tabId) => {
  // 如果关闭的是当前轮询的标签页，停止轮询
  if (currentAppId) {
    stopPolling();
    currentAppId = null;
    currentDomain = null;
  }
});