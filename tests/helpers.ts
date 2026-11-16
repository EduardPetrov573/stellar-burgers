import type { Page } from '@playwright/test';
import type { TIngredient, TOrder, TUser } from '../src/utils/types';

export const API = 'https://norma.ffapi.ru/api';
const image =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="240" height="120"%3E%3Cellipse cx="120" cy="60" rx="60" ry="30" fill="cyan"/%3E%3C/svg%3E';
const createIngredient = (
  _id: string,
  name: string,
  type: string,
  price: number
): TIngredient => ({
  _id,
  name,
  type,
  price,
  image,
  image_large: image,
  image_mobile: image,
  calories: 100,
  proteins: 10,
  fat: 5,
  carbohydrates: 20,
});
export const ingredients = [
  createIngredient('bun-a', 'Краторная булка N-200i', 'bun', 20),
  createIngredient('bun-b', 'Флюоресцентная булка R2-D3', 'bun', 40),
  createIngredient('main-a', 'Говяжий метеорит', 'main', 300),
  createIngredient('sauce-a', 'Соус Spicy-X', 'sauce', 30),
];
export const initialUser: TUser = { name: 'Эдуард', email: 'eduard@example.com' };
export const sampleOrder: TOrder = {
  _id: 'order-1',
  number: 123,
  name: 'Космический бургер',
  status: 'done',
  ingredients: ['bun-a', 'main-a', 'sauce-a', 'bun-a'],
  createdAt: '2026-11-13T12:00:00.000Z',
  updatedAt: '2026-11-13T12:00:00.000Z',
};
type ApiRequest = {
  path: string;
  method: string;
  authorization: string | undefined;
  body: unknown;
};

export const setupApi = async (
  page: Page,
  authenticated = false
): Promise<{
  requests: ApiRequest[];
  setFeed: (orders: TOrder[]) => void;
  setHistory: (orders: TOrder[]) => void;
  failIngredients: () => void;
  expireUserToken: () => void;
}> => {
  const requests: ApiRequest[] = [];
  let user = { ...initialUser };
  let feedOrders = [sampleOrder];
  let historyOrders = [sampleOrder];
  let ingredientsFail = false;
  let userTokenExpired = false;
  const setFeed = (orders: TOrder[]): void => {
    feedOrders = orders;
  };
  const setHistory = (orders: TOrder[]): void => {
    historyOrders = orders;
  };
  await page.route(`${API}/**`, async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname.replace('/api', '');
    const method = request.method();
    const body = request.postData()
      ? (JSON.parse(request.postData()!) as Record<string, string | string[]>)
      : {};
    requests.push({
      path,
      method,
      authorization: request.headers().authorization,
      body,
    });
    const respond = async (json: unknown, status = 200): Promise<void> =>
      route.fulfill({ status, json });
    if (path === '/ingredients') {
      if (ingredientsFail) {
        ingredientsFail = false;
        return respond({ success: false, message: 'Сервер временно недоступен' }, 500);
      }
      return respond({ success: true, data: ingredients });
    }
    if (path === '/auth/user') {
      if (userTokenExpired) {
        userTokenExpired = false;
        return respond({ success: false, message: 'jwt expired' }, 403);
      }
      if (method === 'PATCH')
        user = {
          name: typeof body.name === 'string' ? body.name : user.name,
          email: typeof body.email === 'string' ? body.email : user.email,
        };
      return respond({ success: true, user });
    }
    if (path === '/auth/login' || path === '/auth/register') {
      if (body.email === 'invalid@example.com')
        return respond({ success: false, message: 'Неверные данные' }, 401);
      if (typeof body.name === 'string') user.name = body.name;
      if (typeof body.email === 'string') user.email = body.email;
      return respond({
        success: true,
        user,
        accessToken: 'Bearer test-access',
        refreshToken: 'test-refresh',
      });
    }
    if (path === '/auth/token')
      return respond({
        success: true,
        accessToken: 'Bearer refreshed-access',
        refreshToken: 'refreshed-refresh',
      });
    if (path === '/auth/logout' || path.startsWith('/password-reset'))
      return respond({ success: true });
    if (path === '/orders/all')
      return respond({
        success: true,
        orders: feedOrders,
        total: 500 + feedOrders.length,
        totalToday: feedOrders.length,
      });
    if (path === '/orders' && method === 'GET')
      return respond({ success: true, orders: historyOrders });
    if (path === '/orders' && method === 'POST') {
      const order = {
        ...sampleOrder,
        _id: 'new-order',
        number: 124,
        ingredients: body.ingredients,
      };
      setFeed([order as TOrder, ...feedOrders]);
      setHistory([order as TOrder, ...historyOrders]);
      return respond({ success: true, name: order.name, order });
    }
    if (path.startsWith('/orders/')) {
      const number = Number(path.split('/').pop());
      return respond({
        success: true,
        orders: [...feedOrders, ...historyOrders]
          .filter((order) => order.number === number)
          .slice(0, 1),
      });
    }
    return respond({ success: false, message: 'Unknown test endpoint' }, 404);
  });
  if (authenticated) {
    await page.context().addCookies([
      {
        name: 'accessToken',
        value: encodeURIComponent('Bearer test-access'),
        domain: 'localhost',
        path: '/',
      },
    ]);
    await page.addInitScript(() => {
      if (!sessionStorage.getItem('testInitialized')) {
        localStorage.setItem('refreshToken', 'test-refresh');
        sessionStorage.setItem('testInitialized', 'true');
      }
    });
  }
  return {
    requests,
    setFeed,
    setHistory,
    failIngredients: () => {
      ingredientsFail = true;
    },
    expireUserToken: () => {
      userTokenExpired = true;
    },
  };
};
