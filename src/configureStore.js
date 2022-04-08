import AppStore from "./stores/AppStore";

// 根据环境不同，获取不同的处理方法
const getEnvironment = async () => {
  if (process.env.NODE_ENV === "development" && !process.env.BUILD_NO_SERVER) {
    return (await import("./env/development")).default;
  }

  return (await import("./env/production")).default;
};

// params 中包含 defaultOptions（只有 interfaces） 和从 dm 中传递来的 options
export const configureStore = async (params, events) => {
  if (params.options?.secureMode) window.LS_SECURE_MODE = true;

  const env = await getEnvironment();

  console.log('>环境获取完成 \n', { env,
    envExample: env?.getExample(),
    envState: env?.getState?.(),
    envConfig: env?.configureApplication(params),
    envData: env?.getData(),
    params,
    events });

  params = { ...params };

  if (!params?.config && env.getExample) {
    // 开发环境，task 和 config 都是字符串
    const { task, config } = await env.getExample();

    params.config = config;
    params.task = task;
  } else if (params?.task) {
    // 将 params.task.data 转换为字符串
    params.task = env.getData(params.task);
  }
  if (params.task?.id) {
    params.taskHistory = [{ taskId: params.task.id, annotationId: null }];
  }

  params.project = {
    id: +params.projectId,
  };

  // 暂不清楚 create 第二个参数的含义，但肯定跟事件有关系
  const store = AppStore.create(params, {
    ...env.configureApplication(params),
    events,
  });

  store.initializeStore({
    ...(params.task ?? {}),
    users: params.users ?? [],
    annotationHistory: params.history ?? [],
  });

  store.project.id && await store.project.updateProjectData();

  console.log('LSF AppStore 初始化成功, store: ', store);

  return { store, getRoot: env.rootElement };
};

