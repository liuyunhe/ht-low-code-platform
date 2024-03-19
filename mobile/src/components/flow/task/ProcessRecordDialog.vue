<template>
  <ht-sidebar-dialog
    :visible="dialogVisible"
    title="审批记录"
    :close-on-click-modal="false"
    append-to-body
    class="sidebar-dialog"
    width="100%"
    :before-close="cancel"
  >
    <ProcessRecord :instId="instId" />
  </ht-sidebar-dialog>
</template>
<script>
import ProcessRecord from "@/components/flow/task/ProcessRecord.vue";
export default {
  name: "processRecordDialog",
  components: { ProcessRecord },
  props: ["instId"],
  data() {
    return {
      dialogVisible: false
    };
  },
  methods: {
    showDialog() {
      this.dialogVisible = true;
    },
    cancel() {
      this.dialogVisible = false;
    },
  }
};
</script>
<style scoped>
.sidebar-dialog >>> .el-dialog__body{
    padding: 0;
}
</style>