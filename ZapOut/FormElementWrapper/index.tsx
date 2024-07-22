
import clsx from 'clsx';

const FormElementWrapper = ({
  className,
  ...rest
}: React.ComponentPropsWithRef<'div'>): JSX.Element => (
  <div
    className={clsx(
      'space-y-1',
      className
    )}
    {...rest} />
);

export default FormElementWrapper;
