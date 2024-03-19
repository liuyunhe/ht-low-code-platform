<script>
export default {
  name: 'AiExamIcon',
  props: {
    data: {
      Type: Object,
      required: true
    }
  },
  render(h) {
    const validMap = {
      qsysxxy: '缺失要素项',
      xdffx: '相对方风险',
      htwbxy: '合同文本校验'
    }
    const data = this.data
    const typeId = data.type_id
    if (![...Object.keys(validMap)].includes(typeId)) {
      console.error('the typeId must is one of values:')
      return h('span')
    }
    //绿色通过图标
    const greenIcon = h('i', {
      staticClass: 'el-icon-success',
      staticStyle: {
        color: 'green'
      }
    })
    //黄色提醒图标
    const yellowIcon = h('i', {
      staticClass: 'el-icon-warning',
      staticStyle: {
        color: 'orange'
      }
    })
    //红色警告图标
    const redIcon = h('i', {
      staticClass: 'el-icon-warning',
      staticStyle: {
        color: 'red'
      }
    })
    //根据判断决定返回哪个icon
    if (
      (['qsysxxy'].includes(typeId) &&
        data.isPass &&
        (!!data.value || data.location > 0)) ||
      (['xdffx', 'htwbxy'].includes(typeId) && data.isPass)
    ) {
      return greenIcon
    } else if (
      ['qsysxxy'].includes(typeId) &&
      !data.isPass &&
      data.location > 0
    ) {
      return yellowIcon
    } else if (
      (['qsysxxy'].includes(typeId) &&
        !data.isPass &&
        !!data.location &&
        data.location < 0) ||
      (['xdffx', 'htwbxy'].includes(typeId) && !data.isPass)
    ) {
      return redIcon
    } else {
      return h('span')
    }
  }
}
</script>
