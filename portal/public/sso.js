let BASE_URL_ = 'https://tacj.openunion.cn';
try {
  if(BASE_URL) BASE_URL_ = BASE_URL
} catch (error) {
  console.log("error====>",error)
}

window.context = {
  manage: `${BASE_URL_}/manage`,//管理端页面
  front: `${BASE_URL_}/portal`, //前端页面
  mobile: `${BASE_URL_}/mobile`, //移动端

  portal: `${BASE_URL_}/api/portal`,
  bpmRunTime: `${BASE_URL_}/api/bpm-runtime`,
  bpmModel: `${BASE_URL_}/api/bpm-model`,
  uc: `${BASE_URL_}/api/uc`,
  form: `${BASE_URL_}/api/form`,
  isShow:false,
  baseUrl:`${BASE_URL_}`,
  data: `${BASE_URL_}/api/data`,
  pay: `${BASE_URL_}/api/pay`,
};

window.ssoConfig = {
  mode: 'oauth', // 空则不使用单点  支持的模式有  cas oauth basic
  url: 'http://172.16.5.18:8080/sso/oauth2.0/authorize',
  clientId: 'd0b5fd36-0c70-40ae-890e-13968c689d9a', // oauth模式下需要提供
  logout: 'http://172.16.5.18:8080/sso/logout'
}
