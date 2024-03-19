<template>
  <div class="tc_transfer">
    <div class="tc_tree">
      <div class="tree_title">{{ sourceTitle }}</div>
      <el-tree
        class="tree_body"
        empty-text="可选列表为空"
        :data="sourceList"
        :default-checked-keys="checkKeys"
        @check-change="checkChange"
        node-key="id"
        :show-checkbox="checkbox"
      >
        <span class="custom-tree-node" slot-scope="{node, data}">
          <el-tooltip
            effect="dark"
            :disabled="data.remark? false : true"
            :content="data.remark"
            placement="top-start"
          >
            <span>{{ node.label }}</span>
          </el-tooltip>
        </span>
      </el-tree>
    </div>
    <div class="tc_tree">
      <div class="tree_title">{{ targetTitle }}</div>
      <el-tree
        class="tree_body"
        empty-text="未选择"
        :data="targetList"
        node-key="id"
        draggable
        :allow-drop="allowDrop"
        @node-drag-end="dragEnd"
        v-slot="{node, data}"
      >
        <span class="tc-tree-node">
          {{ data.order + ': ' + data.label }}
        </span>
      </el-tree>
    </div>
  </div>
</template>
  
  <script>
export default {
  name:'elTransfer',
  data() {
    return {
      targetList: [],
    }
  },
  props: {
    sourceList: {
      type: Array,
      default: ()=>{},
    },
    checkKeys: {
      type: Array,
      default: ()=>{},
    },
    sourceTitle: {
      type: String,
      default: null,
    },
    targetTitle: {
      type: String,
      default: null,
    },
    checkbox:{
      type:Boolean,
      default:false
    }
  },
  mounted(){
    console.log(this.checkbox)
  },
  methods: {
    fetchData() {
      this.targetList = []
      for (let i = 0; i < this.checkKeys.length; i++) {
        let id = this.checkKeys[i]
        this.sourceList.forEach((source) => {
          if (source.id === id) {
            let target = {}
            target.order = i + 1
            target.id = source.id
            target.label = source.label
            this.targetList.push(target)
          }
        })
      }
    },
    checkChange(checkNode, changeType) {
      // console.log(checkNode)
      // console.log(changeType)
      if (changeType) {
        let target = {}
        target.id = checkNode.id
        target.label = checkNode.label
        target.order = this.targetList.length + 1
        this.targetList.push(target)
      } else {
        for (let i = 0; i < this.targetList.length; i++) {
          let id = checkNode.id
          if (this.targetList[i].id === id) {
            this.arrayRemoveByIndex(this.targetList, i)
          }
        }
      }
      this.updateKeys()
    },
    allowDrop(draggingNode, dropNode, type) {
      return type !== 'inner'
    },
    dragEnd() {
      //更新order值
      for (let i = 0; i < this.targetList.length; i++) {
        this.targetList[i].order = i + 1
      }

      this.updateKeys()
    },
    updateKeys() {
      //更新父类的值
      let checkKey = []
      this.targetList.forEach((item) => {
        checkKey.push(item.id)
      })
      // console.log('checkKey====>',checkKey)
      this.$emit('checkKeys', checkKey)
    },
    arrayRemoveByIndex(array, index) {
      if (index > -1) {
        array.splice(index, 1)
        let targetList = []
        this.targetList.map((item,index)=>{
            let target = {}
            target.id = item.id
            target.label = item.label
            target.order = index+1
            targetList.push(target)
        })
        this.targetList = targetList
      }
    },
  },
}
</script>
  <style scoped>
.tc_transfer .tc_tree:nth-child(1) {
  margin-right: 6%;
}

.tc_tree {
  width: 25%;
  height: 300px;
  display: inline-block;
  vertical-align: top;
}

.tc_tree .tree_title {
  text-align: center;
  width: 100%;
  font-size: 14px;
  margin-bottom: 5px;
}

.tc_tree .tree_body {
  border: #666 solid 1px;
  border-radius: 5px;
  height: 300px;
  overflow-y: auto;
  padding: 5px 5px 5px 0;
}
</style>