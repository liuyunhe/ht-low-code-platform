<template>
  <el-container class="fullheight" style="border: 1px solid #eee">
    <ht-aside-tree type-key="jzfl" @node-click="handleNodeClick" @check="treeCheck" />
    <el-container>
      <el-main>
        <ht-table
          @load="loadData"
          :data="data"
          :pageResult="pageResult"
          :selection="true"
          quick-search-props="code,name"
          :show-export="false"
          :show-custom-column="false"
          :default-querys="defaultQuerys"
          ref="htTable"
          @row-click="rowClick"
        >
          <template v-slot:toolbar>
            <el-button-group>
              <el-button size="small" @click="showDialog()" icon="el-icon-plus">添加</el-button>
              <ht-delete-button url="${uc}/uc/matrix/v1/remove" :htTable="$refs.htTable" style="margin:0;">删除</ht-delete-button>
            </el-button-group>
          </template>
          <template>
            <ht-table-column type="index" width="50" align="center" label="序号" />
            <ht-table-column prop="name" label="名称" :sortable="true" :show-overflow-tooltip="true">
              <template v-slot="{row}">
                <el-link type="primary" @click="showDialog(row.id)" title="查看详情">{{row.name}}</el-link>
              </template>
            </ht-table-column>
            <ht-table-column prop="code" label="别名" :sortable="true" :show-overflow-tooltip="true"></ht-table-column>
            <ht-table-column
              prop="typeName"
              label="分类名称"
              :sortable="true"
              :show-overflow-tooltip="true"
            ></ht-table-column>
            <ht-table-column
              prop="managerName"
              label="管理员"
              :sortable="true"
              :show-overflow-tooltip="true"
            ></ht-table-column>
            <ht-table-column prop="status" label="状态" :sortable="true">
              <template v-slot="{row}">
                <el-tag v-if="row.status === 0">待发布</el-tag>
                <el-tag type="success" v-if="row.status === 1">已发布</el-tag>
              </template>
            </ht-table-column>
            <!-- <ht-table-column
              prop="isDele"
              label="删除状态"
              :sortable="true"
              :show-overflow-tooltip="true"
            >
              <template v-slot="{row}">
                <el-tag v-if="row.isDele === 0">未删</el-tag>
                <el-tag type="danger" v-if="row.isDele === 1">已删</el-tag>
              </template>
            </ht-table-column> -->
            <ht-table-column
              prop="createTime"
              label="创建时间"
              :sortable="true"
              :show-overflow-tooltip="true"
            ></ht-table-column>
            <ht-table-column label="操作" width="150px">
              <template v-slot="{row}">
                <el-dropdown
                  size="mini"
                  split-button
                  @click="handleCommand({row:row,action:'toDataList'})"
                  @command="handleCommand"
                >
                  <span>人员设置</span>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item :command="{row:row,action:'publish'}" v-if="row.status===0">发布</el-dropdown-item>
                    <el-dropdown-item :command="{row:row,action:'setManager'}">设置管理员</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </template>
            </ht-table-column>
          </template>
        </ht-table>

        <ht-sidebar-dialog
          width="100%"
          title="矩阵配置"
          class="cd-column__dialog"
          :visible.sync="dialogVisible"
          :close-on-click-modal="false"
          :before-close="close"
          :show-close="false"
          append-to-body
        >
        <template slot="title">
            <div class="flex" style="justify-content: space-between">
              <el-page-header @back="dialogVisible = false" content="矩阵配置"></el-page-header>
              <el-button-group>
                <ht-submit-button
                  url="${uc}/uc/matrix/v1/save"
                  :model="matrix"
                  scope-name="matrixForm"
                  @before-save-data="beforeSaveData"
                  @after-save-data="afterSaveData"
                  :isSubmit="isSubmit"
                >保 存</ht-submit-button>
                <el-button @click="dialogVisible = false">取 消</el-button>
              </el-button-group>
            </div>
          </template>
          <el-form data-vv-scope="matrixForm">
            <el-row :gutter="20">
              <el-col :span="6">
                <el-card class="box-card  base-info">
                  <div slot="header" class="clearfix">
                    <span>基本信息</span>
                  </div>
                  <ht-form-item label="矩阵分类">
                    <EipSysTypeSelector
                      placeholder="请选择分类"
                      typeKey="jzfl"
                      v-model="matrix.typeName"
                      :sys-type-id.sync="matrix.typeId"
                      :validate="{ required: true }"
                      class="sys-type-selector"
                    />
                  </ht-form-item>
                  <ht-form-item label="矩阵名称">
                    <ht-input
                      v-model="matrix.name"
                      autocomplete="off"
                      :validate="{ required: true }"
                      placeholder="请输入矩阵名称"
                    />
                  </ht-form-item>
                  <ht-form-item label="矩阵别名">
                    <ht-input
                      v-model="matrix.code"
                      v-pinyin="matrix.name"
                      name="matrixName"
                      :validate="'required: true|regex:^[a-zA-Z][a-zA-Z0-9_]*$,只能输入字母、数字、下划线，且以字母开头'"
                      :disabled="matrix.id? true:false"
                      autocomplete="off"
                      placeholder="请输入矩阵别名"
                    />
                  </ht-form-item>
                </el-card>
              </el-col>
              <el-col :span="18">
                <el-tabs v-model="tabStatus" type="border-card">
                  <el-tab-pane label="条件字段" name="cond">
                    <span slot="label">
                      条件字段
                      <el-button size="mini" circle @click="addCol(matrix.condList)" title="添加条件字段">
                        <i class="el-icon-plus"></i>
                      </el-button>
                      <div></div>
                    </span>
                    <el-table :data="matrix.condList" border>
                      <el-table-column label="列中文名">
                        <template v-slot="{ row , $index }">
                          <ht-input
                            v-model="row.name"
                            placeholder="请输入列中文名"
                            autocomplete="off"
                            validate="required"
                            @blur="chineseFormat(matrix.condList,row.name,'code',$index)"
                          ></ht-input>
                        </template>
                      </el-table-column>
                      <el-table-column prop="code" label="列字段名">
                        <template v-slot="{ row }">
                          <ht-input
                            v-model="row.code"
                            placeholder="请输入列字段名"
                            autocomplete="off"
                            :validate="'required: true|regex:^[a-zA-Z][a-zA-Z0-9_]*$,只能输入字母、数字、下划线，且以字母开头'"
                            :disabled="row.id?true:false"
                          ></ht-input>
                        </template>
                      </el-table-column>
                      <el-table-column prop="ctrlType" label="控件类型">
                        <template v-slot="{ row ,$index}">
                          <ht-select
                            clearable
                            v-model="row.ctrlType"
                            :options="[{key:'select',value:'关联查询'},{key:'dialog',value:'对话框'}]"
                            validate="required"
                            @change="ctrlTypeChange(matrix.condList,$index)"
                          />
                        </template>
                      </el-table-column>
                      <el-table-column prop="queryAlias" label="数据来源">
                        <template v-slot="{ row }">
                          <ht-select
                            clearable
                            v-if="row.ctrlType == 'select'"
                            v-model="row.queryAlias"
                            :options="customQuerys"
                            :props="{ key: 'alias', value: 'name' }"
                            validate="required"
                            @change="()=>{row.bindKey='';row.bindValue=''}"
                          />
                          <ht-select
                            clearable
                            v-if="row.ctrlType == 'dialog'"
                            v-model="row.queryAlias"
                            :options="customDialogs"
                            :props="{ key: 'alias', value: 'name' }"
                            @change="()=>{row.bindKey='';row.bindValue=''}"
                          />
                        </template>
                      </el-table-column>
                      <el-table-column prop="bindKey" label="绑定id">
                        <template v-slot="{ row }">
                          <ht-select
                            clearable
                            v-if="row.ctrlType == 'select'"
                            v-model="row.bindKey"
                            :options="getResultField(row.ctrlType,row.queryAlias)"
                            :props="{ key: 'field', value: 'comment' }"
                            validate="required"
                          />
                          <ht-select
                            clearable
                            v-if="row.ctrlType == 'dialog'"
                            v-model="row.bindKey"
                            :options="getResultField(row.ctrlType,row.queryAlias)"
                            :props="{ key: 'field', value: 'comment' }"
                            validate="required"
                          />
                        </template>
                      </el-table-column>
                      <el-table-column prop="bindValue" label="绑定text">
                        <template v-slot="{ row }">
                          <ht-select
                            clearable
                            v-if="row.ctrlType == 'select'"
                            v-model="row.bindValue"
                            :options="getResultField(row.ctrlType,row.queryAlias)"
                            :props="{ key: 'field', value: 'comment' }"
                            validate="required"
                          />
                          <ht-select
                            clearable
                            v-if="row.ctrlType == 'dialog'"
                            v-model="row.bindValue"
                            :options="getResultField(row.ctrlType,row.queryAlias)"
                            :props="{ key: 'field', value: 'comment' }"
                            validate="required"
                          />
                        </template>
                      </el-table-column>
                      <el-table-column prop="status" label="发布状态" width="80">
                        <template v-slot="{ row }">
                          <el-tag v-if="row.status === 0">待发布</el-tag>
                          <el-tag type="success" v-if="row.status === 1">已发布</el-tag>
                        </template>
                      </el-table-column>
                      <el-table-column label="操作" width="180">
                        <template v-slot="{ row, $index }">
                          <el-button-group>
                            <el-button
                              icon="el-icon-caret-top"
                              size="mini"
                              title="上移"
                              :disabled="$index === 0"
                              @click="upGo(matrix.condList,$index)"
                            ></el-button>
                            <el-button
                              icon="el-icon-caret-bottom"
                              size="mini"
                              title="下移"
                              :disabled="$index === (matrix.condList.length-1)"
                              @click="downGo(matrix.condList,$index)"
                            ></el-button>
                            <el-button
                              size="mini"
                              icon="el-icon-delete"
                              @click="deleteCol(matrix.condList,$index)"
                            ></el-button>
                          </el-button-group>
                        </template>
                      </el-table-column>
                    </el-table>
                  </el-tab-pane>

                  <!-- 角色字段 -->
                  <el-tab-pane label="角色字段" name="role">
                    <span slot="label">
                      角色字段
                      <el-button size="mini" circle @click="addCol(matrix.roleList)" title="添加角色字段">
                        <i class="el-icon-plus"></i>
                      </el-button>
                    </span>
                    <el-table :data="matrix.roleList" border>
                      <el-table-column label="角色名">
                        <template v-slot="{ row , $index }">
                          <ht-input
                            v-model="row.name"
                            placeholder="请输入角色名"
                            autocomplete="off"
                            validate="required"
                            @blur="chineseFormat(matrix.roleList,row.name,'code',$index)"
                          ></ht-input>
                        </template>
                      </el-table-column>
                      <el-table-column prop="code" label="角色别名">
                        <template v-slot="{ row }">
                          <ht-input
                            v-model="row.code"
                            placeholder="请输入角色别名"
                            autocomplete="off"
                            :validate="'required: true|regex:^[a-zA-Z][a-zA-Z0-9_]*$,只能输入字母、数字、下划线，且以字母开头'"
                            :disabled="row.id?true:false"
                          ></ht-input>
                        </template>
                      </el-table-column>
                      <el-table-column prop="code" label="单选多选">
                        <template v-slot="{ row }">
                          <ht-radio
                            v-model="row.selectType"
                            :options="[{ key: 1, value: '单选' },{ key: 2, value: '多选' }]"
                            validate="required"
                            v-show="row.selectType?(row.selectType=row.selectType):(row.selectType=1)"
                          />
                        </template>
                      </el-table-column>
                      <el-table-column prop="status" label="发布状态" width="80">
                        <template v-slot="{ row }">
                          <el-tag v-if="row.status === 0">待发布</el-tag>
                          <el-tag type="success" v-if="row.status === 1">已发布</el-tag>
                        </template>
                      </el-table-column>
                      <el-table-column label="操作">
                        <template v-slot="{ row, $index }">
                          <el-button-group>
                            <el-button
                              icon="el-icon-caret-top"
                              size="mini"
                              title="上移"
                              :disabled="$index === 0"
                              @click="upGo(matrix.roleList,$index)"
                            ></el-button>
                            <el-button
                              icon="el-icon-caret-bottom"
                              size="mini"
                              title="下移"
                              :disabled="$index == (matrix.roleList.length-1)"
                              @click="downGo(matrix.roleList,$index)"
                            ></el-button>
                            <el-button
                              size="mini"
                              icon="el-icon-delete"
                              @click="deleteCol(matrix.roleList,$index)"
                            ></el-button>
                          </el-button-group>
                        </template>
                      </el-table-column>
                    </el-table>
                  </el-tab-pane>
                </el-tabs>
              </el-col>
            </el-row>
          </el-form>
        </ht-sidebar-dialog>
      </el-main>
    </el-container>

    <ht-load-data
      url="/form/customQuery/v1/list"
      requestMethod="post"
      context="form"
      @after-load-data="afterCustomQueryLoadData"
    ></ht-load-data>
    <!-- 获取对话框选项列表-->
    <ht-load-data
      url="/form/customDialog/v1/getAll"
      requestMethod="post"
      context="form"
      @after-load-data="afterCustomDialogLoadData"
    ></ht-load-data>
    <eip-user-dialog
      ref="eipUserDialog"
      name="eipUserDialog"
      :single="true"
      @onConfirm="saveManager"
      append-to-body
    />
  </el-container>
