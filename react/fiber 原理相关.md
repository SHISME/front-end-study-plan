## 目的

fiber 是 react 重构之后的核心。他的核心目标主要是为了，扩大其适用性，包括动画，布局和手势。

核心修改的部分包含下面5个：

- 把可中断的工作拆分成小任务
- 对正在做的工作调整优先次序、重做、复用上次（做了一半的）成果
- 在父子任务之间从容切换（yield back and forth），以支持React执行过程中的布局刷新
- 支持render()返回多个元素
- 更好地支持error boundary

> 因为JavaScript在浏览器的主线程上运行，恰好与样式计算、布局以及许多情况下的绘制一起运行。如果JavaScript运行时间过长，就会阻塞这些其他工作，可能导致掉帧。

## 关键特性

- 增量渲染（把渲染任务拆分成块，匀到多帧）
- 更新时能够暂停，终止，复用渲染任务
- 给不同类型的更新赋予优先级
- 并发方面新的基础能力

增量渲染用来解决掉帧的问题，渲染任务拆分之后，每次只做一小段，做完一段就把时间控制权交还给主线程，而不像之前长时间占用。这种策略叫做cooperative scheduling（合作式调度），操作系统的3种任务调度策略之一（Firefox还对真实DOM应用了这项技术）

## fiber与fiber tree

React运行时存在3种实例：

```
DOM 真实DOM节点
-------
Instances React维护的vDOM tree node
-------
Elements 描述UI长什么样子（type, props）

```

### instance

Instances是根据Elements创建的，对组件及DOM节点的抽象表示，vDOM tree维护了组件状态以及组件与DOM树的关系

在首次渲染过程中构建出vDOM tree，后续需要更新时（setState()），diff vDOM tree得到DOM change，并把DOM change应用（patch）到DOM树

### fiber 版本

Fiber之前的reconciler（被称为Stack reconciler）自顶向下的递归mount/update，无法中断（持续占用主线程），这样主线程上的布局、动画等周期性任务以及交互响应就无法立即得到处理，影响体验

Fiber解决这个问题的思路是把渲染/更新过程（递归diff）拆分成一系列小任务，每次检查树上的一小部分，做完看是否还有时间继续下一个任务，有的话继续，没有的话把自己挂起，主线程不忙的时候再继续


### fiber tree

增量更新需要更多的上下文信息，之前的vDOM tree显然难以满足，所以扩展出了fiber tree

```
DOM
    真实DOM节点
-------
effect
    每个workInProgress tree节点上都有一个effect list
    用来存放diff结果
    当前节点更新完毕会向上merge effect list（queue收集diff结果）
- - - -
workInProgress
    workInProgress tree是reconcile过程中从fiber tree建立的当前进度快照，用于断点恢复
- - - -
fiber
    fiber tree与vDOM tree类似，用来描述增量更新所需的上下文信息
-------
Elements
    描述UI长什么样子（type, props）

```

fiber tree上各节点的主要结构（每个节点称为fiber）如下：

```
// fiber tree节点结构
{
    stateNode,
    child,
    return,// return表示当前节点处理完毕后，应该向谁提交自己的成果（effect list）
    sibling,
    ...
}


```

## Fiber reconciler

reconcile过程分为2个阶段（phase）：

- （可中断）render/reconciliation 通过构造workInProgress tree得出change
- （不可中断）commit 应用这些DOM change

### render/reconciliation

以fiber tree为蓝本，把每个fiber作为一个工作单元，自顶向下逐节点构造workInProgress tree（构建中的新fiber tree）

具体过程如下（以组件节点为例）：

- 如果当前节点不需要更新，直接把子节点clone过来，跳到5；要更新的话打个tag
- 更新当前节点状态（props, state, context等）
- 调用shouldComponentUpdate()，false的话，跳到5
- 调用render()获得新的子节点，并为子节点创建fiber（创建过程会尽量复用现有fiber，子节点增删也发生在这里）
- 如果没有产生child fiber，该工作单元结束，把effect list归并到return，并把当前节点的sibling作为下一个工作单元；否则把child作为下一个工作单元
- 如果没有剩余可用时间了，等到下一次主线程空闲时才开始下一个工作单元；否则，立即开始做
- 如果没有下一个工作单元了（回到了workInProgress tree的根节点），第1阶段结束，进入pendingCommit状态

实际上是1-6的工作循环，7是出口，工作循环每次只做一件事，做完看要不要喘口气。工作循环结束时，workInProgress tree的根节点身上的effect list就是收集到的所有side effect（因为每做完一个都向上归并）

所以，构建workInProgress tree的过程就是diff的过程，通过requestIdleCallback来调度执行一组任务，每完成一个任务后回来看看有没有插队的（更紧急的），每完成一组任务，把时间控制权交还给主线程，直到下一次requestIdleCallback回调再继续构建workInProgress tree

### requestIdleCallback

> 通知主线程，要求在不忙的时候告诉我，我有几个不太着急的事情要做

### commit

第2阶段直接一口气做完：

- 处理effect list（包括3种处理：更新DOM树、调用组件生命周期函数以及更新ref等内部状态）
- 出对结束，第2阶段结束，所有更新都commit到DOM树上了

### 生命周期hook

生命周期函数也被分为2个阶段了：

```
// 第1阶段 render/reconciliation
componentWillMount
componentWillReceiveProps
shouldComponentUpdate
componentWillUpdate

// 第2阶段 commit
componentDidMount
componentDidUpdate
componentWillUnmount

```

第1阶段的生命周期函数可能会被多次调用，默认以low优先级（后面介绍的6种优先级之一）执行，被高优先级任务打断的话，稍后重新执行

### fiber tree与workInProgress tree

双缓冲技术（double buffering），就像redux里的nextListeners，以fiber tree为主，workInProgress tree为辅

双缓冲具体指的是workInProgress tree构造完毕，得到的就是新的fiber tree，然后喜新厌旧（把current指针指向workInProgress tree，丢掉旧的fiber tree）就好了

## 六.优先级策略

每个工作单元运行时有6种优先级：

- synchronous 与之前的Stack reconciler操作一样，同步执行
- task 在next tick之前执行
- animation 下一帧之前执行
- high 在不久的将来立即执行
- low 稍微延迟（100-200ms）执行也没关系
- offscreen 下一次render时或scroll时才执行

这样的优先级机制存在2个问题：

- 生命周期函数怎么执行（可能被频频中断）：触发顺序、次数没有保证了
- starvation（低优先级饿死）：如果高优先级任务很多，那么低优先级任务根本没机会执行（就饿死了）

第1个问题正在解决（还没解决），生命周期的问题会破坏一些现有App，给平滑升级带来困难，Fiber团队正在努力寻找优雅的升级途径

这两个问题本身不太好解决，只是解决到什么程度的问题。比如第一个问题，如果组件生命周期函数掺杂副作用太多，就没有办法无伤解决。这些问题虽然会给升级Fiber带来一定阻力，但绝不是不可解的

## 总结

React在一些响应体验要求较高的场景不适用，比如动画，布局和手势

根本原因是渲染/更新过程一旦开始无法中断，持续占用主线程，主线程忙于执行JS，无暇他顾（布局、动画），造成掉帧、延迟响应（甚至无响应）等不佳体验





