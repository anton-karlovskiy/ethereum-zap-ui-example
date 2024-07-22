
import clsx from 'clsx';

const Label = ({
  className,
  ...rest
}: React.ComponentPropsWithRef<'label'>): JSX.Element => (
  <label
    className={clsx(
      'block',
      'text-sm',
      'font-medium',
      'text-farmersOnlyTextSecondaryInLightMode',
      'dark:text-farmersOnlyTextSecondaryInDarkMode',
      className
    )}
    {...rest} />
);

export default Label;
