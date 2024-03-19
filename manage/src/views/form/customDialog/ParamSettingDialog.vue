<template>
  <div>
    <span style="float: right; color: #8492a6; font-size: 13px">
      <el-button style="padding: 3px 0" type="text" @click.stop="dialogVisible=true" title="配置属性">
        <i class="el-icon-setting" style="font-weight:bold;"></i>
      </el-button>
    </span>

    <el-dialog
      :title="title+'配置'"
      width="600px"
      :visible.sync="dialogVisible"
      :before-close="handleClose"
      :close-on-click-modal="false"
      append-to-body
    >
      <div style="height:400px;" >
     <template v-if="field.type=='tag'">
      <H3 style="margin-bottom: 0px;">标签</H3>
      <div class="customQuery-inputs">
        <el-select
            @visible-change="tagClick"
            clearable
            v-model="field.tag"
            placeholder="请选择标签"
            style="width: 100%"
            ref="tagSelect">
          <el-option
              :value="field.tag"
              :label="field.tagName"
              style="width: 100%;height:100%;overflow: auto;background-color:#fff">
            <el-tree :data="tagData" :props="dicDefaultProps" @node-click="tagNodeClick"></el-tree>
          </el-option>
        </el-select>
      </div>
        <el-switch
            v-model="field.filterable"
            active-color="#13ce66"
            inactive-color="#ff4949"
            active-text="可搜索"
            inactive-text="不可搜索">
        </el-switch>
        <br>
        <el-switch
            v-model="field.expand"
            active-color="#13ce66"
            inactive-color="#ff4949"
            active-text="可扩展"
            inactive-text="不可扩展">
        </el-switch>
    </template>   

        <!-- 下拉框 下拉树固态|动态选项配置 choiceType -->
    <template v-if="title=='下拉框'|| title=='单选框'">
      <ht-form-item label="选项配置" label-width="100px" class="select_config">
        <el-checkbox
          v-if="
            field.type == 'radio' || field.type == 'checkbox'
          "
          v-model="field.inline"
        >
          换行显示
          <el-tooltip content="是否换行显示">
            <i class="property-tip icon-question" />
          </el-tooltip>
        </el-checkbox>
        <span v-else style="margin-left:96px"></span>
        <el-radio-group
          @change="dynamicClick"
          v-model="field.choiceType"
          size="mini"
          class="btn-radio"
        >
          <el-radio-button
            label="static"
          >固定选项</el-radio-button>
          <el-radio-button label="dynamic">动态选项</el-radio-button>
        </el-radio-group>
      </ht-form-item>
      <div v-if="field.choiceType == 'static'">
        <table class="form-table choiceType-table" cellspacing="0" cellpadding="0" border="0">
          <tbody>
            <tr class="linkageTable-tr">
              <td style="width: 100px;">选项值</td>
              <td>选项标签</td>
              <td style="width: 60px;">
                操作
                <el-button
                  class="btn-padding"
                  icon="el-icon-plus"
                  @click="field.options.push({ key: '', value: '' })"
                ></el-button>
              </td>
            </tr>
            <tr v-for="(item, index) in field.options" :key="index">
              <td>
                <el-input size="mini" placeholder="选项值" v-model="item.key"></el-input>
              </td>
              <td>
                <el-input size="mini" placeholder="选项标签" v-model="item.value"></el-input>
              </td>
              <td style="text-align: center;">
                <el-button
                  class="btn-padding"
                  style="margin-left:0px;"
                  icon="el-icon-delete"
                  @click="field.options.remove(item)"
                ></el-button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="field.choiceType == 'dynamic'" class="customQuery-inputs">
        <ht-load-data
          url="/form/customQuery/v1/list"
          requestMethod="post"
          context="form"
          @after-load-data="afterCustomQueryLoadData"
        ></ht-load-data>
        <ht-select
          clearable
          filterable
          @change="setCurrentCustomQuery()"
          v-model="field.customQuery.alias"
          :options="customQuerys"
          :props="{ key: 'alias', value: 'name' }"
          
          @clear="setCurrentCustomQuery()"
        />
        <ht-form-item
          label
          label-width
          v-if="field.bind && field.bind.length > 0"
          class="basics-property"
        >
          <template slot="label">
            <el-tooltip content="自定义查询需要的参数传入">
              <i class="property-tip icon-question" />
            </el-tooltip>
            <span>参数绑定</span>
          </template>
          <template>
            <table class="form-table custDialog-table" cellspacing="0" cellpadding="0" border="0">
              <tbody>
                <tr class="linkageTable-tr">
                  <td width="100px;">参数名</td>
                  <td>取值对象</td>
                </tr>
                <tr
                  style="text-align: center;"
                  v-for="(bind, index) in field.bind"
                  :key="index"
                >
                  <td>{{ bind.comment }}</td>
                  <td>
                    <ht-select
                      clearable
                      v-model="bind.fieldPath"
                      :options="conditionfieldData"
                      :props="{ key: 'field', value: 'comment' }"
                    >
                    </ht-select>
                  </td>
                </tr>
              </tbody>
            </table>
          </template>
        </ht-form-item>
        <ht-form-item label label-width>
          <template slot="label">
            <el-tooltip content="返回值作为选项时的绑定">
              <i class="property-tip icon-question" />
            </el-tooltip>
            <span>选项绑定</span>
          </template>
          <br>
          <div>
            <ht-form-item label="值" label-width="50px" class="customQuery-inputs" style="text-align: left;">
              <ht-select
                clearable
                v-model="field.customQuery.valueBind"
                :options="field.customQuery.resultfield"
                :props="{ key: 'field', value: 'comment' }"
              />
            </ht-form-item>
            <ht-form-item label="标签" label-width="50px" class="customQuery-inputs">
              <ht-select
                clearable
                v-model="field.customQuery.labelBind"
                :options="field.customQuery.resultfield"
                :props="{ key: 'field', value: 'comment' }"
              />
            </ht-form-item>
          </div>
        </ht-form-item>
      </div>
    </template>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleSave">确 定</el-button>
        <el-button @click="handleClose">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { Message } from "element-ui";
