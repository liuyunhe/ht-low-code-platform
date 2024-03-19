<template>
  <el-container class="fullheight" style="border: 1px solid #eee">
    <div>
      <el-aside class="fullheight" :width="width" v-show="asideShow">
        <ht-sys-type-tree
          class="ht-sys-type-tree"
          cat-id="5"
          highlight-current
          ref="htDataDicTree"
          :support-filter="supportFilter"
          :default-expand-all="isExpand"
          expand-on-click-node="false"
          @node-click="handleNodeClick"
        >
          <span class="custom-tree-node" slot-scope="{ node, data }">
            <span class="show-ellipsis" :title="node.label">{{ node.label }}</span>
            <el-dropdown @command="handleCommand">
              <span class="el-dropdown-link">
                <i class="icon-more" title="更多操作" />
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item icon="el-icon-plus" :command="{node:node,data,action:'add'}">添加</el-dropdown-item>
                <el-dropdown-item
                  icon="el-icon-edit"
                  v-if="data.parentId!='0'"
                  :command="{node:node,data,action:'edit'}"
                >编辑</el-dropdown-item>
                <el-dropdown-item
                  icon="el-icon-upload2"
                  v-if="data.parentId!='0'"
                  :command="{node:node,data,action:'import'}"
                >导入</el-dropdown-item>
                <el-dropdown-item
                  icon="el-icon-download"
                  v-if="data.parentId!='0'"
                  :command="{node:node,data,action:'export'}"
                >导出</el-dropdown-item>
                <el-dropdown-item
                  icon="el-icon-delete"
                  v-if="data.parentId!='0'"
                  :command="{node:node,data,action:'delete'}"
                >删除</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </span>
        </ht-sys-type-tree>
      </el-aside>

      <div class="navbar-collapse" :style="navbarCollapseStyle" @click="asideShow=!asideShow">
        <div class="navbar-collapse-bg">
          <i
            class="navbar-collapse-arrow"
            :class="{'el-icon-arrow-left':asideShow,'el-icon-arrow-right':!asideShow}"
          ></i>
        </div>
      </div>

      <!-- 导入 -->
      <el-dialog :visible.sync="dialogImportVisible" title="导入" width="40%" top="30vh" custom-class="upload-dialog">
          <el-form ref="form" label-width="150px" class="upload-dialog__contnt">
            <ht-form-item label="默认模板">
              <el-button size="small" type="primary" icon="el-icon-download" @click="downloadTemplate()">模板下载</el-button>
            </ht-form-item>
            <ht-form-item label="文件">
              <el-upload
                :action="importUrl"
                :http-request="importData"
                :before-upload="beforeUpload"
                :file-list="fileList"
                accept=".xls,.xlsx"
                :limit="1"
                :auto-upload="false"
                ref="upload"
              >
                <el-button size="small" icon="el-icon-upload">选择文件</el-button>
                <div slot="tip" class="el-upload__tip">只能上传xls/xlsx文件</div>
              </el-upload>
            </ht-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button
              type="primary"
              @click="submitImport"
              element-loading-text="拼命导入中"
              v-loading.fullscreen.lock="fullscreenLoading"
            >确 定</el-button>
            <el-button @click="cancelConfirm()">取 消</el-button>
          </div>
        </el-dialog>

      <!-- 添加分类 -->
      <ht-sidebar-dialog
        width="28%"
        :title="title"
        :visible="dialogVisible"
        :before-close="handleClose"
      >
        <el-form :model="sysType" data-vv-scope="editSysTypeForm">
          <ht-form-item label="父节点" label-width="100px" v-if="!sysType.id">
            <ht-input v-model="parentSysType.name" autocomplete="off" validate="required" disabled></ht-input>
          </ht-form-item>
          <ht-form-item label="分类名称" label-width="100px">
            <ht-input v-model="sysType.name" autocomplete="off" :validate="{required:true,max:40}"></ht-input>
          </ht-form-item>
          <ht-form-item label="分类Key" label-width="100px">
            <ht-input
              v-model="sysType.typeKey"
              v-pinyin="sysType.name"
              autocomplete="off"
              :validate="{required:true, regex: {exp: '^[a-zA-Z][a-zA-Z0-9_]*$', message: '只能输入字母、数字、下划线，且以字母开头'},max:40}"
              placeholder="请输入key"
              :disabled="sysType.id?true:false"
            />
          </ht-form-item>
          <!-- <ht-form-item label="类型" label-width="100px">
            <ht-radio
              v-model="sysType.struType"
              :options="[{ key: 0, value: '平铺'}, { key: 1, value: '树形' }]"
            />
          </ht-form-item> -->
        </el-form>
        <div slot="footer" class="dialog-footer">
          <ht-submit-button
            :url="saveSysTypeUrl"
            :model="sysType"
            scope-name="editSysTypeForm"
            @after-save-data="afterSaveData"
          >{{$t('eip.common.save')}}</ht-submit-button>
          <el-button @click="dialogVisible = false">取 消</el-button>
        </div>
      </ht-sidebar-dialog>

      <!-- 添加数据字典 -->
      <ht-sidebar-dialog
        width="28%"
        :title="dicTitle"
        :visible="dicDialogVisible"
        :before-close="handleClose"
      >
        <el-form :model="dicData" data-vv-scope="editDic">
          <ht-form-item label="项名称" label-width="80px">
            <ht-input v-model="dicData.name" autocomplete="off" :validate="{required:true,max:40}"></ht-input>
          </ht-form-item>
          <ht-form-item label="项值" label-width="80px">
            <ht-input
              v-model="dicData.key"
              v-pinyin="dicData.name"
              autocomplete="off"
              :validate="{required:true,alpha_dash:true,max:40}"
              placeholder="请输入key"
              :disabled="dicData.id?true:false"
            />
          </ht-form-item>
          <ht-form-item label label-width="80px">当前数据字典中项值必须唯一</ht-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <ht-submit-button
            :url="saveDicDataUrl"
            :model="dicData"
            scope-name="editDic"
            @after-save-data="afterSaveDicData"
          >{{$t('eip.common.save')}}</ht-submit-button>
          <el-button @click="dicDialogVisible = false">取 消</el-button>
        </div>
      </ht-sidebar-dialog>
    </div>
    <el-container>
      <el-main class="fullheight">
        <el-scrollbar class="dic-data-scrollbar">
          <ht-tree
            :data="dicDatas"
            node-key="id"
            :props="defaultProps"
            :support-filter="false"
            :expand-on-click-node="false"
            :default-expand-all="isExpandDic"
            ref="dicDataTree"
            @node-click="dicClick"
          >
            <!-- 作用域插槽：插槽prop -->
            <span class="custom-tree-node" slot-scope="{ node, data }">
              <span class="show-ellipsis" :title="node.label">{{ node.label }}</span>
              <el-dropdown @command="handleCommand">
                <span class="el-dropdown-link">
                  <i class="icon-more" title="更多操作" />
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item
                    icon="el-icon-plus"
                    :command="{node:node,data,action:'dicAdd'}"
                  >添加</el-dropdown-item>
                  <el-dropdown-item
                    icon="el-icon-edit"
                    v-if="data.parentId!='-1'"
                    :command="{node:node,data,action:'dicEdit'}"
                  >编辑</el-dropdown-item>
                  <el-dropdown-item
                    icon="el-icon-delete"
                    v-if="data.parentId!='-1'"
                    :command="{node:node,data,action:'dicDelete'}"
                  >删除</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </span>
          </ht-tree>
        </el-scrollbar>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
