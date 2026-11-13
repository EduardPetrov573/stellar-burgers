import {
  Input,
  Button,
  PasswordInput,
} from '@krgaa/react-developer-burger-ui-components';
import { clsx } from 'clsx';
import { Link } from 'react-router-dom';

import type { LoginUIProps } from './type';

import styles from '../common.module.css';

export const LoginUI = ({
  email,
  setEmail,
  errorText,
  isLoading = false,
  handleSubmit,
  password,
  setPassword,
}: LoginUIProps): React.JSX.Element => (
  <main className={styles.container}>
    <div className={clsx('pt-6', styles.wrapCenter)}>
      <h3 className="pb-6 text text_type_main-medium">Вход</h3>
      <form className={clsx('pb-15', styles.form)} name="login" onSubmit={handleSubmit}>
        <>
          <div className="pb-6">
            <Input
              type="email"
              required
              placeholder="E-mail"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              name="email"
              error={false}
              errorText=""
              size="default"
            />
          </div>
          <div className="pb-6">
            <PasswordInput
              required
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              name="password"
            />
          </div>
          <div className={clsx('pb-6', styles.button)}>
            <Button type="primary" size="medium" htmlType="submit" disabled={isLoading}>
              {isLoading ? 'Отправляем…' : 'Войти'}
            </Button>
          </div>
          {errorText && (
            <p className={clsx(styles.error, 'text text_type_main-default pb-6')}>
              {errorText}
            </p>
          )}
        </>
      </form>
      <div className={clsx('pb-4', styles.question, 'text text_type_main-default')}>
        Вы - новый пользователь?
        <Link to="/register" className={clsx('pl-2', styles.link)}>
          Зарегистрироваться
        </Link>
      </div>
      <div className={clsx(styles.question, 'text text_type_main-default pb-6')}>
        Забыли пароль?
        <Link to={'/forgot-password'} className={clsx('pl-2', styles.link)}>
          Восстановить пароль
        </Link>
      </div>
    </div>
  </main>
);
