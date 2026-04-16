import { ModelType } from '@lib/enums/ModelType';
import type { UserStateProps } from '@lib/types/User';

export const WAREHOUSE_MODE_ENABLED = true;
export const WAREHOUSE_FORCED_LOCALE = 'zh_Hans';

const WAREHOUSE_NAV_TABS = new Set(['home', 'part', 'stock']);
const WAREHOUSE_ACTIONS = new Set([
  'dashboard',
  'navigation',
  'user-settings',
  'scan'
]);
const WAREHOUSE_SEARCH_MODELS = new Set<ModelType>([
  ModelType.part,
  ModelType.partcategory,
  ModelType.stockitem,
  ModelType.stocklocation
]);
const WAREHOUSE_ADMIN_PANELS = new Set(['labels', 'reports']);
const WAREHOUSE_ADMIN_GROUPS = new Set(['reporting']);

export function isWarehouseManager(user: UserStateProps): boolean {
  return WAREHOUSE_MODE_ENABLED && user.isStaff();
}

export function isWarehouseNavTab(name: string): boolean {
  return !WAREHOUSE_MODE_ENABLED || WAREHOUSE_NAV_TABS.has(name);
}

export function isWarehouseAction(id: string): boolean {
  return !WAREHOUSE_MODE_ENABLED || WAREHOUSE_ACTIONS.has(id);
}

export function isWarehouseSearchModel(model: ModelType): boolean {
  return !WAREHOUSE_MODE_ENABLED || WAREHOUSE_SEARCH_MODELS.has(model);
}

export function isWarehouseAdminPanel(name: string): boolean {
  return !WAREHOUSE_MODE_ENABLED || WAREHOUSE_ADMIN_PANELS.has(name);
}

export function isWarehouseAdminGroup(id: string): boolean {
  return !WAREHOUSE_MODE_ENABLED || WAREHOUSE_ADMIN_GROUPS.has(id);
}
