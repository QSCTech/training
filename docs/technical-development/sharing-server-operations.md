---
title: 技术分享：服务器运维
status: unread
direction: technical-development
---

> 前面的话：\
> 服务器运维高度依赖于经验与实操，本文比起运维指南，更像是一个命令速查手册，不建议大家逐字阅读，背诵一些基本命令即可（也可以LLM启动！）\
> 依我个人看来，大家最需要关注的是1.2的排查思路，以及'九'的案例分析\
> 此处推荐大家一个实操网站，可以去玩玩看
> https://sadservers.com/scenarios

# Linux 服务器常见故障排查与运维命令

> 适用环境：Ubuntu / Debian / CentOS / Rocky Linux 等主流 Linux 服务器  
> 前置知识：Linux 基础命令、进程管理、Docker 基础  

---

## 一、服务器故障排查的基本思路

服务器出现异常时，应该先确定故障范围，再逐步定位原因。

### 1.1 常见故障分类

| 故障类型 | 常见现象 | 排查方向 |
|---|---|---|
| 服务故障 | Nginx、MySQL、Redis 无法启动 | systemctl、journalctl |
| 网络故障 | SSH 无法连接、网站无法访问 | IP、路由、端口、防火墙 |
| CPU 异常 | CPU 使用率持续较高 | top、ps、mpstat |
| 内存异常 | 内存不足、进程被终止 | free、vmstat、dmesg |
| 磁盘异常 | 磁盘空间不足、写入失败 | df、du、iostat |
| 日志异常 | 应用报错、服务频繁重启 | tail、grep、journalctl |
| 权限异常 | Permission denied | ls、id、stat |
| DNS 异常 | 域名无法解析 | dig、nslookup |

### 1.2 推荐的排查顺序
检查系统资源（CPU、内存、磁盘、进程）\
检查服务状态\
查看系统与应用日志\
检查网络与端口\
修复并验证\
ps:修复成功后建议记录故障与解决方案（比如写进产研的飞书）

例如，网站无法访问时，应优先检查服务、端口和网络（比如端口是不是导错了）；服务器整体卡顿时，应优先检查系统资源（比如磁盘和数据库是不是又爆炸了）。


## 二、服务器日志管理

Linux 服务器的日志主要包括：

- 系统日志：记录系统运行事件。
- 服务日志：记录 Nginx、MySQL 等服务的运行状态。
- 安全日志：记录用户认证、SSH 登录等事件。
- 应用日志：记录业务程序的运行情况。

### 2.1 常见日志目录

| 日志路径 | 主要用途 | 常见系统 |
|---|---|---|
| `/var/log/` | 系统日志存放目录 | 通用 |
| `/var/log/messages` | 常规系统事件 | RHEL 系 |
| `/var/log/syslog` | 系统日志 | Debian / Ubuntu |
| `/var/log/nginx/access.log` | Nginx 访问日志 | 安装 Nginx 的系统 |
| `/var/log/nginx/error.log` | Nginx 错误日志 | 安装 Nginx 的系统 |
| `/var/log/mysql/` | MySQL 相关日志 | 依配置而定 |
| `/var/log/secure` | 安全与认证日志 | RHEL 系 |
| `/var/log/auth.log` | 用户认证和 SSH 日志 | Debian / Ubuntu |



### 2.2 实时查看日志

使用 `tail -f` 持续观察日志文件末尾的新内容。

```bash
tail -f app.log
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

如果日志文件会轮转，推荐：

```bash
tail -F /var/log/nginx/error.log
```

区别：

- `-f`：跟踪当前文件。
- `-F`：按文件名持续跟踪，适合日志轮转场景。


### 2.3 查看最近日志

```bash
# 最近 100 行
tail -n 100 app.log

# 最近 500 行
tail -n 500 app.log

# 查看文件开头
head -n 50 app.log
```
这些操作本质上还是要熟悉shell语法

### 2.4 搜索错误信息

```bash
# 搜索包含 ERROR 的日志
grep "ERROR" app.log

# 忽略大小写
grep -i "error" app.log

