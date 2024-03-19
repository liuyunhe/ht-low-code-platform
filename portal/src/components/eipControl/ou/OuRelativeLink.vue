<template>
  <div v-if="inputWriteable || isReadOnly" class="ou-attachment" role="link">
    <el-tag
      type="info"
      v-for="(item, index) in formatVal"
      :key="index"
      @click="handleClick(item)"
    >
      <span :class="[disabled? 'relative-link--disabled':'relative-link']">{{ item.label || '' }}</span>
    </el-tag>
  </div>
</template>
<script>
import utils from '@/utils.js'
import sub_pio_mixin from '@/sub-permission-mixin.js'
import {Message} from 'element-ui'
export default {
  name: 'ou-relative-link',
  props: [
    'validate',
    'value',
    'permission',
    'platform',
    'allowDelete',
    'disabled',
  ],
  mixins: [sub_pio_mixin],
  data() {
    return {
      writeable: true,
    }
  },
  model: {
    prop: 'value',
    event: 'change',
  },
  computed: {
    isReadOnly: function () {
      return !this.allowDelete || this.permission == 'r'
    },
    inputWriteable: function () {
      return (
        this.allowDelete &&
        (this.writeable ? utils.getWriteable(this.permission) : this.writeable)
      )
    },
    //格式化JSON的value
    formatVal: {
      get() {
        if (!this.value) {
          return []
        }
        try {
          let val = JSON.parse(this.value)
          return val
        } catch {
          return []
        }
      },
      set(val) {
        this.$emit('change', JSON.stringify(val))
      },
    },
  },
  mounted() {
    //test component
  },
  methods: {
    handleClick(obj) {
    if(this.disabled) return 
        //TODO:加入JS逻辑、跳转提醒、以及跳转路径校验等
      const platform = obj.platform ===undefined? true:obj.platform;
      if (platform && obj.link) {
        const regExp=/^http(s)*/
        if(regExp.test(obj.link)){
          window.open(obj.link);
          return;
        }
        this.$router.push(obj.link)  //事务平台内的路径跳转
      } else if (obj.link) window.open(obj.link)
    },
  },
}
</script>
<style lang="scss" scoped>
.relative-link{
    color:#4693f0;
    cursor: pointer;
    &:hover{
        text-decoration: underline;
    }
}
.relative-link--disabled{
     color:#4693f0;
}
</style>