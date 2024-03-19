<template>
  <el-container style="height: 100%; border: 1px solid #eee">
    <!-- 分类树 -->
    <ht-tree
      class="file-type-tree"
      :data="treeData"
      :props="defaultProps"
      default-expand-all
      :expand-on-click-node="false"
      @node-click="handleNodeClick"
      ref="htTypeTree"
    >
      <span class="custom-tree-node" slot-scope="{ node, data }">
        <span class="show-ellipsis" :title="node.label">{{ node.label }}</span>
        <el-dropdown @command="handleCommand">
          <span>
            <i class="icon-more" title="更多操作" />
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              icon="el-icon-plus"
              :command="{ node: node, data, action: 'add' }"
              >添加</el-dropdown-item
            >
            <el-dropdown-item
              icon="el-icon-edit"
              v-if="data.id != '-1'"
              :command="{ node: node, data, action: 'edit' }"
              >编辑</el-dropdown-item
            >
            <el-dropdown-item
              icon="el-icon-s-unfold"
              v-if="data.id != '-1'"
              :command="{ node: node, data, action: 'delete' }"
              >删除</el-dropdown-item
            >
          </el-dropdown-menu>
        </el-dropdown>
      </span>
    </ht-tree>
    <el-container>
      <el-main>
        <!-- 附件数据 -->
        <ht-table
          @load="loadData"
          :data="data"
          :pageResult="pageResult"
          quick-search-props="fileName,extensionName"
          :show-export="false"
          ref="htTable"
          @row-click="rowClick"
        >
          <template v-slot:toolbar>
            <el-button
              size="small"
              @click="selectTypeDialog"
              icon="el-icon-plus"
              >设置分类</el-button
            >
          </template>
          <template>
            <ht-table-column
              type="index"
              width="50"
              align="center"
              label="序号"
            />
            <ht-table-column
              label="文件名"
              prop="fileName"
              :show-overflow-tooltip="true"
            >
              <template v-slot="{ row }">
                <el-link @click="searchFile(row)" type="primary">{{
                  row.fileName
                }}</el-link>
              </template>
            </ht-table-column>
            <ht-table-column prop="extensionName" width="90" label="扩展名" />
            <ht-table-column prop="type" width="110" label="所属分类" />
            <ht-table-column
              prop="storeType"
              label="存储类型"
              width="110"
              :filters="[
                { text: '磁盘', value: 'folder' },
                { text: '数据库', value: 'database' },
                { text: 'FTP服务器', value: 'ftp' },
                { text: '阿里云OSS', value: 'aliyunOss' }
              ]"
            >
              <template v-slot="{ row }">
                <el-tag type="info" v-if="row.storeType == 'folder'"
                  >磁盘</el-tag
                >
                <el-tag type="success" v-if="row.storeType == 'database'"
                  >数据库</el-tag
                >
                <el-tag type="warning" v-if="row.storeType == 'ftp'"
                  >FTP服务器</el-tag
                >
                <el-tag type="warning" v-if="row.storeType == 'aliyunOss'">阿里云OSS</el-tag>
              </template>
            </ht-table-column>
            <ht-table-column
              prop="creatorName"
              label="上传人"
              width="110"
              :sortable="true"
            />
            <ht-table-column
              label="创建时间"
              width="150"
              prop="createTime"
              :sortable="true"
            >
              <template v-slot="scope">
                <span>{{
                  scope.row.createTime
                }}</span>
              </template>
            </ht-table-column>
            <ht-table-column width="100" label="操作">
              <template v-slot="{ row }">
                <el-button
                  size="mini"
                  icon="el-icon-download"
                  @click="download(row)"
                  >下载</el-button
                >
                <!-- <el-button size="mini" type="primary" icon="el-icon-picture-outline" @click="searchFile(row.id)">预览</el-button> -->
              </template>
            </ht-table-column>
          </template>
        </ht-table>
        <!-- 添加编辑分类 -->
        <ht-sidebar-dialog
          width="20%"
          :title="title"
          :visible="dialogVisible"
          :before-close="handleClose"
        >
          <el-form :model="treeSidebarData" data-vv-scope="editSysTypeForm">
            <ht-form-item
              label="父节点"
              label-width="80px"
              v-if="parentSysType.name != ''"
            >
              <ht-input
                v-model="parentSysType.name"
                autocomplete="off"
                validate="required"
                disabled
              ></ht-input>
            </ht-form-item>
            <ht-form-item label="目录名" label-width="80px">
              <ht-input
                v-model="treeSidebarData.name"
                placeholder="请输入目录名"
                autocomplete="off"
                validate="required"
              ></ht-input>
            </ht-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <ht-submit-button
              :url="saveSysTypeUrl"
              :model="treeSidebarData"
              scope-name="editSysTypeForm"
              @after-save-data="afterSaveData"
              >保存</ht-submit-button>
            <el-button @click="handleClose">取 消</el-button>
          </div>
        </ht-sidebar-dialog>
        <!-- 设置分类 -->
        <eip-url-tree-dialog
          :url="urlTree"
          title="选择分类"
          ref="eipUrlTreeDialog"
          @handle-save="handleSave"
        ></eip-url-tree-dialog>
        <!-- 预览压缩文件-->
        <file-tree
          ref="fileTreeSearch"
          :fileTree="fileTree"
          :fileRow="fileRow"
        />
        <!-- 预览pdf.word等文件格式 -->
        <Pdf ref="pdfSearch" :src="src" :fileRow="fileRow" />
        <!-- 预览excel.jpg.png.txt等文件格式 -->
        <iframe-src
          ref="iframeSrcSearch"
          :iframeSrc="iframeSrc"
          :fileRow="fileRow"
        />

        <VideoPlayer ref="videoPlayer" :fileRow="fileRow" />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import { Message } from "element-ui";
