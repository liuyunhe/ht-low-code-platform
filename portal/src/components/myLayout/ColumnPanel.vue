<template>
  <el-scrollbar class="scrollbar-fullheight">
    <div class="control-list">
      <template v-if="layoutComponents.length">
        <div class="widget-cate">栏目布局</div>
        <draggable
          tag="ul"
          class="flex-container"
          :list="layoutComponents"
          v-bind="{group:{ name:'form', pull:'clone',put:false},sort:false, ghostClass: 'ghost'}"
          @end="handleMoveEnd"
          @start="handleMoveStart"
          :move="handleMove"
        >
          <li
            class="flex-item"
            :class="{'no-put': item.type == 'divider'}"
            v-for="(item, index) in layoutComponents"
            :key="index"
          >
            <a>
              <i class="icon icon-iframe"></i>
              <span> &nbsp;{{item.name}}</span>
            </a>
          </li>
        </draggable>
      </template>

      <template>
        <div v-for="(value, key, index) in columnMap" :key="index">
          <div class="widget-cate">{{key}}</div>
          <draggable
            class="flex-container"
            tag="ul"
            :list="value"
            v-bind="{group:{ name:'form', pull:'clone',put:false},sort:false, ghostClass: 'ghost'}"
            @end="handleMoveEnd"
            @start="handleMoveStart"
            :move="handleMove"
          >
            <li
              class="flex-item"
              :class="{'no-put': item.type == 'divider'}"
              v-for="(item, key, index) in value"
              :key="index"
            >
              <a>
                <div :title="item.name">{{item.name}}</div>
              </a>
            </li>
          </draggable>
        </div>
      </template>
    </div>
  </el-scrollbar>
</template>
<script>
import Draggable from "vuedraggable";
export default {
  name: "column-panel",
  components: { Draggable },
  props: {
    columnMap: {
      type: Object
    }
  },
  data() {
    return {
      layoutComponents: [
        {
          type: "grid",
          name: "栅格布局",
          icon: "icon-grid",
          columns: [
            {
              span: 12,
              list: []
            },
            {
              span: 12,
              list: []
            }
          ],
          options: {
            gutter: 0,
            justify: "start",
            align: "top"
          }
        }
      ]
    };
  },
  methods: {
    handleMoveEnd: function() {},
    handleMoveStart: function() {},
    handleMove: function() {}
  }
};
</script>
<style lang="scss" scoped>
@import "@/assets/css/form-editor.scss";

.widget-cate {
  padding: 10px 0 0 10px;
  font-weight: bold;
  color: #777;
}

ul.flex-container {
  margin: 0;
  list-style: none;
  padding: 10px 5px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}

ul.flex-container > li.flex-item {
  padding: 5px;
  height: 17px;
  border: 1px solid #ccc;
  margin: 4px;
  width: 120px;
  border-radius: 5px;
  cursor: pointer;
}

ul.flex-container > li.flex-item:hover {
  box-shadow: 0 2px 5px rgba(86, 96, 117, 0.15);
}

li.flex-item > a > i {
  font-size: 16px;
}

li.flex-item > a > div {
  margin-left: 8px;
  white-space:nowrap;
  text-overflow:ellipsis;
  overflow:hidden; 
}
</style>