<template>
  <div class="tree">
    <div class="content">
      <!-- <el-scrollbar> -->
        <el-tree
          class="flow-tree"
          :data="treeData"
          node-key="id"
          default-expand-all
          :expand-on-click-node="expandOnClickNode"
          highlight-current
          :props="defaultProps"
          ref="tree"
          @node-click="treeClick"
          :filter-node-method="filterNode"
          style="margin-bottom: 25px"
        >
          <span class="span-ellipsis" slot-scope="{node, data}">
            <span
              ><el-tag type="success">{{ data.count }}</el-tag></span
            >
            <span :title="node.label">{{ node.label }}</span>
          </span>
        </el-tree>
      <!-- </el-scrollbar> -->
    </div>
    <div class="tree-bottom__wrap">
      <el-switch
        v-model="isExpand"
        active-text="默认展开"
        inactive-text="默认收起"
        @change="handleValChange"
      ></el-switch>
    </div>
  </div>
</template>

<script>
import {mapState, mapActions} from 'vuex'
import process from '@/api/process'

export default {
  name: 'flowTree',
  props: {
    loadCount: Function,
    isAsideShow: {
      type: Boolean,
      default: true,
    },
  },
  components: {},
  data() {
    return {
      isExpand: false,
      filterText: '',
      expandOnClickNode: false,
      defaultProps: {
        children: 'children',
        label: 'name',
      },
      treeData: [],
    }
  },
  computed: {
    ...mapState('storeProcess', ['pagination']),
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val)
    },
  },
  methods: {
    //流程分类默认展开收起事件
    handleValChange(val) {
      this.$emit('switch-change', val)
    },
    treeClick(n, i, e) {
      this.$emit('currentTree', n)
    },
    //过滤函数
    filterNode(value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },
    cancelCheck() {
      this.$refs.tree.setCurrentKey(null)
    },
    getCountMap(array) {
      let map = {}
      array.forEach((item) => {
        if (item.typeId === null) {
          map[''] = item.count
        } else {
          map[item.typeId] = item.count
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
  },
  created() {
    this.isExpand = this.isAsideShow
    
    process.getFlowTree((response) => {
      // debugger;
      this.treeData = response.data
      this.loadCount(this.pagination).then((data) => {
        // debugger;
        let map = this.getCountMap(data)
        this.fillCountIntoTree(this.treeData[0], map)
        this.treeData[0].count = this.getTotal(data)
      })
      /*process.getCountByUserId(this.pagination).then(data=>{
          let map = this.getCountMap(data);
          this.fillCountIntoTree(this.treeData[0],map);
          this.treeData[0].count += map[""];
        });*/
    })
  },
}
</script>

<style lang="scss" scoped>
@import '@/assets/css/element-variables.scss';
.tree {
  margin-left: 13px;
  .tree-bottom__wrap {
    margin-bottom: -10px;
    height: 30px;
    line-height: 30px;
    position: fixed;
    bottom: 30px;
    background: #fff;
  }
  //滚动条样式控制
  .content {
    /deep/ .el-scrollbar {
      display: flex;
      padding: 2.6px 16px 16px 0;
      width: 232px;
      .el-scrollbar__wrap {
        overflow-x: hidden;
        overflow-y: auto;
        overflow: hidden;
        min-width: 250px;
        // .el-scrollbar__bar {
        //   &.is-horizontal {
        //     bottom: 0;
        //   }
        //   &.is-vertical {
        //     right: 0;
        //   }
        // }

        .el-tree-node__content {
          /* 让纵向滚动条与内容最右边界限之间留有8px的宽度，使效果更好看。 */
          padding: 0 8px 0 0;
          .el-tree-node__expand-icon {
            margin: -2 0 0 3px;
            padding: 0;
          }
          .el-tree-node__label {
            font-size: 12px;
            line-height: 12px;
          }
        }
        .el-tree-node__children {
          // display: inline-block;
          min-width: 100%;
        }
      }
    }

    /deep/ .el-tree{
      display: inline-block;
      min-width: 100%!important;
    }
  }
}
/deep/ .el-tree{
  * {
    font-size: 14px!important;
  }
}
.common {
  width: 100%;
  margin-top: 6px;
}
.flows {
  display: block;
  font-size: 14px;
  color: $--color-primary;
  text-decoration: none;
  margin-left: 24px;
}
/deep/.el-input__inner {
  height: 36px;
}
.span-ellipsis {
  width: auto;
  overflow: hidden;
  white-space: nowrap;
  // text-overflow: ellipsis;
  display: block;
}
</style>