# 显示匹配行及前后5行
grep -C 5 "ERROR" app.log

# 搜索多种关键字
grep -Ei "error|failed|timeout" app.log
```

结合管道进行过滤：

```bash
tail -n 1000 app.log | grep -i error
```

### 2.5 查看系统内核日志

```bash
dmesg
```

查看最近的内核事件：

```bash
dmesg -T | tail -n 50
```

常用于检查：

- 硬件异常
- 磁盘 I/O 错误
- 内存不足
- 驱动异常
- OOM Killer 事件


---

## 三、网络故障排查

网络故障可能出现在 IP 配置、路由、DNS、端口、防火墙或应用服务等不同层面，这里要求学习计网知识。

### 3.1 查看 IP 地址

```bash
ip addr
```

简化输出：

```bash
ip -br addr
```



重点关注：

- 网卡是否处于 UP 状态。
- 是否配置了正确的 IP。
- 是否存在异常的网络接口。

### 3.2 查看路由表

```bash
ip route
```

查看到某个目标 IP 使用的路由：

```bash
ip route get 8.8.8.8
```

重点关注：

- 是否存在默认路由。
- 默认网关是否正确。
- 数据包是否通过预期网卡发送。

### 3.3 测试网络连通性

```bash
ping 8.8.8.8
ping example.com
```

两者的区别：

- `ping 8.8.8.8`：测试到目标 IP 的 ICMP 连通性。
- `ping example.com`：还涉及域名解析。

注意：ping 失败不一定意味着网络故障，部分服务器或防火墙会禁止 ICMP。

### 3.4 测试 TCP 端口

```bash
nc -vz 192.168.1.10 3306
```
`-v` 显示详细信息 
`-z` 仅检查端口，不传输应用数据

也可以使用：

```bash
telnet 192.168.1.10 3306
```

但 telnet 不一定默认安装，且不适合传输敏感信息。

### 3.5 查看监听端口

```bash
ss -lntp
```

参数说明：

- `-l`：仅显示监听状态。
- `-n`：使用数字形式显示地址和端口。
- `-t`：显示 TCP。
- `-p`：显示对应进程。

示例：

```bash
ss -lntp | grep ':8080'
```

如果服务没有监听预期端口，需要进一步检查：

1. 服务是否启动。
2. 服务配置是否正确。
3. 是否监听了错误的 IP。
4. 启动过程中是否出现异常。

### 3.6 查看所有 TCP 连接

```bash
ss -antp
```

```bash
ss -s
```

常见 TCP 状态：

| 状态 | 含义 |
|---|---|
| LISTEN | 等待连接 |
| ESTABLISHED | 连接已建立 |
| TIME_WAIT | 等待连接关闭后的超时 |
| CLOSE_WAIT | 对端已关闭，等待本地程序关闭连接 |
| SYN_SENT | 正在发起连接 |

大量 `CLOSE_WAIT` 可能意味着应用没有及时关闭连接，但需要结合业务情况判断。

### 3.7 查看端口占用

```bash
lsof -i:8080
```

也可以使用：

```bash
ss -lntp | grep ':8080'
```

典型问题：

```text
Address already in use
```

通常表示应用尝试绑定的地址和端口已经被其他进程占用。

排查流程：

```bash
# 查找端口占用
sudo lsof -iTCP:8080 -sTCP:LISTEN -n -P

# 查看进程详情
ps -fp PID
```

确认进程用途后，再决定是否修改端口或停止冲突服务。

### 3.8 HTTP 请求测试

```bash
curl http://127.0.0.1:8080
```

只查看响应头：

```bash
curl -I http://example.com
```

查看详细请求过程：

```bash
curl -v http://example.com
```

查看 HTTP 状态码：

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8080
```

常见状态码：

| 状态码 | 含义 |
|---|---|
| 200 | 请求成功 |
| 301 / 302 | 重定向 |
| 403 | 拒绝访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |
| 502 | 网关或上游服务异常 |
| 503 | 服务暂时不可用 |
| 504 | 网关等待上游响应超时 |

