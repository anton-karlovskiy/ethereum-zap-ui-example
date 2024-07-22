
import * as React from 'react';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import clsx from 'clsx';
import {
  formatUnits,
  parseUnits
} from '@ethersproject/units';
import {
  Zero,
  MaxUint256
} from '@ethersproject/constants';
import { BigNumber } from '@ethersproject/bignumber';
import {
  ContractTransaction,
  ContractReceipt
} from '@ethersproject/contracts';
import {
  useErrorHandler,
  withErrorBoundary
} from 'react-error-boundary';
import { useForm } from 'react-hook-form';
import {
  useQuery,
  useMutation,
  useQueryClient
} from 'react-query';
import toast from 'react-hot-toast';

import Label from './Label';
import RouterSelect, { defaultRouter } from './RouterSelect';
import LPTokenSelect from './LPTokenSelect';
import ZapOutTypeSelect, {
  ZapOutTypeID,
  defaultSelectedZapOutType
} from './ZapOutTypeSelect';
import FormElementWrapper from './FormElementWrapper';
import Information from './Information';
import UnlockWalletButton from 'containers/UnlockWalletButton';
import SectionPart from 'components/section/SectionPart';
import SectionContainer from 'components/section/SectionContainer';
import ErrorMessage from 'components/ErrorMessage';
import NumberInput from 'components/NumberInput';
import ErrorModal from 'components/ErrorModal';
import ErrorFallback from 'components/ErrorFallback';
import FarmersOnlyWisteriaContainedButton from 'components/buttons/FarmersOnlyWisteriaContainedButton';
import FarmersOnlyRoyalBlueContainedButton from 'components/buttons/FarmersOnlyRoyalBlueContainedButton';
import PendingTXToast from 'components/tx-toasts/PendingTXToast';
import ResolvedTXToast from 'components/tx-toasts/ResolvedTXToast';
import RejectedTXToast from 'components/tx-toasts/RejectedTXToast';
import { Router } from 'config/web3/routers';
import TOKENS, {
  Token,
  TokenSymbol
} from 'config/web3/tokens';
import { ChainID } from 'config/web3/chains';
import { LPToken } from 'config/web3/lp-tokens';
import CONTRACT_ADDRESSES from 'config/constants/contract-addresses';
import {
  getHRC20Contract,
  getZapperContract
} from 'utils/helpers/web3/contract-helpers';
import { formatBigNumberToFixed } from 'utils/helpers/web3/balances';
import { TOKEN_AMOUNT_DISPLAY_DECIMALS } from 'utils/constants/general';
import {
  ZAP_INPUT_HEIGHT_STYLING,
  DIVIDE_STYLING
} from 'utils/constants/styles';
import useTokenBalance from 'services/hooks/use-token-balance';
import genericFetcher, { GENERIC_FETCHER } from 'services/fetchers/generic-fetcher';
import HRC20ABI from 'config/abi/hrc20.json';

let toastId: string;

const CONFIRM_BUTTON_STYLING = clsx(
  'w-full',
  'text-lg',
  'h-14'
);

const ZAPPING_OUT_AMOUNT = 'zapping-out-amount';
type ZappingOutFormData = {
  [ZAPPING_OUT_AMOUNT]: string;
}

// TODO: could move this to a more general utils
const getPathToOne = (router: Router, toToken: Token, chainID: ChainID) => {
  const toTokenAddress = toToken.ADDRESSES[chainID];

  const path = [toTokenAddress];
  const jumpPath = router.PATHS[toTokenAddress];
  if (jumpPath) {
    path.push(jumpPath);
  }
  // Finally add ONE
  path.push(TOKENS[TokenSymbol.WONE].ADDRESSES[chainID]);

  return path;
};

const LP_TOKEN_LIST = 'lp-tokens-list';
const ZAP_OUT_TYPE_LIST = 'zap-out-type-list';
const ROUTER_NAME_LIST = 'router-name-list';

