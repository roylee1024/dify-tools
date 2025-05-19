import axios from 'axios';

async function getPresignedUrl(fileName, bucketName) {
  var myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/json');
  myHeaders.append('Channel', 'node-nauth')

  var raw = JSON.stringify({
    bucketName: bucketName,
    objectName: fileName,
  });

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow',
  };

  return new Promise((resolve, reject) => {
    fetch('https://ai.imgkits.com/api/generate-presigned-url', requestOptions)
      .then((response) => response.json())
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        resolve(error);
      });
  });
}

function randomString(len) {
  len = len || 32;
  var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
  var maxPos = $chars.length;
  var pwd = '';
  for (let i = 0; i < len; i++) {
    pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return pwd;
}

function getFileType(data, fileName) {
  let extend = null;
  const name = fileName || data.name;
  if (name) {
    const fileNameIndex = name.lastIndexOf('.');
    if (fileNameIndex != -1) extend = name.substring(fileNameIndex + 1);
  }
  if (!extend) {
    const fileTypeIndex = data.type.lastIndexOf('/');
    extend = data.type.substring(fileTypeIndex + 1);
  }
  return (extend && extend.toLowerCase()) || '';
}

async function MultiPartUpload(file, up_key, bucketName, onUploadProgress) {
  const custom_domain = 'https://video.deletetweets.ai';
  const objectName = up_key;
  const partSize = 5 * 1024 * 1024; // 5MB
  const partCount = Math.ceil(file.size / partSize);
  try {
    // 第一步：初始化分片上传
    const initiateResponse = await fetch('https://ai.imgkits.com/upload/initiate-upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Channel':'node-nauth'

      },
      body: JSON.stringify({
        bucketName,
        objectName,
        contentType: file.type, // 使用文件的MIME类型
      }),
    });
    const initiateData = await initiateResponse.json();
    const uploadId = initiateData.UploadId;

    const parts = [];

    // 第二步：上传每个分片
    for (let partNumber = 1; partNumber <= partCount; partNumber++) {
      const start = (partNumber - 1) * partSize;
      const end = Math.min(partNumber * partSize, file.size);
      const blob = file.slice(start, end);

      const getUrlResponse = await fetch('https://ai.imgkits.com/upload/get-upload-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Channel':'node-nauth'
        },
        body: JSON.stringify({
          uploadId,
          partNumber,
          objectName,
          bucketName,
        }),
      });
      const getUrlData = await getUrlResponse.json();
      const uploadUrl = getUrlData.url;

      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: blob,
        headers: {
          'Content-Type': file.type, // 使用文件的MIME类型
        },
      });

      if (uploadResponse.status !== 200) {
        throw new Error(`Upload part ${partNumber} failed`);
      }

      // 打印所有响应头
      console.log(uploadResponse.headers);

      // 获取 ETag
      const etag = uploadResponse.headers.get('etag');
      if (!etag) {
        throw new Error(`Cannot get ETag for part ${partNumber}`);
      }

      parts.push({
        ETag: etag, // 确保 ETag 没有引号
        PartNumber: partNumber,
      });
      console.log(onUploadProgress, 'onUploadProgress');
      if (onUploadProgress) {
        // 模拟 progressEvent
        onUploadProgress({
          loaded: parts.length,
          total: partCount,
        });
      }
    }

    // 第三步：完成分片上传
    const completeResponse = await fetch('https://ai.imgkits.com/upload/complete-upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Channel':'node-nauth'
      },
      body: JSON.stringify({
        uploadId,
        parts,
        objectName,
        bucketName,
      }),
    });
    const completeData = await completeResponse.json();
    console.log('Upload complete:', completeData);
    return { success: true, msg: '', url: custom_domain + '/' + up_key };
  } catch (error) {
    console.error('Error during upload:', error);
    return { success: false, msg: error.message, url: '' };
  }
}

async function putObject(file, fileName, app_name = 'translate', prefix = 'temp_', bucketName = 'video', onUploadProgress) {
  let fileType = '';
  try {
    let custom_domain = 'https://video.deletetweets.ai';
    // 获取当前日期
    const formattedDate = new Date().toLocaleDateString();
    const separator = /[/.-]/.exec(formattedDate)[0]; // 检测分隔符
    const date = formattedDate.replace(new RegExp(separator, 'g'), '-'); // 替换
    fileType = getFileType(file, fileName);
    // 生成一个随机数
    let up_key = `${prefix}${date}_${app_name}_${randomString(32)}.${fileType}`;

    if (file.size / 1024 / 1024 >= 100) {
      let uploadResponse = await MultiPartUpload(file, up_key, bucketName, onUploadProgress);
      return uploadResponse;
    } else {
      let presignedUrlRes = await getPresignedUrl(up_key, bucketName);
      if (presignedUrlRes.success) {
        let presignedUrl = presignedUrlRes.url;
        console.log(presignedUrl, 'presignedUrl');
        let result = await axios(presignedUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': file.type, // 使用文件的MIME类型
          },
          data: file,
          onUploadProgress,
        });
        console.log(result, '上传成功结果');
        let uploaded_url = custom_domain + '/' + up_key;
        console.log(uploaded_url, 'uploaded_url上传成功的url');
        return { url: uploaded_url, key: up_key };
      } else {
        return Promise.reject(presignedUrlRes.message || 'upload failed');
      }
    }
  } catch (error) {
    return Promise.reject(error.message || 'upload failed');
  }
}

export default putObject;
