<template>
  <el-dialog
    title="选择校验Jar包"
    width="70%"
    class="check-jar"
    append-to-body
    :close-on-click-modal="false"
    :visible.sync="outerVisible"
  >
    <div class="fullheight" v-if="outerVisible">
      <ht-table
        @load="loadData"
        :data="data"
        :pageResult="pageResult"
        :selection="true"
        quick-search-props="classPath,desc"
        :show-export="false"
        :show-custom-column="false"
        highlight-current-row
        :selectable="false"
        ref="htTable"
        @row-click="rowClick"
      >
        <template v-slot:toolbar>
          <el-button-group>
            <el-button size="small" @click="showDialog()" icon="el-icon-plus">添加</el-button>
          </el-button-group>
        </template>
        <template>
          <ht-table-column type="index" width="50" align="center" label="序号" />

          <ht-table-column prop="desc" label="描述" :sortable="true" :show-overflow-tooltip="true" />

          <ht-table-column
            prop="classPath"
            label="校验类路径"
            :sortable="true"
            :show-overflow-tooltip="true"
          />
        </template>
        <ht-table-column label="操作" align="left" width="150">
          <template v-slot="{row}">
            <el-button size="mini" @click="showDialog(row.id,$event)">编辑</el-button>
            <el-button size="mini" type="danger" @click="removeJar(row.id,$event)">删除</el-button>
          </template>
        </ht-table-column>
      </ht-table>
      <el-dialog
        width="50%"
        :title="importCheckJar.id?'编辑校验Jar包':'添加校验Jar包'"
        class="sp-manager__dialog"
        append-to-body
        :visible="dialogVisible"
        :before-close="beforeCloseDialog"
        :close-on-click-modal="false"
        top="20vh"
      >
        <el-form v-form data-vv-scope="importCheckJarForm">
          <ht-form-item label="描述">
            <ht-input v-model="importCheckJar.desc" validate="required" />
          </ht-form-item>

          <ht-form-item label="校验类路径">
            <ht-input v-model="importCheckJar.classPath" validate="required" />
          </ht-form-item>
          <ht-form-item label="Jar包">
            <el-upload
              class="upload-demo"
              :action="actionUrl"
              :on-remove="handleRemove"
              :file-list="files"
              :headers="header"
              :on-success="success"
              :before-upload="beforeUpload"
              ref="fileUp"
              :limit="2"
              accept=".jar"
            >
              <el-tooltip class="item" effect="dark" content="上传自定义Jar包" placement="top-end">
                <el-button size="small" icon="el-icon-upload"></el-button>
              </el-tooltip>
            </el-upload>
          </ht-form-item>
        </el-form>
        <div slot="footer" style="text-align: center">
          <el-button @click="saveData">{{$t("eip.common.save")}}</el-button>
          <el-button @click="beforeCloseDialog">{{$t("eip.common.cancel")}}</el-button>
        </div>
      </el-dialog>

      <div slot="footer" style="text-align: right">
        <el-button @click="confirm" type="primary">确定</el-button>
        <el-button @click="outerVisible = false">{{$t("eip.common.cancel")}}</el-button>
      </div>
    </div>
  </el-dialog>
