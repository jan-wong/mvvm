/**
 * @description 一系列工具方法
 */
export const type = function(obj) {
  return Object.prototype.toString.call(obj).toLowerCase();
}

export const textReg = /\{\{(.*)\}\}/;