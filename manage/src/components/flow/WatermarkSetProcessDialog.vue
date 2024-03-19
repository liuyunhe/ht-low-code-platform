<template>
  <ht-sidebar-dialog
      width="28%"
      :title="title"
      :visible.sync="dialogVisible"
      :before-close="handleClose">
    <ht-table
        @load="loadData"
        :data="data"
        :pageResult="pageResult"
        ref="htTable"
        :show-export="false"
        :show-custom-column="false"
        highlight-current-row
        quick-search-props="procDefName"
        v-if="dialogVisible">
      <template v-slot:toolbar>
        <el-button size="small" @click="edit()" icon="el-icon-plus">添加</el-button>
        <ht-delete-button
            :url="deleteUrl"
            :htTable="$refs.htTable"
            pk="id"
            parameter="ids">删除
        </ht-delete-button>
      </template>
      <ht-table-column type="index" width="50" align="center" label="序号"/>
      <ht-table-column prop="procDefName" align="center" label="名称"/>
    </ht-table>
    <eip-flow-dialog
        ref="eipFlowDialog"
        name="eipFlowDialog"
        append-to-body
        @onConfirm="dialogOnConfirm"/>
  </ht-sidebar-dialog>
</template>

<script>
import flow from "@/api/flow.js";
import eipFlowDialog from "@/components/dialog/EipFlowDialog.vue";

export default {
  name: "watermark-set-process-dialog",
  props: {
    id: String
  },
  components: {
    eipFlowDialog
  },
  data() {
    return {
      data: [],
      pageResult: {
        page: 1,
        pageSize: 20,
        total: 0
      },
      dialogVisible: false,
      title: "设置流程",
      deleteUrl: window.context.bpmModel + "/bpmModel/bpmWatermarkProcess/v1/remove",
      defNameJson: [],
    }
  },
  methods: {
    loadData(param, cb) {
      if (!param.querys) {
        param.querys = []
      }
      if (this.id) {
        param.querys.push({
          property: "watermark_id_",
          value: this.id,
          group: "filter",
          operation: "EQUAL",
          relation: "AND"
        });
      }
      flow.getWatermarkProcessList(param).then(data => {
        this.data = data.rows;
        this.pageResult = {
          page: data.page,
          pageSize: data.pageSize,
          total: data.total
        }
      }).finally(() => {
        cb && cb();
      });
    },
    showDialog() {
      this.dialogVisible = true;
    },
    handleClose() {
      this.dialogVisible = false
    },
    edit() {
      this.$refs.eipFlowDialog.showDialog();
    },
    dialogOnConfirm(data) {
      let param = data
          .map(item => {
            return {
              procDefId: item.defId,
              procDefKey: item.defKey,
              procDefName: item.name,
              watermarkId: this.id
            }
          });
      flow.isExistWatermarkProcess(param).then(data => {
        if (data.state) {
          if (data.message === "设置成功") {
            flow.saveWatermarkProcess(param, 1).then(data => {
              if (data.state) {
                this.$message.success("添加成功");
                this.$refs.htTable.load();
              }
            })
          } else {
            this.$confirm(data.message + '，是否保存至此？')
                .then(() => {
                  flow.saveWatermarkProcess(param, 1).then(data => {
                    if (data.state) {
                      this.$message.success("添加成功");
                      this.$refs.htTable.load();
                    }
                  })
                })
                .catch(() => {
                  flow.saveWatermarkProcess(param, 0).then(data => {
                    if (data.state) {
                      this.$message.success("添加成功");
                      this.$refs.htTable.load();
                    }
                  })
                });
          }
        }
      })
    }
  }
}
</script>

<style lang="stylus">

</style>
