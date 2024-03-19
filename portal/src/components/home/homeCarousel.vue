<template>
  <div>
    <el-carousel  :interval="interval" v-loading="loading" >
      <el-carousel-item v-for="item in list" :key="item.id" style="text-align: center;">
        <img :src="item.imgUrl" @click="openParticulars(item.id)" style="max-width: 100%;max-height: 100%;"/>
      </el-carousel-item>
    </el-carousel>
    <homeNewsParticulars ref="homeNewsParticulars" :id="selectId" />
  </div>
</template>
<script>
import req from "@/request.js";
import homeNewsParticulars from "@/components/home/homeNewsParticulars.vue";

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
      selectId: null
    };
  },
  created() {
    this.init();
  },
  methods: {
    openParticulars(id) {
      this.selectId = id;
      this.$refs.homeNewsParticulars.openDialog();
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
