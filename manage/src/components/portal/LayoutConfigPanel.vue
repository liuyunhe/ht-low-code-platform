<template>
<div>
  <el-container>
    <el-header>布局信息</el-header>
    <el-main>
      <el-form v-model="layoutObj" data-vv-scope="editForm" label-position="top">
         <ht-form-item label="布局名称" prop="name">
          <ht-input
            class="ht"
            v-model="layoutObj.name"
            autocomplete="off"
            :validate="{required:true}"
            placeholder="请输入名称"
            :maxlength="50"
            :showWordLimit="true"
          ></ht-input>
        </ht-form-item>
         <ht-form-item label="布局描述" prop="memo" >
          <ht-input
            type="textarea"
            class="ht"
            :rows="3"
            v-model="layoutObj.memo"
            autocomplete="off"
            placeholder="请输入描述信息"
            :maxlength="200"
            :showWordLimit="true"
          ></ht-input>
        </ht-form-item>
      </el-form>
    </el-main>
  </el-container>
  <el-container v-if="data.type=='grid'">
    <el-header>栅格设计</el-header>
    <el-main class="config-content">
      <div v-if="!data || !data.type" class="field-empty">选择一个栅格布局进行设置</div>
      <el-form label-position="top" v-if="data">
        <template v-if="data.type == 'grid'">
          <el-form-item label="栅格间隔：">
            <el-input type="number" v-model.number="data.options.gutter"></el-input>
          </el-form-item>
          <el-form-item label="列配置项：">
            <draggable
              tag="ul"
              :list="data.columns"
              v-bind="{group:{ name:'options'}, ghostClass: 'ghost',handle: '.drag-item'}"
              handle=".drag-item"
            >
              <li v-for="(item, index) in data.columns" :key="index">
                <i class="drag-item" style="font-size: 16px;margin: 0 5px;cursor: move;">
                  <i class="iconfont icon-draggable"></i>
                </i>
                <el-input
                  placeholder="1到24的整数"
                  size="mini"
                  style="width: 120px;"
                  type="number"
                  v-model.number="item.span"
                >
                </el-input>
                <el-button
                  @click="handleOptionsRemove(index)"
                  circle
                  plain
                  type="danger"
                  size="mini"
                  icon="el-icon-minus"
                  style="padding: 4px;margin-left: 5px;"
                ></el-button>
              </li>
            </draggable>
            <div style="margin-left: 22px;">
              <el-button @click="handleAddColumn">添加列</el-button>
            </div>
          </el-form-item>
        </template>
      </el-form>
    </el-main>
  </el-container>

  <!--table选项卡配置-->
  <el-container v-if="data.type=='tab'">
    <el-header>tab布局设计</el-header>
    <el-main class="config-content">
       <el-form  v-form>
      <ht-form-item label-width label="风格类型">
        <el-radio-group v-model="data.options.ctrlType">
          <el-radio-button label>默认</el-radio-button>
          <el-radio-button label="card">选项卡</el-radio-button>
          <el-radio-button label="border-card">卡片化</el-radio-button>
        </el-radio-group>
      </ht-form-item>
      
      <ht-form-item label-width label="选项卡位置">
        <el-radio-group v-model="data.options.align">
          <el-radio-button label="top">顶部</el-radio-button>
          <el-radio-button label="left">左侧</el-radio-button>
          <el-radio-button label="right">右侧</el-radio-button>
          <el-radio-button label="bottom">底部</el-radio-button>
        </el-radio-group>
      </ht-form-item>
      <ht-form-item label-width label="标签配置项">
        <br>
        <draggable
          tag="ul"
          class="column-ul"
          :list="data.columns"
          v-bind="{
            group: { name: 'options' },
            ghostClass: 'ghost',
            handle: '.drag-item'
          }"
          handle=".drag-item"
          style="    margin: 0;
    padding-left: 0px;"
        >
          <li v-for="(item, index) in data.columns" :key="index" style=" list-style: none;">
            <i class="drag-item icon-draggable"> </i>&nbsp;
            <ht-input size="mini" width="200px" v-model="item.span" />
            <el-button
              @click="handleOptionsRemove(index)"
              circle
              plain
              class="grid-remove-button"
              type="danger"
              size="mini"
              icon="el-icon-minus"
            ></el-button>
          </li>
        </draggable>
        <div style="margin-left: 22px;">
          <el-button type="text" @click="handleGridColumnAdd('tab')"
            >添加标签</el-button
          >
        </div>
      </ht-form-item>
      </el-form>
    </el-main>
  </el-container>
  </div>
