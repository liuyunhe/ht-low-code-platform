// let host = 'http://lawp.nesc.cn:7070/';
let host = 'http://114.251.201.179:7070/';
window.context = {
  manage: host + 'mvue',//管理端页面
  front:  host + 'fvue',//前端页面
  mobile: host + 'mobilevue',
  portal: host + 'eip-portal',
  bpmRunTime: host + 'eip-bpm-runtime',
  bpmModel: host + 'eip-bpm-model',
  uc: host + 'eip-uc',
  form: host + 'eip-form',
  sign: host + 'sign-server',
  host: host,
  defaultTemplateId: '1419530703837728768',
  OAHost:"192.18.27.21" //东证OA主机地址
};

// 单点配置
window.ssoConfig = {
  mode: "", // 空则不使用单点  支持的模式有  cas oauth basic
  url: 'http://127.0.0.1:8092/oauth/authorize',
  clientId: 'eip7',// oauth模式下需要提供
  logout: 'http://127.0.0.1:8092/logout'
}
