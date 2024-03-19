<template>
  <el-popconfirm title="确定删除吗？" @onConfirm="handleDelete" trigger="hover" class="ht-delete-button">
    <el-button
      slot="reference"
      v-if="!row"
      :type="type"
      icon="el-icon-delete"
      v-loading.fullscreen.lock="fullscreenLoading"
    >
      <slot></slot>
    </el-button>
    <el-dropdown-item
      icon="el-icon-delete"
      :command="{row:row,command:'delete'}"
      slot="reference"
      v-if="row"
      :type="type"
      v-loading.fullscreen.lock="fullscreenLoading"
    >
      <slot></slot>
    </el-dropdown-item>
  </el-popconfirm>
</template>

<script>
import req from "@/request.js";
export default {
  name: "ht-delete-button",
  props: {
    type: {
      type: String,
      default: "danger"
    },
    requestMethod: {
      type: String,
      default: "DELETE"
    },
    url: {
      type: String,
      required: true
    },
    pk: {
      type: String,
      default: "id"
    },
    parameter: {
      type: String,
      default: "ids"
    },
    pureData: {
      type: Boolean,
      default: false
    },
    htTable: {
      type: Object
    },
    row: {
      type: Object
    },
    ignoreTenant: {
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      fullscreenLoading: false,
      elTable: null
    };
  },
  methods: {
    async handleDelete() {
      this.elTable = this.htTable;
      if (this.htTable.$refs && this.htTable.$refs.htTable) {
        this.elTable = this.htTable.$refs.htTable;
      }
      if (
        this.elTable &&
        this.elTable.selection &&
        this.elTable.selection.length == 0 &&
        !this.row
      ) {
        this.$message.error("请至少选择一条数据");
        return;
      }

      let ids = [];

      if (this.row) {
        ids.push(this.row[this.pk]);
      } else {
        for (let item of this.elTable.selection) {
          if(!this.ignoreTenant && !this.$store.state.tenant.tenantId && item.tenantId && this.$store.state.login.currentUser.userAttrs.tenantId != item.tenantId ){
            this.$message.error("不能删除平台的公共数据");
            return ;
          }
          ids.push(item[this.pk]);
        }
      }

      let params = {},
        data = null;
      params[this.parameter] = ids.join(",");
      // 如果是纯文本作为参数，则直接传递文本作为参数
      if (this.pureData) {
        params = null;
        data = ids.join(",");
      }

      this.fullscreenLoading = true;
      let response = await req
        .request({
          params: params,
          data: data,
          url: this.url,
          method: this.requestMethod
        })
        .finally(() => {
          this.fullscreenLoading = false;
        });

      if (response.data && response.data.state) {
        this.$emit("after-delete");
        this.htTable.load();
        this.$message({
          message: response.data.message || "操作成功",
          showClose: true,
          type: "success"
        });
      }
    }
  }
};
</script>
