<template>
  <div>
    <el-button type="primary" @click="initButton()">重置</el-button>
    <div>
      <el-tabs type="card">
        <el-tab-pane v-for="(sub,index) in subField" :key="index" :label="sub.desc">
          <el-row :gutter="20" style="width:100%;">
            <el-table
              ref="displaySettingTable"
              border
              :data="sub.attributeList"
              tooltip-effect="dark"
            >
              <el-table-column prop="name" label="列名" class="is-required" show-overflow-tooltip></el-table-column>
              <el-table-column prop="desc" label="注释" show-overflow-tooltip></el-table-column>
              <el-table-column prop="dataType" label="类型" width="80"></el-table-column>
              <el-table-column label="是否不显示" class="is-required" show-overflow-tooltip>
                <template slot-scope="scope">
                  <el-switch
                    v-model="sub.attributeList[scope.$index].isShow"
                    active-text="是"
                    inactive-text="否"
                  ></el-switch>
                </template>
              </el-table-column>
            </el-table>
          </el-row>
          <el-row>
            <div style="margin: 15px;font-size: 15px;">孙表字段</div>
          </el-row>
          <el-row>
            <el-tabs type="card">
              <el-tab-pane
                v-for="(sun,sunindex) in sub.childEnts"
                :key="sunindex"
                :label="sun.desc"
              >
                <el-table border :data="sun.attributeList" tooltip-effect="dark">
                  <el-table-column prop="name" label="列名" class="is-required" show-overflow-tooltip></el-table-column>
                  <el-table-column prop="desc" label="注释" show-overflow-tooltip></el-table-column>
                  <el-table-column prop="dataType" label="类型" width="80"></el-table-column>
                  <el-table-column label="是否不显示" class="is-required" show-overflow-tooltip>
                    <template slot-scope="scope">
                      <el-switch
                        v-model="sun.attributeList[scope.$index].isShow"
                        active-text="是"
                        inactive-text="否"
                      ></el-switch>
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>
            </el-tabs>
          </el-row>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>

export default {
  name: "sub-fields",
  props: ["data"],
  data() {
    return {
      subField: [],
      dataTemplate: {},
    };
  },
  computed: {},
  mounted() {
    this.dataTemplate = this.data.bpmDataTemplate;
    this.initData();
  },
  methods: {
    initButton() {
      this.subField = JSON.parse(JSON.stringify(this.data.subFormField));
    },
    initData() {
      if (this.data.bpmDataTemplate.subField) {
        this.subField = JSON.parse(this.data.bpmDataTemplate.subField);
      } else {
        this.subField = JSON.parse(JSON.stringify(this.data.subFormField));
      }
    },
    saveSubField() {
      this.dataTemplate.subField = this.subField
        ? JSON.stringify(this.subField)
        : null;
    },
  },
};
</script>
<style scoped>
.table > thead > tr > th,
.table > thead > th,
.table > tr > th,
.table > tfoot > tr > th,
.table > thead > tr > td,
.table > tr > td,
.table > tfoot > tr > td {
  border-top: 1px solid #e7eaec;
  border-left: 1px solid #e7eaec;
  line-height: 1.42857;
  padding: 4px 8px;
  vertical-align: middle;
  text-align: center;
}
.el-table >>> .el-radio-group {
  margin-left: 10px;
  margin-right: 10px;
}
</style>
