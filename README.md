## mvvm (一个MVVM框架)

## 前言

本项目的目的主要是为了阐述MVVM设计模式的实现，并不适用于生产环境。本项目是参考Vue中MVVM的实现方式，在实现上分为3部分：数据劫持、观察者模式、指令解析

### 原理图

![MVVM模式模型图](https://github.com/jan-wong/mvvm/raw/master/images/mvvm.png)

`Model`表示数据部分，负责存储数据

`View`表示UI视图，负责展示界面

`ViewModel`表示视图模型，是Model和View的中间人。

### 数据劫持

Vue通过`Object.defineProperty`接口来实现数据劫持。给`data`对象中的每个属性进行数据劫持，并同时为每个属性实例化一个发布者对象，在Getter中注册订阅者，在Setter中通知订阅者更新。使用数据劫持的优点是可以使用声明式的方式通知订阅者，而不用手动更新。

### 指令解析

Vue解析每个DOM节点上的指令，并给每个指令实例化一个订阅者，如果遇到v-model还会监听相关DOM节点的事件。这样当订阅者接受到通知，就会更新相关DOM的内容，当用户在视图上改变可输入框值时，也会同步更新到Model。

### 观察者模式

观察者模式由发布者和订阅者组成，在MVVM中需要主要的是发布者和订阅者是多对多的关系，一个发布者会被多个订阅者订阅，一个订阅者会注册到多个发布者对象中。

通过以上的方式实现了数据双向绑定，模型和视图的同步更新。



