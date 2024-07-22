
import clsx from 'clsx';

import FarmersOnlyTooltip from 'components/UI/FarmersOnlyTooltip';
import ExternalLink from 'components/ExternalLink';
import { REQUEST_NEW_LP_TOKENS_TO_ZAP_OUT_DISCORD_LINK } from 'config/links';
import { ReactComponent as InformationCircleIcon } from 'assets/images/hero-icons/information-circle.svg';

const Information = (): JSX.Element => {
  return (
    <div
      className={clsx(
        'sm:flex',
        'sm:items-center',
        'sm:justify-between'
      )}>
      <FarmersOnlyTooltip label='FarmersOnly charges no fees for zapping-out!'>
        <p
          className={clsx(
            'flex',
            'items-center',
            'space-x-1',
            'text-farmersOnlyBilbao',
            'dark:text-farmersOnlyFern',
            'cursor-default'
          )}>
          <span>Fees: None</span>
          <InformationCircleIcon
            className={clsx(
              'w-5',
              'h-5'
            )} />
        </p>
      </FarmersOnlyTooltip>
      <ExternalLink href={REQUEST_NEW_LP_TOKENS_TO_ZAP_OUT_DISCORD_LINK}>
        Request new LP tokens to zap-out
      </ExternalLink>
    </div>
  );
};

export default Information;
