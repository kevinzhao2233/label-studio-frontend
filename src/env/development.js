/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import External from "../core/External";
import Messages from "../utils/messages";

/**
 * Text
 */
import { DialogueAnalysis } from "../examples/dialogue_analysis";
import { NamedEntity } from "../examples/named_entity";
import { References } from "../examples/references";
import { Required } from "../examples/required";
import { Sentiment } from "../examples/sentiment_analysis";
import { Nested as NestedSimple } from "../examples/nested_choices";
import { Nested } from "../examples/nested_choices/complicated";
import { Dialogue } from "../examples/phrases";

/**
 * Audio/Video
 */
import { AudioClassification } from "../examples/audio_classification";
import { AudioRegions } from "../examples/audio_regions";
import { TranscribeAudio } from "../examples/transcribe_audio";
import { VideoRectangles } from "../examples/video_bboxes";
import { VideoClassification } from "../examples/video";

/**
 * Image
 */
import { ImageBbox } from "../examples/image_bbox";
import { ImageBboxLarge } from "../examples/image_bbox_large";
import { ImageKeyPoint } from "../examples/image_keypoints";
import { ImageMultilabel } from "../examples/image_multilabel";
import { ImageEllipselabels } from "../examples/image_ellipses";
import { ImageOCR } from "../examples/image_ocr";
import { ImagePolygons } from "../examples/image_polygons";
import { ImageSegmentation } from "../examples/image_segmentation";
import { ImageTools } from "../examples/image_tools";
// import { ImageClassification } from "../examples/image_classification";

/**
 * HTML
 */
import { HTMLDocument } from "../examples/html_document";
import { Taxonomy } from "../examples/taxonomy";

/**
 * RichText (HTML or plain text)
 */
import { RichTextHtml } from "../examples/rich_text_html";
import { RichTextPlain } from "../examples/rich_text_plain";
import { RichTextPlainRemote } from "../examples/rich_text_plain_remote";

/**
 * Different
 */
import { Pairwise } from "../examples/pairwise";
import { Repeater } from "../examples/repeater";
import { Table } from "../examples/table";
import { TableCsv } from "../examples/table_csv";

import { TimeSeries } from "../examples/timeseries";
import { TimeSeriesSingle } from "../examples/timeseries_single";

/**
 * Custom Data
 */
// import { AllTypes } from "../examples/all_types";

const data = RichTextPlain;

/**
 * 将 data 转换为字符串
 */
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
 * 获取 XML 配置，将其转化为字符串返回
 * @param {string} pathToConfig
 */
async function getConfig(pathToConfig) {
  const response = await fetch(pathToConfig);
  const config = await response.text();

  return config;
}

/**
 * 获取 ../examples 中的配置，为了模仿 ./production.js 中的 getState()
 * 该方法只在项目初始时运行
 */
async function getExample() {
  // data.config 是 XML 配置，或者说模板
  const config = await getConfig(data.config);
  const annotations = data.annotation.annotations;
  const predictions = data.tasks[0].predictions;

  const task = {
    annotations,
    predictions,
    data: JSON.stringify(data.tasks[0].data),
  };

  return { config, task, annotations, predictions };
}

/**
 * 用来返回根元素
 * 如果传入的是 id，则查询出来，如果是元素，则直接使用，顺便清除内容，设置宽度
 */
function rootElement(element) {
  let root;

  if (typeof element === "string") {
    root = document.getElementById(element);
  } else {
    root = element;
  }

  root.innerHTML = "";

  root.style.width = "auto";

  return root;
}

/**
 * Function to configure application with callbacks
 * @param {object} params
 */
function configureApplication(params) {
  const options = {
    alert: m => console.log(m), // Noop for demo: window.alert(m)
    messages: { ...Messages, ...params.messages },
    onSubmitAnnotation: params.onSubmitAnnotation ? params.onSubmitAnnotation : External.onSubmitAnnotation,
    onUpdateAnnotation: params.onUpdateAnnotation ? params.onUpdateAnnotation : External.onUpdateAnnotation,
    onDeleteAnnotation: params.onDeleteAnnotation ? params.onDeleteAnnotation : External.onDeleteAnnotation,
    onSkipTask: params.onSkipTask ? params.onSkipTask : External.onSkipTask,
    onCancelSkippingTask: params.onCancelSkippingTask ? params.onCancelSkippingTask : External.onCancelSkippingTask,
    onSubmitDraft: params.onSubmitDraft,
    onTaskLoad: params.onTaskLoad ? params.onTaskLoad : External.onTaskLoad,
    onProjectFetch: params.onProjectFetch ? params.onProjectFetch : External.onProjectFetch,
    onLabelStudioLoad: params.onLabelStudioLoad ? params.onLabelStudioLoad : External.onLabelStudioLoad,
    onEntityCreate: params.onEntityCreate || External.onEntityCreate,
    onEntityDelete: params.onEntityDelete || External.onEntityDelete,
    onGroundTruth: params.onGroundTruth || External.onGroundTruth,
    onSelectAnnotation: params.onSelectAnnotation || External.onSelectAnnotation,
    onAcceptAnnotation: params.onAcceptAnnotation || External.onAcceptAnnotation,
    onRejectAnnotation: params.onRejectAnnotation || External.onRejectAnnotation,
    onStorageInitialized: params.onStorageInitialized || External.onStorageInitialized,
    onNextTask: params.onNextTask || External.onNextTask,
    onPrevTask: params.onPrevTask || External.onPrevTask,
    // other settings aka flags
    forceAutoAnnotation: params.forceAutoAnnotation ?? false,
    forceAutoAcceptSuggestions: params.forceAutoAcceptSuggestions ?? false,
  };

  return options;
}

export default { rootElement, getExample, getData, configureApplication };
