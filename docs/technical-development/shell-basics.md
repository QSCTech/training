---
title: 命令行与 Shell 基础
status: unread
direction: technical-development
---

电影里的黑客常常在一个黑色窗口中敲下指令，电脑随即开始工作。这个窗口是什么？里面的文字为什么能让电脑执行操作？

我们平时用鼠标点击文件夹、拖动文件，也可以用文字告诉电脑做同样的事。承载这些文字的窗口通常是**终端**，理解并组织指令的程序叫 **Shell**。这篇教程从两者的区别开始，逐步介绍目录、文件和文本处理，最后把命令组合成自动运行的脚本。

## 如何阅读这篇教程

第 1–3 节介绍环境和基础命令，第 4–5 节解释如何组织数据与命令，第 6 节介绍查帮助和读报错，第 7 节展示脚本。代码和示例数据都写在正文中，可以直接阅读，也可以在自己的示例目录逐行尝试。

代码块中 `#` 后面是 Bash 注释，用来解释命令，运行时会被忽略。代码块下标为“输出”的内容是电脑显示的结果，不要再复制进终端。命令使用英文符号，尤其注意直引号 `"`、单引号 `'` 与中文标点的区别。

遇到疑惑时，可以与大模型、内训老师或中管沟通。提问时附上当前 Shell、完整命令和报错，比只说“运行不了”更容易获得帮助；大模型给出的命令也要先看懂作用再运行。

## 1. 命令行、终端与 Shell 究竟是什么

### 1.1 从“点按钮”到“输入指令”

图形界面（GUI）让你通过窗口、图标和按钮操作电脑，例如在文件管理器中双击一个文件夹。命令行界面（CLI）让你输入文字完成操作，例如输入 `ls` 查看目录内容。两者是与程序交互的不同方式。

命令行的价值在于操作可以准确描述、重复执行和组合。只处理一两个文件时鼠标很方便；要在许多文本中寻找某个词，或每天重复同一组操作时，一条命令或一个脚本往往更容易复用。

“命令行”不是某个固定软件的名字。许多程序都提供命令行界面，你输入的命令可能调用 Shell 自带的功能，也可能启动另一个程序。

### 1.2 终端是输入和显示的地方

终端负责接收键盘输入、显示程序输出。macOS 的“终端”、Windows Terminal 都是终端应用。背景是否黑色、字体是什么颜色，并不决定它能执行哪些命令。

可以把终端理解成接待窗口：你在这里输入文字，也在这里看到结果；实际读懂指令和完成工作的程序运行在窗口里面。一个终端可以开多个标签页，不同标签页还可以运行不同的 Shell。

