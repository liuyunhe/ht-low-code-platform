<template>
  <el-dialog
    title="流程列表"
    :visible.sync="dialogVisible"
    :close-on-click-modal="false"
    width="66%"
    id="often-set-dialog"
  >
    <div>
      <h3 class="often-flow-group-title">流程分类</h3>
      <p style="display: inline-block">点击流程名称启动相应流程</p>
      <el-input
        :clearable="true"
        class="often-search-input"
        size="small"
        placeholder="请输入流程名称"
        v-model="flowSearchKey"
        @keyup.enter.native="searchEnterFun"
      >
        <el-button
          slot="append"
          icon="el-icon-search"
          @click="searchFlow"
        ></el-button>
      </el-input>
    </div>
    <div class="flow-list-content" v-if="hasAuthFlowList.length > 0">
      <div v-for="type in hasAuthFlowList" :key="type.name">
        <li
          :style="type.icon.color"
          :class="type.icon.icon"
        ></li>
        <h3 style="margin: 8px">{{ type.name }}</h3>
        <div class="often-flow-container" style="background-color: #f5f5f5">
          <el-tag v-for="flow in type.flowList" :key="flow.id"
            ><span @click="startFlow(flow)">{{ flow.name }}</span></el-tag
          >
        </div>
      </div>
    </div>
    <div class="empty-msg-div" v-if="hasAuthFlowList.length == 0">
      <p v-if="completeInit">抱歉！没有找到符合条件的流程</p>
      <p v-if="completeInit">您可以尝试更换关键词</p>
    </div>
  </el-dialog>
</template>
    <script>
import { mapState } from "vuex";

export default {
  data() {
    return {
      dialogVisible: false,
      flowSearchKey: "",
    };
  },
  computed: mapState({
    completeInit: (state) => state.oftenFlow.completeInit,
    hasAuthFlowList: (state) => state.oftenFlow.hasAuthFlowList,
  }),
  created() {
    //this.$store.dispatch("oftenFlow/getMyOftenFlowdw");
  },
  methods: {
    //启动流程
    startFlow(row) {
      if (!row.leaders || row.leaders.length == 0) {
        this.$router.push("/agentStart/" + row.id + "/0");
        this.dialogVisible = false;
      } else {
        let html =
          "<select ref=" +
          Math.random() +
          ' id="approvalLeaderSelect" style="width: 200px;height: 30px;border-radius: 4px;margin: 20px 70px;" ><option value="">请选择</option>';
        row.leaders.forEach((identity) => {
          html +=
            '<option value="' +
            identity.id +
            '">' +
            identity.name +
            "</option>";
        });
        html += "</select>";
        let this_ = this;
        this.$alert(html, "选择发起人", {
          dangerouslyUseHTMLString: true,
          beforeClose: function (action, instance, done) {
            if (action == "confirm") {
              let se = document.getElementById("approvalLeaderSelect");
              if (se.selectedIndex == 0) {
                this.$message.warning("请选择一个发起人");
              } else {
                instance.close();
                this_.$router.push(
                  "/agentStart/" + row.id + "/" + se[se.selectedIndex].value
                );
                this.dialogVisible = false;
              }
            } else {
              instance.close();
            }
          },
        });
      }
    },
    oftenFlowListOpen() {
      this.dialogVisible = true;
      this.flowSearchKey = "";
      this.$store.dispatch("oftenFlow/initOftenFlowManageData", { init: true });
    },
    //查询流程
    searchFlow() {
      let queryFilter = {};
      if (this.flowSearchKey) {
        queryFilter = {
          querys: [
            {
              property: "DEF_KEY_",
              value: this.flowSearchKey,
              group: "main",
              operation: "LIKE",
              relation: "OR",
            },
            {
              property: "name_",
              value: this.flowSearchKey,
              group: "main",
              operation: "LIKE",
              relation: "OR",
            },
          ],
        };
      }
      this.$store.dispatch("oftenFlow/initOftenFlowManageData", {
        init: false,
        filter: queryFilter,
      });
    },
    //回车查询
    searchEnterFun: function (e) {
      var keyCode = window.event ? e.keyCode : e.which;
      if (keyCode == 13) {
        this.searchFlow();
      }
    },
  },
};
</script>
<style lang="stylus" scoped>
.often-flow-container {
  padding: 10px 10px 0px 10px;
}

.el-card__body {
  padding: 10px 10px 0px 10px;
}

.often-flow-container /deep/ .el-tag {
  margin: 0 10px 10px 0;
  color: #666;
  cursor: pointer;
  font-weight: bold;
}

.often-flow-container /deep/ .el-tag:hover {
  color: $--theme-color;
}

.type-span {
  color: $--theme-color;
}

#often-set-dialog /deep/ {
  .el-dialog__body {
    padding: 0px 20px 5px 20px;
    border-top: 1px solid #eee;
    border-bottom: 1px solid #eee;
  }

  .el-dialog__header {
    padding: 8px 20px;
  }

  .el-dialog__footer {
    padding: 8px 20px;
    text-align: center;
  }
}

.often-flow-group-title {
  margin: 8px 8px 8px 0px;
  color: #333;
  display: inline-block;
}

.flow-list-content {
  max-height: 500px;
  overflow-y: auto;

  li {
    font-size: 16px;
    list-style-type:none;
  }

  h3 {
    display: inline-block;
  }

  p {
    margin: 0 10px 10px 0;
    line-height: 28px;
    display: inline-block;

    span {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100px;
    }
  }

  img {
    width: 20px;
    height: 20px;
    border-radius: 10%;
    float: left;
    margin: 2px 5px 0 0;
  }
}

.often-search-input {
  width: 250px;
  float: right;
  top: 10px;
}

.empty-msg-div {
  height: 220px;
  padding-top: 100px;
  text-align: center;

  p {
    margin: 8px;
  }

  p:last-child {
    color: #999;
  }
}
</style>