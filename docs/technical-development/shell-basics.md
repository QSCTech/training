---
title: 命令行、Shell 与 Linux 基础
status: unread
direction: technical-development
---

# 命令行、shell和Linux
> 比起使用此文档，我们更推荐您可以详细学习这些链接：
https://missing-semester-cn.github.io/2026/course-shell/
https://missing-semester-cn.github.io/2026/command-line-environment/  
如果你更习惯网课： https://www.bilibili.com/video/BV1uc411N7eK/?share_source=copy_web&vd_source=12678214a2eed42cc6ff738295eb35b7

## 命令行、Shell 和 Linux 是什么

平时我们通过窗口、按钮和鼠标操作电脑；命令行则是输入文字来完成操作。打开终端后，出现的输入窗口就是命令行界面。

Shell 是运行在终端里的程序。它读取你输入的命令，再调用相应的程序执行。Bash 是 Linux 上常见的 Shell，PowerShell 则常见于 Windows。本文的命令示例使用 Bash。

Linux 是一种操作系统，Ubuntu 是常见的 Linux 发行版。可以把它们理解为电脑运行程序的基础环境；Shell 则提供了一种用命令操作这个环境的方式。Windows 用户可以通过 WSL 使用 Linux，许多服务器也运行 Linux，所以熟悉这些命令会很有用。

## 配置Bash环境
- 如果您是linux/MacOS用户，那么您的系统一般都会自带terminal程序，直接打开并输入bash以启用bash；
- 如果您是Windows用户，那么您可以选择直接下载bash
https://git-scm.com/install/

## 命令怎么写

大多数命令由“命令名、选项、要处理的对象”组成：

```sh
ls -a docs
```

这里 `ls` 用来查看目录内容，`-a` 是选项，表示也显示隐藏文件，`docs` 是要查看的目录。选项会改变命令的行为；不同命令的选项含义不同，可以用 `命令名 --help` 查看帮助。

输入命令后按 Enter 执行。命令完成后，终端会再次显示提示符，等待下一条命令。想停止正在运行的命令，通常可以按 `Ctrl+C`。

## 输入命令之前

命令通常会在“当前目录”里查找或创建文件。刚打开终端时先看一眼位置和内容：

```sh
pwd
ls
```

`pwd` 显示当前目录，`ls` 列出其中的文件和子目录。要进入某个目录，用 `cd`：

```sh
cd docs
cd ..
```

第一条进入当前目录下的 `docs`，第二条回到上一级目录。路径也可以从当前位置写起（相对路径），或从根目录写起（绝对路径）。常见记号有：`.` 表示当前目录，`..` 表示上一级目录，`~` 表示自己的主目录。路径或文件名里有空格时，用引号括起来，例如 `cd "my notes"`。

## 常用文件操作

| 命令 | 用途 | 示例 |
| --- | --- | --- |
| `mkdir` | 新建目录 | `mkdir notes` |
| `touch` | 新建空文件 | `touch notes/todo.txt` |
| `cp` | 复制文件 | `cp todo.txt todo-backup.txt` |
| `mv` | 移动或重命名文件 | `mv old.txt new.txt` |
| `cat` | 在终端中显示文本 | `cat notes/todo.txt` |
| `less` | 分页查看较长文本，按 `q` 退出 | `less README.md` |
| `rg` | 搜索文件内容 | `rg "title:" docs` |
| `rm` | 删除文件 | `rm notes/todo.txt` |

`rm` 删除的文件通常不会进入回收站。执行删除、移动或覆盖操作前，先用 `pwd` 和 `ls` 确认位置及目标文件。不要直接运行自己看不懂的命令，尤其是带有 `-r` 或 `-f` 的删除命令。

## 管道与重定向

命令可以把结果交给另一个命令处理。`|`（管道）会把左侧命令的输出传给右侧命令：

```sh
rg "title:" docs | less
```

这会搜索 `docs` 中包含 `title:` 的内容，再分页显示结果。

也可以把输出写入文件：

```sh
echo "今天开始练习命令行" > practice.txt
echo "再熟悉一下目录操作" >> practice.txt
cat practice.txt
```

`>` 会新建文件，或覆盖已有文件的内容；`>>` 会把内容追加到文件末尾。使用 `>` 前先确认目标文件里没有需要保留的内容。

## WSL 和 SSH

Windows 上可以安装并打开 WSL，在 Linux 环境中练习本篇命令。连接远程 Linux 服务器时，常用 SSH：

```sh
ssh 用户名@服务器地址
```

连接成功后，命令会在远程机器上执行，而不是本机。操作前确认连接的机器和当前目录；不确定时先运行 `pwd`、`ls` 查看。

## 练习

- 用 `pwd` 查看当前目录，再用 `ls` 查看其中的文件。
-  用 `cd` 进入仓库的 `docs/`，再用 `cd ..` 返回上一级。
- 在临时练习目录中用 `mkdir` 和 `touch` 创建目录与文件，用 `echo` 写入一行文字，再用 `cat` 查看。
- 用 `cp` 复制文件，用 `mv` 给副本改名；确认目标文件后再删除它。
-  用 `rg "title:" docs | less` 搜索文档标题，并按 `q` 退出。

## 学习衔接

回顾[环境配置与 TypeScript](environment-typescript.md)，然后选择[前端主线](frontend-html-css.md)或[后端主线](backend-oop-typescript.md)；部署时可选读[Docker 入门](sharing-docker.md)。
