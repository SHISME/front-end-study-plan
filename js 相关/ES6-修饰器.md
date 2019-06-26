## Decorator

因为最近要项目中的vue需要整合TS，而vue写TS需要大量使用修饰器的语法，所以这里加强一下对修饰器的理解，修饰器只能对类和类的方法使用。

修饰器的基本语法是这样的

```javascript

@decorator
class A {

}

```

## 类的修饰

### 无参修饰器

```javascript

@test
class A {

}

function test(target) {
    target.isTest = true;
}

A.isTest // true

```

### 有参修饰器

```javascript

@test(false)
class A {

}

function test(isTest) {
    return function(target) {
        target.isTest = isTest;
    }
}

A.isTest = false

```

> 需要注意的是修饰器是在代码编译的时候发生的，而不是在运行时发生的

如果想添加一个实例属性可以这样写装饰器

```javascript

function test(target) {
    target.prototype.isTest = true;
}

@test
class A {}

const a = new A()
a.isTest // true

```

## 方法的修饰器

修饰器不仅可以修饰类，还可以修饰类的属性

方法的修饰器和类的修饰器稍微有点不一样，方法的修饰器会拿到被修饰的方法名以及方法对应的descriptor

**例如**

```javascript

function readOnly(target, name, descriptor) {
    descriptor.writable = false;
    return descriptor;
}

class A {
    @readOnly
    name() {
        return 'A'
    }
}

```



