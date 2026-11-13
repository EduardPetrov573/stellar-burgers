import { fetchFeed, selectFeed } from '@slices/feed';
import { Preloader } from '@ui';
import { FeedUI } from '@ui-pages';
import { useEffect } from 'react';

import { RequestError } from '@components/request-error';
import { startOrdersUpdates } from '@services/live-orders';
import { useDispatch, useSelector } from '@services/store';

export const Feed = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const { orders, isLoading, error } = useSelector(selectFeed);
  const refresh = (): void => {
    void dispatch(fetchFeed());
  };
  useEffect(() => {
    void dispatch(fetchFeed());
    return dispatch(startOrdersUpdates(false));
  }, [dispatch]);
  return (
    <>
      {error && <RequestError message={error} retry={refresh} />}
      {isLoading && !orders.length ? (
        <Preloader />
      ) : (
        <FeedUI isRefreshing={isLoading} orders={orders} handleGetFeeds={refresh} />
      )}
    </>
  );
};
