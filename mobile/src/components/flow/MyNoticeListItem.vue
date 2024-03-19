<template>
  <div>
    <div v-if="status=='wait'" class="notice_state">
      <em class="notice_unread"></em>
      <p class="notice_unread_word">{{item.status == 'COPYTO'? '抄送':item.status == 'COMMU'? '沟通':'跟踪'}}</p>
    </div>
    <div v-if="status=='read'" class="notice_state">
      <em class="notice_read"></em>
      <p class="notice_read_word">入库</p>
    </div>
    <div class="notice_list_word">
      <div class="notice_list_name"><strong>{{item.subject}}</strong></div>
      <p class="notice_list_name" v-if="status=='wait'">{{item.ownerName}}</p>
      <p class="notice_list_name" v-if="status=='read'">{{item.qualfiedNames}}</p>
      <div class="notice_list_time">{{item.createTime}}</div>
    </div>
  </div>
</template>
<script>
export default {
  components: {},
  props: ["item", "status"],
  data() {
    return {};
  }
};
</script>
<style scoped>
.notice_list {
  display: block;
  padding: 10px 15px 10px 0;
  border-bottom: 1px solid #e9e9e9;
}
.notice_list_word {
  width: calc(100% - 60px);
  padding-left: 10px;
  float: left;
  min-height: 54px;
}
.notice_list_name {
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
.notice_list_time {
  font-size: 12px;
  color: #a8a8a8;
  padding-top: 3px;
}
.notice_state {
  width: 48px;
  float: left;
  font-size: 12px;
  text-align: center;
  margin-top: 2px;
}
.notice_unread {
  display: block;
  width: 100%;
  height: 35px;
  background: url(../../assets/img/notice_wait.png) no-repeat center top;
  background-size: 35px 35px;
}
.notice_unread_word {
  color: #7ec311;
  padding-top: 3px;
  word-break: break-all;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  margin: 0;
}
.notice_read {
  display: block;
  width: 100%;
  height: 35px;
  background: url(../../assets/img/notice_read.png) no-repeat center top;
  background-size: 35px 35px;
}
.notice_read_word {
  color: #c1c1c1;
  padding-top: 3px;
  word-break: break-all;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  margin: 0;
}
.notice_send {
  display: block;
  width: 100%;
  height: 35px;
  background: url(../../assets/img/work_sendIcon.png) no-repeat center top;
  background-size: 35px 35px;
}
.notice_send_word {
  color: #5e8cca;
  padding-top: 3px;
  word-break: break-all;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  margin: 0;
}
</style>