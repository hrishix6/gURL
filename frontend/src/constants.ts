import {
  AppTheme,
  ReqBodyType,
  ReqTabId,
  RequestMethod,
  ResTabId,
  TabItem,
  ThemeLabel,
} from './app/models';
import { DropDownItem } from './common/components';

export const DEFAULT_THEME: AppTheme = 'sun';

export const SUPPORTED_THEMES: ThemeLabel[] = [
  {
    id: 'water',
    label: 'Water',
  },
  {
    id: 'mountain',
    label: 'Mountain',
  },
  {
    id: 'dracula',
    label: 'Dracula',
  },
  {
    id: 'sun',
    label: 'Sun',
  },
  {
    id: 'forest',
    label: 'Forest',
  },
  {
    id: 'night',
    label: 'Night',
  },
];

export const REQ_DETAILS_TABS: Readonly<TabItem<ReqTabId>[]> = [
  {
    id: 'req_headers',
    Name: 'Headers',
  },
  {
    id: 'req_query',
    Name: 'Query',
  },
  {
    id: 'req_body',
    Name: 'Body',
  },
  {
    id: 'req_auth',
    Name: 'Auth',
  },
];

export const RES_DETAILS_TABS: readonly TabItem<ResTabId>[] = [
  {
    id: 'res_body',
    Name: 'Response',
  },
  {
    id: 'res_headers',
    Name: 'Headers',
  },
  {
    id: 'res_console',
    Name: 'Trace',
  },
];

export const REQ_BODY_TYPES: readonly DropDownItem<ReqBodyType>[] = [
  {
    id: 'none',
    displayName: 'None',
  },
  {
    id: 'binary',
    displayName: 'File',
  },
  {
    id: 'txt',
    displayName: 'Text',
    isTitle: true,
  },
  {
    id: 'json',
    displayName: 'JSON',
  },
  {
    id: 'xml',
    displayName: 'XML',
  },
  {
    id: 'plaintext',
    displayName: 'Plain',
  },
  {
    id: 'form',
    displayName: 'Form',
    isTitle: true,
  },
  {
    id: 'multipart',
    displayName: 'Multipart',
  },
  {
    id: 'urlencoded',
    displayName: 'URL Encoded',
  },
];

export const REQ_METHODS: readonly DropDownItem<RequestMethod>[] = [
  {
    id: 'GET',
    displayName: 'Get',
  },
  {
    id: 'POST',
    displayName: 'Post',
  },
  {
    id: 'PUT',
    displayName: 'Put',
  },
  {
    id: 'PATCH',
    displayName: 'Patch',
  },
  {
    id: 'DELETE',
    displayName: 'Delete',
  },
  {
    id: 'OPTIONS',
    displayName: 'Options',
  },
  {
    id: 'HEAD',
    displayName: 'Head',
  },
];

//#region persistence-keys
export const THEME_KEY = 'gurl-theme';
export const DESKTOP_SIDEBAR_KEY = 'gurl-desktop-sidebar';

//#endregion persistence-keys

export const QID_PLACEHOLDER = 'qid_default';
export const HID_PLACEHOLDER = 'hid_default';
export const MULTIPART_ID_PLACEHOLDER = 'mid_default';
export const URLENCODED_ID_PLACEHOLDER = 'uid_default';

export const APP_VERSION = 'v2.0';
