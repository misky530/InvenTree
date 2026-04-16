import { t } from '@lingui/core/macro';
import { Container, Drawer, Flex, Group, Space } from '@mantine/core';
import { useMemo } from 'react';

import { ModelType } from '@lib/enums/ModelType';
import { isWarehouseManager } from '../../functions/warehouseMode';
import useInstanceName from '../../hooks/UseInstanceName';
import * as classes from '../../main.css';
import { useGlobalSettingsState } from '../../states/SettingsStates';
import { useUserState } from '../../states/UserState';
import { InvenTreeLogo } from '../items/InvenTreeLogo';
import { type MenuLinkItem, MenuLinks } from '../items/MenuLinks';
import { StylishText } from '../items/StylishText';

export function NavigationDrawer({
  opened,
  close
}: Readonly<{
  opened: boolean;
  close: () => void;
}>) {
  return (
    <Drawer
      opened={opened}
      onClose={close}
      size='lg'
      withCloseButton={false}
      classNames={{
        body: classes.navigationDrawer
      }}
    >
      <DrawerContent closeFunc={close} />
    </Drawer>
  );
}

function DrawerContent({ closeFunc }: Readonly<{ closeFunc?: () => void }>) {
  const user = useUserState();

  const globalSettings = useGlobalSettingsState();

  const title = useInstanceName();

  // Construct menu items
  const menuItemsNavigate: MenuLinkItem[] = useMemo(() => {
    return [
      {
        id: 'home',
        title: t`Dashboard`,
        link: '/',
        icon: 'dashboard'
      },
      {
        id: 'parts',
        title: t`Parts`,
        hidden: !user.hasViewPermission(ModelType.part),
        link: '/part',
        icon: 'part'
      },
      {
        id: 'stock',
        title: t`Stock`,
        link: '/stock',
        hidden: !user.hasViewPermission(ModelType.stockitem),
        icon: 'stock'
      },
      {
        id: 'report-center',
        title: t`Report Center`,
        link: '/settings/admin/reports',
        icon: 'report',
        hidden: !isWarehouseManager(user)
      }
    ];
  }, [user]);

  const menuItemsAction: MenuLinkItem[] = useMemo(() => {
    return [
      {
        id: 'barcode',
        title: t`Scan Barcode`,
        link: '/scan',
        icon: 'barcode',
        hidden: !globalSettings.isSet('BARCODE_ENABLE')
      }
    ];
  }, [globalSettings]);

  const menuItemsSettings: MenuLinkItem[] = useMemo(() => {
    return [
      {
        id: 'notifications',
        title: t`Notifications`,
        link: '/notifications',
        icon: 'notification'
      },
      {
        id: 'user-settings',
        title: t`User Settings`,
        link: '/settings/user',
        icon: 'user'
      }
    ];
  }, []);

  return (
    <Flex direction='column' mih='100vh' p={16}>
      <Group wrap='nowrap'>
        <InvenTreeLogo />
        <StylishText size='xl'>{title}</StylishText>
      </Group>
      <Space h='xs' />
      <Container className={classes.layoutContent} p={0}>
        <MenuLinks
          title={t`Navigation`}
          links={menuItemsNavigate}
          beforeClick={closeFunc}
        />
        <MenuLinks
          title={t`Settings`}
          links={menuItemsSettings}
          beforeClick={closeFunc}
        />
        <MenuLinks
          title={t`Actions`}
          links={menuItemsAction}
          beforeClick={closeFunc}
        />
      </Container>
    </Flex>
  );
}
