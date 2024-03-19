<template>
  <div class="fullheight">
    <ht-table
      @load="loadData"
      :data="data"
      :page-result="pageBean"
      :selection="true"
      quick-search-props="name,key"
      ref="htTable"
      :show-export="false"
      :show-custom-column="false"
      @row-click="rowClick"
    >
      <template v-slot:toolbar>
        <el-button-group>
          <el-button size="small" @click="handleOpen('添加消息模板')" icon="el-icon-plus">添加</el-button>
          <ht-delete-button :url="formDeleteUrl()" :htTable="$refs.htTable" style="margin:0;">删除</ht-delete-button>
        </el-button-group>
      </template>
      <template>
        <ht-table-column type="index" width="50" align="center" label="序号" />
        <ht-table-column prop="name" label="模板名称" width="160" :show-overflow-tooltip="true" :sortable="true">
          <template slot-scope="scope">
            <el-link type="primary" @click="handleOpen('编辑消息模板', scope.row)">{{scope.row.name}}</el-link>
          </template>
        </ht-table-column>
        <ht-table-column
          prop="key"
          width="200"
          label="模板业务键"
          :show-overflow-tooltip="true"
          :sortable="true"
        />
        <ht-table-column prop="subject" label="标题" :show-overflow-tooltip="true" :sortable="true" />
        <ht-table-column
          prop="smsTemplateNo"
          :show-overflow-tooltip="true"
          label="短信模板"
          :sortable="true"
          width="100"
        />
        <ht-table-column
          prop="voiceTemplateNo"
          :show-overflow-tooltip="true"
          label="语音模板"
          :sortable="true"
          width="100"
        />
        <ht-table-column
          prop="isDefault"
          label="是否默认"
          width="90"
          :filters="[{text:'否', value:0},{text:'是', value:1}]"
        >
          <template slot-scope="scope">
            <span v-if="scope.row.isDefault == '1'">
              <el-tag type="success">是</el-tag>
            </span>
            <span v-else>
              <el-tag type="warning">否</el-tag>
            </span>
          </template>
        </ht-table-column>
        <ht-table-column label="操作" align="left" width="206">
          <template v-slot="{ row }">
            <el-button size="mini" icon="el-icon-view" @click="details(row)">详情</el-button>
            <el-button size="mini" type="primary" v-if="row.isDefault != '1'" icon="el-icon-setting" @click="setDefault(row.id)">设为默认</el-button>
            <el-button size="mini" type="danger" v-if="row.isDefault != '0'" icon="el-icon-setting" @click="setNotDefault(row.id)">取消默认</el-button>
          </template>
        </ht-table-column>
      </template>
    </ht-table>

    <el-dialog
      width="60%"
      :title="title"
      :visible.sync="dialogVisible"
      :before-close="handleClose"
      :close-on-click-modal="false"
      append-to-body
    >
      <el-form :model="formData" data-vv-scope="msgTemplateForm">
        <el-row>
          <el-col>
            <ht-form-item label="模板名称" label-width="120px">
              <ht-input v-model="formData.name" :validate="{ required: true }" :maxlength="50" :showWordLimit="true" />
            </ht-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col>
            <ht-form-item label="模板分类" label-width="120px">
              <ht-select
                v-model="formData.typeKey"
                :options="templateType"
                @change="changeTemplate()"
                :validate="{ required: true }"
              />
            </ht-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col>
            <ht-form-item label="模版业务键" label-width="120px">
              <ht-input v-model="formData.key" :validate="{ required: true }" :maxlength="50" :showWordLimit="true" />
            </ht-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col>
            <ht-form-item label="短信模板ID" label-width="120px">
              <ht-input v-model="formData.smsTemplateNo" :maxlength="50" :showWordLimit="true" />
            </ht-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col>
            <ht-form-item label="语音模板ID" label-width="120px">
              <ht-input v-model="formData.voiceTemplateNo" :maxlength="50" :showWordLimit="true" />
            </ht-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col>
            <ht-form-item label="模板参数" label-width="120px">
              <el-link
                type="primary"
                v-for="param in templateParams"
                :key="param.key"
                @click="addTemplateParam(param.value)"
              >{{param.label}}</el-link>
              <br />选择模板参数的时候，请注意光标位置(光标位置支持[标题，纯文本])。
            </ht-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col>
            <ht-form-item label="标题" label-width="120px">
              <ht-input
                ref="subject"
                v-model="formData.subject"
                type="textarea"
                :cols="80"
                :autosize="{minRows:4,maxRows:8}"
                @focus="activeTextarea = 'subject'"
                :maxlength="200"
                :showWordLimit="true"
              />
            </ht-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col>
            <ht-form-item label="纯文本" label-width="120px">
              <ht-input
                ref="plain"
                v-model="formData.plain"
                type="textarea"
                :cols="80"
                :autosize="{minRows:4,maxRows:8}"
                @focus="activeTextarea = 'plain'"
                :maxlength="200"
                :showWordLimit="true"
              />
            </ht-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col>
            <ht-form-item label="模版体HTML" label-width="120px">
              <htEditor v-model="formData.html"  :config="myConfig"></htEditor>
            </ht-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <ht-submit-button
          :url="saveUrl()"
          :model="formData"
          :is-submit="isSubmit"
          scope-name="msgTemplateForm"
          @before-save-data="beforeSaveData()"
          @after-save-data="afterSaveData"
        >保存</ht-submit-button>
        <el-button @click="handleClose">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 明细页面 -->
    <msg-details ref="msgDetails" :msgDataId="msgTemplateData"></msg-details>
  </div>
