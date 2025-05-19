import { ElMessageBox, ElLoading } from 'element-plus';

// 获取文件类型
function getFileType(data, fileName) {
  let fileType = null;
  const name = fileName || data.name;
  if (name) {
    const fileNameIndex = name.lastIndexOf('.');
    if (fileNameIndex != -1) fileType = name.substring(fileNameIndex + 1);
  }
  if (!fileType) {
    const type = data.type.split(';')[0];
    const fileTypeIndex = type.lastIndexOf('/');
    fileType = type.substring(fileTypeIndex + 1);
  }
  return (fileType && fileType.toLowerCase()) || '';
}

function sleep(time = 500) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

// 合并 字幕
function mergeTextSegmentsNew(subtitles) {
  console.log(subtitles, '字幕');
  // 删除  text==[Music] 的字幕
  subtitles = subtitles.filter((item) => item.text.indexOf('[Music]') == -1);
  // 删除 text=='\n' 的字幕
  subtitles = subtitles.filter((item) => item.text != '\n');

  let fixedSegments = [];

  for (let index = 0; index < subtitles.length; index++) {
    const afterFixingSubtitle = {
      duration: '',
      start: '',
      text: '',
    };
    const currentSubtitle = subtitles[index];
    const currentSubtitleStart = currentSubtitle.start;
    const currentSubtitleEnd = currentSubtitle.start + currentSubtitle.duration;
    const currentSubtitleText = currentSubtitle.text;
    const nextSubtitle = subtitles.length === index ? subtitles[length] : subtitles[index + 1];
    const nextSubtitleStart = nextSubtitle?.start;
    const nextSubtitleEnd = nextSubtitle?.start + nextSubtitle?.duration;
    const nextSubtitleText = nextSubtitle?.text;

    if (currentSubtitleEnd > nextSubtitleStart && nextSubtitle) {
      afterFixingSubtitle.duration = nextSubtitleEnd - currentSubtitleStart;
      afterFixingSubtitle.start = currentSubtitleStart;
      afterFixingSubtitle.text = currentSubtitleText + nextSubtitleText;
      subtitles.splice(index, 1);
      fixedSegments.push(afterFixingSubtitle);
    } else {
      fixedSegments.push(currentSubtitle);
    }
  }
  return fixedSegments;
}

function createClickDom(callBack, color = 'white', className = 'translate_video_yichong') {
  let ytb_action = document.createElement('div');
  ytb_action.id = 'ytb_yichong';
  ytb_action.className = className;

  let src = chrome.runtime.getURL('/src/assets/128.png');
  let img = document.createElement('img');
  img.src = src;
  img.style.opacity = '0.7';
  ytb_action.appendChild(img);

  let div = document.createElement('div');
  div.style.color = color;
  div.className = 'translate_video_yichong_title';
  div.textContent = 'Translate Video';
  ytb_action.appendChild(div);
  ytb_action.addEventListener('click', callBack);
  return ytb_action;
}

function renderDialog(type) {
  if (type === 'login') {
    ElMessageBox.confirm('Please log in to your account to use the video translator').then((res) => {
      console.log('去登录 通知bg');
      chrome.runtime.sendMessage({ type: 'login' });
    });
  } else {
    ElMessageBox.confirm('You have no more free uses, please upgrade to a premium plan before proceeding.').then((res) => {
      chrome.runtime.sendMessage({ type: 'subscribed' });
    });
  }
}

function showTranslatedSubtitle(text) {
  console.log(text, 'text字幕');
  // 获取包含 Shadow DOM 的元素
  // 查找具有特定类名的元素
  // const cueElement = document.querySelector('.ytp-caption-segment');
  const cueElements = document.querySelectorAll('.ytp-caption-segment');
  const cueElement = cueElements[cueElements.length - 1];

  if (cueElement) {
    // 检查是否已经存在具有特定 id 的 target-cue 元素
    let targetCueElement = cueElement.parentElement.querySelector('#target-cue-id');

    if (targetCueElement) {
      // 如果存在，则修改其文本内容
      targetCueElement.textContent = text; // 这里替换为你实际的新文本内容
      console.log('Updated text of existing target-cue element.');
    } else {
      // 如果不存在，则创建新的 target-cue 元素
      targetCueElement = document.createElement('span');
      targetCueElement.id = 'target-cue-id';
      targetCueElement.className = 'ytp-caption-segment';
      targetCueElement.textContent = text; // 这里替换为你实际的文本内容

      // 应用样式
      targetCueElement.style.display = 'inline-block';
      targetCueElement.style.whiteSpace = 'pre-wrap';
      targetCueElement.style.background = 'rgba(8, 8, 8, 0.75)';
      targetCueElement.style.fontSize = '22.6667px';
      targetCueElement.style.color = 'rgb(255, 255, 255)';
      targetCueElement.style.fill = 'rgb(255, 255, 255)';
      targetCueElement.style.fontFamily = `"YouTube Noto", Roboto, "Arial Unicode Ms", Arial, Helvetica, Verdana, "PT Sans Caption", sans-serif`;

      // 在 cueElement 后面插入新的 target-cue 元素
      cueElement.insertAdjacentElement('afterend', targetCueElement);
    }
  } else {
  }
}




