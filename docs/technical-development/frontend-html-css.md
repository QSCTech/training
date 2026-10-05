---
title: HTML 与 CSS
status: unread
direction: technical-development
---

# HTML 与 CSS

## HTML：页面结构

HTML 是标记语言，用元素表达页面结构。一个元素通常由开始标签、内容和结束标签组成；属性用于补充元素信息。

```html
<main class="card">
  <h1>训练进度</h1>
  <p id="summary">已完成 2 个节点</p>
  <a href="./index.html">查看详情</a>
</main>
```

语义化元素（如 `main`、`nav`、`article`、`button`）能帮助无障碍工具和后续维护。表单控件要有明确的 `label`，图片应提供有意义的 `alt` 文本。

## CSS：页面样式

CSS 通过选择器选择元素，并设置属性：

```css
.card {
  max-width: 36rem;
  margin: 2rem auto;
  padding: 1.5rem;
  border: 1px solid #d0d7de;
  border-radius: 0.75rem;
}

.card h1 { color: #1769aa; }
```

样式可以写在元素的 `style` 属性、页面的 `<style>` 中或独立的 `.css` 文件中。项目中优先使用外部样式表，以便复用和维护。

## 布局与响应式

先掌握盒模型、`display`、`margin`、`padding`、`flex` 和 `grid`。使用相对单位和媒体查询适配不同屏幕：

```css
.list { display: grid; grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr)); gap: 1rem; }
@media (max-width: 600px) { .card { margin: 1rem; } }
```

## 练习

- [ ] 创建一个包含标题、列表、表单和按钮的语义化页面。
- [ ] 使用外部 CSS 完成卡片布局，并在窄屏幕下测试。
- [ ] 用浏览器开发者工具检查盒模型和计算后的样式。

## 学习衔接

继续学习[JavaScript、DOM 与现代框架](frontend-javascript-dom.md)；实现页面前对照[产品经理概论与 PRD](../product-operations/product-introduction-prd.md)检查用户流程。
