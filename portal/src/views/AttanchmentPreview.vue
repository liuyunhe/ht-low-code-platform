<template>
  <FilePreview ref="filePreview" :closeable="false" />
</template>
<script>
import FilePreview from "@/components/common/FilePreview.vue";

export default {
  props: {
    fileId: {
      type: String
    }
  },
  components: { FilePreview },
  mounted() {
    this.$refs.filePreview.preview({ id: this.fileId });
  }
}
</script>