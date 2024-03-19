<template>
  <div style="float: left" class="inputs" ref="inputs">
    <div
      style="float: left"
      v-if="
        permission_sub != 'n' &&
        type == 'number' &&
        bindPreAndSufFix &&
        bindPreAndSufFix.preFix &&
        bindPreAndSufFix.preFix.length > 4
      "
    >
      <el-tooltip
        class="item"
        effect="dark"
        :content="bindPreAndSufFix.preFix"
        placement="top-start"
      >
        <span>{{ bindPreAndSufFix.preFix.substring(0, 4) }}</span>
      </el-tooltip>
    </div>
    <span
      style="float: left"
      v-else-if="
        permission_sub != 'n' &&
        type == 'number' &&
        bindPreAndSufFix &&
        bindPreAndSufFix.preFix &&
        permission_sub != 'r'
      "
    >
      {{ bindPreAndSufFix.preFix }}
    </span>
    <ht-input
      :class="[
        type == 'number' && permission_sub == 'r'
          ? 'readonly_input'
          : 'ht_input',
      ]"
      :width="width"
      :style="style_width"
      size="small"
      :validate="inputValidate"
      :placeholder="placeholder ? placeholder : '请输入内容'"
      clearable
      v-model="inputVal"
      :model-expression="modelExpression"
      :name="inputName"
      :ref="atter"
      :type="type"
      :show-password="configAttributes && configAttributes.isPassword"
      :math-exp="mathExp"
      :date-calc-exp="dateCalcExp"
      :min="min"
      :max="max"
      :step="step"
      :step-strictly="stepStrictly"
      :precision="precision"
      :disabled="!isEdit"
      :permission="permission_sub"
      v-if="isShow && permission_sub != 'n'"
      @blur="numberBlur"
      @change="numberChange"
      :format="format"
      :readonly-format="readonlyFormat"
      :readonly="readonly"
    >
      <template
        v-if="
          bindPreAndSufFix && bindPreAndSufFix.preFix && permission_sub != 'r'
        "
        v-slot:prepend
      >
        <span>{{ bindPreAndSufFix.preFix }}</span>
      </template>
      <template
        v-if="
          ((bindPreAndSufFix && bindPreAndSufFix.sufSix) || company) &&
          permission_sub != 'r'
        "
        v-slot:append
      >
        <span v-if="company">{{ company }}</span>
        <span v-else>{{ bindPreAndSufFix.sufSix }}</span>
      </template>
    </ht-input>

    <div
      style="float: left"
      v-if="
        type == 'number' &&
        bindPreAndSufFix &&
        bindPreAndSufFix.sufSix &&
        bindPreAndSufFix.sufSix.length > 4
      "
    >
      <el-tooltip
        class="item"
        effect="dark"
        :content="bindPreAndSufFix.sufSix"
        placement="top-start"
      >
        <span>{{ bindPreAndSufFix.sufSix.substring(0, 4) }}</span>
      </el-tooltip>
    </div>
    <span
      v-else-if="
        type == 'number' &&
        bindPreAndSufFix &&
        bindPreAndSufFix.sufSix &&
        permission_sub != 'r'
      "
    >
      {{ bindPreAndSufFix.sufSix }}
    </span>
    <el-input
      v-if="!isShow"
      v-model="showViewe"
      @focus="numberFocus"
      size="small"
    ></el-input>
    <!-- <ht-input
      v-if="
        filterthousandBit && (permission_sub == 'w' || permission_sub == 'b')
      "
      v-model="thousandBit"
      :disabled="true"
      size="small"
    ></ht-input> -->
    <span
      v-if="company && permission_sub != 'n'"
      :class="[type == 'number' && permission_sub == 'r' ? '' : 'unit']"
    >
      {{ company }}
    </span>
  </div>
</template>
<script>
import utils from '@/utils.js'
import FormMath from '@/math.js'
import sub_pio_mixin from '@/sub-permission-mixin.js'
import {Message} from 'element-ui'

