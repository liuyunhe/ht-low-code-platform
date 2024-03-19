/**法律文书审批,PC脚本
 * @version 01  初始版本
 * @version 02  签字意见隐藏
 */

//模型名
var modelName = "flwssp";
//模型数据
var modelData = _this.data[modelName];
//主表名
var mainTableName = "d_legal_instrument_approve";
var mainModel = modelData;

//权限对象
var permission = _this["permission"]["fields"][mainTableName];

//隐藏审批内容四个大字
hideApproveText();
//添加最后一行文字提示 colspan 可调
// addLastLine(20);
//模型中的紧急程度和流程的同步
urgentStatusSync();
//给公文编号赋值,公文编号的alias,公文编号字段的key
setSerialNO("leg_instr_appr_no", "serial_no");
//公文编号插入到右上角,传入td的colspan属性
insertSearialNo(20);
//合并单元格，行数下标从0开始，别忘记减一！！！
mergeCell(14, 2, "呈报部门意见");
//设置经办人宽度
//setFieldCellWidth(215, 'perf_users')
//设置公文宽度
//setFieldCellWidth(550, 'title')
//启动流程时，按钮文字改为 ‘提交’
//renameStartButtonName()
//表单列表中的签字意见字段隐藏
// hideSignFieldInList();
var pathList = ["task", "agentStart", "start", "previewForm"];
setOpinionHidden(pathList,permission);
//完成时间显示===> 状态字段名
showFinishTime("proc_status");
//清空签字意见
clearOpinion();


/**获得主组织的有关信息
 * @returns Promise
 */
