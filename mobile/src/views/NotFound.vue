<template>
  <FillPage type="1" tip="啊哦，你所访问的页面不存在" back-link></FillPage>
</template>

<script>
import FillPage from '@/components/common/FillPage.vue'

export default {
  name: "notfound",
  components: { FillPage }
};
</script>
