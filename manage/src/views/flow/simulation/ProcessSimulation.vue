<template>
<el-dialog :visible="processSimulationdialogVisible"
      destroy-on-close
      fullscreen
      v-if="processSimulationdialogVisible"
      :show-close="false"
      :close-on-click-modal="false"
      :before-close="handleCloseProcessSimulation">
  <div class="fullheight">
    <ht-table
      @load="loadData"
      :data="data"
      :pageResult="pageResult"
      :selection="true"
      :default-sorter="[{direction: 'DESC',property: 'id'}]"
      quick-search-props="name,code"
      ref="testCaseTable"
      :show-custom-column="false"
      :show-export="false"
    >
      <template v-slot:toolbar>
          <el-button size="small" @click="showDialog()" icon="el-icon-plus">添加</el-button>
          <ht-delete-button :url="deleteUrl" :htTable="$refs.testCaseTable">删除</ht-delete-button>
          <el-button size="small" @click="batchStartFlow()">批量启动</el-button>
          <el-button size="small" @click="showInstDialog()">查看测试实例</el-button>
          <el-button size="small" @click="showReportDialog()">测试用例报表</el-button>
        <div style="width: 65%">
          <div style="text-align: right">
            <el-button size="small"  type="danger" @click="processSimulationdialogVisible = false">关闭</el-button>
          </div>
        </div>
      </template>
      <template>
        <ht-table-column type="index" width="50" align="center" label="序号" />
        <ht-table-column prop="id" label="主键" :sortable="true" hidden />
        <ht-table-column prop="name" label="测试用例名称" :sortable="true" :show-overflow-tooltip="true">
          <template v-slot="{row,column,$index}">
            <el-link
              type="primary"
              @click="handleCommand({row:row,command:'editTestCase'})"
              title="编辑"
            >{{row.name}}</el-link>
          </template>
        </ht-table-column>
        <ht-table-column width="150" label="操作">
          <template v-slot="{row}">
            <el-dropdown
              size="mini"
              split-button
              @command="handleCommand"
              @click="handleCommand({row:row,command:'startFlow'})"
            >
              <span>启动
                <i class="el-icon-edit"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item
                  icon="el-icon-plus"
                  :command="{row:row,command:'editTestCase'}"
                >编辑</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </ht-table-column>
      </template>
    </ht-table>

    <el-dialog
      width="80%"
      title="添加配置"
      :visible="dialogVisible"
      :before-close="handleClose"
      :close-on-click-modal="false"
      append-to-body
    >
      <el-form v-form  v-model="testCase" data-vv-scope="editTestCaseForm">
        <ht-form-item label="名称" prop="name" label-width="150px">
          <ht-input
            v-model="testCase.name"
            autocomplete="off"
            :validate="{required:true}"
            placeholder="请输入名称"
          ></ht-input>
        </ht-form-item>
        <ht-form-item label="用户组（发起人）" prop="name" label-width="150px">
          <el-button @click="showAuthDialog()" >发起人设置</el-button>
          <el-table :data="testCase.startor" :show-header=false>
            <el-table-column prop="title" width="50"></el-table-column>
            <el-table-column prop="name"></el-table-column>
          </el-table>
        </ht-form-item>
        <ht-form-item label="表单数据" prop="name" label-width="150px">
          <el-button @click="showFormDialog()" >表单数据设置</el-button>
          <pre style="display:inline-block;" :style="{ color: JSON.stringify(testCase.boFormData) == '{}'? 'red':'black'}">  {{JSON.stringify(testCase.boFormData) == "{}"? "未设置表单数据":"已设置表单数据"}}</pre>
        </ht-form-item>
        <ht-form-item label="审批动作" prop="name" label-width="150px">
           <template slot="label">
          <el-tooltip
            content="不添加则默认全部为同意"
          >
            <i class="property-tip icon-question" />
          </el-tooltip>
          <span>审批动作</span>
        </template>
          <table style="width:100%" >
            <tr v-for="(item,$index) in baseFlowInfo.defKeys" :key="item.defKey">
              <td> {{item.defName}}--{{item.defKey}}</td>
            </tr>
            <tr colspan="4" v-for="(item,$index) in baseFlowInfo.defKeys" :key="Math.random()+item.defKey">
              <td>
                <el-button @click="addItem('actionType',item.defKey)">添加审批动作</el-button>
                <table style="width:100%">
                  <tr v-for="(actionType,$actionTypeIndex) in testCase.actionType[item.defKey]" :key="$actionTypeIndex" >
                    <td>
                      <ht-select v-model="actionType.nodeId"
                                 :options="baseFlowInfo.nodeInfo[item.defKey]"
                                 :props="{key:'nodeId',value:'nodeName'}"
                                 @change="selectNodeId('actionType',item.defKey,actionType,$actionTypeIndex)"
                      ></ht-select>

                    </td>
                    <td>
                      <ht-select v-model="actionType.actionName"
                                 :options="[{key:'agree',value:'同意'},{key:'oppose',value:'反对'},{key:'backToStart',value:'驳回发起人'},{key:'endProcess',value:'终止流程'}]"
                                 @change="selectNodeId('actionType',item.defKey,actionType,$actionTypeIndex)"
                      ></ht-select>
                      <span v-show="actionType.actionName=='reject' || actionType.actionName=='backToStart' "
                            style="display: block;padding-top: 5px;" >
                        驳回次数设置
                        <el-input-number  v-model="actionType.count" style="width:120px" :validate="{required:true}" />
                      </span>
                    </td>
                    <th colspan="2" style="text-align: center;" >
                      <el-button   icon="el-icon-delete" @click="delItem(testCase.actionType[item.defKey],$actionTypeIndex)" ></el-button>
                    </th>
                  </tr>
                </table>

              </td>
            </tr>
          </table>
        </ht-form-item>
        <ht-form-item label="断点设置" prop="name" label-width="150px">
          <table style="width:100%" >
            <tr  v-for="(item,$defKeyIndex) in baseFlowInfo.defKeys" :key="$defKeyIndex">
              <td  colspan="4">
                <table>
                  <tr>
                    <td colspan="2">{{item.defName}}--{{item.defKey}}<el-button @click="addItem('bpmDebugger',item.defKey)">添加断点</el-button></td>
                  </tr>
                  <tr v-for="(key,$bpmDebuggerIndex) in testCase.bpmDebugger[item.defKey]" :key="$bpmDebuggerIndex" >
                    <td>
                       <ht-select v-model="testCase.bpmDebugger[item.defKey][$bpmDebuggerIndex]"
                       :options="baseFlowInfo.nodeInfo[item.defKey]"
                       :props="{key:'nodeId',value:'nodeName'}"
                        @change="selectNodeId('bpmDebugger',item.defKey,key,$bpmDebuggerIndex)"
                      ></ht-select>
                    </td>
                    <th colspan="2" >
                      <el-button   icon="el-icon-delete" @click="delItem(testCase.bpmDebugger[item.defKey],$bpmDebuggerIndex)" ></el-button>
                    </th>
                  </tr>
                </table>

              </td>
            </tr>
          </table>
        </ht-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <ht-submit-button
          :url="saveUrl"
          :model="testCaseSaveModel"
          :is-submit="isSubmit"
          scope-name="editTestCaseForm"
          @before-save-data="beforeSaveData"
          @after-save-data="afterSaveData"
        >{{$t('eip.common.save')}}</ht-submit-button>
        <el-button @click="dialogCancle('dialogVisible')">{{$t('eip.common.cancel')}}</el-button>
      </div>
    </el-dialog>
    <!-- 选择对话框  -->
    <eip-auth-dialog
      ref="eipAuthDialog"
      name="eipAuthDialog"
      @onConfirm="dialogOnConfirm"
      append-to-body
    />
    <!-- 实例对话框  -->
    <process-simulation-inst
      ref="processSimulationInst"
      name="processSimulationInst"
      append-to-body
    />
  </div>

  <el-dialog
    fullscreen
    title="表单数据设置"
    :visible.sync="formDialogVisible"
    :close-on-click-modal="false"
    width="80%"
    height="100%"
    append-to-body
    :before-close="handleFormDialogClose">
      <iframe ref="formIframe" :src="previewFormUrl" frameborder="0" width="100%" height="600px"></iframe>
      <span slot="footer" class="dialog-footer">
          <el-button @click="handleFormDialogClose()">取 消</el-button>
          <el-button type="primary" @click="handleFormDialogClose(false)">确 定</el-button>
      </span>
  </el-dialog>

  <el-dialog
    fullscreen
    :visible.sync="reportDialogVisible"
    width="80%"
    height="100%"
    :show-close="false"
    append-to-body
    :close-on-click-modal="false"
    :before-close="handleReportClose">
      <div name="title">
        <el-row>
          <el-col :span="23" class="el-dialog__title">仿真报表</el-col>
          <el-col :span="1">
            <el-button size="small"  type="danger" @click="reportDialogVisible = false">关闭</el-button>
          </el-col>
        </el-row>
      </div>
      <chart :option="reportOption" v-if="reportDialogVisible" />
  </el-dialog>
