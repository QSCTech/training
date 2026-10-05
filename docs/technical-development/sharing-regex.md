---
title: 技术分享：正则表达式
status: unread
direction: technical-development
---

# 技术分享：正则表达式

正则表达式用一个模式匹配文本中的字符组合，可用于搜索、校验、提取和替换。

## 基础语法

| 写法 | 含义 |
| --- | --- |
| `.` | 任意单个字符 |
| `\d` / `\w` / `\s` | 数字 / 单词字符 / 空白 |
| `*`、`+`、`?` | 重复 0 次以上、1 次以上、0 或 1 次 |
| `^`、`$` | 字符串开头、结尾 |
| `[abc]`、`[^abc]` | 字符集合 / 排除集合 |
| `(a|b)` | 分组与或 |

JavaScript 示例：

```js
const email = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
console.log(email.test('user@example.com'))
console.log('a1 b2'.match(/\d/g))
```

复杂表达式应配合注释、测试样例和边界用例。正则适合文本格式校验，不适合解析嵌套结构或代替完整语法分析器。

## 练习

- [ ] 匹配仓库中的 frontmatter 标题行。
- [ ] 提取 Markdown 链接的标题和目标。
- [ ] 为邮箱、手机号和空字符串分别准备通过与不通过样例。

## 学习衔接

把文本处理用于[HTTP、API 与爬虫](backend-http-api.md)中的输入校验与提取；网络请求失败可参考[Wireshark 入门](sharing-wireshark.md)。
