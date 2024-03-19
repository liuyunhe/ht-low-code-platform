<template>
  <div class="fullWidth">
    <template-preview :templateKey="templateKey" single="true" :dataView="dataView"></template-preview>
  </div>
</template>
<script>
import utils from "@/utils.js";
import TemplatePreview from "@/components/dataTemplate/templatePreview.vue";

export default {
  name: "eip-data-view",
  props: {
    templateKey: String,
    options: String,
  },
  components: {TemplatePreview},
  data() {
    return {
      dataView:{}
    };
  },
  mounted() {
    //数据视图
    if(this.options){
      this.dataView = JSON.parse(this.options);
    }
  },
  methods: {
    
  },
  created() {
    
  }
};
</script>

<style lang="stylus" scoped>
.fullWidth {
  width :100%;
}
</style>