</el-dialog>
</template>
<script>
import uc from "@/api/uc.js";
import utils from "@/hotent-ui-util.js";
import {Base64} from "js-base64";
const eipAuthDialog = () => import("@/components/dialog/EipAuthDialog.vue");
const processSimulationInst = () => import("@/views/flow/simulation/ProcessSimulationInst.vue");
const chart = () => import("@/components/form/chart/Chart.vue");

export default {
  components: {
    eipAuthDialog,
    processSimulationInst,
    chart
  },
  computed: {
    deleteUrl: function() {
      return window.context.bpmRunTime + "/runtime/bpmTestCase/v1/remove";
    },
    saveUrl: function() {
      let preUrl = window.context.bpmRunTime + "/runtime/bpmTestCase/v1/save";
      return preUrl;
    }
  },
  data() {
    return {
      formDialogVisible: false,
      dialogVisible: false,
      processSimulationdialogVisible: false,
      baseFlowInfo: {defKyes:[],nodeInfo:{},formId:null},
      defKey: null,
      testCase: {
        name: "",
        defKey: "",
        boFormData:{},
        startor: [],
        actionType: {},
        bpmDebugger: {},
      },
      testCaseSaveModel:{},
      isSubmit: true,
      data: [],
      pageResult: {
        page: 1,
        pageSize: 20,
        total: 0
      },
      previewFormUrl: "",
      reportDialogVisible: false,
      reportData:{},
      reportOption:{},
      isAddDialog: false
    };
  },
  mounted() {
    this.$validator = this.$root.$validator;
    window.addEventListener('message', (e)=>{
      if(e.data && e.data.formData){
        this.testCase.boFormData =  e.data.formData;
      }
    })
  },
  methods: {
    handleReportClose(){
      this.reportDialogVisible = false;
    },
    batchStartFlow(id){
      let elTable = null;
      if (this.$refs.testCaseTable.$refs.htTable) {
        elTable = this.$refs.testCaseTable.$refs.htTable;
      }
      if (
        elTable &&
        elTable.selection &&
        elTable.selection.length == 0 && !id
      ) {
        this.$message.error("请至少选择一条数据");
        return;
      }

      let ids = [];

      for (let item of elTable.selection) {
        ids.push(item.id);
      }
      if(id){
        ids.push(id);
      }
      let idstr = ids.join(",");
      this.$http.post(window.context.bpmRunTime+"/runtime/bpmTestCase/v1/startTest",idstr).then(res=>{
        if(res.data.state){
          this.$message(res.data.message);
        }else{
          this.$message(res.data.message);
        }
      });
    },
    initData(){
      this.$http.get(window.context.bpmRunTime+"/runtime/bpmTestCase/v1/getBaseInfo?defKey="+this.defKey).then(res=>{
        Object.assign(this.baseFlowInfo,res.data);
      });
    },
    addItem(type,defKey){
      if(type=="actionType"){
        var obj = {"nodeId":"","actionName":"agree","count":1};
        if(!this.testCase.actionType[defKey]){
          this.$set(this.testCase.actionType,defKey,[])
        }
        this.$set(this.testCase.actionType[defKey],this.testCase.actionType[defKey].length,obj);
      }

      if(type=="bpmDebugger"){
        if(!this.testCase.bpmDebugger[defKey]){
          this.$set(this.testCase.bpmDebugger,defKey,[]);
        }
        this.$set(this.testCase.bpmDebugger[defKey],this.testCase.bpmDebugger[defKey].length,[]);
      }
    },
    delItem(arr,key){
      arr.splice(key,1);
	  },
    selectNodeId(type,defKey,key,idx){
      if(type=="actionType"){
        var __arr = [...this.testCase.actionType[defKey]];
        __arr.splice(idx,1);
        let isExist = __arr.find(item=>{return item.nodeId==key.nodeId})
        if( isExist ){
          this.$message.warning("已经设置了该节点,请重新选择,请不要重复设置");
          key.nodeId = "";
        }
      }

      if(type=="bpmDebugger"){
         var __arr = [...this.testCase.bpmDebugger[defKey]];
        __arr.splice(idx,1);
        let isExist = __arr.find(item=>{return item==key})
        if(isExist){
          this.$message.warning("已经设置了该节点,请重新选择,请不要重复设置", {icon: 2});
          key = "";
          return;
        }
      }
    },
    showAuthDialog() {
      let conf = {
        right: [],
        permissionList: [
          { type: "user", title: "用户" },
          { type: "org", title: "组织" },
          { type: "pos", title: "岗位" },
          { type: "role", title: "角色" }
        ]
      };
      if (this.testCase.startor) {
        conf.right = this.testCase.startor;
      }
      this.$refs.eipAuthDialog.showDialog(conf);
    },
    showFormDialog(){
      this.previewFormUrl =  window.context.front +
                "/previewForm/" +
                this.baseFlowInfo.formId +
                "?token=" +
                this.$store.state.login.currentUser.token+
                "&formData=" + Base64.encode(JSON.stringify(this.testCase.boFormData));
      this.formDialogVisible = true;
    },
    handleFormDialogClose(cancel = true){
      if (cancel && this.isAddDialog){
        this.testCase.boFormData = {};
      }
      this.formDialogVisible = false;
    },
    showReportDialog(){
      let elTable = this.$refs.testCaseTable.$refs.htTable;
      if(!elTable.selection || elTable.selection.length==0){
        this.$message.warning("请至少选择一个测试用例");
        return;
      }
      let aryIds = [];
      elTable.selection.forEach(element => {
        aryIds.push(element.id);
      });

      this.$http.post(window.context.bpmRunTime+"/runtime/bpmTestCase/v1/getReportData",aryIds.join(",")).then(res=>{

        this.reportData = res.data.value;
				let app = {};

				app.config = {
				    rotate: 90,
				    align: 'left',
				    verticalAlign: 'middle',
				    position: 'insideBottom',
				    distance: 15,
				};
        let labelOption = {
				    normal: {
				        show: true,
				        position: app.config.position,
				        distance: app.config.distance,
				        align: app.config.align,
				        verticalAlign: app.config.verticalAlign,
				        rotate: app.config.rotate,
				        formatter: '{c}  {name|{a}}',
				        fontSize: 16,
				        rich: {
				            name: {
				                textBorderColor: '#fff'
				            }
				        }
				    }
				};

        this.reportOption = {
            name:"流程仿真报表",
            subtext:"实例状态",
				    color: ['#003366', '#4cabce', '#e5323e'],
				    tooltip: {
				        trigger: 'axis',
				        axisPointer: {
				            type: 'shadow'
				        }
				    },
				    legend: {
				        data: ['end-已结束', 'unend-未结束', 'endProcess--人工结束']
				    },
				    toolbox: {
				        show: true,
				        orient: 'vertical',
				        left: 'right',
				        top: 'center',
				        feature: {
				            mark: {show: true},
				            dataView: {show: true, readOnly: false},
				            magicType: {show: true, type: ['line', 'bar', 'stack', 'tiled']},
				            restore: {show: true},
				            saveAsImage: {show: true}
				        }
				    },
				    calculable: true,
				    xAxis: [
				        {
				            type: 'category',
				            axisTick: {show: false},
				            data: this.reportData.xAxis
				        }
				    ],
				    yAxis: [
				        {
				            type: 'value'
				        }
				    ],
				    series: [
				        {
				            name: 'end-已结束',
				            type: 'bar',
				            barGap: 0,
				            label: labelOption,
				            data: this.reportData.end
				        },
				        {
				            name: 'unend-未结束',
				            type: 'bar',
				            label: labelOption,
				            data: this.reportData.unend
				        },
				        {
				            name: 'endProcess--人工结束',
				            type: 'bar',
				            label: labelOption,
				            data: this.reportData.endProcess
				        }
				    ]
				}

        this.reportDialogVisible = true;
      });

    },
    showInstDialog(){
      this.$refs.processSimulationInst.handleInstDialogShow(this.defKey);
    },
    dialogOnConfirm(res){
      this.testCase.startor = res;
    },
    handleClose() {
      this.dialogVisible = false;
    },
    showProcessSimulation(defKey){
      this.defKey = defKey;
      this.testCase.defKey = defKey;
      this.initData();
      this.processSimulationdialogVisible = true;
    },
    handleCloseProcessSimulation() {
      this.processSimulationdialogVisible = false;
    },
    showDialog(add = true) {
      if (add){
        this.testCase = {name: "",boFormData:{},startor: [],actionType: {},bpmDebugger: {},id:"",pkVal:""};
        this.isAddDialog = true;
      }
      this.dialogVisible = true;
    },
    dialogCancle(dialogVisible) {
      this[dialogVisible] = false;
      this.isAddDialog = false;
    },
    loadData(param, cb) {
      if(!param.querys){
        param.querys = [];
      }
      let defKeyParam = {property: "def_key_", value: this.defKey, group: "quick", relation: "AND", operation: "EQUAL"};
      param.querys = param.querys.concat(defKeyParam);
      this.$http.post(window.context.bpmRunTime+"/runtime/bpmTestCase/v1/list",param).then(response => {
          this.data = response.data.rows;
          this.pageResult = {
            page: response.data.page,
            pageSize: response.data.pageSize,
            total: response.data.total
          };
        })
        .finally(() => cb());
    },
    handleCommand(params) {
      switch (params.command) {
        case "editTestCase":
          let temp = {};
          temp = {...temp,...params.row};
          temp.startor = JSON.parse(temp.startor);
          temp.bpmDebugger =  JSON.parse(temp.bpmDebugger);
          temp.boFormData =  JSON.parse(temp.boFormData);
          temp.actionType =  JSON.parse(temp.actionType);
          this.testCase = temp;
          this.showDialog(false);
          break;
        case "startFlow":
          this.batchStartFlow(params.row.id);
          break;
        default:
          break;
      }
    },
    async beforeSaveData() {
      //  提交前可以改变model中的数据
      this.testCaseSaveModel = {...this.testCaseSaveModel,...this.testCase};
      this.testCaseSaveModel.boFormData = JSON.stringify(this.testCaseSaveModel.boFormData);
      this.testCaseSaveModel.startor = JSON.stringify(this.testCaseSaveModel.startor);
      this.testCaseSaveModel.actionType = JSON.stringify(this.testCaseSaveModel.actionType);
      this.testCaseSaveModel.bpmDebugger = JSON.stringify(this.testCaseSaveModel.bpmDebugger);
      this.testCaseSaveModel.defKey = this.defKey;
      this.isSubmit = true;
    },
    afterSaveData() {
      this.dialogVisible = false;
      this.$refs.testCaseTable.load();
      setTimeout(() => {
        this.testCase = {name: "",boFormData:{},startor: [],actionType: {},bpmDebugger: {},id:"",pkVal:""}
      }, 200);
    },
    afterLoadData(data) {
      // 菜单权限复制
      if (this.dialogVisibleMenuPerm) {
        this.allowRoles = data;
      }
      // 编辑角色
      if (this.dialogVisible) {
        this.role = data.value;
        setTimeout(() => this.$validator.validateAll("editRoleForm"));
      }
    }
  }
};
</script>
<style scoped>
div[aria-invalid="true"] >>> .el-input__inner,
div[aria-invalid="true"] >>> .el-input__inner:focus {
  border-color: #f56c6c;
}
</style>
