
import clsx from 'clsx';

import ZapIn from './ZapIn';
import ZapOut from './ZapOut';
import SectionPart from 'components/section/SectionPart';
import Page from 'components/layout/Page';
import Panel from 'components/Panel';
import FarmersOnlyTabGroup, {
  FarmersOnlyTabList,
  FarmersOnlyTab,
  FarmersOnlyTabPanels,
  FarmersOnlyTabPanel
} from 'components/UI/FarmersOnlyTabGroup';

const TabTitle = ({
  className,
  children,
  ...rest
}: React.ComponentPropsWithRef<'h1'>) => (
  <h1
    className={clsx(
      'text-lg',
      className
    )}
    {...rest}>
    {children}
  </h1>
);

// RE: https://github.com/FarmersOnlyFi/farmersonlyfi-contracts/blob/master/contracts/Vault2/Zap.sol
const Zap = (): JSX.Element => {
  return (
    <Page>
      <Panel
        className={clsx(
          'mx-auto',
          'max-w-xl',
          'px-4',
          'py-3'
        )}>
        <FarmersOnlyTabGroup>
          <SectionPart
            className={clsx(
              'border-b',
              'border-solid',
              // TODO: could be reused
              'border-black',
              'border-opacity-25',
              'dark:border-white',
              'dark:border-opacity-25'
            )}>
            <FarmersOnlyTabList>
              <FarmersOnlyTab disabled>
                <TabTitle>
                  Zap In (Coming Soon)
                </TabTitle>
              </FarmersOnlyTab>
              <FarmersOnlyTab>
                <TabTitle>
                  Zap Out
                </TabTitle>
              </FarmersOnlyTab>
            </FarmersOnlyTabList>
          </SectionPart>
          <FarmersOnlyTabPanels>
            <FarmersOnlyTabPanel>
              <ZapIn />
            </FarmersOnlyTabPanel>
            <FarmersOnlyTabPanel>
              <ZapOut />
            </FarmersOnlyTabPanel>
          </FarmersOnlyTabPanels>
        </FarmersOnlyTabGroup>
      </Panel>
    </Page>
  );
};

export default Zap;
