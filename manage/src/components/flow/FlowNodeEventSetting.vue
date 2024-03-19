<template>
<el-dialog
        width="70%"
        :title="titleSetting"
        :visible="dialogVisibleSetting"
        :before-close="close"
        :close-on-click-modal="false"
        append-to-body
        top="8vh"
        :destroy-on-close="true"
      >
        <div style="margin-bottom: 10px;">
            <el-button type="primary" size="mini"  @click="addEvent" icon="el-icon-plus">新 增</el-button>
            <el-button type="success" size="mini"  @click="saveEvent"  icon="el-icon-check">保 存</el-button>
            <el-button type="danger" size="mini"  @click="close"  icon="el-icon-close">关 闭</el-button>
        </div>
        <el-form data-vv-scope="settingSave" v-form>
            <el-table
                style="width:100%;height: 550px;overflow: auto;"
                :data="restfulList"
                border
                ref="htTableSetting"
            >
                <el-table-column label="接口配置">
                    <template v-slot="{row,$index}">
                        <el-form data-vv-scope="settingSave">
                            <table class="form-table" cellspacing="0" cellpadding="0" border="0">
                                <tbody>
                                    <tr>
                                        <th width="170px" class="is-required">接口地址:</th>
                                        <td>
                                            <ht-input v-model="row.url" placeholder="请输入接口地址" class="ht" autocomplete="off" validate="required"></ht-input>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th width="170px" class="is-required">接口描述:</th>
                                        <td>
                                            <ht-input v-model="row.desc" placeholder="请输入接口描述" class="ht" autocomplete="off" validate="required"></ht-input>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th width="170px">接口类型:</th>
                                        <td>
                                            <ht-radio v-model="row.invokeMode"  :options='[{key: 1, value: "异步" },{key: 0, value: "同步" }]'/>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th width="170px">接口触发时机:</th>
                                        <td>
                                            <ht-checkbox style="margin-top: -10px;"  :options='[{key: "taskCreate", value: "任务创建时" },{key: "taskComplete", value: "任务结束时" }]' v-model="row.callTime" />
                                            <ht-checkbox v-if="!passConf.nodeId" style="margin-top: -10px;"  :options='[{key: "startEvent", value: "流程启动时" },{key: "endEvent", value: "流程结束时" }]' v-model="row.callTime" />
                                        </td>
                                    </tr>
                                    <tr v-if="!passConf.nodeId&&isGlobalNode(row.callTime)">
                                        <th width="170px">接口触发节点:</th>
                                        <td>
                                            <span v-for="node in passConf.nodes" :key="node.nodeId">
                                                <ht-checkbox style="margin-top: -10px;" :options='[{key: node.nodeId, value: node.name }]' v-model="row.callNodes" />
                                            </span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th width="170px">
                                            <el-tooltip class="item" effect="dark" content='接口头部（header）为JSON格式，如：{"Authorization":"Bearer eyJhbGciOiJIUzUxMiJ9"}' placement="left-start">
                                            <i class="el-icon-warning">接口头部（header）:</i></el-tooltip>
                                        </th>
                                        <td>
                                            <ht-input v-model="row.header" class="ht" placeholder="请输入接口头部（header）" autocomplete="off"></ht-input>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </el-form>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="100" >
                    <template v-slot="{row,$index}">
                        <el-button size="mini" type="danger" icon="el-icon-delete" @click="deleteSetting(restfulList,$index)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-form>
      </el-dialog>
</template>

