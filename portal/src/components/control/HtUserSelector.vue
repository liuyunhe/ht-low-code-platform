<template>
  <div class="inputs">
	<el-tooltip :placement="tooltipplacement||$tooltipplacement" :disabled="inputWriteable && !errors.has('custom-form.'+inputName)">
	  <div slot="content">{{errors.first('custom-form.'+inputName)}}</div>
		<div v-if="inputWriteable" style="width: 100%;" class="el-select" @click="showDialog">
		  <div class="el-select__tags" ref="tagSpans" style="width: calc(100% - 25px);">
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
		  </div>
		  <div class="el-input el-input--suffix">
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
		  </div>
		</div>
	</el-tooltip>
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
        <el-aside width="210px" class="left-aside">
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
              lazy
              :load="loadOrgTree"
              :data="orgs"
              :default-expand-all="false"
              :highlight-current="true"
              :props="defaultProps"
              node-key="id"
              ref="tree"
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
                style="width:260px"
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
              <el-button size="small" @click="reset()"  icon="el-icon-refresh">重置</el-button>
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
              @select="userSelectionChange"
              @select-all="userSelectionChange"
              class="user-table"
              size="medium"
            >
              <el-table-column type="selection" align="center" v-if="!this.isSingle" width="45"></el-table-column>
              <el-table-column align="center" width="50" v-if="this.isSingle">
                <template slot-scope="scope">
                  <el-radio
                    @change="radioChangeHandler(scope.$index)"
                    :label="scope.row.id"
                    v-model="singleSelectId"
                  ></el-radio>
                </template>
              </el-table-column>
              <el-table-column type="index" width="50" align="center" label="序号"></el-table-column>
              <el-table-column label="姓名(岗位)" width="180">
                <template slot-scope="scope">
                  <span>{{ scope.row.fullname }}</span>
                  <span v-if="scope.row.dutyname">{{ scope.row.dutyname }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="account" label="账号" width="120" :show-overflow-tooltip="true"></el-table-column>
              <el-table-column prop="mobile" label="手机" width="120" :show-overflow-tooltip="true"></el-table-column>
              <el-table-column prop="email" label="邮箱" width="180" :show-overflow-tooltip="true"></el-table-column>
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
            <el-button size="medium" @click="moveSelectUser('up')">上移</el-button>
            <el-button size="medium" @click="moveSelectUser('down')">下移</el-button>
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
              node-key="fullname"
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
	<span style="display:none;"  v-validate>
	  <slot name="labeldesc">{{inputName}}</slot>
	</span>
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
    "selectorconfig",
	"tooltipplacement"
  ],
  data() {
    return {
      tableData: "",
      orgId: "",
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
      updating: false,
      currentUser: null,
      singleSelectId: null
    };
  },
  computed: mapState({
    pagination: state => state.user.pagination,
    total: state => state.user.total,
    dimensions: state => {
      return state.user.dimensions;
    },
    // 左侧组织树的数据
    orgs: state => {
      return state.user.orgs;
    },
    // 中间用户表格的数据
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
        let subIndex = null;
        if (this.$el) {
          subIndex = utils.getSomeAttributeFromParentElement(
            this.$el,
            "data-index"
          );
        }
        let nameAry = this.value.split(",");
        let idAry = null;
        let accountAry = null;
        let emailAry = [];
        let mobileAry = [];
        const idPath = utils.getAndValidPath(this.bindSet, "id");
        if (idPath) {
          let idVal = utils.getValueByPath(this.$parent, idPath, subIndex);
          if (!idVal || idVal.constructor != String) {
            throw "ht-user-selector中有bind属性中id的值必须是非空的字符串.";
          }
          idAry = idVal.split(",");
        }
        const accountPath = utils.getAndValidPath(this.bindSet, "account");
        if (accountPath) {
          let accountVal = utils.getValueByPath(
            this.$parent,
            accountPath,
            subIndex
          );
          if (!accountVal || accountVal.constructor != String) {
            throw "ht-user-selector中有bind属性中account的值必须是非空的字符串.";
          }
          accountAry = accountVal.split(",");
        }

        const emailPath = utils.getAndValidPath(this.bindSet, "email");
        if (emailPath) {
          let emailVal = utils.getValueByPath(
            this.$parent,
            emailPath,
            subIndex
          );
          if (emailVal &&  emailVal.constructor == String) {
            emailAry = emailVal.split(",");
          }
        }

        const mobilePath = utils.getAndValidPath(this.bindSet, "mobile");
        if (mobilePath) {
          let mobileVal = utils.getValueByPath(
            this.$parent,
            mobilePath,
            subIndex
          );
          if (mobileVal && mobileVal.constructor == String) {
            mobileAry = mobileVal.split(",");
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
          if (emailAry) {
            n["email"] = emailAry[i];
          }

          if (mobileAry) {
            n["mobile"] = mobileAry[i];
          }
          result.push(n);
        });
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
      var validateObj = this.$store.state.index.validate;
      return utils.addRequiredOrNot(
        this.permission,
        this.validate,
        validateObj,
        this
      );
    },
    inputName: function() {
      let labeldesc = "";
      if(this.$slots && this.$slots.labeldesc && this.$slots.labeldesc[0].children && this.$slots.labeldesc[0].children[0].text){
        labeldesc = this.$slots.labeldesc[0].children[0].text;
        return this.name ? this.name : utils.getName()+ "-" +labeldesc;
      }else{
        return this.name ? this.name : utils.getName();
      }
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
      if (this.$store.state.user.currentUserDetail == null) {
        this.$store
          .dispatch("user/loadCurrentUserDetail")
          .then(currentUserDetail => {
            this.currentUser = currentUserDetail.user;
            this.selectUsers = [currentUserDetail.user];
            this.syncInputValue();
            this.calacInputSuffixHeight();
          });
      } else {
        this.currentUser = this.$store.state.user.currentUserDetail.user;
        this.selectUsers = [this.currentUser];
        this.syncInputValue();
        this.calacInputSuffixHeight();
      }
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
  watch: {
    userDialogVisible: function(newVal) {
      if (newVal) {
        if (this.inputVal && this.inputVal.constructor == Array) {
          this.selectUsers = [...this.inputVal];
        } else {
          this.selectUsers = [];
        }
        this.syncCheckedStatus();
      }
    }
  },
  methods: {
    loadOrgTree(node, resolve) {
      if (node && node.data && node.data.isParent) {
        if (node.data.children) {
          resolve(node.data.children);
        } else {
          this.$store
            .dispatch("user/loadOrgsByParentId", node.data.id)
            .then(rep => {
              resolve(rep);
            });
        }
      } else {
        resolve([]);
      }
    },
    //点击组织查询用户
    handleNodeClick(data, node, vuecomponent) {
      if (data.id) {
        this.orgId = data.id;
      }
      let pageBean = {
        pageBean: { page: "1", pageSize: "10", showTotal: "true" }
      };
      let querys = [
        {
          property: "org_id_",
          value: this.orgId,
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
    searchEnterFun: function(e) {
      var keyCode = window.event ? e.keyCode : e.which;
      if (keyCode == 13) {
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
      if (this.tableData == "" && this.orgId == "") {
        this.$store.dispatch("user/loadUsersByOrgId", pageBean).then(() => {
          this.syncCheckedStatus();
        });
      } else {
        if (this.orgId && this.tableData == "") {
          querys.push({
            property: "org_id_",
            value: this.orgId,
            group: "main1",
            operation: "EQUAL",
            relation: "AND"
          });
        } else if (this.orgId && this.tableData != "") {
          querys = [
            {
              property: "org_id_",
              value: this.orgId,
              group: "main1",
              operation: "EQUAL",
              relation: "AND"
            },
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
        }
        queryFilter = { pageBean: this.pagination, querys };
        this.$store.dispatch("user/loadUsersByOrgId", queryFilter).then(() => {
          this.syncCheckedStatus();
        });
      }
    },
    //重置
    reset() {
      this.tableData = "";
      this.orgId="";
      if(this.$refs.tree){
          this.$refs.tree.setCurrentKey(null);
      }
      this.search("find");
    },
    showDialog() {
      this.reset();
      this.userDialogVisible = true;
    },
    //通过维度获取组织
    changeDimension(val) {
      this.$store.dispatch("user/loadOrgsByDimension", val);
    },
    radioChangeHandler(index) {
      this.selectUsers = [this.users[index]];
    },
    userSelectionChange() {
      !this.updating && this.syncSelection2selectUsers();
    },
    userRowClick(row, column, event) {
      // 单选
      if (this.isSingle) {
        this.selectUsers = [row];
        this.singleSelectId = row.id;
      }
      // 多选
      else {
        const arg = this.getUniqueArg();
        let _tag = true;
        this.$refs.userTable &&
          this.$refs.userTable.selection &&
          this.$refs.userTable.selection.forEach(m => {
            if (m === row) {
              // 对于已选中该行时，取消选中状态
              this.$refs.userTable.toggleRowSelection(row, false);
              _tag = false;
            }
          });
        // 对于未选中该行时，切换为选中状态
        this.$refs.userTable &&
          _tag &&
          this.$refs.userTable.toggleRowSelection(row);
        this.syncSelection2selectUsers();
      }
    },
    // 获取当前用作唯一键的参数
    getUniqueArg() {
      let arg = "fullname";
      if (utils.getAndValidPath(this.bindSet, "id")) {
        arg = "id";
      } else if (utils.getAndValidPath(this.bindSet, "account")) {
        arg = "account";
      }
      return arg;
    },
    dialogConfirm() {
      this.userDialogVisible = false;
      this.syncInputValue();
    },
    // 同步userTable中已选行到已选数据中去
    syncSelection2selectUsers() {
      let arg = this.getUniqueArg();
      // 当前分页的orgTable行中已被选择的数据
      let curPageAry = this.selectUsers.filter(m =>
        this.users.some(n => m[arg] === n[arg])
      );
      curPageAry.forEach(item => {
        this.selectUsers.remove(item);
      });
      this.selectUsers = [
        ...this.selectUsers,
        ...this.$refs.userTable.selection
      ];
    },
    // 同步已选数据在orgTable中的checkbox和radio的选中状态
    syncCheckedStatus() {
      let arg = this.getUniqueArg();
      const _me = this;
      setTimeout(() => {
        _me.updating = true;
        _me.singleSelectId = null;
        _me.$refs.userTable && _me.$refs.userTable.clearSelection();
        _me.users &&
          _me.users.forEach(m => {
            if (
              _me.selectUsers &&
              _me.selectUsers.some(n => n[arg] === m[arg])
            ) {
              _me.singleSelectId = m.id;
              if (!_me.isSingle && _me.$refs.userTable) {
                _me.$refs.userTable.toggleRowSelection(m);
              }
            } else {
              if (!_me.isSingle && _me.$refs.userTable) {
                _me.$refs.userTable.toggleRowSelection(m, false);
              }
            }
          });
        _me.updating = false;
      }, 200);
    },
    // 同步选择结果到表单上（会自动修正表单上输入框的高度）
    syncInputValue(item) {
      if (item) {
        if (this.inputVal && this.inputVal.constructor == Array) {
          this.selectUsers = [...this.inputVal];
        }
        // 在表单上点击X删除已选数据
        this.selectUsers.remove(item);
      }
      let subIndex = null;
      if (this.$el) {
        subIndex = utils.getSomeAttributeFromParentElement(
          this.$el,
          "data-index"
        );
      }
      this.updating = true;
      if (this.bindSet) {
        if (!utils.getAndValidPath(this.bindSet, "fullname")) {
          throw "ht-user-selector的bind属性中必须配置fullname属性.";
        }
        let nameAry = [];
        let idAry = [];
        let accountAry = [];
        let mobileArr = [];
        let emailArr = [];
        this.selectUsers &&
          this.selectUsers.forEach(m => {
            nameAry.push(m.fullname);
            idAry.push(m.id);
            accountAry.push(m.account);
            mobileArr.push(m.mobile);
            emailArr.push(m.email);
          });
        const idPath = utils.getAndValidPath(this.bindSet, "id");
        idPath &&
          utils.setValueByPath(this.$parent, idPath, idAry.join(","), subIndex);
        const accountPath = utils.getAndValidPath(this.bindSet, "account");
        accountPath &&
          utils.setValueByPath(
            this.$parent,
            accountPath,
            accountAry.join(","),
            subIndex
          );

        const mobilePath = utils.getAndValidPath(this.bindSet, "mobile");
        mobilePath &&
          utils.setValueByPath(
            this.$parent,
            mobilePath,
            mobileArr.join(","),
            subIndex
          );

        const emailPath = utils.getAndValidPath(this.bindSet, "email");
        emailPath &&
          utils.setValueByPath(
            this.$parent,
            emailPath,
            emailArr.join(","),
            subIndex
          );
        this.$emit("input", nameAry.join(","));
      } else {
        this.$emit("input", this.selectUsers);
      }
      this.updating = false;
      this.calacInputSuffixHeight();
    },
    dialogCancel() {
      this.userDialogVisible = false;
    },
    clearAllSelectUsers() {
      this.selectUsers = [];
      this.syncCheckedStatus();
      this.singleSelectId = null;
    },
    // 调整已选列表中元素的顺序
    moveSelectUser(direct) {
      let ary = this.$refs.selectTree.getCheckedNodes();
      if (direct == "up") {
        ary.forEach(m => {
          let index = this.selectUsers.indexOf(m, 1);
          if (index > 0) {
            let newAry = [...this.selectUsers];
            newAry[index - 1] = this.selectUsers[index];
            newAry[index] = this.selectUsers[index - 1];
            this.selectUsers = newAry;
          }
        });
      } else if (direct == "down") {
        for (var i = ary.length - 1, m; (m = ary[i--]); ) {
          let index = this.selectUsers.indexOf(m, 0);
          if (index > -1 && index < this.selectUsers.length - 1) {
            let newAry = [...this.selectUsers];
            newAry[index + 1] = this.selectUsers[index];
            newAry[index] = this.selectUsers[index + 1];
            this.selectUsers = newAry;
          }
        }
      }
      setTimeout(() => {
        this.$refs.selectTree.setCheckedNodes(ary);
      });
    },
    // 在弹框中的已选数据中删除勾选的项
    removeSelectUsers() {
      let ary = this.$refs.selectTree.getCheckedNodes();
      ary.forEach(item => {
        this.selectUsers.remove(item);
      });
      this.syncCheckedStatus();
    },
    // 在表单的输入框中点击X删除一条已选数据
    removeSelectUser(item) {
      this.syncInputValue(item);
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
  height: 440px;
  margin-top: 10px;
}

.middle-header {
  height: 52px !important;
}

.org-table {
  width: 100%;
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
  height: 500px;
  overflow-y: auto;
}

>>> .el-dialog {
  margin-top: 8vh !important;
}

>>> .el-dialog__body {
  padding: 0;
  border: 1px solid #eee;
  margin: 0 20px;
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

>>> .el-main {
  padding: 0 10px !important;
}

>>> .el-footer {
  padding: 20px 5px;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  -ms-flex-negative: 0;
  flex-shrink: 0;
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

>>> span.el-radio__label {
  display: none;
}
</style>
