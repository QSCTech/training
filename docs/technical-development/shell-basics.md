---
title: Shell 与 Linux 基础
status: unread
direction: technical-development
---

# Shell 与 Linux 基础

Shell 是通过命令行与操作系统交互的程序。它适合重复执行、组合和自动化操作，也是通过 SSH 管理服务器的基础。

## 常用命令

| 命令 | 用途 |
| --- | --- |
| `pwd` | 查看当前目录 |
| `ls` | 列出目录内容 |
| `cd` | 切换目录 |
| `mkdir` | 创建目录 |
| `cp` / `mv` | 复制 / 移动文件 |
| `rm` | 删除文件（执行前确认路径） |
| `cat` / `less` | 阅读文本 |
| `grep` / `rg` | 搜索文本 |
| `find` | 按条件查找文件 |
| `chmod` | 修改权限 |

路径中的 `.` 表示当前目录，`..` 表示父目录，`~` 表示用户主目录。命令参数和文件名中的空格需要用引号或反斜杠处理。

## 管道与重定向

命令可以用管道把前一个命令的输出交给后一个命令：

```sh
rg "title:" docs | less
cat package.json | rg 'scripts'
```

`>` 会覆盖写入文件，`>>` 会追加写入。脚本中应检查命令是否成功，避免在错误目录执行批量删除。

## WSL、SSH 与 Nginx

Windows 可以使用 WSL 获得 Linux 环境；连接远程机器通常使用 `ssh user@host`。Nginx 常作为反向代理和静态文件服务器：它接收浏览器请求，再把请求转发给后端服务。

## 练习

- [ ] 在终端进入仓库，列出 `docs/` 下的 Markdown 文件。
- [ ] 用 `rg` 找到所有文档标题。
- [ ] 新建一个目录，创建文本文件，再用 `mv` 和 `cat` 操作它。

## 学习衔接

回顾[环境配置与 TypeScript](environment-typescript.md)，然后选择[前端主线](frontend-html-css.md)或[后端主线](backend-oop-typescript.md)；部署时可选读[Docker 入门](sharing-docker.md)。
