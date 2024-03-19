<template>
  <div
    @click.self="judgeType($route.fullPath)"
    class="smart-functions"
    :style="wrapperStyle"
  >
    <smart-exam :visible.sync="examDialogVisible"></smart-exam>
    <smart-compare :visible.sync="compareDialogVisible"></smart-compare>
    <smart-extract :visible.sync="extractDialogVisible"></smart-extract>
  </div>
</template>

<script>
import SmartExam from '@/components/eipControl/ou/SmartExam'
import SmartCompare from '@/components/eipControl/ou/SmartCompare'
import SmartExtract from '@/components/eipControl/ou/SmartExtract'
export default {
  name: 'smart',
  components: {
    SmartExam,
    SmartCompare,
    SmartExtract
  },
  data() {
    return {
      examDialogVisible: false,
      compareDialogVisible: false,
      extractDialogVisible: false,
      oppDialogVisible: false
    }
  },
  computed: {
    wrapperStyle() {
      let clientHeight = 0
      if (this.$parent && this.$parent.$el)
        clientHeight = this.$parent.$el.clientHeight
      return {
        height: clientHeight + 'px',
        width: '100%'
      }
    }
  },
  created() {
    this.judgeType(this.$route.fullPath)
  },
  methods: {
    judgeType(val) {
      const lastPath = val.split('/')[val.split('/').length - 1]
      if (true) {
        const arr = lastPath.split('_')
        const type = arr[arr.length - 1] || ''
        if (['compare', 'exam', 'oppExam', 'extract'].includes(type)) {
          switch (type) {
            case 'exam':
              this.examDialogVisible = true
              break
            case 'compare':
              this.compareDialogVisible = true
              break
            case 'extract':
              this.extractDialogVisible = true
              break
            case 'oppExam':
              this.oppDialogVisible = true
              break
            default:
              break
          }
        }
      }
    }
  },
  watch: {
    '$route.fullPath': function(val, oVal) {
      // console.log('route', val, oVal)
      this.judgeType(val)
      this.$forceUpdate()
    }
  }
}
</script>
