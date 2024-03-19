/**
 * @author ccwgq
 * @description 法务诉讼事务台账PC表单脚本
 * @version 1.0 参考履约台账的部分流程
 * @version 2.0 增加不同法律程序下的案号、经办律师、经办外聘律师
 * @version 3.0 法律程序调整到子表，当事人地位和时限调整到孙表，表单结构大改变
 */

 const modelName = "ssswtz";
 const mainTableName = "d_legal_lawsuit_account";
 const subDetailTableName = "d_legal_lawsuit_account_detail";
 const subProcedureTableName = "d_legal_lawsuit_account_producre";
 const sunPartyTableName = "d_legal_parties";
 const sunDeadLineTableName = "d_legal_lawsuit_account_deadline";
 
 const subPartyName = "ssswdsr";
 //直接获取主表数据实体
 let mainModel = _this.data[modelName];
 //子表的数据实体
 let subDetailData = _this.data[modelName]["sub_" + subDetailTableName];
 let subProcedureData = _this.data[modelName]["sub_" + subProcedureTableName];
 
 //孙表的数据实体
 /** 当事人地位处理,fns是若干要处理的函数 */
 function dealSonPartyData(...fns) {
   subProcedureData.forEach((item) => {
     //取孙表的数据
     const sonData = item[`sub_${sunPartyTableName}`];
     fns.forEach((fn) => {
       if (typeof fn === "function") {
         fn.call(null, sonData);
       }
     });
   });
 }
 
 //时限同理
 
 //主表和子表的主权限
 let mainPermission = _this.permission["fields"][mainTableName];
 let subDetailPermission = _this.permission["fields"][subDetailTableName];
 let subProcedurePermission = _this.permission["fields"][subProcedureTableName];
 let sunPartyPermission = _this.permission["fields"][sunPartyTableName];
 let sunDeadLinePermission = _this.permission["fields"][sunDeadLineTableName];
 
 initPage();
 addWatch();
 
   //给公文编号赋值
   setSerialNO("litig_acc_serial_no","serial_no");
   //公文编号插入到右上角
   insertSearialNo(20);
 
 //完成时间显示===> 状态字段名
 showFinishTime("proc_status");
 //清空签字意见
 clearOpinion();
    
 
 function initPage() {
   //初始倒叙排序
   if (subDetailData.length > 0) {
     sortsubDetailData(subDetailData);
     _this.$nextTick(() => {
       subDetailData.forEach((item, index) => {
         addsubDetailData(index);
       });
     });
   }
 }
 
 /**
  * 增加明细子表的记录
  * @param {下标} index
  */
 function addsubDetailData(index) {
   //创建人姓名当前用户
   if (subDetailData[index] && isEmpty(subDetailData[index]["creater"])) {
     console.log("username ===>", currentUser.username);
     subDetailData[index]["creater"] = currentUser.username;
     subDetailData[index]["creater_id"] = currentUser.account;
     //记录人记录人id
     subDetailData[index]["perf_users"] = currentUser.username;
     subDetailData[index]["perf_users_id"] = currentUser.account;
     subDetailData[index]["create_time"] = app.$Formulas.formatDate(
       new Date(),
       "YYYY-MM-DD HH:mm:ss"
     );
   }
 }
 
 /**
  * 添加主表和子表监听
  */
 function addWatch() {
   const subDetailDataKey =
     "data." + modelName + ".sub_" + subDetailTableName + ".length";
   const subProcedureDataKey =
     "data." + modelName + ".sub_" + subProcedureTableName + ".length";
   _this.$watch(subDetailDataKey, function (nVal, oVal) {
     //发现脚本监听事件太多对性能造成了影响,做异步操作
     setTimeout(() => {
       if (nVal > oVal) {
         //增加
         addsubDetailData(nVal - 1);
       } else if (nVal < oVal) {
         //减少
       }
     }, 0);
   });
   _this.$watch(subProcedureDataKey, function (nVal, oVal) {
     setTimeout(() => {
       if (nVal > oVal) {
         //增加
         const map = { 1: 20, 2: 21 };
         if (nVal < 9 && Object.keys(map).length <= nVal) {
           subProcedureData[nVal - 1]["legal_procedure"] = map[nVal];
         }
       } else {
         //减少
       }
     }, 0);
   });
   // lyzcw:2022-07-12 自动填写当前的法律程序
   //  _this.$watch(subProcedureDataKey, function (nVal, oVal) {
   //      setTimeout(() => {
   //          if (nVal > oVal) {
   //              //增加
   //              addsubProcedureData(nVal - 1);
   //          } else if (nVal < oVal) {
   //              //减少
   //          }
   //      }, 0)
   //  })
   // lyzcw:2022-07-13 主表法律程序变化，过滤该法律程序的当事人子表
   //  const mainModelField = "data." + modelName + ".legal_procedure";
   //  _this.$watch( mainModelField, function (nVal, oVal) {
   //      setTimeout(() => {
   //          if ( nVal != oVal ) {
   //              //有变化，且当事人子表不为空，筛选，隐藏
   //              subProcedureData.forEach((hParty, hIndex) => {
   //                if( hParty.legal_procedure != nVal ){
   //                    hideSubPartyRow( hIndex, true );
   //                }else{
   //                    hideSubPartyRow( hIndex, false );
   //                }
   //              })
 
   //          }
   //      }, 0);
   //  })
 }
 
 function autoFillProcedureName() {
   //自动填写法律程序的名字
 }
 
 /**判断值是否为空 */
 function isEmpty(val) {
   return typeof val === "object" ? $.isEmptyObject(val) : !val;
 }
 
 /**
  * @description 时间倒叙排序,本脚本使用create_time字段排序
  * @param needArray
  * @param sortKey
  */
 function sortsubDetailData(needArray) {
   //插入排序算法，排序的字段  :create_time
   function insertSort(arr) {
     //todo:数组必须深拷贝
     let readySortArr = Object.assign([], arr);
     //时间判断，第一个时间是否小于第二个时间
     function dateLesser(date01, date02) {
       if (!(date01 instanceof Date)) {
         date01 = new Date(date01);
       }
       if (!(date02 instanceof Date)) {
         date02 = new Date(date02);
       }
       return date01.getTime() < date02.getTime();
     }
     let inner, tem;
     for (let outer = 1; outer <= readySortArr.length - 1; outer++) {
       tem = arr[outer];
       inner = outer;
       while (
         inner > 0 &&
         dateLesser(
           readySortArr[inner - 1].create_time,
           readySortArr[inner].create_time
         )
       ) {
         readySortArr[inner] = readySortArr[inner - 1];
         inner--;
         readySortArr[inner] = tem;
       }
     }
     return readySortArr;
   }
   const newArray = insertSort(needArray);
   //todo:要求排序的结果立刻渲染，是否考虑延迟执行？
   newArray.forEach((item, index) => {
     //对数据立即重新排序，并立刻渲染
     _this.$set(needArray, index, item);
     // resetRowPermission(item, index);
   });
 }
 
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
 