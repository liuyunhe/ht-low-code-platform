<template>
  <div name="online-form">
    <el-row class="top-title__row">
      <h3 class="top-title">{{queryView.name?(queryView.name ):""}}</h3>
    </el-row>
    <span v-if="html">
      <dynamic-view :sqlAlias="sqlAlias" :alias="alias" :html="html" :single="single" :queryView="queryView"/>
    </span>
    <div class="loaded-fail__div" v-if="loadedFail">{{alias}}视图不存在...</div>
  </div>
</template>

<script>
  import DynamicView from "@/components/querySql/DynamicView.vue";
  import utils from "@/utils.js";

  export default {
    name: "querySqlContent",
    props: {
      sqlAlias: String,
      alias: String,
      single: String,
    },
    data() {
      return {
        queryView: {},
        displayFields: [],
        html: "",
        alarmSettingMap:{},
        summaryTypeMap:{},
        loadedFail:false
      };
    },
    watch: {
      alias: function(newVal) {
        if (newVal) {
          this.init();
        }
      }
  }, 
    components: {
      DynamicView
    },

    created() {
      this.init();
    },
    methods: {
      // 根据当前formKey初始化
      init() {
        // console.log("this：", this );
        const loading = this.$loading(this.options);
        let _me = this;
        this.$store
                .dispatch("form/getQuerySqlView", {
                  sqlAlias: this.sqlAlias,
                  alias: this.alias
                })
                .then(result => {
                  if (result) {
                    _me.queryView = result;
                    _me.html = result.template;

                    let params = { sqlAlias: _me.sqlAlias, alias: _me.alias };
                    let pageBean = {
                      pageBean: {
                        page: "1",
                        pageSize: result.pageSize ? result.pageSize : 30,
                        showTotal: "true"
                      }
                    }; //初次加载默认pageBean
                    params.pagination = pageBean;
                    //2021-08-23 ccwgq 检查是否有初次过滤条件
                    const querys=this.decodeRouterQuery();
                    if(querys!==null && querys.length){
                      params.pagination={pageBean:pageBean,querys:querys}
                    }
                    //--------------- 2021-08-23 add end -----------------------
                    this.$store
                            .dispatch("form/getQuerySqlViewByPagination", params)
                            .then(() => {
                              loading.close();
                            });
                  }else{
                    this.loadedFail = true;
                  }
                }).finally(()=>{
                  loading.close();
        });
      },
      // 2021-8-23 ccwgq   分析路由参数实现数据的过滤  追加搜索框的隐藏逻辑
      //例如初次过滤时带回了合同名，过滤条件的合同名搜索框最好隐藏
      decodeRouterQuery(){
        const parameterqQuerys=this.$route.query.parameterqQuerys;
        if($.isEmptyObject(parameterqQuerys)){
          return null;
        }
        else{
          let params=Base64.decode(decodeURI(parameterqQuerys));
          params=JSON.parse(params);
          // console.log("解析得到的必填参数===>",params);
          let querys=[];
          if(typeof params!=='undefined' && params.length){
            //解析拼接参数
            params.forEach(item=>{
              if(item['property']){
                querys.push({
                  property:item['property'].toUpperCase(),
                  value:item['value'],
                  group:item['group'],
                  operation:item['operation'],
                  relation:'AND'
                })
              }
            })
          }
          return  querys;
        }
      },
    }
  };
</script>

<style lang="scss" scoped>
@import "@/assets/css/element-variables.scss";
  /deep/ th.todo-header-row {
    background-color: #fafafa;
    font-size: 13px;
  }

  /deep/ tr.todo-row {
    font-size: 13px;
    color: $--color-text-regular;
  }

  .el-container {
    background-color: #fff;
  }

  .top-title__row {
    margin-bottom: 10px;
    .top-title{
      font-size: 14px;
      border-bottom: 1px solid #ccc;
      margin: 17px 0 0 0;
      padding: 0 0 12px 20px;
    }
  }

  .el-header {
    border-bottom: 1.5px solid #ededed;
  }

  .i {
    margin-right: 4px;
  }

  .todo-subject {
    cursor: pointer;
  }

  .todo-subject:hover {
    color: $--theme-color;
  }

  /deep/ .el-dialog__body {
    padding: 15px 10px;
  }

  /deep/ .el-checkbox {
    margin-left: 15px;
  }

  /deep/ .el-radio {
    margin-left: 15px;
  }

  /deep/ .el-button {
    margin-left: 0px;
  }
  .loaded-fail__div {
    text-align: center;
    font-size: 14px;
    font-weight: bold;
    color: #f56c6c;
  }
</style>
