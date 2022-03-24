import { inject, observer } from "mobx-react";
import { Button } from "../../common/Button/Button";
import { Tooltip } from "../../common/Tooltip/Tooltip";
import { Block, Elem } from "../../utils/bem";
import { isDefined } from "../../utils/utilities";
import { IconBan } from "../../assets/icons";

import "./Controls.styl";
import { useCallback, useState } from "react";
import { Dropdown } from "../../common/Dropdown/DropdownComponent";

const TOOLTIP_DELAY = 0.8;

const ButtonTooltip = inject("store")(observer(({ store, title, children }) => {
  return (
    <Tooltip
      title={title}
      enabled={store.settings.enableTooltips}
      mouseEnterDelay={TOOLTIP_DELAY}
    >
      {children}
    </Tooltip>
  );
}));

const controlsInjector = inject(({ store }) => {
  return {
    store,
    history: store?.annotationStore?.selected?.history,
  };
});

// 拒绝的弹窗
const RejectDialog = ({ disabled, store }) => {
  const [show, setShow] = useState(false);
  const [comment, setComment] = useState('');

  const onReject = useCallback(() => {
    store.rejectAnnotation({ comment: comment.length ? comment : null });
    setShow(false);
    setComment('');
  });

  return (
    <Dropdown.Trigger
      visible={show}
      toggle={() => { }}
      onToggle={(visible) => {
        setShow(visible);
      }}
      content={(
        <Block name="reject-dialog">
          <Elem name="input-title">
            拒绝原因
          </Elem>
          <Elem
            name='input'
            tag={'textarea'}
            type="text"
            value={comment}
            onChange={(event) => { setComment(event.target.value); }}
          />
          <Elem name='footer' >
            <Button onClick={() => setShow(false)}>取消</Button>
            <Button style={{ marginLeft: 8 }} look="danger" onClick={onReject}>拒绝</Button>
          </Elem >
        </Block >
      )}
    >
      <Button aria-label="reject-annotation" disabled={disabled} look="danger">
        拒绝
      </Button>
    </Dropdown.Trigger >
  );
};

export const Controls = controlsInjector(observer(({ store, history, annotation }) => {
  const isReview = store.hasInterface("review");
  const hasSkip = store.hasInterface("skip");
  const historySelected = isDefined(store.annotationStore.selectedHistory);
  const { userGenerate, sentUserGenerate, versions, results } = annotation;
  const buttons = [];

  const disabled = store.isSubmitting || historySelected;
  const submitDisabled = store.hasInterface("annotations:deny-empty") && results.length === 0;

  if (isReview) {
    buttons.push(<RejectDialog key="reject" disabled={disabled} store={store} />);

    buttons.push(
      <ButtonTooltip key="accept" title="接受标注: [ Ctrl+Enter ]">
        <Button aria-label="accept-annotation" disabled={disabled} look="primary" onClick={store.acceptAnnotation}>
          {history.canUndo ? "修复并接受" : "接受"}
        </Button>
      </ButtonTooltip>,
    );
  } else if (annotation.skipped) {
    buttons.push(
      <Elem name="skipped-info" key="skipped">
        <IconBan color="#d00" /> 已跳过标注
      </Elem>);
    buttons.push(
      <ButtonTooltip key="cancel-skip" title="取消跳过: []">
        <Button aria-label="cancel-skip" disabled={disabled} look="primary" onClick={store.cancelSkippingTask}>
          取消跳过
        </Button>
      </ButtonTooltip>,
    );
  } else {
    if (hasSkip) {
      buttons.push(
        <ButtonTooltip key="skip" title="跳过（取消）该任务: [ Ctrl+Space ]">
          <Button aria-label="skip-task" disabled={disabled} look="danger" onClick={store.skipTask}>
            跳过
          </Button>
        </ButtonTooltip>,
      );
    }

    if ((userGenerate && !sentUserGenerate) || (store.explore && !userGenerate && store.hasInterface("submit"))) {
      const title = submitDisabled
        ? "项目中不允许空的标注结果"
        : "保存结果: [ Ctrl+Enter ]";
      // span为禁用的按钮显示工具提示

      buttons.push(
        <ButtonTooltip key="submit" title={title}>
          <Elem name="tooltip-wrapper">
            <Button aria-label="submit" disabled={disabled || submitDisabled} look="primary" onClick={store.submitAnnotation}>
              提交
            </Button>
          </Elem>
        </ButtonTooltip>,
      );
    }

    if ((userGenerate && sentUserGenerate) || (!userGenerate && store.hasInterface("update"))) {
      buttons.push(
        <ButtonTooltip key="update" title="提交该任务: [ Ctrl+Enter ]">
          <Button aria-label="submit" disabled={disabled || submitDisabled} look="primary" onClick={store.updateAnnotation}>
            {sentUserGenerate || versions.result ? "更新" : "提交"}
          </Button>
        </ButtonTooltip>,
      );
    }
  }

  return (
    <Block name="controls">
      {buttons}
    </Block>
  );
}));
