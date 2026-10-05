---
title: JavaScript、DOM 与现代框架
status: unread
direction: technical-development
---

# JavaScript、DOM 与现代框架

## 原生 DOM

浏览器把 HTML 解析成 DOM 树。JavaScript 可以查询节点、读取输入、修改文本并监听事件：

```html
<input id="name" placeholder="你的名字">
<button id="greet">问候</button>
<p id="message"></p>
```

```js
const input = document.querySelector('#name')
const message = document.querySelector('#message')
document.querySelector('#greet').addEventListener('click', () => {
  message.textContent = `你好，${input.value.trim()}！`
})
```

更新用户可见文字时使用 `textContent`，不要把未经处理的用户输入写入 `innerHTML`。批量元素可以通过 `querySelectorAll` 遍历。

## 从 jQuery 到组件框架

jQuery 曾经简化了选择器、事件和 Ajax。现代项目通常使用 React、Vue 等组件框架，把页面拆成可复用组件，并让状态变化驱动渲染。学习框架前，应先理解 DOM、事件、异步请求和模块化。

## 模块化与异步

使用 `export` 暴露成员，使用 `import` 引入模块。网络请求返回 Promise，可用 `async/await` 组织异步流程：

```ts
export async function loadTodos(): Promise<string[]> {
  const response = await fetch('/api/todos')
  if (!response.ok) throw new Error(`请求失败：${response.status}`)
  return response.json()
}
```

## 练习

- [ ] 完成一个可以新增、删除和筛选待办事项的页面。
- [ ] 将事件处理、数据处理和渲染拆到不同模块。
- [ ] 为请求失败和空数据状态设计页面提示。

## 学习衔接

在[HTML 与 CSS](frontend-html-css.md)的页面上完成交互后，阅读[HTTP、API 与爬虫](backend-http-api.md)约定数据接口，再进入项目实践。
