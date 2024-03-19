<template>
  <div class="bpm-btn-dialog">
    <el-dialog
      :visible.sync="isProcessRecordDialog"
      :close-on-click-modal="false"
      v-if="isProcessRecordDialog"
      width="71%"
    >
      <ProcessRecord
        :instId="instId"
        :taskId="taskId"
        :referOpinion="referOpinion"
        :nodeType="nodeType"
        :defId="defId"
        :nodeId="nodeId"
      />
    </el-dialog>
  </div>
</template>

<script>
import ProcessRecord from '@/components/flow/processRecord.vue'
export default {
  name: 'processRecordDialog',
  props: ['instId', 'taskId', 'referOpinion', 'nodeType', 'defId', 'nodeId'],
  components: {ProcessRecord},
  data() {
    return {
      isProcessRecordDialog: false,
    }
  },
  methods: {
    handleClose(done) {
      this.isProcessRecordDialog = true
    },
  },
}
</script>

<style lang="scss" scoped>
</style>