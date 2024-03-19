<template>
  <el-container class="fullheight">
    <ht-table
      @load="loadData"
      :data="data"
      :pageResult="pageResult"
      :selectable="false"
      :show-custom-column="false"
      :show-export="false"
      ref="htTable"
    >
      <template v-slot:toolbar>
        <el-button-group>
          <el-button size="small" type="primary" icon="el-icon-refresh" @click="loadData">刷新</el-button>
          <el-popconfirm title="确定踢出所有用户吗？" @onConfirm="kickAll">
            <el-button size="small" type="danger" slot="reference" icon="el-icon-delete">踢出所有用户</el-button>
          </el-popconfirm>
        </el-button-group>
      </template>
      <template>
        <ht-table-column type="index" width="50" align="center" label="序号" />
        <ht-table-column prop="account" label="账号" />
        <ht-table-column prop="loginType" label="设备类型" width="120">
          <template v-slot="{ row }">
            <el-tag v-if="row.loginType == 'pc'">电脑端</el-tag>
            <el-tag type="success" v-else>移动端</el-tag>
          </template>
        </ht-table-column>
        <ht-table-column prop="tenantId" label="租户ID" />
        <ht-table-column width="150" label="操作">
          <template v-slot="{ row }">
            <el-popconfirm title="确定踢出该用户吗？" @onConfirm="kickOff(row)">
              <el-button type="text" slot="reference">踢出用户</el-button>
            </el-popconfirm>
          </template>
        </ht-table-column>
      </template>
    </ht-table>
  </el-container>
</template>
<script>
import uc from '@/api/uc.js'

export default {
  data() {
    return {
      data: [],
      pageResult: {}
    }
  },
  mounted() {

  },
  methods: {
    loadData(param, cb) {
      uc.getOnlineUsers(param)
        .then(response => {
          this.data = response.rows
          this.pageResult = {
            page: response.page,
            pageSize: response.pageSize,
            total: response.total
          }
        })
        .finally(() => cb())
    },
    kickOff(row) {
      uc.kickOffOnlineUser(row)
        .then((rep) => {
          if (rep.state) {
            this.$message.success("操作成功");
          }
          else {
            this.$message.error("操作失败");
          }
          this.loadData();
        });
    },
    kickAll() {
      uc.kickAllOnlineUsers()
        .then((rep) => {
          if (rep.state) {
            this.$message.success("操作成功");
          }
          else {
            this.$message.error("操作失败");
          }
          this.loadData();
        });
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
