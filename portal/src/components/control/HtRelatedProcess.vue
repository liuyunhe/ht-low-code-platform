<template>
  <div class="inputs">
    <div v-if="inputWriteable" style="width: 100%;" class="el-select" @click="showDialog">
      <!--<div class="el-select__tags" ref="tagSpans" style="width: calc(100% - 25px);">
        <span>
          <span
            class="el-tag el-tag--info el-tag--small"
            @click.stop
            v-for="item in inputVal"
            :key="item.account"
          >
            <span class="el-select__tags-text">{{item.fullname}}</span>
            <i class="el-tag__close el-icon-close" @click="removeSelectUser(item)"></i>
          </span>
        </span>
      </div>-->
      <el-button
            type="primary"
            size="small"
            @click="showDialog"
            icon="el-icon-plus"
            plain
            round
            style="margin-left:0"
          >新增</el-button>
      <!--<div class="el-input el-input--suffix">
        <input
          type="text"
          readonly="readonly"
          v-validate="inputValidate"
          v-model="inputVal"
          :name="inputName"
          placeholder="请选择"
          autocomplete="off"
          class="el-input__inner"
          :style="{height: inputSuffixHeight + 'px'}"
        >
        <span class="el-input__suffix">
          <span class="el-input__suffix-inner">
            <i class="el-input__icon icon-account" :style="{lineHeight: inputSuffixHeight + 'px'}"></i>
          </span>
        </span>
      </div>-->
    </div>
    <small
      class="error-message"
      v-if="inputWriteable && errors.has('custom-form.'+inputName)"
    >{{errors.first('custom-form.'+inputName)}}</small>
    <span v-if="!inputWriteable">
      <span
        class="el-tag el-tag--info el-tag--small"
        style="margin-right: 8px;"
        @click.stop
        v-for="item in inputVal"
        :key="item.account"
      >
        <span class="el-select__tags-text">{{item.fullname}}</span>
      </span>
    </span>
    <el-dialog
      :visible.sync="userDialogVisible"
      title="选择用户"
      width="1000px"
      append-to-body
      :close-on-click-modal="false"
      @close="dialogCancel"
    >
      <el-container>
        <el-aside width="230px" class="left-aside">
          <el-card class="box-card org-find-card" shadow="never">
            <div slot="header" class="clearfix">
              <span>按组织查找</span>
            </div>
            <el-select size="small" @change="changeDimension" v-model="currentDimension">
              <el-option
                v-for="item in dimensions"
                :key="item.id"
                :label="item.demName"
                :value="item.id"
              ></el-option>
            </el-select>
            <el-tree
              :data="orgs"
              :default-expand-all="true"
              :highlight-current="true"
              :props="defaultProps"
              class="org-tree"
              @node-click="handleNodeClick"
              accordion
            ></el-tree>
          </el-card>
        </el-aside>
        <el-container>
          <el-header class="middle-header">
            <div style="padding: 10px 0">
              <el-input
                size="small"
                style="width:330px"
                clearable
                placeholder="姓名、账号、手机号码、邮箱"
                prefix-icon="el-icon-search"
                v-model="tableData"
                @keyup.enter.native="searchEnterFun"
              ></el-input>
              <el-button
                style="margin-left: 20px"
                size="small"
                type="primary"
                icon="el-icon-search"
                @click="search('find')"
              >查询</el-button>
            </div>
          </el-header>
          <el-main style="padding:0">
            <el-table
              :data="users"
              ref="userTable"
              stripe
              border
              height="490"
              @row-click="userRowClick"
              @selection-change="userTableSelection"
              class="user-table"
              size="medium"
            >
              <el-table-column type="selection" align="center" width="45"></el-table-column>
              <el-table-column type="index" width="50" align="center" label="序号"></el-table-column>
              <el-table-column label="姓名(岗位)" width="180">
                <template slot-scope="scope">
                  <span>{{ scope.row.fullname }}</span>
                  <span v-if="scope.row.dutyname">{{ scope.row.dutyname }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="account" label="账号"></el-table-column>
            </el-table>
          </el-main>
          <el-footer>
            <el-row type="flex" justify="end">
              <el-pagination
                small
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="pagination.page"
                :page-sizes="[10, 20, 50, 100]"
                :page-size="pagination.pageSize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
              ></el-pagination>
            </el-row>
          </el-footer>
        </el-container>
        <el-aside width="90px" class="right-aside">
          <div class="button-group">
            <el-button size="medium">上移</el-button>
            <el-button size="medium">下移</el-button>
            <el-button size="medium" @click="removeSelectUsers">删除</el-button>
            <el-button size="medium" @click="clearAllSelectUsers">清空</el-button>
          </div>
        </el-aside>
        <el-aside width="170px" class="select-aside">
          <el-header class="select-header">
            <span>已选择用户</span>
          </el-header>
          <div class="select-tree-div">
            <el-tree
              ref="selectTree"
              :props="selectUserProps"
              :data="selectUsers"
              show-checkbox
              check-on-click-node
            ></el-tree>
          </div>
        </el-aside>
      </el-container>
      <span slot="footer" class="dialog-footer" style="text-align: center;">
        <el-button size="small" type="primary" @click="dialogConfirm">确认</el-button>
        <el-button size="small" @click="dialogCancel">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import Vue from "vue";
import { mapState } from "vuex";
import utils from "@/utils.js";

export default {
  name: "ht-user-selector",
  props: [
    "validate",
    "value",
    "name",
    "permission",
    "single",
    "selectorconfig"
  ],
  data() {
    return {
      tableData: "",
      userDialogVisible: false,
      defaultProps: {
        children: "children",
        label: "name"
      },
      selectUserProps: {
        label: "fullname"
      },
      selectUsers: null,
      currentDimension: null,
      inputSuffixHeight: 30,
      config: null,
      updating: false
    };
  },
  computed: mapState({
    pagination: state => state.user.pagination,
    total: state => state.user.total,
    dimensions: state => {
      return state.user.dimensions;
    },
    orgs: state => {
      return state.user.orgs;
    },
    users: state => {
      return state.user.users;
    },
    isSingle: function() {
      if (this.single === undefined || this.single === null) {
        if (this.selectorconfig) {
          return this.selectorconfig.isSingle;
        }
        return false;
      }
      if (this.single === "") {
        return true;
      }
      return !!this.single;
    },
    inputVal: function() {
      if (!this.value) {
        return null;
      } else if (this.bindSet) {
        if (!utils.getAndValidPath(this.bindSet, "fullname")) {
          throw "ht-user-selector的bind属性中必须配置fullname属性.";
        }
        if (this.value.constructor != String) {
          throw "ht-user-selector中有bind属性时，fullname必须是字符串.";
        }
        let nameAry = this.value.split(",");
        let idAry = null;
        let accountAry = null;
        const idPath = utils.getAndValidPath(this.bindSet, "id");
        if (idPath) {
          let idVal = utils.getValueByPath(this.$parent, idPath);
          if (!idVal || idVal.constructor != String) {
            throw "ht-user-selector中有bind属性中id的值必须是非空的字符串.";
          }
          idAry = idVal.split(",");
          if (nameAry.length != idAry.length) {
            throw "ht-user-selector中有bind属性中id和fullname的值数量不匹配.";
          }
        }
        const accountPath = utils.getAndValidPath(this.bindSet, "account");
        if (accountPath) {
          let accountVal = utils.getValueByPath(this.$parent, accountPath);
          if (!accountVal || accountVal.constructor != String) {
            throw "ht-user-selector中有bind属性中account的值必须是非空的字符串.";
          }
          accountAry = accountVal.split(",");
          if (nameAry.length != accountAry.length) {
            throw "ht-user-selector中有bind属性中account和fullname的值数量不匹配.";
          }
        }
        let result = [];
        nameAry.forEach((m, i) => {
          let n = { fullname: m };
          if (idAry) {
            n["id"] = idAry[i];
          }
          if (accountAry) {
            n["account"] = accountAry[i];
          }
          result.push(n);
        });
        if (!this.updating) {
          this.selectUsers = result;
        }
        return result;
      } else if (this.value.constructor == Array) {
        return this.value;
      } else {
        return null;
      }
    },
    inputWriteable: function() {
      return utils.getWriteable(this.permission);
    },
    inputValidate: function() {
      var validateObj= this.$store.state.index.validate;
      return utils.addRequiredOrNot(this.permission, this.validate ,validateObj ,this);
    },
    inputName: function() {
      return this.name ? this.name : utils.getName();
    },
    // 是否显示当前用户
    selectCurrent: function() {
      return this.selectorconfig ? this.selectorconfig.selectCurrent : false;
    },
    // 是否有回填设置
    bindSet: function() {
      return this.selectorconfig ? this.selectorconfig.bind : null;
    }
  }),
  mounted() {
    // 没有值而且需要显示当前用户
    if (!this.inputVal && this.selectCurrent) {
      const currentUser = this.$store.state.user.currentUserDetail.user;
      this.selectUsers = [currentUser];
      this.syncInputValue();
      this.calacInputSuffixHeight();
    }
  },
  created() {
    this.$validator = this.$root.$validator;
    let pageBean = {
      pageBean: { page: "1", pageSize: "10", showTotal: "true" }
    };
    //初次加载默认pageBean
    this.$store.dispatch("user/loadDimension");
    this.$store.dispatch("user/loadUsersByOrgId", pageBean);
  },
  methods: {
    //点击组织查询用户
    handleNodeClick(data, node, vuecomponent) {
      let pageBean = {
        pageBean: { page: "1", pageSize: "10", showTotal: "true" }
      };
      let querys = [
        {
          property: "org_id_",
          value: data.id,
          group: "main",
          operation: "EQUAL",
          relation: "AND"
        }
      ];
      let queryFilter = { pageBean, querys };
      this.$store.dispatch("user/loadUsersByOrgId", queryFilter);
    },
    handleSizeChange: function(size) {
      //每页下拉显示数据
      this.$store.dispatch("user/setPaginationSize", size);
      this.search();
    },
    handleCurrentChange: function(currentPage) {
      //点击第几页
      this.$store.dispatch("user/setPaginationPageNum", currentPage);
      this.search();
    },
    //回车查询
    searchEnterFun:function(e){
        var keyCode = window.event? e.keyCode:e.which;
        if(keyCode == 13){
            this.search("find");
        }
    },
    // 查询
    search(str) {
      if (str == "find") {
        this.$store.dispatch("user/setPaginationPageNum", 1);
      }
      let querys = []; //查询条件
      let queryFilter = {};
      let pageBean = { pageBean: this.pagination };
      if (this.tableData == "") {
        this.$store.dispatch("user/loadUsersByOrgId", pageBean);
      } else {
        querys = [
          {
            property: "fullname",
            value: this.tableData,
            group: "main",
            operation: "LIKE",
            relation: "OR"
          },
          {
            property: "account",
            value: this.tableData,
            group: "main",
            operation: "LIKE",
            relation: "OR"
          },
          {
            property: "email",
            value: this.tableData,
            group: "main",
            operation: "LIKE",
            relation: "OR"
          },
          {
            property: "mobile",
            value: this.tableData,
            group: "main",
            operation: "LIKE",
            relation: "OR"
          }
        ];
        queryFilter = { pageBean: this.pagination, querys };
        this.$store.dispatch("user/loadUsersByOrgId", queryFilter);
      }
    },
    //重置
    reset() {
      this.tableData = "";
      this.search("find");
    },
    showDialog() {
      this.userDialogVisible = true;
    },
    //通过维度获取组织
    changeDimension(val) {
      this.$store.dispatch("user/loadOrgsByDimension", val);
    },
    userRowClick(row, column, event) {
      this.$refs.userTable.toggleRowSelection(row);
    },
    userTableSelection(selection) {
      if (this.isSingle && selection.length > 1) {
        let count = 0;
        selection.forEach(item => {
          count++;
          if (count == selection.length) {
            this.selectUsers = [item];
          } else {
            this.$refs.userTable.toggleRowSelection(item, false);
          }
        });
      } else {
        let arg = "fullname";
        if (utils.getAndValidPath(this.bindSet, "id")) {
          arg = "id";
        } else if (utils.getAndValidPath(this.bindSet, "account")) {
          arg = "account";
        }
        selection = selection.unique(arg);
        this.selectUsers = selection;
      }
    },
    dialogConfirm() {
      this.userDialogVisible = false;
      this.calacInputSuffixHeight();
      this.syncInputValue();
    },
    // 同步选择结果
    syncInputValue() {
      this.updating = true;
      if (this.bindSet) {
        if (!utils.getAndValidPath(this.bindSet, "fullname")) {
          throw "ht-user-selector的bind属性中必须配置fullname属性.";
        }
        let nameAry = [];
        let idAry = [];
        let accountAry = [];
        this.selectUsers &&
          this.selectUsers.forEach(m => {
            nameAry.push(m.fullname);
            idAry.push(m.id);
            accountAry.push(m.account);
          });
        const idPath = utils.getAndValidPath(this.bindSet, "id");
        idPath && utils.setValueByPath(this.$parent, idPath, idAry.join(","));
        const accountPath = utils.getAndValidPath(this.bindSet, "account");
        accountPath &&
          utils.setValueByPath(this.$parent, accountPath, accountAry.join(","));
        this.$emit("input", nameAry.join(","));
      } else {
        this.$emit("input", this.selectUsers);
      }
      this.updating = false;
    },
    dialogCancel() {
      this.userDialogVisible = false;
      if (this.selectUsers) {
        this.selectUsers.forEach(item => {
          if (!this.inputVal || this.inputVal.indexOf(item) === -1) {
            this.$refs.userTable.toggleRowSelection(item, false);
          } else {
            this.$refs.userTable.toggleRowSelection(item, true);
          }
        });
      }
      this.selectUsers = this.inputVal ? this.inputVal : null;
    },
    clearAllSelectUsers() {
      this.$refs.userTable.clearSelection();
      this.selectUsers = null;
    },
    removeSelectUsers() {
      let ary = this.$refs.selectTree.getCheckedNodes();
      ary.forEach(item => {
        this.selectUsers.remove(item);
        this.$refs.userTable.toggleRowSelection(item, false);
      });
    },
    removeSelectUser(item) {
      this.selectUsers.remove(item);
      this.$refs.userTable &&
        this.$refs.userTable.toggleRowSelection(item, false);
      this.calacInputSuffixHeight();
      this.syncInputValue();
    },
    calacInputSuffixHeight() {
      setTimeout(() => {
        if(!this.$refs.tagSpans) return;
        if (this.$refs.tagSpans.offsetHeight) {
          this.inputSuffixHeight = this.$refs.tagSpans.offsetHeight + 5;
        } else {
          this.inputSuffixHeight = 30;
        }
        // 触发验证
        this.$validator.validate();
      }, 0);
    }
  }
};
</script>
<style lang="stylus" scoped>
.el-input__inner[aria-invalid='true'] {
  border-color: #f56c6c;
}

.el-select__tags {
  background: #fff;
  margin-left: 1px;
}

.left-aside {
  border-right: 1px solid #eee;
  padding: 10px;
}

.org-tree {
  height: 490px;
  margin-top: 10px;
}

.middle-header {
  border-bottom: 1px solid #eee;
  height: 52px !important;
}

.user-table {
  width: 100%;
  border-top-width: 0;
  border-left-width: 0;
}

.right-aside {
  border-left: 1px solid #eee;
}

.select-aside {
  border-left: 1px solid #eee;
}

.select-header {
  border-bottom: 1px solid #eee;
  height: 52px !important;
}

.select-header > span {
  padding: 10px 0;
  line-height: 53px;
}

.select-tree-div {
  height: 550px;
  overflow-y: auto;
}

>>> .el-dialog {
  margin-top: 8vh !important;
}

>>> .el-dialog__body {
  padding: 0;
}

>>> .el-card__header {
  padding: 10px;
}

>>> .el-card__body {
  padding: 10px;
}

.org-find-card >>> .el-card__header {
  background: #F5F7FA;
}

.el-main {
  padding: 0 10px;
}

.button-group {
  width: 70px;
  height: 170px;
  margin: 0px auto;
  position: relative;
  top: 50%;
  -webkit-transform: translateY(-50%);
  -moz-transform: translateY(-50%);
  -ms-transform: translateY(-50%);
  -o-transform: translateY(-50%);
  transform: translateY(-50%);
}

.button-group > button {
  display: block;
  margin: 8px 0;
}
</style>