---
title: 后端面向对象与 TypeScript
status: unread
direction: technical-development
---

# 后端面向对象与 TypeScript

> 本文整合自“产研后端第一次内训-面向对象程序设计”讲义（作者：仙人掌），并补充了 TypeScript 示例。讲义中的 Flutter/Dart 代码截图用于说明代码规范；本文用 TypeScript 重写相关示例。

## 写代码时先注意这些

### 命名与注释

- 变量和函数使用 `camelCase`，例如 `playerName`、`getPlayer()`。
- 类、接口和类型使用 `PascalCase`，例如 `Player`、`Animal`。
- 常量通常使用全大写加下划线，例如 `MAX_HP`。
- 注释用来解释意图和复杂逻辑，不要逐行复述代码。普通行内说明使用 `//`，较长说明可以使用 `/* ... */` 或文档注释。
- 用 `TODO` 标出尚未完成的功能，用 `FIXME` 标出已知问题，并写清具体事项；不要让它们代替真正的修复。

```ts
// TODO: 支持玩家切换武器
// FIXME: 离开房间后需要重置当前房间状态
```

### 结构、日志与测试

- 尽量减少多层嵌套。多个明确的分支可以用 `switch` 表达；把长函数拆成职责清楚的小函数。
- 一行不要塞入太多逻辑，但也不必为了短行把一个表达式拆成许多行；优先保证容易阅读。
- 调试时不要到处留下 `console.log`。项目中应选用日志框架，在关键流程按需要记录 `debug`、`info`、`warn` 或错误信息，并输出到合适的位置。
- 功能完成后，在有余力时为关键逻辑补充单元测试，检查实际结果是否符合预期。

### npm 包管理器

