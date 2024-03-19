<template>
  <el-container>
    <el-footer
      style="height: 40px;line-height: 40px;padding:0px;"
      v-if="inputWriteable && permission_sub!='n'"
    >
      <el-button
        type="primary"
        size="small"
        @click="flowSelected"
        icon="el-icon-plus"
        plain
        round
        style="margin-left:0"
      >添加</el-button>
    </el-footer>
    <el-input
      :name="inputName" v-validate="inputValidate"
      v-model="inputVal"
      style="display: none;"
    ></el-input>
    <el-table v-if="dataTable.length>0 && permission_sub!='n'" :data="dataTable" border style="width: 100%" row-key="subject">
      <el-table-column type="index" width="70" align="center"  label="序号"></el-table-column>
      <el-table-column label="流程主题" align="center">
        <template slot-scope="scope">
          <span class="subject" @click="handleRowClick(scope.row)">{{scope.row.subject}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="creator" align="center" label="发起人" width="110"></el-table-column>
      <el-table-column prop="createTime" align="center" width="160"  label="发起时间"></el-table-column>
      <el-table-column prop  label="操作" align="center" width="200" v-if="inputWriteable">
        <template slot-scope="scope">
          <el-button @click="up(scope.$index)" size="small" icon="el-icon-arrow-up" plain></el-button>
          <el-button
            @click="down(scope.$index)"
            size="small"
            icon="el-icon-arrow-down"
            plain
          ></el-button>
          <el-button
            @click="remove(scope.row)"
            type="danger"
            size="small"
            icon="el-icon-delete"
            plain
          ></el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog
      title="添加相关流程"
      :visible.sync="relatedInformationDialog"
      :close-on-click-modal="false"
      width="60%"
      top="8vh"
    >
      <el-col :span="24" class="searchStyle">
        <el-col :span="2">
          流程标题：
        </el-col>
        <el-col :span="6">
          <el-input
              size="small"
              style="width:30%;"
              clearable
              placeholder="请输入流程标题"
              prefix-icon="el-icon-search"
              v-model="subject"
          ></el-input>
        </el-col>
        <el-col :span="2">
          &emsp;创建时间：
        </el-col>
        <el-col :span="6">
          <el-date-picker
              size="small"
              style="width:30%"
              clearable
              placeholder="创建时间"
              prefix-icon="el-icon-search"
              v-model="createTime"
              format="yyyy-MM-dd"
          ></el-date-picker>
        </el-col>
        <el-button
          style="margin-left: 20px"
          size="small"
          type="primary"
          icon="el-icon-search"
          @click="search()"
        >查询</el-button>
        <el-button size="small" icon="el-icon-refresh" @click="reset">重置</el-button>
      </el-col><br><br>
      <div style="padding-top: 10px;">
        <div class="record-content">
          <el-table
            :data="rows"
            style="width: 100%;"
            stripe
            border
            header-cell-class-name="todo-header-row"
            row-class-name="todo-row"
            size="medium"
            :default-sort="{prop: 'createTime', order: 'descending'}"
            @selection-change="handleChecked"
            @select="onTableSelect"
            ref="flowTable"
            @row-click="RowClick"
          >
            <el-table-column type="selection"   width="60" align="center" sortable ></el-table-column>
            <el-table-column type="index" align="center" width="70" label="序号"></el-table-column>
            <el-table-column prop="creator" width="120" label="创建人" align="center"></el-table-column>
            <el-table-column prop="subject" width="400" label="流程标题" align="center"></el-table-column>
            <el-table-column prop="procDefName" width="280" label="流程名称" align="center"></el-table-column>
            <el-table-column prop="createTime" label="创建时间" align="center"></el-table-column>
          </el-table>
          <el-footer style="padding-top:10px;" height="45px">
            <el-row type="flex" justify="end">
              <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="pagination.page"
                :page-sizes="[ 10,20, 50,100,300,500]"
                :page-size="pagination.pageSize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
              ></el-pagination>
            </el-row>
          </el-footer>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="confirm" size="small">确 定</el-button>
        <el-button @click="cancel" size="small">取 消</el-button>
      </div>
    </el-dialog>
  </el-container>
</template>

<script>
import { mapState, mapActions } from "vuex";
import utils from "@/utils.js";
import sub_pio_mixin from "@/sub-permission-mixin.js";
import hotentUiUtils from '@/hotent-ui-util.js';

export default {
  name: "eip-rel-flow",
  props: ["modelName", "validate", "permission","searchConfig","value"],
  components: {},
  mixins: [sub_pio_mixin],//混入方式引入表单组件中公共属性，处理子表、孙表行内联动（切面修改permission_sub）
  data() {
    return {
      relatedInformationDialog: false,
      checked: true,
      subject: "",
      inputVal:"",
      createTime: "",
      checkBoxData: [],
      checkBoxDataAll: [],
      dataTable: [],
      writeable:true,
    };
  },
  watch: {
    inputVal: function(newVal, oldVal) {
      this.$emit("input", newVal);
    }
  },
  computed: mapState({
    rows: state => state.relatedProcess.rows,
    pagination: state => state.relatedProcess.pagination,
    total: state => state.relatedProcess.total,
    relatedInformation: state => state.relatedProcess.relatedInformation,
    inputWriteable: function() {
      if (!this.writeable) {
        return this.writeable;
      }
      return utils.getWriteable(this.permission_sub);
    },
    inputName: function() {
      let labeldesc = "";
      if (
        this.$slots &&
        this.$slots.labeldesc &&
        this.$slots.labeldesc[0].children &&
        this.$slots.labeldesc[0].children[0].text
      ) {
        labeldesc = this.$slots.labeldesc[0].children[0].text;
        return this.name ? this.name : utils.getName() + "-" + labeldesc;
      } else {
        return this.name ? this.name : utils.getName();
      }
    },
    inputValidate: function() {
      return utils.addRequiredOrNot(this.permission, this.validate, this);
    }
  }),
  methods: {
    cancel() {
      this.relatedInformationDialog = false;
    },
    //确认
    confirm() {
      const _me = this;
        this.checkBoxData.forEach(row => {
            let res=_me.indexArray(_me.checkBoxDataAll,row);
            if(res==-1){
              _me.checkBoxDataAll.push(row);
            }
        });
      this.dataTable = this.checkBoxDataAll;
      this.relatedInformationDialog = false;
      if (this.modelName) {
        // const pInst = utils.getOnlineFormInstance(_me);
        // utils.setValueByPath(pInst, this.modelName, JSON.stringify(this.dataTable));
        this.inputVal= JSON.stringify(this.dataTable);
      }
    },
    handleChecked(value) {
      this.checkBoxData = value;
    },
    handleSizeChange: function(size) {
      //每页下拉显示数据
      this.$store.dispatch("relatedProcess/setPaginationSize", size);
      this.search();
    },
    handleCurrentChange: function(currentPage) {
        const this_ = this;
        if(this.checkBoxData!=undefined&&this.checkBoxData.length>0){
            this.checkBoxData.forEach(row => {
                let res=this_.indexArray(this_.checkBoxDataAll,row);
                if(res==-1){
                    this_.checkBoxDataAll.push(row);
                }
            });
        }
        this_.checkBoxData=this_.checkBoxDataAll;
      //点击第几页
      this.$store.dispatch("relatedProcess/setPaginationPageNum", currentPage);
      this.search();
    },
    RowClick(row, column, event) {
      this.$refs.flowTable.toggleRowSelection(row);
    },
    check() {
        const this_ = this;
      setTimeout(() => {
          if(this_.checkBoxData==undefined || this_.checkBoxData.length==0){
              this_.checkBoxData=this_.checkBoxDataAll;
          }
        this_.checkBoxData.forEach(row => {
          let res=this_.indexArray(this_.rows,row);
          if(res!=-1){
            this_.$refs.flowTable.toggleRowSelection(this_.rows[res]);
          }
        });
      }, 250);
    },
    onTableSelect(rows, row){
      let selected = rows.length && rows.indexOf(row) !== -1
      if(!selected){
          let res=this.indexArray(this.checkBoxDataAll,row);
          this.checkBoxDataAll.splice(res, 1);
          if(this.checkBoxDataAll.length==0){
              this.checkBoxData=[];
          }
      }
    },
    search() {
      let querys = []; //查询条件
      let queryFilter = {};
      ;
      let pageBean = { pageBean: this.pagination };
      if (this.subject != "") {
        querys.push({
          property: "SUBJECT_",
          value: this.subject,
          group: "main",
          operation: "LIKE",
          relation: "AND"
        });
      }
      if (this.createTime != "") {
        querys.push({
          property: "CREATE_TIME_",
          value: utils.formatDateYear(this.createTime),
          group: "main",
          operation: "LIKE",
          relation: "AND"
        });
      }
      if (querys.length > 0) {
        if(this.searchConfig.isPaging){
          queryFilter = { pageBean: { page: "1", pageSize: this.searchConfig.pageSize, showTotal: "true" }, querys };
        }else{
          queryFilter = {pageBean:{}};
        }
        this.$store.dispatch("relatedProcess/getlistJson", queryFilter);
      } else {
        this.$store.dispatch("relatedProcess/getlistJson", pageBean);
      }
      this.check();
    },
    flowSelected: function() {
      if(this.checkBoxData==undefined||this.checkBoxData.length==0){
        this.checkBoxData=this.dataTable;
      }
      this.relatedInformationDialog = true;
      var pageBean={};
      if(this.searchConfig.isPaging){
        pageBean={ page: 1, pageSize:  this.searchConfig.pageSize, showTotal: true };
      }
      let pagination = { pageBean:  pageBean};
      this.$store.dispatch("relatedProcess/getlistJson", pagination);
      setTimeout(() => {
        this.check()
      },500);

    }, //重置
    reset() {
      this.subject = "";
      this.createTime = "";
      this.search();
    },
    remove(row) {
      this.dataTable.remove(row);
      if (this.modelName) {
        // const pInst = utils.getOnlineFormInstance(this);
        // utils.setValueByPath(pInst, this.modelName, JSON.stringify(this.dataTable));
        if(this.dataTable.length<1){
          this.inputVal= "";
        }else{
          this.inputVal= JSON.stringify(this.dataTable);
        }
      }
    }, //上移按钮
    up(idx) {
      idx = Number.parseInt(idx);
      if (idx < 1) {
        return;
      }
      var t = this.dataTable[idx - 1];
      this.$set(this.dataTable,idx-1,this.dataTable[idx])
      this.$set(this.dataTable,idx,t)
      if (this.modelName) {
        // const pInst = utils.getOnlineFormInstance(this);
        // utils.setValueByPath(pInst, this.modelName, JSON.stringify(this.dataTable));
        this.inputVal= JSON.stringify(this.dataTable);
      }

    },
    //下移按钮
    down(idx) {
      idx = Number.parseInt(idx);
      if (idx >= this.dataTable.length - 1) {
        return;
      }

      var t = this.dataTable[idx + 1];
      this.$set(this.dataTable,idx+1,this.dataTable[idx])
      this.$set(this.dataTable,idx,t)

      if (this.modelName) {
        // const pInst = utils.getOnlineFormInstance(this);
        // utils.setValueByPath(pInst, this.modelName, JSON.stringify(this.dataTable));
        this.inputVal= JSON.stringify(this.dataTable);
      }
    },
    handleRowClick(row) {
      window.open(this.$router.resolve("/inst/" + row.id).href, "_self");
    },
    //去重json数组重复数据
    uniqueArray(array, key) {
      var result = [array[0]];
      for (var i = 1; i < array.length; i++) {
        var item = array[i];
        var repeat = false;
        for (var j = 0; j < result.length; j++) {
          if (item[key] == result[j][key]) {
            repeat = true;
            break;
          }
        }
        if (!repeat) {
          result.push(item);
        }
      }
      return result;
    },
    indexArray(array, item) {
      for (var i = 0; i < array.length; i++) {
        if(array[i].id==item.id){
          return i;
        }
      }
      return -1;
    }
  },

  created() {
    this.$validator = this.$root.$validator;
  },
  mounted() {
    const _me = this;
    if (this.modelName) {
      // const pInst = utils.getOnlineFormInstance(_me);
      // const oldVal = utils.getValueByPath(pInst, this.modelName);
      if (this.value) {
        this.dataTable = JSON.parse(this.value);
      }
    }
    const { subScopeEl, index } = hotentUiUtils.getSubScopeElAndIndex(this.$el);
    if (subScopeEl && (subScopeEl.getAttribute("row_readonly") == 'true' || subScopeEl.getAttribute("row_readonly") === true)) {
      this.writeable = false;
    }
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/css/element-variables.scss";
/deep/.el-dialog__body {
    padding: 0px 20px;
    color: $--color-text-regular;
    font-size: 14px;
    word-break: break-all;
}
.form-table {
  width: 100%;
  border-top: 1px solid #ebeef5;
  border-left: 1px solid #ebeef5;
}

.form-table th {
  color: #666;
}

.form-table th > span {
  color: #f00;
}

.form-table th, .form-table td {
  border-right: 1px solid #ebeef5;
  border-bottom: 1px solid #ebeef5;
  padding: 10px;
  min-width: 0;
  box-sizing: border-box;
  text-overflow: ellipsis;
  vertical-align: middle;
  position: relative;
}

.recordInformation {
  width: 15%;
}

.overstriking {
  font-weight: 700;
}

.searchStyle{
  display: flex;
  flex-direction: row;
  align-items: center;
}
.subject{
  cursor:pointer;
  color: $--theme-color;
}
</style>
