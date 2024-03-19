<template>
  <div v-if="visible">
    <el-dialog
      width="70%"
      title="表单任务权限脚本设置"
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      append-to-body
    >
      <div style="width:100%;height: 600px;">
        <div style="float: left;width:35%;height:100%;overflow: auto;">
          <div class="div_list">权限列表</div>
          <div style="margin-bottom: 10px;">
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-plus"
              @click="addData"
              >新增</el-button
            >
            <el-button
              type="success"
              size="mini"
              icon="el-icon-check"
              @click="saveData"
              >保存</el-button
            >
          </div>
          <el-table
            :data="formTaskData"
            border
            ref="taskAuthTable"
            @row-click="orgRowClick"
          >
            <el-table-column
              type="index"
              width="60"
              label="序号"
              align="center"
            ></el-table-column>
            <el-table-column label="任务" prop="task">
              <template v-slot="{row}">
                <div>
                  {{ getTaskName(row.task) }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="90">
              <template v-slot="{$index}">
                <el-button
                  type="danger"
                  size="mini"
                  icon="el-icon-delete"
                  @click="deleteData(formTaskData, $index)"
                ></el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div
          style="width:63%;float: left;margin-left: 10px;height:100%;overflow: auto;"
        >
          <div class="div_list">权限脚本编辑</div>
          <table
            v-if="showCodeEdit"
            class="form-table"
            cellspacing="0"
            cellpadding="0"
            border="0"
          >
            <tbody>
              <tr>
                <th width="130px" class="is-required">任务名称:</th>
                <td>
                  <ht-select
                    v-if="showSelect"
                    validate="required"
                    v-model="task.task"
                    :options="filterOptions"
                    :props="{key: 'taskName', value: 'taskKey'}"
                    filterable
                    clearable
                    @change="handleSelectChange"
                  >
                    <template v-slot="{options}">
                      <el-option
                        v-for="option in options"
                        :key="option.taskKey"
                        :label="option.taskName"
                        :value="option.taskKey"
                      ></el-option>
                    </template>
                  </ht-select>
                  <div v-else>{{ getTaskName(task.task) }}</div>
                </td>
              </tr>
              <tr>
                <th width="130px">
                  <el-tooltip
                    content="javascript脚本,参数:_this,permission,对权限做一些调整"
                    placement="left-start"
                  >
                    <div><i class="el-icon-warning">js脚本:</i></div>
                  </el-tooltip>
                </th>
                <td>
                  <div>
                    <codemirror
                      v-if="showCodeEdit"
                      ref="myCode"
                      v-model="task.diyJs"
                      :options="cmOptions"
                      class="code"
                      :style="codemirrorStyle"
                    ></codemirror>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
const taskStatus = [
  {taskKey: 'COMMUS', taskName: '沟通'},
  {taskKey: 'USERSIGN', taskName: '会签'}
]
import form from '@/api/form.js'
import {Base64} from 'js-base64'
import {cloneDeep} from 'lodash'
export default {
  name: 'FormTaskAuthDialog',
  props: ['visible', 'authData', 'formId'],
  data() {
    return {
      taskStatusConfig: taskStatus,
      formTaskData: [
        {
          task: '',
          diyJs: ''
        }
      ],
      showCodeEdit: false,
      showSelect: false,
      task: {},
      cmOptions: {
        value: '',
        mode: 'javascript',
        readOnly: false,
        smartIndent: true,
        tabSize: 1,
        theme: 'base16-light',
        lineNumbers: true,
        line: true
      },
      codemirrorStyle:
        'width:' + ((document.body.clientWidth * 0.7 - 40) * 0.63 - 180) + 'px'
    }
  },
  computed: {
    filterOptions() {
      const selectTaskList = []
      this.formTaskData.forEach(item => {
        if (item.task) {
          selectTaskList.push(item.task)
        }
      })
      const list = this.taskStatusConfig.filter(item => {
        return !selectTaskList.includes(item.taskKey)
      })
      return list
    },
    dialogVisible: {
      set(val) {
        if (!val) {
          this.showCodeEdit = false
        }
        this.$emit('update:visible', val)
      },
      get() {
        return this.visible
      }
    }
  },
  watch: {
    visible: function(val) {
      if (val) {
        this.initData()
      }
    }
  },
  methods: {
    getTaskName(key) {
      const data = this.taskStatusConfig.filter(item => item.taskKey == key)
      return data.length ? data[0].taskName : ''
    },
    orgRowClick(row, column, event) {
      if (column.label != '操作') {
        row.diyJs = row.diyJs || ''
        let that = this
        that.showCodeEdit = false
        setTimeout(function() {
          that.$set(that, 'task', row)
          that.showCodeEdit = true
          if (!row.task && that.filterOptions.length > 0) {
            that.showSelect = true
          }
        })
      }
    },
    initData() {
      try {
        let data = JSON.parse(this.authData || '')
        this.formTaskData = data.map(item => {
          return {
            task: item.task,
            diyJs: Base64.decode(item.diyJs)
          }
        })
      } catch {
        //转换失败，可能为空或者数据有误
        // console.log("errorrrrr");
      }
    },
    addData() {
      this.formTaskData.push({task: '', diyJs: ''})
    },
    deleteData(data, index) {
      const taskKey = this.formTaskData[index].task
      this.$confirm(`确认要删除这条任务以及相关的JS脚本吗?`, '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '放弃'
      })
        .then(() => {
          data.splice(index, 1)
        })
        .catch(() => {})
    },
    saveData() {
      //做Base64处理
      let list = cloneDeep(this.formTaskData)
      list = list.filter(item => !!item.task)
      const arr = this.formTaskData.map(item => {
        return {
          task: item.task,
          diyJs: Base64.encode(item.diyJs, 'utf-8')
        }
      })
      const str = JSON.stringify(arr)
      form
        .saveFormAuthJs({
          formId: this.formId,
          formTaskAuth: str
        })
        .then(resp => {
          this.$message.success('脚本保存成功')
          this.dialogVisible = false
        })
    },
    handleSelectChange(val) {
      this.showSelect = false
    },
    close() {
      this.showCodeEdit = false
      // this.dialogVisible=true
    }
  }
}
</script>

<style lang="scss" scoped>
.div_list {
  height: 30px;
  background: #e2e2e2;
  line-height: 30px;
  font-weight: bold;
  padding-left: 10px;
  margin-bottom: 10px;
}
</style>
