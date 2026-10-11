---
title: Git 基础与 GitHub 协作
status: unread
direction: technical-development
---

写文档或代码时，我们常会遇到两个问题：改动之后想找回旧版，或与别人同时修改同一份文件。Git 用提交记录版本，用分支组织改动；GitHub 则让这些记录可以上传、分享和审阅。

这篇教程先解释本地版本如何保存，再介绍 GitHub 注册、远程仓库与协作。你可以先阅读本地部分，联网和账号不是第一次提交的前提。

## 阅读前的准备

准备一个能保存纯文本的编辑器，以及可以输入命令的终端。Windows 安装 Git for Windows 后打开 **Git Bash**；macOS 打开“终端”，输入 `bash`；Linux 打开终端即可。输入代码块中的命令后按 Enter，`#` 后面的说明是注释，不需要单独执行。

路径里的 `~` 表示自己的主目录；`cd` 切换目录，`mkdir` 创建目录，`pwd` 显示当前位置。遇到“目录不存在”时先确认路径，不要在任意文件夹反复初始化 Git。下文会从零创建一个叫 `git-demo` 的示例目录，无需准备其他课程的文件。

第一次阅读可以按“本地提交 → 分支 → GitHub 与推送 → PR”推进。冲突、撤销和 Fork 可以在熟悉前面的操作后再读；文内例子用于说明命令的作用和结果。

## 1. 先区分几个名称

| 名称 | 是什么 | 容易混淆之处 |
| --- | --- | --- |
| Git | 本机版本控制工具 | 不等于 GitHub，不联网也能提交 |
| GitHub | 托管仓库、审阅改动和运行自动化的平台 | 注册账号不会自动安装 Git |
| 仓库 repository | 项目文件及其版本历史 | 本地历史通常保存在隐藏的 `.git/` |
| commit（提交） | 一个带作者、说明的版本记录 | 提交到本机，不自动上传 |
| branch（分支） | 指向一条开发线最新提交的名字 | 属于同一个仓库 |
| clone（克隆） | 把远程仓库和历史下载到本机 | 不会自动获得远程写入权限 |
| fork | 在 GitHub 建立自己的派生仓库 | 是另一个仓库，不只是一个分支 |
| Pull Request（PR） | 请求把一组提交合并到目标分支 | 发起请求不等于已经合并 |

Git 给文件建立历史，不会记录你没保存进提交的每一次键盘操作。它也不是网盘：需要明确选择并提交改动，再把提交推送到远程。

## 2. 安装与首次配置

### 2.1 确认 Git 可用

```bash
git --version
```

应看到 `git version ...`。本文使用 `switch`、`restore` 和 `init -b`，需要 Git 2.28 或更新版本；若提示不认识这些子命令或选项，先更新安装。

