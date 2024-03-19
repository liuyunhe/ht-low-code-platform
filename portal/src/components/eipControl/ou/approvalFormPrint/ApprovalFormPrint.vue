<template>
  <el-dialog
    custom-class="approval-print"
    title="合同审批单"
    :visible.sync="printDialog"
    :close-on-click-modal="false"
    width="60%"
    @close="afterClose"
  >
    <!-- <el-button
      v-if="taskList.length > 0"
      v-print="printObj"
      style="margin: 0 0 20px 0"
      size="mini"
      type="primary"
      round
      >打印</el-button
    > -->
    <div id="approvalForm" v-if="foData !== null">
      <h2
        style="line-height: 50px;height: 50px;text-align: center;font-size: large;font-weight: bold;margin-bottom:5px;"
        v-if="taskList.length > 0"
      >
        {{ foData.cont_nm + '-审批单' }}
      </h2>
      <!--      动态渲染的表格-->
      <approval-table
        :formKey="formKey"
        :foData="foData"
        :taskList="taskList"
      />
    </div>
  </el-dialog>
</template>

<script>
import ApprovalTable from './ApprovalTable'
/**@author:ccwgq 2021-10-26
 * @description 合同审批单
 * @version 1.0 2021-10-26 实现简单打印
 * @version 2.0  2021-10-28 样式调整
 */