### 3.9 DNS 解析

```bash
nslookup example.com
dig example.com
```

查看简洁结果：

```bash
dig +short example.com
```

如果 IP 可以访问，但域名无法访问，应优先检查 DNS。

### 3.10 路由追踪

```bash
traceroute example.com
tracepath example.com
```

用于观察数据包经过的网络路径。

注意：部分中间路由器不响应探测包，因此出现 `*` 不一定代表实际通信中断。

---

## 四、systemd 服务管理

在现代 Linux 发行版中，systemd 是常见的系统和服务管理器。

`systemctl` 用于管理服务，`journalctl` 用于查看 systemd journal 中的日志。

### 4.1 查看服务状态

```bash
systemctl status nginx
systemctl status mysql
systemctl status redis
```

可能出现的状态：

| 状态 | 含义 |
|---|---|
| active (running) | 服务正在运行 |
| inactive (dead) | 服务未运行 |
| failed | 服务运行失败 |
| activating | 服务正在启动 |
| deactivating | 服务正在停止 |

注意：`active (exited)` 也可能是正常状态，常见于一次性执行的服务。

### 4.2 启动、停止与重启

```bash
sudo systemctl start nginx
sudo systemctl stop nginx
sudo systemctl restart nginx
sudo systemctl reload nginx
```
最常用）
`restart` 和 `reload` 的区别：

- `restart`：停止并重新启动服务，可能中断连接。
- `reload`：通知服务重新加载配置，通常不需要完整重启，但取决于服务是否支持。

修改 Nginx 配置后，推荐先检查语法：

```bash
sudo nginx -t
```

确认无误后：

```bash
sudo systemctl reload nginx
```

### 4.3 查看服务列表

```bash
systemctl list-units --type=service
```

只查看运行中的服务：

```bash
systemctl list-units --type=service --state=running
```

查看失败的服务：

```bash
systemctl --failed
```

查看所有已安装的服务单元文件：

```bash
systemctl list-unit-files --type=service
```

### 4.5 查看服务日志

```bash
journalctl -u nginx
```

查看最近 100 条：

```bash
journalctl -u nginx -n 100
```

实时跟踪：

```bash
journalctl -u nginx -f
```

查看本次启动以来的日志：

```bash
journalctl -b
```

查看本次启动以来 Nginx 的日志：

```bash
journalctl -b -u nginx
```

查看指定时间范围：

```bash
journalctl -u nginx --since "1 hour ago"
```

查看错误级别日志：

```bash
journalctl -p err -b
```

查看近期日志并跳转到末尾：

```bash
journalctl -xe
```

### 4.6 服务启动失败的排查流程

假设 Nginx 无法启动。

第一步：检查状态。

```bash
systemctl status nginx
```

第二步：检查日志。

```bash
journalctl -u nginx -n 100 --no-pager
```

第三步：检查配置。

```bash
sudo nginx -t
```

第四步：检查端口。

```bash
sudo ss -lntp | grep -E ':80|:443'
```

第五步：修复原因后启动。

```bash
sudo systemctl start nginx
```

第六步：验证服务。

```bash
systemctl is-active nginx
curl -I http://127.0.0.1
```

---

## 五、CPU 与进程故障排查

CPU 使用率过高是服务器运行缓慢的常见原因之一。

但 CPU 使用率高并不一定代表故障，需要结合负载、进程状态和业务情况判断。

### 5.1 查看服务器整体负载

```bash
uptime
```

输出示例：

```text
10:30:01 up 15 days, 2 users, load average: 1.20, 0.85, 0.70
```

三个数字分别表示：
最近 1 分钟平均负载、最近 5 分钟平均负载、最近 15 分钟平均负载。

Linux Load Average 主要反映处于可运行状态以及不可中断睡眠状态的任务数量平均值。

它不等同于 CPU 使用率。

例如：

一台具有 4 个逻辑 CPU 的服务器，持续出现 Load Average = 8，说明需要进一步检查 CPU 竞争或 I/O 等待等问题。

