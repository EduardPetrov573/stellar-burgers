import { expect, test } from '@playwright/test';
import { ingredients, initialUser, sampleOrder, setupApi } from './helpers';
import type { Page } from '@playwright/test';

const ingredientCard = (page: Page, name: string) =>
  page.getByRole('link', { name: new RegExp(name) }).locator('..');
const addIngredient = async (page: Page, name: string): Promise<void> => {
  await ingredientCard(page, name)
    .getByRole('button', { name: 'Добавить', exact: true })
    .click();
};
const login = async (page: Page): Promise<void> => {
  await page.locator('input[name=email]').fill(initialUser.email);
  await page.locator('input[name=password]').fill('password123');
  await page.getByRole('button', { name: 'Войти', exact: true }).click();
};

test('constructor replaces buns, counts duplicate fillings, removes one occurrence, and recalculates price', async ({
  page,
}) => {
  await setupApi(page);
  await page.goto('/');
  await addIngredient(page, ingredients[0].name);
  await expect(
    page.getByText(`${ingredients[0].name} (верх)`, { exact: true })
  ).toBeVisible();
  await expect(
    page.getByText(`${ingredients[0].name} (низ)`, { exact: true })
  ).toBeVisible();
  await addIngredient(page, ingredients[1].name);
  await expect(
    page.getByText(`${ingredients[0].name} (верх)`, { exact: true })
  ).toHaveCount(0);
  await addIngredient(page, ingredients[2].name);
  await addIngredient(page, ingredients[2].name);
  const constructor = page
    .locator('section')
    .filter({ has: page.getByRole('button', { name: 'Оформить заказ' }) });
  await expect(constructor.getByText('680', { exact: true })).toBeVisible();
  await expect(
    ingredientCard(page, ingredients[2].name).getByText('2', { exact: true })
  ).toBeVisible();
  await constructor.locator('.constructor-element__action svg').nth(1).click();
  await expect(constructor.getByText('380', { exact: true })).toBeVisible();
  await expect(
    ingredientCard(page, ingredients[2].name).getByText('1', { exact: true })
  ).toBeVisible();
});

