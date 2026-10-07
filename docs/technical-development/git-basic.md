---
title: Git 基础
status: unread
direction: technical-development
---

# Git 基础

## Git 是什么

Git 是一种版本控制工具。它会记录文件的变化，让你能查看过去改了什么、回到之前的版本，也能和别人一起修改同一份项目。

Git 安装在自己的电脑上，提交记录默认也保存在本地。GitHub、GitLab 等网站可以托管远程仓库，方便备份和协作；使用 Git 不一定需要 GitHub 账号或网络连接。

可以先把一次修改想成三个步骤：

1. **工作区**：你正在编辑的文件。
2. **暂存区**：你挑出来、准备放进下一次记录的修改。
3. **提交（commit）**：保存一个带说明的版本记录。

## 安装 Git

安装后打开终端，确认 Git 可以使用：

```sh
git --version
```

- **Windows**：从 [Git for Windows 官方页面](https://git-scm.com/install/windows)下载安装程序，或在 PowerShell 中运行 `winget install --id Git.Git -e --source winget`。安装后可用 Git Bash、PowerShell 或 Windows Terminal 执行 Git 命令。
- **macOS**：可以运行 `xcode-select --install` 安装 Xcode Command Line Tools，或使用 Homebrew 执行 `brew install git`。
- **Ubuntu / Debian**：运行 `sudo apt update`，再运行 `sudo apt install git`。
- **Fedora**：运行 `sudo dnf install git`。

其他系统和安装方式见 [Git 官方安装页](https://git-scm.com/install)。

## 首次配置

提交记录会带上作者姓名和邮箱。下面两项通常只需在每台电脑上配置一次：

```sh
git config --global user.name "你的名字"
git config --global user.email "你的邮箱"
git config --global init.defaultBranch main
```

这里的邮箱用于标记提交作者，不是 GitHub 登录密码。若不想公开个人邮箱，可以在 GitHub 邮箱设置中查看可用于提交的隐私邮箱。检查配置：

```sh
git config --global --list
```

## 常用命令

先进入项目目录，再使用 Git 命令。下表中的 `文件名`、`分支名` 和 `<仓库地址>` 都要替换成实际内容。

| 命令 | 用途 |
| --- | --- |
| `git init` | 把当前目录初始化为 Git 仓库 |
| `git clone <仓库地址>` | 下载远程仓库及其提交记录 |
| `git status` | 查看当前分支和文件状态 |
| `git diff` | 查看尚未暂存的改动 |
| `git add 文件名` | 把指定文件的改动放入暂存区 |
| `git commit -m "说明"` | 保存暂存区里的改动 |
| `git log --oneline` | 查看简洁的提交历史 |
| `git branch` | 查看本地分支 |
| `git switch -c 分支名` | 新建并切换到一个分支 |
| `git switch 分支名` | 切换分支 |
| `git merge 分支名` | 把指定分支的提交合并到当前分支 |
| `git pull` | 获取远程更新并整合到当前分支 |
| `git push` | 把本地提交发送到远程仓库 |
| `git remote -v` | 查看远程仓库地址 |

提交只会包含已经 `git add` 的修改。建议先看 `git status` 和 `git diff`，确认改动内容后再暂存和提交。可以一次添加多个明确的文件：

```sh
git add README.md docs/guide.md
```

## 一次本地修改

进入已有 Git 项目后，可以按下面的顺序保存一项改动：

```sh
git status
git diff
git add README.md
git status
git commit -m "补充项目说明"
git log --oneline
```

提交说明写清这次改了什么，例如“补充安装步骤”或“修复导航链接”。提交保存在本地，不会自动上传到 GitHub。

## 常见团队工作流

多人协作时，不要直接在 `main` 上堆改动。通常每项任务各自使用一个分支：

```sh
git switch main
git pull --ff-only
git switch -c docs/add-git-guide
```

接着编辑文件、检查改动并提交：

```sh
git status
git diff
git add docs/technical-development/git-basic.md
git commit -m "补充 Git 入门文档"
```

把分支推送到远程仓库：

```sh
git push -u origin docs/add-git-guide
```

然后在 GitHub 或 GitLab 上创建 Pull Request（也叫 Merge Request），请队友查看。根据反馈继续修改、提交并推送；审核通过后再合并到 `main`。下次开始任务时，先更新 `main`，再创建新分支。

分支是彼此独立的开发线。切换分支前先查看 `git status`，未提交的修改可能会跟着你切换。若两个人改了同一处内容，合并时可能出现冲突：打开冲突文件，选择并整理要保留的内容，删除 Git 插入的冲突标记，再 `git add` 并提交。

## 把本地仓库连接到远程仓库

已经存在于 GitHub 或 GitLab 的项目，使用 `git clone <仓库地址>` 下载时，Git 会自动把远程仓库命名为 `origin`。可以用下面的命令查看：

```sh
git remote -v
```

如果你先在本地创建了仓库，之后才在网站上创建远程仓库，可以在项目目录中添加远程地址：

```sh
git remote add origin <仓库地址>
git push -u origin main
```

这里的 `<仓库地址>` 可从仓库网页的 **Code** 按钮复制。通过 HTTPS 或 SSH 连接时，网站可能要求你先配置身份验证；Git 的 `user.name` 和 `user.email` 只是提交署名，不能代替登录认证。不要把密码、访问令牌或私钥写进代码或提交记录。

## 几个容易混淆的地方

- `git add` 是选择这次要记录的改动，不是把文件上传到网站。
- `git commit` 保存到本地仓库；`git push` 才会发送提交到远程仓库。
- `git pull` 会获取远程更新并整合到当前分支。多人协作时，先确认当前分支再执行。
- `.gitignore` 可以列出不应纳入版本控制的文件，例如依赖目录、构建产物和本地 `.env` 配置。提交前用 `git status` 检查，避免把密钥或个人文件传上去。
- 不要随意运行 `git reset --hard`、`git clean -fd` 或带 `--force` 的推送命令；它们可能丢失本地改动或覆盖他人的提交。

## 练习

- [ ] 安装 Git，运行 `git --version`，并完成首次配置。
- [ ] 新建一个练习目录，用 `git init` 初始化仓库；创建一个文本文件并查看 `git status`。
- [ ] 修改文件，用 `git diff` 查看改动，再用 `git add` 和 `git commit` 保存两个不同的提交。
- [ ] 用 `git log --oneline` 查看记录，并新建一个分支完成另一项修改。
- [ ] 如果有可用的 GitHub 或 GitLab 仓库，尝试克隆、创建分支、推送并发起 Pull Request；没有远程仓库也可以先完成前四项。

## 学习衔接

先学习 [Shell 与 Linux 基础](shell-basics.md)，再用 Git 管理 [GitHub Pages 项目](github-pages.md)。想了解更多，可以阅读 [Pro Git](https://git-scm.com/book/zh/v2)。
