<template>
  <div>
    <el-upload
      class="upload-demo"
      :action="actionUrl"
      :file-list="files"
      ref="elUploadEl"
      :headers="header"
      :show-file-list="false"
      :before-remove="beforeRemove"
      :limit="intLimit"
      :multiple="multiple"
      :on-success="success"
      :on-progress="progress"
      :on-exceed="onExceed"
      :before-upload="beforeAvatarUpload"
    >
      <el-button size="mini" icon="el-icon-plus">上传</el-button>
      <div slot="tip" class="el-upload__tip">
        <van-notice-bar
          background="#fff"
          color="#606266"
          :speed="20"
          style="font-size:12px;padding:0;"
        >
          <template slot="left-icon">附件格式支持：</template>
          {{acceptLabel}}
        </van-notice-bar>
        <div>附件大小限制：单个文件不超过{{size}}MB</div>
        <div>附件个数限制：最多{{intLimit}}个</div>
      </div>
    </el-upload>
    <el-table v-if="filesData.length>0 && !simplicity" :data="filesData" border :style="'width:98%;'" size="mini">
      <el-table-column label="附件名称" v-if="downloadable" align="center">
        <template slot-scope="scope">
          <span class="done-subject" @click="download(scope.row)">{{scope.row.name}}</span>
        </template>
      </el-table-column>
      <el-table-column label="附件名称" v-if="!downloadable" prop="name" align="center" lalign="center"></el-table-column>
      <el-table-column :prop="con.name" :label="con.desc" v-for="con in conf" :key="con.name" align="center">
          <template slot-scope="scope">
            <ht-input v-model="filesData[scope.$index][con.name]" :name="con.desc" :permission="con.requried?'b':'w'"></ht-input>
          </template>
        </el-table-column>
      <el-table-column align="center" label="操作" width="50">
        <template slot-scope="scope">
          <el-popconfirm title="确定删除吗？" @onConfirm="beforeRemove(scope.row)">
            <el-button slot="reference" type="danger" size="mini" icon="el-icon-delete" plain></el-button>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <ul v-else-if="simplicity" class="file-list__wrap">
      <li v-for="(file, index) in filesData" :key="index" class="file-item">
        <i class=" file-icon el-icon-document"></i>
        <p
          class="file__name"
          :class="{ 'done-subject': previewable }"
          @click="download(file)"
        >
          {{ file.name }}
        </p>
        <i
          v-if="inputWriteable"
          class="file-close__icon el-icon-close"
          @click="beforeRemove(file)"
        ></i>
      </li>
    </ul>
  </div>
</template>

