<template>
  <el-dialog
      title="编辑自定义视图"
      :visible="dialogVisible"
      :before-close="beforeClose"
      :close-on-click-modal="false"
      width="80%">
    <el-tabs>
      <el-tab-pane label="基本信息">
        <el-form data-vv-scope="viewEdit">
          <ht-form-item label="名称" validate="required">
            <ht-input v-model="data.name" style="width:80%;"  :validate="{required:true}" :maxlength="50" :showWordLimit="true"/>
          </ht-form-item>
          <ht-form-item label="别名" validate="required">
            <ht-input v-model="data.alias" style="width:80%;"  v-pinyin="data.name" :disabled="data.id?true:false" :validate="{required:true, regex:{exp:'^[a-zA-Z][a-zA-Z0-9_]*$', message:'只能输入字母、数字、下划线，且以字母开头' }}" :maxlength="50" :showWordLimit="true"/>
          </ht-form-item>
           <ht-form-item v-if="data.interface" label="接口地址">
             <ht-input v-model="data.interface" style="width:80%;" disabled />
              <el-popover
                placement="top-start"
                title="接口提示"
                width="400"
                trigger="hover"
                content='接口类型为POST类型，接口参数示例为：{pageBean: {page: "1", pageSize: 30, showTotal: "true"},querys: [{property: "表名.字段名", value: "参数内容", group: "main", operation: "LIKE", relation: "OR"}}'>
                  <el-button slot="reference" class="copy-btn" type="text" v-clipboard:copy="data.interface" v-clipboard:success="onCopy" v-clipboard:error="onError">复制地址</el-button>
              </el-popover>
          </ht-form-item>
          <ht-form-item label="是否分页" validate="required">
            <el-switch
              v-model="data.needPage"
              active-color="#13ce66"
              inactive-color="#ff4949"
              :active-value="1"
              :inactive-value="0"/>
            &nbsp;
            <ht-select
              :options="[{key:'10',value:10},{key:'20',value:20},{key:'30',value:30},{key:'50',value:50},{key:'100',value:100}]"
              :props="{key:'key',value:'value'}"
              v-model="data.pageSize"
              v-if="data.needPage===1"/>
          </ht-form-item>
          <ht-form-item label="是否初始查询" validate="required">
            <el-switch
                v-model="data.initQuery"
                active-color="#13ce66"
                inactive-color="#ff4949"
                :active-value="1"
                :inactive-value="0"/>
          </ht-form-item>
          <ht-form-item label="是否显示行号" validate="required">
            <el-switch
                v-model="data.showRowsNum"
                active-color="#13ce66"
                inactive-color="#ff4949"
                :active-value="1"
                :inactive-value="0"/>
          </ht-form-item>
          <ht-form-item label="数据模板" validate="required">
            <ht-select
              :options="templateList"
              v-model="data.templateAlias"
              :props="{key:'alias',value:'templateName'}"
              :validate="{required:true}"/>
          </ht-form-item>
          <ht-form-item label="重新生成模板" validate="required">
            <el-switch
                v-model="data.rebuildTemp"
                active-color="#13ce66"
                inactive-color="#ff4949"
                :active-value="1"
                :inactive-value="0"/>
          </ht-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="显示字段">
        <el-table
          :data="data.shows"
          height="400"
          border>
          <el-table-column
            prop="fieldName"
            label="列名"/>
          <el-table-column
              label="注释">
            <template slot-scope="scope">
              <ht-input v-model="scope.row.fieldDesc" :maxlength="50"/>
            </template>
          </el-table-column>
          <el-table-column
              label="支持排序"
              width="80">
            <template slot-scope="scope">
              <el-switch
                  v-model="scope.row.sortable"
                  active-color="#13ce66"
                  inactive-color="#ff4949"
                  :active-value="1"
                  :inactive-value="0"
                  v-if="scope.row.isVirtual!==1"/>
            </template>
          </el-table-column>
          <el-table-column
            label="排序方向"
            width="100">
            <template slot-scope="scope">
              <ht-select
                :options="[{key:'asc'},{key:'desc'}]"
                :props="{key:'key',value:'key'}"
                v-model="scope.row.sortSeq"
                clearable
                v-if="scope.row.defaultSort===1"/>
            </template>
          </el-table-column>
          <el-table-column
            label="默认排序" width="80">
            <template slot-scope="scope">
              <el-button @click="defaultSortChange(scope.row)" :type="scope.row.defaultSort!==1?'info':'success'">{{scope.row.defaultSort!==1?"否":"是"}}</el-button>
            </template>
          </el-table-column>
          <el-table-column
              label="是否冻结"
              width="80">
            <template slot-scope="scope">
              <el-switch
                  v-model="scope.row.frozen"
                  active-color="#13ce66"
                  inactive-color="#ff4949"
                  :active-value="1"
                  :inactive-value="0"/>
            </template>
          </el-table-column>
          <el-table-column
              label="是否隐藏"
              width="80">
            <template slot-scope="scope">
              <el-switch
                  v-model="scope.row.hidden"
                  active-color="#13ce66"
                  inactive-color="#ff4949"
                  :active-value="1"
                  :inactive-value="0"/>
            </template>
          </el-table-column>
          <el-table-column
              label="对齐方式"
              width="100">
            <template slot-scope="scope">
              <ht-select
                  :options="[{key:'left',value:'居左'},{key:'center',value:'居中'},{key:'right',value:'居右'}]"
                  :props="{key:'key',value:'value'}"
                  v-model="scope.row.align"/>
            </template>
          </el-table-column>
          <el-table-column
              label="宽度" width="140">
            <template slot-scope="scope">
              <ht-input v-model="scope.row.width" :maxlength="50"/>
            </template>
          </el-table-column>
          <el-table-column
              label="统计类型" width="120">
            <template slot-scope="scope">
              <ht-select
                  :options="[{key:'',value:'请选择'},{key:'sum',value:'求和'}]"
                  :props="{key:'key',value:'value'}"
                  v-model="scope.row.summaryType"/>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="条件字段">
        <el-table
            :data="data.conditions"
            height="400"
            border>
          <el-table-column
              prop="fieldName"
              label="列名"/>
          <el-table-column
              label="描述">
            <template slot-scope="scope">
              <ht-input v-model="scope.row.fieldDesc" :maxlength="50" :showWordLimit="true"/>
            </template>
          </el-table-column>
          <el-table-column
              width="80"
              prop="dataType"
              label="数据类型"/>
          <el-table-column
          width="100"
              prop="controlTypeDesc"
              label="控件类型">
          </el-table-column>
          <el-table-column
              label="操作符" width="120">
            <template slot-scope="scope">
              <ht-select
                  :options="[{key:'EQ',value:'等于'},{key:'NE',value:'不等于'},{key:'LK',value:'相似'},{key:'LFK',value:'左相似'},{key:'RHK',value:'右相似'},{key:'BETWEEN',value:'在...之间'}]"
                  :props="{key:'key',value:'value'}"
                  v-model="scope.row.operate"/>
            </template>
          </el-table-column>
          <el-table-column
              label="值来源" width="80">
            <template>
              <span>表单输入</span>
            </template>
          </el-table-column>
          <el-table-column
              label="是否隐藏" width="80">
            <template slot-scope="scope">
              <el-switch
                  v-model="scope.row.hidden"
                  active-color="#13ce66"
                  inactive-color="#ff4949"
                  :active-value="1"
                  :inactive-value="0"/>
            </template>
          </el-table-column>
          <el-table-column
              label="管理"
              width="120">
            <template slot-scope="scope">
              <el-button icon="el-icon-arrow-up" @click="arrayMove('conditions',scope.row,'up')"/>
              <el-button icon="el-icon-arrow-down" @click="arrayMove('conditions',scope.row,'down')"/>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="数据过滤">
        <el-button @click="addFilter()">添加脚本</el-button>
        <el-table
            :data="filterFields"
            height="400"
            border>
          <el-table-column
              prop="name"
              label="名称"/>
          <el-table-column
              label="Key"
              prop="key">
          </el-table-column>
          <el-table-column
              label="类型">
            <template slot-scope="scope">
              <el-tag type="primary" v-if="scope.row.type==='1'">条件类型</el-tag>
              <el-tag type="danger" v-if="scope.row.type==='2'">SQL</el-tag>
              <el-tag type="warning" v-if="scope.row.type==='3'">追加SQL</el-tag>
              <el-tag type="success" v-if="scope.row.type==='4'">数据权限</el-tag>
            </template>
          </el-table-column>
          <el-table-column
              prop="controlTypeDesc"
              label="权限"
          >
            <template slot-scope="scope">
              <el-tag type="info" v-for="(item,index) in scope.row.right" :key="index" v-show="item.checked !== false">{{item.title}}<span v-if="item.name">:{{item.name}}</span></el-tag>
              <el-button icon="el-icon-edit" @click="editAuth(scope.row,scope.$index)"/>
            </template>
          </el-table-column>
          <el-table-column
              label="管理"
              width="240">
            <template slot-scope="scope">
              <el-button icon="el-icon-arrow-up" @click="arrayMove('filterFields',scope.row,'up')"/>
              <el-button icon="el-icon-arrow-down" @click="arrayMove('filterFields',scope.row,'down')"/>
              <el-button icon="el-icon-edit" @click="addFilter(scope.row,scope.$index)"/>
              <el-button icon="el-icon-delete" @click="filterFields.splice(scope.$index,1)"/>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="功能按钮">
        <el-table
            :data="data.buttons"
            height="400"
            border>
          <el-table-column
              prop="name"
              label="名称"/>
          <el-table-column
              label="类型">
            <template slot-scope="scope">
              <el-tag type="primary" v-if="!scope.row.inRow">页头</el-tag>
              <el-tag type="warning" v-if="scope.row.inRow">行内</el-tag>
            </template>
          </el-table-column>
          <el-table-column
              prop="icon"
              label="按钮图标">
            <template slot-scope="scope">
              <span :class="scope.row.icon"/>
            </template>
          </el-table-column>
          <el-table-column
              prop="urlPath"
              label="URL路径">
          </el-table-column>
          <el-table-column
              label="隐藏">
            <template slot-scope="scope">
              <el-switch
                  v-model="scope.row.hidden"
                  active-color="#13ce66"
                  inactive-color="#ff4949"
                  :active-value="1"
                  :inactive-value="0"/>
            </template>
          </el-table-column>
          <el-table-column
              label="管理"
              width="120">
            <template slot-scope="scope">
              <el-button icon="el-icon-arrow-up" @click="arrayMove('buttons',scope.row,'up')"/>
              <el-button icon="el-icon-arrow-down" @click="arrayMove('buttons',scope.row,'up')"/>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="汇总设置">
        <summary-setting
            ref="SummarySetting"
            :data.sync="summaryData"/>
      </el-tab-pane>
    </el-tabs>
    <div slot="footer" class="dialog-footer">
      <ht-submit-button
          :url="saveUrl"
          :model="submitData"
          scope-name="viewEdit"
          @before-save-data="beforeSaveData"
          @after-save-data="afterSaveData">
        {{$t("eip.common.save")}}
      </ht-submit-button>
      <el-button @click="editTemplate" v-if="id">编辑模板</el-button>
      <el-button @click="initDefaultData(true)" v-if="id">重置字段</el-button>
      <el-button @click="addToMenu('manage')" v-if="id">添加为后端菜单</el-button>
      <el-button @click="addToMenu('front')" v-if="id">添加为前端菜单</el-button>
      <el-button @click="close">返回</el-button>
    </div>
    <template-edit ref="templateEdit" :id="this.id" @closeViewEdit="dialogVisible = false;"/>
    <menus-add ref="menusAdd" :alias="data.alias"  :sqlAlias="data.sqlAlias" />
    <filter-dialog
        ref="filterDialog"
        :metafields="data.shows"
        :conditionfields="data.conditions"
        :filterData="selectedData"
        :keys="filterFields"
        @after-save="afterSave"/>
    <auth-edit ref="authEdit" :condition="selectedData" @confirm="afterSave"/>
  </el-dialog>
