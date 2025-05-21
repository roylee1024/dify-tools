<template>
  <div class="popup-container min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 ">
    <!-- Header -->
    <div class="flex justify-center items-center gap-2 mb-4">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="text-black">
        <circle cx="8" cy="8" r="1.5" fill="currentColor" />
        <circle cx="8" cy="12" r="1.5" fill="currentColor" />
        <circle cx="8" cy="16" r="1.5" fill="currentColor" />
        <circle cx="12" cy="8" r="1.5" fill="currentColor" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        <circle cx="12" cy="16" r="1.5" fill="currentColor" />
        <circle cx="16" cy="8" r="1.5" fill="currentColor" />
        <circle cx="16" cy="12" r="1.5" fill="currentColor" />
        <circle cx="16" cy="16" r="1.5" fill="currentColor" />
      </svg>
      <h1 class="text-2xl font-bold text-center text-black">Dify Tools</h1>
    </div>

    <!-- URL输入框 -->
    <div class="mb-4">
      <el-input 
        v-model="difyUrl" 
        placeholder="输入Dify工作流URL，例如: https://dify.mingxiangzhe.com/app/e0684868-3869-4fac-8b47-7f35248b01d5/workflow"
        clearable
        class="mb-2"
      >
        <template #append>
          <el-button @click="fetchActiveTabData">获取数据</el-button>
        </template>
      </el-input>
      <div v-if="urlInfo.appId" class="text-sm text-gray-600">
        当前应用ID: <span class="font-semibold">{{ urlInfo.appId }}</span>
      </div>
    </div>

    <!-- 主页面内容 -->
    <el-tabs v-model="activeTabName" class="flex-1 flex flex-col">
      <el-tab-pane label="调试记录" name="debugLogs" class="flex-1 flex flex-col">
        <div class="bg-white rounded-lg shadow-lg p-4 flex-1 flex flex-col">
          <el-table
            v-loading="loading"
            :data="currentPageData"
            style="width: 100%"
            :header-cell-style="{ background: '#f5f7fa' }"
            class="flex-1"
          >
            <el-table-column prop="created_at" label="时间" width="180">
              <template #default="scope">
                {{ formatDate(scope.row.created_at) }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="80">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)">
                  {{ mapStatus(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="executor" label="执行人" width="190">
              <template #default="scope">
                {{ scope.row.created_by_account?.name || '未知' }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="scope">
                <div class="flex gap-2">
                  <el-button
                    size="small"
                    type="primary"
                    @click="handleView(scope.row)"
                  >
                    查看
                  </el-button>
                  <el-button
                    size="small"
                    type="success"
                    @click="handleFillParameters(scope.row)"
                  >
                    重新运行
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>

          <div v-if="!loading && workflowData.length === 0" class="text-center py-10 text-gray-500">
            暂无调试记录，请输入正确的Dify工作流URL或检查筛选条件
          </div>

          <div v-if="workflowData.length > 0" class="flex justify-center mt-4">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[5]"
              :total="totalRecords"
              layout="total, sizes, prev, pager, next"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="API记录" name="apiLogs" class="flex-1 flex flex-col">
        <div class="bg-white rounded-lg shadow-lg p-4 flex-1 flex flex-col">
          <el-table
            v-loading="apiLogLoading"
            :data="apiLogData"
            style="width: 100%"
            :header-cell-style="{ background: '#f5f7fa' }"
            class="flex-1"
          >
            <el-table-column label="时间" width="180">
              <template #default="scope">
                {{ formatDate(scope.row.workflow_run.created_at) }}
              </template>
            </el-table-column>
            <el-table-column label="状态" width="120">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.workflow_run.status)">
                  {{ mapStatus(scope.row.workflow_run.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="250">
              <template #default="scope">
                <div class="flex gap-2">
                  <el-button
                    size="small"
                    type="primary"
                    @click="handleViewApiLog(scope.row)"
                  >
                    查看
                  </el-button>
                  <el-button
                    size="small"
                    type="success"
                    @click="handleFillParametersApiLog(scope.row)"
                  >
                    重新运行
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>

          <div v-if="!apiLogLoading && apiLogData.length === 0 && apiLogTotalRecords === 0" class="text-center py-10 text-gray-500">
            暂无API记录
          </div>
          
          <div v-if="apiLogTotalRecords > 0" class="flex justify-center mt-4">
            <el-pagination
              v-model:current-page="apiLogCurrentPage"
              v-model:page-size="apiLogPageSize"
              :page-sizes="[5, 10, 20]"
              :total="apiLogTotalRecords"
              layout="total, sizes, prev, pager, next"
              @size-change="handleApiLogSizeChange"
              @current-change="handleApiLogCurrentChange"
            />
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, h } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { extractUrlInfo, getWorkflowRuns, mapStatusToChinese, timestampToDate, getWorkflowAppLogs, api } from '../../lib/api';

// URL相关
const difyUrl = ref('');
const urlInfo = ref({ domain: null, appId: null });

// Tabs State
const activeTabName = ref('debugLogs'); // 'debugLogs' 或 'apiLogs'

// 数据和加载状态 - Debug Logs
const workflowData = ref([]);
const loading = ref(false);
const consoleToken = ref('');

// 分页相关 - Debug Logs
const currentPage = ref(1);
const pageSize = ref(5);
const totalRecords = ref(0);

// API Logs State Variables
const apiLogData = ref([]);
const apiLogLoading = ref(false);
const apiLogCurrentPage = ref(1);
const apiLogPageSize = ref(5);
const apiLogTotalRecords = ref(0);


// 监听URL变化
watch(difyUrl, (newUrl) => {
  if (newUrl) {
    const info = extractUrlInfo(newUrl);
    urlInfo.value = info;
    // 当URL变化且解析出appId时，清空旧数据并根据当前标签页尝试获取新数据
    if (info.appId) {
      workflowData.value = [];
      totalRecords.value = 0;
      currentPage.value = 1;
      apiLogData.value = [];
      apiLogTotalRecords.value = 0;
      apiLogCurrentPage.value = 1;
      // fetchActiveTabData(); // 考虑是否在此处自动获取，或仅由按钮触发
    }
  } else {
    urlInfo.value = { domain: null, appId: null };
  }
});

// 监听活动标签页变化
watch(activeTabName, (newTab) => {
  if (urlInfo.value.appId && !consoleToken.value) {
      // 如果切换标签页时还没有token，尝试获取。这主要为了首次加载非默认标签页的情况。
      getConsoleToken().then(() => {
          if (consoleToken.value) { // 确保获取成功
              fetchDataForCurrentTab(newTab);
          }
      });
  } else if (urlInfo.value.appId && consoleToken.value) {
      fetchDataForCurrentTab(newTab);
  }
});

const fetchDataForCurrentTab = (tabName) => {
    if (tabName === 'apiLogs') {
        fetchApiLogData();
    } else if (tabName === 'debugLogs') {
        fetchWorkflowData();
    }
}

// 获取console_token
const getConsoleToken = async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.id) { // 确保 tab.id 存在
      const response = await chrome.tabs.sendMessage(tab.id, { type: 'GET_CONSOLE_TOKEN' });
      if (response && response.token) {
        consoleToken.value = response.token;
        await chrome.storage.local.set({ console_token: response.token });
      } else {
        // ElMessage.warning('未能从当前页面获取认证Token，部分功能可能受限。');
        console.warn('未能从当前页面获取认证Token');
      }
    }
  } catch (error) {
    console.error('获取console_token失败:', error);
    // ElMessage.error('获取认证Token失败，请确保Dify页面已打开并重试。');
  }
};


// 获取工作流数据 (调试记录)
const fetchWorkflowData = async () => {
  if (!urlInfo.value.domain || !urlInfo.value.appId) {
    if (activeTabName.value === 'debugLogs') ElMessage.warning('请输入有效的Dify工作流URL');
    return;
  }
  if (!consoleToken.value) {
    await getConsoleToken();
    if (!consoleToken.value && activeTabName.value === 'debugLogs') {
        ElMessage.warning('无法获取认证Token，请检查Dify页面或刷新插件。');
        return;
    }
  }

  loading.value = true;
  try {
    const data = await getWorkflowRuns(urlInfo.value.domain, urlInfo.value.appId);
    workflowData.value = data.data || [];
    totalRecords.value = workflowData.value.length;
    if (activeTabName.value === 'debugLogs') {
      if (workflowData.value.length > 0) {
      } else {
        ElMessage.info('未找到调试记录数据');
      }
    }
  } catch (error) {
    if (activeTabName.value === 'debugLogs') ElMessage.error('获取调试记录失败: ' + (error.message || '未知错误'));
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// 获取API日志数据
const fetchApiLogData = async (newPage = 1) => {
  if (!urlInfo.value.domain || !urlInfo.value.appId) {
    if (activeTabName.value === 'apiLogs') ElMessage.warning('请输入有效的Dify工作流URL并解析应用ID');
    return;
  }
   if (!consoleToken.value) {
    await getConsoleToken();
     if (!consoleToken.value && activeTabName.value === 'apiLogs') {
        ElMessage.warning('无法获取认证Token，请检查Dify页面或刷新插件。');
        return;
    }
  }

  apiLogLoading.value = true;
  apiLogCurrentPage.value = newPage;
  try {
    const result = await getWorkflowAppLogs(urlInfo.value.domain, urlInfo.value.appId, apiLogCurrentPage.value, apiLogPageSize.value);
    apiLogData.value = result.data || [];
    apiLogTotalRecords.value = result.total || 0;
    if (activeTabName.value === 'apiLogs') {
      if (apiLogData.value.length > 0 || result.total > 0) { // 即使当前页没数据，但总数有，也算成功
      } else if (result.total === 0) {
         ElMessage.info('未找到API日志数据');
      }
    }
  } catch (error) {
    if (activeTabName.value === 'apiLogs') ElMessage.error('获取API日志失败: ' + (error.message || '未知错误'));
    console.error(error);
    apiLogData.value = []; 
    apiLogTotalRecords.value = 0;
  } finally {
    apiLogLoading.value = false;
  }
};

const fetchActiveTabData = () => {
  if (!urlInfo.value.appId) {
     ElMessage.warning('请输入有效的Dify工作流URL并解析应用ID');
     return;
  }
  // 确保有token
  if (!consoleToken.value) {
    getConsoleToken().then(() => {
        if(consoleToken.value){ // 成功获取token后再执行
            if (activeTabName.value === 'debugLogs') {
                fetchWorkflowData();
            } else if (activeTabName.value === 'apiLogs') {
                fetchApiLogData(1); // API日志获取通常带分页，重置到第一页
            }
        } else {
            ElMessage.warning('无法获取认证Token，请检查Dify页面或刷新插件。');
        }
    });
  } else {
      if (activeTabName.value === 'debugLogs') {
        fetchWorkflowData();
      } else if (activeTabName.value === 'apiLogs') {
        fetchApiLogData(1); 
      }
  }
};


// 格式化日期
const formatDate = (timestamp) => {
  if (!timestamp) return '-';
  const date = timestampToDate(timestamp);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// 映射状态
const mapStatus = (status) => {
  return mapStatusToChinese(status);
};

// 获取状态类型
const getStatusType = (status) => {
  const types = {
    'succeeded': 'success',
    'failed': 'danger',
    'running': 'warning',
    'pending': 'info'
  };
  return types[status] || 'info';
};

// 计算当前页数据 - Debug Logs (客户端分页)
const currentPageData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return workflowData.value.slice(start, end);
});

// 处理页码改变 - Debug Logs
const handleCurrentChange = (val) => {
  currentPage.value = val;
};

// 处理每页条数改变 - Debug Logs
const handleSizeChange = (val) => {
  pageSize.value = val;
  currentPage.value = 1;
};

// 处理页码改变 - API Logs
const handleApiLogCurrentChange = (val) => {
  fetchApiLogData(val);
};

// 处理每页条数改变 - API Logs
const handleApiLogSizeChange = (val) => {
  apiLogPageSize.value = val;
  fetchApiLogData(1); 
};


// 获取节点执行数据 (通用)
const getNodeData = async (workflowRunId) => { // Changed parameter to workflowRunId
  try {
    // loading.value = true; // Consider separate loading for this or manage globally
    
    const url = `${urlInfo.value.domain}/console/api/apps/${urlInfo.value.appId}/workflow-runs/${workflowRunId}/node-executions`;
    
    const response = await api.get(url);
    const nodeData = response.data.data || [];
    
    const startNode = nodeData.find(node => node.node_type === 'start');
    
    if (!startNode || !startNode.inputs) {
      // ElMessage.warning('未找到起始节点数据，可能该运行没有输入参数或执行未开始。');
      // return null; // 返回null或空对象，让调用者处理
      throw new Error('未找到起始节点数据');
    }
    
    return startNode.inputs;
  } catch (error) {
    // ElMessage.error('获取节点执行数据失败: ' + (error.message || '未知错误'));
    // console.error('Error in getNodeData:', error);
    throw error; // Rethrow to be caught by caller
  } finally {
    // loading.value = false;
  }
};

// 处理查看详情 - Debug Logs
const handleView = async (row) => {
  try {
    loading.value = true; // Specific loading for this action
    const inputs = await getNodeData(row.id);
    showInputsDialog(inputs, async () => { // Pass a callback for fill parameters
      await handleFillParameters(row);
    });
  } catch (error) {
    ElMessage.error('获取节点执行数据失败: ' + (error.message || '未知错误'));
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// 处理查看详情 - API Logs
const handleViewApiLog = (row) => {
  // API log row.workflow_run 包含主要信息
  showDetailsDialog('API日志详情', row.workflow_run || row, async () => { // Pass a callback
     await handleFillParametersApiLog(row);
  });
};

// 处理回填参数 - Debug Logs
const handleFillParameters = async (row) => { // row is a workflow_run object
  try {
    loading.value = true; // Specific loading for this action
    const inputs = await getNodeData(row.id);
    if (!inputs) {
        ElMessage.warning('未找到可回填的参数。');
        return;
    }
    const userInputs = filterSystemParams(inputs);
    
    if (Object.keys(userInputs).length === 0) {
      ElMessage.warning('无用户参数数据可回填');
      return;
    }
    
    await fillParametersToPage(userInputs);
  } catch (error) {
    ElMessage.error('回填参数失败: ' + (error.message || '未知错误'));
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// 处理回填参数 - API Logs
const handleFillParametersApiLog = async (apiLogRow) => {
  if (apiLogRow.workflow_run && apiLogRow.workflow_run.id) {
    try {
        apiLogLoading.value = true; // Use API log loading
        const inputs = await getNodeData(apiLogRow.workflow_run.id);
         if (!inputs) {
            ElMessage.warning('未找到可回填的参数。');
            return;
        }
        const userInputs = filterSystemParams(inputs);

        if (Object.keys(userInputs).length === 0) {
            ElMessage.warning('无用户参数数据可回填');
            return;
        }
        await fillParametersToPage(userInputs);
    } catch (error) {
        ElMessage.error('从API日志回填参数失败: ' + (error.message || '未知错误'));
        console.error(error);
    } finally {
        apiLogLoading.value = false;
    }
  } else {
    ElMessage.error('无法获取API日志的workflow_run详情以回填参数');
  }
};

const filterSystemParams = (inputs) => {
    const userInputs = {};
    if (inputs && typeof inputs === 'object') {
        Object.keys(inputs).forEach(key => {
            if (!key.startsWith('sys.')) {
                userInputs[key] = inputs[key];
            }
        });
    }
    return userInputs;
};


// 复制文本到剪贴板的函数
const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text)
    .then(() => {
      ElMessage.success({ message: '复制成功', duration: 1500 });
    })
    .catch(() => {
      ElMessage.error({ message: '复制失败，请手动复制', duration: 1500 });
    });
};

// 显示inputs参数对话框 (Debug Logs specific, or can be made more generic)
const showInputsDialog = (inputs, fillCallback) => { // Added fillCallback
  const userInputs = filterSystemParams(inputs);

  let messageVNodeList = [];

  if (Object.keys(userInputs).length === 0) {
    messageVNodeList.push(h('div', { class: 'text-center py-4' }, '无参数数据'));
  } else {
    const inputVNodes = Object.entries(userInputs).map(([key, val]) => {
      const displayValue = typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val);
      return h('div', { class: 'mb-4', key: key }, [
        h('h3', { class: 'text-md font-bold mb-2' }, key),
        h('div', { class: 'relative' }, [
          h('textarea', {
            value: displayValue,
            rows: 2,
            readonly: true,
            class: 'w-full border border-gray-300 rounded p-2 pr-10' 
          }),
          h('button', {
            class: 'absolute right-2 top-2 bg-blue-500 hover:bg-blue-600 text-white rounded p-1 text-xs',
            onClick: () => copyToClipboard(displayValue)
          }, '复制')
        ])
      ]);
    });
    messageVNodeList.push(...inputVNodes);
  }
  
  const buttons = [];
  if (Object.keys(userInputs).length > 0 && fillCallback) {
      buttons.push(h('button', {
          class: 'mt-4 w-full bg-green-500 hover:bg-green-600 text-white rounded py-2 px-4 flex items-center justify-center',
          onClick: async () => {
              ElMessageBox.close(); // Close this dialog first
              await fillCallback();
          }
      }, [ /* SVG and text for fill button */ 
          h('svg', { viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg', width: '16', height: '16', fill: 'currentColor', class: 'mr-2'}, [h('path', { d: 'M11 11V5H13V11H19V13H13V19H11V13H5V11H11Z' })]),
          '填入参数到页面'
      ]));
  }
  
  const messageVNode = h('div', { class: 'w-full' }, [ ...messageVNodeList, ...buttons ]);

  ElMessageBox.alert(messageVNode, '节点输入参数', {
    showConfirmButton: !fillCallback, // Hide default confirm if we have custom actions
    confirmButtonText: '关闭',
    customClass: 'inputs-dialog',
    dangerouslyUseHTMLString: false,
    callback: () => {}
  });
};

// 通用详情显示对话框
const showDetailsDialog = (title, dataObject, fillCallback) => { // Added fillCallback
  let content;
  const userInputs = dataObject?.inputs ? filterSystemParams(dataObject.inputs) : (title === 'API日志详情' ? filterSystemParams(dataObject) : {});


  if (!dataObject || Object.keys(dataObject).length === 0) {
    content = [h('div', { class: 'text-center py-4' }, '无详细数据')];
  } else {
    const prettyJson = JSON.stringify(dataObject, null, 2);
    content = [
      h('pre', { style: 'white-space: pre-wrap; word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 4px; max-height: 40vh; overflow-y: auto;' }, prettyJson),
      h('button', {
        class: 'mt-2 bg-blue-500 hover:bg-blue-600 text-white rounded py-1 px-2 text-xs',
        onClick: () => copyToClipboard(prettyJson)
      }, '复制JSON')
    ];
  }

  const buttons = [];
   // Add "Fill Parameters" button only if it's API Log Details and there's a callback and inputs
  if (title === 'API日志详情' && fillCallback && dataObject && Object.keys(userInputs).length > 0) {
     buttons.push(h('button', {
          class: 'mt-4 w-full bg-green-500 hover:bg-green-600 text-white rounded py-2 px-4 flex items-center justify-center',
          onClick: async () => {
              ElMessageBox.close();
              await fillCallback();
          }
      }, [ /* SVG and text for fill button */ 
          h('svg', { viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg', width: '16', height: '16', fill: 'currentColor', class: 'mr-2'}, [h('path', { d: 'M11 11V5H13V11H19V13H13V19H11V13H5V11H11Z' })]),
          '填入参数到页面'
      ]));
  }

  const messageVNode = h('div', { class: 'w-full' }, [ ...content, ...buttons]);

  ElMessageBox.alert(messageVNode, title, {
    showConfirmButton: buttons.length === 0, // Only show confirm if no custom buttons
    confirmButtonText: '关闭',
    customClass: 'details-dialog inputs-dialog', // Use existing class for sizing
    dangerouslyUseHTMLString: false,
  });
};


// 添加填充参数到页面的函数
const fillParametersToPage = async (params) => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.id) {
      const clickRunResult = await new Promise((resolve) => {
        chrome.tabs.sendMessage(tab.id, { type: 'CLICK_RUN_BUTTON' }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('发送点击运行按钮消息错误:', chrome.runtime.lastError);
            resolve({ success: false, message: chrome.runtime.lastError.message });
            return;
          }
          resolve(response || { success: true, message: '运行按钮点击消息已发送（无明确响应）。' }); // Assume success if no error and no specific response format.
        });
      });
      
      if (!clickRunResult.success && clickRunResult.message !== '未收到响应' && clickRunResult.message !== '运行按钮点击消息已发送（无明确响应）。') { // Tolerate "no response" as potentially OK
        ElMessage.error('点击运行按钮失败: ' + (clickRunResult.message || '未知错误'));
        return;
      }
      
      ElMessage.info({ message: '运行按钮已点击，正在等待输入框加载...', duration: 1500 });
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      chrome.tabs.sendMessage(tab.id, { type: 'FILL_PARAMETERS', params: params }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('发送填充参数消息错误:', chrome.runtime.lastError);
          ElMessage.error('填入参数失败: ' + chrome.runtime.lastError.message);
          return;
        }
        if (response && response.success) {
          ElMessage.success({ message: '参数填充请求已发送，请查看页面', duration: 3000 });
        } else {
          ElMessage.error('填入参数失败: ' + (response?.message || '未知错误或未收到成功响应'));
        }
      });
    } else {
      ElMessage.error('无法获取当前标签页');
    }
  } catch (error) {
    console.error('填入参数失败:', error);
    ElMessage.error('填入参数失败: ' + (error.message || '未知错误'));
  }
};

// 初始化
onMounted(async () => {
  try {
    const queryInfo = new URLSearchParams(window.location.search);
    const urlParam = queryInfo.get('url');
    let targetUrl = '';

    if (urlParam) {
      targetUrl = decodeURIComponent(urlParam);
    } else {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url) {
        targetUrl = tab.url;
      }
    }
    
    if (targetUrl) {
      if (targetUrl.includes('/app/') && (targetUrl.includes('/workflow') || targetUrl.match(/\/app\/[a-f0-9-]+\/?(logs|workflow)?$/))) { // More flexible regex for URL matching
        difyUrl.value = targetUrl; // Set the input field
        const info = extractUrlInfo(targetUrl); // This will parse the URL for domain/appId
        urlInfo.value = info;
        
        if (info.appId) {
          await getConsoleToken(); // Attempt to get token first
          if(consoleToken.value){ // If token is successfully retrieved
             fetchDataForCurrentTab(activeTabName.value); // Fetch data for the initially active tab
          } else {
            ElMessage.warning('未能获取认证Token，请确保Dify控制台已登录或刷新插件重试。数据可能无法加载。');
          }
        } else {
            // If no appId, it might be a base Dify URL, not a specific workflow
            ElMessage.info('请输入完整Dify工作流URL以加载数据。');
        }
      } else {
        ElMessage.warning('当前页面似乎不是有效的Dify应用或工作流页面。');
      }
    }
  } catch (error) {
    console.error('初始化错误:', error);
    ElMessage.error('初始化失败: ' + (error.message || '未知错误'));
  }
});
</script>

