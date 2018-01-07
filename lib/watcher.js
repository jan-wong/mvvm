/**
 * watcher 一个订阅者类型
 */
import Dep from './dep';
let uid = 0;

export class Watcher {
  constructor(vm, expOrFn, cb) {
    this.id = uid++;
    this.depIds = {};
    this.vm = vm;
    this.expOrFn = expOrFn;
    this.cb = cb;

    this.value = this.get();
  }

  // 获取exp表达式的值
  getExp() {
    const expArr = this.expOrFn.split('.');
    let obj = this.vm.$data;
    expArr.forEach(item => {
      obj = obj[item];
    });

    return obj;
  }

  // 将订阅者注册到所有父类属性的发布者并返回值
  get() {
    Dep.target = this;
    let value = this.getExp();
    Dep.target = null;
    return value;
  }

  // 把自身注册到指定发布者
  addDep(dep) {
    if (!this.depIds.hasOwnProperty(dep.id)) {
      dep.addSub(this);
      this.depIds[dep.id] = true;
    }
  }

  // 更新操作
  update() {
    let value = this.getExp();
    let oldValue = this.value;

    if (value !== oldValue) {
      this.value = value;
      this.cb(value, oldValue);
    }
  }
}