<script>
import req from "@/request.js";
import { mapState, mapActions } from "vuex";
import { Message } from 'element-ui';
export default {
  name:"FlowNodeEventSetting",
  components: {},
  props: {
    //某个节点事件的标题
    titleSetting:{
      type: String,
      required: true,
      default:"节点事件设置"
    },
    //节点事件配置信息
    passConf:{
      type: Object,
      required: true
    },
  },
  data() {
    return {
      dialogVisibleSetting:false,//是否显示设置节点事件侧边栏
      restfulList:[],//接口配置信息
      restfulCopy:[],//复制的节点事件配置信息
      canSubmit: true
    };
  },
  methods: {
    //全局事件中是否包含节点事件
    isGlobalNode(callTime){
        if(callTime){
            return callTime.indexOf('taskCreate')!=-1||callTime.indexOf('taskComplete')!=-1?true:false;
        }
        return false;
    },
    //显示设置节点事件侧边栏
    showDialog(){
        this.dialogVisibleSetting=true;
        this.restfulList =[];
        this.restfulCopy = JSON.parse(JSON.stringify(this.passConf.restful));//复制的节点事件配置信息 （原生的）
        let restfulJson = this.restfulCopy;
        //判断是否存在接口事件
        if(!restfulJson || restfulJson.length==0){
            restfulJson = '[{"url":"","desc":"","invokeMode":1,"callTime":"","header":"","inParam":"","outParam":""}]';
            restfulJson = eval('(' + restfulJson + ')');
        }else{
            let len = restfulJson.length;
            for(let i=0;i<len;i++){
                let headerJson = restfulJson[i]['header'];
                if(headerJson&& typeof(headerJson) == "object" ){
                    restfulJson[i]['header'] = headerJson;
                }
            }
        }
        this.restfulList = restfulJson;
    },
    //判断是否JSON类型
    fromJson(json) {
        //传入的参数如果是字符串类型则转JOSN类型
        if(this.isString(json)){
          this.canSubmit = true;
          let formJson = {};
            try {
                formJson = JSON.parse(json);
                this.canSubmit = true;
            } catch (error) {
                this.$message.warning("请求头部必须是json格式的字符串");
                this.canSubmit = false;
            }
            return json;
        }else{
            this.canSubmit = true;
             return JSON.stringify(json);
        }
        
    },
    //判断是否字符串类型
    isString(value) {return typeof value === 'string';},
    //保存节点事件
    saveEvent(){
       const this_ = this;
       this_.$validator.validateAll("settingSave").then(result => {
        if (result) {
            let data = JSON.parse(JSON.stringify(this_.restfulList));//复制接口配置信息
            if(data && data.length>0){
                for(let i=0;i<data.length;i++){
                    let headerJson = data[i]['header'];
                    if(headerJson){
                        data[i]['header'] = this_.fromJson(headerJson);
                    }
                }
            }
            if (!this_.canSubmit) {
                return;
            }
            this.$emit("handle-save",data);//点击保存了获取最新的节点事件配置信息,并发布保存事件
            this_.dialogVisibleSetting=false;//关闭侧边栏
        } else {
            let arr = this_.$validator.errors.items.filter(item=>item.scope=="settingSave");
            let errorLength = arr.length;
            this_.$message({
                showClose: true,
                message: `有${errorLength}个字段未通过校验，请正确填写表单内容。`,
                type: "warning"
            });
        }
       });
    },
    //新增节点事件
    addEvent(){
        let restful = {"url":"","desc":"","invokeMode":1,"callTime":"","header":"","inParam":"","outParam":""};
        this.restfulList.push(restful);
    },
    //关闭设置接口事件侧边栏
    close(){
       this.restfulList = [];
       this.passConf.restful = this.restfulCopy;//没点击保存直接关闭则获取原来复制的节点事件配置信息 （原生的）
       this.dialogVisibleSetting = false;
    },
    //删除事件
    deleteSetting(list,index){
      list.splice(index,1);
    },
  },
  mounted() {
    this.$validator = this.$root.$validator;
  }
};
</script>

<style lang="scss" scoped>
div>>>.el-dialog__body {
    padding: 10px 20px;
    color: #606266;
    font-size: 14px;
    word-break: break-all;
}
.div_list{
    height: 30px;
    background: #e2e2e2;
    line-height: 30px;
    font-weight: bold;
    padding-left: 10px;
    margin-bottom: 10px;
}
>>>label.el-checkbox {
    margin: 5px 10px 0 0;
}
.ht{
  width:100%;;
}
.form-inline{
  float: left;
  width: 100%;
}
.left-label {
    width: 18%;
    float: left;
}
.control-label {
    word-break: break-all;
    text-align: right;
    color: #545252;
    font-size: 12px;
    padding: 0px 10px !important;
    font-weight: bold;
    line-height: 35px;
}
div>>>.box-card{
  margin-bottom: 20px;
}

div>>>.box-card .clearfix{
  padding-top: 20px;
}

div>>>.el-collapse-item__header{
    height: 40px;
    line-height: 40px;
    font-size: 14px;
    font-weight: bold;
}

div>>>.el-button{
   padding: 7px;
   margin-right: 10px;
   margin-left: 0px !important;
}
</style>