
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
import ROUTERS, {
  Router,
  RouterName
} from 'config/web3/routers';
import { ZAP_INPUT_HEIGHT_STYLING } from 'utils/constants/styles';
import { ROUTERS_DIRECTORY_PATH } from 'utils/constants/general';

const routers = Object.values(ROUTERS).filter(item => (
  // TODO: remove a condition if the router includes any LP token
  item.NAME !== RouterName.Artemis &&
  item.NAME !== RouterName.Tranquil &&
  item.NAME !== RouterName.Reverse &&
  item.NAME !== RouterName.PiggyBank &&
  item.NAME !== RouterName.Quartz &&
  item.NAME !== RouterName.Comfy &&
  item.NAME !== RouterName.HolyGrail
));
const defaultRouter = routers[0];

interface Props {
  id: string;
  selectedRouter: Router;
  setSelectedRouter: React.Dispatch<React.SetStateAction<Router>>;
}

const RouterSelect = ({
  id,
  selectedRouter,
  setSelectedRouter
}: Props): JSX.Element => {
  const handleSelectedRouterChange = (newValue: Router) => {
    setSelectedRouter(newValue);
  };

  return (
    <Select
      value={selectedRouter}
      onChange={handleSelectedRouterChange}>
      {({ open }) => (
        <SelectBody id={id}>
          <SelectButton
            className={clsx(
              ZAP_INPUT_HEIGHT_STYLING,
              'flex',
              'items-center',
              'space-x-3'
            )}>
            <TokenLogo src={`${ROUTERS_DIRECTORY_PATH}/${selectedRouter.LOGO_FILENAME}`} />
            <SelectText>
              {selectedRouter.NAME}
            </SelectText>
          </SelectButton>
          <SelectOptions
            className='max-h-80'
            open={open}>
            {routers.map(item => (
              <SelectOption
                className={ZAP_INPUT_HEIGHT_STYLING}
                key={item.NAME}
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
                      <TokenLogo src={`${ROUTERS_DIRECTORY_PATH}/${item.LOGO_FILENAME}`} />
                      <SelectText selected={selected}>
                        {item.NAME}
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

export {
  defaultRouter
};

export default RouterSelect;
