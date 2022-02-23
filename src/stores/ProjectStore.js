import { flow, getEnv, getParent, types } from "mobx-state-tree";

/**
 * Project data
 */
const ProjectData = types
  .model("ProjectData", {
    // 当前项目的 annotation 数
    annotationCount: types.integer,
    // 当前项目下总任务数
    taskCount: types.integer,
  });

/**
 * Project Store
 */
const ProjectStore = types
  .model("Project", {
    /**
     * Project ID
     */
    id: types.identifierNumber,

    data: types.maybeNull(ProjectData),
  })
  .views(self => ({
    get app() {
      return getParent(self);
    },
  }))
  .actions(self => {
    const updateProjectData = flow(function* () {
      try {
        const [projectData] = yield getEnv(self).events.invoke('projectFetch');

        if (!projectData) return;
        self.data = ProjectData.create({
          annotationCount: projectData.annotation_count,
          taskCount: projectData.task_count,
        });
      } catch (error) {
        console.warn('ProjectStorre/updateProjectData() 出错', { error });
      }
    });

    return {
      updateProjectData,  
    };
  });

export default ProjectStore;
