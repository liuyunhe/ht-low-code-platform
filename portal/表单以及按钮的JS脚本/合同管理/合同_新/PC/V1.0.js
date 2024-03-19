/**
 * @version 01  新版合同表单
 * @example 参考法务七流程的部分脚本和之前旧版合同表单的部分脚本
 */
//模型名和表名---分别用于获取模型和权限
var mainModelName = "ht";
var subModelName = "htxdf";
var mainTableName = "ht";
var subTableName = "htxdf";

var mainModel = _this["data"][mainModelName];
var subModel = mainModel[`sub_${subModelName}`]; //得到list

var mainPermission = _this["permission"]["fields"][mainTableName];
var subPermission = _this["permission"]["fields"][subTableName];
// 合同标的触发阈值  --根据此数据判断更改项目类型  重大非重大----
const matterThreshold = 10000000.0;
//判断是第一个节点，允许编辑
const writable = ["w", "b"].includes(mainPermission["cont_nm"]);

const aKeys = ["10", "20", "30", "40"]; // 甲方/乙方/丙方/丁方
const bKeys = ["00", "01"]; //买方/卖方
const cKeys = ["90", "91", "92"]; // 管理人/托管人/委托人
const dKeys = ["80", "81"]; // 普通合伙人,有限合伙人
const allKeys = [...aKeys, ...bKeys, ...cKeys, ...dKeys];


init();
autoGenerateProjTitle();
judgeContType();
watchReasons();
ourRoleWatch();
payTypeControl();
// projectSelectEffect();
// sealControl();
sonWatch();
urgentStatusSync();
setSerialNO();
//插入公文编号，参数是设计的colspan*2
insertSearialNo(20);
//我方信息分割
// insertDividerCell(3, "我方主体信息");
//财务信息分割
// insertDividerCell(9, "财务信息");
//合同预审信息
// insertDividerCell(17, "合同明细");
//评审意见
//insertDividerCell(42, "评审意见");
//子表默认折叠
foldSunTable();
//单元格合并,别忘记减一
mergeCell(43,2,"律师意见")
mergeCell(47,3,'呈报部门意见')

function init(){
  console.log("合同数据初始化 ===》");
//设置合同类型,默认为补录 00，通过流程发起的合同 公文合同，已在流程中赋值 01
if(mainModel["contract_type"] == '' || mainModel["contract_type"] == null){
  mainModel["contract_type"] = "00";
}
if(mainModel["proc_status"] == '' || mainModel["proc_status"] == null){
  mainModel["proc_status"] = "DONE";
}
  var s = JSON.parse(window.sessionStorage.getItem("currentUser"));
  if(mainModel["under_taker_id"] == '' || mainModel["under_taker_id"] == null){
    mainModel["under_taker_id"] = s.userId;
    s.username;
  
  }
  if(mainModel["under_taker_name"] == '' || mainModel["under_taker_name"] == null){
    mainModel["under_taker_name"] = s.username;
  }
  
    if(mainModel["ORG_ID_"] == '' || mainModel["ORG_ID_"] == null){
 			getMainDeptInfo(s.userId);
  		}


	}

