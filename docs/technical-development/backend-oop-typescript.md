---
title: 后端面向对象与 TypeScript
status: unread
direction: technical-development
---

# 后端面向对象与 TypeScript

面向对象把问题中的实体抽象为对象：对象拥有状态（属性）和行为（方法），相同结构的对象由类描述。

## 类、封装与继承

```ts
class Student {
  private grade = 0

  constructor(public readonly name: string, private readonly studentId: string) {}

  setGrade(value: number): void {
    if (value < 0 || value > 100) throw new Error('成绩必须在 0 到 100 之间')
    this.grade = value
  }

  getGrade(): number { return this.grade }
}
```

`private` 隐藏实现细节，公共方法提供受控接口。继承用 `extends` 表达“是一个”关系，子类通过 `super` 调用父类构造函数；如果只是共享能力，优先考虑接口和组合。

## 接口与多态

```ts
interface Notifier { send(message: string): void }

class ConsoleNotifier implements Notifier {
  send(message: string): void { console.log(message) }
}
```

调用方只依赖 `Notifier`，因此可以替换具体实现。接口还能描述请求体、数据库记录等数据结构。

## SOLID 与代码规范

- 单一职责：一个模块只有一个主要变化原因。
- 开闭原则：增加行为时优先扩展，不随意修改稳定代码。
- 里氏替换：子类应遵守父类的行为约定。
- 接口隔离：小接口比一个包揽所有能力的大接口更易维护。
- 依赖倒置：业务逻辑依赖抽象，基础设施实现抽象。

变量和函数使用 `camelCase`，类、接口和类型使用 `PascalCase`。关键逻辑写注释，调试信息使用项目的日志工具。

## 练习

- [ ] 为命令行冒险游戏设计 `Room`、`Player` 和 `Monster` 类。
- [ ] 用接口抽象存储层，让内存存储和数据库存储可以互换。
- [ ] 写一个测试，验证成绩校验和异常信息。

## 学习衔接

在[TypeScript 基础](environment-typescript.md)之后练习业务建模，再学习[HTTP、API 与爬虫](backend-http-api.md)；需求关系可参考[UML 建模](../product-operations/uml.md)。
