---
title: 前后端入门：从一个网页到一次完整交互
author: 晨星
modified: 2026-10-22
status: unread
direction: technical-development
---

> **先体验一下**
>
> 打开 [待办清单体验页](http://120.26.242.138/)，输入“阅读内训文档”，点击“新增”，页面上就会多出一行。再刷新页面，看看这条事项是否还在。
>
> 这个页面就是第 8 节将要一起拆解和运行的示例。现在只需要体验，不必安装任何开发工具。

一次新增看起来只是让页面多出一行，但其中已经经过了浏览器、网络、后端程序和内存中的数据存储。前端与后端的分工，就藏在这些步骤里。

全文只追踪一件事：**用户输入“阅读内训文档”，点击“新增”，这条事项怎样经过浏览器、HTTP、后端，最后成为可以再次读取的数据。** 我们先让它在本机跑通，再讨论怎样落库，以及换成 React、TypeScript、Gin 后怎样认出同一条路线。

先明确本例的边界：“落库”指由后端把记录写入数据库，并确认写入成功。**第 8 节的可运行示例只保存到后端内存，没有数据库；第 9 节会指出落库应替换哪一步，以及为什么内存版不能保证重启后仍在。** 本机演示不需要安装数据库；以后接入数据库时，需要替换保存与读取这两站。

为方便多人同时体验，线上版为每个浏览器提供独立清单，最多保存 50 条；两小时未访问或服务重启后会清空。第 8 节的本机版本会先使用一份更简单的共享内存列表，读取、新增和前后端交互的逻辑相同。

## 必备知识与学习顺序

建议先学习 [命令行与 Shell 基础](shell-basics.md)，能进入目录、保存文件和运行命令；读过 [静态网站部署](github-pages.md)，认识 HTML 文件、相对路径和本地预览，会更容易理解本文。例子的语法会从基础解释，不要求提前掌握 JavaScript、Go 或框架。[Git 基础与 GitHub 协作](git-basic.md) 可以帮助你管理示例文件，理解本文时不必先推送任何仓库。

准备一个纯文本编辑器和现代浏览器。第 1–6 节可以先阅读，也可以在浏览器控制台中观察小段代码。第 7–8 节运行后端时需要安装 Go；主例只使用 Go 标准库，无需安装数据库、Node.js 或前端框架。

本文属于 [技术研发方向](技术研发方向.md)。它会把 [HTML 与 CSS](frontend-html-css.md)、[React 学习资料](frontend-react.md)、[Go语言](backend-go.md) 与 [数据库、MySQL 与 Prisma](backend-database-mysql-prisma.md) 联系起来；这些课程可以在读懂整体交互后继续深入。

## 如何阅读这篇教程

把下面这条路线留在脑中。每次遇到新语法，都问它接住了哪个输入、准备交出什么结果：

```text
输入标题 → 提交事件 → 前端检查 → POST /api/todos
                                  ↓
页面显示 ← JSON 响应 ← 后端确认保存 ← 解码与校验
                                  ↑
                      第 8 节：内存；第 9 节：数据库写入的位置
```

为了能点下“新增”，还需要先取得页面、找到输入框、理解代码；这些是同一条路线的准备环节。读取列表用于确认新增的结果，不是另一套业务。内容较长，可以分三次阅读：

| 阅读范围 | 关注的问题 |
| --- | --- |
| 第 1–6 节 | 浏览器显示什么？页面里的代码怎样读取输入、组织数据和发送请求？ |
| 第 7–9 节 | 后端怎样接收请求？一次新增怎样完成？数据保存在哪里？ |
| 第 10–13 节 | React、TypeScript、Gin 和工程目录怎样对应前面的概念？怎样调试与上线？ |

代码块前会说明它是“阅读片段”还是“完整文件”。**只有第 8 节的四个完整文件需要组合保存，其他片段用于逐步认识语法，不要全部拼到同一个文件里。** 不运行代码也可以沿着图解、输入和输出理解过程。

代码中的 `//`、`/* ... */`、`<!-- ... -->` 是不同语言的注释，会在对应位置解释。输入命令时使用英文引号和标点，不复制终端提示符。终端运行 `go`、`curl` 等命令；浏览器开发者工具的 **Console（控制台）** 运行 JavaScript，**Network（网络）** 记录请求。两处输入环境不同。

文中的“小实验”是讲解的一部分，不是课后作业。它们在第 8 节运行成功后进行；初读时先看预期结果，回到本机再验证。修改代码前复制一份实验副本，每次只做所说的改动，结束后恢复，再进行下一个实验。所有实验都针对本机 `127.0.0.1`，不修改开头的公网体验页。

## 1. 前端、后端、数据库各自负责什么

先给“新增待办”画一张责任地图：点击由谁接住，保存由谁确认？这一节把一次操作拆成几站，下一节再解决“浏览器怎样找到负责保存的那个程序”。

### 1.1 从“新增待办”拆出几件事

如果只说“按钮实现了新增”，出错时就不知道该查哪里。先把这一句话展开成可以逐步核对的动作：

假设页面上有一个输入框、一个按钮和一张列表。用户输入标题后点击按钮：

1. 浏览器中的代码读取输入框，确认不是空白，显示“正在新增”。
2. 浏览器把标题发送给后端程序。
3. 后端检查收到的内容，生成事项编号，保存数据。
4. 后端把保存结果返回给浏览器。
5. 浏览器读到结果，在列表里显示新事项。

其中第 1、5 步主要属于前端，第 3 步属于后端，第 2、4 步把两边连接起来。保存数据时，后端还可能与数据库交互。

```text
用户点击按钮
    ↓
浏览器里的前端代码 ── HTTP 请求：我要新增什么 ──→ 后端程序
    ↑                                              ↓
更新页面          ←── HTTP 响应：处理结果是什么 ── 校验并保存
                                                   ↕
                                              数据库（如有）
```

图中的箭头表示数据流动。前端不会把整个程序“传给后端执行”，而是按约定发送请求；后端返回的也经常是数据，由前端决定怎样显示。

用“输入三个空格”的场景检验责任：前端可以拦下这次操作，但如果有人直接发请求，后端仍要拒绝。否则步骤 1 看似认真检查，步骤 3 却可能保存空记录；第 9.3 节会直接从终端验证。

### 1.2 先分清这些名称

刚才第 3 步说“后端保存”，它到底是浏览器、云主机，还是主机里运行的程序？这些名称如果混用，就会出现“我把文件传上服务器，为什么没人处理请求”的困惑。

| 名称 | 在本文里指什么 | 具体例子 |
| --- | --- | --- |
| 浏览器 | 读取网页并运行其中 JavaScript 的应用 | Chrome、Edge、Firefox、Safari |
| 客户端 | 向某个服务发起请求的一方 | 浏览器、手机 App、命令行 curl |
| 前端 | 面向用户的界面及相关交互代码 | 输入框、按钮事件、加载提示、列表 |
| 后端 | 接收请求、执行规则、组织和保存数据的程序 | 检查标题、生成编号、查询数据库 |
| 服务器机器 | 运行并提供服务的计算机 | 云主机，也可以是你的电脑 |
| 服务器程序 | 在指定地址与端口等待请求的软件 | 本文启动的 Go HTTP 服务 |
| 数据库 | 管理和持久保存数据的软件系统 | MySQL、PostgreSQL、SQLite 等 |

“服务器”在不同语境中可能指机器，也可能指程序。看到“启动服务器”时，要结合上下文判断：本文通常是在启动一个程序，并没有凭空获得一台云主机。

例如，云主机一直开着，Go 进程却已退出，新增仍会连接失败；数据库在运行，但后端没有执行写入，也不会凭空多一行记录。责任地图必须落实为对应程序做过的动作。

### 1.3 分工取决于职责与运行位置

在同一台电脑里打开网页、运行 Go，是否就没有后端了？判断分工要看代码在哪里执行、负责什么，不能只看两台机器有没有物理分开。

后端不必运行在另一台电脑上。学习时，浏览器和 Go 程序都可以运行在自己的电脑上，通过本机网络地址交流；上线后，它们通常分布在用户设备和提供服务的机器上。

JavaScript 可以在浏览器运行，也可以在 Node.js 等环境运行。同一种语言可以参与不同位置的工作，因此不能只凭文件里用了什么语言，就判断它属于前端还是后端。

本文先采用“浏览器负责交互，Go 负责 HTTP 服务”的清晰分工。真实项目还可能由服务器生成 HTML，或者同时使用服务器与浏览器渲染，后面接触这些方案时，继续追问“这段代码在哪里运行、接收什么、输出什么”。

检验方法是暂时停止 Go，再在浏览器里点新增：浏览器还能运行脚本并显示失败提示，却不能完成保存。机器没有改变，停止的是负责保存的那个程序。这个实验放在第 8.6 节完成。

### 1.4 页面会动，不等于一定调用了后端

如果新增按钮只是往页面里插入一行，画面也会变化。我们需要一个比“页面动了”更可靠的标准，判断保存那一站有没有发生。

展开菜单、切换颜色、对本地数组排序，都可以完全在浏览器中完成。一个静态托管的网站也可以包含 JavaScript，并向另外提供的后端 API 发请求。

因此要区分两个问题：**页面是否有交互**，以及 **这次交互是否需要后端参与**。判断待办是否保存成功，不能只看页面上是否多了一行，还要看它保存到哪里、刷新或重启后是否存在。

后面判断新增成功，会同时检查 POST 的响应、新生成的编号与再次 GET 的结果。少掉后端保存这一步，列表即使临时多出一行，也只能算页面显示变化。

## 2. 打开一个网址时发生了什么

上一节分清了浏览器与后端，现在让“新增”找到接收者：地址指向哪台机器、哪个程序、哪个入口？先看取得页面和发送请求的路线，下一节再检查页面上到底有哪些可以操作的元素。

### 2.1 网址可以分成几部分

点击新增后，标题不能只“发给服务器”：同一台机器可能还运行着别的程序。把地址拆开，才能判断这条请求有没有走到待办接口。

先看这个只用于解释格式的地址：

```text
http://127.0.0.1:8090/api/todos?limit=10#example
│      │         │    │          │       └─ 片段：通常由浏览器处理
│      │         │    │          └───────── 查询参数
│      │         │    └──────────────────── 路径
│      │         └───────────────────────── 端口
│      └─────────────────────────────────── 主机地址
└────────────────────────────────────────── 协议
```

- `http` 表示按 HTTP 方式访问；公网网站通常使用带加密保护的 `https`。
- IP 地址用于在网络中标识主机，IPv4 与 IPv6 是两种地址体系；`127.0.0.1` 是 IPv4 本机回环地址。`localhost` 也表示本机，但可能解析到 IPv4 或 IPv6；本文统一使用 `127.0.0.1`，与服务绑定地址保持一致。
- `8090` 是端口，帮助找到这台机器上具体的服务。它不是目录，也不是程序版本。
- `/api/todos` 是服务器用于识别资源或操作的路径，不一定对应磁盘上的同名文件。
- `?limit=10` 是查询参数；是否有效取决于后端有没有实现。本文主例不实现这个筛选参数。
- `#example` 是片段，通常供页面定位或客户端逻辑使用，不会作为 HTTP 请求目标发送给服务器。

你电脑的 `127.0.0.1` 与另一位同学电脑的 `127.0.0.1` 各自指向自己的机器。把本机地址发给同学，不能让对方访问到你电脑上的演示服务。

例如把 8090 写成 8091，请求可能碰到第 7 节的最小服务并得到 404；把 `/api/todos` 拼成 `/api/todo`，即使端口正确也找不到接口。改路径或端口时，先说明自己要换的是哪一站。

### 2.2 浏览器先请求页面，也会继续请求资源

首页能打开，却可能仍然无法新增，因为取得 HTML 不等于取得脚本或业务数据。把这几个请求分别列出，就能避免把“网站可见”误认为“新增可用”。

访问本文主例的首页时，过程大致是：

```text
GET /                → 返回 HTML
GET /style.css       → 返回样式
GET /app.js          → 返回前端 JavaScript
GET /api/todos       → 返回待办数据，由 app.js 发起
```

前三个请求取得页面文件，第四个请求取得业务数据。浏览器可能缓存资源，也就是保留以前取得的内容供再次使用，实际请求数量和顺序以 Network 面板为准。URL 中使用域名时，还可能先进行域名解析；建立连接、加密和缓存的细节可以在学习 [Wireshark 简介](other-wireshark.md) 时继续观察。

这解释了两类不同故障：app.js 没加载，新增处理函数根本没有注册；GET 数据失败，脚本已经运行，却还不知道旧列表。第 8 节会用状态提示与按钮状态把二者表现出来。

### 2.3 一个请求对应一次响应

浏览器发出了标题，怎样知道后端是否接受？HTTP 不只负责把内容送过去，还需要让接收者把结果和状态交回来。

HTTP 可以先理解为客户端与服务端交流的约定。请求说明“要访问什么、想做什么、携带什么内容”，响应说明“结果怎样、返回什么内容”。例如：

```http
GET /api/todos HTTP/1.1
Host: 127.0.0.1:8090
```

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

[]
```

这里的 `[]` 表示一个空数组，即当前没有待办。上面的 HTTP 文本用于阅读结构，不是要直接粘贴到终端执行的命令。

客户端可以在同一连接上多次交流，HTTP 的实际传输版本也可能不同；初学时先把每次操作的请求和响应对应起来。[MDN：客户端与服务器交互](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/First_steps/Client-Server_overview)

后端以后返回 `201` 与新事项时，才完成新增的这次回应；`200 []` 则是在回答读取请求。若只记“网站返回了 200”，可能把首页取得成功与新增成功混在一起。

## 3. 读懂网页的骨架与样式：HTML 和 CSS

浏览器已经能取得页面文件，但“新增”还需要输入框、按钮和结果区域。本节把这些位置搭出来并连上脚本，下一节才有具体对象可以读取、判断和更新。

### 3.1 HTML 描述有哪些内容

新增需要接收标题、触发提交和显示结果三个位置。如果只有一张写着“新增”的图片，脚本并没有一个真正的输入框可以读。

下面是一个**阅读片段**，完整页面将在第 8 节给出：

```html
<form id="todo-form">
  <!-- for 与输入框的 id 对应，让“事项标题”成为输入框的标签。 -->
  <label for="title">事项标题</label>
  <input id="title" name="title" type="text" maxlength="80" required>
  <button id="submit-button" type="submit">新增</button>
</form>

<p id="message" role="status">等待操作</p>
<ul id="todo-list"></ul>
```

`<form>...</form>` 是一个元素，内部包含其他元素，这种关系叫嵌套。`id="title"` 等内容是属性，补充这个元素的身份或行为。大部分元素有开始和结束标签；`input` 等空元素不写 `</input>`。

这个片段表达了一个输入流程：`label` 说明输入的内容，`input` 接收文字，`button` 提交表单，`p` 显示反馈，`ul` 容纳列表。先理解这些职责，再看样式和 JavaScript，阅读会更有方向。

删去列表元素，POST 仍可能成功，但脚本无法显示结果；删去 form 而不改脚本，后面的 submit 监听又会找不到目标。HTML 的职责是给每一次交接提供明确位置，不是直接保存数据。

### 3.2 class、id、name 不承担同一种职责

输入框同时写了 id 和 name，新手很容易认为二者都叫 title，所以数据会自动发出去。把“找元素”和“组成字段”分开，才能读懂稍后的 JSON 请求。

| 写法 | 常见用途 | 本文中的含义 |
| --- | --- | --- |
| `id="title"` | 标识页面中的一个元素 | label 和 JavaScript 都可以找到它 |
| `class="card"` | 为一组元素提供共同分类 | CSS 可以统一设置卡片样式 |
| `name="title"` | 在表单数据中标识字段 | 使用原生表单提交或 FormData 时会用到 |

本文用 JavaScript 手动生成 JSON，发送哪个字段由 `JSON.stringify({ title: ... })` 决定。给输入框写了 `name`，不会自动让任何 `fetch` 请求都带上该字段。

`required`、`maxlength` 能帮助浏览器提示输入问题，但后端仍要检查数据。发请求的人可以不使用你的页面，也可以修改浏览器中的 HTML。

对照一下：只把 `id="title"` 改成 `id="task-title"`，却不改选择器，脚本会找不到输入框；只删 name，本文手写的 JSON 仍能发送 title。修复必须跟着实际使用这个属性的代码，而非只让几个名字看起来一致。

### 3.3 CSS 选择元素，再设置外观

表单已经可以表达输入，但挤在一起的按钮、不断跳动的提示会让用户难以判断新增是否进行中。CSS 负责把这些状态呈现清楚，保存动作仍由脚本和后端完成。

```css
/* 选中 class 中含 card 的元素。大括号内每行是一项样式声明。 */
.card {
  max-width: 42rem;       /* 限制内容最大宽度，避免一行文字过长。 */
  margin: 2rem auto;      /* 上下留空，左右自动分配空间。 */
  padding: 1.5rem;        /* 内容与边界之间的内边距。 */
  border: 1px solid #ccd6df;
}

/* #message 选中指定 id；.error 是一个表示错误状态的 class。 */
#message.error {
  color: #a61b29;
}
```

一条 CSS 规则由选择器和声明组成；声明通常是“属性: 值”。`margin` 位于盒子外侧，`padding` 位于边框内侧。`rem` 与根元素字号有关，`px` 表示 CSS 像素；初次阅读先认识用途即可。

Flexbox 按行或列分配元素空间，Grid 提供二维网格，媒体查询按视口等条件应用不同样式；本例第 8.3 节用到 Flexbox 和媒体查询。多条规则可能同时影响同一元素，最终结果涉及层叠与优先级；样式不符合预期时，打开开发者工具查看实际生效的规则。完整基础可继续读 [HTML 与 CSS](frontend-html-css.md)。

在第 8 节临时移除 HTML 中的样式 link，再刷新：布局会退回浏览器默认样式，但新增与读取仍可工作。由此可以分清“错误提示没有变红”和“后端没保存”不是同一类问题；实验后恢复 link。

### 3.4 HTML、CSS、JavaScript 怎样接在一起

写好 app.js 却没有让 HTML 引入它，按钮只是一个静态控件；引入时机不对，脚本又可能找不到尚未解析的输入框。下面两行把文件与执行时机一起约定下来。

```html
<!-- 以下两行放在 HTML 的 head 内；第 8 节有完整位置。 -->
<link rel="stylesheet" href="./style.css">
<script type="module" src="./app.js"></script>
```

`link` 引入样式，`script` 引入脚本。`type="module"` 表示按 JavaScript 模块处理；这种脚本会在 HTML 解析完成后执行，因此它可以找到页面中的表单和列表。后面见到 `import`、`export`，就是在模块之间组织代码。

相对路径取决于页面地址与文件位置。页面正常、样式或按钮失效时，要分别检查 CSS 和 JavaScript 是否加载，不能只看 HTML 有没有返回。

**小实验：脚本为什么有时找不到输入框。** 第 8 节运行后，在实验副本的 head 中把 `<script type="module" src="./app.js">` 临时改成 `<script src="./app.js">`，其他位置不动，再刷新。普通外部脚本会在解析到它时执行；此时后面的 form 尚未建立，querySelector 得到 null，注册事件时会报错，页面无法完成新增。恢复 module 后再刷新，应该能正常初始化。

本例的关键条件是“脚本在 head，执行时要找到后面的 DOM”。不是所有脚本都必须使用 module：普通脚本配合 defer 也能安排到文档解析后执行，但不因此获得 import/export 的模块语义。本例选 module 同时为第 4.7 节的模块写法铺垫。[MDN：script 的模块与延后执行](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script)

## 4. 阅读 JavaScript 必须认识的语法

输入框有了，浏览器却还不知道怎样把文字变成请求中的数据。本节只学习新增流程马上要用的变量、对象、判断和函数，下一节把这些语句接到真实的提交事件上。

这一节的代码用于阅读语法。可以把单个完整片段放进浏览器开发者工具的 Console 观察；反复声明同名 `const` 时可能报“已经声明”，刷新页面或换变量名即可。不要把所有片段都拼进 app.js。

### 4.1 变量是给值起名字

从输入到发请求，标题需要被读取、去空白、交给后面的语句。若每一步都重新找输入框，代码既重复，也难说明正在处理哪一次输入。

```javascript
const title = "阅读内训文档"; // 字符串，表示文字。
let count = 0;             // 数字，后面会重新赋值。
const completed = false;   // 布尔值，只有 true 或 false。

