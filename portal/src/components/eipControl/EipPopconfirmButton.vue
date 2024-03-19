<template>
    <el-popconfirm
      :title="title"
      @onConfirm="onConfirm"
      @onCancel="onCancel">
      <el-button
        slot="reference"
        :type="type"
        :size="size"
        :disabled="disabled"
        :icon="icon">
        <slot></slot>
      </el-button>
    </el-popconfirm>
</template>

<script>
  export default {
    name: "eip-popconfirm-button",
    props: {
      title: {
        type: String,
        default: "确定吗？"
      },
      type: {
        type: String,
        default: "info"
      },
      size: {
        type: String,
        default: "small"
      },
      icon: {
        type: String,
        default: "none"
      },
        disabled: {
        type: Boolean,
        default: false
      }
    },
    methods: {
      onConfirm(){
        this.$emit("onConfirm");
      },
      onCancel(){
        this.$emit("onCancel");
      }
    }
  }
</script>

<style scoped>

</style>
