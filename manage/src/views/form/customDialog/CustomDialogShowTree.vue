<template>
    <el-dialog :title="title" width="1000px" :visible.sync="dialogVisible" :before-close="handleClose" :close-on-click-modal="false" top="6vh">
      <div style="height:500px;">
        <!-- 动态传入参数查询树 -->
        <table class="form-table" cellspacing="0" cellpadding="0" border="0">
          <tbody v-for="(item,$index) in customDialog.conditionfield"   :key="$index">
            <tr v-if="item.defaultType=='4'">
              <th width="130px">{{item.comment}}:</th>
              <td>
                <ht-input type="text" v-if="item.type!='date'" v-model="item.paramVal" style="width:100%;"  :placeholder="'请输入'+item.comment" autocomplete="off"></ht-input>
                <ht-date v-if="item.type=='date'" v-model="item.paramVal" style="width:100%;"  :placeholder="'请输入'+item.comment" format="yyyy-MM-dd"></ht-date>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="handleSave" >确 定</el-button>
          <el-button @click="handleClose">取 消</el-button>
      </div>
      <eip-tree-dialog ref="eipTreeDialog" :custom-dialog="customDialog"  @onConfirm="treeDialogOnConfirm" :ispreview="ispreview" :alias="alias" :map-param="mapParam"></eip-tree-dialog>
    </el-dialog>
</template>

<script>
const eipTreeDialog = () => import("@/views/form/customDialog/EipTreeDialog.vue");
export default {
  name: "custom-dialog-show-tree",
  components:{eipTreeDialog},
  props: {
    title: {
      type: String,
      required: true,
      default: "自定义对话框树形预览"
    },
    //自定义对话框的别名
    alias: {
      type: String,
      required: true
    },
    //自定义对话框的配置
    customDialog: {
      type: Object,
      required: true
    },
    ispreview: {
      type: Boolean,
      required: false,
      default: true
    },
  },
  data() {
    return {
      dialogVisible:false,//是否显示对话框
      mapParam:{},//动态传入的条件参数
    }
  },
  methods: {
    //显示对话框
    showDialog() {
      this.mapParam={};
      this.dialogVisible=true;
      for(let i=this.customDialog.conditionfield.length - 1; i >= 0;i--){
        //如果条件字段为data类型，则控制器的类型为日期类型
        if(this.customDialog.conditionfield[i].dbType=="date"){
          this.customDialog.conditionfield[i].type="date";
        }else{
          this.customDialog.conditionfield[i].type="text";
        }
      }
    },
    //确认对话框
    handleSave(){
      let mapParam = this.mapParam;
      for(let i=0;i<this.customDialog.conditionfield.length;i++){
        //得到输入的条件字段值
        let val = this.customDialog.conditionfield[i].paramVal;
        if (!val) {
          continue;
        }
        //得到条件字段KEY
        let key = this.customDialog.conditionfield[i].field;
        mapParam[key] = val;
      }
      setTimeout(()=>{
        this.$refs.eipTreeDialog.showDialog(); 
      });
    },
    //关闭对话框
    handleClose() {
      this.dialogVisible = false;
    },
    treeDialogOnConfirm(data){
       this.$emit('onConfirm',data);
    }
  },
}
</script>

<style lang="scss" scoped>
.el-main {
  padding-top: 0px;
}
</style>