count = count + 1;         // 先算右侧，再把结果赋给左侧。
console.log(title, count, completed); // 在 Console 中输出这些值。
```

`const` 声明不能重新赋值的变量绑定；`let` 用于需要重新赋值的变量。这里的 `=` 是赋值，不是数学中的“左右相等”。注释从 `//` 到本行末尾，不参与执行。

字符串可以使用单引号、双引号或反引号。本文使用的模板字符串可以嵌入表达式：

```javascript
const total = 3;
console.log(`一共有 ${total} 条事项`); // 输出：一共有 3 条事项
```

`${...}` 会把表达式结果放进字符串；只有反引号包围的模板字符串支持这种写法。

如果把需要重新赋值的 count 声明为 const，`count = count + 1` 会报错，后面的语句不再正常执行；反过来，标题只需要在本次提交中读取一次，用 const 能表达“这一轮处理的是这份快照”。模板字符串若误用普通引号，`${total}` 就会原样出现，而不是 3。

### 4.2 数组装一组值，对象描述一个事物

只用一个字符串能表示标题，却不能把后端编号和标题绑定在一起，也装不下多条待办。用对象表示一条、数组表示一组，下一站就有清楚的数据形状。

```javascript
const todo = { id: 1, title: "阅读文档" }; // 对象的属性名与值之间用冒号。
console.log(todo.title);                // 输出：阅读文档

const todos = [todo, { id: 2, title: "认识接口" }];
console.log(todos[0].id);                // 数组下标从 0 开始；输出 1。
console.log(todos.length);               // length 是数组长度；输出 2。
```

`{}` 在这个位置构造对象，`[]` 构造数组；逗号分隔成员。`todo.title` 读取属性，`todos[0]` 读取数组中的第一项。看到 `response.data.items[0].title` 一类表达式时，可以从左到右一层一层拆。

`const` 不等于对象内部完全不能变，例如 `const items = []; items.push("一项");` 可以执行；它限制的是把 `items` 重新赋成另一个值。React 中更新状态又有额外约定，第 10 节会说明。

新增前是 `[]`，新增返回 `{id:1,title:"阅读内训文档"}` 后，前端需要的是包含该对象的数组；不能直接把整个 todos 赋成这个对象，否则后面的遍历会失败。编号是事项身份，下标是它此刻的位置，二者也不能混用。

### 4.3 缺失的值也需要处理

新增失败时，后端可能带回 error；有些错误又没有这项说明。若直接把缺失值显示给用户，他会看到 undefined；若继续取不存在对象的属性，后续代码还可能中断。

`null` 经常表示“明确没有值”，`undefined` 经常出现在属性不存在、函数未返回值等情况。对不存在的值继续读取属性可能报错。

```javascript
const data = { error: "标题不能为空" };
const message = data.error ?? "请求失败";
console.log(message);
```

`??` 在左侧是 `null` 或 `undefined` 时使用右侧。代码里的空字符串 `""`、数字 `0` 和布尔值 `false` 并不会触发这个替代；这与 `||` 的判断规则不同。

对照 `data.error ?? "请求失败"`：有 error 就展示具体原因，没有才用通用文字。用 `||` 替代时，空字符串和数字 0 也会落入后备值；若 0 表示合法的待办数量，就会把真实结果覆盖掉。

### 4.4 条件与比较

输入三个空格并不等于输入了有效待办。发送之前要能把“有内容”和“看似有字符但实际为空白”分成两条处理路线。

```javascript
const title = "   ";

if (title.trim() === "") {
  console.log("请先输入标题");
} else {
  console.log("可以继续");
}
```

`trim()` 是字符串方法，返回去掉两端空白的新字符串。`===` 做严格相等比较，条件成立进入第一组大括号，否则进入 `else`。初学时先明确类型并使用严格比较，减少自动转换带来的困惑。

常见条件符号还有 `!==`（严格不等）、`>`、`<`、`&&`（且）、`||`（或）与 `!`（非）。例如 `!response.ok` 表示“响应的 ok 属性不为真”。

把 `trim()` 删掉后，`"   " === ""` 为 false，前端就会把空白标题发出去；后端仍应拒绝。误写成赋值表达式则是在改变量，不是在检查它。条件判断的后果是选择“发请求”还是“留在输入阶段”，不是改变已保存的数据。

### 4.5 函数接收输入并产生结果

首次读取和新增成功后，都要把同一种待办变成文字。把这项规则到处复制，改编号格式时就容易只改一处。

```javascript
function makeLabel(todo) {        // todo 是参数，调用时才接收具体值。
  return `${todo.id}. ${todo.title}`; // return 交回结果并结束此次调用。
}

const label = makeLabel({ id: 1, title: "阅读文档" });
console.log(label); // 输出：1. 阅读文档
```

定义函数是在说明“以后怎样做”，调用函数才会执行其中的逻辑。`makeLabel` 指向函数，`makeLabel(...)` 是调用，两者不要混淆。

同一个简单逻辑也可能写成箭头函数：

```javascript
const makeLabel = (todo) => `${todo.id}. ${todo.title}`;
```

这里的箭头右侧是表达式，结果直接返回；如果改成大括号函数体，需要自己写 `return`。这里先用它们阅读普通数据处理和回调。

如果 makeLabel 缺少 return，调用得到的是 undefined，即使函数内部计算过文字也没有交回来；如果定义了函数却从未调用，页面不会自动执行它。注册事件时要交出函数本身，下一节会用到这个区别。

### 4.6 遍历、回调与 map

新增第一项时可以手写一行，但读回十项待办后，不能手写十份相同语句。循环负责逐项处理，map 则适合得到一组转换后的结果。

```javascript
const todos = [{ id: 1, title: "阅读文档" }, { id: 2, title: "认识接口" }];

for (const todo of todos) {
  console.log(todo.title); // 每次取一项，执行一次循环体。
}

const titles = todos.map((todo) => todo.title);
console.log(titles); // 得到新数组：["阅读文档", "认识接口"]
```

`map` 接收一个函数，对每项调用它，把每次返回的值组成新数组。传进去的函数在这里叫回调函数。后面看到 `.map((todo) => <li>...</li>)`，仍然是在“把每条数据转换成一项结果”。

把箭头回调改成 `{ todo.title; }` 却忘记 return，map 仍会产生同样长度的新数组，但里面是 undefined，React 列表也就没有预期文字。它与 for 循环里只打印日志不同：map 的返回值正是交给下一步显示的数据。

### 4.7 展开、解构和模块：先学会读

后端返回新事项后，前端要保留旧项并加上新项；页面扩大后，还要复用同一套格式函数。这时会遇到展开、解构和模块，它们都在整理这次交接的数据与代码。

```javascript
const todo = { id: 1, title: "阅读文档" };
const { title } = todo; // 对象解构：取出 title 属性，建立同名变量。
const [first, second] = ["前端", "后端"]; // 数组解构：按位置取值。

const before = [{ id: 1, title: "阅读文档" }];
const after = [...before, { id: 2, title: "认识接口" }];
// ...before 展开旧数组，再与新项一起构成新数组；before 仍然只有一项。
```

`{ title }` 在不同位置可能表示解构，也可能表示对象简写。例如 `const body = { title };` 等同于 `const body = { title: title };`。先看它出现在赋值的哪一侧，再判断作用。

模块可以将功能放在不同文件中。下面两段分别属于两个文件，是**模块阅读示意**：

```javascript
// labels.js：export 把这个函数导出。
export function makeLabel(todo) {
  return todo.title;
}
```

```javascript
// page.js：import 导入另一个文件中按名称导出的函数。
import { makeLabel } from "./labels.js";
```

`export default` 表示默认导出，常见的对应导入不使用花括号；命名导出通常用花括号导入。浏览器直接加载模块时，路径、扩展名和服务是否正确很重要；使用工程工具时，工具还可能处理依赖名和路径。

更完整的语法解释可查 [MDN JavaScript 学习路线](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting)。本文后面的例子会反复使用这些语法，不需要先背完所有名称。

删掉 `...before`，after 就只剩新项，旧待办会从当前页面视图消失；后端未必丢数据，重新 GET 可能又能找回。导入路径写错则在脚本加载阶段失败，提交事件还来不及注册。这两类错误分别位于数据整理与代码取得两站。

## 5. 页面怎样响应用户操作

上一节能处理标题和数组，还没有回答“用户点击时，代码怎样开始执行”。现在把提交事件接到输入框，并试着更新列表；下一节解决页面自己显示了一行，却还没有让后端保存的问题。

### 5.1 DOM 是浏览器里的页面结构

JavaScript 中已经有标题，但给字符串重新赋值，并不会自动修改网页上的输入框或列表。代码需要取得浏览器里的页面节点，才能把数据真正显示出来。

浏览器解析 HTML 后，会建立可以由代码访问的节点结构，称为 DOM（Document Object Model）。HTML 源文件是文本，DOM 是浏览器根据文档构造、并可能在运行中变化的结构。

```javascript
// 阅读片段：假设 HTML 中已有 id="message" 的元素。
const message = document.querySelector("#message");
message.textContent = "页面已经准备好";
```

`document` 表示当前文档，`querySelector` 接收类似 CSS 选择器的字符串，返回第一个匹配元素；找不到时返回 `null`。`textContent` 把内容作为文字处理，不会把 `<script>` 等输入当作 HTML 执行。

若出现“不能读取 null 的属性”，先检查选择器拼写、元素是否存在以及脚本执行时机。本文完整 HTML 使用模块脚本，在文档解析后再访问元素。

在完整示例运行后，于 Console 输入 `document.querySelector("#title")` 应看到输入框节点；改成 `"#not-exist"` 得到 null。可见“选择器找不到”发生在发送 POST 之前，不能靠重启数据库解决。

### 5.2 监听事件，而不是不断询问按钮

有了找到按钮的办法，还不能让新增自动发生。浏览器需要一份“这件事发生时调用哪个函数”的登记，而不是让脚本不停检查鼠标。

```javascript
// 阅读片段：对应前面表单中的“新增”按钮，暂时只观察点击。
const button = document.querySelector("#submit-button");
button.addEventListener("click", () => {
  console.log("用户点击了新增");
});
```

`addEventListener` 注册“事件发生后要做什么”，不是注册时立刻执行回调。`click` 是事件名，箭头函数是事件发生时调用的处理逻辑。

注意 `addEventListener("click", handleClick)` 会传入函数；如果写成 `handleClick()`，则会先调用，再把调用结果传进去，通常不是你希望的行为。

这一小步只确认“点击能触发代码”，Console 出现文字时还没有发 POST。若只监听 click，输入框里的 Enter 可能走另一条表单行为；因此下一小节把真正新增的入口放在 submit 上。

### 5.3 表单有默认提交行为

点击新增与在输入框里按 Enter，都应该产生一次提交；同时，浏览器原生表单可能导航走当前页面。我们既要统一入口，也要留下当前页面来等待 JSON 响应。

```javascript
// 阅读片段：与第 3 节的 HTML 对应，暂时只在页面上显示输入。
const form = document.querySelector("#todo-form");
const input = document.querySelector("#title");
const message = document.querySelector("#message");

form.addEventListener("submit", (event) => {
  event.preventDefault(); // 阻止本次表单按默认方式导航或刷新页面。
  const title = input.value.trim();
  message.textContent = title === "" ? "请先输入标题" : `你输入了：${title}`;
});
```

`event` 是浏览器传给处理函数的事件对象；`input.value` 是输入框当前的值。`条件 ? 值一 : 值二` 是条件表达式，成立取值一，否则取值二。

监听 `submit` 能同时照顾点击提交按钮和按 Enter 的情况。到这里仍没有给后端发送任何内容；页面上的反馈不能说明数据已经保存。

**小实验：提交为何会让页面跳走。** 在第 8 节的本机实验副本中临时删去 `event.preventDefault()`，保存 app.js 后刷新，再新增。观察 Network 中额外的文档请求或地址变化（原生表单可能带上 `?title=...`）：异步处理与导航会竞争，不能保证你还能看见这次 POST 的结果。恢复这一行，再刷新，提交应留在当前页。

### 5.4 数据需要转换成页面元素

新增请求返回一个对象，浏览器并不会自动理解“把它画成一条待办”。需要明确把数组中的每项转换成 li，并在下一次更新前处理旧列表。

```javascript
// 阅读片段：根据数组构造列表，完整版本见第 8 节。
const list = document.querySelector("#todo-list");
const todos = [{ id: 1, title: "阅读文档" }];
list.replaceChildren(); // 清掉旧列表，避免刷新时重复追加。

for (const todo of todos) {
  const item = document.createElement("li");
  item.textContent = `${todo.id}. ${todo.title}`;
  list.append(item);
}
```

“渲染”在这里指根据数据生成或更新界面。数据对象不会自己跑到网页上，需要代码把它转换成 DOM。后面的 React 会用另一种组织方式完成类似的工作。

例如数组只有 1 项，渲染两次仍应该只有 1 个 li；若删 `replaceChildren()`，两次 append 会留下两行，看似重复保存，实际上可能只是重复画了。反过来只改数组不调用渲染，后端与变量都更新了，用户却仍看见旧列表。

