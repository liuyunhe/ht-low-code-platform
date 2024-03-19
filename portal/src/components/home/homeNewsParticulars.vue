<template>
  <el-dialog :visible.sync="dialogVisible" width="80%" :append-to-body="true">
    <el-container>
      <el-header height>
        <el-row>
          <div class="top-left">
            <h2><span v-if="data.titleDescription && data.titleDescription!=''">【{{data.titleDescription}}】</span>{{data.title}}</h2>
          </div>
        </el-row>
        <el-row style="margin-bottom:20px;">
          <div>
            <span style="float:left">
              <label>拟稿人:</label>
              &nbsp;&nbsp;
              <label>{{data.createByName}}</label>
            </span>
            <span style="float:right">
              <label>创建时间：</label>
              <label>{{data.createTime | dateformat('yyyy-MM-dd HH:mm')}}</label>
              &nbsp;&nbsp;
              <label>下架时间：</label>
              <label>{{data.endTime | dateformat('yyyy-MM-dd HH:mm')}}</label>
            </span>
          </div>
        </el-row>
      </el-header>
      <el-main>
        <vue-ueditor-wrap v-model="data.content" :config="config" v-if="data.isUrl=='false'"></vue-ueditor-wrap>
        <div v-if="data.isUrl=='true'">
          <iframe
            ref="iframe"
            :src="data.url"
            style="width:100%;"
            :height="data.pageHeight+'px'"
            frameborder="0"
          ></iframe>
        </div>
        <!-- <ht-file
          v-model="data.file"
          permission="r"
          :column-show="{fileType:false,fileSize:false}"
          :size="100"
          :limit="2"
          :validate="{'required':true}"index
        />-->
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
  props: ["id"],
  data() {
    return {
      dialogVisible: false,
      data: {},
      config:{
				initialFrameHeight: 240,
				UEDITOR_HOME_URL: window.location.origin +'/'+ window.location.pathname.split('/')[1]+'/static/ueditor/',
				toolbars:[],
        elementPathEnabled:false,//是否启用元素路径，默认是true显示　
        wordCount:false,          //是否开启字数统计
				// 初始容器宽度
				initialFrameWidth: "100%",
				zIndex:9999,
				enableAutoSave: false,
				readonly : true
			},
    };
  },
  watch: {
    id: function(val) {
      this.init(val);
    }
  },
  created() {},
  methods: {
    downloadFile(item) {
      req.download("${portal}/system/file/v1/downloadFile?fileId=" + item.id);
    },
    openDialog() {
      this.dialogVisible = true;
    },
    init(id) {
      req
        .get(
          window.context.portal + "/portalNewsNotice/v1/getNewsById?id=" + id
        )
        .then(response => {
          //  if(response.data.file){
          //    let file=JSON.parse(response.data.file);
          //    let newFile=[];
          //    for(let x=0;x<file.length;x++){
          //      newFile.push({fileId:file[x].id,fileName:file[x].name,size:file[x].size});
          //    }
          //    response.data.file=JSON.stringify(newFile);
          //  }
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
