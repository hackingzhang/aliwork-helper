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

  /**
   * 判断一个值是否为空 <br/>
   * 这些情况会被判定为空：
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

  exports.activateTabItems = activateTabItems;
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
  exports.syncTo = syncTo;
  exports.updateFormData = updateFormData;

}));
