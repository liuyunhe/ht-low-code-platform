<template>
  <div>
    <el-dialog
      title="授权查询"
      :append-to-body="true"
      :visible.sync="dialogVisible"
      :before-close="()=>dialogVisible=false"
      :destroy-on-close="true"
      :close-on-click-modal="false"
      width="70%"
    >
      <el-container>
        <el-main>
          <ht-table
            @load="loadData"
            :data="data"
            :pageResult="pageResult"
            :selection="false"
            quick-search-props="defName,ownerName"
            :show-export="false"
            :showCustomColumn="false"
            ref="htTable"
            @row-click="rowClick"
          >
            <template v-slot:toolbar v-if="defRow && defRow.defKey">
              <el-button-group>
                <el-button size="small" @click="editAuth()" icon="el-icon-plus">新增授权</el-button>
              </el-button-group>
            </template>
            <template>
              <ht-table-column prop="rightType" label="授权类型" width="120" :filters="rightTypeFilters">
                <template v-slot="{row}">
                  <el-tag v-if="row.rightType == 'everyone'">所有人</el-tag>
                  <el-tag v-if="row.rightType == 'org'">组织</el-tag>
                  <el-tag v-if="row.rightType == 'role'">角色</el-tag>
                  <el-tag v-if="row.rightType == 'pos'">岗位</el-tag>
                  <el-tag v-if="row.rightType == 'user'">用户</el-tag>
                </template>
              </ht-table-column>
              <ht-table-column prop="ownerName" label="用户组名称" width="120" :show-overflow-tooltip="true"></ht-table-column>
              <ht-table-column prop="authDesc" label="所属授权" :show-overflow-tooltip="true">
                <template v-slot="{row}">
                  <el-link type="primary" @click="editAuth(row)" title="点击编辑">{{row.authDesc}}</el-link>
                </template>
              </ht-table-column>
              <ht-table-column prop="multiPle" label="类型" width="100" :filters="[{text: '流程定义', value: '1'}, {text: '流程分类', value: '2'}]">
                <template v-slot="{row}">
                  <el-tag v-if="row.multiPle == '1'">流程定义</el-tag>
                  <el-tag type="success" v-if="row.multiPle == '2'">流程分类</el-tag>
                </template>
              </ht-table-column>
              <ht-table-column prop="defName" label="名称" :show-overflow-tooltip="true"></ht-table-column>
              <ht-table-column prop="defKey" label="流程Key/分类ID" :show-overflow-tooltip="true"></ht-table-column>
              <ht-table-column prop="start" label="启动" width="80">
                <template v-slot="{row}">
                  <el-tag v-if="row.start == 1">是</el-tag>
                </template>
              </ht-table-column>
              <ht-table-column prop="management" label="定义" width="180">
                <template v-slot="{row}">
                  <span>{{getAuthDesc(row.content,'management')}}</span>
                </template>
              </ht-table-column>
              <ht-table-column prop="instance" label="实例" width="120">
                <template v-slot="{row}">
                <span>{{getAuthDesc(row.content,'instance')}}</span>
                </template>
              </ht-table-column>
              <ht-table-column prop="task" label="任务" width="80">
                <template v-slot="{row}">
                  <el-tag v-if="row.task == 1">是</el-tag>
                </template>
              </ht-table-column>
            </template>
          </ht-table>
        </el-main>
      </el-container>
    </el-dialog>
    <!-- 授权设置  -->
    <def-authorize-dialog
      ref="defAuthorizeDialog"
      name="defAuthorizeDialog"
      @onConfirm="authorizeConfirm"
    ></def-authorize-dialog>
  </div>
</template>
<script>
import req from "@/request.js";
const defAuthorizeDialog = () => import("@/components/dialog/DefAuthorizeDialog.vue");
export default {
  components: {
    defAuthorizeDialog,
  },
  name: "def-authorize-page-dialog",
  data() {
    return {
      pageResult: {
        page: 1,
        pageSize: 20,
        total: 0
      },
      data: [],
      dialogVisible: false,
      rightTypeFilters:[{text: '所有人', value: 'everyone'}, {text: '组织', value: 'org'}, {text: '岗位', value: 'pos'}, {text: '角色', value: 'role'}, {text: '用户', value: 'user'}],
      pageUrl:`${window.context.bpmModel}/flow/defAuthorize/v1/getAuthDetailPage`,
      defDescMap: {m_edit:'设计',m_del:'删除',m_start:'启动',m_set:'设置',m_clean:'清除数据'},
      instanceDescMap: {i_del:'删除',i_org:'本部门'},
      defRow:{},
    };
  },
  methods: {
    showDialog(row) {
      this.dialogVisible = true;
      this.defRow = row?row:{};
      this.loadData({});
    },
    //鼠标选中行改变复选框
    rowClick(row, column, event){
      this.$refs.htTable.$refs.htTable.toggleRowSelection(row);
    },
    loadData(param, cb) {
      param.querys || (param.querys = []);
      if(this.defRow.defKey){
        param.querys.push({
          group: "main",
          property: "defKey",
          value: this.defRow.defKey,
          operation: "EQUAL",
          relation: "AND"
        });
      }
      req.post(this.pageUrl,param)
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
    onConfirm(selectedNode) {
      this.$emit("onConfirm", {
        alias: selectedNode.alias,
        name: selectedNode.name
      });
      this.dialogVisible = false;
    },
    getAuthDesc(jsonStr,type){
      if(jsonStr){
        let _this = this;
        let jsonObj = JSON.parse(jsonStr);
        let descArray = [];
        for (let key in jsonObj) {
          if (jsonObj.hasOwnProperty(key)) {
            if(jsonObj[key]==true){
              if(type!='instance'){
                if(_this.defDescMap[key]){
                  descArray.push(_this.defDescMap[key]);
                }
              }else{
                if(_this.instanceDescMap[key]){
                  descArray.push(_this.instanceDescMap[key]);
                }
              }
            }
          }
        }
        if(descArray.length>0){
          return descArray.join("、");
        }
      }
      return '';
    },
    editAuth(row){
      this.$refs.defAuthorizeDialog.showDialog(row?row.id:'',this.defRow);
      this.dialogVisible = false;
    },
    authorizeConfirm(load){
      this.dialogVisible = true;
      if(load){
        this.$refs.htTable.load();
      }
    },
  }
};
</script>

<style lang="scss" scoped>
div[aria-invalid="true"] >>> .el-input__inner,
div[aria-invalid="true"] >>> .el-input__inner:focus {
  border-color: #f56c6c;
}
</style>