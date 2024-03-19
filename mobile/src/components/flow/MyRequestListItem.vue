<template>
  <div>
    <div v-if="item.status=='running'" class="task_state">
      <em class="task_ongoing"></em>
      <p class="task_ongoing_word">运行中</p>
    </div>
    <div v-if="item.status=='end' || item.status=='manualend'" class="task_state">
      <em class="task_over"></em>
      <p class="task_over_word">结束</p>
    </div>
    <div v-if="item.status=='revoke' || item.status=='revokeToStart'" class="task_state">
      <em class="task_withdraw"></em>
      <p class="task_withdraw_word">撤销</p>
    </div>
    <div v-if="item.status=='backToStart' || item.status=='back'" class="task_state">
      <em class="task_withdraw"></em>
      <p class="task_withdraw_word">驳回</p>
    </div>
    <div v-if="item.status=='draft' " class="task_state">
      <em class="task_draft"></em>
      <p class="task_draft_word">草稿</p>
    </div>
    <div class="task_list_word">
      <div class="task_list_name">
        <strong>{{item.procDefName}}</strong>
      </div>
      <p class="task_list_name">{{item.subject}}</p>
      <div class="task_list_time">{{item.createTime}}</div>
    </div>
  </div>
</template>
<script>
export default {
  components: {},
  props: ["item"],
  data() {
    return {};
  }
};
</script>
<style scoped>
.van-cell__title {
  width: 100%;
}
.task_list {
  display: block;
  padding: 10px 15px 10px 0;
  border-bottom: 1px solid #e9e9e9;
}
.task_list_word {
  width: calc(100% - 46px);
  padding-left: 10px;
  float: left;
  min-height: 54px;
}
.task_list_name {
  width: 100%;
  font-size: 15px;
  color: #252525;
  word-break: break-all;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  line-height: 19px;
  margin: 0;
}
.task_list_time {
  font-size: 12px;
  color: #a8a8a8;
  padding-top: 3px;
}
.task_state {
  width: 36px;
  float: left;
  font-size: 12px;
  text-align: center;
  margin-top: 2px;
}
.task_ongoing {
  display: block;
  width: 100%;
  height: 35px;
  background: url(../../assets/img/task_ongoing.png) no-repeat center top;
  background-size: 35px 35px;
}
.task_ongoing_word {
  color: #7ec311;
  padding-top: 3px;
  word-break: break-all;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  margin: 0;
}
.task_over {
  display: block;
  width: 100%;
  height: 35px;
  background: url(../../assets/img/task_over.png) no-repeat center top;
  background-size: 35px 35px;
}
.task_over_word {
  color: #c1c1c1;
  padding-top: 3px;
  word-break: break-all;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  margin: 0;
}
.task_withdraw {
  display: block;
  width: 100%;
  height: 35px;
  background: url(../../assets/img/task_withdraw.png) no-repeat center top;
  background-size: 35px 35px;
}
.task_withdraw_word {
  color: #f36060;
  padding-top: 3px;
  word-break: break-all;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  margin: 0;
}
.task_draft {
  display: block;
  width: 100%;
  height: 35px;
  background: url(../../assets/img/task_draft.png) no-repeat center top;
  background-size: 35px 35px;
}
.task_draft_word {
  color: #5e8cca;
  padding-top: 3px;
  word-break: break-all;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  margin: 0;
}
.task_undo {
  display: block;
  width: 100%;
  height: 35px;
  background: url(../../assets/img/task_undo.png) no-repeat center top;
  background-size: 35px 35px;
}
.task_undo_word {
  color: #a68d93;
  padding-top: 3px;
  word-break: break-all;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  margin: 0;
}
</style>