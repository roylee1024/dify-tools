console.log("content injection code by extensions");

// 监听来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_CONSOLE_TOKEN') {
    // 从网页的localStorage获取token
    const token = localStorage.getItem('console_token');
    sendResponse({ token });
  } else if (request.type === 'CLICK_RUN_BUTTON') {
    // 处理点击运行按钮的请求
    try {
      clickRunButton()
        .then(result => {
          sendResponse({ success: true, message: '已点击运行按钮' });
          console.log('点击运行按钮结果:', result);
        })
        .catch(error => {
          sendResponse({ success: false, message: error.message || '点击运行按钮失败' });
          console.error('点击运行按钮失败:', error);
        });
    } catch (error) {
      sendResponse({ success: false, message: error.message || '点击运行按钮处理失败' });
      console.error('处理点击运行按钮请求失败:', error);
    }
    return true; // 保持消息通道开放，以便异步发送响应
  } else if (request.type === 'FILL_PARAMETERS') {
    // 处理填充参数的请求
    try {
      // 发送回应以避免popup等待超时
      sendResponse({ success: true, message: '正在尝试填充参数...' });
      
      // 异步执行参数填充
      fillParameters(request.params).then(result => {
        console.log('参数填充结果:', result);
      }).catch(error => {
        console.error('参数填充失败:', error);
      });
    } catch (error) {
      console.error('处理填充参数请求失败:', error);
      // 已经发送了响应，这里就不再发送了
    }
  }
  return true; // 保持消息通道开放
});

/**
 * 将参数填入Dify页面的测试表单
 * @param {Object} params - 参数对象，键为参数名，值为参数值
 * @returns {Promise} - 完成填充的Promise
 */
