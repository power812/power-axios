import { AxiosInstance, AxiosRequestConfig } from './types';
import Axios from './core/Axios';
import { extend } from './helpers/utils';
function createInstance() {
  const context = new Axios();
  const axios = async function (url: string, config?: AxiosRequestConfig) {
    return await context.request(url, config);
  };
  // axios.get = Axios.prototype.get.bind(context);
  // axios.post = Axios.prototype.post.bind(context);
  // axios.delete = Axios.prototype.delete.bind(context);
  // axios.put = Axios.prototype.put.bind(context);
  extend(axios, context);
  return axios as AxiosInstance;
}
const axios = createInstance();

export default axios;
