<template>
  <iframe :src="dataSrc" v-if="iframeSrc&&visible" class="container__iframe" align="middle"></iframe>
</template>

<script>
import req from "@/request.js";
export default {
  props: ["iframeSrc", "fileRow",],
  data() {
    return {
      visible: false,
      dataSrc: '',
    }
  },
  watch: {
    iframeSrc: function (newVal, oldVal) {
      if (newVal) {
        let _this = this;
        req.get(this.iframeSrc, 'arraybuffer').then(response => {
          let type = response.headers['content-type'];
          if (type) {
            _this.dataSrc = window.URL.createObjectURL(new Blob([response.data], { type: type }));
          } else {
            _this.dataSrc = window.URL.createObjectURL(new Blob([response.data]));
          }
        });
      }
    }
  },
  methods: {
    handleOpen() {
      this.visible = true;
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/css/element-variables.scss";
.container__iframe {
  height: 100%;
  width: 100%;
  border: 0;
}
</style>