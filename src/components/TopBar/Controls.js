import { inject, observer } from "mobx-react";
import { Button } from "../../common/Button/Button";
import { Tooltip } from "../../common/Tooltip/Tooltip";
import { Block, Elem } from "../../utils/bem";
import { isDefined } from "../../utils/utilities";
import { IconBan } from "../../assets/icons";

import "./Controls.styl";

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

export const Controls = controlsInjector(observer(({ store, history, annotation }) => {
  const isReview = store.hasInterface("review");
  const historySelected = isDefined(store.annotationStore.selectedHistory);
  const { userGenerate, sentUserGenerate, versions, results } = annotation;
  const buttons = [];

  const disabled = store.isSubmitting || historySelected;
  const submitDisabled = store.hasInterface("annotations:deny-empty") && results.length === 0;

  if (isReview) {
    buttons.push(
      <ButtonTooltip key="reject" title="拒绝标注: [ Ctrl+Space ]">
        <Button  aria-label="reject-annotation" disabled={disabled} look="danger" onClick={store.rejectAnnotation}>
          拒绝
        </Button>
      </ButtonTooltip>,
    );

    buttons.push(
      <ButtonTooltip key="accept" title="接受标注: [ Ctrl+Enter ]">
        <Button aria-label="accept-annotation" disabled={disabled} look="primary" onClick={store.acceptAnnotation}>
          {history.canUndo ? "Fix 并接受" : "接受"}
        </Button>
      </ButtonTooltip>,
    );
  } else if (annotation.skipped) {
    buttons.push(
      <Elem name="skipped-info" key="skipped">
        <IconBan color="#d00" /> 已跳过标注
      </Elem>,
    );
  } else {
    if (store.hasInterface("skip")) {
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
        ? "项目中不允许有空的标注"
        : "保存结果: [ Ctrl+Enter ]";
      // span is to display tooltip for disabled button

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
        <ButtonTooltip key="update" title="提交该任务: [ Alt+Enter ]">
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
