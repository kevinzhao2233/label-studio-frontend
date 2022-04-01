import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from 'date-fns/locale';
import { inject, observer } from "mobx-react";
import { LsSparks, LsThumbsDown, LsThumbsUp } from "../../assets/icons";
import { Space } from "../../common/Space/Space";
import { Userpic } from "../../common/Userpic/Userpic";
import { Button } from '../../common/Button/Button';
import { Block, Elem } from "../../utils/bem";
import { isDefined, userDisplayName } from "../../utils/utilities";
import "./AnnotationHistory.styl";

const injector = inject(({ store }) => {
  const as = store.annotationStore;
  const selected = as?.selected;

  return {
    annotationStore: as,
    selected,
    createdBy: selected?.user ?? { email: selected?.createdBy },
    createdDate: selected?.createdDate,
    history: as?.history,
    selectedHistory: as?.selectedHistory,
  };
});

export const AnnotationHistory = injector(observer(({
  annotationStore,
  selected,
  createdBy,
  history,
  selectedHistory,
}) => {
  console.log('LSF AnnotationHistory\n', { annotationStore,
    selected,
    createdBy,
    selectedHistory,
    history });
  return (
    <Block name="annotation-history">
      <HistoryItem
        user={createdBy}
        extra="最终状态"
        entity={selected}
        onClick={() => annotationStore.selectHistory(null)}
        selected={!isDefined(selectedHistory)}
      />

      {history.length > 0 && (
        <>
          <Elem name="divider" title="History"/>
          {history.map((item) => {
            const { id, user, createdDate } = item;

            return (
              <HistoryItem
                key={`h-${id}`}
                user={user ?? { email: item?.createdBy }}
                date={createdDate}
                acceptedState={item.acceptedState}
                selected={selectedHistory?.id === item.id}
                selectable={item.results.length}
                onClick={() => annotationStore.selectHistory(item)}
              />
            );
          })}
        </>
      )}
    </Block>
  );
}));
AnnotationHistory.displayName = 'AnnotationHistory';

const HistoryItem = observer(({ entity, user, date, extra, acceptedState, selected = false, selectable = true, onClick }) => {
  const isPrediction = entity?.type === 'prediction';
  
  const [showRejectCause, setShowRejectCause] = useState(true);

  const toggleShow = () => {
    setShowRejectCause(!showRejectCause);
  };

  return (
    <Block name="history-item" mod={{ selected, disabled: !selectable }} onClick={onClick}>
      <Space spread>
        <Space size="small">
          <Elem
            tag={Userpic}
            user={user}
            name="userpic"
            showUsername
            username={isPrediction ? entity.createdBy : null}
            mod={{ prediction: isPrediction }}
          >{isPrediction && <LsSparks style={{ width: 16, height: 16 }}/>}</Elem>
          {isPrediction ? entity.createdBy : userDisplayName(user)}
        </Space>

        <Space size="small">
          {(acceptedState === 'accepted') ? (
            <LsThumbsUp style={{ color: '#2AA000' }}/>
          ) : acceptedState === 'fixed' ? (
            <LsThumbsUp style={{ color: '#FA8C16' }}/>
          ) : acceptedState === 'rejected' ? (
            <LsThumbsDown style={{ color: "#dd0000" }}/>
          ) : null}

          {acceptedState === 'rejected' && (
            <Button size="small" onClick={toggleShow}>{showRejectCause ? '收起' : '查看'}原因</Button>
          )}
          {date ? (
            <Elem name="date">
              {formatDistanceToNow(new Date(date), { addSuffix: true, locale: zhCN })}
            </Elem>
          ) : extra ? (
            <Elem name="date">
              {extra}
            </Elem>
          ) : null}
        </Space>
      </Space>
      {acceptedState === 'rejected' && showRejectCause && (
        // TODO 拒绝原因字段
        <Block name="reject-cause">拒绝原因：{}</Block>
      )}
    </Block>
  );
});

HistoryItem.displayName = 'HistoryItem';
