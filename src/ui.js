/**
 * UI工具方法
 * @module UI
 */

/**
 * 弹出对话框
 * @static
 * @param {Object} context this上下文
 * @param {"alert" | "confirm" | "show"} type 对话框类型，可选'alert', 'confirm', 'show'
 * @param {string} title 对话框标题
 * @param {string | jsx} content 对话框内容，支持传入jsx
 * @returns {Promise} 点击确认则Promise被resolve，点击取消被reject
 *
 * @example
 * export function didMount() {
 *   dialog(this, "confirm", "操作确认", "确认删除此项数据？").then(() => {
 *     console.log("点击确认");
 *   }).catch(() => {
 *     console.log("点击取消");
 *   });
 *
 *   // content参数也可以传入jsx
 *   dialog(this, "alert", "警告", <p color={{ color: "red" }}>数据将被清除，此操作不可撤销</p>)
 * }
 */
function dialog(context, type, title, content) {
  return new Promise((resolve, reject) => {
    context.utils.dialog({
      type,
      title,
      content,
      footerActions: ["cancel", "ok"],
      onOk: () => {
        resolve();
      },
      onCancel: () => {
        reject();
      },
    });
  });
}

/**
 * 显示加载动画
 * @static
 * @param {Object} context this上下文
 * @param {string} title 提示文本
 * @param {string} size toast尺寸，可选'medium', 'large'
 * @param {boolean} hasMask 是否显示遮罩层，一个遮盖整个页面的半透明黑色背景，可防止用户进行其他操作
 * @returns {Function} 一个函数，调用可关闭加载动画
 *
 * @example
 * export async function onFieldChange({ value }) {
 *   const closeLoading = loading(this, "", "large", true);
 *   // 处理耗时任务
 *   await doSomething(value);
 *   // 任务处理完之后关闭
 *   closeLoading();
 * }
 */
function loading(context, title, size, hasMask = false) {
  return context.utils.toast({
    type: "loading",
    title,
    size,
    hasMask,
  });
}

/**
 * 劫持提交按钮，会在表单提交按钮上方放置一个遮罩，当点击时会调用宜搭JS中export的名为
 * beforeBeforeSubmit的方法。方法执行完成后会模拟点击提交按钮进行正式提交。
 * <br/>
 * ⚠️慎用，一旦宜搭UI变更此方法可能会失效
 * @static
 * @param {Object} context this上下文
 *
 * @example
 * export function didMount() {
 *   hijackSubmit(this);
 * }
 *
 * // 当点击提交时会执行此方法
 * export function beforeBeforeSubmit() {
 *   console.log("before before submit");
 * }
 */
function hijackSubmit(context) {
  const submitBtn = document.querySelector(".deep-form-submit");
  if (!submitBtn) return;

  const wrapper = submitBtn.parentElement;
  wrapper.style.position = "relative";

  const btnBoundingClient = submitBtn.getBoundingClientRect();
  const mask = document.createElement("div");
  mask.style.position = "absolute";
  mask.style.top = submitBtn.offsetTop + "px";
  mask.style.left = submitBtn.offsetLeft + "px";
  mask.style.display = "inline-block";
  mask.style.width = btnBoundingClient.width + "px";
  mask.style.height = btnBoundingClient.height + "px";

  mask.onclick = () => {
    try {
      context.beforeBeforeSubmit;
      submitBtn.click();
    } catch (e) {
      console.log(e.message);
    }
  };

  wrapper.appendChild(mask);
}

export { dialog, loading, hijackSubmit };
