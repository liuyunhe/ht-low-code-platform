<template>
  <el-container class="fullheight" style="border: 1px solid #eee">
    <div>
      <el-aside :width="width" v-show="asideShow" class="fullheight">
        <ht-sys-type-tree
            cat-id="11"
            highlight-current
            ref="htSysTypeTree"
            :support-filter="true"
            :default-expand-all="true"
            :expand-on-click-node="false"
            @node-click="handleNodeClick">
        <span class="custom-tree-node" slot-scope="{ node, data }">
          <span class="show-ellipsis" :title="node.label">{{ node.label }}</span>
          <el-dropdown @command="handleCommand">
            <span class="el-dropdown-link">
              <i class="icon-more" title="更多操作" />
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item
                  icon="el-icon-plus"
                  :command="{data,action:'add'}" v-if="data.path && data.path.split('.')['length'] <= 3">添加</el-dropdown-item>
              <el-dropdown-item
                  icon="el-icon-edit"
                  v-if="showEditPermission(data)"
                  :command="{data,action:'edit'}">编辑</el-dropdown-item>
              <el-dropdown-item
                  icon="el-icon-download"
                  v-if="data.parentId!='0'"
                  :command="{data,action:'export'}">导出</el-dropdown-item>
              <el-dropdown-item
                  icon="el-icon-upload2"
                  v-if="data.parentId!='0'"
                  :command="{data,action:'import'}">导入</el-dropdown-item>
              <el-dropdown-item
                  icon="el-icon-delete"
                  v-if="showEditPermission(data)"
                  :command="{data,action:'delete'}">删除</el-dropdown-item>
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
    </div>

    <el-container>
      <el-main class="fullheight">
        <el-scrollbar class="dic-data-scrollbar">
          <ht-tree
              :data="tagDatas"
              node-key="id"
              :props="{children: 'children',label: 'name'}"
              :support-filter="false"
              :expand-on-click-node="false"
              :default-expand-all="true"
              ref="tagTree" 
              @node-click="tagClick">
            <span class="custom-tree-node" slot-scope="{ node, data }">
              <span class="show-ellipsis" :title="node.label">{{ node.label }}</span>
              <el-dropdown @command="handleCommand">
                <span class="el-dropdown-link">
                  <i class="icon-more" title="更多操作" v-if="data.key != 'yybq' && data.key != 'bdbq'" />
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item
                      icon="el-icon-plus"
                      v-if="data.parentId==-1" 
                      :command="{data,action:'addTag'}"
                  >添加</el-dropdown-item>
                  <el-dropdown-item
                      icon="el-icon-edit"
                      v-if="data.parentId!=-1"
                      :command="{data,action:'editTag'}"
                  >编辑</el-dropdown-item>
                  <el-dropdown-item
                      icon="el-icon-delete"
                      v-if="data.parentId!=-1"
                      :command="{data,action:'deleteTag'}"
                  >删除</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </span>
          </ht-tree>
        </el-scrollbar>
      </el-main>
    </el-container>
    <!--分类编辑页-->
    <ht-sidebar-dialog
        width="28%"
        :title="title"
        :visible="dialogVisible"
        :before-close="handleClose">
      <el-form data-vv-scope="editForm">
        <ht-form-item label="父节点" label-width="100px" v-if="!sysType.id">
          <ht-input
              v-model="parentSysType.name"
              autocomplete="off"
              validate="required"
              disabled/>
        </ht-form-item>
        <ht-form-item label="分类名称" label-width="100px">
          <ht-input
              v-model="sysType.name"
              autocomplete="off"
              :validate="{required:true,max:40}"/>
        </ht-form-item>
        <ht-form-item label="分类Key" label-width="100px">
          <ht-input
              v-model="sysType.typeKey"
              v-pinyin="sysType.name"
              autocomplete="off"
              :validate="{required:true,alpha_dash:true,max:40}"
              placeholder="请输入key"/>
        </ht-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <ht-submit-button
            :url="saveUrl"
            :model="sysType"
            scope-name="editForm"
            @after-save-data="afterSaveData">{{$t('eip.common.save')}}</ht-submit-button>
        <el-button @click="handleClose">{{$t('eip.common.cancel')}}</el-button>
      </div>
    </ht-sidebar-dialog>
    <!--标签编辑页-->
    <ht-sidebar-dialog
        width="28%"
        :title="title"
        :visible="tagDialogVisible"
        :before-close="handleClose">
      <el-form :model="sysTag" data-vv-scope="editTagForm">
        <ht-form-item label="名称" label-width="80px">
          <ht-input
              v-model="sysTag.name"
              autocomplete="off"
              :validate="{required:true,max:40}"/>
        </ht-form-item>
        <ht-form-item label="KEY值" label-width="80px">
          <ht-input
              v-model="sysTag.key"
              v-pinyin="sysTag.name"
              autocomplete="off"
              :validate="{required:true,alpha_dash:true,max:40}"
              placeholder="请输入key"
              :disabled="sysTag.id?true:false"/>
        </ht-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <ht-submit-button
            :url="saveTagUrl"
            :model="sysTag"
            scope-name="editTagForm"
            @after-save-data="afterSaveTagData"
        >{{$t('eip.common.save')}}</ht-submit-button>
        <el-button @click="handleClose">{{$t('eip.common.cancel')}}</el-button>
      </div>
    </ht-sidebar-dialog>
    <el-dialog title="上传文件" :visible="uploadDialogVisible" :before-close="beforeClose"  name="uploadDialog" top="30vh" width="40%" custom-class="upload-dialog">
      <el-upload :action="uploadUrl" :http-request="handleImport" accept=".zip"
      :file-list="fileList" :limit="1" :auto-upload="false" ref="elUpload" class="upload-dialog__content">
        <el-button size="small" icon="el-icon-upload">点击上传</el-button>
        <div slot="tip" class="el-upload__tip">只能上传zip文件</div>
      </el-upload>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="uploadSubmit" >上传</el-button>
        <el-button type="default" @click="beforeClose">取消</el-button>
      </span>
    </el-dialog>
  </el-container>
