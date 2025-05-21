# Context
Filename: TASK-README-Rewrite.md
Created On: {{datetime}}
Created By: AI
Associated Protocol: RIPER-5 + Multidimensional + Agent Protocol

# Task Description
Rewrite the README.md file to introduce the functionality of the Dify Tools Chrome Extension.

# Project Overview
This is a Chrome extension built with Vue 3 that provides tools related to Dify functionality. The extension uses a modern frontend tech stack including Vue 3 (Composition API), Element Plus, and Tailwind CSS. (Based on provided project-overview)

---
*The following sections are maintained by the AI during protocol execution*
---

# Analysis (Populated by RESEARCH mode)
- **Plugin Name**: dify-tools
- **Manifest Version**: 3
- **Core Functionality (Dify Workflow Helper)**:
    - Provides a UI (opened in a new tab via plugin icon) to manage and view Dify workflow run history.
    - Automatically detects if the current browser tab is a Dify workflow page and pre-fills its URL in the plugin UI.
    - Allows manual input of a Dify workflow URL.
    - Fetches and displays "Debug Logs" and "API Logs" for the specified Dify workflow from Dify's APIs. Information includes timestamp, status, executor.
    - Allows viewing details of individual log entries.
    - **Key Feature**: Enables "re-running" a workflow based on a past execution. It achieves this by:
        1.  Sending the parameters from the selected historical run to the `content.js` script.
        2.  The `content.js` script, injected into the active Dify workflow page, then automatically fills these parameters into the corresponding input fields of the workflow.
        3.  The `content.js` script also programmatically clicks the "Run" button on the Dify page.
    - Authentication for Dify API calls relies on a `console_token` retrieved by `content.js` from the Dify page's `localStorage`.
- **Secondary Functionality (Image Background Blur)**:
    - Adds a context menu item "Blur background" when right-clicking on an image on any webpage.
    - Clicking this option sends the image URL to `imgkits.com` for background blur processing and opens the result in a new tab.
- **Key Files Involved**:
    - `manifest.json`: Defines permissions (`contextMenus`, `activeTab`, `tabs`, `storage`, `<all_urls>`), background script, content script, and popup action.
    - `src/pages/popup/index.vue`: The main UI for the Dify workflow helper. Handles URL input, displays logs (debug and API), and initiates the "re-run" process.
    - `src/background.js`:
        - Handles plugin icon clicks, opening the popup UI (in a new tab) and passing the current Dify workflow URL if applicable.
        - Creates and handles the "Blur background" context menu.
    - `src/content/content.js`: Injected into web pages.
        - Listens for messages from `popup/index.vue`.
        - Retrieves `console_token` from `localStorage`.
        - Fills parameters into Dify workflow input fields.
        - Clicks the "Run" button on Dify workflow pages.
    - `src/lib/api.js` (inferred from `popup/index.vue` imports): Contains functions for interacting with Dify APIs (`extractUrlInfo`, `getWorkflowRuns`, `getWorkflowAppLogs`, `api` instance for axios).
