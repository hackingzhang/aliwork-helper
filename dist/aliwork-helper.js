(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Awh = {}));
})(this, (function (exports) { 'use strict';

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

  /**
   * 表单/自定义页面字段相关方法
   * @module Field
   */


  /**
   * 激活Tab组件中所有Tab项，此方法用于解决在表单上使用Tab组件时嵌套在Tab内的组件会报错，
   * 且无法通过JS API获取组件实例。<br />
   * 一般在 didMount 中调用此函数即可。
   * @static
   * @param {Object} context this上下文
   * @param {string} tabFieldId TAB组件唯一标识符
   *
   * @example
   * export function didMount() {
   *   activateTabItems(this, "tabsLayout_lhzy2spv");
   * }
   */
  function activateTabItems(context, tabFieldId) {
    const tab = context.$(tabFieldId);
    const tabItemKeys = tab.indexesCache || [];
    tabItemKeys.reverse().forEach((key) => {
      tab.onTabChange(key);
    });
  }

  /**
   * 根据字段唯一标识获取字段数据类型
   * @static
   * @param {string} fieldId 字段唯一标识
   * @param {boolean} multiple 字段是否能多选，仅对人员字段有效
   * @returns {string} 字段数据类型
   *
   * @example
   * getFieldDataTypeById("textField_lbd7nz2d"); // string
   * getFieldDataTypeById("employeeField_lm1cl4dk"); // object
   * getFieldDataTypeById("employeeField_lm1cl4dk", true); // array
   */
  function getFieldDataTypeById(fieldId, multiple = false) {
    if (!fieldId) return;

    const fieldType = getFieldTypeById(fieldId);

    let dataType = "string";
    switch (fieldType) {
      case "text":
      case "textarea":
      case "radio":
      case "select":
      case "cascadeSelect":
      case "digitalSignature":
        dataType = "string";
        break;
      case "number":
      case "rate":
      case "date":
        dataType = "number";
        break;
      case "cascadeDate":
      case "address":
        dataType = "object";
        break;
      case "checkbox":
      case "multiSelect":
      case "countrySelect":
      case "image":
      case "attachment":
      case "departmentSelect":
      case "associationForm":
        dataType = "array";
        break;
      case "employee":
        if (multiple) dataType = "array";
        else dataType = "object";
        break;
    }

    return dataType;
  }

  /**
   * 字段类型
   * @typedef {"text" | "textarea" | "number" | "rate" | "radio" | "checkbox" |
   * "date" | "cascadeDate" | "employee" | "departmentSelect" | "select" |
   * "multiSelect" | "cascadeSelect" | "associationForm" | "image" |
   * "attachment" | "digitalSignature" | "countrySelect" | "address"} FieldType
   */

  /**
   * 根据字段唯一标识获取字段类型
   * @static
   * @param {string} fieldId 字段唯一标识
   * @returns {module:Field~FieldType} 字段类型
   *
   * @example
   * getFieldTypeId("textField_lbd7nz2d"); // text
   * getFieldTypeId("departmentSelectField_lbbyyrcy"); // departmentSelect
   */
  function getFieldTypeById(fieldId) {
    if (!fieldId) return;

    const [typePart] = fieldId.split("_");
    let type = typePart.replace("Field", "");

    return type;
  }

  /**
   * 生成部门字段数据，可直接赋值给部门组件<br/ >
   * ⚠️如果传数组作为参数，ID和名称的顺序必须一一对应。<br />
   * 🤯通过数据源获取到的表单数据，部门字段的值就是部门ID和部门名称分开的两个数组，
   * 可以直接将其传入来生成可赋值给部门组件的部门字段数据。
   * @static
   * @param {string | string[]} id 部门ID，接受单个ID字符串或者ID数组
   * @param {string | string[]} name 部门名称，接受单个名称字符串或者名称数组
   * @returns {object} 部门字段数据
   *
   * @example
   * const dpt = generateDptFieldData("047126", "财务部");
   * const dpt = generateDptFieldData(["047126", "048374"], ["财务部", "人事部"]);
   *
   * // 结合数据源使用
   * getFormData(this, "form", "FINST-xxxxxx").then(formData => {
   *   const ids = formData.departmentSelectField_lbbyyrcy_id;
   *   const names = formData.departmentSelectField_lbbyyrcy;
   *
   *   const dpt = generateDptFieldData(ids, names);
   *
   *   this.$("departmentSelectField_lbbxxrcz").setValue(dpt);
   * });
   */
  function generateDptFieldData(id, name) {
    let ids = id;
    let names = name;
    if (typeof id === "string") {
      ids = [id];
      names = [name];
    }

    if (!Array.isArray(ids)) return null;

    return ids.map((id, index) => {
      return {
        text: names[index],
        value: id,
      };
    });
  }

  /**
   * 生成员工字段数据，可直接赋值给员工组件
   * ⚠️如果传数组作为参数，ID和姓名的顺序必须一一对应。<br />
   * 🤯通过数据源获取到的表单数据，员工字段的值就是员工ID和员工姓名分开的两个数组，
   * 可以直接将其传入来生成可赋值给员工组件的员工字段数据。
   * @static
   * @param {string | string[]} id 员工ID，接受单个ID字符串或者ID数组
   * @param {string | string[]} name 员工姓名，接受单个字符串或者字符串数组
   * @returns {object | object[]} 员工字段数据
   *
   * @example
   * const employee = generateEmployeeFieldData("1343242225778381", "张三");
   * const employee = generateEmployeeFieldData(["1343242225778381", "1343242225778382"], ["张三", "李四"]);
   *
   * // 结合数据源使用
   * getFormData(this, "form", "FINST-xxxxxx").then(formData => {
   *   const ids = formData.employeeField_lm1cl4dk_id;
   *   const names = formData.employeeField_lm1cl4dk;
   *
   *   const employee = generateEmployeeFieldData(ids, names);
   *
   *   this.$("employeeField_lm2ckef9").setValue(employee);
   * });
   */
  function generateEmployeeFieldData(id, name, multiple = true) {
    let ids = id;
    let names = name;
    if (typeof id === "string") {
      ids = [id];
      names = [name];
    }

    if (!Array.isArray(ids)) return null;

    if (multiple) {
      return ids.map((id, index) => {
        const name = names[index];
        return {
          displayName: name,
          name: name,
          label: name,
          value: id,
          emplId: id,
          workId: id,
          workNo: id,
        };
      });
    } else {
      if (ids.length === 0) return null;
      const id = ids[0];
      const name = names[0];
      return {
        displayName: name,
        name: name,
        label: name,
        value: id,
        emplId: id,
        workId: id,
        workNo: id,
      };
    }
  }

  /**
   * 关联表单实例
   * @typedef AssociationFormInstance
   * @property {string} instanceId 实例ID
   * @property {string} title 显示的标题
   * @property {string} subTitle 显示的副标题
   */

  /**
   * 生成关联表单字段数据，可直接赋值给关联表单组件
   * @static
   * @param {string} appType 应用ID
   * @param {string} formUuid 表单ID
   * @param {"receipt"|"process"} formType 单据类型，receipt-表单，process-流程
   * @param {AssociationFormInstance[]} instances 关联表单实例信息数组
   *
   * @example
   * const associationForm = generateAssociationFormFieldData(
   *    "APP_xxxxxx",
   *    "FORM-xxxxxx",
   *    "receipt",
   *    [{ isntanceId: "FINST-xxxxxx", title: "标题", subTitle: "副标题" }]
   * );
   *
   * this.$("associationFormField_lrh5sl2u").setValue(associationForm);
   */
  function generateAssociationFormFieldData(
    appType,
    formUuid,
    formType,
    instances
  ) {
    if (!Array.isArray(instances)) return null;

    return instances.map((item) => ({
      appType,
      formUuid,
      formType,
      instanceId: item.instanceId,
      title: item.title,
      subTitle: item.subTitle,
    }));
  }

  /**
   * 判断两个字段单值是否相等，如果字段数据类型为数组，需要传入单个数组元素
   * @static
   * @param {string} fieldType 字段类型，可通过{@link getFieldTypeById}获取
   * @param {any} valA 字段值A
   * @param {any} valB 字段值B
   * @returns {boolean} 两个值是否相等
   *
   * @example
   * const employeeA = this.$("employeeField_lrh5sl2v").getValue();
   * const employeeB = this.$("employeeField_lrhbdj3c").getValue();
   * const fieldType = getFieldTypeById("employeeField_lrh5sl2v"); // employee
   * fieldValueEqualSingle(fieldType, employeeA[0], employeeB[0]); // true or false
   */
  function fieldValueEqualSingle(fieldType, valA, valB) {
    let equal = false;

    if (isEmpty(valA) && isEmpty(valB)) {
      return true;
    }
    if ((!isEmpty(valA) && isEmpty(valB)) || (!isEmpty(valB) && isEmpty(valA))) {
      return false;
    }

    switch (fieldType) {
      case "countrySelect":
      case "employee":
      case "departmentSelect":
        equal = valA.value === valB.value;
        break;
      case "image":
      case "attachment":
        equal = valA.url === valB.url;
        break;
      case "associationForm":
        equal = valA.instanceId === valB.instanceId;
        break;
      case "cascadeDate":
        equal = valA.start === valB.start && valA.end === valB.end;
        break;
      case "address": {
        const regionsA = valA.regionIds;
        const regionsB = valB.regionIds;
        const regionEqual = regionsA.every((regionId, index) => {
          return regionId === regionsB[index];
        });
        equal = valA.address === valB.address && regionEqual;
        break;
      }
      default:
        equal = valA === valB;
        break;
    }

    return equal;
  }

  /**
   * 数组差异对象
   * @typedef {Object} ArrayDiff
   * @property {any[]} added 新增的元素
   * @property {any[]} removed 删除的元素
   */
  /**
   * 字段值差异对象
   * @typedef {Object} FieldValueDiff
   * @property {boolean} isEqual 两个值是否相等
   * @property {any} new 新字段值
   * @property {any} old 旧字段值
   * @property {module:Field~ArrayDiff} [diff] 数组类型字段值差异对象
   */
  /**
   * 两个相同类型的字段值的差异
   * @static
   * @param {string} fieldType 字段类型，可通过getFieldTypeById获取
   * @param {any} newVal 新字段值
   * @param {any} oldVal 旧字段值
   * @returns {module:Field~FieldValueDiff} 描述两个值的差异对象
   *
   * @example
   * // [{ name: "张三", value: "1343242225778381" }, { name: "李四", value: "1343242225778382" }]
   * const employeeA = this.$("employeeField_lrh5sl2v").getValue();
   * // [{ name: "张三", value: "1343242225778381" }, { name: "王二", value: "1298349283929102" }]
   * const employeeB = this.$("employeeField_lrhbdj3c").getValue();
   * const fieldType = getFieldTypeById("employeeField_lrh5sl2v"); // employee
   * fieldValueDiff(fieldType, employeeA, employeeB);
   * // {
   * //   isEqual: false, new: [{ name: "张三", value: "1343242225778381" }, { name: "李四", value: "1343242225778382" }],
   * //   old: [{ name: "张三", value: "1343242225778381" }, { name: "王二", value: "1298349283929102" }],
   * //   diff: {
   * //     added: [{ name: "李四", value: "1343242225778382" }],
   * //     removed: [{ name: "王二", value: "1298349283929102" }]
   * //   }
   * // }
   */
  function fieldValueDiff(fieldType, newVal, oldVal) {
    const fieldDataType = getFieldDataTypeById(fieldType);
    const result = {
      new: newVal,
      old: oldVal,
    };

    if (fieldDataType === "array" || fieldType === "employee") {
      let arrayNewVal = newVal || [];
      let arrayOldVal = oldVal || [];
      if (!Array.isArray(arrayNewVal)) arrayNewVal = [arrayNewVal];
      if (!Array.isArray(arrayOldVal)) arrayOldVal = [arrayOldVal];

      // 新增的元素
      const added = arrayNewVal.reduce((coll, current) => {
        const match = arrayOldVal.find((item) => {
          return fieldValueEqualSingle(fieldType, item, current);
        });
        if (match) return coll;
        else return [...coll, current];
      }, []);
      // 删除的元素
      const removed = arrayOldVal.reduce((coll, current) => {
        const match = arrayOldVal.find((item) => {
          return fieldValueEqualSingle(fieldType, item, current);
        });
        if (match) return coll;
        else return [...coll, current];
      }, []);

      result.isEqual = added.length === 0 && removed.length === 0;
      result.diff = { added, removed };
    } else {
      result.isEqual = fieldValueEqualSingle(fieldType, newVal, oldVal);
    }

    return result;
  }

  /**
   * 字段值转换为易读的字符串
   * @static
   * @param {any} value 字段值
   * @param {FieldType} fieldType 字段类型
   * @returns {string} 字符串
   *
   * @example
   * // 日期字段
   * const date = this.$("dateField_lrh5sl2w").getValue(); // 1704067200000
   * fieldToString(date, getFieldTypeById("dateField_lrh5sl2w")); // "2024-01-01"
   *
   * // 人员字段
   * const employee = this.$("dateField_lrh5sl2w").getValue(); // [{ name: "张三", value: "1343242225778381" }, { name: "李四", value: "1343242225778382" }]
   * fieldToString(date, getFieldTypeById("employeeField_lrh6iy5m")); // "[张三,李四]"
   */
  function fieldToString(value, fieldType) {
    if (value === undefined || value === null) {
      return "";
    }

    let str = "";
    switch (fieldType) {
      case "text":
      case "textarea":
      case "digitalSignature":
      case "number":
      case "rate":
      case "radio":
      case "select":
      case "cascadeSelect":
        str = String(value);
        break;
      case "date":
        str = dateTimeFormat(new Date(value), "YYYY-MM-DD");
        break;
      case "checkbox":
      case "multiSelect":
        str = `[${value.join(",")}]`;
        break;
      case "cascadeDate": {
        const { start, end } = value;
        const startStr = start
          ? dateTimeFormat(new Date(start), "YYYY-MM-DD")
          : "";
        const endStr = start ? dateTimeFormat(new Date(end), "YYYY-MM-DD") : "";

        str = `${startStr}至${endStr}`;
        break;
      }
      case "employee":
        if (!Array.isArray(value)) {
          value = [value];
        }
        str = `[${value.map((item) => item.name).join(",")}]`;
        break;
      case "departmentSelect":
      case "countrySelect": {
        const names = value.map((item) => {
          const { text } = item;
          if (typeof text === "string") {
            return text;
          } else {
            return text.zh_CN;
          }
        });
        str = `[${names.join(",")}]`;
        break;
      }
      case "associationForm":
        str = `[${value.map((item) => item.title).join(",")}]`;
        break;
      case "image":
      case "attachment":
        str = `[${value.map((item) => item.name).join(",")}]`;
        break;
      case "address": {
        const regionText = (value.regionText || [])
          .map((item) => item.zh_CN)
          .join("");
        const address = value.address || "";
        str = `${regionText}${address}`;
      }
    }

    return str;
  }

  /**
   * @template T
   * @typedef CallbackThis<T> 组件事件回调this指向类型
   * @property {T} params 开发者手动配置的回调参数
   */
  /**
   * @typedef {Object} SyncToParams syncTo方法回调参数
   * @property {string | string[]} target 要同步的字段标识
   */
  /**
   * 同步组件字段的值到其他字段
   * @static
   * @this CallbackThis<module:Field~SyncToParams>
   * @param {any} changes 变更值
   *
   * @example
   * // 此函数不应该在代码中显式调用，而应该设置为组件的OnChange事件回调
   * // 并在回调参数中配置要与此组件值保持同步的字段标识:
   * // {
   * //   "target": "textField_xxxx"
   * // }
   * // 上面的回调参数表示将当前组件的值同步到textField_xxxx字段
   */
  function syncTo(change) {
    const value = change.value;
    let { target } = this.params;

    if (!target) {
      return;
    }

    if (!Array.isArray(target)) {
      target = [target];
    }

    target.forEach((fieldId) => {
      this.$(fieldId).setValue(value);
    });
  }

  /**
   * @typedef MergeToParams mergeTo方法回调参数
   * @property {string | string[]} from 参与合并的字段标识
   * @property {string} to 目标字段标识，合并后的值赋值给此字段
   * @property {"attachment"} type 字段类型
   */
  /**
   * 将主表上的一些同类型字段值合并到另外一个字段
   * 目前仅支持合并附件类型字段
   * @this CallbackThis<module:Field~MergeToParams>
   */
  function mergeTo() {
    let { from, to, fieldType } = this.params;

    if (!from || !to) return;
    if (!Array.isArray(from)) from = [from];

    const fromValues = [];
    for (const fieldId of from) {
      const value = this.$(fieldId).getValue();
      if (value !== undefined || null) fromValues.push(value);
    }

    let mergedValue = undefined;
    switch (fieldType) {
      case "attachment":
        mergedValue = fromValues.reduce((coll, item) => coll.concat(item), []);
        break;
    }

    this.$(to).setValue(mergedValue);
  }

  /**
   * 跨应用数据源相关方法封装, 详情参考宜搭文档 {@link https://docs.aliwork.com/docs/developer/api/openAPI}
   * @module DataSource
   */


  /**
   * 删除表单实例数据
   * @static
   * @param {Object} context this上下文
   * @param {string} instanceId 实例ID
   *
   * @example
   * // 使用前请添加数据源：
   * // 名称：deleteFormData
   * // 请求方法：POST
   * // 请求地址：/dingtalk/web/APP_xxxxxx/v1/form/deleteFormData.json
   *
   * deleteFormData(this, "FINST-12839128319823").then(() => {
   *   console.log("删除成功");
   * }, (e) => {
   *   console.log(`删除失败：${e.message}`);
   * });
   */
  async function deleteFormData(context, instanceId) {
    if (!context) throw Error("context is required");
    if (!instanceId) throw Error("instanceId is required");

    const resp = await context.dataSourceMap.deleteFormData.load({
      formInstId: instanceId,
    });

    return resp;
  }

  /**
   * 获取子表数据响应对象
   * @typedef {Object} module:DataSource.SubformDatasResponse
   * @property {number} totalCount 子表数据总条数
   * @property {number} currentPage 当前页码
   * @property {Array<Object>} subformDatas 子表数据数组
   */

  /**
   * 分页获取子表数据
   * @static
   * @param {Object} context this上下文
   * @param {string} formUuid 表单ID
   * @param {string} formInstanceId 表单实例ID
   * @param {string} tableFieldId 子表唯一标识
   * @param {number} currentPage 当前页， 默认为1
   * @param {number} pageSize 每页记录数，最大50条，默认为10
   * @returns {Promise<module:DataSource.SubformDatasResponse>}
   * 一个Promise，resolve响应对象，参见：{@link module:DataSource.SubformDatasResponse}
   *
   * @example
   * // 使用前请添加数据源：
   * // 名称：fetchSubformDatas
   * // 请求方法：GET
   * // 请求地址：/dingtalk/web/APP_xxxxxx/v1/form/listTableDataByFormInstIdAndTableId.json
   *
   * fetchSubformDatas(
   *   this,
   *   "FORM-xxxxxx",
   *   "FINST-xxxxxx",
   *   "tableField_xxxxxx",
   *    1, 50
   *  ).then(resp => {
   *    const { totalCount, subformDatas, currentPage } = resp;
   *  }, (e) => {
   *    console.log(`获取失败：${e.message}`);
   *  });
   */
  async function fetchSubformDatas(
    context,
    formUuid,
    formInstanceId,
    tableFieldId,
    currentPage,
    pageSize
  ) {
    if (!context) {
      throw Error("context is required");
    }
    if (!formUuid) {
      throw Error("formUuid is required");
    }
    if (!formInstanceId) {
      throw Error("form instance id is required");
    }
    if (!tableFieldId) {
      throw Error("table field id is required");
    }

    currentPage = currentPage || 1;
    pageSize = pageSize || 10;

    const response = await context.dataSourceMap.fetchSubformDatas.load({
      formUuid,
      formInstanceId,
      tableFieldId,
      currentPage,
      pageSize,
    });

    const { totalCount, data } = response;
    const subformDatas = data || [];

    return {
      totalCount,
      subformDatas,
      currentPage,
    };
  }

  /**
   * 获取所有子表数据
   * @static
   * @param {Object} context this上下文
   * @param {string} formUuid 表单ID
   * @param {string} formInstanceId 表单实例ID
   * @param {string} tableFieldId 子表唯一标识
   * @returns {Promise<Array<Object>>} 一个Promise，resolve所有子表数据数组
   *
   * @example
   * // 使用前请添加数据源：
   * // 名称：fetchSubformDatas
   * // 请求方法：GET
   * // 请求地址：/dingtalk/web/APP_xxxxxx/v1/form/listTableDataByFormInstIdAndTableId.json
   *
   * fetchSubformDatasAll(
   *   this,
   *   "FORM-xxxxxx",
   *   "FINST-xxxxxx",
   *   "tableField_xxxxxx",
   *  ).then(allsubformDatas => {
   *    console.log("子表数据：", allsubformDatas);
   *  }, (e) => {
   *    console.log(`获取失败：${e.message}`);
   *  });
   */
  async function fetchSubformDatasAll(
    context,
    formUuid,
    formInstanceId,
    tableFieldId
  ) {
    if (!context) {
      throw Error("context is required");
    }
    if (!formUuid) {
      throw Error("formUuid is required");
    }
    if (!formInstanceId) {
      throw Error("form instance id is required");
    }
    if (!tableFieldId) {
      throw Error("table field id is required");
    }

    let allsubformDatas = [];
    let currentPage = 1;
    const pageSize = 50;

    const t = true;
    while (t) {
      const { subformDatas } = await fetchSubformDatas(
        context,
        formUuid,
        formInstanceId,
        tableFieldId,
        currentPage,
        pageSize
      );
      allsubformDatas = allsubformDatas.concat(subformDatas);

      if (subformDatas.length !== pageSize) {
        break;
      }

      currentPage += 1;
    }

    return allsubformDatas;
  }

  /**
   * 获取表单实例详情
   * @static
   * @param {Object} context this上下文
   * @param {"form" | "process"} type 类型，取值为 form-表单 或者 porcess-流程
   * @param {string} formInstId 表单实例ID
   * @return {Promise<Object>} 一个Promise，resolve表单实例数据
   *
   * @example
   * // 使用前请添加数据源：
   * // 如果要获取普通表单实例详情
   * // 名称：getFormData
   * // 请求方法：GET
   * // 请求地址：/dingtalk/web/APP_xxxxxx/v1/form/getFormDataById.json
   * // 如果要获取流程表单实例详情
   * // 名称：getProcessInstance
   * // 请求方法：GET
   * // 请求地址：/dingtalk/web/APP_xxxxxx/v1/process/getInstanceById.json
   *
   * // 获取普通表单实例数据
   * getFormData(this, "form", "FINST-TD866Y81CHLF6FVA9WR6J7GQPBM72KUTJRFOL6T9")
   * .then(formData => {
   *   console.log("表单实例数据", formData);
   * }).catch(e => {
   *   console.log(`获取失败：${e.message}`);
   * });
   *
   * // 获取流程表单实例数据
   * getFormData(this, "process", "62a1ef56-8ded-4e77-89a0-db32c95a6d04")
   * .then(formData => {
   *   console.log("流程实例数据", formData);
   * }).catch(e => {
   *   console.log(`获取失败：${e.message}`);
   * });
   */
  function getFormData(context, type, instId) {
    if (!context) {
      throw Error("context is required");
    }
    if (!type) {
      type = "form";
    }
    if (!instId) {
      throw Error("formInstId is required");
    }

    let req;
    if (type === "form") {
      req = context.dataSourceMap.getFormData
        .load({ formInstId: instId })
        .then((response) => {
          return response.formData;
        });
    } else if (type === "process") {
      req = context.dataSourceMap.getProcessInstance
        .load({
          processInstanceId: instId,
        })
        .then((response) => {
          return response.data;
        });
    }

    if (!req) throw Error(`Unknown type：${type}`);
    return req;
  }

  /**
   * 新建表单实例
   * @static
   * @param {Object} context this上下文
   * @param {string} formUuid 表单ID
   * @param {Object} formData 表单数据对象
   * @returns {Promise<string>} 一个Promise，resolve表单实例ID
   *
   * @example
   * // 使用前请添加数据源：
   * // 名称：saveFormData
   * // 请求方法：POST
   * // 请求地址：/dingtalk/web/APP_xxxxxx/v1/form/saveFormData.json
   *
   * saveFormData(
   *   this,
   *   "FORM-xxxxxx",
   *   { textField_xxxxxx: "hello", numberField_xxxxxx: 100 },
   * ).then(
   *   (instanceId) => {
   *     console.log("创建成功，实例ID：${instanceId}");
   *   },
   *   (e) => {
   *     console.log(`创建失败：${e.message}`);
   *   }
   * )
   */
  async function saveFormData(context, formUuid, formData) {
    if (!context) {
      throw Error("context is required");
    }
    if (!formUuid) {
      throw Error("formUuid is required");
    }
    if (!formData) {
      formData = {};
    }

    const formDataJson = JSON.stringify(formData);

    const instanceId = await context.dataSourceMap.saveFormData.load({
      formUuid,
      formDataJson,
    });

    return instanceId;
  }

  /**
   * 发起流程
   * @static
   * @param {Object} context this上下文
   * @param {string} processCode 流程 code
   * @param {string} formUuid 表单ID
   * @param {Object} formData 表单数据对象
   * @param {string} [dptId] 发起部门ID，如不填默认为发起人主事部门
   * @returns {Promise<string>} 一个Promise，resolve流程实例ID
   *
   * @example
   * // 使用前请添加数据源：
   * // 名称：startInstance
   * // 请求方法：POST
   * // 请求地址：/dingtalk/web/APP_xxxxxx/v1/process/startInstance.json
   *
   * startInstance(
   *   this,
   *   "TPROC--xxxxxx",
   *   "FORM-xxxxxx",
   *   { textField_xxxxxx: "hello", numberField_xxxxxx: 100 },
   * ).then(
   *   (instanceId) => {
   *     console.log("创建成功，实例ID：${instanceId}");
   *   },
   *   (e) => {
   *     console.log(`创建失败：${e.message}`);
   *   }
   * )
   */
  async function startInstance(context, processCode, formUuid, formData, dptId) {
    if (!context) {
      throw Error("context is required");
    }
    if (!processCode) {
      throw Error("processCode is required");
    }
    if (!formUuid) {
      throw Error("formUuid is required");
    }
    if (!formData) {
      formData = {};
    }

    const formDataJson = JSON.stringify(formData);

    const instanceId = await context.dataSourceMap.startInstance.load({
      processCode,
      formUuid,
      formDataJson,
      dptId
    });

    return instanceId;
  }

  /**
   * 搜索表单（流程）实例数据（ID）选项
   * @typedef {Object} module:DataSource.SearchFormDatasOption
   * @property {boolean} strictQuery 严格（精确）查询，默认不启用。当使用单行文本或者多行文本组件作为查询条件时执行的是模糊查询，
   * 比如查询"张三"会把“张三丰”也查询出来。将strictQuery设置为ture会对查询结果执行进一步筛选，保证返回文本严格相等的数据。<br/>
   * ⚠️查询表单实例ID方法{@link module:DataSource.searchFormDataIds} {@link module:DataSource.searchFormDataIdsAll}不支持此选项。<br/>
   * ⚠️如果使用分页查询，严格查询的结果数量可能少于分页数量。
   * @property {Object} dynamicOrder 排序规则
   * @property {string} originatorId 数据提交人/流程发起人工号
   * @property {string} createFrom 查询在该时间段创建的数据列表
   * @property {string} createTo 查询在该时间段创建的数据列表
   * @property {string} modifiedFrom 查询在该时间段有修改的数据列表
   * @property {string} modifiedTo 查询在该时间段有修改的数据列表
   * @property {string} taskId 任务ID，仅查询流程表单有效
   * @property {"RUNNING" | "TERMINATED" | "COMPLETED" | "ERROR"} instanceStatus
   * 实例状态，仅查询流程表单有效,可选值为：RUNNING, TERMINATED, COMPLETED, ERROR。分别代表：运行中，已终止，已完成，异常。
   * @property {"agree" | "disagree"} approvedResult 流程审批结果，仅查询流程表单有效
   */

  /**
   * 查询表单实例ID响应对象
   * @typedef {Object} module:DataSource.FormDataIdsResponse
   * @property {number} totalCount 表单数据总条数
   * @property {number} currentPage 当前页码
   * @property {Array<string>} ids 表单实例ID数组
   */

  /**
   * 查询表单实例ID列表 <br/>
   * ⚠️如果使用文本字段（单行/多行文本）作为查询条件，执行的是模糊查询，比如查询“张三”，会把“张三丰"也查询出来
   * @static
   * @param {Object} context this上下文
   * @param {"form" | "process"} type 表单类型，可选 form、process，分别代表普通表单和流程
   * @param {string} formUuid 表单ID
   * @param {Object} searchFieldObject 表单组件查询条件对象
   * @param {number} currentPage 当前页， 默认为1
   * @param {number} pageSize 每页记录数， 默认为10
   * @param {module:DataSource.SearchFormDatasOption} options 查询选项
   * @returns {Promise<module:DataSource.FormDataIdsResponse>}
   * 一个Promise，resolve表单实例ID响应对象 {@link module:DataSource.FormDataIdsResponse}
   *
   * @example
   * // 使用前请添加数据源：
   * // 如果要更新普通表单：
   * // 名称：searchFormDataIds
   * // 请求方法：GET
   * // 请求地址：/dingtalk/web/APP_xxxxxx/v1/form/searchFormDataIds.json
   * // 如果要更新流程表单：
   * // 名称：getInstanceIds
   * // 请求方法：GET
   * // 请求地址：/dingtalk/web/APP_xxxxxx/v1/process/getInstanceIds.json
   *
   * // 搜索普通表单
   * searchFormDataIds(
   *   this,
   *   "form",
   *   "FORM-xxxxxx",
   *   { textField_xxxxxx: "hello" },
   *   1, 100,
   *   { dynamicOrder: "numberField_xxx": "+" }
   * ).then((resp) => {
   *     const { currentPage, totalCount, ids } = resp;
   *     console.log(`共${totalCount}条数据`);
   *     console.log(ids);
   *   },(e) => {
   *     console.log(`查询失败：${e.message}`);
   *   }
   * );
   *
   * // 搜索流程表单
   * searchFormDataIds(
   *   this,
   *   "process",
   *   "FORM-xxxxxx",
   *   { textField_xxxxxx: "hello" },
   *   1, 100,
   *   { dynamicOrder: "numberField_xxx": "+", instanceStatus: "COMPLETED" }
   * ).then((resp) => {
   *     const { currentPage, totalCount, ids } = resp;
   *     console.log(`共${e.totalCount}条数据`);
   *     console.log(ids);
   *   },(e) => {
   *     console.log(`查询失败：${e.message}`);
   *   }
   * );
   */
  async function searchFormDataIds(
    context,
    type,
    formUuid,
    searchFieldObject,
    currentPage,
    pageSize,
    options
  ) {
    if (!context) {
      throw Error("context is required");
    }
    if (!formUuid) {
      throw Error("formUuid is required");
    }
    if (!type) {
      type = "form";
    }

    const searchFieldJson = JSON.stringify(searchFieldObject || {});
    if (options && options.dynamicOrder) {
      options.dynamicOrder = JSON.stringify(options.dynamicOrder || {});
    }

    let req;
    if (type === "form") {
      req = context.dataSourceMap.searchFormDataIds.load({
        formUuid,
        searchFieldJson,
        currentPage,
        pageSize,
        ...options,
      });
    } else if (type === "process") {
      req = context.dataSourceMap.getInstanceIds.load({
        formUuid,
        searchFieldJson,
        currentPage,
        pageSize,
        ...options,
      });
    } else {
      throw Error("Unknow form type: ", type);
    }

    const response = await req;
    const { currentPage: cPage, totalCount, data: ids } = response;

    return {
      currentPage: cPage,
      totalCount,
      ids,
    };
  }

  /**
   * 查询符合条件的所有表单实例ID <br/>
   * ⚠️如果使用文本字段（单行/多行文本）作为查询条件，执行的是模糊查询，比如查询“张三”，会把“张三丰"也查询出来
   * @static
   * @param {Object} context this上下文
   * @param {"form" | "process"} type 表单类型，可选 form、process，分别代表普通表单和流程
   * @param {string} formUuid 表单ID
   * @param {Object} searchFieldObject 表单组件查询条件对象
   * @param {module:DataSource.SearchFormDatasOption} options 查询选项
   * @returns {Promise<Array<string>>} 一个Promise，resolve表单实例ID数组
   *
   * @example
   * // 使用前请添加数据源：
   * // 如果要更新普通表单：
   * // 名称：searchFormDataIds
   * // 请求方法：GET
   * // 请求地址：/dingtalk/web/APP_xxxxxx/v1/form/searchFormDataIds.json
   * // 如果要更新流程表单：
   * // 名称：getInstanceIds
   * // 请求方法：GET
   * // 请求地址：/dingtalk/web/APP_xxxxxx/v1/process/getInstanceIds.json
   *
   * // 搜索普通表单
   * searchFormDataIdsAll(
   *   this,
   *   "form",
   *   "FORM-xxxxxx",
   *   { textField_xxxxxx: "hello" },
   *   { dynamicOrder: "numberField_xxx": "+" }
   * ).then((ids) => {
   *     console.log("查询成功", ids);
   *   },(e) => {
   *     console.log(`查询失败：${e.message}`);
   *   }
   * );
   *
   * // 搜索流程表单
   * searchFormDataIdsAll(
   *   this,
   *   "process",
   *   "FORM-xxxxxx",
   *   { textField_xxxxxx: "hello" },
   *   { dynamicOrder: "numberField_xxx": "+", instanceStatus: "COMPLETED" }
   * ).then((ids) => {
   *     console.log("查询成功", ids);
   *   },(e) => {
   *     console.log(`查询失败：${e.message}`);
   *   }
   * );
   */
  async function searchFormDataIdsAll(
    context,
    type,
    formUuid,
    searchFieldObject,
    options
  ) {
    if (!type) type = "form";

    let allIds = [];
    let currentPage = 1;
    const pageSize = 100;

    const t = true;
    while (t) {
      const { ids } = await searchFormDataIds(
        context,
        type,
        formUuid,
        searchFieldObject,
        currentPage,
        pageSize,
        options
      );
      allIds = allIds.concat(ids);

      if (ids.length !== pageSize) {
        break;
      }

      currentPage += 1;
    }

    return allIds;
  }

  /**
   * 查询表单实例数据响应对象
   * @typedef {Object} module:DataSource.FormDatasResponse
   * @property {number} totalCount 表单数据总条数
   * @property {number} currentPage 当前页码
   * @property {number} actualPageSize 接口返回的当前页数据量，当开启严格查询时，
   * 由于进行了额外的筛选，方法返回的数据量量可能小于接口返回的数据量
   * @property {Array<Object>} formDatas 表单实例数据数组
   */

  /**
   * 分页查询表单实例数据 <br/>
   * ⚠️如果使用文本字段（单行/多行文本）作为查询条件，执行的是模糊查询，比如查询“张三”，会把“张三丰"也查询出来。
   * 若要精确查询，请将options参数的strictQuery选项设置为true
   * @static
   * @param {Object} context this上下文
   * @param {"form" | "process"} type 表单类型，可选 form、process，分别代表普通表单和流程
   * @param {string} formUuid 表单ID
   * @param {Object} searchFieldObject 表单组件查询条件对象
   * @param {number} currentPage 当前页， 默认为1
   * @param {number} pageSize 每页记录数， 默认为10
   * @param {module:DataSource.SearchFormDatasOption} options 查询选项
   * @returns {Promise<Array<module:DataSource.FormDatasResponse>>}
   * 一个Promise，resolve表单实例ID响应对象 {@link module:DataSource.FormDataIdsResponse}
   *
   * @example
   * // 使用前请添加数据源：
   * // 如果要更新普通表单：
   * // 名称：searchFormDatas
   * // 请求方法：GET
   * // 请求地址：/dingtalk/web/APP_xxxxxx/v1/form/searchFormDatas.json
   * // 如果要更新流程表单：
   * // 名称：getInstances
   * // 请求方法：GET
   * // 请求地址：/dingtalk/web/APP_xxxxxx/v1/process/getInstances.json
   *
   * // 搜索普通表单
   * searchFormDatas(
   *   this,
   *   "form",
   *   "FORM-xxxxxx",
   *   { textField_xxxxxx: "hello" },
   *   // 精确查询，按照numberField_xxx升序排序
   *   { strictQuery: true, dynamicOrder: "numberField_xxx": "+" }
   * ).then((resp) => {
   *     const { currentPage, totalCount, formDatas } = resp;
   *     console.log(`共${totalCount}条数据`);
   *     console.log(formDatas);
   *   },(e) => {
   *     console.log(`查询失败：${e.message}`);
   *   }
   * );
   *
   * // 搜索流程表单
   * searchFormDatas(
   *   this,
   *   "process",
   *   "FORM-xxxxxx",
   *   { textField_xxxxxx: "hello" },
   *   // 精确查询，流程状态已完成，按照numberField_xxx升序排序
   *   { strictQuery: true, dynamicOrder: "numberField_xxx": "+", instanceStatus: "COMPLETED" }
   * ).then((ids) => {
   *     const { currentPage, totalCount, formDatas } = resp;
   *     console.log(`共${totalCount}条数据`);
   *     console.log(formDatas);
   *   },(e) => {
   *     console.log(`查询失败：${e.message}`);
   *   }
   * );
   */
  async function searchFormDatas(
    context,
    type,
    formUuid,
    searchFieldObject,
    currentPage,
    pageSize,
    options
  ) {
    if (!context) {
      throw Error("context is required");
    }
    if (!formUuid) {
      throw Error("formUuid is required");
    }
    if (!type) {
      type = "form";
    }

    options = Object.assign({ strictQuery: false }, options);

    const searchFieldJson = JSON.stringify(searchFieldObject || {});
    if (options && options.dynamicOrder) {
      options.dynamicOrder = JSON.stringify(options.dynamicOrder || {});
    }

    let req;
    if (type === "form") {
      req = context.dataSourceMap.searchFormDatas.load({
        formUuid,
        searchFieldJson,
        currentPage,
        pageSize,
        ...options,
      });
    } else if (type === "process") {
      req = context.dataSourceMap.getInstances.load({
        formUuid,
        searchFieldJson,
        currentPage,
        pageSize,
        ...options,
      });
    } else {
      throw Error("Unknow form type: ", type);
    }

    const response = await req;
    const { currentPage: cPage, totalCount, data } = response;
    let formDatas = (data || []).map((item) => ({
      ...item,
      // 普通表单的表单数据在formData属性中
      ...item.formData,
      // 流程表单的表单数据在data属性中
      ...item.data,
    }));

    const actualPageSize = formDatas.length;
    // 严格查询，对结果集进一步筛选，所有文本类型字段值必须和查询条件严格匹配
    if (options.strictQuery) {
      const textFieldMap = new Map();
      for (const key in searchFieldObject) {
        const fieldType = getFieldTypeById(key);
        if (fieldType === "text" || fieldType === "textarea") {
          textFieldMap.set(key, searchFieldObject[key]);
        }
      }

      formDatas = formDatas.filter((formData) => {
        for (const [fieldId, value] of textFieldMap) {
          if (formData[fieldId] !== value) return false;
        }
        return true;
      });
    }

    return {
      currentPage: cPage,
      actualPageSize,
      totalCount,
      formDatas,
    };
  }

  /**
   * 查询符合条件的所有表单实例 <br/>
   * ⚠️如果使用文本字段（单行/多行文本）作为查询条件，执行的是模糊查询，比如查询“张三”，会把“张三丰"也查询出来。
   * 若要精确查询，请将options参数的strictQuery选项设置为true
   * @static
   * @param {Object} context this上下文
   * @param {"form" | "process"} type 表单类型，可选 form、process，分别代表普通表单和流程
   * @param {string} formUuid 表单ID
   * @param {Object} searchFieldObject 表单组件查询条件对象
   * @param {module:DataSource.SearchFormDatasOption} options 查询选项
   * @returns {Promise<Array<Object>>} 一个Promise，resolve表单实例数据数组
   *
   * @example
   * // 使用前请添加数据源：
   * // 如果要更新普通表单：
   * // 名称：searchFormDatas
   * // 请求方法：GET
   * // 请求地址：/dingtalk/web/APP_xxxxxx/v1/form/searchFormDatas.json
   * // 如果要更新流程表单：
   * // 名称：getInstances
   * // 请求方法：GET
   * // 请求地址：/dingtalk/web/APP_xxxxxx/v1/process/getInstances.json
   *
   * // 搜索普通表单
   * searchFormDatasAll(
   *   this,
   *   "form",
   *   "FORM-xxxxxx",
   *   { textField_xxxxxx: "hello" },
   *   // 精确查询，按照numberField_xxx升序排序
   *   { strictQuery: true, dynamicOrder: "numberField_xxx": "+" }
   * ).then((formDatas) => {
   *     console.log("查询成功", formDatas);
   *   },(e) => {
   *     console.log(`查询失败：${e.message}`);
   *   }
   * );
   *
   * // 搜索流程表单
   * searchFormDatasAll(
   *   this,
   *   "process",
   *   "FORM-xxxxxx",
   *   { textField_xxxxxx: "hello" },
   *   // 精确查询，流程状态已完成，按照numberField_xxx升序排序
   *   { strictQuery: true, dynamicOrder: "numberField_xxx": "+", instanceStatus: "COMPLETED" }
   * ).then((formDatas) => {
   *     console.log("查询成功", formDatas);
   *   },(e) => {
   *     console.log(`查询失败：${e.message}`);
   *   }
   * );
   */
  async function searchFormDatasAll(
    context,
    type,
    formUuid,
    searchFieldObject,
    options
  ) {
    if (!type) type = "form";

    let allFormDatas = [];
    let currentPage = 1;
    const pageSize = 100;

    const t = true;
    while (t) {
      const { formDatas, actualPageSize } = await searchFormDatas(
        context,
        type,
        formUuid,
        searchFieldObject,
        currentPage,
        pageSize,
        options
      );
      allFormDatas = allFormDatas.concat(formDatas);

      if (actualPageSize !== pageSize) {
        break;
      }

      currentPage += 1;
    }

    return allFormDatas;
  }

  /**
   * 更新表单/流程实例数据
   * @static
   * @param {Object} context this上下文
   * @param {"form" | "process"} type 表单类型，可选 form、process，分别代表普通表单和流程
   * @param {string} instanceId 实例ID
   * @param {Object} updateFormData 要更新的表单数据对象
   * @param {boolean} useLatestVersion 是否使用最新的表单版本进行更新，默认为false，仅对普通表单有效
   * @return {Promise} 一个Promise，更新成功时resolve，失败时reject
   *
   * @example
   * // 使用前请添加数据源：
   * // 如果要更新普通表单：
   * // 名称：updateFormData
   * // 请求方法：POST
   * // 请求地址：/dingtalk/web/APP_xxxxxx/v1/form/updateFormData.json
   * // 如果要更新流程表单：
   * // 名称：updateInstance
   * // 请求方法：POST
   * // 请求地址：/dingtalk/web/APP_xxxxxx/v1/process/updateInstance.json
   *
   * updateFormData(
   *   this,
   *   "form",
   *   "FINST-xxxxxx",
   *   { textField_xxxxxx: "a new value" },
   *   true
   * ).then(() => {
   *     console.log("更新成功");
   *   },(e) => {
   *     console.log(`更新失败：${e.message}`);
   *   }
   * );
   */
  async function updateFormData(
    context,
    type,
    instanceId,
    updateFormData,
    useLatestVersion = false
  ) {
    if (!context) throw Error("context is required");
    if (!instanceId) throw Error("instanceId is required");
    if (!type) type = "form";
    if (!updateFormData) updateFormData = {};

    const updateFormDataJson = JSON.stringify(updateFormData);

    let req;
    if (type === "form") {
      req = context.dataSourceMap.updateFormData.load({
        formInstId: instanceId,
        updateFormDataJson,
        useLatestVersion,
      });
    } else {
      req = context.dataSourceMap.updateInstance.load({
        processInstanceId: instanceId,
        updateFormDataJson,
      });
    }

    await req;
  }

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

  var FieldChangeLogger$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    default: FieldChangeLogger
  });

  /**
   * 子表单相关工具方法
   * @module Subform
   */


  /**
   * summary 方法 option 参数类型定义
   * @typedef {Object} SubformSummaryOption
   * @property {boolean} ignoreEmpty 是否跳过空数据，默认为true
   * @property {boolean} ignoreDuplicate 是否跳过重复数据，默认为true
   * @property {Function} filter 一个数据过滤函数，接受子表行数据作为参数，返回falsy值跳过当前行
   */

  /**
   * 子表工具类，提供子表常用操作方法 <br/>
   *
   * 概念解释： <br/>
   * formGroupId：一个ID字符串，是子表数据项的唯一标识
   */
  class Subform {
    /**
     * 创建一个子表工具类实例
     * @param {Object} context this上下文
     * @param {string} tableFieldId 子表唯一标识
     *
     * @example
     * const subform = new Subform(this, "tableField_xxxxxx");
     */
    constructor(context, tableFieldId) {
      this.tableFieldId = tableFieldId;
      this.instance = context.$(tableFieldId);
      if (!this.instance) {
        this.noInstanceError();
      }
    }

    /**
     * 无法获取子表实例报错
     * @private
     */
    noInstanceError() {
      throw Error(
        `无法获取到唯一标识为${this.tableFieldId}的子表单，请检查标识是否正确`
      );
    }

    /**
     * 获取子表组件实例
     * @returns {Object} 子表组件实例
     *
     * @example
     * const subform = new Subform(this, "tableField_xxxxxx");
     * const tableField = subform.getInstance(); // 等效于 this.$("tableField_xxxxxx");
     * tableField.getValue();
     */
    getInstance() {
      return this.instance;
    }

    /**
     * 获取子表数据列表
     * @returns {Array<Object>} 子表数据列表
     *
     * @example
     * const subform = new Subform(this, "tableField_xxxxxx");
     * const dataList = subform.getDatas(); // 等效于 this.$("tableField_xxxxxx").getValue();
     */
    getDatas() {
      return this.instance.getValue();
    }

    /**
     * 设置整个子表的数据
     * @param {Array<Object>} datas 子表数据列表
     *
     * @example
     * const subform = new Subform(this, "tableField_xxxxxx");
     * subform.setDatas([...datas]); // 等效于 this.$("tableField_xxxxxx").setValue([...datas]);
     */
    setDatas(datas) {
      this.instance.setValue(datas);
    }

    /**
     * 获取子表项formGroupId列表
     * @returns {Array<string>} formGroupId列表
     *
     * @example
     * const subform = new Subform(this, "tableField_xxxxxx");
     * subform.getItems(); // ["tfitem_1", "tfitem_2"]
     */
    getItems() {
      return this.instance.getItems();
    }

    /**
     * 根据子表项formGroupId获取子表项索引
     * @param {string} formGroupId formGroupId
     * @returns {number} 索引下标
     *
     * @example
     * const subform = new Subform(this, "tableField_xxxxxx");
     * subform.getIndex("tfitem_1"); // 0
     */
    getIndex(formGroupId) {
      const items = this.getItems() || [];
      return items.findIndex((item) => item === formGroupId);
    }

    /**
     * 根据子表项索引获取formGroupId
     * @param {number} index 索引下标
     * @returns {string} formGroupId
     *
     * @example
     * const subform = new Subform(this, "tableField_xxxxxx");
     * subform.getFormGroupId(0); // "tfitem_1"
     */
    getFormGroupId(index) {
      const items = this.getItems() || [];
      return items[index];
    }

    /**
     * 更新子表单行数据
     * @param {number | string} id 可传入要更新的行下标或者formGroupId
     * @param {Object} data 要更新的字段值对象
     *
     * @example
     * const subform = new Subform(this, "tableField_xxxxxx");
     * // 使用索引下标指示更新数据行
     * subform.updateItem(0, { "tableField_xxxxxx": "new value" });
     * // 使用formGroupId指示更新数据行
     * subform.updateItem("tfitem_1", { "tableField_xxxxxx": "new value" });
     */
    updateItem(id, data) {
      if (typeof id === "number") {
        id = this.getFormGroupId(id);
      }
      this.instance.updateItemValue(id, data);
    }

    /**
     * 汇总子表中指定字段的值
     * @param {string} fieldId 要汇总到主表的子表字段
     * @param {"string" | "number" | "dpt" | "employee"} [dataType] 字段数据类型，默认为string类型
     * @param {module:Subform~SubformSummaryOption} [option] 扩展选项
     * @return {Array<any>} 汇总字段值数组
     *
     * @example
     * const subform = new Subform(this, "tableField_xxxxxx");
     * subform.summary("textField_xxxxxx", "string", { ignoreEmpty: true, ignoreDuplicate: true });
     */
    summary(fieldId, dataType, option) {
      dataType = dataType || "string";
      option = Object.assign(
        {
          ignoreEmpty: true,
          ignoreDuplicate: true,
          filter: () => true,
        },
        option
      );

      const subformDataList = this.getDatas();

      let sumData = [];
      for (const subformDataItem of subformDataList) {
        const fieldData = subformDataItem[fieldId];

        // 过滤数据
        if (option.filter && option.filter instanceof Function) {
          const goOn = option.filter(subformDataItem);
          if (!goOn) continue;
        }

        // 跳过空数据
        if (
          option.ignoreEmpty &&
          (fieldData === null || fieldData === undefined)
        ) {
          continue;
        }

        switch (dataType) {
          case "number": {
            let num = Number(fieldData);
            if (isNaN(num)) num = 0;
            sumData.push(num);
            break;
          }
          case "string":
            // 跳过空数据
            if (option.ignoreEmpty && fieldData === "") break;
            // 跳过重复数据
            if (
              option.ignoreDuplicate &&
              sumData.some((item) => item === fieldData)
            ) {
              break;
            }

            sumData.push(fieldData);
            break;
          case "employee":
            // 多选模式
            if (Array.isArray(fieldData)) {
              for (const employee of fieldData) {
                // NOTICE: 如果是手动选择的成员组件值，员工编号存放在value字段
                // 如果是关联表单填充的成员组件值，则员工编号存放在key字段中
                const workId = employee.value || employee.key;
                if (!workId) continue;
                // 跳过重复数据
                if (
                  option.ignoreDuplicate &&
                  sumData.some((item) => {
                    const id = item.value || item.key;
                    return id === workId;
                  })
                ) {
                  continue;
                }
                sumData.push(employee);
              }
            }
            // 单选模式
            else {
              const workId = fieldData.value || fieldData.key;
              // 跳过重复数据
              if (
                option.ignoreDuplicate &&
                sumData.some((item) => {
                  const id = item.value || item.key;
                  return id === workId;
                })
              ) {
                break;
              }
              sumData.push(fieldData);
            }
            break;
          case "dpt":
            for (const dpt of fieldData) {
              // 跳过重复数据
              if (
                option.ignoreDuplicate &&
                sumData.some((item) => item.value === dpt.value)
              ) {
                continue;
              }
              sumData.push(dpt);
            }
            break;
        }
      }

      return sumData;
    }
  }

  /**
   * sum2Main option 参数类型定义
   * @typedef {Object} SumOption
   * @property {boolean} ignoreEmpty 是否跳过空数据，默认为true
   * @property {boolean} ignoreDuplicate 是否跳过重复数据，默认为true
   * @property {boolean} appendMode 追加模式，数据追加到主表字段上，而不是覆盖，默认为false
   * @property {Function} filter 一个数据过滤函数，接受子表行数据作为参数，返回falsy值跳过当前行
   * @property {string} separator 当数据类型为string时的分隔符，默认为半角逗号","
   */
  /**
   * 子表字段汇总到主表
   * @static
   * @param {Object} context this上下文
   * @param {string} tableFieldId 子表唯一标识
   * @param {string} fieldInSubform 要汇总到主表的子表字段
   * @param {string} fieldInMainform 要汇总到的主表字段
   * @param {"string" | "number" | "dpt" | "employee"} dataType 字段数据类型，默认为string类型
   * @param {module:Subform~SumOption} option 扩展选项
   *
   * @example
   * export function onSubformChange() {
   *   // tableField_xyz子表中的 textField_123 字段将被汇总到主表 textField_abc 字段。
   *   sum2Main(this, "tableField_xyz", "textField_123", "textField_abc", "string", { appendMode: true });
   * }
   */
  function sum2Main(
    context,
    tableFieldId,
    fieldInSubform,
    fieldInMainform,
    dataType,
    option
  ) {
    dataType = dataType || "string";
    option = Object.assign(
      {
        ignoreEmpty: true,
        ignoreDuplicate: true,
        appendMode: false,
        filter: () => true,
        separator: ",",
      },
      option
    );

    const subform = new Subform(context, tableFieldId);
    let sumData = subform.summary(fieldInSubform, dataType, {
      ignoreEmpty: option.ignoreEmpty,
      ignoreDuplicate: option.ignoreDuplicate,
      filter: option.filter,
    });

    // 追加模式
    if (option.appendMode) {
      const fieldData = context.$(fieldInMainform).getValue();
      switch (dataType) {
        case "string": {
          const existData = (fieldData || "").split(",");
          existData.forEach((str) => {
            // 跳过重复数据
            if (option.ignoreDuplicate && sumData.indexOf(str) !== -1) return;
            sumData.unshift(str);
          });
          break;
        }
        case "number": {
          let num = Number(fieldData);
          if (isNaN(num)) num = 0;
          sumData.unshift(num);
          break;
        }
        case "employee": {
          const existData = fieldData || [];
          existData.forEach((employee) => {
            const workId = employee.value || employee.key;
            if (!workId) return;
            // 跳过重复数据
            if (
              option.ignoreDuplicate &&
              sumData.some((item) => (item.value || item.key) === workId)
            )
              return;
            sumData.unshift(employee);
          });
          break;
        }
        case "dpt": {
          const existData = fieldData || [];
          existData.forEach((dpt) => {
            // 跳过重复数据
            if (
              option.ignoreDuplicate &&
              sumData.some((item) => item.value === dpt.value)
            )
              return;
            sumData.unshift(dpt);
          });
          break;
        }
      }
    }

    if (dataType === "string") {
      sumData = sumData.join(option.separator);
    } else if (dataType === "number") {
      sumData = sumData.reduce((sum, current) => sum + current, 0);
    }
    context.$(fieldInMainform).setValue(sumData);
  }

  /**
   * FieldMap配置类型定义
   * @typedef {Object} FieldMapItem
   * @property {string} from 源字段
   * @property {string} to 填充字段
   * @property {"string" | "number" | "employee" | "dpt"} type 字段数据类型
   * @property {boolean} multiSelect 是否多选字段，type为employee时有用
   */
  /**
   * AF2SubformOption 配置类型定义
   * @typedef {Object} AF2SubformOption
   * @property {string} keepOldData 是否保留非关联表单填充的旧数据，默认为true
   */
  /**
   * 处理字段映射，组装并返回新的表单数据对象
   * @param {Object} formData 来源表单数据，如果来源为关联表单子表则为子表数据项目
   * @param {Array<module:Subform~FieldMapItem>} fieldMaps 字段映射定义
   * @param {Object} mainFormData 主表数据，如果来源是关联表单子表则该字段传主表数据，否则传null
   * @returns {Object} 新的表单数据对象
   */
  function resolveFieldMaps(
    formData,
    fieldMaps,
    mainFormData,
    associateForm,
    formInstIdField
  ) {
    const dataItem = {
      [formInstIdField]: associateForm.instanceId,
    };
    for (const fieldMap of fieldMaps) {
      const { from, to, type, multiSelect, handler } = fieldMap;

      const ids = formData[`${from}_id`];
      const values = formData[from];

      // 自定义映射方法
      if (handler && handler instanceof Function) {
        dataItem[to] = handler(formData, mainFormData, associateForm);
        continue;
      }

      switch (type) {
        case "employee": {
          const data = ids.map((id, index) => {
            const name = values[index];
            return {
              displayName: name,
              name: name,
              label: name,
              value: id,
              emplId: id,
              workId: id,
              workNo: id,
            };
          });

          if (multiSelect) {
            dataItem[to] = data;
          } else {
            dataItem[to] = data[0];
          }
          break;
        }
        case "dpt":
          dataItem[to] = ids.map((id, index) => ({
            value: id,
            name: values[index],
          }));
          break;
        default:
          dataItem[to] = formData[from];
          break;
      }
    }

    return dataItem;
  }
  /**
   * 将关联表单的数据填充到本表单的子表上
   * @static
   * @param {object} context this上下文
   * @param {"form" | "process"} formType 表单类型
   * @param {string} assocaiteFieldId 关联表单组件唯一标识
   * @param {string} localSubformId 本表单子表唯一标识
   * @param {string} formInstIdField 子表中用于存储关联表单实例Id的字段，用于判断子表数据应该删除还是新增
   * @param {module:Subform~FieldMapItem[]} fieldMaps 字段填充映射
   * @param {boolean} isDataFromSubform 填充数据是否来自关联表单的子表
   * @param {string} remoteSubformId 关联表单子表ID
   * @param {module:Subform~AF2SubformOption} options 扩展配置
   * 
   * @example
   * export function onAssocciateFormChange() {
   *   // 将关联表单对应的表单值填充到本表单子表中
   *   associateForm2Subform(
   *     this, 
   *     "form", 
   *     "associationFormField_lrimaemr", 
   *     "tableField_xxxxxx", 
   *     "textField_xxxxxx", 
   *     [{from: "textField_xxxxxx", to: "textField_xxxxxx", type: "string" }], 
   *     false, 
   *     { keepOldData: true }
   *   );
   * }
   */
  async function associateForm2Subform(
    context,
    formType,
    assocaiteFieldId,
    localSubformId,
    formInstIdField,
    fieldMaps,
    isDataFromSubform,
    remoteSubformId,
    options
  ) {
    formType = formType || "form";
    options = Object.assign({ keepOldData: true }, options);
    if (isDataFromSubform && !remoteSubformId) {
      throw new Error(
        "remoteSubformId is reqired while isDataFromSubform is set to true"
      );
    }

    const associateForm = context.$(assocaiteFieldId).getValue() || [];
    const localSubformDataList = context.$(localSubformId).getValue();

    // 1.找到需要从子表新增哪些关联表单数据
    const formShouldInsert = [];
    for (const form of associateForm) {
      const instId = form.instanceId;
      if (localSubformDataList.some((item) => item[formInstIdField] === instId)) {
        continue;
      }

      formShouldInsert.push(form);
    }
    console.log(
      `%c[关联表单填充子表]需要从${formShouldInsert.length}个关联表单新增数据`,
      "color: purple"
    );

    // 2.找到需要从子表删除哪些关联表单数据，并删除
    let newSubformDataList = [];
    let removedDataCount = 0;
    for (const subformDataItem of localSubformDataList) {
      const instId = subformDataItem[formInstIdField];
      // 子表中的表单实例Id字段为空或者和关联表单匹配的，认为是要保留的，其余删除
      if (options.keepOldData && !instId) {
        newSubformDataList.push(subformDataItem);
      } else if (associateForm.some((item) => item.instanceId === instId)) {
        newSubformDataList.push(subformDataItem);
      } else {
        removedDataCount += 1;
      }
    }
    console.log(
      `%c[关联表单填充子表]移除${removedDataCount}条子表数据`,
      "color: purple"
    );

    // 3.获取关联表单数据，组装子表
    for (const form of formShouldInsert) {
      const formData = await getFormData(context, formType, form.instanceId);
      if (isDataFromSubform) {
        const subformDataList = formData[remoteSubformId] || [];
        for (const subformData of subformDataList) {
          const newDataItem = resolveFieldMaps(
            subformData,
            fieldMaps,
            null,
            form,
            formInstIdField
          );
          newSubformDataList.push(newDataItem);
        }
      } else {
        const newDataItem = resolveFieldMaps(
          formData,
          fieldMaps,
          null,
          form,
          formInstIdField
        );
        newSubformDataList.push(newDataItem);
      }
    }

    context.$(localSubformId).setValue(newSubformDataList);
    console.log(
      `%c[关联表单填充子表]新增了${newSubformDataList.length}条子表数据`,
      "color: purple"
    );
  }

  /**
   * 数据联动相关方法 <br/>
   * 功能上类似于宜搭表单的数据联动，即根据本表单数据作为条件从其他表单带数据到本表单
   * @module DataLinkage
   */


  /**
   * 条件规则映射项 ConditionMapItem
   * @typedef {Object} ConditionMapItem
   * @property {string} from 本表单字段的唯一标识，查询条件的值来源于此字段
   * @property {string} to 目标表单字段唯一标识，使用此字段作为筛选字段
   * @property {boolean} isSubform from字段是否子表字段
   */

  /**
   * 处理数据联动的条件规则映射
   * @param {Object} context this上下文
   * @param {Array<ConditionMapItem>} conditionMap 条件规则映射
   * @param {string} tableFieldId 子表唯一标识
   * @param {number} changeItemIndex 子表字段所在行下标
   *
   * @returns {Object} 用于查询目标表单的条件参数
   */
  function resolveConditionMap(
    context,
    conditionMap,
    tableFieldId,
    changeItemIndex
  ) {
    const searchParams = {};

    if (!Array.isArray(conditionMap)) {
      return searchParams;
    }
    if (tableFieldId && changeItemIndex === undefined) {
      console.warn(
        "[resolveConditionMap]: 传入了子表唯一标识时必须传入子表行下标"
      );
    }

    let subformData = {};
    const containSubformField = conditionMap.some((item) => item.isSubform);
    if (containSubformField) {
      subformData = context.$(tableFieldId).getValue()[changeItemIndex];
    }
    for (const condition of conditionMap) {
      let value;
      if (condition.isSubform) {
        value = subformData[condition.from];
      } else {
        value = context.$(condition.from).getValue();
      }

      if (condition.from.startsWith("departmentSelectField")) {
        const dpt = (value || [])[0];
        value = (dpt || {}).value;
      }
      if (condition.from.startsWith("employeeField")) {
        const employee = (value || [])[0];
        value = (employee || {}).key;
      }

      searchParams[condition.to] = value;
    }

    return searchParams;
  }

  /**
   * 数据联动后置处理函数定义
   * @callback PostProcessor
   * @param {Object} context this上下文
   * @param {any} value 从目标表单获取到的原始值
   * @return {*} 处理后的值
   */

  /**
   * 数据联动 <br/>
   * 本方法仅支持带数据到主表，要数据联动到子表，请使用{@link module:DataLinkage~dataLinkageSubform}
   * @static
   * @param {Object} context this上下文
   * @param {"form" | "process"} targetFormType 目标表单类型，form表示普通表单，process表示流程
   * @param {string} targetFormUuid 目标表单UUID
   * @param {string} targetFieldId 目标表单要带过来的字段唯一标识
   * @param {string} fillingFieldId 要填充的本表单字段唯一标识
   * @param {Array<module:DataLinkage~ConditionMapItem>} conditionMap 条件规则映射
   * @param {module:DataLinkage~PostProcessor} postProcessor 后置处理函数
   * @param {boolean} stirctCondition 严格的条件规则，即只要有一个条件为undefined、null或者空字符串，则填充值为空
   *
   * @example
   * // 假设我们有一个员工信息表A（FORM-aaa）和审批表B（FORM-bbb）
   * // 员工信息表中有两个字段：员工姓名（textField_aaa1） 和 主管（textField_aaa2）
   * // 审批表有一个申请人字段，唯一标识textField_bbb1，和 主管（textField_bbb2）。
   * // 现在，在审批表中我们需要根据申请人从员工信息表中带出主管信息（textField_aaa2）并填充到主管（textField_bbb2）字段
   * // 在审批表中可以这么写：
   *
   * // 当申请人变更时执行，需要将此函数设置为申请人的值变更动作回调
   * export function onProposerChange() {
   *   dataLinkage(
   *     this,
   *     "form",
   *     "FORM-aaa",
   *     "textField_aaa2",
   *     "textField_bbb2",
   *     [{ from: "textField_bbb1", to: "textField_aaa1" }],
   *     undefined,
   *     true
   *   );
   * }
   */
  async function dataLinkage(
    context,
    targetFormType,
    targetFormUuid,
    targetFieldId,
    fillingFieldId,
    conditionMap,
    postProcessor,
    stirctCondition = true
  ) {
    if (!targetFormUuid || !targetFieldId || !fillingFieldId) {
      return;
    }

    // 1.组装查询参数
    let searchParams = {};
    if (Array.isArray(conditionMap)) {
      searchParams = resolveConditionMap(context, conditionMap);
    }

    // 2.查询目标表单获取关联字段值
    let fillValue = undefined;
    const containEmptyParam = Object.values(searchParams).some(
      (value) => value === undefined || value === null || value === ""
    );
    if (!(stirctCondition && containEmptyParam)) {
      let formDatas = await searchFormDatasAll(
        context,
        targetFormType,
        targetFormUuid,
        searchParams,
        { strictQuery: true }
      );
      if (formDatas.length) {
        const formData = formDatas[0];
        fillValue = formData[targetFieldId];
      }
    }

    if (postProcessor instanceof Function) {
      fillValue = postProcessor(context, fillValue);
    }

    // 3.将关联字段值填充到本表单字段
    context.$(fillingFieldId).getProps().onChange({ value: fillValue });

    console.log(
      `[子表数据联动]填充字段: ${fillingFieldId} 填充值: ${fillValue} 严格查询: ${stirctCondition} 查询参数: `,
      searchParams
    );
  }

  /**
   * 子表数据联动
   * @static
   * @param {Object} context this上下文
   * @param {string} tableFieldId 子表唯一标识
   * @param {string} formGroupId 子表数据行标识
   * @param {"form" | "process"} targetFormType 目标表单类型，form表示普通表单，process表示流程
   * @param {string} targetFormUuid 目标表单UUID
   * @param {string} targetFieldId 目标表单要带过来的字段唯一标识
   * @param {string} fillingFieldId 要填充的本表单字段唯一标识
   * @param {Array<module:DataLinkage~ConditionMapItem>} conditionMap 条件规则映射
   * @param {module:DataLinkage~PostProcessor} postProcessor 后置处理函数
   * @param {boolean} stirctCondition 严格的条件规则，即只要有一个条件为undefined、null或者空字符串，则填充值为空
   *
   * @example
   * // 假设我们有一个员工信息表A（FORM-aaa）和审批表B（FORM-bbb）
   * // 员工信息表中有两个字段：员工姓名（textField_aaa1） 和 主管（textField_aaa2）
   * // 审批表有一个子表（tableField_bbb），子表中包含两个字段：1.员工姓名字段，唯一标识textField_bbb1，和 2.主管（textField_bbb2）。
   * // 现在，在审批表的子表中我们需要根据员工姓名从员工信息表中带出主管信息（textField_aaa2）并填充到主管（textField_bbb2）字段
   * // 在审批表中可以这么写：
   *
   * // 当子表变更时执行，需要将此函数设置为子表的值变更动作回调
   * export function onSubformChange({ extra }) {
   *   if (extra && extra.from === "form_change") {
   *     const { formGroupId, tableFieldId } = extra;
   *
   *     if (extra.fieldId === "textField_bbb1") {
   *       dataLinkageSubform(
   *         this,
   *         "tableField_bbb",
   *         formGroupId,
   *         "form",
   *         "FORM-aaa",
   *         "textField_aaa2",
   *         "textField_bbb2",
   *         [{ from: "textField_bbb1", to: "textField_aaa1", isSubform: true }],
   *         undefined,
   *         true
   *       );
   *     }
   *   }
   * }
   */
  async function dataLinkageSubform(
    context,
    tableFieldId,
    formGroupId,
    targetFormType,
    targetFormUuid,
    targetFieldId,
    fillingFieldId,
    conditionMap,
    postProcessor,
    stirctCondition = true
  ) {
    if (!tableFieldId || !targetFormUuid || !targetFieldId || !fillingFieldId) {
      return;
    }

    // 1.组装查询参数
    const changeItemIndex = (context.$(tableFieldId).getItems() || []).indexOf(
      formGroupId
    );
    let searchParams = {};
    if (Array.isArray(conditionMap)) {
      searchParams = resolveConditionMap(
        context,
        conditionMap,
        tableFieldId,
        changeItemIndex
      );
    }

    // 2.查询目标表单获取关联字段值
    let fillValue = undefined;
    const containEmptyParam = Object.values(searchParams).some(
      (value) => value === undefined || value === null || value === ""
    );
    if (!(stirctCondition && containEmptyParam)) {
      let formDatas = await searchFormDatasAll(
        context,
        targetFormType,
        targetFormUuid,
        searchParams,
        { strictQuery: true }
      );
      if (formDatas.length) {
        const formData = formDatas[0];
        fillValue = formData[targetFieldId];
      }
    }

    if (postProcessor instanceof Function) {
      fillValue = postProcessor(context, fillValue);
    }

    // 3.将关联字段值填充到本表单字段
    const subformInst = context.$(tableFieldId);
    subformInst.updateItemValue(formGroupId, { [fillingFieldId]: fillValue });

    console.log(
      `[子表数据联动]子表ID: ${tableFieldId}, 填充字段: ${fillingFieldId} 填充值: ${fillValue} 严格查询: ${stirctCondition} 查询参数: `,
      searchParams
    );
  }

  exports.FieldChangeLogger = FieldChangeLogger$1;
  exports.Subform = Subform;
  exports.activateTabItems = activateTabItems;
  exports.associateForm2Subform = associateForm2Subform;
  exports.dataLinkage = dataLinkage;
  exports.dataLinkageSubform = dataLinkageSubform;
  exports.dateTimeFormat = dateTimeFormat;
  exports.deleteFormData = deleteFormData;
  exports.dialog = dialog;
  exports.fetchSubformDatas = fetchSubformDatas;
  exports.fetchSubformDatasAll = fetchSubformDatasAll;
  exports.fieldToString = fieldToString;
  exports.fieldValueDiff = fieldValueDiff;
  exports.fieldValueEqualSingle = fieldValueEqualSingle;
  exports.generateAssociationFormFieldData = generateAssociationFormFieldData;
  exports.generateDptFieldData = generateDptFieldData;
  exports.generateEmployeeFieldData = generateEmployeeFieldData;
  exports.generateRandomId = generateRandomId;
  exports.getFieldDataTypeById = getFieldDataTypeById;
  exports.getFieldTypeById = getFieldTypeById;
  exports.getFormData = getFormData;
  exports.hijackSubmit = hijackSubmit;
  exports.isEmpty = isEmpty;
  exports.loading = loading;
  exports.mergeTo = mergeTo;
  exports.retry = retry;
  exports.saveFormData = saveFormData;
  exports.searchFormDataIds = searchFormDataIds;
  exports.searchFormDataIdsAll = searchFormDataIdsAll;
  exports.searchFormDatas = searchFormDatas;
  exports.searchFormDatasAll = searchFormDatasAll;
  exports.sleep = sleep;
  exports.startInstance = startInstance;
  exports.sum2Main = sum2Main;
  exports.syncTo = syncTo;
  exports.updateFormData = updateFormData;

}));
