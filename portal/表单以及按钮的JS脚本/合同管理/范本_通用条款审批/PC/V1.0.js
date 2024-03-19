/**
 * @description 合同范本/通用条款
 * @author ccwgq
 * @date 2021/09/27
 *  手填版本从0开始
 *  选择的话触发选择新的版本
 * @version 2.0 增加传入当前用户的主组织信息
 * @date 2022/07/19
 * @version 3.0 采用表格布局适应用户新需求，合同范本和通用条款共用一个表单一个流程
 * @version 4.0 签字意见隐藏逻辑调整
 * @version 5.0 范本历史版本控制
 */

//主表名称
const mainTableName = "d_cont_model";
//模型名称
const modelName = "htfb";
//主权限
const permission = _this.permission.fields[modelName];
//主模型
const mainModel = _this["data"][modelName];

//是否可写
const writable = ["b", "w"].includes(permission["model_name"]);

init();
addWatch();
//合并单元格，行数下标从0开始，别忘记减一！！！
mergeCell(15, 3, "呈报部门意见");
//隐藏审批内容四个大字
hideApproveText();
//添加最后一行文字提示
// addLastLine(20);
//模型中的紧急程度和流程的同步
urgentStatusSync();
//给公文编号赋值
setSerialNO("cont_model_serial_no", "serial_no");
//公文编号插入到右上角
insertSearialNo(20);
//表单列表中的字段权限控制
controlFieldsPermissionInTemplate();
//签字意见这个字段的隐藏 除了任务、新建、表单预览和草稿状态中需要显示,其他均隐藏
var pathList = ["task", "agentStart", "start", "previewForm"];
setOpinionHidden(pathList, permission);
openHistoryVersion();
/**
 * @description 初始化
 */
function init() {
  //如果
}
/**
 * 隐藏掉审批内容四个大字
 */
function hideApproveText() {
  $("div[class='form-container']").hide();
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


//表单列表中修改字段的权限
function controlFieldsPermissionInTemplate() {
  const matched = _this.$route.matched;
  const length = matched.filter((route) =>
    ["/business_center", "/statement"].includes(route.path)
  ).length;
  if (length == 1) {
    const needHide = [
      // "signature_opinion"
    ]; //需要隐藏的字段
    const needReadOnly = [
      "urgent_status",
      "create_time",
      "manager_opinion",
      "model_manage_users",
      "finish_time",
      "is_model",
      "perf_users",
      "report_department",
      "report_time",
      "proc_status",
      "legal_opinion",
      "first_lawer_opinion",
      "depart_head_opinion",
      "compliance_officer_opinion",
      "perf_user_opinion",
      "relate_opinion",
      "deal_result",
    ]; //需要设置为仅可读的
    needReadOnly.forEach((field) => {
      permission[field] = "r";
    });
    needHide.forEach((field) => {
      permission[field] = "n";
    });
  }
}
//

/**
 * @description 添加监听
 */
function addWatch() {
  // console.log(mainModel)
  //监听priID的变化决定是否是新版本？
  _this.$watch(
    `data.${modelName}.pri_id`,
    async function (val) {
      if (!isEmpty(val)) {
        mainModel["new_version"] = "01";
        var version = 0;
        const requestData = {
          priId: mainModel["pri_id"],
          tableName: "htfb",
        };
        const res = await _this.$http.post(
          "${bpmRunTime}/eipx7/opun/runtime/ver/v1/versionNum",
          requestData
        );

        if (res.data && res.data.state) {
          version = res.data.value.ver;
          mainModel["model_version"] = version;
        }
      } else {
        mainModel["new_version"] = "00";
        mainModel['model_version']=0;
      }
    }
  );
  _this.$watch(`data.${modelName}.model_name`, function (val) {
    // console.log("=====>");
    //手填的情况下
    if (isEmpty(mainModel["pri_id"]) && !isEmpty(val)) {
      mainModel["model_version"] = 0;
    }
    if(!val){
      mainModel["model_version"] = 0;
    }
    //清空情况下,数据还原
    // else if(isEmpty(val)){
    //     mainModel['model_version']=null;

    //     let clearKeys=['pri_id','busi_type_id','busi_type','matter_type_id','matter_type','template'
    //     ,'template_id','template_file_id'];
    //     clearKeys.forEach((key)=>{
    //         mainModel[key]='';
    //     })
    // }
    else if (!isEmpty(mainModel["pri_id"]) && !isEmpty(val)) {
      mainModel["model_version"] = 0;
    }
  });
}

function getCurrentOrgInfo() {
  var s = JSON.parse(window.sessionStorage.getItem("currentUser"));

  let param = {
    pageBean: {
      page: 1,
      pageSize: -1,
      showTotal: false,
    },
    querys: [],
  };
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

  async function fillOrgInfo() {
    return new Promise((resolve, reject) => {
      window.app.$http
        .post(
          `${window.context.form}/form/customDialog/v1/getListData?mapParam=&alias=yhzz`,
          param
        )
        .then((resp) => {
          resolve(resp.data);
          var orgId = resp.data.rows[0].org_id_;
          var tenantId = s.userAttrs.tenantId;
        });
    });
  }

  fillOrgInfo().then((data) => {
    if (data.state) {
      //拿到用户的信息:
      const orgId = resp.data.rows[0].org_id_;
      const orgName = resp.data.rows[0].org_nm;
      const orgIds = mainModel["org_ids"];
      if (!!orgIds) {
        const orgIdList = orgIds.split(",");
        if (orgIdList.filter((item) => item == orgId).length == 0) {
          orgIdList.push(orgId);
          const orgNameList = mainModel["org_nm"].split(",");
          orgNameList.push(orgName);
          mainModel["org_ids"] = orgIdList.join(",");
          mainModel["org_nms"] = orgNameList.join(",");
        }
      } else {
        mainModel["org_ids"] = orgId;
        mainModel["org_nm"] = orgName;
      }
    }
  });
}

function isEmpty(val) {
  if (typeof val === "object") {
    return $.isEmptyObject(val);
  } else {
    return !val;
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
  startIndex =
    mainModel["is_started"] === "01" ? startIndex + 1 : startIndex + 1;
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
  if ($mergeTr[0]) {
    $mergeTr[0].insertBefore(insertTd, referNode);
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

function openHistoryVersion() {
  //监听历史版本字段（id）的改变，实现跳转
  _this.$watch(`data.${modelName}.history_version`, function (value) {
    if (!!value) {
      const front = window.context.front;
      let s = sessionStorage.getItem("currentUser");
      s = JSON.parse(s);
      const token = s.token;
      window.open(
        `${front}/statement/template/form/model_manager/get/true?id=${value}&startFlow=false?token=${token}`
      );
    }
  });
}
