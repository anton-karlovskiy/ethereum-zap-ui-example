
import * as React from 'react';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import { BigNumber } from '@ethersproject/bignumber';
import { Zero } from '@ethersproject/constants';
import { parseUnits } from '@ethersproject/units';
import {
  useErrorHandler,
  withErrorBoundary
} from 'react-error-boundary';
import { useQuery } from 'react-query';
import clsx from 'clsx';

import TokenLogo from 'components/TokenLogo';
import Select, {
  SelectButton,
  SelectOptions,
  SelectOption,
  SelectBody,
  SelectCheck,
  SelectText
} from 'components/Select';
import ErrorFallback from 'components/ErrorFallback';
import { ChainID } from 'config/web3/chains';
import { LPToken } from 'config/web3/lp-tokens';
import TOKENS, { TokenSymbol } from 'config/web3/tokens';
import { formatBigNumberToFixed } from 'utils/helpers/web3/balances';
import { TOKENS_DIRECTORY_PATH } from 'utils/constants/general';
import { ZAP_INPUT_HEIGHT_STYLING } from 'utils/constants/styles';
import { TOKEN_AMOUNT_DISPLAY_DECIMALS } from 'utils/constants/general';
import genericFetcher, { GENERIC_FETCHER } from 'services/fetchers/generic-fetcher';
import useTokenBalance from 'services/hooks/use-token-balance';
import LPTokenABI from 'abis/LPToken.json';
import { abi as IUniswapV2Router02ABI } from 'abis/IUniswapV2Router02.json';
import HRC20ABI from 'config/abi/hrc20.json';

enum ZapOutTypeID {
  ReceiveBothTokens = 'receive-both-tokens',
  ReceiveTokenA = 'receive-token-a',
  ReceiveTokenB = 'receive-token-b',
  ReceiveOne = 'receive-one'
}

interface ZapOutType {
  id: ZapOutTypeID;
  disabled: boolean;
}

const ZAP_OUT_TYPES: Array<ZapOutType> = [
  {
    id: ZapOutTypeID.ReceiveBothTokens,
    disabled: true
  },
  {
    id: ZapOutTypeID.ReceiveOne,
    disabled: false
  },
  {
    id: ZapOutTypeID.ReceiveTokenA,
    disabled: false
  },
  {
    id: ZapOutTypeID.ReceiveTokenB,
    disabled: false
  }
];
const defaultSelectedZapOutType = ZAP_OUT_TYPES[1];

const getTypeLabel = (typeID: ZapOutTypeID, lpToken: LPToken) => {
  switch (typeID) {
  case ZapOutTypeID.ReceiveBothTokens:
    return `${lpToken.TOKEN_A.SYMBOL} & ${lpToken.TOKEN_B.SYMBOL}`;
  case ZapOutTypeID.ReceiveTokenA:
    return lpToken.TOKEN_A.SYMBOL;
  case ZapOutTypeID.ReceiveTokenB:
    return lpToken.TOKEN_B.SYMBOL;
  case ZapOutTypeID.ReceiveOne:
    return TOKENS[TokenSymbol.WONE].SYMBOL;
  default: {
    throw new Error('Something went wrong!');
  }
  }
};

const checkOneRelatedLPToken = (lpToken: LPToken) => {
  return (
    lpToken.TOKEN_A.SYMBOL === TOKENS[TokenSymbol.WONE].SYMBOL ||
    lpToken.TOKEN_B.SYMBOL === TOKENS[TokenSymbol.WONE].SYMBOL
  );
};

const getTypeImageUI = (typeID: ZapOutTypeID, lpToken: LPToken) => {
  switch (typeID) {
  case ZapOutTypeID.ReceiveBothTokens:
    return (
      <div
        className={clsx(
          'flex',
          'items-center',
          'space-x-2'
        )}>
        <TokenLogo src={`${TOKENS_DIRECTORY_PATH}/${lpToken.TOKEN_A.LOGO_FILENAME}`} />
        <TokenLogo src={`${TOKENS_DIRECTORY_PATH}/${lpToken.TOKEN_B.LOGO_FILENAME}`} />
      </div>
    );
  case ZapOutTypeID.ReceiveTokenA:
    return (
      <TokenLogo src={`${TOKENS_DIRECTORY_PATH}/${lpToken.TOKEN_A.LOGO_FILENAME}`} />
    );
  case ZapOutTypeID.ReceiveTokenB:
    return (
      <TokenLogo src={`${TOKENS_DIRECTORY_PATH}/${lpToken.TOKEN_B.LOGO_FILENAME}`} />
    );
  case ZapOutTypeID.ReceiveOne:
    return (
      <TokenLogo src={`${TOKENS_DIRECTORY_PATH}/${TOKENS[TokenSymbol.WONE].LOGO_FILENAME}`} />
    );
  default: {
    throw new Error('Something went wrong!');
  }
  }
};

interface Props {
  id: string;
  selectedType: ZapOutType;
  setSelectedType: React.Dispatch<React.SetStateAction<ZapOutType>>;
  selectedLPToken: LPToken | undefined;
  selectedRouterAddress: string;
  strZappingOutAmount: string;
}