import req from "@/request.js";
const EipUrlTreeDialog = () =>
  import("@/components/dialog/EipUrlTreeDialog.vue");
const FileTree = () => import("@/views/file/FileTree.vue");
const IframeSrc = () => import("@/views/file/IframeSrc.vue");
const Pdf = () => import("@/views/file/Pdf.vue");
const VideoPlayer = () => import("@/views/file/HtVideoPlayer.vue");
export default {
  components: { EipUrlTreeDialog, FileTree, IframeSrc, Pdf, VideoPlayer },
  computed: {
    //保存树数据的URL （树新增修改时）
    saveSysTypeUrl: function() {
      return window.context.portal + "/file/catalog/v1/save";
    }
  },
  data() {
    return {
      src: "",
      iframeSrc: "",
      fileRow: "",
      fileTree: "",
      title: "添加分类",
      treeSidebarData: {}, //树的新增修改数据
      treeData: [], //树数据
      defaultProps: {
        children: "children",
        label: "name"
      },
      data: [], //列表数据
      pageResult: {
        page: 1,
        pageSize: 20,
        total: 0
      },
      urlTree: window.context.portal + "/file/catalog/v1/getTree", //加载树的URL地址
      dialogVisible: false, //侧边栏是否显示
      parentSysType: {
        name: ""
      }, // 树数据新增时显示父节点
      ids: [] //设置分类时的附件ID集合
    };
  },
  methods: {
    //鼠标选中行改变复选框
    rowClick(row, column, event){
      this.$refs.htTable.$refs.htTable.toggleRowSelection(row);
    },
    //查看附件
    searchFile(row) {
      this.$store.dispatch("menu/onlinePreview", row.id).then(data => {
        if (data.result == "error") {
          Message.warning("附件不存在");
        }else if(data.result == "fileNotSupported"){
          Message.warning("当前附件格式不支持预览");
        } else {
          this.fileRow = row;
          if (data.result == "html") {
            this.iframeSrc = window.context.portal + data.pdfUrl;
            this.$refs.iframeSrcSearch.handleOpen();
          } else if (data.result == "txt") {
            this.iframeSrc = window.context.portal + data.TxtUrl;
            this.$refs.iframeSrcSearch.handleOpen();
          } else if (data.result == "picture") {
            this.iframeSrc = window.context.portal + data.currentUrl;
            this.$refs.iframeSrcSearch.handleOpen();
          } else if (data.result == "compress") {
            this.fileTree = JSON.parse(data.fileTree).childList;
            this.$refs.fileTreeSearch.handleOpen();
          }else if (data.result == "media") {
            this.$refs.videoPlayer.show();
          } else {
            this.src = window.context.portal + data.pdfUrl;
            this.$refs.pdfSearch.handleOpen();
          }
        }
      });
    },
    //下载附件
    download(row) {
      req.download("${portal}/system/file/v1/downloadFile?fileId=" + row.id);
    },
    //设置分类
    selectTypeDialog() {
      if (
        this.$refs.htTable.$refs.htTable &&
        this.$refs.htTable.$refs.htTable.selection.length == 0
      ) {
        Message.warning("请选择要分类的附件数据");
        return;
      }
      let val = this.$refs.htTable.$refs.htTable.selection;
      this.ids = [];
      for (let i = 0; i < val.length; i++) {
        this.ids.push(val[i].id);
      }
      this.$refs.eipUrlTreeDialog.showDialog();
    },
    //关闭侧边栏
    handleClose() {
      this.loadTreeData(); //刷新树
      this.treeSidebarData = {}; //清除保存过的数据
      this.dialogVisible = false;
    },
    //树新增修改保存后提示
    afterSaveData() {
      this.loadTreeData(); //刷新树
      //如果是编辑不弹出提示信息
      if (this.parentSysType.name == "") {
        this.dialogVisible = false;
        return;
      }
      let parentId = this.treeSidebarData.parentId;
      this.treeSidebarData = {}; //清除保存过的数据
      this.treeSidebarData.parentId = parentId;
      this.$confirm("是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "success"
      })
        .then(() => {})
        .catch(() => {
          this.dialogVisible = false;
        });
    },
    //树的按钮事件
    handleCommand(command) {
      let node = command.node;
      let data = command.data;
      let action = command.action;
      switch (action) {
        case "add":
          this.showDialog(data, action);
          break;
        case "edit":
          this.showDialog(data, action);
          break;
        case "delete":
          this.delSysType(data);
          break;
      }
    },
    //点击按钮打开侧边栏
    showDialog(data, action) {
      this.dialogVisible = true;
      if (data) {
        if (action == "add") {
          this.title = "添加分类";
          this.treeSidebarData = {};
          this.parentSysType = data;
          this.treeSidebarData.parentId = data.id;
        } else if (action == "edit") {
          this.title = "编辑分类";
          this.parentSysType.name = "";
          this.treeSidebarData = data;
        }
      }
    },
    //删除树数据
    delSysType(data) {
      this.$confirm("是否确定删除?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        req
          .remove(
            window.context.portal + "/file/catalog/v1/remove?id=" + data.id
          )
          .then(
            res => {
              if (res.data.state) {
                this.$message({
                  type: "success",
                  message: res.data.message || "删除成功"
                });
                this.loadTreeData();
              } else {
                this.$message.error(res.data.message || "删除成功");
              }
            },
            error => {
              reject(error);
            }
          );
      });
    },
    //树鼠标左点击时间查询数据
    handleNodeClick(node) {
      if (node.id == "-1") {
        let param = { pageBean: { page: 1, pageSize: 20, showTotal: true } };
        this.loadData(param);
        return;
      }
      let param = {
        pageBean: { page: 1, pageSize: 20, showTotal: true },
        querys: [
          {
            property: "xbTypeId",
            value: node.id,
            group: "main",
            operation: "EQUAL",
            relation: "AND"
          }
        ]
      };
      this.loadData(param);
    },
    //页面加载显示数据
    loadData(param, cb) {
      if (!param.sorter || param.sorter.length == 0) {
        param.sorter = [{ property: "createTime", direction: "DESC" }]; //排序字段
      }
      req
        .post(window.context.portal + "/system/file/v1/list", param)
        .then(response => {
          this.data = response.data.rows;
          this.pageResult = {
            page: response.data.page,
            pageSize: response.data.pageSize,
            total: response.data.total
          };
        })
        .finally(() => cb());
    },
    //加载树
    loadTreeData() {
      req.get(this.urlTree).then(response => {
        this.treeData = response.data;
      });
    },
    //监听对话框确认事件
    handleSave(data) {
      const this_ = this;
      req
        .post(
          window.context.portal +
            "/system/file/v1/setXbTypeId?xbTypeId=" +
            data.id +
            "&type=" +
            data.name,
          this_.ids
        )
        .then(response => {
          if (response.data && response.data.state) {
            Message.success({
              duration: 1500,
              message: response.data.message,
              onClose: function() {
                let param = {
                  pageBean: { page: 1, pageSize: 20, showTotal: true }
                };
                this_.loadData(param);
              }
            });
          } else {
            Message.error(response.data.message || "设置分类失败");
          }
        });
    }
  },
  mounted() {
    this.loadTreeData();
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/css/element-variables.scss";

.file-type-tree {
  border-right: 1px solid #eee;
  width: $--aside-width;
}

.todo-subject {
  cursor: pointer;
}

.todo-subject:hover {
  color: #2761ff;
}

>>> .custom-tree-node {
  width: calc(100% - 40px);
  // flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}

.custom-tree-node i {
  visibility: hidden;
  font-weight: bold;
}

.custom-tree-node:hover i {
  visibility: visible;
}
</style>
