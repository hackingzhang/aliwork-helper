/**
 * 跨应用数据源以及连接器接口请求封装, 详情参考宜搭文档 {@link https://docs.aliwork.com/docs/developer/api/openAPI}
 * @module DataSource
 */

import { getFieldTypeById } from "./field";

/**
 * 调用连接器
 * @static
 * @param {object} context this上下文
 * @param {string} connectorName 连接器名称，数据源面板中添加连接器时配置的名称
 * @param {object} params 连接器执行动作参数
 * @returns {Promise<object>}
 * 
 * @example
 * // 假设要通过连接器调用钉钉接口获取部门下的子部门信息
 * invokeConnector(this, "subDepts", {
 *   Query: {
 *     access_token: ""
 *   },
 *   Body: {
 *     dept_id: 1
 *   }
 * }).then((resp) => {
 *   console.log("请求成功: ", resp);
 * }, (e) => {
 *   console.log(`请求失败：${e.message}`);
 * })
 */
async function invokeConnector(context, connectorName, params) {
  const resp = await context.dataSourceMap[connectorName].load({
    inputs: JSON.stringify(params)
  });

  return resp;
}

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
    dptId,
  });

  return instanceId;
}

/**
 * 流程实例状态<br/>
 * RUNNING - 运行中<br/>
 * TERMINATED - 已终止<br/>
 * COMPLETED - 已完成<br/>
 * ERROR - 异常
 * @typedef {"RUNNING" | "TERMINATED" | "COMPLETED" | "ERROR"} ProcessStatus
 */

/**
 * 流程审批结果<br/>
 * agree - 同意<br/>
 * disagree - 不同意
 * @typedef {"agree" | "disagree"} ApprovedResult
 */

/**
 * 搜索表单（流程）实例数据（ID）选项
 * @typedef {Object} SearchFormDatasOption
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
 * @property {module:DataSource~ProcessStatus} instanceStatus
 * 实例状态，仅查询流程表单有效,可选值为：RUNNING, TERMINATED, COMPLETED, ERROR。分别代表：运行中，已终止，已完成，异常。
 * @property {module:DataSource~ApprovedResult} approvedResult 流程审批结果，仅查询流程表单有效，可选值为agree、disagree，分别代表同意、不同意。
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
 * @param {module:DataSource~SearchFormDatasOption} options 查询选项
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
 *   { dynamicOrder: { "numberField_xxx": "+" } }
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
 *   { dynamicOrder: { "numberField_xxx": "+" }, instanceStatus: "COMPLETED" }
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
 * @param {module:DataSource~SearchFormDatasOption} options 查询选项
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
 * 表单实例数据对象
 * @typedef {Object.<string, *>} FormData
 * @property {string} title 数据标题
 * @property {string} formUuid 表单formUuid
 * @property {string} instanceId 实例ID
 * @property {string} processCode 流程码（🚨仅流程包含该字段）
 * @property {module:DataSource~ProcessStatus} instanceStatus
 * 流程状态（🚨仅流程包含该字段），可能值为：RUNNING, TERMINATED, COMPLETED, ERROR。分别代表：运行中，已终止，已完成，异常。
 * @property {module:DataSource~ApprovedResult} approvedResult 审批结果（🚨仅流程包含该字段）
 * @property {string} creator 创建人ID（🚨仅表单包含该字段）
 * @property {Object} originator 发起人对象
 * @property {string} originatorCorpId 发起人企业ID
 * @property {string} originatorCorpName 发起人企业名称
 * @property {number} gmtCreate 创建时间戳
 * @property {string} modifier 最后修改人ID（🚨仅表单包含该字段）
 * @property {Object} modifyUser 最后修改人对象（🚨仅表单包含该字段）
 * @property {number} gmtModified 最后修改时间戳
 */

