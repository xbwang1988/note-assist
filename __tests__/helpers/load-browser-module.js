/**
 * 用 vm 沙箱加载浏览器全局变量风格的 JS 文件
 * 返回沙箱 context，可从中取出全局变量（class / const 等）
 *
 * 核心技巧：将顶层 const/let 转 var，class 转 var 赋值表达式，
 * 使声明挂到沙箱全局对象上，测试代码可通过 ctx.XXX 访问。
 */
const fs = require('fs');
const vm = require('vm');
const path = require('path');

/**
 * 将顶层 const/let/class 声明转为 var，使其成为沙箱全局属性
 */
function hoistDeclarations(code) {
  return code
    .replace(/^const\s/gm, 'var ')
    .replace(/^let\s/gm, 'var ')
    .replace(/^class\s+(\w+)/gm, 'var $1 = class $1');
}

function loadBrowserModule(filePaths, extraGlobals = {}) {
  const sandbox = {
    console,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    Date,
    Math,
    JSON,
    Object,
    Array,
    String,
    Number,
    RegExp,
    Error,
    TypeError,
    Map,
    Set,
    Promise,
    parseInt,
    parseFloat,
    isNaN,
    isFinite,
    undefined,
    NaN,
    Infinity,
    document: global.document,
    window: global.window,
    localStorage: global.localStorage,
    HTMLElement: global.HTMLElement,
    ...extraGlobals
  };

  const context = vm.createContext(sandbox);

  const files = Array.isArray(filePaths) ? filePaths : [filePaths];
  for (const fp of files) {
    const absPath = path.isAbsolute(fp) ? fp : path.resolve(fp);
    const code = fs.readFileSync(absPath, 'utf-8');
    const hoisted = hoistDeclarations(code);
    vm.runInContext(hoisted, context, { filename: absPath });
  }

  return context;
}

module.exports = { loadBrowserModule };
