<template>
  <div class="panel">
    <el-tabs class="panel__tabs" v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="控件" name="controlLayout">
        <el-scrollbar class="scrollbar-fullheight">
          <div class="control-list">
            <template v-if="layoutComponents.length">
              <div class="widget-cate">布局</div>
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
                  v-show="item.ctrlType!='hottable'"
                  :key="index"
                >
                  <a>
                    <i :class="item.icon"></i>
                    <span>{{item.desc}}</span>
                  </a>
                </li>
              </draggable>
            </template>

            <template v-if="basicComponents.length">
              <div class="widget-cate">常用控件</div>
              <draggable
                class="flex-container"
                tag="ul"
                :list="basicComponents"
                v-bind="{group:{ name:'form', pull:'clone',put:false},sort:false, ghostClass: 'ghost'}"
                @end="handleMoveEnd"
                @start="handleMoveStart"
                :move="handleMove"
              >
                <li
                  class="flex-item"
                  :class="{'no-put': item.type == 'divider'}"
                  v-for="(item, index) in basicComponents"
                  :key="index"
                >
                  <a>
                    <i :class="item.icon"></i>
                    <span>{{item.desc}}</span>
                  </a>
                </li>
              </draggable>
            </template>

            <template v-if="advanceComponents.length">
              <div class="widget-cate">高级控件</div>
              <draggable
                tag="ul"
                class="flex-container"
                :list="advanceComponents"
                v-bind="{group:{ name:'form', pull:'clone',put:false},sort:false, ghostClass: 'ghost'}"
                @end="handleMoveEnd"
                @start="handleMoveStart"
                :move="handleMove"
              >
                <li
                  class="flex-item"
                  :class="{'no-put': item.type == 'divider'}"
                  v-for="(item, index) in advanceComponents"
                  :key="index"
                >
                  <a>
                    <i :class="item.icon"></i>
                    <span>{{item.desc}}</span>
                  </a>
                </li>
              </draggable>
            </template>
          </div>
        </el-scrollbar>
      </el-tab-pane>
      <el-tab-pane label="属性" name="attributeField">
        <el-scrollbar class="scrollbar-fullheight">
          <div class="control-list">
            <template v-if="layoutComponents.length">
              <div class="widget-cate">布局</div>
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
                  v-show="item.ctrlType!='hottable'"
                  :key="index"
                >
                  <a>
                    <i :class="item.icon"></i>
                    <span>{{item.desc}}</span>
                  </a>
                </li>
              </draggable>
            </template>
          </div>
          <div class="attributeField">
            <el-menu :default-active="activeBoTreeMenu" class="el-menu-vertical-demo">
              <el-submenu v-for="(boDef, index) in boTreeData" :key="'def'+index" :index="index+''">
                <template slot="title">
                  <span>{{boDef.description}}</span>
                </template>

                <draggable
                  class="flex-container"
                  tag="ul"
                  :list="boDef.children[0].attributeList"
                  v-bind="{group:{ name:'form', pull:'clone',put:false},sort:false, ghostClass: 'ghost'}"
                  @end="handleMoveEnd"
                  @start="handleFiledMoveStart"
                  :move="handleMove"
                >
                  <el-menu-item
                    v-for="(mAttr, mAttrIndex) in boDef.children[0].attributeList"
                    :key="boDef.children[0].name+mAttrIndex"
                  >
                    <i
                      :class="mAttr.dataType=='date'? 'icon-date':mAttr.dataType=='number'?'icon-number':mAttr.dataType=='clob'?'icon-text':'icon-single2'"
                    ></i>
                    <span
                      slot="title"
                      :style="getTitleStyle(boDef.children[0].name,mAttr.name)"
                    >{{mAttr.desc}}</span>
                  </el-menu-item>
                </draggable>

                <el-submenu
                  v-show="boDef.children[0].children && boDef.children[0].children.length>0"
                  v-for="(subEnt, subIndex) in boDef.children[0].children"
                  :key="'sub'+subEnt.name+subIndex"
                  :index="index+'-'+subIndex"
                >
                  <template slot="title">{{subEnt.desc}}</template>
                  <draggable
                    class="flex-container"
                    tag="ul"
                    :list="subEnt.attributeList"
                    v-bind="{group:{ name:'form', pull:'clone',put:false},sort:false, ghostClass: 'ghost'}"
                    @end="handleMoveEnd"
                    @start="handleFiledMoveStart"
                    :move="handleMove"
                  >
                    <el-menu-item
                      v-for="(subAttr, subAttrIndex) in subEnt.attributeList"
                      :key="'subAttr'+subEnt.name+subAttrIndex"
                    >
                      <i
                        :class="subAttr.dataType=='date'? 'icon-date':subAttr.dataType=='number'?'icon-number':subAttr.dataType=='clob'?'icon-text':'icon-single2'"
                      ></i>
                      <span
                        slot="title"
                        :style="getTitleStyle(subEnt.name,subAttr.name)"
                      >{{subAttr.desc}}</span>
                    </el-menu-item>
                  </draggable>

                  <el-submenu
                    v-show="subEnt.children && subEnt.children.length>0"
                    v-for="(sunEnt, sunIndex) in subEnt.children"
                    :key="'sun'+sunEnt.name+sunIndex"
                    :index="index+'-'+subIndex+'-'+sunIndex"
                  >
                    <template slot="title">{{sunEnt.desc}}</template>
                    <draggable
                      class="flex-container"
                      tag="ul"
                      :list="sunEnt.attributeList"
                      v-bind="{group:{ name:'form', pull:'clone',put:false},sort:false, ghostClass: 'ghost'}"
                      @end="handleMoveEnd"
                      @start="handleFiledMoveStart"
                      :move="handleMove"
                    >
                      <el-menu-item
                        v-for="(sunAttr, sunAttrIndex) in sunEnt.attributeList"
                        :key="'sunAttr'+sunEnt.name+sunAttrIndex"
                        :index="'sunAttr'+sunEnt.name+sunAttrIndex"
                      >
                        <i
                          :class="sunAttr.dataType=='date'? 'icon-date':sunAttr.dataType=='number'?'icon-number':sunAttr.dataType=='clob'?'icon-text':'icon-single2'"
                        ></i>
                        <span
                          slot="title"
                          :style="getTitleStyle(sunEnt.name,sunAttr.name)"
                        >{{sunAttr.desc}}</span>
                      </el-menu-item>
                    </draggable>
                  </el-submenu>
                </el-submenu>
              </el-submenu>
            </el-menu>
          </div>
        </el-scrollbar>
      </el-tab-pane>
      <el-tab-pane label="复用字段" name="copyFast">
        <el-scrollbar class="scrollbar-fullheight">
          <div class="control-list">
            <template v-if="layoutComponents.length">
              <div class="widget-cate">布局</div>
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
                  v-show="item.ctrlType!='hottable'"
                  :key="index"
                >
                  <a>
                    <i :class="item.icon"></i>
                    <span>{{item.desc}}</span>
                  </a>
                </li>
              </draggable>
            </template>
          </div>
          <div class="panel__copy--btndiv">
            <el-button type="primary" icon="el-icon-plus" @click="addCopyForms()">添加复用字段</el-button>
          </div>
          <el-collapse
            class="copyCollapse"
            v-model="activeCopyFormNames"
            v-for="(form, findex) in copyFormBoTreeData"
            :key="'form'+findex"
            :index="findex+''"
          >
            <el-collapse-item :title="form.name" :name="'form'+findex">
              <div class="attributeField">
                <el-menu :default-active="form.key+0" class="el-menu-vertical-demo">
                  <el-submenu
                    v-for="(boDef, index) in form.boTreeData"
                    :key="form.key+'def'+index"
                    :index="form.key+index+''"
                  >
                    <template slot="title">
                      <span>{{boDef.description}}</span>
                    </template>

                    <draggable
                      class="flex-container"
                      tag="ul"
                      :list="boDef.children[0].attributeList"
                      v-bind="{group:{ name:'form', pull:'clone',put:false},sort:false, ghostClass: 'ghost'}"
                      @end="handleMoveEnd"
                      @start="handleCopyFiledMoveStart(form.key,$event)"
                      :move="handleMove"
                    >
                      <el-menu-item
                        v-for="(mAttr, mAttrIndex) in boDef.children[0].attributeList"
                        v-show="isShow(mAttr)"
                        :key="form.key+boDef.children[0].name+mAttrIndex"
                      >
                        <i
                          :class="mAttr.dataType=='date'? 'icon-date':mAttr.dataType=='number'?'icon-number':mAttr.dataType=='clob'?'icon-text':'icon-single2'"
                        ></i>
                        <span
                          slot="title"
                          :style="getTitleStyle(boDef.children[0].name,mAttr.name)"
                        >{{mAttr.desc}}</span>
                      </el-menu-item>
                    </draggable>
                    <el-submenu
                      v-show="boDef.children[0].children && boDef.children[0].children.length>0"
                      v-for="(subEnt, subIndex) in boDef.children[0].children"
                      :key="form.key+'sub'+subEnt.name+subIndex"
                      :index="form.key+index+'-'+subIndex"
                    >
                      <template slot="title">{{subEnt.desc}}</template>
                      <draggable
                        class="flex-container"
                        tag="ul"
                        :list="subEnt.attributeList"
                        v-bind="{group:{ name:'form', pull:'clone',put:false},sort:false, ghostClass: 'ghost'}"
                        @end="handleMoveEnd"
                        @start="handleCopyFiledMoveStart(form.key,$event)"
                        :move="handleMove"
                      >
                        <el-menu-item
                          v-for="(subAttr, subAttrIndex) in subEnt.attributeList"
                          :key="form.key+'subAttr'+subEnt.name+subAttrIndex"
                          v-show="isShow(subAttr)"
                        >
                          <i
                            :class="subAttr.dataType=='date'? 'icon-date':subAttr.dataType=='number'?'icon-number':subAttr.dataType=='clob'?'icon-text':'icon-single2'"
                          ></i>
                          <span
                            slot="title"
                            :style="getTitleStyle(subEnt.name,subAttr.name)"
                          >{{subAttr.desc}}</span>
                        </el-menu-item>
                      </draggable>
                      <el-submenu
                        v-show="subEnt.children && subEnt.children.length>0"
                        v-for="(sunEnt, sunIndex) in subEnt.children"
                        :key="form.key+'sun'+sunEnt.name+sunIndex"
                        :index="form.key+index+'-'+subIndex+'-'+sunIndex"
                      >
                        <template slot="title">{{sunEnt.desc}}</template>
                        <draggable
                          class="flex-container"
                          tag="ul"
                          :list="sunEnt.attributeList"
                          v-bind="{group:{ name:'form', pull:'clone',put:false},sort:false, ghostClass: 'ghost'}"
                          @end="handleMoveEnd"
                          @start="handleCopyFiledMoveStart(form.key,$event)"
                          :move="handleMove"
                        >
                          <el-menu-item
                            v-show="isShow(sunAttr)"
                            v-for="(sunAttr, sunAttrIndex) in sunEnt.attributeList"
                            :key="form.key+'sunAttr'+sunEnt.name+sunAttrIndex"
                            :index="form.key+'sunAttr'+sunEnt.name+sunAttrIndex"
                          >
                            <i
                              :class="sunAttr.dataType=='date'? 'icon-date':sunAttr.dataType=='number'?'icon-number':sunAttr.dataType=='clob'?'icon-text':'icon-single2'"
                            ></i>
                            <span
                              slot="title"
                              :style="getTitleStyle(sunEnt.name,sunAttr.name)"
                            >{{sunAttr.desc}}</span>
                          </el-menu-item>
                        </draggable>
                      </el-submenu>
                    </el-submenu>
                  </el-submenu>
                </el-menu>
              </div>
            </el-collapse-item>
          </el-collapse>
        </el-scrollbar>
      </el-tab-pane>
    </el-tabs>
    <eip-copy-form-dialog
      ref="eipCopyFormDialog"
      :single="false"
      @onConfirm="formDialogConfirm"
      :formType="formType"
      :boDefIds="boDefIds"
      :formId="formId"
      appendToBody
    />
  </div>
