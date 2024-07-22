
import * as React from 'react';
import clsx from 'clsx';

import LPTokenLogosWrapper from 'components/LPTokenLogosWrapper';
import TokenLogo from 'components/TokenLogo';
import Select, {
  SelectButton,
  SelectOptions,
  SelectOption,
  SelectBody,
  SelectCheck,
  SelectText
} from 'components/Select';
import LP_TOKENS, { LPToken } from 'config/web3/lp-tokens';
import { Router } from 'config/web3/routers';
import { ZAP_INPUT_HEIGHT_STYLING } from 'utils/constants/styles';
import { TOKENS_DIRECTORY_PATH } from 'utils/constants/general';

interface Props {
  id: string;
  selectedLPToken: LPToken | undefined;
  setSelectedLPToken: React.Dispatch<React.SetStateAction<LPToken | undefined>>;
  selectedRouter: Router;
  extraFcn: any;
}

const LPTokenSelect = ({
  id,
  selectedLPToken,
  setSelectedLPToken,
  selectedRouter,
  extraFcn
}: Props): JSX.Element | null => {
  const handleSelectedLPTokenChange = (newValue: LPToken) => {
    extraFcn();
    setSelectedLPToken(newValue);
  };

  const routerLPTokens = React.useMemo(
    () => Object.values(LP_TOKENS).filter(item => {
      const routerName = item.ROUTER.NAME;

      return routerName === selectedRouter.NAME;
    }),
    [selectedRouter.NAME]
  );
  const firstLPToken = routerLPTokens[0];

  React.useEffect(() => {
    setSelectedLPToken(firstLPToken);
  }, [
    setSelectedLPToken,
    firstLPToken
  ]);

  if (selectedLPToken === undefined) return null;

  return (
    <Select
      value={selectedLPToken}
      onChange={handleSelectedLPTokenChange}>
      {({ open }) => (
        <SelectBody id={id}>
          <SelectButton
            className={clsx(
              ZAP_INPUT_HEIGHT_STYLING,
              'flex',
              'items-center',
              'space-x-3'
            )}>
            <LPTokenLogosWrapper className='flex-shrink-0'>
              <TokenLogo src={`${TOKENS_DIRECTORY_PATH}/${selectedLPToken.TOKEN_A.LOGO_FILENAME}`} />
              <TokenLogo src={`${TOKENS_DIRECTORY_PATH}/${selectedLPToken.TOKEN_B.LOGO_FILENAME}`} />
            </LPTokenLogosWrapper>
            <SelectText>
              {selectedLPToken.SYMBOL}
            </SelectText>
          </SelectButton>
          <SelectOptions
            className='max-h-80'
            open={open}>
            {routerLPTokens.map(item => (
              <SelectOption
                className={ZAP_INPUT_HEIGHT_STYLING}
                key={item.SYMBOL}
                value={item}>
                {({
                  selected,
                  active
                }) => (
                  <>
                    <div
                      className={clsx(
                        'flex',
                        'items-center',
                        'space-x-3'
                      )}>
                      <LPTokenLogosWrapper className='flex-shrink-0'>
                        <TokenLogo src={`${TOKENS_DIRECTORY_PATH}/${item.TOKEN_A.LOGO_FILENAME}`} />
                        <TokenLogo src={`${TOKENS_DIRECTORY_PATH}/${item.TOKEN_B.LOGO_FILENAME}`} />
                      </LPTokenLogosWrapper>
                      <SelectText selected={selected}>
                        {item.SYMBOL}
                      </SelectText>
                    </div>
                    {selected ? (
                      <SelectCheck active={active} />
                    ) : null}
                  </>
                )}
              </SelectOption>
            ))}
          </SelectOptions>
        </SelectBody>
      )}
    </Select>
  );
};

export default LPTokenSelect;
