/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * Callback on submit annotation
 */
function onSubmitAnnotation() {}

/**
 * Callback on update annotation
 */
function onUpdateAnnotation() {}

/**
 * Callback on delete annotation
 */
function onDeleteAnnotation() {}

/**
 * Callback on skip task
 */
function onSkipTask() {}

/**
 * Callback on unskip task
 */
function onCancelSkippingTask() {}

/**
 * Callback on task load
 */
function onTaskLoad() {}

/**
 * 获取project
 */
function onProjectFetch() {}

/**
 * Callback on Label Studio load
 */
function onLabelStudioLoad() {}

/**
 * Callback when labeled region gets created
 */
function onEntityCreate() {}

/**
 * Callback when labeled region gets deleted
 */
function onEntityDelete() {}

/**
 * Callback when ground truth button gets pressed
 */
function onGroundTruth() {}

/**
 * Callback when a new annotation gets selected
 */
function onSelectAnnotation(annotation, previousAnnotation) {}

/**
 * Called when "Accept" or "Fix + Accept" is pressed
 */
function onAcceptAnnotation(store, entity){}

/**
 * Called when "Reject" is pressed
 */
function onRejectAnnotation(store, entity){}

/**
 * Called when storage gets initialized for the first time
 */
function onStorageInitialized(ls) {}

/**
 * Called when submit draft
 */
function onSubmitDraft(entity) {}

/**
 * Called when next Task
 */
function onNextTask(nextTaskId) {}

/**
 * Called when prev Task
 */
function onPrevTask(prevTaskId) {}

export default {
  onDeleteAnnotation,
  onEntityCreate,
  onEntityDelete,
  onGroundTruth,
  onLabelStudioLoad,
  onSkipTask,
  onCancelSkippingTask,
  onSubmitAnnotation,
  onSubmitDraft,
  onTaskLoad,
  onProjectFetch,
  onUpdateAnnotation,
  onSelectAnnotation,
  onAcceptAnnotation,
  onRejectAnnotation,
  onStorageInitialized,
  onNextTask,
  onPrevTask,
};
