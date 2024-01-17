import { getFieldTypeById, fieldValueDiff } from "./field";

/**
 * 字段值变更记录类
 */
class FieldChangeLogger {
  /**
   * @construct
   * @param {Function} [oldValueFn] 一个函数，用于获取字段的初始值，如果未指定将使用一个总是返回undefined的默认函数作为替代
   * @param {Function} [logFormatter] 日志格式化函数，用于输出字段变更日志。如未指定将使用默认函数。函数接受三个参数：字段唯一标识、字段名、变更差异对象。
   */
  constructor(oldValueFn, logFormatter) {
    if (typeof oldValueFn !== "function") {
      console.warn(
        "FieldChangeLogger: 您需要提供一个函数用于获取字段初始值，否则将使用一个总是返回undefined的默认函数作为替代"
      );
      this.getOldValue = () => undefined;
    } else {
      this.getOldValue = oldValueFn;
    }

    if (typeof logFormatter !== "function") {
      this.logFormatter = (fieldId, fieldName, diffResult) =>
        `${fieldName}(${fieldId})发生变更：${JSON.stringify(diffResult)}`;
    } else {
      this.logFormatter = logFormatter;
    }

    this.logMap = new Map();
  }

  /**
   * 当字段值发生变更时调用此方法记录变更
   * @param {string} fieldId 字段唯一标识
   * @param {string} fieldName 字段名
   * @param {any} newValue 变更后的字段值
   * @param {Function} callback 回调函数，记录完变更后会调用此函数
   */
  change(fieldId, fieldName, newValue, callback) {
    const oldValue = this.getOldValue(fieldId);
    const fieldType = getFieldTypeById(fieldId);
    const diffResult = fieldValueDiff(fieldType, newValue, oldValue);

    if (!diffResult.isEqual) {
      this.logMap.set(fieldId, { fieldId, fieldName, diffResult });
    } else {
      this.logMap.delete(fieldId);
    }

    typeof callback === "function" && callback();
  }

  /**
   * 格式化变更记录，生成变更日志文本
   * @param {string} separator 生成日志时分隔每条记录的分隔符，默认为换行\n
   * @returns {string} 变更日志文本
   */
  format(separator = "\n") {
    const formatedLogs = Array.from(this.logMap.values()).map((log) => {
      const { fieldId, fieldName, diffResult } = log;
      return this.logFormatter(fieldId, fieldName, diffResult);
    });

    return formatedLogs.join(separator);
  }

  /**
   * 清除变更记录
   */
  clear() {
    this.logMap.clear();
  }
}

export default FieldChangeLogger;
