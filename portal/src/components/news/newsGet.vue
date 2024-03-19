<template>
  <el-container>
    <el-header height>
      <el-row>
        <div class="top-left">
          <h2 v-text="filesData.fbt"></h2>
        </div>
        <div class="top-right">
          <el-button
            @click="back"
            style="margin-top :8px;"
            plain
            size="small"
            type="danger"
            icon="el-icon-back"
          >返回</el-button>
        </div>
      </el-row>
      <el-row style="margin-bottom:20px;">
        <div>
          <span style="float:left">
            <label>发起人:</label>
            &nbsp;&nbsp;
            <label>{{filesData.fzz}}</label>
          </span>
          <span style="float:right">
            <label>开始时间：</label>
            <label>{{filesData.fkssj | dateformat('YYYY-MM-DD')}}</label>
            &nbsp;&nbsp;
            <label>结束时间：</label>
            <label>{{filesData.fjssj | dateformat('YYYY-MM-DD')}}</label>
          </span>
        </div>
      </el-row>
    </el-header>
    <el-main>
      <el-row v-html="filesData.fnr" class="content"></el-row>
      <el-row v-if="filesData.ffj.length!=0" class="folder">
        <label class="foots">
          <i class="el-icon-document"></i>
          &nbsp;共有{{filesData.ffj.length}}个附件
        </label>
        <br />
        <el-table :data="filesList" border style="width: 100%;margin-top :10px;" size="medium">
          <el-table-column label="序号" align="center" type="index" width="70"></el-table-column>
          <el-table-column label="附件名称" align="center">
            <template slot-scope="scope">
              <span class="done-subject" @click="search(scope.row)">{{scope.row.name}}</span>
            </template>
          </el-table-column>
          <el-table-column prop="type" align="center" lalign="center" width="100" label="附件类型"></el-table-column>
          <el-table-column prop="bytes" align="center" lalign="center" width="100" label="附件大小"></el-table-column>
          <el-table-column prop="username" align="center" label="上传者" width="120"></el-table-column>
          <el-table-column align="center" label="操作" width="100">
            <template slot-scope="scope">
              <el-button
                @click="downloadFile(scope.row)"
                size="small"
                icon="el-icon-download"
                plain
              ></el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-row>
    </el-main>
    <!-- 预览压缩文件-->
    <FilePreview ref="filePreview" />
  </el-container>
</template>

<script>
import { mapState, mapActions } from "vuex";
import req from "@/request.js";
import utils from "@/utils.js";
import { Message } from "element-ui";
import FilePreview from "@/components/common/FilePreview.vue";
export default {
  props: ["newsId"],
  name: "newsGet",
  components: { FilePreview },
  data() {
    return {
      src: "",
      fileId: "",
      fileTree: "",
      filesList: [],
      data: []
    };
  },
  computed: mapState({
    filesData: state => state.menu.filesData
  }),
  mounted() {
    setTimeout(() => {
      if (this.$store.state.menu.filesData) {
        this.data = [...this.$store.state.menu.filesData.ffj];
        if (this.data) {
          for (let i = 0; i < this.data.length; i++) {
            this.filesList.push({
              id: this.data[i].id,
              name: this.data[i].name,
              size: this.data[i].size,
              type: utils.substringType(this.data[i].name, "."),
              bytes: utils.bigDecimal(this.data[i].size),
              username: this.data[i].username
            });
          }
        }
      }
    }, 300);
  },
  methods: {
    //返回列表
    back() {
      this.$router.go(-1); //返回上一层
    },
    //附件下载
    download(fileRow){
      req.download("${portal}/system/file/v1/downloadFile?fileId=" +  fileRow.id);
    },
    //查看附件
    search(fileData) {
      let obj = {};
      obj.id=fileData.id;
      obj.name=fileData.name;
      obj.size=fileData.size;
      this.$refs.filePreview.preview(obj);
    }
  },
  created() {
    this.$store.dispatch("menu/getNewsById", this.newsId);
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
  border: 1px solid #E7EAEC;
}

.el-row {
  margin-top: 10px;
}

.el-main {
  border-bottom: 1px solid #E7EAEC;
}

.content {
  margin-bottom: 30px;
}

.folder {
  border-top: 1px solid #E7EAEC;
}

.foots {
  line-height: 40px;
}

.el-card {
  width: 300px;
  margin-top: 20px;
}

.fonts {
  color: #4EC1C3;
  margin-left: 10px;
}

.footed {
  float: right;
  margin-top: 10px;
}

.top-left {
  float: left;
  display: inline-block;
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


