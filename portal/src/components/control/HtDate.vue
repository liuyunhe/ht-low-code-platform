<template>
  <div class="inputs" :ref="refId">
    <el-tooltip :placement="tooltipplacement||$tooltipplacement" :disabled="inputWriteable && !errors.has('custom-form.'+inputName)">
      <div slot="content">{{errors.first('custom-form.'+inputName)}}</div>
      <span v-if="format!='HH:mm:ss'">
      <el-date-picker
        v-if="inputWriteable"
        size="small"
        v-validate="inputValidate"
        :name="inputName"
        v-model="inputVal"
        :type="type"
        :format="inputFormat||format"
        :value-format="format"
        placeholder="选择日期时间"
        :style="this.styles"
        :readonly="!inputWriteable"
      />
      </span>
      <span v-if="format=='HH:mm:ss'">
          <el-time-picker
            v-if="inputWriteable"
            v-validate="inputValidate"
            :name="inputName"
            v-model="inputVal"
            :style="this.styles"
            :value-format="format"
            :readonly="!inputWriteable"
            size="small"
            :picker-options="{selectableRange: '00:00:00 - 23:59:59'}"
            placeholder="选择日期时间">
          </el-time-picker>
      </span>
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
  name: "ht-date",
  props: [
    "validate",
    "value",
    "name",
    "permission",
    "showDate",
    "day",
    "format",
    "inputFormat",
    "refId",
    "styles",
    "tooltipplacement"
  ],
  data() {
    return {
      type: "datetime",
      compareType: "daterangestart,daterangeend,datemorethan,datelessthan,"
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
    dateTargetId: function() {
      var validateObj = this.$store.state.index.validate;
      let validate = utils.addRequiredOrNot(
        this.permission,
        this.validate,
        validateObj,
        this
      );
      if (validate) {
        for (let key in validate) {
          if (this.compareType.indexOf(key) > -1) {
            return validate[key];
          }
        }
      }
      return "";
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
    let _this = this;
    //如果该字段的校验受另一个字段影响。则监听另一个字段控件发布的值改变事件
    if (this.dateTargetId) {
      this.$root.$on(this.dateTargetId, function(value) {
        // 校验该字段
        this.$validator.validate(
          "custom-form." + _this.inputName,
          _this.inputVal
        );
      });
    }
  },
  created() {
    if (this.inputWriteable) {
      if (this.value == "") {
        let moment = require("moment");
        if (this.showDate) {
          //是否显示当前日期
          if (this.format == "yyyy-MM-dd") {
            this.type = "date";
            this.inputVal = moment().format("YYYY-MM-DD");
          } else if (this.format == "yyyy-MM-dd HH:mm:ss") {
            this.inputVal = moment().format("YYYY-MM-DD HH:mm:ss");
          }else if (this.format == "HH:mm:ss") {
            this.inputVal = moment().format("HH:mm:ss");
          }
          //是否有与当前日期相差的日期天数
          if (this.day) {
            if (this.format == "yyyy-MM-dd") {
              this.inputVal = moment().add(this.day, "days").format("YYYY-MM-DD HH:mm:ss");
            } else if (this.format == "yyyy-MM-dd HH:mm:ss") {
              this.inputVal = moment().add(this.day, "days").format("YYYY-MM-DD");
            }
          }
        } else {
          //是否显示当前日期
          if (this.format == "yyyy-MM-dd") {
            this.type = "date";
          }
        }
      } else {
        this.inputVal = this.value;
        if (this.showDate) {
          //是否显示当前日期
          if (this.format == "yyyy-MM-dd") {
            this.type = "date";
          }
        }
      }
    }
    this.$validator = this.$root.$validator;
  },
  methods: {
    pickChange() {
      //如果该字段有name属性。则发布值改变事件
      if (this.name) {
        this.$root.$emit(this.name, this.inputVal);
      }
    }
  }
};
</script>
<style lang="stylus" scoped>
div[aria-invalid='true'] >>> .el-input__inner, div[aria-invalid='true'] >>> .el-input__inner:focus {
  border-color: #f56c6c;
}
</style>