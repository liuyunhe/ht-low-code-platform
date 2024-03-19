<template>
  <el-container>
    <el-dialog
      width="80%"
      :title="title"
      :visible.sync="dialogVisible"
      :before-close="handleClose"
      append-to-body
      top="8vh"
      :close-on-click-modal="false"
    >
      <el-form :model="formData" data-vv-scope="templateForm">
        <el-row>
          <el-col :span="12">
            <ht-form-item label="脚本类型" label-width="120px">
              <el-radio
                v-model="formData.type"
                :label="2"
                >人员脚本</el-radio
              >
              <el-tooltip class="item" effect="dark" placement="top-end">
                <div slot="content">
                  <span>人员脚本用于流程设计中节点人员设置，需要新增后端方法则<br/>实现IUserScript接口或者在已实现的接口下进行添加</span>
                </div>
                <i class="el-icon-question"></i>
              </el-tooltip>
            </ht-form-item>
          </el-col>
          <el-col :span="12">
            <ht-form-item label="脚本所在类" label-width="120px">
              <ht-select
                  v-if="status!=='notEdit'"
                  v-model="formData.className"
                  :options="className"
                  :props="{key:'value',value:'value'}"
                  :validate="{required:true}"
                  @change="classNameChange()"
                  style="width: 350px"/>
              <ht-input
                v-else
                disabled
                v-model="formData.className"
                :validate="{ required: true }"
              />
            </ht-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <ht-form-item label="类实例名" label-width="120px">
              <ht-input disabled v-model="formData.classInsName" />
            </ht-form-item>
          </el-col>
          <el-col :span="12">
            <ht-form-item label="方法名称" label-width="120px">
              <ht-select
                  v-if="status!=='notEdit'"
                  v-model="formData.methodName"
                  :options="methodName"
                  :props="{key:'value',value:'value'}"
                  :validate="{required:true}"
                  style="width: 350px"
                  @change="methodNameChange"/>
              <ht-input v-else disabled v-model="formData.methodName" />
            </ht-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <ht-form-item label="返回值类型" label-width="120px">
              <ht-input disabled v-model="formData.returnType" />
            </ht-form-item>
          </el-col>
          <el-col :span="12">
            <ht-form-item label="是否有效" label-width="120px">
              <ht-select
                v-if="status != 'notEdit'"
                :options="isEnable"
                v-model="formData.enable"
                style="width:350px"
              />
              <span v-else-if="formData.enable == 0">无效</span>
              <span v-else-if="formData.enable == 1">有效</span>
            </ht-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col >
            <ht-form-item   label="方法描述" label-width="120px">
              <ht-input
                v-if="status != 'notEdit'"
                v-model="formData.methodDesc"
                width="600px"
                :maxlength="200"
                :showWordLimit="true"
              />
              <ht-input v-else disabled v-model="formData.methodDesc" />
            </ht-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col>
            <ht-form-item label="参数信息" label-width="120px">
              <table
                v-if="status != 'notEdit'"
                class="form-table"
                cellspacing="0"
                cellpadding="0"
                border="0"
              >
                <tbody>
                  <tr>
                    <th width="100px" style="text-align: center">参数信息:</th>
                    <th width="120px" style="text-align: center">参数类型:</th>
                    <th width="200px" style="text-align: center">参数说明:</th>
                    <th width="120px" style="text-align: center">选择器:</th>
                    <th width="100px" style="text-align: center">绑定字段:</th>
                  </tr>
                  <tr v-for="(item, index) in argument" :key="index">
                    <td>
                      <span>{{ item.paraName }}</span>
                    </td>
                    <td>
                      <span>{{ item.paraType }}</span>
                    </td>
                    <td>
                      <ht-input v-model="item.paraDesc" :maxlength="50" :showWordLimit="true"/>
                    </td>
                    <td>
                      <span>
                        <el-select
                          @change="selectorChange"
                          v-model="item.paraCt"
                          placeholder="请选择"
                          :clearable="true"
                        >
                          <el-option-group
                            v-for="group in options"
                            :key="group.label"
                            :label="group.label"
                          >
                            <el-option
                              v-for="item in group.options"
                              :key="item.value"
                              :label="item.label"
                              :value="item.value"
                            >
                            </el-option>
                          </el-option-group>
                        </el-select>
                      </span>
                    </td>
                    <td>
                      <el-select
                        @change="selectorChange"
                        v-model="item.paraCtBindKey"
                        placeholder="请选择"
                        :clearable="true"
                      >
                        <el-option
                          v-for="item in field"
                          :key="item.field"
                          :label="item.comment"
                          :value="item.field"
                        >
                        </el-option>
                      </el-select>
                    </td>
                  </tr>
                </tbody>
              </table>
              <span v-else>{{ formData.argument }}</span>
            </ht-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <ht-submit-button
          :url="saveUrl()"
          :model="formData"
          :is-submit="isSubmit"
          scope-name="templateForm"
          @before-save-data="beforeSaveData()"
          @after-save-data="afterSaveData()"
          >保存</ht-submit-button
        >
        <el-button @click="handleClose">取 消</el-button>
      </div>
    </el-dialog>
  </el-container>
</template>