import form from "@/api/form.js";
import req from "@/request.js";
export default {
  name: "param-setting-dialog",
  props: {
    //条件字段用户输入配置
    config: {
      type: Object,
      required: true,
    },
    data: {
      type: Array,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
     conditionfieldData: this.data,
      dialogVisible: false, //是否显示对话框
      mapParam: {}, //动态传入的条件参数
      field:this.config,
      dicDefaultProps: {
        children: "children",
        label: "name"
      },
      tagData: [],
      customQuerys: [],
    };
  },
  methods: {
    // 当字段与关联查询绑定后，将关联查询中多余的属性删除
    slimCustomQuery(customQuery) {
      if (customQuery && customQuery.constructor == Object) {
        // 删除多余的属性
        delete customQuery["id"];
        delete customQuery["createTime"];
        delete customQuery["pkVal"];
        delete customQuery["objName"];
        delete customQuery["needPage"];
        delete customQuery["pageSize"];
        delete customQuery["dsalias"];
        delete customQuery["dataParam"];
        delete customQuery["sortfield"];
        delete customQuery["diySql"];
        delete customQuery["isTable"];
        delete customQuery["sqlBuildType"];
        // delete customQuery["dsType"];
        delete customQuery["url"];
        delete customQuery["header"];
        delete customQuery["requestType"];
        delete customQuery["pageKey"];
        delete customQuery["pageSizeKey"];
        delete customQuery["totalKey"];
        delete customQuery["listKey"];
      }
    },
    //选择动态选项
    setCurrentCustomQuery() {
      const _this = this;
      _this.field.customQuery.custQueryJson = [];
      _this.customQuerys.forEach(item => {
        if (_this.field.customQuery.alias == item.alias) {
          if (typeof item.conditionfield == "string") {
            item.conditionfield = JSON.parse(item.conditionfield); //parseToJson(item.customQuery.conditionfield);
            item.resultfield = JSON.parse(item.resultfield); // parseToJson(item.customQuery.resultfield);
          }
          //把当前对象克隆一份到控件属性配置
          Object.assign(_this.field.customQuery, item);
          _this.slimCustomQuery(_this.field.customQuery);
        }
      });
      //删除掉无效的参数
      var bind = [];
      this.field.customQuery.conditionfield.forEach(item => {
        if (item.defaultType == 1) {
          bind.push(item);
        }
      });
      this.field.bind = bind;
      //切换关联数据设置项或下拉框动态值 同时清空绑定返回值、参数绑定、选项绑定
      this.custDialogprop = {};
      this.field.options.gangedBind = {};
      this.field.customQuery.valueBind = "";
      this.field.customQuery.labelBind = "";
      if (this.field.customQuery.conditionfield) {
        this.field.customQuery.conditionfield.forEach(element => {
          this.$set(element, "fieldPath", "");
        });
      }
    },
    afterCustomQueryLoadData(data) {
      this.customQuerys = data.rows;
    },
    tagNodeClick(data){
      this.field.tag = data.typeKey;
      this.field.tagName = data.name;
      this.$refs.tagSelect.blur();
    },
    tagClick(visible){
      if (this.tagData && this.tagData.length > 0)
        return;
      form.getCategory("TAG", data => {
        this.tagData = data.data;
      });
    },
    //切换固定选项和动态选项时
    dynamicClick() {
      this.customQueryUrl = "/form/customQuery/v1/list";
      this.field.customQuery = {
        valueBind: "",
        labelBind: "",
        conditionfield: [],
        custQueryJson: []
      };
      this.field.bind = [];
      this.field.options = [];
    },
    //确认对话框
    handleSave() {
      this.$emit("returnVal", this.field);
      this.dialogVisible = false;
      // setTimeout(() => {
      //   this.$refs.eipTreeDialog.showDialog();
      // });
    },
    //关闭对话框
    handleClose() {
      this.dialogVisible = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.el-main {
  padding-top: 0px;
}
.linkageTable-tr td {
  text-align: center;
}
.btn-padding {
  padding: 5px;
}
.choiceType-table td {
  padding: 3px;
}
.select_config {
  margin-bottom:0px;
  margin-right:0px;
}
.select_config >>>.el-form-item__label{
  text-align: left;
}
.select_config >>> .el-form-item__content{
  text-align: right;
}
.customQuery-inputs >>> .inputs,
.customQuery-inputs >>> .inputs .el-select {
  width: 100%;
}
.custDialog-table td {
  padding: 5px;
}
</style>