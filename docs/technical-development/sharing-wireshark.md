---
title: 技术分享：Wireshark 入门
status: unread
direction: technical-development
---

# 技术分享：Wireshark 入门

Wireshark 捕获并分析网络数据包，可用于排查 DNS、TCP、HTTP 等协议问题。只分析自己拥有或明确获准的网络流量。

## 基本流程

1. 选择正确的网卡并开始捕获。
2. 产生一个可复现的请求。
3. 用显示过滤器缩小范围。
4. 查看协议层、时间、源地址、目标地址和状态。
5. 导出必要证据，停止捕获并保护数据。

常用过滤器：

```text
http
dns
tcp.port == 443
ip.addr == 192.0.2.10
```

捕获过滤器和显示过滤器用途不同；分析 HTTPS 时通常只能看到加密后的连接元数据，除非拥有合法的解密条件。

## 练习

- [ ] 捕获一次对公开测试站点的 DNS 查询并找到响应。
- [ ] 区分 TCP 三次握手和 HTTP 请求。
- [ ] 写出一次网络故障的现象、过滤器、证据和结论。

## 学习衔接

先了解[HTTP、API 与爬虫](backend-http-api.md)，再用抓包证据定位项目中的网络问题。