test('ingredient click opens a routed modal; close, Back/Forward and direct link work', async ({
  page,
}) => {
  await setupApi(page);
  await page.goto('/');
  await page.getByRole('link', { name: new RegExp(ingredients[0].name) }).click();
  await expect(page).toHaveURL('/ingredients/bun-a');
  await expect(page.getByRole('dialog')).toContainText('Калории, ккал');
  await expect(page.getByRole('link', { name: 'Конструктор', exact: true })).toHaveClass(
    /link_active/
  );
  await page.getByRole('button', { name: 'Закрыть', exact: true }).click();
  await expect(page).toHaveURL('/');
  await page.goForward();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page).toHaveURL('/');
  await page.goto('/ingredients/bun-a');
  await expect(page.getByRole('heading', { name: ingredients[0].name })).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('guest logs in, keeps the burger, creates an authorized order, and sees it in history', async ({
  page,
}) => {
  const api = await setupApi(page);
  await page.goto('/');
  await addIngredient(page, ingredients[0].name);
  await addIngredient(page, ingredients[2].name);
  await addIngredient(page, ingredients[3].name);
  await page.getByRole('button', { name: 'Оформить заказ' }).click();
  await expect(page).toHaveURL('/login');
  expect(
    api.requests.some(
      (request) => request.path === '/orders' && request.method === 'POST'
    )
  ).toBe(false);
  await login(page);
  await expect(page).toHaveURL('/');
  await expect(
    page.getByText(`${ingredients[0].name} (верх)`, { exact: true })
  ).toBeVisible();
  await page.getByRole('button', { name: 'Оформить заказ' }).click();
  await expect(page.getByRole('dialog')).toContainText('124');
  const orderRequest = api.requests.find(
    (request) => request.path === '/orders' && request.method === 'POST'
  );
  expect(orderRequest?.body).toEqual({
    ingredients: ['bun-a', 'main-a', 'sauce-a', 'bun-a'],
  });
  expect(orderRequest?.authorization).toBe('Bearer test-access');
  await page.getByRole('button', { name: 'Закрыть', exact: true }).click();
  await expect(
    page.getByText(`${ingredients[0].name} (верх)`, { exact: true })
  ).toHaveCount(0);
  await page.goto('/profile/orders');
  await expect(page.getByRole('link', { name: /#000124/ })).toBeVisible();
});

test('protected nested order redirects to login and returns to the requested direct page', async ({
  page,
}) => {
  await setupApi(page);
  await page.goto('/profile/orders/123');
  await expect(page).toHaveURL('/login');
  await login(page);
  await expect(page).toHaveURL('/profile/orders/123');
  await expect(page.getByRole('heading', { name: sampleOrder.name })).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(
    page.getByRole('link', { name: initialUser.name, exact: true })
  ).toHaveClass(/link_active/);
});

test('profile cancels changes, saves only changed fields, and logs out', async ({
  page,
}) => {
  const api = await setupApi(page, true);
  await page.goto('/profile');
  await expect(page.locator('input[name=name]')).toHaveValue(initialUser.name);
  await expect(page.locator('input[name=email]')).toHaveValue(initialUser.email);
  await expect(page.getByRole('button', { name: 'Сохранить', exact: true })).toHaveCount(
    0
  );
  await page.locator('input[name=name]').fill('Новое имя');
  await page.getByRole('button', { name: 'Отмена', exact: true }).click();
  await expect(page.locator('input[name=name]')).toHaveValue(initialUser.name);
  await expect(page.getByRole('button', { name: 'Сохранить', exact: true })).toHaveCount(
    0
  );
  await page.locator('input[name=name]').fill('Новое имя');
  await page.getByRole('button', { name: 'Сохранить', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Сохранить', exact: true })).toHaveCount(
    0
  );
  expect(api.requests.find((request) => request.method === 'PATCH')?.body).toEqual({
    name: 'Новое имя',
  });
  await expect(page.getByRole('link', { name: 'Новое имя', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Выход', exact: true }).click();
  await expect(page).toHaveURL('/login');
  expect(await page.evaluate(() => localStorage.getItem('refreshToken'))).toBeNull();
  expect(
    (await page.context().cookies()).some((cookie) => cookie.name === 'accessToken')
  ).toBe(false);
  expect(api.requests.some((request) => request.path === '/auth/logout')).toBe(true);
});

test('feed refreshes from HTTP and automatic updates, shows totals and opens order modal', async ({
  page,
}) => {
  const api = await setupApi(page);
  await page.clock.install();
  await page.goto('/feed');
  const orderLink = page.getByRole('link', { name: /#000123/ });
  await expect(orderLink).toContainText('370');
  const beforeRefresh = api.requests.filter(
    (request) => request.path === '/orders/all'
  ).length;
  await page.getByRole('button', { name: 'Обновить', exact: true }).click();
  await expect
    .poll(() => api.requests.filter((request) => request.path === '/orders/all').length)
    .toBeGreaterThan(beforeRefresh);
  await orderLink.click();
  await expect(page).toHaveURL('/feed/123');
  await expect(page.getByRole('dialog')).toContainText('370');
  await expect(
    page.getByRole('link', { name: 'Лента заказов', exact: true })
  ).toHaveClass(/link_active/);
  await page.keyboard.press('Escape');
  api.setFeed([
    { ...sampleOrder, _id: 'live-order', number: 125, name: 'Новый бургер' },
    sampleOrder,
  ]);
  await page.clock.fastForward(5000);
  await expect(page.getByRole('link', { name: /#000125/ })).toBeVisible();
  await expect(page.getByText('502', { exact: true })).toBeVisible();
  await page.goto('/feed/123');
  await expect(page.getByRole('heading', { name: sampleOrder.name })).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('history receives status changes automatically and uses protected modal routes', async ({
  page,
}) => {
  const api = await setupApi(page, true);
  await page.clock.install();
  await page.goto('/profile/orders');
  await expect(
    page.getByRole('link', { name: 'История заказов', exact: true })
  ).toHaveClass(/link_active/);
  await expect(page.getByRole('link', { name: /#000123/ })).toContainText('Выполнен');
  api.setHistory([{ ...sampleOrder, status: 'cancelled' }]);
  await page.clock.fastForward(5000);
  await expect(page.getByRole('link', { name: /#000123/ })).toContainText('Отменён');
  api.setHistory([{ ...sampleOrder, status: 'pending' }]);
  await page.clock.fastForward(5000);
  await expect(page.getByRole('link', { name: /#000123/ })).toContainText('Готовится');
  await page.getByRole('link', { name: /#000123/ }).click();
  await expect(page).toHaveURL('/profile/orders/123');
  await expect(page.getByRole('dialog')).toContainText('370');
  await expect(
    page.getByRole('link', { name: 'История заказов', exact: true })
  ).toHaveClass(/link_active/);
});

test('registration submits the form and authenticates the new user', async ({
  page,
}) => {
  const api = await setupApi(page);
  await page.goto('/register');
  await page.locator('input[name=name]').fill('Новый пользователь');
  await page.locator('input[name=email]').fill('new@example.com');
  await page.locator('input[name=password]').fill('password123');
  await page.getByRole('button', { name: 'Зарегистрироваться', exact: true }).click();
  await expect(page).toHaveURL('/');
  await expect(
    page.getByRole('link', { name: 'Новый пользователь', exact: true })
  ).toBeVisible();
  expect(
    api.requests.find((request) => request.path === '/auth/register')?.body
  ).toEqual({
    name: 'Новый пользователь',
    email: 'new@example.com',
    password: 'password123',
  });
  await page.goto('/login');
  await expect(page).toHaveURL('/');
});

test('password recovery navigates through both forms and returns to login', async ({
  page,
}) => {
  const api = await setupApi(page);
  await page.goto('/forgot-password');
  await page.locator('input[name=email]').fill(initialUser.email);
  await page.getByRole('button', { name: 'Восстановить', exact: true }).click();
  await expect(page).toHaveURL('/reset-password');
  await page.locator('input[name=password]').fill('new-password');
  await page.locator('input[name=token]').fill('confirmation-code');
  await page.getByRole('button', { name: 'Сохранить', exact: true }).click();
  await expect(page).toHaveURL('/login');
  expect(
    api.requests.find((request) => request.path === '/password-reset/reset')?.body
  ).toEqual({ password: 'new-password', token: 'confirmation-code' });
});

test('expired access token is refreshed and the original request is retried', async ({
  page,
}) => {
  const api = await setupApi(page, true);
  api.expireUserToken();
  await page.goto('/profile');
  await expect(page.locator('input[name=name]')).toHaveValue(initialUser.name);
  expect(api.requests.filter((request) => request.path === '/auth/token')).toHaveLength(
    1
  );
  expect(
    api.requests.filter((request) => request.path === '/auth/user').at(-1)?.authorization
  ).toBe('Bearer refreshed-access');
});

test('API error allows retry and an unknown route shows 404 independently of data loading', async ({
  page,
}) => {
  const api = await setupApi(page);
  api.failIngredients();
  await page.goto('/');
  await expect(page.getByRole('alert')).toContainText('Сервер временно недоступен');
  await page.getByRole('button', { name: 'Повторить', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Добавить', exact: true })).toHaveCount(
    ingredients.length
  );
  await page.goto('/missing-page');
  await expect(page.getByText(/Ошибка 404/)).toBeVisible();
});

test('mobile navigation expands the personal menu and has no horizontal overflow', async ({
  page,
}) => {
  await setupApi(page, true);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Открыть меню', exact: true }).click();
  await page.getByRole('button', { name: 'Личный кабинет', exact: false }).click();
  await page.getByRole('link', { name: 'История заказов', exact: true }).click();
  await expect(page).toHaveURL('/profile/orders');
  await expect(
    page.getByRole('navigation', { name: 'Мобильная навигация' })
  ).toHaveCount(0);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
  ).toBe(true);
});
