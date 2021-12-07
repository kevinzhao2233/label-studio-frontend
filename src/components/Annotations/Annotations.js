import React, { Component } from "react";
import { Badge, Button, Card, List, Popconfirm, Tooltip } from "antd";
import { observer } from "mobx-react";
import {
  DeleteOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  PlusOutlined,
  StarFilled,
  StarOutlined,
  StopOutlined,
  WindowsOutlined
} from "@ant-design/icons";

import Utils from "../../utils";
import styles from "./Annotations.module.scss";

export const DraftPanel = observer(({ item }) => {
  if (!item.draftSaved && !item.versions.draft) return null;
  const saved = item.draft && item.draftSaved ? ` saved ${Utils.UDate.prettyDate(item.draftSaved)}` : "";

  if (!item.selected) {
    if (!item.draft) return null;
    return <div>draft{saved}</div>;
  }
  if (!item.versions.result || !item.versions.result.length) {
    return <div>{saved ? `草稿${saved}` : "该草稿未提交"}</div>;
  }
  return (
    <div>
      <Tooltip placement="topLeft" title={item.draftSelected ? "切换未已提交的结果" : "切换到当前草稿"}>
        <Button type="link" onClick={item.toggleDraft} className={styles.draftbtn}>
          {item.draftSelected ? "draft" : "submitted"}
        </Button>
      </Tooltip>
      {saved}
    </div>
  );
});

const Annotation = observer(({ item, store }) => {
  const removeHoney = () => (
    <Tooltip placement="topLeft" title="取消星标">
      <Button
        size="small"
        type="primary"
        onClick={ev => {
          ev.preventDefault();
          item.setGroundTruth(false);
        }}
      >
        <StarOutlined />
      </Button>
    </Tooltip>
  );

  const setHoney = () => {
    const title = item.ground_truth
      ? "取消星标"
      : "设为星标（星标的标注会被作为基准）";

    return (
      <Tooltip placement="topLeft" title={title}>
        <Button
          size="small"
          look="link"
          onClick={ev => {
            ev.preventDefault();
            item.setGroundTruth(!item.ground_truth);
          }}
        >
          {item.ground_truth ? (
            <StarFilled />
          ) : (
            <StarOutlined />
          )}
        </Button>
      </Tooltip>
    );
  };

  const toggleVisibility = e => {
    e.preventDefault();
    e.stopPropagation();
    item.toggleVisibility();
    const c = document.getElementById(`c-${item.id}`);

    if (c) c.style.display = item.hidden ? "none" : "unset";
  };

  const highlight = () => {
    const c = document.getElementById(`c-${item.id}`);

    if (c) c.classList.add("hover");
  };

  const unhighlight = () => {
    const c = document.getElementById(`c-${item.id}`);

    if (c) c.classList.remove("hover");
  };

  /**
   * Default badge for saved annotations
   */
  let badge = <Badge status="default" />;

  /**
   *
   */
  let annotationID;

  /**
   * Title of card
   */
  if (item.userGenerate && !item.sentUserGenerate) {
    annotationID = <span className={styles.title}>Unsaved Annotation</span>;
  } else {
    if (item.pk) {
      annotationID = <span className={styles.title}>ID {item.pk}</span>;
    } else if (item.id) {
      annotationID = <span className={styles.title}>ID {item.id}</span>;
    }
  }

  /**
   * Badge for processing of user generate annotation
   */
  if (item.userGenerate) {
    badge = <Badge status="processing" />;
  }

  /**
   * Badge for complete of user generate annotation
   */
  if (item.userGenerate && item.sentUserGenerate) {
    badge = <Badge status="success" />;
  }

  const btnsView = () => {
    const confirm = () => {
      // ev.preventDefault();
      // debugger;
      item.list.deleteAnnotation(item);
    };

    return (
      <div className={styles.buttons}>
        {store.hasInterface("ground-truth") && (item.ground_truth ? removeHoney() : setHoney())}
        &nbsp;
        {store.hasInterface("annotations:delete") && (
          <Tooltip placement="topLeft" title="删除该标注任务">
            <Popconfirm
              placement="bottomLeft"
              title={"是否删除？"}
              onConfirm={confirm}
              okText="删除"
              okType="danger"
              cancelText="取消"
            >
              <Button size="small" danger style={{ background: "transparent" }}>
                <DeleteOutlined />
              </Button>
            </Popconfirm>
          </Tooltip>
        )}
      </div>
    );
  };

  return (
    <List.Item
      key={item.id}
      className={item.selected ? `${styles.annotation} ${styles.annotation_selected}` : styles.annotation}
      onClick={() => {
        !item.selected && store.annotationStore.selectAnnotation(item.id);
      }}
      onMouseEnter={highlight}
      onMouseLeave={unhighlight}
    >
      <div className={styles.annotationcard}>
        <div>
          <div className={styles.title}>
            {badge}
            {annotationID}
          </div>
          {item.pk ? "Created" : "Started"}
          <i>{item.createdAgo ? ` ${item.createdAgo} ago` : ` ${Utils.UDate.prettyDate(item.createdDate)}`}</i>
          {item.createdBy && item.pk ? ` 创建人： ${item.createdBy}` : null}
          <DraftPanel item={item} />
        </div>
        {/* platform uses was_cancelled so check both */}
        {store.hasInterface("skip") && (item.skipped || item.was_cancelled) && (
          <Tooltip placement="topLeft" title="跳过的标注任务">
            <StopOutlined className={styles.skipped} />
          </Tooltip>
        )}
        {store.annotationStore.viewingAllAnnotations && (
          <Button size="small" type="primary" ghost onClick={toggleVisibility}>
            {item.hidden ? <EyeInvisibleOutlined /> : <EyeOutlined />}
          </Button>
        )}
        {item.selected && btnsView()}
      </div>
    </List.Item>
  );
});

class Annotations extends Component {
  render() {
    const { store } = this.props;

    const title = (
      <div className={styles.title + " " + styles.titlespace}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <h3>Annotations</h3>
        </div>

        <div style={{ marginRight: "1px" }}>
          {store.hasInterface("annotations:add-new") && (
            <Tooltip placement="topLeft" title="创建一个新的标注任务">
              <Button
                size="small"
                onClick={ev => {
                  ev.preventDefault();
                  const c = store.annotationStore.addAnnotation({ userGenerate: true });

                  store.annotationStore.selectAnnotation(c.id);
                  // c.list.selectAnnotation(c);
                }}
              >
                <PlusOutlined />
              </Button>
            </Tooltip>
          )}
          &nbsp;
          <Tooltip placement="topLeft" title="查看所有标注任务">
            <Button
              size="small"
              type={store.annotationStore.viewingAllAnnotations ? "primary" : ""}
              onClick={ev => {
                ev.preventDefault();
                store.annotationStore.toggleViewingAllAnnotations();
              }}
            >
              <WindowsOutlined />
            </Button>
          </Tooltip>
        </div>
      </div>
    );

    const content = store.annotationStore.annotations.map(c => <Annotation key={c.id} item={c} store={store} />);

    return (
      <Card title={title} size="small" bodyStyle={{ padding: "0", paddingTop: "1px" }}>
        <List>{store.annotationStore.annotations ? content : <p>No annotations submitted yet</p>}</List>
      </Card>
    );
  }
}

export default observer(Annotations);
