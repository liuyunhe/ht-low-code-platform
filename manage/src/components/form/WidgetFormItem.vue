<template>
  <div @click="handleClick(index)">
    <div @click.ctrl="handleClickCtrl(index)">
      <div class="widget-form-item">
        <div
          class="widget-mask"
          @click.capture="handleSelectWidget(index)"
        ></div>
        <div
          class="drag-widget"
          title="拖拽"
          v-if="selectWidget.key == element.key"
        >
          <i class="icon-drag"></i>
        </div>
        <div class="widget-view-action" v-if="selectWidget.key == element.key">
          <i
            class="icon-copy"
            title="复制"
            @click.stop="handleWidgetClone(index)"
          ></i>
          <el-divider direction="vertical"></el-divider>
          <i
            class="icon-trash"
            title="按右Alt键删除"
            @click.stop="handleWidgetDelete(index)"
          ></i>
        </div>
        <ht-form-item
          class="widget-view"
          :class="{
            active:
              selectWidget.key == element.key ||
              selectWidgetList.indexOf(element.key) != -1,
          }"
          v-if="
            element &&
            element.key &&
            element.ctrlType != 'iframe' &&
            element.ctrlType != 'ou-pdf' &&
            !element.noTitle
          "
          :label-width="element.options ? element.options.labelstyleWidth : ''"
          :label-height="
            element.options ? element.options.labelstyleHeight : ''
          "
        >
          <template v-if="element && element.key" slot="label">
            <label
              :label-width="
                element.options ? element.options.labelstyleWidth : ''
              "
              :class="{
                'label-font-weight':
                  element.options && element.options.boldLable
                    ? element.options.boldLable
                    : false,
              }"
              v-if="
                !(element.options && element.options.hideLabel
                  ? element.options.hideLabel
                  : false)
              "
              :style="{
                width: element.options ? element.options.labelstyleWidth : '',
                height: element.options ? element.options.labelstyleHeight : '',
                color: element.options ? element.options.lableColor : '',
              }"
              >{{ element.desc_zh || element.desc }}</label
            >
          </template>
          <template v-if="element.ctrlType == 'input'">
            <ht-input
              v-model="element.options.defaultValue"
              :validate="element.options.validate"
              :style="{
                width: element.options.width ? element.options.width : '100%',
              }"
              :placeholder="
                element.options.placeholder_zh || element.options.placeholder
              "
              :disabled="element.options.disabled"
            >
              <template
                v-if="
                  element.options.isBindPreAndSufFix &&
                  element.options.bindPreAndSufFixjson.preFix
                "
                v-slot:prepend
              >
                <span>{{ element.options.bindPreAndSufFixjson.preFix }}</span>
              </template>
              <template
                v-if="
                  element.options.isBindPreAndSufFix &&
                  element.options.bindPreAndSufFixjson.sufSix
                "
                v-slot:append
              >
                <span>{{ element.options.bindPreAndSufFixjson.sufSix }}</span>
              </template>
            </ht-input>
          </template>

          <template v-if="element.ctrlType == 'textarea'">
            <ht-input
              type="textarea"
              :rows="element.options.height ? element.options.height : 2"
              v-model="element.options.defaultValue"
              :style="{
                width: element.options.width ? element.options.width : '100%',
              }"
              :disabled="element.options.disabled"
              :placeholder="
                element.options.placeholder_zh || element.options.placeholder
              "
            />
          </template>

          <template v-if="element.ctrlType == 'number'">
            <ht-input
              type="number"
              v-model="element.options.defaultValue"
              :disabled="element.options.disabled"
              :controls-position="element.options.controlsPosition"
              :style="{
                width: element.options.width ? element.options.width : '100%',
              }"
            >
              <template v-if="element.options.company" v-slot:append>
                <span>{{ element.options.company }}</span>
              </template>
            </ht-input>
          </template>

          <template v-if="element.ctrlType == 'radio'">
            <el-radio-group
              v-model="element.options.defaultValue"
              :style="{width: element.options.width}"
              :disabled="element.options.disabled"
            >
              <el-radio
                :style="{
                  display: element.options.inline ? 'block' : 'inline-block',
                }"
                :label="item.value"
                v-for="(item, index) in element.options.options"
                :key="item.value + index"
                >{{
                  element.options.showLabel ? item.label : item.value
                }}</el-radio
              >
            </el-radio-group>
          </template>

          <template v-if="element.ctrlType == 'checkbox'">
            <el-checkbox-group
              v-model="element.options.defaultValue"
              :style="{width: element.options.width}"
              :disabled="element.options.disabled"
            >
              <el-checkbox
                :style="{
                  display: element.options.inline ? 'block' : 'inline-block',
                }"
                :label="item.value"
                v-for="(item, index) in element.options.options"
                :key="item.value + index"
                >{{
                  element.options.showLabel ? item.label : item.value
                }}</el-checkbox
              >
            </el-checkbox-group>
          </template>

          <template v-if="element.ctrlType == 'time'">
            <el-time-picker
              v-model="element.options.defaultValue"
              :is-range="element.options.isRange"
              :placeholder="element.options.placeholder"
              :start-placeholder="element.options.startPlaceholder"
              :end-placeholder="element.options.endPlaceholder"
              :readonly="element.options.readonly"
              :disabled="element.options.disabled"
              :editable="element.options.editable"
              :clearable="element.options.clearable"
              :arrowControl="element.options.arrowControl"
              :style="{width: element.options.width}"
            ></el-time-picker>
          </template>

          <template v-if="element.ctrlType == 'date'">
            <el-date-picker
              v-model="element.options.defaultValue"
              :type="element.options.type"
              :is-range="element.options.isRange"
              :placeholder="element.options.placeholder"
              :start-placeholder="element.options.startPlaceholder"
              :end-placeholder="element.options.endPlaceholder"
              :readonly="element.options.readonly"
              :disabled="element.options.disabled"
              :editable="element.options.editable"
              :clearable="element.options.clearable"
              :style="{width: element.options.width}"
            ></el-date-picker>
          </template>

          <template v-if="element.ctrlType == 'rate'">
            <el-rate
              v-model="element.options.defaultValue"
              :max="element.options.max"
              :disabled="element.options.disabled"
              :allow-half="element.options.allowHalf"
            ></el-rate>
          </template>

          <template v-if="element.ctrlType == 'color'">
            <el-color-picker
              v-model="element.options.defaultValue"
              :disabled="element.options.disabled"
              :show-alpha="element.options.showAlpha"
            ></el-color-picker>
          </template>

          <template v-if="element.ctrlType == 'select'">
            <el-select
              v-model="element.options.defaultValue"
              :disabled="element.options.disabled"
              :multiple="element.options.multiple"
              :clearable="element.options.clearable"
              :placeholder="element.options.placeholder"
              :style="{
                width: element.options.width ? element.options.width : '100%',
              }"
            >
              <el-option
                v-for="item in element.options.options"
                :key="item.value"
                :value="item.value"
                :label="element.options.showLabel ? item.label : item.value"
              ></el-option>
            </el-select>
          </template>

          <template v-if="element.ctrlType == 'switch'">
            <el-switch
              style="display: block"
              v-model="element.options.defaultValue"
              active-color="#13ce66"
              inactive-color="#ff4949"
              :active-value="element.options.activeValue"
              :inactive-value="element.options.inactiveValue"
              :active-text="element.options.activeText"
              :inactive-text="element.options.inactiveText"
              :disabled="element.options.disabled"
            ></el-switch>
          </template>

          <template v-if="element.ctrlType == 'slider'">
            <el-slider
              v-model="element.options.defaultValue"
              :min="element.options.min"
              :max="element.options.max"
              :disabled="element.options.disabled"
              :step="element.options.step"
              :show-input="element.options.showInput"
              :range="element.options.range"
              :style="{width: element.options.width}"
            ></el-slider>
          </template>

          <template v-if="element.ctrlType == 'imgupload'">
            <fm-upload
              v-model="element.options.defaultValue"
              :disabled="element.options.disabled"
              :style="{width: element.options.width}"
              :width="element.options.size.width"
              :height="element.options.size.height"
              token="xxx"
              domain="xxx"
            ></fm-upload>
          </template>

          <template v-if="element.ctrlType == 'cascader'">
            <!-- <el-cascader
          v-model="element.options.defaultValue"
          :disabled="element.options.disabled"
          :clearable="element.options.clearable"
          :placeholder="element.options.placeholder"
          :style="{width: element.options.width}"
          :options="element.options.remoteOptions"
          ></el-cascader>-->
            <ht-select
              :placeholder="element.options.placeholder"
              v-model="element.options.defaultValue"
              :options="[]"
            />
          </template>

          <template v-if="element.ctrlType == 'editor'">
            <vue-editor
              v-model="element.options.defaultValue"
              :style="{width: element.options.width}"
            ></vue-editor>
          </template>

          <template v-if="element.ctrlType == 'blank'">
            <div
              style="
                height: 50px;
                color: #999;
                background: #eee;
                line-height: 50px;
                text-align: center;
              "
            >
              {{ $t('fm.components.fields.blank') }}
            </div>
          </template>

          <template v-if="element.ctrlType == 'property-text'">
            <font
              :style="{
                fontWeight: element.options.boldText ? 'bold' : 'normal',
                color: element.options.textColor
                  ? element.options.textColor
                  : '#000000',
                fontSize: element.options.textSize + 'px',
              }"
            >
              <vue-ueditor-wrap
                v-model="element.options.textValue"
                :config="config"
              ></vue-ueditor-wrap>
            </font>
          </template>

          <template v-if="element.ctrlType == 'text'">
            <font
              :style="{
                fontWeight: element.options.boldText ? 'bold' : 'normal',
                color: element.options.textColor
                  ? element.options.textColor
                  : '#000000',
                fontSize: element.options.textSize + 'px',
              }"
            >
              <vue-ueditor-wrap
                v-model="element.options.textValue"
                :config="config"
              ></vue-ueditor-wrap>
            </font>
          </template>

          <template v-if="element.ctrlType == 'currency'">
            <ht-input
              type="number"
              v-model="element.options.defaultValue"
              :style="{
                width: element.options.width ? element.options.width : '100%',
              }"
              :placeholder="element.options.placeholder"
              :step="element.options.step"
              :min="element.options.min"
              :max="element.options.max"
            />
          </template>

          <template v-if="element.ctrlType == 'selector'">
            <ht-demension
              v-model="element.options.defaultValue"
              quickSearchProps
              :placeholder="element.options.placeholder"
              :style="{
                width: element.options.width ? element.options.width : '100%',
              }"
            />
          </template>

          <template v-if="element.ctrlType == 'related-process'">
            <img :src="flowListSvg" style="width: 100%; height: 100%" alt />
          </template>
          <template v-if="element.ctrlType == 'relative-link'">
            <div class="relative-link__container">
            <el-tag type="info">
              <span style="font-size: 30px" class="icon-relation"></span>
            </el-tag>
            <el-tag type="info">
              <span style="font-size: 30px" class="icon-relation"></span>
            </el-tag>
            <el-tag type="info">
              <span style="font-size: 30px" class="icon-relation"></span>
            </el-tag>
            </div>
          </template>
          <!-- ccwgq 2022-10-20 增加业务条线对话框 -->
          <template v-if="element.ctrlType == 'business-dialog'">
          <el-input
              :style="{
                width: element.options.width ? element.options.width : '100%',
              }"
              v-model="element.options.defaultValue"
              class="input-with-select"
            >
              <el-button
                slot="append"
                :icon="element.options.customDialogjson.icon"
                >{{ element.options.customDialogjson.name }}</el-button
              >
            </el-input>
          </template>
          <template
            v-if="
              element.ctrlType == 'dialog'
            "
          >
            <el-input
              :placeholder="element.options.placeholder"
              :style="{
                width: element.options.width ? element.options.width : '100%',
              }"
              v-model="element.options.defaultValue"
              class="input-with-select"
            >
              <el-button
                slot="append"
                :icon="element.options.customDialogjson.icon"
                >{{ element.options.customDialogjson.name }}</el-button
              >
            </el-input>
          </template>

          <template v-if="element.ctrlType == 'relation'">
            <ht-select
              :placeholder="element.options.placeholder"
              v-model="element.options.defaultValue"
              :options="[]"
            />
          </template>

          <template v-if="element.ctrlType == 'attachment'">
            <el-input
              v-model="element.options.defaultValue"
              class="input-with-select"
            >
              <el-button slot="append" icon="el-icon-upload2"></el-button>
            </el-input>
          </template>

          <!-- ccwgq 2022-05-25 流程附件 -->
          <template v-if="element.ctrlType === 'ou-attachment'">
            <el-input
              v-model="element.options.defaultValue"
              class="input-with-select"
            >
              <el-button slot="append" icon="el-icon-upload2"></el-button>
            </el-input>
          </template>

          <!-- ccwgq 2022-10-09 流程意见 -->
          <template v-if="element.ctrlType === 'ou-opinion'">
           <el-input type="textarea" 
           v-model="element.options.defaultValue" placeholder="此控件仅做意见展示使用"></el-input>
          </template>

          <template v-if="element.ctrlType == 'immediate-single'">
            <ht-input
              v-model="element.options.defaultValue"
              :validate="element.options.validate"
              :style="{width: element.options.width}"
              :placeholder="element.options.placeholder"
              :disabled="element.options.disabled"
            />
          </template>

          <template v-if="element.ctrlType == 'button'">
            <template v-if="element.options.bindEventjson.isShowInput">
              <el-input
                :placeholder="element.options.placeholder"
                v-model="element.options.defaultValue"
                class="input-with-select"
              >
                <el-button
                  slot="append"
                  :icon="element.options.bindEventjson.icon"
                  >{{ element.options.bindEventjson.name }}</el-button
                >
              </el-input>
            </template>
          </template>

          <template v-if="element.ctrlType == 'immediate-textarea'">
            <ht-input
              type="textarea"
              :rows="element.options.height ? element.options.height : 2"
              v-model="element.options.defaultValue"
              :style="{
                width: element.options.width ? element.options.width : '100%',
              }"
              :disabled="element.options.disabled"
              :placeholder="element.options.placeholder"
            />
          </template>

          <template v-if="element.ctrlType == 'signature'">
            <img :src="demoSignature" style="width: 70px; height: 22px" alt />
          </template>

          <template v-if="element.ctrlType == 'dic'">
            <ht-select
              :placeholder="element.options.placeholder"
              :style="{
                width: element.options.width ? element.options.width : '100%',
              }"
              v-model="element.options.defaultValue"
              :options="[]"
              multiple
            />
          </template>

          <template v-if="element.ctrlType === 'tag'">
            <el-select
              :placeholder="element.options.placeholder"
              :style="{
                width: element.options.width ? element.options.width : '100%',
              }"
              filterable
              multiple
              :value="['标签1', '标签2']"
              :remote="element.options.filterable"
            >
              <el-option label="标签1" value="标签1" key="1" />
            </el-select>
            <!--        <el-button v-if="element.options.expand">添加</el-button>-->
          </template>

          <template v-if="element.ctrlType == 'dropdown'">
            <ht-select
              :placeholder="element.options.placeholder"
              v-model="element.options.defaultValue"
              :style="{
                width: element.options.width ? element.options.width : '100%',
              }"
              :options="[]"
            />
          </template>
          <template v-if="element.ctrlType == 'autocomplete'">
            <el-autocomplete
              v-model="element.options.inputVal"
              :fetch-suggestions="element.options.querySearchAsync"
              :validate="element.options.inputValidate"
              :style="element.options.style"
              :placeholder="element.options.placeholder"
              :name="element.options.inputName"
            />
          </template>
          <template v-if="element.ctrlType == 'eip-cascader'">
            <el-cascader
              v-model="element.options.inputVal"
              :validate="element.options.inputValidate"
              :style="element.options.style"
              :placeholder="element.options.placeholder"
              :name="element.options.inputName"
              :disabled="element.options.disabled"
              :clearable="element.options.clearable"
              :options="element.options.remoteOptions"
            />
          </template>
          <template v-if="element.ctrlType == 'image'">
            <span
              v-if="
                element.options.size.height == 0 ||
                element.options.size.width == 0
              "
            >
              <img :src="img_src" v-if="imgSrc" />
            </span>
            <span
              v-if="
                element.options.size.height != 0 &&
                element.options.size.width != 0
              "
            >
              <img
                :src="img_src"
                v-if="imgSrc"
                :style="{
                  height: element.options.size.height + 'px',
                  width: element.options.size.width + 'px',
                }"
              />
            </span>
          </template>
          <template v-if="element.ctrlType == 'imageViewer'">
            <el-button icon="el-icon-upload2">上传图片</el-button>
          </template>
          <template v-if="element.ctrlType == 'amap'">
            <div style="width: 100%; height: 350px">
              <el-amap
                vid="amap"
                :plugin="plugin"
                :center="mapCenter"
                :zoom="zoom"
                :resizeEnable="resizeEnable"
              ></el-amap>
            </div>
          </template>
          <template v-if="element.ctrlType == 'office'">
            <div class="inputs">
              <div style="width: 100%; min-width: 180px" class="el-select">
                <div
                  ref="tagSpans"
                  style="width: calc(100% - 50px)"
                  class="el-select__tags"
                >
                  <span>
                    <span
                      class="el-tag el-tag--info el-tag--small"
                      @click.stop
                      v-for="(item, index) in [{name: 'office文档'}]"
                      :key="index"
                    >
                      <span class="el-select__tags-text">{{ item.name }}</span>
                      <i class="el-tag__close el-icon-close"></i>
                    </span>
                  </span>
                </div>
                <div>
                  <el-input
                    type="text"
                    ref="inputEl"
                    :value="'a'"
                    style="height: 30px"
                    prefix-icon="icon-DOC"
                  >
                    <el-button slot="append" icon="el-icon-plus"></el-button>
                  </el-input>
                </div>
              </div>
            </div>

            <!--          <el-input prefix-icon="icon-DOC" :value="'office文件'">-->
            <!--            <el-button slot="append" icon="el-icon-plus"></el-button>-->
            <!--          </el-input>-->
          </template>

          <!-- <template v-if="element.ctrlType == 'QRcode'">
            <span>自动获取流程实例地址</span>
          </template> -->
        </ht-form-item>

        <div
          class="widget-view"
          style="overflow-x: auto; overflow-y: hidden; padding: 15px"
          v-if="element.ctrlType == 'iframe'"
          :class="{
            active:
              selectWidget.key == element.key ||
              selectWidgetList.indexOf(element.key) != -1,
          }"
        >
          <iframe
            v-if="element.options.iframeSrc"
            :src="element.options.iframeSrc"
            :height="element.options.iframeSrcHeight"
            :width="element.options.iframeSrcWidth"
            :style="'border-color:' + element.options.lableColor"
            :frameborder="element.options.frameborder"
          />
          <div class="iframe-empty__div" v-else>请设置iframe的链接地址</div>
        </div>

        <!-- TODO w 自定义组件 begin-->
        <div
          class="widget-view"
          style="overflow-x: auto; overflow-y: hidden; padding: 15px"
          v-if="element.ctrlType == 'ou-pdf'"
          :class="{
            active:
              selectWidget.key == element.key ||
              selectWidgetList.indexOf(element.key) != -1,
          }"
        >
          <div style="width: 100%; height: 350px">
            <span>pdf预览</span>
          </div>
        </div>
         <!-- WF 图片二维码 -->
         <div v-if="element.ctrlType == 'QRcode'" 
          class="widget-view"
          :class="{ active: selectWidget.key == element.key  || selectWidgetList.indexOf(element.key) !=-1 }"
        >
        <span>核销二维码：</span>
        </div>
        <!-- TODO w 自定义组件 end-->

        <div
          class="widget-view"
          style="overflow-x: auto; overflow-y: hidden; padding: 15px"
          v-if="element.ctrlType == 'contractPreview'"
          :class="{
            active:
              selectWidget.key == element.key ||
              selectWidgetList.indexOf(element.key) != -1,
          }"
        >
          <iframe
            :height="element.options.iframeSrcHeight"
            :width="element.options.iframeSrcWidth"
            :style="'border-color:' + element.options.lableColor"
            :frameborder="element.options.frameborder"
          />
        </div>

        <div v-if="element.noTitle">
          <div
            class="widget-view"
            :class="{
              active:
                selectWidget.key == element.key ||
                selectWidgetList.indexOf(element.key) != -1,
            }"
            v-if="element.ctrlType == 'divider'"
          >
            <el-divider :content-position="element.options.position">
              <i :class="element.options.customDialogjson.icon">{{
                element.options.content
              }}</i>
            </el-divider>
          </div>
          <div
            class="widget-view"
            :class="{
              active:
                selectWidget.key == element.key ||
                selectWidgetList.indexOf(element.key) != -1,
            }"
            v-if="element.ctrlType == 'milepost'"
          >
            <el-steps
              :active="0"
              finish-status="success"
              align-center
              :direction="element.options.direction"
            >
              <el-step
                v-for="(col, colIndex) in element.options.steps"
                :key="colIndex"
                :title="col.title"
                :description="col.description"
              ></el-step>
            </el-steps>
          </div>
          <div
            v-if="element.ctrlType == 'button'"
            class="widget-view"
            :class="{
              active:
                selectWidget.key == element.key ||
                selectWidgetList.indexOf(element.key) != -1,
            }"
          >
            <el-button :icon="element.options.bindEventjson.icon">{{
              element.options.bindEventjson.name
            }}</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import VueAMap from 'vue-amap' //高德地图插件
