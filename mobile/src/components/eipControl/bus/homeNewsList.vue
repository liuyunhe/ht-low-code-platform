<template>
  <div>
        <div  style="height: 3%">
          <div style="height:100%;background: rgb(255, 255, 255); padding:5px 0;">
            <div class="home-new__item" v-for="(it,index) in list" :key="index" @click="openParticulars(it,index)">
              <div>
                <i :class="[it.isRead ? 'icon-read1':'icon-youjian']" style="float:left;font-size: 18px; color: #1989fa;padding-top:2px"></i>
                <span style="float:left;padding-left:8px;font-size:16px;font-family:'Arial Normal', 'Arial';font-weight:400;color:#333;">{{it.title}}</span>
              </div>
              <div style="padding-left:24px;font-size:13px;font-family:'Arial Normal', 'Arial';font-weight:400;color:#368fff;">{{it.drafter}}{{it.createTime ? `| ${it.createTime}`:''}} </div>
            </div>
          </div>
        </div>
    <homeNewsParticulars ref="homeNewsParticulars"  />
  </div>
</template>
<script>
import req from "@/request.js";
import homeNewsParticulars from "@/components/eipControl/bus/homeNewsParticulars.vue";
export default {
  props: {
    classifyId: {
      default: "all"
    }
  },
  components: { homeNewsParticulars},
  data() {
    return {
      list: []
    };
  },
  created() {
    this.init();
  },

  methods: {
    openParticulars(item,index) {
      this.$refs.homeNewsParticulars.openDialog(item.id);
      this.$set(this.list[index],'isRead',true)
      localStorage.newsList = JSON.stringify(this.list)
    }, 
    init() {
      req
        .get(window.context.portal + "/portalNewsNotice/v1/getNews?classifyId="+this.classifyId)
        .then(response => {
          this.list = response.data.map(item=>{
            return {
              ...item,
              isRead:false
            }
          });
         if(localStorage.newsList){
            this.list = JSON.parse(localStorage.newsList)
          }
        });
    }
  }
};
</script>
<style lang="scss" scoped>

/deep/ .home-new__item{
  width: calc(100% - 32px);
  padding:8px 0 8px 16px;
  display: flex;
  flex-direction: column;
}
</style>
