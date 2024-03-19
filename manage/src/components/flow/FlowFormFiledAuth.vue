<template>
  <div>
      <el-dialog title="授权页面" :visible.sync="dialogVisible" width="70%" appendToBody 
        :close-on-click-modal="false" top="8vh">
          <el-container>
            <el-main style="padding: 10px;height: 530px">
                <table class="table table-bordered" style="border-spacing: 0;width: 100%;max-height: 400px;overflow: initial;">
                  <thead>
                    <th style="width:15%">权限类型</th>
                    <th>内容</th>
                    <th style="width:15%">操作</th>
                  </thead>
                  <tbody>
                    <tr v-for="item in noNeedSetArr" :key="item.title">
                      <th>{{item.title}}</th>
                      <td></td>
                      <td>
                        <input type="checkbox"  @click="checkNoSetting($event,item)"  v-model="item.checked" />
                      </td>
                    </tr>
                    <tr v-for="(item,$index) in needSetArr" :key="item.title" v-show="showNeedRight" >
                      <th>{{item.title}}</th>
                      <td>
                        <eip-user-selector v-if="item.type=='user'" :appendToBody="true" v-model="item.name" :config="{id:'needSetArr['+$index+'].id'}"/>
                        <eipRoleSelector v-if="item.type=='role'" :appendToBody="true" v-model="item.name" :config="{id:'needSetArr['+$index+'].id'}"/>
                        <eipOrgSelector v-if="item.type=='org'" :appendToBody="true" v-model="item.name" :config="{id:'needSetArr['+$index+'].id'}"/>
                        <eipPostSelector v-if="item.type=='pos'" :appendToBody="true" v-model="item.name" :config="{id:'needSetArr['+$index+'].id'}"/>
                      </td>            
                      <td>
                        <el-button @click="item.id='';item.name='';$forceUpdate();">重置</el-button>
                      </td>
                    </tr>
                  </tbody>
                </table>
            </el-main>
          </el-container>
          <span slot="footer" class="dialog-footer">
              <el-button type="primary" @click="handleClose" size="medium">确 定</el-button>
              <el-button @click="dialogVisible = false" size="medium">取 消</el-button>
            </span>
      </el-dialog>
  </div>
</template>

<script>
import flow from "@/api/flow.js";
import req from "@/request.js";
import { mapState, mapActions } from "vuex";

const eipUserSelector = () => import("@/components/selector/EipUserSelector.vue");
const eipRoleSelector = () => import("@/components/selector/EipRoleSelector.vue");
const eipOrgSelector = () => import("@/components/selector/EipOrgSelector.vue");
const eipPostSelector = () => import("@/components/selector/EipPostSelector.vue");
export default {
  components: { eipUserSelector,eipRoleSelector,eipOrgSelector,eipPostSelector},
  data() {
    return {
        dialogVisible:false,
        needSetArr:[],
        noNeedSetArr:[],
        right:'',
        permissionList:[],
        showNeedRight:true,
        curSelectItem:{}
    };
  },
  methods: {
    showDialog: function(param) {
      this.dialogVisible = true; 
      this.right = param.right || '';
      this.permissionList = param.permissionList || []; 
      let needSetting=[];
      //不需要配置
      let noNeedSetting=[];
      for(var i=0;i<this.permissionList.length;i++){
          var obj=this.permissionList[i];
          var type=obj.type;
          var objRight=this.getRight(this.right,type);
          if(objRight){
              objRight.title=obj.title;
              if(objRight.type=="everyone" || objRight.type=="none"){
                  objRight.checked=true;
                  this.showNeedRight=false;
                  noNeedSetting.push(objRight);
              }
              else{
                  needSetting.push(objRight);
              }
          }
          else{
              if(obj.type=="everyone" || obj.type=="none"){
                  obj.checked=false;
                  noNeedSetting.push(obj);
              }
              else{
                  obj.id="";
                  obj.name="";
                  needSetting.push(obj);
              }
          }
      }
      this.needSetArr=needSetting;
      this.noNeedSetArr=noNeedSetting;
    },
    getRight:function(aryRights,type){
      if(!this.right || this.right.size==0) return null;
      for(var i=0;i<aryRights.length;i++){
          var obj=aryRights[i];
          if(obj.type==type){
              return obj;
          }
      }
      return null;
    },
    handleClose: function() {
      let rtn=[];
      for(let i=0;i<this.noNeedSetArr.length;i++){
          let obj=this.noNeedSetArr[i];
          if(obj.checked){
              rtn.push(obj);
              this.$emit('filedAuthConfirm',rtn);
              this.dialogVisible = false;
              return rtn;
          }
      }
      let setting=this.needSetArr;
      for(let i=0;i<setting.length;i++){
          let obj=setting[i];
          //设置了值。
          if(obj.id){
              rtn.push(obj);
          }
      }
      this.$emit('onConfirm',rtn);
      this.dialogVisible = false;
    },
    dialog: function(item) {
      let type=item.type;
      if (type !='user') {
         this.$message.error("暂时只有用户选择器，只能选用户");
         return;
      }
      eval("this."+type + "Dialog(item);");
    },
    userDialog: function(item) {
       this.curSelectItem = item;
       let initData=[];
        if(item.id) {
            var aryId=item.id.split(",");
            var aryName=item.name.split(",");
            for(var i=0;i<aryId.length;i++){
                var obj={"id":aryId[i],"fullname":aryName[i]};
                initData.push(obj);
            }
        }
        let pageParam = {
            single:false, /*是否单选*/
            data:initData
        };
        this.$refs.eipUserDialog.showDialog();
    },
    orgDialog: function(item) {
       this.curSelectItem = item;
       let initData=[];
        if(item.id) {
            var aryId=item.id.split(",");
            var aryName=item.name.split(",");
            for(var i=0;i<aryId.length;i++){
                var obj={"id":aryId[i],"fullname":aryName[i]};
                initData.push(obj);
            }
        }
        let pageParam = {
            single:false, /*是否单选*/
            data:initData
        };
        this.$refs.eipUserDialog.showDialog();
    },
    dialogOnConfirm(selection) {
      if (!selection || selection.length == 0) {
        this.$message.error("请至少选择一个用户");
        return;
      }
      let names = [];
      let ids = [];
      for (let user of selection) {
        names.push(user.fullname);
        ids.push(user.id);
      }
      this.curSelectItem.id = ids.join(',');
      this.curSelectItem.name = names.join(',');
      this.$forceUpdate();
    },
    checkNoSetting: function(event,item) {
      var target=event.currentTarget;
      var checked=target.checked;
      item.checked=checked;

      var noNeedChecked=true;

      for(var i=0;i<this.noNeedSetArr.length;i++){
          var obj=this.noNeedSetArr[i];
          if(checked){
              if(obj!=item){
                  obj.checked=false;
              }
              noNeedChecked=false;
          }
      }
      this.showNeedRight=noNeedChecked;
      this.$forceUpdate();
    },
  }
};
</script>

<style  scoped>
div >>>.el-dialog__body{
  padding:10px ;
}

.table > thead > tr > th,.table > thead > th, .table > tbody > tr > th, .table > tfoot > tr > th, .table > thead > tr > td, .table > tbody > tr > td, .table > tfoot > tr > td {
    border-top: 1px solid #e7eaec;
    border-left: 1px solid #e7eaec;
    line-height: 1.42857;
    padding: 8px;
    vertical-align: middle;
}
.table{
  border-bottom: 1px solid #e7eaec;
  border-right: 1px solid #e7eaec;
}
.filed_body >>>.el-button{
  float: right;
}

</style>