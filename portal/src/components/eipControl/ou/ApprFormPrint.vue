<template>
  <div>
    <el-dialog
      custom-class="approval-print"
      title="合同审批单"
      :visible.sync="printDialog"
      :close-on-click-modal="false"
      width="60%"
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
      <div id="approvalForm">
        <h2 class="title">{{ subject.split("-起草审批")[0] + "-审批单" }}</h2>
        <table ref="approvalForm" v-if="taskList.length > 0" class="approval-form">
          <thead></thead>
          <tbody>
            <!-- 标准合同 第一行  我方名称 合同编号 -->
            <!-- ccwgq 2022-06-13 合同表单新版formKey:htN -->
            <tr class="first-line" v-if="['ht','htN', 'htsp'].includes(formKey)">
              <td class="text-bold">我方名称</td>
              <td>{{ foData.our_party }}</td>
              <td class="text-bold">合同编号</td>
              <td>{{ foData.serial_no }}</td>
            </tr>
            <!-- 打包合同 第一行 打包合同总数 合同编号 -->
            <tr class="first-line" v-if="['htpkg'].includes(formKey)">
              <td class="text-bold">合同总数</td>
              <td>{{ foData.sub_d_contract.length }}</td>
              <td class="text-bold">合同编号</td>
              <td>{{ foData.serial_no }}</td>
            </tr>
            <!-- 标准合同 第二行 合同总金额 -->
            <tr class="second-line">
              <td class="text-bold">合同总金额</td>
              <td colspan="3">{{ foData.matter_amt_cap }}</td>
            </tr>

            <!-- 审批记录 -->
            <tr class="approval-record" v-for="(task, index) in taskList" :key="index">
              <!--   -->
              <!--        任务节点名-->
              <td
                style="
                  writing-mode: vertical-lr;
                  border-bottom: none !important;
                  border-right: 1px solid black;
                  text-align: center;
                  font-weight: bold;
                "
                v-if="index == 0"
                :rowspan="taskList.length"
              >
                审批记录
              </td>
              <td style="border-right: 1px solid black; text-align: center">
                {{ task.taskName }}
              </td>
              <!--        审批单-->
              <td colspan="2">
                <!--          整个div包裹-->
                <div>
                  <h4 class="opinion-title">审批意见:</h4>
                  <p class="opinion-content">{{ task.opinion }}</p>
                  <!--            右下角-->
                  <div class="sign">
                    <!-- 分割预留 -->
                    <el-row>
                      <el-col :span="4">审批人：</el-col>
                      <el-col :span="4" :pull="1">
                        <span v-if="task.auditorName">{{ task.auditorName }}</span>
                        <div style="min-width: 10px; min-height: 10px" v-else></div>
                      </el-col>
                      <el-col :span="5">审批日期：</el-col>
                      <el-col :span="11" :pull="1">{{
                        task.completeTime | dateFormat
                      }}</el-col>
                    </el-row>
                  </div>
                </div>
              </td>
            </tr>
            <!-- 备注 -->
            <tr class="form-reason">
              <td class="text-bold">备注</td>
              <td colspan="3">
                <p>{{ foData.reasons }}</p>
              </td>
            </tr>
          </tbody>
          <tfoot></tfoot>
        </table>
      </div>
    </el-dialog>
  </div>
</template>

<script>
/**@author:ccwgq 2021-10-26
 * @description 合同审批单
 * @version 1.0 2021-10-26 实现简单打印
 * @version 2.0  2021-10-28 样式调整
 */
