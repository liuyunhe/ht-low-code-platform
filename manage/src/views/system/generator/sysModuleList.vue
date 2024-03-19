<template>
  <el-container class="fullheight" style="outline: 1px solid #e7eaec">
    <ht-aside-tree
      cat-id="10"
      :hasFooter="false"
      @node-click="handleNodeClick"
    />
    <el-main style="padding: 5px">
      <el-container class="fullheight">
        <el-header height="48px" style="padding:0">
          <el-button-group>
            <el-button size="small" @click="newModule()" icon="el-icon-plus"
              >添加</el-button
            >
            <el-button size="small" icon="el-icon-back" @click="handExport"
              >导入</el-button
            >
            <el-button size="small" icon="el-icon-right" @click="handImport"
              >导出</el-button
            >
          </el-button-group>
        </el-header>
        <el-main style="padding:0">
          <div
            class="card-item"
            v-for="(item, index) in data"
            :key="index"
            :class="{ checked: item.checked, form: item.type == 'form' }"
          >
            <div class="sticky" @click="itemClick(item, $event)">
              <label class="card-checkbox">
                <input type="checkbox" />
                <span></span>
              </label>
            </div>
            <el-card shadow="hover" :body-style="{ padding: '0px' }">
              <div class="card-item-body">
                <div class="card-meta-avatar">
                  <div class="card-meta-avatar-img">
                    <i v-if="item.type == 'form'" class="icon-monitor" />
                    <i v-else class="icon-flow1" />
                  </div>
                  <div class="card-meta-avatar-type">
                    <span v-if="item.type == 'form'">表单模块</span>
                    <span v-else>流程模块</span>
                  </div>
                </div>
                <div class="card-meta-detail">
                  <div class="card-meta-detail-title">
                    <a
                      class="show-ellipsis"
                      :title="item.name"
                      @click="newModule(item.id)"
                      >{{ item.name }}</a
                    >
                  </div>
                  <div
                    class="card-meta-detail-desc show-ellipsis2"
                    :title="item.desc"
                  >
                    {{ item.desc }}
                  </div>
                </div>
                <div class="card-meta-creator flex">
                  <div>
                    <i class="el-icon-user"></i>
                    <span>{{ item.creator }}</span>
                  </div>
                  <div>
                    <i class="el-icon-date"></i>
                    <span>{{
                      item.createTime | dateformat("yyyy-MM-dd")
                    }}</span>
                  </div>
                </div>
              </div>
              <div class="card-item-actions">
                <ul>
                  <li class="el-icon-view">
                    <span @click="modulePreview(item.id)">预览</span>
                  </li>
                  <li class="el-icon-setting" @click="newModule(item.id)">
                    <span>配置</span>
                  </li>
                  <li class="el-icon-paperclip" @click="modulePush(item)">
                    <span>发布</span>
                  </li>
                  <li class="el-icon-delete" @click="deleteItem(item.id)">
                    <span>删除</span>
                  </li>
                </ul>
              </div>
            </el-card>
          </div>
        </el-main>
        <el-footer height="30px" style="padding:0">
          <el-pagination
            @current-change="handleCurrentChange"
            :current-page="pagination.page"
            :page-size="9"
            layout="total,prev, pager, next, jumper"
            :total="pagination.total"
          ></el-pagination>
        </el-footer>

        <el-dialog
          class="create-module-dialog"
          fullscreen
          destroy-on-close
          :visible="moduleEditorDialogVisible"
          :before-close="handleCloseModuleEditor"
          :close-on-press-escape="false"
        >
          <sysModuleCreate
            @close-dialog="handleCloseModuleEditor"
            :visible.sync="moduleEditorDialogVisible"
            :id.sync="id"
          />
        </el-dialog>

        <ht-sidebar-dialog
          class="preview-module-dialog"
          destroy-on-close
          fullscreen
          :visible="dialogVisible"
          :before-close="handleClose"
          :close-on-press-escape="false"
        >
          <sysModulePreview
            @close-dialog="handleClose"
            :visible.sync="dialogVisible"
            :data="moduleData"
          />
        </ht-sidebar-dialog>

        <el-dialog
          title="导入模块"
          :visible.sync="importDialogVisible"
          width="40%"
          top="30vh"
          :close-on-click-modal="false"
          v-if="importDialogVisible"
        >
          <div style="height:150px;padding-left: 20px ;">
            <el-upload
              style="display: inline-block;"
              :action="imporCheckUrl"
              :on-success="hadleUploadResult"
              :on-error="hadleUploadResult"
              :headers="uploadHeaders"
              :on-exceed="onExceed"
              accept=".zip"
              :before-upload="beforeUpload"
              :limit="1"
              :data="{ isCheck: true }"
              :auto-upload="false"
              ref="upload"
            >
              <el-button size="small" icon="el-icon-upload">选择模块</el-button>
            </el-upload>
          </div>
          <span slot="footer" class="dialog-footer">
            <el-button
              type="primary"
              @click="submitImport"
              element-loading-text="导入中..."
              v-loading.fullscreen.lock="fullscreenLoading"
              >确 定</el-button
            >
            <el-button @click="importDialogVisible = false">取 消</el-button>
          </span>
        </el-dialog>
        <!-- 发布菜单 -->
        <sysModuleAddMenus ref="sysModuleAddMenus" :moduleName="moduleName"></sysModuleAddMenus>
      </el-container>
    </el-main>
  </el-container>