/**获得主组织的有关信息
  * @param {string} userId 用户id
  * @returns Promise
  */
  function getMainDeptInfo(userId) {
    var s = JSON.parse(window.sessionStorage.getItem("currentUser"));
  
    let param = {
      pageBean: {
        page: 1,
        pageSize: -1,
        showTotal: false,
      },
      querys: [],
    };
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
                           console.log("resp ===>",resp);
          if (resp.data.rows && resp.data.rows.length) {
                     console.log("ord_id_ ===>",  resp.data.rows[0]["org_id_"]);
            mainModel["ORG_ID_"] = resp.data.rows[0]["org_id_"];
            console.log("ORG_ID_ ===>", mainModel["ORG_ID_"]);
            resolve({
              orgName: resp.rows[0]["name_"],
              orgId: resp.rows[0]["ord_id_"],
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
//setFieldCellWidth(200,"perf_users");
//setFieldCellWidth(200,"report_department");

/*  --------- 主表监听区域   ------- start   */
/**自动生成 项目标题:相对方简称-合同类型-年份 */
function autoGenerateProjTitle() {
  //监听其有值,且项目标题不是自动生成的
  _this.$watch(`data.${mainModelName}.contract_type`, function (nVal, oVal) {
    if (!!nVal) {
      var proj_nm = mainModel["project_name"];
      var tmpList = proj_nm.split("-");
      //防止子表为空
      if (subModel.length == 0) return;
      //取第一个相对方的简称
      var shortName = subModel[0]["opp_short_name"];
      //判断一下,为空或者固定格式下才重新生成覆盖
      if (
        !proj_nm ||
        (tmpList.length == 3 &&
          tmpList[0] == shortName &&
          tmpList[1] == oVal &&
          /^\d{4}$/.test(tmpList[2]))
      ) {
        if (!shortName) {
          //简称不能为空，为空不生成
          return;
        }
        var curYear = new Date().getFullYear(); //获取年份
        mainModel["project_name"] = `${shortName}-${nVal}-${curYear}`;
      }
    }
  });
}

/**监听合同金额，判断是否重大 */
function judgeContType() {
  //ccwgq  ---> 合同总金额判断是否重大项目的联动  合同金额大写的联动
  _this.$watch(
    "data." + mainModelName + ".matter_amt",
    function (val) {
      // 重大非重大
      mainModel["matter_type_id"] =
        val >= matterThreshold ? "zdxmht" : "fzdxmht";
      mainModel["matter_type"] =
        val >= matterThreshold ? "重大项目合同" : "非重大项目合同";
      //  大写赋值
      // mainModel['matter_amt_cap'] = _this.$Formulas.CURRENCY(val);  //公式计算解决
    },
    { immediate: true }
  );
}

/** 根据合同生效时间判断是否需要情况说明 */
function watchReasons() {
  // ccwgq--->合同生效时间监听，为了在当前时间晚于时间时能够填写情况说明
  _this.$watch(
    "data." + mainModelName + ".effect_time",
    function (newVal) {
      // console.log("effect_time change===>", newVal);
      if (!needFill(newVal)) {
        var currentTime = new Date();
        var effectTime = new Date(newVal);
        //格式化
        if (effectTime.getTime() <= currentTime.getTime()) {
          mainPermission["reasons"] = writable ? "b" : "r";
        } else {
          //否则就隐藏字段
          mainPermission["reasons"] = "n";
        }
      } else {
        mainPermission["reasons"] = "n";
      }
    },
    {
      immediate: true,
    }
  );
}

/**我方主体地位的联动 */
function ourRoleWatch() {
  _this.$watch(
    "data." + mainModelName + ".role",
    function (val) {
      // 我方主体地位为空就清空相对方的主体地位
      if (needFill(val)) {
        subModel.forEach((sub) => {
          sub["role"] = "";
        });
      }
    },
    { immediate: true }
  );
}

/* 合同所属项目的联动 */
function projectSelectEffect() {
  _this.$watch(`data.${mainModelName}.`, function (nVal, oVal) {
    if (!nVal) {
      //清空所有相关的合同
      _this.$nextTick(() => {
        mainModel["relate_cont_nm"] = "";
        mainModel["relate_cont_id"] = "";
      });
    }
  });
}

/**    结算方式联动效果
  41--收款  42--付款  43--不结算 44--收支双向 */
function payTypeControl() {
  _this.$watch(
    "data." + mainModelName + ".pay_type",
    function (val) {
      if (["42", "44"].includes(val)) {
        // 有费用支出
        mainModel["has_cost"] = "1";
      } else if (["41", "43"].includes(val)) {
        // 无费用支出
        mainModel["has_cost"] = "0";
        // 是否有预算隐藏
      }
    },
    {
      immediate: true,
    }
  );
}
/**  印章的控制逻辑 */
function sealControl() {
  //监听控制
  //   印章类型  是电子签章 92 安心签印章编号必填   关键字必填
  _this.$watch("data." + mainModelName + ".sta_type", function (val) {
    if (val == "92") {
      mainPermission["cfc_sta_id"] = writable ? "b" : "r";
      //  签章关键字可填写
      mainPermission["sign_key_word"] = writable ? "b" : "b";
    } else {
      mainPermission["cfc_sta_id"] = "n";
      mainPermission["sign_key_word"] = "n";
    }
  });
}
/*      end        */

/*  ------------- 子表监听   ------------  start*/
/**@description 子表监听 */
function sonWatch() {
  _this.$watch(
    `data.${mainModelName}.sub_${subModelName}.length`,
    function (val, oVal) {
      //子表长度变化了,利用$set重置数据结构
      _this.$set(mainModel, "items", {});
      if (Array.isArray(subModel)) {
        subModel.forEach((item, index) => {
          _this.$set(mainModel["items"], `item_${index}`, item);
        });
      }
      if (val > oVal) {
        //子表初始化
        newSubInit(val - 1); // todo: 这个函数的赋值不生效！！！！
      }
      // console.log('sub array current length===>', val);
    }
  );
}
/** 子表初始化 */
function newSubInit(index) {
  /**
   * @deprecated
   * @description 主体地位限制可选*/
  // const vInst = $($("div[model-name='item.role']")[index]).prop("__vue__");
  // if (vInst && ($.isEmptyObject(vInst) || !vInst.options)) return;
  // const options = computeRolesList(mainModel['role']);
  // setTimeout(() => { vInst.options = options; }, 70)
}
/*     ------ end   --------*/
function oppDataFillBack() {
  //  version01 相对方子表的数据（相对方名称和相对方id）回填主表
  /*分成四类   甲乙丙丁(10/20/30/40)   买卖(00/01)    
    管理人托管人委托人(90/91/92)  普通合伙人/有限合伙人(80/81)
    */
  let oppNameList = []; //相对方名称
  let oppIdList = []; //相对方的id
  let oppRoleList = []; //相对方主体地位
  let oppUniList = []; //相对方统一信用代码
  let oppAdrList = []; //相对方地址
  let oppPhoneList = []; //相对方电话
  let oppPstList = []; //相对方邮编
  let oppLegalRepList = []; // 相对方法定代表人
  let oppAuthRepList = []; //相对方授权代表人
  //  我方主体地位
  const ourRole = mainModel["role"];

  const opps = subModel.map((sub) => {
    return {
      id: sub["opp_id"],
      name: sub["name"],
      role: sub["role"],
    };
  });
  let keys = [];
  keys = Object.assign([], allKeys);
  keys.forEach((key) => {
    const returnOpp = opps.filter((opp) => opp.role == key);
    const returnOppNames = returnOpp.map((opp) => opp.name);
    oppNameList.push(...returnOppNames);
    const returnOppIds = returnOpp.map((opp) => opp.id);
    oppIdList.push(...returnOppIds);
    const returnOppRoles = returnOpp.map((opp) => opp.role);
    oppRoleList.push(...returnOppRoles);
    //todo:回填更多的信息
  });
  // console.log("oppRoleList===>", oppRoleList);
  //  回填到主表
  mainModel["opp_nm"] = oppNameList.filter((name) => notEmpty(name)).join(",");
  mainModel["opp_id"] = oppIdList.filter((id) => notEmpty(id)).join(",");
  mainModel["opp_role"] = oppRoleList
    .filter((role) => notEmpty(role))
    .join(",");
}
/**@description 子表的数据回填到主表中来    此逻辑转移到流程中*/
function opp2temp() {
  let map = new Map();
  const curKeys = [...cKeys, ...dKeys];
  curKeys.forEach((key) => {
    map.set(key, [[], []]);
  });
  subModel.forEach((sub) => {
    const role = sub["role"]; //子表中的主体地位
    if (curKeys.includes(role)) {
      map.get(role)[0].push(sub["opp_id"]); //存放id
      map.get(role)[1].push(sub["name"]); //存放名称
    }
  });
  //  精简写法
  curKeys.forEach((key, index) => {
    const ids = map.get(key)[0];
    const names = map.get(key)[1];
    mainModel[`tmp_${index * 2 + 1}`] =
      ids.length === 0 ? "" : ids.length > 1 ? ids.join(",") : ids[0];
    mainModel[`tmp_${index * 2 + 2}`] =
      names.length === 0 ? "" : names.length > 1 ? names.join(",") : names[0];
  });
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
}

/**
 * 设置某个字段所在的单元格的宽度
 * @param {number} width 宽度
 * @param {string} fieldName 字段名
 */
function setFieldCellWidth(width, fieldName) {
  var $tr = $(`div[model-name="data.${mainModelName}.${fieldName}"]`)
    .parents("td")
    .css({
      minWidth: `${width}px`,
    });
}

/*设置公文编号*/
function setSerialNO() {
  //如果没有自动生成流水号,就先调用接口赋值
  //http://114.251.201.179:7070/eip-portal/sys/identity/v1/getNextIdByAlias?alias=htbh
  if (!mainModel["serial_no"]) {
    _this.$http
      .get(
        `${window.context.portal}/sys/identity/v1/getNextIdByAlias?alias=fwspbh`
      )
      .then((resp) => {
        if (resp.data && resp.data.value) {
          mainModel["serial_no"] = resp.data.value;
          // insertSearialNo();
        }
      });
  }
}

/*插入公文编号*/
function insertSearialNo(colspan) {
  colspan = colspan || 12;
  //table和第一行
  var $table = $(".main-table");
  var $first = $table.find("tr").first();
  //获得流程状态
  var isStarted = mainModel["is_started"];
  if (mainModel["is_started"] == "01" && !!mainModel["serial_no"]) {
    //流程已经启动
    var serial_no = mainModel["serial_no"];
    var $insert = $(
      `<tr><td colspan="${colspan}" style="text-align:right;"><span>公文编号：` +
        `【${serial_no}】</span></td></tr>`
    );
    $table[0].insertBefore($insert[0], $first[0]);
  }
}

/** 插入分割的单元行 */
function insertDividerCell(index, text, options = {}) {
  index = mainModel["is_started"] == "01" ? index + 1 : index;
  var $table = $(".main-table");
  var bef = $table.find("tr").get(index); //获得DOM
  //计算样式
  var tdStyle = "";
  var border = options.border || "1px solid rgb(181, 181, 181)";
  var textAlign = options.textAlign || "center";
  var height = options.height || "35px";
  tdStyle += `border-left:${border};border-top:${border};text-align:${textAlign};height:${height};`;
  var textStyle = "";
  var color = options.color || "#000";
  var fontSize = options.fontSize || "11pt";
  var fontWeight = options.fontWeight || "bold";
  textStyle += `color:${color};font-size:${fontSize};font-weight:${fontWeight};`;
  var $insert = $(
    `<tr><td colspan="30" style="${tdStyle}">` +
      `<span style="${textStyle}">${text}</span></td></tr>`
  );
  $table[0].insertBefore($insert[0], bef);
}

/**
 * 合并单元格,跨行合并
 * @param {number} startIndex 开始合并的那一行
 * @param {number} mergeLine 合并总行数
 * @param {string} text 新加单元格的内容
 * @param {object} options 选项 单独指定单元格中的样式
 */
 function mergeCell(startIndex, mergeLine, text, options = {}) {
    startIndex = (mainModel['is_started'] == "01") ? startIndex+1 : startIndex;
    var $mergeTr = $(".main-table > tr").eq(startIndex)
    //options  计算样式的默认值
    var borderStyle = options.borderStyle || ' 1px solid rgb(181, 181, 181)';
    var border = `border-left:${borderStyle};border-top:${borderStyle};`
    var color = options.color || 'rgb(128, 128, 128) !important'
    color = `color:${color};`
    var backGroundColor = options.backGroundColor || 'rgb(231, 243, 252) !important';
    backGroundColor = `background-color:${backGroundColor};`
    var fontSize = options.fontSize || '12px';
    fontSize = `font-size:${fontSize};`
    var fontWeight = options.fontWeight || 'bold';
    fontWeight = `font-weight:${fontWeight};`
    var textAlign = options.textAlign || 'center';
    textAlign = `text-align:${textAlign};`
    //样式拼接
    var style = border + color + backGroundColor + fontSize + fontWeight + textAlign;
    //移除DOM
    for(let i=startIndex;i<(startIndex+mergeLine);i++){
        $(".main-table > tr").eq(i).find('td').eq(0).remove();
    }
    //生成DOM
    const insertTd = $(`<td rowspan="${mergeLine}" colspan="2" style="${style}"><span>${text}</span></td>`)[0];
    var referNode = $mergeTr.find('td')[0];
    //插入DOM
    $mergeTr[0].insertBefore(insertTd, referNode);
}

/** 相对方子表折叠 */
function foldSunTable() {
  $("table[data-subname]").each(function (tIndex) {
    var $btn = $(this).find("tr").eq(0).find(".el-button").last();
    if ($btn.text() == "折叠") $btn.trigger("click");
  });
}

function notEmpty(val) {
  return val !== "" || val !== null || val !== undefined;
}

function needFill(value) {
  return value == "" || value === null;
}
