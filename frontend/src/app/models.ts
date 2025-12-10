import { main } from '../../wailsjs/go/models';

export type RequestMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE' | 'OPTIONS' | 'HEAD';

export type ReqBodyType =
  | 'none'
  | 'multipart'
  | 'urlencoded'
  | 'json'
  | 'xml'
  | 'plaintext'
  | 'binary'
  | 'txt'
  | 'form';

export type ReqTabId = 'req_headers' | 'req_query' | 'req_body' | 'req_auth';
export type ResTabId = 'res_headers' | 'res_body' | 'res_console';
export type RequestAuthType = 'no_auth' | 'basic' | 'bearer' | 'api_key';

export type AppTheme = 'dracula' | 'forest' | 'water' | 'mountain' | 'sun' | 'night';

export interface ThemeLabel {
  id: AppTheme;
  label: string;
}

export interface KeyValItem {
  id: string;
  key: string;
  val: string;
  enabled: string;
}

export interface MultipartItem {
  id: string;
  key: string;
  val: string | main.FileStats;
  enabled: string;
}

export type RequestHeaders = KeyValItem[];
export type RequestQuery = KeyValItem[];

export interface TabItem<T> {
  id: T;
  Name: string;
  hasIndicator?: boolean;
  indicatorVal?: any;
}

export type ResStatsType = Pick<
  main.GurlRes,
  'size' | 'status' | 'statusText' | 'time' | 'success'
> | null;

export interface RequestTabItem {
  id: string;
  method: RequestMethod;
  title: string;
}

export type AppState = 'initializing' | 'loaded' | 'error';
