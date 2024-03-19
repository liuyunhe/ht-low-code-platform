<template>
  <el-dialog
    title="数据明细"
    :visible.sync="showSubDetail"
    :close-on-click-modal="false"
  >
    <table cellspacing="0" cellpadding="0" border="0" class="form-table">
      <tbody>
        <tr v-for="(item,$index) in displayFields" :key="$index">
          <td class="recordInformation">{{item[0]['name']}}：</td>
          <td class="overstriking">{{item[0]['value']}}</td>
          <td v-if="item[1]" class="recordInformation">{{item[1]['name']}}：</td>
          <td v-if="item[1]" class="overstriking">{{item[1]['value']}}</td>
          <td v-if="!item[1]" class="recordInformation"></td>
          <td v-if="!item[1]" class="overstriking"></td>
        </tr>
      </tbody>
    </table>
    <span slot="footer" class="dialog-footer">
        <el-button @click="showSubDetail = false" size="medium">取 消</el-button>
      </span>
  </el-dialog>
</template>

<script>
export default {
  name: "sub-data-detail",
  components: {},
  data() {
    return {
        showSubDetail:false,
        displayFields:[],
    };
  },
  methods: {
    handleOpen(subData,formFields){
      this.displayFields = [];
      this.showSubDetail = true;
      if(formFields && formFields.length>0){
        let idx = 0;
        for (let i = 0; i < formFields.length; i++) {
          if(!this.displayFields[idx]){
            this.displayFields[idx] = [];
          }
          const field = this.getField(subData,formFields[i]);
          const sn = i%2;
          this.displayFields[idx][sn] = field;
          if(i!=0 && i%2==1){
            idx++;
          }
        }
      }
    },
    getField(data,field){
      let value = data[field.name];
      if(value=='undefined' || typeof(value) == 'undefined'){
        value = '';
      }
      return {name:field.desc,value:value};
    }
  }
};
</script>

<style lang="stylus" scoped>
.record-container {
  border-bottom: 1px solid #ebeef5;
  padding: 20px 0 10px;
}

.record-container > span {
  border-left: 3px solid #2761ff;
  font-weight: bold;
  font-size: 14px;
  padding-left: 10px;
  color: #666;
}

.record-content {
  padding: 20px 0;
}
.form-table {
  width: 100%;
  border-top: 1px solid #ebeef5;
  border-left: 1px solid #ebeef5;
}

.form-table th {
  text-align: right;
  color: #666;
}

.form-table th > span {
  color: #f00;
}

.form-table th, .form-table td {
  border-right: 1px solid #ebeef5;
  border-bottom: 1px solid #ebeef5;
  padding: 10px;
  min-width: 0;
  box-sizing: border-box;
  text-overflow: ellipsis;
  vertical-align: middle;
  position: relative;
}
.recordInformation{
    text-align: right;
    width: 15%;
}
.overstriking{
	font-weight: 700;
  
}
</style>