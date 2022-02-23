import { inject, observer } from "mobx-react";
import { Button } from "../../common/Button/Button";
import { Block, Elem } from "../../utils/bem";
import { isDefined } from "../../utils/utilities";
import { IconBan } from "../../assets/icons";

import "./Controls.styl";
import { Hotkey } from "../../core/Hotkey";

const TOOLTIP_DELAY = 0.8;

const ButtonTooltip = inject("store")(observer(({ store, name, title, children }) => {
  return (
    <Hotkey.Tooltip
      name={name}
      title={title}
      enabled={store.settings.enableTooltips}
      mouseEnterDelay={TOOLTIP_DELAY}
    >
      {children}
    </Hotkey.Tooltip>
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
      <ButtonTooltip key="reject" name="annotation:skip" title="Reject annotation">
        <Button disabled={disabled} look="danger" onClick={store.rejectAnnotation}>
          拒绝
        </Button>
      </ButtonTooltip>,
    );

    buttons.push(
      <ButtonTooltip key="accept" name="annotation:submit" title="Accept annotation">
        <Button disabled={disabled} look="primary" onClick={store.acceptAnnotation}>
          {history.canUndo ? "Fix + Accept" : "Accept"}
        </Button>
      </ButtonTooltip>,
    );
  } else if (annotation.skipped) {
    buttons.push(
      <Elem name="skipped-info" key="skipped">
        <IconBan color="#d00" /> 该标注已经跳过
      </Elem>,
    );
  } else {
    if (store.hasInterface("skip")) {
      buttons.push(
        <ButtonTooltip key="skip" name="annotation:skip" title="Cancel (skip) task">
          <Button disabled={disabled} look="danger" onClick={store.skipTask}>
            跳过
          </Button>
        </ButtonTooltip>,
      );
    }

    if ((userGenerate && !sentUserGenerate) || (store.explore && !userGenerate && store.hasInterface("submit"))) {
      const title = submitDisabled
        ? "此项目中不允许空的注释"
        : "保存结果";
      // span is to display tooltip for disabled button

      buttons.push(
        <ButtonTooltip key="submit" name="annotation:submit" title={title}>
          <Elem name="tooltip-wrapper">
            <Button disabled={disabled || submitDisabled} look="primary" onClick={store.submitAnnotation}>
              提交
            </Button>
          </Elem>
        </ButtonTooltip>,
      );
    }

    if ((userGenerate && sentUserGenerate) || (!userGenerate && store.hasInterface("update"))) {
      buttons.push(
        <ButtonTooltip key="update" name="annotation:submit" title="更新当前任务">
          <Button disabled={disabled || submitDisabled} look="primary" onClick={store.updateAnnotation}>
            {sentUserGenerate || versions.result ? "新" : "提交"}
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
