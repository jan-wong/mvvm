(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.MVVM = factory());
}(this, (function () { 'use strict';

/**
 * @description 一系列工具方法
 */
const type = function (obj) {
  return Object.prototype.toString.call(obj).toLowerCase();
};

const textReg = /\{\{(.*)\}\}/;

/**
 * @description Dep 一个发布者类型的实现
 */
let uid = 0;

class Dep {
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

/**
 * @description Observer类型 对data数据进行递归遍历，给每个属性设置setter/getter，setter中进行注册订阅者操作，getter中进行通知订阅者更新操作
 */
class Observer {
  constructor(data, vm) {
    this.walk(data);
  }

  // 遍历data对象
  walk(data) {
    Object.keys(data).forEach(key => {
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
        console.log(dep);
        // 发布者通知订阅者更新
        dep.notify();
      }
    });
  }
}

/**
 * watcher 一个订阅者类型
 */
let uid$1 = 0;

class Watcher {
  constructor(vm, expOrFn, cb) {
    this.id = uid$1++;
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
    console.log(value);
    Dep.target = null;
    return value;
  }

  // 把自身注册到指定发布者
  addDep(dep) {
    console.log(dep);
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

/**
 * @description compile 编译模板 
 */
class Compile {
  constructor(vm, el) {
    this.$vm = vm;
    this.$el = this.isElement(el) ? el : document.querySelector(el);

    if (this.$el) {
      this.$fragment = this.node2Fragment(this.$el);
      this.compileNode(this.$fragment);
      this.$el.appendChild(this.$fragment);
    }
  }

  // 把挂载元素的子节点添加到文档片段对象中，并返回此文档对象
  node2Fragment(dom) {
    const fragment = document.createDocumentFragment();
    let firstChild;

    while (firstChild = dom.firstChild) {
      fragment.appendChild(firstChild);
    }
    return fragment;
  }

  // 深度遍历fragment
  compileNode(el) {
    const childNodes = el.childNodes;

    [].slice.call(childNodes).forEach(child => {
      let textResult;
      if (this.isTextNode(child) && (textResult = textReg.exec(child.nodeValue))) {
        this.compileText(child, textResult[1]);
      } else if (this.isElement(child)) {
        this.compileAttrs(child);
        if (child.childNodes.length) this.compileNode(child);
      }
    });
  }

  // 编译节点属性
  compileAttrs(node) {
    const attrs = node.attributes;

    [].slice.call(attrs).forEach(attr => {
      let attrName = attr.name;
      let attrVal = attr.value;

      if (this.isDirective(attrName)) compileDir[attrName.slice(2)](this.$vm, node, attrVal);
      if (this.isAttrDirective(attrName)) compileDir[attrName.slice(1)](this.$vm, node, attrVal);
      if (this.isEventDirective(attrName)) compileDir.event(this.$vm, node, attrName.slice(1), attrVal);

      node.removeAttribute(attrName);
    });
  }

  compileText(node, exp) {
    compileDir.text(this.$vm, node, exp);
  }

  isDirective(val) {
    return val.indexOf('v-') === 0;
  }

  isAttrDirective(val) {
    return val.indexOf(':') === 0;
  }

  isEventDirective(val) {
    return val.indexOf('@') === 0;
  }

  isElement(node) {
    return node.nodeType === 1;
  }

  isTextNode(node) {
    return node.nodeType === 3;
  }
}

// 编译指令
const compileDir = {
  text(vm, node, exp) {
    this.bind(vm, node, exp, 'text');
  },
  html(vm, node, exp) {
    this.bind(vm, node, exp, 'html');
  },
  class(vm, node, exp) {
    this.bind(vm, node, exp, 'class');
  },
  model(vm, node, exp) {
    this.bind(vm, node, exp, 'model');

    let val = this._getVal(vm, exp);
    node.addEventListener('input', e => {
      let newVal = e.target.value;
      console.log(val, newVal);
      if (val === newVal) return;

      this._setVal(vm, exp, newVal);
    }, false);
  },
  eventHandler(vm, node, eventType, exp) {
    node.addEventListener(eventType, vm.$methods[exp], false);
  },
  bind(vm, node, exp, dir) {
    domUpdate[dir](node, this._getVal(vm, exp));
    new Watcher(vm, exp, function (value, oldValue) {
      console.log(`watcher: {{value}}`);
      domUpdate[dir](node, value);
    });
  },
  _getVal(vm, exp) {
    let val = vm.$data;
    const expArr = exp.split('.');
    expArr.forEach(item => {
      val = val[item];
    });
    return val;
  },
  _setVal(vm, exp, value) {
    let val = vm.$data;
    const expArr = exp.split('.');
    expArr.forEach((item, i) => {
      if (i < expArr.length - 1) {
        val = val[item];
      } else {
        val[item] = value;
        console.log(vm.$data);
      }
    });
  }
};

// 更新dom
const domUpdate = {
  text(node, value) {
    node.textContent = value;
  },
  html(node, value) {
    node.innerHTML = value;
  },
  class(node, value) {
    node.className = value;
  },
  model(node, value) {
    console.log(value);
    node.value = value;
  }
};

/**
 * @author Jan<543050768@qq.com>
 * @description 构建一个mvvm类型
 */
class MVVM {
  constructor(options) {
    this.$el = options.el;
    this.$data = options.data;
    this.$methods = options.methods || {};

    new Observer(this.$data);
    new Compile(this, this.$el);
  }
}

return MVVM;

})));