</template>
<script>
import { mapState, mapActions } from "vuex";
export default {
  data() {
    return {
      dialogVisible: false,
      data: [],
      pageResult: {
        page: 1,
        pageSize: 50,
        total: 0
      },
      importCheckJar: {},
      outerVisible: false,
      files: [],
      curSelect: ""
    };
  },
  computed: mapState({
    header: state => {
      return { Authorization: `Bearer ${state.login.currentUser.token}` };
    },
    actionUrl: function() {
      return window.context.portal + "/system/file/v1/upload";
    }
  }),
  mounted() {
    this.$validator = this.$root.$validator;
  },
  methods: {
    beforeUpload(file) {
      if (this.files && this.files.length > 0) {
        if (this.files.length == 1) {
          return new Promise((resolve, reject) => {
            this.$confirm("已有Jar包, 是否确认覆盖?", "提示", {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              type: "warning"
            })
              .then(() => {
                resolve();
              })
              .catch(() => {
                reject();
              });
          });
        } else {
          this.$message.waring("最多只能上传一个模板");
          return false;
        }
      } else {
        return true;
      }
    },

    handleRemove(file, fileList) {
      if (fileList && fileList.length == 1) {
        return;
      }
      let this_ = this;
      setTimeout(function() {
        this_.importCheckJar.filePath = "";
      }, 50);
    },
    success(response, file, fileList) {
      this.files = [];
      for (let i = 0; i < fileList.length; i++) {
        if (fileList[i].response) {
          let value = fileList[i].response;
          let arrarFile = {};
          arrarFile.id = value.fileId;
          arrarFile.name = value.fileName;
          arrarFile.size = value.size;
          this.files.push(arrarFile);
        }
      }
      this.importCheckJar.filePath = JSON.stringify(this.files);
    },
    show() {
      this.outerVisible = true;
      this.curSelect = {};
    },
    showDialog(id, e) {
      if (id) {
        if (e && e.preventDefault) {
          e.preventDefault(); //非IE浏览器
        } else {
          window.event.returnValue = false;
        } //IE浏览器
        this.$http
          .get("${form}/form/formImportCheckJar/v1/getJson?id=" + `${id}`)
          .then(
            resp => {
              this.importCheckJar = resp.data;
              if (this.importCheckJar.filePath) {
                this.files = JSON.parse(this.importCheckJar.filePath);
              }
              this.dialogVisible = true;
            },
            error => {}
          );
      } else {
        this.files = [];
        this.dialogVisible = true;
      }
    },
    beforeCloseDialog() {
      this.importCheckJar = {};
      this.dialogVisible = false;
    },
    loadData(param, cb) {
      this.curSelect = "";
      this.$http
        .post("${form}/form/formImportCheckJar/v1/listJson", param)
        .then(
          resp => {
            let response = resp.data;
            this.data = response.rows;
            this.pageResult = {
              page: response.page,
              pageSize: response.pageSize,
              total: response.total
            };
          },
          error => {}
        )
        .finally(() => cb());
    },
    afterSaveData() {
      setTimeout(() => {
        this.beforeCloseDialog();
        this.$refs.htTable.load();
      }, 500);
    },
    saveData() {
      if (!this.importCheckJar.desc) {
        this.$message.warning("请填写描述");
        return false;
      }

      if (!this.importCheckJar.classPath) {
        this.$message.warning("请填写校验类路径");
        return false;
      }

      if (!this.importCheckJar.filePath) {
        this.$message.warning("请上传Jar包");
        return false;
      }
      this.$http
        .post("${form}/form/formImportCheckJar/v1/save", this.importCheckJar)
        .then(
          resp => {
            let data = resp.data;
            if (data.state) {
              this.$message.success("保存成功");
              this.$refs.htTable.load();
              this.dialogVisible = false;
            }
          },
          error => {}
        );
    },
    afterSaveData() {
      setTimeout(() => {
        this.beforeCloseDialog();
        this.$refs.htTable.load();
      }, 500);
    },
    removeJar(id) {
      let this_ = this;
      this.$confirm("确定删除Jar包配置吗？")
        .then(() => {
          this_.$http
            .remove("${form}/form/formImportCheckJar/v1/remove?ids=" + id)
            .then(
              resp => {
                if (resp.data && resp.data.state) {
                  this_.$message.success("删除成功");
                  this_.$refs.htTable.load();
                }
              },
              error => {}
            );
        })
        .catch(() => {});
    },
    rowClick(row, column, event) {
      this.curSelect = row;
    },
    confirm() {
      if (!this.curSelect) {
        this.$message.warning("请选择Jar包");
        return;
      }
      this.$emit("on-confirm", this.curSelect);
      this.outerVisible = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.sp-manager__dialog /deep/ > .el-dialog > .el-dialog__body {
  height: calc(100% - 170px);
}
.check-jar /deep/  .el-dialog__body {
  padding: 10px 20px;
}
</style>