### 5.2 查看 CPU 核心数量

```bash
nproc
```

查看 CPU 详细信息：

```bash
lscpu
```

重点关注：

- CPU(s)
- Core(s) per socket
- Socket(s)
- Thread(s) per core
- CPU 型号

### 5.3 使用 top 观察进程

```bash
top
```

常用交互操作：

|---|---|
| `P` | 按 CPU 使用率排序 |
| `M` | 按内存使用率排序 |
| `1` | 显示每个逻辑 CPU |
| `H` | 切换线程显示 |
| `q` | 退出 |


```text
%Cpu(s)
load average
Tasks
MiB Mem
MiB Swap
```

CPU 统计中的常见字段：

| 字段 | 含义 |
|---|---|
| us | 用户态 CPU 时间占比 |
| sy | 内核态 CPU 时间占比 |
| id | CPU 空闲时间占比 |
| wa | 等待 I/O 的 CPU 时间占比 |
| st | 虚拟机被宿主机占用的 CPU 时间占比 |

### 5.4 查找 CPU 占用最高的进程

```bash
ps aux --sort=-%cpu | head
```

查找内存占用最高的进程：

```bash
ps aux --sort=-%mem | head
```

查看指定进程：

```bash
ps -fp PID
```

查看进程启动参数：

```bash
ps -p PID -o pid,ppid,user,%cpu,%mem,etime,args
```

### 5.5 查看进程内部线程

```bash
top -H -p PID
```

作用：

查看指定进程内部各线程的 CPU 使用情况。

也可以使用：

```bash
ps -L -p PID -o pid,tid,pcpu,stat,comm
```

### 5.6 查看 CPU 使用趋势

安装 sysstat 后：

```bash
mpstat -P ALL 1
```

含义：

- `-P ALL`：显示所有逻辑 CPU。
- `1`：每秒输出一次统计。

如果只有某个 CPU 长期满载，而其他 CPU 空闲，可能存在单线程瓶颈或 CPU 亲和性配置问题。

---

## 六、内存故障排查

### 6.1 查看内存使用情况

```bash
free -h
```

示例：

```text
               total    used    free   shared  buff/cache  available
Mem:            16Gi    8Gi     1Gi     1Gi      7Gi        7Gi
Swap:            4Gi    0Gi     4Gi
```

重点关注：

- `total`：总内存。
- `used`：已使用内存。
- `free`：完全空闲内存。
- `buff/cache`：缓冲与缓存相关内存。
- `available`：估计可供新程序使用的内存。
- `Swap`：交换空间使用情况。

Linux 会利用空闲内存进行缓存，因此 `free` 很低不一定代表内存不足。

判断内存压力时，应重点结合 `available`、Swap 活动和 OOM 日志。

### 6.2 查看内存与系统活动

```bash
vmstat 1
```

重点字段：

| 字段 | 含义 |
|---|---|
| r | 等待运行的任务数量 |
| b | 处于不可中断睡眠的任务数量 |
| si | 从 Swap 换入内存的数据量 |
| so | 从内存换出到 Swap 的数据量 |
| wa | CPU 等待 I/O 的时间占比 |

如果 `si`、`so` 持续较高，同时系统明显变慢，可能存在内存压力。

### 6.3 检查 OOM

OOM（Out of Memory）表示系统或受限内存环境无法满足内存分配需求。

Linux 可能通过 OOM Killer 终止某些进程。

检查内核日志：

```bash
journalctl -k -b | grep -iE 'out of memory|oom|killed process'
```

也可以使用：

```bash
dmesg -T | grep -i oom
```

注意：容器或 cgroup 内存限制触发的 OOM，可能需要结合容器事件和 cgroup 指标分析。

---

## 七、磁盘故障排查

### 7.1 查看磁盘容量

```bash
df -h
```

重点关注：

- 文件系统容量。
- 已使用空间。
- 可用空间。
- 挂载点。

查看 inode 使用情况：

```bash
df -i
```

如果 inode 耗尽，即使磁盘仍有剩余空间，也可能无法创建新文件。

