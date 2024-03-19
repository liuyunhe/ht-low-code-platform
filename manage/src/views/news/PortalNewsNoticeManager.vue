<template>
  <el-container class="fullheight">
    <el-aside width="230px" style="overflow-x:hidden;border: 1px solid #eee">
      <el-tree
        :data="treeData"
        node-key="id"
        default-expand-all
        :expand-on-click-node="false"
        @node-click="handleNodeClick"
      >
        <span class="custom-tree-node" slot-scope="{ node, data }">
          <span class="show-ellipsis" :title="node.name">{{ data.name }}</span>
          <el-dropdown @command="handleCommand">
            <span class="el-dropdown-link">
              <i class="icon-more" title="更多操作" />
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item
                v-if="data.rank!=3"
                icon="el-icon-plus"
                :command="{node:node,data,action:'add'}"
              >添加</el-dropdown-item>
              <el-dropdown-item v-if="data.rank != 3" icon="el-icon-upload2" :command="{node:node,data,action:'importTree'}">导入</el-dropdown-item>
              <el-dropdown-item v-if="data.rank != 3" icon="el-icon-download" :command="{node:node,data,action:'exportTree'}">导出</el-dropdown-item>
              <el-dropdown-item icon="el-icon-edit" :command="{node:node,data,action:'edit'}">编辑</el-dropdown-item>
              <el-dropdown-item
                icon="el-icon-delete"
                v-if="data.rank!=1"
                :command="{node:node,data,action:'delete'}"
                divided
              >删除</el-dropdown-item>
              <el-dropdown-item
                v-if="data.rank==3"
                icon="el-icon-s-promotion"
                :command="{node:node,data,action:'issue'}"
              >发布栏目</el-dropdown-item>
              <el-dropdown-item
                      v-if="data.rank==3 && data.mobileIssue == 0"
                      icon="el-icon-s-promotion"
                      :command="{node:node,data,action:'mobileIssue'}"
              >发布到手机端</el-dropdown-item>
              <el-dropdown-item
                      v-if="data.rank==3 && data.mobileIssue == 1"
                      icon="el-icon-s-promotion"
                      :command="{node:node,data,action:'mobileRemove'}"
              >取消手机端发布</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </span>
      </el-tree>
    </el-aside>
    <el-container>
      <el-main>
        <ht-table
          @load="loadData"
          :data="data"
          :pageResult="pageResult"
          :selection="true"
          quick-search-props="title"
          :show-export="false"
          :show-custom-column="false"
          ref="htTable"
        >
          <template v-slot:toolbar>
            <el-button-group>
              <el-button size="small" @click="showDialog()" icon="el-icon-plus">添加</el-button>
              <el-button size="small" icon="el-icon-upload2" @click="showImportDialog">导入</el-button>
              <el-button size="small" icon="el-icon-download" @click="exportNews">导出</el-button>
              <ht-delete-button url="${portal}/portalNewsNotice/v1/" :htTable="$refs.htTable" style="margin:0;">删除</ht-delete-button>
            </el-button-group>
          </template>
          <template>
            <ht-table-column type="index" width="50" align="center" label="序号" />
            <ht-table-column prop="title" label="标题" :sortable="true" :show-overflow-tooltip="true">
              <template v-slot="{row}">
                <el-link type="primary" @click="showDialog(row.id)" title="查看详情">{{row.title}}</el-link>
              </template>
            </ht-table-column>
            <ht-table-column
              prop="classifyName"
              label="所属分类"
              :sortable="true"
              :show-overflow-tooltip="true"
            ></ht-table-column>
            <ht-table-column prop="sn" label="排序" :sortable="true" :show-overflow-tooltip="true"></ht-table-column>
            <ht-table-column
              prop="endTime"
              label="过期时间"
              :sortable="true"
              :show-overflow-tooltip="true"
            ></ht-table-column>
            <ht-table-column
              prop="createTime"
              label="创建时间"
              :sortable="true"
              :show-overflow-tooltip="true"
            ></ht-table-column>
            <ht-table-column prop="createByName" label="创建人" :show-overflow-tooltip="true"></ht-table-column>
            <ht-table-column
              prop="updateTime"
              label="更新时间"
              :sortable="true"
              :show-overflow-tooltip="true"
            ></ht-table-column>
            <ht-table-column
              prop="type"
              label="所属类型"
              :sortable="true"
              :show-overflow-tooltip="true"
            >
              <template v-slot="{row}">{{row.type == 1 ? "轮播图":"新闻公告"}}</template>
            </ht-table-column>
          </template>
        </ht-table>
      </el-main>
    </el-container>
    <ht-sidebar-dialog
      width="28%"
      title="实体信息"
      class="sp-manager__dialog"
      :visible="treeDialogVisible"
      :before-close="treeBeforeCloseDialog"
    >
      <el-form v-form data-vv-scope="PortalNewsTreeForm">
        <ht-form-item label="名称" label-width="150px">
          <ht-input v-model="PortalNewsTree.name" validate="required" />
        </ht-form-item>
        <ht-form-item label="排序" label-width="150px">
          <el-input-number v-model="PortalNewsTree.sn" :min="1" :max="1000"></el-input-number>
        </ht-form-item>
        <ht-form-item label="首页栏目高度" label-width="150px">
          <ht-input v-model="PortalNewsTree.colHeight" validate="required" type="number" />
        </ht-form-item>
        <ht-form-item
          label="轮播图切换时间"
          label-width="150px"
          v-if="PortalNewsTree.rank==3&& PortalNewsTree.path && PortalNewsTree.path.indexOf('200.') == 0"
        >
          <el-tooltip
            class="item"
            effect="dark"
            content="自动切换的时间间隔，单位为毫秒,默认值3000 "
            placement="top-start"
          >
            <ht-input v-model="PortalNewsTree.intervalTime" type="number" />
          </el-tooltip>
        </ht-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <ht-submit-button
          url="${portal}/portalNewsTree/v1/createEntity"
          :model="PortalNewsTree"
          :request-method="saveMethod"
          scope-name="PortalNewsTreeForm"
          @after-save-data="treeAfterSaveData"
        >{{$t("eip.common.save")}}</ht-submit-button>
        <el-button @click="treeBeforeCloseDialog">{{$t("eip.common.cancel")}}</el-button>
      </div>
    </ht-sidebar-dialog>
    <ht-sidebar-dialog
      width="32%"
      title="实体信息"
      class="sp-manager__dialog message__dialog"
      :visible="dialogVisible"
      :before-close="beforeCloseDialog"
    >
      <el-form v-form data-vv-scope="PortalNewsNoticeForm">
        <ht-form-item label="所属分类" label-width="150px">
          {{PortalNewsNotice.classifyName}}
          <el-button @click="selectNodeFun">选择</el-button>
        </ht-form-item>
        <ht-form-item label="所属类型" label-width="150px">{{PortalNewsNotice.type==1? "轮播图" :"新闻公告" }}</ht-form-item>
        <ht-form-item label="标题" label-width="150px">
          <ht-input v-model="PortalNewsNotice.title" validate="required" type="textarea" :rows="2"/>
        </ht-form-item>
        <ht-form-item label="标题描述" label-width="150px">
          <ht-input v-model="PortalNewsNotice.titleDescription" type="textarea" :rows="3" :maxlength="50" show-word-limit/>
        </ht-form-item>
        <ht-form-item label="是否外部链接" label-width="150px">
          <ht-radio
            v-model="PortalNewsNotice.isUrl"
            :options="[{key:'true',value:'是'},{key:'false',value:'否'}]"
            validate="required"
          />
        </ht-form-item>
        <ht-form-item label="页面嵌套高度" label-width="150px" v-if="PortalNewsNotice.isUrl=='true'">
          <ht-input v-model="PortalNewsNotice.pageHeight" validate="required" />
        </ht-form-item>
        <ht-form-item label="外部URL" v-if="PortalNewsNotice.isUrl=='true'" label-width="150px">
          <ht-input v-model="PortalNewsNotice.url" validate="required" />
        </ht-form-item>
        <ht-form-item label="内容" label-width="150px" v-if="PortalNewsNotice.isUrl=='false'">
          <vue-ueditor-wrap v-model="PortalNewsNotice.content" :config="config"></vue-ueditor-wrap>
          <ht-input v-show="false" v-model="PortalNewsNotice.content" validate="required" />
        </ht-form-item>

        <ht-form-item label="轮播展示图片" label-width="150px" v-if="PortalNewsNotice.type==1" class="is-required">
          <el-image style="width: 400px; height: 400px" :src="photoUrl" v-if="photoUrl!=''"></el-image>
          <el-upload action="string" :http-request="updateUserImage" :show-file-list="false">
            <el-button size="small" type="primary">点击上传</el-button>
          </el-upload>
          <ht-input
            v-show="false"
            v-model="PortalNewsNotice.rotatingDisplayPictures"
            validate="required"
          />
        </ht-form-item>
        <ht-form-item label="排序" label-width="150px">
          <ht-input v-model="PortalNewsNotice.sn" validate="required" type="number" />
        </ht-form-item>
        <ht-form-item label="过期时间" label-width="150px">
          <ht-date v-model="PortalNewsNotice.endTime" />
          <el-tooltip class="item" effect="dark" content="未设置过期时间，则永不过期" placement="right-start">
            <span class="el-icon-question" style="margin-left: 10px">
              <strong class="labelTitle" style="margin-left: 1px"></strong>
            </span>
          </el-tooltip>
        </ht-form-item>
        <ht-form-item label="拟稿人" label-width="150px">
          <ht-input v-model="PortalNewsNotice.drafter" validate="required" />
        </ht-form-item>
        <ht-form-item label="图标" label-width="150px" v-if="PortalNewsNotice.type==2">
          <span :class="'cv-icon icon iconfont '+PortalNewsNotice.icon" />
          <icon-dialog @selected="selectIcon($event)" class="cv-icon__dialog" />
        </ht-form-item>
        <ht-form-item label="附件" label-width="150px">
          <FileUpload
            ref="newsFile"
            model-name="PortalNewsNotice.file"
            :accept="`.jpg,.jpeg,.png,.bmp,.pdf,.JPG,.JPEG,.PNG,.BMP,.PDF,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.rtf,.txt,.zip,.rar,.vsd,.dwg`"
            :limit="20"
            multiple
          ></FileUpload>
        </ht-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <ht-submit-button
          url="${portal}/portalNewsNotice/v1/"
          :model="PortalNewsNotice"
          :request-method="saveMethod"
          scope-name="PortalNewsNoticeForm"
          @before-save-data="beforeSaveData"
          @after-save-data="afterSaveData"
        >{{$t("eip.common.save")}}</ht-submit-button>
        <el-button @click="beforeCloseDialog">{{$t("eip.common.cancel")}}</el-button>
      </div>
    </ht-sidebar-dialog>
    <el-dialog title="分类选择" :visible.sync="nodeDialogVisible" width="20%">
      <el-tree
        :data="treeData"
        node-key="id"
        default-expand-all
        :expand-on-click-node="false"
        @node-click="selectNodeClick"
      >
        <span class="custom-tree-node" slot-scope="{ node, data }">
          <span class="show-ellipsis" :title="node.name">{{ data.name }}</span>
        </span>
      </el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="confirmNodeClick">确 定</el-button>
        <el-button @click="nodeDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
    <el-dialog :title="uploadType=='tree' ? '上传分类' : '上传公告'" :visible="uploadDialogVisible" :before-close="beforeClose" name="uploadDialog" width="40%" top="30vh" custom-class="upload-dialog">
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
    <el-dialog :visible.sync="exportDialogVisible" width="30%" title="请选择导出类型">
      <el-select v-model="exportType" style="width:100%">
        <el-option value="1" label="仅导出菜单数据"></el-option>
        <el-option value="2" label="导出菜单和公告"></el-option>
      </el-select>

      <span slot="footer" class="dialog-footer">
        <el-button @click="exportDialogVisible = false">取消</el-button>
        <el-button @click="confirmExport" type="primary">确定</el-button>
      </span>
    </el-dialog>
  </el-container>
