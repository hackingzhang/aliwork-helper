/**
 * 批量任务运行工具
 * @module BatchTaskRunner
 */

/**
 * 批量任务运行 options 选项
 * @typedef {Object} BatchTaskRunnerOptions
 * @property {Function} beforeBatchCb 批次执行前回调，在执行每个批次任务前调用
 * @property {Function} afterBatchCb 批次执行后回调，在执行完每个批次任务后调用
 */
/**
 * 任务
 * @callback Task
 * @returns {Promise}
 */
/**
 * 函数形式的任务提供者
 * @callback FnTaskProvider
 * @returns {module:BatchTaskRunner~Task}
 */
/**
 * 批量任务运行类
 *
 * @example
 * // 创建一个函数类型的taskProvider，BatchTaskRunner将调用此函数来获取任务
 * const taskProvider = (function () {
 *   let index = 0;
 *   // 生成10个简单的任务，每个任务打印其任务编号
 *   return function() {
 *     let task;
 *     if (index < 10) {
 *       task = (async function() { console.log(`Task ${index + 1}`); });
 *     } else {
 *       task = null;
 *     }
 *   }
 * })();
 *
 * // 批量处理任务，10个任务为一批次
 * new BatchTaskRunner(
 *   taskProvider,
 *   10,
 *   {
 *     beforeBatchCb: () => { console.log("批次开始"); };
 *     afterBatchCb: () => { console.log("批次结束"); };
 *   }
 * ).start();
 */
class BatchTaskRunner {
  /**
   * 构造器
   * @param {Generator<Task> | module:BatchTaskRunner~FnTaskProvider} taskProvider 任务提供者，可以传入一个函数或者生成器。
   * 一个任务就是一个函数，任务函数应当返回一个 Promise，Promise敲定即认定任务结束。<br />
   * 如果任务提供者是一个函数，当此函数返回 falsy 值则认为所有任务都已提供完毕，BatchTaskRunner 将会在执行完最后一个批次后结束。<br />
   * 如果任务提供者是一个生成器，则会遍历生成器来获取任务，遍历完成后 BatchTaskRunner 将会在执行完最后一个批次后结束。
   * @param {number} batchSize 一个批次处理多少任务
   * @param {module:BatchTaskRunner~BatchTaskRunnerOptions} options 选项
   */
  constructor(taskProvider, batchSize, options) {
    this._providerType = this._checkTaskProvider(taskProvider);

    this._taskProvider = taskProvider;
    this._batchSize = batchSize || 1;

    this._options = Object.assign(
      { beforeBatchCb: () => {}, afterBatchCb: () => {} },
      options
    );
  }

  /**
   * @private
   * 检查 taskProvider 类型，并返回类型字符串。如果任务提供者不符合类型要求则会抛出异常。
   * @param {*} taskProvider 任务提供者
   * @returns {"function" | "generator"}
   */
  _checkTaskProvider(taskProvider) {
    if (typeof taskProvider === "function") {
      return "function";
    } else if (
      Symbol.iterator in taskProvider &&
      typeof taskProvider.next === "function"
    ) {
      return "generator";
    } else {
      throw Error(
        "[BatchTaskRunner] taskProvider MUST be a function or generator"
      );
    }
  }

  /**
   * @private
   * 从任务提供者获取单个任务
   * @returns {Task}
   */
  _getTask() {
    let task = null;
    switch (this._providerType) {
      case "function":
        task = this._taskProvider();
        break;
      case "generator": {
        const next = this._taskProvider.next();
        task = next.value;
        break;
      }
    }

    return task;
  }

  /**
   * @private
   * 执行一个批次的批量任务
   * @param {Function[]} tasks
   */
  async _doBatchTask(tasks) {
    this._options.beforeBatchCb();
    const result = await Promise.allSettled(tasks.map((task) => task()));
    this._options.afterBatchCb(result);
  }

  /**
   * 开始批量处理任务
   */
  async start() {
    const tasks = [];
    let task = this._getTask();

    while (task) {
      tasks.push(task);
      if (tasks.length === this._batchSize) {
        await this._doBatchTask(tasks);
        tasks.length = 0;
      }

      task = this._getTask();
      if (!task && tasks.length) {
        await this._doBatchTask(tasks);
        tasks.length = 0;
      }
    }
  }
}

export { BatchTaskRunner };
