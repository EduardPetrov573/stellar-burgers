import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import type { Page } from '@playwright/test';
import type { TIngredient } from '../src/utils/types';

export const API = 'https://norma.ffapi.ru/api';
const API_PATTERN = `${API}/**`;

type HarArchive = {
  log: {
    entries: {
      request: { url: string; method: string };
      response: { content: { text: string } };
    }[];
  };
};

const getHarPath = (filename: string): string =>
  fileURLToPath(new URL(`./hars/${filename}`, import.meta.url));

export const readHarResponse = <T>(
  filename: string,
  path: string,
  method = 'GET'
): T => {
  const archive = JSON.parse(readFileSync(getHarPath(filename), 'utf8')) as HarArchive;
  const entry = archive.log.entries.find(
    ({ request }) => request.url === `${API}${path}` && request.method === method
  );
  if (!entry) throw new Error(`Missing ${method} ${path} in ${filename}`);
  return JSON.parse(entry.response.content.text) as T;
};

export const useHar = (
  page: Page,
  filename: string,
  notFound: 'abort' | 'fallback' = 'fallback'
): Promise<void> =>
  page.routeFromHAR(getHarPath(filename), { url: API_PATTERN, notFound });

export const replayApi = async (page: Page): Promise<void> => {
  // The oldest handler blocks any request missing from every fixture.
  // Later scenario archives override matching responses and fall back otherwise.
  await useHar(page, 'backend.har', 'abort');
  await useHar(page, 'ingredients.har');
};

export const ingredients = readHarResponse<{ data: TIngredient[] }>(
  'ingredients.har',
  '/ingredients'
).data;
