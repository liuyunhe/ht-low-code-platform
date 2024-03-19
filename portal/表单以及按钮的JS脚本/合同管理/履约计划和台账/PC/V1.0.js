/**
 * @description 通用履约计划台账PC表单
 * @author ygz,wgq
 * @version 01 按照之前的履约台账的设计,可实现子表回填的功能
 * @version 02 管道思想实现下次记录时间的计算
 * @version 03 控制子表排序的权限跟随
 * @version 04 table布局，合同需求修改
 */

//主表
const mainModelName = "lyjhhtz";
//计划子表
const subPlanModelName = "d_perf_plan_detail_un";
//台账子表
const subAccountModelName = "d_perf_account_detail_un";
//收款计划子表
const subPayModelName = 'd_pay_plan_detail';

//主表模型
const mainModel = _this['data'][mainModelName];
//计划子表模型
const subPlanModel = mainModel[`sub_${subPlanModelName}`];
//台账子表模型
const subAccountModel = mainModel[`sub_${subAccountModelName}`];
//收款计划模型
const subPayModel = mainModel[`sub_${subPayModelName}`];
//主表和子表的主权限
let mainPermission = _this.permission['fields'][mainModelName];
const subPayWatchers = [];

urgentStatusSync();
setSerialNO("perf_acc_serial_no","serial_no");
insertSearialNo(20);
returnTimeAndUser();
returnTimeAndUser1();
//完成时间显示===> 状态字段名
showFinishTime("proc_status");
//清空签字意见
clearOpinion();



/**
 * 设置公文编号
 * @param {string} alias 公文编号的别名
 * @param {string} fieldKey 公文编号字段key
 */
 function setSerialNO(alias,fieldKey) {
    if (!mainModel[fieldKey]) {
      _this.$http
        .get(
          `${window.context.portal}/sys/identity/v1/getNextIdByAlias?alias=${alias}`
        )
        .then((resp) => {
          if (resp.data && resp.data.value) {
            mainModel[fieldKey] = resp.data.value;
            insertSearialNo(20);
          }
        });
    }
  }

/**
 * 插入公文编号至表头 2022-10-12 支持公文编号复制
 * @param {number} colspan 合并的单元格列数
 */
function insertSearialNo(colspan) {
  colspan = colspan || 12;
  //table和第一行
  var $table = $(".main-table").eq(0);
  var $first = $table.children("tr").first();
  //获得流程状态
  var isStarted = mainModel["is_started"];
  if (mainModel["is_started"] == "01" && !!mainModel["serial_no"]) {
    //流程已经启动
    var serial_no = mainModel["serial_no"];
    var $insert = $(
      `<tr><td colspan="${colspan}" style="text-align:right;"><span>公文编号：` +
        `【${serial_no}】</span><span style="margin-left:7px;color:inherit;cursor:pointer;" id="copy-btn"><i class='el-icon-document-copy'></i></span></span></span></td></tr>`
    );
    $table[0].insertBefore($insert[0], $first[0]);
    //补充复制按钮的操作逻辑
    const $iconEl=$insert.find('#copy-btn');
    const fn = function(color) {
      return function() {
        $iconEl.css({color: color})
      }
    }
    $iconEl.off("mouseover").on("mouseover",fn("#409EFF"));
    $iconEl.off("mouseleave").on("mouseleave",fn("inherit"));
    //复制文字到剪贴板
    $iconEl.off("click").on("click",function(){
      const inputEl=document.createElement('input');
      inputEl.setAttribute("value",serial_no);
      document.body.appendChild(inputEl);
      inputEl.select();
      document.execCommand("copy");
      document.body.removeChild(inputEl);
      _this.$message.success("复制成功")
    })
  }
}


/**
 * 同步两处的紧急状态
 */
 function urgentStatusSync() {
    //1--表单外获取
    var $outerStatus = $(".urgent_state_div");
    var pVm = _this;
    //隐藏外层的紧急状态
    if ($outerStatus.length == 1) {
      $outerStatus.hide();
      if (mainModel["is_started"] == "00") {
        var oriVal = pVm.urgentStateConf.value;
        mainModel["urgent_status"] = oriVal;
        _this.$watch(`data.${mainModelName}.urgent_status`, function (val) {
          pVm.urgentStateConf.value = val;
        });
      }
    }
    const $form =$("div[class='form-container']");
    if($form.length){
        $form.children("span").text("台账内容")
    }
  }
function returnTimeAndUser(){
  const subTableDataKey = "data." + mainModelName + ".sub_" + subAccountModelName + ".length";
  _this.$watch(subTableDataKey, function(nVal, oVal) {
    if (nVal > oVal) {
        mainPermission['rec_period'] = 'r';
        addsubAccountModel(nVal - 1);
     }
	})
}
 
function returnTimeAndUser1(){
  const subTableData = "data." + mainModelName + ".sub_" + subPlanModelName + ".length";
  _this.$watch(subTableData, function(nVal, oVal) {
    if (nVal > oVal) {
        mainPermission['rec_period'] = 'r';
        addsubPlanModel(nVal - 1);
     }
	})
}

function addsubAccountModel(index) {
    //创建人姓名当前用户
    if (subAccountModel[index] && !(subAccountModel[index]['creater'])) {
        subAccountModel[index]['creater'] = currentUser.username;
        subAccountModel[index]['creater_id'] = currentUser.account;
        //记录人记录人id
     		subAccountModel[index]['create_time'] = app.$Formulas.formatDate(new Date(),"YYYY-MM-DD HH:mm:ss");
        subAccountModel[index]['perf_users'] = currentUser.username;
        subAccountModel[index]['perf_users_id'] = currentUser.account;
    }
}
function addsubPlanModel(index) {
    //创建人姓名当前用户
    if (subPlanModel[index] && !(subPlanModel[index]['creater'])) {
        subPlanModel[index]['creater'] = currentUser.username;
        subPlanModel[index]['creater_id'] = currentUser.account;
        //记录人记录人id
     		subPlanModel[index]['create_time'] = app.$Formulas.formatDate(new Date(),"YYYY-MM-DD HH:mm:ss");
    }
}

/**解决完成时间不显示的问题**/
function showFinishTime(statusKey) {
  if (mainModel[statusKey] === "DONE") {
    permission["finish_time"] = "r";
  }
}
/**  每次刷新表单清空签字意见 **/
function clearOpinion(){
  mainModel["signature_opinion"] =""
}
