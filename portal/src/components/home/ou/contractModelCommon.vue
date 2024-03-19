<template>
  <el-tabs v-model="activeName" type="card" @tab-click="changeTab">
    <!-- 合同范本 -->
    <el-tab-pane :label="map[0]['label']" :name="map[0]['name']">
      <el-table :data="data.rows" align="left" v-loading="loading">
        <el-table-column
          type="index"
          align="left"
          label="序号"
          width="50px"
        ></el-table-column>
        <!-- 名称 -->
        <el-table-column :label="'业务条线'" show-overflow-tooltip align="left">
          <template slot-scope="scope">
            <div @click="gotoDetail(scope.row, true)">
              <span class="model-subject">{{ scope.row.BUSI_TYPE }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          show-overflow-tooltip
          fixed="right"
          label="所有者"
          prop="CREATER"
          width="180px"
        >
        </el-table-column>
      </el-table>
    </el-tab-pane>
    <!-- 通用条款 -->
    <el-tab-pane :label="map[1]['label']" :name="map[1]['name']">
      <el-table :data="data.rows" align="left" v-loading="loading">
        <el-table-column
          type="index"
          align="left"
          label="序号"
          width="50px"
        ></el-table-column>
        <!-- 名称 -->
        <el-table-column :label="'通用条款'" show-overflow-tooltip align="left">
          <template slot-scope="scope">
            <div @click="gotoDetail(scope.row, false)">
              <span class="model-subject">{{ scope.row.model_name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          show-overflow-tooltip
          fixed="right"
          label="创建时间"
          prop="create_time"
          width="180px"
        >
        </el-table-column>
      </el-table>
    </el-tab-pane>
    <!-- ccwgq 2022-09-05 补充 法律法规和风险提示页签 -->
    <!-- 法律法规 -->
    <el-tab-pane :label="map[2]['label']" :name="map[2]['name']">
      <el-table :data="data.rows" align="left" v-loading="loading">
        <el-table-column
          type="index"
          align="left"
          label="序号"
          width="50px"
        ></el-table-column>
        <!-- 标题 -->
        <el-table-column label="标题" width="150" show-overflow-tooltip>
          <template slot-scope="scope">
            <div @click="gotoDetail(scope.row, false)">
              <span class="model-subject">{{ scope.row.reg_title }}</span>
            </div>
          </template>
        </el-table-column>
        <!-- 维护日期 -->
        <el-table-column
          label="维护日期"
          prop="maintain_date"
        ></el-table-column>
      </el-table>
    </el-tab-pane>
    <!-- 风险提示 -->
    <el-tab-pane :label="map[3]['label']" :name="map[3]['name']">
      <el-table :data="data.rows" align="left" v-loading="loading">
        <el-table-column
          type="index"
          align="left"
          label="序号"
          width="50px"
        ></el-table-column>
        <!-- 标题 -->
        <el-table-column label="标题" width="150" show-overflow-tooltip>
          <template slot-scope="scope">
            <div @click="gotoDetail(scope.row, false)">
              <span class="model-subject">{{ scope.row.reg_title }}</span>
            </div>
          </template>
        </el-table-column>
        <!-- 维护日期 -->
        <el-table-column
          label="维护日期"
          prop="maintain_date"
        ></el-table-column>
      </el-table>
    </el-tab-pane>
  </el-tabs>
</template>

<script>
//首页范本库、通用条款
const form = window.context.form
import req from '@/request.js'
import {mapState} from 'vuex'
export default {
  props: {
    alias: {
      type: String,
      default: 'htfb'
    }
  },
  data() {
    return {
      tableData: [],
      activeName: 'first',
      data: {
        rows: []
      },
      type: 'htfb',
      loading: false,
      // 以后就维护这个数组好了
      map: [
        {label: '合同范本', type: 'htfb', name: 'first'},
        {label: '通用条款', type: 'tytk', name: 'second'},
        {label: '法律法规', type: 'flfg', name: 'third'},
        {label: '风险提示', type: 'fxts', name: 'fourth'}
      ]
    }
  },
  computed: mapState('menu', ['columnInfo']),
  created() {
     if (
        this.columnInfo.restore &&
        this.$parent.columnAlias == this.columnInfo.alias
      ) {
        this.activeName = this.columnInfo.activeTab || 'first'
        this.type=this.map.filter(item=>item.name==this.activeName)[0].type;
        this.$store.dispatch('menu/setColumnInfo',{})
      }
    this.getModelData(true)
  },
  mounted() {
  this.$parent.changeColUrl(`statement/template/preview/${this.type}`)
  },
  methods: {
    getModelData(isModel) {
      if (isModel) {
        this.getModelDataByBusiType()
      } else {
        //1.先请求templateID
        this.$store
          .dispatch('form/getBpmDataTemplateInfo', {
            templateKey: this.type
          })
          .then(data => {
            //   console.log(data)
            const templateId = data?.value?.id ?? ''
            //   console.log('templateId====>', templateId)
            //分页参数
            const pageBean = {page: '1', pageSize: '10', showTotal: false}
            //排序
            const sorter = [{property: 'create_time', direction: 'DESC'}]
            const queryFilter = {pageBean, sorter}
            req
              .post(form + '/form/dataTemplate/v1/listJson', {
                queryFilter,
                templateId
              })
              .then(response => {
                this.data.rows = response?.data?.rows ?? []
                if (this.data.rows.length > 0) {
                  this.loading = false
                }
              })
          })
        //2.请求接口过滤数据
        setTimeout(() => {
          if (this.data.rows.length == 0) {
            this.loading = false
          }
        }, 5000) //5s还请求不到数据停止loading
      }
    },
    gotoDetail(row, isModel) {
      if (isModel) {
        let busiTypeId = row.BUSI_TYPE_ID
        this.$router.push({
          path: '/statement/template/preview/cont_model_newest',
          //2022-09-21 yigz:修改跳转路径为表单列表页面
          // path: '/business_divide/template/preview/cont_model_newest',
          query: {formKey: 'BUSI_TYPE_ID', value: busiTypeId}
        })
      } else {
        const id = row?.id_ ?? ''
        if (!id) return
        this.$router.push({
          path: `/statement/template/form/${this.type}/edit/true`,
          query: {id: id, startFlow: false}
        })
      }
    },
    // 2022-09-27 yigz:获取以条线显示的合同范本数据
    getModelDataByBusiType() {
      // http://114.251.201.179:7070/eip-form/form/query/queryView/data_htmb/htmb
      this.loading = true
      //分页参数
      const pageBean = {page: '1', pageSize: '10', showTotal: false}
      //排序
      // const sorter = [{property: 'create_time', direction: 'DESC'}]
      // const queryFilter = {pageBean, sorter}
      req
        .post(form + '/form/query/queryView/data_htmb/htmb', {pageBean})
        .then(response => {
          this.data.rows = response?.data?.rows ?? []
          if (this.data.rows.length > 0) {
            this.loading = false
          }
        })
    },
    //切换tab页
    changeTab(tab) {
      this.data.rows = []
      this.loading = true
      if (tab.name == 'first') {
        this.activeName = 'first'
        this.type = 'htfb'
        // lyzcw: 2022-08-04 同时修改“更多”链接
        // this.$parent.changeColUrl('/statement/template/preview/htfb')
        //yigz:2022-09-27 修改合同范本跳转页面：以条线分类的列表页面
        this.$parent.changeColUrl('/statement/querySql/queryView/htmb/htmb')
      } else if (tab.name == 'second') {
        this.activeName = 'second'
        this.type = 'tytk'
        this.$parent.changeColUrl('/statement/template/preview/tytk')
      } else if (tab.name == 'third') {
        this.activeName = 'third'
        this.type = 'flfg'
        this.$parent.changeColUrl('/statement/template/preview/flfg')
      } else if (tab.name == 'fourth') {
        this.activeName = 'fourth'
        this.type = 'fxts'
        this.$parent.changeColUrl('/statement/template/preview/fxts')
      }
      // if (tab.name == 'first') {
      //   this.activeName = 'first'
      //   this.type = 'htfb'
      //   // lyzcw: 2022-08-04 同时修改“更多”链接
      //   // this.$parent.changeColUrl('/statement/template/preview/htfb')
      // } else if (tab.name == 'second') {
      //   this.activeName = 'second'
      //   this.type = 'tytk'
      //   // this.$parent.changeColUrl('/statement/template/preview/tytk')
      // } else if (tab.name == 'third') {
      //   this.activeName = 'third'
      //   this.type = 'flfg'
      //   // this.$parent.changeColUrl('/statement/template/preview/flfg')
      // } else if (tab.name == 'fourth') {
      //   this.activeName = 'fourth'
      //   this.type = 'fxts'
      //   // this.$parent.changeColUrl('/statement/template/preview/fxts')
      // }
      // 重新载入数据
      if (tab.name == 'first') {
        this.getModelData(true)
      } else {
        this.getModelData(false)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.model-subject {
  cursor: pointer;
  color: #2761ff;
}
</style>