---
title: 数据库、MySQL 与 Prisma
status: unread
direction: technical-development
---

# 数据库、MySQL 与 Prisma

> 本文整合自“产研后端第二次内训-数据库入门”讲义（作者：仙人掌），并补充了可直接练习的 SQL 和 Prisma 示例。

## 数据库是什么

数据库是用来保存和管理数据的软件系统。它帮助程序有条理地存储、查询和修改数据，而不必把所有内容都塞进普通文本文件中。

### 常见的数据存储方式

- **关系型数据库（重点掌握）**：数据按表组织，表由行和列组成。表可以通过主键和外键建立关系。常见系统有 SQLite、MySQL、SQL Server 和 PostgreSQL。结构清晰，适合数据之间有明确关系的业务。
- **文档数据库（延伸了解）**：常以 JSON 文档保存数据。不同文档可以有不同字段，结构较灵活，适合字段会随业务变化的场景。
- **键值存储（了解）**：按 `key -> value` 保存和读取数据。Redis 是常见例子。原讲义此处另有示例文字 `Redl/sql-tutorial.html`，看起来不是有效链接，因此只保留为原文备注。

本篇重点学习关系型数据库、MySQL、SQL 和 Prisma。

## 关系型数据库基础

表可以理解为一组结构相同的记录。每一行是一条记录，每一列描述一种属性。以待办事项为例：

| id | title | completed |
| --- | --- | --- |
| 1 | 阅读文档 | false |
| 2 | 完成练习 | true |

- **主键**（Primary Key）唯一标识一行，例如 `id`。
- **外键**（Foreign Key）引用另一张表的主键，用来表示表之间的关系。
- 常见关系有一对一、一对多和多对多。例如，一个用户可以有多条待办事项，就是一对多关系。

列需要选择合适的数据类型，例如整数 `INT`、字符串 `VARCHAR`、布尔值 `BOOLEAN` 和时间 `TIMESTAMP`。约束用于限制数据，例如 `NOT NULL` 表示不能为空，`DEFAULT` 指定默认值。

## SQL 入门

SQL 是操作关系型数据库的常用语言。基本流程包括创建数据库和表、写入数据、查询数据、修改数据和删除数据。常见命令有 `CREATE`、`SELECT`、`INSERT`、`UPDATE` 和 `DELETE`，合称 CRUD（创建、读取、更新、删除）。

```sql
CREATE DATABASE training;

CREATE TABLE todo (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO todo (title) VALUES ('阅读数据库文档');

SELECT id, title
FROM todo
WHERE completed = FALSE
ORDER BY created_at DESC;

UPDATE todo
SET completed = TRUE
WHERE id = 1;

DELETE FROM todo
WHERE id = 1;
```

`WHERE` 用来筛选目标记录。执行 `UPDATE` 或 `DELETE` 前要确认筛选条件；漏掉 `WHERE` 可能会修改或删除整张表的数据。程序写入数据时使用参数化查询，不要把用户输入直接拼接进 SQL，以避免 SQL 注入。索引应服务于实际查询；索引太多会增加写入和维护成本。

SQL 数据类型、主键和外键约束、`SELECT ... WHERE`、`INSERT INTO`、`UPDATE` 和 `DELETE` 都是后端开发的基础内容。讲义推荐的 SQL 入门资料：

