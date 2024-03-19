<template>
  <div class="inputs">
      <el-select
        v-if="inputWriteable && permission_sub!='n'"
        v-validate="inputValidate"
        :name="inputName"
        v-model="valueDesc"
        size="small"
        popper-class="dic-select"
        clearable
        @clear="clear"
        ref="elSelect"
        placeholder="请选择"
        style="width:100%"
        :filterable="filterable"
        :filter-method="filterMethod"
      >
        <el-option v-if="selectlist && selectlist.length>0" :value="inputVal">
          <el-scrollbar style="height:100%">
            <el-tree
              ref="elTree"
              node-key="key"
              style="height:245px"
              :data="selectlist"
              :highlight-current="true"
              :default-expand-all="true"
              :expand-on-click-node="false"
              :props="defaultProps"
              @node-click="handleNodeClick"
              :filter-node-method="filterNode"
            ></el-tree>
           </el-scrollbar>
        </el-option>
      </el-select>
    <span v-if="!inputWriteable && permission_sub!='n'">{{valueDesc}}</span>
  </div>
</template>
<script>
import utils from "@/hotent-ui-util.js";
import sub_pio_mixin from "@/sub-permission-mixin.js";
export default {
  name: "eip-dic",
  props: ["validate", "value", "name", "permission", "dickey", "bind","styles",
  "filterable"],
  mixins: [sub_pio_mixin],//混入方式引入表单组件中公共属性，处理子表、孙表行内联动（切面修改permission_sub）
  data() {
    return {
      selectlist: [],
      defaultProps: {
        children: "children",
        label: "name"
      },
      valueDesc:'',
      tagFormatValue: [],
    };
  },
  computed: {
    inputVal: {
      get: function() {
        if(utils.isEmpty(this.value)){
          return "";
        }
        return this.value;
      },
      set: function(val) {
        this.$emit("input", val);
      }
    },
    inputWriteable: function() {
      return utils.getWriteable(this.permission_sub);
    },
    inputValidate: function() {
      var validateObj = this.$store.state.index.validate;
      return utils.addRequiredOrNot(
        this.permission_sub,
        this.validate,
        validateObj,
        this
      );
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
  methods: {
    clear() {
      this.filterMethod('');
      // this.$refs.elTree.setCurrentNode({});
    },
    handleNodeClick(data) {
      this.inputVal = data.key;
      this.valueDesc = data.name;
      this.$refs.elSelect.blur();
      setTimeout(() => {
        this.$validator.validate();
      });
    },
	filterNode(value, data) {
		if (!value) return true;
		return data.name.indexOf(value) !== -1;
  },
  findDesc(list) {
		if (list && list.length >0) {
      list.forEach(l => {
        if (l.key == this.value ) {
           this.valueDesc = l.name;
           return ;
        }
        if (l.children) {
          this.findDesc(l.children);
        }
      });
    }
	},
	filterMethod(query) {
		this.$refs.elTree.filter(query);
	}
  },
  mounted() {
    if (this.dickey) {
      this.$store
        .dispatch("menu/getByTypeKeyForComBo", this.dickey)
        .then(res => {
          this.selectlist = res;
          if ( this.value !== null && this.value !== undefined ) {
              this.findDesc(res);
          }
        });
    }

    const _me = this;
    const exp = this.bind;
    if (exp) {
      const pInst = utils.getOnlineFormInstance(_me);

      _me.$watch("inputVal", function(newVal, oldVal) {
        if (newVal !== oldVal) {
          utils.setValueByPath(pInst, exp, newVal);
        }
      });
    }
  },
  created() {
    this.$validator = this.$root.$validator;
  },
  //ccwgq  对话框回填时标签显示不正确，原因是缺少监听
  watch:{
    value:function(val){
      this.findDesc(this.selectlist)
    }
  }
};
</script>
<style lang="stylus" scoped>
div[aria-invalid='true'] >>> .el-input__inner, div[aria-invalid='true'] >>> .el-input__inner:focus {
  border-color: #f56c6c;
}

.el-select-dropdown__item.hover, .el-select-dropdown__item:hover {
  padding-right: 0;
  padding-left: 0;
  background-color: #fff;
}

.el-select-dropdown__item {
  font-size: 14px;
  padding: 0 20px;
  position: relative;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #606266;
  height: 100%;
  line-height: 34px;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  cursor: pointer;
}

li.el-select-dropdown__item.selected {
  font-weight: normal;
  padding-right: 0;
  padding-left: 0;
}

</style>