</template>
<script>
import Draggable from "vuedraggable";
import deepmerge from "deepmerge";
import {
  basicComponents,
  layoutComponents,
  advanceComponents,
} from "@/api/controlsConfig.js";
import req from "@/request.js";
const EipCopyFormDialog = () =>
  import("@/components/dialog/EipCopyFormDialog.vue");

export default {
  name: "field-panel",
  components: { Draggable, EipCopyFormDialog },
  props: ["boDefIds", "widgetForm", "formType", "formId","copyFormList"],
  data() {
    return {
      showFiledList:[],
      basicComponents,
      layoutComponents,
      advanceComponents,
      activeName: "controlLayout",
      boTreeData: [],
      activeBoTreeMenu: "0",
      activeCopyFormNames: ["form0"],
      selectedMap: {},
      boDefIdMap: {},
      copyFiledMap: {},
      copyFormBoTreeData: [],
    };
  },
  created() {
    if (this.copyFormList && this.copyFormList.length>0) {
      this.initGenerateBoTreeData(this.boDefIds, true);
    }
  },
  watch: {
    boDefIds: {
      handler: function (newVal) {
        this.copyFiledMap = {};
        this.initGenerateBoTreeData(newVal);
      },
    },
    widgetForm: {
      handler: function (val, oldVal) {
        if (val && val.list && val.list.length > 0) {
          this.initSelectedMap(val.list);
        } else {
          this.selectedMap = {};
        }
      },
      deep: true,
    },
  },
  methods: {
    handleMoveEnd: function (evt) {},
    handleMoveStart: function (evt) {
      // 新增控件时  将控件属性切断联系
      evt.item._underlying_vm_ = deepmerge({}, evt.item._underlying_vm_, {
        clone: true,
      });
      const key =
        Date.parse(new Date()) + "_" + Math.ceil(Math.random() * 99999);
      evt.item._underlying_vm_.key = key;
    },
    handleFiledMoveStart: function (evt) {
      // 新增控件时  将控件属性切断联系
      const fieldControl = this.getFieldControl(evt.item._underlying_vm_);
      if (this.selectedMap[fieldControl.tableName + "_" + fieldControl.name]) {
        this.$message({
          message:
            "字段【" + fieldControl.desc + "】已绑定控件，不能多次绑定。",
          type: "warning",
        });
        delete evt.item._underlying_vm_;
        return;
      }
      //添加拖拽方式属性
      fieldControl.dragType = "field";
      evt.item._underlying_vm_ = deepmerge({}, fieldControl, {
        clone: true,
      });
      const key =
        Date.parse(new Date()) + "_" + Math.ceil(Math.random() * 99999);
      evt.item._underlying_vm_.key = key;
    },
    handleCopyFiledMoveStart: function (formKey, evt) {
      // 新增控件时  将控件属性切断联系
      const fieldControl = this.getCopyFieldControl(
        formKey,
        evt.item._underlying_vm_
      );
      if (!fieldControl || typeof fieldControl == "undefined") {
        this.$message({ message: "未找到该复用字段的控件。", type: "warning" });
        fieldControl = this.getFieldControl(evt.item._underlying_vm_);
      }
      if (this.selectedMap[fieldControl.tableName + "_" + fieldControl.name]) {
        this.$message({
          message:
            "字段【" + fieldControl.desc + "】已绑定控件，不能多次绑定。",
          type: "warning",
        });
        delete evt.item._underlying_vm_;
        return;
      }
      //添加拖拽方式属性
      fieldControl.dragType = "copy";
      evt.item._underlying_vm_ = deepmerge({}, fieldControl, {
        clone: true,
      });
      const key =
        Date.parse(new Date()) + "_" + Math.ceil(Math.random() * 99999);
      evt.item._underlying_vm_.key = key;
      //检测有没有绑定指定属性或事件，如果有提示注意检查是否涉及到其他BO导致绑定属性或事件失效
      setTimeout(() => this.validateFieldProperty(fieldControl), 1500);
    },
    handleMove: function (evt) {},
    handleClick(tab, event) {
      if (
        tab.name == "attributeField" &&
        this.boDefIds &&
        (!this.boTreeData || this.boTreeData.length == 0)
      ) {
        this.initGenerateBoTreeData(this.boDefIds);
      }
    },
    validateFieldProperty(filed) {
      if (filed && filed.options) {
        let propertyList = [];
        //判断计算公式
        if (filed.options.formulasDiyJs) {
          propertyList.push("【计算公式】");
        }
        //判断联动设置
        if (filed.options.linkage) {
          propertyList.push("【联动设置】");
        }
        //判断统计函数
        if (filed.options.mathExp) {
          propertyList.push("【字段校验】");
        }
        //判断文本内容的变量
        if (filed.options.textValue) {
          propertyList.push("【文本内容变量】");
        }
        //判断字段校验
        if (
          filed.options.validateList &&
          filed.options.validateList.length > 0
        ) {
          propertyList.push("【字段校验】");
        }
        if (propertyList.length > 0) {
          let msg =
            "复用字段“" +
            filed.desc +
            "”中设置了" +
            propertyList.join("，") +
            "，请检查是否存在绑定非当前BO字段，如果存在需自行修改，否则可能会影响相关功能效果。";
          this.$message({ message: msg, type: "warning", duration: 5500 });
        }
      }
    },
    getTitleStyle(entName, fieldName) {
      if (this.selectedMap[entName + "_" + fieldName]) {
        return "color:#bdbfc2;";
      }
      return "color:#212121;";
    },
    initGenerateBoTreeData(boDefIds, initCopyForm) {
      if (boDefIds) {
        let _this = this;
        const ids = boDefIds.split(",");
        ids.forEach((defId) => {
          _this.boDefIdMap[defId] = true;
        });
        req
          .get("${form}/form/form/v1/generateBoTreeData?boDefIds=" + boDefIds)
          .then((data) => {
            let response = data.data;
            if (response.state) {
              _this.boTreeData = JSON.parse(response.value);
            }
            if(initCopyForm){
              _this.formDialogConfirm(_this.copyFormList, true);
              _this.initSelectedMap(_this.widgetForm.list);
            }
            
          });
      } else {
        this.boTreeData = [];
        this.boDefIdMap = {};
      }
    },
    getFieldControl(field) {
      let baseObj = {
        name: field.name,
        target: field.name,
        desc: field.comment,
        title: field.comment,
        boAttrId: field.boAttrId,
        fieldPath: field.fieldPath,
        entId: field.entId,
        boDefAlias: field.boDefAlias,
        tableName: field.tableName,
        columnType: field.dataType,
      };
      if (field.fieldPath.split(".").length > 2) {
        baseObj.parentNodeType = "sun";
        baseObj.boSubEntity = field.tableName;
      }
      const key =
        Date.parse(new Date()) + "_" + Math.ceil(Math.random() * 99999);
      if (field.dataType == "number") {
        let option = {
          icon: "icon-single",
          ctrlType: "number",
          key: key,
          columnType: "number",
          options: {
            defaultValue: 0,
            min: 0,
            max: 99999,
            step: 1,
            decimalDigits: field.decimalLen,
            maxDecimalDigits: field.decimalLen,
            filtercurrency: "",
            filterthousandBit: "",
            advancedProperty: "inputType|bindPreAndSufFix",
            basicsProperty: "number|currency|placeholder|dateCount",
            controlsPosition: "",
            company: "",
            validateType:
              "min_value|max_value|confirmed|numeric|between|digits|required|row_unique|frontJSValidate|mobile",
            dataType: "number",
            validateList: [],
            disabled: false,
            formulasDiyJs: "",
            lableColor: "#969799",
            mathExp: "",
            bindPreAndSufFixjson: {
              preFix: "",
              sufSix: "",
            },
          },
        };
        return { ...baseObj, ...option };
      } else if (field.dataType == "date") {
        let option = {
          icon: "icon-date",
          ctrlType: "date",
          key: key,
          columnType: "date",
          options: {
            defaultValue: "",
            dataType: "date",
            validateType:
              "isAfter|isBefore|isStart|isEnd|required|row_unique|frontJSValidate",
            advancedProperty: "isEditor|isInputEdit",
            placeholder: "",
            basicsProperty: "date|placeholder",
            validate: "",
            readonly: false,
            editable: true,
            clearable: true,
            timestamp: false,
            required: false,
            type: "date",
            validateList: [],
            disabled: false,
            formulasDiyJs: "",
            lableColor: "#969799",
            mathExp: "",
            bindPreAndSufFixjson: {
              preFix: "",
              sufSix: "",
            },
            format: field.format,
            inputFormat: field.format,
          },
        };
        return { ...baseObj, ...option };
      } else if (field.dataType == "clob") {
        let option = {
          icon: "icon-single",
          ctrlType: "textarea",
          key: key,
          columnType: "clob",
          options: {
            width: "100%",
            isWidth: true,
            defaultValue: "",
            dataType: "clob",
            validateType:
              "regex|min|max|required|row_unique|frontJSValidate|backendValidate",
            advancedProperty: "isEditor|isInputEdit",
            placeholder: "",
            basicsProperty: "placeholder",
            validateList: [],
            disabled: false,
            formulasDiyJs: "",
            lableColor: "#969799",
          },
        };
        return { ...baseObj, ...option };
      } else {
        let option = {
          icon: "icon-single",
          ctrlType: "input",
          key: key,
          options: {
            width: "100%",
            isWidth: true,
            defaultValue: "",
            isCountDate: false,
            mathExp: "",
            isStartDate: "",
            isEndDate: "",
            countFormat: "day",
            dataType: "string|number",
            validateList: [],
            validate: "",
            validateType:
              "confirmed|email|regex|min|max|min_value|max_value|isAfter|isBefore|isStart|isEnd|numeric|between|is|digits|mobile|required|row_unique|alpha_spaces|alpha_dash|alpha_num|alpha|frontJSValidate|backendValidate",
            advancedProperty:
              "isInputEdit|isBindIdentity|inputType|bindPreAndSufFix",
            placeholder: "",
            disabled: false,
            basicsProperty: "input|dateCount|placeholder",
            bindIdentityjson: {},
            isBindPreAndSufFix: false,
            bindPreAndSufFixjson: {
              preFix: "",
              sufSix: "",
            },
            formulasDiyJs: "",
            lableColor: "#969799",
            showCondition: { target: '',fieldPath:'',value:''}
          },
        };
        return { ...baseObj, ...option };
      }
      return null;
    },
    getCopyFieldControl(formKey, field) {
      if (
        this.copyFiledMap[formKey] &&
        this.copyFiledMap[formKey][
          formKey + "_" + field.tableName + "_" + field.name
        ]
      ) {
        return this.copyFiledMap[formKey][
          formKey + "_" + field.tableName + "_" + field.name
        ];
      } else {
        return null;
      }
    },
    initSelectedMap(rootList, formKey) {
      const this_ = this;
      let newMap = {};
      let getFieldMap = function (newMap, obj, type) {
        switch (type) {
          case "grid":
            if (obj.columns && obj.columns.length > 0) {
              obj.columns.forEach((citem) => {
                if (citem.list && citem.list.length > 0) {
                  citem.list.forEach((gitem) => {
                    if (gitem.fieldPath) {
                      if (formKey) {
                        newMap[
                          formKey + "_" + gitem.tableName + "_" + gitem.name
                        ] = { ...gitem };
                      } else {
                        newMap[gitem.tableName + "_" + gitem.name] = true;
                      }
                    }
                  });
                }
              });
            }
            break;
          case "table":
            if (obj.rows && obj.rows.length > 0) {
              obj.rows.forEach((ritem) => {
                if (ritem.cols && ritem.cols.length > 0) {
                  ritem.cols.forEach((citem) => {
                    citem.list.forEach((item) => {
                      if (item.fieldPath) {
                        if (formKey) {
                          newMap[
                            formKey + "_" + item.tableName + "_" + item.name
                          ] = { ...item };
                        } else {
                          newMap[item.tableName + "_" + item.name] = true;
                        }
                      }
                    });
                  });
                }
              });
            }
            break;
          default:
            break;
        }
      };
      let getLayoutMap = function (list, newMap) {
        list.forEach((listItem) => {
          if (listItem.fieldPath) {
            if (formKey) {
              newMap[
                formKey + "_" + listItem.tableName + "_" + listItem.name
              ] = { ...listItem };
            } else {
              newMap[listItem.tableName + "_" + listItem.name] = true;
            }
          } else if (listItem.ctrlType) {
            switch (listItem.ctrlType) {
              case "tab":
              case "accordion":
                if (listItem.columns && listItem.columns.length > 0) {
                  listItem.columns.forEach((aitem) => {
                    if (aitem.list && aitem.list.length > 0) {
                      getLayoutMap(aitem.list, newMap);
                    }
                  });
                }
                break;
              case "grid":
                getFieldMap(newMap, listItem, "grid");
                break;
              case "table":
                getFieldMap(newMap, listItem, "table");
                break;
              case "subtable":
                if (listItem.list && listItem.list.length > 0) {
                  listItem.list.forEach((item) => {
                    if (item.fieldPath) {
                      if (formKey) {
                        newMap[
                          formKey + "_" + item.tableName + "_" + item.name
                        ] = { ...item };
                      } else {
                        newMap[item.tableName + "_" + item.name] = true;
                      }
                    } else if (
                      item.ctrlType == "sunDiv" ||
                      item.ctrlType == "suntable"
                    ) {
                      if (item.list && item.list.length > 0) {
                        item.list.forEach((sunitem) => {
                          if (sunitem.fieldPath) {
                            if (formKey) {
                              newMap[
                                formKey +
                                  "_" +
                                  sunitem.tableName +
                                  "_" +
                                  sunitem.name
                              ] = { ...sunitem };
                            } else {
                              newMap[
                                sunitem.tableName + "_" + sunitem.name
                              ] = true;
                            }
                          } else if (sunitem.ctrlType == "grid") {
                            getFieldMap(newMap, sunitem, "grid");
                          }
                        });
                      }
                    }
                  });
                }
                break;
              case "subDiv":
                if (listItem.list && listItem.list.length > 0) {
                  listItem.list.forEach((item) => {
                    if (item.fieldPath) {
                      newMap[item.tableName + "_" + item.name] = true;
                    } else if (item.ctrlType == "grid") {
                      getFieldMap(newMap, item, "grid");
                    } else if (
                      item.ctrlType == "sunDiv" ||
                      item.ctrlType == "suntable"
                    ) {
                      if (item.list && item.list.length > 0) {
                        item.list.forEach((sunitem) => {
                          if (sunitem.fieldPath) {
                            if (formKey) {
                              newMap[
                                formKey +
                                  "_" +
                                  sunitem.tableName +
                                  "_" +
                                  sunitem.name
                              ] = { ...sunitem };
                            } else {
                              newMap[
                                sunitem.tableName + "_" + sunitem.name
                              ] = true;
                            }
                          } else if (sunitem.ctrlType == "grid") {
                            getFieldMap(newMap, sunitem, "grid");
                          }
                        });
                      }
                    }
                  });
                }
                break;
              default:
                break;
            }
          } else {
          }
        });
        if(newMap){
          //获取可以复用的字段集合
          for(let key in newMap){
            this_.showFiledList.push(newMap[key]);
          }
        }
      };
      getLayoutMap(rootList, newMap);
      if (formKey) {
        this.copyFiledMap[formKey] = newMap;
      } else {
        this.selectedMap = newMap;
      }
    },
    addCopyForms() {
      this.$refs.eipCopyFormDialog.showDialog();
    },
    addCopyForm(form) {
      let formObj = { key: form.formKey, name: form.name, boTreeData: [] };
      let _this = this;
      let copyBoTree = function (defId) {
        let copyTreeData = {};
        _this.boTreeData.forEach((treeData) => {
          if (treeData.id == defId) {
            copyTreeData = { ...treeData };
          }
        });
        return copyTreeData;
      };
      form.boDefList.forEach((defId) => {
        if (_this.boDefIdMap[defId]) {
          let copyTree = copyBoTree(defId);
          if (JSON.stringify(copyTree) != "{}") {
            formObj.boTreeData.push(copyTree);
          }
        }
      });
      if (formObj.boTreeData.length > 0) {
        const expand = JSON.parse(form.expand);
        this.initSelectedMap(expand.list, form.formKey);
        this.copyFormBoTreeData.push(formObj);
      } else {
        this.$message({
          message: "表单【" + form.name + "】不能被复用。",
          type: "warning",
        });
      }
    },
    formDialogConfirm(data, init) {
      if (data && data.length > 0) {
        let _this = this;
        data.forEach((form) => {
          if (form.expand && form.boDefList && form.boDefList.length > 0) {
            _this.addCopyForm(form);
            if(!init){
              _this.$emit('addTocopyFormList', form);
            }
          }
        });
      }
    },
    //判断哪些字段可以复用
    isShow(attr){
      if(this.showFiledList.length>0){
        let isShow = this.showFiledList.find(obj=>
          obj.fieldPath==attr.fieldPath
        )
        if(isShow){
          return true;
        }else{
          return false;
        }
      }else{
        return false;
      }
    }
  },
};
</script>
<style lang="scss" scoped>
@import "@/assets/css/form-editor.scss";

.panel {
  height: 100%;
  /deep/ .el-tabs__content {
    height: calc(100% - 60px);
  }
  /deep/ .el-tab-pane {
    height: 100%;
  }
  /deep/ .el-tabs__nav {
    margin-left: 10px;
  }
  /deep/ .el-tabs__item {
    font-size: 13px;
  }
  /deep/ .el-collapse-item__header {
    text-indent: 10px;
  }
  .panel__tabs {
    height: 100%;
  }
  .scrollbar-fullheight {
    height: 100%;
  }
  .panel__copy--btndiv {
    text-align: center;
  }
}

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
  width: 87px;
  border-radius: 5px;
  cursor: pointer;
}

ul.flex-container > li.flex-item:hover {
  box-shadow: 0 2px 5px rgba(86, 96, 117, 0.15);
}

li.flex-item > a > i {
  font-size: 16px;
}

li.flex-item > a > span {
  margin-left: 8px;
}
.attributeField >>> .el-submenu__title {
  height: 42px;
  line-height: 42px;
}
.attributeField >>> .el-submenu .el-menu-item {
  height: 38px;
  line-height: 38px;
}
.copyCollapse {
  margin-top: 10px;
}
</style>
