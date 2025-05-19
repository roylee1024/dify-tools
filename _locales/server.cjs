const fs = require('fs');
const path = require('path');

// 提取 当前目录下所有的目录里面的 messages.json 文件里面的 langDes 字段

const data = {}

// 以目录名作为key，langDes作为value，写入到data.json文件中
const extractLangDes = (dir) => {
    const messagesPath = path.join(dir, 'messages.json');
    if (fs.existsSync(messagesPath)) {
        const messages = JSON.parse(fs.readFileSync(messagesPath, 'utf-8'));
        if (messages.langDes) {
            data[dir] = messages.langDes.message; // 以目录名作为key，langDes作为value
            
            // 删除 langDes 字段
            delete messages.langDes; 
            fs.writeFileSync(messagesPath, JSON.stringify(messages, null, 2), 'utf-8'); // 更新文件
        }
    }
}

// 获取当前目录下的所有子目录
const directories = fs.readdirSync(__dirname).filter(file => {
    return fs.statSync(path.join(__dirname, file)).isDirectory();
});

// 遍历每个子目录，提取langDes
directories.forEach(dir => {
    extractLangDes(path.join(__dirname, dir));
});

// 将结果写入data.json文件
fs.writeFileSync(path.join(__dirname, 'data.json'), JSON.stringify(data, null, 2), 'utf-8');


