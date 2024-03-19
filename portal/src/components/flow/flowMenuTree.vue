<script>
import process from '@/api/process.js'
import _ from 'lodash'
import {cloneDeep} from 'lodash'
//ccwgq 2022-07-07 引入流程的事件总线
import FlowBus from '@/components/eipControl/bus/FlowMenuBus.js'
export default {
  props: {
    //用于接收menuContent中的menus
    menus: {
      type: Array,
      default: () => [],
    },
    defaultActive: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      activeIndex: 'v-todo',
      openIndex: '',
      defaultProps: {
        // children: 'children',
        label: 'name',
        isLeaf: 'isLeaf',
      },
      flowMenus: this.generateOutRoot(this.menus),
      //获取流程中心每个页面在流程分类下的数量
      processList: {
        'v-done': 'getDoneInstCount', //已办
        'v-doneRead': 'getNoticeDoneReadCount', //入库
        'v-flowList': 'getNewProcessCount', //新建流程
        'v-myDelegate': 'getDelegateCount', //转办
        'v-myRead': 'getMyNoticeReadCount', //传阅
        'v-request': 'getMyRequestCount', //我的请求
        'v-todo': 'getCountByUserId', //待办
        'v-todoRead': 'getNoticeTodoReadCount', //抄送
      },
    }
  },
  mounted() {
    const that = this
    FlowBus.$on('restore', (vm, index, indexPath) => {
      //复原菜单
      if (!index || !indexPath.length) return
      // debugger
      // FlowBus.$emit('router',index,Object.assign([],indexPath))
      // if (indexPath.length >= 2) {
      //   const lastIndex = indexPath.pop()
      //   if (index === lastIndex) {
      //     vm.open(indexPath.pop())
      //     vm.activeIndex = index
      //   } else {
      //     vm.open(indexPath.pop())
      //   }
      // } else {
      //   vm.open(index)
      // }
    })
    // that.$nextTick(()=>{
    //   const $menu=that.$refs.menu;
    //   $menu.open(that.flowMenus[0]?.index ?? 'v-todo');
    // })
  },
  methods: {
    flatFlowMenus(init, list) {
      if (init == undefined) init = []
      init.push(...list)
      for (let i = 0, j = list.length; i < j; i++) {
        this.flatFlowMenus(init, list[i].children || [])
      }
    },
    //el-menu 选中时的回调
    handleSelect(index, indexPath) {
      //根据indexPath的值来路由跳转
      FlowBus.handleSetMenu(index, Object.assign([], indexPath))
      // console.log("view bus value===>",FlowBus.)
      // this.activeIndex = index
      FlowBus.$emit('flow-menu', this.findMenuItem(index))
      FlowBus.$emit('router', index, Object.assign([], indexPath))
      this.$nextTick(() => {
        this.$refs.menu.activeIndex = index
      })
    },
    //el-sub-menu被展开时的回调
    handleOpen(index, indexPath) {
      this.$nextTick(() => {
        const vm = this.$refs.menu
        if (vm.activeIndex) {
          vm.activeIndex = ''
        }
      })
      FlowBus.handleSetMenu(index, Object.assign([], indexPath))
      this.openIndex = index
      //这里也应该做点什么来保证点击时也能触发右侧数据的更新
      FlowBus.$emit('router', index, Object.assign([], indexPath))
    },
    //el-sub-menu被收起时的回调
    handleClose(index, indexPath) {
      this.$nextTick(() => {
        const vm = this.$refs.menu
        if (vm.activeIndex) {
          vm.activeIndex = ''
        }
      })
      FlowBus.handleSetMenu(index, Object.assign([], indexPath))
      this.openIndex = index
      //这里也应该做点什么来保证点击时也能触发右侧数据的更新
      FlowBus.$emit('flow-menu', this.findMenuItem(index))
      FlowBus.$emit('router', index, Object.assign([], indexPath))
    },
    //生成外面树的根
    generateOutRoot(array) {
      return array.map((item, index) => {
        return {
          alias: item.alias,
          name: item.name,
          index:item.alias,
          label: item.name,
          id: item.parentId + (index + 1),
          key: item.parentId + (index + 1),
          isLeaf: 'N',
          isParent: 'true',
          parentId: '0',
          children: [],
          menu: true,
        }
      })
    },
    getCountMap(array) {
      let map = {}
      array.forEach((item) => {
        if (item.typeId === null) {
          map[''] = item.count
        } else {
          map[item.typeId] = item.count
          item.key = item.id
        }
      })
      return map
    },
    fillCountIntoTree(tree, map) {
      tree.count = map[tree.id] ? map[tree.id] : 0
      tree.name += ' '
      if (tree.children == null) {
        return tree.count
      }
      for (let i = 0; i < tree.children.length; i++) {
        let child = tree.children[i]
        let count = this.fillCountIntoTree(child, map)
        child.index = `${tree.index}/${child.typeKey}`
        tree.count += count
        if (count === 0) {
          tree.children.remove(child)
          i--
        }
      }
      return tree.count
    },
    getTotal(data) {
      let total = 0
      data.forEach((item) => {
        total += item.count
      })
      return total
    },
    menuClick() {},
    handleSetMenu() {
      const vm = FlowBus
      // vm.handleSetMenu('v-todo')
      // console.log(vm.restore,vm.subIndex,vm.index);
      vm.handleRestoreMenu(this.$refs.menu)
    },
    //迭代生成菜单元素
    /**
     * @param {import('vue').CreateElement } create
     * @param {Array<any>} menu
     */
    iterateCreateEle(create, menu, key) {
      const length = menu?.children?.length ?? 0
      if (length) {
        //重复迭代生成新的menu
        const menus = []
        menu.children.forEach((child) => {
          let childKey = child.index
          // childKey = !key ? childKey : `${key}/${childKey}`
          menus.push(this.iterateCreateEle(create, child, childKey))
        })
        const span = create(
          'span',
          {
            attrs: {
              title: menu.name,
            },
          },
          [menu.name]
        )
        //去除数字标识
        const templateSpan = create(
          'span',
          {
            staticClass: 'ou-2022',
            slot: 'title',
            on: {
              click: () => {
                this.menuClick(menu?.alias ?? '')
              },
            },
          },
          [span]
        )
        //生成子菜单
        const subMenu = create(
          'el-submenu',
          {
            key: menu.key || menu.index,
            slot: 'default',
            attrs: {
              index: key,
            },
          },
          [templateSpan, ...menus]
        )
        return subMenu
      } else {
        //生成菜单menu-item
        //tag
        const tag = create(
          'el-tag',
          {
            attrs: {
              type: 'success',
            },
          },
          [menu.count || 0]
        )
        const span = create(
          'span',
          {
            attrs: {
              title: menu.name,
            },
          },
          [menu.name]
        )
        //先去除数字
        // const templateSpan = create('span', {slot: 'default'}, [tag, span])
        const templateSpan = create('span', {slot: 'default'}, [span])

        const item = create(
          'el-menu-item',
          {
            key: menu.typeKey || menu.alias || new Date().getTime().toString(),
            attrs: {
              index: key,
            },
          },
          [templateSpan]
        )
        return item
      }
    },
    //过滤掉命名控件
    normalizeKey(key) {
      let selfKey = key.split('/')
      selfKey = selfKey[selfKey.length - 1]
      return selfKey
    },
    findMenuItem(index) {
      let flatMenus = []
      this.flatFlowMenus(flatMenus, this.flowMenus)
      let item = flatMenus.filter((menu) => menu.index === index)
      item = item[0] || {}
      var res = {}
      if (item.isParent && item.isParent == 'true') {
        item.id = 6
        // res=JSON.parse(JSON.stringify(item));
        // res.id=6;
      }
      return item
    },
  },
  watch: {
    menus: {
      handler: function (val) {
        const that = this
        this.flowMenus = that.generateOutRoot(this.menus)
        let requests = []
        process.getFlowTree((response) => {
          const children = response.data[0].children
          const defaultMenus = ['v-searchflow']
          for (
            let index = 0, length = this.flowMenus.length;
            index < length;
            index++
          ) {
            let menu = this.flowMenus[index]
            if (defaultMenus.includes(menu.alias)) {
              continue
            }
            menu.id += menu.id + index
            menu.index = menu.alias
            menu.children = cloneDeep(children || [])
            if (
              typeof process[this.processList[menu['alias']]] === 'function'
            ) {
              const promise = process[this.processList[menu['alias']]]({})
              requests.push(promise)
              promise.then((data) => {
                let map = this.getCountMap(data)
                this.fillCountIntoTree(menu, map)
                menu.count = this.getTotal(data)
              })
            }
          }
          Promise.all(requests).then(() => {
            this.$nextTick(() => {
              FlowBus.handleRestoreMenu(this.$refs.menu)
            })
          })
        })
      },
      immediate: true,
    },
    flowMenus: function (nVal, oVal) {
      if (oVal.length) {
        oVal.forEach((menu) => {
          FlowBus.$off(menu.alias)
        })
      }
      if (nVal.length) {
        nVal.forEach((menu) => {
          FlowBus.$on(menu.alias, (index, indexPath) => {
            // FlowBus.$emit('flow-menu', this.findMenuItem(index))
          })
        })
      }
    },
  },
  render(h) {
    let menus = []
    this.flowMenus.forEach((item) => {
      // menus.push(this.iterateCreateEle(h, item, item.alias || item.typeKey))
      menus.push(this.iterateCreateEle(h, item, item.index))
    })
    return h(
      'el-menu',
      {
        attrs: {
          uniqueOpened: true,
        },
        on: {
          select: this.handleSelect,
          open: this.handleOpen,
          close: this.handleClose,
        },
        ref: 'menu',
      },
      [...menus]
    )
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      //但是应该等真正的数据加载完成后去复原那个菜单
    })
  },
}
</script>

<style lang="scss" scoped>
@import '@/assets/css/element-variables.scss';
/deep/ .el-menu {
  background-color: transparent;
}
/deep/ .el-menu-item {
  position: relative;
  height: 36px;
  line-height: 36px;
  background-color: transparent;
  &:hover {
    background-color: transparent;
    color: $--color-primary;
  }
  &.is-active {
    &::before {
      left: 10px;
      top: 12px;
      position: absolute;
      content: '';
      width: 2px;
      height: 14px;
      background: $--color-primary;
    }
  }
}

/deep/ .el-submenu {
  .el-menu-item {
    position: relative;
    height: 36px;
    line-height: 36px;
    padding: 0px 45px !important;
    background-color: transparent;
    &:hover {
      background-color: transparent;
      color: $--color-primary;
    }
    &.is-active {
      &::before {
        left: 30px;
        top: 12px;
        position: absolute;
        content: '';
        width: 2px;
        height: 14px;
        background: $--color-primary;
      }
    }
  }
}
</style>