<template>
  <div>
    <el-dialog
      width="60%"
      :title="'分支条件设置(' + curNode.nodeId + ')'"
      :visible="dialogVisible"
      :close-on-click-modal="false"
      top="8vh"
      :before-close="close"
      append-to-body
    >
      <el-container>
        <el-main style="padding: 10px; height: 500px">
          <table
            class="table table-bordered"
            style="
              border-spacing: 0;
              width: 100%;
              max-height: 400px;
              overflow: initial;
            "
          >
            <tr>
              <th style="width: 20%">条件表达式</th>
              <td>
                <div style="margin: 8px 0">
                  <el-button @click="showConditionBuild" size="small"
                    >条件脚本</el-button
                  >
                  <FlowVarSelector
                    :defId="curNode.defId"
                    @node-click="varTreeOnConfirm"
                  />
                </div>
                <div v-for="inNode in data.incomeNodes" :key="inNode.nodeId">
                  <el-link
                    v-if="inNode.type == 'SIGNTASK'"
                    @click="setEditorVal(inNode.nodeId, 1)"
                    type="primary"
                    >{{ inNode.name }}投票通过</el-link
                  >
                  <el-link
                    v-if="inNode.type == 'SIGNTASK'"
                    @click="setEditorVal(inNode.nodeId, 2)"
                    type="primary"
                    style="margin-left: 20px"
                    >{{ inNode.name }}投票不通过</el-link
                  >
                  <el-link
                    v-if="inNode.type != 'SIGNTASK'"
                    @click="setEditorVal(1, 1)"
                    type="primary"
                    >{{ inNode.name }}-通过</el-link
                  >
                  <el-link
                    v-if="inNode.type != 'SIGNTASK'"
                    @click="setEditorVal(1, 2)"
                    type="primary"
                    style="margin-left: 20px"
                    >{{ inNode.name }}-反对</el-link
                  >
                </div>
                <br />
                选择流程变量的时候，请注意光标位置。
              </td>
            </tr>
            <tr v-for="outNode in data.outcomeNodes" :key="outNode.nodeId">
              <th width="20%">
                <span>{{ outNode.name }}</span>
              </th>
              <td
                class="code-mirror-td"
                @click="setCurEditNodeId(outNode.nodeId)"
              >
                <codemirror
                  ref="mycode"
                  v-model="data.conditions[outNode.nodeId]"
                  :options="cmOptions2"
                  class="code"
                  style="width: 99%"
                ></codemirror>
              </td>
            </tr>
          </table>
        </el-main>
      </el-container>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleClose" size="medium"
          >确 定</el-button
        >
        <el-button @click="dialogVisible = false" size="medium"
          >取 消</el-button
        >
      </span>
    </el-dialog>
    <FlowConditionBuildDialog
      @onConfirm="conditionDialogConfirm"
      :defId="curNode.defId"
      ref="flowConditionBuildDialog"
    />
  </div>
</template>

<script>
import flow from '@/api/flow.js'
import req from '@/request.js'
import {mapState, mapActions} from 'vuex'

import FlowVarSelector from '@/components/flow/FlowVarSelector.vue'
import FlowConditionBuildDialog from '@/components/flow/FlowConditionBuildDialog.vue'

export default {
  components: {FlowVarSelector, FlowConditionBuildDialog},
  data() {
    return {
      dialogVisible: false,
      data: {},
      curEditNodeId: '',
      cmOptions2: {
        value: '',
        mode: 'groovy',
        readOnly: false,
        smartIndent: true,
        tabSize: 1,
        theme: 'base16-light',
        lineNumbers: true,
        line: true,
        lineWrapping: true,
      },
    }
  },
  computed: mapState({
    curNode: (state) => state.flow.defConfigData.curEditNode,
  }),
  methods: {
    showDialog: function (param) {
      if (param == 'close') {
        this.dialogVisible = false
        this.curEditNodeId = ''
        return
      }
      const this_ = this
      this_.$store.dispatch('flow/getCurSelectBranches').then(function (data) {
        if (data && data.outcomeNodes) {
          data.conditions = data.conditions || {}
          for (const node of data.outcomeNodes) {
            if (!data.conditions[node.nodeId]) {
              data.conditions[node.nodeId] = ''
            }
          }
        }
        this_.data = JSON.parse(JSON.stringify(data))
      })
      this.dialogVisible = true
    },
    setCurEditNodeId(nodeId) {
      this.curEditNodeId = nodeId
    },
    conditionDialogConfirm(data) {
      this.data.conditions[this.curEditNodeId] = data
    },
    varTreeOnConfirm(data) {
      this.data.conditions[this.curEditNodeId] =
        this.data.conditions[this.curEditNodeId] + data.pathValue
    },
    showConditionBuild() {
      if (!this.curEditNodeId) {
        this.$message.warning('请先选择要设置表达式的节点')
        return
      }
      this.$refs.flowConditionBuildDialog.showDialog()
    },
    setEditorVal(type, op) {
      var val = ''
      if (type == 1) {
        val =
          op == 1
            ? 'taskCmd.getActionName().equals("agree")'
            : 'taskCmd.getActionName().equals("oppose")'
      } else {
        val =
          op == 1
            ? 'signResult_' + type + '.equals("agree")'
            : 'signResult_' + type + '.equals("oppose")'
      }
      if (!this.data.conditions[this.curEditNodeId]) {
        this.data.conditions[this.curEditNodeId] = ''
      }
      this.data.conditions[this.curEditNodeId] = val
    },
    handleClose: function () {
      let param = {
        defId: this.curNode.defId,
        nodeId: this.curNode.nodeId,
        condition: JSON.stringify(this.data.conditions),
      }
      let this_ = this
      req
        .post('${bpmModel}/flow/node/v1/branchConditionSave', param)
        .then((response) => {
          let data = response.data
          if (data.state) {
            this_.$message.success('分支条件设置成功')
            let obj = {}
            obj['nodeBranches.' + this_.curNode.nodeId + '.conditions'] =
              this_.data.conditions
            this_.$store.dispatch('flow/updateConfig', obj)
            this_.dialogVisible = false
            this.$emit('onConfirm')
          } else {
            this_.$message.fail('分支条件设置失败!' + data.message)
          }
        })
    },
    //关闭分支条件配置对话框
    close() {
      this.dialogVisible = false
    },
    dialogOnConfirm(selection) {
      if (!selection || selection.length == 0) {
        this.$message.error('请至少选择一个用户')
        return
      }
      let names = []
      let ids = []
      for (let user of selection) {
        names.push(user.fullname)
        ids.push(user.id)
      }
      this.curSelectItem.id = ids.join(',')
      this.curSelectItem.name = names.join(',')
      this.$forceUpdate()
    },
  },
}
</script>

<style lang="scss"  scoped>
/deep/.el-dialog__body {
  padding: 10px;
}

.table > thead > tr > th,
.table > thead > th,
.table > tr > th,
.table > tfoot > tr > th,
.table > thead > tr > td,
.table > tr > td,
.table > tfoot > tr > td {
  border-top: 1px solid #e7eaec;
  border-left: 1px solid #e7eaec;
  line-height: 1.42857;
  padding: 8px;
  vertical-align: middle;
}
.table {
  border-bottom: 1px solid #e7eaec;
  border-right: 1px solid #e7eaec;
}
.filed_body >>> .el-button {
  float: right;
}

.code-mirror-td /deep/ .CodeMirror {
  height: 160px;
  .CodeMirror-scroll {
    width: 940px;
    overflow: auto !important;
    margin-right: 0;
  }
}
</style>