### 7.2 查找占用空间较大的目录

```bash
du -sh /var/log
```

查看指定目录下各项大小：

```bash
du -h --max-depth=1 /var/log
```

按大小排序：

```bash
sudo du -h --max-depth=1 /var | sort -h
```

注意：`du` 扫描大型目录可能产生明显的磁盘 I/O，生产环境应谨慎使用。

### 7.3 查看磁盘 I/O

安装 sysstat 后：

```bash
iostat -xz 1
```

重点指标：

| 指标 | 含义 |
|---|---|
| r/s | 每秒读请求数 |
| w/s | 每秒写请求数 |
| r_await | 平均读请求等待时间 |
| w_await | 平均写请求等待时间 |
| %util | 设备处理 I/O 的时间占比 |

注意：

`%util` 接近 100% 不一定代表 SSD 或并行存储已经达到性能极限，需要结合延迟、吞吐量和设备类型判断。

### 7.4 磁盘满了怎么办？

推荐排查流程：

```bash
# 1. 检查文件系统
df -h

# 2. 检查 inode
df -i

# 3. 定位大目录
sudo du -h --max-depth=1 /var | sort -h

# 4. 检查日志目录
sudo du -h --max-depth=1 /var/log | sort -h

# 5. 查看 journal 占用
journalctl --disk-usage
```

如果日志占用过大，应检查日志轮转策略，而不是直接删除正在使用的日志文件。

另外，已删除但仍被进程打开的文件，也可能继续占用磁盘空间：

```bash
sudo lsof +L1
```

---

## 八、Docker 容器故障排查

对于通过 Docker 部署的服务，需要区分宿主机问题和容器内部问题。

### 8.1 查看容器运行状态

```bash
docker ps
docker ps -a
```


### 8.2 查看容器日志

```bash
docker logs CONTAINER
```

最近 100 行：

```bash
docker logs --tail 100 CONTAINER
```

实时跟踪：

```bash
docker logs -f CONTAINER
```

### 8.3 查看容器资源使用

```bash
docker stats
```


### 8.4 查看容器详细信息

```bash
docker inspect CONTAINER
```

查看退出码：

```bash
docker inspect -f '{{.State.ExitCode}}' CONTAINER
```

查看是否触发 OOM：

```bash
docker inspect -f '{{.State.OOMKilled}}' CONTAINER
```

### 8.5 查看 Docker 磁盘占用

```bash
docker system df
```

注意：不要在不了解数据用途的情况下执行批量清理命令，尤其需要谨慎处理数据卷。

---

## 九、典型故障案例

### 案例一：网站突然无法访问

**故障现象**

浏览器访问网站时出现：

```text
502 Bad Gateway
```

**排查步骤**

第一步：检查 Nginx 状态。

```bash
systemctl status nginx
```

第二步：检查 Nginx 错误日志。

```bash
sudo tail -n 100 /var/log/nginx/error.log
```

第三步：检查后端服务是否运行。

```bash
ss -lntp | grep ':8080'
```

第四步：直接访问后端服务。

```bash
curl -v http://127.0.0.1:8080
```

第五步：如果后端使用 Docker，检查容器。

```bash
docker ps -a
docker logs --tail 100 CONTAINER
```

**可能原因**

- 后端服务崩溃。
- 后端端口配置错误。
- Nginx 上游地址配置错误。
- 后端响应异常。
- 容器不断重启。

**核心思路**

将问题分为代理层和应用层，逐层检查。。

### 案例二：服务器运行缓慢

**故障现象**

SSH 操作卡顿，应用响应变慢。

**排查步骤**

```bash
# 查看整体负载
uptime

# 查看 CPU 占用
top

# 查看内存
free -h

# 查看磁盘空间
df -h

# 查看系统活动
vmstat 1

# 查看磁盘 I/O
iostat -xz 1
```

**分析方向**

