<template>
  <div>
    <h3 class="header">商品类目维护</h3>
    <div class="main">
      <div>
        <el-row style="margin-bottom: 10px;">
          <el-button
            icon="el-icon-plus"
            size="mini"
            @click="addClick()"
            style="font-size: 11pt;"
            type="primary"
          >
            新增
          </el-button>
        </el-row>
        <el-table
          ref="theTable"
          :data="tableData"
          style="width: 100%; margin-bottom: 20px"
          row-key="categoryId"
          border
          default-expand-all
          :tree-props="treeProps"
          v-loading="loading"
        >
          <el-table-column type="index" label="序号 "> </el-table-column>
          <el-table-column prop="categoryName" label="类目名称 ">
          </el-table-column>
          <el-table-column prop="status" label="状态">
            <template slot-scope="scope">
              <span v-if="scope.row.status == 0">删除</span>
              <span v-if="scope.row.status == 1">正常</span>
            </template>
          </el-table-column>
          <el-table-column prop="createBy" label="创建人"> </el-table-column>
          <el-table-column prop="createTime" label="创建时间 ">
          </el-table-column>
          <el-table-column label="操作 ">
            <template slot-scope="scope">
              <el-button
                @click="editClick(scope.row, 0)"
                type="text"
                size="small"
              >
                编辑
              </el-button>
              <el-button
                @click="editClick(scope.row, 1)"
                type="text"
                size="small"
              >
                详情
              </el-button>
              <el-button
                type="text"
                size="small"
                @click="deleteClick(scope.row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>
<script>
import {serachCategory} from '@/api/merchandise.js'
export default {
  name: 'merchandiseIndex',
  data() {
    return {
      treeProps: {children: 'cjStoreCategoryVOList', hasChildren: 'hasChildren'},
      tableData: [
      ],
      loading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList(){
        this.loading=true
        this.tableData=[]
        serachCategory().then(res=>{
          const {data} = res
          this.loading=false
          if(data.state){
            this.tableData.push(data.value)
          }
        })
    },
    addClick() {
      this.$router.push('/ywzx/editIndex')
    },
    editClick(row, type) {
      this.$router.push(`/ywzx/editIndex/${row.categoryId}/${type}`)
    },
    deleteClick(row) {
      const that = this
      that
        .$confirm('此操作将删除该数据, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        .then(() => {
          const loading = that.$loading({
            lock: true,
            text: 'Loading',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)'
          })
          let saveData = {
            boAlias: 'splmwh',
            boData: {
              formKey: 'splmwh',
              splmwh: {
                category_id: row.categoryId,
                STATUS: '0'
              },
              templateKey: 'splmwh'
            },
            formKey: 'splmwh',
            templateKey: 'splmwh'
          }
          that.$store.dispatch('form/boSave', saveData).then(result => {
            loading.close()
            if (result.state) {
              that.$message({
                type: 'success',
                message: '删除成功'
              })
              this.getList()
            } else {
              that.$message({
                type: 'error',
                message: '删除失败'
              })
            }
          })
        })
        .catch(() => {
          that.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    }
  }
}
</script>
<style scoped>
.header {
  padding: 10px 20px;
  margin-bottom: 0;
  border-bottom: 1px solid #ccc;
  margin-top: 8px;
  background: #fff;
  font-size: 14px;
}
.main {
  padding: 10px 20px 20px 20px;
}
.right {
  text-align: right;
  margin-top: 20px;
}
</style>
