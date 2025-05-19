<template>
  <div class="  min-h-screen  bg-gradient-to-b from-blue-50 to-indigo-100">
    <!-- Header -->
    <div class=" mx-auto px-4 py-8">
      <div class="flex justify-center items-center gap-2 mb-2">
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
        <h1 class=" text-2xl lg:text-4xl font-bold text-center text-nowrap text-black">Blur your image background</h1>
      </div>
      <p class="text-center text-gray-600 mb-8">The best free tool to blur your photo background in just 2 seconds.</p>
      <!-- Main Content - 两个并排的卡片 -->
      <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- 左侧 - 预览效果卡片 -->
        <div class="bg-white rounded-xl shadow-lg overflow-hidden min-h-[400px] h-full relative">
          <div class="flex items-center justify-center relative w-full h-full min-h-[400px]">
            <!-- 加载中状态 -->
            <div v-if="isProcessing || isLoading" class="w-full h-full flex items-center justify-center bg-gray-100 z-20">
              <div class="flex flex-col h-full items-center w-full justify-center">
                <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
                <p class="mt-4 text-indigo-600">
                  {{ isProcessing ? 'Processing image...' : 'Loading result...' }}
                </p>
              </div>
            </div>

            <!-- 处理结果显示 -->
            <div v-else-if="showResult && resultImage && userUploadImage" class="relative">
              <!-- 用户上传的原图作为底部，并应用模糊 -->
              <div class="w-full h-full relative overflow-hidden">
                <div class="w-full h-full min-h-full absolute blurred-background" :style="{ backgroundImage: `url(${userUploadImage})`, filter: `blur(${blurIntensity}px)` }"></div>
                <img :src="resultImage" class="w-full h-full absolute z-10 foreground-image" alt="处理后的图片" />
                <img :src="resultImage" class="w-full h-full z-10 foreground-image" alt="处理后的图片" />
              </div>
            </div>


            <!-- 默认展示图 -->
            <div v-else class="absolute inset-0">
              <img src="https://storyblok-cdn.photoroom.com/f/191576/786x590/c7ba911657/blur_background_1.webp" class="w-full h-full object-cover default-image" alt="Before and after blur effect" />
              <!-- Before 标签 -->
              <div class="absolute bottom-4 left-4 bg-gray-900 text-white px-3 py-1 text-sm font-medium rounded-md z-20">Before</div>
            </div>
          </div>
        </div>

        <!-- 右侧 - 上传区域卡片 -->
        <div class="bg-white rounded-xl shadow-lg overflow-hidden">
          <!-- 显示处理结果时的控制面板 -->
          <div v-if="showResult" class="p-6">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">Blur Effect Settings</h2>

            <!-- 模糊强度滑块 -->
            <div class="mb-4">
              <label class="block text-gray-700 text-sm font-medium mb-2">Blur Intensity</label>
              <input type="range" min="0" max="20" v-model="blurIntensity" class="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer" />
              <div class="flex justify-between text-xs text-gray-500 mt-1">
                <span>None</span>
                <span>Max</span>
              </div>
            </div>

            <!-- 按钮组 -->
            <div class="flex space-x-3 mt-6">
              <button @click="downloadImage" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none">Download Image</button>
            </div>

            <!-- 重新上传 -->
            <div class="mt-6">
              <label class="flex items-center justify-center w-full h-12 border-2 border-dashed border-indigo-300 hover:border-indigo-500 hover:bg-gray-100 rounded-lg cursor-pointer transition-all">
                <span class="text-sm text-gray-600">Upload Another Image</span>
                <input type="file" class="hidden" accept="image/*" @change="handleFileUpload" />
              </label>
            </div>
          </div>

          <!-- 初始上传界面 -->
          <div v-else class="p-4 h-full flex flex-col items-center justify-center">
            <div class="w-full h-full flex flex-col items-center justify-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-8">
              <!-- 上传按钮 -->
              <div class="mb-4 text-center">
                <label class="cursor-pointer">
                  <div class="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-lg flex items-center justify-center space-x-2">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Select a picture</span>
                  </div>
                  <input type="file" class="hidden" accept="image/*" @change="handleFileUpload" />
                </label>
              </div>
              <p class="text-gray-500 text-center">Select a picture</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部示例图片 -->
      <div class="max-w-6xl mx-auto mt-6">
        <p class="text-gray-600 text-center mb-4">No picture on hand? Try with one of these</p>
        <div class="flex justify-center gap-2">
          <img v-for="(demo, index) in demoImages" :key="index" :src="demo" @click="handleDemoClick(demo)" class="h-14 w-14 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity" alt="Demo image" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { ElMessage, ElLoading } from 'element-plus';

import uploadToR2 from '../../lib/uplodaToR2.js';

// 状态变量
const userUploadImage = ref('');
const resultImage = ref('');
const isProcessing = ref(false);
const isLoading = ref(false);
const showResult = ref(false);
const blurIntensity = ref(10);
const demoImages = ref([
  'https://video.deletetweets.ai/imgkits/commen/sample1.png',
  'https://video.deletetweets.ai/imgkits/commen/sample2.png',
  'https://video.deletetweets.ai/imgkits/commen/sample3.png',
]);


async function removeBackground(url) {
  try {
    const response = await fetch(`https://usa.imgkits.com/api/ai/segment?pic=${url}`);
    if (!response.ok) {
      throw new Error('网络请求失败');
    }
    return await response.json();
  } catch (error) {
    console.error('移除背景失败:', error);
    throw error;
  }
}