</template>
<script>
import portal from "@/api/portal.js";
import req from "@/request.js";
const htAsideTree = () => import("@/components/common/HtAsideTree.vue");
const sysModuleAddMenus = () =>
  import("@/views/system/generator/sysModuleAddMenus.vue");
import sysModuleCreate from "@/views/system/generator/sysModuleCreate.vue";
import sysModulePreview from "@/views/system/generator/sysModulePreview.vue";
import { mapState } from "vuex";
import moment from "moment"; //日期格式化插件
export default {
  name: "sysModuleList",
  components: {
    htAsideTree,
    sysModuleCreate,
    sysModulePreview,
    sysModuleAddMenus
  },
  data() {
    return {
      id: "",
      previewId: "",
      importDialogVisible: false,
      fullscreenLoading: false,
      moduleData: {},
      dialogVisible: false,
      moduleEditorDialogVisible: false,
      dataChekedList: [],
      typeIdQuery: null,
      pagination: {
        page: 1,
        pageSize: 9,
        total: 0
      },
      moduleName:'', 
      data: []
    };
  },

  computed: mapState({
    uploadHeaders: function(mapState) {
      return { Authorization: "Bearer " + mapState.login.currentUser.token };
    },
    imporCheckUrl: function() {
      return window.context.portal + "/sys/sysModule/v1/importModule";
    }
  }),
  methods: {
    handleCloseModuleEditor() {
      this.id = "";
      this.moduleEditorDialogVisible = false;
      this.search();
    },
    handleClose() {
      this.previewId = "";
      this.dialogVisible = false;
    },
    search() {
      let querys = [];
      if (this.typeIdQuery != null) {
        querys.push(this.typeIdQuery);
      }
      let pageBean = {
        pageBean: this.pagination,
        querys
      };
      portal.getSysModuleJson(pageBean).then(response => {
        this.data = response.rows;
        this.pagination = {
          page: response.page,
          pageSize: response.pageSize,
          total: response.total
        };
      });
    },
    newModule(id) {
      this.id = id;
      this.moduleEditorDialogVisible = true;
    },
    itemClick(item, $event) {
      $event.preventDefault();
      var id = item.id;
      if (this.dataChekedList.indexOf(id) == -1) {
        this.dataChekedList.push(id);
        this.$set(item, "checked", true);
      } else {
        this.dataChekedList.remove(id);
        this.$set(item, "checked", false);
      }
    },
    handleCurrentChange: function(currentPage) {
      this.pagination.page = currentPage;
      this.search();
    },
    deleteItem(id) {
      this.$confirm("确定删除吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        req
          .remove(window.context.portal + "/sys/sysModule/v1/remove?ids=" + id)
          .then(resp => {
            this.$message.success(resp.data.message || "操作成功");
            this.dataChekedList = [];
            this.search();
          });
      });
    },
    modulePreview(id) {
      var url = window.context.portal + "/sys/sysModule/v1/getJson?id=" + id;
      req.get(url).then(response => {
        this.moduleData = response.data;
        this.dialogVisible = true;
      });
    },
    handleNodeClick: function(node) {
      if (node.typeKey == "SYSMODULE") {
        this.typeIdQuery = null;
      } else {
        this.typeIdQuery = {
          property: "classifyId",
          value: node.id,
          operation: "EQUAL",
          relation: "AND"
        };
      }
      this.search();
    },
    modulePush(item) {
      this.moduleName = item.name
      this.$refs.sysModuleAddMenus.showDialog(item.id);
    },

    //导入
    handExport() {
      this.importDialogVisible = true;
    },
    //导出
    handImport() {
      if (this.dataChekedList.length == 0) {
        this.$message.warning("请选择至少一项记录");
        return;
      }
      req.download(
        "${portal}/sys/sysModule/v1/exportModule?ids=" + this.dataChekedList
      );
    },
    hadleUploadResult(response) {
      if (response.state) {
        this.$message.success(response.message);
      } else {
        this.$message.error(response.message);
      }
      this.importDialogVisible = false;
      this.fullscreenLoading = false;
      this.search();
    },
    beforeUpload(file) {
      if (!file.name.endsWith(".zip")) {
        this.$message.warning("只能导入zip文件!");
        return false;
      }
      this.imporActionUrl = this.imporCheckUrl;
      this.fullscreenLoading = true;
    },
    onExceed(file) {
      this.$message.warning("只能选择一个zip文件!");
    },
    submitImport() {
      if (
        !this.$refs.upload.uploadFiles ||
        this.$refs.upload.uploadFiles.length == 0
      ) {
        this.$message.warning("请选择要导入的模块!");
        return false;
      }
      this.$refs.upload.submit();
    }
  },

  created() {
    this.search();
  }
};
</script>

