/* eslint-disable react/jsx-no-target-blank */

import React from "react";

const URL_CORS_DOCS = "https://labelstud.io/guide/storage.html#Troubleshoot-CORS-and-access-problems";

export default {
  DONE: "完成!",
  NO_COMP_LEFT: "没有标注结果了",
  NO_NEXT_TASK: "所有数据已经标注完成",
  NO_NEXT_REVIEW_TASK: "所有数据已经审核完成（自己标注的数据不会被自己审核）",
  NO_ACCESS: "你无权访问此任务",

  CONFIRM_TO_DELETE_ALL_REGIONS: "请确认：你将要删除所有带标签的任务",

  // Tree validation messages
  ERR_REQUIRED: ({ modelName, field }) => {
    return `<b>${modelName}</b> 中的参数 <b>${field}</b> 是必须的`;
  },

  ERR_UNKNOWN_TAG: ({ modelName, field, value }) => {
    return `Tag with name <b>${value}</b> is not registered. Referenced by <b>${modelName}#${field}</b>.`;
  },

  ERR_TAG_NOT_FOUND: ({ modelName, field, value }) => {
    return `Tag with name <b>${value}</b> does not exist in the config. Referenced by <b>${modelName}#${field}</b>.`;
  },

  ERR_TAG_UNSUPPORTED: ({ modelName, field, value, validType }) => {
    return `Invalid attribute <b>${field}</b> for <b>${modelName}</b>: referenced tag is <b>${value}</b>, but <b>${modelName}</b> can only control <b>${[]
      .concat(validType)
      .join(", ")}</b>`;
  },

  ERR_PARENT_TAG_UNEXPECTED: ({ validType, value }) => {
    return `标签 <b>${value}</b> 必须是其中一个标签的子项 <b>${[]
      .concat(validType)
      .join(", ")}</b>.`;
  },

  ERR_BAD_TYPE: ({ modelName, field, validType }) => {
    return `Attribute <b>${field}</b> of tag <b>${modelName}</b> has invalid type. Valid types are: <b>${validType}</b>.`;
  },

  ERR_INTERNAL: ({ value }) => {
    return `内部错误。有关更多信息，请参阅浏览器控制台。请重试或联系开发人员。<br/>${value}`;
  },

  ERR_GENERAL: ({ value }) => {
    return value;
  },

  // Object loading errors
  URL_CORS_DOCS,

  ERR_LOADING_AUDIO: ({ attr, url, error }) => (
    <p>
      加载音频错误. 检查任务中的 <code>{attr}</code> 字段.
      <br />
      Technical description: {error}
      <br />
      URL: {url}
    </p>
  ),

  ERR_LOADING_S3: ({ attr, url }) => `
    <div>
      <p>
        There was an issue loading URL from <code>${attr}</code> value.
        The request parameters are invalid.
        If you are using S3, make sure you’ve specified the right bucket region name.
      </p>
      <p>URL: <code><a href=${url} target="_blank">${url}</a></code></p>
    </div>
  `,

  ERR_LOADING_CORS: ({ attr, url }) => `
    <div>
      <p>
        There was an issue loading URL from <code>${attr}</code> value.
        Most likely that's because static server has wide-open CORS.
        <a href=${URL_CORS_DOCS} target="_blank">Read more on that here.</a>
      </p>
      <p>
        Also check that:
        <ul>
          <li>URL is valid</li>
          <li>Network is reachable</li>
        </ul>
      </p>
      <p>URL: <code><a href=${url} target="_blank">${url}</a></code></p>
    </div>
  `,

  ERR_LOADING_HTTP: ({ attr, url, error }) => `
    <div>
      <p>
        There was an issue loading URL from <code>${attr}</code> value
      </p>
      <p>
        Things to look out for:
        <ul>
          <li>URL is valid</li>
          <li>URL scheme matches the service scheme, i.e. https and https</li>
          <li>
            The static server has wide-open CORS,
            <a href=${URL_CORS_DOCS} target="_blank">more on that here</a>
          </li>
        </ul>
      </p>
      <p>
        Technical description: <code>${error}</code>
        <br />
        URL: <code><a href=${url} target="_blank">${url}</a></code>
      </p>
    </div>
  `,
};