<style scoped>
.el-table {
  --el-table-border-color: #ebeef5;
  --el-table-header-bg-color: #f5f7fa;
}

.el-pagination {
  --el-pagination-button-bg-color: #ffffff;
  --el-pagination-hover-color: #409eff;
}

.popup-container {
  width: 700px;
  min-height: 500px; /* Adjusted min-height for potentially more content */
  max-height: 700px; /* Added max-height to prevent excessive growth */
  display: flex;
  flex-direction: column;
  padding: 16px; /* Added padding to container */
}

/* Ensure tabs fill height */
.el-tabs.flex-1 {
  display: flex;
  flex-direction: column;
  overflow: hidden; /* Prevent content from overflowing tabs container */
}

.el-tabs__content {
  flex: 1;
  display: flex; 
  overflow-y: auto; /* Allow content within tab content to scroll if needed */
}

.el-tab-pane.flex-1 {
  height: 100%; 
  display: flex; 
  flex-direction: column;
}
.el-tab-pane > .bg-white { /* Target the direct child div for flex properties */
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden; /* Ensure inner content manages its own scroll */
}
.el-tab-pane .el-table.flex-1 {
    overflow-y: auto; /* Allow table itself to scroll if content exceeds pane */
}

</style>

<!-- 全局样式，用于影响 Element Plus 的弹窗组件 -->
<style>
/* MessageBox 样式 */
.inputs-dialog { /* Shared by both old and new dialogs */
  max-width: 90% !important;
  width: 600px !important;
}

.details-dialog .el-message-box__content { /* Specific to new details dialog for scrollable pre */
  max-height: 70vh;
  overflow-y: auto;
}
.details-dialog pre {
  font-size: 0.85rem;
  text-align: left; /* Ensure preformatted text is left-aligned */
}


.el-message-box {
  width: auto !important; /* Allow auto width based on content or customClass */
  /* max-width: 600px !important; /* Already set by inputs-dialog */
}

.el-message-box__content {
  /* width: 100% !important; */ /* May be too restrictive, allow natural flow */
  /* max-width: 100% !important; */
}

.el-message-box__message {
  /* width: 100% !important; */
  /* max-width: 100% !important; */
  overflow: visible !important; /* Allow content to define its overflow, e.g., pre tag */
}

.el-message-box__message > div {
  width: 100% !important; /* Ensure inner div takes full width of message area */
  max-width: 100% !important;
}

.el-message-box__message textarea {
  width: 100% !important;
  max-width: 100% !important;
  box-sizing: border-box !important;
}
</style>
