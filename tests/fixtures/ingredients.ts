import { readFileSync } from 'node:fs';

import type { TIngredient } from '../../src/utils/types';

type IngredientsHar = {
  log: { entries: { response: { content: { text: string } } }[] };
};

const archive = JSON.parse(
  readFileSync(new URL('./ingredients.har', import.meta.url), 'utf8')
) as IngredientsHar;
const response = JSON.parse(archive.log.entries[0].response.content.text) as {
  success: boolean;
  data: TIngredient[];
};

export const ingredients = response.data;
