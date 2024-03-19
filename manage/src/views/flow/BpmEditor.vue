<template>
  <div class="bpm-editor-container">
    <iframe
      :src="bpmEditorUrl"
      style="height: 100%;width:100%; frameborder=no"
      frameborder="no"
      border="0"
      marginwidth="0"
      marginheight="0"
    ></iframe>
  </div>
</template>
<script>
import screenfull from "screenfull";

export default {
  name: "bpm-editor",
  props: {
    defId: String
  },
  computed: {
    bpmEditorUrl: function() {
      const url = window.context.manage + "/bpm-editor/modeler.html";
      if (this.defId) {
        return `${url}?defId=${this.defId}`;
      } else {
        return url;
      }
    }
  },
  data() {
    return {
      fullscreen: false
    };
  },
  mounted() {
    window.addEventListener("message", this.receiveMsg, false);
  },
  methods: {
    receiveMsg(event) {
      if (!event || !event.data || !event.data.type) {
        return;
      }
      switch (event.data.type) {
        case "flowDesignFullscreen":
          this.toggle();
          break;
        case "flowDesignPublishSuccess":
          this.$emit("def-deploy-success",event.data.id);
          break;
        case "flowDesignSaveSuccess":
          this.$emit("switch-config-refresh");
          break;
      }
    },
    toggle() {
      if (!screenfull.isEnabled) {
        this.$message({
          message: "不支持全屏",
          type: "warning"
        });
        return false;
      }
      screenfull.toggle(this.$el);
      this.fullscreen = !this.fullscreen;
    }
  },
  beforeDestroy() {
    window.removeEventListener("message", this.receiveMsg);
  }
};
</script>
<style scoped>
.bpm-editor-container {
  height: 100%;
}
</style>