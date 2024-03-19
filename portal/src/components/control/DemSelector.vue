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
              :key="item.id"
            >
              <span class="el-select__tags-text">{{item.name}}</span>
              <i class="el-tag__close el-icon-close" @click="removeSelectOrg(item)"></i>
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
            autocomplete="off"
            class="el-input__inner"
            placeholder="请选择"
            :style="{height: inputSuffixHeight + 'px'}"
          >
          <span class="el-input__suffix">
            <span class="el-input__suffix-inner">
              <i
                class="el-input__icon icon-department"
                :style="{fontSize:'17px',lineHeight: inputSuffixHeight + 'px'}"
              ></i>
            </span>
          </span>
        </div>
		<span style="display:none;"  v-validate>
		  <slot name="labeldesc">{{inputName}}</slot>
		</span>
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
        <span class="el-select__tags-text">{{item.name}}</span>
      </span>
    </span>
    <el-dialog
      :visible.sync="orgDialogVisible"
      title="选择维度"
      width="1000px"
      :close-on-click-modal="false"
      append-to-body
      @close="dialogCancel"
    >
      <el-container>
        <el-container>
          <el-header class="middle-header">
            <div style="padding: 10px 0">
              <el-input
                size="small"
                style="width:380px"
                clearable
                placeholder="名称、编码"
                prefix-icon="el-icon-search"
                v-model="tableData"
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
              :data="demData"
              ref="orgTable"
              stripe
              border
              height="490"
              @row-click="orgRowClick"
              @selection-change="orgTableSelection"
              class="org-table"
              size="medium"
            >
              <el-table-column type="selection" align="center" width="45" v-if="!this.isSingle"></el-table-column>
              <el-table-column align="center" width="50" v-if="this.isSingle">
                <template slot-scope="scope">
                  <el-radio
                    @change="orgRowClicka(demData[scope.$index],$event)"
                    :label="demData[scope.$index].id"
                    v-model="undefineda"
                    class="textRadio"
                  >&nbsp;</el-radio>
                </template>
              </el-table-column>
              <el-table-column type="index" width="50" align="center" label="序号"></el-table-column>
              <el-table-column prop="name" label="名称" width="300"></el-table-column>
              <el-table-column prop="code" label="编码"></el-table-column>
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
                :pager-count="3"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
              ></el-pagination>
            </el-row>
          </el-footer>
        </el-container>
        <el-aside width="90px" class="right-aside">
          <div class="button-group">
            <el-button size="medium" @click="up">上移</el-button>
            <el-button size="medium" @click="down">下移</el-button>
            <el-button size="medium" @click="removeSelectOrgs">删除</el-button>
            <el-button size="medium" @click="clearAllSelectOrgs">清空</el-button>
          </div>
        </el-aside>
        <el-aside width="170px" class="select-aside">
          <el-header class="select-header">
            <span>已选择维度</span>
          </el-header>
          <div class="select-tree-div">
            <el-tree
              ref="selectTree"
              :props="selectOrgProps"
              :data="selectOrgs"
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
import { mapState } from "vuex";
import utils from "@/utils.js";

