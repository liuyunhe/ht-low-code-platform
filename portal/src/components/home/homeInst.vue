<template>
<!--  <div>
    <el-table :data="data.rows" align="left">
    <el-table-column type="index" align="left" label="序号"></el-table-column>
   
    <el-table-column label="事项名称" align="left"  show-overflow-tooltip>
        <template slot-scope="scope" align="left" width="90%">
            <span class="todo-subject" @click="checkTheInstance(scope.row)" v-html="scope.row.subject"></span>
        </template>
    </el-table-column>
    &lt;!&ndash;<el-table-column prop="creator" label="创建人" width="100" show-overflow-tooltip align="left"></el-table-column>
	<el-table-column prop="createTime" label="创建时间" width="150" show-overflow-tooltip align="left"></el-table-column>&ndash;&gt;
    
</el-table>
  </div>-->
    <div>
        <div v-for="(item,index) in data.rows" style="height: 3%">
            <div style="display: inline-block;width: 98%">
                <span style="font-size:14px;font-family:Microsoft YaHei;font-weight:400;color:#171616;line-height:30px;"><el-link :underline="false" style="font-size:14px;font-family:Microsoft YaHei;font-weight:normal;color:#171616;line-height:30px;">
                    <span class="iconfont icon-read1" style="width: 20px;float:left;margin-top: 8px;"></span>
                    <!--<span class="iconfont icon-read1" style="width: 20px;float:left;margin-top: 20px;" v-if="index!=0"></span>-->
                    <span v-html="item.subject" class="subject-item" @click="showDetail(item.id)"></span>
                </el-link></span>
            </div>
            <div style="margin-top:2px;height:1px;background:rgba(235,238,245,1);"></div>
        </div>
    </div>
</template>
<script>
import req from "@/request.js";

export default {
  props: {
    data: {
      default: {}
    }
  },
  data() {
    return {
     
    };
  },
  components: {

  },
  created() {
    
  },
  methods: {
    checkTheInstance:function(row){
      this.$router.push('/inst/'+row.id) ;
    },
    showDetail(id){
        let token = this.$store.state.login.currentUser.token;
        let url = window.context.front + "/doneReadOnly/"+id + "?token="+token;
        window.open(url,"_self","width="+(window.screen.availWidth-10)+",height="+(window.screen.availHeight-10));
    }
  }
};
</script>
<style lang="stylus" scoped>
    .el-table__row >>> .el-tooltip{
        width:90%
    }
    .subject-item >>> p{
        margin-top:0px;
    }
</style>