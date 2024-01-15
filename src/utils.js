/**
 * 一些辅助工具方法
 * @module Utils
 */

/**
 * sleep函数，可在异步场景中实现延时或者暂停执行
 * @static
 * @param {number} time sleep时间，单位毫秒
 * @returns {Promise} 一个Promise，在time毫秒后被resolve
 *
 * @example
 * async function batchUpdate(datas) {
 *   // 批量调用接口更新数据，每次更新之间等待1秒钟以防止频繁请求导致接口被限制
 *   for (const data of datas) {
 *     await doUpdate(data);
 *     await sleep(1000);
 *   }
 * }
 */
function sleep(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

/**
 * 函数失败重试 <br/>
 * @static
 * @param {Function} callable 要执行的函数。如果函数抛出异常则进行重试，
 * 支持函数返回Promise，如果返回的Promise被reject则进行重试
 * @param {number} retryTimes 重试次数
 * @param {number} retryDelay 重试延时，单位毫秒，默认300ms
 * @param {...*} args 传递给callable的参数
 *
 * @example
 * async function updateFormData(formData) {
 *   const resp = await doUpdate(formData);
 *   if (resp.error) {
 *     throw Error(resp.error);
 *   }
 * }
 *
 * export async function onClick() {
 *   // 当updateFormData失败时，等待500毫秒再次调用updateFormData，最多重试5次
 *   retrey(() => updateFormData(), 5, 500, { field_123: "value" })
 * }
 */
async function retry(callable, retryTimes = 3, retryDelay = 300, ...args) {
  let times = 0;
  let result;
  let error;
  while (times <= retryTimes) {
    if (times > 0) {
      await sleep(retryDelay);
    }
    try {
      result = callable(...args);
      if (result instanceof Promise) {
        await result;
      }
      return result;
    } catch (e) {
      times += 1;
      error = e;
    }
  }

  let errorMsg = `All ${retryTimes} retries failed.`;
  if (error) errorMsg += `Error: ${error.message}`;
  throw Error(errorMsg);
}

export { sleep, retry };
