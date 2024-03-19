<template>
  <el-container>
    <el-row :gutter="20" style="width:100%;">
      <el-col :span="7">
        <el-table
          ref="sortSettingTable"
          border
          :max-height="tabHeight"
          :data="sortSettingFields"
          tooltip-effect="dark"
          @row-dblclick="fillToSort"
        >
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column prop="name" label="列名" show-overflow-tooltip></el-table-column>
          <el-table-column prop="desc" label="注释" show-overflow-tooltip></el-table-column>
          <el-table-column prop="type" label="类型" width="80"></el-table-column>
        </el-table>
      </el-col>
      <el-col :span="1">
        <el-button
          type="primary"
          circle
          icon="icon-hide"
          title="将所选字段添加为排序字段"
          style="-webkit-transform: rotate(270deg);transform: rotate(270deg)"
          @click="allFillToSort()"
        />
      </el-col>
      <el-col :span="16">
        <el-table
          ref="sortTable"
          border
          :max-height="tabHeight"
          :data="sortFields"
          tooltip-effect="dark"
          style="width: 100%"
        >
          <el-table-column label="序号" type="index" width="50"></el-table-column>
          <el-table-column prop="name" label="列名" width="135"></el-table-column>
          <el-table-column prop="desc" label="注释" width="150"></el-table-column>
          <el-table-column prop="sort" label="排序" width="130">
            <template slot-scope="scope">
              <ht-select
                v-model="scope.row.sort"
                :options="[{'key': 'ASC','value': '升序'},{'key': 'DESC','value': '降序'}]"
                :validate="{'required':true}"
              />
            </template>
          </el-table-column>
          <el-table-column label="管理">
            <template slot-scope="scope">
              <el-button
                @click="sort(scope.$index,'down')"
                size="small"
                icon="el-icon-arrow-down"
                plain
              ></el-button>
              <el-button
                @click="sort(scope.$index,'up')"
                size="small"
                icon="el-icon-arrow-up"
                plain
              ></el-button>
              <el-button
                @click="remove(scope.$index);"
                type="danger"
                size="small"
                icon="el-icon-delete"
                plain
              ></el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
  </el-container>
</template>

<script>
import deepmerge from "deepmerge";
export default {
  name: "sort-setting",
  props: ["data"],
  data() {
    return {
      dataTemplate: {},
      sortSettingFields: [],
      sortFields: [],
      tabHeight: `${document.documentElement.clientHeight}` - 245
    };
  },
  mounted() {
    this.dataTemplate = this.data.bpmDataTemplate;
    if (this.data.fields) {
      let fields = deepmerge({}, this.data.fields, { clone: true });
      fields=fields.filter(item=>!item.flowField);
      this.sortSettingFields =fields;
    }
    this.templates = this.data.templates;
    this.initData();
  },
  methods: {
    //保存排序数据
    saveSortField() {
      this.dataTemplate.sortField = this.sortFields
        ? JSON.stringify(this.sortFields)
        : null;
    },
    //初始化处理
    initData() {
      if (this.dataTemplate.sortField) {
        this.sortFields = JSON.parse(this.dataTemplate.sortField);
      }
    },
    columnFilter(type) {
      return type != "sub" && type != "tabs";
    },
    //双击字段列表中的字段时将该字段加入到显示字段
    fillToSort(row, event, column) {
      let isIn = this.isInsortFields(row.name);
      if (!isIn) {
        //row.sort = 'ASC';
        this.$set(row,"sort","ASC");
        this.sortFields.push(row);
      }
    },
    //将字段列表中的已选字段加入到显示字段列表
    allFillToSort() {
      let selectrows = this.$refs.sortSettingTable.store.states.selection;
      if (!selectrows || selectrows.length < 1) {
        this.$message({
          message: "请在左侧列表中选择要作为排序的字段",
          type: "warning"
        });
      }
      selectrows.forEach(obj => {
        if(obj.type == 'clob'){
          this.$message({
            message: "大文本不能作为排序字段！",
            type: "warning"
          });
          return;
        }
        if (!this.isInsortFields(obj.name)) {
          //obj.sort = 'ASC';
          this.$set(obj,"sort","ASC");
          this.sortFields.push(obj);
        }
      });
    },
    //显示字段排序
    sort(index, type) {
      if ("up" == type) {
        if (index === 0) {
          this.$message({
            message: "已经是列表中第一位",
            type: "warning"
          });
        } else {
          let temp = this.sortFields[index - 1];
          this.$set(this.sortFields, index - 1, this.sortFields[index]);
          this.$set(this.sortFields, index, temp);
        }
      } else {
        if (index === this.sortFields.length - 1) {
          this.$message({
            message: "已经是列表中最后一位",
            type: "warning"
          });
        } else {
          let i = this.sortFields[index + 1];
          this.$set(this.sortFields, index + 1, this.sortFields[index]);
          this.$set(this.sortFields, index, i);
        }
      }
    },
    //删除显示字段
    remove(index) {
      this.sortFields.splice(index, 1);
    },
    //判断字段是否已在显示字段列表中
    isInsortFields(name) {
      let isIn = false;
      if (this.sortFields && this.sortFields.length > 0) {
        this.sortFields.forEach(obj => {
          if (obj.name == name) {
            isIn = true;
            return;
          }
        });
      }
      return isIn;
    }
  }
};
</script>
<style scoped>
</style>
