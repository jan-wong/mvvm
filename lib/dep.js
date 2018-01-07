/**
 * @description Dep 一个发布者类型的实现
 */
let uid = 0;

export default class Dep {
  constructor() {
    this.id = uid++;
    this.subs = []; // 存储订阅者的列表
  }

  depend() {
    Dep.target.addDep(this);
  }

  // 添加订阅者
  addSub(sub) {
    this.subs.push(sub);
  }

  // 删除订阅者
  removeSub(sub) {
    const index = this.subs.indexOf(sub);
    if (index !== -1) this.subs.splice(index, 1);
  }

  // 更新订阅者列表
  notify() {
    this.subs.forEach(sub => {
      sub.update();
    });
  }
}

// 标记是否应该添加订阅者对象到subs成员中
Dep.target = null;