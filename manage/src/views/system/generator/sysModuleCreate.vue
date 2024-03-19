<template>
  <div class="fullheight">
    <el-row style="padding-top:50px">
      <el-col :offset="6" :span="12">
        <el-steps :active="active" finish-status="success" align-center>
          <el-step title="应用类型"></el-step>
          <el-step title="基本信息"></el-step>
          <el-step title="菜单配置"></el-step>
        </el-steps>
      </el-col>
    </el-row>

    <div
      class="flex"
      v-if="active === 1"
      style="justify-content: space-evenly; margin-top: 30px;"
    >
      <el-card
        :body-style="{ padding: '0px' }"
        style="width:380px; height:480px"
      >
        <div style="padding: 40px">
          <div class="block" style="text-align: center">
            <el-avatar
              :size="100"
              style="background: #FAECEE"
              fit="scale-down"
              :src="flowSvg"
            ></el-avatar>
            <span class="type-title__span">流程模块</span>
          </div>
          <div class="block" style="margin:30px;width:240px;height:150px;">
            <span class="type-header__span">开发流程模块</span>
            <span class="type-desc__span"
              >根据流程模板创建流程工作空间，可对某条流程进行全过程管理，并针对表单数据进行增删查改导出和明细查看与报表查看等操作。</span
            >
          </div>
          <div style="text-align:center">
            <el-button type="primary" @click="selectModuleType('flow')"
              >立即创建</el-button
            >
          </div>
        </div>
      </el-card>
      <el-card
        :body-style="{ padding: '0px' }"
        style="width:380px; height:480px"
      >
        <div style="padding: 40px">
          <div style="text-align: center">
            <el-avatar
              :size="100"
              style="background: #F9EEE4"
              fit="scale-down"
              :src="formSvg"
            ></el-avatar>
            <span class="type-title__span" style="color: #F48D2F"
              >表单模块</span
            >
          </div>
          <div style="margin:30px;width:240px;height:150px;">
            <span class="type-header__span">开发表单模块</span>
            <span class="type-desc__span"
              >根据表单模板创建表应用。可对表单数据进行增删查改导出和明细查看等操作；可根据规则设定数据分析图表。</span
            >
          </div>
          <div style="text-align:center">
            <el-button type="primary" @click="selectModuleType('form')"
              >立即创建</el-button
            >
          </div>
        </div>
      </el-card>
    </div>

    <div class="flex" style="justify-content: center">
      <div
        v-if="active === 2"
        style="margin-top:30px;padding:30px;width:860px;background:#fff;"
      >
        <el-form data-vv-scope="sysModuleForm" :model="data">
          <el-row :span="10">
            <el-col :span="12">
              <ht-form-item
                label="模块名称"
                prop="name"
                label-width="120px"
                class="identity-input-width"
              >
                <ht-input
                  v-model="data.name"
                  style="width:250px"
                  autocomplete="off"
                  :validate="{ required: true }"
                  placeholder="请输入模块名称"
                ></ht-input>
              </ht-form-item>
            </el-col>
            <el-col :span="12">
              <ht-form-item
                label="模块编码"
                label-width="120px"
                prop="code"
                class="identity-input-width"
              >
                <ht-input
                  v-if="data.id == ''"
                  v-model="data.code"
                  style="width:250px"
                  v-pinyin="data.name"
                  autocomplete="off"
                  :validate="{
                    required: true,
                    alpha_dash: true,
                    isExist: '${portal}/sys/sysModule/v1/isExist?code='
                  }"
                  placeholder="请输入模块编码"
                />
                <ht-input v-else v-model="data.code" disabled="disabled" />
              </ht-form-item>
            </el-col>
          </el-row>
          <el-row :span="10">
            <el-col :span="12">
              <ht-form-item
                label="选择分类"
                prop="classifyName"
                label-width="120px"
              >
                <eip-sys-type-selector
                  placeholder="请选择分类"
                  class="identity-input-width"
                  typeKey="SYSMODULE"
                  style="width:250px"
                  v-model="data.classifyName"
                  :sys-type-id.sync="data.classifyId"
                  :validate="{ required: true }"
                />
              </ht-form-item>
            </el-col>
            <el-col :span="12">
              <ht-form-item
                v-if="data.type == 'form'"
                label="选择表单"
                prop="relName"
                label-width="120px"
              >
                <ht-input
                  v-if="data.id == ''"
                  type="text"
                  readonly="readonly"
                  @clear="clearForm"
                  style="width:250px"
                  :validate="{ required: true }"
                  placeholder="请选择表单"
                  v-model="data.relName"
                >
                  <el-button
                    slot="append"
                    icon="el-icon-search"
                    @click="selectForm"
                  ></el-button>
                </ht-input>
                <ht-input
                  v-else
                  style="width:250px"
                  v-model="data.relName"
                  disabled="disabled"
                >
                </ht-input>
              </ht-form-item>
              <ht-form-item
                v-if="data.type == 'flow'"
                label="选择流程"
                prop="relName"
                label-width="120px"
              >
                <ht-input
                  v-if="data.id == ''"
                  type="text"
                  readonly="readonly"
                  style="width:250px"
                  :validate="{ required: true }"
                  v-model="data.relName"
                  @focus="selectFlow"
                >
                  <el-button
                    slot="append"
                    icon="el-icon-search"
                    @click="selectFlow"
                  ></el-button>
                </ht-input>
                <ht-input
                  v-else
                  v-model="data.relName"
                  disabled="disabled"
                  style="width:250px"
                />
              </ht-form-item>
            </el-col>
          </el-row>

          <ht-form-item
            label="模块描述"
            prop="desc"
            label-width="120px"
            class="identity-input-width"
          >
            <ht-input
              type="textarea"
              style="width:680px"
              :rows="3"
              v-model="data.desc"
            />
          </ht-form-item>
        </el-form>
      </div>
    </div>

    <div v-if="active === 3" style="width:860px;margin:0 auto;">
      <el-form data-vv-scope="modelForm" :model="data">
        <el-card class="box-card">
          <div slot="header">
            <span style="font-weight:bold">菜单配置</span>
          </div>
          <ht-checkbox v-model="data.menu" :options="menuList" :border="true" />
        </el-card>

        <el-card class="box-card" v-if="data.menu.indexOf('workspace') != -1">
          <div slot="header">
            <span style="margin:10px;">工作空间配置</span>
            <el-button type="primary" @click="addWorkspace" icon="el-icon-plus"
              >添加</el-button
            >
          </div>
          <el-row>
            <ht-input
              type="text"
              @focus="showDataTemplateDialog('flow')"
              placeholder="请选择报表"
              v-model="data.reportName"
            >
              <el-button
                slot="append"
                type="primary"
                icon="el-icon-search"
                @click="showDataTemplateDialog('flow')"
                >选择</el-button
              >>
            </ht-input>
            <el-table
              :data="workspaceList"
              class="form-table"
              border
              style="width: 100%"
            >
              <el-table-column label="菜单类型" width="140">
                <template slot-scope="scope">
                  <ht-select
                    v-model="scope.row.code"
                    :options="workspaceSelectList"
                    @change="workspaceChangeType($event, scope.$index)"
                    placeholder="请选择模块名称"
                    :validate="{ required: true }"
                  ></ht-select>
                </template>
              </el-table-column>
              <el-table-column label="菜单名称">
                <template slot-scope="scope">
                  <ht-input
                    v-model="scope.row.name"
                    autocomplete="off"
                    :validate="{ required: true }"
                    placeholder="请输入菜单名称"
                  ></ht-input>
                </template>
              </el-table-column>
              <el-table-column label="显示方式" width="300">
                <template slot-scope="scope" v-if="scope.row.code">
                  <el-radio
                    v-model="scope.row.showType"
                    label="flow"
                    border
                    @change="changeshowType($event, scope.$index)"
                    >流程中心</el-radio
                  >
                  <el-radio
                    v-model="scope.row.showType"
                    @change="changeshowType($event, scope.$index)"
                    label="reportForm"
                    border
                    v-show="
                      scope.row.code != 'newProcess' && data.reportName != ''
                    "
                    >报表</el-radio
                  >
                </template>
              </el-table-column>
              <el-table-column fixed="right" label="操作" width="200">
                <template slot-scope="scope">
                  <el-button
                    size="small"
                    type="text"
                    icon="el-icon-delete"
                    @click="workspaceList.remove(scope.row)"
                    >删除</el-button
                  >
                  <el-button
                    size="small"
                    type="text"
                    @click="
                      move('workspaceList', workspaceList, scope.row, 'up')
                    "
                    icon="el-icon-arrow-up"
                    >上移</el-button
                  >
                  <el-button
                    size="small"
                    type="text"
                    @click="
                      move('workspaceList', workspaceList, scope.row, 'down')
                    "
                    icon="el-icon-arrow-down"
                    >下移</el-button
                  >
                </template>
              </el-table-column>
            </el-table>
          </el-row>
        </el-card>

        <el-card class="box-card" v-if="data.menu.indexOf('datalist') != -1">
          <div slot="header">
            <span style="margin-right:10px;font-weight:bold">数据列表配置</span>
            <el-button
              type="primary"
              icon="el-icon-search"
              @click="showDataTemplateDialog('dataReport')"
              >选择</el-button
            >
          </div>
          <el-table
            :data="datalistList"
            class="form-table"
            border
            style="width: 100%"
          >
            <el-table-column label="报表名称">
              <template slot-scope="scope">
                <ht-input
                  v-model="scope.row.name"
                  autocomplete="off"
                  :validate="{ required: true }"
                  placeholder="请输入报表名称"
                ></ht-input>
              </template>
            </el-table-column>
            <el-table-column label="报表别名" prop="code"></el-table-column>
            <el-table-column
              label="BO定义别名"
              prop="viewCode"
            ></el-table-column>
            <el-table-column fixed="right" label="操作" width="200">
              <template slot-scope="scope">
                <el-button
                  size="small"
                  type="text"
                  icon="el-icon-delete"
                  @click="datalistList.remove(scope.row)"
                  >删除</el-button
                >
                <el-button
                  size="small"
                  type="text"
                  @click="move('datalistList', datalistList, scope.row, 'up')"
                  icon="el-icon-arrow-up"
                  >上移</el-button
                >
                <el-button
                  size="small"
                  type="text"
                  @click="move('datalistList', datalistList, scope.row, 'down')"
                  icon="el-icon-arrow-down"
                  >下移</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-card>
        <el-card class="box-card" v-if="data.menu.indexOf('viewlist') != -1">
          <div slot="header">
            <span>视图列表</span>
          </div>
        </el-card>

        <el-card class="box-card" v-if="data.menu.indexOf('chart') != -1">
          <div slot="header">
            <span style="margin-right:10px;font-weight:bold">图表配置</span>
            <el-button
              type="primary"
              icon="el-icon-search"
              @click="showChartDialog"
              >选择</el-button
            >
          </div>
          <el-row>
            <el-table
              :data="chartList"
              border
              class="form-table"
              style="width: 100%"
            >
              <el-table-column label="图表名称">
                <template slot-scope="scope">
                  <ht-input
                    v-model="scope.row.name"
                    autocomplete="off"
                    :validate="{ required: true }"
                    placeholder="请输入图表名称"
                  ></ht-input>
                </template>
              </el-table-column>
              <el-table-column label="图表别名" prop="code"></el-table-column>
              <el-table-column label="图表类型">
                <template slot-scope="scope">
                  <el-tag
                    v-if="
                      scope.row.chartType === '1' || scope.row.chartType === '2'
                    "
                    >折线图/柱状图</el-tag
                  >
                  <el-tag type="warning" v-else-if="scope.row.chartType === '3'"
                    >饼图</el-tag
                  >
                  <el-tag type="danger" v-else-if="scope.row.chartType === '4'"
                    >雷达图</el-tag
                  >
                  <el-tag type="info" v-else-if="scope.row.chartType === '5'"
                    >漏斗图</el-tag
                  >
                  <el-tag type="success" v-else-if="scope.row.chartType === '6'"
                    >散点图</el-tag
                  >
                  <el-tag type="warning" v-else-if="scope.row.chartType === '7'"
                    >热力图</el-tag
                  >
                  <el-tag type="warning" v-else>{{
                    scope.row.chartType === "1"
                  }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column fixed="right" label="操作" width="200">
                <template slot-scope="scope">
                  <el-button
                    size="small"
                    type="text"
                    icon="el-icon-delete"
                    @click="chartList.remove(scope.row)"
                    >删除</el-button
                  >
                  <el-button
                    size="small"
                    type="text"
                    @click="move('chartList', chartList, scope.row, 'up')"
                    icon="el-icon-arrow-up"
                    >上移</el-button
                  >
                  <el-button
                    size="small"
                    type="text"
                    @click="move('chartList', chartList, scope.row, 'down')"
                    icon="el-icon-arrow-down"
                    >下移</el-button
                  >
                </template>
              </el-table-column>
            </el-table>
          </el-row>
        </el-card>

        <el-card class="box-card" v-if="data.menu.indexOf('other') != -1">
          <div slot="header">
            <span style="margin-right:10px;font-weight:bold">栏目配置</span>
            <el-button type="primary" icon="el-icon-plus" @click="addOtherType"
              >添加栏目组</el-button
            >
          </div>
          <el-row>
            <el-table
              border
              class="form-table"
              style="width: 100%"
              :data="otherType.otherList"
              v-for="(otherType, index) in otherTypeArr"
              :key="index"
            >
              <el-table-column label="栏目组名称" width="30%">
                <el-table-column label="名称">
                  <template slot-scope="scope">
                    <ht-input
                      v-model="scope.row.name"
                      autocomplete="off"
                      :validate="{ required: true }"
                      placeholder="请输入名称"
                    ></ht-input>
                  </template>
                </el-table-column>
              </el-table-column>

              <el-table-column>
                <template v-slot:header>
                  <ht-input
                    v-model="otherType.name"
                    autocomplete="off"
                    :validate="{ required: true }"
                    placeholder="请输入菜单名称"
                  ></ht-input>
                </template>
                <el-table-column prop="url">
                  <template slot-scope="scope">
                    <ht-input
                      v-model="scope.row.url"
                      autocomplete="off"
                      :validate="{ required: true }"
                      placeholder="请输入url"
                    ></ht-input>
                  </template>
                </el-table-column>
              </el-table-column>

              <el-table-column width="20%">
                <template v-slot:header>
                  <el-button
                    type="primary"
                    icon="el-icon-plus"
                    @click="otherType.otherList.push({ type: 'other' })"
                    >添加子栏目</el-button
                  >
                  <el-button
                    type="primary"
                    icon="el-icon-delete"
                    @click="otherTypeArr.remove(otherType)"
                    >删除栏目组</el-button
                  >
                </template>
                <el-table-column prop="province" label="操作">
                  <template slot-scope="scope">
                    <el-button
                      size="small"
                      type="text"
                      icon="el-icon-delete"
                      @click="otherType.otherList.remove(scope.row)"
                      >删除</el-button
                    >
                    <el-button
                      size="small"
                      type="text"
                      @click="
                        moveTo(index, otherType.otherList, scope.row, 'up')
                      "
                      icon="el-icon-arrow-up"
                      >上移</el-button
                    >
                    <el-button
                      size="small"
                      type="text"
                      @click="
                        moveTo(index, otherType.otherList, scope.row, 'down')
                      "
                      icon="el-icon-arrow-down"
                      >下移</el-button
                    >
                  </template>
                </el-table-column>
              </el-table-column>
            </el-table>
          </el-row>
        </el-card>
      </el-form>
    </div>

    <el-row style="margin:30px 0;text-align:center">
      <el-button
        type="danger"
        style="margin-right: 30px"
        @click="$emit('close-dialog')"
        >关闭</el-button
      >
      <el-button
        style="margin-top: 12px;"
        @click="step"
        v-if="(active > 1 && !id) || (active > 2 && id)"
        >上一步</el-button
      >
      <el-button style="margin-top: 12px;" @click="next" v-if="active == 2"
        >下一步</el-button
      >
      <el-button
        style="margin-top: 12px;"
        @click="stepToSave"
        v-if="active == 3"
        :loading="isSubmit"
        >保存</el-button
      >

      <el-button
        style="margin-top: 12px;"
        v-if="active == 3"
        :loading="isSubmit"
        @click="modulePush"
        >发布</el-button
      >
    </el-row>

    <business-obj-dialog
      @loadTableData="closeBusinessObjDialog"
      ref="objDialog"
      :dataView="{}"
      :clickTree="{}"
    />

    <!-- 表单选择器 -->
    <EipFormDialog
      ref="eipFormDialog"
      :single="true"
      @onConfirm="dialogFormConfirm"
      formType="pc"
      appendToBody
    />
    <!-- 流程选择器 -->
    <eip-flow-dialog
      ref="eipFlowDialog"
      @onConfirm="dialogFlowConfirm"
      :single="true"
      append-to-body
    />
    <!-- 图表选择器 -->
    <eip-chart-dialog
      :appendToBody="true"
      :single="false"
      ref="chartDialog"
      @onConfirm="onChartConfirm"
      :chartType="2"
    ></eip-chart-dialog>

    <!-- 报表 -->
    <eip-data-template-dialog
      :appendToBody="true"
      ref="dataTemplateDialog"
      :single="data.type == 'flow'"
      :type="data.type"
      :defKey="data.relCode"
      @onConfirm="onDataTemplateConfirm"
    ></eip-data-template-dialog>

    <eip-data-template-dialog
      :appendToBody="true"
      ref="dataReportDialog"
      :single="false"
      :defKey="data.type == 'form' ? data.relCode : ''"
      @onConfirm="onDataReportConfirm"
    ></eip-data-template-dialog>

    <sysModuleAddMenus
      :appendToBody="true"
      :moduleName="moduleName"
      :isSubmit.sync="isSubmit"
      ref="sysModuleAddMenus"
      @close-dialog="addMenusClose"
    ></sysModuleAddMenus>
  </div>
</template>
<script>
import utils from "@/hotent-ui-util.js";
import req from "@/request.js";
const EipSysTypeSelector = () =>
  import("@/components/selector/EipSysTypeSelector.vue");
const EipFormDialog = () => import("@/components/dialog/EipFormDialog.vue");
const eipFlowDialog = () => import("@/components/dialog/EipFlowDialog.vue");
const EipChartDialog = () => import("@/components/dialog/EipChartDialog.vue");
const EipDataTemplateDialog = () =>
  import("@/components/dialog/EipDataTemplateDialog.vue");
const businessObjDialog = () => import("@/views/form/BusinessObjDialog.vue");
const sysModuleAddMenus = () =>
  import("@/views/system/generator/sysModuleAddMenus.vue");
export default {
  name: "sysModuleCreate",
  components: {
    EipSysTypeSelector,
    EipFormDialog,
    eipFlowDialog,
    EipChartDialog,
    EipDataTemplateDialog,
    businessObjDialog,
    sysModuleAddMenus
  },
  props: ["id", "moduleEditorDialogVisible"],
  data() {
    return {
      ids: this.id,
      isSubmit: false,
      style: { overflowY: "auto", height: "500px" },
      divStyle: {
        margin: "0 12%",
        background: "rgba(237, 237, 237, 1)",
        height: "500px"
      },
      workspaceList: [],
      chartList: [],
      datalistList: [],
      moduleName: "",
      otherTypeArr: [],
      workspaceSelectList: [
        {
          key: "todo",
          value: "待办公文"
        },
        {
          key: "done",
          value: "已办公文"
        },
        {
          key: "request",
          value: "我的请求"
        },
        {
          key: "newProcess",
          value: "新建流程"
        },
        {
          key: "todoRead",
          value: "抄送公文"
        },
        {
          key: "doneRead",
          value: "入库公文"
        },
        {
          key: "myRead",
          value: "我抄送的"
        },
        {
          key: "myDelegate",
          value: "我转办的"
        }
      ],
      active: 1,
      list: [
        { key: "workspace", value: "工作空间" },
        { key: "datalist", value: "数据列表" },
        { key: "viewlist", value: "视图列表" },
        { key: "chart", value: "图表" },
        { key: "other", value: "栏目" }
      ],
      data: {
        id: "",
        name: "",
        relName: "",
        relCode: "",
        code: "",
        menu: "",
        reportName: ""
      },
      curSelectForm: {},
      moduleTypeCreateTab: {},
      moduleTypeTab: {},
      moduleTypeForm: {},
      moduleTypeFlow: {},
      flowSvg: require("@/assets/img/flow.svg"),
      formSvg: require("@/assets/img/form.svg")
    };
  },
  computed: {
    menuList: function() {
      if (this.data.type == "flow") {
        return this.list.filter(item => item.key != "viewlist");
      } else if (this.data.type == "table") {
        return this.list.filter(
          item => item.key != "workspace" && item.key != "datalist"
        );
      } else if (this.data.type != "table") {
        return this.list.filter(
          item => item.key != "workspace" && item.key != "viewlist"
        );
      }
      return this.list;
    }
  },
  watch: {
    id(newV) {
      if (newV) {
        this.active = 2;
        var url =
          window.context.portal + "/sys/sysModule/v1/getJson?id=" + newV;
        req.get(url).then(response => {
          this.data = response.data;
          this.initList(this.data);
        });
      }
    }
  },
  mounted() {
    var height = window.screen.availHeight * 0.68 - 70 + "px";
    this.style.height = height;
    this.divStyle.height = height;
    this.$validator = this.$root.$validator;
    if (this.id) {
      this.active = 2;
      var url =
        window.context.portal + "/sys/sysModule/v1/getJson?id=" + this.id;
      req.get(url).then(response => {
        this.data = response.data;
        this.initList(this.data);
        return this;
      });
    }
  },
  methods: {
    closeBusinessObjDialog() {
      this.$emit("close-dialog");
    },
    initList(data) {
      if (data.moduleDetail && data.moduleDetail.length > 0) {
        var workspaceList = [];
        var datalistList = [];
        var viewlistList = [];
        var chartList = [];
        var otherTypeArr = [];
        var otherTypeMap = {};
        for (var i = 0; i < data.moduleDetail.length; i++) {
          var type = data.moduleDetail[i].type;
          switch (type) {
            case "workspace":
              workspaceList.push(data.moduleDetail[i]);
              break;
            case "datalist":
              datalistList.push(data.moduleDetail[i]);
              break;
            case "viewlist":
              viewlistList.push(data.moduleDetail[i]);
              break;
            case "chart":
              chartList.push(data.moduleDetail[i]);
              break;
            case "other":
              var item = data.moduleDetail[i];
              if (!otherTypeMap[item.columnName]) {
                otherTypeMap[item.columnName] = {
                  name: item.columnName,
                  otherList: []
                };
              }
              otherTypeMap[item.columnName].otherList.push(item);
              break;
          }
        }
        this.workspaceList = workspaceList;
        this.datalistList = datalistList;
        this.viewlistList = viewlistList;
        this.chartList = chartList;
        if (otherTypeMap) {
          for (var key in otherTypeMap) {
            otherTypeArr.push(otherTypeMap[key]);
          }
        }
        this.otherTypeArr = otherTypeArr;
      }
      setTimeout(() => {
        this.$validator.validate();
      }, 100);
    },
    move(name, ary, item, direct) {
      this[name] = utils.arrayMove(ary, item, direct);
    },
    moveTo(index, ary, item, direct) {
      this.otherTypeArr[index].otherList = utils.arrayMove(ary, item, direct);
    },
    getUrl(code) {
      let item = {};
      switch (code) {
        case "todo":
          item.url = "/v-flow/v-todo/" + this.data.relCode;
          item.name = "待办公文";
          break;
        case "done":
          item.url = "/v-flow/v-done/" + this.data.relCode;
          item.name = "已办公文";
          break;
        case "request":
          item.url = "/v-flow/v-request/" + this.data.relCode;
          item.name = "我的请求";
          break;
        case "todoRead":
          item.url = "/v-flow/v-todoRead/" + this.data.relCode;
          item.name = "抄送公文";
          break;
        case "doneRead":
          item.url = "/v-flow/v-doneRead/" + this.data.relCode;
          item.name = "入库公文";
          break;
        case "myRead":
          item.url = "/v-flow/v-myRead/" + this.data.relCode;
          item.name = "我抄送的";
          break;
        case "myDelegate":
          item.url = "/v-flow/v-myDelegate/" + this.data.relCode;
          item.name = "我转办的";
          break;
        case "newProcess":
          item.url = "/agentStartByKey/" + this.data.relCode;
          item.name = "发起" + this.data.relName;
          break;
      }
      return item;
    },
    workspaceChangeType(code, index) {
      var data = this.getUrl(code);
      this.workspaceList[index].url = data.url;
      this.workspaceList[index].name = data.name;
    },
    changeshowType(value, index) {
      if (value == "flow") {
        var data = this.getUrl(this.workspaceList[index].code);
        this.workspaceList[index].url = data.url;
      } else {
        this.workspaceList[index].url =
          "/statement/template/preview/" +
          this.data.reportAlias +
          "/" +
          this.workspaceList[index].code +
          "/" +
          this.data.relCode +
          "/" +
          true;
      }
    },
    initStyle() {
      this.moduleTypeCreateTab = {};
      this.moduleTypeTab = {};
      this.moduleTypeForm = {};
      this.moduleTypeFlow = {};
    },
    selectModuleType(type) {
      this.initStyle();
      switch (type) {
        case "createTable":
          this.$refs.objDialog.handleOpen();
          break;
        case "table":
          this.data.menu = "viewlist,chart,other";
          break;
        case "form":
          this.data.menu = "datalist,chart,other";
          break;
        case "flow":
          this.data.menu = "workspace,chart,other";
          break;
      }
      this.data.type = type;
      this.next();
    },
    next() {
      if (this.active == 1 && this.data.type == undefined) {
        this.$message.error("请选择模块类型！");
        return;
      }
      if (this.active === 2) {
        this.$validator.validateAll("sysModuleForm").then(result => {
          if (result) {
            this.active++;
          } else {
            this.$message.error("表单未正确填写");
          }
        });
      } else {
        this.active++;
      }
    },
    step() {
      this.active--;
    },
    selectForm() {
      this.$refs.eipFormDialog.showDialog();
    },
    selectFlow() {
      this.$refs.eipFlowDialog.showDialog();
    },
    dialogFormConfirm(data) {
      if (data && data.length > 0) {
        this.$nextTick(() => {
          this.data.relCode = data[0].formKey;
          this.data.relName = data[0].name;
        });
      } else {
        this.clearForm();
      }
    },
    dialogFlowConfirm(data) {
      if (data && data.length > 0) {
        this.$nextTick(() => {
          this.data.relCode = data[0].defKey;
          this.data.relName = data[0].name;
        });
      } else {
        this.clearForm();
      }
    },
    clearForm() {
      this.$nextTick(() => {
        this.data.relCode = "";
        this.data.relName = "";
      });
    },
    addWorkspace() {
      this.workspaceList.push({
        code: "",
        name: "",
        url: "",
        type: "workspace",
        showType: "flow"
      });
    },

    showChartDialog() {
      this.$refs.chartDialog.showDialog();
    },
    showDataTemplateDialog(type) {
      if (type == "flow") {
        this.$refs.dataTemplateDialog.showDialog();
      } else {
        this.$refs.dataReportDialog.showDialog();
      }
    },
    onChartConfirm(selectedNode) {
      if (selectedNode && selectedNode.length > 0) {
        selectedNode.forEach(m => {
          this.chartList.push({
            name: m.name,
            code: m.alias,
            chartType: m.style + "",
            type: "chart",
            url: m.id
          });
        });
      }
      this.$refs.chartDialog.handleClose();
    },

    onDataReportConfirm(selectedNode) {
      if (selectedNode && selectedNode.length > 0) {
        selectedNode.forEach(item => {
          var url = "/statement/template/preview/" + item.alias + "/true";
          var temp = {
            type: "datalist",
            name: item.name,
            code: item.alias,
            viewCode: item.boDefAlias,
            chartType: item.typeName,
            url: url
          };
          this.datalistList.push(temp);
        });
      }
    },
    onDataTemplateConfirm(selectedNode) {
      if (selectedNode && selectedNode.length > 0) {
        this.$nextTick(() => {
          this.data.reportName = selectedNode[0].name;
          this.data.reportAlias = selectedNode[0].alias;
        });
      } else {
        if (this.data.type == "flow") {
          this.data.reportName = "";
          this.data.reportAlias = "";
        }
      }
    },
    addOtherType() {
      this.otherTypeArr.push({ name: "", otherList: [] });
    },
    getDtailList() {
      var detailList = [];

      if (
        this.workspaceList.length > 0 &&
        this.data.menu.indexOf("workspace") != -1
      ) {
        this.workspaceList.forEach(item => {
          detailList.push(item);
        });
      }
      if (
        this.datalistList.length > 0 &&
        this.data.menu.indexOf("datalist") != -1
      ) {
        this.datalistList.forEach(item => {
          detailList.push(item);
        });
      }

      if (this.chartList.length > 0 && this.data.menu.indexOf("chart") != -1) {
        this.chartList.forEach(item => {
          detailList.push(item);
        });
      }

      if (
        this.otherTypeArr.length > 0 &&
        this.data.menu.indexOf("other") != -1
      ) {
        this.otherTypeArr.forEach(item => {
          var typeName = item.name;
          var otherList = item.otherList;
          otherList.forEach(m => {
            m.columnName = typeName;
            detailList.push(m);
          });
        });
      }
      return detailList;
    },
    stepToSave() {
      this.isSubmit = true;
      var url = window.context.portal + "/sys/sysModule/v1/saveModule";
      this.$validator.validateAll("modelForm").then(result => {
        if (!result) {
          this.$message.error("表单未正确填写");
          this.isSubmit = false;
        } else {
          //todo 保存表单信息
          this.data.moduleDetail = this.getDtailList();
          req.post(url, this.data).then(response => {
            if (response.data.state) {
              this.$message.success(response.data.message);
              setInterval(() => {
                this.$emit("close-dialog");
              }, 2000);
            } else {
              this.$message.error(response.data.message);
            }
          });
        }
      });
    },
    modulePush() {
      this.isSubmit = true;
      var url = window.context.portal + "/sys/sysModule/v1/saveModule";
      this.$validator.validateAll("modelForm").then(result => {
        if (!result) {
          this.$message.error("表单未正确填写");
          this.isSubmit = false;
        } else {
          this.data.moduleDetail = this.getDtailList();
          req.post(url, this.data).then(response => {
            if (response.data.state) {
              this.isSubmit = false;
              this.data.id = response.data.value;
              this.moduleName = this.data.name
              this.$refs.sysModuleAddMenus.showDialog(response.data.value);
            } else {
              this.isSubmit = false;
              this.$message.error(response.data.message);
            }
          });
        }
      });
    },
    addMenusClose() {
      setInterval(() => {
        this.$emit("close-dialog");
      }, 2000);
    }
  }
};
</script>
<style lang="scss" scoped>
@import "@/assets/css/element-variables.scss";

.identity-input-width .inputs {
  width: 80%;
}
.box-card {
  margin: 10px 0;
}
.type-title__span {
  color: #f67d83;
  font-weight: bold;
  font-size: 18px;
  display: block;
}
.type-header__span {
  color: #333;
  font-size: 16px;
  display: inline-block;
  text-align: center;
  width: 100%;
}
.type-desc__span {
  margin-top: 20px;
  color: #999;
  display: inline-block;
  line-height: 25px;
  font-size: 14px;
  text-indent: 22px;
}
</style>
