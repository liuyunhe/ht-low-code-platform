<template>
  <div class="inputs">
    <div style="width: 100%; min-width:180px;" class="el-select">
      <div
        ref="tagSpans"
        style="width: calc(100% - 50px);"
        class="el-select__tags"
        v-if="inputWriteable">
        <span>
          <span
            class="el-tag el-tag--info el-tag--small"
            v-for="(item, index) in selectors"
            :key="index">
            <a class="el-select__tags-text" @click="openOffice(item.fileId)">{{ item.name }}</a>
            <i
              class="el-tag__close el-icon-close"
              @click="handleRemove(item)"
            ></i>
          </span>
        </span>
      </div>
      <div v-if="inputWriteable">
        <el-input
          type="text"
          ref="inputEl"
          v-model="name"
          :placeholder="placeholder"
          :style="{ height: inputSuffixHeight + 'px' }">
          <el-button slot="append" icon="el-icon-plus" @click="open"></el-button>
        </el-input>
      </div>
      <el-link
        type="primary"
        @click="openOffice(selectItem.fileId)"
        v-if="!inputWriteable">{{selectItem.name}}</el-link>
      <el-dialog
        title="上传文件"
        :visible="dialogVisible">
        <el-form label-position="right" label-width="100px">
          <el-form-item label="文件名" required>
            <ht-input
              v-model="selectItem.name"></ht-input>
          </el-form-item>
          <el-form-item label="文件" required>
              <el-upload
                :accept="accept"
                action="string"
                :limit="1"
                :http-request="selectFile">
                <el-button>上传</el-button>
              </el-upload>
          </el-form-item>
        </el-form>
        <div class="dialog-footer" slot="footer">
          <el-button type="primary" @click="sure">确定</el-button>
          <el-button @click="dialogVisible = false">取消</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import portal from "@/api/portal.js";
import utils from "@/hotent-ui-util.js"
export default {
  name: "eip-office",
  props: {
    value: String,
    isRevision: {
      type: Boolean,
      default: false
    },
    permission: String | Object
  },
  data() {
    return {
      inputSuffixHeight: 30,
      selectors: [],
      selectItem: {
        name: "",
        fileId: ""
      },
      selectedFile: null,
      name: "",
      placeholder: "",
      dialogVisible: false,
      accept: ".xls,.xlsx,.ppt,.pptx,.docx,.doc"
    };
  },
  computed: {
    inputWriteable: function() {
      return utils.getWriteable(this.permission);
    },
  },
  methods: {
    handleRemove() {
      this.selectItem = {
        name: "",
        fileId: ""
      };
      this.selectors = [];
    },
    open() {
      this.dialogVisible = true;
    },
    openOffice(fileId) {
      window.open(`/webOffice/${fileId}/${this.isRevision?"1":"0"}/${this.inputWriteable?"1":"0"}`,"office","toolbar=no,location=no,resizable=no, height=1000, width=1000,,scrollbars=false,,");
    },
    sure() {
      if (!this.selectedFile && !this.selectItem.fileId) {
        this.$message.warning("请上传文件");
        return;
      }
      if (!this.selectItem.name) {
        this.$message.warning("请填写文件名");
        return;
      }
      let formData = new FormData();
      if (this.selectedFile) {
        formData.append("file",this.selectedFile);
        portal.fileUpload(formData,this.selectItem.fileId).then(resp => {
          if (resp.status === 200) {
            this.selectItem.fileId = resp.data.fileId;
            this.$message.success("添加成功");
            this.dialogVisible = false;
            this.$emit("input",JSON.stringify(this.selectItem));
          }
        });
      }else {
        this.dialogVisible = false;
      }
    },
    selectFile(param) {
      this.selectedFile = param.file;
    }
  },
  watch: {
    value:{
      handler(newVal) {
        let val = {};
        this.selectors = [];
        if (newVal) {
          val = JSON.parse(newVal);
          this.selectItem = val;
          if (val) {
            this.selectors.push(val);
          }else {
            this.selectors = [];
          }
        }
      },
      immediate: true
    }
  },
};
</script>

<style scoped></style>
