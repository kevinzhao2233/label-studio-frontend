import { observer } from "mobx-react";
import { Tooltip } from "../../common/Tooltip/Tooltip";
import Utils from "../../utils";
import { cn } from "../../utils/bem";

import "./DraftPanel.styl";

const panel = cn("draft-panel");

export const DraftPanel = observer(({ item }) => {
  if (!item.draftSaved && !item.versions.draft) return null;
  const saved = item.draft && item.draftSaved ? ` 保存 ${Utils.UDate.prettyDate(item.draftSaved)}` : "";

  if (!item.selected) {
    if (!item.draft) return null;
    return <div className={panel}>草稿{saved}</div>;
  }
  if (!item.versions.result || !item.versions.result.length) {
    return <div className={panel}>{saved ? `已保存的草稿${saved}` : "未提交的草稿"}</div>;
  }
  return (
    <div className={panel}>
      <Tooltip placement="topLeft" title={item.draftSelected ? "切换到原来的结果" : "切换到当前草稿"}>
        <button onClick={item.toggleDraft} className={panel.elem("toggle")}>
          {item.draftSelected ? "草稿" : "原来的"}
        </button>
      </Tooltip>
      {saved}
    </div>
  );
});