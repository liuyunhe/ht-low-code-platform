<template>
  <FillPage :type="confJson.type" :tip="messageObj[tipId]" :back-link="confJson.backLink" :custom-link-label="confJson.customLinkLabel"></FillPage>
</template>

<script>
import FillPage from '@/components/common/FillPage.vue';
import { Base64 } from 'js-base64';
export default {
  name: 'notfound',
  components: { FillPage },
  props: ['tipId'],
  data() {
    return {
      confJson: {},
      messageObj:{
        '1':'操作成功',
        '2':'此短链接不存在',
        '3':"此短链接已经禁止访问",
        '4':"此短链接已过有效期",
        '5':"此表单不允许以外链的方式打开...",
        '6':"",
        '7':"",
        '8':"",
        '9':"",
      }
    };
  },
  created() {
	history.pushState(null, null, document.URL);
    window.addEventListener('popstate', function () {
      history.pushState(null, null, document.URL);
    });
  },
};
</script>
