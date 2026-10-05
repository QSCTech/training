# 求是潮产品研发中心内训仓库

本仓库采用 Markdown + Obsidian + GitHub 的形式。在线阅读链接： `https://qsctech.github.io/training/`。

## 文档路径与路由

`docs/` 中的文件名会显示在 Obsidian 知识图谱中。三篇入口文档使用各自的中文文件名；为了保留网站原有网址，它们的路由映射写在 `scripts/configure_quartz.mjs` 的 `routes` 中。调整入口网址时，同时更新该映射和文档间的 Markdown 链接。普通文档的路由仍由相对文件路径生成。

## 本地 Quartz 预览

需要 Node.js 22、npm 10.9 及 Git。第一次在仓库根目录运行：

```sh
npm run setup
npm run dev
```

之后就可以浏览器打开 **http://localhost:8080/** 。Quartz 读取 `docs/` 中的官方文档，保存 Markdown 后会自动重新构建并刷新页面；`docs/notes/` 是个人笔记目录，不会在 Quartz 上显示。

如果只想生成本地静态文件到 `public/` 可以使用 `npm run build` 检查构建结果；该目录和下载的 `.quartz/` 均被 Git 忽略。重复运行 `npm run setup` 不会重新安装依赖。`setup` 与 CI 使用相同的固定 Quartz 版本。

## 自动化行为

- `Docs` workflow：对 `main` 推送和 Pull Request 运行链接检查；非 Pull Request 事件会读取完整 Git 历史，生成更新日志，再从固定 Quartz v4 提交构建并发布 GitHub Pages。工作流关闭了 Quartz 默认的外部分析、在线字体、KaTeX 和 Mermaid 资源，避免页面自动请求第三方服务；当前示例不渲染数学公式或 Mermaid 图。
- 文档目录始终保留 Markdown 相对链接。`docs/.obsidian` 已预设标准 Markdown 链接和相对路径，Obsidian 与 Quartz 都能识别这些链接。

## 学生使用

1. 打开在线文档，或把官方仓库克隆到本地。需要离线编辑时，**在 Obsidian 中打开克隆仓库的 `docs/` 文件夹作为 vault**（注意，不是打开整个仓库根目录）；这样浏览器就只会显示学习文档与 `notes/`，看不到 CI、脚本等工程目录。
2. 最好只在 `notes/` 中记录笔记或完成练习；通过源仓库中的[更新日志](docs/changelog.md)可以看到仓库的更新历史。
3. 阅读[GitHub Pages 发布教程](docs/technical-development/github-pages.md)，可以把自己的静态网页发布到 `username.github.io` 或 `username.github.io/repository`。
4. 可在官方仓库提 Issue 或提交 Pull Request 以勘误。

## 本地验证

```sh
node --check scripts/configure_quartz.mjs
node --check scripts/generate_changelog.mjs
```
