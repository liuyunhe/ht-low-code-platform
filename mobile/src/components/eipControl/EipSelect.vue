<template>
  <div class="inputs">
    <ht-select
      style="width:100%;"
      :validate="validate"
      :options="options"
      :name="inputName"
      v-model="inputVal"
      size="small"
      clearable
      :placeholder="placeholder"
      :filterable="filterable"
      :allow-create="allowCreate"
      reserve-keyword
      :multiple="multiple"
      :linkage="linkage"
      ref="selected"
      @focus="selectFocus"
      @blur="selectBlur"
      :permission="permission_sub"
      v-dynamic-options="{cache: true}"
      v-related-query="{cache: true}"
    >
      <template>
        <!-- ccwgq: to avoid duplicate keys!! -->
        <el-option
          v-for="(item, index) in this.options"
          :key="item.key + index"
          :label="item.value"
          :value="item.key"
        ></el-option>
      </template>
    </ht-select>
  </div>
</template>
<script>
import utils from '@/utils.js'
import hotentUtils from '@/hotent-ui-util.js'
import sub_pio_mixin from '@/sub-permission-mixin.js'

export default {
  name: 'eip-select',
  props: [
    'validate',
    'value',
    'name',
    'permission',
    'multiple',
    'selectlist',
    'linkage',
    'ganged',
    'filterable',
    'allowCreate',
    'placeholder',
    'customQuery',
    'relatedQuery'
  ],
  mixins: [sub_pio_mixin], //混入方式引入表单组件中公共属性，处理子表、孙表行内联动（切面修改permission_sub）
  data() {
    return {
      options: [],
      newValidate: null
    }
  },
  computed: {
    inputVal: {
      get: function() {
        if (this.value || this.value === 0) {
          this.relatedQueryLoad() // 触发绑定的关联查询
          return this.value + ''
        }
        return this.value
      },
      set: function(val) {
        this.$emit('input', val)
        if (val != '') {
          this.relatedQueryLoad() // 触发绑定的关联查询
        }
      }
    },
    inputWriteable: function() {
      return utils.getWriteable(this.permission_sub)
    },
    inputValidate: function() {
      if (this.newValidate) {
        return this.newValidate
      }
      var validateObj = this.$store.state.index.validate
      return utils.addRequiredOrNot(
        this.permission_sub,
        this.validate,
        validateObj,
        this
      )
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
  mounted() {
    this.loadOption(true)
  },
  created() {
    // 动态选项所绑定的关联查询返回了查询结果
    this.$on('dynamic-options:update', this.dynamicOptionResponse)
    this.$validator = this.$root.$validator
  },
  methods: {
    selectBlur: function() {
      this.$emit('blur')
    },
    selectFocus: function() {
      this.loadOption()
      this.$emit('focus')
    },
    //加载选项
    loadOption: function(isMounted) {
      // 动态选项
      if (this.ganged && this.ganged.alias) {
        // 如果是初始化，且该动态选项配置了初始化不加载数据，则跳过动态选项的加载
        if (isMounted && this.ganged.noInit && this.ganged.noInit == 'true') {
          return
        }
        this.dynamicLoadOption()
      } else {
        // 静态选项
        this.options = [...this.selectlist] || []
      }
    },
    // 准备查询参数
    prepareLoadParams: function(condition) {
      let params = {}
      if (condition && !hotentUtils.isEmpty(condition)) {
        // 获取当前控件是否在子表某行中
        let {index} = hotentUtils.getSubScopeElAndIndex(this.$el)
        if (this.$el) {
          const pInst = utils.getOnlineFormInstance(this)
          Object.keys(condition).forEach(k => {
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
      }
      return params
    },
    // 动态加载选项
    dynamicLoadOption: function() {
      const params = this.prepareLoadParams(this.ganged.bind)
      this.$emit('dynamic-options:load', this.ganged.alias, params)
    },
    // 动态加载选项返回值处理
    dynamicOptionResponse: function(alias, data) {
      if (
        this.ganged &&
        this.ganged.alias == alias &&
        this.ganged.valueBind &&
        this.ganged.labelBind
      ) {
        this.options = []
        if (data && data.constructor == Array && data.length > 0) {
          data.forEach(d => {
            this.options.push({
              key: d[this.ganged.valueBind] + '',
              value: d[this.ganged.labelBind] + ''
            })
          })
        }
      } else if (
        this.ganged &&
        this.ganged.alias &&
        (!this.ganged.valueBind || !this.ganged.labelBind)
      ) {
        let name = this.inputName
        this.$message.error(
          `下拉框【${
            name.split('-')[1]
          }】配置了动态选项，但是没有正确的配置选项绑定关系。`
        )
      }
    },
    // 触发绑定的关联查询
    relatedQueryLoad: function() {
      if (
        this.relatedQuery &&
        this.relatedQuery.constructor == Array &&
        this.relatedQuery.length > 0
      ) {
        // 遍历所有的关联查询，逐个触发
        this.relatedQuery.forEach(q => {
          const params = this.prepareLoadParams(q.condition)
          this.$emit('related-query:load', q.alias, params, q.result)
        })
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
