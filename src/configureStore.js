import AppStore from "./stores/AppStore";

const getEnvironment = async () => {
  if (process.env.NODE_ENV === "development" && !process.env.BUILD_NO_SERVER) {
    return (await import("./env/development")).default;
  }

  return (await import("./env/production")).default;
};

// params 中包含 defaultOptions 和从 dm 中传递来的 options
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
    const { task, config } = await env.getExample();

    params.config = config;
    params.task = task;
  } else if (params?.task) {
    params.task = env.getData(params.task);
  }
  if (params.task?.id) {
    params.taskHistory = [{ taskId: params.task.id, annotationId: null }];
  }

  params.project = {
    id: +params.projectId,
  };

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

  console.log('LSF AppStore 初始化成功', { store });

  return { store, getRoot: env.rootElement };
};

