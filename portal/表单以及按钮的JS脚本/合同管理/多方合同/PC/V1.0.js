/**
 * @version 01  新版的支持多方合同表单  公文主表，合同子表，我方相对方作为孙表
 * @version 02 签字意见隐藏
 * @example 参考法务七流程的部分脚本和之前旧版合同表单的部分脚本
 */

 var mainModelName = "dbht";
 var subModelName = "d_cont";
 var sunOppModelName = "dbhtxdf";
 var sunOurModelName = "htwfxx";
 
 var mainTableName = "d_contract_pkg";
 var subTableName = "d_cont";
 var sunOppTableName = "dbhtxdf";
 var sunOurTableName = "htwfxx";
 
 var mainModel = _this["data"][mainModelName];
 var subModel = mainModel["sub_" + subModelName];
 var mainPermission = _this["permission"]["fields"][mainTableName];
 var subPermission = _this["permission"]["fields"][subTableName];
 var sunOppPermission = _this["permission"]["fields"][sunOppTableName];
 var sunOurPermission = _this["permission"]["fields"][sunOurTableName];
 const matterThreshold = 10000000.0;
 const subWatchers = [];
 
 //console.log("task_state3=====>",_this.task_state3)
 //console.log("subPermission==>",subPermission)
 if(_this.task_state3 == 'COMMU'){
     subPermission.waiting_sign_json = 'w';
 }
 
 
 /**  --- 主表的监听 ----*/
 // 子表的监听,标的金额，结算类型 是否有支出 是否预算，生效时间 经纪业务条线
 var sonMap = new Map();
 (function (map) {
   // map.set("matter_amt", matterAmtChange);
   map.set("pay_type", payTypeChange);
   map.set("has_cost", hasCostChange);
   //map.set("has_budget", hasBudgetChange);
   map.set("under_taker_id", undertakeChange);
   // map.set("effect_time", effectTimeChange);
   // map.set("branch_aprov", branchAprovChange)
 })(sonMap);
 if (mainModel[`sub_${subModelName}`].length > 0) {
   sonAddWatchers(sonMap);
 }
 
 // function effectTimeChange(val, oVal, index) {
 //     var curReason = $('div:first-child[model-name="item.reasons"]')
 //         .eq(index).parents(".el-form-item");
 //     if (isEmpty(val)) {
 //         //为空显示
 //         curReason.show();
 //     } else {
 //         let effectTime = new Date(val);
 //         let currentTime = new Date();
 //         effectTime.getTime() < currentTime.getTime()
 //             ? curReason.show()
 //             : curReason.hide();
 //     }
 // }
 //判断是第一个节点，允许编辑
 // const writable = ["w", "b"].includes(mainPermission["cont_nm"]);
 
 mergeCellTwo(12, 3, "呈报部门意见");
 urgentStatusSync();
 //公文编号，第一个参数是别名，第二个是要设置的字段
 setSerialNO("cont_appr_serial_no", "serial_no");
 //插入公文编号，参数是设计的colspan*2
 insertSearialNo(20);
 mainWatch();
 //  updateSubModel();
 
 //签字意见的隐藏
 var pathList = ["task", "agentStart", "start", "previewForm"];
 setOpinionHidden(pathList, mainPermission);
 //autoClickBtn();
 //完成时间显示===> 状态字段名
 showFinishTime("proc_status");
 //清空签字意见
 clearOpinion();
 
 
 function mainWatch() {
   _this.$watch(
     `data.${mainModelName}.sub_${subModelName}.length`,
     function (nVal, oVal) {
       //统一移除这个自定义的属性
       if (mainModel["contracts"]) {
         _this.$delete(mainModel, "contracts");
       }
       if (nVal < oVal) {
         while (subWatchers.length > 0) {
           const w = subWatchers.shift();
           typeof w == "function" && w();
         }
       }
       //  子表有的情况下才需要监听,因此只在需要时把sub_d_cont从数组映射为对象
       if (nVal > 0) {
         _this.$set(mainModel, "contracts", {});
         sonAddWatchers(sonMap);
         subModel.forEach((item, index) => {
           _this.$set(mainModel["contracts"], `item_${index}`, item);
         });
       }
       //增加子合同的是否变更合同是true
       subModel.forEach((sub) => {
         sub.is_chged = "00"; //打包合同下面的合同不是变更合同
         sub.is_pkg = "00"; //是打包合同
       });
       //之所以加上immediate:true 是因为期望初始化（进入页面时）就能执行一次初始的监听
     },
     { immediate: true }
   );
 }
 
 /**
  * @description 标的的改变   大写 + 标的类型：重大非重大
  * @param {Number} newVal 新值
  * @param {Number} oldVal 旧值
  * @param {Number} index 下标
  */
 function matterAmtChange(newVal, oldVal, index) {
   //主表标的金额改变,全部遍历
   mainModel.matter_amt = 0;
   var money = 0;
   subModel.forEach((sub) => (money += parseFloat(sub.matter_amt)));
   mainModel.matter_amt = money;
   //子表大写改变
   setContractVal(index, "matter_amt_cap", _this.$Formulas.CURRENCY(newVal));
   //  达到1000万是重大合同
   subModel[index].matter_type_id =
     newVal >= matterThreshold ? "zdxmht" : "fzdxmht";
 }
 
 function payTypeChange(nVal, oVal, index) {
   //console.log("subModel=======",subModel[index].sub_htwfxx)
   // debugger
   //当前的预算
   let $curBudget = $("div[model-name='item.has_budget']")
     .eq(index)
     .parents(".el-form-item");
   const contractHideKeys = [
     "opbk_no",
     "opbk_name",
     "opbk_acct",
     "opbk_acct_name",
     "money_type",
     "exchange_rate",
     "over_rate",
     "payterm_code",
   ];
   const oppHideKeys = ["opbk_no", "opbk_name", "opbk_acct", "opbk_acct_name"];
   //获取主table
   const $subTable = $curBudget.parents(
     `table[data-subname="data.${mainModelName}.sub_${subModelName}"]`
   );
   // console.log('subTable===>', $subTable)
   // const $sunTables = $subTable
   //     .find(`table[data-subname="data.${mainModelName}.sub_${subModelName}[${index}].sub_${grandModelName}"]`)
   // // console.log("sunTables===>", $sunTables);
   //获得是否有预算部分的div  el-col
   if (["42", "44"].includes(nVal)) {
     // 有费用支出
     subModel[index]["has_cost"] = "1";
     // 是否有预算显示，并必填
     $curBudget.show();
   }else {
     // 无费用支出
     subModel[index]["has_cost"] = "0";
     //预算隐藏
     $curBudget.hide();
   }
   //财务接口相关字段的联动
   if (["41", "42", "44"].includes(nVal)) {
     // //显示
     // contractHideKeys.forEach(key => {
     //     const $field = $(`div[model-name='item.${key}']`)
     //         .eq(index).parents(".el-form-item");
     //     $field.show()
     // })
     // oppHideKeys.forEach(key => {
     //     $sunTables.each(function ($table_index) {
     //         //孙表
     //         $(this)
     //             .find(`div[model-expression="item.${key}"]`)
     //             .parents(".el-form-item")
     //             .show()
     //     })
     // })
     //sunOurPermission.opbk_no='b'
     //sunOurPermission.opbk_name='b'
     //sunOurPermission.opbk_acct='b'
     //sunOurPermission.opbk_acct_name='b'
     //sunOppPermission.opbk_no='b'
     //sunOppPermission.opbk_name='b'
     //sunOppPermission.opbk_acct='b'
     //sunOppPermission.opbk_acct_name='b'
   } else if(["43"].includes(nVal)){
     //sunOurPermission.opbk_no='w'
     //sunOurPermission.opbk_name='w'
     //sunOurPermission.opbk_acct='w'
     //sunOurPermission.opbk_acct_name='w'
     //sunOppPermission.opbk_no='w'
     //sunOppPermission.opbk_name='w'
     //sunOppPermission.opbk_acct='w'
     //sunOppPermission.opbk_acct_name='w'
   }else {
     //隐藏
     // contractHideKeys.forEach(key => {
     //     const $field = $(`div[model-name='item.${key}']`)
     //         .eq(index).parents(".el-form-item");
     //     $field.hide()
     // })
     // oppHideKeys.forEach(key => {
     //     $sunTables.each(function ($table_index) {
     //         //孙表
     //         $(this)
     //             .find(`div[model-expression="item.${key}"]`)
     //             .parents(".el-form-item")
     //             .hide()
     //     })
     // })
   }
 }
 
 /**
  * 承办人的变化监听获取承办人所在的部门
  * @param {string} nVal 新值
  * @param {string} oVal 旧值
  * @param {number} index 下标
  */
 function undertakeChange(nVal, oVal, index) {
   if (!nVal) return;
   const list = nVal.split(",");
   //每个人对应不同的部门
   let returnList = [];
   list.forEach((id) => {
     //请求接口
     getMainDeptInfo(id).then((obj) => {
       returnList.push(obj);
       if (returnList.length === list.length) {
         const orgName = returnList.map((item) => item.orgName).join(",");
         const orgId = returnList.map((item) => item.orgId).join(",");
         subModel[index]["under_taker_org_id"] = orgId;
         subModel[index]["under_taker_org_name"] = orgName;
       }
     });
   });
 }
 
 // 合同子表只要有一个费用支出打包合同就有费用支出
 /**
  * @description 是否有费用支出的改变
  * @param {string} newVal 改变的新值
  * @param {string} oldVal 改变的旧值
  * @param {number} index 下标
  * */
 function hasCostChange(newVal, oldVal, index) {
   if (!isEmpty(newVal)) {
     newVal == "1"
       ? (mainModel["has_cost"] = "1")
       : newVal == "0"
       ? (mainModel["has_cost"] = subModel.every((sub) => sub.has_cost == "0")
           ? "0"
           : "1")
       : "";
   }
 }
 // 合同子表只要有一个预算没有 就整体没有预算
 /**
  * @description 是否有费用支出的改变
  * @param {string} newVal 改变的新值
  * @param {string} oldVal 改变的旧值
  * @param {number} index 下标
  * */
 function hasBudgetChange(newVal, oldVal, index) {
   if (!isEmpty(newVal)) {
     mainModel["has_budget"] =
       newVal == "0"
         ? "0"
         : newVal == "1"
         ? subModel.every((sub) => sub.has_budget == "1")
           ? "1"
           : "0"
         : "";
   }
 }
 
 /**
  *  @子表的监听联动
  **/
 function sonAddWatchers(map) {
   const keys = [...map.keys()];
   //清空移除原来的watcher,避免重复监听影响性能
   while (subWatchers.length > 0) {
     const w = subWatchers.shift();
     typeof w == "function" && w();
   }
   subModel.forEach((ht, hIndex) => {
     keys.forEach((key) => {
       const watch = _this.$watch(
         `data.${mainModelName}.contracts.item_${hIndex}.${key}`,
         function (nVal, oVal) {
           if (typeof map.get(key) == "function") {
             map.get(key)(nVal, oVal, hIndex);
           }
         }
       );
       subWatchers.push(watch);
     });
   });
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
 
 /*插入公文编号  2022-10-12 支持公文编号复制*/
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
 }
 
 /**
  * 更新子表中的步骤和步骤id的值
  */
 function updateSubModel() {
   const keys = ["attach_procedure", "attach_procedure_id"];
   if (subModel.length) {
     subModel.forEach((sub) => {
       keys.forEach((key) => {
         if (!!mainModel[key]) {
           sub[key] = mainModel[key];
         }
       });
     });
     //更新子表的流程状态
     const statusKey = "proc_status";
     if (mainModel["is_started"]) {
     }
   }
 }
 
 /**
  * 合并单元格,跨行合并
  * @param {number} startIndex 开始合并的那一行
  * @param {number} mergeLine 合并总行数
  * @param {string} text 新加单元格的内容
  * @param {object} options 选项 单独指定单元格中的样式
  */
 function mergeCellOne(startIndex, mergeLine, text, options = {}) {
   startIndex = mainModel["is_started"] == "01" ? startIndex + 1 : startIndex;
   var $table = $(".main-table").eq(0);
   var $mergeTr = $table.children("tr").eq(startIndex);
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
     $table.children("tr").eq(i).find("td").eq(0).remove();
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
  * 合并单元格,跨行合并
  * @param {number} startIndex 开始合并的那一行
  * @param {number} mergeLine 合并总行数
  * @param {string} text 新加单元格的内容
  * @param {object} options 选项 单独指定单元格中的样式
  */
 function mergeCellTwo(startIndex, mergeLine, text, options = {}) {
   var $table = $(".main-table").eq(1);
   var $mergeTr = $table.children("tr").eq(startIndex);
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
     $table.children("tr").eq(i).find("td").eq(0).remove();
   }
   //生成DOM
   const insertTd = $(
     `<td rowspan="${mergeLine}" colspan="2" style="${style}"><span>${text}</span></td>`
   )[0];
   var referNode = $mergeTr.find("td")[0];
   //插入DOM
   $mergeTr[0].insertBefore(insertTd, referNode);
 }
 
 function notEmpty(val) {
   return val !== "" || val !== null || val !== undefined;
 }
 
 function needFill(value) {
   return value == "" || value === null;
 }
 
 function isEmpty(val) {
   return typeof val === "object" ? $.isEmptyObject(val) : !val;
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
   // console.log("用户id=========>" + s.userId);
   // console.log("租户id=========>" + s.userAttrs.tenantId);
   //接口查询参数
   param.querys.push({
     property: "USER_ID_",
     value: userId,
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
 
 /**
  * 按钮自动收起
  */
 //TODO:优化这里查找按钮dom的效率
 function autoClickBtn() {
   var $tables = $(".sub-table");
   $tables.each(function () {
     var $sunTables = $(this).find(".sun-table");
     // console.log($sunTables);
     $sunTables.each(function () {
       var $sunElRows = $(this).find(".el-row");
       // console.log($sunElRows);
       $sunElRows.eq(0).find(".eip-btn").children("button").trigger("click");
     });
     var $elRow = $(this)
       .find("div[model-name='item.cont_nm']")
       .parents(".el-row");
     if ($elRow.length == 1) {
       setTimeout(() => {
         var $btn = $elRow.find("button").last();
         if ($btn.text() == "收起") {
           $btn.trigger("click");
         }
       }, 0);
     }
   });
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
 