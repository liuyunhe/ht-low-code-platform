<template>
  <div>
    <el-select
        style="position: relative"
        v-model="inputVal"
        v-validate="inputValidate"
        @change="change"
        :placeholder="placeholder">
      <div v-loading="loading">
        <el-option
            v-for="item in options"
            :key="item[prop.value]"
            :label="item[prop.label]"
            :value="item[prop.value]">
        </el-option>
      </div>

      <div class="text-center">
        <a class="text-normal">
          <el-pagination
              @current-change="currentChange"
              layout="prev, pager, next"
              :page-size="pagination.pageSize"
              :pager-count="5"
              :current-page="pagination.page"
              :total="pagination.total">
          </el-pagination>
        </a>
      </div>
    </el-select>
  </div>
</template>

<script>
  import utils from "@/hotent-ui-util.js";
  export default {
    name: "ht-page-select",
    props:{
      pagination:{
        type:Object,
        default:()=>{
          return {page:0, pageSize:5, total:0}
        }
      },
      options:Array,
      prop:{
        type:Object,
        default:()=>{
          return {label:"label",value:"value"}
        }
      },
      value:String,
      remoteMethod:Function,
      permission: {
        type: String,
        default: "w",
        validator: function(value) {
          return ["b", "w", "r", "n"].indexOf(value) !== -1;
        }
      },
      validate: [String, Object],
      placeholder:{
        type:String,
        default:"请输入关键词"
      }
    },
    data(){
      return {
        query:"",
        queryFilter:{
          pageBean: this.pagination,
          querys: []
        },
        loading:false
      }
    },
    created(){
      this.$validator = this.$root.$validator;
    },
    mounted() {
      this.init();
    },
    methods:{
      remoteFunction(){
        this.loading = true;
        let queryFilter = {
          pageBean: this.pagination,
          querys: []
        };
        this.remoteMethod(queryFilter,this.cancelLoading);
      },
      currentChange(page){
        this.loading = true;
        let queryFilter = {
          pageBean: {
            page:page,
            pageSize:this.pagination.pageSize,
            total:this.pagination.total
          },
          querys: []
        };
        this.remoteMethod(queryFilter,this.cancelLoading);
      },
      change(data){
        if (!data){
          return;
        }
        let selectObj = this.options.find(opt => opt[this.prop.value] === data);
        this.$emit("change",data,selectObj);
      },
      init(){
        this.loading = true;
        let queryFilter = {
          pageBean: {
            page:1,
            pageSize:5,
            total:0
          },
          querys: []
        };
        this.remoteMethod(queryFilter,this.cancelLoading);
      },
      cancelLoading(){
        this.loading = false;
      }
    },
    computed:{
      inputVal:{
        set(value){
          this.$emit("input",value);
        },
        get(){
          return this.value;
        }
      },
      inputValidate: function() {
        return utils.addRequiredOrNot(this.permission, this.validate, this);
      },
    }
  }
</script>

<style scoped>
  div[aria-invalid='true'] >>> .el-input__inner, div[aria-invalid='true'] >>> .el-input__inner:focus {
    border-color: #f56c6c;
  }
  .text-center{
    position: sticky;
    background: #fff;
    height:30px;
    top:0;
    z-index:1;
    text-align: center;
  }
</style>
