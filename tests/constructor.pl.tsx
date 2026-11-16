import { expect, test } from '@playwright/test';

import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '../src/utils/constants';
import { API, ingredients, readHarResponse, replayApi, useHar } from './har';

import type { Locator, Page } from '@playwright/test';
import type { TOrder, TUser } from '../src/utils/types';

const userResponse = readHarResponse<{ user: TUser }>('backend.har', '/auth/user');
const orderResponse = readHarResponse<{ order: TOrder }>(
  'constructor-order.har',
  '/orders',
  'POST'
);

const ACCESS_TOKEN = 'Bearer mock-access-token';
const REFRESH_TOKEN = 'mock-refresh-token';
const [bun, , filling, sauce] = ingredients;

const getConstructor = (page: Page): Locator =>
  page.locator('section').filter({
    has: page.getByRole('button', { name: 'Оформить заказ', exact: true }),
  });
const getModal = (page: Page): Locator => page.locator('#modals > div').first();
const addIngredient = async (page: Page, name: string): Promise<void> => {
  const card = page.getByRole('link', { name: new RegExp(name) }).locator('..');
  await card.getByRole('button', { name: 'Добавить', exact: true }).click();
};
const authorizeUser = async (page: Page): Promise<void> => {
  await page.context().addCookies([
    {
      name: ACCESS_TOKEN_KEY,
      value: encodeURIComponent(ACCESS_TOKEN),
      url: 'http://localhost:4000',
    },
  ]);
  await page.addInitScript(({ key, token }) => localStorage.setItem(key, token), {
    key: REFRESH_TOKEN_KEY,
    token: REFRESH_TOKEN,
  });
};
const assembleBurger = async (page: Page): Promise<void> => {
  await addIngredient(page, bun.name);
  await addIngredient(page, filling.name);
  await addIngredient(page, sauce.name);
};

test.beforeEach(async ({ page }) => {
  await replayApi(page);
  await useHar(page, 'constructor-order.har');
});

test.describe('Ingredient catalog and burger assembly', () => {
  test('HAR returns the ingredient catalog without contacting the server', async ({
    page,
  }) => {
    const responsePromise = page.waitForResponse(`${API}/ingredients`);
    await page.goto('/');
    const response = await responsePromise;
    expect(await response.json()).toEqual({ success: true, data: ingredients });
    await expect(
      page.getByRole('button', { name: 'Добавить', exact: true })
    ).toHaveCount(ingredients.length);
  });

  test('a bun is added to both halves of the constructor', async ({ page }) => {
    await page.goto('/');
    await addIngredient(page, bun.name);
    const constructor = getConstructor(page);
    await expect(
      constructor.getByText(`${bun.name} (верх)`, { exact: true })
    ).toBeVisible();
    await expect(
      constructor.getByText(`${bun.name} (низ)`, { exact: true })
    ).toBeVisible();
    await expect(
      constructor.getByText(String(bun.price * 2), { exact: true })
    ).toBeVisible();
  });

  test('fillings and sauces are added to the central list', async ({ page }) => {
    await page.goto('/');
    await addIngredient(page, filling.name);
    await addIngredient(page, sauce.name);
    const constructor = getConstructor(page);
    await expect(constructor.getByText(filling.name, { exact: true })).toBeVisible();
    await expect(constructor.getByText(sauce.name, { exact: true })).toBeVisible();
    await expect(
      constructor.getByText(String(filling.price + sauce.price), { exact: true })
    ).toBeVisible();
  });
});

test.describe('Ingredient details modal', () => {
  test('ingredient details open and close using the cross', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: new RegExp(bun.name) }).click();
    await expect(page).toHaveURL(`/ingredients/${bun._id}`);
    const modal = getModal(page);
    await expect(
      modal.getByRole('heading', { name: 'Детали ингредиента', exact: true })
    ).toBeVisible();
    await expect(
      modal.getByRole('heading', { name: bun.name, exact: true })
    ).toBeVisible();
    await modal.getByRole('button', { name: 'Закрыть', exact: true }).click();
    await expect(page.locator('#modals > div')).toHaveCount(0);
    await expect(page).toHaveURL('/');
  });

  test('ingredient details close when the overlay is clicked', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: new RegExp(filling.name) }).click();
    await expect(
      getModal(page).getByRole('heading', { name: filling.name, exact: true })
    ).toBeVisible();
    await page
      .locator('#modals > div')
      .nth(1)
      .click({ position: { x: 8, y: 8 } });
    await expect(page.locator('#modals > div')).toHaveCount(0);
    await expect(page).toHaveURL('/');
  });
});

test.describe('Order submission', () => {
  test('an authorized user creates an order and the constructor is cleared', async ({
    page,
  }) => {
    await authorizeUser(page);
    await page.goto('/');
    await expect(
      page.getByRole('link', { name: userResponse.user.name, exact: true })
    ).toBeVisible();
    await assembleBurger(page);
    const constructor = getConstructor(page);
    const requestPromise = page.waitForRequest(
      (request) => request.url() === `${API}/orders` && request.method() === 'POST'
    );
    await constructor
      .getByRole('button', { name: 'Оформить заказ', exact: true })
      .click();
    const request = await requestPromise;
    expect(request.headers().authorization).toBe(ACCESS_TOKEN);
    expect(JSON.parse(request.postData() ?? '{}') as unknown).toEqual({
      ingredients: [bun._id, filling._id, sauce._id, bun._id],
    });
    const modal = getModal(page);
    await expect(
      modal.getByRole('heading', {
        name: String(orderResponse.order.number),
        exact: true,
      })
    ).toBeVisible();
    await expect(modal.getByText('идентификатор заказа', { exact: true })).toBeVisible();
    await expect(constructor.getByText('Выберите булки', { exact: true })).toHaveCount(
      2
    );
    await expect(
      constructor.getByText('Выберите начинку', { exact: true })
    ).toBeVisible();
    await expect(constructor.locator('.constructor-element')).toHaveCount(0);
    await expect(constructor.getByText('0', { exact: true })).toBeVisible();
    await modal.getByRole('button', { name: 'Закрыть', exact: true }).click();
    await expect(page.locator('#modals > div')).toHaveCount(0);
    await expect(page).toHaveURL('/');
  });

  test('a failed order keeps the burger and can be retried', async ({ page }) => {
    await authorizeUser(page);
    let attempts = 0;
    page.on('request', (request) => {
      if (request.url() === `${API}/orders` && request.method() === 'POST') attempts++;
    });
    await useHar(page, 'order-error.har');
    await page.goto('/');
    await expect(
      page.getByRole('link', { name: userResponse.user.name, exact: true })
    ).toBeVisible();
    await assembleBurger(page);
    const constructor = getConstructor(page);
    await constructor
      .getByRole('button', { name: 'Оформить заказ', exact: true })
      .click();
    await expect(page.getByRole('alert')).toContainText('Не удалось создать заказ');
    await expect(
      constructor.getByText(`${bun.name} (верх)`, { exact: true })
    ).toBeVisible();
    await expect(constructor.getByText(filling.name, { exact: true })).toBeVisible();
    await useHar(page, 'constructor-order.har');
    await page.getByRole('button', { name: 'Повторить', exact: true }).click();
    await expect(
      getModal(page).getByRole('heading', {
        name: String(orderResponse.order.number),
        exact: true,
      })
    ).toBeVisible();
    expect(attempts).toBe(2);
    await expect(constructor.locator('.constructor-element')).toHaveCount(0);
  });
});
