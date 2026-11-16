import type { TOrder } from '@utils-types';

export type FeedUIProps = {
  isRefreshing?: boolean;
  orders: TOrder[];
  handleGetFeeds: () => void;
};