export default {
  name: 'eip-input',
  props: [
    'readonly',
    'validate',
    'value',
    'name',
    'modelExpression',
    'permission',
    'mathExp',
    'atter',
    'type',
    'dateCalcExp',
    'configAttributes',
    'placeholder',
    'precision',
    'stepStrictly',
    'min',
    'max',
    'filterthousandBit',
    'filtercurrency',
    'step',
    'bindPreAndSufFixjson',
    'company',
  ],
  mixins: [sub_pio_mixin], //混入方式引入表单组件中公共属性，处理子表、孙表行内联动（切面修改permission）
  data() {
    return {
      style_width: 'width:100%',
      width: '100%',
      unwatchAry: [],
      isEdit: true,
      showViewe: '',
      thousandBit: '0',
      format: '',
      isShow: true,
      pattern: /[1-9]\d*.\d*|0.\d*[1-9]\d*/,
      identityMap: {},
      newValidate: null,
      bindPreAndSufFix: null,
      numberPrefix: false,
    }
  },
  computed: {
    inputVal: {
      get() {
        return this.value
      },
      set(val) {
        this.$emit('input', val)
      },
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
    inputValidate: function () {
      if (this.newValidate) {
        return this.newValidate
      }
      return this.validate
    },
  },
  async mounted() {
    const _me = this
    this.permission_sub = _.cloneDeep(this.permission)
    const pInst = utils.getOnlineFormInstance(_me)
    this.checkIdentity()
    if (this.filtercurrency && !isNaN(this.inputVal) && this.inputVal) {
      this.format = FormMath.convertCurrency(this.inputVal)
    }
    if (this.filterthousandBit && !isNaN(this.inputVal) && this.inputVal) {
      this.format = this.format + '   ' + utils.thousandBit(this.inputVal)
    }
    if (this.bindPreAndSufFixjson) {
      this.bindPreAndSufFix = JSON.parse(this.bindPreAndSufFixjson)
    }
    this.numberPrefix = false
    if (
      (this.type == 'number' &&
        this.bindPreAndSufFix &&
        this.bindPreAndSufFix.preFix) ||
      this.bindPreAndSufFix.preFix
    ) {
      this.numberPrefix = true
    }
     //ccwgq 千分位逻辑修复
    if (this.filterthousandBit) {
      this.ouThousanBit()
    }
  },
  methods: {
    readonlyFormat(val) {
      //暂无表达式 如有表达式使用  eval(val) 并且控件配置项要把表达式构建传递到eipInput
      if (this.bindPreAndSufFix) {
        if (!this.bindPreAndSufFix.preFix) {
          this.bindPreAndSufFix.preFix = ''
        }
        if (!this.bindPreAndSufFix.sufSix) {
          this.bindPreAndSufFix.sufSix = ''
        }
        if (this.value) {
          return (
            this.bindPreAndSufFix.preFix +
            this.value +
            this.bindPreAndSufFix.sufSix
          )
        }
      } else if (this.company) {
        return this.value + this.company
      }
    },
    numberBlur() {
      if (this.filtercurrency && !isNaN(this.inputVal) && this.inputVal) {
        this.isShow = false
        this.showViewe = FormMath.convertCurrency(this.inputVal)
      }
      if (this.filterthousandBit && !isNaN(this.inputVal) && this.inputVal) {
        this.thousandBit = utils.thousandBit(this.inputVal)
      }
    },
    numberFocus() {
      if (this.filtercurrency && !isNaN(this.inputVal) && this.inputVal) {
        this.isShow = true
        this.showViewe = ''
      }
      if (this.filterthousandBit && !isNaN(this.inputVal) && this.inputVal) {
        this.thousandBit = '0'
      }
    },
    convertCurrency: _.debounce(function () {
      if (this.filtercurrency && !isNaN(this.inputVal) && this.inputVal) {
        this.isShow = false
        this.showViewe = FormMath.convertCurrency(this.inputVal)
      }
    }, 1000),
    convertThousanBit: _.debounce(function () {
      if (this.filterthousandBit && !isNaN(this.inputVal) && this.inputVal) {
        this.thousandBit = utils.thousandBit(this.inputVal)
      }
    }, 1000),
    numberChange() {
      if (this.filtercurrency && !isNaN(this.inputVal) && this.inputVal) {
        this.convertCurrency()
      }
      if (this.filterthousandBit && !isNaN(this.inputVal) && this.inputVal) {
        this.convertThousanBit()
      }
    },
    //数据报表
    async checkIdentity() {
      //检查流水号
      if (this.configAttributes) {
        this.isEdit = !this.configAttributes.isInputEdit
        //判断是否绑定流水号
        if (this.configAttributes.bindIdentityAlias) {
          this.isEdit = false
          if (this.value) return
          var alias = this.configAttributes.bindIdentityAlias
          const res = await this.$store.dispatch('menu/getNextIdByAlias', alias)
          if (res.state) {
            this.$emit('input', res.value)
            if (res.value) {
              var match = /(\{(.*)\}).*$/.exec(res.value)
              //判断流水号中是否表达式如{kjbt.csfjsc}
              if (match) {
                this.$emit('input', res.value.replace(match[1], ''))

                let paramDom = document.querySelector(
                  '[model-name="data.' + match[2] + '"]'
                )
                let _me = this
                if (paramDom && paramDom.__vue__) {
                  paramDom.__vue__.$watch(
                    'value',
                    function (newVal, oldVal) {
                      if (
                        _me.modelExpression == paramDom.__vue__.modelExpression
                      ) {
                        Message.error(
                          '流水号生成规则字段不能绑定流水号显示字段'
                        )
                        return
                      }
                      if (newVal != oldVal) {
                        _me.$emit('input', res.value.replace(match[1], newVal))
                      }
                    },
                    {immediate: true}
                  )
                }
              }
            }
          } else {
            //Message.error(res.message);
          }
        }
      }
    },
    //2022-06-29 ccwgq 修复千分位显示的问题
    ouThousanBit() {
      function format_with_mod(number) {
        let n = number
        let r = ''
        let temp = ''
        let mod = 0
        do {
          // 求模的值， 用于获取高三位，这里可能有小数
          mod = n % 1000
          // 值是不是大于1，是继续的条件
          n = n / 1000
          // 高三位
          temp = ~~mod
          // 1.填充: n > 1 循环未结束， 就要填充为比如 1 => 001
          // 不然temp = ~~mod的时候, 1 001， 就会变成 "11"
          // 2.拼接“,”
          r =
            (n >= 1 ? `${temp}`.padStart(3, '0') : temp) + (!!r ? ',' + r : '')
        } while (n >= 1)
        const strNumber = number + ''
        let index = strNumber.indexOf('.')
        // 拼接小数部分
        if (index >= 0) {
          r += strNumber.substring(index)
        }
        return r
      }
      var _this = this
      var fixedStr = Number(_this.inputVal).toFixed(2).split('.')
      fixedStr[0] = format_with_mod(fixedStr[0])
      fixedStr = fixedStr.join('.')
      if (['r'].includes(this.permission)) {
        //只读
        _this.$nextTick(() => {
          var $tail = $(_this.$el).find('.field-tail')
          if ($tail.length == 1 && typeof _this.inputVal == 'number') {
            $tail.find('span').text(`${fixedStr}`)
          }
        })
      } else if (['b', 'w'].includes(this.permission)) {
        _this.$nextTick(() => {
          var $input = $(this.$el).find('.el-input-number').find('input')
          if ($input.length == 1 && typeof _this.inputVal == 'number') {
            $input.val(`${fixedStr}`)
          }
        })
      }
    },
  },
  beforeDestroy() {},
  destroyed() {},
  created() {
    if (
      this.bindPreAndSufFixjson != '{}' &&
      (JSON.parse(this.bindPreAndSufFixjson).preFix != '' ||
        JSON.parse(this.bindPreAndSufFixjson).sufSix != '')
    ) {
      if (this.type == 'number') {
        this.style_width = 'width:57%'
      } else {
        this.style_width = 'width:87%'
      }
    }
    if (this.type == 'number' && this.permission_sub == 'r') {
      this.style_width = ''
    }
    this.$validator = this.$root.$validator
  },
  watch: {
    value(newValue, oldValue) {
      this.checkIdentity()
    },
    inputVal: {
      handler: function (newValue, oldValue) {
        if (this.filterthousandBit && !isNaN(newValue) && newValue) {
          this.ouThousanBit()
        }
      },
      immediate: true,
    },
  },
}
</script>
<style lang="stylus" scoped>
div[aria-invalid='true'] >>> .el-input__inner, div[aria-invalid='true'] >>> .el-input__inner:focus {
  border-color: #f56c6c;
}

.ht_input {
  float: left;
}

.readonly_input {
  float: none;
}
</style>
