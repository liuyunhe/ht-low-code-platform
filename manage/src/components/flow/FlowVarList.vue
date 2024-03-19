<template>
  <div style="height:calc(100% - 20px);margin:10px;">
    <ht-table
      @load="loadData"
      :data="varList"
      :selectable="false"
      :nopagination="true"
      :show-export="false"
      :show-custom-column="false"
      ref="htTable"
    >
      <template v-slot:toolbar>
        <el-button size="mini" type="primary" icon="el-icon-plus" @click="operating('')">添加</el-button>
      </template>
      <ht-table-column type="index" width="50" align="center" label="序号" />
      <ht-table-column label="变量类型" width="100">
        <template v-slot="{row}">
          <span v-if="row.nodeId ==''">全局变量</span>
          <span v-if="row.nodeId !=''">{{row.nodeId}}</span>
        </template>
      </ht-table-column>
      <ht-table-column prop="name"  align="center" label="变量名" >
        <template v-slot="{row}">
                <el-link
                  type="primary"
                  @click="operating(row.varKey)"
                  title="编辑变量"
                >{{row.name}}</el-link>
              </template>
      </ht-table-column>
      <ht-table-column prop="varKey" width="150" align="center" label="变量key" />
      <ht-table-column prop="dataType" width="120" align="center" label="数据类型" />
      <ht-table-column prop="defaultVal" align="center" label="默认值" />
      <ht-table-column width="120" align="center" label="是否必需">
        <template v-slot="{row}">
          <el-tag type="success" v-if="row.required">必填</el-tag>
          <el-tag type="info" v-if="!row.required">非必填</el-tag>
        </template>
      </ht-table-column>
      <ht-table-column width="100" label="操作" align="center">
        <template v-slot="{row}">
          <el-button size="mini" type="danger" icon="el-icon-delete" @click="remove(row.varKey)">删除</el-button>
        </template>
      </ht-table-column>
    </ht-table>
    <ht-sidebar-dialog
      width="28%"
      :title="title"
      :visible="dialogVisibleSetting"
      :before-close="close"
      :close-on-click-modal="false"
      append-to-body
    >
      <el-form :model="data" data-vv-scope="settingSave">
        <table class="form-table" cellspacing="0" cellpadding="0" border="0">
          <tbody>
            <tr>
              <th width="130px">节点:</th>
              <td>
                <ht-select
                  clearable
                  v-model="data.bpmVariableDef.nodeId"
                  :options="data.nodeDefList"
                  :props="{key:'nodeId',value:'name'}"
                />
              </td>
            </tr>
            <tr>
              <th width="130px" class="is-required">变量名:</th>
              <td>
                <ht-input
                  v-model="data.bpmVariableDef.name"
                  placeholder="请输入变量名"
                  autocomplete="off"
                  :validate="{required:true}"
                  :maxlength="50"
                  :showWordLimit="true"
                ></ht-input>
              </td>
            </tr>
            <tr>
              <th width="130px" class="is-required">变量key:</th>
              <td>
                <ht-input
                  v-model="data.bpmVariableDef.varKey"
                  placeholder="请输入变量key"
                  autocomplete="off"
                  :validate="{
                    required:true,
                    regex: {
                        exp: '^[a-zA-Z0-9_-]{1,20}$',
                        message: '只能包含字母或数字'
                    }}"
                  :maxlength="50"
                  :showWordLimit="true"
                  :disabled="!isAdd"
                ></ht-input>
              </td>
            </tr>
            <tr>
              <th width="130px" class="is-required">数据类型:</th>
              <td>
                <ht-select
                  clearable
                  v-model="data.bpmVariableDef.dataType"
                  :options="[{key:'string',value:'字符串'},{key:'int',value:'整型'},{key:'float',value:'浮点型'},{key:'double',value:'双精度'}]"
                  validate="required"
                />
              </td>
            </tr>
            <tr>
              <th width="130px" class="is-required">是否必需:</th>
              <td>
                <ht-select
                  clearable
                  v-model="data.bpmVariableDef.required"
                  :options="[{key:'true',value:'是'},{key:'false',value:'否'}]"
                  validate="required"
                />
              </td>
            </tr>
            <tr>
              <th width="130px">默认值:</th>
              <td>
                <ht-input
                  v-model="data.bpmVariableDef.defaultVal"
                  placeholder="请输入默认值"
                  autocomplete="off"
                  :maxlength="50"
                  :showWordLimit="true"
                ></ht-input>
              </td>
            </tr>
            <tr>
              <th width="130px">变量描述:</th>
              <td>
                <ht-input
                  type="textarea"
                  :rows="8"
                  v-model="data.bpmVariableDef.description"
                  placeholder="请输入变量描述"
                  autocomplete="off"
                  :maxlength="200"
                  :showWordLimit="true"
                ></ht-input>
              </td>
            </tr>
          </tbody>
        </table>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" size="mini" @click="save" icon="el-icon-check">确 认</el-button>
        <el-button size="mini" @click="close" icon="el-icon-close">取 消</el-button>
      </div>
    </ht-sidebar-dialog>
  </div>
