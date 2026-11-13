import { Button } from '@krgaa/react-developer-burger-ui-components';

type RequestErrorProps = { message: string; retry?: () => void };
export const RequestError = ({
  message,
  retry,
}: RequestErrorProps): React.JSX.Element => (
  <div className="request-message" role="alert">
    <p className="text text_type_main-default">{message}</p>
    {retry && (
      <Button htmlType="button" type="secondary" onClick={retry}>
        Повторить
      </Button>
    )}
  </div>
);
