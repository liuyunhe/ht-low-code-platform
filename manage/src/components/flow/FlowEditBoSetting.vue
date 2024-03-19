<template>
  <div style="height: calc(100% - 20px); margin: 10px">
    <el-card class="bo-set__card" shadow="never">
      <div slot="header" class="flex" style="justify-content: space-between">
        <div>
          <ht-select
            size="mini"
            clearable
            v-model="selectedNode"
            :options="nodeDefList"
            :props="{key: 'nodeId', value: 'name'}"
          />
          <el-button
            size="mini"
            style="margin-left: 10px"
            icon="el-icon-plus"
            @click="editNodeSet('')"
            >添加</el-button
          >
        </div>
        <div class="flex" style="width: 150px; justify-content: space-between">
          <el-button
            size="mini"
            type="primary"
            icon="el-icon-check"
            @click="save(false)"
            >保存</el-button
          >
          <el-button
            size="mini"
            type="warning"
            icon="el-icon-refresh"
            @click="reset"
            >重置</el-button
          >
        </div>
      </div>
      <el-scrollbar class="scrollbar-fullheight">
        <table
          class="form-table bo-set__table"
          cellspacing="0"
          cellpadding="0"
          border="0"
        >
          <tbody>
            <tr v-for="(value, key) in nodeSetMap" :key="key">
              <th width="200px">{{ getDesc(key) }}</th>
              <td>
                <el-table class="bo-set__detail" :data="value" border>
                  <el-table-column
                    type="index"
                    width="60"
                    label="序号"
                    align="center"
                  ></el-table-column>
                  <el-table-column
                    prop="description"
                    label="描述"
                    align="center"
                  />
                  <el-table-column label="操作" width="120" align="center">
                    <template v-slot="{row, $index}">
                      <el-button
                        size="mini"
                        icon="el-icon-edit"
                        @click="editNodeSet(key, $index, row)"
                      ></el-button>
                      <el-button
                        type="danger"
                        size="mini"
                        icon="el-icon-delete"
                        @click="deleteSetting(value, $index)"
                      ></el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </td>
            </tr>
          </tbody>
        </table>
      </el-scrollbar>
    </el-card>

    <el-dialog
      top="8vh"
      width="70%"
      title="Bo任务节点设置"
      :visible.sync="dialogVisibleSetting"
      append-to-body
      class="urgent-text"
      :close-on-click-modal="false"
    >
      <div style="width: 100%; height: 550px">
        <div style="float: left; width: 25%; height: 100%">
          <ht-tree
            style="overflow: auto; height: 100%"
            :data="treeData"
            :props="defaultProps"
            default-expand-all
            @node-click="handleNodeClick"
            :expand-on-click-node="false"
            ref="htTypeTree"
          ></ht-tree>
        </div>
        <div style="width: 73%; float: left; margin-left: 10px; height: 100%">
          <table class="form-table" cellspacing="0" cellpadding="0" border="0">
            <tbody>
              <tr>
                <th width="130px" class="is-required">描述:</th>
                <td>
                  <ht-input
                    v-model="dataDialog.description"
                    placeholder="请输入描述"
                    autocomplete="off"
                    :validate="{required: true}"
                  ></ht-input>
                </td>
              </tr>
            </tbody>
          </table>
          <el-tabs v-model="tabType" type="border-card">
            <el-tab-pane label="显示前" name="beforeShow">
              <el-form v-model="dataDialog" data-vv-scope="settingSave">
                <table
                  class="form-table"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                >
                  <tbody>
                    <tr>
                      <th width="100px">脚本内容:</th>
                      <td>
                        <!-- 常用脚本选择对话框  -->
                        <eip-script-dialog
                          ref="beforeShowDialog"
                          v-model="dataDialog.beforeShow"
                          append-to-body
                        />
                        <el-button @click="showDialog('beforeShowDialog')"
                          >常用脚本</el-button
                        >
                        <!-- 可选变量对话框 -->
                        <FlowVarSelector
                          :defId="defId"
                          @node-click="varTreeBeforeShow"
                        />
                        <br />
                        <br />
                        <ht-input
                          type="textarea"
                          :rows="14"
                          class="ht"
                          v-model="dataDialog.beforeShow"
                          placeholder="请输入脚本内容"
                          autocomplete="off"
                        ></ht-input>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </el-form>
            </el-tab-pane>
            <el-tab-pane label="保存时" name="whenSave">
              <el-form v-model="dataDialog" data-vv-scope="settingSave">
                <table
                  class="form-table"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                >
                  <tbody>
                    <tr>
                      <th width="100px">脚本内容:</th>
                      <td>
                        <!-- 常用脚本选择对话框  -->
                        <eip-script-dialog
                          ref="whenSaveDialog"
                          v-model="dataDialog.whenSave"
                          append-to-body
                        />
                        <el-button @click="showDialog('whenSaveDialog')"
                          >常用脚本</el-button
                        >
                        <!-- 可选变量对话框 -->
                        <FlowVarSelector
                          :defId="defId"
                          @node-click="varTreeWhenSave"
                        />
                        <br />
                        <br />
                        <ht-input
                          type="textarea"
                          :rows="14"
                          class="ht"
                          v-model="dataDialog.whenSave"
                          placeholder="请输入脚本内容"
                          autocomplete="off"
                        ></ht-input>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </el-form>
            </el-tab-pane>
          </el-tabs>
          <br />
          <br />
          <div slot="footer" class="dialog-footer" style="float: right">
            <el-button
              type="primary"
              size="mini"
              @click="saveDataDialog"
              icon="el-icon-check"
              >确 认</el-button
            >
            <el-button size="mini" @click="close" icon="el-icon-close"
              >取 消</el-button
            >
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {Message} from 'element-ui'
import req from '@/request.js'
const eipScriptDialog = () => import('@/components/dialog/EipScriptDialog.vue')
const FlowVarSelector = () => import('@/components/flow/FlowVarSelector.vue')
const FlowConditionBuildDialog = () =>
  import('@/components/flow/FlowConditionBuildDialog.vue')
