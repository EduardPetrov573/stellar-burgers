import { selectIngredients } from '@slices/ingredients';
import { clearOrderDetail, fetchOrder, selectOrders } from '@slices/orders';
import { Preloader, OrderInfoUI } from '@ui';
import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { useDispatch, useSelector } from '@services/store';

import { RequestError } from '../request-error';

import type { TIngredient } from '@utils-types';

export const OrderInfo = (): React.JSX.Element => {
  const { number } = useParams();
  const dispatch = useDispatch();
  const { detail, detailLoading, detailError } = useSelector(selectOrders);
  const ingredients = useSelector(selectIngredients);
  const orderNumber = Number(number);
  const validNumber = Number.isInteger(orderNumber) && orderNumber > 0;
  const loadOrder = (): void => {
    if (validNumber) void dispatch(fetchOrder(orderNumber));
  };
  useEffect(() => {
    if (validNumber) void dispatch(fetchOrder(orderNumber));
    return (): void => {
      dispatch(clearOrderDetail());
    };
  }, [dispatch, orderNumber, validNumber]);

  const orderInfo = useMemo(() => {
    if (!detail || detail.number !== orderNumber) return null;
    const ingredientsInfo: Record<string, TIngredient & { count: number }> = {};
    for (const id of detail.ingredients) {
      const ingredient = ingredients.find((item) => item._id === id);
      if (!ingredient) continue;
      if (ingredientsInfo[id]) ingredientsInfo[id].count++;
      else ingredientsInfo[id] = { ...ingredient, count: 1 };
    }
    const total = Object.values(ingredientsInfo).reduce(
      (sum, item) => sum + item.price * item.count,
      0
    );
    return { ...detail, ingredientsInfo, total, date: new Date(detail.createdAt) };
  }, [detail, ingredients, orderNumber]);

  if (!validNumber) return <RequestError message="Заказ не найден" />;
  if (detailError) return <RequestError message={detailError} retry={loadOrder} />;
  if (detailLoading || !orderInfo) return <Preloader />;
  return <OrderInfoUI orderInfo={orderInfo} />;
};