import form from "@/api/form.js";
import styles from "@/assets/css/element-variables.scss";
const EipSysTypeSelector = () =>
  import("@/components/selector/EipSysTypeSelector.vue");
import portalApi from "@/api/portal.js";
import req from "@/request.js"
const htSysTypeTree = () => import("@/components/common/HtSysTypeTree.vue");
export default {
  components: {
    EipSysTypeSelector,
    htSysTypeTree
  },
  props: {
    width: {
      type: String,
      default: styles.aside_width
    },
    supportFilter: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      dicData: {
        key: "",
        name: "",
        parentId: "",
        typeId: ""
      },
      dicParentId: "", //存储数据字典父类id用于刷新数据字典树
      title: "添加数据字典分类",
      dicTitle: "添加数据字典",
      asideShow: true,
      isExpand: true,
      isExpandDic: true,
      dialogVisible: false,
      dicDialogVisible: false,
      dialogImportVisible:false,
      fullscreenLoading: false,
      fileList: [],
      sysType: {
        children: [],
        icon: "{}",
        isLeaf: "N",
        struType: 0,
        typeKey: "",
        name: ""
      },
      parentSysType: {
        name: ""
      },
      treeData: [],
      defaultProps: {
        children: "children",
        label: "name"
      },
      data: [],
      pageResult: {
        page: 1,
        pageSize: 20,
        total: 0
      },
      bpmForm: {
        key: "",
        bos: "",
        desc: ""
      },
      dicDatas: []
    };
  },
  computed: {
    formDeleteUrl: function() {
      return `${window.context.uc}/form/form/v1/remove`;
    },
    navbarCollapseStyle: function() {
      if (this.asideShow) {
        return { left: parseInt(this.width) + "px" };
      }
      return { left: "0px" };
    },
    saveSysTypeUrl: function() {
      return `${window.context.portal}/sys/sysType/v1/save?parentId=${
        this.parentSysType.id
      }&isRoot=${this.parentSysType.parentId == 0 ? 1 : 0}&isPriNode=0`;
    },
    saveDicDataUrl: function() {
      return `${window.context.portal}/sys/dataDict/v1/save`;
    },
    importUrl: function() {
      return window.context.portal + "/sys/dataDict/v1/import";
    }
  },
  mounted() {},
  methods: {
    formatTreeData(jsonData) {
      var result = [],
        temp = {},
        i = 0,
        j = 0,
        len = jsonData.length;
      for (; i < len; i++) {
        temp[jsonData[i]["id"]] = jsonData[i]; // 以id作为索引存储元素，可以无需遍历直接定位元素
      }
      for (; j < len; j++) {
        var currentElement = jsonData[j];
        var tempCurrentElementParent = temp[currentElement["parentId"]]; // 临时变量里面的当前元素的父元素
        if (tempCurrentElementParent) {
          // 如果存在父元素
          if (!tempCurrentElementParent["children"]) {
            // 如果父元素没有chindren键
            tempCurrentElementParent["children"] = []; // 设上父元素的children键
          }
          tempCurrentElementParent["children"].push(currentElement); // 给父元素加上当前元素作为子元素
        } else {
          // 不存在父元素，意味着当前元素是一级元素
          result.push(currentElement);
        }
      }
      return result;
    },
    handleNodeClick(node) {
      this.dicLoadData(node.id);
    },
    dicLoadData(id) {
      portalApi.getByTypeId(id).then(data => {
        if (data) {
          //数据转换成树 children格式
          this.dicParentId = id;
          this.dicDatas = this.formatTreeData(data);
        }
      });
    },
    syncTree() {
      this.$refs.htDataDicTree.loadData();
    },
    syncDicTree() {
      if (this.dicParentId) {
        this.dicLoadData(this.dicParentId);
      }
    },
    handleExpand() {
      this.isExpand = !this.isExpand;
      let elTree = this.$refs.htDataDicTree.$refs.htTree.$refs.elTree;
      for (var i = 0; i < elTree.store._getAllNodes().length; i++) {
        elTree.store._getAllNodes()[i].expanded = this.isExpand;
      }
    },
    handleExpandDic() {
      this.isExpandDic = !this.isExpandDic;
      let elTree = this.$refs.dicDataTree.$refs.elTree;
      for (var i = 0; i < elTree.store._getAllNodes().length; i++) {
        elTree.store._getAllNodes()[i].expanded = this.isExpandDic;
      }
    },
    handleCommand(command) {
      let node = command.node;
      let data = command.data;
      let action = command.action;
      switch (action) {
        case "add":
          this.dialogVisible = true;
          this.dicTypeAdd = true;
          if (data) {
            this.sysType.id = "";
            this.sysType.name = "";
            this.sysType.typeKey = "";
            this.parentSysType = data;
            this.sysType.parentId = data.id;
            this.sysType.typeGroupKey =
              data.parentId == 0 ? data.typeKey : data.typeGroupKey;
          }
          break;
        case "edit":
          var newDicdata = {};
          this.title = "编辑数据字典分类";
          //克隆一个对象 以免数据与树动态绑定
          Object.assign(newDicdata, data);
          this.sysType = newDicdata;
          this.dialogVisible = true;
          break;
        case "import":
          var newDicdata = {};
          Object.assign(newDicdata, data);
          this.sysType = newDicdata;
          this.dialogImportVisible = true;
          break;
        case "delete":
          if (data.id) {
            let this_ = this;
            this.$confirm(`是否确定删除 [${data.name}]  及其子分类（包含分类下数据字典项数据）?`, "提示", {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              type: "warning"
            }).then(() => {
              this_.$http.get("${portal}/sys/dataDict/v1/removeByTypeId?typeIds="+data.id)
                .then(
                  resp => {
                    let data = resp.data;
                    if (data.state) {
                      this.$message({
                        type: "success",
                        message: data.message || "删除成功"
                      });
                      this.$refs.htDataDicTree.loadData();
                      this.dicDatas = null;
                      this.syncDicTree();
                    } else {
                      this.$message.error(data.message || "删除失败");
                    }
                  },
                  error => {
                    this.$message.error(error || "删除失败");
                  }
                )
                .catch(() => {
                  this.dialogVisible = false;
                });
            });
          }
          break;
        case "dicAdd": //数据字典添加
          this.dicTitle = "添加数据字典";
          this.dicDialogVisible = true;
          this.dicData.id = "";
          this.dicData.name = "";
          this.dicData.key = "";
          this.dicData.parentId = data.id;
          this.dicData.typeId = data.typeId;
          break;
        case "dicDelete":
          if (data.id) {
            this.$confirm(`是否确定删除 [${data.name}] ?`, "提示", {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              type: "warning"
            }).then(() => {
              portalApi
                .delDataDict(data.id)
                .then(
                  data => {
                    if (data.state) {
                      this.$message({
                        type: "success",
                        message: data.message || "删除成功"
                      });
                      this.syncDicTree();
                    } else {
                      this.$message.error(data.message || "删除成功");
                    }
                  },
                  error => {
                    this.$message.error(error || "删除失败");
                  }
                )
                .catch(() => {
                  this.dicDialogVisible = false;
                });
            });
          }
          break;
        case "dicEdit":
          this.editDic(node.data);
          break;
        case "export":
          //导出成excel
          this.exportExcel(node.data);
          break;
        default:
          break;
      }
    },
    editDic(data){
      this.dicTitle = "编辑数据字典";
      //克隆一个对象 以免数据与树动态绑定
      this.dicData = {...data};
      this.dicDialogVisible = true;
    },
    handleClose() {
      this.dialogVisible = false;
      this.dicDialogVisible = false;
    },
    afterSaveData() {
      this.$refs.htDataDicTree.loadData();
      if (this.sysType.id) {
        this.dialogVisible = false;
        return;
      }
      this.sysType.name = "";
      this.sysType.typeKey = "";
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
    afterSaveDicData() {
      if (this.dicParentId) {
        this.dicLoadData(this.dicParentId);
      }
      if (this.dicData.id) {
        this.dicDialogVisible = false;
        return;
      }
      this.dicData.name = "";
      this.dicData.key = "";
      this.$confirm("是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "success"
      })
        .then(() => {})
        .catch(() => {
          this.dicDialogVisible = false;
        });
    },
    //导入
    importData(param) {
      let formData = new FormData();
      formData.append("file", param.file);
      portalApi.importDataDict(formData, this.sysType.id).then(data => {
        this.fullscreenLoading = false;
        if (data.state) {
          this.$message({ type: "success", message: data.message });
          param.onSuccess();
          this.dialogImportVisible = false;
          this.dicLoadData(this.sysType.id);
          this.$refs.upload.clearFiles();
          this.fileList = [];
        } else {
          this.$message.error(data.message);
          param.onError();
        }
      }).catch(() => {
        this.fullscreenLoading = false;
      });
    },
    beforeUpload(file) {
      this.fullscreenLoading = true;
    },
    submitImport() {
      if (
        !this.$refs.upload.uploadFiles ||
        this.$refs.upload.uploadFiles.length == 0
      ) {
        this.$message.warning("请上传数据字典文件进行导入");
        return false;
      }
      if(this.sysType.id && this.sysType.id == ""){
        this.$message.warning("请选择某一个分类进行导入!");
      }
      this.$refs.upload.submit();
    },
    cancelConfirm(){
      this.$refs.upload.clearFiles();
      this.fileList = [];
      this.dialogImportVisible = false;
    },
    //下载模板
    downloadTemplate(){
      window.location.href = window.context.manage + '/static/excel/数据字典模板.xls';
    },
    exportExcel(data){
      let id = data.id;
      let url = window.context.portal + "/sys/dataDict/v1/export?typeId="+id;
      req.download(url).then(resp=>{
        if(resp.status == 200){
          this.$message({type:"success",message:"导出成功"});
        }else{
          this.$message({type:"error",message:"导出失败"});
        }
      })

    },
    dicClick(data){
      this.editDic(data);
    }
  }
};
</script>