<script>
import { mapState } from "vuex";
import req from "@/request.js";
import utils from "@/utils.js";
import { Loading } from "element-ui";
import { Notify, NoticeBar } from "vant";
export default {
  components: { [NoticeBar.name]: NoticeBar },
  props: ["fileVal", "multiple", "accept", "limit", "conf", "size", "previewable", "downloadable","simplicity","inputWriteable"],
  data() {
    return {
      src: "",
      iframeSrc: "",
      files: [],
      fileId: "",
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
      if (!this.multiple) return 1;
      return this.limit ? parseInt(this.limit) : 5;
    },
    actionUrl: function() {
      return req.getContext().portal + "/system/file/v1/upload";
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
    },
    acceptLabel: function() {
      return this.accept ? this.accept : "所有格式";
    }
  }),
  watch: {
     filesData: {
         handler(newVal, oldVal){
             let r = "";
              if (newVal && newVal.constructor === Array && newVal.length > 0) {
                // 只有上传成功的附件才能更新v-model值
                let ary = newVal.filter((m) => m.status === "success");
                if (ary && ary.length > 0) {
                  r = JSON.stringify(ary);
                }
              }
              this.$emit("input", r);
        },
         deep: true
    }
  },
  methods: {
    //附件下载
    download(file) {
      this.$emit("download",file);
      //req.download(window.context.portal+'/system/file/v1/downloadFile?fileId='+file.id);
    },
    //删除文件
    beforeRemove(file) {
      let fileList = this.$refs.elUploadEl.uploadFiles;
      for (let i = 0; i < fileList.length; i++) {
        if(file.uid){
          if (fileList[i].uid == file.uid) {
            fileList.splice(i, 1); //删除数组某一项
            break;
          }
        }else if(file.id){
          if (fileList[i].id == file.id) {
            fileList.splice(i, 1); //删除数组某一项
            break;
          }
        }
      }
      this.filesData.remove(file);
    },
    //文件上传时
    progress(event, file, fileList) {
      Loading.service();
    },
    onExceed(files, fileList) {
      if((this.filesData.length+files.length)>this.intLimit){
        Notify({
          type: "warning",
          message: "附件个数限制：最多" + this.intLimit + "个"
        });
      }
    },
    //文件上传成功时
    success(response, file, fileList) {
      let loadingInstance = Loading.service();
      this.$nextTick(() => {
        // 以服务的方式调用的 Loading 需要异步关闭
        loadingInstance.close();
      });
      let obj  = {
        id: !file.id?file.response.fileId:file.id,
        uid: file.uid,
        name: file.name,
        size: file.size,
        type: utils.substringType(file.name, "."),
        bytes: utils.bigDecimal(file.size),
        username: file.username,
        status: file.status,
        prop1:'',
        prop2:'',
        prop3:'',
        prop4:'',
        prop5:'',
        prop6:''
      };
      this.filesData.push(obj);
    },
    getFiles() {
      if (this.files.length == 0) {
        return "";
      } else {
        return this.files;
      }
    },
    exceedFileSize(file) {
      return file.size > this.size * 1024 * 1024;
    },
    beforeAvatarUpload(file) {
      if (this.exceedFileSize(file)) {
        Notify({
          message: `附件的大小为${(file.size /1024/1024).toFixed(2)}MB，超过了允许的最大尺寸${this.size}MB.`,
          type: "warning"
        });
        return false;
      }

      if (!this.accept || typeof this.accept == "undefined") {
        return true;
      }
      // 文件类型限制
      const name = file.name ? file.name : "";
      const ext = name
        ? name.substr(name.lastIndexOf(".") + 1, name.length)
        : "";
      const notInclude = this.accept.toLowerCase().indexOf(ext.toLowerCase()) < 0;
      if (notInclude) {
        Notify({
          message: "上传的附件只能是 " + this.accept + "格式!",
          type: "warning"
        });
        return false;
      }
      return true;
    }
  },
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
            id: !this.files[i].id?this.files[i].response.fileId:this.files[i].id,
            name: this.files[i].name,
            size: this.files[i].size,
            type: utils.substringType(this.files[i].name, "."),
            bytes: utils.bigDecimal(this.files[i].size),
            username: this.files[i].username,
            status: this.files[i].status,
            prop1:this.files[i].prop1,
            prop2:this.files[i].prop2,
            prop3:this.files[i].prop3,
            prop4:this.files[i].prop4,
            prop5:this.files[i].prop5,
            prop6:this.files[i].prop6
          });
        }
      }
    }, 100);
    this.$validator = this.$root.$validator;
  }
};
</script>
<style lang="scss" scoped>
/deep/.el-table--mini td, /deep/.el-table--mini th {
  padding: 2px 0 !important;
}

/deep/.el-button--mini, .el-button--mini.is-round {
  padding: 5px 7px;
}

.upload-demo {
  max-width: 570px;
  margin-top: 5px;
}

.done-subject {
  cursor: pointer;
}

.done-subject {
  color: #2761ff;
}

div[aria-invalid='true'] >>> .el-input__inner, div[aria-invalid='true'] >>> .el-input__inner:focus {
  border-color: #f56c6c;
}
.file-list__wrap {
  list-style: none;
  width: 260px;
  padding-left: 0;
  .file-item {
    padding: 0 6px;
    display: flex;
    .file__name {
      display: inline-block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      width: 200px;
      margin: 0;
    }
     .file-icon {
      padding-right: 4px;
      padding-top: 9px;
    }
    .file-close__icon {
      float: right;
      color: #2761ff;
      padding-top: 9px;
      margin-left: 10px;
    }
  }
}
</style>