import { render, unmountComponentAtNode } from "react-dom";
import App from "./components/App/App";
import { configureStore } from "./configureStore";
import { LabelStudio as LabelStudioReact } from './Component';
import { registerPanels } from "./registerPanels";
import { configure } from "mobx";
import { EventInvoker } from './utils/events';
import legacyEvents from './core/External';
import { toCamelCase } from "strman";
import { isDefined } from "./utils/utilities";
import { Hotkey } from "./core/Hotkey";
import defaultOptions from './defaultOptions';
import { destroy } from "mobx-state-tree";

/**
 * 文档：https://cn.mobx.js.org/refguide/api.html#isolateglobalstate-boolean
 * 项目使用了 mobx-state-tree，配置 isolateGlobalState 可以共享状态。该功能需要统一版本号。
 */
configure({
  isolateGlobalState: true,
});

export class LabelStudio {
  // 多实例？
  static instances = new Set();

  static destroyAll() {
    this.instances.forEach(inst => inst.destroy());
    this.instances.clear();
  }

  constructor(root, userOptions = {}) {
    // defaultOptions 里只有 interfaces
    const options = Object.assign({}, defaultOptions, userOptions ?? {});

    // 自定义快捷键
    if (options.keymap) {
      Hotkey.setKeymap(options.keymap);
    }
    // 渲染的根元素
    this.root = root;
    // 事件系统
    this.events = new EventInvoker();
    // 选项
    this.options = options ?? {};
    // 卸载 lsf，销毁 mobx 数据
    this.destroy = (() => { /* noop */ });
    // 覆盖事件，如果有的话
    this.supportLgacyEvents(options);
    // 创建 App
    this.createApp();

    this.constructor.instances.add(this);
  }

  on(...args) {
    this.events.on(...args);
  }

  off(eventName, callback){
    if (isDefined(callback)) {
      this.events.off(eventName, callback);
    } else {
      this.events.removeAll(eventName);
    }
  }

  async createApp() {
    // 创建 Store
    const { store, getRoot } = await configureStore(this.options, this.events);
    // 生成根元素
    const rootElement = getRoot(this.root);

    this.store = store;
    window.Htx = this.store;

    render((
      <App
        store={this.store}
        panels={registerPanels(this.options.panels) ?? []}
      />
    ), rootElement);

    const destructor = () => {
      unmountComponentAtNode(rootElement);
      destroy(this.store);
    };

    this.destroy = destructor;
  }

  /**
   * 覆盖 legacyEvents 中的事件？
   * 写法是直接在 option 的根级写上事件名，比如 {onNextTask: (nextTaskId) => {...}}
   */
  supportLgacyEvents() {
    const keys = Object.keys(legacyEvents);

    keys.forEach(key => {
      const callback = this.options[key];

      if (isDefined(callback)) {
        const eventName = toCamelCase(key.replace(/^on/, ''));

        this.events.on(eventName, callback);
      }
    });
  }
}

// 这部分貌似没有用到
LabelStudio.Component = LabelStudioReact;