- Windows：安装 [Git for Windows](https://git-scm.com/install/windows)，安装后重新打开 Git Bash。
- macOS：执行 `xcode-select --install` 安装命令行工具，或按 [Git 安装说明](https://git-scm.com/install)选择方式。
- Ubuntu/Debian：在 Linux 环境用 `sudo apt update`、`sudo apt install git`。

### 2.2 配置提交署名

```bash
# 以下文字换成你实际使用的署名和邮箱。
git config --global user.name "你的名字"
git config --global user.email "你的邮箱"
git config --global init.defaultBranch main

# 分别检查，避免输出不相关的本机设置。
git config --global --get user.name
git config --global --get user.email
```

`--global` 表示这台电脑上当前用户的默认配置。它不是 GitHub 登录。GitHub 邮箱设置中可获取 `noreply` 隐私邮箱，想隐藏个人邮箱可以使用网站显示的准确地址，不要自己猜格式。

多人共用电脑或为不同项目使用不同邮箱时，在具体仓库中省略 `--global` 可以配置该仓库的署名。不要把别人的示例邮箱原样留在自己的提交中。

## 3. 在本地保存两次版本

### 3.1 建立自己的示例仓库

下面在主目录新建 `git-demo`，只存放这篇教程的示例。已有同名重要项目时换一个目录名，不要把现有工程当成空目录。

```bash
mkdir -p ~/git-demo     # 只在首次创建示例目录时执行
cd ~/git-demo           # 确认进入新目录
git init -b main        # 建立 .git 目录，第一条开发线叫 main
git status             # 查看分支及文件状态
```

先用 `pwd` 确认当前路径以 `/git-demo` 结尾。`git init` 只在新项目第一次需要。GitHub 页面中的 README 是项目说明，不是 Git 本身的必需文件。

使用文本编辑器创建 `README.md`，写入：

```markdown
# Git 入门示例

这个项目用于了解 Git 如何保存和协作修改文档。
```

保存后执行：

```bash
git status
```

应看到 README 在 `Untracked files`（未跟踪文件）中。文件已经在磁盘上，但 Git 尚未把它放入记录。

### 3.2 工作区、暂存区、提交

```text
编辑器保存的文件 —— git add ——> 暂存区 —— git commit ——> 本地提交历史
       工作区                    本次要记录的内容            一份版本记录
```

暂存区像“这次提交的装箱清单”。`git add README.md` 保存文件此时的内容供下一次提交使用，不是上传文件。

```bash
git add README.md
git status                # README 应移到 Changes to be committed
git diff --cached         # 检查已经选好的内容
git commit -m "docs: describe the learning site"
git log --oneline          # 应看到刚才提交的简短编号与说明
```

第一次提交的编号是 Git 计算的，与你同伴不同是正常的。`-m` 后是提交说明：写这次完成了什么，不要每次都写“更新”。

现在给 README 添加一行：`当前目标：理解每一次提交保存了什么。`，保存，再运行：

```bash
git diff                  # 尚未暂存的改动
git add README.md
git diff --cached         # 应只看到本次新增的一行
git commit -m "docs: clarify the learning goal"
git log --oneline          # 此时至少两条提交
git status                # 没有其他改动时应显示工作区干净
```

### 3.3 看懂差异，而不是只看颜色

`git diff` 中 `+` 表示新增，`-` 表示移除；`---`、`+++` 是文件标记，不是正文。新增文件在未跟踪状态时，普通 `git diff` 通常不会显示它的内容；可以先查看文件，再 `add`，用 `git diff --cached` 检查。

| 命令 | 比较什么 |
| --- | --- |
| `git diff` | 工作区与暂存区 |
| `git diff --cached` | 暂存区与最近提交 |
| `git diff HEAD` | 工作区与最近提交的已跟踪内容 |
| `git status` | 分支、暂存、未暂存及未跟踪状态 |

如果 `add` 后又编辑文件，文件可以同时显示“已暂存”和“未暂存”：提交保存的是上次 `add` 时的内容。要包含新修改，应再次检查并 `add`。这不是 Git 出错，而是暂存区发挥作用。

## 4. 用分支完成一项修改

分支为一项任务提供独立的记录线。它不是复制整个文件夹；切换分支时 Git 会让工作区呈现对应版本。

```bash
git status
git switch -c docs/add-plan  # 从当前提交新建并切换分支
git branch                  # 星号标记当前分支
```

在 README 添加 `下一步：学习团队协作。`，提交：

```bash
git add README.md
git commit -m "docs: add the collaboration plan"
git switch main
cat README.md               # main 此时还没有刚才分支新增的那行
git merge docs/add-plan     # 把指定分支整合进当前 main
cat README.md               # 现在应看到新增内容
git log --oneline --graph --all
```

若 Git 提示 `Fast-forward`，表示当前分支可以直接向前跟进。更复杂的历史可能产生新的合并提交；这时 Git 可能打开编辑器。可阅读说明后保存退出，或在本文演示中用 `git merge --no-edit 分支名` 接受默认合并说明。

**未提交的修改不一定属于某个分支**，可能随切换带过去，也可能使切换被阻止。切换前先 `status`；最简单的跟课方式是先完成并提交当前任务，再切换。

## 5. 创建并认识 GitHub 账号

前面的本地操作不需要 GitHub。现在有了自己的提交，才把它连接到远程平台。

### 5.1 注册与邮箱验证

1. 浏览器打开 [GitHub 注册页](https://github.com/signup)，按页面提示创建个人账号；已经有账号直接登录。
2. 选择易识别且适合长期使用的用户名，记录它。用户名会出现在仓库地址和仓库链接中。
3. 完成页面要求的验证，确认邮箱已验证。注册按钮和表单可能变化，以 [GitHub 官方注册说明](https://docs.github.com/en/account-and-profile/how-tos/account-management/creating-an-account-on-github)为准。
4. 登录后通过右上角头像进入 **Settings**，确认邮箱设置。需要隐私署名时复制 GitHub 提供的 `noreply` 邮箱，重新设置本机 `user.email`。
5. 配置双重验证（2FA）并妥善保存恢复方式；不要把账号交给同伴代用。

本文不要求付费套餐，不需要把个人手机号、学号等信息写进公开简介。浏览器已经登录，也不意味着命令行 Git 可以推送。

### 5.2 看懂仓库页面

打开 [官方内训仓库](https://github.com/QSCTech/training)，先只阅读：

| 区域 | 能做什么 | 初学时可以怎么用 |
| --- | --- | --- |
| Code | 浏览文件、分支与历史 | 点 README 或 docs 阅读，Code 按钮复制克隆地址 |
| 分支选择器 | 查看不同分支 | 留意现在查看的是不是 main |
| Commits / 文件 History | 看谁在何时改了什么 | 打开一条提交看差异 |
| Issues | 报告问题、讨论待办 | 搜索是否已有同一问题，再描述复现过程 |
| Pull requests | 审阅与合并改动 | 看 Files changed 和讨论记录 |
| Actions | 看自动化运行与日志 | 部署时查看失败的是哪一步 |
| Settings | 修改仓库设置 | 只在自己的仓库设置 Pages；组织仓库可能没权限 |
| Star / Watch | 收藏 / 管理通知 | Star 不会下载，也不会获得写权限 |
| Fork | 建立自己的派生仓库 | 给无写权限的上游贡献时使用 |

Markdown 的 `#`、列表和代码块可在 README、Issue、PR 中使用。Issue 不是私人笔记空间；提问应写页面/文件、操作步骤、实际结果、预期结果，必要时附不含认证信息的报错。

## 6. 创建远程仓库并推送

### 6.1 新建一个空仓库

在 GitHub 右上角 `+` 菜单选择 **New repository**，也可从自己的仓库列表选择 **New**。

- Owner 选自己。
- Repository name 填 `git-demo`。
- 示例可以选择 **Public**，这样别人能直接阅读；不愿公开的项目选择 **Private**。两种可见性都可以使用 Git。
- **不要勾选添加 README、.gitignore 或 License**：我们已有本地提交，先让远程仓库保持空白，避免一开始就处理两份不同历史。
- 点击 **Create repository**。仓库页会显示初始化命令；我们按本文已有仓库的步骤操作，不重新 `init`。

### 6.2 选择认证方式

推荐“HTTPS + 凭据管理器/浏览器登录”作为主线。通过 Git for Windows 等安装的凭据管理器，首次推送可能打开浏览器授权；如果系统没有提供这种流程，可以使用 GitHub CLI 的 `gh auth login`，但需要先安装 CLI。

另一种跟课方式是 GitHub Desktop：登录后用 **File → Add local repository** 选择 `~/git-demo`，确认仓库，再用它完成推送。它是图形界面客户端，本地仍是同一个 Git 仓库；不要重新创建或覆盖目录。

如果终端使用 HTTPS 并要求输入密码，不能使用 GitHub 登录密码，应按当前认证方式提供令牌或使用凭据管理器。Fine-grained token 应仅授权自己的练习仓库与所需权限；普通代码推送需要仓库内容写入权限，推送 `.github/workflows/` 时还需相应工作流权限。本文不要求把令牌复制到命令里。[GitHub 认证说明](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/about-authentication-to-github)

**SSH 是选学路线。** 使用 SSH 公钥认证后，地址类似 `git@github.com:用户名/git-demo.git`。密钥生成、上传公钥和主机指纹核验按 [GitHub SSH 指南](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent)操作；私钥保留在本机。`ssh -T git@github.com` 的成功提示说明身份已认证，GitHub 不提供普通 SSH Shell，因此不能只用它的退出码判断连接失败。

### 6.3 添加远程并上传提交

下面的 `YOUR_USERNAME` 换成你实际的 GitHub 用户名，再执行；没有尖括号要输入。

```bash
cd ~/git-demo
git remote add origin https://github.com/YOUR_USERNAME/git-demo.git
git remote -v                  # 确认 fetch 和 push 地址都指向自己的仓库
git branch --show-current      # 本文此时应是 main
git push -u origin main
```

`origin` 是远程仓库的本地名字，可以自己命名，并不天然表示“官方”。`-u` 给本地 `main` 设置默认跟踪关系，后续在这一分支可直接 `git push`。

浏览器刷新自己的仓库，应看到 README 和提交历史。**上传成功的证据是远程页面出现提交**，不是仅仅本地执行了 `commit`。

如果提示 `remote origin already exists`，先 `git remote -v`。地址正确就无需再添加；确认写错以后才 `git remote set-url origin 正确地址`。不要为了修正一个网址删除本地项目。

## 7. 用 Pull Request 协作

前面的本地合并用于理解概念。多人协作时通常先推送任务分支，让别人审阅，再合并到 `main`。

### 7.1 在自己的仓库发一份 PR

```bash
git switch main
git pull --ff-only origin main  # 工作区干净时同步远程 main
git switch -c docs/add-checklist
```

在 README 新增：

```markdown
## 学习清单

- [ ] 能解释工作区、暂存区与提交
- [ ] 能说明本地提交和远程推送的区别
```

```bash
git diff
git add README.md
git diff --cached
git commit -m "docs: add the learning checklist"
git push -u origin docs/add-checklist
```

打开自己的仓库，点击 **Compare & pull request**；没有提示时进入 **Pull requests → New pull request**。核对 `base: main`、`compare: docs/add-checklist`，检查差异再创建。

PR 描述可以写：“为示例 README 添加两项学习清单；仅修改 README；已检查 Markdown 展示。”还未写完时可以选择 Draft。协作时，审阅者可以在 **Files changed** 对某一行发表评论，或在讨论区提出建议。自己阅读时，也可以先查看差异，熟悉 PR 页面。

### 7.2 回应反馈和合并

按反馈编辑 README，再提交、推送同一分支：

```bash
git add README.md
git commit -m "docs: clarify the checklist wording"
git push
```

已有 PR 会更新，不用重新建一个。完成审阅后，在自己仓库中选择合并；组织仓库还要满足其审阅与分支规则。合并方式可能是 Merge、Squash 或 Rebase；本文先用页面允许的方式，不强行改规则。

若没有给同伴写权限，对方仍可以阅读公开 PR 并发表评论；作为仓库拥有者，你可以自己合并。无需为了一次评论把同伴设为管理员。

合并后回到本地：

```bash
git switch main
git pull --ff-only origin main
git log --oneline -5
```

旧分支暂时保留不影响下一次学习，新任务新建分支。推送任务分支或创建 PR 都不会自动把修改合并进 main；main 何时更新取决于合并操作。

### 7.3 没有官方写权限：Fork 后贡献

官方教材勘误应是有实际价值的修改，不把练习用占位文字发给官方库。

1. 在上游仓库点击 Fork，建立个人派生仓库。
2. 从自己 Fork 的 Code 按钮复制地址，再 Clone。
3. 给原始官方仓库添加远程名字 `upstream`，自己的 Fork 仍叫 `origin`。
4. 在自己的任务分支修改、推送到自己的 Fork。
5. 新建 PR 时选 `base repository: QSCTech/training`、`base: main`，比较自己的 Fork 分支。

格式示例（替换用户名；在另一个目录操作，不覆盖示例仓库）：

```bash
cd ~
git clone https://github.com/YOUR_USERNAME/training.git training-fork
cd training-fork
git remote add upstream https://github.com/QSCTech/training.git
git remote -v
git fetch upstream             # 获取上游历史，还没改当前文件
git switch main
git merge --ff-only upstream/main
git switch -c docs/fix-a-real-typo
```

后续只暂存真实修正的文件，提交并推送该分支。若 `--ff-only` 失败，表示个人 `main` 与上游有分叉，先看历史与自己的修改，不能直接强制覆盖。公开仓库的 Fork 也公开，不适合保存私人笔记。

## 8. 更新远程内容与处理冲突

### 8.1 Fetch、Pull、Push

`fetch` 下载远程分支和历史，供你检查；`pull` 获取并整合进当前分支；`push` 把本地提交发送到远程。每次运行前先确认当前分支和远程。

开始新任务时更新 `main`；在自己的任务分支中需要引入队友的最新 `main`，先提交自己的修改，再执行：

```bash
git fetch origin
git merge --no-edit origin/main
```

如果编辑同一处内容，Git 可能需要你处理冲突。冲突表示它不替你决定语义，不等于记录丢了。

### 8.2 在独立小仓库中制造一个冲突

下面用另一个独立目录 `~/git-conflict-demo` 展示冲突从何而来。它不影响 git-demo。目录已存在时换个名字。

```bash
cd ~
mkdir git-conflict-demo
cd git-conflict-demo
git init -b main
printf '主题：工具入门\n' > topic.txt
git add topic.txt
git commit -m "docs: add the original topic"

git switch -c teammate
printf '主题：采用绿色标题\n' > topic.txt
git add topic.txt
git commit -m "docs: use a green title"

git switch main
printf '主题：采用蓝色标题\n' > topic.txt
git add topic.txt
git commit -m "docs: use a blue title"
git merge teammate
```

最后一条预期报告冲突。打开 `topic.txt` 会看到类似：

> ```text
> <<<<<<< HEAD
> 主题：采用蓝色标题
> =======
> 主题：采用绿色标题
> >>>>>>> teammate
> ```

本次普通 merge 中 HEAD 一侧是当前 `main`，另一侧来自 `teammate`。不是在所有 Git 操作里都能机械理解成“我的/别人的”。

讨论后把整个文件整理成一行：`主题：采用蓝色标题，链接使用绿色`。删除全部冲突标记，再执行：

```bash
git diff                    # 检查整理后的文本
git add topic.txt            # 告诉 Git 此文件已经解决
git commit -m "docs: combine the two learning suggestions"
git status
git log --oneline --graph --all
```

如果尚未开始解决、想取消这次合并，先确认合并前工作已提交，再用 `git merge --abort`。不要为了“消除红色标记”随意删除一方的有效内容。

## 9. 忽略文件与可控撤销

### 9.1 .gitignore 的边界

在自己的示例仓库创建 `.gitignore`：

```gitignore
# 本机文件、依赖、可能含认证信息的配置；此处为练习示例。
.DS_Store
node_modules/
.env
```

提交 `.gitignore` 后，它告诉 Git 默认忽略哪些未跟踪文件。它不删除文件，也不会自动停止跟踪已经提交的文件。如果真实密钥已经提交，先撤销/轮换密钥并请老师协助处理，不能只增加一个忽略规则就认为泄漏消失。

### 9.2 分清“取消暂存”“丢弃修改”“撤销提交”

| 需求 | 方法 | 影响 |
| --- | --- | --- |
| 文件 add 早了，仍要保留编辑 | `git restore --staged README.md` | 取消暂存，保留工作区内容；已有至少一次提交时练习 |
| 确认不要工作区某份改动 | 先看 diff/备份，再 `git restore README.md` | 默认恢复暂存区内容，可能永久丢弃未保存进提交的修改 |
| 已提交的改动需要撤销 | `git revert 提交编号` | 新增反向提交，保留原历史；本文先对普通提交使用 |

`git restore README.md` 不总是回到最近提交：如果暂存区有新内容，它默认取暂存区。需要明确最近提交版本时，可阅读 [git restore 文档](https://git-scm.com/docs/git-restore)中的 `--source=HEAD`，先弄清要保留什么。

`git stash push -u -m "暂存未完成修改"` 可临时存放修改和未跟踪文件，之后用 `git stash list` 查、`git stash apply` 取回并检查。它可能产生冲突，也不是远程备份；首次课堂不强制使用。

本文不需要 `git reset --hard`、`git clean -fd` 或强制推送。命令会丢弃什么不清楚时，先保留副本和提交，再请老师查看。

## 10. 用 Git 阅读内训库与记笔记

在自己的主目录中克隆官方教材作阅读；同名目录已存在时换一个目录名：

```bash
cd ~
git clone https://github.com/QSCTech/training.git training-reading
```

Obsidian 选择“打开文件夹作为库”，打开 `training-reading/docs`，而不是仓库根目录。普通 Markdown 编辑器也能阅读，不要求安装 Obsidian 才能学课。

推荐保持官方正文不变，个人记录写在自己的笔记库。`docs/notes/` 在网站构建中被排除，但若推送到公开仓库仍公开；含个人信息的笔记另建独立私有仓库或只保留本地。修改官方文章的 `status: done` 可改变本地图谱颜色，但也会形成 Git 改动，同步时可能冲突。不要把自己的完成状态作为教材 PR 交回官方。

定期更新阅读副本：先 `git status` 确认没有要保留的未提交修改，再 `git pull --ff-only origin main`。若已在官方文章中大量做笔记，先迁移/备份个人内容，不直接还原整个目录。

## 11. 常见卡点

| 现象 | 怎么检查和处理 |
| --- | --- |
| `not a git repository` | 用 pwd 确认位于仓库中；不要见到错误就在主目录 git init |
| `Author identity unknown` | 配置 user.name、user.email，重试提交 |
| `nothing to commit` | 是否保存了文件、是否有改动、是否 add；commit 只保存暂存内容 |
| 编辑器打开不知道怎么退出 | 看编辑器名称；可按老师演示设置熟悉的编辑器，提交说明优先用 -m |
| Push 403 / authentication failed | 核对地址、认证账号与写权限；邮箱署名不是认证 |
| `non-fast-forward` | 远程有本地没有的提交；先 fetch 看历史，不直接 force |
| `main` 不存在 / `src refspec` | 检查分支名、是否已有首个提交；本文使用 main |
| `repository not found` | 检查用户名、仓库名、私有仓库权限与登录账号 |
| 文件消失/又出现 | 是否切换分支，或文件尚未提交；先看 status 和 log |
| 网页上有更新，本地没有 | 先确认分支，再 fetch/pull；反过来则可能尚未 push |

提交说明、作者、文件名和差异都可能公开。分享报错前去掉认证信息；不要发含令牌的 remote URL。

## 参考与延伸

进一步读 [Pro Git 中文版](https://git-scm.com/book/zh/v2)、[GitHub Hello World](https://docs.github.com/en/get-started/using-github/hello-world)、[GitHub Flow](https://docs.github.com/en/get-started/using-github/github-flow)。具体命令查 [Git 官方文档](https://git-scm.com/docs)，认证步骤查前文所列 GitHub 官方页面。