/**
 * 查询表单实例数据响应对象
 * @typedef {Object} FormDatasResponse
 * @property {number} totalCount 表单数据总条数
 * @property {number} currentPage 当前页码
 * @property {number} actualPageSize 接口返回的当前页数据量，当开启严格查询时，
 * 由于进行了额外的筛选，方法返回的数据量量可能小于接口返回的数据量
 * @property {Array<module:DataSource~FormData>} formDatas 表单实例数据数组
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
 * @param {module:DataSource~SearchFormDatasOption} options 查询选项
 * @returns {Promise<Array<module:DataSource~FormDatasResponse>>}
 * 一个Promise，resolve表单实例ID响应对象 {@link module:DataSource~FormDatasResponse}
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
  let formDatas = [];
  if (type === "form") {
    formDatas = (data || []).map((item) => ({
      title: item.title,
      formUuid: item.formUuid,
      instanceId: item.formInstId,
      creator: item.creator,
      originator: item.originator,
      originatorCorpId: item.originatorCorpId,
      originatorCorpName: item.originatorCorpName,
      gmtCreate: item.gmtCreate,
      modifier: item.modifier,
      modifyUser: item.modifyUser,
      gmtModified: item.gmtModified,
      // 普通表单的表单数据在formData属性中
      ...item.formData,
    }));
  } else if (type === "process") {
    formDatas = (data || []).map((item) => ({
      title: item.title,
      formUuid: item.formUuid,
      instanceId: item.processInstanceId,
      processCode: item.processCode,
      instanceStatus: item.instanceStatus,
      approvedResult: item.approvedResult,
      originator: item.originator,
      originatorCorpId: item.originatorCorpId,
      originatorCorpName: item.originatorCorpName,
      gmtCreate: item.gmtCreate,
      gmtModified: item.gmtModified,
      // 流程表单的表单数据在data属性中
      ...item.data,
    }));
  }

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
 * @param {module:DataSource~SearchFormDatasOption} options 查询选项
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
 *   { strictQuery: true, dynamicOrder: { "numberField_xxx": "+" } }
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
 *   { strictQuery: true, dynamicOrder: { "numberField_xxx": "+" }, instanceStatus: "COMPLETED" }
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
 * 流程审批记录对象
 * @typedef {Object} OperationRecord
 * @property {string} action 动作描述文本，仅已处理节点有该字段
 * @property {"submit" | "agree" | "disagree" | "doing" | "next"} actionExt 动作描述码，
 * submit表示提交节点、agree表示节点审批结果为同意、disagree表示审批结果为不同意、
 * doing表示当前节点，next表示此节点为后续待审批节点
 * @property {string} activityId 活动ID
 * @property {Array} domains
 * @property {string} operator 操作人ID
 * @property {string[]} operatorAgentIds 代理人ID
 * @property {string} operatorDisplayName 操作人显示名
 * @property {string} operatorName 操作人姓名
 * @property {string} operatorPhotoUrl 操作人头像链接
 * @property {string} processInstanceId 流程实例ID
 * @property {string} showName 节点名
 * @property {number} size -
 * @property {number} taskHoldTime 任务持续时间？
 * @property {string} taskId 任务ID
 * @property {"HISTORY" | "TODO"} type 记录类型，HISTORY表示已处理的节点，TODO表示待处理节点
 */

/**
 * 获取流程审批记录
 * @static
 * @param {Object} context this上下文
 * @param {string} instanceId 流程实例ID
 * @return {Promise<module:DataSource~OperationRecord>} 一个Promise，resolve流程审批记录列表
 *
 * @example
 * // 使用前请添加数据源：
 * // 名称：getOperationRecords
 * // 请求方法：GET
 * // 请求地址：/dingtalk/web/APP_xxxxxx/v1/process/getOperationRecords.json
 *
 * getOperationRecords(this, "2c517124-e73e-4528-acc8-28216c6c8df9")
 * .then((records) => {
 *     console.log("获取成功", records);
 *   },(e) => {
 *     console.log(`获取失败：${e.message}`);
 *   }
 * );
 */
async function getOperationRecords(context, instanceId) {
  if (!instanceId) throw Error("instanceId is required");

  return await context.dataSourceMap.getOperationRecords.load({
    processInstanceId: instanceId,
  });
}

/**
 * 执行流程单个任务/流程节点审批
 * @static
 * @param {Object} context this上下文
 * @param {string} instanceId 实例ID
 * @param {string} taskId 任务ID，可通过 {@link module:DataSource.getOperationRecords} 方法获取流程当前及历史节点taskId
 * @param {"AGREE" | "DISAGREE"} result 审批结果
 * @param {string} remark 审批意见
 * @param {Object} [formData] 表单数据对象
 * @param {boolean} [noExecuteExpressions] 是否<strong>不执行</strong>校验&关联操作
 * @return {Promise} 一个Promise
 *
 * @example
 * // 使用前请添加数据源：
 * // 名称：executeTask
 * // 请求方法：POST
 * // 请求地址：/dingtalk/web/APP_xxxxxx/v1/task/executeTask.json
 *
 * executeTask(this, "FINST-xxxxxx", "25748312227", "AGREE", "同意", {}, 'n')
 * .then(() => {
 *     console.log("执行成功");
 *   },(e) => {
 *     console.log(`执行失败`);
 *   }
 * );
 */
async function executeTask(
  context,
  instanceId,
  taskId,
  result,
  remark,
  formData,
  noExecuteExpressions
) {
  if (!instanceId) throw Error("instanceId is required");
  if (!taskId) throw Error("taskId is required");
  if (!result) throw Error("审批结果必填");
  if (!remark) throw Error("审批意见必填");

  const formDataJson = JSON.stringify(formData || {});

  if (typeof noExecuteExpressions === "boolean") {
    noExecuteExpressions = noExecuteExpressions ? "y" : "n";
  }

  await context.dataSourceMap.executeTask.load({
    procInstId: instanceId,
    taskId,
    outResult: result,
    remark,
    formDataJson,
    noExecuteExpressions,
  });
}

export {
  getFormData,
  searchFormDataIds,
  searchFormDataIdsAll,
  searchFormDatas,
  searchFormDatasAll,
  fetchSubformDatas,
  fetchSubformDatasAll,
  saveFormData,
  startInstance,
  updateFormData,
  deleteFormData,
  getOperationRecords,
  executeTask,
  invokeConnector,
};