## 6. 前后端怎样约定和交换数据

提交事件已经拿到标题，但后端不会直接读到浏览器里的变量。本节约定怎样用 POST、JSON 和状态码交接这条待办，下一节编写真正接收和回应它的程序。

### 6.1 API 是交流入口，接口约定要说清楚

前端发送 text，后端却只读 title，双方代码即使各自能运行，新增仍会失败。先把入口、方法、字段和结果写成共同约定，才能把故障与误解区分开。

API 可以理解为程序提供给其他程序使用的接口。Web API 常通过 HTTP 暴露地址，但“接口”并不只指某个网址：请求方法、数据格式、响应与错误规则也属于约定。

本文的待办服务约定如下：

| 方法与路径 | 客户端发送 | 成功响应 | 本文实现的含义 |
| --- | --- | --- | --- |
| `GET /api/todos` | 无请求体 | `200`，事项数组 | 读取所有待办 |
| `POST /api/todos` | JSON 对象，含字符串 `title` | `201`，新事项对象 | 新增一项 |
| 其他方法访问 `/api/todos` | 不要求 | `405`，含 `error` 的对象 | 这条路由不支持该方法 |
| 不存在的 `/api/...` 路径 | 不要求 | `404`，含 `error` 的对象 | 找不到该 API |

表里的 `/api` 是本文采用的路径习惯，不是浏览器强制要求的目录名。常见的更新、删除接口还会使用 `PATCH`、`PUT`、`DELETE`；本文用读取和新增把流程讲完整，其他操作可以按同样思路继续阅读项目代码。

例如 POST 的请求只有 title，响应才有 id；若前端擅自提交 id，本文后端会把它当未知输入字段拒绝。把 GET 当成新增入口，后端只会返回列表，并不会猜测你想创建一项。

### 6.2 JSON 是文本格式，不是 JavaScript 对象本身

浏览器对象不能原样穿过网络变成 Go 变量；直接把一个对象当字符串，常会得到 [object Object]。两边需要先把同一条待办编码为约定的文本，再在接收端还原。

下面是一份有效 JSON：

```json
{"id":1,"title":"阅读文档"}
```

JSON 用双引号包围属性名与字符串，不支持注释、函数、`undefined` 或末尾多余的逗号。传输中它是文本，进入程序后通常要转换为对应的数据结构。

```javascript
const todo = { id: 1, title: "阅读文档" }; // JavaScript 对象。
const text = JSON.stringify(todo);       // 对象 → JSON 文本。
const decoded = JSON.parse(text);        // JSON 文本 → JavaScript 中的值。
console.log(decoded.title);
```

JavaScript 对象、JSON 文本、Go 结构体、数据库的一行记录可以描述同一件事，但它们是不同位置、不同形式的数据，不能把名称混用。

在 Console 对照 `JSON.stringify({title:"阅读内训文档"})` 与 `String({title:"阅读内训文档"})`：前者得到 JSON，后者得到 `[object Object]`。把后者放进请求体，即使声明 JSON，后端也无法解码。格式说明与实际编码必须同时正确。

### 6.3 请求头与请求体放什么

就算标题已经变成 JSON 文本，后端仍需要知道该用哪种方式读取它。请求头是格式说明，请求体才是实际内容；只改其中一边，接口可能仍然拒绝。

```http
POST /api/todos HTTP/1.1
Host: 127.0.0.1:8090
Content-Type: application/json

{"title":"阅读内训文档"}
```

第一行说明方法和路径；后面是请求头，空行之后是请求体。`Content-Type` 声明请求体的格式，写了这个头并不会自动把任意内容变成 JSON，客户端仍要正确编码。

创建成功时，本文后端返回：

```http
HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8

{"id":1,"title":"阅读内训文档"}
```

编号由后端生成，前端使用响应里的结果。接口文档如果没有说清“编号谁生成、字段可否为空”，两边即使代码都能运行，也可能无法正确协作。

第 8.8 节会发送同一个标题，再去掉 Content-Type 比较：浏览器代码用它声明 JSON，curl 若只带 `--data` 通常声明表单格式，后端返回 415。把头保留、请求体改成无效 JSON，则返回 400；两个错误停在不同的检查点。

### 6.4 常见状态码先认识这些

后端返回了东西，不代表它接受了新增。若把 400 的错误对象也当成新事项追加到列表，页面可能出现 undefined，还会向用户报告错误的成功。

| 状态码 | 常见含义 | 该从哪里继续查 |
| --- | --- | --- |
| 200 | 请求成功 | 查看响应内容是否符合约定 |
| 201 | 创建成功 | 查看返回的新资源 |
| 400 | 请求内容不符合要求 | 字段名、类型、JSON 和校验提示 |
| 401 | 缺少有效的身份认证 | 登录或会话状态 |
| 403 | 服务拒绝当前访问 | 权限规则与账号身份 |
| 404 | 没找到对应资源或路由 | 请求地址和服务路由 |
| 405 | 路由不支持该请求方法 | GET、POST 等是否写错 |
| 415 | 请求体的媒体类型不受支持 | Content-Type 是否正确 |
| 500 | 服务内部处理失败 | 后端日志与处理逻辑 |

这些是常见语义，具体接口还要看它的文档。本文没有实现登录接口，401、403 用于认识其他项目中的常见情况。

不要只测试“有响应”：成功新增应是 `201` 加 `{id,title}`，空白标题应是 `400` 加 `{error}`。若把不同分支都写成 200，前端就难以统一决定进入成功更新还是错误提示；若只看状态不看内容，又可能漏掉字段不符合约定。

### 6.5 fetch 与 async/await 怎样读

请求发出后，网络响应不会立刻出现。如果下一行马上渲染，还没有拿到后端的编号；如果把 HTTP 错误当成断网，又会错过后端已经返回的具体原因。

下面是**阅读片段**，需要在提供 `/api/todos` 的网页环境中调用：

```javascript
async function readTodos() {
  const response = await fetch("/api/todos");
  if (!response.ok) {
    throw new Error(`读取失败：HTTP ${response.status}`);
  }
  const todos = await response.json();
  return todos;
}
```

`fetch` 发起请求并返回 Promise。可以先把 Promise 理解为一个代表异步操作结果的对象：现在不一定完成，稍后可能成功或失败。`async` 函数也会返回 Promise。

`await` 让**当前 async 函数的后续部分**等待结果；浏览器仍可以处理其他事情，不是整台电脑都停止工作。第一处等待取得响应，第二处等待读取响应体并解析 JSON。`return todos` 将结果交给函数的调用者。

`response.ok` 在 HTTP 状态属于 200–299 时为真。服务器返回 404、500 时，`fetch` 通常仍然正常取得响应，需要自己检查；断网、连接失败等情况才会进入另一类请求错误。格式错误的 JSON 也可能在解析时抛错。[MDN：使用 Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)

例如读取响应是 `[{"id":1,"title":"阅读内训文档"}]`：第一次 await 之后拿到的是带 status、headers 的 Response，第二次之后 todos 才在当前函数内成为事项数组。若把第二个 await 删掉，此处 todos 是 Promise，立即读它的 length 不会得到数组长度；但若只是把它 return 出这个 async 函数，外层 `await readTodos()` 仍会等待它完成，所以这份简短读取函数省略这一处 await 也能得到数组。第 8 节的 requestJSON 还要先读取 `data.error`，则需要等解析完成后再使用 data。状态检查也有独立职责：删掉它，400 可能被误当成功数据继续处理。

### 6.6 try、catch、finally 与界面状态

假设新增时禁用了按钮，随后 JSON 解析报错；如果只在成功分支恢复按钮，用户就会永远停在“正在新增”。成功、失败与共同收尾需要分开安排。

```javascript
async function showTodos() {
  try {
    console.log("正在读取");
    const todos = await readTodos(); // 调用上一段函数，等待它的结果。
    console.log("读取成功", todos);
  } catch (error) {
    console.error("读取没有完成", error); // 接住 try 中发生的错误。
  } finally {
    console.log("本次读取已经结束"); // 成功或失败后都执行。
  }
}
```

`throw` 主动抛出错误，`catch` 处理错误，`finally` 适合安排不论成败都要做的收尾。函数定义后仍需调用才会执行，`showTodos()` 才会开始这段读取。上面的阅读片段只打印日志，删掉 finally 中的输出不会改变按钮；第 8 节真正把恢复按钮写在 finally 中，漏掉时才会把 busy 或禁用状态留在旧值。

“空列表”和“失败”交给下一步的含义不同：GET 成功返回 `[]`，可以告诉用户还没有待办；服务器停了而没有读到数据，只能说这次读取失败，不能据此清掉已经显示的事项。

实际界面要分别考虑“正在加载”“没有数据”“成功”“失败”。空数组 `[]` 是一种成功结果，不能把“没有事项”当成网络故障；同样也不能在读取失败时直接显示空列表，让用户误以为数据已经丢失。

## 7. 后端程序究竟在做什么

上一节已经准备好请求格式，现在需要一个持续等待 POST 的接收者。浏览器中的 JavaScript 无法替远端机器保存数据，所以此时才引入 Go：先用最小服务认识入口和处理函数，再在第 8 节接回完整的新增流程。

### 7.1 后端是持续等待请求的程序

一个计算完就退出的程序，不能在用户下一次点击时继续接收标题。我们需要一个保持运行、在指定端口等待请求的进程；这就是现在安装 Go、启动服务的原因。

一般的计算题程序可能读一次输入、输出答案后结束。HTTP 服务启动后会监听地址与端口，收到请求时调用相应的处理函数，返回响应后继续等待下一次请求。

