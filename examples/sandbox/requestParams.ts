import axios from '../../index';
const date = new Date();
axios({
  method: 'get',
  url: '/api',
  params: {
    date,
  },
});
axios({
  method: 'get',
  url: '/api',
  params: {
    foo: '@:$, ',
  },
});
// 参数值包含null或`undefined`
axios({
  method: 'get',
  url: '/api',
  params: {
    foo: 'bar',
    baz: null,
  },
});

// url 中存在哈希#标记
axios({
  method: 'get',
  url: '/api#hash?bar=baz',
  params: {
    foo: 'bar',
  },
});

// url 中已存在的参数
axios({
  method: 'get',
  url: '/api?foo=bar',
  params: {
    bar: 'baz',
  },
});
export default 'params';
