/**
 * @author ccwgq
 * @description 法务非诉事务台账PC表单脚本
 * @version 1.0 参考履约台账的部分流程
 */

 const modelName = 'fsswtz';
 const mainTableName = 'd_legal_affairs_accout';
 const subTableName = 'd_legal_affairs_accout_detail';
 //直接获取主表数据实体
 let mainModel = _this.data[modelName];
 //子表的数据实体
 let subTableModel = _this.data[modelName]['sub_' + subTableName];
 //主表和子表的主权限
 let mainPermission = _this.permission['fields'][mainTableName];
 let subPermission = _this.permission['fields'][subTableName];
 
 initPage();
 addWatch();
 
  //给公文编号赋值
setSerialNO('nlitig_acc_serial_no','serial_no');
//公文编号插入到右上角
insertSearialNo(20);
//完成时间显示===> 状态字段名
showFinishTime("proc_status");
//清空签字意见
clearOpinion();

 
 function initPage() {
     //初始倒叙排序
     if (subTableModel.length > 0) {
         sortsubTableModel(subTableModel);
         _this.$nextTick(() => {
             subTableModel.forEach((item, index) => {
                 addsubTableModel(index);
             })
         })
     }
     removeClearButton();
 }
 
 /**
  * 增加子表的记录
  * @param {下标} index 
  */
 function addsubTableModel(index) {
     //创建人姓名当前用户
     if (subTableModel[index] && isEmpty(subTableModel[index]['creater'])) {
         subTableModel[index]['creater'] = currentUser.username;
         subTableModel[index]['creater_id'] = currentUser.account;
         //记录人记录人id
         subTableModel[index]['perf_users'] = currentUser.username;
         subTableModel[index]['perf_users_id'] = currentUser.account;
         subTableModel[index]['create_time'] = app.$Formulas.formatDate(new Date(), "YYYY-MM-DD HH:mm:ss")
     }
     cssMiddle(index);
 }
 
 /**
  * 添加子表监听
  */
 function addWatch() {
     const subTableModelKey = "data." + modelName + ".sub_" + subTableName + ".length";
     _this.$watch(subTableModelKey, function (nVal, oVal) {
         //发现脚本监听事件太多对性能造成了影响,做异步操作
         setTimeout(() => {
             if (nVal > oVal) {
                 //增加
                 addsubTableModel(nVal - 1);
             } else if (nVal < oVal) {
                 //减少
             }
         }, 0)
     })
 }
 
 /**
  * 单元格居中   去除复制按钮
  *
  */
 function cssMiddle(index) {
     const tds = $('body').find("section").last()
         .find('table').find('tbody').find('tr').eq(index)
         .children('td');
     tds.children("button").last().hide();
 }
 
 /**判断值是否为空 */
 function isEmpty(val) {
     return (typeof val === 'object') ?
         $.isEmptyObject(val) : !val;
 }
 
 /**
  * @description 时间倒叙排序,本脚本使用create_time字段排序
  * @param needArray
  * @param sortKey
  */
 function sortsubTableModel(needArray) {
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
             while (inner > 0 && dateLesser(readySortArr[inner - 1].create_time, readySortArr[inner].create_time)) {
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
     })
 }
 
 /**
  * @description 移除清空按钮,避免手滑清空了所有的数据
  */
 function removeClearButton() {
     const header = $("header").last();
     $(header.find('div')[0].childNodes[1]).hide();
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