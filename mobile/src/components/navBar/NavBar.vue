<template>
  <div>
    <van-nav-bar
      :left-text="leftText"
      :left-arrow="leftArrow"
      :border="border"
      :fixed="fixed"
      :placeholder="placeholder"
      :z-index="zIndex"
      @click-left="onClickLeft"
      @click-right="onClickRight"
    >
      <slot name="title" slot="title">{{title}}</slot>
      <slot name="right" slot="right"></slot>
    </van-nav-bar>
  </div>
</template>
<script>
import { NavBar } from "vant";
export default {
  components: { [NavBar.name]: NavBar },
  props: {
    title: {
      type: String,
      default: ""
    },
    leftText: {
      type: String,
      default: ""
    },
    leftArrow: {
      type: Boolean,
      default: true
    },
    border: {
      type: Boolean,
      default: true
    },
    fixed: {
      type: Boolean,
      default: true
    },
    placeholder: {
      type: Boolean,
      default: true
    },
    zIndex: {
      type: Number | String,
      default: 9999
    }
  },
  data() {
    return {};
  },
  methods: {
    onClickLeft() {
      this.$router.go(-1);
    },
    onClickRight() {}
  }
};
</script>
<style scoped>
</style>