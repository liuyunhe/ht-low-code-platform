<template>
  <ht-sidebar-dialog
    :visible="followDialog"
    :before-close="cancel"
    title="跟踪设置"
    :close-on-click-modal="false"
    append-to-body
    class="dialog-body"
    width="100%"
  >
    <div :style="this.style">
      <van-form @submit="confirm">
        <div class="title-divider">
          <span>跟踪节点：</span>
        </div>
            <el-checkbox-group v-model="checkedNodes">
              <el-checkbox  v-for="node in nodes"  :label="node.nodeId" :key="node.nodeId" @change="selectOne(node.nodeId)">
                <div>{{node.name}}</div>
              </el-checkbox>
            </el-checkbox-group>
      </van-form>

      <div class="ht-dialog-footer">
        <van-grid clickable :column-num="2">
          <van-grid-item icon="passed" @click="confirm" text="确 认" />
          <van-grid-item icon="close" @click="cancel" text="取 消" />
        </van-grid>
      </div>
    </div>
  </ht-sidebar-dialog>
</template>

<script>
import { mapState, mapActions } from "vuex";
import {
  Notify,
  Form,
  Field,
  CheckboxGroup,
  Checkbox,
  Cell,
  CellGroup
} from "vant";

export default {
  name: "taskFollow",
  props: ["instId", "defId"],
  components: {
    [Form.name]: Form,
    [Field.name]: Field,
    [CheckboxGroup.name]: CheckboxGroup,
    [Checkbox.name]: Checkbox,
    [Cell.name]: Cell,
    [CellGroup.name]: CellGroup
  },
  data() {
    return {
      style: "",
      followDialog: false,
      proInst: this.instId,
    };
  },
  computed: {
    nodes: {
      get: function() {
        return this.$store.state.storeProcess.nodes;
      },
      set: function() {}
    },
    checkedNodes: {
      get: function () {
          return this.$store.state.storeProcess.checkedNodes;
      },
      set: function () {
      }
    }
  },
  methods: {
    //选择跟踪的任务节点
    selectOne(value) {
      if (this.checkedNodes.indexOf(value) > -1) {
        for (var i = 0; i < this.checkedNodes.length; i++) {
          if (this.checkedNodes[i] == value) {
            this.$store.dispatch("storeProcess/setCheckedSplice", i);
            return;
          }
        }
      } else {
        this.$store.dispatch("storeProcess/setCheckedPush", value);
      }
    },
    //鼠标点击页面其他其他位置不关闭弹框
    handleClose(done) {
      this.followDialog = true;
    },
    //打开跟踪设置弹出框并查询可跟踪的任务节点
    handleOpen() {
      this.followDialog = true;
      let data = {"defId":this.defId,"proInst":this.instId}
      this.$store.dispatch("storeProcess/taskNode",data);
    },
    //取消
    cancel() {
      this.followDialog = false;
    },
    //确认
    confirm() {
      let data = { taskId: "" };
      if (this.checkedNodes.length == 0) {
        Notify({
          type: "warning",
          message: "请选择跟踪节点"
        });
        return;
      }
      const loading = this.$loading({
        lock: true,
        text: '任务跟踪中，请耐心等待...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      for (var i = 0; i < this.checkedNodes.length; i++) {
        data.taskId = data.taskId + this.checkedNodes[i] + ",";
      }
      data.proInst = this.instId;
      //新增,更新任务跟踪表数据
      this.$store.dispatch("storeProcess/taskFollowSave", data).then(() => {
        loading.close();
        this.followDialog = false; //父组件调用子组件方法
      }).catch(() => {
        loading.close();
      });
    }
  }
};
</script>

<style lang="stylus" scoped>
>>>.el-checkbox__input {
    cursor: pointer;
    outline: 0;
    line-height: 1;
    vertical-align: middle;
    float: right;
    right: 10%;
}
>>>.el-checkbox__label {
    float: left ;
    display: inline-block;
    padding-left: 0px;
    line-height: 16px;
    font-size: 16px;
    width: 80%;
}
>>>.el-checkbox__label div{
    word-break: break-all;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    width: 100%;
}
>>>.el-checkbox {
    color:rgba(0,0,0,0.7);
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    margin-right: 30px;
    width: 100%;
    padding: 14px;
    border-bottom: 1px solid #f5f5f5;
}
>>> .el-dialog__header {
  padding: 10px 20px;
  background: #F8F8F8;
  height: 24px;
  line-height: 24px;
  border-bottom: 1px solid #eee;
  border-radius: 2px 2px 0 0;
}
>>> .el-dialog__headerbtn {
  top: 12px;
}
.ht-dialog-footer {
  height: 45px;
  position: fixed;
  bottom: 0;
  width: 100%;
}

div>>>.van-grid-item__icon {
  font-size: 15px !important;
}

div>>>.van-grid-item__content {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-direction: normal;
  -ms-flex-direction: column;
  flex-direction: column;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  height: 45px;
  padding: 16px 8px;
  background-color: #f5f5f5;
}

.title-divider {
  margin: 0;
  padding: 10px 10px 10px;
  color: rgba(69, 90, 100, 0.6);
  font-weight: normal;
  font-size: 14px;
  line-height: 16px;
  background: #F7F8FA;
}

>>>.van-field {
  padding: 0px;
}

>>>.van-cell:not(:last-child)::after {
    position: absolute;
    box-sizing: border-box;
    content: ' ';
    pointer-events: none;
    right: 0;
    bottom: 0;
    left: 0px;
    border-bottom: 1px solid #ebedf0;
    -webkit-transform: scaleY(.5);
    transform: scaleY(.5);
}
>>>.van-cell {
    position: relative;
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    box-sizing: border-box;
    width: 100%;
    overflow: hidden;
    color: #323233;
    font-size: 14px;
    line-height: 24px;
    background-color: #fff;
    padding-bottom: 3px;
    padding-right: 0px;
}
.footer {
  height: 45px;
  position: fixed;
  bottom: 0;
  width: 100%;
}

.xh-star {
  color: red;
}

.van-radio-group .van-radio {
  margin-bottom: 8px;
}

div>>>.el-dialog .el-dialog__body {
  padding: 0px;
  height: calc(100% - 115px);
}

.opinion-text {
  padding: 5px 8px;
}

>>>.v-modal {
  z-index: z-index;
}

>>>.van-checkbox {
  margin-bottom: 8px;
  float: right;
  margin-right: 10px;
}

>>>.van-checkbox-group {
  width: 100%;
}

>>>.van-cell {
  overflow: inherit;
}

>>>.van-cell__value {
  overflow: inherit;
}

>>>.van-checkbox {
  overflow: inherit;
}
>>>.el-checkbox-group {
    font-size: 0;
    overflow: hidden;
}
</style>