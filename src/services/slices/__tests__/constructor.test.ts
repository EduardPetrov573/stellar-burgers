import constructorReducer, {
  addIngredient,
  clearConstructor,
  moveIngredient,
  removeIngredient,
  selectConstructor,
} from '../constructor';
import {
  anotherBun,
  bun,
  createConstructorIngredient,
  filling,
  sauce,
} from './fixtures';

import type { TConstructorState } from '@utils-types';

const UNKNOWN_ACTION = { type: 'UNKNOWN' };
const selectedBun = createConstructorIngredient(bun, 'selected-bun');
const firstFilling = createConstructorIngredient(filling, 'first-filling');
const secondFilling = createConstructorIngredient(filling, 'second-filling');
const selectedSauce = createConstructorIngredient(sauce, 'selected-sauce');
const createState = (): TConstructorState => ({
  bun: selectedBun,
  ingredients: [firstFilling, secondFilling, selectedSauce],
});

describe('burgerConstructor reducer', () => {
  test('returns the initial state for an unknown action and undefined state', () => {
    expect(constructorReducer(undefined, UNKNOWN_ACTION)).toEqual({
      bun: null,
      ingredients: [],
    });
  });

  test('keeps the current state for an unknown action', () => {
    const state = createState();
    expect(constructorReducer(state, UNKNOWN_ACTION)).toBe(state);
  });

  test('addIngredient selects a bun without placing it in the filling list', () => {
    const action = addIngredient(bun);
    const result = constructorReducer(undefined, action);
    expect(result.bun).toEqual(action.payload);
    expect(result.bun?._id).toBe(bun._id);
    expect(result.bun?.id).toBeTruthy();
    expect(result.ingredients).toEqual([]);
    expect(bun).not.toHaveProperty('id');
  });

  test('addIngredient replaces the selected bun and preserves fillings', () => {
    const state = createState();
    const action = addIngredient(anotherBun);
    const result = constructorReducer(state, action);
    expect(result.bun).toEqual(action.payload);
    expect(result.bun?._id).toBe(anotherBun._id);
    expect(result.ingredients).toEqual(state.ingredients);
    expect(state.bun).toEqual(selectedBun);
  });

  test.each([filling, sauce])(
    'addIngredient appends $type to the central list',
    (ingredient) => {
      const state = createState();
      const action = addIngredient(ingredient);
      const result = constructorReducer(state, action);
      expect(result.bun).toEqual(selectedBun);
      expect(result.ingredients).toEqual([...state.ingredients, action.payload]);
      expect(state.ingredients).toEqual([firstFilling, secondFilling, selectedSauce]);
    }
  );

  test('prepare gives duplicate ingredients separate instance IDs', () => {
    const firstAction = addIngredient(filling);
    const secondAction = addIngredient(filling);
    expect(firstAction.payload._id).toBe(secondAction.payload._id);
    expect(firstAction.payload.id).not.toBe(secondAction.payload.id);
    const firstState = constructorReducer(undefined, firstAction);
    const result = constructorReducer(firstState, secondAction);
    expect(result.ingredients).toEqual([firstAction.payload, secondAction.payload]);
    expect(firstState.ingredients).toHaveLength(1);
  });

  test('removeIngredient removes only the selected instance of a repeated ingredient', () => {
    const state = createState();
    const result = constructorReducer(state, removeIngredient(firstFilling.id));
    expect(result).toEqual({
      bun: selectedBun,
      ingredients: [secondFilling, selectedSauce],
    });
    expect(state.ingredients).toEqual([firstFilling, secondFilling, selectedSauce]);
  });

  test('removeIngredient ignores the catalog ID instead of deleting every occurrence', () => {
    const state = createState();
    expect(constructorReducer(state, removeIngredient(filling._id))).toEqual(state);
  });

  test('removeIngredient cannot remove the bun', () => {
    const state = createState();
    expect(constructorReducer(state, removeIngredient(selectedBun.id))).toEqual(state);
  });

  test('moveIngredient moves a filling down and preserves the original state', () => {
    const state = createState();
    const result = constructorReducer(state, moveIngredient({ from: 0, to: 2 }));
    expect(result).toEqual({
      bun: selectedBun,
      ingredients: [secondFilling, selectedSauce, firstFilling],
    });
    expect(state.ingredients).toEqual([firstFilling, secondFilling, selectedSauce]);
  });

  test('moveIngredient moves a filling up', () => {
    const state = createState();
    expect(constructorReducer(state, moveIngredient({ from: 2, to: 0 }))).toEqual({
      bun: selectedBun,
      ingredients: [selectedSauce, firstFilling, secondFilling],
    });
  });

  test.each([
    { from: -1, to: 0 },
    { from: 0, to: -1 },
    { from: 3, to: 0 },
    { from: 0, to: 3 },
  ])('moveIngredient ignores an invalid range $from → $to', (range) => {
    const state = createState();
    expect(constructorReducer(state, moveIngredient(range))).toBe(state);
  });

  test('clearConstructor removes the bun and all fillings without mutating the input', () => {
    const state = createState();
    expect(constructorReducer(state, clearConstructor())).toEqual({
      bun: null,
      ingredients: [],
    });
    expect(state).toEqual({
      bun: selectedBun,
      ingredients: [firstFilling, secondFilling, selectedSauce],
    });
  });

  test('selectConstructor exposes the constructor state', () => {
    const state = createState();
    expect(selectConstructor({ burgerConstructor: state })).toBe(state);
  });
});
