//用一个事件总线来单独控制流程中心的菜单
//components/flow/flowMenuTree
import Vue from 'vue'

const FlowMenuBus = new Vue({
  data() {
    return {
      restore: false, //恢复之前的菜单?
      subIndex: '', //subMenu的index
      indexPath: '', //indexPath
      index: '', //具体的index
      lastMenu: null, //最后一次点击时获取的menuData
      routePath: '' //最后一次点击时对应的路由路径
    }
  },
  methods: {
    //设置即将要回复的菜单
    handleSetMenu(index, indexPath) {
      this.restore = true
      index = index || ''
      indexPath = indexPath || []
      this.index=index;
      this.indexPath = indexPath
    },
    //还原总线数据
    clearAll() {
      const originData = this.$root.$options.data()
      this.restore = originData.restore
      this.subIndex = originData.subIndex
      this.indexPath = originData.indexPath
      this.index = originData.index
    },
    //还原菜单
    handleRestoreMenu(vm) {
      this.$emit("restore",vm,this.index,Object.assign([],this.indexPath))
      this.clearAll()
    }
  }
})

FlowMenuBus.$on('router', (index, indexPath) => {
  FlowMenuBus.handleSetMenu(index, Object.assign([],indexPath))
  const vm = window.app.$root //应用根实例
  let path = `/v-flow/${indexPath[0]}`
  FlowMenuBus.routePath = path
  if (vm.$route.path == path) return
  vm.$router.push(path)
})
export default FlowMenuBus
