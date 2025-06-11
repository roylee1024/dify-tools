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
      <a href="https://github.com/roylee1024/dify-tools" target="_blank" class="text-black hover:text-gray-600">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      </a>
    </div>

    <!-- URL Input -->
    <div class="mb-4">
      <el-input 
        v-model="difyUrl" 
        placeholder="Enter Dify Workflow URL, e.g.: https://dify.mingxiangzhe.com/app/e0684868-3869-4fac-8b47-7f35248b01d5/workflow"
        clearable
        class="mb-2"
      >
        <template #append>
          <el-button @click="fetchActiveTabData">Fetch Data</el-button>
        </template>
      </el-input>
      <div v-if="urlInfo.appId" class="text-sm text-gray-600">
        Current App ID: <span class="font-semibold">{{ urlInfo.appId }}</span>
      </div>
    </div>

    <!-- Main Content -->
    <el-tabs v-model="activeTabName" class="flex-1 flex flex-col">
      <el-tab-pane label="Debug Logs" name="debugLogs" class="flex-1 flex flex-col">
        <div class="bg-white rounded-lg shadow-lg p-4 flex-1 flex flex-col">
          <el-table
            v-loading="loading"
            :data="currentPageData"
            style="width: 100%"
            :header-cell-style="{ background: '#f5f7fa' }"
            class="flex-1"
          >
            <el-table-column prop="created_at" label="Time" width="200">
              <template #default="scope">
                {{ formatDate(scope.row.created_at) }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="Status" width="120">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)">
                  {{ mapStatus(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="executor" label="Executor" width="160">
              <template #default="scope">
                {{ scope.row.created_by_account?.name || 'Unknown' }}
              </template>
            </el-table-column>
            <el-table-column label="Actions" width="150">
              <template #default="scope">
                <div class="flex gap-2">
                  <el-button
                    size="small"
                    type="primary"
                    @click="handleView(scope.row)"
                  >
                    View
                  </el-button>
                  <el-button
                    size="small"
                    type="success"
                    @click="handleFillParameters(scope.row)"
                  >
                    Re-run
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>

          <div v-if="!loading && workflowData.length === 0" class="text-center py-10 text-gray-500">
            No debug logs. Please enter a valid Dify workflow URL or check filter conditions.
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

      <el-tab-pane label="API Logs" name="apiLogs" class="flex-1 flex flex-col">
        <div class="bg-white rounded-lg shadow-lg p-4 flex-1 flex flex-col">
          <el-table
            v-loading="apiLogLoading"
            :data="apiLogData"
            style="width: 100%"
            :header-cell-style="{ background: '#f5f7fa' }"
            class="flex-1"
          >
            <el-table-column label="Time" width="200">
              <template #default="scope">
                {{ formatDate(scope.row.workflow_run.created_at) }}
              </template>
            </el-table-column>
            <el-table-column label="Status" width="150">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.workflow_run.status)">
                  {{ mapStatus(scope.row.workflow_run.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="Actions" width="280">
              <template #default="scope">
                <div class="flex gap-2">
                  <el-button
                    size="small"
                    type="primary"
                    @click="handleViewApiLog(scope.row)"
                  >
                    View
                  </el-button>
                  <el-button
                    size="small"
                    type="success"
                    @click="handleFillParametersApiLog(scope.row)"
                  >
                    Re-run
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>

          <div v-if="!apiLogLoading && apiLogData.length === 0 && apiLogTotalRecords === 0" class="text-center py-10 text-gray-500">
            No API logs.
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

      <el-tab-pane label="工作流草稿" name="workflowDrafts" class="flex-1 flex flex-col">
        <div class="bg-white rounded-lg shadow-lg p-4 flex-1 flex flex-col">
          <div class="flex justify-between items-center mb-4">
            <div class="flex items-center space-x-2">
              <el-button
                type="danger"
                size="small"
                @click="clearDrafts"
                :disabled="cachedDrafts.length === 0"
              >
                清除缓存
              </el-button>
            </div>
          </div>
          
          <el-table
            v-if="cachedDrafts.length > 0"
            :data="currentPageDrafts"
            style="width: 100%"
            size="small"
            class="flex-1"
          >
            <el-table-column
              prop="data.created_at"
              label="创建时间"
              width="180"
            >
              <template #default="{ row }">
                {{ formatDate(row.data.updated_at) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="data.created_by.name"
              label="名称"
            />
            <el-table-column
              label="操作"
              width="120"
            >
              <template #default="{ row }">
                <el-button
                  size="small"
                  type="warning"
                  @click="handleRollback(row)"
                >
                  回滚
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <el-empty
            v-else
            description="暂无缓存的草稿"
          />

          <div v-if="cachedDrafts.length > 0" class="flex justify-center mt-4">
            <el-pagination
              v-model:current-page="draftCurrentPage"
              v-model:page-size="draftPageSize"
              :page-sizes="[5]"
              :total="draftTotalRecords"
              layout="total, sizes, prev, pager, next"
              @size-change="handleDraftSizeChange"
              @current-change="handleDraftCurrentChange"
            />
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, h, onUnmounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { extractUrlInfo, getWorkflowRuns, mapStatusToString, timestampToDate, getWorkflowAppLogs, getDraft,saveDraft, api } from '../../lib/api';
import { startPolling, stopPolling, getCachedDrafts, clearCachedDrafts, getNewestHash } from '../../lib/workflow-cache';

// URL Related
const difyUrl = ref('');
const urlInfo = ref({ domain: null, appId: null });

// Tabs State
const activeTabName = ref('debugLogs'); // 'debugLogs', 'apiLogs', or 'workflowDrafts'

// Data and Loading State - Debug Logs
const workflowData = ref([]);
const loading = ref(false);
const consoleToken = ref('');

// Pagination - Debug Logs
const currentPage = ref(1);
const pageSize = ref(5);
const totalRecords = ref(0);

// API Logs State Variables
const apiLogData = ref([]);
const apiLogLoading = ref(false);
const apiLogCurrentPage = ref(1);
const apiLogPageSize = ref(5);
const apiLogTotalRecords = ref(0);

// 工作流草稿相关状态
const cachedDrafts = ref([]);
const draftCurrentPage = ref(1);
const draftPageSize = ref(5);
const draftTotalRecords = ref(0);

// Watch URL Changes
watch(difyUrl, (newUrl) => {
  if (newUrl) {
    const info = extractUrlInfo(newUrl);
    urlInfo.value = info;
    // When URL changes and appId is parsed, clear old data and try to fetch new data based on the current tab
    if (info.appId) {
      workflowData.value = [];
      totalRecords.value = 0;
      currentPage.value = 1;
      apiLogData.value = [];
      apiLogTotalRecords.value = 0;
      apiLogCurrentPage.value = 1;
      // fetchActiveTabData(); // Consider whether to fetch automatically here, or only trigger by button
    }
  } else {
    urlInfo.value = { domain: null, appId: null };
  }
});

// Watch Active Tab Changes
watch(activeTabName, (newTab) => {
  if (urlInfo.value.appId && !consoleToken.value) {
      // If token is not available when switching tabs, try to get it. This is mainly for the case of loading a non-default tab for the first time.
      getConsoleToken().then(() => {
          if (consoleToken.value) { // Ensure successful acquisition
              fetchDataForCurrentTab(newTab);
          }
      });
  } else if (urlInfo.value.appId && consoleToken.value) {
      fetchDataForCurrentTab(newTab);
  }
});

const fetchDataForCurrentTab = async (tabName) => {
    if (tabName === 'apiLogs') {
        fetchApiLogData();
    } else if (tabName === 'debugLogs') {
        fetchWorkflowData();
    } else if (tabName === 'workflowDrafts') {
        // 获取缓存的草稿数据
        try {
            const drafts = await getCachedDrafts(urlInfo.value.appId);
            console.log('drafts', drafts);
            cachedDrafts.value = drafts;
            draftTotalRecords.value = drafts.length;
        } catch (error) {
            console.error('Failed to get cached drafts:', error);
            ElMessage.error('获取缓存的草稿失败: ' + (error.message || '未知错误'));
        }
    }
}

// Get console_token
const getConsoleToken = async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.id) { // Ensure tab.id exists
      const response = await chrome.tabs.sendMessage(tab.id, { type: 'GET_CONSOLE_TOKEN' });
      if (response && response.token) {
        consoleToken.value = response.token;
        await chrome.storage.local.set({ console_token: response.token });
      } else {
        // ElMessage.warning('Failed to get authentication token from the current page, some features might be limited.');
        console.warn('Failed to get authentication token from the current page');
      }
    }
  } catch (error) {
    console.error('Failed to get console_token:', error);
    // ElMessage.error('Failed to get authentication token. Please ensure Dify page is open and try again.');
  }
};


// Fetch Workflow Data (Debug Logs)
const fetchWorkflowData = async () => {
  if (!urlInfo.value.domain || !urlInfo.value.appId) {
    if (activeTabName.value === 'debugLogs') ElMessage.warning('Please enter a valid Dify workflow URL');
    return;
  }
  if (!consoleToken.value) {
    await getConsoleToken();
    if (!consoleToken.value && activeTabName.value === 'debugLogs') {
        ElMessage.warning('Unable to get authentication token. Please check the Dify page or refresh the extension.');
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
        ElMessage.info('No debug log data found');
      }
    }
  } catch (error) {
    if (activeTabName.value === 'debugLogs') ElMessage.error('Failed to fetch debug logs: ' + (error.message || 'Unknown error'));
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// Fetch API Log Data
const fetchApiLogData = async (newPage = 1) => {
  if (!urlInfo.value.domain || !urlInfo.value.appId) {
    if (activeTabName.value === 'apiLogs') ElMessage.warning('Please enter a valid Dify workflow URL and parse the App ID');
    return;
  }
   if (!consoleToken.value) {
    await getConsoleToken();
     if (!consoleToken.value && activeTabName.value === 'apiLogs') {
        ElMessage.warning('Unable to get authentication token. Please check the Dify page or refresh the extension.');
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
      if (apiLogData.value.length > 0 || result.total > 0) { // Even if there is no data on the current page, but there is a total, it is considered successful
      } else if (result.total === 0) {
         ElMessage.info('No API log data found');
      }
    }
  } catch (error) {
    if (activeTabName.value === 'apiLogs') ElMessage.error('Failed to fetch API logs: ' + (error.message || 'Unknown error'));
    console.error(error);
    apiLogData.value = []; 
    apiLogTotalRecords.value = 0;
  } finally {
    apiLogLoading.value = false;
  }
};

const fetchActiveTabData = () => {
  if (!urlInfo.value.appId) {
     ElMessage.warning('Please enter a valid Dify workflow URL and parse the App ID');
     return;
  }
  // Ensure token exists
  if (!consoleToken.value) {
    getConsoleToken().then(() => {
        if(consoleToken.value){ // Execute after successfully obtaining the token
            if (activeTabName.value === 'debugLogs') {
                fetchWorkflowData();
            } else if (activeTabName.value === 'apiLogs') {
                fetchApiLogData(1); // API log fetching usually involves pagination, reset to the first page
            }
        } else {
            ElMessage.warning('Unable to get authentication token. Please check the Dify page or refresh the extension.');
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


// Format Date
const formatDate = (timestamp) => {
  if (!timestamp) return '-';
  const date = timestampToDate(timestamp);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

// Map Status
const mapStatus = (status) => {
  return mapStatusToString(status);
};

// Get Status Type
const getStatusType = (status) => {
  const types = {
    'succeeded': 'success',
    'failed': 'danger',
    'running': 'warning',
    'pending': 'info'
  };
  return types[status] || 'info';
};

// Calculate Current Page Data - Debug Logs (Client-side Pagination)
const currentPageData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return workflowData.value.slice(start, end);
});

// Handle Current Page Change - Debug Logs
const handleCurrentChange = (val) => {
  currentPage.value = val;
};

// Handle Page Size Change - Debug Logs
const handleSizeChange = (val) => {
  pageSize.value = val;
  currentPage.value = 1;
};

// Handle Current Page Change - API Logs
const handleApiLogCurrentChange = (val) => {
  fetchApiLogData(val);
};

// Handle Page Size Change - API Logs
const handleApiLogSizeChange = (val) => {
  apiLogPageSize.value = val;
  fetchApiLogData(1); 
};


// Get Node Execution Data (Generic)
const getNodeData = async (workflowRunId) => { // Changed parameter to workflowRunId
  try {
    // loading.value = true; // Consider separate loading for this or manage globally
    
    const url = `${urlInfo.value.domain}/console/api/apps/${urlInfo.value.appId}/workflow-runs/${workflowRunId}/node-executions`;
    
    const response = await api.get(url);
    const nodeData = response.data.data || [];
    
    const startNode = nodeData.find(node => node.node_type === 'start');
    
    if (!startNode || !startNode.inputs) {
      // ElMessage.warning('Start node data not found, the run might not have input parameters or execution hasn\'t started.');
      // return null; // Return null or empty object for caller to handle
      throw new Error('Start node data not found');
    }
    
    return startNode.inputs;
  } catch (error) {
    // ElMessage.error('Failed to get node execution data: ' + (error.message || 'Unknown error'));
    // console.error('Error in getNodeData:', error);
    throw error; // Rethrow to be caught by caller
  } finally {
    // loading.value = false;
  }
};

// Handle View Details - Debug Logs
const handleView = async (row) => {
  try {
    loading.value = true; // Specific loading for this action
    const inputs = await getNodeData(row.id);
    showInputsDialog(inputs, async () => { // Pass a callback for fill parameters
      await handleFillParameters(row);
    });
  } catch (error) {
    ElMessage.error('Failed to get node execution data: ' + (error.message || 'Unknown error'));
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// Handle View Details - API Logs
const handleViewApiLog = (row) => {
  // API log row.workflow_run contains main info
  showDetailsDialog('API Log Details', row.workflow_run || row, async () => { // Pass a callback
     await handleFillParametersApiLog(row);
  });
};

// Handle Fill Parameters - Debug Logs
const handleFillParameters = async (row) => { // row is a workflow_run object
  try {
    loading.value = true; // Specific loading for this action
    const inputs = await getNodeData(row.id);
    if (!inputs) {
        ElMessage.warning('No parameters found to fill.');
        return;
    }
    const userInputs = filterSystemParams(inputs);
    
    if (Object.keys(userInputs).length === 0) {
      ElMessage.warning('No user parameter data to fill.');
      return;
    }
    
    await fillParametersToPage(userInputs);
  } catch (error) {
    ElMessage.error('Failed to fill parameters: ' + (error.message || 'Unknown error'));
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// Handle Fill Parameters - API Logs
const handleFillParametersApiLog = async (apiLogRow) => {
  if (apiLogRow.workflow_run && apiLogRow.workflow_run.id) {
    try {
        apiLogLoading.value = true; // Use API log loading
        const inputs = await getNodeData(apiLogRow.workflow_run.id);
         if (!inputs) {
            ElMessage.warning('No parameters found to fill.');
            return;
        }
        const userInputs = filterSystemParams(inputs);

        if (Object.keys(userInputs).length === 0) {
            ElMessage.warning('No user parameter data to fill.');
            return;
        }
        await fillParametersToPage(userInputs);
    } catch (error) {
        ElMessage.error('Failed to fill parameters from API log: ' + (error.message || 'Unknown error'));
        console.error(error);
    } finally {
        apiLogLoading.value = false;
    }
  } else {
    ElMessage.error('Unable to get workflow_run details from API log to fill parameters');
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


// Function to copy text to clipboard
const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text)
    .then(() => {
      ElMessage.success({ message: 'Copied successfully', duration: 1500 });
    })
    .catch(() => {
      ElMessage.error({ message: 'Copy failed, please copy manually', duration: 1500 });
    });
};

// Show inputs dialog (Debug Logs specific, or can be made more generic)
const showInputsDialog = (inputs, fillCallback) => { // Added fillCallback
  const userInputs = filterSystemParams(inputs);

  let messageVNodeList = [];

  if (Object.keys(userInputs).length === 0) {
    messageVNodeList.push(h('div', { class: 'text-center py-4' }, 'No parameter data'));
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
          }, 'Copy')
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
          'Fill Parameters to Page'
      ]));
  }
  
  const messageVNode = h('div', { class: 'w-full' }, [ ...messageVNodeList, ...buttons ]);

  ElMessageBox.alert(messageVNode, 'Node Input Parameters', {
    showConfirmButton: !fillCallback, // Hide default confirm if we have custom actions
    confirmButtonText: 'Close',
    customClass: 'inputs-dialog',
    dangerouslyUseHTMLString: false,
  });
};

// Generic Details Dialog
const showDetailsDialog = (title, dataObject, fillCallback) => { // Added fillCallback
  let content;
  const userInputs = dataObject?.inputs ? filterSystemParams(dataObject.inputs) : (title === 'API Log Details' ? filterSystemParams(dataObject) : {});


  if (!dataObject || Object.keys(dataObject).length === 0) {
    content = [h('div', { class: 'text-center py-4' }, 'No details data')];
  } else {
    const prettyJson = JSON.stringify(dataObject, null, 2);
    content = [
      h('pre', { style: 'white-space: pre-wrap; word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 4px; max-height: 40vh; overflow-y: auto;' }, prettyJson),
      h('button', {
        class: 'mt-2 bg-blue-500 hover:bg-blue-600 text-white rounded py-1 px-2 text-xs',
        onClick: () => copyToClipboard(prettyJson)
      }, 'Copy JSON')
    ];
  }

  const buttons = [];
   // Add "Fill Parameters" button only if it's API Log Details and there's a callback and inputs
  if (title === 'API Log Details' && fillCallback && dataObject && Object.keys(userInputs).length > 0) {
     buttons.push(h('button', {
          class: 'mt-4 w-full bg-green-500 hover:bg-green-600 text-white rounded py-2 px-4 flex items-center justify-center',
          onClick: async () => {
              ElMessageBox.close();
              await fillCallback();
          }
      }, [ /* SVG and text for fill button */ 
          h('svg', { viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg', width: '16', height: '16', fill: 'currentColor', class: 'mr-2'}, [h('path', { d: 'M11 11V5H13V11H19V13H13V19H11V13H5V11H11Z' })]),
          'Fill Parameters to Page'
      ]));
  }

  const messageVNode = h('div', { class: 'w-full' }, [ ...content, ...buttons]);

  ElMessageBox.alert(messageVNode, title, {
    showConfirmButton: buttons.length === 0, // Only show confirm if no custom buttons
    confirmButtonText: 'Close',
    customClass: 'details-dialog inputs-dialog', // Use existing class for sizing
    dangerouslyUseHTMLString: false,
  });
};


// Function to add/fill parameters to the page
const fillParametersToPage = async (params) => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.id) {
      const clickRunResult = await new Promise((resolve) => {
        chrome.tabs.sendMessage(tab.id, { type: 'CLICK_RUN_BUTTON' }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('Error sending click run button message:', chrome.runtime.lastError);
            resolve({ success: false, message: chrome.runtime.lastError.message });
            return;
          }
          resolve(response || { success: true, message: 'Run button click message sent (no explicit response).' }); // Assume success if no error and no specific response format.
        });
      });
      
      if (!clickRunResult.success && clickRunResult.message !== '未收到响应' && clickRunResult.message !== 'Run button click message sent (no explicit response).') { // Tolerate "no response" as potentially OK
        ElMessage.error('Failed to click run button: ' + (clickRunResult.message || 'Unknown error'));
        return;
      }
      
      ElMessage.info({ message: 'Run button clicked, waiting for input fields to load...', duration: 1500 });
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      chrome.tabs.sendMessage(tab.id, { type: 'FILL_PARAMETERS', params: params }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error sending fill parameters message:', chrome.runtime.lastError);
          ElMessage.error('Failed to fill parameters: ' + chrome.runtime.lastError.message);
          return;
        }
        if (response && response.success) {
          ElMessage.success({ message: 'Parameter fill request sent, please check the page', duration: 3000 });
        } else {
          ElMessage.error('Failed to fill parameters: ' + (response?.message || 'Unknown error or no success response received'));
        }
      });
    } else {
      ElMessage.error('Unable to get current tab');
    }
  } catch (error) {
    console.error('Failed to fill parameters:', error);
    ElMessage.error('Failed to fill parameters: ' + (error.message || 'Unknown error'));
  }
};



// Initialization
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
      if (targetUrl.includes('/app/') && (targetUrl.includes('/workflow') || targetUrl.match(/\/app\/[a-f0-9-]+\/?(logs|workflow)?$/))) {
        difyUrl.value = targetUrl;
        const info = extractUrlInfo(targetUrl);
        urlInfo.value = info;
        
        if (info.appId) {
          await getConsoleToken();
          if(consoleToken.value){
             fetchDataForCurrentTab(activeTabName.value);
          } else {
            ElMessage.warning('Failed to get authentication token. Please ensure Dify console is logged in or refresh the extension. Data may not load.');
          }
        } else {
            ElMessage.info('Please enter the full Dify workflow URL to load data.');
        }
      } else {
        ElMessage.warning('The current page does not appear to be a valid Dify app or workflow page.');
      }
    }
  } catch (error) {
    console.error('Initialization error:', error);
    ElMessage.error('Initialization failed: ' + (error.message || 'Unknown error'));
  }
});

