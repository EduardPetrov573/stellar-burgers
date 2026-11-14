import { fetchHistory, selectHistoryState } from '@slices/feed';
import { Preloader } from '@ui';
import { ProfileOrdersUI } from '@ui-pages';
import { useEffect } from 'react';

import { RequestError } from '@components/request-error';
import { useDispatch, useSelector } from '@services/store';

export const ProfileOrders = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const { history, historyLoading, historyError } = useSelector(selectHistoryState);
  useEffect(() => {
    void dispatch(fetchHistory());
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
