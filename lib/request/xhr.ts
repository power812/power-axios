import { AxiosRequestConfig, AxiosResponse } from '../types';
import { parseHeaders } from '../helpers/headers';
import { transformResponse } from '../helpers/data';
import { AxiosError, createError } from '../helpers/error';
export default function dispatchRequest(config: AxiosRequestConfig) {
  return new Promise((resolve: (res: AxiosResponse) => void, reject) => {
    let request = new XMLHttpRequest();
    /**************** 参数处理 ************************/
    const { data = null, url = '', method = 'get', headers, responseType, timeout } = config;
    request.open(method.toUpperCase(), url, true);
    // 请求超时时间
    if (timeout) {
      request.timeout = timeout;
    }
    // 添加请求头
    if (headers) {
      Object.keys(headers).forEach((name) => {
        if (data === null && name.toLowerCase() === 'content-type') {
          delete headers[name];
        }
        request.setRequestHeader(name, headers[name]);
      });
    }
    // 定义响应类型(responseType属性，它默认为text，打印出来的data数据就是字符串类型，而第二条请求我们指定了responseType: "json")
    if (responseType) {
      request.responseType = responseType;
    }
    // Send the request
    request.send(data || null);
    /**************** xhr实例事件监听 ************************/

    //监听请求变化,拿到响应数据
    request.onreadystatechange = function handleLoad() {
      // 请求错误
      if (!request || request.readyState !== 4) {
        return;
      }
      if (request.status === 0) {
        console.error('网络错误或跨域数据请求');
        return;
      }
      const responseHeaders = parseHeaders(request.getAllResponseHeaders());
      const responseData = responseType && responseType !== 'text' ? request.response : request.responseText;
      // 包装返回数据
      const response: AxiosResponse = {
        data: responseData, // 数据
        status: request.status, // http状态码
        statusText: request.statusText,
        headers: responseHeaders, //响应头
        config, // 请求配置
        request, // xhr实例
      };
      // 状态码是否在 200-300 之间，来决定是否抛出异常
      if (request.status >= 200 && request.status < 300) {
        // 转化成json
        response.data = transformResponse(response.data);
        resolve(response);
      } else {
        reject(createError(`响应失败,响应状态码: ${response.status}`, config, request.status, request, response));
      }
    };

    // 网络错误事件
    request.onerror = function () {
      reject(createError('网络错误', config, request.status, request));
    };
    request.ontimeout = function () {
      reject(createError(`请求超时,超过 ${timeout} ms `, config, request.status, request));
    };

    /**************** 函数************************/
  });
}
