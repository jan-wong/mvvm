/**
 * @description Observer类型 对data数据进行递归遍历，给每个属性设置setter/getter，setter中进行注册订阅者操作，getter中进行通知订阅者更新操作
 */
import { type } from './utils';
import Dep from './dep';

export default class Observer {
  constructor(data, vm) {
    this.walk(data);
  }

  // 遍历data对象
  walk(data) {
    Object.keys(data).forEach((key) => {
      this.defineReactive(data, key, data[key]);
    });
  }

  // 对每个属性设置setter/getter并为每个属性值实例化一个发布者对象
  // set: 一旦这个属性被赋值，就会通知订阅者进行更新操作
  // get: 一旦这个属性被访问，订阅者将被注册在相关发布者对象的subs成员中
  defineReactive(data, key, val) {
    if (type(val) === 'object') new Observer(val);
    const dep = new Dep();

    Object.defineProperty(data, key, {
      enumerable: true, //可枚举型
      configurable: true, //可配置性
      get() {
        if (Dep.target) dep.depend();
        return val;
      },
      set(newVal) {
        if (val === newVal) return;
        val = newVal;
        // 如果赋值为object 则对newval进行观察
        if (type(newVal) === 'object') new Observer(newVal);
        // 发布者通知订阅者更新
        dep.notify();
      }
    })
  }
}