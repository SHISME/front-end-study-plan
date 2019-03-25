## react-redux原理分析

Redux作为一个通用模块，主要还是用来处理应用中state的变更，而展示层不一定是React。
但当我们希望在React+Redux的项目中将两者结合的更好，可以通过react-redux做连接。

react-redux是一个轻量级的封装库，核心方法只有两个：
- Provider
- connect

### Provider

Provider模块的功能并不复杂，主要分为以下两点：

#### 在原应用组件上包裹一层，使原来整个应用成为Provider的子组件

```javascript
  constructor(props) {
    super(props)

    const { store } = props

    this.state = {
      storeState: store.getState(),
      store
    }
  }
```
#### 接收Redux的store作为props，通过context对象传递给子孙组件上的connect

```javascript

  render() {
    const Context = this.props.context || ReactReduxContext

    return (
      <Context.Provider value={this.state}>
        {this.props.children}
      </Context.Provider>
    )
  }
```

#### 订阅store并在变化的时候通过跟新state来通知组件

```javascript

subscribe() {
    const { store } = this.props

    this.unsubscribe = store.subscribe(() => {
      const newStoreState = store.getState()

      if (!this._isMounted) {
        return
      }

      this.setState(providerState => {
        // If the value is the same, skip the unnecessary state update.
        if (providerState.storeState === newStoreState) {
          return null
        }

        return { storeState: newStoreState }
      })
    })
}
```

#### 传递store

context可以使子孙组件直接获取父级组件中的数据或方法，而无需一层一层通过props向下传递。context对象相当于一个独立的空间，父组件通过getChildContext()向该空间内写值；定义了contextTypes验证的子孙组件可以通过this.context.xxx，从context对象中读取xxx字段的值。

### connect

正如这个模块的命名，connect模块才是真正连接了React和Redux。

现在，我们可以先回想一下Redux是怎样运作的：首先需要注册一个全局唯一的store对象，用来维护整个应用的state；当要变更state时，我们会dispatch一个action，reducer根据action更新相应的state。

connect 其实和 provider 一样，connect 封装了Consumer。

1. connect通过context获取Provider中的store，通过store.getState()获取整个store tree 上所有state。
2. connect模块的返回值wrapWithConnect为function
3. wrapWithConnect返回一个ReactComponent对象Connect，Connect重新render外部传入的原组件WrappedComponent，并把connect中传入的mapStateToProps, mapDispatchToProps与组件上原有的props合并后，通过属性的方式传给WrappedComponent。

#### mapStateToProps

mapStateToProps(state,props)必须是一个函数。
参数state为store tree中所有state，参数props为通过组件Connect传入的props。
返回值表示需要merge进props中的state。

#### mapDispatchToProps

mapDispatchToProps(dispatch, props)可以是一个函数，也可以是一个对象。
参数dispatch为store.dispatch()函数，参数props为通过组件Connect传入的props。
返回值表示需要merge进props中的action。

### React如何响应store变化

react-redux才是真正触发React重新渲染的模块，那么这一过程是怎样实现的呢？
刚刚提到，connect模块返回一个wrapWithConnect函数，wrapWithConnect函数中又返回了一个Connect组件。Connect组件的功能有以下两点：

1. 包装原组件，将state和action通过props的方式传入到原组件内部
2. 监听store tree变化，使其包装的原组件可以响应state变化



