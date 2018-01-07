/**
 * @description compile 编译模板 
 */
import { Watcher } from './watcher';
import { textReg } from './utils';

export default class Compile {
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

    while(firstChild = dom.firstChild) {
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
      if (val === newVal) return;

      this._setVal(vm, exp, newVal);
    }, false);
  },
  eventHandler(vm, node, eventType, exp) {
    node.addEventListener(eventType, vm.$methods[exp], false);
  },
  bind(vm, node, exp, dir) {
    domUpdate[dir](node, this._getVal(vm, exp));
    new Watcher(vm, exp, function(value, oldValue) {
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
      }
    });
  }
}

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
    node.value = value;
  }
}