- **Permissions Used**:
    - `contextMenus`: For the image blur feature.
    - `activeTab`, `tabs`: For interacting with the Dify workflow page (getting URL, sending messages to content script).
    - `storage`: Potentially for storing plugin settings (though not explicitly seen in detail yet, it's a common use).
    - `<all_urls>` (host permission): For `content.js` to run on all pages (necessary for Dify interaction and potentially for `console_token` access if Dify is self-hosted on various domains) and for the image blur feature to access image URLs.

# Proposed Solution (Populated by INNOVATE mode)
**Objective**: Create a comprehensive yet user-friendly README.md that clearly explains the plugin's functionalities, highlights its benefits for Dify users, and provides necessary information for both end-users and potential contributors.

**Proposed README Structure**:

1.  **Main Title & Subtitle/Badge**:
    *   Catchy title: e.g., "Dify Tools - Your Dify Workflow Efficiency Booster"
    *   Badges (optional but good): Chrome Web Store version, Build status, License.

2.  **Overview/Introduction**:
    *   Briefly explain what the Dify Tools extension is and its primary goal: to streamline the development, testing, and debugging of Dify workflows.
    *   Mention it also includes a utility for image background blurring.

3.  **Core Features (Dify Workflow Helper)**:
    *   **Workflow Run History Viewer**:
        *   Explain that the plugin provides a dedicated UI (accessed via the toolbar icon, opens in a new tab) to view "Debug Logs" and "API Logs" associated with a Dify workflow URL.
        *   Mention key information displayed (timestamp, status, executor).
    *   **One-Click Workflow Re-run (Highlight Feature)**:
        *   Detail this key functionality step-by-step:
            1.  User opens the plugin UI (it attempts to auto-detect Dify workflow URL from the active tab or allows manual input).
            2.  User selects a past run from the displayed logs.
            3.  User clicks a "Re-run" (or similarly named) button in the plugin UI.
            4.  The extension automatically fills the parameters from that selected run into the input fields of the *currently open Dify workflow page* in the browser.
            5.  The extension then programmatically clicks the "Run" button on that Dify page.
        *   Emphasize the benefit: significantly speeds up iteration and debugging by avoiding manual parameter re-entry.
        *   **Suggestion**: Include a GIF demonstrating this process.
    *   **Authentication Note**: Briefly mention that the plugin requires the user to be logged into their Dify console for it to fetch the necessary `console_token` for API access.

4.  **Secondary Feature (Image Background Blur Tool)**:
    *   Describe the context menu option "Blur background" available on right-clicking images.
    *   Explain it redirects to `imgkits.com` with the image URL for processing.

5.  **Installation**:
    *   **From Chrome Web Store (Recommended for users)**: Provide a placeholder for the CWS link.
    *   **From Source (For developers)**: Briefly mention cloning the repo and using `pnpm install` & `pnpm build`, then loading the `dist` directory.

6.  **How It Works (Brief Technical Overview - Optional but Recommended)**:
    *   A short explanation of the architecture: `Popup UI` (Vue.js, in a new tab) for user interaction, `Background Script` for event handling (icon click, context menu), and `Content Script` for interacting with Dify web pages (reading `console_token`, filling forms, clicking buttons).
    *   This helps users understand the permissions requested and adds transparency.

7.  **Tech Stack**:
    *   List the main technologies used (Vue 3, Element Plus, Tailwind CSS, Vite).

8.  **Feedback, Issues, and Contributions**:
    *   Encourage users to report bugs or suggest features via GitHub Issues.
    *   Welcome contributions and point to contribution guidelines (if a `CONTRIBUTING.md` exists or is planned).

**Visuals**:
*   Strongly recommend creating a GIF to showcase the "One-Click Workflow Re-run" feature, as it's the main value proposition for Dify users.

**Language and Tone**:
*   User-centric, clear, and concise.
*   Professional but approachable.

This structure aims to be informative for users wanting to quickly understand what the plugin does and how to use it, while also providing enough technical context for those curious or looking to contribute.

# Implementation Plan (Generated by PLAN mode)
**Objective**: To create the `README.md` file with the content structure and details defined in the Proposed Solution.

**Detailed `README.md` Content Plan**:

```markdown
# Dify Tools - 您的 Dify 工作流效率助手

[![](https://img.shields.io/badge/Chrome%20Web%20Store-%v1.0.0-blue)](https://chrome.google.com/webstore/detail/YOUR_EXTENSION_ID) <!-- 请替换 YOUR_EXTENSION_ID -->
[![](https://img.shields.io/badge/License-MIT-green)](LICENSE) <!-- 假设是 MIT 协议 -->

Dify Tools 是一款旨在提升您使用和调试 [Dify](https://dify.ai/) 工作流效率的 Chrome 浏览器扩展。它不仅能帮助您方便地查看工作流的运行记录，更能通过"一键重新运行"功能，极大地简化迭代测试流程。此外，插件还集成了一个实用的小工具，用于快速模糊图片背景。

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

### 方式一：从 Chrome Web Store (推荐)
您可以从 Chrome Web Store 安装 Dify Tools 扩展：
[点击这里安装 Dify Tools](https://chrome.google.com/webstore/detail/YOUR_EXTENSION_ID) <!-- 请用户替换 YOUR_EXTENSION_ID -->

### 方式二：从源码构建 (开发者)
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
```

**Implementation Checklist**:
1. [DONE] Record the detailed `README.md` content plan in `TASK-README-Rewrite.md`.
2. Create/Replace `README.md` with the content drafted above. (Placeholders for URLs like Chrome Web Store ID and GitHub repo URL will be used; the user will need to replace these with actual links. The GIF animation is also a suggestion for the user to create and add.)

# Current Execution Step (Updated by EXECUTE mode when starting a step)
> Currently executing: "[Step number and name]"

# Task Progress (Appended by EXECUTE mode after each step completion)
*   {{datetime}}
    *   Step: 2. Create/Replace `README.md` with the content drafted above. (Placeholders for URLs like Chrome Web Store ID and GitHub repo URL will be used; the user will need to replace these with actual links. The GIF animation is also a suggestion for the user to create and add.)
    *   Modifications: 
        *   File: `README.md`
        *   Change: Replaced entire file content with the new planned README content.
    *   Change Summary: Generated a new README.md file describing the Dify Tools extension's functionalities, installation, and technical details, including placeholders for user-specific URLs.
    *   Reason: Executing plan step 2.
    *   Blockers: None.
    *   User Confirmation Status: [Pending Confirmation]

# Final Review (Populated by REVIEW mode)
[Summary of implementation compliance assessment against the final plan, whether unreported deviations were found] 