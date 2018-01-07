/**
 * @author Jan<543050768@qq.com>
 * @description 构建一个mvvm类型
 */
import Observer from './observer';
import Compile from './compile';

export default class MVVM {
  constructor(options) {
    this.$el = options.el;
    this.$data = options.data;
    this.$methods = options.methods || {};

    new Observer(this.$data);
    new Compile(this, this.$el);
  }
}