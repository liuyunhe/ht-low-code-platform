<template>
  <div >
      <img :src="src" :style="style" />
  </div>
</template>
<script>
import req from "@/request.js";
export default {
  name: "eip-img",
  props:["isDisplay","imgSrc","fileJson","imgHeight","imgWidth"],
  data() {
    return {
       src:"",
       style:{}
    };
  },
  created() {
    if(this.isDisplay){
      if(this.fileJson){
        var json=JSON.parse(this.fileJson);
        req.get(window.context.portal + "/file/onlinePreviewController/v1/getFileById_" + json[0].id,'arraybuffer').then(response=>{
          let type = response.headers['content-type'];
          if(type){
            this.src = window.URL.createObjectURL(new Blob([response.data], { type: type}));
          }else{
            this.src = window.URL.createObjectURL(new Blob([response.data]));
          }
        });
      }
    }else{
      this.src=this.imgSrc;
    }
    if(this.imgHeight>0&&this.imgWidth>0){
      this.style={height:this.imgHeight+"px",width:this.imgWidth+"px"};
    }
  }
};
</script>
<style lang="stylus" scoped>
div[aria-invalid='true'] >>> .el-input__inner, div[aria-invalid='true'] >>> .el-input__inner:focus {
  border-color: #f56c6c;
}
</style>