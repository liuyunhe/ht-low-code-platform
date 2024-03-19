<template>
  <div class="inputs">
    <el-input
		  type="textarea"
		  v-if="this.textValue && !this.vEditor"
		  size="small"
		  :name="inputName"
		  :placeholder="placeholder?placeholder:'请输入内容'"
		  :autosize="{ minRows: 1, maxRows: 4}"
		  clearable
		  v-model="text"
		  :style="this.styles"
		  v-html='this.text'
		></el-input>
	<el-tooltip :placement="tooltipplacement||$tooltipplacement" :disabled="inputWriteable && !errors.has('custom-form.'+inputName)">
	  <div slot="content">{{errors.first('custom-form.'+inputName)}}</div>

		<el-input
		  type="textarea"
		  v-if="inputWriteable && !this.textValue && !this.vEditor"
		  size="small"
		  v-validate="inputValidate"
		  :name="inputName"
		  :placeholder="placeholder?placeholder:'请输入内容'"
		  v-model="inputVal"
		  :autosize="{ minRows: 1, maxRows: 4}"
		  :style="this.styles"
		  clearable
		></el-input>
		<script  v-if="inputWriteable && this.vEditor" ref="ueditor" :id="this.id" type="text/plain"></script>
	</el-tooltip>
    <span v-if="this.vText==undefined">
      <span v-if="!inputWriteable && !this.vEditor">{{inputVal}}</span>
      <div v-if="!inputWriteable && this.vEditor" v-html='this.inputVal'></div>
    </span>
	<span style="display:none;"  v-validate>
	  <slot name="labeldesc">{{inputName}}</slot>
	</span>
  </div>
</template>
<script>
import utils from "@/utils.js";
import { debuglog } from 'util';

export default {
  name: "ht-textarea",
  props: ["validate", "value", "name", "permission","styles" ,"textValue" ,"vEditor" ,"id",
  "vText","placeholder","tooltipplacement"],
  data() {
    return {
    };
  }, 
  computed: {
    inputVal: {
      get: function() {
        return this.value;
      },
      set: function(val) {
        this.$emit("input", val);
      }
    },
    text:{
      get: function() {
        if(!this.value){
          let text = this.textValue;
          let moment = require("moment");
          if(this.textValue){
            setTimeout(() => {
                if(text.indexOf("{发起时间:thisTime}") != -1){
                  text=text.replace(/\{发起时间:thisTime}/g,"发起时间:"+moment().format("YYYY-MM-DD")+" ");
                }
                if(text.indexOf("{发起人:loggedPerson}") != -1){
                    let currentUser= this.$store.state.user.currentUserDetail.user;
                    text=text.replace(/\{发起人:loggedPerson}/g,"发起人:"+currentUser.fullname+" ");
                }
                if(text.indexOf("{所在部门:userOrg}") != -1){
                  let currentOrg=this.$store.state.user.currentOrgDetail;
                  text=text.replace(/\{所在部门:userOrg}/g,"所在部门:"+currentOrg.name+" ");
                }
                this.$emit("input", text);
                return text;
            },700);
          }
        }else{
          return this.value;
        }
      },
      set: function(val) {
        this.$emit("input", val);
      }
    },
    inputWriteable: function() {
      return utils.getWriteable(this.permission);
    },
    inputValidate: function() {
      var validateObj= this.$store.state.index.validate;
      return utils.addRequiredOrNot(this.permission, this.validate ,validateObj ,this);
    },
    inputName: function() {
      let labeldesc = "";
      if(this.$slots && this.$slots.labeldesc && this.$slots.labeldesc[0].children && this.$slots.labeldesc[0].children[0].text){
        labeldesc = this.$slots.labeldesc[0].children[0].text;
        return this.name ? this.name : utils.getName()+ "-" +labeldesc;
      }else{
        return this.name ? this.name : utils.getName();
      }
    }
  },
  mounted() {
    //初始化UE
    const _this = this;
    if(utils.getWriteable(this.permission) && this.vEditor){
      this.editor = UE.delEditor(_this.id);
      this.vEditor.zIndex =10;
      //取消菜单栏固定窗口
      this.vEditor.autoFloatEnabled =false;
      this.editor = UE.getEditor(_this.id,this.vEditor);
      // 百度UEditor数据更新时，更新Model
      this.editor.addListener('contentChange', function() {
        _this.$emit("input",_this.editor.getContent());
      });
    }
    if(this.vEditor && this.editor){
      // 初始化设置内容。
      _this.editor.ready(function() {
					if(_this.value){
						_this.editor.setContent(_this.value);
					}
				});
    }
    
  },
  destoryed() {
    if(this.vEditor){
      this.editor.destory();
    }
  },
  created() {
     this.$validator = this.$root.$validator;
  }
};
</script>
<style lang="stylus" scoped>
div[aria-invalid='true'] >>> .el-textarea__inner, div[aria-invalid='true'] >>> .el-textarea__inner:focus {
  border-color: #f56c6c;
}
</style>