因此，打开 Windows Terminal 后，里面可能是 PowerShell、命令提示符，也可能是 WSL 中的 Bash。**窗口名字相同，不代表里面使用同一种语法。** [Windows Terminal 官方介绍](https://learn.microsoft.com/en-us/windows/terminal/)

### 1.3 Shell 负责理解、组织和运行命令

Shell 是命令解释器。你按 Enter 后，它会分析输入：要运行什么程序，哪些文字是选项和参数，是否要读取文件或连接其他命令，再安排程序执行。

例如输入 `ls notes` 时，Shell 把 `ls` 识别为命令，把 `notes` 作为参数交给它；ls 再列出这个目录里的内容。输入带有 `|` 或 `>` 的命令时，Shell 还会安排程序之间的数据传递或输出文件。

Shell 也能运行脚本。脚本就是把操作写进文本文件，并加入变量、条件、循环，让电脑按规则执行。Bash、Zsh、PowerShell 都属于 Shell，但各自语法并不完全相同。

```text
键盘输入 → 终端接收 → Shell 分析并运行命令 → 程序产生结果 → 终端显示
```

操作系统负责管理文件、进程和设备，是这些程序运行的基础。Shell 不是操作系统；使用 Bash 也不意味着电脑已经变成 Linux。

### 1.4 Windows 的 CMD、PowerShell 和 Bash

**CMD（命令提示符）** 是 Windows 传统的命令解释器，程序通常是 cmd.exe。它能运行 `dir`、`copy` 等命令和批处理文件，命令及脚本规则与 Bash 不同。

**PowerShell**是功能丰富的 Shell 和自动化工具，适合 Windows 管理，也有跨平台版本。它通常使用 `Get-ChildItem` 等命令，管道经常传递带属性的对象；本文的 Bash 管道主要处理文本。PowerShell 提供一些别名，因而输入 `ls` 也可能有输出，但这不保证 Bash 的 `ls -a`、变量写法或脚本能照搬。[PowerShell 官方介绍](https://learn.microsoft.com/en-us/powershell/scripting/overview)

**Bash**常见于 Linux，也能在 macOS 和 Windows 上使用。本文选择 Bash，是为了让不同系统的同学使用同一套示例，并为以后阅读服务器命令和自动化脚本打下基础。PowerShell 完全可以完成文件操作、搜索和自动化，只是需要使用它自己的命令与语法。

Windows 上有两种常见的 Bash 环境：

- **Git Bash**：随 Git for Windows 安装，提供 Bash 和许多常见命令，直接操作 Windows 文件。首次学习选它比较省事。
- **WSL**：Windows Subsystem for Linux，可以在 Windows 中运行 Linux 发行版环境。已有 WSL 的同学可使用其中的 Bash；它涉及另一套环境和路径，不必为了阅读本文临时安装。

如果只打开了 PowerShell 或 CMD，请先打开 Git Bash，或进入已有的 WSL 环境；本文代码不会因为窗口颜色相同就自动兼容这些 Shell。

### 1.5 macOS 中 Zsh 和 Bash 的关系

macOS 的默认 Shell 通常是 Zsh，Bash 是另一种 Shell。它们都能运行许多常见命令，`pwd`、`cd`、`ls` 等操作很相似；但通配符、数组、配置文件及一些交互行为有差异，脚本不能仅凭“看起来差不多”就换解释器运行。

在 macOS 的“终端”输入 `bash`，按 Enter，即可临时进入 Bash。输入 `exit` 会退出它，回到原来的 Shell。这不会修改系统默认 Shell，无需为了跟读教程更改终端设置。[Apple 的 Shell 说明](https://support.apple.com/guide/terminal/change-the-default-shell-trml113/mac)

### 1.6 打开可以使用的环境

| 你的电脑 | 如何开始 |
| --- | --- |
| Windows | 安装 [Git for Windows](https://git-scm.com/install/windows)，在开始菜单打开 **Git Bash**；已有 WSL 也可使用其中的 Bash |
| macOS | 打开“终端”，输入 `bash`，按 Enter |
| Linux | 打开终端；如果当前使用其他 Shell，输入 `bash`，按 Enter |

在已经进入 Bash 的窗口中执行：

```bash
bash --version  # 显示可用 Bash 的版本；本身不会切换当前 Shell
echo hello     # 在终端输出 hello
date           # 输出电脑当前的日期和时间
```

第一条显示版本信息，第二条输出 hello，第三条随系统时间变化。本文示例兼容 macOS 常见的 Bash 3.2，无需追求与老师完全相同的版本。

输入位置附近的文字叫**提示符**，例如 `user@computer:~$` 或 `bash-3.2$`。它可能显示用户名和目录；示例里省略提示符，你只需输入命令本身。

按 Enter 后，程序通常开始运行；再次出现提示符，表示可以输入下一条。如果迟迟没有提示符，可能是程序仍在工作；`Ctrl+C` 可以请求停止前台程序。若出现 `>` 续行提示，常见原因是引号没闭合，Shell 正在等你继续输入，也可以先按 Ctrl+C 取消。

### 1.7 常用命令先认识一遍

下表用于查阅，后面会分别解释。文件名、目录名是示例，执行时确认对象真实存在。

| 命令示例 | 作用 |
| --- | --- |
| `pwd` | 显示当前目录的完整路径 |
| `ls`、`ls -a` | 列出目录内容；-a 包含隐藏文件 |
| `cd notes`、`cd ..` | 进入 notes；返回上一级目录 |
| `mkdir notes` | 新建目录 |
| `touch note.txt` | 新建空文件，或更新已有文件的时间戳 |
| `cat note.txt` | 显示文本内容 |
| `less note.txt` | 分页阅读文本，按 q 退出 |
| `cp note.txt copy.txt` | 复制文件，来源在前，目标在后 |
| `mv copy.txt draft.txt` | 移动文件，或给文件改名 |
| `rm -i draft.txt` | 询问后删除指定文件 |
| `grep '关键词' note.txt` | 显示包含关键词的行 |
| `wc -l note.txt` | 统计文本行数 |
| `echo hello` | 输出一段简单文字 |
| `exit` | 退出当前 Shell |

小技巧：Tab 可以补全命令、目录或文件名；上下箭头可以找之前输入过的命令。执行前仍要确认目标，尤其是修改或删除文件时。

## 2. 先知道自己在哪里

### 2.1 当前目录：命令的出发点

每次 Shell 会话都有一个**当前工作目录**。很多命令没有写完整路径时，就从这里找文件。因此，同一句 `cat note.txt` 在两个目录运行，可能读到不同文件，也可能报不存在。

当前目录不一定等于编辑器正在显示的文件夹，也不会自动跟随文件管理器改变。先确认位置，再操作文件，可以减少许多莫名其妙的错误。

```bash
pwd    # print working directory，显示当前位置
ls     # list，查看这里有哪些文件和目录
ls -a  # 包括以点开头的隐藏文件
ls -l  # 显示大小、时间、权限等详细信息
```

命令常写成 `命令名 选项 参数`。例如 `ls -a notes` 中，ls 是命令，-a 是改变行为的选项，notes 是查看对象。选项由具体命令定义，不能认为所有命令的 -a 都表示同一件事。

### 2.2 路径：告诉程序去哪里找

**绝对路径**从文件系统根目录开始，完整描述一个位置；**相对路径**从当前目录开始描述位置。例如，当前在 `/Users/name/shell-demo`，相对路径 `notes/todo.txt` 指向 `/Users/name/shell-demo/notes/todo.txt`。

| 写法 | 含义 |
| --- | --- |
| `/` | Unix 风格路径的根目录 |
| `~` | 当前用户的主目录 |
| `.` | 当前目录 |
| `..` | 上一级目录 |
| `/Users/name/shell-demo` | macOS 绝对路径示例；name 换成真实用户名 |
| `notes/todo.txt` | 当前目录下 notes 里面的 todo.txt |

Windows Git Bash 中，`C:\Users\name` 常写成 `/c/Users/name`；WSL 访问 Windows 的 C 盘时常用 `/mnt/c/Users/name`。这是不同环境的表示，不能原样互换。

### 2.3 用一个目录说明导航

下面创建 shell-demo，让示例文件有明确位置。已有同名重要目录时换个名字；后面以这个目录为例，不需要下载素材。

```bash
cd ~                          # 回到自己的主目录
mkdir -p shell-demo           # -p 允许目录已经存在
cd shell-demo                 # 进入目录
mkdir -p notes logs scripts   # 空格分开三个参数，分别创建三个目录
pwd                           # 输出应以 /shell-demo 结尾
ls                            # 应看到 notes、logs、scripts
```

```bash
cd notes  # 进入子目录
pwd       # 路径末尾变为 /shell-demo/notes
cd ..     # 返回 shell-demo
```

cd 是 change directory 的缩写，不带参数时回到主目录。`cd /` 进入文件系统根目录，二者不是同一个位置。`cd notes` 报不存在时，先看 pwd、ls，确认 notes 是否在当前目录下。

### 2.4 空格与引号：一个名字还是多个参数

`mkdir -p notes logs scripts` 一次创建三个目录，是因为 Shell 把空格分隔的文字当成不同参数。想创建一个名为 my notes 的目录，就要告诉 Shell：空格属于名字，而不是分隔符。

```bash
mkdir -p "my notes"  # 双引号把 my notes 包成一个参数
cd "my notes"        # 进入含空格的目录
pwd
cd ..               # 返回 shell-demo
```

省略引号，`mkdir my notes` 会尝试创建 my 和 notes 两个目录；`cd my notes` 则给 cd 传入两个参数，通常报错。引号不会成为文件名的一部分，只影响 Shell 怎样理解输入。

这里写 `'my notes'` 也能保留空格。单双引号在变量展开时有区别，第 5 节会说明。英文直引号成对使用，中文 `“my notes”` 不能替代 Shell 引号。

`"~/shell-demo"` 中的波浪号不会像未引用时那样展开为主目录。需要把主目录路径放进引号时，使用 `"$HOME/shell-demo"`；HOME 是保存主目录路径的变量。

## 3. 创建、查看、编辑和移动文件

### 3.1 创建和查看一份文本

touch 创建空文件，不会写入正文；已有文件再 touch，主要是更新时间戳。可以用编辑器写文字，也可以把命令输出保存到文件。下面的 `>` 是一种保存方式，第 4 节会解释。

在 `~/shell-demo` 中：

```bash
touch notes/todo.txt                      # 创建空文本
printf '今天了解命令行\n' > notes/todo.txt  # 写入一行，覆盖原内容
cat notes/todo.txt                        # 显示正文
```

输出：

```text
今天了解命令行
```

printf 按指定格式输出文字，`\n` 表示换行。cat 读取文件并把内容写到标准输出；这里把它作为查看短文本的工具。

长文件可用 `less notes/todo.txt` 分页看：空格翻页，q 退出。`head -n 5 文件名` 看前五行，`tail -n 5 文件名` 看后五行。PDF、图片等二进制文件用相应查看器，直接 cat 不会得到可读正文。

### 3.2 复制、移动与改名

cp 是 copy，保留原文件并产生副本；mv 是 move，可以移动文件，也可以在同一目录内改名。二者参数顺序都是“来源在前，目标在后”。

```bash
cp notes/todo.txt notes/todo-backup.txt  # 复制一份
mv notes/todo-backup.txt notes/draft.txt # 给副本改名
ls notes                               # 应看到 todo.txt 和 draft.txt
```

目标若是已存在目录，命令通常把来源放进目录；目标若是文件路径，可能覆盖已有文件。初学时可用 `cp -i`、`mv -i` 在覆盖前询问。移动文件不会自动修改其他文本中引用的旧路径。

### 3.3 编辑正文

可以用熟悉的编辑器打开文件、修改后保存。文件管理器、编辑器与 Shell 操作的是同一份磁盘文件；编辑器里尚未保存的文字，cat 通常看不到。

也可以在终端编辑。若环境已提供 Nano，运行 `nano notes/todo.txt`，输入文字后按 Ctrl+O 保存、Enter 确认文件名、Ctrl+X 退出。Vim 也是常见终端编辑器，操作模式不同；可通过 `vimtutor` 学习，不必先掌握它才能阅读本文。

### 3.4 删除前确认对象

rm 删除指定文件。命令行删除通常不经过回收站，所以先确认路径和内容，再执行。

```bash
pwd                   # 确认当前目录
ls notes              # 看清要删除的对象
rm -i notes/draft.txt  # 输入 y 才删除；不想删则输入 n
ls notes              # 确认结果，todo.txt 应仍在
```

`rm -r` 递归删除目录及其内容，`-f` 减少提示并忽略不存在的文件。这些选项有合理用途，但目标范围可能很大；不清楚目录里有什么时先查看和备份，不把 `rm -rf` 当作通用修复命令。

## 4. 文本、管道与重定向

### 4.1 从一段文本理解搜索

日志按行记录事件。下面用五行虚构数据说明搜索：INFO 表示普通信息，WARN 表示警告，ERROR 表示错误。文件由代码创建，不需要另找素材。

先理解写法：cat 没有文件参数时可以读取标准输入；`<<'EOF'` 告诉 Shell，把接下来直到单独一行 EOF 的文本作为输入；`> logs/app.log` 再把 cat 输出的文本保存到文件。

```bash
cat > logs/app.log <<'EOF'
10:00 INFO page loaded
10:01 ERROR login timeout
10:02 INFO note saved
10:03 WARN connection slow
10:04 ERROR asset not found
EOF
```

这种多行输入叫 **here document**。EOF 是自选的结束标记，不是单独运行的命令；换别的名字也可以，但开始和结束必须一致。结尾 EOF 要独占一行、顶格书写；开始标记带单引号，正文中的 `$` 等字符就不会被当成变量展开。第一次看，把它理解为“把这一段文本交给 cat”即可。

grep 从文本中挑出匹配的行；wc -l 统计换行数量，适合这里每行都有换行的日志。

```bash
cat logs/app.log           # 查看全部五行
grep 'ERROR' logs/app.log  # 显示包含 ERROR 的两行
wc -l logs/app.log         # 输出行数 5 和文件名
```

grep 的输出：

```text
10:01 ERROR login timeout
10:04 ERROR asset not found
```

常用选项有 `grep -n` 显示行号、`grep -i` 忽略大小写、`grep -r` 递归搜索目录。grep 默认把搜索内容当作正则表达式；寻找字面文字时可用 `grep -F '文字' 文件名`。

### 4.2 管道：让上一步结果成为下一步输入

直接运行 grep，结果显示在终端。如果还想数出有几行，可以把结果交给 wc，不必手动复制、保存临时文件，再运行第二个程序。这个连接由**管道** `|` 完成。

```bash
grep 'ERROR' logs/app.log | wc -l
```

数据路线是：

```text
日志 → grep 挑出 ERROR 行 → 管道传递这两行文本 → wc -l 数行 → 显示 2
```

左边程序的**标准输出**成为右边程序的**标准输入**。右边收到的是文本数据，不是左边命令的名字，也不是额外的文件名。通常只有最后一个程序的正常结果显示在终端。

再看排序和重复统计：

```bash
printf 'login\ndeploy\nlogin\n' | sort | uniq -c
```

printf 产生三行文字，sort 把相同文字排在一起，uniq 合并相邻重复行，-c 同时记录次数。输出有 `1 deploy` 和 `2 login`，前面可能有对齐空格。先 sort 是因为 uniq 只比较相邻行，不会自动寻找任意位置的重复内容。

### 4.3 标准流：程序如何输入和输出

程序通常有三条约定的数据通道，称为**标准流**：

| 名称 | 编号 | 默认作用 |
| --- | --- | --- |
| 标准输入 stdin | 0 | 接收键盘输入，也可以从文件或管道接收 |
| 标准输出 stdout | 1 | 输出正常结果，通常显示在终端 |
| 标准错误 stderr | 2 | 输出错误或诊断信息，通常也显示在终端 |

stdout 和 stderr 都能显示在屏幕上，肉眼看着像同一种“输出”；但 Shell 可以分别安排它们去哪里。普通 `|` 连接 stdout，不自动把 stderr 也传给右侧程序。

### 4.4 重定向：改变输入和输出的去处

**重定向**把默认通道改到另一个地方。例如，把本应显示在终端的结果写进文件，或把本应从键盘读取的数据改为从文件读取。管道连接两个程序，下面的重定向主要在程序和文件之间传递数据。

| 写法 | 作用 |
| --- | --- |
| `命令 > 文件` | 将 stdout 写入文件；不存在则创建，存在则覆盖 |
| `命令 >> 文件` | 将 stdout 追加到文件末尾 |
| `命令 < 文件` | 从文件读取 stdin |
| `命令 2> 文件` | 将 stderr 写入文件，stdout 仍按原方式输出 |

```bash
grep 'ERROR' logs/app.log > logs/errors.log  # 保存结果，终端不再显示这两行
cat logs/errors.log                        # 查看保存的结果
printf '找到了两条错误\n' > notes/summary.txt
printf '需要分别查看原因\n' >> notes/summary.txt
cat notes/summary.txt                      # 两行；第二条没有覆盖第一条
wc -l < logs/app.log                       # 从 stdin 读日志，只输出数量 5
```

`wc -l logs/app.log` 把文件名交给 wc，所以结果带文件名；`wc -l < logs/app.log` 由 Shell 打开文件作为输入，wc 没拿到文件名参数，所以只显示数量。

错误流可以单独保存：

```bash
ls missing-directory 2> logs/error-message.txt  # 假设此目录不存在
cat logs/error-message.txt                     # 查看报错
```

这没有修复错误，只是把报错保存下来。如果改用 `>`，ls 的错误通常仍显示在终端，因为它默认只改变 stdout。

Shell 先准备重定向目标，再运行命令。因此 `sort file.txt > file.txt` 会先把原文件截空，不能用来原地排序。应先输出到另一个文件，检查后再替换。

需要合并两种输出时，`命令 > all.log 2>&1` 表示先把 stdout 指向 all.log，再让 stderr 指向当前 stdout 的去处。顺序有意义，首次阅读先掌握前面的基本写法即可。

## 5. 变量、引号、PATH 与退出码

### 5.1 变量：为一个值起名字

变量保存一个值，让多处命令使用同一个名字。例如，把长路径写进变量，以后使用和修改都更方便。

```bash
learner="新同学"                 # 赋值，等号两边不加空格
echo "$learner"                 # 取值，在名字前加 $，输出 新同学
project_dir="$HOME/shell-demo"  # HOME 是系统提供的主目录变量
cd "$project_dir"               # 使用这个路径
```

定义时写 `learner=...`，取值时写 `$learner` 或 `${learner}`。如果写成 `learner = ...`，Shell 会把 learner 当成命令，而不是赋值。

### 5.2 引号：决定哪些字符需要解释

引号既能保留空格，也能控制变量是否展开。**双引号**允许 `$变量` 替换为值，同时保留值里的空格；**单引号**保留里面文字的字面含义。

```bash
echo "$learner"  # 输出 新同学
echo '$learner'  # 输出字面文字 $learner
```

路径变量通常写成 `"$project_dir"`。不加引号，值里的空格可能把一个路径拆成多个参数。英文引号成对出现，少一边时 Shell 会继续等你输入。

### 5.3 环境变量与 PATH：程序怎样找到工具

普通 Shell 变量主要供当前 Shell 使用；**环境变量**还会传给由它启动的子程序。export 可以把变量放进环境：

```bash
export COURSE_NAME=qsc-training
```

这通常只影响当前会话和后续子程序，不会自动永久保存到所有终端。关闭终端重新打开，临时设置的值可能不再存在。

**PATH** 是环境变量，记录 Shell 搜索外部程序的目录。输入命令名时，Shell 按规则查找可运行程序；这解释了为什么下载了一个文件，不一定就能直接输入它的名字运行。

```bash
printf '%s\n' "$PATH"  # 搜索目录，在 Bash 环境中通常以冒号分隔
command -v bash       # 查看 Bash 从哪里找到
type cd               # cd 通常显示为 Shell 内建命令
```

cd 等内建命令由 Shell 自己提供，不需要在 PATH 中找同名文件。遇到 command not found，先检查拼写、工具是否安装、搜索路径是否正确；不要用一个新目录覆盖整个 PATH。

### 5.4 退出码：程序报告是否成功

程序结束时返回一个整数，叫**退出码**。通常 0 表示成功，非 0 表示失败或特殊结果；含义由程序定义，不是所有命令都用同一个失败数字。

`$?` 保存上一条命令的退出码，必须紧接着读取：

```bash
ls notes
echo $?  # 目录存在时通常为 0
ls missing-directory
echo $?  # 目录不存在时非 0
```

中间若执行其他命令，`$?` 就变成那条命令的结果。另外，grep 找到匹配通常返回 0，没找到匹配返回 1；“没有匹配”不一定是程序损坏。[grep 退出码说明](https://www.gnu.org/software/grep/manual/html_node/Exit-Status.html)

### 5.5 根据结果决定下一步

`&&` 表示左边成功才运行右边，`||` 表示左边失败才运行右边。这样可以避免上一条失败后仍盲目继续。

```bash
mkdir -p notes/week1 && echo "目录准备好了"
cd missing-directory || echo "目录不存在，仍停留在原位置"
```

普通 Bash 管道的退出码默认取最后一个程序，所以 `grep ... | wc -l` 返回 0，不代表前面每一步都成功。需要检查整条管道时可进一步学 `set -o pipefail`；先理解各程序返回值，再增加这类设置。

## 6. 用帮助和报错定位问题

命令太多，不必一次背完。先理解要做什么，再查工具支持哪些选项，比凭印象拼参数可靠。

```bash
help cd  # Bash 内建命令的帮助
man ls   # 环境提供 man 时，打开 ls 手册；按 q 退出
```

许多外部程序支持 `命令 --help`，但不是所有 macOS 工具都支持。Git Bash 可能没有完整 man，可以查官方文档。在线搜索时带上系统、工具名称和具体报错，避免照搬另一种 Shell 的写法。

| 报错或现象 | 含义与检查方向 |
| --- | --- |
| `command not found` | Shell 没找到命令；检查拼写、安装和 PATH |
| `No such file or directory` | 路径不存在；先 pwd、ls，再核对路径和大小写 |
| `Permission denied` | 当前操作没有所需权限；先确认文件和用户，不立即加 sudo |
| 出现续行提示 `>` | 引号或多行输入没结束；Ctrl+C 取消后检查符号 |
| 文件只剩新的一行 | 可能用了覆盖输出 >；需要追加时使用 >> |
| 同样命令在别人电脑能运行 | 核对 Shell、版本和系统，不能只比较窗口外观 |

向老师、中管或大模型求助时，可以提供“操作系统与 Shell、当前目录、完整命令、实际报错、期望结果”。分享前去掉密码和令牌；收到建议后先确认它会读写哪些文件，再运行。

## 7. 把命令写成自动运行的脚本

### 7.1 脚本为什么能自动化

在终端逐行输入是交互式使用；把命令保存到文件，让 Bash 按顺序执行，就得到脚本。脚本可以用参数处理不同文件，用条件检查输入，用循环减少重复代码。

下面把日志统计写成脚本：读取一份日志，分别数出 INFO、WARN、ERROR 的行数。代码在正文中，不依赖其他教程或下载包。

先认识写法：`$#` 是参数个数，`$1` 是第一个参数，`${1:-logs/app.log}` 表示未提供有效首参数时使用默认路径。`[ -f "$log_file" ]` 检查普通文件，`[ -r "$log_file" ]` 检查可读；方括号两侧要有空格。

`if ...; then ...; fi` 按条件执行；`for ...; do ...; done` 对多个值重复执行。`$(命令)` 叫命令替换，把命令的标准输出作为值，并去掉末尾换行。

### 7.2 一个带注释的完整脚本

用文本编辑器保存为 `~/shell-demo/scripts/summarize-log.sh`，使用纯文本、UTF-8、LF 换行。代码块的三个反引号不是文件内容。

```bash
#!/usr/bin/env bash
# 首行是 shebang：直接运行时，env 从 PATH 寻找 Bash。
# 用法：bash scripts/summarize-log.sh [日志路径]

# 多余参数可能来自未加引号的路径；2 表示用法错误。
if [ "$#" -gt 1 ]; then
  printf '用法：bash summarize-log.sh [日志路径]\n' >&2
  exit 2
fi

# 不传参数时，相对于当前目录寻找 logs/app.log。
log_file="${1:-logs/app.log}"
if [ ! -f "$log_file" ] || [ ! -r "$log_file" ]; then
  printf '日志不存在或不可读：%s\n' "$log_file" >&2
  exit 1
fi

# 每次循环把 level 设置为一个等级，再执行相同的统计。
for level in INFO WARN ERROR; do
  # 两侧空格对应示例中的等级字段；-c 输出匹配行数。
  # 无匹配时 grep 返回 1，但仍输出 0；这里保留这个正常结果。
  count=$(grep -c " $level " "$log_file")
  printf '%s: %s\n' "$level" "$count"
done

exit 0  # 正常完成。
```

### 7.3 运行与理解结果

从示例目录运行，默认读取此前正文创建的日志：

```bash
cd ~/shell-demo
bash scripts/summarize-log.sh
echo $?  # 紧接着检查，应为 0
```

脚本输出：

```text
INFO: 2
WARN: 1
ERROR: 2
```

也可传入其他路径：`bash scripts/summarize-log.sh "logs/another log.log"`。引号保证含空格路径只传一个参数；文件不存在时提示错误并返回 1。默认相对路径以**运行时的当前目录**为起点，不自动以脚本所在目录为起点。

`>&2` 把错误提示送到 stderr，调用者就能分别保存统计结果和报错。exit 立即结束脚本，后面的命令不再执行。

还可以通过文件本身启动：

```bash
chmod u+x scripts/summarize-log.sh  # 为文件所有者增加执行权限
./scripts/summarize-log.sh         # ./ 指定当前目录下的文件
```

`bash 文件` 是主动指定解释器；`./文件` 还依赖执行权限和首行 shebang。Git Bash 在 Windows 文件系统上的权限表现可能不同，用 `bash 文件` 即可。扩展名 .sh 是常见约定，不会自动替你选择正确 Shell。

这个脚本说明了命令、变量、条件和循环如何组合。它只统计符合示例格式的行，不判断错误是否解决；真实日志需要根据格式调整匹配规则。

## 参考与延伸

查语法可读 [GNU Bash 手册](https://www.gnu.org/software/bash/manual/)；想了解 PowerShell 命令和对象管道，可读 [Microsoft PowerShell 文档](https://learn.microsoft.com/en-us/powershell/scripting/overview)。以后需要完整 Linux 环境时，再按 [WSL 官方安装说明](https://learn.microsoft.com/en-us/windows/wsl/install)准备。
