<template>
  <div class="widget-panel">
    <div v-if="data.list.length == 0" class="form-empty">从左侧拖拽布局和字段来设计表单</div>
    <el-scrollbar class="scrollbar-fullheight">
      <el-form
        :size="data.config.size"
        :label-position="data.config.labelPosition"
        :label-width="data.config.labelWidth + 'px'"
      >
        <draggable
          v-model="data.list"
          v-bind="{
          group: 'form',
          ghostClass: 'ghost',
          animation: 200,
          handle: '.drag-widget'
        }"
          @end="handleMoveEnd"
          @start="handleMoveStart"
          @add="handleWidgetAdd"
          @input="handleChange($event)"
        >
          <transition-group name="fade" tag="div" class="widget-form-list">
            <template v-for="(element, index) in data.list.filter(d => d.key)">
              <template v-if="element.ctrlType == 'grid'">
                <widget-grid-layout
                  :key="element.key"
                  :data.sync="data"
                  :select.sync="selectWidget"
                  :selectWidgetList.sync="selectWidgetList"
                  :index="index"
                  :element="element"
                />
              </template>
              <template v-else-if="element.ctrlType == 'tab'">
                <widget-table-layout
                  :key="element.key"
                  :data.sync="data"
                  :select.sync="selectWidget"
                  :selectWidgetList.sync="selectWidgetList"
                  :index="index"
                  :element="element"
                />
              </template>
              <template v-else-if="element.ctrlType == 'page'">
                <widget-pagination-layout
                  :key="element.key"
                  :data.sync="data"
                  :select.sync="selectWidget"
                  :index="index"
                  :selectWidgetList.sync="selectWidgetList"
                  :element="element"
                />
              </template>
              <template v-else-if="element.ctrlType == 'pageSteps'">
                <widget-page-steps-layout
                  :key="element.key"
                  :data.sync="data"
                  :select.sync="selectWidget"
                  :selectWidgetList.sync="selectWidgetList"
                  :index="index"
                  :element="element"
                />
              </template>
              <template v-else-if="element.ctrlType == 'pageButton'">
                <widget-page-button-layout
                  :key="element.key"
                  :data.sync="data"
                  :select.sync="selectWidget"
                  :selectWidgetList.sync="selectWidgetList"
                  :index="index"
                  :element="element"
                />
              </template>
              <template v-else-if="element.ctrlType == 'accordion'">
                <widget-collapse-layout
                  :key="element.key"
                  :data.sync="data"
                  :select.sync="selectWidget"
                  :selectWidgetList.sync="selectWidgetList"
                  :index="index"
                  :element="element"
                />
              </template>
              <template v-else-if="element.ctrlType == 'subtable'">
                <widget-subtable-layout
                  :key="element.key"
                  :data.sync="data"
                  :select.sync="selectWidget"
                  :selectWidgetList.sync="selectWidgetList"
                  :index="index"
                  :element.sync="element"
                />
              </template>
              <template v-else-if="element.ctrlType == 'subDiv'">
                <widget-subdiv-layout
                  :key="element.key"
                  :data.sync="data"
                  :select.sync="selectWidget"
                  :selectWidgetList.sync="selectWidgetList"
                  :index="index"
                  :element.sync="element"
                />
              </template>
              <template v-else-if="element.ctrlType == 'dataView'">
                <widget-data-view-layout
                  :key="element.key"
                  :data.sync="data"
                  :select.sync="selectWidget"
                  :selectWidgetList.sync="selectWidgetList"
                  :index="index"
                  :element="element"
                />
              </template>
              <template v-else-if="element.ctrlType == 'hottable'">
                <widget-hottable-layout
                  :key="element.key"
                  :data.sync="data"
                  :select.sync="selectWidget"
                  :selectWidgetList.sync="selectWidgetList"
                  :index="index"
                  :element.sync="element"
                />
              </template>
              <template v-else-if="element.ctrlType == 'table'">
                <widget-main-table-layout
                  :key="element.key"
                  :data.sync="data"
                  :select.sync="selectWidget"
                  :selectWidgetList.sync="selectWidgetList"
                  :index="index"
                  :element="element"
                />
              </template>
              <template v-else>
                <widget-form-item
                  :key="element.key"
                  :element="element"
                  :select.sync="selectWidget"
                  :selectWidgetList.sync="selectWidgetList"
                  :index="index"
                  :data.sync="data"
                ></widget-form-item>
              </template>
            </template>
          </transition-group>
        </draggable>
      </el-form>
    </el-scrollbar>
  </div>
</template>