<script>
import flow from "@/api/flow.js";
export default {
  props: ["editData"],
  data() {
    return {
      isEnable: [{ key: 0, value: "无效" }, { key: 1, value: "有效" }],
      className: [],
      title: "",
      dialogVisible: false,
      formData: {
        type: 2,
        className: "",
        classInsName: "",
        createOrgId: "",
        enable: 1,
        methodDesc: "",
        methodName: "",
        returnType: "",
        argument: [{ paraName: "", paraType: "", paraDesc: "" }]
      },
      isSubmit: false,
      status: "",
      argument: [],
      options: [
        {
          label: "基本选择器",
          options: [
            {
              value: "base:user-selector",
              label: "用户选择器"
            },
            {
              value: "base:org-selector",
              label: "组织选择器"
            },
            {
              value: "base:role-selector",
              label: "角色选择器"
            },
            {
              value: "base:pos-selector",
              label: "岗位选择器"
            },
            {
              value: "base:job-selector",
              label: "职务选择器"
            },
            {
              value: "base:dem-selector",
              label: "维度选择器"
            }
          ]
        },
        {
          label: "",
          options: [{ value: "", label: "" }]
        }
      ],
      field: [],
      linkageData: [],
      methodName: [],
      methodChangeData:[]
    };
  },
  methods: {
    //打开侧边栏
    handleOpen() {
      this.dialogVisible = true;
      if (this.editData.data) {
        this.formData = this.editData.data;
        this.argument = JSON.parse(this.editData.data.argument);

      }
      if (this.editData.status) {
        this.status = this.editData.status;
      }
      if(!this.editData.id){
        this.getConditionScriptEditData('');
      }
      this.title = this.editData.title;
      this.getClassName();
    },
    //获取选择器
    getConditionScriptEditData(id) {
      flow.getConditionScriptEditData(id).then(resp => {
        this.linkageData = resp.data;
        let optionsLabel = resp.data.optionJson[0].lable;
        let options = [];
        for (let i = 0; i < resp.data.optionJson[0].option.length; i++) {
          let value = resp.data.optionJson[0].option[i].value;
          let label = resp.data.optionJson[0].option[i].name;
          options.push({ value, label });
        }
        this.options[1].label = optionsLabel;
        this.options[1].options = options;
      });
    },
    //获取选定选择器的字段
    selectorChange(row) {
      switch (row) {
        case "base:user-selector":
          this.field=[{comment:"id",field:"id"},{comment:"fullname",field:"fullname"},{comment:"account",field:"account"}]
          break;
        case "base:org-selector":
          this.field=[{comment:"id",field:"id"},{comment:"name",field:"name"},{comment:"code",field:"code"}]
          break;
        case "base:role-selector":
          this.field=[{comment:"id",field:"id"},{comment:"name",field:"name"},{comment:"code",field:"code"}]
          break;
        case "base:pos-selector":
          this.field=[{comment:"id",field:"id"},{comment:"name",field:"name"},{comment:"code",field:"code"}]
          break;
        case "base:job-selector":
          this.field=[{comment:"id",field:"id"},{comment:"name",field:"name"},{comment:"code",field:"code"}]
          break;
        case "base:dem-selector":
          this.field=[{comment:"id",field:"id"},{comment:"name",field:"name"},{comment:"code",field:"code"}]
          break;
      }
      for (let i = 0; i < this.linkageData.optionJson[0].option.length; i++) {
        if (row == this.linkageData.optionJson[0].option[i].value) {
          this.field = JSON.parse(this.linkageData.optionJson[0].option[i].resultfield);
          return;
        }
      }
    },
    //关闭侧边栏
    handleClose() {
      this.dialogVisible = false;
      this.field = [];
      this.status= "";
      this.argument=[];
      this.formData = {
        type: 2,
        className: "",
        classInsName: "",
        createOrgId: "",
        enable: 1,
        methodDesc: "",
        methodName: "",
        returnType: "",
        argument: [{ paraName: "", paraType: "", paraDesc: "" }]
      };
      this.$emit("loadData");
    },
    saveUrl() {
      return window.context.bpmRunTime + "/runtime/conditionScript/v1/save";
    },
    beforeSaveData() {
      this.formData.argument=JSON.stringify(this.argument);
      this.isSubmit = true;
    },
    afterSaveData() {
      this.handleClose()
    },
    //方法切换
    methodNameChange(row){
      for (let i=0;i<this.methodChangeData.length;i++){
        if(row == this.methodChangeData[i].methodName){
          this.formData.returnType=this.methodChangeData[i].returnType
          this.argument = this.methodChangeData[i].para
          return;
        }
      }
    },
    //切换脚本所在类
    classNameChange() {
      this.methodName = [];
      if(!this.formData.id){
        this.formData.id=''
      }
      let classInName = this.formData.className.substr(this.formData.className.lastIndexOf(".")+1,this.formData.className.length)
      this.formData.classInsName = classInName.replace(classInName[0],classInName[0].toLowerCase())
      flow
        .getClassMethod(
          this.formData.className,
          this.formData.id,
          this.formData.type
        )
        .then(resp => {
          if (resp.data.state) {
            var result = JSON.parse(resp.data.value);
            this.methodChangeData = result;
            for (let i = 0; i < result.length; i++) {
              this.methodName.push({ value: result[i].methodName });
            }
          }
        });
    },
    //获取脚本所在类
    getClassName() {
      this.className = [];
      flow.getConditionScriptClassName(this.formData.type).then(resp => {
        for (let i = 0; i < resp.data.length; i++) {
          this.className.push({ value: resp.data[i] });
        }
      });
    }
  }
};
</script>

<style scoped></style>