<style scoped>
.card-item {
  cursor: default;
  width: 280px;
  float: left;
  display: block;
  position: relative;
  margin: 1px 15px 15px 1px;
}
.card-item-body {
  margin: 15px 15px 0 15px;
}
.sticky {
  width: 1px;
  height: 0px;
  position: absolute;
  top: 0;
  right: 0;
  border-left: 40px solid #fff;
  border-top: 40px solid #ededed;
}
.card-item.checked .el-card {
  outline: 1px solid #5492f5;
}
.card-item.checked .sticky {
  border-top-color: #5492f5;
}
.card-item.checked:not(.form) .el-card {
  outline: 1px solid #f45159;
}
.card-item.checked:not(.form) .sticky {
  border-top-color: #f45159;
}
.card-checkbox {
  position: absolute;
  top: -35px;
  right: 0;
}
.card-checkbox input[type="checkbox"] {
  opacity: 0;
}
.card-checkbox input[type="checkbox"] + span::after {
  opacity: 1;
  content: "";
  position: absolute;
  width: 6px;
  height: 11px;
  background: transparent;
  right: 7px;
  border: 2px solid #fff;
  border-top: none;
  border-left: none;
  -webkit-transform: rotate(35deg);
  -moz-transform: rotate(35deg);
  -o-transform: rotate(35deg);
  -ms-transform: rotate(35deg);
  transform: rotate(35deg);
}

.card-meta-avatar {
  height: 30px;
  margin-right: 15px;
}

.card-meta-avatar-type {
  margin-left: 5px;
  float: left;
  height: 30px;
  line-height: 30px;
  text-align: left;
  font-weight: bold;
  font-size: 15px;
  color: #5492f5;
}

.card-item:not(.form) .card-meta-avatar-type {
  color: #f45159;
}

.card-meta-avatar-img {
  float: left;
  width: 30px;
  height: 30px;
}

.card-meta-avatar-img > i {
  margin-top: 8px;
  font-size: 18px;
  color: #5492f5;
  font-weight: bold;
}

.card-item:not(.form) .card-meta-avatar-img > i {
  color: #f45159;
}

.card-meta-detail {
  height: 80px;
}
.card-meta-detail-title {
  padding-top: 7px;
}
.card-meta-detail-title > a {
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  color: #555;
  text-decoration: none;
  width: 240px;
  display: inline-block;
}
.card-meta-detail-title > a:hover {
  color: #5492f5;
}
.card-item:not(.form) .card-meta-detail-title > a:hover {
  color: #f45159;
}

.card-meta-detail-desc {
  margin-top: 5px;
  color: #b7b7b7;
}

.card-meta-creator {
  height: 40px;
  justify-content: space-between;
}

.card-meta-creator > div {
  display: inline-block;
  height: 40px;
  line-height: 40px;
  color: #979797;
}

.card-meta-creator > div > i {
  margin-right: 5px;
}

.card-item-actions {
  height: 40px;
  background: #fafafa;
  border-top: 1px solid #e8e8e8;
}

.card-item-actions > ul {
  padding: 0;
  margin: 0;
  list-style: none;
}

.card-item-actions > ul > li {
  cursor: pointer;
  width: 25%;
  float: left;
  margin: 12px 0;
  font-size: 16px;
  color: #555;
  text-align: center;
}

.card-item-actions > ul > li > span {
  margin-left: 5px;
}

.card-item-actions > ul > li:hover {
  color: #5492f5;
}
.card-item:not(.form) .card-item-actions > ul > li:hover {
  color: #f45159;
}

.create-module-dialog >>> .el-dialog__header {
  display: none;
}

.create-module-dialog >>> .el-dialog__body {
  padding: 0;
  overflow-x: hidden;
  height: 100%;
  background: #eee;
}

.preview-module-dialog >>> .el-dialog__header {
  display: none;
}

.preview-module-dialog >>> .el-dialog__body {
  padding: 0;
  height: 100%;
}
</style>
