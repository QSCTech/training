---
title: HTML 与 CSS
status: unread
direction: technical-development
---

# HTML 与 CSS

HTML 负责页面内容和结构，CSS 负责外观和布局。浏览器读取两者后显示网页。做页面时，先用 HTML 把内容和层级写清楚，再用 CSS 调整样式。

## HTML：页面结构

HTML 是标记语言，用元素表达页面结构。大多数元素由开始标签、内容和结束标签组成，属性用于补充信息。新建页面时，可以从下面的基本结构开始：

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>训练进度</title>
    <link rel="stylesheet" href="./style.css">
  </head>
  <body>
    <main class="card">
      <h1>训练进度</h1>
      <p id="summary">已完成 2 个节点</p>
      <a href="./details.html">查看详情</a>
    </main>
  </body>
</html>
```

`class` 通常用于给一组元素添加样式，`id` 用于标记页面中一个特定元素。优先选择表达含义的元素，例如 `main`、`nav`、`article` 和 `button`，不要只用 `div` 包住所有内容。表单控件要有对应的 `label`，图片应提供说明内容的 `alt`。

配套资料：[HTML 讲义（PDF）](assets/HTML.pdf)。

## CSS：页面样式

CSS 通过选择器找到 HTML 元素，再为它设置样式。下面的 `.card` 会选中 `class="card"` 的元素：

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

规则由选择器和一组属性组成。样式可以写在元素的 `style` 属性、页面的 `<style>` 中或独立的 `.css` 文件中；项目中通常用外部样式表，并在 HTML 的 `<head>` 中通过 `<link rel="stylesheet" href="./style.css">` 引入，便于复用和维护。

配套资料：[CSS 讲义（PDF）](assets/CSS.pdf)。

每个元素都可以看作一个盒子：内容外面依次是内边距 `padding`、边框 `border` 和外边距 `margin`。它们会影响元素的尺寸和间距；调试布局时，可以用浏览器开发者工具查看盒模型。

## 布局与响应式

排版时常用 `display`、`margin`、`padding`、`flex` 和 `grid`。例如，`grid` 可以排列卡片；媒体查询可以在屏幕较窄时调整间距和列数：

```css
.card { box-sizing: border-box; }
.list { display: grid; grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr)); gap: 1rem; }
@media (max-width: 600px) { .card { margin: 1rem; } }
```

布局不要只按自己的屏幕尺寸调整。用浏览器开发者工具切换到窄屏宽度，检查文字是否溢出、按钮是否容易点击、内容顺序是否仍然清楚。

## 练习

- [ ] 创建 `index.html` 和 `style.css`，在 HTML 中引入 CSS 文件。
- [ ] 创建包含标题、列表、表单和按钮的页面，使用合适的语义化元素。
- [ ] 用 CSS 完成卡片布局，并检查盒模型与窄屏显示效果。
- [ ] 为表单控件添加 `label`，为有意义的图片添加 `alt`。

## 学习衔接

继续学习[JavaScript、DOM 与现代框架](frontend-javascript-dom.md)；实现页面前对照[产品经理概论与 PRD](../product-operations/product-introduction-prd.md)检查用户流程。
