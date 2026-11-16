import { BurgerConstructorElement, Modal } from '@components';
import {
  Button,
  ConstructorElement,
  CurrencyIcon,
} from '@krgaa/react-developer-burger-ui-components';
import { Preloader, OrderDetailsUI } from '@ui';
import { clsx } from 'clsx';

import type { BurgerConstructorUIProps } from './type';
import type { TConstructorIngredient } from '@utils-types';

import styles from './burger-constructor.module.css';

export const BurgerConstructorUI = ({
  constructorItems,
  orderRequest,
  price,
  orderModalData,
  onOrderClick,
  closeOrderModal,
}: BurgerConstructorUIProps): React.JSX.Element => (
  <section className={styles.burger_constructor}>
    {constructorItems.bun ? (
      <div className={clsx(styles.element, 'mb-4 mr-4')}>
        <ConstructorElement
          type="top"
          isLocked
          text={`${constructorItems.bun.name} (верх)`}
          price={constructorItems.bun.price}
          thumbnail={constructorItems.bun.image}
        />
      </div>
    ) : (
      <div
        className={clsx(
          styles.noBuns,
          styles.noBunsTop,
          'ml-8 mb-4 mr-5 text text_type_main-default'
        )}
      >
        Выберите булки
      </div>
    )}
    <ul className={styles.elements}>
      {constructorItems.ingredients.length > 0 ? (
        constructorItems.ingredients.map(
          (item: TConstructorIngredient, index: number) => (
            <BurgerConstructorElement
              ingredient={item}
              index={index}
              totalItems={constructorItems.ingredients.length}
              key={item.id}
            />
          )
        )
      ) : (
        <li
          className={clsx(styles.noBuns, 'ml-8 mb-4 mr-5 text text_type_main-default')}
        >
          Выберите начинку
        </li>
      )}
    </ul>
    {constructorItems.bun ? (
      <div className={clsx(styles.element, 'mt-4 mr-4')}>
        <ConstructorElement
          type="bottom"
          isLocked
          text={`${constructorItems.bun.name} (низ)`}
          price={constructorItems.bun.price}
          thumbnail={constructorItems.bun.image}
        />
      </div>
    ) : (
      <div
        className={clsx(
          styles.noBuns,
          styles.noBunsBottom,
          'ml-8 mb-4 mr-5 text text_type_main-default'
        )}
      >
        Выберите булки
      </div>
    )}
    <div className={clsx(styles.total, 'mt-10 mr-4')}>
      <div className={clsx(styles.cost, 'mr-10')}>
        <p className={clsx('text', styles.text, 'mr-2')}>{price}</p>
        <CurrencyIcon type="primary" />
      </div>
      <Button
        htmlType="button"
        type="primary"
        size="large"
        onClick={onOrderClick}
        disabled={orderRequest}
      >
        Оформить заказ
      </Button>
    </div>

    {orderRequest && (
      <Modal onClose={closeOrderModal} title={'Оформляем заказ...'}>
        <Preloader />
      </Modal>
    )}

    {orderModalData && (
      <Modal onClose={closeOrderModal} title={orderRequest ? 'Оформляем заказ...' : ''}>
        <OrderDetailsUI orderNumber={orderModalData.number} />
      </Modal>
    )}
  </section>
);