</template>

<script>
import flow from "@/api/flow.js";
const msgDetails = () => import("@/views/flow/help/MsgDetails.vue");
const htEditor = () => import("@/components/common/HtEditor.vue");

export default {
  components: { msgDetails, htEditor },
  data() {
    return {
      myConfig:{
				initialFrameHeight: 240,
				UEDITOR_HOME_URL: window.location.origin +'/'+ window.location.pathname.split('/')[1]+'/static/ueditor/',
				toolbars: [
				[
            // 'source', //源代码
            'undo', //撤销
            'bold', //加粗
            'indent', //首行缩进
            'italic', //斜体
            'underline', //下划线
            'strikethrough', //删除线
            'subscript', //下标
            'fontborder', //字符边框
            'superscript', //上标
            'formatmatch', //格式刷
            'forecolor',//字体颜色
            'justifyleft', //居左对齐
            'justifycenter', //居中对齐
            'justifyright', //居右对齐
            'justifyjustify', //两端对齐
            'fontfamily', //字体
            'fontsize', //字号
            'insertorderedlist', //有序列表
            'insertunorderedlist', //无序列表
            'lineheight',//行间距
            'inserttable', //插入表格
            'link', //超链接
            'simpleupload', //单图上传
            'insertimage', //多图上传
            'attachment', //附件
				]
				],
				// 初始容器宽度
				initialFrameWidth: "100%",
				zIndex:9999,
				enableAutoSave: false,
				readonly : false
			},
      msgTemplateData: {},
      title: "",
      templateType: [
        { key: "taskCreate", value: "任务创建通知" },
        { key: "bpmCommuSend", value: "任务沟通" },
        { key: "bpmCommuFeedBack", value: "沟通通知人" },
        { key: "bpmnTaskTrans", value: "任务流转默认" },
        { key: "bpmHandTo", value: "任务转交通知" },
        { key: "addSignTask", value: "加签通知" },
        { key: "taskComplete", value: "任务完成通知" },
        { key: "taskBack", value: "任务驳回通知" },
        { key: "processEnd", value: "流程结束" },
        { key: "bpmnApproval", value: "审批提醒" },
        { key: "bpmnBack", value: "驳回提醒" },
        { key: "bpmnRecover", value: "撤销提醒" },
        { key: "bpmnAgent", value: "委托任务审批" },
        { key: "bpmnDelegate", value: "通知被委托人" },
        { key: "bpmEndProcess", value: "终止流程" },
        { key: "bpmTransCancel", value: "撤销流程" },
        { key: "copyTo", value: "流程实例抄送" },
        { key: "bpmtasksetexecutors" , value:"设置任务执行人"},
      ],
      pageBean: {
        page: 1,
        pageSize: 20,
        total: 0
      },
      dialogVisible: false,
      data: [],
      formData: {
        name: "",
        key: "",
        smsTemplateNo: "",
        voiceTemplateNo: "",
        htmlTemplate: "",
        plain: "",
        subject: ""
      },
      isSubmit: false,
      templateParams: [
        { key:1, value: "${instSubject}", label: "流程实例标题" },
        { key:2, value: "${nodeName}", label: "节点名称" },
        { key:3, value: "${taskSubject}", label: "任务标题" },
        { key:4, value: "${cause}", label: "原因" },
        { key:5, value: "${delegate}", label: "委托人" },
        { key:6, value: "${agent}", label: "代理人" },
        { key:7, value: "${receiver}", label: "收信人" },
        { key:8, value: "${sender}", label: "发送人" }
      ],
      activeTextarea: ""
    };
  },
  methods: {
    rowClick(row, column, event){
      this.$refs.htTable.$refs.htTable.toggleRowSelection(row);
    },
    //表格操作
    setDefault(id) {
      let this_= this;
      this.$http.get('${portal}/flow/MsgTemplate/v1/setDefault?id='+id).then(res=>{
        if(res.data && res.data.state){
          this_.$message.success('操作成功');
          this_.$refs.htTable.load(true);
        }
      });
    },
    setNotDefault(id) {
        let this_= this;
        this.$http.get('${portal}/flow/MsgTemplate/v1/setNotDefault?id='+id).then(res=>{
            if(res.data && res.data.state){
                this_.$message.success('操作成功');
                this_.$refs.htTable.load(true);
            }
        });
    },
    //表格操作
    showFormDialog(param) {
      switch (param.command) {
        case "edit":
          this.handleOpen("编辑消息模板", param.row);
          break;
        case "details":
          this.details(param.row);
          break;
        case "setDefault":
          this.setDefault(param.row.id);
          break;
      }
    },
    handleOpen(param, row) {
      this.title = param;
      if (row) {
        this.formData = row;
      }
      this.dialogVisible = true;
    },
    loadData(param, cb) {
      if (!param) {
        this.pageBean.total = 0;
        param = { pageBean: "" };
        param.pageBean = this.pageBean;
        param.sorter = this.defaultSort;
      }
      flow
        .getMsgData(param)
        .then(resp => {
          this.data = resp.data.rows;
          this.pageBean = {
            page: resp.data.page,
            pageSize: resp.data.pageSize,
            total: resp.data.total
          };
        })
        .finally(() => cb());
    },
    handleClose() {
      this.dialogVisible = false;
      this.loadData();
      this.formData = {
        name: "",
        key: "",
        smsTemplateNo: "",
        voiceTemplateNo: "",
        htmlTemplate: "",
        plain: "",
        subject: ""
      };
    },
    saveUrl() {
      return window.context.portal + "/flow/MsgTemplate/v1/save";
    },
    beforeSaveData() {
      if (!this.formData || !this.formData.isDefault) {
        this.formData.isDefault = 0;
      }
      this.isSubmit = true;
    },
    afterSaveData() {
      this.loadData();
      this.dialogVisible = false;
      this.formData = {
        name: "",
        key: "",
        smsTemplateNo: "",
        voiceTemplateNo: "",
        htmlTemplate: "",
        plain: "",
        subject: ""
      };
    },
    formDeleteUrl() {
      return `${window.context.portal}/flow/MsgTemplate/v1/remove`;
    },
    details(row) {
      this.msgTemplateData.id = row.id;
      this.$refs.msgDetails.handleOpen();
    },
    changeTemplate() {
      switch (this.formData.typeKey) {
        case "taskCreate":
          this.formData.key = "taskCreate-";
          break;
        case "bpmCommuSend":
          this.formData.key = "bpmCommuSend-";
          break;
        case "bpmCommuFeedBack":
          this.formData.key = "bpmCommuFeedBack-";
          break;
        case "bpmnTaskTrans":
          this.formData.key = "bpmnTaskTrans-";
          break;
        case "bpmHandTo":
          this.formData.key = "bpmHandTo-";
          break;
        case "addSignTask":
          this.formData.key = "addSignTask-";
          break;
        case "taskComplete":
          this.formData.key = "taskComplete-";
          break;
        case "taskBack":
          this.formData.key = "taskBack-";
          break;
        case "processEnd":
          this.formData.key = "processEnd-";
          break;
        case "bpmnApproval":
          this.formData.key = "bpmnApproval-";
          break;
        case "bpmnBack":
          this.formData.key = "bpmnBack-";
          break;
        case "bpmnRecover":
          this.formData.key = "bpmnRecover-";
          break;
        case "bpmnAgent":
          this.formData.key = "bpmnAgent-";
          break;
        case "bpmnDelegate":
          this.formData.key = "bpmnDelegate-";
          break;
        case "bpmEndProcess":
          this.formData.key = "bpmEndProcess-";
          break;
        case "bpmTransCancel":
          this.formData.key = "bpmTransCancel-";
          break;
        case "copyTo":
          this.formData.key = "copyTo-";
          break;
      }
    },
    addTemplateParam(param) {
      if (this.activeTextarea) {
        let textInput = this.$refs[this.activeTextarea].$refs.elInput.$refs
          .textarea;
        let insert = textInput.selectionStart;
        this.formData[this.activeTextarea] =
          textInput.value.substr(0, insert) +
          param +
          textInput.value.substr(insert);
      }
    }
  }
};
</script>

<style scoped>
.el-link {
  margin: 0 5px;
}
</style>