function fillParameters(params) {
  return new Promise((resolve, reject) => {
    console.log('准备填充参数:', params);
    
    // 尝试多次查找并填充元素，处理可能的DOM加载延迟
    let attempts = 0;
    const maxAttempts = 10;
    const intervalMs = 500;
    
    const attemptFill = () => {
      attempts++;
      console.log(`尝试填充 (${attempts}/${maxAttempts})...`);
      
      // 查找测试运行面板
      // 注意：标准querySelector不支持:contains和:has伪类选择器
      let runButton = document.querySelector('button[type="button"].btn.btn-primary');
      
      // 备用方法：遍历所有按钮查找包含特定文本的元素
      if (!runButton) {
        const allButtons = document.querySelectorAll('button, div.flex');
        for (const btn of allButtons) {
          if (btn.textContent && (btn.textContent.includes('开始运行') || btn.textContent.includes('运行'))) {
            runButton = btn;
            break;
          }
        }
      }
      let testPanel = null;
      
      // 如果找到了运行按钮，则向上查找第一个包含bg-components-panel-bg的父节点
      if (runButton) {
        let currentNode = runButton;
        while (currentNode && currentNode !== document.body) {
          if (currentNode.classList && currentNode.classList.toString().includes('bg-components-panel-bg')) {
            testPanel = currentNode;
            break;
          }
          currentNode = currentNode.parentNode;
        }
      }
      
      // 如果通过运行按钮未找到面板，尝试直接查找
      if (!testPanel) {
        testPanel = document.querySelector('.test-run, div[class*="flex h-full w-[420px] flex-col rounded"], div[class*="bg-components-panel-bg"]');
      }
      
      if (!testPanel) {
        console.log('未找到测试面板，可能未打开');
        if (attempts < maxAttempts) {
          setTimeout(attemptFill, intervalMs);
        } else {
          reject(new Error('无法找到测试面板'));
        }
        return;
      }
      
      // 获取参数列表
      const paramEntries = Object.entries(params);
      console.log('参数条目:', paramEntries);
      
      // 找到面板中的所有输入区域（可能包含标签和输入控件）
      // 根据用户提供的完整HTML，参数项的父级是 .px-4.pb-2.pt-3，其直接子div是各项参数容器
      const paramsArea = testPanel.querySelector('.px-4.pb-2.pt-3');
      let inputContainers = [];
      if (paramsArea) {
        inputContainers = paramsArea.querySelectorAll(':scope > div[class*="mb-2"]'); 
      } else {
        // 如果特定区域选择器失效，尝试一个更通用的选择器作为回退，尽管这可能不太精确
        console.warn('未能找到 .px-4.pb-2.pt-3 参数区域，尝试通用 .mb-2 选择器');
        inputContainers = testPanel.querySelectorAll('div[class*="mb-2"]');
      }
      
      console.log('Identified input containers:', inputContainers.length, inputContainers);

      const paramInputs = [];
      
      // 检测和收集所有可填充的输入控件（文本框、下拉列表等）
      if (inputContainers && inputContainers.length > 0) {
        console.log('找到输入容器数量:', inputContainers.length);
        
        // 遍历每个输入容器，查找输入控件
        inputContainers.forEach(container => {
          // 查找文本框
          const textarea = container.querySelector('textarea');
          if (textarea) {
            paramInputs.push({ 
              type: 'textarea', 
              element: textarea,
              label: getInputLabel(container)
            });
            return;
          }
          
          // 新增：优先识别 Headless UI Combobox
          const headlessUIButton = container.querySelector('button[id^="headlessui-combobox-button-"]');
          if (headlessUIButton) {
            const headlessUIRoot = headlessUIButton.closest('div[data-headlessui-state]');
            const label = getInputLabel(container);
            if (headlessUIRoot) {
                console.log('Found Headless UI Combobox (root):', headlessUIRoot, 'Label:', label);
                paramInputs.push({
                    type: 'customDropdown',
                    element: headlessUIRoot, 
                    label: label
                });
                return; 
            } else {
                console.log('Found Headless UI Combobox (button only):', headlessUIButton, 'Label:', label);
                paramInputs.push({
                    type: 'customDropdown',
                    element: headlessUIButton, 
                    label: label
                });
                return; 
            }
          }
          
        });
      } else {
        // 如果没有通过 inputContainers 找到，作为最后手段，尝试直接在 testPanel 中查找所有 textareas
        console.warn('No input containers found with specific selectors, falling back to finding all textareas in testPanel.');
        const textareas = testPanel.querySelectorAll('textarea');
        console.log('Fallback: Found textareas directly in testPanel:', textareas.length);
        textareas.forEach(textarea => {
          // 尝试获取其父容器的标签，但这可能不准确
          const parentContainer = textarea.closest('div[class*="mb-2"]'); 
          paramInputs.push({ type: 'textarea', element: textarea, label: parentContainer ? getInputLabel(parentContainer) : null });
        });
      }

      if (paramInputs.length === 0) {
        console.log('未找到任何可填充的输入控件');
        if (attempts < maxAttempts) {
          setTimeout(attemptFill, intervalMs);
        } else {
          reject(new Error('找不到输入控件'));
        }
        return;
      }
      
      console.log('找到输入控件数量:', paramInputs.length);
      
      let filledCount = 0;
      
      // 尝试通过标签匹配参数，如果无法匹配则按顺序填充
      if (paramInputs.some(input => input.label)) {
        console.log('尝试通过标签匹配参数');
        
        // 优先通过标签匹配
        paramEntries.forEach(([key, value]) => {
          // 查找具有匹配标签的输入控件
          const matchingInput = paramInputs.find(input => 
            input.label && input.label.toLowerCase().includes(key.toLowerCase())
          );
          
          if (matchingInput) {
            const success = fillInputByType(matchingInput, value);
            if (success) {
              filledCount++;
              console.log(`已填充参数 "${key}" 到标签 "${matchingInput.label}"`);
            }
          }
        });
      }
      
      // 如果没有通过标签匹配到任何参数，则按顺序填充
      if (filledCount === 0) {
        console.log('按顺序填充参数');
        
        // 获取参数值列表
        const paramValues = Object.values(params);
        
        // 按顺序填充参数
        paramInputs.forEach((input, index) => {
          if (index < paramValues.length) {
            const value = paramValues[index];
            const success = fillInputByType(input, value);
            if (success) {
              filledCount++;
              console.log(`已按顺序填充第 ${index + 1} 个参数`);
            }
          }
        });
      }
      
      if (filledCount > 0) {
        console.log(`成功填充了 ${filledCount} 个参数`);
        resolve({ success: true, filledCount });
      } else if (attempts < maxAttempts) {
        setTimeout(attemptFill, intervalMs);
      } else {
        reject(new Error('无法填充任何参数'));
      }
    };
    
    // 获取输入控件的标签文本
    function getInputLabel(container) {
      // 查找可能的标签元素
      const labelElement = container.querySelector('label, div[class*="label"], div.font-medium, span.font-medium');
      return labelElement ? labelElement.textContent.trim() : null;
    }
    
    // 根据输入控件类型填充值
    function fillInputByType(input, value) {
      try {
        const { type, element } = input;
        let stringValue = typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value);
        
        console.log(`填充类型为 ${type} 的控件，值: ${stringValue.substring(0, 50)}${stringValue.length > 50 ? '...' : ''}`);
        
        switch (type) {
          case 'textarea':
            // 填充文本框
            element.value = stringValue;
            element.dispatchEvent(new Event('input', { bubbles: true }));
            element.dispatchEvent(new Event('change', { bubbles: true }));
            return true;
            
          case 'customDropdown':
            // 处理自定义下拉列表, 特别是 Headless UI Combobox
            console.log('Attempting to fill customDropdown. Element:', element, 'Value:', stringValue);

            // 步骤1: 找到并点击触发下拉菜单的按钮
            let triggerButton = element.querySelector('button[id^="headlessui-combobox-button-"]');
            
            if (!triggerButton) {
                if (element.tagName === 'BUTTON' && element.id.startsWith('headlessui-combobox-button-')) {
                    triggerButton = element;
                } else {
                    triggerButton = element.querySelector('button.flex.items-center');
                }
            }

            if (triggerButton) {
              console.log('Found trigger button for custom dropdown:', triggerButton);
              // 先聚焦
              triggerButton.focus();
              // 依次派发 pointerdown、mousedown、mouseup、click
              ['pointerdown', 'mousedown', 'mouseup', 'click'].forEach(type => {
                const event = new Event(type, { bubbles: true, cancelable: true });
                triggerButton.dispatchEvent(event);
              });
              // 新增：依次点击父节点和兄弟节点
              const parent = triggerButton.parentElement;
              if (parent && isElementVisible(parent)) {
                try {
                  parent.focus();
                  // 依次派发 pointerdown、mousedown、mouseup、click
                  ['pointerdown', 'mousedown', 'mouseup', 'click'].forEach(type => {
                    const event = new Event(type, { bubbles: true, cancelable: true });
                    parent.dispatchEvent(event);
                  });
                  console.log('已点击 triggerButton 的父节点:', parent);
                } catch (e) {
                  console.warn('点击父节点时出错:', e);
                }
              } else {
                console.log('triggerButton 的父节点不存在或不可见');
              }
              const sibling = triggerButton.nextElementSibling;
              if (sibling && isElementVisible(sibling)) {
                try {
                  sibling.focus();
                  // 依次派发 pointerdown、mousedown、mouseup、click
                  ['pointerdown', 'mousedown', 'mouseup', 'click'].forEach(type => {
                    const event = new Event(type, { bubbles: true, cancelable: true });
                    sibling.dispatchEvent(event);
                  });
                  console.log('已点击 triggerButton 的兄弟节点:', sibling);
                } catch (e) {
                  console.warn('点击兄弟节点时出错:', e);
                }
              } else {
                console.log('triggerButton 的兄弟节点不存在或不可见');
              }
            } else {
              console.warn('Could not find a specific trigger button for customDropdown, trying to click the element itself:', element);
              element.click();
            }

            // 使用更长的延时确保下拉菜单完全渲染
            setTimeout(() => {
          
            }, 1000); // 增加延时，确保异步操作完成和UI更新
            return true;
            
          default:
            console.warn('未知的输入控件类型:', type);
            return false;
        }
      } catch (error) {
        console.error('填充输入控件时出错:', error);
        return false;
      }
    }
    
    // 开始尝试填充
    attemptFill();
  });
}

