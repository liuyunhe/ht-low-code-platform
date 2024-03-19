<template>
  <div class="tab-bar" style="height: 55px">
     <van-tabbar v-model="active" @change="onChange" z-index="99">
      <van-tabbar-item icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item icon="bullhorn-o" v-if="msgbadge > 0" :badge="msgbadge"
        >消息</van-tabbar-item
      >
      <van-tabbar-item icon="bullhorn-o" v-if="msgbadge == 0"
        >消息</van-tabbar-item
      >
      <van-tabbar-item icon="wap-nav">工作台</van-tabbar-item>
      <van-tabbar-item icon="setting-o">我的</van-tabbar-item>
    </van-tabbar>

    <fdButton
      @onFloatBtnClicked="onFloatBtnClicked"
      :badgeValue="notifyListCount"
    >
    </fdButton>
  </div>
</template>

<script>
import {Tabbar, TabbarItem} from 'vant'
import fdButton from '@/components/fdButton'
export default {
  components: {
    [Tabbar.name]: Tabbar,
    [TabbarItem.name]: TabbarItem,
    fdButton,
  },
  props: ['activeIndex'],
  data() {
    return {
      active: this.activeIndex,
      msgbadge: 0,
      notifyListCount: 0,
    }
  },
  mounted() {
    this.refreshMsgbadge()
    this.get_notice_list_count()
  },
  methods: {
    onChange(event) {
      switch (this.active) {
        case 0:
          this.$router.push('/home')
          break
        case 1:
          this.$router.push('/messageReceiverList')
          break
        case 2:
          this.$router.push('/work')
          break
        case 3:
          this.$router.push('/personal')
          break
        default:
          this.$router.push('/home')
          break
      }
    },
    refreshMsgbadge() {
      let _this = this
      this.$http.get('${portal}/innermsg/messageReceiver/v1/getMsgbadge').then(
        (response) => {
          if (response.data.state) {
            _this.msgbadge = response.data.value
          }
        },
        (error) => {}
      )
    },
    // yigz:2022-06-30:获取提醒消息数
    get_notice_list_count() {
      this.$store.dispatch('form/getFormRemindDataByUser').then((data) => {
        if (data) {
          this.notifyListCount = 0
          this.notifyListCount = data.length
        }
      })
    },
    // yigz:2022-07-04:悬浮窗点击
    onFloatBtnClicked() {
      this.$router.push('/messageRemindList')
    },
  },
}
</script>