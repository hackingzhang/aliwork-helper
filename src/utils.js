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

/**
 * 判断一个值是否为空 <br/>
 * 这些情况会被判定为空：空字符串、null、undefined、NaN、空数组、空对象、空Map、空Set
 * @static
 * @param {any} value - 任意值
 * @returns {boolean} - 值是否为空
 *
 * @example
 * isEmpty(""); // true
 * isEmpty([]); // true
 * isEmpty(undefined); // true
 * isEmpty(null); // true
 * isEmpty(NaN); // true
 * isEmpty({}); // true
 * isEmpty(new Map()); // true
 * isEmpty(new Set()); // true
 *
 * isEmpty(0); // false
 * isEmpty({a: 1}); // false
 * isEmpty(new Map().set("a", "1")); // false
 */
function isEmpty(value) {
  if (
    value === "" ||
    value === null ||
    value === undefined ||
    (typeof value === "number" && isNaN(value))
  )
    return true;

  if (typeof value === "object") {
    if (Array.isArray(value)) return value.length === 0;
    if (value instanceof Map) return value.size === 0;
    if (value instanceof Set) return value.size === 0;
    if (value instanceof WeakMap) return false;
    if (value instanceof WeakSet) return false;

    // 普通对象
    if (Object.keys(value).length === 0) return true;
  }

  return false;
}

/**
 * 日期格式化
 * @static
 * @param {Date} dateTime Date对象
 * @param {string} format 格式化字符串，遵循ISO8601标准(YYYYY-MM-DDTHH:mm:ss.sssZ)
 *
 * @example
 * dateTimeFormat(new Date(1704067200000), "YYYY年MM月DD日"); // 2024年01月01日
 * dateTimeFormat(new Date(1704067200000), "HH时mm分ss秒sss"); // 08时00分00秒000
 * dateTimeFormat(new Date(1704067200000), "YYYY年MM月DD日 HH时mm分ss秒sss"); // 2024年01月01日 08时00分00秒000
 */
function dateTimeFormat(dateTime, format) {
  if (!dateTime) {
    dateTime = new Date();
  }

  function padStart(str, maxLen = 2) {
    if (typeof str !== "string") {
      str = String(str);
    }
    return str.padStart(maxLen, "0");
  }

  var year = padStart(dateTime.getFullYear(), 4);
  var month = padStart(dateTime.getMonth() + 1);
  var date = padStart(dateTime.getDate());
  var hours = padStart(dateTime.getHours());
  var minutes = padStart(dateTime.getMinutes());
  var seconds = padStart(dateTime.getSeconds());
  var milliseconds = padStart(dateTime.getMilliseconds(), 3);

  var replacement = [
    { key: "YYYY", value: year },
    { key: "MM", value: month },
    { key: "DD", value: date },
    { key: "HH", value: hours },
    { key: "mm", value: minutes },
    { key: "sss", value: milliseconds },
    { key: "ss", value: seconds },
  ];

  for (var item of replacement) {
    format = format.replace(item.key, item.value);
  }

  return format;
}

/**
 * 生成一个（伪）随机ID
 * @static
 * @param {number} length ID长度
 * @returns {string} 生成的ID
 *
 * @example
 * const id = generateRandomId(); // 生成一个32个字符的ID
 * const id = generateRandomId(16); // 生成一个16个字符的ID
 */
function generateRandomId(length = 32) {
  const validChars = "1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let id = "";
  for (let i = 0; i < length; i++) {
    id += validChars[Math.floor(Math.random() * 35)];
  }

  return id;
}

export { sleep, retry, isEmpty, dateTimeFormat, generateRandomId };
