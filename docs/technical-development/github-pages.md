---
title: GitHub Pages 发布教程
status: unread
---

# GitHub Pages 发布教程

GitHub Pages 可以把仓库中的静态文件发布成网站。发布后的网站通常公开可访问，即使源仓库设置为私有；不要把密码、令牌或其他不应公开的内容放进网站文件。

## 两种网址

- 用户或组织站点：仓库必须命名为 `用户名.github.io`，网址是 `https://用户名.github.io/`。
- 项目站点：任意仓库都可以发布，网址是 `https://用户名.github.io/仓库名/`。例如本项目仓库名为 `training`，网址是 `https://qsctech.github.io/training/`。

## 用 GitHub Actions 发布

1. 在 GitHub 创建仓库并推送网站文件。项目站点的仓库名会成为网址中的路径。
2. 在仓库中创建 `.github/workflows/pages.yml`，使用下面的最小工作流：

   ```yaml
   name: Pages

   on:
     push:
       branches: [main]
     workflow_dispatch:

   permissions:
     contents: read
     pages: write
     id-token: write

   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/configure-pages@v5
         - uses: actions/upload-pages-artifact@v4
           with:
             path: .
         - uses: actions/deploy-pages@v4
   ```

3. 打开 **Settings → Pages**，将 **Source** 设为 **GitHub Actions**。
4. 推送到 `main`，然后在 **Actions** 中查看部署结果。首次访问时使用项目站点的完整路径。

## 自定义域名

自定义域名只能填写域名，例如 `docs.example.com`，不能填写带路径的 `docs.example.com/training`。子路径由网站服务器或项目站点名称决定。DNS 配置完成后，在 **Settings → Pages → Custom domain** 填写域名并开启 **Enforce HTTPS**。

## 常见问题

- 访问根路径出现 404：项目站点需要访问 `/<仓库名>/`，不是域名根路径。
- 页面能打开但 CSS 或图片 404：构建工具的 base URL 没有包含项目路径，例如应设置为 `https://用户名.github.io/仓库名`。
- Actions 没有部署权限：检查 workflow 的 `pages: write` 和 `id-token: write` 权限，以及 Pages 的 Source 是否为 GitHub Actions。