</template>

<script>
import Draggable from "vuedraggable";

export default {
  components: {
    Draggable
  },
  props: {
    data:Object,
    layoutObj:{
      type:Object,
      default(){
        return {name:'',memo:''}
      }
  }},
  data() {
    return {
      validator: {
        type: null,
        required: null,
        pattern: null,
        range: null,
        length: null
      }
    };
  },
  computed: {
    show() {
      if (this.data && Object.keys(this.data).length > 0) {
        return true;
      }
      return false;
    }
  },
  methods: {
    handleGridColumnAdd(type) {
      if (type == "tab") {
        this.data.columns.push({
          span: "标签页" + (this.data.columns.length + 1),
          list: []
        });
      }
    },
    handleOptionsRemove(index) {
      if (this.data.type === "grid") {
        this.data.columns.splice(index, 1);
      } else {
        this.data.options.options.splice(index, 1);
      }
    },
    handleAddOption() {
      if (this.data.options.showLabel) {
        this.data.options.options.push({
          value: this.$t("fm.config.widget.newOption"),
          label: this.$t("fm.config.widget.newOption")
        });
      } else {
        this.data.options.options.push({
          value: this.$t("fm.config.widget.newOption")
        });
      }
    },
    handleAddColumn() {
      this.data.columns.push({
        span: "",
        list: []
      });
    },
    generateRule() {
      this.data.rules = [];
      Object.keys(this.validator).forEach(key => {
        if (this.validator[key]) {
          this.data.rules.push(this.validator[key]);
        }
      });
    },
    handleSelectMuliple(value) {
      if (value) {
        if (this.data.options.defaultValue) {
          this.data.options.defaultValue = [this.data.options.defaultValue];
        } else {
          this.data.options.defaultValue = [];
        }
      } else {
        if (this.data.options.defaultValue.length > 0) {
          this.data.options.defaultValue = this.data.options.defaultValue[0];
        } else {
          this.data.options.defaultValue = "";
        }
      }
    },

    validateRequired(val) {
      if (val) {
        this.validator.required = {
          required: true,
          message: `${this.data.name}${this.$t(
            "fm.config.widget.validatorRequired"
          )}`
        };
      } else {
        this.validator.required = null;
      }

      this.$nextTick(() => {
        this.generateRule();
      });
    },

    validateDataType(val) {
      if (!this.show) {
        return false;
      }

      if (val) {
        this.validator.type = {
          type: val,
          message: this.data.name + this.$t("fm.config.widget.validatorType")
        };
      } else {
        this.validator.type = null;
      }

      this.generateRule();
    },
    valiatePattern(val) {
      if (!this.show) {
        return false;
      }

      if (val) {
        this.validator.pattern = {
          pattern: val,
          message: this.data.name + this.$t("fm.config.widget.validatorPattern")
        };
      } else {
        this.validator.pattern = null;
      }

      this.generateRule();
    }
  },
  watch: {
    "layoutObj.name":function(newVal,oldVal){
      this.$emit("update:layoutObj",this.layoutObj);
    },
    "layoutObj.memo":function(newVal,oldVal){
      this.$emit("update:layoutObj",this.layoutObj);
    },
    "data.options.isRange": function(val) {
      if (typeof val !== "undefined") {
        if (val) {
          this.data.options.defaultValue = null;
        } else {
          if (Object.keys(this.data.options).indexOf("defaultValue") >= 0)
            this.data.options.defaultValue = "";
        }
      }
    },
    "data.options.required": function(val) {
      this.validateRequired(val);
    },
    "data.options.dataType": function(val) {
      this.validateDataType(val);
    },
    "data.options.pattern": function(val) {
      this.valiatePattern(val);
    },
    "data.name": function(val) {
      if (this.data.options) {
        this.validateRequired(this.data.options.required);
        this.validateDataType(this.data.options.dataType);
        this.valiatePattern(this.data.options.pattern);
      }
    }
  }
};
</script>
<style scoped>
.el-header {
  background-color: #F5F7FA;
  border-bottom: 1px solid #E4E7ED;
  color: #333;
  text-align: center;
  line-height: 60px;
}
.field-empty {
  text-align: center;
  width: 100%;
  margin-top: 150px;
  font-size: 16px;
  color: #ccc;
}
</style>
