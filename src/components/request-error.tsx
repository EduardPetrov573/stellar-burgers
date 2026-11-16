import { Button } from '@krgaa/react-developer-burger-ui-components';

import styles from './request-error.module.css';

type RequestErrorProps = { message: string; retry?: () => void };
export const RequestError = ({
  message,
  retry,
}: RequestErrorProps): React.JSX.Element => (
  <div className={styles.message} role="alert">
    <p className="text text_type_main-default">{message}</p>
    {retry && (
      <Button htmlType="button" type="secondary" onClick={retry}>
        Повторить
      </Button>
    )}
  </div>
);
