---
title: 环境配置与 TypeScript
status: unread
direction: technical-development
---

# 环境配置与 TypeScript

## 学习目标

- 能在本机运行 JavaScript 和 TypeScript。
- 理解 TypeScript 是 JavaScript 的超集，知道类型检查发生在开发阶段。
- 能使用 `tsx` 执行一个 `.ts` 文件。

## 环境配置

推荐使用 Node.js 22 LTS（Node.js 20 LTS 也可以）。安装后在终端确认：

```sh
node --version
npm --version
```

安装 TypeScript 运行工具：

```sh
npm config set registry https://registry.npmmirror.com
npm install --global tsx
tsx --version
```

编辑器可使用 Visual Studio Code。初学时只安装语言支持即可，插件应按项目需要添加。

## JavaScript 基础

JavaScript 常用的值包括数字、字符串、布尔值、数组和对象。数组使用 `[]` 创建，对象使用键值对表示：

```js
const names = ['小明', 'Alice']
const student = { name: '小明', score: 90 }
names.push('Élisabeth')
console.log(student.name)
```

常用 API 包括 `trim`、`split`、`map`、`forEach`、`push`、`Number`、`Math.random` 和 `Math.floor`。变量优先使用 `const`，需要重新赋值时使用 `let`。

## TypeScript 类型

类型注解帮助编辑器提前发现错误，但不会在 JavaScript 运行时自动检查：

```ts
type Student = {
  name: string
  score: number
}

function average(students: Student[]): number {
  return students.reduce((sum, student) => sum + student.score, 0) / students.length
}

const classmate: Student = { name: '小明', score: 90 }
console.log(average([classmate]))
```

常见类型有 `number`、`string`、`boolean`、`T[]` 和对象类型。`any` 会关闭类型检查，除非确有必要，不要使用它。

## 练习

- [ ] 安装 Node.js、`tsx` 和 VS Code，并记录版本号。
- [ ] 创建 `students.ts`，把空格分隔的人名转换为 `Student[]`，为每个人生成 0 到 100 的随机分数。
- [ ] 统计分数低于 60 的人数并输出。
- [ ] 思考：怎样让同一个名字每次运行得到相同分数？

## 学习衔接

先学习[Shell 与 Linux 基础](shell-basics.md)；进入方向主线时选择[HTML 与 CSS](frontend-html-css.md)或[后端面向对象](backend-oop-typescript.md)。
