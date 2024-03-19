<template>
  <el-dialog
    :visible="dialogVisible"
    class="cv-edit__dialog"
    :before-close="beforeClose"
    :show-close="false"
    :close-on-click-modal="false"
    fullscreen
  >
    <template v-slot:title>
      <div class="flex" style="justify-content: space-between" >
        <el-page-header @back="close" :content="title"></el-page-header>
        <el-button-group>
          <el-button
                  type="primary"
                  @click="saveData"
                  :disabled="disabled"
          >{{$t("eip.common.save")}}</el-button>
          <el-button @click="refresh" v-if="id">刷新字段</el-button>
        </el-button-group>
      </div>
    </template>
    <el-dialog
      width="1040px"
      top="8vh"
      title="SQL生成器"
      :visible="dialogSQLVisible"
      :before-close="handleClose"
      :close-on-click-modal="false"
      append-to-body
    >
      <el-button
        class="btn-padding"
        icon="el-icon-plus"
        style="margin-bottom: 5px;"
        @click="addSqlList"
        >添加关联表</el-button
      >
      <div style="width:100%;height: 550px;overflow: auto;">
          <div v-for="(sql, indexSql) in sqlList" :key="indexSql">
            <table
              class="form-table  choiceType-table"
              style="margin-bottom: 1px;"
              cellspacing="0"
              cellpadding="0"
              border="0"
            >
              <tbody>
                <tr style="background-color:#cccccc24">
                  <th width="110px">关联表:</th>
                  <td>
                    <el-select v-if="indexSql==0" v-model="sql.related" ref ="related"
                      @click.native="getDivision(sql.related,indexSql,'related')"
                      @change="changeSql(sql.related,indexSql,'related')"
                      filterable  placeholder="请选择">
                      <el-option
                        v-for="item in tableList"
                        :key="item.name"
                        :label="item.comment"
                        :value="item.name">
                      </el-option>
                    </el-select>
                    <el-select v-if="indexSql!=0" v-model="sql.related" ref ="related"
                      @click.native="getDivision(sql.related,indexSql,'related')"
                      @change="changeSql(sql.related,indexSql,'related')"
                      filterable  placeholder="请选择">
                      <el-option
                        v-for="item in tableList.filter(tab => tab.type === '2')"
                        :key="item.name"
                        :label="item.comment"
                        :value="item.name">
                      </el-option>
                    </el-select>
                    <el-button
                      v-if="!sql.related"
                      type="danger"
                      class="btn-padding"
                      icon="el-icon-delete"
                      style="margin-left: 10px;"
                      @click="removeSqlList(indexSql)"
                    ></el-button>
                  </td>
                  <th v-if="sql.related" width="110px">被关联表:</th>
                  <td  v-if="sql.related" >
                    <el-select v-model="sql.connected" ref ="connected"
                      @click.native="getDivision(sql.related,indexSql,'connected')"
                      @change="changeSql(sql.connected,indexSql,'connected')"
                      filterable  placeholder="请选择">
                      <el-option
                        v-for="item in tableList"
                        :key="item.name"
                        :label="item.comment"
                        :value="item.name">
                      </el-option>
                    </el-select>
                    <el-button
                      type="danger"
                      class="btn-padding"
                      icon="el-icon-delete"
                      style="margin-left: 10px;"
                      @click="removeSqlList(indexSql)"
                    ></el-button>
                  </td>
                </tr>
                <tr v-if="sql.connected">
                  <th width="110px">关联关系:</th>
                  <td colspan="3">
                    <table
                      class="form-table  choiceType-table"
                      style="margin-bottom: 1px;"
                      cellspacing="0"
                      cellpadding="0"
                      border="0"
                    >
                      <tbody>
                        <tr v-for="(item, indexRelation) in sql.relation" :key="indexRelation">
                          <td>{{sql.related}}.
                           <ht-select
                            clearable
                            filterable
                            v-model="item.relatedBind"
                            :options="sql.fieldRelatedList"
                            :props="{key:'key',value:'value'}"
                          />&nbsp;&nbsp; = &nbsp;&nbsp;
                        {{sql.connected}}.
                          <ht-select
                            clearable
                            filterable
                            v-model="item.connectedBind"
                            :options="sql.fieldConnectedList"
                            :props="{key:'key',value:'value'}"
                          />
                          <el-button
                            class="btn-padding"
                            icon="el-icon-plus"
                            style="margin-left: 10px;"
                            @click="sql.relation.push({})"
                          ></el-button>
                          <el-button
                            v-if="sql.relation.length>1"
                            type="danger"
                            class="btn-padding"
                            icon="el-icon-delete"
                            style="margin-left: 10px;"
                            @click="sql.relation.remove(item)"
                          ></el-button>
                        </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button
            type="primary"
            @click="sqlOk"
            size="small"
            >确 认</el-button>
          <el-button
            @click="dialogSQLVisible = false"
            size="small"
            >返 回</el-button>
        </div>
    </el-dialog>
    <el-tabs v-model="tabStatus"  v-if="dialogVisible">
      <el-tab-pane label="sql配置" name="sql">
        <el-form data-vv-scope="customViewEdit">
          <ht-form-item label="名称">
            <ht-input v-model="data.name" :validate="{required:true}" :maxlength="50" :showWordLimit="true"/>
          </ht-form-item>
          <ht-form-item label="别名">
            <ht-input v-model="data.alias" :disabled="data.id?true:false" :maxlength="50" :showWordLimit="true" @change="changeAlias" name="dataAlias" 
                      :validate="{
                      required: true,
                      regex: {
                        exp: '^[a-zA-Z][a-zA-Z0-9_]*$',
                        message: '只能输入字母、数字、下划线，且以字母开头'
                      }
                    }" v-pinyin="data.name"/>
          </ht-form-item>
          <ht-form-item label="数据源">
            <ht-select
              v-model="data.dsName"
              :options="dataSources"
              :props="{key:'alias',value:'name'}"
            />
            &nbsp;&nbsp;<el-button @click="generateSql">SQL生成</el-button>
          </ht-form-item>
          <ht-form-item label="sql语句">
            <span slot="label">
              <el-tooltip content="系统不支持在联表查询SQL中使用别名，需要指定字段时，请使用表名作前缀" placement="top" effect="dark">
                <!-- content to trigger tooltip here -->
                <i class="el-icon-question"></i>
              </el-tooltip>
              sql语句
            </span>
            <ht-input
              type="textarea"
              :disabled="data.id?true:false"
              v-model="data.sql"
              :autosize="{ minRows: 10, maxRows: 10}"
            />
              <el-button type="primary" @click="getTenantCode" v-if="!data.id" style="margin-left: 5px">复制租户别名</el-button>
            &nbsp;&nbsp;<el-button type="primary" @click="checkSql" v-if="!data.id">验证SQL</el-button>
          </ht-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="按钮配置" name="btn">
        <el-button type="primary" @click="addButton" style="margin: 5px 0;">添加</el-button>
        <el-table border :data="buttonDef" ref="table">
          <el-table-column label="名称">
            <template slot-scope="scope">
              <ht-input v-model="scope.row.name" :disabled="scope.row.isDefault==='1'" :maxlength="50" :showWordLimit="true" />
            </template>
          </el-table-column>
          <el-table-column prop="inRow" label="行内按钮">
            <template slot-scope="scope">
              <el-switch v-model="scope.row.inRow" active-color="#13ce66" inactive-color="#ff4949" />
            </template>
          </el-table-column>
          <el-table-column label="按钮图标">
            <template slot-scope="scope">
              <span :class="'cv-icon icon iconfont '+scope.row.icon" />
              <icon-dialog
                @selected="selectIcon($event,scope.$index,scope.row)"
                v-if="!scope.row.inRow"
                class="cv-icon__dialog"
              />
            </template>
          </el-table-column>
          <el-table-column label="事件类型">
            <template slot-scope="scope">
              <ht-select
                v-model="scope.row.triggerType"
                :props="{key:'key',value:'value'}"
                :options="[{key:'onclick',value:'onclick'},{key:'href',value:'href'}]"
                :disabled="scope.row.isDefault==='1'"
              />
            </template>
          </el-table-column>
          <el-table-column prop="urlPath" label="url路径">
             <template slot="header">
              URL
              <el-tooltip class="item" effect="dark" placement="top-start">
                <div slot="content">
                  1.事件类型:onclick
                  <br />可直接调用front\src\components\querySql\DynamicView.vue 文件中的函数(可在此文件自定义新增函数)
                  <br />例:exports()
                <br />2.事件类型:href
                  <br />可跳转到其他页面
                  <br />例:https://www.baidu.com/
                </div>
                <i class="el-icon-warning"></i>
              </el-tooltip>
            </template>
            <template slot-scope="scope">
              <ht-input v-model="scope.row.urlPath" :disabled="scope.row.isDefault==='1'" />
            </template>
          </el-table-column>
          <el-table-column label="管理">
            <template slot-scope="scope">
              <el-button
                type="info"
                icon="el-icon-arrow-up"
                @click="arrayMove('buttonDef',scope.row,'up')"
              />
              <el-button
                type="info"
                icon="el-icon-arrow-down"
                @click="arrayMove('buttonDef',scope.row,'down')"
              />
              <el-button
                type="danger"
                icon="el-icon-delete"
                @click="deleteRow(scope.$index,buttonDef)"
                v-if="scope.row.isDefault!=='1'"
              />
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="字段设置" v-if="id!==''" name="field">
        <el-table :data="data.metafields" border>
          <el-table-column prop="name" label="列名" width="160" />
          <el-table-column prop="dataType" label="类型" width="65" />
          <el-table-column label="实际列名">
            <template slot-scope="scope">
              <ht-input v-model="scope.row.fieldName" :maxlength="50" :disabled="true"/>
            </template>
          </el-table-column>
          <el-table-column label="描述">
            <template slot-scope="scope">
              <ht-input v-model="scope.row.fieldDesc" :maxlength="50" />
            </template>
          </el-table-column>
          <el-tooltip class="item" effect="dark" content="Top Right 提示文字" placement="top-end">
            <el-table-column width="150">
              <template slot="header">
                宽度(px)
                <el-tooltip class="item" effect="dark" content="为0表示自适应" placement="top-start">
                  <i class="el-icon-warning"></i>
                </el-tooltip>
              </template>
              <template slot-scope="scope">
                <ht-input v-model="scope.row.width" :maxlength="50" />
              </template>
            </el-table-column>
          </el-tooltip>
          <el-table-column prop="controlTypeDesc" label="控件类型" width="90" />
          <el-table-column label="URL">
            <template slot="header">
              URL
              <el-tooltip class="item" effect="dark" placement="top-start">
                <div slot="content">
                  url 写法规则如下(写法遵循JS规范,使用前请自行检查语句):
                  <br />1.打开新窗口:onclick="window.open('http://www.hotent.com')"
                  <br />2.本页面VUE路由跳转: @click="routerPush('/home')"
                  <br />3.获取变量做跳转地址拼接，用法如下：
                  @click="routerPush('/urlTest/test/'+scope.row.id_)"
                  <br />4.使用行数据的方式为:scope.row.实际列名
                  <br />
                </div>
                <i class="el-icon-warning"></i>
              </el-tooltip>

            </template>
            <template slot-scope="scope">
              <ht-input v-model="scope.row.url" />
            </template>
          </el-table-column>
          <el-table-column label="显示" width="70">
            <template slot-scope="scope">
              <el-switch
                v-model="scope.row.isShow"
                active-color="#13ce66"
                inactive-color="#ff4949"
                :active-value="1"
                :inactive-value="0"
              />
            </template>
          </el-table-column>
          <el-table-column label="查询" width="70">
            <template slot-scope="scope">
              <el-switch
                v-model="scope.row.isSearch"
                active-color="#13ce66"
                inactive-color="#ff4949"
                :active-value="1"
                :inactive-value="0"
              />
            </template>
          </el-table-column>
          <el-table-column label="合并查询" width="70">
            <template slot-scope="scope">
              <el-switch
                v-model="scope.row.isCombine"
                active-color="#13ce66"
                inactive-color="#ff4949"
                :active-value="1"
                :inactive-value="0"
                v-if="scope.row.isSearch"
              />
            </template>
          </el-table-column>
          <!--<el-table-column label="虚拟列" width="60">
            <template slot-scope="scope">
              <el-tag v-if="scope.row.isVirtual">是</el-tag>
              <el-tag type="danger" v-if="!scope.row.isVirtual">否</el-tag>
            </template>
          </el-table-column>-->
          <el-table-column label="排序" width="120">
            <template slot-scope="scope">
              <el-button
                type="info"
                icon="el-icon-arrow-up"
                @click="arrayMove('metafields',scope.row,'up')"
              />
              <el-button
                type="info"
                icon="el-icon-arrow-down"
                @click="arrayMove('metafields',scope.row,'down')"
              />
            </template>
          </el-table-column>
          <el-table-column label="管理" width="180">
            <template slot-scope="scope">
              <el-button
                v-if="scope.row.isVirtual===0"
                :type="scope.row.controlType==='onetext'?'info':'warning'"
                @click="fieldDialog('K',scope.row)"
              >控</el-button>
              <el-button
                :type="((scope.row.alarmSetting!=null&&scope.row.alarmSetting.length>0)||(scope.row.formater!=null&&scope.row.formater!==''))?'warning':'info'"
                @click="fieldDialog('B',scope.row)"
              >报</el-button>
              <!--<el-button
                v-if="scope.row.isVirtual===0"
                :type="checkHasX(scope.row)?'warning':'info'"
                @click="fieldDialog('X',scope.row)"
              >虚</el-button>-->
              <el-button
                v-if="scope.row.isVirtual===1"
                type="danger"
                @click="fieldDialog('P',scope.row)"
              >配</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
    <div slot="footer" class="dialog-footer"></div>
    <field-dialog
      :type="type"
      :item="item"
      ref="fieldDialog"
      @select="select"
      @after-save="fieldSaveX"
    />
  </el-dialog>
