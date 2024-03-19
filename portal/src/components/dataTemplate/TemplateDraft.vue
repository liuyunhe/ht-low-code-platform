<template>
  <el-container>
    <el-container style="border-left:1px solid #E7EAEC">
      <el-main>
        <el-row>
          <el-col :span="6">
            <el-button icon="el-icon-delete" type="danger" @click="remove">删除</el-button>
            <el-button type="error" @click="close">返回</el-button>
          </el-col>
          <el-col :span="18">
            <el-input
              size="small"
              style="width:380px"
              clearable
              placeholder="标题"
              prefix-icon="el-icon-search"
              v-model="title"
            ></el-input>
            <el-button
              style="margin-left: 20px"
              size="small"
              type="primary"
              icon="el-icon-search"
              @click="loadData()"
            >{{$t('common.search')}}</el-button>
            <el-button size="small" icon="el-icon-refresh" @click="reset">{{$t('common.reset')}}</el-button>
          </el-col>
        </el-row>
        <el-table
          :data="data"
          stripe
          border
          style="width: 100%"
          header-cell-class-name="todo-header-row"
          row-class-name="todo-row"
          size="medium"
          v-loading="fullscreenLoading"
          @selection-change="handleChecked"
          ref="htTable"
        >
          <el-table-column type="selection" sortable width="50"></el-table-column>
          <ht-table-column type="index" width="50" align="center" label="序号" />
          <ht-table-column prop="title" label="标题" :show-overflow-tooltip="true" :sortable="true"></ht-table-column>
          <ht-table-column
            prop="createTime"
            label="创建时间"
            :show-overflow-tooltip="true"
            :sortable="true"
          ></ht-table-column>
          <el-table-column prop :label="$t('common.operation')" align="center" width="290">
            <template slot-scope="scope">
              <el-button @click="edit(scope.row)" size="small" icon="el-icon-tickets" plain>编辑</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-main>
      <el-footer height="45px">
        <el-row type="flex" justify="end">
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="pageBean.page"
            :page-sizes="[10, 20, 30, 40]"
            :page-size="10"
            layout="total, sizes, prev, pager, next, jumper"
            :total="pageBean.total"
          ></el-pagination>
        </el-row>
      </el-footer>
    </el-container>
  </el-container>
</template>

<script>
import { mapState, mapActions } from "vuex";
import form from "@/api/form.js";
export default {
  name: "templateDraft",
  props: ["tempAlias","dataViewFlag","openType"],
  data() {
    return {
      alias_new:"statement",
      title: "",
      fullscreenLoading: true,
      checkBoxData: [],
      pageBean: { page: 1, pageSize: 10, showTotal: true, total: 0 },
      data: [],
      selection: [],
      ignoredAlias: ["appCenterFront"]
    };
  },
  computed: {
    formDeleteUrl: function() {
      return `${window.context.form}/form/dataTemplate/v1/remove`;
    }
  },
  methods: {
    close(){
      let isSingle = "/true";
      //数据视图随机添加到其他菜单下面时获取当前菜单的别名  并且当前数据视图不是表单里的数据视图  dataViewFlag
      if (sessionStorage.menu_alias && this.dataViewFlag=="false" && !this.ignoredAlias.includes(sessionStorage.menu_alias) && this.$route.query.isNew != "true") {
        this.alias_new = sessionStorage.menu_alias;
        isSingle = "";
      }else if(this.$route.query.isNew == "true"){
        //在前端菜单中新窗口打开
        window.close();
      }
      let path = "/" +this.alias_new +"/template/preview/"+this.tempAlias + isSingle;
      this.$router.push(path);
      // this.$router.go(-1);
    },
    remove() {
      if (!this.selection || this.selection.length <= 0) {
        this.$message.warning("请至少选择一项");
        return;
      }
      let ids = [];
      this.selection.forEach(item => {
        ids.push(item.id);
      });
      this.$confirm("确定删除草稿吗？")
        .then(() => {
          form.removeTempDraft(ids.join(",")).then(resp => {
            if (resp.state) {
              this.$message.success(resp.message);
              this.loadData();
            } else {
              this.$message.error(resp.message);
            }
          });
        })
        .catch(() => {});
    },
    handleChecked(selection) {
      this.selection = selection;
    },
    edit(row) {
      //判断是不是发布到前端菜单
      if(window.sessionStorage.menu_alias && this.dataViewFlag=="false" && this.$route.query.isNew != "true"){
        this.$router.push(
          `/${sessionStorage.menu_alias}/template/form/${row.tempAlias}/editDraft/true?draftId=${row.id}`
        )
      }else if(this.$route.query.isNew == "true"){
        this.$router.push(
          `/statement/template/form/${row.tempAlias}/editDraft/true/new?draftId=${row.id}`
        );
      }else{
        this.$router.push(
          `/statement/template/form/${row.tempAlias}/editDraft/true?draftId=${row.id}`
        );
      }
      
    },
    //重置
    reset() {
      this.title = "";
      this.loadData();
    },
    handleSizeChange: function(size) {
      this.pageBean.pageSize = size;
      this.loadData();
    },
    handleCurrentChange: function(currentPage) {
      this.pageBean.page = currentPage;
      this.loadData();
    },
    loadData() {
      let queryFilter = {
        pageBean: this.pageBean,
        querys: []
      };
      if(this.tempAlias){
        let query = {
          property: "tempAlias",
          value: this.tempAlias,
          group: "main",
          operation: "EQUAL",
          relation: "AND"
        };
        queryFilter.querys.push(query);
      }
      if (this.title) {
        let query = {
          property: "title",
          value: this.title,
          group: "main",
          operation: "LIKE",
          relation: "AND"
        };
        queryFilter.querys.push(query);
      }
      form.getMyTemplateDraftList(queryFilter).then(resp => {
        this.pageBean.page = resp.page;
        this.pageBean.pageSize = resp.pageSize;
        this.pageBean.total = resp.total;
        this.data = resp.rows;
        this.fullscreenLoading = false;
      });
    }
  },
  created() {
    // this.tempAlias = this.$route.query.tempAlias;
    this.loadData();
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/css/element-variables.scss";
.el-table /deep/ th.todo-header-row {
  background-color: #fafafa;
  font-size: 13px;
}

.el-table /deep/ tr.todo-row {
  font-size: 13px;
  color: $--color-text-regular;
}

.el-container {
  background-color: #fff;
}

.el-row {
  margin-bottom: 20px;
}

.el-header {
  border-bottom: 1.5px solid #ededed;
}

.todo-subject {
  cursor: pointer;
}

.todo-subject {
  color: $--theme-color;
}

.el-dropdown {
  vertical-align: top;
}

.el-dropdown + .el-dropdown {
  margin-left: 15px;
}

.el-icon-arrow-down {
  font-size: 12px;
}
</style>