// 处理文件上传
const handleFileUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // 检查文件大小
  if (file.size > 10 * 1024 * 1024) {
    ElMessage.error('File size exceeds 10MB limit');
    return;
  }

  const loading = ElLoading.service({
    lock: true,
    text: 'Uploading...',
    background: 'rgba(0, 0, 0, 0.7)',
  });

  try {
    // 创建临时URL用于预览
    userUploadImage.value = URL.createObjectURL(file);
    let r2_data = await uploadToR2(file, file.name,'blur_back_chrome','temp_');
    let { url } = r2_data;
    userUploadImage.value = url;

    showResult.value = false;
    resultImage.value = '';
    loading.close();
    // 自动开始处理
    processImage();
  } catch (error) {
    loading.close();
    ElMessage.error('Upload failed');
  }
};

// 处理图片
const processImage = async () => {
  if (!userUploadImage.value) return;

  // 重置状态
  showResult.value = false;
  isProcessing.value = true;

  try {
    let res = await removeBackground(userUploadImage.value);
    console.log(res, 'res');

    if (res.success) {
      // 获取处理后的图片URL
      const processedImageUrl = res.data.urls[0].url;

      // 开始加载图片
      isLoading.value = true;
      isProcessing.value = false;

      // 预加载图片
      await preloadImage(processedImageUrl);

      // 图片加载完成，更新状态
      resultImage.value = processedImageUrl;
      isLoading.value = false;
      showResult.value = true;

      ElMessage.success('Blur effect applied successfully');
    } else {
      ElMessage.error('Failed to apply blur effect');
      isProcessing.value = false;
    }
  } catch (error) {
    console.log(error, 'error');
    ElMessage.error('An error occurred');
    isProcessing.value = false;
  }
};

// 预加载图片函数
const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

// 处理演示图片点击
const handleDemoClick = (demoUrl) => {
  if (isProcessing.value || isLoading.value) return;

  userUploadImage.value = demoUrl;
  resultImage.value = '';
  showResult.value = false;
  // 自动开始处理
  processImage();
};

// 下载处理后的图片
const downloadImage = async () => {
  if (!showResult.value || !resultImage.value || !userUploadImage.value) return;

  try {
    // 显示加载提示
    const loading = ElLoading.service({
      lock: true,
      text: 'Generating image...',
      background: 'rgba(0, 0, 0, 0.7)',
    });

    // 创建一个Canvas来合成最终图像
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // 加载原始图片和处理后的图片
    const [originalImg, processedImg] = await Promise.all([loadImage(userUploadImage.value), loadImage(resultImage.value)]);

    // 设置Canvas尺寸为原始图片尺寸
    canvas.width = originalImg.width;
    canvas.height = originalImg.height;

    // 绘制模糊背景 - 使用与UI中相同的模糊值
    ctx.filter = `blur(${blurIntensity.value}px)`;
    ctx.drawImage(originalImg, 0, 0, canvas.width, canvas.height);

    // 重置滤镜
    ctx.filter = 'none';

    // 计算保持纵横比的尺寸，确保前景图像居中
    const scale = Math.min(canvas.width / processedImg.width, canvas.height / processedImg.height);

    const scaledWidth = processedImg.width * scale;
    const scaledHeight = processedImg.height * scale;
    const x = (canvas.width - scaledWidth) / 2;
    const y = (canvas.height - scaledHeight) / 2;

    // 绘制前景图像（移除背景后的PNG）
    ctx.drawImage(processedImg, x, y, scaledWidth, scaledHeight);

    // 转换为Blob并下载
    canvas.toBlob(
      (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'blur-background-image.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        loading.close();
        ElMessage.success('Image downloaded successfully');
      },
      'image/png',
      0.95
    ); // 设置较高的图片质量
  } catch (error) {
    console.error(error);
    ElMessage.error('Failed to download image');
  }
};

// 辅助函数：加载图片
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // 处理跨域问题
    img.onload = () => resolve(img);
    img.onerror = (e) => {
      console.error('Image load error:', e);
      reject(new Error('Failed to load image'));
    };
    img.src = src;
  });
}
</script>

<style scoped>
/* 基础样式 */
img {
  max-width: 100%;
  height: auto; /* 确保图片高度自适应 */
}

/* 圆角样式 */
.rounded-xl {
  border-radius: 0.75rem;
}

/* 阴影效果 */
.shadow-lg {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* 预览容器样式 */
.preview-container {
  overflow: hidden; /* 隐藏超出容器的部分 */
  /* border-radius: 0.75rem; /* 如果希望容器本身也有圆角 */
}

/* 模糊背景层样式 */
.blurred-background {
  width: 100%;
  height: 100%;
  background-size: cover; /* 确保背景图覆盖整个div */
  background-position: center; /* 背景图居中显示 */
  transition: filter 0.3s ease; /* 平滑过渡模糊效果 */
  /* transform: scale(1.05); /* 可选：稍微放大背景以避免边缘模糊不均 */
}

/* 前景图片（移除背景后）样式 */
.foreground-image {
  /* object-fit: contain; 已经通过class添加 */
  /* width: 100%;  已经通过class添加 */
  /* height: 100%; 已经通过class添加 */
  /* position: absolute; 已经通过class添加 */
  /* top: 0; 已经通过class添加 */
  /* left: 0; 已经通过class添加 */
  /* z-index: 10; 已经通过class添加 */
}

/* 默认图片和未处理图片样式 */
.default-image,
.uploaded-image {
  /* .uploaded-image 是假设你给未处理图片加的类，如果没有，可以忽略或改为img标签选择器 */
  width: 100%;
  height: 100%;
  object-fit: cover; /* 默认和未处理图片也撑满容器 */
}
</style>
