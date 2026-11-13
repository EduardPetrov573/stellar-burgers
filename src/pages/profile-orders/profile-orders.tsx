import { fetchHistory, selectHistoryState } from '@slices/feed';
import { Preloader } from '@ui';
import { ProfileOrdersUI } from '@ui-pages';
import { useEffect } from 'react';

import { RequestError } from '@components/request-error';
import { startOrdersUpdates } from '@services/live-orders';
import { useDispatch, useSelector } from '@services/store';

export const ProfileOrders = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const { history, historyLoading, historyError } = useSelector(selectHistoryState);
  useEffect(() => {
    void dispatch(fetchHistory());
    return dispatch(startOrdersUpdates(true));
  }, [dispatch]);
  return (
    <>
      {historyError && (
        <RequestError
          message={historyError}
          retry={() => {
            void dispatch(fetchHistory());
          }}
        />
      )}
      {historyLoading && !history.length ? (
        <Preloader />
      ) : (
        <ProfileOrdersUI orders={history} />
      )}
    </>
  );
};