</template>
<script>
const htMenuTree = () => import("@/components/system/HtMenuTree.vue");
const HtEditor = () => import("@/components/common/HtEditor.vue");
const iconDialog = () => import("@/components/dialog/IconDialog.vue");
const FileUpload = () => import("@/components/common/FileUpload.vue");
import uc from "@/api/uc.js";
import req from "@/request.js";
import portal from '@/api/portal.js'

export default {
  components: {
    FileUpload,
    htMenuTree,
    HtEditor,
    iconDialog
  },
  data() {
    return {
      config:{
        initialFrameHeight: 240,
        UEDITOR_HOME_URL: window.location.origin +'/'+ window.location.pathname.split('/')[1]+'/static/ueditor/',
        toolbars: [
          [
            // 'source', //源代码
            'undo', //撤销
            'bold', //加粗
            'indent', //首行缩进
            'italic', //斜体
            'underline', //下划线
            'strikethrough', //删除线
            'subscript', //下标
            'fontborder', //字符边框
            'superscript', //上标
            'formatmatch', //格式刷
            'forecolor',//字体颜色
            'justifyleft', //居左对齐
            'justifycenter', //居中对齐
            'justifyright', //居右对齐
            'justifyjustify', //两端对齐
            'fontfamily', //字体
            'fontsize', //字号
            'insertorderedlist', //有序列表
            'insertunorderedlist', //无序列表
            'lineheight',//行间距
            'inserttable', //插入表格
            'link', //超链接
            'simpleupload', //单图上传
            'insertimage', //多图上传
            'attachment', //附件
          ]
        ],
        // 初始容器宽度
        initialFrameWidth: "100%",
        zIndex:9999,
        enableAutoSave: false,
        readonly : false
      },
      srcList: [this.photoUrl],
      photoDialogVisible: true,
      photoUrl: "/img/defaultPhoto.jpg",
      selectNode: {},
      selectTree: {},
      treeData: [],
      nodeDialogVisible: false,
      treeDialogVisible: false,
      dialogVisible: false,
      data: [],
      pageResult: {
        page: 1,
        pageSize: 50,
        total: 0
      },
      PortalNewsTree: {
        colHeight: 100
      },
      PortalNewsNotice: {pageHeight:800},
      saveMethod: "POST",
      uploadUrl:"",
      uploadDialogVisible:false,
      fileList:[],
      exportType:"1",
      exportDialogVisible:false,
      exportNode:{},
      uploadType:"",
      importClassifyId:"",
    };
  },
  mounted() {
    this.$validator = this.$root.$validator;
  },
  created() {
    this.getTreedata();
  },
  methods: {
    beforeSaveData() {
      if (this.$refs.newsFile.getFiles() != "") {
        this.PortalNewsNotice.file = JSON.stringify(
          this.$refs.newsFile.getFiles()
        );
      }
    },
    selectIcon(data) {
      this.PortalNewsNotice.icon = data;
      this.$forceUpdate();
    },
    issue(node, data) {
      req.get("${portal}/portalNewsTree/v1/issue?id=" + data.id).then(resp => {
        if (resp.data.state) {
          this.$message({
            message: "操作成功!",
            type: "success"
          });
          this.getTreedata();
        } else {
          // this.$message.error(resp.data.message);
        }
        this.getTreedata();
      });
    },
    updateUserImage(param) {
      const formData = new FormData();
      formData.append("files", param.file);
      uc.fileUpload(formData)
        .then(response => {
          this.PortalNewsNotice.rotatingDisplayPictures = response.fileId;
          this.$store
            .dispatch("menu/downloadImg", response.fileId)
            .then(res => {
              if (res != "") {
                this.photoUrl = res;
              }
            });
          param.onSuccess(); // 上传成功的图片会显示绿色的对勾
        })
        .catch(response => {
          param.onError();
        });
    },
    confirmNodeClick() {
      this.PortalNewsNotice.classifyId = this.selectTree.id;
      this.PortalNewsNotice.classifyName = this.selectTree.name;
      this.PortalNewsNotice.classifyPath = this.selectTree.path;
      if (this.selectTree.path.indexOf("200.") == 0) {
        this.PortalNewsNotice.type = 1;
      } else {
        this.PortalNewsNotice.type = 2;
      }
      this.nodeDialogVisible = false;
    },
    selectNodeClick(data, node, obj) {
      if (data.rank != 3) {
        this.$message.error("只能选择最下级菜单!");
      } else {
        this.selectTree = data;
      }
    },
    selectNodeFun() {
      this.nodeDialogVisible = true;
    },
    handleNodeClick(data, node, obj) {
      if (data.rank != 3) {
        this.selectNode = {};
        this.$message.error("只有最下级菜单才拥有数据!");
      } else {
        this.selectNode = data;
      }
      this.$refs.htTable.load();
    },
    handleCommand(obj) {
      if (obj.action == "add") {
        this.appendTree(obj.node, obj.data, obj.action);
      } else if (obj.action == "edit") {
        this.appendTree(obj.node, obj.data, obj.action);
      } else if (obj.action == "delete") {
        this.removeTree(obj.node, obj.data);
      } else if (obj.action == "issue") {
        this.issue(obj.node, obj.data);
      }else if(obj.action == "mobileIssue"){
        this.mobileIssue(obj.node,obj.data);
      }else if(obj.action == "mobileRemove"){
        this.mobileRemove(obj.node,obj.data);
      }else if(obj.action == "exportTree"){
        this.exportTree(obj.node,obj.data);
      }else if(obj.action == 'importTree'){
        this.importTree(obj.node,obj.data);
      }
    },
    mobileIssue(node, data){
      req
        .get("${portal}/portalNewsTree/v1/mobileIssue?id=" + data.id)
        .then((resp) => {
          if (resp.data.state) {
            this.$message({
              message: "操作成功!",
              type: "success",
            });
            this.getTreedata();
          }
        });
    },
    mobileRemove(node, data){
      req
        .remove("${portal}/portalNewsTree/v1/mobileRemove?id=" + data.id)
        .then((resp) => {
          if (resp.data.state) {
            this.$message({
              message: "操作成功!",
              type: "success",
            });
            this.getTreedata();
          }
        });
    },
    appendTree(node, data, type) {
      if (type == "add") {
        this.PortalNewsTree.parentId = data.id;
        this.PortalNewsTree.rank = data.rank + 1;
        this.PortalNewsTree.parentName = data.name;
        this.PortalNewsTree.mobileIssue=0;
      } else {
        this.PortalNewsTree = data;
      }
      this.treeDialogVisible = true;
    },
    removeTree(node, data) {
      this.$confirm('确定要删除【'+data.name+'】吗？','提示',{
        confirmButtonText:"删除",
        confirmButtonClass:"el-button--danger",
        cancelButtonText:"取消",
        type:"warning",
      }).then(()=>{
        req.remove("${portal}/portalNewsTree/v1/" + data.id).then(resp => {
          if (resp.data.state) {
            this.$message({
              message: "操作成功!",
              type: "success"
            });
            this.getTreedata();
          } else {
            this.$message.error("操作失败!");
          }
        });
      }).catch(()=>{

      })
    },
    getTreedata() {
      this.$http.get("${portal}/portalNewsTree/v1/getTree").then(
        resp => {
          this.treeData = resp.data;
        },
        error => {
          reject(error);
        }
      );
    },
    showDialog(id) {
      if (id) {
        this.saveMethod = "PUT";
        this.$http.get("${portal}/portalNewsNotice/v1/" + id).then(
          resp => {
            this.PortalNewsNotice = resp.data;

            let _this = this;
            setTimeout(function() {
              if (_this.PortalNewsNotice.file) {
                _this.$refs.newsFile.setFiles(
                  JSON.parse(_this.PortalNewsNotice.file)
                );
              }
            }, 1000);
            if (
              this.PortalNewsNotice.type == 1 &&
              this.PortalNewsNotice.rotatingDisplayPictures
            ) {
              this.$store
                .dispatch(
                  "menu/downloadImg",
                  this.PortalNewsNotice.rotatingDisplayPictures
                )
                .then(res => {
                  if (res != "") {
                    this.photoUrl = res;
                  }
                });
            }
            this.dialogVisible = true;
          },
          error => {
            reject(error);
          }
        );
      } else {
        this.PortalNewsNotice = {drafter:"",pageHeight:800};
        if (sessionStorage.getItem("currentUser")) {
          let user = JSON.parse(sessionStorage.getItem("currentUser"));
          this.PortalNewsNotice.drafter =  _.cloneDeep(user.username);
        }

        if (
          JSON.stringify(this.selectNode) !== "{}" &&
          this.selectNode.rank === 3
        ) {
          this.PortalNewsNotice.classifyId = this.selectNode.id;
          this.PortalNewsNotice.classifyName = this.selectNode.name;
          this.PortalNewsNotice.classifyPath = this.selectNode.path;
          if (this.selectNode.path.indexOf("200.") == 0) {
            this.PortalNewsNotice.type = 1;
          } else {
            this.PortalNewsNotice.type = 2;
          }
        }
        this.saveMethod = "POST";
        this.dialogVisible = true;
      }
    },
    beforeCloseDialog() {
      this.$set(this,"PortalNewsNotice",{})
      this.$set(this,"photoUrl","")
      // this.PortalNewsNotice = {};
      this.$refs.newsFile.clearFiles();
      this.dialogVisible = false;
    },
    treeBeforeCloseDialog() {
      this.PortalNewsTree = {};
      this.treeDialogVisible = false;
    },
    loadData(param, cb) {
      if (JSON.stringify(this.selectNode) === "{}") {
        cb && cb();
        return;
      } else {
        if (param.querys && param.querys instanceof Array) {
          param.querys.push({
            property: "classifyId",
            value: this.selectNode.id,
            group: "advance",
            relation: "AND",
            operation: "EQUAL"
          });
        } else {
          param.querys = [
            {
              property: "classifyId",
              value: this.selectNode.id,
              group: "advance",
              relation: "AND",
              operation: "EQUAL"
            }
          ];
        }
      }
      this.$http
        .post("${portal}/portalNewsNotice/v1/query", param)
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
          error => {
            reject(error);
          }
        )
        .finally(() => cb && cb());
    },
    afterSaveData() {
      setTimeout(() => {
        this.beforeCloseDialog();
        this.$refs.htTable.load();
      }, 500);
    },
    treeAfterSaveData() {
      setTimeout(() => {
        this.treeBeforeCloseDialog();
        this.getTreedata();
      }, 500);
    },
    exportNews(){
       let selection = this.$refs.htTable.$refs.htTable.selection;
       if(!selection || selection.length == 0){
         this.$message.warning("请至少选择一条记录");
         return ;
       }
       let ids = new Array();
       selection.forEach(item=>{
         ids.push(item.id);
       })
       this.$http.request({
         url:`${window.context.portal}/portalNewsNotice/v1/exportNews`,
         method:"POST",
         data:ids,
         responseType:"arraybuffer"
       })
    },
    beforeClose(){
      this.uploadDialogVisible = false;
      this.fileList.splice(0);
    },
    handleImport(param){
      if(this.uploadType == 'notice'){
        let formData = new FormData();
        formData.append("file",param.file);
        portal.importNews(formData,this.selectNode.id).then(resp=>{
          if(resp.state){
            this.$message.success(resp.message);
            this.fileList.splice(0);
            this.uploadDialogVisible = false;
            this.$refs.htTable.load();
          }else{
            this.beforeClose();
          }
        })
      }else if(this.uploadType == 'tree'){
        let formData = new FormData();
        formData.append("file", param.file);
        portal.importTree(formData,this.importClassifyId).then(resp=>{
          if(resp.state){
            this.$message.success(resp.message);
            this.fileList.splice(0);
            this.uploadDialogVisible = false;
            this.getTreedata();
          }else{
            this.beforeClose();
          }
        })
      }
    },
    showImportDialog(){
      if(!this.selectNode || this.selectNode.rank != 3){
        this.$message.warning("请先选择分类");
        return ;
      }
      this.uploadType = "notice"
      this.uploadDialogVisible = true;
    },
    uploadSubmit(){
      if(this.$refs.elUpload.uploadFiles.length == 0){
        this.$message.warning("请上传文件");
        return ;
      }
      this.$refs.elUpload.submit();
    },
    exportTree(node,data){
      this.exportNode = data;
      this.exportDialogVisible = true;
      
    },
    confirmExport(){
      //导出分类信息
      this.$http.request({
        url:`${window.context.portal}/portalNewsTree/v1/exportTree?exportType=${this.exportType}`,
        method:"POST",
        data:this.exportNode,
        responseType:"arraybuffer"
      }).then(()=>{
        this.exportType = "1";
        this.exportDialogVisible = false
      })
    },
    importTree(node,data){
      //导入分类信息
      this.importClassifyId = data.id;
      this.uploadType = "tree"
      this.uploadDialogVisible = true;
    },
  }
};
</script>

