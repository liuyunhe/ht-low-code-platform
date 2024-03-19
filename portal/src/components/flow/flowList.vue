<template>
  <el-container class="list_main_content flow-list fullheight">
    <el-aside width="200px" v-show="asideShow" class="aside-tree__wrap">
      <p class="flow_tree_top_title">
        {{ $t('navigator.newProcess') }} {{ $t('navigator.type') }}
      </p>
      <FlowTree
        ref="FlowTree"
        @currentTree="getCurrent"
        :loadCount="loadCount"
        @switch-change="handleSwitch"
        :isAsideShow="isAsideShow"
      ></FlowTree>
    </el-aside>
    <div
      v-if="!$route.meta.single"
      class="navbar-collapse"
      :class="{'navbar-collapse-right': !asideShow}"
      @click="asideShow = !asideShow"
    >
      <div class="navbar-collapse-bg">
        <i
          class="navbar-collapse-arrow"
          :class="{
            'el-icon-arrow-left': asideShow,
            'el-icon-arrow-right': !asideShow,
          }"
        ></i>
      </div>
    </div>
    <el-container style="border-left: 1px solid #e7eaec">
      <h3 class="flow_table_title">
        {{ $t('navigator.newProcess') }} {{ $t('navigator.list') }}
      </h3>
      <div class="content_top_wrap">
        <el-input
          size="small"
          clearable
          style="width: 240px"
          placeholder="流程名称"
          prefix-icon="el-icon-search"
          v-model="tableData"
          @keyup.enter.native="searchEnterFun"
        ></el-input>
        <div class="date_wrap">
          <p>到达时间</p>
          <el-date-picker
            v-model="date"
            type="datetimerange"
            align="right"
            size="small"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :default-time="['00:00:00', '23:59:59']"
          >
          </el-date-picker>
        </div>
        <el-row class="btn_wrap">
          <el-col :span="24">
            <el-button
              style="margin-left: 10px"
              size="small"
              type="primary"
              icon="el-icon-search"
              @click="search('find')"
              >查询</el-button
            >
            <el-button size="small" @click="reset" icon="el-icon-refresh"
              >重置</el-button
            >
          </el-col>
        </el-row>
      </div>
      <el-main class="content">
        <!-- default-sort  排序 -->
        <!-- ccwgq 2022-06-07 新建流程表格中不再显示流程key和创建时间 -->
        <el-table
          :data="rows"
          height="100%"
          style="width: 100%"
          header-cell-class-name="flowList-header-row"
          row-class-name="flowList-row"
          size="medium"
          v-loading="fullscreenLoading"
          :default-sort="{prop: 'createTime', order: 'descending'}"
          @hook:updated="updatedTable"
        >
          <el-table-column
            type="index"
            width="80"
            align="center"
            label="序号"
          ></el-table-column>
          <!-- 2022-07-07 yigz:添加空白列，将流程名称列布局往后靠 -->
          <el-table-column
            label=""
            show-overflow-tooltip
            align="center"
            width="180"
          >
            <template>
              <span></span>
            </template>
          </el-table-column>
          <el-table-column label="流程名称" show-overflow-tooltip align="left">
            <!-- yigz 2022-11-05:新建流程以修窗口形式打开 -->
            <template slot-scope="scope">
              <span
                class="flowList-subject"
                @click="handleRowClick(scope.row, true)"
                @contextmenu.prevent="handleRowClick(scope.row, true)"
                >{{ scope.row.name }}</span
              >
            </template> </el-table-column
          >>
          <!-- <el-table-column prop="defKey" label="流程key" align="center" width="150"></el-table-column> -->
          <!-- 2022-07-07 yigz: 隐藏流程描述 -->
          <!-- <el-table-column
            prop="desc"
            label="流程描述"
            align="left"
            show-overflow-tooltip
          ></el-table-column> -->
          <!-- <el-table-column label="创建时间" show-overflow-tooltip align="center" width="180">
            <template slot-scope="scope">
              <span>{{scope.row.createTime | formatDate}}</span>
            </template>
          </el-table-column> -->
          <el-table-column label="二维码提单" align="center" width="300">
            <template slot-scope="scope">
              <el-link
                v-if="scope.row.supportMobile == 1"
                type="primary"
                @click="showQRCodeDialog(scope.row)"
                >生成二维码</el-link
              >
            </template>
          </el-table-column>
        </el-table>
      </el-main>
      <el-footer height="52px">
        <el-row type="flex" justify="end">
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="pagination.page"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="pagination.pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
          ></el-pagination>
        </el-row>
      </el-footer>
      <el-dialog
        :visible.sync="QRCodeDialog"
        width="340px"
        @opened="foundQRCode"
        :before-close="QRCodeDialogClose"
        :center="true"
      >
        <div id="QRCodeAnddDesc" style="text-align: center">
          <canvas id="QRCode" v-show="QRCodeShow"></canvas>
        </div>
        <span slot="footer" v-show="QRCodeShow">
          <el-button
            type="primary"
            v-clipboard:copy="QRCodeurl"
            v-clipboard:success="onCopy"
            v-clipboard:error="onError"
            >复制URL</el-button
          >
          <el-button type="success" @click="downloadQRCode"
            >下载二维码</el-button
          >
        </span>
      </el-dialog>
    </el-container>
  </el-container>
