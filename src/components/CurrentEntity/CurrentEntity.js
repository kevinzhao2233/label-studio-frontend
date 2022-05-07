import { inject, observer } from "mobx-react";
import React, { useEffect } from "react";
import { Block } from "../../utils/bem";
import { AnnotationHistory } from "./AnnotationHistory.tsx";
import "./CurrentEntity.styl";
import { DraftPanel } from "../DraftPanel/DraftPanel";

const injector = inject('store');

export const CurrentEntity = injector(observer(({
  entity,
  showHistory = true,
  annotationHistory,
}) => {

  useEffect(()=>{
    const copyToClipboard = (ev) => {
      const { clipboardData } = ev;
      const results = entity.serializedSelection;

      clipboardData.setData('application/json', JSON.stringify(results));
      ev.preventDefault();

    };
    const pasteFromClipboard = (ev) => {
      const { clipboardData } = ev;
      const data = clipboardData.getData('application/json');

      try {
        const results = JSON.parse(data);

        entity.appendResults(results);
        ev.preventDefault();
      } catch (e) {
        return;
      }
    };

    const copyHandler = (ev) =>{
      const selection = window.getSelection();

      if (!selection.isCollapsed) return;

      copyToClipboard(ev);
    };
    const pasteHandler = (ev) =>{
      const selection = window.getSelection();

      if (Node.ELEMENT_NODE === selection.focusNode?.nodeType && selection.focusNode?.focus) return;

      pasteFromClipboard(ev);
    };
    const cutHandler = (ev) =>{
      const selection = window.getSelection();

      if (!selection.isCollapsed) return;

      copyToClipboard(ev);
      entity.deleteSelectedRegions();
    };

    window.addEventListener("copy", copyHandler);
    window.addEventListener("paste", pasteHandler);
    window.addEventListener("cut", cutHandler);
    return () => {
      window.removeEventListener("copy", copyHandler);
      window.removeEventListener("paste", pasteHandler);
      window.removeEventListener("cut", cutHandler);
    };
  }, [entity.pk ?? entity.id]);

  return entity ? (
    <Block name="annotation" onClick={e => e.stopPropagation()}>

      <DraftPanel item={entity} />
      {
        console.log('lsf >> CurrentEntity', { showHistory, entity, annotationHistory })
      }

      {showHistory && (!entity.userGenerate || !!annotationHistory?.length) && (
        <AnnotationHistory/>
      )}
    </Block>
  ) : null;
}));