/**
 * 点击页面上的运行按钮，打开测试面板
 * @returns {Promise} - 点击操作的Promise
 */
function clickRunButton() {
  return new Promise((resolve, reject) => {
    // 检查页面是否已包含 "Test Run"
    if (document.body.innerText.includes("Test Run")) {
      console.log('Test Run面板已打开，无需点击运行按钮');
      resolve({ success: true, message: 'Test Run panel already open' });
      return;
    }
    console.log('尝试查找并点击运行按钮...');
    
    // 尝试多次查找并点击按钮，处理可能的DOM加载延迟
    let attempts = 0;
    const maxAttempts = 5;
    const intervalMs = 300;
    
    const attemptClick = () => {
      attempts++;
      console.log(`尝试查找运行按钮 (${attempts}/${maxAttempts})...`);
      
      // 根据HTML结构查找运行按钮
      // 查找包含运行文本和SVG图标的div
      const runButton = document.querySelector('div.flex.h-7.items-center.rounded-md.px-2\\.5.text-\\[13px\\].font-medium.text-components-button-secondary-accent-text.cursor-pointer');
      
      // 备用选择器
      const fallbackSelectors = [
        // 包含文本"运行"的按钮或div
        'div:has(svg) > span:contains("运行")',
        'div.flex:has(> svg):contains("运行")',
        // 在运行按钮容器内找匹配的元素
        '.h-8.items-center.rounded-lg.border div:contains("运行")',
        // 通过更复杂的样式组合查找
        '.flex.items-center.rounded-md:contains("运行")',
        // 直接通过文本内容查找
        'div:contains("运行")'
      ];
      
      let buttonFound = runButton;
      
      // 如果没找到，尝试备用选择器
      if (!buttonFound) {
        for (const selector of fallbackSelectors) {
          try {
            const element = document.querySelector(selector);
            if (element) {
              buttonFound = element;
              console.log('使用备用选择器找到运行按钮');
              break;
            }
          } catch (error) {
            console.log(`选择器 ${selector} 查询失败:`, error);
          }
        }
      }
      
      // 最后一种方法：查找所有div，查找包含"运行"文本的元素
      if (!buttonFound) {
        const allDivs = document.querySelectorAll('div');
        for (const div of allDivs) {
          if (div.textContent && div.textContent.includes('运行') && 
              div.querySelector('svg') && // 有svg子元素
              window.getComputedStyle(div).cursor === 'pointer') { // 鼠标样式为pointer
            buttonFound = div;
            console.log('通过文本内容和样式找到运行按钮');
            break;
          }
        }
      }
      
      if (buttonFound) {
        console.log('找到运行按钮:', buttonFound);
        try {
          // 模拟点击运行按钮
          buttonFound.click();
          console.log('已点击运行按钮');
          resolve({ success: true });
        } catch (error) {
          console.error('点击运行按钮时出错:', error);
          reject(new Error('点击运行按钮失败'));
        }
      } else if (attempts < maxAttempts) {
        console.log('未找到运行按钮，将再次尝试...');
        setTimeout(attemptClick, intervalMs);
      } else {
        console.error('未能找到运行按钮');
        reject(new Error('未能找到运行按钮'));
      }
    };
    
    // 开始尝试点击
    attemptClick();
  });
}

// 添加辅助函数来检查元素是否可见
function isElementVisible(element) {
  if (!element) return false;
  
  const style = window.getComputedStyle(element);
  return style.display !== 'none' && 
         style.visibility !== 'hidden' && 
         style.opacity !== '0' &&
         element.offsetWidth > 0 && 
         element.offsetHeight > 0;
}