//时间的插入排序
function insertSort(arr, sortKey) {
  let readySortArr = Object.assign([], arr)
  //时间判断，第一个时间是否小于第二个时间
  function dateLesser(date01, date02) {
    if (!(date01 instanceof Date)) {
      date01 = new Date(date01)
    }
    if (!(date02 instanceof Date)) {
      date02 = new Date(date02)
    }
    return date01.getTime() > date02.getTime()
  }
  let inner, tem
  for (let outer = 1; outer <= readySortArr.length - 1; outer++) {
    tem = readySortArr[outer]
    inner = outer
    //明细子表的记录时间实际在后台叫创建时间,
    while (
      inner > 0 &&
      dateLesser(readySortArr[inner - 1][sortKey], readySortArr[inner][sortKey])
    ) {
      readySortArr[inner] = readySortArr[inner - 1]
      inner--
      readySortArr[inner] = tem
    }
  }
  return readySortArr
}
// 坐标排序算法   优先y坐标
function coordinateSort(nodeList) {
  function setRule(p1, p2) {
    if (p1.y < p2.y) {
      return true
    } 
    // else if (p1.y == p2.y) 
    // 允许节点绘制时，高度误差在30以内
    else if (Math.abs(p1.y-p2.y)<=30) 
    {
      return p1.x < p2.x
    } else {
      return false
    }
  }
  let inner, tem
  for (let outer = 1; outer < nodeList.length; outer++) {
    tem = nodeList[outer]
    inner = outer
    while (inner > 0 && setRule(nodeList[inner], nodeList[inner - 1])) {
      nodeList[inner] = nodeList[inner - 1]
      inner--
      nodeList[inner] = tem
    }
  }
  return nodeList
}
// todo: 这个插件目前不支持IE11，还是printjs兼容性多好一点
import print from 'vue-print-nb'
export default {
  name: 'ApprovalFormPrint',
  components: {ApprovalTable},
  props: [
    'subject',
    'bpmnInstId',
    'instId',
    'defId',
    'taskId',
    'leaderId',
    'formKey'
  ],
  data() {
    return {
      printDialog: false,
      taskList: [],
      layoutList: [],
      loading: false,
      //打印参数
      printObj: {
        id: '#approvalForm',
        popTitle: '合同审批单',
        type: 'html',
        url: ''
      },
      foData: null
    }
  },
  directives: {print},
  methods: {
    //  加载表单的数据,务必先加载表单的数据再说
    loadFormData() {
      const _this = this
      let data
      data = document.querySelector("div[name='online-form']").__vue__.data
      if (['ht','htN', 'htsp'].includes(this.formKey)) {
        _this.foData = 'ht' in data ? data['ht'] : null
      } else {
        _this.foData = 'dbht' in data ? data['dbht'] : null
      }
    },
    // 手动打开对话框
    async handleOpen() {
      //请求流程数据，参考了taskImage.vue中的handleOpen实现
      // 表单的数据请求不到无法打印
      //加载数据
      this.loadFormData()
      if (this.foData === null) {
        this.$message.warning('表单数据加载失败')
        return
      }
      const loading = this.$loading({
        text: '合同审批单加载中'
      })
      let data = {
        bpmnInstId: this.bpmnInstId,
        instId: this.instId,
        defId: this.defId
      }
      const res = await this.$store.dispatch('storeProcess/getBpmImage', data)
      if (!res || !res.rows) {
        //请求数据失败关闭对话框
        loading.close()

        return
      }
      this.layoutList = res.rows.bpmDefLayout.listLayout
      const filteredNodeList = this.layoutList.filter(
        item => !['EXCLUSIVEGATEWAY', 'START', 'END'].includes(item.nodeType)
      )
      // 按坐标排序
      const sortedNodeList = coordinateSort(filteredNodeList)
      // console.log("打印排序后的节点===>", sortedNodeList);
      const nodeIds = sortedNodeList.map(node => node.nodeId).join(',')
      const resp = await this.$store.dispatch('storeProcess/getNodeopinions', {
        instId: this.instId,
        nodeIds: nodeIds
      })
      // 数据过滤提取
      //TODO: 优化策略  滤除根本不会走到的节点,会签任务需要全部展示
      let taskList = []
      for(let node of sortedNodeList){
         const nodeId = node.nodeId
        if (nodeId in resp) {
          if (resp[nodeId].data && resp[nodeId].data.length > 0) {
            //节点产生了代办任务或者预代办
            let tasks = resp[nodeId].data
            //任务数量大于1最好时间排序一下
            if (tasks[tasks.length - 1].taskId && tasks.length > 1) {
              tasks = insertSort(tasks, 'createTime')
            }
            //这里都只是取出了最新的节点,
            //会签节点单独处理
            if(/^SignTask/.test(nodeId)){
              const signNames=this.foData.sign_orgs_nm.split(',');
              const len=signNames.length;
              let tasks_splice=[]
              // if(tasks.length==1){

              // }
              // else{

              // }
              for (let i=1;i<=len;i++){
                tasks_splice.push(tasks[tasks.length-i])
              }
              // signNames.forEach((name,index)=>{
              // })
              //保证先审批完成的数据在前
              tasks_splice.sort(function(pre,cur){
                pre.status=!pre.status?'':pre.status;
                cur.status=!cur.status?'':cur.status;
                if((pre.status =='agree') && (cur.status =='agree')){
                  return 0;
                }
                else if(pre.status == 'agree'){
                  return -1;
                }
                else if(cur.status =='agree'){
                  return 1
                }
                else{
                  return 0
                }
              })
              tasks_splice.forEach((task,index)=>{
                task.taskName=`${node.name}(${index+1})`;
                task.auditorName=['agree','backToStart','signBackCancel'].includes(task.status)
                ?task.qualfiedNames
                :'';
                taskList.push(task)
              })
              // debugger;
              continue;
            }
            if (tasks[tasks.length - 1].taskName) {
              taskList.push(tasks[tasks.length - 1])
            } else {
              taskList.push({
                ...tasks[tasks.length - 1],
                taskName: node.name
              })
            }
          }
        }
      }
      if (taskList.length === 0) {
        this.$message.warning('无审批数据')
      } else {
        this.printDialog = true
      }
      loading.close()
      this.taskList = taskList
    },
    // 手动关闭对话框
    handleClose() {
      this.printDialog = false
    },
    // 关闭后的回调
    afterClose() {
      this.taskList = this.$options.data().taskList
      this.foData = this.$options.data().foData
    }
  }
}
</script>

<style lang="scss">
@media print {
  body {
    margin: 0mm 20mm 25mm 20mm;
  }
}
@page {
  size: auto;
  margin-bottom: 25mm;
  margin-top: 25mm;
  tr:first {
    td {
      border-top: 1mm solid black;
    }
  }
}
</style>
