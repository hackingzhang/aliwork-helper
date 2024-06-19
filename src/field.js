/**
 * 表单/自定义页面字段相关方法
 * @module Field
 */

import { isEmpty, dateTimeFormat } from "./utils";

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

  if (!type) {
    type === "text";
  }

  return type;
}

/**
 * 生成部门字段数据，可直接赋值给部门组件<br/ >
 * ⚠️如果传数组作为参数，ID和名称的顺序必须一一对应。<br />
 * 🤯通过数据源获取到的表单数据，部门字段的值就是部门ID和部门名称分开的两个数组，
 * 可以直接将其传入来生成可赋值给部门组件的部门字段数据。
 * @static
 * @param {string | number | string[] | number[]} id 部门ID，接受单个ID或者ID数组
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
  if (typeof id === "string" || typeof id === "number") {
    ids = [id];
    names = [name];
  }

  if (!Array.isArray(ids)) return null;

  return ids.map((id, index) => {
    return {
      text: names[index],
      value: String(id),
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
      const match = arrayNewVal.find((item) => {
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
  if (value === undefined || value === null) return "";
  if (typeof value === "string") return value;

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
        if (typeof item === "string") return item;

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
export function syncTo(change) {
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
export function mergeTo() {
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

export {
  activateTabItems,
  getFieldTypeById,
  getFieldDataTypeById,
  generateDptFieldData,
  generateEmployeeFieldData,
  generateAssociationFormFieldData,
  fieldValueDiff,
  fieldValueEqualSingle,
  fieldToString,
};
