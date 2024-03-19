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
};

// 单点配置
window.ssoConfig = {
  mode: "", // 空则不使用单点  支持的模式有  cas oauth basic
  url: 'http://127.0.0.1:8092/oauth/authorize',
  clientId: 'eip7',// oauth模式下需要提供
  logout: 'http://127.0.0.1:8092/logout'
}
