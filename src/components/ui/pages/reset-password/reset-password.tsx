import {
  Input,
  Button,
  PasswordInput,
} from '@krgaa/react-developer-burger-ui-components';
import { clsx } from 'clsx';
import { Link } from 'react-router-dom';

import type { ResetPasswordUIProps } from './type';

import styles from '../common.module.css';

export const ResetPasswordUI = ({
  errorText,
  isLoading = false,
  password,
  setPassword,
  handleSubmit,
  token,
  setToken,
}: ResetPasswordUIProps): React.JSX.Element => (
  <main className={styles.container}>
    <div className={clsx('pt-6', styles.wrapCenter)}>
      <h3 className="pb-6 text text_type_main-medium">Восстановление пароля</h3>
      <form className={clsx('pb-15', styles.form)} name="login" onSubmit={handleSubmit}>
        <div className="pb-6">
          <PasswordInput
            minLength={6}
            required
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            name="password"
          />
        </div>
        <div className="pb-6">
          <Input
            type="text"
            required
            placeholder="Введите код из письма"
            onChange={(e) => setToken(e.target.value)}
            value={token}
            name="token"
            error={false}
            errorText=""
            size="default"
          />
        </div>
        <div className={clsx('pb-6', styles.button)}>
          <Button type="primary" size="medium" htmlType="submit" disabled={isLoading}>
            {isLoading ? 'Отправляем…' : 'Сохранить'}
          </Button>
        </div>
        {errorText && (
          <p className={clsx(styles.error, 'text text_type_main-default pb-6')}>
            {errorText}
          </p>
        )}
      </form>
      <div className={clsx(styles.question, 'text text_type_main-default pb-6')}>
        Вспомнили пароль?
        <Link to="/login" className={clsx('pl-2', styles.link)}>
          Войти
        </Link>
      </div>
    </div>
  </main>
);
