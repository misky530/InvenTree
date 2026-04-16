import { t } from '@lingui/core/macro';
import type { SpotlightActionData } from '@mantine/spotlight';
import {
  IconBarcode,
  IconLink,
  IconPointer,
  IconUserCog
} from '@tabler/icons-react';
import type { NavigateFunction } from 'react-router-dom';

import { openContextModal } from '@mantine/modals';
import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import {
  isWarehouseAction
} from '../functions/warehouseMode';
import { useLocalState } from '../states/LocalState';
import { useGlobalSettingsState } from '../states/SettingsStates';
import { useUserState } from '../states/UserState';

export function openQrModal(navigate: NavigateFunction) {
  return openContextModal({
    modal: 'qr',
    innerProps: { navigate: navigate }
  });
}

export function getActions(navigate: NavigateFunction) {
  const setNavigationOpen = useLocalState(
    useShallow((state) => state.setNavigationOpen)
  );
  const globalSettings = useGlobalSettingsState();
  const user = useUserState();

  const actions: SpotlightActionData[] = useMemo(() => {
    const _actions: SpotlightActionData[] = [
      {
        id: 'dashboard',
        label: t`Dashboard`,
        description: t`Go to the InvenTree dashboard`,
        onClick: () => navigate('/'),
        leftSection: <IconLink size='1.2rem' />
      },
      {
        id: 'navigation',
        label: t`Open Navigation`,
        description: t`Open the main navigation menu`,
        onClick: () => setNavigationOpen(true),
        leftSection: <IconPointer size='1.2rem' />
      },
      {
        id: 'user-settings',
        label: t`User Settings`,
        description: t`Go to your user settings`,
        onClick: () => navigate('/settings/user'),
        leftSection: <IconUserCog size='1.2rem' />
      }
    ];

    globalSettings.isSet('BARCODE_ENABLE') &&
      _actions.push({
        id: 'scan',
        label: t`Scan`,
        description: t`Scan a barcode or QR code`,
        onClick: () => openQrModal(navigate),
        leftSection: <IconBarcode size='1.2rem' />
      });

    return _actions.filter((action) => isWarehouseAction(action.id));
  }, [navigate, setNavigationOpen, globalSettings, user]);

  return actions.sort((a, b) => (a.label ?? '').localeCompare(b.label ?? ''));
}
