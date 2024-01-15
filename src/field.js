/**
 * 表单/自定义页面字段相关方法
 * @module Field
 */

/**
 * 激活Tab组件中所有Tab项
 * @static
 * @param {Object} context this上下文
 * @param {string} tabFieldId TAB组件唯一标识符
 */
function activateTabItems(context, tabFieldId) {
  const tab = context.$(tabFieldId);
  const tabItemKeys = tab.indexesCache || [];
  tabItemKeys.reverse().forEach((key) => {
    tab.onTabChange(key);
  });
}

export { activateTabItems };
