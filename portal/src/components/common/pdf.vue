<template>
  <iframe :src="pdfSrc" v-if="src&&visiable" class="pdf__iframe" align="middle"></iframe>
</template>

<script>
import req from "@/request.js";

export default {
  name: "pdf",
  props: {
    src: String
  },
  data() {
    return {
      visiable: false,
      pdfSrc: ''
    };
  },
  watch: {
    src: function (newVal, oldVal) {
      if (newVal) {
        let _this = this;
        req.get(this.src, 'arraybuffer').then(response => {
          _this.pdfSrc = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))+"#toolbar=0";
        });
      }
    }
  },
  methods: {
    handleOpen() {
      this.visiable = true;
    }
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/css/element-variables.scss";
.pdf__iframe {
  width: 100%;
  height: 100%;
  border: 0;
}
</style>