export default {
  name: 'FlowEditBoSetting',
  components: {FlowVarSelector, FlowConditionBuildDialog, eipScriptDialog},
  props: {
    defId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      tabType: 'beforeShow',
      treeData: [], //树数据
      defaultProps: {
        children: 'children',
        label: 'desc',
      },
      dialogVisibleSetting: false, //是否显示Bo任务节点设置
      selectedNode: '', //选择的节点
      nodeDefList: [], //可选择的节点
      nodeSetMap: {}, //节点设置的数据
      isClearForm: false, //是否清空已配置的表单
      data: {bodef: {boSaveMode: 'database', boDefs: []}},
      dataDialog: {beforeShow: '', whenSave: '', defKey: '', description: ''}, //Bo任务节点设置对话框返回的值
      isEdit: false, //是否是点击修改按钮进入的Bo任务节点设置对话框,
      curEditIndex: null,
      curEditNodeId: '',
    }
  },
  methods: {
    //Bo任务节点设置对话框确认事件
    saveDataDialog() {
      if (!this.dataDialog.description) {
        this.$message.warning('请输入描述')
        return
      }
      //判断是否是修改
      if (!this.isEdit) {
        //不是修改
        let list = this.nodeSetMap[this.selectedNode]
        if (!list) {
          this.nodeSetMap[this.selectedNode] = []
          list = this.nodeSetMap[this.selectedNode]
        }
        list.push(this.dataDialog)
        this.isEdit = false
      } else {
        this.nodeSetMap[this.curEditNodeId].splice(
          this.curEditIndex,
          1,
          this.dataDialog
        )
      }
      this.dialogVisibleSetting = false
    },
    //监督可选变量的返回值(显示前)
    varTreeBeforeShow(data) {
      this.dataDialog.beforeShow = this.dataDialog.beforeShow + data.pathValue
    },
    //监督可选变量的返回值(保存时)
    varTreeWhenSave(data) {
      this.dataDialog.whenSave = this.dataDialog.whenSave + data.pathValue
    },
    //显示常用脚本
    showDialog(action) {
      this.$refs[action].showDialog()
    },
    //树鼠标左击事件(treeNode:当前节点对象，node：可以拿到父节点对象)
    handleNodeClick(treeNode, node, nodeCompent) {
      let def
      let pDef //父定义
      if (!treeNode.nodeType || treeNode.nodeType == 'main') {
        return
      }
      if (treeNode.nodeType == 'field') {
        def = node.parent
      } else {
        def = node
      }
      if (def.data.nodeType == 'sub') {
        pDef = def.parent
      }
      if (!this.dataDialog.description) {
        this.dataDialog.description = treeNode.desc
      }
      let txt = ''
      if (treeNode.nodeType == 'field') {
        //字段
        if (!pDef) {
          //主表字段
          pDef = def
          txt =
            pDef.data.boDefAlias +
            '.get("data").put("' +
            treeNode.name +
            '","");'
        } else {
          //子表字段
          if (this.tabType == 'beforeShow') {
            if (pDef.data.nodeType == 'sub') {
              //孙表
              const rootDef = pDef.parent
              txt += '//设置新增孙表的默认值\n\r'
              txt +=
                rootDef.data.boDefAlias +
                '.get("initDataMap").get("' +
                pDef.data.name +
                '").get("initData").get("' +
                def.data.name +
                '").put("' +
                treeNode.name +
                '","");'
            } else {
              txt += '//设置新增子表的默认值\n\r'
              txt +=
                pDef.data.boDefAlias +
                '.get("initDataMap").get("' +
                def.data.name +
                '").put("' +
                treeNode.name +
                '","");'
            }
          } else {
            if (pDef.data.nodeType == 'sub') {
              //孙表
              const rootDef = pDef.parent
              txt +=
                '//设置已有子表某个字段的值,参数为(子表名，孙表名，孙表字段名，字段值，子表下标，孙表下标)或(子表名，孙表名，孙表字段名，字段值，子表下标)或(子表名，孙表名，孙表字段名，字段值)无下标每条数据都会修改\n\r'
              txt +=
                rootDef.data.boDefAlias +
                '.setSunFiledVal("' +
                pDef.data.name +
                '","' +
                def.data.name +
                '","' +
                treeNode.name +
                '","",0,0);'
            } else {
              txt +=
                '//设置已有子表某个字段的值,参数为(子表名，字段名，字段值，下标)或者(子表名，字段名，字段值)，无下标每条数据都会修改\n\r'
              txt +=
                pDef.data.boDefAlias +
                '.setSubFiledVal("' +
                def.data.name +
                '","' +
                treeNode.name +
                '","",0);'
            }
          }
        }
      } else {
        //子表
        txt =
          'ArrayNode list = ' +
          pDef.data.boDefAlias +
          '.getSubTableData("' +
          def.data.name +
          '");'
      }
      if (this.tabType == 'beforeShow') {
        //如果是显示前
        this.dataDialog.beforeShow = this.dataDialog.beforeShow + txt
      } else if (this.tabType == 'whenSave') {
        //如果是保存时
        this.dataDialog.whenSave = this.dataDialog.whenSave + txt
      }
      this.dataDialog.defKey = pDef.data.boDefAlias
    },
    //根据任务节点ID获取任务节点名称
    getDesc(nodeId) {
      for (let i = 0; i < this.nodeDefList.length; i++) {
        let tmp = this.nodeDefList[i]
        if (tmp.nodeId == nodeId) {
          return tmp.name + '(' + nodeId + ')'
        }
      }
      return nodeId
    },
    //添加
    editNodeSet(editNodeId, index, nodeSet) {
      let passConf = {}
      passConf.node = this.selectedNode
      passConf.ids = ''
      this.data.bodef.boDefs.forEach((item) => {
        if (passConf.ids != '') {
          passConf.ids += ','
        }
        passConf.ids += item.id
      })
      //判断是否从编辑进来的
      if (nodeSet) {
        passConf.data = nodeSet
        for (let i = 0; i < this.nodeDefList.length; i++) {
          let tmp = this.nodeDefList[i]
          if (tmp.nodeId == nodeId) {
            passConf.node = tmp
            break
          }
        }
        this.dataDialog = JSON.parse(JSON.stringify(nodeSet)) //给显示前和保存时的脚本内容赋值
        this.curEditIndex = index
        this.curEditNodeId = editNodeId
        this.isEdit = true
      } else if (!nodeSet) {
        this.isEdit = false
        this.dataDialog = {
          beforeShow: '',
          whenSave: '',
          defKey: '',
          description: '',
        } //初始化显示前和保存时的脚本内容
      }
      if (!passConf.ids) {
        Message.warning('请在流程配置中先绑定表单')
        return
      }
      let nodeId = passConf.node.nodeId
      const this_ = this
      //显示BO数据树
      req
        .post('${form}/bo/def/v1/getBOTree', passConf.ids)
        .then(function (res) {
          this_.treeData = []
          this_.treeData.push(res.data)
          this_.tabType = 'beforeShow'
          this_.dialogVisibleSetting = true
        })
    },
    //保存
    save(isRest) {
      let data = this.data
      //判断是否绑定表单
      if (data.bodef.boDefs.length == 0) {
        Message.warning('请在流程配置中先绑定表单')
        return
      }
      // 拼装提交的数据
      data.bodef.boDefs.forEach((item) => {
        item.key = item.alias
      })
      data.formInitItems = []
      if (this.nodeSetMap.length != 0) {
        for (let key in this.nodeSetMap) {
          let temp = {}
          temp.nodeId = key
          temp.parentDefKey = ''
          temp.saveFieldsSetting = []
          temp.showFieldsSetting = []
          this.nodeSetMap[key].forEach((item) => {
            // 都为空就不保存
            if (!item.beforeShow && !item.whenSave) {
              return
            }
            item.beforeShow = item.beforeShow ? item.beforeShow : ''
            item.whenSave = item.whenSave ? item.whenSave : ''
            let tmp = {}
            tmp.boDefCode = item.defKey
            tmp.description = item.description
            tmp.setting = item.whenSave
            temp.saveFieldsSetting.push(tmp)
            temp = JSON.parse(JSON.stringify(temp))
            tmp.setting = item.beforeShow
            temp.showFieldsSetting.push(tmp)
          })
          data.formInitItems.push(temp)
        }
      }
      let param = {}
      param.json = JSON.stringify(data)
      param.topDefKey = ''
      param.flowId = this.defId
      param.isClearForm = this.isClearForm

      req.post('${bpmModel}/flow/def/v1/saveSetBos', param).then(function (r) {
        r = r.data
        let opName = '保存'
        if (isRest) {
          opName = '重置'
        }
        if (r.state) {
          Message.success(opName + '成功')
        } else {
          Message.error(opName + '失败')
        }
      })
    },
    //重置
    reset() {
      this.$confirm('此操作将清除所有数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.nodeSetMap = {}
          this.save(true)
        })
        .catch(() => {})
    },
    //关闭侧边栏
    close() {
      this.dialogVisibleSetting = false
      this.isEdit = false
    },
    //删除
    deleteSetting(list, index) {
      list.splice(index, 1)
    },
  },
  mounted() {
    this.$loading()
    this.$validator = this.$root.$validator
    const this_ = this
    let url =
      '${bpmModel}/flow/def/v1/nodeBos?defId=' + this.defId + '&topDefKey='
    req.get(url).then(function (data) {
      data = data.data
      if (data.nodeDefList && data.nodeDefList.length > 0) {
        data.nodeDefList.forEach((n) => {
          n.name += '（' + n.nodeId + '）'
        })
        this_.nodeDefList = data.nodeDefList
        this_.selectedNode = data.nodeDefList[0].nodeId // 默认选一个
      }
      // 初始化json的数据
      if (data.json.bodef.boSaveMode) {
        this_.data.bodef.boSaveMode = data.json.bodef.boSaveMode
      }
      if (data.json.bodef) {
        for (let x = 0; x < data.json.bodef.boDefs.length; x++) {
          let item = data.json.bodef.boDefs[x]
          let temp = {}
          temp.alias = item.key
          temp.name = item.name
          temp.scope = item.scope
          req
            .get('${form}/bo/def/v1/getObject?key=' + item.key)
            .then(function (req) {
              req = req.data
              temp.id = req.id
              this_.data.bodef.boDefs.push(temp)
              //最后一个索引的元素时关系加载框
              if (x == data.json.bodef.boDefs.length - 1) {
                this_.$loading().close()
              }
            })
        }
      }
      if (data.json.formInitItems) {
        data.json.formInitItems.forEach((item) => {
          for (let i = 0; i < item.saveFieldsSetting.length; i++) {
            let temp = {}
            let savet = item.saveFieldsSetting[i]
            let showt = item.showFieldsSetting[i]
            temp.description = savet.description
            temp.defKey = savet.boDefCode
            temp.beforeShow = showt.setting
            temp.whenSave = savet.setting
            let list = this_.nodeSetMap[item.nodeId]
            if (!list) {
              this_.nodeSetMap[item.nodeId] = []
              list = this_.nodeSetMap[item.nodeId]
            }
            list.push(temp)
          }
        })
      }
      this_.$loading().close()
    })
  },
}
</script>
<style lang="scss" scoped>
div >>> .el-dialog__body {
  padding: 10px 20px;
  color: #606266;
  font-size: 14px;
  word-break: break-all;
}
.el-main {
  padding-top: 0px;
}
.urgent-text {
  width: 100%;
}
.ht {
  width: 100%;
}

.bo-set__card {
  height: calc(100% - 5px);
}

.bo-set__card /deep/ > div.el-card__header {
  padding: 8px 20px;
}

.bo-set__card >>> div.el-card__body {
  height: calc(100% - 65px)!important;
  padding: 10px 0 10px 10px;
}

.bo-set__table th,
.bo-set__card /deep/ > div.el-card__header,
.bo-set__detail /deep/ > .el-table__header-wrapper > table > thead th {
  background: #f9f9f9;
}
.bo-set__table th,
.bo-set__table td {
  padding: 5px 15px !important;
}
</style>
