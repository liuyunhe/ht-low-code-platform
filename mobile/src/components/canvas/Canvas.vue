<template>
  <div>
    <NavBar>
      <template slot="title">设计签章</template>
    </NavBar>
    <div class="esign-div">
        <van-tabs v-model="active">
          <van-tab title="手写签名">
            <vue-esign ref="esign" :width="800" :height="400" :isCrop="isCrop" :lineWidth="lineWidth" :lineColor="lineColor" />
          </van-tab>
          <van-tab title="上传签名">
            <ht-viewer v-model="electronicSeal.fileId" />
          </van-tab>
        </van-tabs>
      
    </div>
    <div style="margin: 10px">
      <van-field auto-complete="new-password" v-model="electronicSeal.oldPassWord" type="password" label="登录密码" placeholder="请输入登录密码"/>
    </div>
    <div style="margin: 10px">
      <van-field auto-complete="new-password" v-model="electronicSeal.password" type="password" label="签章密码" placeholder="请输入签章密码"/>
    </div>
    <div style="margin: 10px">
       <van-field auto-complete="new-password" v-model="electronicSeal.confirmPwd" type="password" label="确认密码" placeholder="请输入确认密码"/>
    </div>
    <div class="button_group">
      <el-button type="primary" @click="handleGenerate">保存</el-button>
      <el-button  @click="handleReset">清空</el-button>
    </div>
   <!-- <button @click="handleReset">清空画板</button>
    <button @click="handleGenerate">保存</button>-->
  </div>
</template>

<script>
import NavBar from "@/components/navBar/NavBar.vue";
import HtViewer from "@/components/control/HtViewer";
import { Notify,Field,Tab, Tabs  } from 'vant';
import req from "@/request";
export default {
  data() {
    return {
      lineWidth: 6,
      lineColor: '#000000',
      bgColor: '#ffffff',
      resultImg: '',
      isCrop: true,
      electronicSeal: {
        fileId: '',
        password: ''
      },
      active:0,
    }
  },
  components: {
    NavBar,
    [Notify.Component.name]: Notify.Component,
    [Field.name]: Field,
    [Tabs.name]: Tabs,
    [Tab.name]: Tab,
    HtViewer
  },
  mounted() {
    this.getElectronicSeal();
  },
  methods: {
    handleReset () {
      this.$refs.esign.reset()
    },
    getElectronicSeal(){
      // 获取当前登录用户的签章图片
      req.get(window.context.uc + '/uc/electronicSeal/v1/getSealByCurrentUserId').then(response => {
        if (response.data) {
          this.electronicSeal = response.data;
        }
      }).then(() => {});
    },
    handleGenerate () {
      if(this.active==0 && !this.$refs.esign.hasDrew){
        Notify({ type: 'warning', message: '请先手写签名！' });
        return ;
      }else if(this.active==1 && !this.electronicSeal.fileId){
        Notify({ type: 'warning', message: '请先上传签名图片！' });
        return ;
      }
      if(!this.electronicSeal.oldPassWord){
        Notify({ type: 'warning', message: '请输入登录密码！' });
        return ;
      }
      if(!this.electronicSeal.password){
        Notify({ type: 'warning', message: '请输入签章密码！' });
        return ;
      }
      if(!this.electronicSeal.confirmPwd){
        Notify({ type: 'warning', message: '请输入确认密码！' });
        return ;
      }
      if(this.electronicSeal.password != this.electronicSeal.confirmPwd){
        Notify({ type: 'warning', message: '签章密码与确认密码不一致！' });
        return ;
      }
      if(this.active==0){
        this.$refs.esign.generate().then(res => {
          let file  = this.base64ToFile(res,this.getuuid());
          let formData = new FormData();
          formData.append("files",file);
          req.post(req.getContext().portal + "/system/file/v1/fileUpload",formData).then(resp => {
            this.electronicSeal.fileId = resp.data.fileId;
          }).then(()=> {
            req.post(req.getContext().uc + "/uc/electronicSeal/v1/userSave",this.electronicSeal).then(resp => {
              if (resp.data.state){
                Notify({ type: 'success', message: resp.data.message });
                this.getElectronicSeal();
              }else{
                Notify({ type: 'warning', message: resp.data.message });
              }
            })
          })
        }).catch(err => {
          // 画板为空
        })
      }else{
        req.post(req.getContext().uc + "/uc/electronicSeal/v1/userSave",this.electronicSeal).then(resp => {
          if (resp.data.state){
            Notify({ type: 'success', message: resp.data.message });
            this.getElectronicSeal();
          }else{
            Notify({ type: 'warning', message: resp.data.message });
          }
        })
      }
      
    },
    base64ToFile(urlData, fileName) {
      let arr = urlData.split(',');
      let mime = arr[0].match(/:(.*?);/)[1];
      let bytes = atob(arr[1]); // 解码base64
      let n = bytes.length
      let ia = new Uint8Array(n);
      while (n--) {
        ia[n] = bytes.charCodeAt(n);
      }
      return new File([ia], fileName, {type: mime});
    },
    getuuid(){
      // 随机获取值 当作文件名称
      var s = [];
      var hexDigits = '0123456789abcdef';
      for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
      }
      s[14] = '4';
      s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
      s[8] = s[13] = s[18] = s[23] = '-';

      this.uuidA = s.join('');
      return this.uuidA;
    }
  }
}
</script>

<style scoped>
.esign-div{
  background-color: #FFFFFF;
  margin: 10px;
}

.button_group{
  display:flex;
  align-items:center;
  justify-content:center;
}
</style>