| 现象 | 可能原因 |
|---|---|
| CPU 长时间接近满载 | 计算密集型任务、异常进程 |
| Load 很高但 CPU 不忙 | I/O 等待、不可中断睡眠任务 |
| available 内存持续很低 | 内存压力 |
| Swap 频繁换入换出 | 内存压力、工作集超出物理内存 |
| 磁盘延迟持续升高 | 存储瓶颈 |
| 某个进程资源占用异常 | 应用程序问题 |

### 案例三：服务启动失败

**故障现象**

```text
Failed to start nginx.service
```

**排查步骤**

```bash
# 查看服务状态
systemctl status nginx

# 查看服务日志
journalctl -u nginx -n 100

# 检查配置文件
sudo nginx -t

# 检查端口
sudo ss -lntp | grep -E ':80|:443'

# 检查磁盘
df -h
```

**可能原因**

- 配置文件语法错误。
- 端口被其他进程占用。
- 文件权限不足。
- 依赖资源不可用。
- 磁盘空间不足。

---

## 十、服务器日常巡检命令清单

日常巡检可以快速掌握服务器的整体健康状态。

### 10.1 系统信息

```bash
hostnamectl
uptime
uname -a
```

### 10.2 CPU

```bash
nproc
lscpu
top
ps aux --sort=-%cpu | head
```

### 10.3 内存

```bash
free -h
vmstat 1
ps aux --sort=-%mem | head
```

### 10.4 磁盘

```bash
df -h
df -i
lsblk
```

### 10.5 网络

```bash
ip -br addr
ip route
ss -lntp
ss -s
```

### 10.6 服务

```bash
systemctl --failed
systemctl list-units --type=service --state=running
```

### 10.7 日志

```bash
journalctl -p err -b
journalctl -k -b
```

### 10.8 Docker

```bash
docker ps -a
docker stats --no-stream
docker system df
```

---

## 十一、常用命令速查表

| 排查目标 | 命令 |
|---|---|
| 查看服务器负载 | `uptime` |
| 查看 CPU 占用 | `top` |
| 查看高 CPU 进程 | `ps aux --sort=-%cpu` |
| 查看线程 CPU | `top -H -p PID` |
| 查看内存 | `free -h` |
| 查看内存与 I/O 活动 | `vmstat 1` |
| 查看磁盘容量 | `df -h` |
| 查看 inode | `df -i` |
| 查看目录大小 | `du -sh DIR` |
| 查看磁盘 I/O | `iostat -xz 1` |
| 查看 IP | `ip addr` |
| 查看路由 | `ip route` |
| 查看监听端口 | `ss -lntp` |
| 查看端口占用 | `lsof -i:PORT` |
| 测试 TCP 端口 | `nc -vz IP PORT` |
| 测试 HTTP | `curl -v URL` |
| 查询 DNS | `dig DOMAIN` |
| 查看服务状态 | `systemctl status SERVICE` |
| 查看服务日志 | `journalctl -u SERVICE` |
| 实时查看日志 | `tail -F FILE` |
| 搜索日志 | `grep -i ERROR FILE` |
| 查看内核日志 | `journalctl -k -b` |
| 查看容器状态 | `docker ps -a` |
| 查看容器日志 | `docker logs CONTAINER` |
| 查看容器资源 | `docker stats` |

---

## 十二、总结
遇到问题时可能的排查思路：
1. **系统是否正常？** CPU、内存、磁盘？
2. **服务是否正常？** 进程是否运行，systemd 是否报告错误？
3. **日志说明了什么？** 是否存在异常、超时、权限错误或 OOM？
4. **网络是否正常？** IP、端口、DNS 和应用连接是否符合预期？
5. **修复是否有效？** 服务是否恢复，异常是否消失，是否需要持续监控？



---

## 参考资料

1. [Linux man-pages](https://man7.org/linux/man-pages/)
2. [systemd 官方文档](https://systemd.io/)
3. [Docker 官方文档](https://docs.docker.com/)
4. [Nginx 中文文档](https://nginx.org/cn/docs/)
5. [SadServers 故障排查练习](https://sadservers.com/scenarios)
6. [Brendan Gregg — Linux Performance](https://www.brendangregg.com/linuxperf.html)
