import External from "../core/External";
import Messages from "../utils/messages";

function getData(task) {
  if (task && task.data) {
    return {
      ...task,
      data: JSON.stringify(task.data),
    };
  }

  return task;
}

/**
 * 获取数据
 */
function getState(task) {
  return {
    annotations: task?.annotations,
    completions: task?.completions,
    predictions: task?.predictions,
  };
}

/**
 * LS will render in this part
 */
function rootElement(element) {
  let root;

  if (typeof element === "string") {
    root = document.getElementById(element);
  } else {
    root = element;
  }

  root.innerHTML = "";

  return root;
}

/**
 * Function to configure application with callbacks
 * @param {object} params
 */
function configureApplication(params) {
  // 回调，以实现兼容
  const osCB = params.submitAnnotation || params.onSubmitAnnotation;
  const ouCB = params.updateAnnotation || params.onUpdateAnnotation;
  const odCB = params.deleteAnnotation || params.onDeleteAnnotation;

  const options = {
    // communication with the server
    // fetch: params.fetch || Requests.fetcher,
    // patch: params.patch || Requests.patch,
    // post: params.post || Requests.poster,
    // remove: params.remove || Requests.remover,

    // 与用户沟通
    alert: m => console.log(m), // Noop for demo: window.alert(m)
    messages: { ...Messages, ...params.messages },

    // 回调和事件处理程序
    onSubmitAnnotation: params.onSubmitAnnotation ? osCB : External.onSubmitAnnotation,
    onUpdateAnnotation: params.onUpdateAnnotation ? ouCB : External.onUpdateAnnotation,
    onDeleteAnnotation: params.onDeleteAnnotation ? odCB : External.onDeleteAnnotation,
    onSkipTask: params.onSkipTask ? params.onSkipTask : External.onSkipTask,
    onCancelSkippingTask: params.onCancelSkippingTask ? params.onCancelSkippingTask : External.onCancelSkippingTask,
    onSubmitDraft: params.onSubmitDraft,
    onTaskLoad: params.onTaskLoad || External.onTaskLoad,
    onProjectFetch: params.onProjectFetch || External.onProjectFetch,
    onLabelStudioLoad: params.onLabelStudioLoad || External.onLabelStudioLoad,
    onEntityCreate: params.onEntityCreate || External.onEntityCreate,
    onEntityDelete: params.onEntityDelete || External.onEntityDelete,
    onGroundTruth: params.onGroundTruth || External.onGroundTruth,
    onSelectAnnotation: params.onSelectAnnotation || External.onSelectAnnotation,
    onAcceptAnnotation: params.onAcceptAnnotation || External.onAcceptAnnotation,
    onRejectAnnotation: params.onRejectAnnotation || External.onRejectAnnotation,
    onStorageInitialized: params.onStorageInitialized || External.onStorageInitialized,
    onNextTask: params.onNextTask || External.onNextTask,
    onPrevTask: params.onPrevTask || External.onPrevTask,

    // 其他设置，一些标识
    forceAutoAnnotation: params.forceAutoAnnotation ?? false,
    forceAutoAcceptSuggestions: params.forceAutoAcceptSuggestions ?? false,
  };

  return options;
}

export default { rootElement, getState, getData, configureApplication };
