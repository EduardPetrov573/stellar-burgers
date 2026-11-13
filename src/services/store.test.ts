import { getIngredientsApi, getOrdersApi, getFeedsApi, orderBurgerApi } from '@api';
import { configureStore } from '@reduxjs/toolkit';

import { rootReducer } from './rootReducer';
import { addIngredient } from './slices/constructor';
import { fetchHistory } from './slices/feed';
import { fetchIngredients } from './slices/ingredients';
import { createOrder } from './slices/orders';
import { login, logout } from './slices/user';

import type { TIngredient, TOrder, TUser } from '@utils-types';

jest.mock('@api');

const ingredient: TIngredient = {
  _id: 'bun',
  name: 'Булка',
  type: 'bun',
  price: 20,
  proteins: 10,
  fat: 5,
  carbohydrates: 20,
  calories: 100,
  image: '/bun.png',
  image_large: '/bun.png',
  image_mobile: '/bun.png',
};
const user: TUser = { name: 'Эдуард', email: 'eduard@example.com' };
const order: TOrder = {
  _id: 'order',
  number: 123,
  name: 'Бургер',
  status: 'done',
  ingredients: ['bun', 'bun'],
  createdAt: '2026-11-13T12:00:00Z',
  updatedAt: '2026-11-13T12:00:00Z',
};
const credentials = { email: user.email, password: 'test-password' };

beforeEach(() => {
  jest.resetAllMocks();
});

test('a failed ingredients request leaves a retryable error and a successful retry clears it', async () => {
  const store = configureStore({ reducer: rootReducer });
  jest
    .mocked(getIngredientsApi)
    .mockRejectedValueOnce(new Error('Сервер недоступен'))
    .mockResolvedValueOnce([ingredient]);
  const request = store.dispatch(fetchIngredients());
  expect(store.getState().ingredients.isLoading).toBe(true);
  await request;
  expect(store.getState().ingredients.error).toBe('Сервер недоступен');
  await store.dispatch(fetchIngredients());
  expect(store.getState().ingredients).toMatchObject({
    isLoading: false,
    error: null,
    items: [ingredient],
  });
});

test('a failed checkout keeps the burger, while a successful retry clears it and refreshes both lists', async () => {
  const store = configureStore({ reducer: rootReducer });
  store.dispatch(login.fulfilled(user, 'login', credentials));
  store.dispatch(addIngredient(ingredient));
  jest
    .mocked(orderBurgerApi)
    .mockRejectedValueOnce(new Error('Заказ не создан'))
    .mockResolvedValueOnce({ success: true, order, name: order.name });
  jest
    .mocked(getFeedsApi)
    .mockResolvedValue({ success: true, orders: [order], total: 1, totalToday: 1 });
  jest.mocked(getOrdersApi).mockResolvedValue([order]);
  const ids = [ingredient._id, ingredient._id];
  await store.dispatch(createOrder(ids));
  expect(store.getState().burgerConstructor.bun?._id).toBe(ingredient._id);
  expect(store.getState().orders.submitError).toBe('Заказ не создан');
  await store.dispatch(createOrder(ids));
  expect(store.getState().burgerConstructor).toEqual({ bun: null, ingredients: [] });
  expect(store.getState().orders.created).toEqual(order);
  expect(getFeedsApi).toHaveBeenCalledTimes(1);
  expect(getOrdersApi).toHaveBeenCalledTimes(1);
});

test('a private request finishing after logout cannot restore the previous user history', async () => {
  const store = configureStore({ reducer: rootReducer });
  store.dispatch(login.fulfilled(user, 'login', credentials));
  let finishRequest: (orders: TOrder[]) => void = () => undefined;
  jest.mocked(getOrdersApi).mockImplementation(
    () =>
      new Promise((resolve) => {
        finishRequest = resolve;
      })
  );
  const request = store.dispatch(fetchHistory());
  store.dispatch(logout.fulfilled(undefined, 'logout', undefined));
  finishRequest([order]);
  await request;
  expect(store.getState().user.user).toBeNull();
  expect(store.getState().feed.history).toEqual([]);
});
