## Reflect

`Reflect` 和 `proxy` 对象一样，也是为了用来操作对象用的，设计这个对象主要是为了几个目的

#### 1. 将一些明显属于语言内部的方法放在 `Reflect` 上，例如 `Object.defineProperty`

#### 2. 优化返回结果，`Object.defineProperty` 在遇到无法定义的时候回抛出一个错误，而 `Reflect.defineProperty` 则会返回 `false`
#### 3. 将对对象的操作转化为函数式的

```javascript
// old
'test' in testObject
// Reflect
Reflect.has(testObject, 'test')

// old
delete testObject['test']
// Reflect
Reflect.deleteProperty(testObject, 'test')

```
#### 4. `proxy` 上的方法在 `Relfect` 上都可以找的到


## Reflect Metadata

Reflect Metadata 是 ES7 的一个提案，它主要用来在声明的时候添加和读取元数据。

TS 1.5+ 版本已经支持他了。只需要

- npm i reflect-metadata --save。
- 在 tsconfig.json 里配置 emitDecoratorMetadata 选项。

Relfect Metadata，简单来说，你可以通过装饰器来给类添加一些自定义的信息。然后通过反射将这些信息提取出来。当然你也可以通过反射来添加这些信息。 就像是下面这个例子所示。

```javascript

@Reflect.metadata('name', 'A')
class A {
  @Reflect.metadata('hello', 'world')
  public hello(): string {
    return 'hello world'
  }
}

Reflect.getMetadata('name', A) // 'A'
Reflect.getMetadata('hello', new A()) // 'world'

```

```javascript
function metadata(
  metadataKey: any,
  metadataValue: any
): {
  (target: Function): void;
  (target: Object, propertyKey: string | symbol): void;
};
```

### 用途

其实所有的用途都是一个目的，给对象添加额外的信息，但是不影响对象的结构。这一点很重要，当你给对象添加了一个原信息的时候，对象是不会有任何的变化的，不会多 property，也不会有的 property 被修改了。

### 通过反射获取元数据

目前仅有三种可用：

- 类型元数据使用元数据键"design:type"。
- 参数类型元数据使用元数据键"design:paramtypes"。
- 返回类型元数据使用元数据键"design:returntype"。

### 类型元数据使用元数据键"design:type"。

```javascript

// 先声明如下装饰器
function logType(target: any, key: string) {
    const t = Relect.getMetadata('design:type', target, key)
    console.log(`${key} type: ${t.name}`)
}

class Test {
    @logType
    test: string;
}

```

控制台会输出

```
test type: string
```

#### 参数类型元数据使用元数据键"design:paramtypes"

```javascript

function logParamTypes(target : any, key : string) {
  var types = Reflect.getMetadata("design:paramtypes", target, key);
  var s = types.map(a => a.name).join();
  console.log(`${key} param types: ${s}`);
}  

class Demo {
  @logParameters // apply parameter decorator
  doSomething(
    param1: string,
    param2: number,
    param3: Foo,
    param4: { test: string },
    param5: IFoo,
    param6: Function,
    param7: (a: number) => void
  ): number {
    return 1;
  }
}
// doSomething param types: String, Number, Foo, Object, Object, Function, Function

```

#### 返回类型元数据使用元数据键"design:returntype"
```javascript

Reflect.getMetadata("design:returntype", target, key)

```

## 控制反转依赖注入

通过这个新特性，我们可以很容易的实现控制反转依赖注入

```javascript

 type Constructor<T = any> = new (...args: any[]) => T;

@Injectable()
class TestService {
  constructor(public readonly otherService: OtherService) {}

  testMethod() {
    console.log(this.otherService.a);
  }
}

const Factory = <T>(target: Constructor<T>): T => {
  // 获取所有注入的服务
  const providers = Reflect.getMetadata('design:paramtypes', target); // [OtherService]
  const args = providers.map((provider: Constructor) => new provider());
  return new target(...args);
};

Factory(TestService).testMethod(); // 1


```