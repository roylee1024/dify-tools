# Dify Tools - 您的 Dify 工作流效率助手

[![](https://img.shields.io/badge/Chrome%20Web%20Store-%v1.0.0-blue)](https://chrome.google.com/webstore/detail/YOUR_EXTENSION_ID) <!-- 请替换 YOUR_EXTENSION_ID -->
[![](https://img.shields.io/badge/License-MIT-green)](LICENSE) <!-- 假设是 MIT 协议 -->
[English Version](README.en.md)

Dify Tools 是一款 Chrome 扩展，旨在帮助用户更高效地调试 Dify 工作流。它解决了在 Dify 调试页面无法直接重新执行历史运行记录的痛点，提供"一键重新运行"功能以简化测试迭代。插件还集成了一个实用的小工具，用于快速模糊图片背景。

## 主要功能

### 🚀 Dify 工作流助手

本插件的核心功能是作为 Dify 工作流的强大辅助工具，让您的开发和调试体验更加流畅。

#### 1. 工作流运行历史查看器
- **便捷访问**: 点击浏览器工具栏的 Dify Tools 图标，即可在一个新的浏览器标签页中打开插件界面。
- **智能识别**: 插件会尝试自动检测您当前浏览器活动标签页中的 Dify 工作流 URL，并预填到插件界面的输入框中。您也可以手动输入或修改目标工作流的 URL。
- **集中展示**: 清晰展示指定 Dify 工作流的"调试记录 (Debug Logs)"和"API 调用记录 (API Logs)"，包含运行时间、状态、执行人等关键信息。
- **详情追溯**: 可以方便地查看每一条运行记录的详细输入输出（具体展示方式取决于 Dify API 返回）。

#### 2. 一键重新运行 (核心特色) ✨
这是 Dify Tools 最能提升效率的功能！当您需要用之前的某次参数配置重新运行工作流时，无需再手动复制粘贴各项参数。

**操作步骤:**
1.  在插件界面的运行历史列表中，找到您想要重新运行的那条记录。
2.  点击该记录对应的"重新运行"按钮。
3.  插件会自动将该次运行的所有输入参数，填充到您当前浏览器中打开的、与插件内 URL 匹配的 Dify 工作流页面的对应参数输入框中。
4.  随后，插件还会自动点击该 Dify 页面上的"运行"按钮。

**效果**: 瞬间完成参数配置和启动运行，让您专注于工作流逻辑的优化，大幅减少重复劳动。

<!-- 建议此处嵌入一个 GIF 动画，演示上述"一键重新运行"的操作流程 -->
<!-- ![Dify Tools Re-run Demo GIF](path/to/your/demo.gif) -->

#### 3. 认证提示
- **重要**: 为了能成功从 Dify API 获取工作流的运行数据，请确保您已在浏览器中登录了对应的 Dify 控制台。插件需要通过您登录后 Dify 页面存储的 `console_token` 进行 API 认证。

### 🖼️ 图片背景模糊工具
- **快速处理**: 在任何网页上右键点击一张图片，选择上下文菜单中的"Blur background"选项。
- **跳转服务**: 插件会将该图片的 URL 发送到 [imgkits.com](https://www.imgkits.com/)，并在新标签页中打开其提供的背景模糊处理服务页面。

## 安装


### 方式一：从源码构建 (开发者)
1.  克隆本仓库到本地: `git clone https://github.com/your-repo/dify-tools.git` <!-- 请用户替换 your-repo/dify-tools -->
2.  进入项目目录: `cd dify-tools`
3.  安装依赖: `pnpm install`
4.  构建插件: `pnpm build`
5.  打开 Chrome/Edge 浏览器，进入扩展管理页面 (`chrome://extensions` 或 `edge://extensions`)。
6.  启用"开发者模式"。
7.  点击"加载已解压的扩展程序"，选择项目根目录下的 `dist` 文件夹。

## 工作原理简介
Dify Tools 通过以下几个主要部分协同工作：
- **插件界面 (Popup UI)**: 使用 Vue 3、Element Plus 和 Tailwind CSS 构建，运行在一个独立的浏览器标签页中。用户在此界面输入 Dify工作流 URL、查看日志、触发重新运行等操作。
- **后台脚本 (Background Script)**: 负责处理插件图标的点击事件（打开插件界面并传递 URL）、创建和管理右键上下文菜单（图片模糊功能）。
- **内容脚本 (Content Script)**: 被注入到用户访问的 Dify 工作流页面中。它负责：
    - 从 Dify 页面的 `localStorage` 读取 `console_token` 以便 API 调用。
    - 接收来自插件界面的指令，将参数填入 Dify 页面的输入框。
    - 模拟点击 Dify 页面上的"运行"按钮。

这种设计使得插件能够在不直接修改 Dify 核心代码的情况下，提供便捷的辅助功能。

## 技术栈
- [Vue 3](https://vuejs.org/) (Composition API)
- [Element Plus](https://element-plus.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)
- [Axios](https://axios-http.com/)
- [@crxjs/vite-plugin](https://crxjs.dev/vite-plugin)

## 问题反馈与贡献
如果您在使用过程中遇到任何问题，或有功能建议，欢迎通过 [GitHub Issues](https://github.com/your-repo/dify-tools/issues)进行反馈。 <!-- 请用户替换 your-repo/dify-tools -->

我们也欢迎任何形式的贡献！如果您有兴趣改进 Dify Tools，请查阅贡献指南（如果未来创建 `CONTRIBUTING.md`）。

---
感谢使用 Dify Tools！希望能为您的 Dify 开发之旅带来便利。
