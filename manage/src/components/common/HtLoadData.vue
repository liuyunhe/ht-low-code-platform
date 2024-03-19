<template>
  <div style="display:none" v-loading.fullscreen.lock="fullscreenLoading">加载数据...</div>
</template>

<script>
import req from "@/request.js";
export default {
  name: "ht-load-data",
  props: {
    url: {
      type: String,
      default: ""
    },
    requestMethod: {
      type: String,
      default: "GET"
    },
    context: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      fullscreenLoading: false
    };
  },
  watch: {
    url: {
      handler: function(newVal, oldValue) {
        if (newVal && newVal != oldValue) {
          this.getData();
        }
      },
      immediate: true
    }
  },
  mounted() {},
  methods: {
    async getData() {
      this.fullscreenLoading = true;
      let response = await req
        .request({
          url: `${window.context[this.context]}`+this.url,
          method: this.requestMethod
        })
        .finally(() => {
          this.fullscreenLoading = false;
        });
      this.$emit("update:url","");
      this.$emit("after-load-data", response.data);
    },
    async loadData(url){
      this.fullscreenLoading = true;
      let response = await req
        .request({
          url: url,
          method: this.requestMethod
        })
        .finally(() => {
          this.fullscreenLoading = false;
        });
      return response.data;
    }
  }
};
</script>