VueAMap.initAMapApiLoader({
  // 高德的key
  key: '1f8f479e9b787974efaa9bda1bf8ef92',
  // 插件集合
  plugin: [
    'AMap.Autocomplete',
    'AMap.PlaceSearch',
    'AMap.Scale',
    'AMap.OverView',
    'AMap.ToolBar',
    'AMap.MapType',
    'AMap.PolyEditor',
    'AMap.CircleEditor',
    'AMap.Geolocation',
    'AMap.Autocomplete',
    'AMap.PlaceSearch',
  ],
  // 默认高德 sdk 版本为 1.4.4
  v: '1.4.4',
})
import req from '@/request.js'
import WidgetFormBus from '@/components/form/bus/WidgetFormBus.js'
import deepmerge from 'deepmerge'
export default {
  props: ['element', 'select', 'index', 'data', 'selectWidgetList'],
  data() {
    const self = this
    return {
      config: {
        initialFrameHeight: 50,
        UEDITOR_HOME_URL:
          window.location.origin +
          '/' +
          window.location.pathname.split('/')[1] +
          '/static/ueditor/',
        toolbars: [],
        elementPathEnabled: false, //是否启用元素路径，默认是true显示
        wordCount: false, //是否开启字数统计
        // 初始容器宽度
        initialFrameWidth: '99%',
        zIndex: 8,
        enableAutoSave: false,
        readonly: true,
      },
      mapCenter: [121.59996, 31.197646],
      zoom: 12,
      lng: 0,
      lat: 0,
      loaded: false,
      resizeEnable: true,
      plugin: [],
      img_src: '',
      selectWidget: this.select,
      flowListSvg: require('@/assets/img/flowList.svg'),
      demoSignature: require('@/assets/img/signature.png'),
    }
  },
  computed: {
    imgSrc: function (state) {
      this.getImgSrc(this.element)
      return true
    },
  },
  created() {
    const me_ = this
    WidgetFormBus.$emit('initNoAttrField', this.element)
    WidgetFormBus.$on('changeCtrlType', (obj) => {
      if (obj.key === me_.element.key) {
        const key =
          Date.parse(new Date()) + '_' + Math.ceil(Math.random() * 99999)
        obj.key = key
        obj.model = obj.ctrlType + '_' + key
        me_.selectWidget = obj
        //me_.$set(me_.data.list, me_.index, obj);
        let tmp = me_.data
        tmp.list[me_.index] = obj
        me_.$emit('data:update', tmp)
        me_.destroyedCtrlType(this)
        //me_.$emit("data:update", me_.data);
      }
    })
  },
  destroyed() {
    //WidgetFormBus.$off("changeCtrlType");
  },
  methods: {
    destroyedCtrlType(formBus) {
      formBus.$off('changeCtrlType')
    },
    getImgSrc(obj) {
      if (obj.options.isDisplay) {
        var fileJson = obj.options.fileJson
        if (fileJson) {
          var json = JSON.parse(fileJson)
          req
            .get(
              window.context.portal +
                '/file/onlinePreviewController/v1/getFileById_' +
                json[0].id,
              'arraybuffer'
            )
            .then((response) => {
              let type = response.headers['content-type']
              if (type) {
                this.img_src = window.URL.createObjectURL(
                  new Blob([response.data], {type: type})
                )
              } else {
                this.img_src = window.URL.createObjectURL(
                  new Blob([response.data])
                )
              }
            })
        }
      }
    },
    handleClick(index) {
      //判断"CTRL" 键是否被按住 true:按住了  false:没按住
      if (!window.event.ctrlKey) {
        //清空数组
        this.selectWidgetList.empty()
        this.selectWidgetList.push(this.selectWidget.key)
      }
    },
    //按住Ctrl键选择表单字段控件多选进行删除
    handleClickCtrl(index) {
      if (
        this.selectWidgetList.length == 0 ||
        this.selectWidgetList.indexOf(this.data.list[index].key) == -1
      ) {
        this.selectWidgetList.push(this.data.list[index].key)
      } else if (
        this.selectWidgetList.indexOf(this.data.list[index].key) != -1
      ) {
        this.selectWidgetList.remove(this.data.list[index].key)
      }
      this.selectWidget = {options: {validateType: ''}}
    },
    handleSelectWidget(index) {
      this.selectWidget = this.data.list[index]
    },
    handleWidgetDelete(index) {
      if (this.data.list.length - 1 === index) {
        if (index === 0) {
          this.selectWidget = {options: {validateType: ''}}
        } else {
          this.selectWidget = this.data.list[index - 1]
        }
      } else {
        this.selectWidget = this.data.list[index + 1]
      }

      this.$nextTick(() => {
        this.data.list.splice(index, 1)
      })
    },
    handleWidgetClone(index) {
      let cloneData = deepmerge({}, this.data.list[index], {clone: true})

      cloneData.key =
        Date.parse(new Date()) + '_' + Math.ceil(Math.random() * 99999)

      this.data.list.splice(index, 0, cloneData)

      this.$nextTick(() => {
        this.selectWidget = this.data.list[index + 1]
      })
    },
  },
  watch: {
    select(val) {
      this.selectWidget = val
    },
    selectWidget: {
      handler(val) {
        this.$emit('update:select', val)
      },
      deep: true,
    },
    element: {
      handler: function (newVal, oldVal) {
        if (newVal) {
          if (newVal.ctrlType == 'amap') {
            const self = this
            this.plugin = [
              'AMap.Scale',
              'AMap.ToolBar',
              'AMap.Autocomplete',
              {
                enableHighAccuracy: true, //是否使用高精度定位，默认:true
                timeout: 10000, //超过10秒后停止定位，默认：5s
                buttonPosition: 'RB', //定位按钮的停靠位置
                buttonOffset: new AMap.Pixel(5, 10), //定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
                zoomToAccuracy: true, //定位成功后是否自动调整地图视野到定位点
                markerOptions: {
                  //自定义定位点样式，同Marker的Options
                  offset: new AMap.Pixel(-18, -36),
                  content:
                    '<img src="https://a.amap.com/jsapi_demos/static/resource/img/user.png" style="width:36px;height:36px"/>',
                },
                showCircle: true, //是否显示定位精度圈
                circleOptions: {
                  //定位精度圈的样式
                  strokeColor: '#0093FF',
                  noSelect: true,
                  strokeOpacity: 0.5,
                  strokeWeight: 1,
                  fillColor: '#02B0FF',
                  fillOpacity: 0.25,
                },
                extensions: 'all',
                pName: 'Geolocation',
                events: {
                  init(o) {
                    // o 是高德地图定位插件实例  获取当前位置
                    o.getCurrentPosition((status, result) => {
                      if (result && result.position) {
                        self.lng = result.position.lng
                        self.lat = result.position.lat
                        self.mapCenter = [self.lng, self.lat]
                        self.loaded = true
                        self.$nextTick()
                      }
                    })
                  },
                },
              },
            ]
          }
        }
      },
      deep: true,
    },
  },
}
</script>
<style lang="scss" scoped>
@import '@/assets/css/form-editor.scss';
div.widget-view {
  padding: 10px 0;
  position: relative;
  overflow: hidden;
}

.widget-view.active {
  outline: 1px solid $--color-primary;
  background: #fefefe;
}
.label-font-weight {
  font-weight: bold;
}
.iframe-empty__div {
  text-align: center;
  font-weight: bold;
  font-size: 24px;
  color: #ccc;
}
.relative-link__container{
  /deep/ .el-tag{
    margin-right:10px;
  }
}
</style>
