---
title: 静态网站部署：从本地页面到 GitHub Pages
status: unread
direction: technical-development
---

你已经写好一个页面，怎样让别人通过网址打开它？这篇教程从创建网站文件开始，说明本地预览、上传、GitHub Pages 发布和后续更新的完整过程。

示例只使用 HTML、CSS 和一张 SVG 图片，不需要框架、数据库或付费服务器。准备一个纯文本编辑器和浏览器，并注册、验证自己的 GitHub 账号；可按 [GitHub 注册说明](https://docs.github.com/en/account-and-profile/how-tos/account-management/creating-an-account-on-github)操作。

第一次阅读先看第 1–7 节：基础路线使用 GitHub 网页上传文件，未安装 Git 也能完成。第 8 节介绍 Actions，第 9 节解释有构建步骤的 Quartz 文档站，可在熟悉基础发布后阅读。

## 1. 先认识发布链路

| 名称 | 在本文中是什么 |
| --- | --- |
| 源文件 | 你编辑的 index.html、style.css、badge.svg |
| 构建 | 把源文件加工成浏览器能读取的文件；本文基础小站无需这一步 |
| 构建产物 | 构建生成的 HTML/CSS/JS 等；Quartz 会输出到 public/ |
| 部署 | 把准备好的网站文件交给托管服务，让别人通过 URL 访问 |
| 托管 | 由服务器持续保存并提供这些文件 |
| URL | 浏览器请求资源的地址；例如 `https://用户名.github.io/qsc-learning-site/` |

浏览器能读取 HTML（结构）、CSS（外观）、JavaScript（交互），也能请求图片。GitHub Pages 托管静态文件，不会在服务器上替你持续运行 Go、Python、Node 后端或数据库。网页中的 JavaScript 可以调用已有 API，但 API 服务和认证需要另行设计，本文不涉及。

对基础小站来说，源文件已经是可发布文件；对 Quartz 这类文档站，Markdown 是源文件，要先构建成 HTML 再部署。**不能把“推送源文件”与“网页已经发布”当成同一步。**

## 2. 认识项目站点的地址

我们使用“项目站点”：仓库叫 `qsc-learning-site`，地址通常是：

```text
https://YOUR_USERNAME.github.io/qsc-learning-site/
```

`YOUR_USERNAME` 换成自己的用户名，大小写以 Pages 设置显示的最终地址为准。浏览器访问 GitHub 的仓库页 `github.com/用户名/仓库` 是看源文件，访问 `用户名.github.io/仓库/` 才是看发布网站。

另一种“用户站点”要求仓库名为 `用户名.github.io`，地址没有项目名路径；本文无需改名成这种仓库。先理解这一区别，可以避免把网站地址中的 `/qsc-learning-site/` 漏掉。[GitHub Pages 建站说明](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)

本文示例使用公开仓库，不需要买域名或租服务器；页面和源文件都只放你愿意公开的内容。

## 3. 准备一个可发布的小站

### 3.1 文件应该放在哪里

在电脑上新建一个文件夹 `my-static-site`，用来存放网站。以下三个代码块分别保存为三个文件；文件名不是代码的一部分。编辑器保存时使用纯文本 UTF-8，而不是 Word 文档格式。

```text
my-static-site/       电脑上的网站目录
├── index.html        首页结构和正文
├── style.css         页面样式
└── badge.svg         矢量图片
```

HTML 告诉浏览器“有哪些内容”，CSS 告诉它“这些内容怎样显示”，SVG 提供图片。它们分开保存，通过相对路径联系。后面上传时会再加 `.nojekyll`，用于告诉 Pages 直接发布静态文件。

不要多套一层 `my-static-site/my-static-site/index.html`。本文从 main 根目录发布，线上仓库的第一层就应该能看到 index.html。Windows 可以在文件管理器开启显示扩展名，确认没有误存成 index.html.txt。

### 3.2 创建 index.html

以下代码完整复制进 index.html。`<!-- ... -->` 是 HTML 注释，帮助你理解代码，不会作为页面正文显示。先修改标题、昵称和段落，保留标签、引号与文件路径。

```html
<!doctype html>
<!-- 声明使用现代 HTML。lang 帮助浏览器和辅助阅读工具识别语言。 -->
<html lang="zh-CN">
  <head>
    <!-- UTF-8 避免中文乱码；viewport 让手机按设备宽度展示。 -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- title 出现在浏览器标签页，不是页面里的大标题。 -->
    <title>我的内训学习主页</title>
    <!-- ./ 表示与当前页面同目录；不写成 /style.css。 -->
    <link rel="stylesheet" href="./style.css">
  </head>
  <body>
    <main class="page">
      <header class="hero">
        <p class="eyebrow">QSC · LEARNING JOURNAL</p>
        <!-- 替换“新同学”为自己愿意公开的昵称，不必填真实个人信息。 -->
        <h1>你好，我是新同学。</h1>
        <p class="intro">欢迎来到我的个人主页。这里记录我感兴趣的事情和最近的学习收获。</p>
        <!-- 图片同样使用相对路径；alt 在图片失败或使用读屏工具时提供说明。 -->
        <img class="badge" src="./badge.svg" alt="代表终端与版本记录的学习徽章" width="112" height="112">
      </header>

      <section class="card" aria-labelledby="plan-title">
        <p class="eyebrow">01 / LEARNING PLAN</p>
        <h2 id="plan-title">我的学习路线</h2>
        <!-- 三个列表项可以改成自己当前的学习进度。 -->
        <ol>
          <li>阅读一本感兴趣的书，记录值得回顾的想法。</li>
          <li>学习一项新技能，把理解写成自己的说明。</li>
          <li>整理最近的收获，定期更新这份主页。</li>
        </ol>
      </section>

      <section class="card" aria-labelledby="review-title">
        <p class="eyebrow">02 / FIELD NOTES</p>
        <h2 id="review-title">今天解决了什么</h2>
        <!-- 发布成功后，把这段占位文字改成一次真实的排错记录。 -->
        <p>我正在学习区分“仓库里的文件”和“已经部署的网站”。下一次会把实际遇到的问题、定位依据和解决方法写在这里。</p>
        <!-- 这是普通超链接；可以换成自己公开仓库的完整地址。 -->
        <a href="https://github.com/QSCTech/training">阅读内训教材 →</a>
      </section>

      <footer>持续记录，持续尝试。</footer>
    </main>
  </body>
</html>
```

读懂三件事就可以开始：`<h1>文字</h1>` 是大标题，`<p>文字</p>` 是段落，`href` 和 `src` 指定链接或资源地址。开始时只改标签中间的正文，保留标签与引号。

### 3.3 创建 style.css

CSS 注释写成 `/* ... */`。规则由“选择器 + 大括号里的属性”组成，例如 `body` 选中页面主体，`.card` 选中 class 为 card 的元素。将下面代码完整保存为 style.css，与 index.html 放在同一目录。

```css
/* 全局尺寸计算包含内边距和边框，更容易控制布局宽度。 */
* { box-sizing: border-box; }

/* 颜色变量统一管理；修改这些值可以给主页换主题。 */
:root {
  --paper: #f4f6f0;
  --ink: #193b34;
  --muted: #526a60;
  --line: #d5e0d5;
  --accent: #21705a;
}

/* 不依赖在线字体；中文与英文使用电脑本地可用字体。 */
body {
  margin: 0;
  background: var(--paper);
  color: var(--ink);
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
  line-height: 1.8;
}

/* 内容有最大宽度；窄屏时留出左右边距。 */
.page {
  width: min(100% - 40px, 820px);
  margin: 0 auto;
  padding: 64px 0 32px;
}

/* 首页介绍右侧为徽章留位置；手机规则在文件末尾。 */
.hero { position: relative; padding: 0 150px 32px 0; }
.eyebrow { font-size: 12px; letter-spacing: 0.12em; color: var(--accent); }
h1 { font-size: clamp(30px, 5vw, 44px); line-height: 1.25; margin: 16px 0; }
h2 { font-size: 23px; line-height: 1.4; margin: 8px 0 16px; }
.intro { color: var(--muted); }
.badge { position: absolute; top: 32px; right: 0; }

/* 卡片使用边框与浅色背景，不需要加载外部图片。 */
.card {
  padding: 28px;
  margin: 20px 0;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: #ffffff;
}
ol { padding-left: 24px; }
li + li { margin-top: 10px; }
a { color: var(--accent); text-underline-offset: 4px; }
footer { margin-top: 32px; color: var(--muted); font-size: 13px; }

/* 屏幕宽度不超过 540px 时，徽章进入正常文档流，避免覆盖文字。 */
@media (max-width: 540px) {
  .page { padding-top: 32px; }
  .hero { padding-right: 0; }
  .badge { position: static; margin-top: 16px; }
  .card { padding: 20px; }
}
```

可以先修改 `--accent`，刷新页面观察链接和小标题变化；不会写颜色时先保留默认。`clamp` 与 `@media` 用于适应不同屏幕，不必第一遍掌握所有参数。

### 3.4 创建 badge.svg

SVG 是文本描述的矢量图。这份素材是为本文制作的示例，你不必手写图形命令；将下面代码完整保存为 badge.svg，与另外两个文件放在一起。

```svg
<!-- viewBox 定义坐标范围；width/height 指默认尺寸。 -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 112 112" width="112" height="112">
  <!-- 浅绿色圆角底板。 -->
  <rect width="112" height="112" rx="28" fill="#dfeee1"/>
  <!-- 深色窗口，及表示终端提示符和输入光标的线段。 -->
  <rect x="20" y="28" width="72" height="56" rx="10" fill="#193b34"/>
  <path d="M34 45 L44 55 L34 65 M52 65 H74" fill="none" stroke="#a6e4b3" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

## 4. 本地预览：先确认页面和资源正常

### 4.1 最简单的方法

用文件管理器找到 `index.html`，双击或拖入浏览器。地址以 `file://` 开头，表示浏览器在读你的本机文件，不是一个别人能打开的网站。

本文页面没有 JS 网络请求，因此可以这样预览。应看到浅色背景、两张卡片和终端徽章；只看到没有样式的文字，先检查 CSS 文件名与路径。

### 4.2 可选：用本地 HTTP 服务

若已安装 Python 3，可以在网站目录运行下列之一。没安装时用上一种方法即可，不要为了首次预览额外卡在 Python 安装上。

```bash
# macOS/Linux：在含 index.html 的目录运行，绑定本机回环地址。
python3 -m http.server 8000 --bind 127.0.0.1
```

```bash
# Windows：如果安装器提供 py 启动器，使用这一条，二选一。
py -3 -m http.server 8000 --bind 127.0.0.1
```

打开 `http://localhost:8000/`。`localhost` 是自己的电脑，8000 是服务端口；别人不能拿这个地址直接访问你的电脑。终端会保持运行，结束按 `Ctrl+C`。端口占用可换 8001，并对应修改浏览器地址。

若显示目录列表而不是首页，通常是启动目录不对或 `index.html` 不存在。Windows 文件系统可能不区分大小写，Pages 的资源路径要按精确大小写处理。

## 5. 在 GitHub 创建仓库并上传文件

### 5.1 创建自己的公开仓库

仓库是保存网站源文件的地方。为了避免文件混在一起，给这个网站单独创建一个仓库；不要把自己的页面上传到部门教材库。

1. 登录 GitHub，右上角 **+ → New repository**。
2. Owner 选择自己，Repository name 填 `qsc-learning-site`。
3. 选择 **Public**，这条路线可使用免费账户的 Pages。文件和网站会公开，只放你愿意公开的内容。
4. 勾选添加 **README**，让 GitHub 创建第一份提交和默认分支。
5. 点击 **Create repository**，查看 Code 页的分支选择器。下文使用 main；如果默认分支叫别的名字，发布时选择实际分支。

README 是项目说明，Pages 首页则由 index.html 提供；两者职责不同。这里通过网页创建 README，是为了让仓库有可选择的发布分支。

### 5.2 上传三个网站文件

1. 在 Code 页点击 **Add file → Upload files**。
2. 拖入 index.html、style.css、badge.svg 三个文件，或点击 **choose your files** 选择。上传的是文件本身，不是包着它们的 my-static-site 文件夹。
3. 检查列表中路径是否直接是 index.html 等，填写提交说明，例如 `Add the personal homepage`。
4. 可以选择新建分支，例如 `feat/publish-home`，再点击 **Propose changes** 或页面显示的提交按钮。
5. 在随后出现的 PR 页面核对 `base: main`、`compare: feat/publish-home`，创建 Pull Request。进入 **Files changed** 确认只有网站文件，然后回到讨论页，按页面允许的方式合并并确认。
6. 返回 Code 页，切回 main，确认三个文件已在仓库第一层。

PR 是把分支改动合并进 main 的请求，创建请求本身还没有更新 main。自己的示例仓库也可能允许直接提交到 main；无论采取哪种方式，下一步发布前都要确认文件已经进入发布分支。仓库有保护规则时，按其要求审阅，不更改规则来绕过检查。[GitHub 上传文件说明](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository)

### 5.3 添加 .nojekyll

从分支发布时，Pages 可以默认使用 Jekyll 处理内容。本文只有现成静态文件，增加 .nojekyll 表示直接发布这些文件，不走默认 Jekyll 构建。

在 Code 页选择 **Add file → Create new file**，文件名填写 `.nojekyll`，第一层不加其他目录。可以在内容里写一行 `# Publish these static files directly` 作为说明；它不是需要执行的代码。关键是文件存在，内容为空也可以。

保存到 main，或新建分支并合并 PR；完成后 main 第一层应有 README.md、index.html、style.css、badge.svg、.nojekyll。文件名有一个开头的点，不是 nojekyll.txt。

### 5.4 可选：用本地 Git 上传

已会用 Git、并已完成 GitHub 命令行认证时，可以用命令行代替网页上传。二选一即可。下面沿用刚创建且含 README 的远程仓库，先克隆，让本地和远程从同一份历史开始。

在 Bash 中执行，先把 YOUR_USERNAME 换成自己的 GitHub 用户名：

```bash
cd ~  # 在主目录操作；同名 qsc-learning-site 目录已存在时先换位置
# 下载刚创建的仓库，里面已经有 README 和 main。
git clone https://github.com/YOUR_USERNAME/qsc-learning-site.git
cd qsc-learning-site
# 此时用文件管理器把三个页面文件复制进来，不要再套 my-static-site 目录。
touch .nojekyll  # 本地路线创建空文件；该文件名需要完整保留

git status  # 核对当前分支和将要添加的文件
git switch -c feat/publish-home  # 新建一个修改分支
git add index.html style.css badge.svg .nojekyll  # 只选择网站文件
git diff --cached  # 检查内容和资源路径
git commit -m "feat: add the personal homepage"  # 保存本地版本
git push -u origin feat/publish-home  # 上传分支；main 还没有改变
```

网页中按 5.2 的方式创建并合并 PR。若 commit 提示没有作者署名，先配置自己的 user.name 和 user.email；若 Push 认证失败，检查当前登录账号和仓库写权限。网页路线无需处理这套本地认证，不必为首次发布临时切换工具。

## 6. 基础发布：从 main 的根目录部署

### 6.1 打开 Pages 设置

1. 浏览器打开**自己的** `qsc-learning-site` 仓库。
2. 点击 **Settings**。若找不到，确认登录的是仓库拥有者，或查看顶部折叠菜单。
3. 在侧栏找到 **Pages**。
4. 在 **Build and deployment** 中，将 **Source** 选为 **Deploy from a branch**。
5. **Branch** 选择 `main`，目录选择 `/(root)`，点击 **Save**。

每个选项的含义：`main` 是部署读取的版本线；`/(root)` 是这条线里的仓库根目录，正是 `index.html` 所在的位置。**它不是电脑的根目录 `/`，也不是你主目录里的任意文件夹。** [发布源官方说明](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

### 6.2 查看发布结果

进入 **Actions**，查看 Pages 对应的运行。名字可能显示为 `pages build and deployment` 等；以本次提交和运行详情为准。绿色成功后返回 **Settings → Pages**，点击 **Visit site** 或复制页面显示的地址。

首次发布可能需要等几分钟，不要连续切换设置。访问完整项目路径，并检查：

- 主页标题是自己修改后的文字。
- CSS 确实生效，徽章能显示。
- 外部链接能打开。
- 手机或窄窗口仍可阅读。

这四项才说明页面可用；绿色状态只说明工作流完成。

### 6.3 完成第二次发布

可以直接在 GitHub 打开 index.html，点击编辑按钮，修改“今天解决了什么”的段落，填写提交说明；选择新分支时，还要创建并合并 PR。也可以先在本机编辑、预览，再通过 Upload files 更新同名文件。改动进入发布用的 main 后会触发发布，不需要每次去 Pages 重新 Save。

在 Actions 确认此次提交部署成功，刷新在线网址看到新的文字。浏览器缓存有时导致旧内容暂留，可以强制刷新或在隐私窗口验证，但先确认工作流确实部署了最新提交。

## 7. 用路径与日志定位问题

### 7.1 相对路径为什么有用

页面在 `https://用户名.github.io/qsc-learning-site/` 时：

| HTML 里的地址 | 浏览器通常请求 | 结果 |
| --- | --- | --- |
| `./style.css` | `/qsc-learning-site/style.css` | 本文的正确位置 |
| `/style.css` | `/style.css` | 从域名根开始，可能 404 |
| `./badge.svg` | `/qsc-learning-site/badge.svg` | 本文的正确位置 |

`/` 开头不是“当前文件夹”。更深的页面路径还需要按相对层级考虑；目录之间跳转用 `../` 返回一级。在构建型网站中，生成器的 base URL 会影响最终路径，见下一节。

### 7.2 推荐排查顺序

1. **先看 URL**：是在项目站点，还是仓库网页、域名根、localhost？
2. **看发布源**：分支和目录是否包含 `index.html`？最近 PR 是否已经合并？
3. **看 Actions**：打开对应提交的运行，展开红色失败步骤，读第一处有意义的错误。
4. **看资源请求**：浏览器开发者工具 → Network，刷新并找到 CSS/图片的请求 URL 与状态码。
5. **看文件和 Git 历史**：文件名大小写是否一致？是否遗漏暂存、提交、推送？

开发者工具通常可以按 F12，或通过浏览器菜单进入“开发者工具”；macOS 一些浏览器使用 `Cmd+Option+I`。Network 记录可能需要打开工具后再刷新才能看到。

| 现象 | 常见原因与处理 |
| --- | --- |
| 整个网站 404 | 发布尚未完成、项目路径漏了、发布分支/目录错误、入口文件位置不对 |
| 页面有文字但没有样式 | style.css 未推送、路径写成 /style.css、大小写不一致；查看 CSS 请求 |
| 徽章不显示 | src 路径错误，或文件变成 badge.svg.txt |
| Push 成功但网站没更新 | 改动还在任务分支/PR，或工作流失败；查提交编号 |
| Settings 中没有 Pages 权限 | 打开了别人仓库或账号无管理权限；使用自己的仓库 |
| 工作流提示权限不足 | 检查 Pages Source、部署 job 权限、环境保护和组织策略 |
| 本地能看，网上不能看 | file/localhost 与项目路径不同，线上文件系统大小写要求也可能不同 |

## 8. 进阶：用 GitHub Actions 明确发布步骤

基础路线已成功后再做。**同一个站点一次只选择一种发布源。** 本节将 Source 改为 GitHub Actions，不要再期待“从分支发布”的配置继续决定目录。

Actions 让 GitHub 在临时 runner（执行机器）中按 YAML 流程运行命令。job 是任务，step 是任务中的步骤，action 是可复用步骤。下面示例发布已有静态文件，没有引入构建工具；第 9 节再看构建型站点。

### 8.1 创建工作流文件

在**自己的主页仓库**根目录创建 `.github/workflows/pages.yml`。把下面完整代码保存到这个位置；不要把本示例另放进官方内训仓库执行。

```yaml
# Actions 页面显示的名称，不决定站点网址。
name: Publish learning site

on:
  # main 有新提交时发布；任务分支 push 不会直接上线。
  push:
    branches: [main]
  # PR 只检查文件，帮助在合并前发现遗漏。
  pull_request:
  # 在 Actions 页面允许人工运行；运行时选择 main。
  workflow_dispatch:

# 默认只读仓库；部署需要的额外权限仅给 deploy 任务。
permissions:
  contents: read

jobs:
  build:
    # GitHub 提供的临时 Linux runner，不是你的电脑。
    runs-on: ubuntu-latest
    steps:
      # 先取仓库文件，否则 runner 里没有 index.html。
      - name: Checkout source
        uses: actions/checkout@v4
      - name: Check entry and assets
        run: |
          # -f 确认文件存在；-s 额外确认文件非空。
          # Bash 遇到失败的 test，步骤会失败，阻止后面的部署。
          test -s index.html
          test -s style.css
          test -s badge.svg
          test -f .nojekyll
      # PR 不需要上传部署包；main 的运行准备产物。
      - name: Upload website files
        if: github.event_name != 'pull_request' && github.ref == 'refs/heads/main'
        uses: actions/upload-pages-artifact@v4
        with:
          # 本例只有静态文件，因此使用仓库根目录。
          # 构建型站点应改成产物目录（例如 public），不能盲目用 .。
          path: .

  deploy:
    # build 完成且成功后才部署；PR 永远不执行本任务。
    needs: build
    if: github.event_name != 'pull_request' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pages: write   # 允许把产物发布到 GitHub Pages。
      id-token: write # 提供部署使用的短期身份凭证，不是手写密码。
    environment:
      # GitHub Pages 使用的部署环境，可配置保护规则。
      name: github-pages
      # 将最终网站地址显示在运行与环境页面。
      url: ${{ steps.deployment.outputs.page_url }}
    concurrency:
      # 同一站点部署排队，避免两个部署同时争用。
      group: pages
      cancel-in-progress: false
    steps:
      - name: Configure Pages
        uses: actions/configure-pages@v5
      - name: Deploy website
        id: deployment # 前面的 steps.deployment 指向此步骤。
        uses: actions/deploy-pages@v4
```

缩进用空格，同层对齐；YAML 不需要分号。`${{ ... }}` 是 Actions 表达式，不是要在终端输入的命令。`@v4` 等是 action 的主版本标签，本例采用官方支持的示例版本，不等于所有 action 都应该用同一个版本号。

### 8.2 让它真正运行

1. 保存文件，在自己的任务分支提交并推送，创建 PR。
2. PR 的 Actions 检查应通过。`build` 检查四份文件；`deploy` 跳过是正常的。
3. 合并到 `main`，进入 **Settings → Pages**，将 Source 改为 **GitHub Actions**。
4. 若刚合并时因为 Source 未切换而失败，切换完成后在 Actions 中选择工作流，通过 **Run workflow** 选择 `main` 运行，或重新运行对应失败运行。
5. 检查上传与部署两个步骤，打开环境给出的 URL，验证页面。

`build` 是任务名称，本例实际只是检查和打包；有构建工具时还要在上传前添加安装和构建步骤。对于独立纯静态仓库，用 `path: .` 简单易懂；发布范围扩展时应改成只含网站的产物目录，防止无关文件进入部署包。

这一流程依据 [GitHub Pages 自定义工作流说明](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。本教材提供可检查的配置，本地验证不能替代你自己仓库上的实际授权与云端部署。

## 9. 进阶：读懂内训仓库的 Quartz 发布

官方内训网站使用 Markdown + Quartz，链路是：

```text
docs/*.md → Quartz 读取并转换 → public/ 静态文件 → Pages → 浏览器
```

README 描述本地环境，`package.json` 定义 setup/dev/build 命令，`scripts/` 下载与配置固定版本 Quartz，`.github/workflows/docs.yml` 在 GitHub 上执行自动发布。

### 9.1 本地预览现有文档站

下面从零下载官方仓库来阅读和预览。需要先安装 Git、仓库要求的 Node.js/npm，并能够联网下载依赖；第一次发布纯 HTML 的读者可暂时跳过。

```bash
cd ~
git clone https://github.com/QSCTech/training.git training-preview  # 同名目录不存在时执行
cd training-preview          # 此目录应包含 package.json
node --version               # 核对 Node 已安装；当前仓库 CI 使用 Node 22
npm --version                # npm 是安装依赖和运行工程命令的工具
npm run setup                # 首次下载固定版本 Quartz 并安装依赖
npm run dev                  # 构建后启动预览；访问 http://localhost:8080/
```

关闭预览按 `Ctrl+C`。另一份终端中或关闭后可执行：

```bash
npm run build   # 只生成本地 public/，不会 push 或发布到 GitHub
git status      # 构建会生成 docs/changelog.md，检查这份自动改动
```

Quartz 的 `public/` 类似装好的发布包。官方脚本中 `.quartz/` 是下载的构建工具，`docs/` 是教材源文件，两者职责不同；不要为了编辑文章去改 `.quartz/content` 或 `public` 中的 HTML。

### 9.2 解释关键配置

下面是从现有工作流中摘出的配置片段，用来阅读，**不能单独当作完整工作流执行**：

```yaml
# 官方站点的网址；本机目录名不是网站 base URL。
env:
  SITE_URL: https://qsctech.github.io/training
```

```yaml
# Quartz 构建后上传 public，不能把 Markdown 源目录当作浏览器页面。
- uses: actions/upload-pages-artifact@v5
  with:
    name: github-pages
    path: public
```

当前工作流在 PR 中检查 Markdown 链接；合入 `main` 后才执行 Quartz 构建与部署。所以写课程时本地 `npm run build` 很有用，不能只看到 PR 链接检查绿色就认定网站构建没问题。

### 9.3 在个人副本中发布 Quartz 的额外工作

可先学习原理，按需要阅读。如果使用自己的 Fork：

1. 修改自己副本 `.github/workflows/docs.yml` 的 `SITE_URL`，例如 `https://你的用户名.github.io/training`；仓库若改名，项目路径一起改。
2. 开启自己仓库的 Actions，并将 Pages Source 设为 GitHub Actions；Fork 后工作流可能需要手动启用。
3. 在自己的 `main` 运行或触发 Docs 工作流，确认构建与部署，再检查带项目路径的页面和链接。
4. 若本地想模拟同样的生成地址，macOS/Linux/Git Bash 可运行 `SITE_URL=https://你的用户名.github.io/training npm run build`。这是构建配置，不会自动发布；预览 dev 使用 localhost。

**不要把个人的 SITE_URL 改动合回官方仓库。** 这只是自己站点的部署配置。官方网站排除 `notes/**`，想公开自己的学习笔记需要在个人副本中单独设计展示范围与链接；教材阅读、私人笔记、公开作品不必放在同一处。

## 10. 可选：自定义域名与 HTTPS

不用买域名也能完成本文。自定义域名是让一个你控制的域名指向网站；DNS 是域名与服务的对应配置；HTTPS 为浏览器与网站之间的传输提供加密。

自定义域名栏填写域名，不填写 `域名/路径`。配置时按 GitHub 官方文档核对 DNS 记录、域名验证和 HTTPS 状态，不照抄不属于自己的域名。部署站点即使源码是私有仓库也不必然私有；涉及受限内容要单独设计访问控制。

## 参考与延伸

基础发布、发布源和 Actions 的官方页面已在对应步骤链接。HTML 进一步学习可查 [MDN：创建网页内容](https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Your_first_website/Creating_the_content)。本文代码和徽章为示例，熟悉后可以按需要修改。
