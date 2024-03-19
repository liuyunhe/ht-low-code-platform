<template>
  <ht-checkbox
    v-model="checkBoxVal"
    :options="messageType"
    permission="w"
    v-if="messageType"
  />
</template>

<script>
import { mapState, mapActions } from "vuex";
export default {
  name: "messageType",
  props: ["value"],
  data() {
    return {
        messageType:""
    };
  },
  computed: {
    checkBoxVal: {
      get: function() {
        return this.value;
      },
      set: function(val) {
        this.$emit("input", val);
      }
    },
  },
  methods: {
    handleClose(){
      this.imageDialogSub = false;
    } ,
  },
  created() {
    let param = { defId: this.defId, topDefKey: this.topDefKey || "" };
    let this_ = this;
    this.$store.dispatch("flow/getMessageType").then(function(data){
      let typeArr = [];
      if(data){
         for (const key in data) {
           typeArr.push({'key':key,'value':data[key]});
         }
      }
      this_.messageType = typeArr;
    })
  },
};
</script>

<style lang="stylus" scoped>
div.icon {
	border: 1px solid #868686;
	line-height: 10px;
	width: 10px;
	height: 10px;
	float: left;
	overflow: hidden;
	margin-top: 3px;
}

.target span {
	margin: 0 10px 0 3px;
	font-size: 12px;
	font-weight: bold;
	float: left;
	vertical-align: middle;
	white-space: nowrap;
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

.xh-star {
  color: red;
}

.opinion-content >>> table {
  border-spacing: 0;
  border-bottom: 1px solid #e7eaec;
  border-left: 1px solid #e7eaec;
  margin-bottom: 10px;
}

.opinion-content >>> table > tr > th , .opinion-content >>> table > tr > td {
  border-top: 1px solid #e7eaec;
  border-right: 1px solid #e7eaec;
  line-height: 1.42857;
  padding: 8px;
  vertical-align: middle;
}

.opinion-content >>> a{
  color: #337ab7;
  text-decoration: none;
  display: block;
}

.opinion-content > span{
  font-size: 14px;
  line-height: 18px;
  display: block;
  padding-bottom: 10px;
  font-weight: bold;
}

.opinion-content > div{
    max-height: 300px;
    overflow: auto;
}

.owner-div{
    padding-right:10px;
}
.opinion{
  max-width :250px;
  min-width :250px;
  word-wrap :break-word; 
}
.el-popover {
      position: absolute;
    background: #fff;
    min-width: 250px;
    border-radius: 4px;
    border: 1px solid #ebeef5;
    padding: 12px;
    z-index: 2000;
    color: #606266;
    line-height: 1.4;
    text-align: justify;
    font-size: 14px;
    -webkit-box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}


</style>