</template>

<script>
  import portal from "@/api/portal";
  import styles from "@/assets/css/element-variables.scss";
  import req from "@/request.js";
  const HtSysTypeTree = () => import("@/components/common/HtSysTypeTree.vue");
  export default {
    name: "sys-tag-manager",
    components: {
      HtSysTypeTree
    },
    data(){
      return {
        width: styles.aside_width,
        asideShow: true,
        title: "添加标签分类",
        dialogVisible: false,
        tagDialogVisible: false,
        sysType: {
          children: [],
          icon: "{}",
          isLeaf: "N",
          typeKey: "",
          name: ""
        },
        sysTag:{
          name: "",
          key: "",
          typeKey: "",
          typeId: ""
        },
        parentSysType: {},
        tagDatas: [],
        currentNode:{},
        saveTagUrl: window.context.portal + "/portal/sysTag/v1/save",
        uploadDialogVisible: false,
        fileList: [],
        uploadUrl: window.context.portal + "/portal/sysTag/v1/import",
        typeId: "",
      }
    },
    computed: {
      navbarCollapseStyle: function() {
        if (this.asideShow) {
          return { left: parseInt(this.width) + "px" };
        }
        return { left: "0px" };
      },
      saveUrl: function () {

        return `${window.context.portal}/sys/sysType/v1/save?parentId=${this.parentSysType.id}&isRoot=${this.parentSysType.parentId == 0 ? 1 : 0}&isPriNode=0`;
      }
    },
    methods: {
      handleNodeClick(node){
        this.loadTagDatas(node);
        this.currentNode = node;
      },
      handleCommand(param){
        switch (param.action) {
          case "add":
            this.add(param.data);
            break;
          case "edit":
            this.edit(param.data);
            break;
          case "delete":
            this.delete(param.data);
            break;
          case "addTag":
            this.addTag(param.data);
            break;
          case "editTag":
            this.editTag(param.data);
            break;
          case "deleteTag":
            this.deleteTag(param.data);
            break;
          case "export":
            this.exportFile(param.data);
            break;
          case "import":
              this.importFile(param.data);
          default:
            break;
        }
      },
      handleClose(){
        this.dialogVisible = false;
        this.tagDialogVisible = false;
        this.sysTag = {
          name: "",
          key: "",
          typeKey: "",
          typeId: ""
        }
      },
      add(data){
        this.dialogVisible = true;
        this.title = "编辑标签分类";
        if (data) {
          this.sysType.id = "";
          this.sysType.name = "";
          this.sysType.typeKey = "";
          this.sysType.parentId = data.id;
          this.sysType.typeGroupKey = data.parentId == 0 ? data.typeKey : data.typeGroupKey;
          this.parentSysType = data;
        }
      },
      edit(data){
        this.sysType = {...data};
        this.title = "编辑标签分类";
        this.dialogVisible = true;
      },
      delete(data){
        if (data.id){
          this.$confirm(`是否确定删除 [${data.name}]  及其子分类（包含分类下标签项数据）?`, "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          }).then(() => {
            portal.removeTagByTypeId(data.id)
              .then(data => {
                  if (data.state) {
                    this.$message({type: "success", message: data.message || "删除成功"});
                    this.$refs.htSysTypeTree.loadData();
                    this.tagDatas = [];
                    this.currentNode = null;
                  }
                }
              )
              .catch(() => {
                this.dialogVisible = false;
              });
          });
        }
      },
      addTag(data){
        debugger;
        this.title = "新增标签";
        this.tagDialogVisible = true;
        if (data){
          this.sysTag.id = "";
          this.sysTag.name = "";
          this.sysTag.key = "";
          this.sysTag.typeKey = data.key;
          this.sysTag.typeId = data.id;
        }
      },
      editTag(data){
        this.title = "编辑标签";
        this.sysTag = {...data};
        this.tagDialogVisible = true;
      },
      deleteTag(data){
        if (data.id){
          this.$confirm(`是否确定删除 [${data.name}]?`, "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          }).then(() => {
            portal.removeTag(data.id).then(data => {
              if (data.state){
                this.$message({type: "success", message: data.message || "删除成功"});
                this.loadTagDatas(this.currentNode);
              }
            })
          }).catch(() => {
            this.dialogVisible = false;
          });
        }
      },
      afterSaveData(){
        this.dialogVisible = false;
        this.$refs.htSysTypeTree.loadData();
      },
      afterSaveTagData(){
        this.tagDialogVisible = false;
        this.loadTagDatas(this.currentNode);
      },
      loadTagDatas(node){
        if (node.id === "11")
          return;
        portal.getTagsByTypeId(node.id).then(data => {
          this.tagDatas = [];
          let head = {
            id: node.id,
            name: node.name,
            children: data,
            key: node.typeKey,
            parentId: -1
          };
          this.tagDatas.push(head);
        })
      },
      exportFile(data){
        let id = data.id;
        let url = window.context.portal+"/portal/sysTag/v1/export?typeId="+id;
        req.download(url);
      },
      beforeClose(){
        this.uploadDialogVisible = false;
        this.fileList = [];
      },
      handleImport(param){
        let formData = new FormData();
        formData.append("file",param.file);
        portal.importSysTags(formData,this.typeId).then(resp=>{
          if(resp.state){
            this.$message({type:"success",message:"导入成功"});
            this.uploadDialogVisible = false;
            this.fileList = [];
            this.loadTagDatas(this.currentNode);
          }else{
            this.beforeClose();
          }
        })
      },
      importFile(data){
        this.typeId = data.id;
        this.uploadDialogVisible = true;
      },
      uploadSubmit(){
      if(this.$refs.elUpload.uploadFiles.length == 0){
        this.$message({type:"warning",message:"请上传文件"});
      }
      this.$refs.elUpload.submit();
      },
      tagClick(data){
        this.editTag(data);
      },
      showEditPermission(data){
        if(!data){
          return false;
        }
        if(data.parentId === '0'){
          return false;
        }
        if(data.typeKey && data.typeKey === 'yybq' || data.typeKey === 'bdbq' ){
          return false;
        }
        return true;
      }
    }
  }
</script>

<style lang="scss"scoped>
  .el-main {
    padding: 0px;
  }
  >>>.custom-tree-node {
    width: calc(100% - 40px);
    /* flex: 1; */
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
  }
  >>>.navbar-collapse {
    position: absolute;
    top: 41%;
    cursor: pointer;
    z-index: 999;
    width:20px;
  }
  >>>.navbar-collapse-bg {
    -webkit-transition: all 0.12s ease;
    height: 50px;
    border-bottom: 8px solid transparent;
    border-right: none;
    border-left: 12px solid #ebebeb;
    border-top: 8px solid transparent;
    opacity: 0.9;
  }
  >>>.navbar-collapse-arrow {
    position: absolute;
    top: 38%;
    right: 4px;
    font-size: 18px;
    color: #a8a8a8;
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