export default {
  name: "dem-selector",
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
      orgDialogVisible: false,
      selectOrgProps: {
        label: "name"
      },
      selectOrgs: null,
      inputSuffixHeight: 30,
      config: null,
      updating: false,
      tableData: "",
      selection: [],
      undefineda: ""
    };
  },
  computed: mapState({
    pagination: state => state.user.pagination,
    total: state => state.user.demTotal,
    demData: state => {
      return state.user.demData;
    },
    inputVal: function() {
      if (!this.value) {
        return null;
      } else if (this.bindSet) {
        if (!utils.getAndValidPath(this.bindSet, "name")) {
          throw "ht-dem-selector的bind属性中必须配置name属性.";
        }
        if (this.value.constructor != String) {
          throw "ht-dem-selector中有bind属性时，name必须是字符串.";
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
        let codeAry = null;
        const idPath = utils.getAndValidPath(this.bindSet, "id");
        if (idPath) {
          let idVal = utils.getValueByPath(this.$parent, idPath, subIndex);
          if (!idVal || idVal.constructor != String) {
            throw "ht-dem-selector中有bind属性中id的值必须是非空的字符串.";
          }
          idAry = idVal.split(",");
          // if (nameAry.length != idAry.length) {
          //   throw "ht-dem-selector中有bind属性中id和name的值数量不匹配.";
          // }
        }
        const codePath = utils.getAndValidPath(this.bindSet, "code");
        if (codePath) {
          let accountVal = utils.getValueByPath(
            this.$parent,
            codePath,
            subIndex
          );
          if (!accountVal || accountVal.constructor != String) {
            throw "ht-dem-selector中有bind属性中code的值必须是非空的字符串.";
          }
          codeAry = accountVal.split(",");
          // if (nameAry.length != codeAry.length) {
          //   throw "ht-dem-selector中有bind属性中code和name的值数量不匹配.";
          // }
        }
        let result = [];
        nameAry.forEach((m, i) => {
          let n = { name: m };
          if (idAry) {
            n["id"] = idAry[i];
          }
          if (codeAry) {
            n["code"] = codeAry[i];
          }
          result.push(n);
        });
        if (!this.updating) {
          this.selectOrgs = result;
        }
        return result;
      } else if (this.value.constructor == Array) {
        return this.value;
      } else {
        return null;
      }
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
    // 是否有回填设置
    bindSet: function() {
      return this.selectorconfig ? this.selectorconfig.bind : null;
    }
  }),
  mounted() {},
  created() {
    let pageBean = {
      pageBean: { page: "1", pageSize: "10", showTotal: "true" }
    };
    this.$validator = this.$root.$validator;
    this.$store.dispatch("user/getDemPage", pageBean);
  },
  methods: {
    search(str) {
      /* if (str == "find") {
        this.$store.dispatch("user/setPaginationPageNum", 1);
      }*/
      let querys = []; //查询条件
      let queryFilter = {};
      let pageBean = { pageBean: this.pagination };
      if (this.tableData == "") {
        this.$store.dispatch("user/getDemPage", pageBean);
      } else {
        querys = [
          {
            property: "demName",
            value: this.tableData,
            group: "main",
            operation: "LIKE",
            relation: "OR"
          },
          {
            property: "demCode",
            value: this.tableData,
            group: "main",
            operation: "LIKE",
            relation: "OR"
          }
        ];
        queryFilter = {
          pageBean: { page: "1", pageSize: "10", showTotal: "true" },
          querys
        };
        this.$store.dispatch("user/getDemPage", queryFilter);
      }
      this.check();
    },
    //重置
    reset(){
        this.tableData ="";
        this.search("find");
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
    }, // 查询
    showDialog() {
      this.orgDialogVisible = true;
      this.reset();
      this.check();
    },
    orgRowClicka(data, column) {
      this.selectOrgs = [data];
      this.orgRowClick(data, column, null, true);
    },
    orgRowClick(row, column, event, radio) {
      const this_ = this;
      let bool = false;
      if (this.selectOrgs && !radio) {
        this.selectOrgs.forEach(element => {
          if (element.id == row.id) {
            this_.selectOrgs.remove(element);
            //this.selection.remove()
            bool = true;
          }
        });
      }
      if (bool) {
        this_.$refs.orgTable.toggleRowSelection(row, false);
        if (this.isSingle) {
          this.undefineda = false;
        }
      } else {
        this.$refs.orgTable.toggleRowSelection(row);
        this.selection.push(row);
        if (this.isSingle) {
          $(column.currentTarget.children[0].children[0].children[0]).trigger(
            "click"
          );
        } else {
          let arg = "name";
          if (utils.getAndValidPath(this.bindSet, "id")) {
            arg = "id";
          } else if (utils.getAndValidPath(this.bindSet, "code")) {
            arg = "code";
          }
          this.selection = this.selection.unique(arg);
          this.selectOrgs = this.selection;
        }
      }
    },
    orgTableSelection(selection) {},
    dialogConfirm() {
      this.orgDialogVisible = false;
      this.calacInputSuffixHeight();
      this.syncInputValue();
    },
    // 同步选择结果
    syncInputValue(item) {
      if (item) {
        //点击X删除元素，由于扩展的数组remove方法中 this的作用域不同导致第一次删除了，又获取到之前的数据
        this.selectOrgs.remove(item);
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
        if (!utils.getAndValidPath(this.bindSet, "name")) {
          throw "ht-dem-selector的bind属性中必须配置name属性.";
        }
        let nameAry = [];
        let idAry = [];
        let codeAry = [];
        this.selectOrgs &&
          this.selectOrgs.forEach(m => {
            nameAry.push(m.name);
            idAry.push(m.id);
            codeAry.push(m.code);
          });
        const idPath = utils.getAndValidPath(this.bindSet, "id");
        if (idPath) {
          utils.setValueByPath(this.$parent, idPath, idAry.join(","), subIndex);
        }
        const codePath = utils.getAndValidPath(this.bindSet, "code");
        if (codePath) {
          utils.setValueByPath(
            this.$parent,
            codePath,
            codeAry.join(","),
            subIndex
          );
        }
        this.$emit("input", nameAry.join(","));
      } else {
        this.$emit("input", this.selectOrgs);
      }
      this.updating = false;
    },
    dialogCancel() {
      this.orgDialogVisible = false;
    },
    clearAllSelectOrgs() {
      this.selectOrgs = [];
      this.selection = [];
      this.$refs.orgTable.clearSelection();
      if (this.isSingle) {
        this.undefineda = false;
      }
    },
    removeSelectOrgs() {
      let ary = this.$refs.selectTree.getCheckedNodes();
      ary.forEach(item => {
        this.selectOrgs.remove(item);
        this.uncheck(this.$refs.orgTable.data, item, false);
      });
      if (this.isSingle && ary.length > 0) {
        this.undefineda = false;
      }
    },
    removeSelectOrg(item) {
      this.calacInputSuffixHeight();
      this.syncInputValue(item);
      if (this.$refs.orgTable) {
        this.uncheck(this.$refs.orgTable.data, item, false);
      }
      if (this.isSingle) {
        this.undefineda = false;
      }
    },
    check() {
      setTimeout(() => {
        if (this.selectOrgs) {
          this.selectOrgs.forEach(item => {
            this.uncheck(this.$refs.orgTable.data, item, true);
          });
        }
      }, 250);
    },
    //table复选框选中and取消选中
    uncheck(data, item, bool) {
      let arg = "name";
      if (utils.getAndValidPath(this.bindSet, "id")) {
        arg = "id";
      } else if (utils.getAndValidPath(this.bindSet, "code")) {
        arg = "code";
      }
      const this_ = this;
      if (bool) {
        data.forEach(element => {
          if (item[arg] == element[arg]) {
            this_.$refs.orgTable.toggleRowSelection(element, true);
            //this_.selection.remove(element);
          }
        });
      } else {
        data.forEach(element => {
          if (item[arg] == element[arg]) {
            this_.$refs.orgTable.toggleRowSelection(element, false);
          }
        });
        this_.selection.forEach(element => {
          if (item[arg] == element[arg]) {
            this_.selection.remove(element);
          }
        });
      }
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
    },
    down() {
      let ary = this.$refs.selectTree.getCheckedNodes();
      utils.down(ary, this.selectOrgs, this);
    },
    up() {
      let ary = this.$refs.selectTree.getCheckedNodes();
      utils.up(ary, this.selectOrgs, this);
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
  padding: 20px 20px;
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
</style>