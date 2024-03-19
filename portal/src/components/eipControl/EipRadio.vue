<template>
  <div class="inputs">
    <ht-radio
      v-model="inputVal"
      :options="options"
      :option-layout="optionLayout"
      :validate="inputValidate"
      :name="inputName"
      :style="styles"
      :linkage="linkage"
      :permission="permission_sub"
      v-dynamic-options="{cache: true}"
    />
  </div>
</template>
<script>
import utils from '@/utils.js'
import hotentUtils from '@/hotent-ui-util.js'
import sub_pio_mixin from '@/sub-permission-mixin.js'
import deepmerge from 'deepmerge'
export default {
  name: 'eip-radio',
  props: [
    'validate',
    'value',
    'name',
    'permission',
    'rdlist',
    'linkage',
    'ganged',
    'styles',
    'optionLayout',
  ],
  mixins: [sub_pio_mixin], //混入方式引入表单组件中公共属性，处理子表、孙表行内联动（切面修改permission_sub）
  data() {
    return {
      options: [],
    }
  },
  computed: {
    inputVal: {
      get: function () {
        //根据传入的options的key数据类型进行判断
        if (this.options && this.options.length > 0) {
          if (typeof this.options[0].key == 'string') {
            if (
              !hotentUtils.isEmpty(this.value) &&
              typeof this.value == 'number'
            ) {
              return this.value.toString()
            }
          }
        }
        return this.value
      },
      set: function (val) {
        this.$emit('input', val)
      },
    },
    inputValidate: function () {
      var validateObj = this.$store.state.index.validate
      return utils.addRequiredOrNot(
        this.permission_sub,
        this.validate,
        validateObj,
        this
      )
    },
    inputName: function () {
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
    },
  },
  mounted() {
    const _me = this
    const exp = this.linkage
    if (
      exp &&
      exp.length > 0 &&
      (this.$parent.isView || this.$parent.$parent.$parent.isView)
    ) {
      const pInst = utils.getOnlineFormInstance(_me)
      _me.traces = {}

      exp.forEach((m) => {
        m.effect.forEach((m) => {
          const path = `permission.fields.${m.target}`
          const oldVal = utils.getValueByPath(pInst, path)
          _me.traces[path] = oldVal
        })

        _me.$watch(
          'inputVal',
          function (newVal, oldVal) {
            if (newVal !== oldVal && m.value == newVal) {
              m.effect.forEach((ef) => {
                _me.$store.dispatch('index/delValidate')
                const p = `permission.fields.${ef.target}`
                let val = _me.traces[p]
                if (m.value === newVal) {
                  val = ef.type
                }
                _me.$store.dispatch('index/linkageValidate', ef)
                utils.setValueByPath(pInst, p, val)
              })
            }
          },
          {immediate: true}
        )
      })
    }
    this.create()
  },
  created() {},
  methods: {
    //加载选项
    loadOption: function () {
      // 动态选项
      if (this.ganged && this.ganged.alias) {
        this.dynamicLoadOption()
      } else {
        // 静态选项
        this.options = this.rdlist ? JSON.parse(this.rdlist) : []
      }
    },
    // 动态加载选项
    dynamicLoadOption: function () {
      const params = this.prepareLoadParams(this.ganged.bind)
      this.$emit('dynamic-options:load', this.ganged.alias, params)
    },
    // 准备查询参数
    prepareLoadParams: function (condition) {
      let params = {}
      if (condition && !hotentUtils.isEmpty(condition)) {
        // 获取当前控件是否在子表某行中
        let {index} = hotentUtils.getSubScopeElAndIndex(this.$el)

        const pInst = utils.getOnlineFormInstance(this)
        Object.keys(condition).forEach((k) => {
          let val = null
          // 主表
          if (index == null) {
            val = utils.getValueByPath(pInst, condition[k])
          }
          // 子表
          else {
            val = utils.getValueByPath(pInst, condition[k], index)
          }
          if (!hotentUtils.isEmpty(val)) {
            params[k] = val
          }
        })
      }
      return params
    },
    // 动态加载选项返回值处理
    dynamicOptionResponse: function (alias, data) {
      if (
        this.ganged &&
        this.ganged.alias == alias &&
        this.ganged.valueBind &&
        this.ganged.labelBind
      ) {
        this.options = []
        if (data && data.constructor == Array && data.length > 0) {
          data.forEach((d) => {
            this.options.push({
              key: d[this.ganged.valueBind],
              value: d[this.ganged.labelBind],
            })
          })
        }
      } else if (
        this.ganged &&
        this.ganged.alias &&
        (!this.ganged.valueBind || !this.ganged.labelBind)
      ) {
        this.$message.error(
          `下拉框【${this.inputName}】配置了动态选项，但是没有正确的配置选项绑定关系。`
        )
      }
    },
    //创建，util.getOnlineFormInstance中会调用this.$el，不可在created()中调用
    create() {
      // 动态选项所绑定的关联查询返回了查询结果
      this.$on('dynamic-options:update', this.dynamicOptionResponse)
      this.$validator = this.$root.$validator
      this.loadOption()
    },
  },
}
</script>
<style lang="stylus" scoped></style>