function createSlide(subtitle) {
  const secondary = document.querySelector('#secondary');
  console.log(secondary, '??secondary');
  // 如果subtitle_yicohng_list 已经存在
  if (secondary.querySelector('#subtitle_yicohng_list')) {
    secondary.querySelector('#subtitle_yicohng_list').remove();
  }

  // 创建一个包含字幕的卡片
  const createHtml = document.createElement('div');
  createHtml.id = 'subtitle_yicohng_list';
  createHtml.style.border = '1px solid white';
  createHtml.style.padding = '10px';
  createHtml.style.margin = '10px';
  createHtml.style.height = '400px'; // 固定高度
  createHtml.style.overflow = 'hidden'; // 隐藏超出部分
  createHtml.style.backgroundColor = 'gray'; // 白色透明背景
  createHtml.style.borderRadius = '10px'; // 圆润边框
  createHtml.style.position = 'relative'; // 为了定位关闭按钮

  // 创建卡片标题
  const cardTitle = document.createElement('h3');
  cardTitle.textContent = 'Video Translator(Subtitles list)';
  cardTitle.style.color = 'white'; // 白色字体
  cardTitle.style.fontSize = '20px'; // 大字体
  cardTitle.style.position = 'sticky'; // 标题固定
  cardTitle.style.top = '0';
  cardTitle.style.padding = '10px'; // 内边距
  cardTitle.style.zIndex = '1'; // 确保标题在最上层
  createHtml.appendChild(cardTitle);

  // 创建关闭按钮
  const closeButton = document.createElement('span');
  closeButton.textContent = '❌';
  closeButton.style.position = 'absolute';
  closeButton.style.top = '10px';
  closeButton.style.right = '10px';
  closeButton.style.color = 'red';
  closeButton.style.fontSize = '20px';
  closeButton.style.cursor = 'pointer';
  closeButton.style.zIndex = 999;
  closeButton.onclick = () => {
    createHtml.remove();
  };
  createHtml.appendChild(closeButton);

  // 创建字幕容器
  const subtitleContainer = document.createElement('div');
  subtitleContainer.style.overflowY = 'auto'; // 垂直滚动
  subtitleContainer.style.height = 'calc(100% - 40px)'; // 减去标题和内边距的高度
  createHtml.appendChild(subtitleContainer);

  // 创建字幕列表
  const subtitleList = document.createElement('ul');
  subtitle.forEach((item, index) => {
    const listItem = document.createElement('li');
    listItem.dataset.index = index; // 设置索引为data属性
    const startTime = parseFloat(item.start);
    const endTime = startTime + parseFloat(item.duration);
    listItem.textContent = `${formatTime(startTime)} - ${formatTime(endTime)}: ${item.text}`;
    listItem.style.color = 'white'; // 白色字体
    listItem.style.fontSize = '16px'; // 大字体
    listItem.style.padding = '5px'; // 增加内边距
    listItem.style.marginBottom = '10px'; // 增加字幕之间的间距
    listItem.style.transition = 'all 0.3s'; // 添加过渡效果
    subtitleList.appendChild(listItem);
  });
  subtitleContainer.appendChild(subtitleList);

  // 将卡片插入到 #secondary 元素的第一个子元素之前
  secondary.insertBefore(createHtml, secondary.firstChild);
}

function highlightSubtitle(index) {
  // 移除所有高亮
  const allSubtitles = document.querySelectorAll('li[data-index]');
  allSubtitles.forEach((subtitle) => {
    subtitle.style.color = 'white'; // 恢复字体颜色
  });

  // 高亮显示指定索引的字幕
  const subtitleToHighlight = document.querySelector(`li[data-index="${index}"]`);
  if (subtitleToHighlight) {
    subtitleToHighlight.style.color = 'yellow'; // 高亮字体颜色

    // 获取容器元素
    const container = subtitleToHighlight.closest('#subtitle_yicohng_list > div');
    if (container) {
      // 获取容器和字幕的边界矩形
      const containerRect = container.getBoundingClientRect();
      const subtitleRect = subtitleToHighlight.getBoundingClientRect();

      // 检查字幕是否在容器的可视区域内
      if (subtitleRect.top < containerRect.top || subtitleRect.bottom > containerRect.bottom) {
        // 计算字幕相对于容器顶部的偏移量
        const offsetTop = subtitleToHighlight.offsetTop;
        const containerScrollTop = container.scrollTop;
        const containerHeight = container.clientHeight;
        const subtitleHeight = subtitleToHighlight.clientHeight;

        // 计算要滚动的距离，使字幕居中显示
        const scrollPosition = offsetTop - containerHeight / 2 + subtitleHeight / 2;

        // 滚动容器
        container.scrollTo({
          top: scrollPosition,
          behavior: 'smooth',
        });
      }
    }
  }
}


// 格式化时间为 00:01 - 01:24 这种格式
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export { getFileType, showTranslatedSubtitle, sleep, mergeTextSegmentsNew, createClickDom, renderDialog, createSlide, highlightSubtitle };