</template>

<script>
  import form from "@/api/form.js";
  import flow from "@/api/flow.js";
  import utils from "hotent-ui/src/utils";
  import SummarySetting from "../dataTemplate/SummarySetting";
  const templateEdit = () => import("@/components/form/customView/TemplateEdit.vue");
  const menusAdd = () => import("@/components/form/customView/MenusAdd.vue");
  const filterDialog = () => import("@/components/form/customView/FilterDialog.vue");
  const authEdit = () => import("@/components/form/customView/AuthEdit.vue");
  const summarySetting = () => import("@/components/form/dataTemplate/SummarySetting.vue");
  export default {
    components:{
      SummarySetting,
      templateEdit,
      menusAdd,
      filterDialog,
      authEdit,
      summarySetting
    },
    props:{
      id:String,
      sqlAlias:String
    },
    data(){
      return{
        dialogVisible:false,
        data:{
          templateAlias:"",
          rebuildTemp:1,
          sqlAlias:this.sqlAlias,
          filterType:'1',
          needPage:1,
          pageSize:'30',
          initQuery:1,
          showRowsNum:0,
          supportGroup:0,
          filterInitType:'1',
          filterInitSql:'',
          shows:[],
          conditions:[],
          alias:"",
          interface:""
        },
        templateList:[],
        sqlDef:{},
        fields:[],
        filterFields:[],
        permissionList:[],
        permissionMap:{'none':'无'},
        saveUrl:window.context.form+"/form/query/queryView/save",
        submitData:{},
        selectedData:{},
        selectedIndex:0,
        summaryData:{bpmDataTemplate:{},displaySettingFields:""}
      }
    },
    watch: {
      data: {
        handler(newValue, oldValue) {
          if(newValue.alias !=""){
            this.data.interface = window.context.form+"/form/query/queryView/data_"+this.sqlAlias+"/"+newValue.alias;
            this.convertData();
          }
        }
      },
      deep: true,
      immediate: true
    },
    mounted() {

    },
    methods:{
      // 复制成功时的回调函数
      onCopy (e) {
        this.$message.success("内容已复制到剪切板！")
      },
      // 复制失败时的回调函数
      onError (e) {
        this.$message.error("抱歉，复制失败！")
      },
      beforeClose(){
        this.dialogVisible = false;
      },
      handleOpen(){
        const this_ = this;
        this_.dialogVisible = true;
        this_.$nextTick(()=>{
          // 获取模板列表
          form.getTemplateList().then(response=>{
            this_.templateList = response;
            this_.data.templateAlias = response[0].alias;
          });
          // 获取权限列表
          flow.getPermissionList().then(result=>{
            if (result){
              this_.permissionList = result;
              for (let i=0;i<result.length;i++){
                this_.permissionMap[result[i].type] = result[i].title;
              }
            }
          })
          if (this_.id){
            form.getViewById(this_.id).then(response=>{
              this_.data = response;
              this_.afterLoadEvent();
              this_.getSqlDef(this_.sqlAlias)
            });
          }else{
            this_.initData();
            this_.initGroup();
            this_.getSqlDef(this_.sqlAlias);
          }
        })
      },
      initData(){
        this.data={
          templateAlias:"",
          rebuildTemp: 1,
          sqlAlias:this.sqlAlias,
          filterType: 1,
          needPage: 1,
          pageSize:'30',
          initQuery:1,
          showRowsNum:0,
          supportGroup:0,
          filterInitType:1,
          filterInitSql:'',
          shows:[],
          conditions:[],
          alias:"",
          interface:""
        };
      },
      afterLoadEvent(){
        this.data.shows = JSON.parse(this.data.shows);
        this.data.conditions = JSON.parse(this.data.conditions);
        this.data.buttons = JSON.parse(this.data.buttons);
        this.data.groupSetting = JSON.parse(this.data.groupSetting);
        this.$set(this.data,"rebuildTemp",1);
        this.filterFields = this.data.filter?JSON.parse(this.data.filter):[];
      },
      getSqlDef(sqlAlias){
        form.getQuerySqlDef(sqlAlias).then(response=>{
            this.sqldef = response;
            //新增时需要加载初始化默认的显示字段和条件字段的
            if (!this.id) {
              this.initDefaultData(false);
              this.initFields();
            }else{
              this.initFields();
            }
          })
      },
      initFields(){
        if(this.fields.length<1){
          for (let i = 0; i < this.data.shows.length; i++) {
            let field = this.data.shows[i];
            field.name = field.name;
            field.type = field.controlType;
            field.desc = field.fieldDesc;
            this.fields.push(field);
          }
        }
      },
      defaultSortChange(obj){
        for (let i=0;i<this.data.shows.length;i++){
          if (this.data.shows[i].id === obj.id) {
            this.data.shows[i].defaultSort = 1-this.data.shows[i].defaultSort;
            continue;
          }
          this.data.shows[i].defaultSort = 0;
        }
      },
      close(){
        this.dialogVisible = false;
      },
      editTemplate(){
        this.$refs.templateEdit.handleOpen();
      },
      initDefaultData(isTip) {
        this.data.shows = [];
        this.data.conditions = [];
        let displayFields = [];
        for (let i=0;i<this.sqldef.metafields.length;i++){
          if (this.sqldef.metafields[i].isShow === 1){
            let json = {...this.sqldef.metafields[i]};
            json.sortable = 0;
            json.sortSeq = "asc";
            json.defaultSort = 0;
            json.frozen = 0;
            json.hidden = 0;
            json.align = "center";
            json.group = 0;
            this.data.shows.push(json);
            displayFields.push({
              name:json.name,
              type:json.controlType
            })
          }
          if (this.sqldef.metafields[i].isSearch === 1) {// 条件字段
            let json1 = {...this.sqldef.metafields[i]};
            json1.hidden = 0;
            json1.operate = "EQ";
            json1.valueFrom = "1";
            this.data.conditions.push(json1);
          }
        }
        if(!this.summaryData.displaySettingFields){
            this.summaryData.displaySettingFields = JSON.stringify(displayFields);
        }
        // 默认的按钮
        this.data.buttons = JSON.parse(this.sqldef.buttonDef);
        if(isTip){
          this.$message({type:"success",message:"已重置字段"});
        }
      },
      //显示自定义视图添加到菜单dialog
      addToMenu(type){
        this.$refs.menusAdd.showDialog(type,"addReport");
      },
      addFilter(data,index){
        let isAdd = false;
        if (data){
          this.selectedData = data;
          this.selectedIndex = index;
        }else{
          this.selectedData = {};
          this.selectedIndex = -1;
          isAdd = true;
        }

        this.$refs.filterDialog.handleOpen(isAdd);
      },
      initGroup(){
        let groupSetting = {};
        groupSetting.groupField = [];
        groupSetting.groupColumnShow = [];
        groupSetting.groupText = [];
        groupSetting.groupOrder = [];
        groupSetting.groupSummary = [];
        this.data.groupSetting = groupSetting;
      },
      arrayMove(group,item,direct){
        if (group==='filterFields'){
          this[group] = utils.arrayMove(this.data[group],item,direct);
        }else{
          this.data[group] = utils.arrayMove(this.data[group],item,direct);
        }
      },
      beforeSaveData(){
        this.submitData = {...this.data};
        //处理合并查询
        let isIndistinct="hide";
        let conditionAllName="";
        let conditionAllDesc="";
        for(let i = 0; i < this.submitData.conditions.length; i++){
          this.submitData.conditions[i].na = this.submitData.conditions[i].fieldName;
          if(this.submitData.conditions[i].isCombine===1 && this.submitData.conditions[i].isSearch===1 && this.submitData.conditions[i].hidden===0 ){
            isIndistinct="show";
            conditionAllName+=this.submitData.conditions[i].name+",";
            conditionAllDesc+=this.submitData.conditions[i].fieldDesc+"/";
          }
        }
        if(conditionAllName!==""){
          conditionAllName=conditionAllName.substring(0,conditionAllName.length-1);
        }
        if(conditionAllDesc!==""){
          conditionAllDesc=conditionAllDesc.substring(0,conditionAllDesc.length-1);
        }

        this.submitData.groupSetting = JSON.stringify(this.submitData.groupSetting);
        this.submitData.conditions = JSON.stringify(this.submitData.conditions);
        this.submitData.buttons = JSON.stringify(this.submitData.buttons);
        this.submitData.shows = JSON.stringify(this.submitData.shows);
        this.submitData.filter = JSON.stringify(this.filterFields);
        this.submitData.isIndistinct=isIndistinct;
        this.submitData.conditionAllName=conditionAllName;
        this.submitData.conditionAllDesc=conditionAllDesc;
        this.$refs.SummarySetting.saveSummaryField();
        this.submitData.summarySetting = this.summaryData.bpmDataTemplate.summaryField;
      },
      afterSaveData(){
        this.close();
        this.$emit("after-save",{});
      },
      afterSave(data){
        if (this.selectedIndex>=0){
          this.filterFields.splice(this.selectedIndex,1);
          this.filterFields.splice(this.selectedIndex,0,data);
        }else{
          this.filterFields.push(data);
        }
      },
      editAuth(data,index){
        if (data){
          this.selectedData = data;
          this.selectedIndex = index;
        }
        this.$refs.authEdit.handleOpen();
      },
      convertData(){
        let list = this.data.shows.filter(item => item.isShow === 1).map(item => {
          let i = {name: item.fieldName,type: item.dataType};
          return i;
        });
        this.summaryData.displaySettingFields = JSON.stringify(list);
        this.summaryData.bpmDataTemplate.summaryField = this.data.summarySetting;
      }
    }
  }
</script>

<style scoped>

</style>
