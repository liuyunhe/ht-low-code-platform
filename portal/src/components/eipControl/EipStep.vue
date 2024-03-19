<template>
  <div>
    <el-steps
      v-if="permission_sub!='n'"
      :active="inputVal"
      :direction="direction"
      align-center
      finish-status="success"
    >
      <el-step
        v-for="(item,index) in stepList"
        :key="index"
        :title="item.title"
        :description="item.description"
      ></el-step>
    </el-steps>
  </div>
</template>
<script>
import utils from "@/utils.js";
import sub_pio_mixin from "@/sub-permission-mixin.js";
export default {
  name: "ht-step",
  props: ["value", "direction", "content","permission"],
  mixins: [sub_pio_mixin],//混入方式引入表单组件中公共属性，处理子表、孙表行内联动（切面修改permission_sub）
  data() {
    return {
      active: 1,
      stepList: []
    };
  },
  computed: {
    inputVal: function() {
      if (!this.value) {
        return 1;
      }
      return this.value;
    }
  },
  mounted() {},
  created() {
    var contentjson = JSON.parse(this.content);
    this.stepList = contentjson;
  },
  methods: {}
};
</script>
<style lang="stylus" scoped></style>