function getMainDeptInfo() {
  var s = JSON.parse(window.sessionStorage.getItem("currentUser"));

  let param = {
    pageBean: {
      page: 1,
      pageSize: -1,
      showTotal: false,
    },
    querys: [],
  };
  // console.log("用户id=========>" + s.userId);
  // console.log("租户id=========>" + s.userAttrs.tenantId);
  //接口查询参数
  param.querys.push({
    property: "USER_ID_",
    value: s.userId,
    group: "main",
    operation: "LIKE",
    relation: "AND",
  });
  param.querys.push({
    property: "TENANT_ID_",
    value: s.userAttrs.tenantId,
    group: "main",
    operation: "LIKE",
    relation: "AND",
  });

  // 调用接口查询用户主组织机构代码
  return new Promise((resolve, reject) => {
    window.app.$http
      .post(
        `${window.context.form}/form/customDialog/v1/getListData?mapParam=&alias=yhzz`,
        param
      )
      .then((resp) => {
        if (resp.data && resp.data.rows && resp.data.rows.length) {
          resolve({
            orgName: resp.data.rows[0]["name_"],
            orgId: resp.data.rows[0]["ord_id_"],
          });
        } else {
          reject({});
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
}

/** 加上最后一行显示小字 */
function addLastLine(colspan) {
  colspan = colspan || 12;
  var $table = $(`table[class="main-table"]`);
  var h = document.createElement;
  var text =
    "注：此呈报如需加盖公司印章，发起人应在“经办人意见”栏内明确提出加盖哪类印章" +
    "（如：东北证券公章、法人章、总裁办公室等），否则不予受理。";
  var $tr = $(
    `<tr style="height:28px;"><td  rowspan='1' colspan='${colspan}'` +
      `style="word-wrap:break-word;word-break:break-word;text-align:left;vertical-align:top;border-top:1px solid rgb(181, 181, 181);border-left:1px solid rgb(181, 181, 181);"` +
      `><div style="padding:10px;font-size:11pt;font-family:Microsoft YaHei;font-color:black;">` +
      `<span  style="font-size:11pt;font-family:Microsoft YaHei;font-color:black;">${text}</span></div></td></tr>`
  );
  $table[0].appendChild($tr[0]);
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
      _this.$watch(`data.${modelName}.urgent_status`, function (val) {
        pVm.urgentStateConf.value = val;
      });
    }
  }
}

/**
 * 设置公文编号
 * @param {string} alias 公文编号的别名
 * @param {string} fieldKey 公文编号字段key
 */
function setSerialNO(alias, fieldKey) {
  if (!mainModel[fieldKey]) {
    _this.$http
      .get(
        `${window.context.portal}/sys/identity/v1/getNextIdByAlias?alias=${alias}`
      )
      .then((resp) => {
        if (resp.data && resp.data.value) {
          mainModel[fieldKey] = resp.data.value;
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
 * 合并单元格,跨行合并
 * @param {number} startIndex 开始合并的那一行
 * @param {number} mergeLine 合并总行数
 * @param {string} text 新加单元格的内容
 * @param {object} options 选项 单独指定单元格中的样式
 */
function mergeCell(startIndex, mergeLine, text, options = {}) {
  startIndex = mainModel["is_started"] == "01" ? startIndex + 1 : startIndex;
  var $mergeTr = $(".main-table > tr").eq(startIndex);
  //options  计算样式的默认值
  var borderStyle = options.borderStyle || " 1px solid rgb(181, 181, 181)";
  var border = `border-left:${borderStyle};border-top:${borderStyle};`;
  var color = options.color || "rgb(128, 128, 128) !important";
  color = `color:${color};`;
  var backGroundColor =
    options.backGroundColor || "rgb(231, 243, 252) !important";
  backGroundColor = `background-color:${backGroundColor};`;
  var fontSize = options.fontSize || "12px";
  fontSize = `font-size:${fontSize};`;
  var fontWeight = options.fontWeight || "bold";
  fontWeight = `font-weight:${fontWeight};`;
  var textAlign = options.textAlign || "center";
  textAlign = `text-align:${textAlign};`;
  //样式拼接
  var style =
    border + color + backGroundColor + fontSize + fontWeight + textAlign;
  //移除DOM
  for (let i = startIndex; i < startIndex + mergeLine; i++) {
    $(".main-table > tr").eq(i).find("td").eq(0).remove();
  }
  //生成DOM
  const insertTd = $(
    `<td rowspan="${mergeLine}" colspan="2" style="${style}"><span>${text}</span></td>`
  )[0];
  var referNode = $mergeTr.find("td")[0];
  //插入DOM
  $mergeTr[0].insertBefore(insertTd, referNode);
}

/**
 * 设置某个字段所在的单元格的宽度
 * @param {number} width 宽度
 * @param {string} fieldName 字段名
 */
function setFieldCellWidth(width, fieldName) {
  var $tr = $(`div[model-name="data.${modelName}.${fieldName}"]`)
    .parents("td")
    .css({
      minWidth: `${width}px`,
    });
}

/**
 * 隐藏掉审批内容四个大字
 */
function hideApproveText() {
  $("div[class='form-container']").hide();
}

/**
 * 将启动按钮中的启动改为提交
 */
function renameStartButtonName() {
  var vm = _this;
  while (vm.$parent) {
    if (vm.$vnode && vm.$vnode.tag && /start$/.test(vm.$vnode.tag)) {
      break;
    }
    vm = vm.$parent;
  }
  if (vm.$parent) {
    $(`div[class="start-btn-group"]`).find("button").eq(0).text("提交");
  }
}

/* 表单列表中隐藏签字意见字段
 */
function hideSignFieldInList() {
  if (/^\/business_center\/template\/form(.)*/.test(_this.$route.path)) {
    permission["signature_opinion"] = "n";
    _this.$forceUpdate();
  }
}

/**
 * 签字意见字段隐藏
 * @param {Array} pathList 一级路由列表
 * @param {object} perObj 权限对象
 */
 function setOpinionHidden(pathList, perObj) {
  const status = mainModel["is_started"];
  //匹配一级路由的路径名
  const path = _this.$route.path.replace(/\/(.*?)\/.*/, "$1");
  if (!pathList.includes(path)) {
    //符合条件就隐藏字段
    perObj["signature_opinion"] = "n";
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
