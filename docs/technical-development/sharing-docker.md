---
title: 技术分享：Docker 入门
status: unread
direction: technical-development
---

# 技术分享：Docker 入门

Docker 用镜像描述应用及其依赖，用容器运行镜像。它能减少“在我的电脑上可以运行”的环境差异。

## 常用概念

- **镜像**：可复用的只读模板。
- **容器**：镜像运行后的隔离进程。
- **Dockerfile**：构建镜像的步骤。
- **Compose**：用 YAML 编排多个服务。

```sh
docker build -t training-web .
docker run --rm -p 8080:8080 training-web
docker ps
docker logs <container>
```

容器不是虚拟机；应用进程仍共享宿主机内核。不要把密钥写入镜像或提交到仓库，持久化数据应使用卷，生产环境固定基础镜像版本并定期更新。

## 练习

- [ ] 为一个 Node 服务写最小 Dockerfile。
- [ ] 解释 `-p 8080:8080` 的两端分别代表什么。
- [ ] 使用 Compose 启动应用和数据库，并记录环境变量来源。

## 学习衔接

先完成[Shell 与 Linux 基础](shell-basics.md)，再将容器用于项目；服务维护参考[运维实践](sharing-operations.md)。