- [MySQL 创建数据库教程](https://www.runoob.com/mysql/mysql-create-database.html)
- 原讲义还列有一个 SQL 教程地址：`https://www.runoob.com/sqzju课程：数据库系统`。该地址格式异常，按原文记录，未转换成可点击链接。
- 深入学习关系型数据库可查阅《数据库系统概念》。原讲义中的第三方镜像地址为 `https://zh.singlelogin.re/book/5668770/6f85ac/%E6%95%B0%E6%8D%AE%E5%BA%93%E7%B3%BB%E7%BB%9F%E6%A6%82%E5%BF%B5-%E5%8E%9F%E4%B9%A6%E7%AC%AC6%E7%89%88.html`；按原文保留为文字，不设为可点击入口。

## MySQL：服务端与连接

MySQL 通常以后台服务的形式运行，负责接收请求并读写数据。Workbench 是图形化客户端；命令行工具也是客户端。客户端连接 MySQL 服务后，发送 SQL，由服务端执行并返回结果。Windows 上安装 MySQL 时，可以分别理解为后台服务和用于连接它的工具。

连接数据库时需要指定协议、用户名、密码、主机、端口和数据库名称。常见连接字符串形式如下：

```text
mysql://USER:PASSWORD@HOST:PORT/DATABASE
```

例如：

```text
mysql://janedoe:mypassword@localhost:5432/mydb?connection_limit=5
```

其中 `USER` 和 `PASSWORD` 是登录凭据，`HOST` 和 `PORT` 指向数据库服务，`DATABASE` 是要使用的数据库，问号后的部分是连接参数。上例中的用户名和密码只是示例。不要把包含真实密码的连接字符串提交到 Git 仓库。

讲义列出的 MySQL 安装参考文章如下，具体步骤可能因系统和版本而异：

- [MySQL 安装参考（CSDN）](https://blog.csdn.net/bobo553443/article/details/81383194)
- [MySQL 安装参考（博客园）](https://www.cnblogs.com/oukele/p/10642061.html)

## ORM 与 Prisma

ORM 是 Object-Relational Mapping（对象关系映射）。它把关系型数据库中的表映射为程序中的类或模型，把表中的行映射为对象，让程序能通过代码读写数据，而不必在每处都手写 SQL。TypeORM 是一种 ORM 工具，感兴趣时可阅读[相关文档](https://typeorm.bootcss.com/)。

Prisma 是数据库工具集，包含 ORM 能力，并根据 schema 生成类型安全的客户端。开发者在 Prisma schema 中描述模型，再通过客户端查询和修改数据：

```prisma
model Todo {
  id        Int      @id @default(autoincrement())
  title     String
  completed Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

典型流程是：配置 `DATABASE_URL` → 编写 schema → 创建数据库迁移 → 生成客户端 → 在服务层调用客户端。迁移（migration）用于记录并应用数据库结构的变化，例如创建表或修改列。迁移文件应提交到 Git；不要在生产数据库上随意重置或删除数据。

讲义列出的 Prisma 参考资料：

- [Prisma 中文文档站](https://prisma.nodejs.cn/)
- [MySQL 数据库配置](https://prisma.nodejs.cn/orm/overview/databases/mysql)
- [从头开始：TypeScript 与 MySQL](https://prisma.nodejs.cn/getting-started/setup-prisma/start-from-scratch/relational-databases-typescript-mysql)
- [Prisma Client 增删改查（CRUD）](https://prisma.nodejs.cn/orm/prisma-client/queries/crud)

## 综合练习：题目管理系统

实现一个题目管理系统。程序可以从命令行接收命令，也可以从文件读取命令；为了方便观察执行结果，可以在处理每条命令后暂停约一秒。命令的具体输入格式可以自行设计，但功能需要完整。

基础功能：

1. **添加单选题**：输入题干、选项数量、各选项和正确选项；创建成功后输出题目 ID。
2. **添加多选题**：输入题干、选项数量、各选项、正确答案数量和正确选项；创建成功后输出题目 ID。
3. **删除题目**：根据题目 ID 删除一题。
4. **查询题目**：根据题目 ID 展示题干和选项。
5. **回答题目**：输入题目 ID 和答案，输出 `Right Answer` 或 `Wrong Answer`。

基础质量要求：

- 能完成上述操作。
- 代码结构清楚、命名易懂，并写必要且有用的注释。

进阶要求（选做）：

- 修改题目：根据题目 ID 修改题干、选项或答案。
- 使用日志框架，并将日志输出到文件。
- 支持 `insert question filename.json` 一类的命令，从 JSON 文件读取并添加一道题。
- 支持 `execute filename.txt`，从文本文件批量读取并执行多条管理命令。也可以扩展为读取文件中的数据并一次性批量导入。

开始实现前，先设计题目和选项的数据结构，再决定表之间的关系。一个题目有多个选项，通常可拆成题目表和选项表；查询或回答时通过题目 ID 找到相应选项和正确答案。

## 其他练习

- [ ] 为“用户—待办”设计表结构，并说明主键和外键。
- [ ] 写出查询未完成待办、创建待办和更新状态的 SQL。
- [ ] 用 Prisma schema 表达用户与待办的一对多关系。

## 学习衔接

把数据模型接入[HTTP、API 与爬虫](backend-http-api.md)中的接口，然后用于项目实践；文档型数据可选读[MongoDB 入门](sharing-mongodb.md)。
