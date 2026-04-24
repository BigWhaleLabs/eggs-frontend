import Leaderboard from 'components/Modals/Leaderboard'
import LevelUpHen from 'components/Modals/LevelUpHen'
import ProxyManagement from 'components/Modals/ProxyManagement'
import ShareYourCock from 'components/Modals/ShareYourCock'
import Staking from 'components/Modals/Staking'
import TipInfo from 'components/Modals/TipInfo'
import Wallets from 'components/Modals/Wallets'
import WhyLevelUp from 'components/Modals/WhyLevelUp'
import YieldExplained from 'components/Modals/YieldExplained'
import { atom, useAtom } from 'jotai'

export enum ModalState {
  Closed = 'Closed',
  ShareYourCock = 'ShareYourCock',
  LevelUpHen = 'LevelUpHen',
  WhyLevelUp = 'WhyLevelUp',
  YieldExplained = 'YieldExplained',
  Wallets = 'Wallets',
  TipInfo = 'TipInfo',
  Leaderboard = 'Leaderboard',
  Staking = 'Staking',
  ProxyManagement = 'ProxyManagement',
}

export const modalsSettings: {
  [key in ModalState]: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    component: React.FC<any>
  }
} = {
  [ModalState.ShareYourCock]: {
    component: ShareYourCock,
  },
  [ModalState.Closed]: {
    component: () => null,
  },
  [ModalState.LevelUpHen]: {
    component: LevelUpHen,
  },
  [ModalState.WhyLevelUp]: {
    component: WhyLevelUp,
  },
  [ModalState.YieldExplained]: {
    component: YieldExplained,
  },
  [ModalState.Wallets]: {
    component: Wallets,
  },
  [ModalState.TipInfo]: {
    component: TipInfo,
  },
  [ModalState.Leaderboard]: {
    component: Leaderboard,
  },
  [ModalState.Staking]: {
    component: Staking,
  },
  [ModalState.ProxyManagement]: {
    component: ProxyManagement,
  },
}

type ModalsRequiringProps = ModalState.LevelUpHen

export interface ModalPropsMap {
  [ModalState.ShareYourCock]?: undefined
  [ModalState.Closed]?: undefined
  [ModalState.LevelUpHen]: {
    level: number
    chickenSerialId: number
    chickenName: string
  }
  [ModalState.WhyLevelUp]?: undefined
  [ModalState.YieldExplained]?: undefined
  [ModalState.Wallets]?: undefined
  [ModalState.TipInfo]?: undefined
  [ModalState.Leaderboard]?: undefined
  [ModalState.Staking]?: undefined
  [ModalState.ProxyManagement]?: undefined
}

export const modalStateAtom = atom<ModalState>(ModalState.Closed)

export const modalPropsAtom = atom<ModalPropsMap[ModalState] | undefined>(
  undefined
)

export function useModal() {
  const [modalState, setModalState] = useAtom(modalStateAtom)
  const [modalProps, setModalProps] = useAtom(modalPropsAtom)

  type HasRequiredProps<T extends ModalState> = T extends ModalsRequiringProps
    ? true
    : false

  function openModal<T extends ModalState>(
    modal: T,
    ...args: HasRequiredProps<T> extends true
      ? [props: ModalPropsMap[T]]
      : [] | [props?: ModalPropsMap[T]]
  ) {
    setModalState(modal)
    setModalProps(args.length > 0 ? args[0] : undefined)
  }

  function closeModal() {
    setModalState(ModalState.Closed)
    setModalProps(undefined)
  }

  return {
    modalState,
    modalProps,
    openModal,
    closeModal,
  }
}