//时间的插入排序
function insertSort(arr, sortKey) {
  let readySortArr = Object.assign([], arr);
  //时间判断，第一个时间是否小于第二个时间
  function dateLesser(date01, date02) {
    if (!(date01 instanceof Date)) {
      date01 = new Date(date01);
    }
    if (!(date02 instanceof Date)) {
      date02 = new Date(date02);
    }
    return date01.getTime() > date02.getTime();
  }
  let inner, tem;
  for (let outer = 1; outer <= readySortArr.length - 1; outer++) {
    tem = readySortArr[outer];
    inner = outer;
    //明细子表的记录时间实际在后台叫创建时间,
    while (
      inner > 0 &&
      dateLesser(readySortArr[inner - 1][sortKey], readySortArr[inner][sortKey])
    ) {
      readySortArr[inner] = readySortArr[inner - 1];
      inner--;
      readySortArr[inner] = tem;
    }
  }
  return readySortArr;
}
// 坐标排序算法   优先y坐标
function coordinateSort(nodeList) {
  function setRule(p1, p2) {
    if (p1.y < p2.y) {
      return true;
    } else if (p1.y == p2.y) {
      return p1.x < p2.x;
    } else {
      return false;
    }
  }
  let inner, tem;
  for (let outer = 1; outer < nodeList.length; outer++) {
    tem = nodeList[outer];
    inner = outer;
    while (inner > 0 && setRule(nodeList[inner], nodeList[inner - 1])) {
      nodeList[inner] = nodeList[inner - 1];
      inner--;
      nodeList[inner] = tem;
    }
  }
  return nodeList;
}
import moment from "moment";
// todo: 这个插件目前不支持IE11，还是printjs兼容性多好一点
import print from "vue-print-nb";
export default {
  name: "ApprFormPrint",
  //  需要传入的参数,流程主题
  props: ["subject", "bpmnInstId", "instId", "defId", "taskId", "leaderId", "formKey"],
  filters: {
    dateFormat: function (val) {
      if (!val || val == "") {
        return "";
      } else {
        return moment(val).format("YYYY年MM月DD日 HH时mm分");
      }
    },
  },
  directives: {
    print,
  },
  data() {
    return {
      printDialog: false,
      taskList: [],
      layoutList: [],
      loading: false,
      //打印参数
      printObj: {
        id: "#approvalForm",
        type: "html",
        url: "",
      },
      foData: null,
    };
  },
  methods: {
    //  加载表单的数据,务必先加载表单的数据再说
    loadFormData() {
      const _this = this;
      let data;
      data = document.querySelector("div[name='online-form']").__vue__.data;
      // ccwgq 2022-06-13 合同表单新版formKey:htN
      if (["ht","htN", "htsp"].includes(this.formKey)) {
        _this.foData = "ht" in data ? data["ht"] : null;
      } else {
        _this.foData = "dbht" in data ? data["dbht"] : null;
      }
    },
    // todo: 识别真正要走下去的节点以及正确的流程顺序
    handleOpen() {
      //请求流程数据，参考了taskImage.vue中的handleOpen实现
      // 表单的数据请求不到无法打印
      //加载数据
      this.loadFormData();
      if (this.foData === null) {
        this.$message.warning("表单数据加载失败");
        return;
      }
      const loading = this.$loading({
        text: "合同审批单加载中",
      });
      let data = {
        bpmnInstId: this.bpmnInstId,
        instId: this.instId,
        defId: this.defId,
      };
      this.$store.dispatch("storeProcess/getBpmImage", data).then((res) => {
        this.layoutList = res.rows.bpmDefLayout.listLayout;
        const filteredNodeList = this.layoutList.filter(
          (item) => !["EXCLUSIVEGATEWAY", "START", "END"].includes(item.nodeType)
        );
        // 按坐标排序
        const sortedNodeList = coordinateSort(filteredNodeList);
        // console.log("打印排序后的节点===>", sortedNodeList);
        const nodeIds = sortedNodeList.map((node) => node.nodeId).join(",");
        this.$store
          .dispatch("storeProcess/getNodeopinions", {
            instId: this.instId,
            nodeIds: nodeIds,
          })
          .then((resp) => {
            // 数据过滤提取
            let taskList = [];
            sortedNodeList.forEach((node) => {
              const nodeId = node.nodeId;
              if (nodeId in resp) {
                if (resp[nodeId].data && resp[nodeId].data.length > 0) {
                  //节点产生了代办任务或者预代办
                  let tasks = resp[nodeId].data;
                  //任务数量大于1最好时间排序一下
                  if (tasks[tasks.length - 1].taskId && tasks.length > 1) {
                    tasks = insertSort(tasks, "createTime");
                  }
                  if (tasks[tasks.length - 1].taskName) {
                    taskList.push(tasks[tasks.length - 1]);
                  } else {
                    taskList.push({
                      ...tasks[tasks.length - 1],
                      taskName: node.name,
                    });
                  }
                }
              }
            });
            if (taskList.length == 0) {
              this.$message.warning("无审批数据");
            } else {
              this.printDialog = true;
            }
            loading.close();
            this.taskList = taskList;
          });
      });
    },
    // 点击modal层不关闭对话框,可以设定一个手动关闭对话框的方法
    handleClose() {
      this.printDialog = false;
    },
    handlePrint() {},
  },
};
</script>

<style lang="scss">
/** 设置打印的样式 */
$boldBorder: 2px solid black !important;
$normalBorder: 1px solid black;
</style>

<style lang="scss" scoped>
$boldBorder: 2px solid black !important;
$normalBorder: 1px solid black;
.text-bold {
  font-weight: bold;
}
/** table样式 外框粗边框 */
.approval-form {
  width: 98%;
  margin: 0 auto;
  /* 标题   无外框*/
  /* 前几行的高度为50px */
  /*  除了最后一行 border bottom */
  tr {
    td {
      border-top: $normalBorder;
    }
  }
  tr:first-child {
    td {
      border-top: none !important;
    }
  }
  border: $boldBorder;
  .first-line,
  .second-line {
    height: 50px;
    line-height: 50px;
  }
  /*  边框设置  */
  .first-line {
    td:first-child {
      min-width: 80px;
    }
    td {
      border-right: $normalBorder;
      text-align: center;
    }
    td:last-child {
      border-right: none !important;
    }
  }
  .second-line {
    td:first-child {
      border-right: $normalBorder;
    }
    td {
      text-align: center;
    }
  }
  .approval-record {
    .title {
      writing-mode: vertical-lr;
      border-bottom: none !important;
      border-right: 1px solid black;
    }

    .opinion-title {
      margin: 10px 5px;
    }
    .opinion-content {
      margin-left: 5px;
      text-indent: 2em;
      content-visibility: auto;
    }
    .sign {
      span:nth-child(2) {
        width: 10em;
      }
    }
  }
  .approval-record:first-child {
    td:first-child {
      border-right: $normalBorder;
    }
  }
  .form-reason {
    height: 90px;
    line-height: 90px;
    td {
      border-top: $normalBorder;
      text-align: center;
    }
    td:first-child {
      border-right: $normalBorder;
    }
  }
}
.approval-form {
  ::v-deep .el-dialog {
    .dialog {
      width: 60%;
      max-width: 650px;
    }
  }
}
.title {
  text-align: center;
  font-size: larger;
  font-weight: bolder;
}
</style>
