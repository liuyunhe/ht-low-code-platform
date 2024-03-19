<template>
  <!--lyzcw：2020-08-02 标题点击事件暂不启用 @header-click="clickHeader"--> 
  <el-table :data="data.rows" align="left" >
    <el-table-column
      type="index"
      align="left"
      label="序号"
      width="50px"
    ></el-table-column>
    <!-- 名称 lyzcw：2020-08-02 标题图标及切换暂不启用:render-header="renderHeader"-->
    <el-table-column
      :label="this.type == 'htfb' ? '范本名称' : '条款名称'"
      show-overflow-tooltip
      align="left"
    >
      <template slot-scope="scope">
        <div @click="gotoDetail(scope.row)">
          <span class="model-subject">{{ scope.row.model_name }}</span>
        </div>
      </template>
    </el-table-column>
    <!-- <el-table-column
      :label="this.alias == 'htfb' ? '范本版本' : '条款版本'"
      prop="model_version"
    ></el-table-column> -->
    <el-table-column
      show-overflow-tooltip
      fixed="right"
      label="创建时间"
      prop="create_time"
      width="180px"
    >
    </el-table-column>
  </el-table>
</template>

<script>
const form = window.context.form
import req from '@/request.js'
export default {
  props: {
    alias: {
      type: String,
      default: 'htfb',
    },
  },
  data() {
    return {
      data: {
        rows: [],
      },
      type: '', //lyzcw:2020-07-28 范本或条款类型
    }
  },
  created() {
    this.type = this.alias
    this.getModelData()
  },
  methods: {
    // lyzcw: 2022-07-28 表头点击事件方法，切换表单列表
    clickHeader(column, event){
      if(column.label == '范本名称'){
        this.type='tytk'
        console.log("this1：", this )
        this.$emit( 'changeColUrl', '/statement/template/preview/tytk')
      }else{
        this.type='htfb'
        console.log("this2：", this )
        this.$emit( 'changeColUrl', '/statement/template/preview/htfb')
      }
      // 重新载入数据
      this.getModelData()
    },
    // lyzcw: 2022-07-28 为表格头标题添加小图标并hover后出现提示信息
    renderHeader (h, { column, $index }) {
      // h 是一个渲染函数       column 是一个对象表示当前列      $index 第几列
      return h("div", [
        h("span", column.label + "  ", {
          align: "center",
          marginTop: "2px"
        }),
        h(
          "el-popover",
          {
            props: {
              placement: "top-start", // icon 处可添加浮层说明，浮层位置等属性
              width: "200",
              trigger: "hover"
            }
          },
          [
            h("p", "点击切换范本和通用条款", {
              class: "text-align: center; margin: 0"
            }),
            h("i", {// 生成 i 标签 ，添加icon 设置 样式，slot 必填
              class: "el-icon-d-caret",
              style: "color:#ccc,margin:18px,padding-top:10px",
              slot: "reference"
            })
          ]
        )
      ])
    },
    getModelData() {
      //1.先请求templateID
      this.$store
        .dispatch('form/getBpmDataTemplateInfo', {
          templateKey: this.type,
        })
        .then((data) => {
          //   console.log(data)
          const templateId = data?.value?.id ?? ''
          //   console.log('templateId====>', templateId)
          if (!templateId) {
            //获取失败,做点什么
          }
          //分页参数
          const pageBean = {page: '1', pageSize: '10', showTotal: false}
          //排序
          const sorter = [{property: 'create_time', direction: 'DESC'}]
          const queryFilter = {pageBean, sorter}
          req
            .post(form + '/form/dataTemplate/v1/listJson', {
              queryFilter,
              templateId,
            })
            .then((response) => {
              this.data.rows = response?.data?.rows ?? []
            })
        })
      //2.请求接口过滤数据
    },
    gotoDetail(row) {
      const id = row?.id_ ?? ''
      if (!id) return
      this.$router.push({
        path: `/statement/template/form/${this.type}/preview/true`,
        query: {id: id, startFlow: false,from:'home'},
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.model-subject {
  cursor: pointer;
  color: #2761ff;
}
</style>