</template>

<script>
    import {Message} from "element-ui";
    import form from "@/api/form.js";
    import utils from "@/hotent-ui-util.js";
    import TemplateEdit from "./TemplateEdit";
    import req from "@/request.js";

    const fieldDialog = () =>
  import("@/components/form/customView/FieldDialog.vue");
const iconDialog = () => import("@/components/dialog/IconDialog.vue");

export default {
  components: {
    TemplateEdit,
    fieldDialog,
    iconDialog
  },
  props: {
    id: String
  },
  data() {
    return {
      disabled:false,
      tabStatus:"sql",
      sqlList:[],//SQL生成集合
      tableList:[],//数据源中的实体表
      dialogSQLVisible:false,//sql生成器Dialog
      dialogVisible: false,
      data: {},
      dataSources: [],
      turnToIndex: "",
      isCheckSql: false,
      item: {},
      type: "",
      buttonDef: [],
      saveUrl: window.context.form + "/form/query/querySqldef/save",
      title: "添加自定义视图"
    };
  },
  mounted() {
    form.getDataSource().then(resp => {
      this.dataSources = resp.data;
    });
  },
  methods: {
    //SQL生成器确认事件
    sqlOk(){
      const this_ = this;
      if(this_.sqlList.length==1){
        for (let i = 0; i < this_.sqlList.length; i++) {
          if(this_.sqlList[i].connected){
            if(this_.sqlList[i].relation.length>0){
              for (let j = 0; j < this_.sqlList[i].relation.length; j++) {
                //判断有没有添加关联关系
                if(!this_.sqlList[i].relation[j].relatedBind || !this_.sqlList[i].relation[j].connectedBind){
                  Message.warning("请先添加关联关系");
                  return;
                }
              }
            }
          }else if(!this_.sqlList[i].related){
            Message.warning("请先添加被关联表");
            return;
          }
        }
      }
      if(this_.sqlList.length>1){
        for (let i = 0; i < this_.sqlList.length; i++) {
          if(this_.sqlList[i].relation.length>0){
            for (let j = 0; j < this_.sqlList[i].relation.length; j++) {
              //判断有没有添加关联关系
              if(!this_.sqlList[i].relation[j].relatedBind || !this_.sqlList[i].relation[j].connectedBind){
                Message.warning("请先添加关联关系");
                return;
              }
            }
          }
        }
      }
      let sql ="select * from ";//生成的SQL语句
      for (let i = 0; i < this_.sqlList.length; i++) {
        if(i == 0){
          if(this_.sqlList[i].connected){
            sql = sql + this_.sqlList[i].related + " left join " + this_.sqlList[i].connected + " on ";
          }else{
            sql = sql + this_.sqlList[i].related;
          }
        }else{
          sql = sql + " left join " + this_.sqlList[i].connected + " on ";
        }
        for (let j = 0; j < this_.sqlList[i].relation.length; j++) {
          if(this_.sqlList[i].relation[j].relatedBind && this_.sqlList[i].relation[j].connectedBind){
            if(j == 0){
              sql = sql + this_.sqlList[i].relation[j].relatedBind + " = " + this_.sqlList[i].relation[j].connectedBind;
            }else{
              sql = sql +  " and " +this_.sqlList[i].relation[j].relatedBind + " = " + this_.sqlList[i].relation[j].connectedBind;
            }
          }
        }
      }
      this_.data.sql = sql;
      this_.dialogSQLVisible=false;
    },
    handleSql(sqlAlias,index,type){
      const this_ = this;
      //选择了关联表或被关联表后修改则需要清空关联关系
      if(this_.sqlList[index].relation.length>0){
        for(let j = 0;j < this_.sqlList[index].relation.length;j++){
          if(type=="related"){
            if(this_.sqlList[index].relation[j].relatedBind){
              this_.sqlList[index].relation[j].relatedBind="";
            }
          }
          if(type=="connected"){
            if(this_.sqlList[index].relation[j].connectedBind){
              this_.sqlList[index].relation[j].connectedBind="";
            }
          }
        }
      }
      let params = {dsalias: this_.data.dsName,isTable: 1,objName: sqlAlias};
      //获取数据源的字段
      let url = window.context.form + "/form/customQuery/v1/getTable";
      req.post(url, params).then(function(data) {
        if(type=="related"){//关联表
          this_.sqlList[index].fieldRelatedList = [];
          for (let i = 0; i < data.data.table.columnList.length; i++) {
            data.data.table.columnList[i].key =
              sqlAlias + "." + data.data.table.columnList[i].fieldName;
            data.data.table.columnList[i].value =
              data.data.table.columnList[i].fieldName + "(" + data.data.table.columnList[i].comment + ")";
            this_.sqlList[index].fieldRelatedList.push(data.data.table.columnList[i]);
          }
        }else if(type=="connected"){//被关联表
          this_.sqlList[index].fieldConnectedList = [];
          for (let i = 0; i < data.data.table.columnList.length; i++) {
            data.data.table.columnList[i].key =
              sqlAlias + "." + data.data.table.columnList[i].fieldName;
            data.data.table.columnList[i].value =
              data.data.table.columnList[i].fieldName + "(" + data.data.table.columnList[i].comment + ")";
            this_.sqlList[index].fieldConnectedList.push(data.data.table.columnList[i]);
          }
        }
      });
    },
    getDivision(sqlAlias,index,type){
      const this_ = this;
      if(index!=this_.sqlList.length-1){
        let name = "";
        if(type=="related"){
          name="关联表";
        }else if(type=="connected"){
          name="被关联表";
        }
        this_.$confirm("确认修改?", "修改"+name+"会清空下面所有关联信息", {cancelButtonText: "取消",
          confirmButtonText: "确定",type: "warning",closeOnClickModal: false}) .then(() => {
          //删除此下标之后的所有关联数据
          for (let i = this_.sqlList.length-1; i >= 0; i--) {
            if(i >index){
              this_.sqlList.splice(i,1);
            }
          }
          if(type=="related"){
            this_.$refs.related[index].focus();
          }else if(type=="connected"){
            this_.$refs.connected[index].focus();
          }
        }) .finally(() => {
           if(type=="related"){
            this_.$refs.related[index].blur();
          }else if(type=="connected"){
            this_.$refs.connected[index].blur();
          }
        });
      }
    },
    //关联表和被关联表删除按钮
    removeSqlList(index){
      const this_ = this;
      if(index!=this_.sqlList.length-1){
        this_.$confirm("确认删除?", "点击删除会清空下面所有关联信息", {cancelButtonText: "取消",
          confirmButtonText: "确定",type: "warning",closeOnClickModal: false}) .then(() => {
          //删除此下标之后的所有关联数据
          for (let i = this_.sqlList.length-1; i >= 0; i--) {
            if(i >=index){
              this_.sqlList.splice(i,1);
            }
          }
        });
      }else{
        this_.sqlList.splice(index,1);
      }
    },
    //根据数据库表名获取字段(被关联表)
    changeSql(sqlAlias,index,type){
      const this_ = this;
      this_.handleSql(sqlAlias,index,type);
    },
    //添加sql关联表
    addSqlList(){
      //没添加被关联表不允许添加第二组数据
      if(this.sqlList.length==1 && this.sqlList[0].connected==""){
        Message.warning("请先添加被关联表");
        return;
      }
      let tables = [];//从第二组开始只能选择的数据库表
      //添加了被关联表
      if(this.sqlList.length>0){
        for (let i = 0; i < this.sqlList.length; i++) {
          if(this.sqlList[i].relation.length>0){
            for (let j = 0; j < this.sqlList[i].relation.length; j++) {
              //判断有没有添加关联关系
              if(!this.sqlList[i].relation[j].relatedBind || !this.sqlList[i].relation[j].connectedBind){
                Message.warning("请先添加关联关系");
                return;
              }
            }
          }
          if(this.sqlList[i].related){
            tables.push(this.sqlList[i].related);
          }
          if(this.sqlList[i].connected){
            tables.push(this.sqlList[i].connected);
          }
        }
      }
      //先把所有数据库表type修改为1
      for(let j = 0; j < this.tableList.length; j++){
        this.tableList[j].type = "1";
      }
      //根据上面的关联关系修改数据库表type为2给下一组选择
      if(tables.length>0){
        for(let i = 0; i < this.tableList.length; i++){
          if(tables.indexOf(this.tableList[i].name)!=-1){
            this.tableList[i].type = "2";//标记再次添加一组关联表的时候默认只能选择type为2的数据库表
          }
        }
      }
      //满足以上条件后
      this.sqlList.push({related:'',connected:'',relation:[{}],fieldRelatedList:[],fieldConnectedList:[]})
    },
    //打开SQL生成对话框
    generateSql(){
      const this_ = this;
      this_.dialogSQLVisible=true;
      this_.tableList = [];
      //获取数据源中的表
      let params = {dsalias: this_.data.dsName,isTable: 1,objName: ""};
      let url = window.context.form + "/form/customQuery/v1/getByDsObjectName";
      req.post(url, params).then(function(data) {
        if (!data || data.data.length == 0) {
          Message.warning("该数据源中未查询到表或视图");
          return;
        }
        for (let i = 0; i < data.data.length; i++) {
          data.data[i].type = "1";//添加第一组关联表的时候调用
          data.data[i].comment =
            data.data[i].name + "(" + data.data[i].comment + ")";
          this_.tableList.push(data.data[i]);
        }
      });
    },
    //关闭SQL生成对话框
    handleClose(){
      this.dialogSQLVisible=false;
    },
    beforeClose() {

      this.dialogVisible = false;
    },
    handleOpen() {
      this.tabStatus = "sql";
      this.dialogVisible = true;
      this.disabled = false;
      this.$nextTick(() => {
        if (this.id) {
          this.title = "编辑自定义视图";
          form.getCustomViewById(this.id).then(response => {
            this.data = response;
            this.buttonDef = JSON.parse(this.data.buttonDef);
            for (let i = 0; i < this.data.metafields.length; i++) {
              if (this.data.metafields[i].alarmSetting) {
                this.data.metafields[i].alarmSetting = JSON.parse(
                  this.data.metafields[i].alarmSetting
                );
              }
              if (this.data.metafields[i].controlContent) {
                this.data.metafields[i].controlContent = JSON.parse(
                  this.data.metafields[i].controlContent
                );
              }
            }
          });
          this.isCheckSql = true;
        } else {
          this.title = "添加自定义视图";
          this.data = {
            metafields: [],
            buttonDef: [
              {
                inRow: "0",
                name: "导出",
                triggerType: "onclick",
                isDefault: "1",
                urlPath: "exports()"
              }
            ],
            dsName: "LOCAL",
            supportTab: "1",
            alias: ""
          };
          this.buttonDef = this.data.buttonDef;
          this.isCheckSql = false;
        }
      });
    },
    checkSql() {
      if (!this.data.sql) {
        this.$message({ type: "warning", message: "请输入sql语句" });
        return;
      }
      let checkSql = JSON.stringify(this.data.sql);
      checkSql = checkSql.replace(/\s/g, "");
      if(checkSql.toLocaleUpperCase().indexOf("ORDERBY") != -1){
        this.$message({ type: "warning", message: "请检查sql语句，不能包含order by排序语句" });
        return;
      }
      if(checkSql.toLocaleUpperCase().indexOf("GROUPBY") != -1){
        this.$message({ type: "warning", message: "请检查sql语句，不能包含group by分组语句" });
        return;
      }
      let param = { sql: this.data.sql, dsName: this.data.dsName };
      form.checkSql(param).then(response => {
        if (response.state) {
          this.$message({ type: "success", message: response.message });
          this.isCheckSql = true;
        }
      });
    },
    addButton() {
      let json = {};
      json.inRow = true;
      json.triggerType = "onclick";
      json.isDefault = "0";
      this.buttonDef.push(json);
    },
    deleteRow(index, rows) {
      rows.splice(index, 1);
    },
    changeAlias(){
      document.getElementsByName("dataAlias")[0].style.border = "";
    },
    saveData(){
      this.disabled = true;
      this.beforeSaveData();
      utils.validateForm(this,"customViewEdit").then(() => {
        req.post(this.saveUrl,this.data).then(resp=>{
          this.disabled = false;
          if(resp.data.state){
            this.$message({message:resp.data.message,type:"success"});
            this.$confirm('保存成功，是否继续添加？','提示',{
              confirmButtonText: '继续操作',
              cancelButtonText: '退出',
              type: 'warning'
            })
                    .then(()=>{
                      document.getElementsByName("dataAlias")[0].focus();
                      document.getElementsByName("dataAlias")[0].style.border = "1px solid red";
                    })
                    .catch(() => {
                      this.afterSaveData();
                    });
          }else{
            this.afterSaveData();
          }
        })
        .catch(() => {
          this.disabled = false;
        });
      }).catch(reason => {
        this.disabled = false;
        this.$message.warning("请正确填写表单信息");
      })
    },
    beforeSaveData() {
      for (let i = 0; i < this.data.metafields.length; i++) {
        this.sn = i + 1;
        if (this.data.metafields[i].alarmSetting) {
          this.data.metafields[i].alarmSetting = JSON.stringify(
            this.data.metafields[i].alarmSetting
          );
        }
        if (this.data.metafields[i].dialogAlarmSetting) {
          this.data.metafields[i].alarmSetting = JSON.stringify(
            this.data.metafields[i].dialogAlarmSetting
          );
        }
        if (this.data.metafields[i].controlContent) {
          if (this.data.metafields[i].controlContent.alias) {
            let controlContent = {};
            controlContent.alias = this.data.metafields[i].controlContent.alias;
            controlContent.resultfield = this.data.metafields[
              i
            ].controlContent.resultfield;
            this.data.metafields[i].controlContent = JSON.stringify(
              controlContent
            );
          } else {
            this.data.metafields[i].controlContent = JSON.stringify(
              this.data.metafields[i].controlContent
            );
          }
        }
        this.data.metafields[i].isShow = this.data.metafields[i].isShow ? 1 : 0;
        this.data.metafields[i].isSearch = this.data.metafields[i].isSearch
          ? 1
          : 0;
        this.data.metafields[i].isCombine = this.data.metafields[i].isCombine
          ? 1
          : 0;
      }
      if (this.buttonDef) {
        this.data.buttonDef = JSON.stringify(this.buttonDef);
      }
    },
    afterSaveData() {
      this.close();
      this.$emit("after-save");
    },
    refresh() {
      const loading = this.$loading({
          lock: true,
          text: '正在刷新,请稍后',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
      });
      form.refreshFields(this.id).then(response => {
        this.data.metafields = response;
        loading.close();
        if (response){
          this.$message({type:"success",message:"刷新成功"});
        }
      });
    },
    close() {
      this.$emit("beforeClose");
      this.dialogVisible = false;
      this.sqlList=[];//清空数据源中的实体表（关联表和被关联表）
    },
    fieldDialog(type, item) {
      this.type = type;
      this.item = item;
      this.$refs.fieldDialog.handleOpen();
    },
    select(data) {
      for (let i = 0; i < this.data.metafields.length; i++) {
        if (this.data.metafields[i].id === data.id) {
          this.data.metafields.splice(i, 1);
          this.data.metafields.splice(i, 0, data);
          break;
        }
      }
    },
    fieldSaveX(data) {
      this.data.metafields.forEach((item, index) => {
        if (item.id === data.id && data.isVirtual) {
          if (this.type === "X") {
            this.data.metafields.push(data);
          } else if (item.isVirtual) {
            this.data.metafields.splice(index, 1, data);
          }
        }
      });
    },
    checkHasX(field) {
      let b = false;
      for (let i = 0; i < this.data.metafields.length; i++) {
        if (
          this.data.metafields[i].isVirtual === 1 &&
          this.data.metafields[i].virtualFrom === field.fieldName
        ) {
          b = true;
        }
      }
      return b;
    },
    arrayMove(group, item, direct) {
      if (group === "buttonDef") {
        this[group] = utils.arrayMove(this[group], item, direct);
      } else {
        this.data[group] = utils.arrayMove(this.data[group], item, direct);
      }
    },
    selectIcon(data, index, item) {
      item.icon = data;
      this.buttonDef.splice(index, 1);
      this.buttonDef.splice(index, 0, item);
    },
    getTenantCode(){
      // 获取租户别名
      let _this= this;
      let currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
      if (currentUser.userAttrs.tenantId != "-1"){
        let url = "${uc}/uc/tenantManage/v1/getJson?id="+currentUser.userAttrs.tenantId;
        this.$http.get(url).then(resp => {
          let tenantManageCode = resp.data.code;
          _this.$copyText(tenantManageCode).then(function (e) {
            _this.$message.success('租户别名复制成功，可粘贴至SQL语句中');
          })
        })
        // console.log(currentUser.userAttrs.tenantId)
      }else{
        _this.$message.warning('当前登录账号不是租户账号')
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.cv-edit__dialog /deep/ > .el-dialog > .el-dialog__header {
  padding: 8px 20px;
  border-bottom: 1px solid #ddd;
}

.cv-edit__dialog /deep/ > .el-dialog > .el-dialog__body {
  padding: 0 20px;
}

.cv-edit__dialog >>> .cell {
  text-align: center;
}

.cv-edit__dialog >>> .cell > span.cv-icon {
  line-height: 32px;
}

.cv-icon__dialog {
  display: inline-block;
  float: right;
}
</style>
