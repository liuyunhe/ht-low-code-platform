<template>
  <div class="inputs">
    <el-tooltip :placement="tooltipplacement||$tooltipplacement" :disabled="inputWriteable && !errors.has('custom-form.'+inputName)">
      <div slot="content">{{errors.first('custom-form.'+inputName)}}</div>
      <el-select
        v-if="inputWriteable"
        v-validate="inputValidate"
        :name="inputName"
        v-model="inputVal"
        size="small"
        clearable
        @clear="clear"
        ref="elSelect"
        placeholder="请选择"
        :style="this.styles"
		:filterable="filterable"
		:filter-method="filterMethod"
      >
        <el-option :value="inputVal">
          <el-tree
            ref="elTree"
            node-key="id"
            :data="selectlist"
            :highlight-current="true"
            :default-expand-all="true"
            :expand-on-click-node="false"
            :props="defaultProps"
            @node-click="handleNodeClick"
			:filter-node-method="filterNode"
          ></el-tree>
        </el-option>
      </el-select>
    </el-tooltip>
    <span v-if="!inputWriteable">{{inputVal}}</span>
	<span style="display:none;"  v-validate>
	  <slot name="labeldesc">{{inputName}}</slot>
	</span>
  </div>
</template>
<script>
import utils from "@/utils.js";

export default {
  name: "ht-dic",
  props: ["validate", "value", "name", "permission", "dickey", "bind","styles",
  "tooltipplacement","filterable"],
  data() {
    return {
      selectlist: [],
      defaultProps: {
        children: "children",
        label: "name"
      }
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
    inputWriteable: function() {
      return utils.getWriteable(this.permission);
    },
    inputValidate: function() {
      var validateObj = this.$store.state.index.validate;
      return utils.addRequiredOrNot(
        this.permission,
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
      this.$refs.elTree.setCurrentNode({});
    },
    handleNodeClick(data) {
      this.inputVal = data.name;
      this.$refs.elSelect.blur();
      setTimeout(() => {
        this.$validator.validate();
      });
    },
	filterNode(value, data) {
		if (!value) return true;
		return data.name.indexOf(value) !== -1;
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
  }
};
</script>
<style lang="scss" scoped>
@import "@/assets/css/element-variables.scss";
div[aria-invalid='true'] >>> .el-input__inner, div[aria-invalid='true'] >>> .el-input__inner:focus {
  border-color: #f56c6c;
}

.el-select-dropdown__item.hover, .el-select-dropdown__item:hover {
  background-color: #fff;
}

.el-select-dropdown__item {
  font-size: 14px;
  padding: 0 20px;
  position: relative;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: $--color-text-regular;
  height: 100%;
  line-height: 34px;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  cursor: pointer;
}

li.el-select-dropdown__item.selected {
  font-weight: normal;
}
</style>