JavaScript 和 TypeScript 项目常用 npm 管理依赖和运行脚本。讲义提供了两篇入门参考：[npm 包管理器文章（CSDN）](https://blog.csdn.net/2301_79985178/article/details/140573837)和[知乎专栏](https://zhuanlan.zhihu.com/p/686389408)。

## 面向过程与面向对象

面向过程（Procedure Oriented）关注解决问题的步骤：先把任务拆成函数，再按顺序调用这些函数。它开销小、执行直接，适合流程清楚、性能要求高的场景。

面向对象（Object Oriented）把问题中的实体抽象成对象，由对象保存状态并提供行为。它适合围绕业务实体组织较大的程序，便于分工和扩展。使用哪种方式要看问题本身；面向对象并不会自动让程序更快或更简单。

设计面向对象程序时，通常先找出需要操作的对象，再明确对象的属性、行为，以及对象之间的关系（也叫数据建模）。复杂业务中也可以先用 UML 图梳理角色和关系。

## 类、对象与实例

类描述一类对象共有的属性和方法；根据类创建出的具体对象叫实例。下面用汽车举例：

```ts
class Car {
  engine: string

  constructor(engine: string) {
    this.engine = engine
  }

  display(): void {
    console.log(`发动机为：${this.engine}`)
  }
}

const car = new Car('Engine 1')
car.display()
```

`engine` 是属性，`display` 是方法，`new Car(...)` 创建了一个 `Car` 实例。

## 继承与方法重写

继承表示一个类在已有类的基础上扩展能力。已有类叫父类或基类，新类叫子类或派生类。TypeScript 使用 `extends` 声明继承；子类可以调用 `super` 访问父类构造函数或方法，也可以重写方法：

```ts
class Printer {
  print(): void {
    console.log('父类的 print 方法')
  }
}

class StringPrinter extends Printer {
  override print(): void {
    super.print()
    console.log('子类的 print 方法')
  }
}

const printer: Printer = new StringPrinter()
printer.print()
```

继承适合表达明确的“是一种”关系。若只是想共享少量能力，接口或组合通常更灵活。

## 封装与访问控制

封装把对象的状态和操作集中在类中，并限制外部随意改动内部状态。外部通过公开方法与对象交互，类可以在这些方法中检查输入并维持自身状态的有效性。

TypeScript 常用以下访问控制修饰符：

- `public`：公开访问；默认访问级别。
- `protected`：类自身和子类可以访问。
- `private`：只允许定义它的类访问。

```ts
class Student {
  private grade = 0

  constructor(public readonly name: string) {}

  setGrade(value: number): void {
    if (value < 0 || value > 100) {
      throw new Error('成绩必须在 0 到 100 之间')
    }
    this.grade = value
  }

  getGrade(): number {
    return this.grade
  }
}

const student = new Student('小明')
student.setGrade(90)
console.log(student.getGrade())
// student.grade = 101 // 编译错误：grade 是 private
```

`readonly` 属性只能在声明时或构造函数中赋值，之后不能重新赋值。接口中也可以声明只读属性和可选属性，见下文。

## 多态

多态指不同对象可以响应同一个操作，但各自给出不同实现。调用方使用共同的接口，不必知道对象内部的具体类型：

```ts
interface Notifier {
  send(message: string): void
}

class ConsoleNotifier implements Notifier {
  send(message: string): void {
    console.log(message)
  }
}

function notify(notifier: Notifier, message: string): void {
  notifier.send(message)
}

notify(new ConsoleNotifier(), '任务完成')
```

同一个 `send` 调用可以由不同通知方式实现，例如控制台、邮件或其他服务。

## TypeScript 接口

TypeScript 的 `interface` 描述对象应具有的属性、方法及其类型。它能检查对象形状是否符合约定，让错误更早出现在编译阶段。接口本身不会生成运行时对象。

### 描述对象结构

```ts
interface User {
  id: number
  name: string
  email: string
}

const user: User = {
  id: 1,
  name: 'Alice',
  email: 'alice@example.com',
}
```

`User` 规定对象要包含 `id`、`name` 和 `email`，并且类型要相符。

### 约束类的实现

类使用 `implements` 表示自己遵守某个接口。编译器会检查类是否提供了接口要求的属性和方法：

```ts
interface Animal {
  name: string
  makeSound(): void
}

class Dog implements Animal {
  constructor(public name: string) {}

  makeSound(): void {
    console.log('Woof!')
  }
}

const dog = new Dog('Buddy')
dog.makeSound()
```

### 描述函数类型

接口也可以约定函数的参数和返回值：

```ts
interface Greet {
  (name: string): string
}

const sayHello: Greet = (name) => `Hello, ${name}`
console.log(sayHello('Alice'))
```

### 结构类型与鸭子类型

TypeScript 主要按结构判断类型：对象只要具有所需的属性和方法，就可以传给相应函数，不要求它必须继承某个特定类。这种方式也称为鸭子类型。

```ts
interface Point {
  x: number
  y: number
}

function addPoints(p1: Point, p2: Point): Point {
  return { x: p1.x + p2.x, y: p1.y + p2.y }
}

const result = addPoints({ x: 3, y: 4 }, { x: 5, y: 1 })
// addPoints({ x: 1 }, { x: 4, y: 3 }) // 编译错误：缺少 y
```

### 可选属性与只读属性

在属性名后加 `?` 表示该属性可以省略；加 `readonly` 表示初始化后不能重新赋值：

```ts
interface Vehicle {
  readonly make: string
  model: string
  year?: number
}

const vehicle: Vehicle = { make: 'Toyota', model: 'Corolla' }
vehicle.model = 'Camry' // 可以修改
// vehicle.make = 'Honda' // 编译错误：make 是只读属性
```

### 接口继承

接口可以通过 `extends` 组合。子接口会包含父接口的要求，并能添加自己的属性：

```ts
interface Person {
  name: string
}

interface Employee extends Person {
  employeeId: number
}

const employee: Employee = { name: 'Alice', employeeId: 12345 }
```

### 为第三方 JavaScript 库补充类型

有些 JavaScript 库没有内置 TypeScript 类型。可以通过类型声明描述库提供的对象和方法，让 TypeScript 代码获得类型检查。讲义将其列为扩展了解内容；实际使用时优先查找该库维护者提供的类型声明。

## 面向对象的主要特性

- **封装（Encapsulation）**：把数据和操作集中在对象中，通过明确的接口访问状态，避免外部代码随意改动内部实现。
- **继承（Inheritance）**：让子类沿用并扩展父类的能力，适用于明确的类型层级。
- **多态（Polymorphism）**：不同实现通过同一接口提供相同操作，调用方不必依赖具体实现。

## 面向对象设计原则：SOLID

这些原则帮助代码保持职责清楚、便于扩展。它们是设计时的参考，不是每段代码都必须强行套用的规则。

- **单一职责原则（SRP, Single Responsibility Principle）**：一个类或模块聚焦一项职责，避免一个类包办许多互不相关的功能。
- **开闭原则（OCP, Open-Closed Principle）**：对扩展开放、对修改关闭。新增客户端能力时，尽量通过抽象扩展，而不是反复改动稳定的服务端实现。
- **里氏替换原则（LSP, Liskov Substitution Principle）**：子类应能替换父类使用，并遵守父类对行为的约定。例如，若所有员工都能参加年会抽奖，新员工也应遵守同一规则。
- **依赖倒置原则（DIP, Dependency Inversion Principle）**：高层业务依赖抽象，具体实现依赖同一抽象；不要让核心逻辑直接绑定某个底层实现。
- **接口隔离原则（ISP, Interface Segregation Principle）**：调用方不应依赖用不到的接口。把大而全的接口拆成调用方真正需要的小接口。

## 综合练习

下面两个作业来自讲义。重点是练习对象建模、接口、继承和设计原则；命令和输出可以自行调整。

### T1：龙与魔法（基础）

用 TypeScript 实现一个简单的战斗规则。讲义认为此题的设计空间较大，建议有余力的同学挑战 T2。

角色与规则：

- 玩家可以是战士（`Fighter`）、法师（`Mage`）或龙骑士（`Dragoon`）。
- 怪物可以是兽人（`Orc`）、精灵（`Elf`）或龙（`Dragon`）；怪物有血量。
- 战士受到兽人攻击时，伤害减半。
- 精灵受到法师攻击时，伤害减半。
- 主程序创建若干玩家和怪物，让双方可以互相攻击，并能观察攻击后的血量等结果。

基础要求：代码风格清楚、注释有用，并能查看攻击后的结果。

选做扩展：

- 给玩家增加护甲，不同类型的护甲提供不同效果。
- 增加武器，例如剑（`Sword`）和法杖（`Staff`）；玩家可装备或切换武器。武器有攻击力和伤害类型，例如物理或火焰，也可以设计更细的类型。
- 增加规则：兽人受到物理攻击时伤害减半；精灵受到冰属性攻击时伤害减半；龙免疫物理和魔法攻击，但龙骑士攻击龙时可以造成双倍伤害。
- 使用日志框架记录战斗过程并写入文件。

### T2：Adventure 命令行游戏（进阶）

实现一个命令行冒险游戏。玩家要探索城堡中的房间，找到被关押的公主，并带她离开城堡。可以有多个楼层和多个房间；每种房间有自己的出口。

游戏规则：

- 玩家从大厅开始。程序显示当前房间名称、出口数量和出口名称，例如：

  ```text
  Welcome to the lobby. There are 3 exits: east, west and up.
  Enter your command:
  ```

- 玩家通过 `go east` 一类的命令选择出口，进入相邻房间后，程序继续显示该房间的信息。
- 城堡中有多个房间，其中一间有怪物，怪物的具体位置未知。玩家进入怪物所在房间时，游戏结束。
- 公主在一间秘密房间里。玩家找到她后会看到对话，并与她一起离开。
- 离开城堡的唯一出口是大厅；找到公主后，玩家还需要找到返回大厅的路线。
- 输入和输出都使用英文。

基础要求：代码风格清楚、注释有用；至少有 3 种不同房间，房间总数至少为 5；公主和怪物的位置每次随机决定。

选做扩展：房间总数由用户输入或配置文件决定；使用日志框架并输出到文件；支持多层城堡。

## 原讲义参考链接

- [npm 包管理器文章（CSDN）](https://blog.csdn.net/2301_79985178/article/details/140573837)
- [npm 包管理器文章（知乎）](https://zhuanlan.zhihu.com/p/686389408)
- [面向对象设计原则（CSDN）](https://blog.csdn.net/qq_34760445/article/details/82931002)

## 学习衔接

先学习[TypeScript 基础](environment-typescript.md)，再用这些概念练习业务建模，然后学习[HTTP、API 与爬虫](backend-http-api.md)；需求和对象关系可参考[UML 建模](../product-operations/uml.md)。
