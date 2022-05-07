/* global LSF_VERSION */

import { flow, getEnv, types } from "mobx-state-tree";

import InfoModal from "../components/Infomodal/Infomodal";
import { Hotkey } from "../core/Hotkey";
import ToolsManager from "../tools/Manager";
import Utils from "../utils";
import messages from "../utils/messages";
import { guidGenerator } from "../utils/unique";
import { delay, isDefined } from "../utils/utilities";
import AnnotationStore from "./Annotation/store";
import Project from "./ProjectStore";
import Settings from "./SettingsStore";
import Task from "./TaskStore";
import User, { UserExtended } from "./UserStore";
import { UserLabels } from "./UserLabels";
import { FF_DEV_1536, isFF } from "../utils/feature-flags";

const hotkeys = Hotkey("AppStore", "全局快捷键");

export default types
  .model("AppStore", {
    /**
     * XML config
     */
    config: types.string,

    /**
     * Task with data, id and project
     */
    task: types.maybeNull(Task),

    project: types.maybeNull(Project),

    /**
     * 猜测：应该就是标注界面左上方 1 of 1 这个东西吧
     * History of task {taskId, annotationId}:
    */
    taskHistory: types.array(types.model({
      taskId: types.number,
      annotationId: types.maybeNull(types.string),
    }), []),

    /**
     * 在界面上展示哪些功能
     */
    interfaces: types.array(types.string),

    /**
     * 标注任务的 falg
     */
    explore: types.optional(types.boolean, false),

    /**
     * Annotations Store
     */
    annotationStore: types.optional(AnnotationStore, {
      annotations: [],
      predictions: [],
      history: [],
    }),

    /**
     * User of Label Studio
     */
    user: types.maybeNull(User),

    /**
     * Debug for development environment
     */
    debug: window.HTX_DEBUG === true,

    /**
     * Settings of Label Studio
     */
    settings: types.optional(Settings, {}),

    /**
     * Data of description flag
     */
    description: types.maybeNull(types.string),
    // apiCalls: types.optional(types.boolean, true),

    /**
     * Flag for settings
     * 标注界面中间上方的设置，有快捷键之类的那个
     */
    showingSettings: types.optional(types.boolean, false),
    /**
     * Flag
     * Description of task in Label Studio
     */
    showingDescription: types.optional(types.boolean, false),
    /**
     * Loading of Label Studio
     */
    isLoading: types.optional(types.boolean, false),
    /**
     * 提交任务时置为 true，防止重复请求
     */
    isSubmitting: false,
    /**
     * Flag for disable task in Label Studio
     */
    noTask: types.optional(types.boolean, false),
    /**
     * Flag for no access to specific task
     */
    noAccess: types.optional(types.boolean, false),
    /**
     * 完成标注
     */
    labeledSuccess: types.optional(types.boolean, false),

    /**
     * Show or hide comments section
     */
    showComments: false,

    /**
     * Dynamic preannotations
     */
    _autoAnnotation: false,

    /**
     * Auto accept suggested annotations
     */
    _autoAcceptSuggestions: false,

    /**
     * Indicator for suggestions awaiting
     */
    awaitingSuggestions: false,

    /**
     * 当前任务的所有标注人员
     */
    users: types.optional(types.array(UserExtended), []),

    userLabels: isFF(FF_DEV_1536) ? types.optional(UserLabels, { controls: {} }) : types.undefined,
  })
  .preProcessSnapshot((sn) => {
    return {
      ...sn,
      _autoAnnotation: localStorage.getItem("autoAnnotation") === "true",
      _autoAcceptSuggestions: localStorage.getItem("autoAcceptSuggestions") === "true",
    };
  })
  .volatile(() => ({
    version: typeof LSF_VERSION === "string" ? LSF_VERSION : "0.0.0",
    initialized: false,
    suggestionsRequest: null,
  }))
  .views(self => ({
    /**
     * Get alert
     */
    get alert() {
      return getEnv(self).alert;
    },

    get hasSegmentation() {
      // not an object and not a classification
      const isSegmentation = t => !t.getAvailableStates && !t.perRegionVisible;

      return Array.from(self.annotationStore.names.values()).some(isSegmentation);
    },
    get canGoNextTask() {
      if (self.taskHistory && self.task && self.taskHistory.length > 1 && self.task.id !== self.taskHistory[self.taskHistory.length - 1].taskId) {
        return true;
      }
      return false;
    },
    get canGoPrevTask() {
      if (self.taskHistory && self.task && self.taskHistory.length > 1 && self.task.id !== self.taskHistory[0].taskId) {
        return true;
      }
      return false;
    },
    get forceAutoAnnotation() {
      return getEnv(self).forceAutoAnnotation;
    },
    get forceAutoAcceptSuggestions() {
      return getEnv(self).forceAutoAcceptSuggestions;
    },
    get autoAnnotation() {
      return self.forceAutoAnnotation || self._autoAnnotation;
    },
    get autoAcceptSuggestions() {
      return self.forceAutoAcceptSuggestions || self._autoAcceptSuggestions;
    },
  }))
  .actions(self => {
    /**
     * Update settings display state
     */
    function toggleSettings() {
      self.showingSettings = !self.showingSettings;
    }

    /**
     * Update description display state
     */
    function toggleDescription() {
      self.showingDescription = !self.showingDescription;
    }

    function setFlags(flags) {
      const names = [
        "showingSettings",
        "showingDescription",
        "isLoading",
        "isSubmitting",
        "noTask",
        "noAccess",
        "labeledSuccess",
        "awaitingSuggestions",
      ];

      for (const n of names) if (n in flags) self[n] = flags[n];
    }

    /**
     * Check for interfaces
     * @param {string} name
     * @returns {string | undefined}
     */
    function hasInterface(...names) {
      return self.interfaces.find(i => names.includes(i)) !== undefined;
    }

    function addInterface(name) {
      return self.interfaces.push(name);
    }

    function toggleComments(state) {
      return (self.showComments = state);
    }

    /**
     * Function
     * 创建成功的回调
     */
    function afterCreate() {
      ToolsManager.setRoot(self);

      // important thing to detect Area atomatically: it hasn't access to store, only via global
      window.Htx = self;

      self.attachHotkeys();

      getEnv(self).events.invoke('labelStudioLoad', self);
    }

    // 绑定快捷键
    function attachHotkeys() {
      // 在 LS 重新初始化的情况下取消绑定以前的快捷键
      hotkeys.unbindAll();

      /**
       * Hotkey for submit
       */
      if (self.hasInterface("submit", "update", "review")) {
        hotkeys.addNamed("annotation:submit", () => {
          const annotationStore = self.annotationStore;

          if (annotationStore.viewingAll) return;

          const entity = annotationStore.selected;


          if (self.hasInterface("review")) {
            self.acceptAnnotation();
          } else if (!isDefined(entity.pk) && self.hasInterface("submit")) {
            self.submitAnnotation();
          } else if (self.hasInterface("update")) {
            self.updateAnnotation();
          }
        });
      }

      /**
       * Hotkey for skip task
       */
      if (self.hasInterface("skip", "review")) {
        hotkeys.addNamed("annotation:skip", () => {
          if (self.annotationStore.viewingAll) return;

          if (self.hasInterface("review")) {
            self.rejectAnnotation();
          } else {
            self.skipTask();
          }
        });
      }

      /**
       * Hotkey for delete
       */
      hotkeys.addNamed("region:delete-all", () => {
        const { selected } = self.annotationStore;

        if (window.confirm(messages.CONFIRM_TO_DELETE_ALL_REGIONS)) {
          selected.deleteAllRegions();
        }
      });

      // create relation
      hotkeys.overwriteNamed("region:relation", () => {
        const c = self.annotationStore.selected;

        if (c && c.highlightedNode && !c.relationMode) {
          c.startRelationMode(c.highlightedNode);
        }
      });

      // Focus fist focusable perregion when region is selected
      hotkeys.addNamed("region:focus", (e) => {
        e.preventDefault();
        const c = self.annotationStore.selected;

        if (c && c.highlightedNode && !c.relationMode) {
          c.highlightedNode.requestPerRegionFocus();
        }
      });

      // unselect region
      hotkeys.addNamed("region:unselect", function() {
        const c = self.annotationStore.selected;

        if (c && !c.relationMode) {
          c.unselectAll();
        }
      });

      hotkeys.addNamed("region:visibility", function() {
        const c = self.annotationStore.selected;

        if (c && c.highlightedNode && !c.relationMode) {
          c.highlightedNode.toggleHidden();
        }
      });

      hotkeys.addNamed("annotation:undo", function() {
        const annotation = self.annotationStore.selected;

        annotation.undo();
      });

      hotkeys.addNamed("annotation:redo", function() {
        const annotation = self.annotationStore.selected;

        annotation.redo();
      });

      hotkeys.addNamed("region:exit", () => {
        const c = self.annotationStore.selected;

        if (c && c.relationMode) {
          c.stopRelationMode();
        } else {
          c.unselectAll();
        }
      });

      hotkeys.addNamed("region:delete", () => {
        const c = self.annotationStore.selected;

        if (c) {
          c.deleteSelectedRegions();
        }
      });

      hotkeys.addNamed("region:cycle", () => {
        const c = self.annotationStore.selected;

        c && c.regionStore.selectNext();
      });

      // duplicate selected regions
      // 复制选择的区域
      hotkeys.addNamed("region:duplicate", (e) => {
        const { selected } = self.annotationStore;
        const { serializedSelection } = selected || {};

        if (!serializedSelection?.length) return;
        e.preventDefault();
        const results = selected.appendResults(serializedSelection);

        selected.selectAreas(results);
      });
    }

    /**
     * 分配任务，初始化了 self.task，也就是将要标注的 task；然后向历史记录中加了一条
     * @param {*} taskObject 当前选择的 task
     */
    function assignTask(taskObject) {
      if (taskObject && !Utils.Checkers.isString(taskObject.data)) {
        taskObject = {
          ...taskObject,
          cancelledAnnotations: taskObject.cancelled_annotations,
          data: JSON.stringify(taskObject.data),
        };
      }
      self.task = Task.create(taskObject);
      if (self.taskHistory.findIndex((x) => x.taskId === self.task.id) === -1) {
        self.taskHistory.push({
          taskId: self.task.id,
          annotationId: null,
        });
      }
    }

    function assignConfig(config) {
      const cs = self.annotationStore;

      self.config = config;
      cs.initRoot(self.config);
    }

    /* eslint-disable no-unused-vars */
    function showModal(message, type = "warning") {
      InfoModal[type](message);

      // InfoModal.warning("You need to label at least something!");
    }
    /* eslint-enable no-unused-vars */

    // 提交草稿
    function submitDraft(c) {
      return new Promise(resolve => {
        const events = getEnv(self).events;

        if (!events.hasEvent('submitDraft')) return resolve();
        const res = events.invokeFirst('submitDraft', self, c);

        if (res && res.then) res.then(resolve);
        else resolve(res);
      });
    }

    // Set `isSubmitting` flag to block [Submit] and related buttons during request
    // to prevent from sending duplicating requests.
    // Better to return request's Promise from SDK to make this work perfect.
    // 提交时防止双击、设置延迟
    function handleSubmittingFlag(fn, defaultMessage = "提交时出现错误") {
      self.setFlags({ isSubmitting: true });
      const res = fn();
      // Wait for request, max 5s to not make disabled forever broken button;
      // but block for at least 0.2s to prevent from double clicking.

      Promise.race([Promise.all([res, delay(200)]), delay(5000)])
        .catch(err => showModal(err?.message || err || defaultMessage))
        .then(() => self.setFlags({ isSubmitting: false }));
    }

    // 提交
    function submitAnnotation() {
      if (self.isSubmitting) return;

      const entity = self.annotationStore.selected;
      const event = entity.exists ? 'updateAnnotation' : 'submitAnnotation';

      entity.beforeSend();

      if (!entity.validate()) return;

      entity.sendUserGenerate();
      handleSubmittingFlag(async () => {
        // getEnv() 用来获取 store 的环境，内容的话就是 configureApplication 方法中 options
        await getEnv(self).events.invoke(event, self, entity);
        // 更新项目的数据
        self.project.id && await self?.project.updateProjectData();
      });
      entity.dropDraft();
    }

    // 更新
    function updateAnnotation(extraData) {
      if (self.isSubmitting) return;

      const entity = self.annotationStore.selected;

      entity.beforeSend();

      if (!entity.validate()) return;

      handleSubmittingFlag(async () => {
        await getEnv(self).events.invoke('updateAnnotation', self, entity, extraData);
        // 更新项目的数据
        self.project.id && await self?.project.updateProjectData();
      });
      entity.dropDraft();
      !entity.sentUserGenerate && entity.sendUserGenerate();
    }

    // 跳过任务
    function skipTask() {
      handleSubmittingFlag(() => {
        getEnv(self).events.invoke('skipTask', self);
      }, "执行跳过时失败，请重试");
    }

    // 取消跳过
    function cancelSkippingTask() {
      handleSubmittingFlag(() => {
        getEnv(self).events.invoke('cancelSkippingTask', self);
      }, "执行取消跳过时失败，请重试");
    }

    // 接受 或者 修复并接受
    function acceptAnnotation() {
      if (self.isSubmitting) return;

      handleSubmittingFlag(async () => {
        const entity = self.annotationStore.selected;

        entity.beforeSend();
        if (!entity.validate()) return;

        // 可以撤销
        const isDirty = entity.history.canUndo;

        entity.dropDraft();
        await getEnv(self).events.invoke('acceptAnnotation', self, entity, isDirty);
      }, "Error during accept, try again");
    }

    // 拒绝，comment 为填写的评论
    function rejectAnnotation({ comment = null }) {
      if (self.isSubmitting) return;

      handleSubmittingFlag(async () => {
        // 所选的 annotation
        const entity = self.annotationStore.selected;

        entity.beforeSend();
        if (!entity.validate()) return;

        // 可以重做
        const isDirty = entity.history.canUndo;

        entity.dropDraft();
        await getEnv(self).events.invoke('rejectAnnotation', self, { isDirty, annotation: entity, comment });
      }, "Error during reject, try again");
    }

    /**
     * Reset annotation store
     * 重新创建工具、重新绑定快捷键、创建 annotationStore
     */
    function resetState() {
      // 工具附着到控件和 object tags
      // 当我们执行新任务时需要重新创建
      // Tools are attached to the control and object tags
      // and need to be recreated when we st a new task
      ToolsManager.removeAllTools();

      // 重新绑定快捷键
      Hotkey.unbindAll();
      self.attachHotkeys();

      self.annotationStore = AnnotationStore.create({ annotations: [] });
      self.initialized = false;

      // const c = self.annotationStore.addInitialAnnotation();

      // self.annotationStore.selectAnnotation(c.id);
    }

    /**
     * 初始化 annotation store
     * 指定 annotations and predictions
     * `completions` 是为了兼容旧项目，最终会被保存为 `annotations`
     */
    function initializeStore({ annotations, completions, predictions, annotationHistory }) {
      console.log('lsf AppStore.js initializeStore\n',  { annotations, completions, predictions, annotationHistory });
      const as = self.annotationStore;

      as.initRoot(self.config);

      // 处理预测相关
      // eslint breaks on some optional chaining https://github.com/eslint/eslint/issues/12822
      /* eslint-disable no-unused-expressions */
      (predictions ?? []).forEach(p => {
        const obj = as.addPrediction(p);

        as.selectPrediction(obj.id);
        obj.deserializeResults(p.result.map(r => ({
          ...r,
          origin: "prediction",
        })));
      });

      // 处理 annotation 相关
      [...(completions ?? []), ...(annotations ?? [])]?.forEach((a) => {
        const obj = as.addAnnotation(a);

        as.selectAnnotation(obj.id);
        obj.deserializeResults(a.draft || a.result);
        obj.reinitHistory();
      });

      const current = as.annotations[as.annotations.length - 1];

      if (current) current.setInitialValues();

      self.setHistory(annotationHistory);

      /* eslint-enable no-unused-expressions */
      // 回调，表示完成了初始化
      if (!self.initialized) {
        self.initialized = true;
        getEnv(self).events.invoke('storageInitialized', self);
      }
    }

    /**
     * 向 AnnotationStore.history 设置历史
     * @param {AnnotationStore.history} history 历史记录
     */
    function setHistory(history = []) {
      const as = self.annotationStore;

      as.clearHistory();

      (history ?? []).forEach(item => {
        const obj = as.addHistory(item);

        obj.deserializeResults(item.result ?? [], { hidden: true });
      });
    }

    const setAutoAnnotation = (value) => {
      self._autoAnnotation = value;
      localStorage.setItem("autoAnnotation", value);
    };

    const setAutoAcceptSuggestions = (value) => {
      self._autoAcceptSuggestions = value;
      localStorage.setItem("autoAcceptSuggestions", value);
    };

    const loadSuggestions = flow(function* (request, dataParser) {
      const requestId = guidGenerator();

      self.suggestionsRequest = requestId;

      self.setFlags({ awaitingSuggestions: true });
      const response = yield request;

      if (requestId === self.suggestionsRequest) {
        self.annotationStore.selected.setSuggestions(dataParser(response));
        self.setFlags({ awaitingSuggestions: false });
      }
    });

    function addAnnotationToTaskHistory(annotationId) {
      const taskIndex = self.taskHistory.findIndex(({ taskId }) => taskId === self.task.id);

      if (taskIndex >= 0) {
        self.taskHistory[taskIndex].annotationId = annotationId;
      }
    }

    function nextTask() {
      if (self.canGoNextTask) {
        const { taskId, annotationId } = self.taskHistory[self.taskHistory.findIndex((x) => x.taskId === self.task.id) + 1];

        getEnv(self).events.invoke('nextTask', taskId, annotationId);
      }
    }

    function prevTask() {
      if (self.canGoPrevTask) {
        const { taskId, annotationId } = self.taskHistory[self.taskHistory.findIndex((x) => x.taskId === self.task.id) - 1];

        getEnv(self).events.invoke('prevTask', taskId, annotationId);
      }
    }

    return {
      setFlags,
      addInterface,
      hasInterface,

      afterCreate,
      assignTask,
      assignConfig,
      resetState,
      initializeStore,
      setHistory,
      attachHotkeys,

      skipTask,
      cancelSkippingTask,
      submitDraft,
      submitAnnotation,
      updateAnnotation,
      acceptAnnotation,
      rejectAnnotation,

      showModal,
      toggleComments,
      toggleSettings,
      toggleDescription,

      setAutoAnnotation,
      setAutoAcceptSuggestions,
      loadSuggestions,

      addAnnotationToTaskHistory,
      nextTask,
      prevTask,
      beforeDestroy() {
        ToolsManager.removeAllTools();
      },
    };
  });