<script>
import Draggable from "vuedraggable";
import WidgetFormItem from "@/components/form/WidgetFormItem.vue";
import WidgetGridLayout from "@/components/form/WidgetGridLayout.vue";
import WidgetTableLayout from "@/components/form/WidgetTableLayout.vue";
import WidgetPaginationLayout from "@/components/form/WidgetPaginationLayout.vue";
import WidgetCollapseLayout from "@/components/form/WidgetCollapseLayout.vue";
import WidgetSubtableLayout from "@/components/form/WidgetSubtableLayout.vue";
import WidgetSubdivLayout from "@/components/form/WidgetSubDivLayout.vue";
import WidgetPageStepsLayout from "@/components/form/WidgetPageStepsLayout.vue";
import WidgetPageButtonLayout from "@/components/form/WidgetPageButtonLayout.vue";
import WidgetDataViewLayout from "@/components/form/WidgetDataViewLayout.vue";
import WidgetHottableLayout from "@/components/form/WidgetHottableLayout.vue";
import WidgetMainTableLayout from "@/components/form/WidgetMainTableLayout.vue";
import deepmerge from "deepmerge";
export default {
  name: "widget-panel",
  components: {
    Draggable,
    WidgetGridLayout,
    WidgetTableLayout,
    WidgetPaginationLayout,
    WidgetCollapseLayout,
    WidgetSubtableLayout,
    WidgetSubdivLayout,
    WidgetFormItem,
    WidgetPageStepsLayout,
    WidgetPageButtonLayout,
    WidgetDataViewLayout,
    WidgetHottableLayout,
    WidgetMainTableLayout,
  },
  props: ["data", "select", "selectWidgetList"],
  data() {
    return {
      selectWidget: this.select,
    };
  },
  mounted() {
    document.body.ondrop = function (event) {
      let isFirefox = navigator.userAgent.toLowerCase().indexOf("firefox") > -1;
      if (isFirefox) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
  },
  methods: {
    handleMoveStart: function (evt) {
      window.panelList =this.data.list;
      // 新增控件时  将控件属性切断联系
      evt.item._underlying_vm_ = deepmerge({}, evt.item._underlying_vm_, {
        clone: true,
      });
      const key =
        Date.parse(new Date()) + "_" + Math.ceil(Math.random() * 99999);
      evt.item._underlying_vm_.key = key;
    },
    handleMoveEnd({ newIndex, oldIndex }) {
      console.log("index", newIndex, oldIndex);
    },
    handleSelectWidget(index) {
      console.log(index, "#####");
      this.selectWidget = this.data.list[index];
    },
    handleWidgetAdd(evt) {
      const newIndex = evt.newIndex;
      const item = evt.item;
      if (item.innerText == "孙表" || item.innerText == "div孙表") {
        this.$message.error("孙表只能存在子表中");
        this.data.list.splice(newIndex, 1);
        return false;
      }
      //拖拽的控件是高德地图控件时，判断是否已经存在高德地图控件
      const vueInst = this;
      //拖字段属性时防止子表和孙表字段拖入非对应布局中
      if (
        vueInst.data.list[newIndex] &&
        vueInst.data.list[newIndex].fieldPath
      ) {
        if (vueInst.data.list[newIndex].fieldPath.indexOf("item.") == 0) {
          this.$message.error("子表字段只能存在子表中");
          this.data.list.splice(newIndex, 1);
          return false;
        } else if (
          vueInst.data.list[newIndex].fieldPath.split(".").length == 4
        ) {
          this.$message.error("孙表字段只能存在子表中");
          this.data.list.splice(newIndex, 1);
          return false;
        }
      }
      let amapNum = 0;
      for (let i = vueInst.data.list.length - 1; i >= 0; i--) {
        if (vueInst.data.list[i].ctrlType == "amap") {
          amapNum = amapNum + 1;
        }
      }
      //amapNum为1代表只存在一个高德地图控件，大于1则拖拽的控件也是高德地图控件
      if (amapNum > 1) {
        for (let j = vueInst.data.list.length - 1; j >= 0; j--) {
          if (
            vueInst.data.list[j].ctrlType == "amap" &&
            !vueInst.data.list[j].options.addressName
          ) {
            this.$message.error("已存在高德地图控件");
            vueInst.data.list.splice(j, 1);
            return;
          }
        }
      }
      const to = evt.to;
      console.log(to);
      this.selectWidget = this.data.list[newIndex];
      //如果启用了分页布局,就不能在开头与结尾添加东西了
      if (this.data.pageSize && this.data.pageSize >= 2) {
        if (evt.newIndex == 0) {
          let dataEn = this.data.list[0];
          this.data.list.splice(0, 1);
          this.data.list.splice(1, 0, dataEn);
        } else if (evt.newIndex == this.data.list.length - 1) {
          let dataEn = this.data.list[evt.newIndex];
          this.data.list.splice(evt.newIndex, 1);
          this.data.list.splice(this.data.list.length - 1, 0, dataEn);
        }
      }
      console.log("add", evt);
      console.log("end", evt);
      console.log("data", this.data);
      //如果是分页布局.第一次拖入,会额外添加一个步骤条的头,与一个页尾
      if (this.selectWidget.ctrlType == "page") {
        if (
          this.data.pageSize &&
          (this.data.pageSize == 2 || this.data.pageSize > 2)
        ) {
          this.data.pageSize += 1;
          this.data.list[0].pageSize = this.data.pageSize;
          this.data.list[0].pageStepsArr.push({
            name: "分页" + (this.data.list[0].pageStepsArr.length + 1),
          });
        } else {
          this.data.pageSize = 2;
          let pageSteps = {
            ctrlType: "pageSteps",
            desc: "分页步骤条",
            key: "1581473408000_37810",
            isShow: true,
            isLayout: true,
            columns: [
              {
                list: [],
              },
            ],
            pageSize: 2,
            pageStepsArr: [{ name: "分页1" }, { name: "分页2" }],
          };

          this.data.list.splice(0, 0, pageSteps);
          let pageButton = {
            ctrlType: "pageButton",
            desc: "分页步骤按钮",
            key: "1581473408000_37811",
            isLayout: true,
            columns: [
              {
                list: [],
              },
            ],
            nextButton: {
              name: "下一步",
              icon: "",
              color: "#409eff",
              preScript: "",
              rearScript: "",
            },
            backButton: {
              name: "上一步",
              icon: "",
              color: "#67C23A",
              preScript: "",
              rearScript: "",
            },
          };
          this.data.list.push(pageButton);
        }
      }
    },
    handleChange(arr) {
      this.data.list.remove(this.data.list.length - 1);
    },
  },
  watch: {
    select(val) {
      this.selectWidget = val;
    },
    selectWidget: {
      handler(val) {
        this.$emit("update:select", val);
      },
      deep: true,
    },
  },
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

.scrollbar-fullheight {
  height: 100%;
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
