import { fetchWithRefresh } from './burger-api';

const setItemMock = jest.fn();

beforeEach(() => {
  setItemMock.mockReset();
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: { getItem: jest.fn(() => 'refresh-token'), setItem: setItemMock },
  });
  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: { cookie: '' },
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('simultaneous expired-token responses share one refresh and retry with the new token', async () => {
  const fetchMock = jest
    .spyOn(globalThis, 'fetch')
    .mockImplementation((input, options) => {
      const url = input instanceof Request ? input.url : input.toString();
      if (url.endsWith('/auth/token'))
        return Promise.resolve(
          Response.json({
            success: true,
            accessToken: 'Bearer fresh-token',
            refreshToken: 'new-refresh-token',
          })
        );
      const token = new Headers(options?.headers).get('authorization');
      if (token !== 'Bearer fresh-token')
        return Promise.resolve(
          Response.json({ message: 'jwt expired' }, { status: 403 })
        );
      return Promise.resolve(Response.json({ success: true }));
    });
  const results = await Promise.all([
    fetchWithRefresh('https://example.com/profile', {
      headers: { authorization: 'Bearer expired-token' },
    }),
    fetchWithRefresh('https://example.com/orders', {
      headers: { authorization: 'Bearer expired-token' },
    }),
  ]);
  expect(results).toEqual([{ success: true }, { success: true }]);
  expect(
    fetchMock.mock.calls.filter(([input]) =>
      (input instanceof Request ? input.url : input.toString()).endsWith('/auth/token')
    )
  ).toHaveLength(1);
  expect(fetchMock).toHaveBeenCalledTimes(5);
  expect(setItemMock).toHaveBeenCalledWith('refreshToken', 'new-refresh-token');
  expect(document.cookie).toContain('accessToken=Bearer%20fresh-token');
});
