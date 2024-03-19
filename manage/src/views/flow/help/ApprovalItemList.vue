<template>
  <div class="fullheight">
    <ht-table
      @load="loadData"
      @row-click="rowClick"
      :data="data"
      :page-result="pageBean"
      :selection="true"
      :default-sorter="[{direction:'ASC',property:'UPDATE_TIME_'}]"
      quick-search-props="expression"
      ref="htTable"
      :show-export="false"
      :show-custom-column="false"
    >
      <template v-slot:toolbar>
        <el-button-group>
          <el-button size="small" @click="handleOpen('添加常用语')" icon="el-icon-plus">添加</el-button>
          <ht-delete-button :url="formDeleteUrl()" :htTable="$refs.htTable" style="margin:0;">删除</ht-delete-button>
        </el-button-group>
      </template>
      <template>
        <ht-table-column type="index" width="50" align="center" label="序号" />
        <ht-table-column prop="expression" label="常用语" :sortable="true">
          <template slot-scope="scope">
            <el-link type="primary" @click="handleOpen('编辑常用语',scope.row)">{{scope.row.expression}}</el-link>
          </template>
        </ht-table-column>
        <ht-table-column prop="updateTime" width="200" align="center" label="更新时间" />
        <ht-table-column prop="type" label="常用语类型">
          <template slot-scope="scope">
            <span v-if="scope.row.type == '1'">系统全局</span>
          </template>
        </ht-table-column>
      </template>
    </ht-table>

    <ht-sidebar-dialog
      width="25%"
      :title="title"
      :visible.sync="dialogVisible"
      :before-close="handleClose"
      append-to-body
    >
      <el-form :model="formData" data-vv-scope="approvalForm">
        <el-row>
          <el-col>
            <ht-form-item label="常用语类型" label-width="90px">
              <el-radio v-model="formData.type" :label="1">
                <span>系统全局</span>
              </el-radio>
            </ht-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col>
            <ht-form-item label="常用语" label-width="80px">
              <ht-input v-model="formData.expression" :validate="{ required: true }" :maxlength="50" :showWordLimit="true" />
            </ht-form-item>
          </el-col>
        </el-row>
        <!--暂时注释，后续再做完善-->
        <!--<el-row>
          <el-col>
            <ht-form-item label="部门" label-width="80px">
              <ht-select
                clearable
                v-model="formData.departmentId"
                :options="departmentList"
                :props="{ key: 'id', value: 'name' }"
              />
            </ht-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col>
            <ht-form-item label="角色" label-width="80px">
              <ht-select
                clearable
                v-model="formData.roleId"
                :options="roleList"
                :props="{ key: 'id', value: 'name' }"
              />
            </ht-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col>
            <ht-form-item label="岗位" label-width="80px">
              <ht-select
                clearable
                v-model="formData.postId"
                :options="postList"
                :props="{ key: 'id', value: 'name' }"
              />
            </ht-form-item>
          </el-col>
        </el-row>-->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <ht-submit-button
          :url="saveUrl()"
          :model="formData"
          :is-submit="isSubmit"
          scope-name="approvalForm"
          @before-save-data="beforeSaveData()"
          @after-save-data="afterSaveData()"
        >保存</ht-submit-button>
        <el-button @click="handleClose">取 消</el-button>
      </div>
    </ht-sidebar-dialog>
  </div>
</template>

<script>
import flow from "@/api/flow.js";
export default {
  props: {},
  data() {
    return {
      isSubmit: false,
      title: "",
      dialogVisible: false,
      pa: {
        page: 1,
        pageSize: 20,
        total: 0
      },
      formData: {
        type: 1,
        expression: "",
        departmentId: "",
        roleId: "",
        postId: ""
      },
      pageBean: {
        page: 1,
        pageSize: 20,
        total: 0
      },
      data: [],
      postList: [],
      roleList: [],
      departmentList: []
    };
  },
  methods: {
    rowClick(row, column, event){
      this.$refs.htTable.$refs.htTable.toggleRowSelection(row);
    },
    saveUrl() {
      return window.context.bpmModel + "/flow/approvalItem/v1/save";
    },
    beforeSaveData() {
      this.isSubmit = true;
    },
    afterSaveData() {
      this.dialogVisible = false;
      this.formData = {
        type: 1,
        expression: "",
        departmentId: "",
        roleId: "",
        postId: ""
      };
      this.$refs.htTable.load();
    },
    //获取部门
    getDepartmentList() {
      flow.getDepartmentList().then(resp => {
        this.departmentList = resp.data.rows;
      });
    },
    //获取岗位
    getPostList() {
      flow.getPostList().then(resp => {
        this.postList = resp.data.rows;
      });
    },
    //获取角色
    getRoleList() {
      flow.getRoleList().then(resp => {
        this.roleList = resp.data.rows;
      });
    },
    handleOpen(param, row) {
      this.title = param;
      if (row) {
        flow.getApproval(row.id).then(resp => {
          this.formData = resp.data;
        });
      }
      this.dialogVisible = true;
      this.getPostList();
      this.getRoleList();
      this.getDepartmentList();
    },
    handleClose() {
      this.dialogVisible = false;
      this.formData = { type: 1, expression: "" };
    },
    formDeleteUrl() {
      return `${window.context.bpmModel}/flow/approvalItem/v1/remove?ids`;
    },
    loadData(param, cb) {
      if (!param) {
        this.pageBean.total = 0;
        param = { pageBean: "" };
        param.pageBean = this.pageBean;
      }
      flow
        .getApprovalItemList(param)
        .then(resp => {
          this.data = resp.data.rows;
          this.pageBean = {
            page: resp.data.page,
            pageSize: resp.data.pageSize,
            total: resp.data.total
          };
        })
        .finally(() => cb());
    }
  }
};
</script>
