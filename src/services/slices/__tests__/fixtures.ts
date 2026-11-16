import type { TConstructorIngredient, TIngredient } from '@utils-types';

export const bun: TIngredient = {
  _id: 'bun',
  name: 'Краторная булка',
  type: 'bun',
  price: 20,
  proteins: 10,
  fat: 5,
  carbohydrates: 20,
  calories: 100,
  image: '/bun.png',
  image_large: '/bun-large.png',
  image_mobile: '/bun-mobile.png',
};
export const anotherBun: TIngredient = {
  ...bun,
  _id: 'another-bun',
  name: 'Флюоресцентная булка',
  price: 40,
};
export const filling: TIngredient = {
  ...bun,
  _id: 'filling',
  name: 'Говяжий метеорит',
  type: 'main',
  price: 300,
};
export const sauce: TIngredient = {
  ...bun,
  _id: 'sauce',
  name: 'Соус Spicy-X',
  type: 'sauce',
  price: 30,
};
export const createConstructorIngredient = (
  ingredient: TIngredient,
  id: string
): TConstructorIngredient => ({ ...ingredient, id });