</template>

<script>
import {mapState, mapActions} from 'vuex'
import FlowTree from '@/components/flow/flowTree.vue'
import utils from '@/utils.js'
import process from '@/api/process.js'
import QRCode from 'qrcode'
//ccwgq 2022-07-07 引入流程的事件总线    (已经改为mixin)
// import FlowBus from '@/components/eipControl/bus/FlowMenuBus.js'
import FlowMenuMixin from '@/components/flow/ou/OuFlowMenu.js'
export default {
  name: 'flowList',
  components: {
    FlowTree,
  },
  mixins: [FlowMenuMixin],
  data() {
    return {
      isAsideShow: false,
      asideShow: false,
      tableData: '',
      date: '',
      currentTree: '',
      fullscreenLoading: true,
      QRCodeDialog: false,
      QRCodeShow: false,
      QRCodeurl: '',
      selectLeadId: '0',
      selectRowId: '',
    }
  },
  computed: {
    ...mapState({
      // rows: (state) => state.storeProcess.rows,  //ccwgq 2022-10-24 解决公文中心数据重复错误的问题
      rows: (state) => state.storeProcess.data.flowList,
      pagination: (state) => state.storeProcess.pagination,
      total: (state) => state.storeProcess.total,
      token: (state) => state.login.currentUser.token,
    }),
    currentSwitchValue() {
      // lyzcw:2022-05-09 默认类别树展开
      return (
        localStorage.flowListAsideShow === 'true' ||
        localStorage.flowListAsideShow === true ||
        localStorage.flowListAsideShow === undefined
      )
    },
  },
  methods: {
    //将当前展开或者收起的值存在localStorage中
    handleSwitch(val) {
      localStorage.flowListAsideShow = val
    },
    //Loading 加载中
    openFullScreen() {
      this.fullscreenLoading = true
    },
    handleSizeChange: function (size) {
      //每页下拉显示数据
      this.$store.dispatch('storeProcess/setPaginationSize', size)
      this.search()
    },
    handleCurrentChange: function (currentPage) {
      //点击第几页
      this.$store.dispatch('storeProcess/setPaginationPageNum', currentPage)
      this.search()
    },
    //回车查询
    searchEnterFun: function (e) {
      var keyCode = window.event ? e.keyCode : e.which
      if (keyCode == 13) {
        this.search('find')
      }
    },
    // 查询
    search(str) {
      this.openFullScreen()
      if (str == 'find') {
        this.$store.dispatch('storeProcess/setPaginationPageNum', 1)
      }
      let querys = [] //查询条件
      let queryFilter = {}
      let beginDate = '' //开始时间
      let endDate = '' //结束时间
      if (this.tableData) {
        querys = [
          {
            property: 'name',
            value: this.tableData,
            group: 'main',
            operation: 'LIKE',
            relation: 'OR',
          },
        ]
      }
      if (this.currentTree) {
        querys.push({
          property: 'type_id_',
          value: this.currentTree,
          group: 'typeId',
          operation: 'IN',
          relation: 'AND',
        })
      }

      if (this.date) {
        beginDate = utils.formatDate(this.date[0].getTime())
        endDate = utils.formatDate(this.date[1].getTime())
        querys.push({
          property: 'create_time_',
          value: [beginDate, endDate],
          group: 'time',
          operation: 'BETWEEN',
          relation: 'AND',
        })
      }
      queryFilter = {pageBean: this.pagination, querys}
      this.$store
        .dispatch('storeProcess/getFlowListByPagination', queryFilter)
        .then(() => {
          this.fullscreenLoading = false
        })
    },
    //重置
    reset() {
      this.tableData = ''
      this.date = ''
      this.search('find')
    },

    handleRowClick(row, newWin) {
      if (!row.leaders || row.leaders.length == 0) {
        this.handleOpenUrl('/agentStart/' + row.id + '/0', newWin)
      } else {
        let html =
          '<select ref=' +
          Math.random() +
          ' id="approvalLeaderSelect" style="width: 200px;height: 30px;border-radius: 4px;margin: 20px 70px;" ><option value="">请选择</option>'
        row.leaders.forEach((identity) => {
          html +=
            '<option value="' + identity.id + '">' + identity.name + '</option>'
        })
        html += '</select>'
        let this_ = this
        this.$alert(html, '选择发起人', {
          dangerouslyUseHTMLString: true,
          beforeClose: function (action, instance, done) {
            if (action == 'confirm') {
              let se = document.getElementById('approvalLeaderSelect')
              if (se.selectedIndex == 0) {
                this.$message.warning('请选择一个发起人')
              } else {
                instance.close()
                this_.handleOpenUrl(
                  '/agentStart/' + row.id + '/' + se[se.selectedIndex].value,
                  newWin
                )
              }
            } else {
              instance.close()
            }
          },
        })
      }
    },
    handleOpenUrl(url, newWin) {
      if (!newWin) {
        this.$router.push(url)
        return
      }
      if (!url) {
        return
      }
      let token = this.$store.state.login.currentUser.token
      if (!url.toLowerCase().startsWith('http')) {
        url = window.context.front + url
      }
      if (url.indexOf('?') == -1) {
        url = url + '?token=' + token
      } else {
        url = url + '&token=' + token
      }
      window.open(url, '_self')
    },
    //子组件传值父组件(新建流程分类查询)
    getCurrent(data) {
      if (data.id == 6) {
        this.currentTree = ''
        this.openFullScreen()
        let pageBean = {pageBean: this.pagination}
        this.currentTree = ''
        this.$store
          .dispatch('storeProcess/getFlowListByPagination', pageBean)
          .then(() => {
            this.fullscreenLoading = false
          })
      } else {
        let ids = []
        this.getFlowTrees(data, ids)
        this.currentTree = ids.join(',')
        this.search('find')
      }
    },
    getFlowTrees(data, ids) {
      ids.push(data.id)
      let arr = data.children
      for (var i = 0; i < arr.length; i++) {
        this.getFlowTrees(arr[i], ids)
      }
    },
    loadCount() {
      let pageBean = {}
      return process.getNewProcessCount(pageBean)
    },
    showQRCodeDialog(row) {
      this.selectRowId = row.defId
      if (!row.leaders || row.leaders.length == 0) {
        //this.$router.push("/agentStart/" + row.id + "/0");
        this.selectLeadId = '0'
        this.QRCodeDialog = true
      } else {
        let html =
          '<select ref=' +
          Math.random() +
          ' id="approvalLeaderSelect" style="width: 200px;height: 30px;border-radius: 4px;margin: 20px 70px;" ><option value="">请选择</option>'
        row.leaders.forEach((identity) => {
          html +=
            '<option value="' + identity.id + '">' + identity.name + '</option>'
        })
        html += '</select>'
        let this_ = this
        this.$alert(html, '选择发起人', {
          dangerouslyUseHTMLString: true,
          beforeClose: function (action, instance, done) {
            if (action == 'confirm') {
              let se = document.getElementById('approvalLeaderSelect')
              if (se.selectedIndex == 0) {
                this.$message.warning('请选择一个发起人')
              } else {
                instance.close()
                // this_.$router.push(
                //   "/agentStart/" + row.id + "/" + se[se.selectedIndex].value
                // );
                this.selectLeadId = se[se.selectedIndex].value
                this.QRCodeDialog = true
              }
            } else {
              instance.close()
            }
          },
        })
      }
    },
    QRCodeDialogClose() {
      this.QRCodeDialog = false
    },
    foundQRCode() {
      this.QRCodeurl =
        window.context.mobile + '/work/agentStart/' + this.selectRowId + '/0'
      let loginRouthPath =
        localStorage.getItem(
          this.$store.state.login.currentUser.account + 'loginRoutePath'
        ) || '/login'
      if (loginRouthPath.startsWith('/login/')) {
        //租户模式
        let tenantCode = loginRouthPath.replace('/login/', '')
        if (tenantCode && tenantCode != '') {
          this.QRCodeurl =
            window.context.mobile +
            '/work/agentStart/' +
            this.selectRowId +
            '/0?tenantCode=' +
            tenantCode
        }
      }
      let msg = document.getElementById('QRCode')
      QRCode.toCanvas(msg, this.QRCodeurl, function (error) {
        console.log(error)
      })
      this.QRCodeShow = true
    },
    onCopy() {
      this.$message({type: 'success', message: '复制成功'})
    },
    onError() {
      this.$message({type: 'error', message: '复制失败'})
    },
    downloadQRCode() {
      let canvas = document.getElementById('QRCode')
      let a = document.createElement('a')
      a.download = '二维码.jpg'
      a.href = canvas.toDataURL()
      a.dispatchEvent(new MouseEvent('click'))
    },
    //ccwgq 2022-09-07 在 table组件的updated钩子里补充逻辑
    updatedTable() {
      // this.$nextTick(()=>{
      //  const $wrapper=$(this.$el).find('.el-table__body-wrapper');
      //  if($wrapper.length){
      //     $wrapper.removeAttr('style');
      //  }
      // })
    },
  },
  created() {
    this.asideShow = this.currentSwitchValue
    this.isAsideShow = this.currentSwitchValue

    let pageBean = {
      pageBean: {page: '1', pageSize: '10', showTotal: 'true'},
    } //初次加载默认pageBean
    this.$store
      .dispatch('storeProcess/getFlowListByPagination', pageBean)
      .then(() => {
        //页面加载调用tudo.js里面的分页方法
        this.fullscreenLoading = false
      })
  },
}
</script>

