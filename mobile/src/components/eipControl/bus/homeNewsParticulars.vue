<template>
  <el-dialog :visible.sync="dialogVisible" fullscreen :append-to-body="true" :destroy-on-close="true">
    <el-container>
      <el-header height>
        <el-row>
          <div class="top-left">
            <h2 style="font-size: 15px">{{data.title}}</h2>
          </div>
        </el-row>
        <el-row style="margin-bottom:20px;">
          <div  style="text-align: center">
            <span>
              <label>拟稿人:</label>&nbsp;
              <label>{{data.createByName}}</label>&nbsp;
              <label>创建时间：</label>
              <label>{{data.createTime | dateformat('yyyy-MM-dd HH:mm')}}</label>
            </span>
          </div>
        </el-row>
      </el-header>
      <el-main>
        <el-row v-if="data.isUrl=='false'" v-html="data.content" class="content"></el-row>
        <div v-if="data.isUrl=='true'">
          <iframe
            ref="iframe"
            :src="data.url"
            style="width:100%;"
            :height="data.pageHeight+'px'"
            frameborder="0"
          ></iframe>
        </div>
        <el-row v-if="data.file">
          <span style="font-size: 15px;font-weight: bold;">附件:</span>
          <div v-for="(item,i) in JSON.parse(data.file)" :key="i">
            <div>
              <el-tag  @click="downloadFile(item)">{{item.name}}</el-tag>
            </div>
          </div>
        </el-row>
      </el-main>
    </el-container>
  </el-dialog>
</template>
<script>
import EipAttachment from "@/components/eipControl/EipAttachment.vue";
import req from "@/request.js";
export default {
  components: { EipAttachment },
  data() {
    return {
      dialogVisible: false,

      data: {}
    };
  },
  created() {},
  methods: {
    downloadFile(item) {
      req.download("${portal}/system/file/v1/downloadFile?fileId=" + item.id);
    },
    openDialog(id) {
      this.dialogVisible = true;
      this.init(id);
    },
    init(id) {
      req
        .get(
          window.context.portal + "/portalNewsNotice/v1/getNewsById?id=" + id
        )
        .then(response => {
          if (
            response.data.rotatingDisplayPictures &&
            response.data.type == 1
          ) {
            response.data.imgUrl =
              window.context.portal +
              "/system/file/v1/downloadFile?fileId=" +
              response.data.rotatingDisplayPictures;
          }
          this.data = response.data;
        });
    }
  }
};
</script>
<style lang="scss" scoped>
@import "@/assets/css/element-variables.scss";
.el-container {
  background-color: #fff;
}

.el-header {
  padding-top: 10px;
  border: 1px solid #e7eaec;
}

.el-row {
  margin-top: 10px;
}

.el-main {
  border-bottom: 1px solid #e7eaec;
}

.content {
  margin-bottom: 30px;
}

.folder {
  border-top: 1px solid #e7eaec;
}

.foots {
  line-height: 40px;
}

.el-card {
  width: 300px;
  margin-top: 20px;
}

.fonts {
  color: #4ec1c3;
  margin-left: 10px;
}

.footed {
  float: right;
  margin-top: 10px;
}

.top-left {
  text-align: center;
}

.top-right {
  float: right;
  display: inline-block;
}

.files {
  cursor: pointer;
  font-size: 12px;
  color: #5eade6;
}

.files:hover {
  color: $--theme-color;
}

.fj_left {
  padding: 0 15px;
  border-left: 1px solid #d8d8d8;
}

.fj_right {
  padding: 0 15px 0 0;
}

.done-subject {
  cursor: pointer;
}

.done-subject {
  color: $--theme-color;
}
</style>