<style lang="scss" scoped>
.el-main {
  padding: 0px;
}
>>> .navbar-collapse {
  position: absolute;
  top: 41%;
  cursor: pointer;
  z-index: 999;
  width:20px;
}

>>> .el-dropdown {
  display: none;
}

>>> .el-tree-node__content:hover .el-dropdown {
  display: inline-block;
}

>>> .navbar-collapse:hover {
  transform: scale(1.1) translateY(2px);
}

>>> .navbar-collapse:hover .navbar-collapse-arrow {
  color: #333333;
}

>>> .navbar-collapse-arrow {
  position: absolute;
  top: 38%;
  right: 4px;
  font-size: 18px;
  color: #a8a8a8;
}

>>> .navbar-collapse-bg {
  -webkit-transition: all 0.12s ease;
  height: 50px;
  border-bottom: 8px solid transparent;
  border-right: none;
  border-left: 12px solid #ebebeb;
  border-top: 8px solid transparent;
  opacity: 0.9;
}
.el-aside-footer {
  position: absolute;
  bottom: 21px;
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

.dic-data-scrollbar {
  width: 250px;
  height: 100%;
  border-right: 1px solid #eee;
}

.dic-data-scrollbar >>> .el-scrollbar__wrap {
  overflow-x: hidden;
}
/deep/ .el-dialog.upload-dialog{
 .upload-dialog__content{
   height: 150px;
 }
}
</style>
