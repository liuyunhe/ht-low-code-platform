import FlowBus from '@/components/eipControl/bus/FlowMenuBus.js'
export default {
  mounted() {
    //获取FlowTree实例，部分ref取出的值是undefined,nextTick都不管用,有点无语
    const vm = this?.$children?.[0]?.$children?.[0]?.$children?.[0] ?? {}
    //隐藏aside组件
    if (!$.isEmptyObject(vm?.$parent ?? {})) {
      $(vm.$parent?.$el).hide()
    }
    //隐藏小箭头
    $('.navbar-collapse-bg').hide()
  },
  beforeRouteEnter (to, from, next) {
    next(vm=>{
      //先去除存在的监听回调,再绑定新的回调保证回调只执行一次
      FlowBus.$off('flow-menu');
      FlowBus.$on('flow-menu',(menu)=>{
        if(vm.getCurrent && typeof vm.getCurrent === 'function'){
          vm.getCurrent(menu);
        }
      })
    })
  }
}
