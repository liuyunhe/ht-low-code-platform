<template>
  <div>
    <span v-if="bindPreAndSufFix" style="float: left">{{
      bindPreAndSufFix.preFix
    }}</span>
    <div
      :style="
        bindPreAndSufFix && (bindPreAndSufFix.preFix || bindPreAndSufFix.sufSix)
          ? 'width: 70%; float: left;'
          : ''
      "
    >
      <ht-date
        v-model="inputVal"
        :validate="validate"
        :name="inputName"
        :showDate="showDate"
        :day="day"
        :currentDate="currentDate"
        :format="inputFormat"
        :model-expression="modelExpression"
        :value-format="format"
        :permission="permission_sub"
        v-if="selectType == 'date'"
      />
      <ht-time-select
        v-model="inputVal"
        :permission="permission_sub"
        :model-expression="modelExpression"
        :validate="validate"
        v-if="selectType == 'select'"
      />
      <ht-time-picker
        v-model="inputVal"
        :permission="permission_sub"
        :model-expression="modelExpression"
        :validate="validate"
        v-if="selectType == 'picker'"
      />
    </div>
    <span v-if="bindPreAndSufFix">{{ bindPreAndSufFix.sufSix }}</span>
  </div>
</template>
<script>
import utils from '@/utils.js'
import sub_pio_mixin from '@/sub-permission-mixin.js'
import req from '@/request.js'
export default {
  name: 'eip-date',
  props: [
    'validate',
    'name',
    'value',
    'permission',
    'selectType',
    'showDate',
    'day',
    'inputFormat',
    'modelExpression',
    'format',
    'bindPreAndSufFixjson',
    'isServerDate'
  ],
  mixins: [sub_pio_mixin], //混入方式引入表单组件中公共属性，处理子表、孙表行内联动（切面修改permission_sub）
  data() {
    return {
      currentDate: null, //当前时间
      type: 'datetime',
      compareType: 'daterangestart,daterangeend,datemorethan,datelessthan,',
      bindPreAndSufFix: null
    }
  },
  computed: {
    inputVal: {
      get: function() {
        return this.value
      },
      set: function(val) {
        this.$emit('input', val)
      }
    },
    inputName: function() {
      let labeldesc = ''
      if (
        this.$slots &&
        this.$slots.labeldesc &&
        this.$slots.labeldesc[0].children &&
        this.$slots.labeldesc[0].children[0].text
      ) {
        labeldesc = this.$slots.labeldesc[0].children[0].text
        return this.name ? this.name : utils.getName() + '-' + labeldesc
      } else {
        return this.name ? this.name : utils.getName()
      }
    }
  },
  created() {
    //判断是否获取服务器的当前时间
    if (this.isServerDate) {
      const this_ = this
      req
        .get(
          window.context.uc +
            '/base/tools/v1/getCurrentDate?valFormat=' +
            this.inputFormat
        )
        .then(res => {
          if (res.data.state) {
            this_.currentDate = res.data.value
          }
        })
    }
  },
  mounted() {
    if (this.bindPreAndSufFixjson) {
      this.bindPreAndSufFix = JSON.parse(this.bindPreAndSufFixjson)
      if (
        this.bindPreAndSufFix.preFix &&
        this.bindPreAndSufFix.preFix.length > 3
      ) {
        this.bindPreAndSufFix.preFix = this.bindPreAndSufFix.preFix.substring(
          0,
          3
        )
      }
      if (
        this.bindPreAndSufFix.sufSix &&
        this.bindPreAndSufFix.sufSix.length > 3
      ) {
        this.bindPreAndSufFix.sufSix = this.bindPreAndSufFix.sufSix.substring(
          0,
          3
        )
      }
    }
  }
}
</script>
<style lang="stylus" scoped>
div[aria-invalid='true'] >>> .el-input__inner, div[aria-invalid='true'] >>> .el-input__inner:focus {
  border-color: #f56c6c;
}
</style>
