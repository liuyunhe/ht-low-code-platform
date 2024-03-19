<template>
    <div>
    <van-pull-refresh v-model="isLoading" @refresh="onRefresh">
    <div class="tab-bar" v-if="JSON.stringify(curUser)!='{}'">
      <div class="title-divider">用户信息</div>
      <div style="text-align: center;">
        <img :src="userPhoto" style="width:100px; height:100px;  border-radius:50%;" />
      </div>
      <van-field label="用户名称" :value="curUser.user.fullname" readonly />
      <van-field label="用户账号" :value="curUser.user.account" readonly />
      <van-field label="手机号码" :value="curUser.user.mobile" readonly />
      <van-field label="邮箱地址" :value="curUser.user.email" readonly />
      <van-field label="用户性别" :value="curUser.user.sex" readonly />
      <van-field label="用户状态" :value="curUser.user.status == '1'?'正常':curUser.user.status == '0'?'禁用':curUser.user.status == '-1'?'未激活':'离职'" readonly />
      <van-field label="家庭地址" :value="curUser.user.address" readonly />
      <div class="title-divider">所属角色</div>
      <div style="padding-bottom: 8px;">
        <van-field readonly >
          <template #input>
            <span v-if="curUser.role.length>0" >
              <van-tag style="margin-top: 8px;margin-left: 10px;" v-for="roleName in curUser.role" :key="roleName" type="primary" >{{roleName}}</van-tag></span>
            <span v-if="curUser.role.roleName==''"><van-tag type="danger" style="margin-top: 8px;margin-left: 10px;">无角色信息</van-tag></span>
          </template>
        </van-field>
      </div>
      <div class="title-divider">所属岗位</div> 
      <div style="padding-bottom: 8px;">
        <van-field readonly >
          <template #input>
            <span v-if="JSON.stringify(curUser.post) != '{}'" >
              <van-tag style="margin-top: 8px;margin-left: 10px;" :key="post.postId" v-for="post in curUser.post" type="primary">{{post.postName}}</van-tag></span>
            <span v-if="JSON.stringify(curUser.post) == '{}'"><van-tag type="danger" style="margin-top: 8px;margin-left: 10px;">无岗位信息</van-tag></span>
          </template>
        </van-field>
      </div>
      <div class="title-divider">所属组织</div> 
      <div style="padding-bottom: 8px;">
        <van-field readonly >
          <template #input>
            <span v-if="JSON.stringify(curUser.org) != '{}'" >
              <van-tag style="margin-top: 8px;margin-left: 10px;" :key="org.orgId" v-for="org in curUser.org" type="primary">{{org.orgName}}</van-tag></span>
            <span v-if="JSON.stringify(curUser.org) == '{}'"><van-tag type="danger" style="margin-top: 8px;margin-left: 10px;">无组织信息</van-tag></span>
          </template>
        </van-field>
      </div>
      <div class="title-divider">电子签章</div>
      <div style="padding-bottom: 8px;" class="electronic">
        <van-cell is-link to="canvas">
          <template #title>
            <van-image :src="electronicSealFileUrl" height="50"/>
          </template>
        </van-cell>
      </div>
      <div v-if="showUpdate" class="title-divider">软件更新</div> 
      <div v-if="showUpdate" style="background-color: #fff;">
        <van-button type="primary" size="small" @click="appUpdate()" style="margin: 8px 20px;" round> 检查更新 </van-button>
      </div>
      <div class="exit-div" >
        <van-button type="danger" @click="exit" size="normal" block>退出</van-button>
      </div>
    </div>
    <tabBar :activeIndex="3"></tabBar>
    </van-pull-refresh>
  </div>
</template>

<script>
import req from "@/request";

const tabBar = () => import("@/components/tabbar/TabBar.vue");
import utils from "@/utils.js";
import { mapState, mapActions } from "vuex";
import { Field,pullRefresh,Button } from "vant";
export default {
  name: "personal",
  data() {
    return {
      isLoading:false,
      userPhoto: require("@/assets/img/defaultPhoto.jpg"),
      curUser:{},
      showUpdate: window.plus?true:false,
      electronicSeal: {},
      electronicSealFileUrl: ""

    };
  },
  components:{tabBar,[Field.name]: Field,[Button.name]: Button,[pullRefresh.name]: pullRefresh,},
  computed: mapState({
    // postMap: state => state.user.postMap || {},
    currentUser: state => {
      return state.login.currentUser ? state.login.currentUser : {};
    },
    // curUser: state => state.user.currentUserDetail || {},
    // curOrg: state => state.user.currentOrgDetail || {}
  }),
  mounted(){
     this.getUserData()
  },
  methods: {
    getUserData(){
       this.$route.path !== "/" &&
      this.$store.dispatch("user/loadCurrentUserDetail").then(data => {
        this.curUser = data;
        if (data) {
          var promise = this.$store.dispatch("user/getCurrent");
          promise.then(data => {
            if (data.photo && data.photo.indexOf('img/defaultPhoto')<0) {
              this.$store.dispatch("menu/downloadImg",data.photo).then(res => {
                if(res!=""){
                  this.userPhoto=res;
                }
              });
            }
          });
          req.get(window.context.uc + '/uc/electronicSeal/v1/getSealByCurrentUserId').then(response => {
            if (response.data){
              this.electronicSeal = response.data;
              this.$store
                  .dispatch("menu/downloadImg", this.electronicSeal.fileId)
                  .then(res => {
                    if (res != "") {
                      this.electronicSealFileUrl = res;
                    }
                  });
            }
          })
        }
      }).finally(()=>{
        this.isLoading = false
      });
    },
    //退出登陆
    exit(){
       let loginRouthPath =  localStorage.getItem(this.$store.state.login.currentUser.account + "loginRoutePath") || "/login";
       this.$store.dispatch("login/logoutAndCleanUp").then(()=>{
        this.postMessage();
        utils.releaseWakeLock();
        this.$router.push(loginRouthPath);
       })
    },
    postMessage(){
      window.uni && uni.postMessage({
            data: {
                action: 'logout'
            }
        });
    },
    appUpdate(){
      utils.appUpdate(true);
    },
    onRefresh(){
      this.getUserData()
    }
  },
}
</script>
<style lang="scss" scoped>
div>>>.van-cell:not(:last-child)::after {
    position: absolute;
    box-sizing: border-box;
    content: ' ';
    pointer-events: none;
    right: 0;
    bottom: 0;
    left: 0px !important;
    border-bottom: 1px solid #ebedf0;
    -webkit-transform: scaleY(.5);
    transform: scaleY(.5);
}
div>>>.van-field__label {
  color:rgba(0,0,0,1);
  -webkit-box-flex: 0;
  -webkit-flex: none;
  flex: none;
  box-sizing: border-box;
  width: 80px;
}
.title-divider{
    margin: 0;
    padding: 10px 10px 10px;
    color: rgba(69, 90, 100, 0.6);
    font-weight: normal;
    font-size: 14px;
    line-height: 16px;
    background: #F7F8FA;
}
.exit-div{
  padding: 30px 10px;
}
.electronic >>> .van-cell{
  padding: 2px;
}
.electronic >>> .van-cell__right-icon {
  line-height: 50px;
}
/deep/.van-image__error, .van-image__loading{
  display: none;
}
</style>