// 计算当前页的草稿数据
const currentPageDrafts = computed(() => {
  const start = (draftCurrentPage.value - 1) * draftPageSize.value;
  const end = start + draftPageSize.value;
  return cachedDrafts.value.slice(start, end);
});

// 处理草稿分页变化
const handleDraftCurrentChange = (val) => {
  draftCurrentPage.value = val;
};

// 处理草稿每页条数变化
const handleDraftSizeChange = (val) => {
  draftPageSize.value = val;
  draftCurrentPage.value = 1;
};

// 处理回滚操作
const handleRollback = async (row) => {
  try {
    if (!urlInfo.value.domain || !urlInfo.value.appId) {
      ElMessage.warning('请先输入有效的 Dify 工作流 URL');
      return;
    }
    
    // 获取最新的hash值
    const newestHash = await getNewestHash(urlInfo.value.appId);
    console.log('当前最新hash:', newestHash);
    console.log('回滚到hash:', row.data.hash);
    
    const selectedData = {
      environment_variables: row.data.environment_variables,
      conversation_variables: row.data.conversation_variables,
      graph: row.data.graph,
      features: row.data.features,
      hash: newestHash
    };
    await saveDraft(urlInfo.value.domain, urlInfo.value.appId, selectedData);
    ElMessage.success('回滚成功');
    
    // 刷新当前标签页
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.id) {
      await chrome.tabs.reload(tab.id);
    }
  } catch (error) {
    console.error('回滚失败:', error);
    ElMessage.error('回滚失败: ' + (error.message || '未知错误'));
  }
};
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

<!-- Global styles, used to affect Element Plus popup components -->
<style>
/* MessageBox Styles */
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
