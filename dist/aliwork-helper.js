(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Awh = {}));
})(this, (function (exports) { 'use strict';

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
   * 搜索表单（流程）实例数据（ID）选项
   * @typedef {Object} module:DataSource.SearchFormDatasOption
   * @property {Object} dynamicOrder 排序规则，详情参见
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
   * 查询表单实例ID列表
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
   * 查询符合条件的所有表单实例ID
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
   * 查询表单实例ID响应对象
   * @typedef {Object} module:DataSource.FormDatasResponse
   * @property {number} totalCount 表单数据总条数
   * @property {number} currentPage 当前页码
   * @property {Array<Object>} formDatas 表单实例数据数组
   */

  /**
   * 分页查询表单实例数据
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
   *   { dynamicOrder: "numberField_xxx": "+" }
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
   *   { dynamicOrder: "numberField_xxx": "+", instanceStatus: "COMPLETED" }
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
    const formDatas = (data || []).map((item) => ({
      ...item,
      // 普通表单的表单数据在formData属性中
      ...item.formData,
      // 流程表单的表单数据在data属性中
      ...item.data,
    }));

    return {
      currentPage: cPage,
      totalCount,
      formDatas,
    };
  }

  /**
   * 查询符合条件的所有表单实例
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
   *   { dynamicOrder: "numberField_xxx": "+" }
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
   *   { dynamicOrder: "numberField_xxx": "+", instanceStatus: "COMPLETED" }
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
      const { formDatas } = await searchFormDatas(
        context,
        type,
        formUuid,
        searchFieldObject,
        currentPage,
        pageSize,
        options
      );
      allFormDatas = allFormDatas.concat(formDatas);

      if (formDatas.length !== pageSize) {
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

  exports.deleteFormData = deleteFormData;
  exports.dialog = dialog;
  exports.fetchSubformDatas = fetchSubformDatas;
  exports.fetchSubformDatasAll = fetchSubformDatasAll;
  exports.getFormData = getFormData;
  exports.hijackSubmit = hijackSubmit;
  exports.loading = loading;
  exports.retry = retry;
  exports.saveFormData = saveFormData;
  exports.searchFormDataIds = searchFormDataIds;
  exports.searchFormDataIdsAll = searchFormDataIdsAll;
  exports.searchFormDatas = searchFormDatas;
  exports.searchFormDatasAll = searchFormDatasAll;
  exports.sleep = sleep;
  exports.updateFormData = updateFormData;

}));
