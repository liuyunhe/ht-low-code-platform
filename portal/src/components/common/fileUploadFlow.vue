<template>
  <div>
    <el-upload
      class="upload-demo"
      :action="actionUrl"
      :file-list="files"
      :headers="header"
      :show-file-list="false"
      :before-remove="beforeRemove"
      :accept="acceptType"
      :on-preview="preview"
      :limit="intLimit"
      :multiple="multiples"
      :on-success="success"
      :on-progress="progress"
      :before-upload="beforeAvatarUpload"
    >
      <el-tooltip placement="right" effect="light">
        <div slot="content">
          附件格式支持：{{accept}}
          <br />附件大小限制：单个文件不超过50MB
          <br />
          <span v-if="multiples">附件个数限制：最多{{intLimit}}个</span>
        </div>
        <el-button size="mini" round icon="el-icon-plus">上传</el-button>
      </el-tooltip>
    </el-upload>
    <el-table
      v-if="filesData.length>0 && !isSimple"
      :data="filesData"
      border
      :style="'width:'+maxWidth+'px ;margin-top :10px;'"
      size="medium"
    >
      <el-table-column label="序号" align="center" type="index" width="70"></el-table-column>
      <el-table-column label="附件名称" min-width="200" align="center">
        <template slot-scope="scope">
          <span class="done-subject" @click="preview(scope.row)">{{scope.row.name}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="type" align="center" lalign="center" width="100" label="附件类型"></el-table-column>
      <el-table-column prop="bytes" align="center" lalign="center" width="100" label="附件大小"></el-table-column>
      <el-table-column prop="username" align="center" label="上传者" width="120"></el-table-column>

      <el-table-column
        :label="con.desc"
        v-for="con in conf"
        :key="con.name"
        width="200"
        align="center"
      >
        <template slot-scope="scope">
          <el-tooltip :disabled="!errors.has('custom-form.'+files[scope.$index].name+' '+con.desc)">
            <div slot="content">必填</div>
            <el-input
              size="small"
              :name="files[scope.$index].name+' '+con.desc"
              v-model="files[scope.$index][con.name]"
              v-validate="con.inputValidate"
              clearable
              :placeholder="'请输入'+con.desc"
            ></el-input>
          </el-tooltip>
        </template>
      </el-table-column>

      <el-table-column align="center" label="操作" width="260">
        <template slot-scope="scope">
          <el-button @click="up(scope.$index)" size="small" icon="el-icon-arrow-up" plain></el-button>
          <el-button @click="down(scope.$index)" size="small" icon="el-icon-arrow-down" plain></el-button>
          <el-button @click="download(scope.row)" size="small" icon="el-icon-download" plain></el-button>
          <el-button
            @click="beforeRemove(scope.row)"
            type="danger"
            size="small"
            icon="el-icon-delete"
            plain
          ></el-button>
        </template>
      </el-table-column>
    </el-table>
    <ul v-else class="file-list__wrap">
      <li v-for="(file,index) in filesData" :key="index" class="file-item" style="white-space:nowrap;">
        <i class=" file-icon el-icon-document"></i>
        <p  class="file__name" :class="{'done-subject': previewable}" @click="preview(file)">{{file.name}}</p>
        <i class="file-close__icon el-icon-close" @click="removeFile(file)"></i>
        </li>
    </ul>
    <!-- 预览附件-->
    <FilePreview ref="filePreview" />
  </div>
</template>

<script>
import { mapState } from "vuex";
import req from "@/request.js";
import utils from "@/utils.js";
import FilePreview from "@/components/common/FilePreview.vue";
import { Loading } from "element-ui";
export default {
  props: ["fileVal", "multiples", "accept", "limit", "conf","isSimple"],
  components: { FilePreview },
  data() {
    return {
      src: "",
      files: [],
      fileId: "",
      fileTree: "",
      isChecking: true,
      num: 0,
      list: [],
      filesData: [],
      maxWidth: "100%"
    };
  },
  computed: mapState({
    header: state => {
      return { Authorization: `Bearer ${state.login.currentUser.token}` };
    },
    intLimit: function() {
      if (!this.multiples) return 1;
      return this.limit ? parseInt(this.limit) : 5;
    },
    actionUrl: function() {
      return window.context.portal + "/system/file/v1/upload";
    },
    acceptType: function() {
      if (!this.accept) {
        return "";
      }
      let acceptTypeArr = [];
      for (let i = 0, type; (type = this.accept.split(",")[i++]); ) {
        acceptTypeArr.push("." + type);
      }
      return acceptTypeArr.join(",");
    }
  }),
  watch: {
    files: {
      handler(newVal, oldVal) {
        this.$emit("input", JSON.stringify(newVal));
      },
      deep: true
    }
  },
  methods: {
    //附件下载
    download(file) {
      this.$store.dispatch("menu/downloadFile", file.id);
    },
    //上移按钮
    up(idx) {
      idx = Number.parseInt(idx);
      if (idx < 1) {
        return;
      }
      //table数据改变
      var t = this.filesData[idx - 1];
      this.$set(this.filesData, idx - 1, this.filesData[idx]);
      this.$set(this.filesData, idx, t);

      //boData数据也跟着改变
      var t = this.files[idx - 1];
      this.$set(this.files, idx - 1, this.files[idx]);
      this.$set(this.files, idx, t);
      this.$emit("input", JSON.stringify(this.files));
    },
    //下移按钮
    down(idx) {
      idx = Number.parseInt(idx);
      if (idx >= this.filesData.length - 1) {
        return;
      }
      //table数据改变
      var t = this.filesData[idx + 1];
      this.$set(this.filesData, idx + 1, this.filesData[idx]);
      this.$set(this.filesData, idx, t);

      //boData数据也跟着改变
      var t = this.files[idx + 1];
      this.$set(this.files, idx + 1, this.files[idx]);
      this.$set(this.files, idx, t);
      this.$emit("input", JSON.stringify(this.files));
    },
    preview(files) {
      let obj = {};
      obj.id=files.id;
      obj.name=files.name;
      obj.size=files.size;
      this.$refs.filePreview.preview(obj);
    },
    beforeRemove(file) {
      if (this.isChecking) {
        return this.$confirm(`确定移除 ${file.name}？`).then(() => {
          this.num = 0;
          let value = {};
          if (file.response) {
            value = JSON.parse(file.response.value);
          } else {
            value = file;
            value.fileId = file.id;
          }
          for (var i = 0; i < this.files.length; i++) {
            if (this.files[i].id == value.fileId) {
              this.files.splice(i, 1); //删除数组某一项
            }
          }
          if (JSON.stringify(this.files) == "[]") {
            this.filesData = [];
            this.$emit("input", "");
          } else {
            this.filesData = [];
            for (let i = 0; i < this.files.length; i++) {
              this.filesData.push({
                id: this.files[i].id,
                name: this.files[i].name,
                size: this.files[i].size,
                type: utils.substringType(this.files[i].name, "."),
                bytes: utils.bigDecimal(this.files[i].size),
                username: this.files[i].username
              });
            }
            this.$emit("input", JSON.stringify(this.files));
          }
        });
      } else {
        this.num = 0;
        let value = {};
        if (file.response) {
          value = JSON.parse(file.response.value);
        } else {
          value = file;
          value.fileId = file.id;
        }
        for (var i = 0; i < this.files.length; i++) {
          if (this.files[i].id == value.fileId) {
            this.files.splice(i, 1); //删除数组某一项
          }
        }
        if (JSON.stringify(this.files) == "[]") {
          this.filesData = [];
          this.$emit("input", "");
        } else {
          this.filesData = [];
          for (let i = 0; i < this.files.length; i++) {
            this.filesData.push({
              id: this.files[i].id,
              name: this.files[i].name,
              size: this.files[i].size,
              type: utils.substringType(this.files[i].name, "."),
              bytes: utils.bigDecimal(this.files[i].size),
              username: this.files[i].username
            });
          }
          this.$emit("input", JSON.stringify(this.files));
        }
      }
    },
    //文件上传时
    progress(event, file, fileList) {
      Loading.service("文件上传中");
    },
    //文件上传成功时
    success(response, file, fileList) {
      let loadingInstance = Loading.service("文件上传中");
      this.$nextTick(() => {
        // 以服务的方式调用的 Loading 需要异步关闭
        loadingInstance.close();
      });
      if (this.num == 0) {
        this.list = [];
        for (let i = 0; i < fileList.length; i++) {
          this.list.push(fileList[i]);
        }
      }
      this.num = this.num + 1;
      for (let j = 0; j < this.list.length; j++) {
        if (!this.list[j].raw) {
          for (let i = 0; i < fileList.length; i++) {
            if (this.list[j].name == fileList[i].name) {
              fileList.splice(i, 1);
              break;
            }
          }
        }
      }
      if (this.num == fileList.length) {
        for (let i = 0; i < fileList.length; i++) {
          if (fileList[i].response) {
            let value = JSON.parse(fileList[i].response.value);
            let arrarFile = {};
            arrarFile.id = value.fileId;
            arrarFile.name = value.fileName;
            arrarFile.size = value.size;
            arrarFile.username = JSON.parse(
              sessionStorage.getItem("currentUser")
            ).username;
            this.files.push(arrarFile);
          }
        }
        this.filesData = [];
        for (let i = 0; i < this.files.length; i++) {
          this.filesData.push({
            id: this.files[i].id,
            name: this.files[i].name,
            size: this.files[i].size,
            type: utils.substringType(this.files[i].name, "."),
            bytes: utils.bigDecimal(this.files[i].size),
            username: this.files[i].username
          });
        }
        this.$emit("input", JSON.stringify(this.files));
      }
    },
    // handleChange(file, fileList) {
    //   debugger
    //   if(file.status=="success"){
    //     let value = JSON.parse(file.response.value);
    //     let arrarFile = {};
    //     arrarFile.id = value.fileId;
    //     arrarFile.name = value.fileName;
    //     arrarFile.size = value.size;
    //     this.files.push(arrarFile);
    //     this.$emit("input", JSON.stringify(this.files));
    //   }
    //  },
    getFiles() {
      if (this.files.length == 0) {
        return "";
      } else {
        return this.files;
      }
    },
    beforeAvatarUpload(file) {
      // 文件类型限制
      const name = file.name ? file.name : "";
      const ext = name
        ? name.substr(name.lastIndexOf(".") + 1, name.length)
        : true;
      const isExt = this.accept.indexOf(ext) < 0;
      this.isChecking = !isExt;
      if (isExt) {
        if (this.accept == "false") {
          this.$message.error("请配置可上传文件的格式!");
        } else {
          this.$message.error("上传的附件只能是 " + this.accept + "格式!");
        }
        return !isExt;
      }
    }
  },
  // mounted() {
  //   let _this = this;
  //   debugger
  //   //监听表单提交事件，如果附件上传配置了扩展属性则进行更新
  //   if (this.conf && this.conf.length>0) {
  //     this.$root.$on('bpmFormSubmit', function(value) {
  //       debugger
  //       _this.$store.dispatch("menu/updateFileExtraProp",_this.files);
  //     });
  //   }
  // },
  created() {
    this.$nextTick(function() {
      this.maxWidth = this.$el.offsetWidth;
    });
    setTimeout(() => {
      if (this.fileVal) {
        let value = JSON.parse(this.fileVal);
        for (var i = 0; i < value.length; i++) {
          this.files.push(value[i]);
        }
        for (let i = 0; i < value.length; i++) {
          this.filesData.push({
            id: this.files[i].id,
            name: this.files[i].name,
            size: this.files[i].size,
            type: utils.substringType(this.files[i].name, "."),
            bytes: utils.bigDecimal(this.files[i].size),
            username: this.files[i].username
          });
        }
      }
    }, 100);
    this.$validator = this.$root.$validator;
  }
};
</script>
<style lang="scss" scoped>
@import "@/assets/css/element-variables.scss";
.upload-demo {
  max-width: 570px;
  margin-top: 5px;
}

.done-subject {
  cursor: pointer;
}

.done-subject {
  color: $--theme-color;
}

div[aria-invalid='true'] /deep/ .el-input__inner, div[aria-invalid='true'] /deep/ .el-input__inner:focus {
  border-color: #f56c6c;
}
.file-list__wrap{
  list-style: none;
  width: 360px;
  .file-item{
    padding: 0 6px;
    display: flex;
    .file__name{
      display: inline-block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      width: 300px;
      margin: 0;
    }
    &:hover{
      cursor: pointer;
      color: #2761ff;
      background: #f5f5f5;
      .file-close__icon{
        display: inline-block;
      }
    }
    .file-icon{
      padding-right: 4px;
      padding-top: 7px;
    }
    .file-close__icon{
      display: none;
      float: right;
      padding-top: 7px;
      margin-left: 10px;
    }
  }
}
</style>