本文使用 Go。先在 [Go 官方安装页](https://go.dev/doc/install) 安装适合自己系统的版本，再重新打开终端，执行：

```bash
go version  # 应显示 go version go...，以及系统和架构信息。
```

主例使用 Go 1.22 或以上版本，建议安装官网当前受支持的版本。如果提示找不到命令，先核对安装和 PATH（终端查找可执行命令的目录列表），不要把 `go` 当作需要在浏览器 Console 输入的 JavaScript。

终端显示启动提示后暂时不返回命令行，是因为服务还在等待，不是编译卡住。按 Ctrl+C 后再次点击新增，会连接失败；只关闭网页并不会停止终端里的服务。生命周期分清以后，刷新与重启就不再是同一个动作。

### 7.2 先看一个最小服务

直接阅读带校验和锁的完整新增接口，很难分清哪些语句在启动程序。先把“接收请求并回应”缩到最小，再把同样的结构用于 /api/todos。

下面是一个**独立的最小完整程序**，帮助你认识入口与处理函数。若要运行，在单独目录保存为 `hello.go`，执行 `go run hello.go`，访问 `http://127.0.0.1:8091/hello`；看完按 Ctrl+C 停止。不要把它与第 8 节的 `main.go` 放在同一个示例目录。

```go
package main // main 包中的 main 函数是可执行程序的入口。

import (
	"fmt"      // 标准库：格式化文字和输出。
	"log"      // 标准库：记录运行信息与错误。
	"net/http" // 标准库：处理 HTTP。
)

func hello(w http.ResponseWriter, r *http.Request) {
	// w 用来写响应；r 中可以读取请求方法、路径等信息。
	fmt.Fprintln(w, "你好，这是后端返回的文字。")
}

func main() {
	mux := http.NewServeMux()     // 创建一个把路径分配给处理函数的路由器。
	mux.HandleFunc("/hello", hello) // 注册函数，不是现在调用 hello()。
	log.Println("请打开 http://127.0.0.1:8091/hello")
	log.Fatal(http.ListenAndServe("127.0.0.1:8091", mux))
}
```

浏览器访问 `/hello` 时，路由器找到 `hello` 函数；函数写出的文字成为响应体。修改文字后要先停止、再重新运行程序，`go run` 本身不提供自动重启。

这个 /hello 仅帮助看见“请求 → 路由 → 响应”，尚未实现 /api/todos，因此不能拿它去响应待办页面。8091 与主例 8090 分开，是为了让独立小程序不抢同一端口。现在可把处理函数内部换成“读标题、保存、写 JSON”，外层入口结构不必重学。

### 7.3 Go 中这些写法怎样拆

上一小节的路由与响应职责已经见过，卡住阅读的可能只是 Go 的拼写。先把它们对应到变量、函数和错误分支，避免把新语法误认为新的业务流程。

| 写法 | 怎样读 |
| --- | --- |
| `package main` | 这份代码属于 main 包 |
| `import (...)` | 使用这些包提供的功能 |
| `func main()` | 定义无参数的入口函数 |
| `mux := ...` | 创建变量，类型由右侧值推断 |
| `title string` | 名为 title 的值，类型为字符串；Go 的类型常写在名称后面 |
| `func name(...)` | 定义函数及其参数 |
| `*http.Request` | 请求对象的指针类型，函数通过它访问请求信息；`*` 在这里不是乘法 |
| `if err != nil` | 判断是否返回了错误；nil 表示这里没有错误值 |
| `return` | 结束当前函数；有返回值时可以把值交回调用者 |

Go 中未使用的导入和局部变量通常会导致编译失败。编译器给出的文件、行号和名称，是定位问题的线索。

上例中的 `log.Fatal` 用于在服务启动或运行返回错误时记录并结束程序；正常监听时，`ListenAndServe` 会持续运行。请求处理函数不能因为某个用户输入有误就随便 `log.Fatal`，否则会让整个服务退出；应向该请求返回适当错误响应。

例如 `mux.HandleFunc("/hello", hello)` 交出处理函数，等请求到达才调用；写成 `hello()` 不是“现在注册”，而是在错误时机调用且参数也不匹配。Go 会在运行前报告此类类型问题，但标题是否为空仍需运行时判断。

### 7.4 结构体、切片与 JSON 字段

请求里的小写 title 到了 Go 中为何变成大写 Title？后端需要自己的数据结构，还要说明它怎样映射回浏览器熟悉的 JSON 字段。

下面是**阅读片段**：

```go
type Todo struct {
	ID    int    `json:"id"`
	Title string `json:"title"`
}

// []Todo 是 Todo 切片，可先理解为一个能按顺序保存多条 Todo 的集合。
todos := []Todo{{ID: 1, Title: "阅读文档"}}
```

`type` 定义类型，`struct` 把一组有名字、类型的字段组合起来。`int` 是整数，`string` 是字符串。`Todo{...}` 按这个类型构造一个值，切片则保存一组这样的值。

Go 导出的字段以大写字母开头。反引号中的 ``json:"title"`` 是结构体标签，告诉 JSON 编解码器使用小写 `title` 作为传输字段名；它不是普通注释，也不是要发给浏览器的 Go 代码。

若删 JSON 标签，默认输出的字段名会变成 ID、Title，前端读取 `todo.title` 就可能得不到值；若把字段写成小写 title，它又不是可导出的字段，编码器不会按期望输出。Go 命名规则与 JSON 命名约定需要通过标签明确连接。

### 7.5 解码、校验、处理、编码

把 JSON 读成功不等于可以保存，例如空标题仍是合法 JSON。后端需要按顺序分开“格式能否读取”和“业务是否允许”，通过后才交给保存与响应。

一个新增接口可以沿着四步阅读：

```text
JSON 文本 {"title":"阅读文档"}
             ↓ 解码
Go 中的输入结构体
             ↓ 校验：类型对吗？标题是否为空？长度是否允许？
生成编号，保存 Todo
             ↓ 编码
JSON 文本 {"id":1,"title":"阅读文档"}
```

输入的结构体只接收标题，输出的结构体还包含编号。把输入和输出分开，能让“谁有权决定哪些字段”更清晰。

标准库的 `encoding/json` 负责转换格式，业务规则仍由自己的代码决定。使用数据库时，在“保存”附近增加数据库操作，但浏览器与后端之间的接口可以继续保持相同格式。[Go HTTP 标准库](https://pkg.go.dev/net/http)、[Go JSON 标准库](https://pkg.go.dev/encoding/json)

例如 `{"title":123}` 在解码到 string 时失败；`{"title":"   "}` 可以解码，但去空白后仍必须拒绝。只有这两关都过了，才生成 id 并保存。将来落库失败也要停在保存这关，不能因为 JSON 读成功就先向前端报 201。

## 8. 贯通一次读取和一次新增

第 7 节认识了接收请求的程序，现在把第 3–6 节的页面、事件和请求全部接上：输入“阅读内训文档”，观察它怎样获得后端编号，再回到列表。先保存四个完整文件，再按各文件后的说明逐段核对；第 9 节会接着追问这次保存能持续多久。

### 8.1 新建自己的示例目录

新增流程涉及浏览器和 Go 两个执行环境，文件混在一起时容易启动错程序或公开不该提供的目录。先固定四个文件的位置，后面的路径就有共同参照。

在 Bash 中执行。已有同名重要目录时换一个名字，不要覆盖现有项目：

```bash
mkdir -p ~/web-basics-demo/web  # web 子目录存放浏览器需要的三个文件。
cd ~/web-basics-demo
go mod init example.com/web-basics-demo # 首次执行，生成 go.mod。
```

`go mod init` 为这个 Go 项目建立模块信息。这里的名称是模块标识，不会创建公网网站，也不要求你拥有这个演示域名。只执行一次即可；已有 go.mod 时不反复初始化。

按下面结构保存四个完整文件：

```text
web-basics-demo/
├── go.mod             由 go mod init 生成
├── main.go            Go 后端与网页文件服务
└── web/
    ├── index.html     浏览器读取的页面
    ├── style.css      页面样式
    └── app.js         浏览器执行的交互代码
```

文件名不是代码内容。编辑器使用纯文本 UTF-8 保存，确认没有变成 `main.go.txt` 或 `index.html.txt`。

`mkdir -p` 建出需要的目录，`cd` 确定后续命令的工作位置，`go mod init` 生成项目说明而不启动服务。若从上一级运行 Go 或把网页放到另一个 web 目录，后端可能启动不了或找不到静态文件；先核对目录，再改 API。

### 8.2 完整文件：web/index.html

先为这次新增准备输入、提交、状态和列表四个位置。文件保留在 web/index.html；下面的 ID 会逐一交给 app.js 查找，拼写必须对应。

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>前后端入门 · 待办清单</title>
    <link rel="stylesheet" href="./style.css">
    <!-- 模块脚本在 HTML 解析完成后执行，可以找到表单和列表。 -->
    <script type="module" src="./app.js"></script>
  </head>
  <body>
    <main class="card">
      <h1>我的待办清单</h1>
      <p>输入一件想做的事，观察浏览器与后端怎样配合。</p>
      <form id="todo-form">
        <label for="title">事项标题</label>
        <div class="input-row">
          <input id="title" name="title" type="text"
                 maxlength="80" required autocomplete="off"
                 placeholder="例如：阅读内训文档">
          <!-- 初始禁用；首次读取成功后由 JavaScript 开启。 -->
          <button id="submit-button" type="submit" disabled>新增</button>
        </div>
      </form>
      <!-- role=status 让辅助阅读工具更容易感知状态更新。 -->
      <p id="message" role="status">正在读取事项……</p>
      <button id="reload-button" type="button">重新读取</button>
      <ul id="todo-list"></ul>
      <p class="note">数据保存在后端内存中；后端重启后会清空。</p>
    </main>
  </body>
</html>
```

**按新增的准备顺序读 HTML。** 并非每行都在“保存数据”，也并非删去每项都会让程序立刻失败：

| 关键行或属性 | 这一次做了什么、为什么写 | 删去或写错后怎样观察 |
| --- | --- | --- |
| `<!doctype html>`、`lang="zh-CN"` | 选择标准文档模式，并说明正文语言 | 语言信息主要影响阅读工具等处理；不是后端校验规则。省略 doctype 可能改变布局模式 |
| `charset="utf-8"` | 说明 HTML 中文文本的编码 | 编码被错误推断时，标题等中文可能乱码；不是 JSON 请求头的替代品 |
| `name="viewport"` | 让移动浏览器按设备宽度安排布局 | 缺少它时，手机可能先按较宽的虚拟画布缩放，480px 的布局条件不一定按预期起作用 |
| 样式 link 与模块 script | 引入相邻 CSS 和 JavaScript；模块脚本等文档解析后再执行 | 路径写错可在 Network 看见失败；删 CSS 主要影响外观，删脚本则没有提交处理 |
| `form id="todo-form"` | 提供统一的 submit 入口，照顾点击和 Enter | ID 拼错时 app.js 无法注册事件；只听按钮 click 不能完整代替表单提交 |
| `label for="title"` 与 `input id="title"` | 标签对应到输入框，脚本也能找到同一个节点 | 改 ID 不改选择器会得到 null；只改 for 则主要失去正确的标签关联 |
| `name="title"`、`maxlength="80"`、`required` | name 供原生表单使用；后两项给浏览器输入约束 | 本例 fetch 的 JSON 字段由脚本决定；删浏览器约束不会删掉后端规则，第 9.3 节会绕过页面验证 |
| `type="submit" disabled` | 将新增作为表单提交；初始化时不让用户抢先操作 | `loadTodos` 成功后脚本才解除禁用；只删 disabled 也不会绕过 app.js 的 ready 判断 |
| `p id="message" role="status"` | 显示过程反馈，并让辅助阅读工具更容易获知变化 | 删 role 不会阻止 POST；删节点却不改脚本，会在更新提示时出错 |
| `button id="reload-button" type="button"` | 单独触发重新读取，供我们确认保存结果 | 它目前在 form 外，删 type 不会凭空新增；若将它移进 form，默认 submit 就可能误触发提交，显式写类型能保留意图 |
| `ul id="todo-list"` | 接收脚本生成的 li；初始为空 | 手写一条 li 只改变初始画面，不代表后端已有记录；删 ul 则无法渲染读回的数据 |

`autocomplete="off"` 和 placeholder 帮助安排输入体验，不参与 title 的业务判断。底部“内存会清空”的说明也不是功能开关；真正决定数据生命周期的是 main.go 中的变量。

### 8.3 完整文件：web/style.css

HTML 已经给出了位置，现在让用户看清正在新增、失败和列表内容。CSS 不改变 POST 或保存结果；它解决的是这些状态能否被准确看见。

```css
/* 盒子宽度包含边框与内边距，便于安排窄屏布局。 */
* { box-sizing: border-box; }

body {
  margin: 0;
  padding: 1rem;
  background: #f4f7fa;
  color: #203247;
  font-family: system-ui, sans-serif;
  line-height: 1.7;
}

.card {
  max-width: 42rem;
  margin: 2rem auto;
  padding: 1.5rem;
  background: white;
  border: 1px solid #d9e2eb;
  border-radius: 1rem;
}

/* flex 让输入框与按钮排成一行，gap 控制间距。 */
.input-row { display: flex; gap: 0.75rem; margin-top: 0.5rem; }
input { flex: 1; min-width: 0; }
input, button { font: inherit; padding: 0.5rem 0.75rem; }
button { cursor: pointer; }
button:disabled { cursor: wait; opacity: 0.6; }
li { padding: 0.35rem 0; overflow-wrap: anywhere; }
#message { min-height: 1.7em; }
#message.error { color: #a61b29; }
.note { color: #526579; font-size: 0.9rem; }

/* 窄屏时改为上下排列，不让输入框被挤得过窄。 */
@media (max-width: 480px) {
  .card { margin: 0.5rem auto; padding: 1rem; }
  .input-row { flex-direction: column; }
}
```

**按一次提交时用户能看见什么读 CSS。** 没有这些样式，浏览器的默认表单仍可以工作；这里的选择是为了让界面稳定、状态容易辨认。

| 关键规则 | 具体解决什么 | 省略后的对比 |
| --- | --- | --- |
| `box-sizing: border-box` | 后面指定宽度时把边框、内边距包含在盒子宽度里 | 换回默认 content-box 后，指定内容宽度再加 padding，实际占用可能比预计宽 |
| body 的 margin、padding、font、line-height | 留出边界并让文字与控件容易阅读 | 删去会回到浏览器默认值，不会改变 POST 内容 |
| card 的 max-width、margin、padding | 宽屏不让输入区无限拉长；左右 auto 居中；内边距避免文字贴边 | max-width 限定上限，不强制手机也占 42rem；样式失败与 API 失败应分开排查 |
| input-row 的 flex、gap 与 input 的 flex | 同一行分配输入框和按钮的空间 | 去掉 flex 后布局规则改变，仍不影响读取 input.value |
| `min-width: 0` | 允许 flex 中的输入框缩小，减少小屏内容把容器撑开的情况 | 这是布局的防护，不是标题长度校验 |
| `button:disabled` | 禁用时改光标和透明度，让用户看见等待状态 | **真正禁用来自 HTML/JS 的 disabled 属性**；只删这条 CSS，按钮仍然不可点 |
| `#message` 的 min-height 与 `.error` | 预留一行提示高度；出错时变色 | 没有 min-height，提示变化时页面可能跳动；没有 error 样式，错误文字仍会更新 |
| li 的 overflow-wrap | 很长且没有空格的标题也能换行 | 不换行时标题可能撑出卡片，但后端保存的字符串没有因此变长 |
| `@media` 窄屏条件 | 可用宽度变小时把输入框与按钮改成上下排列 | 在开发者工具中收窄视口，观察布局变化；去掉此规则再比较，保存接口仍相同 |

因此，“按钮变灰”只是状态的可见反馈，不能单靠 CSS 拦截请求。下面 app.js 会设置 disabled，也会在处理函数内检查 busy；后端则还要独立校验。

### 8.4 完整文件：web/app.js

位置和样式都准备好了，现在真正接住“新增”：取标题、发 POST、等待后端确认，再画出新事项。注意下面的函数定义并不是按从上到下的顺序把所有操作立刻执行一遍。

```javascript
// 这些变量指向当前页面中的 DOM 元素。
const form = document.querySelector("#todo-form");
const input = document.querySelector("#title");
const submitButton = document.querySelector("#submit-button");
const reloadButton = document.querySelector("#reload-button");
const message = document.querySelector("#message");
const list = document.querySelector("#todo-list");

let todos = [];       // 浏览器当前显示的数据副本。
let ready = false;    // 首次读取成功后才允许新增，避免覆盖未知的旧列表。
let busy = false;     // 同一页面上一次只进行一个读取或新增操作。

function showMessage(text, isError = false) {
  message.textContent = text;
  message.classList.toggle("error", isError);
}

function updateButtons() {
  submitButton.disabled = busy || !ready;
  reloadButton.disabled = busy;
}

function renderTodos() {
  list.replaceChildren(); // 清除旧内容，再按当前数组重建列表。
  for (const todo of todos) {
    const item = document.createElement("li");
    // 作为文字显示用户输入，避免将其解释为 HTML。
    item.textContent = `${todo.id}. ${todo.title}`;
    list.append(item);
  }
}

async function requestJSON(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json(); // 本文 API 的成功与错误响应都使用 JSON。
  if (!response.ok) {
    throw new Error(data.error ?? `请求失败：HTTP ${response.status}`);
  }
  return data;
}

async function loadTodos() {
  if (busy) return;
  busy = true;
  updateButtons();
  showMessage("正在读取事项……");
  try {
    todos = await requestJSON("/api/todos");
    ready = true;
    renderTodos();
    showMessage(todos.length === 0 ? "目前没有事项，可以新增第一条。" : "已读取最新事项。");
  } catch (error) {
    // 失败时保留原来显示的数据，不伪装成读取到了空数组。
    showMessage(`读取失败：${error.message}`, true);
  } finally {
    busy = false;
    updateButtons();
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (busy || !ready) return;
  const title = input.value.trim();
  if (title === "") {
    showMessage("请先输入标题。", true);
    return;
  }

  busy = true;
  updateButtons();
  showMessage("正在新增事项……");
  try {
    const created = await requestJSON("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }), // 将对象编码成 JSON 请求体。
    });
    todos = [...todos, created]; // 使用后端实际返回的编号和标题。
    renderTodos();
    input.value = "";
    showMessage(`已新增第 ${created.id} 条事项。`);
    input.focus();
  } catch (error) {
    // 保留输入，方便检查后重试；错误提示不会把它当成已保存事项。
    showMessage(`新增没有确认成功：${error.message}`, true);
  } finally {
    busy = false;
    updateButtons();
  }
});

reloadButton.addEventListener("click", loadTodos);
loadTodos(); // 定义并注册完功能后，首次读取后端数据。
```

**第一遍：先看执行时机。** 文件加载时先找到六个 DOM 节点，建立 todos、ready、busy，登记两个事件，最后调用 loadTodos。函数定义只是在准备处理办法；只有初始化读取、点击“重新读取”或提交表单时，相应函数才开始执行。

**第二遍：分开三份状态。** 如果只记住一个“加载中”，就分不清未读到旧列表和已经可以新增两种情况：

| 变量或状态 | 它在回答什么 | 具体值与后果 |
| --- | --- | --- |
| `todos` | 这一个页面目前知道哪些事项 | 初始 `[]` 不证明后端为空；只有 GET 成功后才知道。它是浏览器副本，不是后端共享内存 |
| `ready` | 是否至少成功读过一次旧列表 | 初始 false，所以先不准新增；GET 成功后改成 true，避免以空数组为基础显示一个缺少旧项的列表 |
| `busy` | 这一个页面是否已有操作尚未收尾 | 发请求前设 true；完成或失败后设 false。它不妨碍另一个标签页或 curl 发请求 |
| 初始、尚未开始 GET | ready=false、busy=false | 新增禁用；随后 loadTodos 会开始读取 |
| 正在 GET 或 POST | busy=true | 两个按钮都禁用；处理函数中的 guard 也会挡住重入 |
| 首次 GET 成功 | ready=true、busy=false | 可以新增；若数组为空，显示“目前没有事项” |
| 首次 GET 失败 | ready=false、busy=false | 可以重试读取，但新增仍禁用；失败不冒充空列表 |
| 后续一次读取失败 | ready 仍为 true | 保留已有数组与画面；恢复按钮，但这些数据只是上次成功得到的副本，不是实时同步 |

`if (busy) return` 和 `if (busy || !ready) return` 是 guard：条件不合适就提前结束函数。注意 busy 在第一处 await **之前**设为 true；await 之后浏览器可以继续处理下一次事件，所以不能等请求回来才设置它。

**第三遍：从状态走到画面。**

| 关键语句 | 输入与输出、为什么这样写 | 删掉或误用的结果 |
| --- | --- | --- |
| `querySelector` | 把 HTML 中对应 ID 的节点交给脚本 | ID 不匹配时得到 null；后面的属性或事件操作会失败，尚未走到 POST |
| showMessage 默认参数 | 正常提示默认不标错；传 true 时添加 error class | 默认参数只解决调用时省略参数的情况，不负责判断服务器是否成功 |
| `message.textContent = text` | 把文字显示到状态区 | 不更新时用户还看见上一阶段的提示；它不会改变 todos |
| `classList.toggle` | true 时添加 class，false 时移除 | 若只添加不移除，下一次成功提示也会保持错误颜色 |
| 新增按钮的 disabled 赋值 | 忙碌或未就绪就不准按新增 | 只设置一次而不在状态变化后调用 updateButtons，会把按钮留在旧状态 |
| `list.replaceChildren()` | 每次按当前数组重建前先清除旧 li | 数组一项却反复渲染，删这行会重复画出多项 |
| `createElement`、`textContent`、`append` | 创建一条 li，把 `1. 阅读内训文档` 当文字放进去，再接到列表 | 只 create 不 append 看不见；把 textContent 换成 innerHTML 会改变输入符号的解释方式，第 9.5 节实测 |

**第四遍：请求如何把后端结果交回调用者。**

1. `requestJSON(url, options = {})` 没收到 options 时使用空对象；GET 因此可以只给 URL。POST 会把 method、headers、body 放进 options。
2. `await fetch(url, options)` 等到 Response；这时 HTTP 400 也属于“收到响应”，不自动等同于抛错。
3. `await response.json()` 读取并解析正文。本文的成功与错误都约定 JSON，所以先解析出 data，再读取 error。它不是任意网站通用的解析器；如果反向代理返回 HTML，解析就会抛错，应去 Network 看真实正文。
4. `if (!response.ok)` 将非 2xx 响应转换成异常，`throw new Error(...)` 让调用者走 catch。`data.error ?? ...` 优先保留后端的具体提示。
5. `return data` 把已解析的对象或数组交给调用者。删 return，后端虽然可能成功，调用处得到的 created 却是 undefined。

**第五遍：loadTodos 为什么先读再允许写。** 它先设 busy、更新按钮并提示读取中；GET 成功后依次替换 todos、设 ready、渲染、提示结果。只有读取成功才替换数组；catch 只改提示，保留原来的画面。finally 无论成功失败都清 busy、更新按钮。若删 finally 的恢复语句，第一次操作结束后仍可能无法继续。

**最后沿 submit 逐句走一次。**

1. `event.preventDefault()` 留在本页等待 JSON，避免原生表单导航与异步请求竞争。
2. guard 拦住尚未就绪或尚未收尾的操作；`input.value.trim()` 得到本次标题快照。比如 `"  阅读内训文档  "` 变成 `"阅读内训文档"`，空白则显示提示并 return，不发 POST。
3. 设 busy 并立即更新按钮，表明这一轮已经开始。它是当前页交互约束，不是全局锁或身份验证。
4. `method: "POST"` 选择创建；Content-Type 声明格式；`JSON.stringify({ title })` 才真正编码对象。三者各做一件事。
5. `await requestJSON(...)` 成功后，created 是后端实际返回的 `{id:1,title:"阅读内训文档"}`，不是前端自己猜出来的编号。
6. `todos = [...todos, created]` 保留旧项并加上新项；renderTodos 才更新画面。删展开会让当前视图只剩新项，删渲染则画面停在旧列表，二者都不必然等于后端丢数据。
7. **确认成功后**才 `input.value = ""` 清输入，并用 focus 让用户方便继续。失败时输入留着，便于检查或重试。focus 是体验选择，删去它不会影响保存。
8. catch 说“没有确认成功”，因为网络断开前后端可能已保存；finally 只结束这次等待，不证明已回滚。遇到不确定情况先重新读取，第 8.8 节会继续解释。

**小实验：禁用按钮与 busy 不是同一层防护。** 本机页面首次 GET 成功后，在 Console 执行下面整段。外层花括号让实验变量限定在这一次代码块内，重复执行时不会因为同名 const 报错：

```javascript
{
  const formForLab = document.querySelector("#todo-form");
  document.querySelector("#title").value = "观察重复提交";
  formForLab.requestSubmit(); // 主动触发表单提交，不必用鼠标点按钮。
  formForLab.requestSubmit(); // 紧接着再提交一次。
}
```

原版应只有一个 POST 和一条新增：第二次事件进入时 busy 已为 true。接着只在实验副本中删去 submit 内的 `if (busy || !ready) return;`，保存、刷新并再次执行整段，应看到两个 POST；即使按钮被禁用，程序仍能主动触发表单提交。试完恢复 guard 并刷新。即便原版挡住了本页重入，curl 仍可发另一条 POST，因此后端还需要下面自己的保护。

### 8.5 完整文件：main.go

app.js 即将把标题送到 /api/todos；这一站要接住 JSON，拒绝错误内容，给有效待办分配编号并保存。返回 201 后，前端才有可靠的 created 对象可以显示。

```go
package main

import (
	"encoding/json"
	"io"
	"log"
	"mime"
	"net/http"
	"strings"
	"sync"
	"time"
	"unicode/utf8"
)

// Todo 是返回给浏览器的数据；JSON 字段名称由标签决定。
type Todo struct {
	ID    int    `json:"id"`
	Title string `json:"title"`
}

// 这些值保存在本进程内存中，服务重启后会重新初始化。
var todos = []Todo{} // 空切片编码为 []，而不是 null。
var nextID = 1
var mu sync.Mutex // HTTP 请求可能并发到来，用锁保护共享数据。

func writeJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Cache-Control", "no-store") // 演示时每次读取当前数据。
	w.WriteHeader(status) // 必须在写响应体前确定状态码。
	if err := json.NewEncoder(w).Encode(data); err != nil {
		log.Printf("写响应失败: %v", err)
	}
}

func listTodos(w http.ResponseWriter, r *http.Request) {
	mu.Lock()
	// 复制一份快照，再释放锁，避免网络写出过程一直占着数据锁。
	snapshot := append([]Todo{}, todos...)
	mu.Unlock()
	writeJSON(w, http.StatusOK, snapshot)
}

func createTodo(w http.ResponseWriter, r *http.Request) {
	// 按媒体类型解析，因此 application/json; charset=utf-8 也能识别。
	mediaType, _, err := mime.ParseMediaType(r.Header.Get("Content-Type"))
	if err != nil || mediaType != "application/json" {
		writeJSON(w, http.StatusUnsupportedMediaType, map[string]string{"error": "请使用 application/json"})
		return
	}
	r.Body = http.MaxBytesReader(w, r.Body, 4096) // 限制这个演示接口的输入大小。
	defer r.Body.Close() // 本函数结束时关闭请求体。

	var input struct {
		Title string `json:"title"` // 只接受客户端提供的标题，不接受客户端指定编号。
	}
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields() // 如把 title 拼成 titlle，明确返回错误。
	if err := decoder.Decode(&input); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "请发送含字符串 title 的 JSON 对象"})
		return
	}
	// 确认请求体只有一个 JSON 值；EOF 表示已经读到末尾。
	if err := decoder.Decode(&struct{}{}); err != io.EOF {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "请求体只能包含一个 JSON 对象"})
		return
	}
	input.Title = strings.TrimSpace(input.Title)
	if input.Title == "" || utf8.RuneCountInString(input.Title) > 80 {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "标题需要为 1–80 个 Unicode 码点"})
		return
	}

	mu.Lock()
	created := Todo{ID: nextID, Title: input.Title}
	nextID++ // 编号增加一，然后把新事项放入切片。
	todos = append(todos, created)
	mu.Unlock()
	log.Printf("已新增事项 id=%d", created.ID)
	writeJSON(w, http.StatusCreated, created)
}

func todosHandler(w http.ResponseWriter, r *http.Request) {
	// 同一路径根据 HTTP 方法分配到不同处理逻辑。
	switch r.Method {
	case http.MethodGet: // 常量的值是 "GET"。
		listTodos(w, r)
	case http.MethodPost:
		createTodo(w, r)
	default:
		w.Header().Set("Allow", "GET, POST")
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "此接口仅支持 GET 和 POST"})
	}
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/api/todos", todosHandler)
	// 未知 API 返回 JSON 错误，不让它落到网页文件服务里。
	mux.HandleFunc("/api/", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "没有这个 API"})
	})
	// 首页、CSS、JavaScript 都从 web 目录提供；不会公开项目根目录的 Go 源码。
	mux.Handle("/", http.FileServer(http.Dir("web")))
	server := &http.Server{
		Addr:              "127.0.0.1:8090", // 只供本机演示，浏览器使用完全相同的地址。
		Handler:           mux,
		ReadHeaderTimeout: 5 * time.Second,
	}
	log.Println("请打开 http://127.0.0.1:8090")
	log.Fatal(server.ListenAndServe())
}
```

先走 `main → todosHandler → createTodo → writeJSON` 这条新增路线；再次读取走 listTodos。下面按真正的执行顺序解释，避免把源码排在前面误读成“会先执行”。

**启动与分派：标题怎样到达处理函数。**

先按任务看 import：net/http 收发请求，encoding/json 转换数据，mime 读格式，io 判断流结束，strings 与 unicode/utf8 校验标题，sync 保护共享值，time 表达时长，log 输出运行线索。它们都是 Go 自带标准库，无需另外安装；不使用的导入仍会让编译失败。

| 关键语句 | 正在解决什么 | 删除或误用后的具体后果 |
| --- | --- | --- |
| `NewServeMux` | 创建按路径分派请求的路由器 | 有处理函数却不登记路由，请求不会自动找到它 |
| 用 HandleFunc 登记 API | 把待办路径交给方法分派函数 | 路径少一个 s，前端仍请求原地址，就会落到未知 API 分支 |
| `/api/` 的后备处理 | 未知 API 返回 JSON 错误 | 没有这项后备时，错误可能由静态文件服务返回为 HTML，前端 JSON 解析失败，原本的“路径拼错”变得难辨认 |
| FileServer 的静态根目录 | 只把 web 目录作为静态文件根，给浏览器三份文件 | 改成 `http.Dir(".")` 会把项目根作为文件服务范围，可能暴露源码；网页可见不要求公开 main.go |
| `Addr`、`Handler`、`ReadHeaderTimeout` | 在 8090 等请求，把请求交给 mux，限制读取请求头的等待时间 | 五秒限制的是请求头，不是“所有业务五秒必定完成”，也不是 4096 字节的正文限制 |
| `ListenAndServe` | 启动并持续等待请求 | 删掉调用就没有 HTTP 服务；启动失败时 log.Fatal 报错并退出，不能在输入校验失败时用它结束整个服务 |
| `switch r.Method` | 同一路径把 GET 交给读取，把 POST 交给新增 | 不分方法就可能让读取误改数据；默认分支设置 Allow 并返回 405，不是猜测客户端意图 |

`mux` 只是这个路由器变量的名字；“路由”在这里是方法和路径到处理函数的分配，不是文件夹。到此，POST 已经进入 createTodo，但还没保存任何内容。

**先过格式关，再过业务关。**

| 关键语句 | 用本次输入解释 | 少写或写错会怎样 |
| --- | --- | --- |
| 读取并解析 Content-Type | 读取声明并拆开媒体类型和参数，`application/json; charset=utf-8` 也能认出 JSON | 直接把整串与 application/json 比较会误拒绝带 charset 的正确请求；只看声明仍不能证明正文是有效 JSON |
| `MaxBytesReader` | 在原正文读取器外加一道 4096 字节限制，后面的 decoder 使用这个受限读取器 | 它限制整个请求体的读取量，不只是 80 个字的业务长度；删掉就失去这道输入体积上限。超限后本例解码/末尾检查分支返回 400，**不会自动生成一个 413 响应** |
| defer 安排 Close | 现在登记清理，等 createTodo 退出时才调用 Close；中途 return 也会执行 | 若在解码前直接 Close，就可能无法再读取。Go 的 HTTP 服务本身也会在处理后关闭请求体，删 defer 不必然立刻泄漏；这里是显式写清清理时机，不应把它讲成“少一行必坏” |
| input 输入结构体 | 只接受字符串标题，不把客户端传来的编号当成保存结果 | 请求与响应职责分开。客户端不能通过自己写 id 来决定本例的编号 |
| `NewDecoder` | 准备从正文流中读 JSON | 它负责格式转换，不替我们判断空白标题能否保存 |
| `DisallowUnknownFields` | `{"title":"阅读内训文档","id":99}` 多了不接受的 id，因此拒绝 | 删此行后未知字段通常被忽略；请求可能变成“客户端以为设置了 id，后端却悄悄没用”，而不是自动实现字段权限 |
| `Decode(&input)` | `&input` 是变量地址，解码器把 title 写入这个结构体；数字 title 无法写入 string 字段 | 不传可写入的目标，解码不能正常完成；只检查 err 还不够，空字符串仍是可解码的数据 |
| 第二次 Decode 与 `io.EOF` | 第一份对象后只允许剩空白并结束。`io.EOF` 表示读到末尾；若还有第二个对象或垃圾，就拒绝 | 一次 Decode 只说明读到一个值，不保证整个请求体只有它；删末尾检查会接受本不属于单个对象的拼接输入 |
| `TrimSpace` | `"  阅读内训文档  "` 统一成保存的标题；`"   "` 变成空串 | 不规范化便可能保存无意义的空白或不一致的标题 |
| 空串判断与码点计数 | 分别拒绝空白和超过 80 个 Unicode 码点的标题 | Go 的 len(string) 数的是字节，中文常占多字节，不能直接当作这里的字数；删空串判断会允许空记录 |
| 每个错误分支后的 `return` | 回应当前错误，立刻结束这次处理 | 只写错误响应不 return，后面可能继续保存，造成“报错了却写入”的矛盾 |

`map[string]string{"error":"..."}` 是键、值均为字符串的映射，编码后就是错误对象；它没有创建另一套接口。MaxBytesReader 与请求体关闭的行为可查 [Go HTTP 标准库](https://pkg.go.dev/net/http#MaxBytesReader)，解码器的单值读取和未知字段规则可查 [Go JSON 解码器](https://pkg.go.dev/encoding/json#Decoder.DisallowUnknownFields)。

HTML maxlength 按 UTF-16 码元计数，Go 此处按 Unicode 码点计数，某些 emoji 在两处的数值会不同。这里明确两道约束各自的计算方式，不把“视觉上一个字”假定为所有程序都相同的计数单位。

**通过检查后，才进入共享数据区。**

1. `var todos = []Todo{}` 建立本进程的事项集合，`nextID = 1` 准备下一个编号。它们在 main 外，所以不同请求访问同一份；服务重启会重新初始化，跟数据库没有自动联系。
2. `var mu sync.Mutex` 声明互斥锁，零值就能使用。一个网页有 busy，不妨碍两个客户端同时 POST；HTTP 处理函数可能并发执行，所以必须在后端保护共享的 nextID 与切片。
3. `mu.Lock()` 后，`created := Todo{ID: nextID, Title: input.Title}` 取得当前编号；`nextID++` 准备后一个编号；`todos = append(todos, created)` 记住追加后返回的切片；最后 Unlock。它们共同组成“取号并保存”这一段，不能只锁其中一个语句。
4. 若没有正确互斥，两个请求都可能先读到 nextID=1，再分别构造 id=1，甚至在切片读写时发生数据竞争；顺序点两次也许看不出问题，不代表它能处理同时到达的请求。删 nextID++ 则更直接：每次都会继续使用同一编号。
5. 锁内不做网络响应写出。后面 listTodos 也先在锁内通过 `append([]Todo{}, todos...)` 复制当时的数据，再 Unlock，把快照交给编码器；否则另一个请求在编码过程中追加，共享读写仍可能冲突。这里的 `todos...` 将已有元素展开，前面的空切片也使空结果稳定编码为 `[]` 而非 null。
6. `mu.Unlock()` 必须与 Lock 配对；在锁内加错误 return 时也不能漏释放。此代码选用短小、直线执行的临界区；换成复杂分支时，可以考虑在合适的函数范围用 defer 安排解锁，但不能不看锁范围就机械替换。

**小实验：漏一次解锁的结果。** 先用原版完成一次新增，确认正常。在副本中只删 createTodo 里的 `mu.Unlock()`（不要删 listTodos 里的），停止并重启。第一条合法 POST 应得到 201，随后执行 `curl --max-time 2 -i http://127.0.0.1:8090/api/todos`：GET 在等待那把没有释放的锁，curl 两秒后超时；`--max-time 2` 是客户端这次等待的总时限。按 Ctrl+C 停服务、恢复该行并重启，GET 才恢复。锁是成对的并发协议，不能把“第一条能新增”当作所有路径正确。

**确认保存，再组织响应。** `writeJSON` 的 `data any` 允许接收事项、数组或错误映射；由编码器转成 JSON。先设置 Content-Type 和 no-store，接着 WriteHeader 设置状态，最后 Encode 写正文。若先写正文再设状态，HTTP 默认可能已经发送 200，后面的 400 或 201 就来不及生效；若省略内容类型，客户端也少了正确的格式说明。

有效输入在保存后才收到 201 与后端创建的对象，浏览器因此取得真实编号。Encode 若因连接中断失败，日志记录的是写出失败，内存中的保存不自动撤销。换成数据库时也要把“确认写入”放在成功响应之前；第 8.6 节开始验证整条路线。

### 8.6 启动并观察结果

文件已经完整，现在验证标题能否穿过所有环节。启动后，按“页面、请求、终端、返回列表”的顺序核对，先确认基线可用，再改代码做实验。

在**包含 main.go 和 web 目录的项目根目录**执行：

```bash
go run .  # . 表示当前模块的程序；第一次编译可能需要稍等。
```

终端应显示打开地址的提示并保持运行。用浏览器访问 `http://127.0.0.1:8090/`，不要双击 index.html：本例需要后端提供页面和 API，`file://` 不是这个服务。

初次页面会显示“目前没有事项，可以新增第一条”。输入“阅读内训文档”后点击新增，应看到 `1. 阅读内训文档`；终端出现新增事项的编号日志。再新增另一条，编号继续增长。

如果提示 `bind: address already in use`，说明 8090 端口已被占用。可以把 main.go 的监听端口改成一个未使用的端口，例如 8092，再停止并重新运行，浏览器地址也相应修改。`fetch("/api/todos")` 使用当前页面的来源，不需要另写端口。

**按同一个标题核对基线。** 页面初次读取应是 GET 200；新增应是 POST 201；再次读取应含刚才返回的 id。然后在终端按 Ctrl+C，保留已经打开的页面，再点“重新读取”：应出现读取失败，旧列表仍在，这只是浏览器保留了上次副本，并非后端仍在运行。重新 go run .、再读取，列表应为空，下一次新增的编号又从 1 开始。

准备后续改动实验时，先停服务，在原目录的同级创建副本。以下目标目录应尚不存在；若已存在，换一个新名字，避免把两份实验混在一起：

```bash
# cp -R 递归复制目录；后续只改这份副本中的文件。
cp -R ~/web-basics-demo ~/web-basics-demo-lab
cd ~/web-basics-demo-lab
go run .
```

原版和副本不能同时占用 8090。每次修改 Go 都要 Ctrl+C 后重新运行；修改网页文件要保存并刷新。用教材中的四份完整文件还原副本，再开始下一项对比，避免把上次删掉的锁或校验带进下次实验。

### 8.7 沿着一次新增追踪四处代码

看到新事项还不够，现在拿同一个标题和编号追踪四处代码。这样以后换成 React 组件或数据库保存，也能知道哪一次交接被替换。

| 顺序 | 看哪里 | 发生什么 |
| --- | --- | --- |
| 1 | app.js 的 submit 处理函数 | 读取并去掉输入两端空白，显示加载状态 |
| 2 | `requestJSON` 中的 fetch | 发出 POST，声明 JSON，携带 title |
| 3 | Go 的 todosHandler 与 createTodo | 选择处理函数，解码、校验、生成编号并保存 |
| 4 | app.js 中的 created、renderTodos | 取得响应，更新浏览器中的数组与列表 |

输入框中的 `title`、JSON 请求体的 `title`、Go 输入结构体的 `Title`、返回对象里的 `title`，描述的是同一个业务字段；它们通过接口约定连接，不是因为变量名相同就自动共享了内存。

给这次操作一个可追踪的值，例如“阅读内训文档”：POST Payload 应只有 title，响应中多出 id，Go 日志也记录这个 id，最终 li 显示相同编号与标题。若四处出现不同字段，回到上一处成功交接的位置，别同时改四份代码。

### 8.8 用另一个客户端理解“后端不依赖这个页面”

刚才通过按钮发出 POST；现在去掉页面，直接从终端发相同请求。如果仍能新增，就能证明业务规则必须放在接收请求的后端，而不能只依赖按钮的限制。

保持 Go 服务运行，在**另一份 Bash 终端**执行：

```bash
curl -i http://127.0.0.1:8090/api/todos

# 反斜杠表示命令续行；整段是同一条 POST 命令。
curl -i http://127.0.0.1:8090/api/todos \
  -H 'Content-Type: application/json' \
  --data '{"title":"从终端新增"}'
```

`-i` 显示响应头，`-H` 增加请求头；`--data` 携带请求体，在这里默认使用 POST。第二条应得到 `201` 和新事项对象。切回浏览器点击“重新读取”，即可看到它。

这也说明只在页面上检查长度、禁用按钮或隐藏功能，不能替代后端校验。curl、另一个页面或其他客户端同样可以发送请求。

如果网络在后端保存后、浏览器收到响应前断开，前端会显示失败或未确认，但后端可能已经保存。遇到这种不确定状态先重新读取；本文没有实现防重复请求的幂等机制（让同一操作的重试不再重复创建记录），连续重试可能创建两条相同标题的事项。

**小实验：让请求分别停在不同检查点。** 保持标准版本运行，把下列命令放在另一终端。命令里的引号包围整个 JSON，反斜杠仍表示续行。

```bash
# title 合法，但请求额外指定 id：未知字段检查应返回 400。
curl -i http://127.0.0.1:8090/api/todos \
  -H 'Content-Type: application/json' \
  --data '{"title":"阅读内训文档","id":99}'

# 相同的合法标题，少了 JSON 格式声明：curl 默认的数据媒体类型不被接受，返回 415。
curl -i http://127.0.0.1:8090/api/todos \
  --data '{"title":"阅读内训文档"}'

# title 是数字：不能解码到 string，返回 400。
curl -i http://127.0.0.1:8090/api/todos \
  -H 'Content-Type: application/json' \
  --data '{"title":123}'

# 第一份对象合法，但请求体里拼了第二份：末尾检查返回 400。
curl -i http://127.0.0.1:8090/api/todos \
  -H 'Content-Type: application/json' \
  --data '{"title":"第一项"}{"title":"第二项"}'
```

再次 GET，以上错误输入不应增加事项。下面每次只改一处副本、重启 Go，再重发对应命令，验证关键语句确实影响哪一个结果：

| 本次临时改动 | 重发哪次请求 | 应看到的差别 |
| --- | --- | --- |
| 注释掉 DisallowUnknownFields | 带额外 id 的第一条 | 变成 201，但编号仍由后端分配，客户端的 99 被忽略，并没有获得“指定编号”功能 |
| 去掉第二次 Decode 的整个 if 分支，并移除只在此处使用的 io 导入 | 两个对象拼接的最后一条 | 只按第一项新增，第二份内容未作为另一条事项处理；不能据此认为一次 POST 支持多个对象 |
| 将 MaxBytesReader 的 4096 临时改为 8 | 正常的 JSON 标题请求 | 正文太长，返回 400；这里看见的是本例的错误处理，不是 Go 自动返回 413 |

恢复这些改动后（末尾检查与 io 导入需一起恢复），还可以比较“请求体体积”和“标题长度”为什么要分开限制。Go 会拒绝未使用的导入，所以这个编译层面的变化也要和业务实验区分开：

```bash
# 两次 printf 组成同一个正文：一个短标题，后面再跟 5000 个合法的 JSON 空白。
# | 把左侧输出交给 curl；--data-binary @- 从标准输入按原样读取正文。
{ printf '{"title":"体积测试"}'; printf '%5000s' ''; } | \
  curl -i http://127.0.0.1:8090/api/todos \
    -H 'Content-Type: application/json' --data-binary @-
```

原版会拒绝，标题却没有超过 80 个码点；临时注释 MaxBytesReader 那一行、重启后，同一输入可变成 201。标题长度规则限制业务值，正文上限限制解码前后要读取的输入量。试完恢复原版，不把实验改动留到后面的章节。

## 9. 数据保存在哪里，规则由谁保证

第 8 节已经把新增送到后端内存，并把确认结果交回页面；还剩“重启后能否再读到、谁有权写入”两个问题。本节把保存推进到落库的位置，随后才能讨论换一种前端写法时，哪些规则必须留在后端。

### 9.1 四种“保存”要区分

刚才刷新仍能读到标题，是否说明已经落库？刷新只重建浏览器页面，并未重启 Go；先分清四个位置的生命周期，再判断哪一步提供了持久保存。

| 位置 | 谁可以访问 | 刷新页面后 | 后端重启后 |
| --- | --- | --- | --- |
| 前端变量，如 app.js 的 todos | 当前页面中的代码 | 通常重新初始化 | 不直接决定这份变量的生命周期 |
| 浏览器 localStorage 等存储 | 对应来源的浏览器环境 | 通常仍在，但可被清除或限制 | 不因后端重启自动消失 |
| 后端内存，如 main.go 的 todos | 当前后端进程 | 服务仍运行时可以重新读到 | 通常丢失，本例会清空 |
| 后端使用的持久化数据库 | 经过授权的服务或数据库客户端 | 通常可重新查询 | 正确持久化后通常仍在 |

“刷新后还在”只说明这次从某个位置恢复了数据，不能据此判断一定使用了数据库。数据库持久化也需要合适的存储配置与备份，不等于任何故障都绝不会丢数据。

**小实验：同样“刷新后还在”，来源却不同。** 使用还原后的本机版本：

1. 新增“阅读内训文档”，刷新，Network 中会再次 GET，事项从仍运行的 Go 内存读回来。不是旧 JavaScript 变量跨刷新保留了下来。
2. 在 Console 执行下面代码，同时做一个浏览器存储对照与一个只改画面的对照：

```javascript
localStorage.setItem("qsc-lab-title", "浏览器本地保存的对照");
document.querySelector("#message").textContent = "这句仅改当前页面";
```

3. 刷新：自己改的提示消失，待办被 GET 重新读回。再在 Console 执行 `localStorage.getItem("qsc-lab-title")`，仍能得到那句对照文字；`setItem` 按键保存字符串，getItem 按同一键读取。
4. 在 Go 终端 Ctrl+C，重新 go run .，再刷新：待办为空，但同一来源下的 localStorage 对照通常还在。它在浏览器里，并未随 Go 重启。最后用 `localStorage.removeItem("qsc-lab-title")` 清理这项实验数据。

这一组比较把三种位置分开了：只改 DOM 会被刷新重建；后端内存跨网页刷新、但不跨服务重启；浏览器本地存储的生命周期又不同。本例 app.js 没有使用 localStorage 保存待办，因此不能拿那条对照数据证明事项已落库。

### 9.2 用数据库时，交互路线怎样变化

重启 Go 会丢掉内存中的待办，所以新增路线还没有抵达“可跨进程重启保留”的终点。数据库要接替保存那一站，而不是让浏览器换一种按钮或直接持有数据库密码。

```text
浏览器发 POST
    ↓
后端校验输入
    ↓
后端执行数据库写入，获得编号或结果
    ↓
后端按接口约定返回 JSON
    ↓
浏览器更新界面
```

对照第 8.5 节，不需要重新设计提交表单或 POST 路径：需要替换的是生成并保存 created 的那一小段，以及 GET 读取切片的部分。

| 当前主例 | 使用数据库时承担同一职责的部分 | 做错的后果 |
| --- | --- | --- |
| nextID 与 Todo 构造 | 写入一行记录，按数据库设计取得唯一编号（主键） | 不同进程各自从 1 取号，会冲突；本进程的 mu 不能替其他进程加锁 |
| append 保存到切片 | 执行写入并检查结果；使用事务时要等提交成功 | 先报 201 再发现写入失败，用户已经看到一条实际不存在的记录 |
| listTodos 中的快照 | 查询已保存的行，整理为相同事项数组 | 只改 POST 不改 GET，新增可能已落库，但刷新仍看不到 |
| writeJSON 成功响应 | 仍返回已确认创建的 id 与 title | 返回对象的格式不必跟数据库内部存储格式完全相同 |

数据库的“表”可以先看作按字段组织的记录集合，“行”是一条待办，“主键”是区分这条记录的标识；具体存储与查询规则交给后续数据库课。这里不添加数据库驱动，也不虚构一段已经可以运行的落库代码。

这里的“事务”把相关数据库操作组织成一个整体；“提交”是请求数据库确认这一组改动，具体规则在数据库课展开。设想数据库连接暂时失败：正确路线是在保存这站停下，返回合适的错误响应，前端保留输入；不是先把 POST 当成功，再让刷新时的 GET 暴露丢失。即使数据库写入成功，响应途中断开仍可能让客户端“不确定”，第 8.8 节的重新读取与重复提交问题依旧存在。

数据库连接凭据由后端管理。若把它写进 app.js，浏览器为取得页面会下载这份文件，使用者也就能读到；文件改个冷门名字并不能隐藏。浏览器通过业务 API 使用数据，后端在这个入口执行规则。

SQL 是关系型数据库中常用的查询语言，ORM（对象关系映射）则是把程序数据结构与数据库操作联系起来的一类工具；这些名称会在数据访问代码中出现。SQL、表、主键、查询与 ORM 可以继续读 [数据库、MySQL 与 Prisma](backend-database-mysql-prisma.md)。ORM 帮助组织数据库操作，仍需要理解实际保存的数据和查询条件；它不负责把整个网页自动变成后端。

### 9.3 前端检查改善体验，后端保证规则

用户可以绕过输入框直接 POST，第 8.8 节已经证实这一点。现在把空白标题送进去，比较“页面不让提交”与“后端不准写入”究竟保护了哪一层。

浏览器可以及时提示标题为空，省去一次无意义请求。后端还要再次检查字段类型、长度和权限，因为请求内容来自服务外部，不能只相信页面已经做过检查。

本文后端还用了锁保护编号和切片，因为不同客户端可能同时新增。前端的 `busy` 只是当前页面的交互控制，无法阻止其他请求同时到达后端。

完整示例是本机教学服务：数据量、身份区分和存储方案都保持简单。把它扩展成多人系统时，还需要设计数据归属、并发与容量、持久化、运行监控等问题。

**小实验：保留前端检查，单独拿掉后端的一条规则。**

先在页面输入三个空格并新增：app.js 去空白后显示提示，Network 不应出现这次 POST。然后绕过页面，在另一终端执行：

```bash
curl -i http://127.0.0.1:8090/api/todos \
  -H 'Content-Type: application/json' \
  --data '{"title":"   "}'
```

原版仍返回 400，GET 不会多一项。现在只把 Go 中的 `if input.Title == "" || utf8.RuneCountInString(input.Title) > 80 {` 临时改成 `if utf8.RuneCountInString(input.Title) > 80 {`，即只去掉空标题判断，保留长度判断和对应导入。重启副本后重发同一条 curl，应得到 201 和空 title；页面里的 JavaScript 完全没改，却挡不住这条写入。

这就是两层检查的后果差别：前端让正常用户及时知道输入问题，后端才让所有客户端遵守保存规则。恢复空串判断并重启，实验中的临时内存数据也随之清空。

### 9.4 登录与权限分别回答两个问题

本机示例的所有客户端共享待办；如果它成为多人产品，知道 title 合法仍不够，还要知道这条记录应属于谁、当前请求能否操作它。

认证回答“你是谁”，授权回答“你能做什么”。例如，确认某个账号已经登录，并不代表它能删除其他人的待办。这里新增的“身份”并非 title 的一个字段，而是后端需要另行验证、用于判断记录归属的信息。

项目可能通过 Cookie 携带会话标识，也可能通过请求头携带令牌。Cookie 是浏览器保存并按规则发送的一种数据，Session 通常指服务端维护的会话状态，Token 则是一类用于表明某种身份或权限的信息；它们不能简单当作同义词。

凭据放在哪里、何时发送、怎样过期，以及怎样防御 CSRF、XSS，需要结合认证方案设计。CSRF 指诱使浏览器向目标站发出带身份信息的非预期请求；XSS 指把不可信内容解释成页面脚本，第 9.5 节用渲染对比说明它的入口。本文先认识它们在请求中的位置，不搭建一套登录系统。看到 `Authorization`、`Cookie`、`401`、`403` 时，应回到接口文档与身份、权限规则检查。

**小实验：当前接口并没有登录认证。** 保持本机服务运行，先执行 `curl -i http://127.0.0.1:8090/api/todos`，再执行 `curl -i -H 'Authorization: Bearer demo' http://127.0.0.1:8090/api/todos`。两次都应得到 200 和同一列表；demo 是随意的示例文字，本例根本没有读取这个头。加一个“像令牌”的字符串不会自动建立认证；第 12.4 节再比较它与 CORS 的职责。线上版的浏览器清单隔离也只是临时会话隔离，不等于注册、登录与权限系统。

### 9.5 用户输入要作为数据处理

标题最终会从后端回到页面，将来也可能进入数据库查询。如果把标题里的符号当成 HTML 或查询语句的一部分，同一份输入就可能改变原本的处理结构。

示例使用 `textContent` 显示标题，即使标题里含 `<b>`，也会按文字显示。直接把外部输入拼进 `innerHTML`，可能让它被解释为页面代码。

数据库查询同样应使用参数化方式，不把用户输入拼成 SQL。前端文件和浏览器网络请求通常能被使用者查看，真实密钥、数据库密码不应依靠“文件不显眼”来隐藏。它们应按服务的配置与权限方案管理。

**小实验：同一标题是文字还是页面结构。** 在本机输入 `<b>阅读内训文档</b>` 并新增，原版会完整显示尖括号。只在实验副本中把 `item.textContent = ...` 那一行的 textContent 改成 innerHTML，保存、刷新：同一个后端标题会被解释为 HTML，b 标签成为加粗结构，尖括号不再按原样显示。没有改 POST，也没有改存储，变化发生在渲染这一步。试完立即恢复 textContent。

本实验只用无害的 b 标签，但它展示了信任边界：外部文字若能参与构造页面结构，更复杂的内容就可能成为脚本注入问题（XSS）。SQL 同理：标题若是 `小王's 清单`，把它直接拼进用单引号包围值的语句，会打断你原本的文本边界；参数化查询让输入作为参数值交给数据库处理。本文没有数据库，因此不声称这段 SQL 路线已经实测完成。

## 10. 从原生页面过渡到 React 与 TypeScript

保存路线和责任已经清楚，再看同一次新增怎样换一种前端组织方式：页面变大后，手动更新多处 DOM、记住字段拼写会越来越费力。本节用组件、状态和类型解决这些维护问题，第 11 节再说明这些源码由谁处理、放到哪里；POST 和落库责任仍不变。

这一节以**阅读框架代码**为目标。React 片段需要放进已经配置好的 React 工程，不能直接替换第 8 节浏览器加载的 app.js。后面的工程工具一节会说明这些文件怎样变成浏览器能执行的代码；课程讲义见 [React 学习资料](frontend-react.md)。

### 10.1 React 组件把界面组织成函数

原生 renderTodos 已经能画列表，但页面中出现多处待办列表时，就容易重复写 DOM 操作。组件接收同样的数组并描述一块界面，把这段规则收在一起。

React 是用于构建用户界面的库。可以先把组件理解为“根据输入数据，描述一块界面的函数”。下面是一个**组件阅读片段**：

```jsx
function TodoList({ items }) {
  return (
    <ul>
      {items.map((todo) => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  );
}
```

`TodoList` 是组件名称，按约定以大写字母开头。`{ items }` 从参数对象中取出 items，外面传入的参数称为 props。调用它的界面代码可能写成 `<TodoList items={todos} />`。

看起来像 HTML 的部分叫 JSX，是 JavaScript 的语法扩展。花括号 `{...}` 中放 JavaScript 表达式，例如 `todo.title`；`map` 为每条事项返回一个列表元素。`key` 帮助 React 识别列表项目，应该选择在同一列表中稳定且唯一的标识。

JSX 中常见 `className` 而不是 HTML 的 `class`，事件常写成 `onClick={handleClick}`；标签需要正确闭合。JSX 需要相应工具处理，不能仅把文件改名为 `.jsx` 就让普通 script 标签自动理解它。[React 官方入门](https://react.dev/learn)

例如 items 有两项，就返回两条 li；items 换成空数组，就描述空列表。漏写 key 会出现开发提示，使用随位置变化的下标还可能在插入、删除时让项目身份对应错误；稳定的后端 id 更适合。组件只管把接到的数据描述为界面，没有在这里发请求或落库。

### 10.2 state 改变后，React 再描述界面

一次新增成功会改变 todos，但普通变量变化不会自动通知 React 重画。先把“数据变了、界面跟着变”缩成一个数值演示，再对应回新增后的数组状态。

下面是一个**独立组件片段**，用 count 代替待办数组，只隔离观察状态更新。它不是待办的另一个实现，也不会保存数据；实际新增要在 POST 成功后调用对应的 setTodos：

```jsx
import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount((current) => current + 1)}>
      已点击 {count} 次
    </button>
  );
}
```

`useState(0)` 给组件建立一份初始为 0 的状态；返回值通过数组解构取出当前 count 和更新函数 setCount。点击时调用更新函数，React 会据此重新渲染。

`current => current + 1` 表示根据前一个状态计算新状态。直接修改普通变量不能替代状态更新；同样，直接 `todos.push(...)` 而不通过状态更新函数，也不会按预期通知 React。

前面的原生版本需要自己调用 `renderTodos` 操作 DOM；React 版本通常通过改变 state，让 React 根据新的数据更新界面。前后端传输的 HTTP 和 JSON 并没有因此改变。

对回主线：原生版是 `todos = [...todos, created]` 后显式调用 renderTodos；React 中则通过 `setTodos(current => [...current, created])` 交出新数组，触发相应渲染。这里的 created 仍必须来自成功的 POST。若只在点击时把 count 加一，最多证明页面状态变了，不能证明服务器保存了待办。

### 10.3 props 与 state 分别从哪里来

若表单和列表各自保存一份待办，新增加进表单那份，列表就可能仍显示旧数据。需要确定谁保管数据、谁只负责显示，才能让同一条新增结果流到正确组件。

props 由外部组件传入；state 是组件自身管理的状态。一个组件的 state 可以作为另一个组件的 props，因此同一个值在不同位置会有不同角色。

```text
App 的 todos 状态
       ↓ 作为 items 属性传下去
<TodoList items={todos} />
       ↓
TodoList 读取 props.items，描述列表
```

子组件通常通过回调请求父组件改变状态，避免直接修改传入的数据。页面需要共享数据时，可以把状态放在合适的共同父组件中；这就是阅读项目时经常看到的“状态提升”。

以新增为例，App 等待 POST 后更新自己的 todos，再把它作为 items 传给列表；列表收到新 props 才能显示。若子组件偷偷修改 props，负责保存状态的一方不知道发生过更新，其他组件也可能继续用旧值。状态归属与后端数据归属都需要明确，二者不是同一种“保存”。

### 10.4 读取同一个 API 的 React 示例

前面只看组件内部，现在从 GET 读回一条新增过的待办，走完“HTTP → 状态 → 列表”。这段仍是同一条数据流的返回半程，不另建业务或更换 API。

下面是一个**React 工程中的完整 App.jsx 阅读示例**，包含 TodoList，只演示首次读取。它不是第 8 节完整演示的另一个启动方式，也不包含新增表单。

```jsx
import { useEffect, useState } from "react";

function TodoList({ items }) {
  return <ul>{items.map((todo) => <li key={todo.id}>{todo.title}</li>)}</ul>;
}

export default function App() {
  const [todos, setTodos] = useState([]);
  const [message, setMessage] = useState("正在读取事项……");

  useEffect(() => {
    let ignore = false; // 清理后，不再用这次旧请求的结果更新组件。

    async function load() {
      try {
        const response = await fetch("/api/todos");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const items = await response.json();
        if (!ignore) {
          setTodos(items);
          setMessage(items.length === 0 ? "目前没有事项。" : "读取完成。");
        }
      } catch (error) {
        if (!ignore) setMessage(`读取失败：${error.message}`);
      }
    }

    load();
    return () => { ignore = true; }; // 组件移除等情况下执行清理。
  }, []);

  return (
    <main>
      <h1>我的待办清单</h1>
      <p role="status">{message}</p>
      <TodoList items={todos} />
    </main>
  );
}
```

`useEffect` 用来把组件与外部系统同步，这里在组件加入界面后读取网络数据。最后的 `[]` 是依赖数组，表示这段逻辑没有会随渲染变化、需要重新同步的响应式依赖；不要在引入其他变量后仍机械照抄空数组。

返回的清理函数让旧的异步结果不再更新组件。它没有撤销已经发出的 HTTP 请求；如果需要取消请求，还要使用 AbortController（浏览器提供的取消控制 API）等机制。

StrictMode 是 React 提供的开发期检查组件；工程开启它时，可能看到额外的建立与清理过程，以及额外的读取请求，这用于帮助发现清理问题。不要把“只运行一次”当作所有环境下的保证，也不要随意把新增 POST 放进首次读取的 Effect。更大的项目常使用框架或请求库管理读取、缓存与状态。[React：useEffect 与数据读取](https://react.dev/reference/react/useEffect#fetching-data-with-effects)

这段代码仍然访问当前页面来源的 `/api/todos`。若 React 开发服务器运行在 5173 端口、Go 在 8090，5173 上需要配置 API 转发，或明确设计跨域访问；否则相对地址不会自动找到另一个端口。第 12 节会解释这个问题。

逐段接回主线：`useState([])` 提供首次显示的数据；load 发 GET；`response.json()` 取得后端数组；setTodos 把它交给下一次渲染；TodoList 接到新 items 后描述列表。删 setTodos，即使 Network 中 GET 返回了刚新增的事项，页面仍停在空列表。若在组件函数主体中直接每次 fetch、随后更新状态，重新渲染又可能反复触发读取。Effect 把这类同步安排到明确位置；ignore 让过期的结果不覆盖新的界面。

### 10.5 TypeScript 给数据加上可检查的类型

后端明明返回 title，组件却误写成 titlle，可能直到页面显示空白才发现。TypeScript 把约定变成开发时可检查的结构，但不能代替后端或网络边界的校验。

下面是**TypeScript 阅读片段**：

```typescript
type Todo = {
  id: number;
  title: string;
};

function makeLabel(todo: Todo): string {
  return `${todo.id}. ${todo.title}`;
}

const todo: Todo = { id: 1, title: "阅读文档" };
console.log(makeLabel(todo));
```

`type` 描述一种类型，`todo: Todo` 限定参数应符合该结构，参数列表后的 `: string` 表示返回值类型。把 id 写成普通字符串时，类型检查工具就有机会提示问题。

同样的 TodoList 组件可以写成下面的 **TSX 阅读片段**。它是前面组件的另一种写法，不要在同一文件中重复定义同名函数：

```tsx
type Todo = { id: number; title: string };
type TodoListProps = { items: Todo[] }; // Todo[] 表示 Todo 数组。

function TodoList({ items }: TodoListProps) {
  return <ul>{items.map((todo) => <li key={todo.id}>{todo.title}</li>)}</ul>;
}
```

看到 `useState<Todo[]>([])` 时，可以读成“这份状态保存 Todo 数组，初始值为空数组”。看到 `title?: string`，问号表示该属性可以缺省，使用前要考虑它没有值的情况。

TypeScript 的类型信息通常在转换为 JavaScript 时移除。给网络响应写一个类型，或者使用 `as Todo[]`，不会自动检查真实服务器返回的每个字段；需要运行时校验时，应明确验证数据。普通浏览器也不会因为文件名是 `.ts` 就自动完成类型检查。[TypeScript：常用类型](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)

**对照实验：类型约定与网络真实数据。** 如果正在阅读一个已有的 TypeScript 工程，把上面已声明为 Todo 的 id 从 1 改成字符串 `"1"`，该工程的类型检查应提示不匹配；这解决的是你编写源码时偏离约定的问题，不要求为本机主例安装一套新工程。

下面这组在本机待办页面的 Console 就能运行，不依赖 TypeScript 工具：

```javascript
{
  const fromWire = JSON.parse('{"id":"1","title":123}');
  console.log(typeof fromWire.id, typeof fromWire.title); // string number
  console.log(
    typeof fromWire.id === "number" && typeof fromWire.title === "string"
  ); // false：真实数据没有符合约定。
}
```

`typeof` 返回值的实际类型名称。合法 JSON 仍可带来错误字段类型，浏览器不会因为我们在另一份源码里声明过 Todo 就改写响应。`as Todo` 是让类型检查器按该类型看待值，不是转换 id，也不是执行以上运行时判断；误把断言当验证，问题仍会等到显示或计算时出现。

## 11. 读懂框架和项目目录

上一节的 JSX、TSX 不能原样交给普通浏览器，处理请求和保存数据的代码也可能已拆成多个文件。本节沿同一次新增找到工具、入口、处理函数与数据访问层，下一节检查这些部分连起来后，请求究竟有没有走对。

### 11.1 语言、运行环境、库、框架、工具各是什么

看到 React、Vite、Node.js 都出现在前端目录里，很容易以为它们都是接收新增的后端。按执行位置和输入输出分类，才能知道哪个进程真的保存待办。

| 名称 | 先怎样理解 | 与本文的关系 |
| --- | --- | --- |
| JavaScript、Go | 编程语言 | 用语法表达数据和处理逻辑 |
| TypeScript | 加入类型系统等能力的 JavaScript 扩展 | 帮助阅读和检查前端工程代码 |
| 浏览器、Node.js | 不同的 JavaScript 运行环境 | 浏览器运行页面代码，Node.js 常运行工程工具，也可用于后端 |
| React | 构建用户界面的库 | 用组件和状态组织页面 |
| Gin | Go 的 Web 框架 | 提供路由、中间件、输入绑定与响应等组织方式 |
| Vite | 前端开发与构建工具 | 提供开发服务器，并处理工程中的模块与资源 |
| npm | Node.js 生态的包管理和脚本工具 | 安装依赖、运行 package.json 中定义的脚本 |
| Go Modules | Go 的模块与依赖管理机制 | 用 go.mod 等文件记录模块与依赖 |

工具提供了默认结构和常用能力，但数据仍要按具体项目的规则流动。读陌生工程时，先找“入口在哪、路由在哪、请求发往哪里、处理结果交给谁”，比先背完所有工具名更有效。

例如本例终端运行 go，保存待办的是 Go 进程；另一个工程的 npm run dev 可能只在 Node.js 中启动 Vite，为浏览器提供页面。看到 Node.js 就认定“后端已经启动”，会把请求发给没有保存接口的开发服务。判断时仍看实际脚本和路由。

### 11.2 用 Gin 对照标准库处理函数

新增业务变大后，每个接口都重复写路由、JSON 和错误处理会增加维护成本。先用相同的读取路径对照 Gin 封装了哪部分，再辨认真实项目中的新增处理函数。

下面是一个**独立 Gin 程序的阅读示例**，只展示读取接口。它不包含第 8 节的网页服务和新增接口，不能直接覆盖那份 main.go 当作完整替代品。

```go
package main

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default() // 创建路由器，带常用的日志与恢复中间件。
	router.GET("/api/todos", func(c *gin.Context) {
		// c 提供当前请求的上下文；JSON 方法同时设置状态与响应内容。
		c.JSON(http.StatusOK, []gin.H{
			{"id": 1, "title": "阅读文档"},
		})
	})
	log.Fatal(router.Run("127.0.0.1:8093"))
}
```

`router.GET` 把 GET 方法和路径绑定到处理函数；`c` 帮助读取请求、写响应；`gin.H` 是 Gin 为 `map[string]any` 提供的简便名称，`[]gin.H` 是一组这样的映射。

与标准库版本对照，可以看到相同职责仍然存在：路由分配、处理数据、编码 JSON、设置状态码。框架把一些常见步骤封装成方法，没有让 HTTP 本身消失。

若要运行这份扩展示例，请新建独立目录、按 [Gin 官方入门](https://gin-gonic.com/en/docs/quickstart/) 的当前要求安装 Go、初始化模块并添加 Gin 依赖，再保存 main.go。它的依赖要求与只用标准库的主例不同，按官方文档核对版本；阅读本文主例无需完成这套安装。

例如 c.JSON 在这里替你设置 JSON 响应，但不会替你检查“标题必须非空”或把记录写入数据库。若新增处理函数直接把收到的值返回，框架能帮你成功发出 JSON，却不能证明发生了保存；继续查业务与数据访问代码。

### 11.3 中间件位于处理流程的什么地方

如果十个写入接口都要检查登录，逐个复制检查很容易漏掉一个。中间件把共同的前置或收尾逻辑放在请求必经的位置，业务处理函数仍负责具体保存。

可以先把中间件理解为围绕请求处理过程组织的公共逻辑，例如记录日志、检查认证信息、恢复部分运行错误：

```text
请求 → 日志记录 → 身份检查（如项目配置） → 业务处理函数
                                              ↓
响应 ← 记录状态与耗时 ←────────────────────── 返回结果
```

某个中间件也可能提前结束流程，例如认证失败就返回响应，不再调用后面的业务函数。Gin 默认提供的日志与恢复功能不会自动替你的应用实现身份认证、权限规则和输入校验。

例如身份检查失败应提前返回 401，新增处理函数就不应继续落库；日志中间件只记录耗时，不会因为它存在就拒绝匿名访问。给一条路由装了认证、另一条漏装，后者仍可能接受请求，因此要查这次 POST 实际经过的链。

### 11.4 在目录里找到职责

一次新增已经同时涉及组件、请求、校验和数据保存，全部塞在一个文件里越来越难找。下面把相同职责展开到常见目录，按请求路线找文件，而不是照着目录名重新搭一套主例。

下面是一个**示意目录**，不是要为本文重新创建的完整工程：

```text
project/
├── frontend/
│   ├── package.json       前端依赖与脚本
│   ├── package-lock.json  锁定 npm 依赖解析结果
│   ├── src/
│   │   ├── main.tsx       把应用接到网页上的入口
│   │   ├── App.tsx        组织主要界面
│   │   ├── components/    可复用界面组件
│   │   └── api/           封装请求后端的代码
│   └── dist/              某些工程的构建产物目录
└── backend/
    ├── go.mod             Go 模块与依赖
    ├── go.sum             依赖内容校验信息
    ├── main.go            后端入口
    ├── handlers/          接口处理
    ├── services/          业务规则
    └── repositories/      数据访问（项目采用这层结构时）
```

目录名称是团队的组织约定，不是所有框架强制要求的标准。小项目完全可以先把逻辑写在较少文件中；规模增大后再按职责拆分。框架项目也可能有不同的入口和构建目录，应以它的 README 和配置为准。

拿“新增”沿目录走一遍：App.tsx 接住表单 → api/ 组织 POST → backend/main.go 注册路由 → handlers/ 解码请求 → services/ 判断业务规则 → repositories/ 执行保存，再原路返回 id 和 title。这是本节目录的阅读方法，不是框架自动替你连好的流水线。把一个函数移进 repositories/，不会自动获得数据库持久化。

### 11.5 package.json 中的命令从哪里来

找到 App.tsx 后，双击文件仍不能启动新增页面，因为浏览器不直接处理这些工程源码。项目脚本告诉工具怎样转换和运行；命令名称本身并不保证做了哪些事。

下面是**配置片段**，不是一份包含所有依赖的可运行工程：

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build"
  }
}
```

`npm run dev` 的含义由 scripts.dev 决定，这里启动 Vite；`npm run build` 先运行类型检查/构建相关的 tsc 命令，再执行 Vite 构建。其他项目可以把这些名字配置成不同操作，所以应先读脚本。

拿到一个已有 npm 工程时，按它的 README 安装支持的 Node.js 和依赖。在存在且同步维护 package-lock.json 的工程中，`npm ci` 常用于按锁文件安装；只有 package.json、没有锁文件的项目需要按其说明处理，不能盲目套用同一命令。

主例中的 `go run .` 运行 Go 程序，前端工程中的 `npm run dev` 运行脚本工具。它们打开的终端、目录、端口和日志都要分别看清楚。

这里 tsc 是 TypeScript 的命令行工具，`-b` 读取工程的 TypeScript 项目配置（常见文件为 tsconfig.json，由对应工程模板或维护者提供）；`&&` 表示前一项成功才继续，类型检查失败时不会接着执行后面的 Vite 构建。本机主例没有这些配置，也不需要创建。若站在 backend 目录执行前端脚本，文件和命令自然对不上。

## 12. 前后端联调与基础排错

现在“新增”可能跨越组件、开发服务器、路由和保存逻辑，任何一站出错都可能表现为列表没变化。本节用同一次操作的请求和响应定位断点；确认本机全程走通后，第 13 节再把这条路线搬到服务器。

### 12.1 先把一次请求记录下来

列表没增加时，先不要同时修改前后端。用固定标题发一次新增，记录浏览器实际发出的地址、内容和响应，才能知道当前断在哪一站。

用浏览器开发者工具观察第 8 节的完整示例。通常可以通过菜单打开开发者工具；许多浏览器支持 F12，macOS 常见快捷键为 Command+Option+I。

1. 打开 Network 面板，选择 Fetch/XHR 或查看全部请求。
2. 刷新页面，找到 `/api/todos` 的 GET。
3. 查看 Request URL、Request Method、Status Code，以及 Response 中的 `[]` 或事项数组。
4. 输入一个标题并新增，找到对应 POST。
5. 在 Payload 中看 title，在 Response 中看后端返回的 id 和 title。

不同浏览器的栏目名称略有区别，但要找的信息相同。对照 Go 终端的新增编号日志，就能把浏览器看到的结果与后端处理联系起来。

预期证据应连成一条线：POST 的 title 是“阅读内训文档” → 201 的 id 比之前增加 → 页面显示该 id → 再次 GET 含这条记录。若 POST 为 400，就停在后端输入检查；若 201 正常但 li 没变，才继续查浏览器中的更新与渲染。

### 12.2 三处信息分别回答什么

只盯 Console，可能漏掉后端已返回的 400；只看“服务启动成功”，又无法判断保存有没有发生。三处信息要围绕刚才同一次 POST 对齐。

| 工具位置 | 重点观察 | 常见线索 |
| --- | --- | --- |
| Console | 浏览器脚本是否正常执行 | 语法错误、空 DOM 元素、主动输出的调试信息 |
| Network | 请求实际发往哪里、收到了什么 | 地址、方法、请求体、状态码、响应格式 |
| 后端终端/日志 | 服务收到请求后怎样处理 | 启动错误、业务处理、数据库错误、异常信息 |

Console 没有错误，不代表后端写入成功；服务正常启动，也不代表某条 API 已经实现。最有用的证据是同一次操作的请求与响应，加上相应的代码和日志。

例如 POST 201、Go 日志出现对应 id，而页面报错，则先查响应解析和渲染；如果 Network 根本没有 POST，先查事件和前端校验。跳过中间证据直接重装依赖，既没有修复明确问题，也会引入新的变化。

### 12.3 同源与跨域怎样判断

前端和 Go 单独启动后，即使都在自己的电脑上，浏览器也可能不允许脚本读返回值。先比较协议、主机和端口，再判断新增是否跨了浏览器规定的来源边界。

浏览器讨论来源时，主要比较协议、主机和端口。下面几个例子以 `http://127.0.0.1:8090/` 为页面地址：

| 目标 | 是否同源 | 原因 |
| --- | --- | --- |
| `http://127.0.0.1:8090/api/todos` | 是 | 只是路径不同 |
| `http://127.0.0.1:5173/api/todos` | 否 | 端口不同 |
| `http://localhost:8090/api/todos` | 否 | 主机名不同，即使都指向本机 |
| `https://127.0.0.1:8090/api/todos` | 否 | 协议不同，也不代表这里实际提供了 HTTPS |

主例由 Go 在同一个来源提供网页和 API，因此前端使用 `/api/todos` 就能找到后端。前后端代码放在不同文件里，不会自动造成跨域；URL 的来源才是这里的判断依据。

“目录分开”和“来源不同”互不等价：web 与 main.go 是两个位置，却都由 8090 提供；同一份 app.js 改由 8092 提供，就有了另一来源。下一小节用两个 Go 进程实际比较。

### 12.4 两个开发服务器为什么容易找错地址

相对地址只知道当前页面来自哪里，并不知道哪个终端里运行着 Go。先看请求有没有发错服务，再区分“目标错误”和“目标正确但跨源读取受限”。

假设 React 页面运行在 `http://127.0.0.1:5173/`，Go 运行在 `http://127.0.0.1:8090/`。页面中的 `fetch("/api/todos")` 会访问 **5173 端口**，不会自动发现 Go。

常见处理方式有两种：

- 在前端开发服务器中配置 API 代理，把收到的 `/api/...` 请求转发给 Go；浏览器继续请求页面自身的来源。
- 让前端请求明确的后端来源，并由后端按需要配置 CORS，允许指定的页面来源读取响应。

CORS 是浏览器跨来源访问的一套机制，可能涉及预检请求和凭据规则。它不是登录认证或后端权限控制；curl 不按浏览器的同源机制工作，因而“curl 成功、浏览器失败”是有价值的排查线索。

不要用 `mode: "no-cors"` 期待得到可读取的 JSON，它通常会让响应变成前端无法正常读取内容的 opaque 响应。也不要仅凭 CORS 错误就断言请求完全没到后端，仍需结合 Network 与日志判断。[MDN：CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)

**小实验：先找错服务，再观察 CORS。** 这次只使用 Go 标准库主例，不需要安装 React、Vite 或另一个静态服务。先停止此前的实验进程，把 `~/web-basics-demo-lab` 中四份文件还原为教材原版，然后在一份终端进入该目录运行 go run .，占用 8090。

第二份终端执行下面的复制命令；目标目录若已存在就换一个新名字。用编辑器将新副本 main.go 中的监听地址从 `127.0.0.1:8090` 改成 `127.0.0.1:8092`，再在新目录运行 go run .。下面的“8090 后端”和“8092 页面”都指这两份本机实验副本，文件内部的 /api/todos 路径不变。

```bash
cp -R ~/web-basics-demo-lab ~/web-basics-demo-8092
cd ~/web-basics-demo-8092
# 先用编辑器完成上面所说的端口修改，再启动。
go run .
```

1. **先看相对地址。** 在 8090 页面新增一条，打开 `http://127.0.0.1:8092/`。后者应还是空列表，因为自己的 app.js 读的是 8092 的 /api/todos，两个 Go 进程各有一份内存。相同路径不会自动指向你心里认定的那一个后端；在真实 React 工程里，5173 的相对地址问题也是这个原因。
2. **再看跨来源读取。** 在 8092 页面的 Console 执行：

```javascript
fetch("http://127.0.0.1:8090/api/todos")
  .then((response) => response.json())
  .then((items) => console.log("读取到：", items))
  .catch((error) => console.error("未读到响应：", error.message));
```

主例没有允许跨源读取的响应头，浏览器应阻止脚本取得 JSON；这个 GET 属于可直接发出的请求，不能因脚本没读到就说服务器完全没收到。转到终端执行 `curl -i http://127.0.0.1:8090/api/todos`，却仍可得到 200 和数组。

3. **比较带 JSON 的跨来源 POST。** 仍在 8092 页面的 Console 执行：

```javascript
fetch("http://127.0.0.1:8090/api/todos", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ title: "跨来源新增" }),
}).then((response) => console.log(response.status))
  .catch((error) => console.error("此次新增未完成：", error.message));
```

观察 Network：这次浏览器先发 **OPTIONS 预检**，询问目标是否允许这个来源以这种方法和请求头访问；本例对 OPTIONS 返回 405，也未给出所需允许信息，因此后续 POST 不会发出。再用第 8.8 节的 curl POST，仍能成功写入。GET 与这次 JSON POST 的观测不同，所以不能把所有 CORS 错误都概括为“请求没到服务器”。

4. **只允许读取作一次对比。** 在 8090 的 Go 副本中，临时给 todosHandler 的函数体最开头加这一行，再重启该进程：

```go
// 仅用于本机对照：允许 8092 这一页面来源读取此接口的响应。
w.Header().Set("Access-Control-Allow-Origin", "http://127.0.0.1:8092")
```

重新执行第 2 步的 GET，应能在 Console 读到 8090 的列表，且没有因此登录任何账号。重启已清空这份内存，所以读到 `[]` 也属于成功；需要看见具体记录时，先在 8090 页面重新新增一条。这一行不是完整的跨源 POST 配置：预检方法等规则还没有处理，不能照抄为通用 CORS 方案。它只验证“允许浏览器读取”和“确认是谁、允许写谁的数据”是两件事。

5. **恢复并比较 no-cors。** 先删去临时响应头并重启 8090。若还想验证 no-cors 的误区，保持 8092 页面打开，在 Console 执行 `fetch("http://127.0.0.1:8090/api/todos", {mode:"no-cors"}).then(response => console.log(response.type, response.status))`：通常会得到 opaque 和 0，而不是可正常读取的事项。opaque 就是浏览器不给这段脚本公开响应内容，不能把它当成修好了接口。最后 Ctrl+C 停止 8092，并确认 8090 代码中没有留下临时响应头。

这组实验把后果分开：URL 指错服务要修地址或代理；跨源读取受限要按需设计 CORS；接口有没有身份和权限检查要查后端规则。三者不能互相替代。

### 12.5 按现象逐层缩小范围

已经看到了请求，还需要把它对应回新增的具体站点。下面每一行都是一条检查路线，先找证据，再改那一站的代码。

| 现象 | 建议检查顺序 |
| --- | --- |
| 页面打不开 | 服务是否还在运行；端口与协议是否一致；是否访问了自己的本机地址 |
| 有页面但没有样式 | style.css 请求、相对路径、文件名大小写与保存位置 |
| 新增按钮一直不可用 | app.js 是否加载；初次 GET 是否成功；Console 与状态提示是什么 |
| 点击后没有 API 请求 | 事件是否注册；输入是否被浏览器校验拦下；脚本是否提前报错 |
| 请求 404 | 看完整 Request URL，确认请求到了哪个端口和路径 |
| 请求 405 | 接口支持 GET 还是 POST，方法是否与约定一致 |
| 请求 400 或 415 | 看错误对象，核对字段、类型、JSON 与 Content-Type |
| 请求 500 | 找后端日志中的具体错误，不只重复点击按钮 |
| `Unexpected token '<'` 等 JSON 解析错误 | 看 Response 是否其实是 HTML；常见原因是请求到了页面服务或错误页 |
| 响应成功但列表没更新 | 看返回字段、前端数组、renderTodos 或 React 状态更新 |
| 另一个标签页新增后，这一页没变化 | 本例不会实时推送，点击重新读取；它显示的是自己上次读取的数据副本 |
| 刷新后事项还在，重启后没了 | 本例使用后端内存；若要持久化，继续学习数据库 |

同一个“列表没增加”，在 400 时要修请求，在 201 时要查界面，在连接失败时先查进程和地址。改变之前说清你预计哪个可观察结果会变化，改变后再用同一条标题验证。

### 12.6 反馈问题时附上能复现的信息

如果同学只看到“新增没有确认成功”，无法判断你发到哪个端口、后端收到什么。把同一次操作还原出来，别人才能重复观察到相同结果。

说明在哪个目录运行了什么命令、打开什么地址、做了什么操作、期望与实际结果是什么，再附上状态码、响应和必要日志。出现输入相关问题时，用不含个人信息的示例复现。

分享截图或日志前，去掉真实会话 Cookie、令牌和数据库凭据。只说“前端坏了”或“后端不行”很难定位，完整请求信息更有帮助。

可以这样描述：“在 web-basics-demo 中 go run .，访问 8090，输入三个空格并提交；页面提示请先输入标题，Network 没有新增 POST。再用 curl 发送相同的空白 title，得到 400 和标题长度提示。”这让别人能判断后端拒绝是否符合预期，而不只看到一张空列表截图。

## 13. 从本地运行到上线，以及下一步学什么

上一节确认了本机新增能被后端接收并返回，现在要让另一台电脑也能走通这条路线。本节分清源码、构建产物、运行服务和公网入口，最后指出若要把“临时保存”变成可靠落库，下一步应深入哪部分。

### 13.1 四件事分别发生在哪里

本机新增成功之后，把源码推上 GitHub 并不会自动启动 Go。需要分开检查文件有没有更新、是否生成可运行内容、进程是否启动和请求是否能到达。

| 阶段 | 做什么 | 常见结果 |
| --- | --- | --- |
| 编写 | 编辑 HTML、JavaScript、Go 等源文件 | 源代码 |
| 构建 | 将源文件转换、检查或编译为可交付内容 | 前端静态产物、Go 可执行程序等 |
| 运行 | 启动能够处理请求的程序 | 正在监听的 HTTP 服务 |
| 部署 | 将所需文件与程序放到提供服务的环境，并配置运行与访问 | 用户能访问的站点和 API |

把代码推送 GitHub 主要是在更新远程仓库；只有仓库配置了相应工作流、执行成功并完成部署，才可能同步更新运行中的网站。看到一次提交并不等于服务已经更新。

即使运行了新程序，若浏览器仍访问旧服务器，新增仍由旧代码处理。部署验收要看实际网址上的页面与 API 结果，而不是只看仓库里已经有新文件。

### 13.2 静态托管与后端运行的区别

把三个前端文件上传后，表单仍能显示，但新增会请求一个未必存在的 /api/todos。页面托管解决“取得文件”，后端环境才解决“有人校验并保存标题”。

第 8 节 Go 程序既提供静态文件，也处理 API。若只把 `web/` 的 HTML、CSS、JS 上传到 GitHub Pages，页面文件可以被托管，但 `/api/todos` 不会因此变成可用的 Go 接口。

后端需要能运行相应程序的服务环境。前端可以和它使用同一来源，也可以单独部署后再配置 API 地址、代理与跨域规则。涉及 Cookie 等凭据时，还要一起考虑来源、HTTPS 和认证方案。

本文把 Go 监听在本机地址上是为了本地学习；把它变成公网服务需要另行设计访问入口、运行配置、持久化与权限。不要只把地址改成公网可访问，就把一个没有身份区分的演示当作多人正式系统。

可以把第 12.4 节的两端口实验当作本机缩影：页面正常显示，API 指错来源时仍无法新增；换成公网也要让这条请求找到实际运行的后端。开头的体验页运行真实 Go 服务，并额外做了浏览器清单隔离，但数据依旧在内存，不能据此声称已经落库。

### 13.3 真实工程里常见的补充角色

上线后，用户可能只访问一个域名，网页与保存接口却由不同程序处理。需要入口把请求交给正确服务，并保护传输与运行环境；这些设施不会替你实现待办规则。

反向代理可以统一接收请求，把网页资源或 `/api` 路径交给不同服务；HTTPS 保护浏览器与服务之间的传输；容器可以帮助组织运行环境。这些角色为部署提供支持，具体业务仍由前后端代码处理。

如果见到 `dist`、`public`、二进制文件、容器镜像等不同产物，先问“它由哪一步生成、交给谁运行或托管”，再阅读相应配置。这样会比把所有文件都当成网页直接上传更容易理解。

例如代理把 `/api/todos` 误转给静态文件服务，浏览器收到 HTML 后会在 JSON 解析处失败；容器若没有持久保存数据库数据，重建后也可能丢失。它们解决各自的入口、传输和环境问题，新增的业务校验与落库确认仍需在后端落实。

### 13.4 按兴趣继续深入

到这里已经能沿同一次新增找到每一站；若要把内存演示完善为能可靠落库的产品，下一步应按仍不清楚的那一站继续学，而不是重新背一遍工具名单。

| 想继续理解什么 | 可以阅读的课程 |
| --- | --- |
| 页面结构、样式与布局 | [HTML 与 CSS](frontend-html-css.md) |
| 组件、状态和前端工程 | [React 学习资料](frontend-react.md) |
| Go 语法、标准库与后端编程 | [Go语言](backend-go.md) |
| 数据怎样持久保存、查询与更新 | [数据库、MySQL 与 Prisma](backend-database-mysql-prisma.md) |
| 版本管理与团队协作 | [Git 基础与 GitHub 协作](git-basic.md)、[组织与协作](../组织与协作.md) |
| 静态站点、构建与 Pages 发布 | [静态网站部署](github-pages.md) |
| 网络请求如何在协议中传输 | [Wireshark 简介](other-wireshark.md) |
| 运行环境、日志和故障排查 | [Docker 入门](backend-docker.md)、[服务器运维基础](other-server-operations.md) |

再次回到“点击新增”这件事：找到前端事件，检查发出的 HTTP，再沿着后端路由、校验和保存追到响应，最后看页面如何使用结果。换成登录、提交表单、加载活动列表时，也可以按这条路线逐层阅读。
