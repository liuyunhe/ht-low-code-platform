<template>
  <div class="widget-panel">
    <div v-if="data.list.length == 0" class="form-empty">从左侧拖拽布局或栏目进行排版</div>
    <el-form
      :size="data.config.size"
      :label-position="data.config.labelPosition"
      :label-width="data.config.labelWidth + 'px'"
    >
      <draggable
        v-model="data.list"
        v-bind="{group:'form', ghostClass: 'ghost',animation: 200, handle: '.drag-widget'}"
        @end="handleMoveEnd"
        @add="handleWidgetAdd"
      >
        <transition-group name="fade" tag="div" class="widget-form-list">
          <template v-for="(element, index) in data.list.filter(d => d.key)">
            <template v-if="element.type == 'grid'">
              <design-grid-layout
                :key="element.key"
                :data="data"
                :select.sync="selectWidget"
                :index="index"
                :element="element"
              />
            </template>
            <template v-else-if="element.type == 'tab'">
              <design-table-layout
                :key="element.key"
                :data="data"
                :select.sync="selectWidget"
                :index="index"
                :element="element"
              />
            </template>
            <template v-else>
              <design-form-item
                :key="element.key"
                :element="element"
                :select.sync="selectWidget"
                :index="index"
                :data="data"
              ></design-form-item>
            </template>
          </template>
        </transition-group>
      </draggable>
    </el-form>
  </div>
</template>

<script>
import Draggable from "vuedraggable";
import DesignFormItem from "@/components/portal/DesignFormItem.vue";
import DesignGridLayout from "@/components/portal/DesignGridLayout.vue";
import DesignTableLayout from "@/components/portal/DesignTableLayout.vue";

export default {
  name: "design-panel",
  components: {
    Draggable,
    DesignFormItem,
    DesignGridLayout,
    DesignTableLayout
  },
  props: ["data", "select"],
  data() {
    return {
      selectWidget: this.select
    };
  },
  mounted() {
    document.body.ondrop = function(event) {
      let isFirefox = navigator.userAgent.toLowerCase().indexOf("firefox") > -1;
      if (isFirefox) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
  },
  methods: {
    handleMoveEnd({ newIndex, oldIndex }) {
      console.log("index", newIndex, oldIndex);
    },
    handleSelectWidget(index) {
      console.log(index, "#####");
      this.selectWidget = this.data.list[index];
    },
    handleWidgetAdd(evt) {
      console.log("add", evt);
      console.log("end", evt);
      const newIndex = evt.newIndex;
      const to = evt.to;
      console.log(to);

      //为拖拽到容器的元素添加唯一 key
      const key =
        Date.parse(new Date()) + "_" + Math.ceil(Math.random() * 99999);
      this.$set(this.data.list, newIndex, {
        ...this.data.list[newIndex],
        options: {
          ...this.data.list[newIndex].options,
          remoteFunc: "func_" + key
        },
        key,
        // 绑定键值
        model: this.data.list[newIndex].type + "_" + key,
        rules: []
      });

      if (
        this.data.list[newIndex].type === "radio" ||
        this.data.list[newIndex].type === "checkbox" ||
        this.data.list[newIndex].type === "select"
      ) {
        this.$set(this.data.list, newIndex, {
          ...this.data.list[newIndex],
          options: {
            ...this.data.list[newIndex].options,
            options: this.data.list[newIndex].options.options.map(item => ({
              ...item
            }))
          }
        });
      }

      if (this.data.list[newIndex].type === "grid") {
        this.$set(this.data.list, newIndex, {
          ...this.data.list[newIndex],
          columns: this.data.list[newIndex].columns.map(item => ({ ...item }))
        });
      }

      this.selectWidget = this.data.list[newIndex];
    }
  },
  watch: {
    select(val) {
      this.selectWidget = val;
    },
    selectWidget: {
      handler(val) {
        this.$emit("update:select", val);
      },
      deep: true
    }
  }
};
</script>
<style scoped>
.widget-panel {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.widget-form-list {
  padding: 10px;
  background: #fff;
  border: 1px solid #dfdfdf;
  min-height: 600px;
  margin: 10px;
}

.form-empty {
  position: absolute;
  text-align: center;
  width: 300px;
  font-size: 20px;
  top: 200px;
  left: 50%;
  margin-left: -150px;
  color: #ccc;
}
</style>
