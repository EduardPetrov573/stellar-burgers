import { getOrderByNumberApi, orderBurgerApi } from '@api';
import { createSlice } from '@reduxjs/toolkit';

import { createAppAsyncThunk } from '../create-app-async-thunk';
import { clearConstructor } from './constructor';
import { logout } from './user';

import type { TOrder } from '@utils-types';

type OrdersState = {
  detail: TOrder | null;
  detailLoading: boolean;
  detailError: string | null;
  detailRequestId: string | null;
  submitting: boolean;
  created: TOrder | null;
  submitError: string | null;
};
const initialState: OrdersState = {
  detail: null,
  detailLoading: false,
  detailError: null,
  detailRequestId: null,
  submitting: false,
  created: null,
  submitError: null,
};
export const fetchOrder = createAppAsyncThunk(
  'orders/detail',
  async (number: number) => {
    const data = await getOrderByNumberApi(number);
    if (!data.success || !data.orders.length) throw new Error('Заказ не найден');
    return data.orders[0];
  }
);
export const createOrder = createAppAsyncThunk(
  'orders/create',
  async (ids: string[], { dispatch }) => {
    const data = await orderBurgerApi(ids);
    dispatch(clearConstructor());
    return data.order;
  },
  {
    condition: (_, { getState }) => {
      const state = getState();
      return !!state.user.user && !state.orders.submitting;
    },
  }
);
const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearCreatedOrder: (state) => {
      state.created = null;
      state.submitError = null;
    },
    clearOrderDetail: (state) => {
      state.detail = null;
      state.detailLoading = false;
      state.detailError = null;
      state.detailRequestId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrder.pending, (state, action) => {
        state.detailLoading = true;
        state.detail = null;
        state.detailError = null;
        state.detailRequestId = action.meta.requestId;
      })
      .addCase(fetchOrder.fulfilled, (state, action) => {
        if (state.detailRequestId !== action.meta.requestId) return;
        state.detail = action.payload;
        state.detailLoading = false;
      })
      .addCase(fetchOrder.rejected, (state, action) => {
        if (state.detailRequestId !== action.meta.requestId) return;
        state.detailLoading = false;
        state.detailError = action.error.message ?? 'Заказ недоступен';
      })
      .addCase(createOrder.pending, (state) => {
        state.submitting = true;
        state.submitError = null;
        state.created = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.submitting = false;
        state.created = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.submitting = false;
        state.submitError = action.error.message ?? 'Не удалось оформить заказ';
      })
      .addCase(logout.fulfilled, () => initialState);
  },
  selectors: { selectOrders: (state) => state },
});
export const { clearCreatedOrder, clearOrderDetail } = ordersSlice.actions;
export const { selectOrders } = ordersSlice.selectors;
export default ordersSlice.reducer;