const ZapOut = (): JSX.Element => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<ZappingOutFormData>({
    mode: 'onChange'
  });
  const strZappingOutAmount = watch(ZAPPING_OUT_AMOUNT) || '0';

  const {
    chainId,
    library,
    account,
    active
  } = useWeb3React<Web3Provider>();

  const [selectedRouter, setSelectedRouter] = React.useState(defaultRouter);
  const [selectedLPToken, setSelectedLPToken] = React.useState<LPToken>();
  const [selectedZapOutType, setSelectedZapOutType] = React.useState(defaultSelectedZapOutType);

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
    isSuccess: selectedLPTokenBalanceSuccess,
    data: selectedLPTokenBalance,
    error: selectedLPTokenBalanceError,
    refetch: selectedLPTokenBalanceRefetch
  } = useTokenBalance(
    chainId,
    library,
    selectedLPTokenAddress,
    account
  );
  useErrorHandler(selectedLPTokenBalanceError);

  const owner = account;
  const spender =
    chainId === undefined ?
      undefined :
      CONTRACT_ADDRESSES.ZAPPER[chainId as ChainID];

  const {
    isIdle: selectedLPTokenAllowanceIdle,
    isLoading: selectedLPTokenAllowanceLoading,
    isSuccess: selectedLPTokenAllowanceSuccess,
    data: selectedLPTokenAllowance,
    error: selectedLPTokenAllowanceError,
    refetch: selectedLPTokenAllowanceRefetch
  } = useQuery<BigNumber, Error>(
    [
      GENERIC_FETCHER,
      chainId,
      selectedLPTokenAddress,
      'allowance',
      owner,
      spender
    ],
    (chainId && library && selectedLPTokenAddress && owner && spender) ?
      genericFetcher<BigNumber>(library, HRC20ABI) :
      Promise.resolve,
    {
      enabled: !!(chainId && library && selectedLPTokenAddress && owner && spender)
    }
  );
  useErrorHandler(selectedLPTokenAllowanceError);

  const approveMutation = useMutation<ContractReceipt, Error, string>(
    async () => {
      if (selectedLPTokenAddress === undefined) {
        throw new Error('Something went wrong!');
      }
      if (!library) {
        throw new Error('Invalid library!');
      }

      const selectedLPTokenContract = getHRC20Contract(selectedLPTokenAddress, library.getSigner());
      const tx: ContractTransaction = await selectedLPTokenContract.approve(spender, MaxUint256);
      toastId = toast(
        t => <PendingTXToast t={t} />,
        {
          duration: Infinity
        }
      );
      return await tx.wait();
    },
    {
      onSuccess: () => {
        selectedLPTokenAllowanceRefetch();
        toast(
          t => <ResolvedTXToast t={t} />,
          {
            duration: 2000,
            id: toastId
          }
        );
      },
      onError: (error: Error) => {
        toast(
          t => (
            <RejectedTXToast
              t={t}
              message={error.message} />
          ),
          {
            duration: 4000,
            id: toastId
          }
        );
      }
    }
  );

  const zapOutMutation = useMutation<ContractReceipt, Error, string>(
    async (variables: string) => {
      if (selectedLPToken === undefined) {
        throw new Error('Something went wrong!');
      }
      if (selectedLPTokenAddress === undefined) {
        throw new Error('Something went wrong!');
      }
      if (!library) {
        throw new Error('Invalid library!');
      }
      if (!chainId) {
        throw new Error('Invalid chain ID!');
      }

      const bigZappingOutAmount = parseUnits(variables, selectedLPToken.DECIMALS);
      const zapperContract = getZapperContract(library.getSigner());
      const tokenAAddress = selectedLPToken.TOKEN_A.ADDRESSES[chainId as ChainID];
      const tokenBAddress = selectedLPToken.TOKEN_B.ADDRESSES[chainId as ChainID];

      let toAddress: string;
      let path0: Array<string>;
      let path1: Array<string>;
      switch (selectedZapOutType.id) {
      case ZapOutTypeID.ReceiveTokenA: {
        toAddress = tokenAAddress;
        path0 = [];
        path1 = [
          tokenBAddress,
          tokenAAddress
        ];
        break;
      }
      case ZapOutTypeID.ReceiveTokenB: {
        toAddress = tokenBAddress;
        path0 = [
          tokenAAddress,
          tokenBAddress
        ];
        path1 = [];
        break;
      }
      case ZapOutTypeID.ReceiveOne: {
        toAddress = TOKENS[TokenSymbol.WONE].ADDRESSES[chainId as ChainID];
        path0 = getPathToOne(selectedLPToken.ROUTER, selectedLPToken.TOKEN_A, chainId);
        path1 = getPathToOne(selectedLPToken.ROUTER, selectedLPToken.TOKEN_B, chainId);
        break;
      }
      default:
        throw new Error('Something went wrong!');
      }

      const fromAddress = selectedLPTokenAddress;
      const routerAddress = selectedLPToken.ROUTER.ADDRESSES[chainId as ChainID];
      const tx: ContractTransaction =
        await zapperContract.zapOutToken(
          fromAddress,
          bigZappingOutAmount,
          toAddress,
          routerAddress,
          account,
          path0,
          path1
        );
      toastId = toast(
        t => <PendingTXToast t={t} />,
        {
          duration: Infinity
        }
      );
      return await tx.wait();
    },
    {
      onSuccess: () => {
        reset({
          [ZAPPING_OUT_AMOUNT]: '0.0'
        });
        selectedLPTokenAllowanceRefetch();
        selectedLPTokenBalanceRefetch();
        queryClient.invalidateQueries([
          GENERIC_FETCHER,
          chainId,
          selectedLPTokenAddress,
          'totalSupply'
        ]);
        queryClient.invalidateQueries([
          GENERIC_FETCHER,
          chainId,
          selectedTokenAAddress,
          'balanceOf',
          selectedLPTokenAddress
        ]);
        queryClient.invalidateQueries([
          GENERIC_FETCHER,
          chainId,
          selectedTokenBAddress,
          'balanceOf',
          selectedLPTokenAddress
        ]);
        toast(
          t => <ResolvedTXToast t={t} />,
          {
            duration: 2000,
            id: toastId
          }
        );
      },
      onError: (error: Error) => {
        toast(
          t => (
            <RejectedTXToast
              t={t}
              message={error.message} />
          ),
          {
            duration: 4000,
            id: toastId
          }
        );
      }
    }
  );

  let approved: boolean | undefined;
  let submitButtonLabel: string;
  const initializing =
    selectedLPTokenBalanceIdle ||
    selectedLPTokenBalanceLoading ||
    selectedLPTokenAllowanceIdle ||
    selectedLPTokenAllowanceLoading;
  if (initializing) {
    submitButtonLabel = 'Loading...';
  } else if (
    selectedLPTokenBalanceSuccess &&
    selectedLPTokenAllowanceSuccess
  ) {
    if (selectedLPTokenAllowance === undefined) {
      throw new Error('Something went wrong!');
    }

    approved = selectedLPTokenAllowance.gt(Zero);
    submitButtonLabel = approved ? 'Zap Out' : 'Approve';
  } else {
    throw new Error('Something went wrong!');
  }

  const renderBalanceLabel = () => {
    if (!active) {
      return <>-</>;
    }

    if (selectedLPTokenBalanceIdle || selectedLPTokenBalanceLoading) {
      return <>Loading...</>;
    }
    if (selectedLPTokenBalance === undefined) {
      throw new Error('Something went wrong!');
    }
    if (selectedLPToken === undefined) {
      throw new Error('Something went wrong!');
    }

    const balanceLabel =
      formatBigNumberToFixed(
        selectedLPTokenBalance,
        TOKEN_AMOUNT_DISPLAY_DECIMALS,
        selectedLPToken.DECIMALS
      );

    return (
      <>
        Balance: {balanceLabel}
      </>
    );
  };

  const validateZappingOutAmount = (value: string): string | undefined => {
    if (selectedLPToken === undefined) {
      throw new Error('Something went wrong!');
    }
    if (selectedLPTokenBalance === undefined) {
      throw new Error('Something went wrong!');
    }
    if (selectedLPTokenAllowance === undefined) {
      throw new Error('Something went wrong!');
    }

    if (!approved) {
      return undefined;
    }

    const bigZappingOutAmount = parseUnits(value || '0', selectedLPToken.DECIMALS);
    if (bigZappingOutAmount.gt(selectedLPTokenBalance)) {
      return 'Must be less than your LP balance!';
    }

    if (bigZappingOutAmount.gt(selectedLPTokenAllowance)) {
      return 'Must be less than allowance!';
    }

    if (bigZappingOutAmount.lte(Zero)) {
      return 'Must be greater than zero!';
    }

    return undefined;
  };

  const onApprove = (data: ZappingOutFormData) => {
    approveMutation.mutate(data[ZAPPING_OUT_AMOUNT]);
  };

  const onZapOut = (data: ZappingOutFormData) => {
    zapOutMutation.mutate(data[ZAPPING_OUT_AMOUNT]);
  };

  const inputMaxValue = () => {
    if (selectedLPToken === undefined) {
      return;
    }
    if (selectedLPTokenBalance === undefined) {
      return;
    }

    reset({
      [ZAPPING_OUT_AMOUNT]: formatUnits(selectedLPTokenBalance, selectedLPToken.DECIMALS)
    });
  };

  const selectedRouterAddress = selectedRouter.ADDRESSES[chainId as ChainID];

  return (
    <>
      <form
        onSubmit={
          (selectedLPTokenBalanceSuccess && selectedLPTokenAllowanceSuccess) ?
            handleSubmit(approved ? onZapOut : onApprove) :
            undefined
        }
        className={clsx(
          'divide-y',
          DIVIDE_STYLING
        )}>
        <SectionPart
          className={clsx(
            'grid',
            'grid-cols-1',
            'auto-rows-fr',
            'gap-6'
          )}>
          <SectionContainer label='Protocols'>
            <FormElementWrapper>
              <Label htmlFor={ROUTER_NAME_LIST}>
                Routers
              </Label>
              <RouterSelect
                id={ROUTER_NAME_LIST}
                selectedRouter={selectedRouter}
                setSelectedRouter={setSelectedRouter} />
            </FormElementWrapper>
          </SectionContainer>
          <SectionContainer
            label='From'
            innerClassName={clsx(
              'flex',
              'space-x-2'
            )}>
            <FormElementWrapper
              className={clsx(
                'w-60',
                'flex-shrink-0'
              )}>
              <Label htmlFor={LP_TOKEN_LIST}>
                LP tokens
              </Label>
              <LPTokenSelect
                id={LP_TOKEN_LIST}
                selectedLPToken={selectedLPToken}
                setSelectedLPToken={setSelectedLPToken}
                selectedRouter={selectedRouter}
                extraFcn={() => {
                  zapOutMutation.reset();
                }} />
            </FormElementWrapper>
            <FormElementWrapper className='flex-1'>
              <Label
                className='text-right'
                htmlFor={ZAPPING_OUT_AMOUNT}>
                {renderBalanceLabel()}
              </Label>
              <div
                className={clsx(
                  'flex',
                  'relative'
                )}>
                <FarmersOnlyRoyalBlueContainedButton
                  onClick={inputMaxValue}
                  className={clsx(
                    'absolute',
                    'top-1/2',
                    'transform',
                    '-translate-y-1/2',
                    'left-0',
                    'ml-3',
                    'h-8',
                    '!px-2'
                  )}>
                  MAX
                </FarmersOnlyRoyalBlueContainedButton>
                <NumberInput
                  id={ZAPPING_OUT_AMOUNT}
                  {...register(ZAPPING_OUT_AMOUNT, {
                    required: {
                      value: approved ? true : false,
                      message: 'This field is required!'
                    },
                    validate: value => validateZappingOutAmount(value)
                  })}
                  className={ZAP_INPUT_HEIGHT_STYLING} />
              </div>
              <ErrorMessage className='justify-end'>
                {errors[ZAPPING_OUT_AMOUNT]?.message}
              </ErrorMessage>
            </FormElementWrapper>
          </SectionContainer>
          <SectionContainer label='To'>
            <FormElementWrapper>
              <Label htmlFor={ZAP_OUT_TYPE_LIST}>
                Zap Out Types
              </Label>
              <ZapOutTypeSelect
                id={ZAP_OUT_TYPE_LIST}
                selectedType={selectedZapOutType}
                setSelectedType={setSelectedZapOutType}
                selectedLPToken={selectedLPToken}
                selectedRouterAddress={selectedRouterAddress}
                strZappingOutAmount={strZappingOutAmount} />
            </FormElementWrapper>
          </SectionContainer>
        </SectionPart>
        <SectionPart>
          <Information />
        </SectionPart>
        <SectionPart>
          {active ? (
            <FarmersOnlyWisteriaContainedButton
              type='submit'
              className={CONFIRM_BUTTON_STYLING}
              disabled={initializing}
              pending={approveMutation.isLoading || zapOutMutation.isLoading}>
              {submitButtonLabel}
            </FarmersOnlyWisteriaContainedButton>
          ) : (
            <UnlockWalletButton className={CONFIRM_BUTTON_STYLING} />
          )}
        </SectionPart>
      </form>
      {(approveMutation.isError || zapOutMutation.isError) && (
        <ErrorModal
          open={approveMutation.isError || zapOutMutation.isError}
          onClose={() => {
            if (approveMutation.isError) {
              approveMutation.reset();
            }
            if (zapOutMutation.isError) {
              zapOutMutation.reset();
            }
          }}
          title='Error'
          description={
            approveMutation.error?.message || zapOutMutation.error?.message || ''
          } />
      )}
    </>
  );
};

export default withErrorBoundary(ZapOut, {
  FallbackComponent: ErrorFallback,
  onReset: () => {
    window.location.reload();
  }
});