<style lang="scss" scoped>
@import '@/assets/css/element-variables.scss';
@import '@/assets/css/change-font.scss';
.el-table /deep/ th.flowList-header-row {
  background-color: #fafafa;
  font-size: 13px;
}

.el-table /deep/ tr.flowList-row {
  font-size: 13px;
  color: $--color-text-regular;
}

.el-container {
  background-color: #fff;
}

.el-row {
  margin-bottom: 20px;
}

.el-header {
  border-bottom: 1.5px solid #ededed;
}

.flowList-subject {
  cursor: pointer;
}

.flowList-subject {
  color: $--theme-color;
}

.top-title {
  line-height: 58px;
  margin-left: 20px;
  font-size: 16px;
  color: #a2a2a2;
}

/deep/.el-tree {
  position: relative;
  cursor: default;
  background: #fff;
  color: $--color-text-primary;
  font-size: 14px;
}
.content {
  padding-top: 0;
  height: 100%;
}
.content_top_wrap {
  display: flex;
  flex-direction: row;
  margin: 10px 0 0 20px;
  /deep/ .el-input__prefix,
  /deep/.el-input__suffix {
    height: 32px;
  }
  /deep/.el-date-editor--datetimerange.el-input__inner {
    width: 240px;
  }
  .date_wrap {
    display: flex;
    p {
      width: 64px;
      margin: 8px;
    }
  }
}
@media (max-width: 1152px) {
  .content_top_wrap {
    flex-wrap: wrap;
    .btn_wrap {
      margin: 10px 0 0 -9px;
    }
  }
}
</style>
