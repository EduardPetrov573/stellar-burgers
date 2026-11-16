import { API, readHarResponse, replayApi } from './har';

import type { Page } from '@playwright/test';
import type { TOrder, TUser } from '../src/utils/types';

export { API, ingredients } from './har';

export const initialUser = readHarResponse<{ user: TUser }>(
  'backend.har',
  '/auth/user'
).user;
export const sampleOrder = readHarResponse<{ orders: TOrder[] }>(
  'backend.har',
  '/orders/123'
).orders[0];

type ApiRequest = {
  path: string;
  method: string;
  authorization: string | undefined;
  body: unknown;
};

export const setupApi = async (
  page: Page,
  authenticated = false
): Promise<{ requests: ApiRequest[] }> => {
  const requests: ApiRequest[] = [];
  page.on('request', (request) => {
    if (!request.url().startsWith(`${API}/`)) return;
    requests.push({
      path: new URL(request.url()).pathname.replace('/api', ''),
      method: request.method(),
      authorization: request.headers().authorization,
      body: request.postData() ? (JSON.parse(request.postData()!) as unknown) : {},
    });
  });
  await replayApi(page);
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
  return { requests };
};
