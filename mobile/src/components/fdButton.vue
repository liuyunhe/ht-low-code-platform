<template>
  <div class="float_button" v-if="badgeValue > 0">
    <div
      @click="onBtnClicked"
      ref="floatButton"
      id="floatButton"
      class="float_info"
      :style="{
        width: itemWidth + 'px',
        height: itemHeight + 'px',
        left: left + 'px',
        top: top + 'px',
      }"
    >
      <el-badge :value="badgeValue" :max="100">
        <img src="../assets/img/remind.png" style="background: transparent" />
      </el-badge>

      <!-- <span class="text">{{ text }}</span> -->
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      clientWidth: 0,
      clientHeight: 0,
      timer: null,
      currentTop: 0,
      left: 0,
      top: 0,

      oldScrollTop: 0, //记录上一次滚动结束后的滚动距离
      scrollTop: 0, // 记录当前的滚动距离
    }
  },
  props: {
    text: {
      // 按钮文本内容
      type: String,
      default: '首页',
    },
    itemWidth: {
      // 悬浮按钮宽度
      type: Number,
      default: 55,
    },
    itemHeight: {
      // 悬浮按钮高度
      type: Number,
      default: 55,
    },
    gapWidth: {
      // 距离左右两边距离
      type: Number,
      default: 15,
    },
    coefficientHeight: {
      // 从上到下距离比例
      type: Number,
      default: 0.55,
    },
    badgeValue: {
      type: Number,
      default: 0,
    },
  },
  created() {
    this.clientWidth = document.documentElement.clientWidth
    this.clientHeight = document.documentElement.clientHeight
    this.left = this.clientWidth - this.itemWidth - this.gapWidth
    this.top = this.clientHeight * this.coefficientHeight
  },
  mounted() {
    this.$nextTick(() => {})
    setTimeout(() => {
      const floatButton = this.$refs.floatButton
      if (floatButton) {
        floatButton.addEventListener('touchstart', () => {
          floatButton.style.transition = 'none'
        })

        // 在拖拽的过程中，组件应该跟随手指的移动而移动。
        floatButton.addEventListener('touchmove', (e) => {
          if (e.targetTouches.length === 1) {
            // 一根手指
            document.body.addEventListener('touchmove', this.bodyScroll, {
              passive: false,
            }) //禁止页面滑动
            let touch = e.targetTouches[0]
            this.left = touch.clientX - 20
            this.top = touch.clientY - 25
          }
        })

        // 拖拽结束以后，重新调整组件的位置并重新设置过度动画。
        floatButton.addEventListener('touchend', () => {
          document.body.removeEventListener('touchmove', this.bodyScroll, {
            passive: false,
          }) //解除页面禁止滑动
          floatButton.style.transition = 'all 0.3s'
          if (this.left > document.documentElement.clientWidth / 2) {
            this.left = document.documentElement.clientWidth - 70
          } else {
            this.left = 15
          }
        })
      }
    }, 2000)

    this.handleScroll()
  },
  methods: {
    //拖动时禁止滑动
    bodyScroll(event) {
      event.preventDefault()
    },
    onBtnClicked() {
      this.$emit('onFloatBtnClicked')
    },
    handleScroll() {
      window.addEventListener('scroll', () => {
        this.scrollTop = window.scrollY
      })
    },
    handleScrollStart() {
      this.timer && clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.handleScrollEnd()
      }, 300)
      this.currentTop =
        document.documentElement.scrollTop || document.body.scrollTop
      if (this.left > this.clientWidth / 2) {
        this.left = this.clientWidth - this.itemWidth / 2
      } else {
        this.left = -this.itemWidth / 2
      }
    },
    handleScrollEnd() {
      let scrollTop =
        document.documentElement.scrollTop || document.body.scrollTop
      if (scrollTop === this.currentTop) {
        if (this.left > this.clientWidth / 2) {
          this.left = this.clientWidth - this.itemWidth - this.gapWidth
        } else {
          this.left = this.gapWidth
        }
        clearTimeout(this.timer)
      }
    },
  },
  beforeDestroy() {
    // 添加监听页面滚动  销魂滚动监听
    window.removeEventListener('scroll', this.handleScrollStart)
  },
  watch: {
    scrollTop(newValue, oldValue) {
      setTimeout(() => {
        if (newValue == window.scrollY) {
          //延时执行后当newValue等于window.scrollY，代表滚动结束
          //console.log('滚动结束');
          if (this.left === 15) {
            //按钮在页面左侧
            this.left = this.left + 40
          } else if (this.left < 15) {
            this.left = 15
          } else {
            this.left = this.left - 40
          }
          this.oldScrollTop = newValue //每次滚动结束后都要给oldScrollTop赋值
        }
      }, 20) //必须使用延时器，否则每次newValue和window.scrollY都相等，无法判断，20ms刚好大于watch的侦听周期，故延时20ms
      if (this.oldScrollTop == oldValue) {
        //每次滚动开始时oldScrollTop与oldValue相等
        //console.log('滚动开始');
        if (this.left === 15) {
          this.left = this.left - 40
        } else {
          this.left = this.left + 40
        }
      }
    },
  },
  destroyed() {},
}
</script>
<style lang="scss" scoped>
.float_button {
  .float_info {
    // box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.1);
    // color: #666666;
    transition: all 0.3s;
    position: fixed;
    bottom: 50px;
    right: 30px;
    width: 55px;
    height: 55px;
    display: flex;
    flex-flow: column;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    background: transparent;
    border-radius: 50%;
    cursor: pointer;
    // .text {
    //   font-size: 24px;
    //   color: #fff;
    // }
    img {
      width: 45px;
      height: 45px;
    }
  }
}
</style>