<style lang="scss" scoped>
.sp-manager__dialog > .el-dialog > .el-dialog__body {
  height: calc(100% - 170px);
}
>>> .el-dialog__body {
  height: calc(100% - 170px);
}
.ht-sys-type-tree {
  width: 100%;
}

>>> .el-dropdown {
  display: none;
}
>>> .el-header {
  border-bottom: 1px solid #ccc;
  button {
    float: right;
    margin-left: 5px;
  }
}

>>> .el-tree-node__content:hover .el-dropdown {
  display: inline-block;
}

>>> .navbar-collapse {
  position: relative;
  top: -60%;
  cursor: pointer;
  width: 20px;
}

>>> .navbar-collapse.navbar-collapse-right {
  top: 40%;
}

>>> .navbar-collapse:hover {
  transform: scale(1) translateY(2px);
}

>>> .navbar-collapse:hover .navbar-collapse-arrow {
  color: #333333;
}

>>> .navbar-collapse-arrow {
  position: relative;
  top: 38%;
  right: 15px;
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
  bottom: 7px;
}

.custom-tree-node {
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
@media (max-width: 1024px){
    /deep/ .search-container__col{
      flex-wrap: wrap;
      .el-button-group{
        margin-top: 10px;
      }
  }
  .message__dialog{
    /deep/ .el-dialog{
      width: 50% !important;
    }
  }
}
  /deep/ .el-dialog.upload-dialog{
    height:unset;
    /deep/ .el-dialog__body{
      height:unset;
    }
    .upload-dialog__content{
      height:150px;
    }
    min-height: unset;
  }
</style>