const ZapOutTypeSelect = ({
  id,
  selectedType,
  setSelectedType,
  selectedLPToken,
  selectedRouterAddress,
  strZappingOutAmount
}: Props): JSX.Element | null => {
  const {
    chainId,
    library,
    account
  } = useWeb3React<Web3Provider>();

  // TODO: duplicated
  const selectedTokenAAddress =
    (
      selectedLPToken === undefined ||
      chainId === undefined
    ) ?
      undefined :
      selectedLPToken.TOKEN_A.ADDRESSES[chainId as ChainID];
  const selectedTokenBAddress =
    (
      selectedLPToken === undefined ||
      chainId === undefined
    ) ?
      undefined :
      selectedLPToken.TOKEN_B.ADDRESSES[chainId as ChainID];
  const selectedLPTokenAddress =
    (
      selectedLPToken === undefined ||
      chainId === undefined
    ) ?
      undefined :
      selectedLPToken.ADDRESSES[chainId as ChainID];

  const {
    isIdle: selectedLPTokenBalanceIdle,
    isLoading: selectedLPTokenBalanceLoading,
    data: selectedLPTokenBalance,
    error: selectedLPTokenBalanceError
  } = useTokenBalance(
    chainId,
    library,
    selectedLPTokenAddress,
    account
  );
  useErrorHandler(selectedLPTokenBalanceError);

  const {
    isIdle: selectedLPTokenTotalSupplyIdle,
    isLoading: selectedLPTokenTotalSupplyLoading,
    data: selectedLPTokenTotalSupply,
    error: selectedLPTokenTotalSupplyError
  } = useQuery<BigNumber, Error>(
    [
      GENERIC_FETCHER,
      chainId,
      selectedLPTokenAddress,
      'totalSupply'
    ],
    (chainId && library && selectedLPTokenAddress) ?
      genericFetcher<BigNumber>(library, LPTokenABI) :
      Promise.resolve,
    {
      enabled: !!(chainId && library && selectedLPTokenAddress)
    }
  );
  useErrorHandler(selectedLPTokenTotalSupplyError);

  const {
    isIdle: tokenABalanceIdle,
    isLoading: tokenABalanceLoading,
    data: tokenABalance,
    error: tokenABalanceError
  } = useQuery<BigNumber, Error>(
    [
      GENERIC_FETCHER,
      chainId,
      selectedTokenAAddress,
      'balanceOf',
      selectedLPTokenAddress
    ],
    (chainId && library && selectedLPTokenAddress) ?
      genericFetcher<BigNumber>(library, HRC20ABI) :
      Promise.resolve,
    {
      enabled: !!(chainId && library && selectedLPTokenAddress)
    }
  );
  useErrorHandler(tokenABalanceError);
  const {
    isIdle: tokenBBalanceIdle,
    isLoading: tokenBBalanceLoading,
    data: tokenBBalance,
    error: tokenBBalanceError
  } = useQuery<BigNumber, Error>(
    [
      GENERIC_FETCHER,
      chainId,
      selectedTokenBAddress,
      'balanceOf',
      selectedLPTokenAddress
    ],
    (chainId && library && selectedLPTokenAddress) ?
      genericFetcher<BigNumber>(library, HRC20ABI) :
      Promise.resolve,
    {
      enabled: !!(chainId && library && selectedLPTokenAddress)
    }
  );
  useErrorHandler(tokenBBalanceError);

  const amountA =
    (
      selectedLPTokenBalance === undefined ||
      tokenABalance === undefined ||
      selectedLPTokenTotalSupply === undefined ||
      selectedLPToken === undefined
    ) ?
      undefined :
      parseUnits(strZappingOutAmount, selectedLPToken.DECIMALS).mul(tokenABalance).div(selectedLPTokenTotalSupply);
  const amountB =
    (
      selectedLPTokenBalance === undefined ||
      tokenBBalance === undefined ||
      selectedLPTokenTotalSupply === undefined ||
      selectedLPToken === undefined
    ) ?
      undefined :
      parseUnits(strZappingOutAmount, selectedLPToken.DECIMALS).mul(tokenBBalance).div(selectedLPTokenTotalSupply);
  const {
    isLoading: amountsOutALoading,
    data: amountsOutA,
    error: amountsOutAError
  } = useQuery<Array<BigNumber>, Error>(
    [
      GENERIC_FETCHER,
      chainId,
      selectedRouterAddress,
      'getAmountsOut',
      amountB,
      [
        selectedTokenBAddress,
        selectedTokenAAddress
      ]
    ],
    (
      chainId &&
      library &&
      selectedRouterAddress &&
      amountB?.gt(Zero) &&
      selectedTokenBAddress &&
      selectedTokenAAddress
    ) ?
      genericFetcher<Array<BigNumber>>(library, IUniswapV2Router02ABI) :
      Promise.resolve,
    {
      enabled:
        !!(
          chainId &&
          library &&
          selectedRouterAddress &&
          amountB?.gt(Zero) &&
          selectedTokenBAddress &&
          selectedTokenAAddress
        )
    }
  );
  useErrorHandler(amountsOutAError);
  const {
    isLoading: amountsOutBLoading,
    data: amountsOutB,
    error: amountsOutBError
  } = useQuery<Array<BigNumber>, Error>(
    [
      GENERIC_FETCHER,
      chainId,
      selectedRouterAddress,
      'getAmountsOut',
      amountA,
      [
        selectedTokenAAddress,
        selectedTokenBAddress
      ]
    ],
    (
      chainId &&
      library &&
      selectedRouterAddress &&
      amountA?.gt(Zero) &&
      selectedTokenAAddress &&
      selectedTokenBAddress
    ) ?
      genericFetcher<Array<BigNumber>>(library, IUniswapV2Router02ABI) :
      Promise.resolve,
    {
      enabled:
        !!(
          chainId &&
          library &&
          selectedRouterAddress &&
          amountA?.gt(Zero) &&
          selectedTokenAAddress &&
          selectedTokenBAddress
        )
    }
  );
  useErrorHandler(amountsOutBError);

  if (selectedLPToken === undefined) return null;

  const handleSelectedTypeChange = (newValue: ZapOutType) => {
    setSelectedType(newValue);
  };

  const renderEstimationLabel = () => {
    let estimationLabel;
    if (
      selectedLPTokenTotalSupplyIdle ||
      selectedLPTokenTotalSupplyLoading ||
      tokenABalanceIdle ||
      tokenABalanceLoading ||
      tokenBBalanceIdle ||
      tokenBBalanceLoading ||
      selectedLPTokenBalanceIdle ||
      selectedLPTokenBalanceLoading ||
      amountsOutALoading ||
      amountsOutBLoading
    ) {
      estimationLabel = 'Loading...';
    } else {
      if (selectedLPTokenBalance === undefined) {
        throw new Error('Something went wrong!');
      }
      if (tokenABalance === undefined) {
        throw new Error('Something went wrong!');
      }
      if (tokenBBalance === undefined) {
        throw new Error('Something went wrong!');
      }
      if (selectedLPTokenTotalSupply === undefined) {
        throw new Error('Something went wrong!');
      }
      if (amountA === undefined) {
        throw new Error('Something went wrong!');
      }
      if (amountB === undefined) {
        throw new Error('Something went wrong!');
      }

      if (selectedType.id === ZapOutTypeID.ReceiveTokenA) {
        estimationLabel =
          formatBigNumberToFixed(
            amountA.add(amountsOutA ? amountsOutA[1] : Zero),
            TOKEN_AMOUNT_DISPLAY_DECIMALS,
            selectedLPToken.TOKEN_A.DECIMALS
          );
      } else if (selectedType.id === ZapOutTypeID.ReceiveTokenB) {
        estimationLabel =
          formatBigNumberToFixed(
            amountB.add(amountsOutB ? amountsOutB[1] : Zero),
            TOKEN_AMOUNT_DISPLAY_DECIMALS,
            selectedLPToken.TOKEN_B.DECIMALS
          );
      } else {
        estimationLabel = '-';
      }
    }

    return estimationLabel;
  };

  return (
    <Select
      value={selectedType}
      onChange={handleSelectedTypeChange}>
      {({ open }) => (
        <SelectBody id={id}>
          <SelectButton
            className={clsx(
              ZAP_INPUT_HEIGHT_STYLING,
              'flex',
              'items-center',
              'space-x-3'
            )}>
            {getTypeImageUI(selectedType.id, selectedLPToken)}
            <SelectText>
              {getTypeLabel(selectedType.id, selectedLPToken)}
            </SelectText>
            <SelectText>
              (est. {renderEstimationLabel()})
            </SelectText>
          </SelectButton>
          <SelectOptions open={open}>
            {ZAP_OUT_TYPES.map(item => {
              if (item.disabled) return null;
              if (item.id === ZapOutTypeID.ReceiveOne && checkOneRelatedLPToken(selectedLPToken)) return null;

              return (
                <SelectOption
                  className={ZAP_INPUT_HEIGHT_STYLING}
                  key={item.id}
                  value={item}
                  disabled={item.disabled}>
                  {({
                    selected,
                    active
                  }) => (
                    <>
                      <div
                        className={clsx(
                          'flex',
                          'items-center',
                          'space-x-4'
                        )}>
                        {getTypeImageUI(item.id, selectedLPToken)}
                        <SelectText selected={selected}>
                          {getTypeLabel(item.id, selectedLPToken)}
                        </SelectText>
                      </div>
                      {selected ? (
                        <SelectCheck active={active} />
                      ) : null}
                    </>
                  )}
                </SelectOption>
              );
            })}
          </SelectOptions>
        </SelectBody>
      )}
    </Select>
  );
};

export {
  ZapOutTypeID,
  defaultSelectedZapOutType
};

export default withErrorBoundary(ZapOutTypeSelect, {
  FallbackComponent: ErrorFallback,
  onReset: () => {
    window.location.reload();
  }
});
