<template>
  <ht-save-button
    :is-submit="isSubmit"
    :request-method="requestMethod"
    :scope-name="scopeName"
    @before-save-data="beforeSaveData"
    @request-save-data="requestSaveData"
    v-loading.fullscreen.lock="fullscreenLoading"
  ><slot></slot></ht-save-button>
</template>

<script>
import req from "@/request.js";
export default {
  name: "ht-submit-button",
  props: {
    url: {
      type: String,
      required: true
    },
    requestMethod: {
      type: String,
      default: "POST"
    },
    model: {
      type: [Object, Array],
      default(){
        return {};
      }
    },
    isSubmit: {
      type: Boolean,
      default: true
    },
    type: {
      type: String,
      default: "primary"
    },
    scopeName: {
      type: String,
      required: true
    },
    context: {
      type: String
    }
  },
  data() {
    return {
      fullscreenLoading: false
    };
  },
  computed:{
    calUrl: function(){
      if(this.context){
        return window.context[this.context] + this.url;
      }
      return this.url;
    }
  },
  mounted() {},
  methods: {
    async beforeSaveData() {
      await this.$emit("before-save-data");
    },
    async requestSaveData() {
      this.fullscreenLoading = true;
      let response = await req.request({
        data: this.model,
        url: this.calUrl,
        method: this.requestMethod
      }).finally(() => {
        this.fullscreenLoading = false;
      });

      if (response.data && response.data.state) {
        this.$emit("after-save-data");
        this.$message.success(response.data.message || "操作成功");
        if(response.data.value){
          this.$emit("after-response-value",response.data.value);
        }
      }
    }
  }
};
</script>
