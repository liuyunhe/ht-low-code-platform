<template>
  <div class="hot-table-main">
    <HotTable  class="hot-table" ref="hottable" :root="root" :settings="hotSettings" ></HotTable>
    <SubDataDetail ref="subDataDetail"></SubDataDetail>
  </div>
</template>
<script>
import utils from "@/utils.js";
import FormMath from "@/math.js";
import { HotTable } from "@handsontable/vue";
import SubDataDetail from "@/components/flow/SubDataDetail.vue";
import "handsontable/dist/handsontable.full.css";
import Handsontable from "handsontable";
import "handsontable/languages/zh-CN";
export default {
  name: "eip-hot-table",
  props: {
    options:String,
    initconf: String,
    permission: Object,
    isInitTemplateData: String,
    initFillDataType: String,
    addInitTemplateData: String,//允许添加初始化数据
    initSumRow: String,//初始化统计行
    name:String,
  },
  components: {HotTable,SubDataDetail},
  data() {
    return {
      root:'hot-table',
      myRenderer:this.rendererMe,
      subTablePath:'',
      formFields: [],
      formId: '',
      hotSettings: {
        data: [        //数据可以是二维数组，也可以是数组对象
          []
        ],
        className: "htCenter htMiddle", //单元格文字对齐方式(htLeft,htRight,htCenter)
        currentRowClassName: "my-selectRow", //给选中行添加自定义class类名
        currentColClassName: "my-selectCol", //给选中列添加自定义class类名
        autoWrapRow: true, //文字是否自动换行(当没有设置colWidths时生效)
        fixedColumnsLeft: 1,//固定左边列数
        fixedRowsTop: 0,//固定上边列数
        // fillHandle: true, //是否开启拖拽复制操作(true,false,'horizontal'水平复制,'vertical'垂直复制)
        autoRowSize: false,
        autoColumnSize: true,
        // highlightedRows:[],
        // readOnly:true,
        // comments: true,
        width: "100%",
        height:"80vh",
        stretchH:'all',
        language: "zh-CN",
        colHeaders: true, //['A', 'B', 'C'], //是否展示列表头,默认是A,B,C等字母,可以['列1','列2']进行自定义展示
        rowHeaders: true, //是否展示行表头,默认是1,2,3等数据,可以['行1','行2']进行自定义展示
        contextMenu:{
          items:{
          }
        },
        licenseKey: "non-commercial-and-evaluation",
        mergeCells: true,
        //contextMenu: true,
        wordWrap: true,//自动换行
        // mergeCells: true,
        // manualColumnFreeze: true, //手动固定列  ?
        // manualColumnMove: true, //手动移动列
        // manualRowMove: true,   //手动移动行
         manualColumnResize: true,//手工更改列距
         manualRowResize: true,//手动更改行距
        // comments: true, //添加注释  
        // customBorders:[],//添加边框
         columnSorting: false,
        // stretchH: 'all',//根据宽度横向扩展，last:只扩展最后一列，none：默认不扩展
        // fillHandle: true, //选中拖拽复制 possible values: true, false, "horizontal", "vertical"
        // fixedColumnsLeft: 1,//固定左边列数
        // fixedRowsTop: 0,//固定上边列数
        // beforeRemoveRow: this.beforeRemoveRowMe,
        afterCreateRow: this.afterCreateRowMe,
        afterChange: this.afterChangeMe,
        afterSelectionEnd: this.afterSelectionEndMe,
        renderer: this.rendererMe,
        cells: this.cellsMe,
        afterLoadData: this.afterLoadDataMe,
        mergeCells: [   //合并
            // {row: 1, col: 1, rowspan: 3, colspan: 3},  //指定合并，从（1,1）开始行3列3合并成一格
            // {row: 3, col: 4, rowspan: 2, colspan: 2}
        ],
        columns: [],
        hiddenColumns: {
          copyPasteEnabled: true,
          indicators: true,
          columns: []
        },
        nestedHeaders: null,
        // nestedHeaders: [
        //   // [{label: 'A', colspan: 3}, {label: 'B', colspan: 3}],
        //   ['A',{label: 'C', colspan: 2}, {label: 'F', colspan: 2}],
        //   ['A',{label: 'C', colspan: 2}, 'D', 'E'],
        //   ['会议室名称', '会议室地址', '备注', '楼层', '日期']
        // ],
        //启用公式库
        formulas: false,//暂时还不知道怎么数据怎么与配置结合，先不启用
        /** 
        支持的公式：
        任何数字，负数和正数，如浮点数或整数;
        算术运算，如：+，-，/，*，%，^，
        逻辑操作如：AND()，OR()，NOT()，XOR()，
        比较操作，如：=，>，>=，<，<=，<>;
        所有的JavaScript数学常量，如：PI()，E()，LN10()，LN2()，LOG10E()，LOG2E()，SQRT1_2()，SQRT2()，
        错误处理：#DIV/0!，#ERROR!，#VALUE!，#REF!，#NAME?，#N/A，#NUM!，
        字符串操作如:( &连接eq。=-(2&5)将返回-25）;
        公式中定义的所有excel 公式 ;
        相对和绝对单元格引用，如：A1，$A1，A$1，$A$1，
        内建变量，如：TRUE，FALSE，NULL，
        自定义变量;
        嵌套函数;
        动态更新。
        **/
      },
      mathExpMap:{},
      rowMathExpMap:{},
      mathExpItemMap:{},
      initCustDialogConf: {},
      customDialog: {},
      fillOrg: {},
      readOnlyColumnMap: {},
      cellStyleMap: {},//列样式
      mathRowCellMap: {},//计算单元格
      allMathExpList: {},//所有与计算相关的列
      crossMappings:{},//跨表取数设置
      crossMappingSubTables:[],//被取数的子表
      mainFieldMathMap: {},//涉及主表计算公式
      initRowData:{},
      allRowMathMap: {},//跨行运算公式
      firstSumMap:{},//首行汇总
      instId:'',//流程实例ID
      defId:'',//流程定义ID
      initDataBack:[],//初始化数据备份
      initSumRowField:'',//统计行标签字段
      initSumRowValue:'',//统计行标签字段值
      crossMappingFields:{},//跨表取数单元格
      mergeCellField:'',//合并单元格列
      readOnlyRowsMap: {},//单元格只读设置
      cellCalcs: [],//单元格计算公式
      requiredRowsMap:{},//必填设置，提交时校验
      fieldNameMap:{},
    };
  },
  computed: {
    hotInstance: function() {
      return this.$refs.hottable.hotInstance;
    }
  },
  mounted() {
    const formInst = utils.getOnlineFormInstance(this);
    if(formInst && formInst.$parent){
      let columnSort = true;
      if(formInst.$parent.instId){
        this.instId = formInst.$parent.instId;
        columnSort = false;
      }
      if(formInst.$parent.defId){
        this.defId = formInst.$parent.defId;
        columnSort = false;
      }
      //流程中不允许排序，在基础数据维护中允许排序
      this.hotSettings.columnSorting = columnSort;
    }
    if(this.options){
      let optionsJon = JSON.parse(this.options);
      this.subTablePath = optionsJon.subTablePath;
      let relations = optionsJon.colHeadersRelations;
      let isMathExp = false;//是否包含计算公式
      let _this = this;
      if(optionsJon.initSumRowField){
        this.initSumRowField = optionsJon.initSumRowField;
      }
      if(optionsJon.initSumRowValue){
        this.initSumRowValue = optionsJon.initSumRowValue;
      }
      //设置控件高度
      if(optionsJon.height){
        this.hotSettings.height = optionsJon.height + 'vh';
      }
      //收集单元格计算公式
      if(optionsJon.cellCalcs && optionsJon.cellCalcs.length>0){
        this.cellCalcs = [...optionsJon.cellCalcs];
        //计算单元格只读
        this.cellCalcs.forEach(cellCalc =>{
          const fieldName = cellCalc.cellField.split('.')[2];
          _this.readOnlyRowsMap[fieldName+'_'+(cellCalc.rowIndex-1)] = true;
        })
      }
      //收集表头、列合并单元格、计算公式、字段权限等
      if(relations && relations.length>0){
          let hotFieldPermission = this.permission?this.permission['fields'][optionsJon.boSubEntity]:[];
          let headers = [];
          let columns = [];
          let dataList = [[]];
          for (let index = 0; index < relations.length; index++) {
            let relation = relations[index];
            this.fieldNameMap[relation.name] = relation.desc;
            headers.push(relation.desc);
            _this.initRowData[relation.name] = '';
            let column = relation.column;
            column.className = 'htLeft';
            if(column.type == 'dropdown' && Array.isArray(column.source) && column.source.length>0){
              let sourceArray = [];
              column.source.forEach(item => {
                if(item.value!=''&&item.value!='undefined'){
                  sourceArray.push(item.value);
                }
              });
              column.source = sourceArray;
            }
            //收集计算公式
            if(column.mathExp){
              this.initMathMap(column);
              isMathExp = true;
            }
            if(column.rowMathExp && Array.isArray(column.rowMathExp) && column.rowMathExp.length>0){
              this.initRowMathMap(column);
              isMathExp = true;
            }
            //收集合并列
            if(column.mergeCell===true){
              const cellField = {field:column.data,index:index};
              if(!this.mergeCellField){
                this.mergeCellField = {...cellField};
              }else{
                this.addCellFieldChildren(this.mergeCellField,cellField);
              }
            }
            //应用流程表单权限
            if(hotFieldPermission[column.data]=='r'){
              column.readOnly = true;
            }else if(hotFieldPermission[column.data]=='n'){
              this.hotSettings.hiddenColumns.columns.push(index);
            }else if(hotFieldPermission[column.data]=='b'){
              column.required = true;
              this.requiredRowsMap[column.data] = true;
            }

            //收集只读
            if(column.readOnly){
              this.readOnlyColumnMap[index] = {field:column.data,desc:relation.desc};
            }else if(column.readOnlyRows){//单元格只读
              const readOnlyRows = column.readOnlyRows.split(',');
              readOnlyRows.forEach(rowIndex =>{
                _this.readOnlyRowsMap[column.data+'_'+(rowIndex-1)] = true;
              })
            }

            //收集必填
            if(column.required){
              this.requiredRowsMap[column.data] = {all:true};
            }else if(column.requiredRows){//单元格必填
              const requiredRows = column.requiredRows.split(',');
              _this.requiredRowsMap[column.data] = {all:false,rows:requiredRows};
            }

            //收集列样式
            this.handCellStyle(column);

            //收集首行汇总
            if(relation.isSum==true){
              this.firstSumMap[relation.name] = true;
            }

            columns.push(column);
          }
          //收集跨表取数设置
          let crossMapping = optionsJon.crossMapping;
          if(crossMapping  && Array.isArray(crossMapping) && crossMapping.length>0){
            let subTableMap = {};
            crossMapping.forEach(crossMap =>{
              const cfromFields = crossMap.fromFields;
              if(crossMap.toField && cfromFields && Array.isArray(cfromFields) && cfromFields.length>0){
                //收集跨表取数字段及位置（设置只读）
                const crossField = crossMap.toField.split('.')[2];
                if(!_this.crossMappingFields[crossField]){
                  _this.crossMappingFields[crossField] = {};
                }
                _this.crossMappingFields[crossField][crossMap.toIndex-1] = true;
                let subTableName = '';
                for (let k = 0; k < cfromFields.length; k++) {
                  const mfromFields = cfromFields[k].fromField.split('.');
                  const subPath = mfromFields[0]+'.'+mfromFields[1];
                  if(!_this.crossMappings[mfromFields[1]]){
                    _this.crossMappings[mfromFields[1]] = [];
                  }
                  if(!subTableMap[subPath]){
                    _this.crossMappingSubTables.push(subPath);
                    subTableMap[subPath] = true;
                  }
                  subTableName = mfromFields[1];
                }
                _this.crossMappings[subTableName].push(crossMap);
              }
            });
          }
          //收集主表计算设置
          this.initMainMathMap(optionsJon.mainTableCalcs);

          //收集所有计算公式相关单元格信息
          this.initAllMathField();
          //初始化嵌套表头
          this.initNestedHeaders(optionsJon,relations);
          this.hotSettings.colHeaders = headers;
          this.hotSettings.columns = columns;
          this.hotSettings.data = dataList;
          this.hotSettings.mergeCells = this.buildMergeCell(dataList);
      }
      //处理新增和删除权限
      this.handlerMenu(optionsJon, isMathExp);
      //获取子表字段属性
      // this.initFormFields();
    }
    if(this.initconf){
      const initConfJson = JSON.parse(this.initconf);
      if(initConfJson){
          this.initCustDialogConf = initConfJson;
          if((initConfJson.orgConfig && (initConfJson.orgConfig.id || 
            initConfJson.orgConfig.name || initConfJson.orgConfig.code || initConfJson.orgConfig.instId))){
            //初始化部门填制单位
            this.initFillOrg();
          }
      }
    }
  },
  methods: {
    addCellFieldChildren(field,children){
      if(field.children){
        return this.addCellFieldChildren(field.children,children)
      }else{
        field.children = children;
      }
    },
    initFillOrg(){
      let custDialog = this.initCustDialogConf;
      const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
      if(custDialog && custDialog.orgConfig && (custDialog.orgConfig.id ||custDialog.orgConfig.name || custDialog.orgConfig.code || custDialog.orgConfig.instId) 
      && !this.fillOrg.id){
        if(!localStorage.getItem("curFillOrg_"+currentUser.account)){
          let _this = this;
          _this.$http.get('${uc}/api/org/v1/org/getFillOrg').then(resp => {
              const rep = resp.data;
              if(rep.state){
                _this.fillOrg = rep.value;
                localStorage.setItem("curFillOrg_"+currentUser.account,JSON.stringify(rep.value));
              }else{
                _this.$message({
                  message: rep.message,
                  type: "warning"
                });
              }
          }, error => {
              _this.closeLoading(loading);
              _this.$message({
                message: "获取当前用户填制单位失败！",
                type: "warning"
              });
          })
        }else{
          this.fillOrg = JSON.parse(localStorage.getItem("curFillOrg_"+currentUser.account));
        }
      }

    },
    initMathMap(column){//收集行内计算公式
      if(column.mathExp){
        //收集计算单元格
        this.mathRowCellMap[column.data] = {};
        this.mathRowCellMap[column.data][-1] = true;

        this.mathExpMap[column.data] = column.mathExp;
        this.mathExpItemMap[column.data] = {};
        this.mathExpItemMap[column.data][column.data] = column.mathExp;
        const fields = this.parseFuncexpField(column.mathExp);
        if(fields){
          let _this = this;
          fields.forEach(field =>{
            const fieldArray = field.split('.');
            const na = fieldArray[1];
            const sa = fieldArray[3];
            if(!_this.mathExpItemMap[na]){
              _this.mathExpItemMap[na] = {};
            }
            _this.mathExpItemMap[na][column.data] = column.mathExp;
            if(!_this.mathExpItemMap[sa]){
              _this.mathExpItemMap[sa] = {};
            }
            _this.mathExpItemMap[sa][column.data] = column.mathExp;
          })
        }
      }
    },
    initRowMathMap(column){//收集跨行计算公式
      if(column.rowMathExp){
        const rowMathExp = column.rowMathExp;
        this.allRowMathMap[column.data] = rowMathExp;
        if(!this.mathRowCellMap[column.data]){
          this.mathRowCellMap[column.data] = {};
        }
        let _this = this;
        rowMathExp.forEach(item =>{
           //收集计算单元格
          _this.mathRowCellMap[column.data][item.sn-1] = true;
          var statFun = item.mathExp;
          var myregexp = /\[(.*?)\]/g;
          var match = myregexp.exec(statFun);
          var arrs = [];
          while (match != null) {
              var idx = match[1];
              const idexVal = idx.indexOf(':')==-1?_this.toNumber(idx):idx;
              var has = false;
              for (var i = 0, v; v = arrs[i++];) {
                  if (v == idexVal) has = true;
              }
              if (!has){
                arrs.push(idexVal);
                if(!_this.rowMathExpMap[column.data]){
                  _this.rowMathExpMap[column.data] = {};
                  _this.rowMathExpMap[column.data][idexVal] = [];
                }
                if(!_this.rowMathExpMap[column.data][idexVal]){
                  _this.rowMathExpMap[column.data][idexVal] = [];
                }
                _this.rowMathExpMap[column.data][idexVal].push(item);
              } 
              match = myregexp.exec(statFun);
          }
        });
      }
    },
    initMainMathMap(mainTableCalcs){//收集主表计算公式
      if(mainTableCalcs  && Array.isArray(mainTableCalcs) && mainTableCalcs.length>0){
        let mainFieldMathMap = {};
        mainTableCalcs.forEach(calc =>{
          if(calc.sumField && calc.mainField){
            const sumFieldPath = calc.sumField.split(".");
            mainFieldMathMap[sumFieldPath[2]] = calc;
          }
        });
        this.mainFieldMathMap = mainFieldMathMap;
      }
    },
    initAllMathField(){
      let _this = this;
      let rowMathMap = _this.rowMathExpMap;
      let mathMap = _this.mathExpMap;
      let mathExpItemMap = _this.mathExpItemMap;
      let rowExecArray = [];
      if(rowMathMap){
        for (const key in rowMathMap) {
          if (rowMathMap.hasOwnProperty(key)) {
            let rowMath = rowMathMap[key];
            let rowItem = {name:key,isAll:false,index:[]};
            for (const idx in rowMath) {
              if (rowMath.hasOwnProperty(idx)) {
                if(idx.indexOf(':')!=-1){
                  const fArray = idx.split(":");
                  if(fArray.length==2){
                    const a = _this.toNumber(fArray[0]);
                    const b = _this.toNumber(fArray[1]);
                    for (let i = a; i <= b; i++) {
                      rowItem.index.push(i);
                    }
                  }
                }else{
                  rowItem.index.push(_this.toNumber(_this.toNumber(idx)));
                }
              }
            }
            rowExecArray.push(rowItem);
          }
        }
      }
      if(mathMap){
        for (const ma in mathMap) {
          if (mathMap.hasOwnProperty(ma)){
            rowExecArray.push({name:ma,isAll:true});
          }
        }
      }
      if(rowExecArray && rowExecArray.length>0){
        _this.allMathExpList = rowExecArray;
      }
    },
    //初始化嵌套表头
    initNestedHeaders(options,headers){
      let _this = this;
      let getRowLable = function(cell){
         const start = cell.startField;
         const end = cell.endField;
         let colspan = 0;
         let isEnd = false;
         for (let i = 0; i < headers.length; i++) {
           if(!isEnd){
             if(start==headers[i].name){
                colspan++;
              }else if(end==headers[i].name){
                colspan++;
                isEnd = true;
              }else if(colspan>0){
                colspan++;
              }
           }
         }
         return {label: cell.name, colspan: colspan};
      }
      let getIsInNested = function(name,itemHeaders){
        let rowLable = null;
        itemHeaders.forEach(cell =>{
          if(!rowLable && name == cell.startField){
            rowLable = getRowLable(cell);
          }
        })
        return rowLable;
      }
      if(options && typeof(options.nestedHeaders)!='undefined' && options.nestedHeaders){
        let myNestedHeaders = [];
        options.nestedHeaders.forEach(row =>{
          let nestedHeader = [];
          for (let i = 0; i < headers.length; i++) {
            let rowLable = getIsInNested(headers[i].name,row.headers);
            if(!rowLable){
              nestedHeader.push(headers[i].desc);
            }else{
              nestedHeader.push(rowLable);
              i = i + rowLable.colspan -1;
            }
          }
          if(JSON.stringify(nestedHeader)!==JSON.stringify(headers)){
            myNestedHeaders.push(nestedHeader);
          }
        })
        if(myNestedHeaders.length>0){
          let headerArray = [];
          headers.forEach(myHeader =>{
            headerArray.push(myHeader.desc);
          })
          myNestedHeaders.push(headerArray);
          this.hotSettings.nestedHeaders = myNestedHeaders;
        }
      }
    },
    initFormFields(){
      const formInst = utils.getOnlineFormInstance(this);
      this.formId = formInst.$refs["onlineForm"].$parent.$parent.formId;
      if(this.formId && typeof(this.formId)!='undefined'){
          const paths = this.subTablePath.split('.');
          const entName = paths[1].split('sub_')[1];
          let _this = this;
          this.$http.get('${form}/form/form/v1/getFormFields?formId='+this.formId+'&entName='+entName).then(resp => {
              if(resp.data){
                _this.formFields = resp.data;
              }
          }, error => {})
      }
    },
    handlerMenu(optionsJon,isMathExp){
      if(this.permission && this.permission['table']){
        const tabPermission = this.permission['table'][optionsJon.boSubEntity];
        let __this = this;
        // this.hotSettings.contextMenu.items["row_detail"] = {name:'明细',callback:function(){
        //       let cell = this.getSelected()[0];
        //       const index = cell[0];
        //       const curData = __this.getHotTableData();
        //       __this.$refs['subDataDetail'].handleOpen(curData[index],__this.formFields);
        //     },
        // };
        if(tabPermission && tabPermission.add == true){
          this.hotSettings.contextMenu.items["row_above"] = {name:'上方插入一行'};
          this.hotSettings.contextMenu.items["row_below"] = {name:'下方插入一行'};
          this.hotSettings.contextMenu.items["row_up"] = {name:'上移',callback:function(){
              let cell = this.getSelected()[0];
              const index = cell[0];
              if (index === 0) {
                  __this.$message({
                    message: "已经是列表中第一位",
                    type: "warning"
                  });
                } else {
                  let dataList = __this.hotSettings.data;
                  const t = dataList[index - 1];
                  dataList[index - 1] = dataList[index];
                  dataList[index] = t;
                  __this.hotSettings.data = [];
                  __this.hotSettings.data = dataList;
                }
            },
          };
          this.hotSettings.contextMenu.items["row_down"] = {name:'下移',callback:function(){
              let cell = this.getSelected()[0];
              const index = cell[0];
              let dataList = __this.hotSettings.data;
              if (index === dataList.length - 1) {
                  __this.$message({
                    message: "已经是列表中最后一位",
                    type: "warning"
                  });
                } else {
                  var t = dataList[index + 1];
                  dataList[index + 1] = dataList[index];
                  dataList[index] = t;
                  __this.hotSettings.data = [];
                  __this.hotSettings.data = dataList;
                }
            },
        };
        if(tabPermission && tabPermission.del == true){
            this.hotSettings.contextMenu.items["remove_row"] = {name:'删除行'};
        }
      }
     }
    },
    handCellStyle(column){
      if(column.style){
        let cstyle = '';
        if(column.style.diyStyle){
          cstyle = column.style.diyStyle;
        }else{
          if(column.style.background){
            cstyle = 'background-color:'+column.style.background+';';
          }
          if(column.style.bold){
            cstyle = cstyle +'font-weight: bold;';
          }
          if(column.style.size){
            cstyle = cstyle +'font-size:'+column.style.size+'px;';
          }
          if(column.style.color){
            cstyle = cstyle +'color:'+column.style.color+';';
          }
        }
        if(cstyle){
          this.cellStyleMap[column.data] = cstyle;
        }
      }
    },
    cellsMe(row, col, prop){
      let cellProperties = {renderer:this.rendererMe};
      //计算公式单元格设置只读
      if(this.mathRowCellMap[prop] && (this.mathRowCellMap[prop][-1]===true || this.mathRowCellMap[prop][row]===true)){
        cellProperties['readOnly'] = true;
      }else if(this.crossMappingFields[prop] && this.crossMappingFields[prop][row]===true){
        cellProperties['readOnly'] = true;
      }else if(this.firstSumMap[prop] && row==0){
        cellProperties['readOnly'] = true;
      }else if(this.readOnlyRowsMap[prop+'_'+row] === true){
        cellProperties['readOnly'] = true;
      }
      return cellProperties;
    },
    afterLoadDataMe(){
      // if(this.isInitTemplateData!=='true' && this.hotSettings.data && this.hotSettings.data.length==1 && 
      //   Array.isArray(this.hotSettings.data[0])){
      //   this.hotSettings.data[0] = {...this.initRowData};
      // }
      //this.hotInstance.render();
    },
    rendererMe(instance, td, row, col, prop, value, cellProperties){
      Handsontable.renderers.TextRenderer.apply(this, arguments);
      
      if (this.cellStyleMap[prop]) {
          td.style = this.cellStyleMap[prop];
      }
      td.style.lineHeight = '22px';
      if(this.mathRowCellMap[prop] && (this.mathRowCellMap[prop][-1]===true || this.mathRowCellMap[prop][row]===true)){
        cellProperties['readOnly'] = true;
        td.style.background = '#F5F7FA';
      }else if(this.crossMappingFields[prop] && this.crossMappingFields[prop][row]===true){
        cellProperties['readOnly'] = true;
        td.style.background = '#F5F7FA';
      }else if(this.firstSumMap[prop] && row==0){
        cellProperties['readOnly'] = true;
        td.style.background = '#F5F7FA';
      }else if(this.readOnlyRowsMap[prop+'_'+row] === true){
         cellProperties['readOnly'] = true;
         td.style.background = '#F5F7FA';
      }
    },
    buildMergeCell(dataList){
      if(!dataList){
        dataList = this.getHotTableData();
      }
      if(dataList && dataList.length == 1 && Object.keys(dataList[0]).length==0){
        return ;
      }
      let mergeCells = [];
      const mergef = {row:0, col:0, rowspan: dataList.length, colspan:1};
      this.getChildrenMergeCell(mergeCells, dataList, mergef, this.mergeCellField);
      this.mergeCells = mergeCells;
      return mergeCells;
    },
    getChildrenMergeCell(mergeCells, dataList, merge, field){
      let mfield = field;
      let mergeMap = {};
      let indexMap = {};
      for (let i = merge.row; i < merge.row+merge.rowspan; i++) {
          const item = dataList[i];
          indexMap[mfield.field] = mfield.index;
          if(!mergeMap[mfield.field]){
            mergeMap[mfield.field] = {value:item[mfield.field],size:1,startRow:i};
          }else{
            let omfield = mergeMap[mfield.field];
            if(omfield.value==null || omfield.value== 'null' || omfield.value =='undefined' || omfield.value==='' || omfield.value!=item[mfield.field]){
              if(omfield.size>1){
                const mergef = {row:omfield.startRow, col:mfield.index, rowspan:omfield.size, colspan:1};
                mergeCells.push({...mergef});
                if(mfield.children){
                  this.getChildrenMergeCell(mergeCells, dataList, mergef, mfield.children);
                }
              }
              delete mergeMap[mfield.field];
              mergeMap[mfield.field] = {value:item[mfield.field],size:1,startRow:i};
            }else{
              omfield.size++;
              mergeMap[mfield.field] = omfield;
            }
          }
      }
      for (const key in mergeMap) {
        if (mergeMap.hasOwnProperty(key)) {
          const merge = mergeMap[key];
          if(merge.size>1){
            const mergef = {row:merge.startRow, col:indexMap[key], rowspan:merge.size, colspan:1};
            mergeCells.push({...mergef});
            if(mfield.children){
              this.getChildrenMergeCell(mergeCells, dataList, mergef, mfield.children);
            }
          }
        }
      }
    },
    beforeRemoveRowMe: function (changes, source) { // 数据改变时触发此方法
      
    },
    // 添加行
    afterCreateRowMe: function (changes) {
      this.hotSettings.data[changes] = {...this.initRowData};
      if(Array.isArray(this.hotSettings.data[0])){
        this.hotSettings.data[0] = {...this.initRowData};
        this.hotSettings.data[0] = this.fillOrgDataField(this.hotSettings.data[0]);
      }
      this.hotSettings.data[changes] = this.fillOrgDataField(this.hotSettings.data[changes]);
    },
    // 新增行时，动态改变值
    afterChangeMe: function (changes, source) {
      if(source =='edit' || source == 'Autofill.fill'){
          //执行计算公式
          //this.execMathExpSingle(changes);
          //this.execMathExpAll(changes);
          this.execInCellMathExp(null,changes);
      }else if(source == 'CopyPaste.paste' && changes && changes.length>0){
        let hotData = this.getBackMergeData();
        let isChange = false;
        if(hotData){
          changes.forEach(change =>{
              let changeIndex = change[0]
              let changeField = change[1];
              let changeValue = change[3];
              if(changeValue==='　'){
                hotData[changeIndex][changeField] = '';
                isChange = true;
              }
          });
          if(isChange){
            this.hotSettings.data = [];
            this.hotSettings.data = hotData;
          }
          try {
            this.execCrossMapping();//执行跨表取数
            this.execCellMathExp(hotData);//执行计算公式 
          } catch (error) {
            console.log(error);
          }
        }
      }
    },
    execMathExpAll(changes){
      if (changes && changes.length>0) {
          let _this = this;
          let isChange = false;
          let hotData = this.getBackMergeData();
          let fsumMap = this.firstSumMap;
          let changeFields = {};
          changes.forEach(change =>{
            //执行跨行计算公式
            let changeIndex = change[0]
            let changeField = change[1];
            changeFields[changeField] = true;
            //执行行内计算公式
            const exeMathResult = _this.exeAllMathExp(hotData,_this,changeIndex,isChange);
            hotData = exeMathResult.data;
            if(exeMathResult.isChange){
              isChange = exeMathResult.isChange;
            }
          })
          
          //执行跨行计算公式
          const exeRowResult = _this.exeAllRowMathExp(hotData,_this,isChange);
          hotData = exeRowResult.data;
          if(exeRowResult.isChange){
            isChange = exeRowResult.isChange;
          }

          //执行单元格计算公式
          const exeCellResult = _this.exeCellMathExp(hotData,_this,isChange);
          hotData = exeCellResult.data;
          if(exeCellResult.isChange){
            isChange = exeCellResult.isChange;
          }
          

          //执行首行汇总
          if('{}'!=JSON.stringify(fsumMap)){
              for (let sumKey in fsumMap) {
                if (fsumMap.hasOwnProperty(sumKey)) {
                  const tempResult = _this.exeFirstRowSum(hotData,sumKey,_this,isChange,fsumMap);
                  hotData = tempResult.data;
                  if(tempResult.isChange){
                    isChange = tempResult.isChange;
                  }
                }
              }
          }
          
          //执行主表统计公式
          for (let cField in changeFields) {
            if (changeFields.hasOwnProperty(cField)) {
              _this.exeMainFieldMathExp(hotData,cField,_this);
            }
          }
          
          if(isChange){
            this.hotSettings.data = [];
            this.hotSettings.data = hotData;
          }
          if(this.mergeCells && this.mergeCells.length>0){
            this.hotSettings.mergeCells = this.buildMergeCell(hotData);
          }
      }
    },
    exeAllMathExp(hotData,_this,fieldIndex,isChange){//执行所有行内运算
      if(_this.mathExpMap){
        for (const fieldName in _this.mathExpMap) {
          //如果行内运算对应单元格包含跨行运算，则以跨行运算为主，不进行行内运算
          if(_this.mathExpMap.hasOwnProperty(fieldName) && !this.isInRowMath(fieldName,fieldIndex)){
            const curexp =  _this.mathExpMap[fieldName];
            let curvalue = this.calcExpValue(curexp,hotData,fieldIndex);
            if(hotData[fieldIndex]){
              hotData[fieldIndex][fieldName] = curvalue;
              isChange = true;
            }
          }
        }
        return {data:hotData,isChange:isChange};
      }
    },
    //判断行内运算的单元格是否包含跨行运算
    isInRowMath(field,fieldIndex){
      var isIn = false;
      if(this.allRowMathMap && this.allRowMathMap[field]){
        const rowMaths = this.allRowMathMap[field];
        if(rowMaths && rowMaths.length>0){
          rowMaths.forEach(mathItem =>{
            if((mathItem.sn-1) ==fieldIndex){
              isIn = true;
              return true;
            }
          })
        }
      }
      return isIn;
    },
    exeAllRowMathExp(hotData,_this,isChange){//执行所有跨行运算
      if(_this.allRowMathMap){
        for (const fieldName in _this.allRowMathMap) {
          if(_this.allRowMathMap.hasOwnProperty(fieldName)){
            let frowMaths = _this.allRowMathMap[fieldName];
            if(frowMaths && frowMaths.length>0){
              frowMaths.forEach(mathItem =>{
                if(hotData[mathItem.sn-1]){
                  const value = _this.calcRowsExpValue(mathItem.mathExp,hotData,fieldName);
                  hotData[mathItem.sn-1][fieldName] = value;
                  isChange = true;
                }
              })
            }
          }
        }
      }
      return {data:hotData,isChange:isChange};
    },
    exeCellMathExp(hotData,_this,isChange){//执行所有单元格计算公式
      if(_this.cellCalcs && _this.cellCalcs.length>0){
        const formInst = utils.getOnlineFormInstance(this);
        _this.cellCalcs.forEach(item =>{
          const fieldName = item.cellField.split('.')[2];
          if(hotData[item.rowIndex-1]){
            const value = _this.calcCellExpValue(item.mathExp,hotData,formInst);
            hotData[item.rowIndex-1][fieldName] = value;
            isChange = true;
          }
        });
      }
      return {data:hotData,isChange:isChange};
    },
    exeFirstRowSum(hotData,fieldName,_this,isChange,fsumMap){
      if(hotData && hotData.length>0){
        if(fsumMap[fieldName]===true){
          let exeValue = _this.sumCol(hotData, fieldName, true, _this);
          hotData[0][fieldName] = this.tofixed(exeValue, 2);
          isChange = true;
        }
      }
      return {data:hotData,isChange:isChange};
    },
    sumCol(data, field, outFirst, _this){//汇总某列数据，
      let sum = 0;
      if(data && data.length>0){
        for (let index = 0; index < data.length; index++) {
          if(!(outFirst && index==0)){
            const el = data[index];
            sum += _this.toNumber(el[field]);
          }
        }
      }
      return sum;
    },
    //执行跨行计算公式
    exeRowMathExp(hotData,fieldIndex,fieldName,_this,isChange,isRepeat){
      //const fieldIndex = ffieldIndex+1;//_this.rowMathExpMap[column.data]
      //执行当前字段涉及的计算公式（为了保证执行顺序，先执行当前编辑字段相关计算公式）
      for (const rme in _this.rowMathExpMap) {
        if(_this.rowMathExpMap.hasOwnProperty(rme)){
          let frowMaths = _this.rowMathExpMap[rme];
          let expArray = [];
          if(frowMaths){
            if(frowMaths[fieldIndex]){
              expArray.push(fieldIndex);
            }
            for (const fm in frowMaths) {
              if (frowMaths.hasOwnProperty(fm)) {
                if(fm.indexOf(":")!=-1){
                  const fArray = fm.split(":");
                  if(fArray.length==2){
                    const a = _this.toNumber(fArray[0]);
                    const b = _this.toNumber(fArray[1]);
                    if(fieldIndex>=a && fieldIndex<=b){
                      expArray.push(fm);
                    }
                  }
                }
              }
            }
          }
          if(expArray.length>0){
           //先执行直接关联的单元格计算
            expArray.forEach(expKey =>{
              const expItems = _this.rowMathExpMap[fieldName][expKey];
              expItems.forEach(eItem =>{
                  let value = _this.calcRowsExpValue(eItem.mathExp,hotData,fieldName);
                  if(hotData[eItem.sn-1]){
                    hotData[eItem.sn-1][fieldName] = value;
                    isChange = true;
                  }
              });
            })
          }
        }
      }
      return {data:hotData,isChange:isChange};
    },
    //执行行内计算公式
    exeMathExp(hotData,fieldIndex,fieldName,_this,isChange,isRepeat){
      //执行当前字段涉及的计算公式（为了保证执行顺序，先执行当前编辑字段相关计算公式）
      const curExpMap = _this.mathExpItemMap[fieldName];
      if(curExpMap){
        for (const curkey in curExpMap) {
          if (curExpMap.hasOwnProperty(curkey)) {
            const curexp = curExpMap[curkey];
            let curvalue = this.calcExpValue(curexp,hotData,fieldIndex);
            if(hotData[fieldIndex]){
              hotData[fieldIndex][curkey] = curvalue;
              isChange = true;
              //执行主表统计公式
              _this.exeMainFieldMathExp(hotData,curkey,_this);
            }
          }
        }
        //执行其他字段涉及的计算公式（防止有关联计算）
        for (const itemKey in _this.mathExpItemMap) {
          if (_this.mathExpItemMap.hasOwnProperty(itemKey) && fieldName!=itemKey) {
            const expMap = _this.mathExpItemMap[itemKey];
            for (const key in expMap) {
              if (expMap.hasOwnProperty(key)) {
                const exp = expMap[key];
                let value = this.calcExpValue(exp,hotData,fieldIndex);
                if(hotData[fieldIndex]){
                  hotData[fieldIndex][key] = value;
                  isChange = true;
                  //执行主表统计公式
                   _this.exeMainFieldMathExp(hotData,key,_this);
                }
              }
            }
          }
        }
      }
      if(isRepeat){
        return _this.exeMathExp(hotData,fieldIndex,fieldName,_this,isChange,false);
      }else{
        return {data:hotData,isChange:isChange};
      }
    },
    //执行主表字段统计公式
    exeMainFieldMathExp(hotData,fieldName,_this){
      const calc = this.mainFieldMathMap[fieldName];
      if(calc){
        let sumValue = 0;
        let _this = this;
        if(calc.mainField && hotData && hotData.length>0){
          hotData.forEach(item =>{
            sumValue += _this.toNumber(item[fieldName]);
          })
        }
        const formInst = utils.getOnlineFormInstance(this);
        if(formInst && formInst['data']){
          const mainFieldPath = calc.mainField.split(".");
          formInst['data'][mainFieldPath[0]][mainFieldPath[1]] = sumValue;
        }
      }
    },
    //单元格被选中，如果是只读，提示权限信息
    afterSelectionEndMe(r, c, r2, c2){
      const readOnlyField = this.readOnlyColumnMap[c];
      if(r==r2 && c==c2 && readOnlyField){
        this.$message({
          message: "字段【"+readOnlyField['desc']+"】不可填写！",
          type: "warning"
        });
      }else if(this.hotSettings.columns[c]){
        const fieldName = this.hotSettings.columns[c]['data'];
        if(fieldName && this.readOnlyRowsMap[fieldName+'_'+r] === true){
          this.$message({
            message: "当前单元格不可填写！",
            type: "warning"
          });
        }else if(fieldName && this.mathRowCellMap[fieldName] && 
            (this.mathRowCellMap[fieldName][-1]===true || this.mathRowCellMap[fieldName][r]===true)){
          this.$message({
            message: "当前为计算单元格，不可填写！",
            type: "warning"
          });
        }else if(this.crossMappingFields[fieldName] && this.crossMappingFields[fieldName][r]===true){
          this.$message({
            message: "当前为跨表取数单元格，不可填写！",
            type: "warning"
          });
        }else if(this.firstSumMap[fieldName] && r==0){
          this.$message({
            message: "当前为汇总单元格，不可填写！",
            type: "warning"
          });
        }
      }
    },
    toNumber(x) {
        if (typeof(x)=='undefined' || x === null || x === undefined || x === '')
            return 0;
        if (typeof x == "string") {
            x = x.replace(/,/g, "");
        }
        var match = x.toString().match(/([$|￥])\d+\.?\d*/);
        if (match) {
            x = x.replace(match[1], '');
        }
        return Number(x);
    },
    calcExpValue(exp, scope, subIndex) {
        if (!exp) return 0;
        var reg = /([\[|\{]).*?\((.*?)\)[\}|\]]/g;
        let _this = this;
        exp = exp.replace(reg, function () {
            var symbol = arguments[1],
                name = arguments[2],
                value = 0;
            if (scope) {
                //子表统计计算情况，多行数据
                if (symbol == '[') {
                    var valArray = [];
                    var subMsg = name.split(".");
                    if (subMsg.length < 1) {
                        throw `子表统计的表达式${name}错误`;
                    }
                    const subMsgSize = subMsg.length;
                    var fieldName = subMsg[subMsgSize - 1];
                    var fvalue = 0;
                    if(scope[subIndex] && scope[subIndex][fieldName]){
                      fvalue = _this.toNumber(scope[subIndex][fieldName]);
                    }
                    valArray.push(fvalue);
                    value = `[${valArray.join(',')}`;
                } else {
                    var subMsg = name.split(".");
                    var fieldName = subMsg[subMsg.length - 1];
                    var val = scope[subIndex]?_this.toNumber(scope[subIndex][fieldName]):0;
                    val = _this.toNumber(val);
                    if (!isNaN(val) && "" != val) value = val;
                }
            }
            if (!value) {
                value = 0;
            }
            if(value<0){
              value = '('+value+')';
            }
            return value;
        });
        exp = exp.replace(/[|\[|\]]/g,"");
        if (exp.substring(0, 16) != "FormMath.tofixed") {
            return this.isValue(this.tofixed(eval(`(${exp})`), 0));
        }
        try {
           return this.isValue(eval(`(${exp})`));
        } catch (error) {
          _this.$message({
              message: "计算公式执行失败："+error,
              type: "error"
            });
          return 0;
        }
    },
    calcRowsExpValue(exp, scope, fName) {
        if (!exp) return 0;
        var reg = /\[(.*?)\]/g;
        let _this = this;
        exp = exp.replace(reg, function () {
            var symbol = arguments[1],
                cindex = arguments[2],
                expStr = arguments[3],
                value = 0;
            if (scope) {
                if (symbol.indexOf(':')>-1) {
                    var sumStr = expStr.substring(cindex-13, cindex-1);
                    if(sumStr === 'FormMath.sum'){
                      var idxArray = symbol.split(':');
                      var a = _this.toNumber(idxArray[0]);
                      var b= _this.toNumber(idxArray[1]);
                      var tempValue = [];
                      for (let index = a; index <= b; index++) {
                        var rowIndex = index -1;
                        if(scope[rowIndex]){
                          tempValue.push(_this.toNumber(scope[rowIndex][fName]));
                        }
                      }
                      value = "["+tempValue+"]";
                    }
                } else {
                    var val = 0;
                    var rowIndex = _this.toNumber(symbol)-1;
                    if(scope[rowIndex]){
                      val = _this.toNumber(scope[rowIndex][fName]);
                    }
                    val = _this.toNumber(val);
                    if (!isNaN(val) && "" != val) value = val;
                }
            }
            if (!value) {
                value = 0;
            }
            if(value<0){
              value = '('+value+')';
            }
            return value;
        });
        if (exp.substring(0, 16) != "FormMath.tofixed") {
            return this.isValue(this.tofixed(eval(`(${exp})`), 0));
        }
        let resultValue = 0;
        try {
          resultValue = this.isValue(eval(`(${exp})`));
        } catch (error) {
          _this.$message({
              message: "计算公式执行失败："+error,
              type: "error"
            });
        }
        return resultValue;
    },
    calcCellExpValue(exp, scope, formInst) {
        if (!exp) return 0;
        var reg = /([\[|\{]).*?\((.*?)\)[\}|\]]/g;
        let _this = this;
        let subDataMap = {};
        subDataMap[_this.subTablePath] = scope;
        exp = exp.replace(reg, function () {
            var symbol = arguments[1],
                name = arguments[2],
                value = 0;
            if (scope) {
                //子表统计计算情况，多行数据
                if (symbol == '[') {
                    var valArray = [];
                    var subMsg = name.split(".");
                    if (subMsg.length < 1) {
                        throw `子表统计的表达式${name}错误`;
                    }
                    const subMsgSize = subMsg.length;
                    var fvalue = 0;
                    if(subMsgSize>3){
                      var fieldNameStr = subMsg[subMsgSize - 1];
                      const indexStr = fieldNameStr.match(/\[(.+?)\]/g);
                      let subIndex = _this.toNumber(indexStr[0].replace(/\[(.+?)\]/g,'$1'))-1;
                      let fName = fieldNameStr.replace(indexStr[0],'');
                      let subPath = subMsg[1]+'.'+subMsg[2];
                      if(!subDataMap[subPath] && _this.subTablePath != subPath){
                        const hotTableRef = 'hottable.'+subPath;
                        const hotTableObj = formInst.$refs["onlineForm"].$refs[hotTableRef];
                        if(hotTableObj){
                          subDataMap[subPath] = formInst.$refs["onlineForm"].$refs[hotTableRef].getHotTableData();
                        }else{
                          const paths = subPath.split('.');
                          if(formInst.data[paths[0]] && formInst.data[paths[0]][paths[1]]){
                            subDataMap[subPath] = formInst.data[paths[0]][paths[1]];
                          }
                        }
                      }
                      if(subDataMap[subPath]){
                        let subData  = [...subDataMap[subPath]];
                        if(subData[subIndex] && subData[subIndex][fName]){
                          fvalue = _this.toNumber(subData[subIndex][fName]);
                        }
                      }
                    }else if(formInst.data[subMsg[1]] && formInst.data[subMsg[1]][subMsg[2]]){
                      fvalue = _this.toNumber(formInst.data[subMsg[1]][subMsg[2]]);
                    }
                    valArray.push(fvalue);
                    value = `[${valArray.join(',')}`;
                } else {
                    var subMsg = name.split(".");
                    var fieldName = subMsg[subMsg.length - 1];
                    var val = 0;
                    if(formInst.data[subMsg[1]] && formInst.data[subMsg[1]][subMsg[2]]){
                      val = _this.toNumber(formInst.data[subMsg[1]][subMsg[2]]);
                    }
                    if (!isNaN(val) && "" != val) value = val;
                }
            }
            if (!value) {
                value = 0;
            }
            if(value<0){
              value = '('+value+')';
            }
            return value;
        });
        exp = exp.replace(/[|\[|\]]/g,"");
        if (exp.substring(0, 16) != "FormMath.tofixed") {
            return this.isValue(this.tofixed(eval(`(${exp})`), 0));
        }
        try {
           return this.isValue(eval(`(${exp})`));
        } catch (error) {
          _this.$message({
              message: "计算公式执行失败："+error,
              type: "error"
            });
          return 0;
        }
    },
    getValueByPath(path,subIndex){
      let obj = this.hotSettings.data;
      if (!obj || !path || path.constructor != String) {
            return null;
        }
        if (!/^\w?.*[\w|\]]$/.test(path)) {
            return null;
        }
        let pathAry = path.split(".");
        if (pathAry.length == 1) {
            return obj[path];
        }
        else if (pathAry.length > 1) {
            let ret = obj;
            for (var i = 0; i < pathAry.length; i++) {
                if (ret === null || ret === undefined) {
                    return null;
                }
                const key = pathAry[i];
                const match = /^(\w+)\[(\d+)\]$/.exec(key);
                if (match) {
                    ret = ret[match[1]][match[2]];
                }
                else if (ret && ret.constructor === Array) {
                    let index = 0;
                    if (subIndex != null && subIndex != undefined) {
                        let preIndex = Number.parseInt(subIndex);
                        if (!isNaN(preIndex)) {
                            index = preIndex;
                        }
                    }
                    ret = ret[index][key];
                }
                else {
                    ret = ret[key];
                }
            }
            return ret;
        }
        return null;
    },
    isValue(value) {
        if (!value) {
            return "";
        } else if (value == "Infinity") {
            return "";
        } else {
            return value;
        }
    },
    tofixed(x, b) {
        var tmp = this.toNumber(x);
        b = this.toNumber(b);
        if (isNaN(tmp) || tmp === "" || isNaN(b)) return x;
        return tmp.toFixed(b);
    },
    parseFuncexpField(statFun){
      var myregexp = /[{|[].*?\((.*?)\)[}|\]]/g;
      var match = myregexp.exec(statFun);
      var arrs = [];
      while (match != null) {
          var str = match[1];
          var has = false;
          for (var i = 0, v; v = arrs[i++];) {
              if (v == str) has = true;
          }
          if (!has) arrs.push(str);
          match = myregexp.exec(statFun);
      }
      return arrs;
    },
    fillbackHotTableData(subData,needExecCross){
      if(subData && subData.length>0){
        this.hotSettings.data = JSON.parse(JSON.stringify(subData));
        const mergeCells = this.buildMergeCell(subData);
        if(mergeCells && typeof(mergeCells)!='undefined'){
          this.hotSettings.mergeCells = mergeCells;
        }
        if(needExecCross!==false){
          try {
            //this.execCrossMapping();//执行跨表取数
          } catch (error) {}
        }
        this.execInCellMathExp(subData);
      }else{
        this.hotSettings.data = [[]];
      }
    },
    mergeCellRefresh(){//执行合并单元格
      let data = this.getBackMergeData();
      this.hotSettings.mergeCells = this.buildMergeCell(data);
    },
    execCellMathExp(data){
      //这里执行3遍 防止包含行内计算和跨行计算先后顺序都有的情况
      this.execInCellMathExp(data);
      this.execInCellMathExp();
      this.execInCellMathExp();
    },
    execInCellMathExp(data,changes){//执行计算公式
      if(!data){
        data = this.getBackMergeData();
      }
      let isneedFsum = false;
      if(!changes){
        changes = [];
      }
      if(changes.length>0 || (this.allMathExpList && this.allMathExpList.length>0 && data && data.length>0) || (this.cellCalcs || this.cellCalcs.length>0)){
        let items = this.allMathExpList;
        if(items && items.length>0){
          const dataSize = data.length;
          items.forEach(item =>{
            if(item.isAll){
              for (let i = 0; i < dataSize; i++) {
                changes.push({0:i,1:item['name']});
              }
            }else{
              if(item.index && item.index.length>0){
                for (let i = 0; i < item.index.length; i++) {
                  changes.push({0:item.index[i],1:item['name']});
                }
              }
            }
          });
        }
        const cellCalcs = this.cellCalcs;
        if(cellCalcs && cellCalcs.length>0){
          const cellCalc = cellCalcs[0];
          changes.push({0:cellCalc.rowIndex,1:cellCalc.cellField.split('.')[2]});
        }
        if(changes && changes.length>0){
          //this.execMathExpSingle(changes);
          this.execMathExpAll(changes);
        }else{
          isneedFsum = true;
        }
      }else{
        isneedFsum = true;
      }
      if(isneedFsum){
        //执行首行汇总
          let fsumMap = this.firstSumMap;
          if('{}'!=JSON.stringify(fsumMap)){
            let _this = this;
            let isChange = false;
            let hotData = this.getHotTableData();
            for (let sumKey in fsumMap) {
              if (fsumMap.hasOwnProperty(sumKey)) {
                const tempResult = _this.exeFirstRowSum(hotData,sumKey,_this,isChange,fsumMap);
                hotData = tempResult.data;
                if(tempResult.isChange){
                  isChange = tempResult.isChange;
                }
              }
            }
            if(isChange){
              this.hotSettings.data = [];
              this.hotSettings.data = hotData;
            }
            if(this.mergeCells && this.mergeCells.length>0){
              this.hotSettings.mergeCells = this.buildMergeCell(hotData);
            }
          }
      }
    },
    execCrossMapping(){
      if(this.crossMappings && this.crossMappingSubTables.length>0){
        let subData = {};
        let curData = this.getHotTableData();
        let _this = this;
        const formInst = utils.getOnlineFormInstance(this);
        this.crossMappingSubTables.forEach(sub =>{
          const hotTableRef = 'hottable.'+sub;
          const hotTableObj = formInst.$refs["onlineForm"].$refs[hotTableRef];
          if(hotTableObj){
            subData[sub] = formInst.$refs["onlineForm"].$refs[hotTableRef].getHotTableData();
          }else{
            const paths = sub.split('.');
            if(formInst.data[paths[0]] && formInst.data[paths[0]][paths[1]]){
               subData[sub] = formInst.data[paths[0]][paths[1]];
            }
          }
        });
        let isChange = false;
        for (const subTablePath in _this.crossMappings) {
          if (_this.crossMappings.hasOwnProperty(subTablePath)) {
            const toFList = _this.crossMappings[subTablePath];
            toFList.forEach(map =>{
              const fromFields = map['fromFields'];
              const toIndex = _this.toNumber(map['toIndex'])-1;
              const toFieldPath = map['toField'].split('.');
              if(fromFields && fromFields.length>0 && curData[toIndex]){
                let sumValue = 0;
                for (let i = 0; i < fromFields.length; i++) {
                  const field = fromFields[i];
                  const fromFieldPath = field.fromField.split('.');
                  const fromIndex = _this.toNumber(field['fromIndex'])-1;
                  const subPath = fromFieldPath[0]+'.'+fromFieldPath[1];
                  if(subData[subPath] && subData[subPath][fromIndex] && curData[toIndex]){
                    if(typeof subData[subPath][fromIndex][fromFieldPath[2]] !='undefined'){
                        const tempValue = subData[subPath][fromIndex][fromFieldPath[2]];
                        sumValue += _this.toNumber(tempValue);
                    }
                  }
                }
                curData[toIndex][toFieldPath[2]] = sumValue;
                isChange = true;
              }
            });
          }
        }
        if(isChange){
          this.fillbackHotTableData(curData,false);
        }
      }
    },
    getBackMergeData(exeMath){//获取恢复合并单元格后的数据
      //取数前先执行跨表取数和计算公式
      if(exeMath===true){
        try {
         this.execCrossMapping();//执行跨表取数
         this.execCellMathExp();//执行计算公式 
        } catch (error) {
          console.log(error);
        }
      }
      let data = this.hotSettings.data;
      let row = this.initRowData;
      let _this = this;
      //处理初始化时的第一行数据类型为数组转json为空问题
      if(data && data.length>0 && Array.isArray(data[0]) && row && JSON.stringify(row)!='{}'){
        let newRow = {};
        let oldRow = this.hotSettings.data[0];
        for (const key in row) {
          if (row.hasOwnProperty(key)) {
            newRow[key] = typeof(oldRow[key])=='undefined'?'':oldRow[key];
          }
        }
        data[0] = newRow;
        this.hotSettings.data[0] = newRow;
      }
      if(data && data.length == 1 && JSON.stringify(data[0])==JSON.stringify(this.initRowData)){
        return [];
      }
      let mergeCells = this.mergeCells;
      if(mergeCells && mergeCells.length>0 && data && data.length>0){
        let columns = this.hotSettings.columns;
        mergeCells.forEach(item =>{
          const rowIndex = item.row;
          if(data[rowIndex]){
            const rowspan = item.rowspan;
            const field = columns[item['col']]['data'];
            const baseValue = data[rowIndex][field];
            for (let index = rowIndex; index < rowIndex+rowspan; index++) {
              if(data[index]){
                  data[index][field] = baseValue;
              }
            }
          }
        });
      }
      //处理填制单位（复制的时候）
      let custDialog = this.initCustDialogConf
      if(data && data.length>0 && custDialog && custDialog.orgConfig && ((custDialog.orgConfig.name && this.fillOrg.id)||custDialog.orgConfig.instId)){
        const fillFillObj = this.getOrgFillFieldObj(custDialog);
        if(fillFillObj.orgNameField || fillFillObj.orgIdField || fillFillObj.orgCodeField || fillFillObj.instIdField){
          data.forEach(item =>{
            if(fillFillObj.orgNameField && !item[fillFillObj.orgNameField]){
              item[fillFillObj.orgNameField] = _this.fillOrg.name;
            }if(fillFillObj.orgIdField && !item[fillFillObj.orgIdField]){
              item[fillFillObj.orgIdField] = _this.fillOrg.id;
            }if(fillFillObj.orgCodeField && !item[fillFillObj.orgCodeField]){
              item[fillFillObj.orgCodeField] = _this.fillOrg.code;
            }if(fillFillObj.instIdField && !item[fillFillObj.instIdField]){
              item[fillFillObj.instIdField] = _this.instId;
            }
          });
        }
      }
      return data;
    },
    getOrgFillFieldObj(custDialog){
        let orgFillFieldObj = {orgNameField:'',orgIdField:'',orgCodeField:'',instIdField:''};
        if(custDialog.orgConfig.name){
          const namePath = custDialog.orgConfig.name.split('.');
          orgFillFieldObj.orgNameField = namePath[namePath.length-1];
        }
        if(custDialog.orgConfig.id){
          const idPath = custDialog.orgConfig.id.split('.');
          orgFillFieldObj.orgIdField = idPath[idPath.length-1];
        }
        if(custDialog.orgConfig.code){
          const codePath = custDialog.orgConfig.code.split('.');
          orgFillFieldObj.orgCodeField = codePath[codePath.length-1];
        }
        if(custDialog.orgConfig.instId){
          const instIdPath = custDialog.orgConfig.instId.split('.');
          orgFillFieldObj.instIdField = instIdPath[instIdPath.length-1];
        }
        return orgFillFieldObj;
    },
    getHotTableData(exeMath){
      //如果是保存或提交时需进行必填校验
      const data = this.getBackMergeData(exeMath);
      if(exeMath===true){
        if(!this.validateCells(data)){
          return false;
        }
      }
      return data;
    },
    validateCells(data){
      let _this = this;
      let isTrue = true;
      const requireds = this.requiredRowsMap;
      if(requireds && '{}'!==JSON.stringify(requireds)){
        if(!data || data.length<1){
           _this.$message({
              message: "子表【"+_this.name+"】存在必填项未填写！",
              type: "error"
            });
          isTrue = false;
          return false;
        }
        for (const field in requireds) {
          if (requireds.hasOwnProperty(field)) {
            const required = requireds[field];
            if(required.all === true){
              for (let i = 0; i < data.length; i++) {
                if(!data[i][field] && data[i][field]!==0  && data[i][field]!==false){
                  _this.$message({
                    message: "子表【"+_this.name+"】中第【"+(i+1)+"】行【"+_this.fieldNameMap[field]+"】必填！",
                    type: "error"
                  });
                  isTrue = false;
                  return false;
                }
              }
            }else if(required.rows && required.rows.length>0){
              required.rows.forEach(index =>{
                if(!data[index-1] || (!data[index-1][field] && data[index-1][field]!==0  && data[index-1][field]!==false)){
                  _this.$message({
                    message: "子表【"+_this.name+"】中第【"+index+"】行【"+_this.fieldNameMap[field]+"】必填！",
                    type: "error"
                  });
                  isTrue = false;
                  return false;
                }
              })
            }
          }
        }
      }
      return isTrue;
    },
    initTemplateData(){
        if(this.isInitTemplateData !=='true'){
          //初始化统计行
          this.toAddInitSumRow();
          return ;
        }
        let _this = this;
        //如果已有数据则不需要再次初始化
        const curData = this.getHotTableData();
        let initType = this.initFillDataType;
        const formInst = utils.getOnlineFormInstance(_this);
        if((!initType || initType=='empty')){
          if(curData.length==0 || (curData.length==1 && (Array.isArray(curData[0]) || JSON.stringify(curData[0]) ==JSON.stringify(this.initRowData)))){
            this.hotSettings.data = [[]];
          }else{
            //初始化统计行
            this.toAddInitSumRow();
            return ;
          }
        }else if(initType=='cover'){
          const paths = this.subTablePath.split('.');
          formInst['data'][paths[0]][paths[1]] = [];
          this.hotSettings.data = [[]];
        }
        if(!this.initCustDialogConf || !this.initCustDialogConf.custDialog || !this.initCustDialogConf.custDialog.alias){
          //初始化统计行
          this.toAddInitSumRow();
          return ;
        }
        const loading = this.$loading({
          lock: true,
          text: '正在初始化填报模板...',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        });
        this.$http.get('${form}/form/customDialog/v1/getByAlias?alias='+this.initCustDialogConf.custDialog.alias).then(resp => {
            _this.customDialog = resp.data;
        }, error => {
            _this.closeLoading(loading);
            _this.$message({
              message: "获取自定义对话框失败！",
              type: "error"
            });
        }).then(function () {
             const custdialog = _this.initCustDialogConf;
             const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
             if(!custdialog.orgConfig.code && !custdialog.orgConfig.name && !custdialog.orgConfig.id){
                _this.closeLoading(loading);
                _this.toFillInitData(_this);
              }else if (localStorage.getItem("curFillOrg_"+currentUser.account)) {
               _this.closeLoading(loading);
               _this.fillOrg = JSON.parse(localStorage.getItem("curFillOrg_"+currentUser.account));
               _this.toFillInitData(_this);
             }else{
               _this.$http.get('${uc}/api/org/v1/org/getFillOrg').then(resp => {
                   _this.closeLoading(loading);
                    const rep = resp.data;
                    if(rep.state){
                      _this.fillOrg = rep.value;
                      localStorage.setItem("curFillOrg_"+currentUser.account,JSON.stringify(rep.value))
                      _this.toFillInitData(_this);
                    }else{
                      _this.$message({
                        message: rep.message,
                        type: "warning"
                      });
                    }
                }, error => {
                    _this.closeLoading(loading);
                    _this.$message({
                      message: "获取当前用户填制单位失败！",
                      type: "warning"
                    });
                })
             }
        });
    },
    closeLoading(loading){
      let _this = this;
      setTimeout(function(){
        loading.close();
      },2000);
    },
    toFillInitData(_this){
      setTimeout(function(){
        _this.fillInitData(_this);
      },1000);
    },
    fillInitData(_this){
      const custDialog = _this.initCustDialogConf.custDialog;
      const formInst = utils.getOnlineFormInstance(_this);
      const curData = formInst['data'];
      //处理对话框的参数传入
      let params = [];
      if(custDialog.conditions){
        //对话框按表单字段查询（参数传入的）
        let bindList = custDialog.conditions;
        if(bindList.length>0){
          bindList.forEach(ele => {
            //绑定表单字段
            if (ele.defaultType == "3" && ele.bind) {
              let obj = {};
              obj.field = ele.field;
              const bindArray = ele.bind.split('.');
              if(bindArray.length==3){
                obj.bind = curData[bindArray[1]][bindArray[2]];
                params.push(obj);
              }
              
            }
          });
        }
      }
      let url = '${form}/form/customDialog/v1/getListData?alias='+custDialog.alias;
      if(params.length>0){
        let paStr = '';
        params.forEach(pa =>{
          if(paStr){
            paStr += ',';
          }
          paStr = paStr + '"'+pa.field +'":"'+pa.bind+'"';
        });
        url = url+'&mapParam='+paStr;
      }else{
        url = url+'&mapParam=';
      }
      const param = {pageBean: {page: 1, pageSize: 1000, showTotal: true}};
      _this.$http.post(url, param).then(resp => {
          const response = resp.data;
          if(response.rows){
             _this.syncInitTableValue(response.rows);
             if(response.rows.length==0){
               //初始化统计行
               _this.toAddInitSumRow();
               _this.hotSettings.data[0] = _this.fillOrgDataField(_this.hotSettings.data[0]);
             }
          }
      }, error => {
          _this.$message({
            message: "获取初始化数据失败！",
            type: "error"
          });
      });
    },
    getFillOrgObj(custDialog){//获取填制单位、实例信息
      let fillOrg = null;
      if(custDialog.orgConfig && (custDialog.orgConfig.id ||custDialog.orgConfig.name || custDialog.orgConfig.code || custDialog.orgConfig.instId) 
      && this.fillOrg.id){
        fillOrg = {};
        const namePath = custDialog.orgConfig.name.split('.');
        const orgNameField = namePath[namePath.length-1];
        if(custDialog.orgConfig.name && orgNameField){
          fillOrg[orgNameField] = this.fillOrg.name;
        }
        if(custDialog.orgConfig.id){
          const idPath = custDialog.orgConfig.id.split('.');
          const orgIdField = idPath[idPath.length-1];
          fillOrg[orgIdField] = this.fillOrg.id;
        }
        if(custDialog.orgConfig.code){
          const codePath = custDialog.orgConfig.code.split('.');
          const orgCodeField = codePath[codePath.length-1];
          fillOrg[orgCodeField] = this.fillOrg.code;
        }
        if(custDialog.orgConfig.instId){
          const instIdPath = custDialog.orgConfig.instId.split('.');
          const instIdField = instIdPath[instIdPath.length-1];
          fillOrg[instIdField] = this.instId;
        }
      }
      return fillOrg;
    },
    // 同步初始化数据结果
    syncInitTableValue(s) {
      let custDialog = this.initCustDialogConf;
      var returnStr = JSON.parse(this.customDialog.resultfield);
      //拿到返回的字段
      var field = new Array([returnStr.length]);
      var comment = new Array([returnStr.length]);
      var str = [];
      var ids = [];
      for (var i = 0; i < returnStr.length; i++) {
        field[i] =
          this.customDialog.dsType == "dataSource"
            ? returnStr[i].field.toUpperCase()
            : returnStr[i].field;
        comment[i] =
          this.customDialog.dsType == "dataSource"
            ? returnStr[i].comment.toUpperCase()
            : returnStr[i].comment;
      }
      if (this.customDialog.selectNum === 1) {
        var temp = "";
        for (var i = 0; i < comment.length; i++) {
          const va = s[0][field[i]];
          va = typeof(va)=='undefined'?'':va;
          temp += '"' + comment[i] + '":"' + va + '",';
        }
        if (temp != "") {
          temp = "{" + temp.substring(0, temp.length - 1) + "}";
        }
        str.push(JSON.parse(temp));
        ids.push(s[0].id);
      } else {
        for (var i = 0; i < s.length; i++) {
          var temp = "";
          for (var j = 0; j < comment.length; j++) {
            const va = s[i][field[j]];
            va = typeof(va)=='undefined'?'':va;
            temp += '"' + comment[j] + '":"' + va + '",';
          }
          if (temp != "") {
            temp = "{" + temp.substring(0, temp.length - 1) + "}";
          }
          str.push(JSON.parse(temp));
          ids.push(s[i].id);
        }
      }
      //处理填制部门
      let fillOrg = this.getFillOrgObj(custDialog);
      
      //处理实例id回填
      if(custDialog.orgConfig && custDialog.orgConfig.instId && this.instId){
          if(fillOrg == null){
            fillOrg = {};
          }
          const instIdPath = custDialog.orgConfig.instId.split('.');
          const instIdField = instIdPath[instIdPath.length-1];
          fillOrg[instIdField] = this.instId;
      }
      const returnData = str;
      const _this = this;
      const formInst = utils.getOnlineFormInstance(this);
      let filldata = this.hotSettings.data;
      if(filldata && filldata.length==1){
        filldata = [];
        //if(Object.keys(this.hotSettings.data[0]).length==0 || JSON.stringify(this.initRowData) == JSON.stringify(this.hotSettings.data[0])){
          const initSumRow = this.getInitSumRow();
          if(initSumRow){
            filldata.push({...initSumRow,...fillOrg});
          }
        //}
      }
      let fillInitData = [];
      returnData.forEach(row => {
        var targetArray = null;
        var subLineData = _this.initRowData?_this.initRowData:{};
        custDialog.custDialog.mappingConf.forEach(con => {
          if (con.target[0]) {
            targetArray = con.target[0].split(".");
            var from = "";
            if (_this.customDialog.dsType == "restful") {
              from = con.from;
            } else {
              from = con.from.toUpperCase();
            }
            subLineData[targetArray[targetArray.length - 1]] = row[from];
          }
        });
        if(fillOrg!=null){
          subLineData = {...subLineData,...fillOrg};
        }
        fillInitData.push({...subLineData});
      });
      if(this.addInitTemplateData==='true'){
        this.initDataBack = fillInitData;
      }
      filldata = [...filldata,...fillInitData];
      this.fillbackHotTableData(filldata,false);
    },
    fillOrgDataField(row){
      let custDialog = this.initCustDialogConf;
      if(custDialog && custDialog.orgConfig){
        if(custDialog.orgConfig.name && this.fillOrg.id){
          const namePath = custDialog.orgConfig.name.split('.');
          const orgNameField = namePath[namePath.length-1];
          row[orgNameField] = this.fillOrg.name;
          if(custDialog.orgConfig.id){
            const idPath = custDialog.orgConfig.id.split('.');
            const orgIdField = idPath[idPath.length-1];
            row[orgIdField] = this.fillOrg.id;
          }
          if(custDialog.orgConfig.code){
            const codePath = custDialog.orgConfig.code.split('.');
            const orgCodeField = codePath[codePath.length-1];
            row[orgCodeField] = this.fillOrg.code;
          }
        }
        if(custDialog.orgConfig.instId && this.instId){
            const instIdPath = custDialog.orgConfig.instId.split('.');
            const instIdField = instIdPath[instIdPath.length-1];
            row[instIdField] = this.instId;
        }
      }
      return row;
    },
    toAddInitSumRow(){
      const data = this.getHotTableData();
      if(!data || data.length<1 ||(data.length==1 && 
        JSON.stringify(data[0])===JSON.stringify(this.initRowData))){
          const initSumRow = this.getInitSumRow();
          if(initSumRow){
            let rows = [];
            rows.push({...initSumRow});
            this.fillbackHotTableData(rows);
          }
      }
    },
    getInitSumRow(){
      if(this.initSumRow==='true'){
        let newRow = {...this.initRowData};
        if(this.initSumRowField && this.initSumRowValue){
          newRow[this.initSumRowField] = this.initSumRowValue;
        }
        let fillOrg = this.getFillOrgObj(this.initCustDialogConf);
        if(fillOrg == null){
            fillOrg = {};
        }
        return {...newRow,...fillOrg};
      }
      return '';
    },
    toAddInitTemplateData(){
      if(this.addInitTemplateData==='true' && this.initDataBack && Array.isArray(this.initDataBack) && this.initDataBack.length>0){
        let curData = this.getBackMergeData();
        if(!(curData && Array.isArray(this.initDataBack))){
          curData = [[]];
        }
        curData = [...curData,...this.initDataBack];
        this.fillbackHotTableData(curData);
      }else if(!this.initDataBack || this.initDataBack.length<1){
        this.$message({
          message: "初始化数据为空。",
          type: "warning"
        });
      }
    },
    getTableHeaders(){
      const optionsJon = JSON.parse(this.options);
      const relations = optionsJon.colHeadersRelations;
      let headers = {nested:this.hotSettings.nestedHeaders?true:false,header:[]};
      relations.forEach(item =>{
        headers.header.push({name:item.name,desc:item.desc});
      })
      return headers;
    },
  },
  created() {
     
  }
};
</script>

<style scoped>
.fullWidth {
  width :100%;
}
.hot-table{
  width:100%;
}
.hot-table-main{
  width:100%;
  min-height: 50px;
}
.handsontable >>> td.my-selectCol{
  background-color: #cefdff;
}
.handsontable >>> td.my-selectRow{
  background-color: #cefdff;
}
.handsontable.ht_clone_top tr{
    line-height: 0;
}
.handsontable.ht_clone_top th{
  vertical-align: middle;
  font-size: 0;
  line-height: 0;
}
.handsontable.ht_clone_top th .relative{
  vertical-align: middle;
  line-height: .9;
  font-size:14px;
}
div [root=hot-table]{
  z-index:1;
}
</style>
