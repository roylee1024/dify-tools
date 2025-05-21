// console.log('background.js');

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