</template>

<script>
const htAsideTree = () => import("@/components/common/HtAsideTree.vue");
const EipSysTypeSelector = () => import("@/components/selector/EipSysTypeSelector.vue");
const eipUserDialog = () => import("@/components/dialog/EipUserDialog.vue");
import req from "@/request.js";
import uc from "@/api/uc.js";
export default {
  components: { htAsideTree, EipSysTypeSelector, eipUserDialog },
  data() {
    return {
      dialogVisible: false,
      data: [],
      pageResult: {
        page: 1,
        pageSize: 20,
        total: 0
      },
      matrixBlank: {
        code: "",
        name: "",
        condList: [
          {
            code: "",
            name: "",
            ctrlType: "",
            queryAlias: "",
            bindKey: "",
            bindValue: ""
          }
        ],
        roleList: [{ code: "", name: "", selectType: 1 }]
      },
      matrix: {},
      treeSidebarData: {},
      tabStatus: "cond",
      customQuerys: [],
      customDialogs: [], //对话框列表数据
      isSubmit: true,
      typeId: "",
      defaultQuerys: []
    };
  },
  mounted() {
    this.$validator = this.$root.$validator;
  },
  methods: {
    rowClick(row, column, event){
      this.$refs.htTable.$refs.htTable.toggleRowSelection(row);
    },
    handleCommand(param) {
      switch (param.action) {
        case "toDataList":
          this.toDataList(param.row);
          break;
        case "publish":
          this.publish(param.row.id);
          break;
        case "setManager":
          this.setManager(param.row.id);
          break;
      }
    },
    setManager(id) {
      this.curId = id;
      this.$refs.eipUserDialog.showDialog({});
    },
    saveManager(data){
      if(data.length==0||data.length>1){
        this.$message.warning("请选择一个用户");
        return;
      }
      data = data[0];
      let id = this.curId;
      req
        .get(window.context.uc + `/uc/matrix/v1/saveManager?id=${id}&userId=${data.id}&fullname=${data.fullname}`)
        .then(res => {
          if (res.data.state) {
            this.$message.success(res.data.message);
            this.$refs.htTable.load();
          }
        });
    },
    publish(id) {
      req
        .get(window.context.uc + `/uc/matrix/v1/publish?id=${id}`)
        .then(res => {
          if (res.data.state) {
            this.$message.success(res.data.message);
            this.$refs.htTable.load();
          }
        });
    },
    upGo(fieldData, index) {
      if (index != 0) {
        fieldData[index] = fieldData.splice(index - 1, 1, fieldData[index])[0];
      } else {
        fieldData.push(fieldData.shift());
      }
    },
    downGo(fieldData, index) {
      if (index != fieldData.length - 1) {
        fieldData[index] = fieldData.splice(index + 1, 1, fieldData[index])[0];
      } else {
        fieldData.unshift(fieldData.splice(index, 1)[0]);
      }
    },
    chineseFormat(list, chinese, prop, index) {
      //如果保存过的则不允许修改code
      if (list[index].id) {
        return;
      }
      let timer = null;
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(function() {
        req
          .request({
            url: `${window.context.uc}/base/tools/v1/getPinyin`,
            method: "GET",
            params: { chinese: chinese, type: 0 }
          })
          .then(res => {
            if (res.data.state) {
              list[index][prop] = res.data.value;
            }
          });
      }, 500);
    },
    deleteCol(list, index) {
      list.splice(index, 1);
    },
    addCol(list, index) {
      list.push({
        code: "",
        name: "",
        ctrlType: "",
        queryAlias: "",
        bindKey: "",
        bindValue: "",
        selectType:1
      });
    },
    handleNodeClick(item) {
      if(item.parentId != 0){
        this.$set(this.defaultQuerys, 0, {
          property: "type_id_",
          value: item.id,
          operation: "EQUAL"
        });
      }else{
        //清空旧的查询值
        this.defaultQuerys.splice(0);
      }
      this.$refs.htTable.load();
    },
    treeCheck(item, list) {
      if (list && list.checkedKeys && list.checkedKeys.length > 0) {
        this.$set(this.defaultQuerys, 0, {
          property: "type_id_",
          value: list.checkedKeys.join(","),
          operation: "IN"
        });
        this.$refs.htTable.load();
      }
    },
    close() {
      this.dialogVisible = false;
    },
    showDialog(id) {
      if (id) {
        this.$http.get("${uc}/uc/matrix/v1/getJson?id=" + `${id}`).then(
          resp => {
            this.matrix = resp.data;
            this.dialogVisible = true;
          },
          error => {
            reject(error);
          }
        );
      } else {
        this.matrix = JSON.parse(JSON.stringify(this.matrixBlank));
        //this.matrix = this.matrixBlank;
        this.dialogVisible = true;
      }
    },
    beforeCloseDialog() {
      this.matrix = JSON.parse(JSON.stringify(this.matrixBlank));
      // this.matrix = this.matrixBlank;
      this.dialogVisible = false;
    },
    loadData(param, cb) {
      param.querys || (param.querys = []);
      param.querys.push({
        property: "isDele",
        value: 0,
        operation: "EQUAL"
      });
      this.$http
        .post("${uc}/uc/matrix/v1/listJson", param)
        .then(
          resp => {
            let response = resp.data;
            this.data = response.rows;
            this.pageResult = {
              page: response.page,
              pageSize: response.pageSize,
              total: response.total
            };
          }
        )
        .finally(() => cb());
    },
    beforeSaveData() {
      this.isSubmit = true;
      if (!this.matrix.condList || this.matrix.condList.length == 0){
        this.isSubmit = false;
        this.$message.error("请填写字段名");
      }
      if (this.matrix.condList && this.matrix.condList.length > 0) {
        let code = this.checkPropIsRepeat(this.matrix.condList, "code");
        if (code) {
          this.isSubmit = false;
          this.tabStatus = "cond";
          this.$message.error(`列字段名[${code}]重复`);
        }
      }
      if (!this.matrix.roleList || this.matrix.roleList.length == 0){
        this.isSubmit = false;
        this.$message.error("请填写角色字段");
      }
      if (this.matrix.roleList && this.matrix.roleList.length > 0) {
        let code = this.checkPropIsRepeat(this.matrix.roleList, "code");
        if (code) {
          this.isSubmit = false;
          this.tabStatus = "role";
          this.$message.error(`角色别名[${code}]重复`);
        }
      }
    },
    checkPropIsRepeat(arr, key) {
      var obj = {};
      for (var i = 0; i < arr.length; i++) {
        let code = arr[i][key].toLowerCase();
        if (obj[code]) {
          return arr[i][key];
        } else {
          obj[code] = arr[i];
        }
      }
      return "";
    },
    afterSaveData() {
      setTimeout(() => {
        this.beforeCloseDialog();
        this.$refs.htTable.load();
      }, 500);
    },
    afterCustomQueryLoadData(data) {
      this.customQuerys = data.rows;
    },
    afterCustomDialogLoadData(data) {
      this.customDialogs = data;
    },
    toDataList(param) {
      if (param.status == 0){
        req
            .get(window.context.uc + `/uc/matrix/v1/publish?id=${param.id}`)
            .then(res => {
              if (res.data.state) {
                this.$message.success(res.data.message);
                this.$router.push({ path: `/matrixData/${param.id}` });
                this.$refs.htTable.load();
              }
            });
      }else{
        this.$router.push({ path: `/matrixData/${param.id}` });
      }
    },
    ctrlTypeChange(list, index) {
      list[index].queryAlias && (list[index].queryAlias = "");
      list[index].bindKey && (list[index].bindKey = "");
      list[index].bindValue && (list[index].bindValue = "");
    },
    getResultField(ctrlType, queryAlias) {
      if (ctrlType === "select") {
        for (let i = 0; i < this.customQuerys.length; i++) {
          let item = this.customQuerys[i];
          if (item.alias === queryAlias) {
            return JSON.parse(item.resultfield || "[]");
          }
        }
      } else if (ctrlType === "dialog") {
        for (let i = 0; i < this.customDialogs.length; i++) {
          let item = this.customDialogs[i];
          if (item.alias === queryAlias) {
            return JSON.parse(item.resultfield || "[]");
          }
        }
      }
    }
  }
};
</script>
<style scoped>
.cd-column__dialog >>> .el-dialog__body {
  height: calc(100vh - 300px);
}
.sys-type-selector {
  width: 215px;
}
.is-circle {
  padding: 9px;
}
.cd-column__dialog /deep/  .el-dialog > .el-dialog__header {
    padding: 8px 20px;
  }
.base-info >>> .el-card__body {
  padding-left: 0;
  padding-right:5px;
}
</style>
