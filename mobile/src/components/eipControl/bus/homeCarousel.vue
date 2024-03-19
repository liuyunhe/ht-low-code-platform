<template>
  <div class="swipper-wrap">
    <el-carousel  :interval="interval" v-loading="loading">
      <el-carousel-item v-for="item in list" :key="item.id" style="text-align: center;">
        <div class="swipper-title">{{item.title}}</div>
        <img :src="item.imgUrl" @click="openParticulars(item.id)" style="max-width: 100%;max-height: 100%;"/>
      </el-carousel-item>
      
    </el-carousel>
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
    },
    height: { String },
    interval:{
      default: 3000
    },
  },
  components: { homeNewsParticulars },
  data() {
    return {
      loading:false,
      list: [],
    };
  },
  created() {
    this.init();
  },
  methods: {
    openParticulars(id) {
      this.$refs.homeNewsParticulars.openDialog(id);
    },
    getImg(id){
      return new Promise((resolve, reject) => {
        req.get(window.context.portal + "/system/file/v1/preview?fileId=" + id, "blob").then(response => {
                  if (response.data.size > 0) {
                    var blob = response.data;
                    var reader = new FileReader();
                    reader.readAsDataURL(blob);
                    reader.onload = function (e) {
                      resolve(e.target.result);
                    };
                  } else {
                    resolve("");
                  }
                },
                function errorCallback(response) {
                  resolve("")
                }
        );
      });

    },
    getList(){
      return new Promise((resolve, reject) => {
        req.get(window.context.portal +"/portalNewsNotice/v1/getNews?classifyId=" +this.classifyId)
                .then(response => {
                  resolve(response.data);
                })
      });
    },
    async init(){
      this.loading=true;
      let list=await this.getList();
      for (let i = 0; i <list.length ; i++) {
        let img=await this.getImg(list[i].rotatingDisplayPictures);
        list[i].imgUrl=img;
      }
      this.list=list;
      this.loading=false;
      this.$forceUpdate()
    }
  }
};
</script>
<style lang="scss" scoped>
.swipper-title{
  position: absolute;
    bottom: 28px;
    color: #fff;
    width: 100%;
    background: rgba(11,11,11,0.58);
    height: 18px;
    padding-top: 12px;
}
/deep/.el-carousel__indicators--horizontal{
  width: 100%;
  height: 28px;
  background: rgba(11,11,11,0.58);
  display: flex;
  justify-content: center;
  .el-carousel__indicator--horizontal{
      .el-carousel__button{
        height: 8px;
      }
    }
}
</style>
