<template>
  <ht-table
    @load="loadData"
    :data="data"
    :selection="true"
    :page-result="pageResult"
    :default-querys="[{property:'formKey',value:formKey}]"
    :default-sorter="[{direction: 'DESC',property: 'createTime'}]"
    :show-export="false"
    :show-custom-column="false"
    ref="htTable"
  >
    <template v-slot:toolbar>
      <el-button-group>
        <el-button type="danger" @click="removeVersions()">删除</el-button>
        <!-- <ht-delete-button :url="formDeleteUrl" :htTable="$refs.htTable">删除</ht-delete-button> -->
      </el-button-group>
    </template>
    <template>
      <ht-table-column type="index" width="50" align="center" label="序号" />
      <ht-table-column prop="name" label="名称" :show-overflow-tooltip="true" />
      <ht-table-column prop="formKey" label="别名" :show-overflow-tooltip="true" />
      <!-- <ht-table-column prop="createBy" label="创建人ID" :show-overflow-tooltip="true" /> -->
      <ht-table-column prop="createTime" label="创建时间" :show-overflow-tooltip="true" />
      <!-- <ht-table-column prop="updateBy" label="更新人ID" :show-overflow-tooltip="true" /> -->
      <ht-table-column prop="updateTime" label="更新时间" :show-overflow-tooltip="true" />
      <ht-table-column
        prop="status"
        label="状态"
        width="80"
        :filters="[{text:'草稿', value:'draft'},{text:'已发布', value:'deploy'}]"
      >
        <template v-slot="{row}">
          <el-tag v-if="row.status=='deploy'">已发布</el-tag>
          <el-tag type="danger" v-if="row.status=='draft'">草稿</el-tag>
        </template>
      </ht-table-column>
      <ht-table-column prop="version" width="90" :sortable="true" label="版本号"></ht-table-column>
      <ht-table-column prop="isMain" width="80" label="主版本">
        <template v-slot="{row}">
          <el-tag v-if="row.isMain=='Y'">是</el-tag>
          <el-tag type="danger" v-else>否</el-tag>
        </template>
      </ht-table-column>
      <ht-table-column width="150" label="操作" align="left">
        <template v-slot="{row}">
          <el-dropdown
            size="mini"
            split-button
            @command="handleCommand"
            @click="handleCommand({row:row,command:'preview'})"
          >
            <span>
              <i class="el-icon-tickets"></i>预览
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item
                icon="el-icon-menu"
                :command="{row:row,command:'setMainVersion'}"
                v-if="row.isMain=='N'"
              >设为主版本</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </ht-table-column>
    </template>
  </ht-table>
</template>
<script>
import { mapState } from "vuex";
import req from "@/request.js";
export default {
  name: "FormVersionManager",
  props: {
    formKey: {
      type: String,
      required: true,
    },
    visible: {
      type: Boolean,
    },
  },
  components: {},
  data() {
    return {
      data: [],
      pageResult: {
        page: 1,
        pageSize: 20,
        total: 0,
      },
    };
  },
  computed: {
    ...mapState({
      currentUser: (state) => state.login.currentUser,
      formDeleteUrl: function () {
        return `${window.context.form}/form/form/v1/removeVersions`;
      },
    }),
  },
  mounted() {
    this.$validator = this.$root.$validator;
    this.$root.$emit("resize");
  },
  methods: {
    removeVersions() {
      let selection = this.$refs.htTable.selection;
      if (selection && selection.length == 0) {
        this.$message.error("请至少选择一条数据");
        return;
      }
      let ids = [];
      for (let item of selection) {
        if (item.isMain == "Y") {
          this.$message.error("主版本不可删除!");
          return;
        }
        ids.push(item.id);
      }
      let params = {},
        data = null;
      params["ids"] = ids.join(",");
      req
        .request({
          params: params,
          data: data,
          url: this.formDeleteUrl,
          method: "DELETE",
        })
        .then((response) => {
          if (response.data && response.data.state) {
            this.$refs.htTable.load();
            this.$message({
              message: response.data.message || "操作成功",
              showClose: true,
              type: "success",
            });
          }
        })
        .finally(() => {
          this.fullscreenLoading = false;
        });
    },
    close() {
      this.$emit("update:visible", false);
    },
    loadData(param, cb) {
      this.$http
        .post("${form}/form/form/v1/listVersions", param)
        .then((response) => {
          this.data = response.data.rows;
          this.pageResult = {
            page: response.data.page,
            pageSize: response.data.pageSize,
            total: response.data.total,
          };
        })
        .finally(() => cb());
    },
    handleCommand(params) {
      switch (params.command) {
        case "preview":
          if (this.currentUser && this.currentUser.account) {
            window.open(
              window.context.front +
                "/previewForm/" +
                params.row.id +
                "?token=" +
                this.currentUser.token,
              // Base64.encode(this.currentUser.account),
              "_blank"
            );
          }
          break;
        case "setMainVersion":
          this.$http
            .post(
              "${form}/form/form/v1/setDefaultVersion",
              {},
              { id: params.row.id, formKey: params.row.formKey }
            )
            .then((response) => {
              if (response.data.state) {
                this.$message({
                  type: "success",
                  message: response.data.message,
                });
                this.$refs.htTable.load();
              } else {
                this.$message.$error(response.data.message);
              }
            });
          break;
        default:
          break;
      }
    },
    handleClose() {
      this.dialogVisible = false;
    },
  },
};
</script>
