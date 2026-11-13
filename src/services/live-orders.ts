import { fetchFeed, fetchHistory } from './slices/feed';

import type { AppThunk } from './store';

const ORDERS_UPDATE_INTERVAL = 5000;

// norma.ffapi.ru exposes HTTP endpoints but does not accept WebSocket upgrades.
// Keep visible lists up to date through the same API methods as manual refresh.
export const startOrdersUpdates =
  (personal: boolean): AppThunk<() => void> =>
  (dispatch) => {
    const refreshOrders = (): void => {
      if (document.visibilityState !== 'visible') return;
      if (personal) void dispatch(fetchHistory());
      else void dispatch(fetchFeed());
    };
    const interval = setInterval(refreshOrders, ORDERS_UPDATE_INTERVAL);
    document.addEventListener('visibilitychange', refreshOrders);
    window.addEventListener('focus', refreshOrders);
    return (): void => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', refreshOrders);
      window.removeEventListener('focus', refreshOrders);
    };
  };
