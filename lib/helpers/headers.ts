import { isObject } from './utils';
import { headersType } from './../types';

function normalizeHeaderName(headers: any, normalizedName: string): void {
  if (!headers) {
    return;
  }
  Object.keys(headers).forEach((name) => {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = headers[name];
      delete headers[name];
    }
  });
}

export function processHeaders(data: any, headers?: headersType): any {
  // 请求头规范化成Content-Type
  normalizeHeaderName(headers, 'Content-Type');
  if (isObject(data)) {
    // 用户不传就添加'application/json;charset=utf-8'
    if (!headers || (headers && !headers['Content-Type'])) {
      headers = headers || {};
      headers['Content-Type'] = 'application/json;charset=utf-8';
    }
  }
  return headers;
}
/**
 * 解析响应头
 * headers: "date: Mon, 29 Jul 2019 07:47:16 GMT ↵etag: W/"d-Ssxx4FRxEutDLwo2+xkkxKc4y0k" ↵connection: close ↵x-powered-by: Express ↵content-length: 13 ↵content-type: application/json; charset=utf-8
 * 
 * ｛
    headers: "date: Mon, 29 Jul 2019 07:47:16 GMT
    etag: 'W/"d-Ssxx4FRxEutDLwo2+xkkxKc4y0k"'
    connection: 'close'
    x-powered-by: 'Express'
    content-length: '13'
    content-type: 'application/json; charset=utf-8'
｝
 * */
export function parseHeaders(headers: string): any {
  let res = Object.create(null);
  if (!headers) {
    return res;
  }
  headers.split('\r\n').forEach((line) => {
    let [key, val] = line.split(':');
    key = key.trim().toLowerCase();
    if (!key) {
      return;
    }
    if (val) {
      val = val.trim();
    }

    res[key] = val;
  });
  return res;
}
