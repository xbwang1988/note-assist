/**
 * Jest 全局 setup — 每次测试前清理 localStorage
 */
beforeEach(() => {
  localStorage.clear();
});
