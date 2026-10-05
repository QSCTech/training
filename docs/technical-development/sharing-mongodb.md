---
title: 技术分享：MongoDB 入门
status: unread
direction: technical-development
---

# 技术分享：MongoDB 入门

MongoDB 是文档型 NoSQL 数据库，数据以 BSON 文档存放在集合中。它适合结构经常变化、需要快速迭代的场景；是否使用它应由查询和一致性需求决定。

```js
db.todos.insertOne({ title: '阅读文档', completed: false })
db.todos.find({ completed: false }).sort({ _id: -1 })
db.todos.updateOne({ title: '阅读文档' }, { $set: { completed: true } })
```

文档设计要从访问模式出发。频繁查询的字段建立索引，注意索引和嵌入文档带来的存储成本。权限、备份、连接字符串和生产数据保护与其他数据库一样重要。

## 练习

- [ ] 为用户和待办设计嵌入或引用方案，并说明理由。
- [ ] 为一个列表查询选择索引字段。
- [ ] 对比 MongoDB 文档模型和 MySQL 表模型的取舍。

## 学习衔接

与[数据库、MySQL 与 Prisma](backend-database-mysql-prisma.md)比较模型，再按项目的查询需求选型。