</template>

<script>
import { Message } from "element-ui";
import req from "@/request.js";
export default {
  name: "FlowVarList",
  props: {
    defId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      varList: [], //列表数据
      title: "添加流程变量",
      dialogVisibleSetting: false, //是否显示添加编辑流程变量侧边栏
      data: {
        bpmVariableDef: { nodeId: "", isRequired: "false", dataType: "string" },
        nodeDefList: []
      }, //添加编辑流程变量时的数据
      isAdd:false
    };
  },
  methods: {
    //保存流程变量
    save() {
      const this_ = this;
      this_.$validator.validateAll("settingSave").then(result => {
        if (result) {
          let isAdd = true; //是否新增流程变量
          if (this_.title == "添加流程变量") {
            isAdd = true;
          } else {
            isAdd = false;
          }
          let param = {
            variableDef: this_.data.bpmVariableDef,
            isAdd: isAdd,
            defId: this_.defId
          };
          req.post("${bpmModel}/flow/var/v1/save", param).then(function(data) {
            data = data.data;
            if (data.state) {
              Message.success((isAdd ? "添加" : "编辑") + "变量成功");
              this_.dialogVisibleSetting = false;
              this_.$refs.htTable.load(); //重新加载列表数据
            }
          });
        } else {
          let arr = this_.$validator.errors.items.filter(
            item => item.scope == "settingSave"
          );
          let errorLength = arr.length;
          this_.$message({
            showClose: true,
            message: `有${errorLength}个字段未通过校验，请正确填写表单内容。`,
            type: "warning"
          });
        }
      });
    },
    //删除流程变量
    remove(key) {
      const this_ = this;
      let url =
        "${bpmModel}/flow/var/v1/remove?defId=" +
        this_.defId +
        "&varKey=" +
        key;
      this_
        .$confirm("是否确认删除？", "提示", {
          cancelButtonText: "取消",
          confirmButtonText: "确定",
          type: "warning",
          closeOnClickModal: false
        })
        .then(() => {
          req.remove(url).then(function(rep) {
            rep = rep.data;
            if (rep.state) {
              if (rep.message) {
                Message.success(rep.message);
                this_.$refs.htTable.load(); //重新加载列表数据
              }
            } else {
              Message.error(rep.message);
            }
          });
        });
    },
    //添加或编辑流程变量
    operating(key) {
      this.title = key == "" ? "添加流程变量" : "编辑流程变量";
      this.isAdd = key === "" ? true:false;
      this.dialogVisibleSetting = true; //显示添加编辑流程变量侧边栏
      this.data = {
        bpmVariableDef: { nodeId: "", isRequired: "false", dataType: "string" },
        nodeDefList: []
      }; //清空值
      const this_ = this;
      req
        .get(
          "${bpmModel}/flow/var/v1/defVarEdit?defId=" +
            this_.defId +
            "&varKey=" +
            key
        )
        .then(function(res) {
          res = res.data;
          if (res.bpmVariableDef && !res.bpmVariableDef.required) {
            res.bpmVariableDef.required = "false";
          }else if (res.bpmVariableDef && res.bpmVariableDef.required === true) {
            res.bpmVariableDef.required = "true";
          }
          if (this_.title == "添加流程变量") {
            this_.data.nodeDefList = res.nodeDefList;
          } else {
            this_.data = res;
          }
          this_.data.nodeDefList.push({ nodeId: "", name: "全局变量" });
        });
    },
    //关闭侧边栏
    close() {
      this.dialogVisibleSetting = false;
    },
    //页面加载显示数据
    loadData(param, cb) {
      const this_ = this;
      let listUrl =
        "${bpmModel}/flow/var/v1/listJson?defId=" + this_.defId + "&nodeId=";
      req
        .get(listUrl)
        .then(function(data) {
          this_.varList = data.data;
        })
        .finally(() => cb());
    }
  },
  mounted() {
    this.$validator = this.$root.$validator;
  }
};
</script>
<style lang="scss" scoped>
.el-main {
  padding-top: 0px;
}
</style>
