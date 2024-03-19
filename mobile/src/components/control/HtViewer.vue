<template>
  <div>
    <el-card class="pic-card" :body-style="{ padding: '0px', margin: '10px', cursor: 'pointer' }">
      <div slot="header">
        <el-tooltip class="item" effect="dark" content="图片格式：png 图片尺寸：250*70px" placement="bottom" v-if="isIndexPic">
          <el-upload
            accept=".png,.PNG"
            class="upload-demo"
            :action="actionUrl"
            :headers="header"
            name="files"
            :show-file-list="false"
            :on-success="success"
            :on-progress="progress"
            :before-upload="beforeAvatarUpload"
            :multiple="false"
            :limit="10"
            :on-exceed="handleExceed"
          >
            <el-button circle icon="el-icon-upload2" title="上传"></el-button>
          </el-upload>
        </el-tooltip>
        <el-upload
                accept=".png,.PNG"
                class="upload-demo"
                :action="actionUrl"
                name="files"
                :headers="header"
                :show-file-list="false"
                :on-success="success"
                :on-progress="progress"
                :before-upload="beforeAvatarUpload"
                :multiple="false"
                :limit="10"
                :on-exceed="handleExceed"
                v-if="!isIndexPic"
        >
          <el-button circle icon="el-icon-upload2" title="上传"></el-button>
        </el-upload>
        <el-button
          icon="el-icon-delete"
          circle
          style="margin-left:10px;"
          @click="remove()"
          title="移除"
        ></el-button>
        <!-- </el-row> -->
      </div>
      <el-collapse-transition>
        <img :src="picture" :style="style" v-show="showPicture && value" />
      </el-collapse-transition>
    </el-card>
   
  </div>
</template>
<script>
import req from "@/request.js";
import { mapState } from "vuex";
import { Loading } from "element-ui";
import hotentUtils from "@/hotent-ui-util.js";
import { Notify,Dialog  } from 'vant';
export default {
  name: "ht-viewer",
  props: ["value", "imgHeight", "imgWidth","isIndexPic"],
  components: {Notify },
  data() {
    return {
      httpsFile: { fileName: "", url: "" },
      dialogFormVisible: false,
      showPicture: false,
      openPicture: false,
      style: {
        width: "265px",
        height: "180px",
        borderRadius: "3px",
        padding: "1px",
        margin: "1px",
        cursor: "pointer",
      },
      imgArr: [],
      options: {
        inline: false,
        button: true,
        navbar: true,
        title: false,
        toolbar: true,
        tooltip: true,
        movable: true,
        zoomable: true,
        rotatable: true,
        scalable: true,
        transition: true,
        fullscreen: true,
        keyboard: true,
        url: "data-source",
      },
      picture: ""
    };
  },
  computed: mapState({
    header: (state) => {
      return { Authorization: `Bearer ${state.login.currentUser.token}` };
    },
    actionUrl: function () {
      return req.getContext().portal + "/system/file/v1/fileUpload";
    },
  }),
  mounted() {
    if (this.imgHeight > 0 && this.imgWidth > 0) {
      this.style = {
        height: this.imgHeight + "px",
        width: this.imgWidth + "px",
      };
    }
     this.$store
      .dispatch("menu/downloadImg", this.value)
      .then(res => {
        if (res != "") {
          this.picture = res;
          this.showPicture = true;
        }
      });
  },
  created() {
    this.$validator = this.$root.$validator;
  },
  methods: {
    handleExceed(files, fileList) {
      // this.$message.warning(`上传图片前，先删除原有图片`);
    },
    progress() {
      Loading.service("文件上传中");
    },
    //文件上传成功时
    success(response, file, fileList) {
      let loadingInstance = Loading.service("文件上传中");
      const this_ = this;
       this.$store
                  .dispatch("menu/downloadImg", response.fileId)
                  .then(res => {
                    if (res != "") {
                      this.picture = res;
                    }
                  });
      setTimeout(function () {
        this_.$emit("input", response.fileId);
        this_.showPicture = true;
        // 以服务的方式调用的 Loading 需要异步关闭
        loadingInstance.close();
      }, 1000);
    },
    beforeAvatarUpload(file) {
      var FileExt = file.name.replace(/.+\./, "");
      if (
        [ "png"].indexOf(FileExt.toLowerCase()) ===
        -1
      ) {
        Notify({ type: 'warning', message: '请上传后缀名为png类型的图片！' });
        return false;
      }
    },
    remove() {
      if (!this.value) {
        return;
      }
      Dialog.confirm({
        title: "提示",
        message: "确定要删除吗?",
        type: "warning",
      }).then(() => {
        this.$emit("input", "");
        //签章附件不能删除，会导致已签章表单无法找到旧的签章附件
          // if (this.value) {
          //   req
          //     .post(
          //       req.getContext().portal +
          //         "/system/file/v1/remove" ,
          //         this.value
          //     )
          //     .then((r) => {
          //       this.$emit("input", "");
          //     });
          // }
        }).catch(() => {});
    },
  },
};
</script>
<style scoped>
* {
  padding: 0;
  margin: 0;
}
ul {
  display: flex;
  flex-wrap: wrap;
}
ul li {
  list-style: none;
}
.upload-demo {
  display: inline-block;
}
.pic-card >>> .el-card__header {
  padding-top: 5px;
  padding-bottom: 5px;
}
</style>
