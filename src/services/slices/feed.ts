import { getFeedsApi, getOrdersApi } from '@api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { logout } from './user';

import type { TOrder, TFeedState, TUser } from '@utils-types';

type FeedState = {
  feed: TFeedState;
  history: TOrder[];
  historyLoading: boolean;
  historyError: string | null;
  historyRequestId: string | null;
};
const initialState: FeedState = {
  feed: { orders: [], total: 0, totalToday: 0, isLoading: false, error: null },
  history: [],
  historyLoading: false,
  historyError: null,
  historyRequestId: null,
};
export const fetchFeed = createAsyncThunk('feed/fetch', getFeedsApi, {
  condition: (_, { getState }) =>
    !(getState() as { feed: FeedState }).feed.feed.isLoading,
});
export const fetchHistory = createAsyncThunk('feed/history', getOrdersApi, {
  condition: (_, { getState }) => {
    const state = getState() as { feed: FeedState; user: { user: TUser | null } };
    return !!state.user.user && !state.feed.historyLoading;
  },
});
const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeed.pending, (state) => {
        state.feed.isLoading = true;
        state.feed.error = null;
      })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        state.feed = {
          orders: action.payload.orders,
          total: action.payload.total,
          totalToday: action.payload.totalToday,
          isLoading: false,
          error: null,
        };
      })
      .addCase(fetchFeed.rejected, (state, action) => {
        state.feed.isLoading = false;
        state.feed.error = action.error.message ?? 'Лента недоступна';
      })
      .addCase(fetchHistory.pending, (state, action) => {
        state.historyLoading = true;
        state.historyError = null;
        state.historyRequestId = action.meta.requestId;
      })
      .addCase(fetchHistory.fulfilled, (state, action) => {
        if (state.historyRequestId !== action.meta.requestId) return;
        state.history = action.payload;
        state.historyLoading = false;
      })
      .addCase(fetchHistory.rejected, (state, action) => {
        if (state.historyRequestId !== action.meta.requestId) return;
        state.historyLoading = false;
        state.historyError = action.error.message ?? 'История недоступна';
      })
      .addCase(logout.fulfilled, (state) => {
        state.history = [];
        state.historyError = null;
        state.historyLoading = false;
        state.historyRequestId = null;
      });
  },
  selectors: { selectFeed: (state) => state.feed, selectHistoryState: (state) => state },
});
export const { selectFeed, selectHistoryState } = feedSlice.selectors;
export default feedSlice.reducer;
