<template>
  <el-container>
    <el-main class="home-content">
      <el-row
        v-for="(grid, i) in gridList"
        :key="i"
        :gutter="grid.options.gutter"
      >
        <div v-if="grid.type == 'grid'">
          <el-col
            v-for="(columns, j) in grid.columns"
            :Key="j"
            :span="columns.span"
          >
            <ht-column
              v-for="(cl, k) in columns.list"
              :key="k"
              :column-alias="cl.alias"
            ></ht-column>
          </el-col>
        </div>
        <div v-if="grid.type == 'tab'">
          <el-col :span="24">
            <ht-tabs-column :grid="grid"></ht-tabs-column>
          </el-col>
        </div>
        <div v-if="!grid.type">
          <el-col :span="24">
            <ht-column :column-alias="grid.alias"></ht-column>
          </el-col>
        </div>
      </el-row>
    </el-main>
  </el-container>
</template>
<script>
let Base64 = require('js-base64').Base64
import HtColumn from '@/components/common/HtColumn.vue'
import HtTabsColumn from '@/components/common/HtTabsColumn.vue'
export default {
  components: {HtColumn, HtTabsColumn},
  inject: ['reload'],
  data() {
    return {
      layout: {},
      gridList: [],
      notifyList: [],
      notify: {},
    }
  },
  mounted() {
    // window.notice_no_longer = this.notice_no_longer
    // window.remind_detail = this.remind_detail
  },
  created() {
    //yigz 2022-07-01:在Navigator 导航栏中控制提醒信息的显示
    // this.notifyList = []
    // this.$store.dispatch('form/getFormRemindDataByUser').then((data) => {
    //   console.log('getFormRemindDataByUser ===>', data)
    //   const me_ = this
    //   let i = 0
    //   data.forEach((item) => {
    //     setTimeout(() => {
    //       me_.dialogMessage(item)
    //     }, i)
    //     i = i + 500
    //   })
    // })
    this.$store.dispatch('menu/vueFrontHome').then((data) => {
      this.layout = JSON.parse(Base64.decode(data.value) || '{}')
      if (this.layout && this.layout.list && this.layout.list.length > 0) {
        this.gridList = this.layout.list
      }
    })
  },
  methods: {
    dialogMessage(item) {
      const me_ = this
      //yigz 2022-06-23:优化首页提醒弹框功能
      var notice_content = item.content
      let content_url =
        '/statement/template/form/' +
        item.opemType +
        '/get/true?id=' +
        item.opemId +
        '&startFlow=false'
      //不再提醒
      var notice_no_longer = '不再提醒'
      var content =
        '<a onClick = "remind_detail(\'' +
        content_url +
        '\')" href= "#" style= " color: #2761ff;text-decoration-line: none ;font-size: 14px;width:14vw;margin-right:10px;">' +
        notice_content +
        '</a>' +
        '<a onClick = "notice_no_longer(\'' +
        item.id +
        '\')" href = "#" style = " color: #999;text-decoration-line: none ;font-size:12px;float:right;width:16vw;text-align: right;margin-right:8px;">' +
        notice_no_longer +
        '</a>'
      let notify = this.$notify.info({
        title: item.subject,
        duration: 0,
        dangerouslyUseHTMLString: true,
        position: 'bottom-right',
        message: content,
        onClose: function () {
          if (item.count == 1) {
            me_.$store.dispatch('form/deleteFormRemindDataById', item.id)
          }
        },
        // onClick: function () {
        //   notify.close()
        //   let path =
        //     '/statement/template/form/' +
        //     item.opemType +
        //     '/get/true?id=' +
        //     item.opemId +
        //     '&startFlow=false'
        //   me_.$router.push(path)
        // },
      })
      this.notifyList.push(notify)
      this.notify = notify
    },
    //2022-06-29 yigz:添加提醒详情
    remind_detail: function (content_url) {
      this.$router.push(content_url)
    },
    //yigz 2022-06-23:不再提醒
    notice_no_longer(itemId) {
      this.$store.dispatch('form/deleteFormRemindDataById', itemId)
      //yigz 2022-06-23: 重新加载提醒数据
      this.reload()
    },
  },
  destroyed() {
    this.notifyList.forEach((item) => {
      item.close()
    })
  },
}
</script>
<style lang="scss" scoped>
.home-content {
  padding-top: 10px;
  margin-top: -12px;
  /deep/ .el-card {
    margin-bottom: 5px;
    .el-card__header {
      margin: 13px 20px 0 20px;
      padding: 0 0 13px 0;
    }
  }
}
/deep/ .column-body {
  * {
    font-size: 11pt !important;
    // color:black;
    font-family: MicroSoft YaHei;
  }
}
// /deep/.el-main,
// /deep/.column-body {
//   // 隐藏滚动条
//   &::-webkit-scrollbar {
//     width: 0;
//     background-color: transparent;
//   }
// }
@media (max-width: 1152px) {
  /deep/.flow_item {
    padding: 0 6px !important;
    .flow_item__bg {
      width: 32px !important;
      height: 32px !important;
      margin-top: 4px;
      span {
        font-size: 22px !important;
        padding: 6px !important;
      }
    }
    .flow_item__count {
      font-size: 14px !important;
      line-height: 26px !important;
    }
    .flow_item__text {
      zoom: 0.9;
      line-height: 26px !important;
    }
  }
}
</style>
