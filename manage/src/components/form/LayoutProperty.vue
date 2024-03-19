<template>
  <div style="margin: 15px">
    <!-- 分割线 -->
    <template v-if="data && data.ctrlType == 'divider'">
      <!-- 图标 -->
      <div class="custDialog-div">
        <span>图标</span>
        <div style="float: right; margin-right: 15px">
          <IconDialog @selected="icons" />
        </div>
      </div>
      <!-- 内容 -->
      <ht-form-item
        label="内容"
        label-width="100px"
        class="customQuery-inputs custDialog-item"
      >
        <ht-input v-model="data.options.content"></ht-input>
      </ht-form-item>
      <!-- 位置 -->
      <ht-form-item
        label="位置"
        label-width="100px"
        class="customQuery-inputs custDialog-item"
      >
        <ht-select
          :options="[
            {key: 'left', value: '居左'},
            {key: 'right', value: '居右'},
            {key: 'center', value: '居中'}
          ]"
          v-model="data.options.position"
        />
      </ht-form-item>
      <ht-form-item
        label="颜色"
        label-width="100px"
        class="customQuery-inputs custDialog-item"
      >
        <el-color-picker
          v-model="data.options.color"
          size="mini"
        ></el-color-picker>
      </ht-form-item>
    </template>
    <!-- 栅格布局 -->
    <div>
      <template v-if="data && data.ctrlType == 'grid'">
        <ht-form-item label="栅格间隔" label-width="65px">
          <ht-input
            type="number"
            v-model="data.options.gutter"
            size="mini"
            width="156px"
          >
            <template slot="append">
              <span>px</span>
            </template>
          </ht-input>
        </ht-form-item>
        <ht-form-item label-width="65px">
          <template slot="label">
            <el-tooltip
              content="一行被切分为24分栏，通过列配置可以将一行划分为多列，每一列指定包含几个分栏。"
            >
              <i class="property-tip icon-question" />
            </el-tooltip>
            <span>列配置</span>
          </template>
          <draggable
            tag="ul"
            class="column-ul"
            :list="data.columns"
            v-bind="{
              group: {name: 'options'},
              ghostClass: 'ghost',
              handle: '.drag-item'
            }"
            handle=".drag-item"
          >
            <li v-for="(item, index) in data.columns" :key="index">
              <i class="drag-item icon-draggable"></i>
              <ht-input
                size="mini"
                width="130px"
                :min="0"
                :max="24"
                type="number"
                v-model.number="item.span"
              />&nbsp;&nbsp;
              <el-button type="text" @click="handleGridColumnStyle(index)"
                >样式</el-button
              >
              <el-button
                @click="handleGridColumnRemove(index)"
                circle
                plain
                class="grid-remove-button"
                type="danger"
                size="mini"
                icon="el-icon-minus"
              ></el-button>
            </li>
          </draggable>
          <div style="margin-left: 22px">
            <el-button type="text" @click="handleGridColumnAdd"
              >添加一列</el-button
            >
          </div>
        </ht-form-item>
        <ht-form-item label="横向排列" label-width="65px">
          <ht-select
            v-model="data.options.justify"
            :options="[
              {key: 'start', value: '左对齐'},
              {key: 'end', value: '右对齐'},
              {key: 'center', value: '居中'},
              {key: 'space-around', value: '两侧间隔相等'},
              {key: 'space-between', value: '两端对齐'}
            ]"
          />
        </ht-form-item>
        <ht-form-item label="纵向排列" label-width="65px">
          <ht-select
            v-model="data.options.align"
            :options="[
              {key: 'top', value: '顶部对齐'},
              {key: 'middle', value: '居中'},
              {key: 'bottom', value: '底部对齐'}
            ]"
          />
        </ht-form-item>
      </template>
    </div>
    <!--主表table布局配置-->
    <template v-if="data && data.ctrlType == 'table'">
      <!-- ccwgq 2022-06-23 加入 layout 配置控制 -->
      <ht-form-item
        label-width="65px"
        style="display: block; margin-bottom: 12px"
      >
        <span>表格布局属性(lay-out)</span>
        <el-radio-group v-model="data.options.layOut">
          <el-radio-button label="auto">auto</el-radio-button>
          <el-radio-button label="fixed">fixed</el-radio-button>
          <el-radio-button label="inherit">inherit</el-radio-button>
          <el-radio-button label="unset">unset</el-radio-button>
        </el-radio-group>
      </ht-form-item>
      <ht-form-item
        label-width="65px"
        style="display: block; margin-bottom: 0px"
      >
        <span> 行列配置 </span>
      </ht-form-item>
      <ht-form-item label-width="0px">
        <ul class="tableUl">
          <li v-for="(row, rowIndex) in data.rows" :key="rowIndex">
            <span>第{{ rowIndex + 1 }}行：</span>
            <el-tag
              :key="colIndex"
              v-for="(tag, colIndex) in row.cols"
              closable
              :disable-transitions="false"
              @close="handleTableCol(rowIndex, colIndex)"
              >{{ tag.colspan }}</el-tag
            >
            <el-button
              type="primary"
              size="mini"
              class="tableTdAddBt"
              icon="el-icon-plus"
              v-if="tableHasColspan(rowIndex)"
              circle
              @click="tableAddTd(rowIndex)"
              title="添加"
            ></el-button>
          </li>
        </ul>
      </ht-form-item>
      <!-- 追加行 -->
      <ht-form-item label-width="65px">
        <span> 追加到第 </span>
        <ht-input v-model="tableTempAddRowIndex" type="number" /> 行
        <el-button
          type="primary"
          size="mini"
          icon="el-icon-plus"
          circle
          @click="tableOperation('add', 'row')"
          title="添加"
        ></el-button>
      </ht-form-item>
      <!-- 追加列 -->
      <ht-form-item label-width="65px">
        <span> 追加到第 </span>
        <ht-input v-model="tableTempAddColIndex" type="number" /> 列
        <el-button
          type="primary"
          size="mini"
          icon="el-icon-plus"
          circle
          @click="tableOperation('add', 'col')"
          title="添加"
        ></el-button>
      </ht-form-item>
      <!-- 删除行 -->
      <ht-form-item label-width="65px">
        <span> 删 除 第 &ensp;</span>
        <ht-input v-model="tableTempDelRowIndex" type="number" /> 行
        <el-button
          type="danger"
          size="mini"
          icon="el-icon-delete"
          circle
          @click="tableOperation('del', 'row')"
          title="删除"
        ></el-button>
      </ht-form-item>
      <!-- 删除列 -->
      <ht-form-item label-width="65px">
        <span> 删 除 第 &ensp;</span>
        <ht-input v-model="tableTempDelColIndex" type="number" /> 列
        <el-button
          type="danger"
          size="mini"
          icon="el-icon-delete"
          circle
          @click="tableOperation('del', 'col')"
          title="删除"
        ></el-button>
      </ht-form-item>
      <!-- 行高设置 -->
      <ht-form-item
        label-width="65px"
        style="display: block; margin-bottom: 12px"
      >
        <span> 表格行高 </span>
        <ht-input
          size="mini"
          width="90px"
          :min="0"
          type="number"
          v-model="data.options.lineHeight"
        />
        px
      </ht-form-item>
      <!-- 标题设置 -->
      <ht-form-item
        label-width="65px"
        style="display: block; margin-bottom: 12px"
      >
        <span> 标题宽度 </span>
        <ht-input
          size="mini"
          width="90px"
          type="number"
          v-model="data.options.labelWidth"
        />&ensp;
        <el-radio-group v-model="data.options.labelWidthType">
          <el-radio-button label="percent">%</el-radio-button>
          <el-radio-button label="px">px</el-radio-button>
        </el-radio-group>
      </ht-form-item>
      <!-- 边框设置 -->
      <ht-form-item
        label-width="65px"
        style="display: block; margin-bottom: 12px"
      >
        <span> 边框颜色 </span>
        <el-color-picker
          v-model="data.options.borderColor"
          size="mini"
        ></el-color-picker>
      </ht-form-item>
      <ht-form-item
        label-width="65px"
        style="display: block; margin-bottom: 12px"
      >
        <span> 边框宽度 </span>
        <ht-input
          size="mini"
          width="90px"
          :min="0"
          type="number"
          v-model="data.options.borderWidth"
        />
        px
      </ht-form-item>
      <ht-form-item
        label-width="65px"
        style="display: block; margin-bottom: 12px"
      >
        <span> 字体颜色 </span>
        <el-color-picker
          v-model="data.options.fontColor"
          size="mini"
        ></el-color-picker>
      </ht-form-item>
      <ht-form-item
        class="table-switch"
        label-width="65px"
        style="display: block; margin-bottom: 12px"
        v-if="data.options.topLine"
      >
        <span> 是否增加自定义头部行 </span>
        <el-switch
          v-model="data.options.topLine.open"
          :active-value="true"
          :inactive-value="false"
          active-text="增加"
          inactive-text="移除"
        ></el-switch>
      </ht-form-item>
      <div v-show="data.options.topLine.open">
        <ht-form-item
          label-width="65px"
          style="display: block; margin-bottom: 0px"
        >
          <span> 首行配置 </span>
        </ht-form-item>
        <ht-form-item
          class="table-switch"
          label-width="65px"
          style="display: block; margin-bottom: 12px"
        >
          <span> 启用边框 </span>
          <el-switch
            v-model="data.options.topLine.useBorder"
            :active-value="true"
            :inactive-value="false"
            active-text="启用"
            inactive-text="隐藏"
          ></el-switch>
        </ht-form-item>
        <ht-form-item
          label-width="65px"
          style="display: block; margin-bottom: 0px"
        >
          <span> 字体大小 </span>
          <el-input
            v-model="data.options.topLine.fontSize"
            type="text"
          ></el-input>
        </ht-form-item>
        <ht-form-item
          label-width="65px"
          style="display: block; margin-bottom: 0px"
        >
          <span> 字体颜色 </span>
          <el-color-picker
            v-model="data.options.topLine.fontColor"
            size="mini"
          ></el-color-picker>
        </ht-form-item>
        <ht-form-item
          label-width="65px"
          style="display: block; margin-bottom: 0px"
        >
          <span> 文字内容 </span>
          <el-input
            v-model="data.options.topLine.content"
            type="textarea"
            style="height: 50px"
          ></el-input>
        </ht-form-item>
      </div>
      <el-divider></el-divider>
      <ht-form-item
        class="table-switch"
        label-width="65px"
        style="display: block; margin-bottom: 12px; margin-top: 20px"
      >
        <span> 是否增加自定义尾部行 </span>
        <el-switch
          v-model="data.options.bottomLine.open"
          :active-value="true"
          :inactive-value="false"
          active-text="增加"
          inactive-text="移除"
        ></el-switch>
      </ht-form-item>
      <div v-show="data.options.bottomLine.open">
        <ht-form-item
          label-width="65px"
          style="display: block; margin-bottom: 0px"
        >
          <span> 尾行配置 </span>
        </ht-form-item>
        <ht-form-item
          class="table-switch"
          label-width="65px"
          style="display: block; margin-bottom: 12px"
        >
          <span> 启用边框 </span>
          <el-switch
            v-model="data.options.bottomLine.useBorder"
            :active-value="true"
            :inactive-value="false"
            active-text="启用"
            inactive-text="隐藏"
          ></el-switch>
        </ht-form-item>
        <ht-form-item
          label-width="65px"
          style="display: block; margin-bottom: 0px"
        >
          <span> 字体大小 </span>
          <el-input
            v-model="data.options.bottomLine.fontSize"
            type="text"
          ></el-input>
        </ht-form-item>
        <ht-form-item
          label-width="65px"
          style="display: block; margin-bottom: 0px"
        >
          <span> 字体颜色 </span>
          <el-color-picker
            v-model="data.options.bottomLine.fontColor"
            size="mini"
          ></el-color-picker>
        </ht-form-item>
        <ht-form-item
          label-width="65px"
          style="display: block; margin-bottom: 0px"
        >
          <span> 文字内容 </span>
          <el-input
            v-model="data.options.bottomLine.content"
            type="textarea"
            style="height: 50px"
          ></el-input>
        </ht-form-item>
      </div>
      <!-- <ht-form-item label="横向排列" label-width="65px">
        <ht-select
          v-model="data.options.justify"
          :options="[
            { key: 'start', value: '左对齐' },
            { key: 'end', value: '右对齐' },
            { key: 'center', value: '居中' },
            { key: 'space-around', value: '两侧间隔相等' },
            { key: 'space-between', value: '两端对齐' }
          ]"
        />
      </ht-form-item>-->
      <!-- <ht-form-item label="纵向排列" label-width="65px">
        <ht-select
          v-model="data.options.align"
          :options="[
            { key: 'top', value: '顶部对齐' },
            { key: 'middle', value: '居中' },
            { key: 'bottom', value: '底部对齐' }
          ]"
        />
      </ht-form-item>-->
    </template>

    <!--table选项卡配置-->
    <template v-else-if="data && data.ctrlType == 'tab'">
      <ht-form-item label-width label="风格类型">
        <el-radio-group v-model="data.options.type">
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
      <ht-form-item label-width>
        <ht-checkbox
          v-model="data.options.nextCheck"
          :options="[{key: 'true', value: '页签、切换前是否校验当前页'}]"
        />
      </ht-form-item>
      <ht-form-item label-width label="标签配置项">
        <form-tabs-dialog
          ref="FormtbsDialog"
          :data="data"
          :tablefields="tablefields"
        />
        <draggable
          tag="ul"
          class="column-ul"
          :list="data.columns"
          v-bind="{
            group: {name: 'options'},
            ghostClass: 'ghost',
            handle: '.drag-item'
          }"
          handle=".drag-item"
        >
          <li v-for="(item, index) in data.columns" :key="index">
            <i class="drag-item icon-draggable"></i>
            <ht-input size="mini" width="130px" v-model="item.span" />
            <el-button
              @click="openFormtbsDialog(index)"
              circle
              plain
              class="grid-remove-button"
              type="danger"
              size="mini"
              icon="el-icon-edit"
            ></el-button>
            <el-button
              @click="handleGridColumnRemove(index)"
              circle
              plain
              type="danger"
              size="mini"
              icon="el-icon-minus"
            ></el-button>
          </li>
        </draggable>
        <div style="margin-left: 22px">
          <el-button type="text" @click="handleGridColumnAdd('tab')"
            >添加标签</el-button
          >
        </div>
      </ht-form-item>
    </template>

    <!--分页配置-->

    <template v-else-if="data && data.ctrlType == 'page'">
      <h3>无内容</h3>
    </template>
    <!--分页步骤条-->
    <template v-else-if="data && data.ctrlType == 'pageSteps'">
      <ht-form-item label-width label="是否显示分页步骤条">
        <el-switch
          v-model="data.isShow"
          active-color="#13ce66"
          inactive-color="#ff4949"
        ></el-switch>
      </ht-form-item>
      <ht-form-item label-width label="分页步骤名配置">
        <li v-for="(item, index) in data.pageStepsArr" :key="index">
          <i class="drag-item icon-draggable"></i>
          <ht-input
            size="mini"
            width="130px"
            v-model="item.name"
            :maxlength="8"
            show-word-limit
          />
        </li>
      </ht-form-item>
    </template>

    <!--分页按钮配置-->
    <template v-else-if="data && data.ctrlType == 'pageButton'">
      <h1>分页按钮配置:</h1>
      <h3>下一步按钮配置:</h3>
      <ht-form-item label-width label="按钮名">
        <ht-input
          v-model="data.nextButton.name"
          :maxlength="6"
          show-word-limit
        />
      </ht-form-item>

      <ht-form-item label-width label="按钮图标">
        <div style="float: right; margin-right: 15px">
          <IconDialog @selected="pegeNextIcon" />
        </div>
      </ht-form-item>
      <ht-form-item label-width label="按钮颜色">
        <div style="height: 0px; margin-top: 10px; margin-bottom: 20px">
          <el-color-picker
            v-model="data.nextButton.color"
            size="mini"
          ></el-color-picker>
        </div>
      </ht-form-item>
      <!-- <ht-form-item label-width label="按钮前置脚本">
        <ht-input v-model="data.nextButton.preScript" />
        <el-button class="btn-padding" icon="el-icon-plus" @click="autoRunJSScript(1,true)">设置自定义脚本</el-button>
      </ht-form-item>
      <ht-form-item label-width label="按钮后置脚本">
        <ht-input v-model="data.nextButton.rearScript" />
      </ht-form-item>-->
      <h3>上一步按钮配置:</h3>
      <ht-form-item label-width label="按钮名">
        <ht-input
          v-model="data.backButton.name"
          :maxlength="6"
          show-word-limit
        />
      </ht-form-item>

      <ht-form-item label-width label="按钮图标">
        <div style="float: right; margin-right: 15px">
          <IconDialog @selected="pegeBackIcon" />
        </div>
      </ht-form-item>
      <ht-form-item label-width label="按钮颜色">
        <div style="height: 0px; margin-top: 10px; margin-bottom: 20px">
          <el-color-picker
            v-model="data.backButton.color"
            size="mini"
          ></el-color-picker>
        </div>
      </ht-form-item>
      <el-dialog
        title="按钮脚本"
        :visible.sync="pageBtnScriptDialog"
        append-to-body
        class="urgent-text"
        :before-close="pageBtnScriptDialogOk"
        :close-on-click-modal="false"
        width="600px"
      >
        <el-row style="height: 100%">
          <textarea
            v-model="pageBtnScriptBase"
            type="textarea"
            rows="30"
            autocomplete="off"
            ref="scriptText"
            style="width: 99%; height: 100%"
          ></textarea>
        </el-row>
        <div slot="footer" class="dialog-footer">
          <el-button @click="pageBtnScriptDialogClose">取 消</el-button>
          <el-button type="primary" @click="pageBtnScriptDialogOk"
            >确 定</el-button
          >
        </div>
      </el-dialog>
    </template>

    <!--折叠面板配置-->
    <template v-else-if="data && data.ctrlType == 'accordion'">
      <ht-form-item label-width label="折叠面板配置">
        <!--<ht-checkbox v-model="data.options.accordion" :options="[{key: 'true', value: '是否手风琴模式'}]" />-->
        <ht-checkbox
          v-model="data.options.nextCheck"
          :options="[{key: 'true', value: '面板、折叠前是否校验当前面板'}]"
        />
      </ht-form-item>

      <ht-form-item label-width label="面板配置">
        <draggable
          tag="ul"
          class="column-ul"
          :list="data.columns"
          v-bind="{
            group: {name: 'options'},
            ghostClass: 'ghost',
            handle: '.drag-item'
          }"
          handle=".drag-item"
        >
          <li v-for="(item, index) in data.columns" :key="index">
            <i class="drag-item icon-draggable"></i>
            <ht-input size="mini" width="130px" v-model="item.span" />
            <el-switch
              v-model="item.isOpen"
              @change="switchChange(item)"
              active-text="是否展开"
              inactive-value="false"
              active-value="true"
              style="margin-left: 10px"
            ></el-switch>
            <el-button
              @click="handleGridColumnRemove(index)"
              style="margin-left: 10px"
              circle
              plain
              class="grid-remove-button"
              type="danger"
              size="mini"
              icon="el-icon-minus"
            ></el-button>
          </li>
        </draggable>
        <div style="margin-left: 22px">
          <el-button type="text" @click="handleGridColumnAdd('collapse')"
            >添加面板</el-button
          >
        </div>
      </ht-form-item>
    </template>

    <!--子表配置-->
    <template
      v-else-if="
        data &&
          (data.ctrlType == 'subtable' ||
            data.ctrlType == 'subDiv' ||
            data.ctrlType == 'hottable')
      "
    >
      <ht-form-item label-width label="绑定子表">
        <ht-select
          filterable
          v-model="data.options.boSubEntity"
          :options="subTables"
          :props="{key: 'name', value: 'desc'}"
          @change="subTableChange"
        ></ht-select>
      </ht-form-item>
      <ht-form-item label-width label="子表标题">
        <ht-input v-model="data.desc" style="width: 215px">
          <el-button
            icon="el-icon-search"
            slot="append"
            @click="editI18nMessage"
            >国际化</el-button
          >
        </ht-input>
      </ht-form-item>
      <ht-form-item label-width label="子表布局">
        <ht-select
          v-model="data.ctrlType"
          @change="subChange"
          :options="[
            {key: 'subtable', value: '子表'},
            {key: 'subDiv', value: 'DIV子表'}
          ]"
        ></ht-select>
      </ht-form-item>
      <ht-form-item
        label-width
        label="最大行数"
        v-if="
          data.ctrlType !== 'hottable' && data.options.relation == 'onetomany'
        "
      >
        <el-tooltip
          class="item"
          effect="dark"
          content="0为无限制"
          placement="top-start"
        >
          <i class="el-icon-info"></i>
        </el-tooltip>
        <ht-input
          v-model="data.options.maxRow"
          type="number"
          :min="0"
        ></ht-input>
      </ht-form-item>
      <el-divider>
        <span>表头设置</span>
      </el-divider>
      <!-- header height setting -->
      <ht-form-item class="table-switch" label-width label="子表头部高度">
        <ht-input
          size="mini"
          width="100px"
          v-model="data.options.headHeight"
          type="number"
        >
        </ht-input
        >&ensp;
        <el-radio-group size="mini" v-model="data.options.headHeightUnit">
          <el-radio-button label="pt">pt</el-radio-button>
          <el-radio-button label="px">px</el-radio-button>
          <el-radio-button label="rem">rem</el-radio-button>
        </el-radio-group>
      </ht-form-item>
      <!-- header line-height setting -->
      <ht-form-item class="table-switch" label-width label="子表头部行高">
        <ht-input
          size="mini"
          width="100px"
          v-model="data.options.headLineHeight"
          type="number"
        >
        </ht-input
        >&ensp;
        <el-radio-group size="mini" v-model="data.options.headLineHeightUnit">
          <el-radio-button label="pt">pt</el-radio-button>
          <el-radio-button label="px">px</el-radio-button>
          <el-radio-button label="rem">rem</el-radio-button>
        </el-radio-group>
      </ht-form-item>
      <ht-form-item class="table-switch" label-width label="子表头部计数">
        <el-switch
          v-model="data.options.counter"
          :active-value="true"
          :inactive-value="false"
          active-text="打开"
          inactive-text="关闭"
        ></el-switch>
      </ht-form-item>
      <ht-form-item label-width label="子表头部背景">
        <el-color-picker
          v-model="data.options.bgColor"
          size="mini"
        ></el-color-picker>
      </ht-form-item>
      <ht-form-item label-width label="子表头部字体颜色">
        <el-color-picker
          v-model="data.options.fontColor"
          size="mini"
        ></el-color-picker>
      </ht-form-item>
      <ht-form-item class="table-switch" label="子表头部分割线">
        <el-switch
          v-model="data.options.showDivider"
          :active-value="true"
          :inactive-value="false"
          active-text="启用"
          inactive-text="关闭"
        ></el-switch>
      </ht-form-item>
      <div v-if="data.options.showDivider">
      <ht-form-item label="分割内容位置">
        <el-radio-group v-model="data.options.dividerPosition">
          <el-radio label="left">left</el-radio>
          <el-radio label="center">center</el-radio>
          <el-radio label="right">right</el-radio>
        </el-radio-group>
      </ht-form-item>
      <ht-form-item label="分割内容描述">
        <el-input
          v-model="data.options.dividerDesc"
          type="text"
          size="mini"
        ></el-input>
      </ht-form-item>
      <ht-form-item class="table-switch" label="分割线逻辑下标">
        <el-switch
          v-model="data.options.useDividerIndex"
          :active-value="true"
          :inactive-value="false"
          active-text="启用"
          inactive-text="关闭"
        ></el-switch>
      </ht-form-item>
      </div>
      <!-- <el-divider>子表背景交叉</el-divider>
      <ht-form-item class="table-switch" label="启用背景交叉?">
        <el-switch
          v-model="data.options.crossBgColor"
          :active-value="true"
          :inactive-value="false"
          active-text="是"
          inactive-text="否"
        ></el-switch>
      </ht-form-item>
      <ht-form-item class="table-switch" label="交叉刻度">
        <el-input-number
          v-model="data.options.crossCount"
          size="mini"
        ></el-input-number>
      </ht-form-item>
      <el-button
        type="primary"
        v-if="data.options.crossBgColor"
        size="mini"
        :disabled="
          !Array.isArray(data.options.bgColorList) ||
            data.options.bgColorList.length >= data.options.crossCount
        "
        @click="addSubBgColorList"
        >新增</el-button
      >
      <el-table
        :data="data.options.bgColorList"
        v-if="data.options.crossBgColor"
      >
        <el-table-column label="序号" type="index"></el-table-column>
        <el-table-column label="背景色">
          <template slot-scope="scope">
            <el-color-picker v-model="scope.row"></el-color-picker>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <div>
              <el-button
                type="text"
                style="color:red;"
                size="mini"
                @click="delSubBgColorList(scope.$index)"
                >删除</el-button
              >
            </div>
          </template>
        </el-table-column>
      </el-table> -->
      <br />
      <ht-form-item label-width class="table-switch" label="子表头部字体大小">
        <ht-input
          v-model="data.options.fontSize"
          size="mini"
          width="90px"
          type="number"
        ></ht-input
        >&ensp;
        <el-radio-group size="mini" v-model="data.options.fontUnit">
          <el-radio-button label="pt">pt</el-radio-button>
          <el-radio-button label="px">px</el-radio-button>
          <el-radio-button label="rem">rem</el-radio-button>
        </el-radio-group>
      </ht-form-item>
      <br />
      <!-- 下拉框动态查询绑定关联查询 -->
      <el-button
        style="width: 100%; margin-left: 0px !important; margin-bottom: 5px"
        class="custDialog-btn"
        icon="icon-list2"
        v-show="data.customQuery && data.customQuery.isUse"
        size="mini"
        @click="showSelectQueryDialog"
        >绑定关联查询回填子表</el-button
      >
      <el-dialog
        title="子表添加关联查询阿"
        width="60%"
        append-to-body
        top="8vh"
        :visible.sync="selectQueryDialog"
        :close-on-click-modal="false"
      >
        <el-tag type="warning"
          >子表回填：展示子表回填中设置的其他返回值(子表无返回值对应字段)</el-tag
        >
        <div
          style="width: 100%; height: 550px; overflow: auto"
          v-if="data.customQuery && data.customQuery.alias"
        >
          <table
            class="form-table choiceType-table"
            style="margin-bottom: 1px"
            cellspacing="0"
            cellpadding="0"
            border="0"
          >
            <tbody>
              <tr>
                <th width="110px">关联查询:</th>
                <td>
                  <ht-select
                    clearable
                    filterable
                    @change="setSelectQuery(data.customQuery.alias)"
                    v-model="data.customQuery.alias"
                    :options="customQuerys"
                    :props="{key: 'alias', value: 'name'}"
                  />
                </td>
              </tr>
            </tbody>
          </table>
          <el-tabs type="border-card" style="margin-bottom: 20px">
            <el-tab-pane label="参数绑定">
              <table
                class="form-table choiceType-table"
                cellspacing="0"
                cellpadding="0"
                border="0"
              >
                <tbody>
                  <tr
                    v-for="(bind, indexBind) in data.customQuery.conditionfield"
                    :key="indexBind"
                  >
                    <th width="110px">{{ bind.comment }}:</th>
                    <td>
                      <ht-select
                        validate="required"
                        v-model="bind.fieldPath"
                        :options="subTableEnt"
                        :props="{key: 'name', value: 'desc'}"
                        filterable
                      >
                        <template slot-scope="{options, propKey, propValue}">
                          <el-option-group
                            v-for="group in options"
                            :key="group.name"
                            :label="group.desc"
                          >
                            <el-option
                              v-for="item in group.children.filter(obj => {
                                return filterFields(obj)
                              })"
                              :key="item[propKey]"
                              :label="item[propValue]"
                              :value="item[propKey]"
                            ></el-option>
                          </el-option-group>
                        </template>
                      </ht-select>
                    </td>
                  </tr>
                </tbody>
              </table>
            </el-tab-pane>
            <el-tab-pane label="设置返回值">
              <table
                class="form-table choiceType-table"
                cellspacing="0"
                cellpadding="0"
                border="0"
              >
                <tbody>
                  <tr
                    v-for="(bind, indexBind) in data.customQuery.resultfield"
                    :key="indexBind"
                  >
                    <th width="110px">{{ bind.comment }}:</th>
                    <td>
                      <ht-select
                        validate="required"
                        v-model="bind.fieldPath"
                        :options="data.list"
                        :props="{key: 'name', value: 'desc'}"
                        filterable
                      ></ht-select>
                    </td>
                  </tr>
                </tbody>
              </table>
            </el-tab-pane>
          </el-tabs>
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button
            type="primary"
            @click="selectQueryDialog = false"
            size="small"
            >保存</el-button
          >
          <el-button type="primary" @click="closeQueryDialog" size="small"
            >清空</el-button
          >
        </div>
      </el-dialog>

      <div v-if="data.ctrlType == 'hottable'" style="margin-bottom: 10px">
        <el-checkbox v-model="data.showTitle">显示标题</el-checkbox>
      </div>
      <el-button
        icon="icon-technology"
        v-if="data.ctrlType != 'hottable'"
        size="mini"
        @click="includdingFile"
        >自定义表头</el-button
      >
      <!-- <el-button v-if="data.ctrlType != 'hottable'" @click="addRelation">添加关联关系</el-button> -->
      <el-row class="hottable_btn_row" v-if="data.ctrlType == 'hottable'">
        <el-button v-if="data.ctrlType == 'hottable'" @click="setColHeader"
          >设置表头</el-button
        >
        <el-button v-if="data.ctrlType == 'hottable'" @click="setCrossMapping"
          >跨表取数</el-button
        >
        <el-button v-if="data.ctrlType == 'hottable'" @click="setNestedHeaders"
          >嵌套表头</el-button
        >
      </el-row>
      <el-row class="hottable_btn_row" v-if="data.ctrlType == 'hottable'">
        <el-button v-if="data.ctrlType == 'hottable'" @click="setMainTableCalc"
          >主表汇总</el-button
        >
        <el-button v-if="data.ctrlType == 'hottable'" @click="setCellCalc"
          >单元格计算</el-button
        >
      </el-row>

      <div style="margin-top: 10px; margin-bottom: 10px">
        <!--        <el-tooltip content="需先配置自定义对话框，实现效果：配置子表回填后会在子表上显示配置的按钮，点击后弹出对话框，选择数据将已选数据回填到子表中。">-->
        <!--          <i class="property-tip icon-question" />-->
        <!--        </el-tooltip>-->
        <el-checkbox
          v-if="
            data.options.relation == 'onetomany' && data.ctrlType != 'subDiv'
          "
          v-model="data.subtablePagination"
          >前端分页</el-checkbox
        >
      </div>
      <div
        style="margin-top: 10px; margin-bottom: 10px"
        v-if="data.subtablePagination && formType == 'pc'"
      >
        <el-tooltip
          content="勾选时支持对子表进行前端的导入/导出（即：导入/导出均在浏览器端进行，用户不提交时数据不会保存到后台）。"
        >
          <i class="property-tip icon-question" />
        </el-tooltip>
        <el-checkbox v-model="data.subtableImportExport"
          >子表导入/导出</el-checkbox
        >
        <el-button
          type="primary"
          v-if="data.subtableImportExport"
          class="subimport-mergedialog_button"
          plain
          @click="openSubImportMergeDialog"
          >子表数据合并</el-button
        >

        <sub-import-merge-dialog
          v-if="data.subtableImportExport"
          ref="subImportMergeDialog"
          @updateExpression="handleUpdateExpression"
          :expression="data.subtableImportMergeExp"
        ></sub-import-merge-dialog>
      </div>
      <div style="margin-top: 10px; margin-bottom: 10px">
        <el-tooltip
          content="需先配置自定义对话框，实现效果：配置子表回填后会在子表上显示配置的按钮，点击后弹出对话框，选择数据将已选数据回填到子表中。"
        >
          <i class="property-tip icon-question" />
        </el-tooltip>
        <el-checkbox v-model="data.subtableBackfill">子表回填</el-checkbox>
        <el-checkbox
          v-model="data.initTemplateData"
          v-if="data.subtableBackfill"
          >数据初始化</el-checkbox
        >
      </div>
      <div
        style="margin-top: 10px; margin-bottom: 10px"
        v-if="
          (data.subtableBackfill && data.initTemplateData) ||
            data.ctrlType == 'hottable'
        "
      >
        <el-tooltip content="当填单用户需要手动追加多份初始化回填数据时配置。">
          <i class="property-tip icon-question" />
        </el-tooltip>
        <el-checkbox
          v-model="data.addInitTemplateData"
          v-if="data.subtableBackfill && data.initTemplateData"
          >追加初始化</el-checkbox
        >
        <el-checkbox
          v-if="data.ctrlType == 'hottable'"
          v-model="data.initSumRow"
          >初始化统计行</el-checkbox
        >
      </div>
      <ht-form-item
        v-if="data.initTemplateData"
        label-width="100px"
        label="初始化类型"
      >
        <el-radio-group v-model="data.initTemplateDataType">
          <el-radio-button label="empty">数据为空</el-radio-button>
          <el-radio-button label="add">数据追加</el-radio-button>
          <el-radio-button label="cover">数据覆盖</el-radio-button>
        </el-radio-group>
      </ht-form-item>
      <ht-form-item
        v-if="data.initSumRow"
        label-width="120px"
        label="统计行标签字段"
      >
        <ht-select
          v-model="data.options.initSumRowField"
          :options="
            subTables.filter(item => item.name === data.options.boSubEntity)
          "
          :props="{key: 'name', value: 'desc'}"
          clearable
          filterable
        >
          <template slot-scope="{options}">
            <el-option-group
              v-for="(group, idenx) in options"
              :key="idenx"
              :label="group.desc"
            >
              <el-option
                v-for="item in group.children"
                :key="item.id"
                :label="item.desc"
                :value="item.name"
              ></el-option>
            </el-option-group>
          </template>
        </ht-select>
      </ht-form-item>
      <ht-form-item
        v-if="data.initSumRow"
        label-width="100px"
        label="统计行标签值"
      >
        <el-input
          v-model="data.options.initSumRowValue"
          placeholder="统计行标签字段值"
        />
      </ht-form-item>
      <ht-form-item
        v-if="data.initTemplateData && data.addInitTemplateData"
        label-width="100px"
        label="追加按钮名称"
      >
        <el-input
          v-model="data.addInitBtnName"
          placeholder="追加初始化数据按钮名称"
        />
      </ht-form-item>
      <ht-load-data
        url="/form/customDialog/v1/getAll"
        requestMethod="post"
        context="form"
        @after-load-data="afterCustomDialogLoadData"
      ></ht-load-data>
      <ht-form-item
        v-if="data.ctrlType == 'hottable'"
        label-width="100px"
        class="customQuery-inputs custDialog-item"
      >
        <template slot="label">
          <el-tooltip content="可见区域百分比">
            <i class="property-tip icon-question" />
          </el-tooltip>
          <span>控件高度</span>
        </template>
        <ht-input
          size="mini"
          width="130px"
          :min="5"
          type="number"
          v-model="data.options.height"
        />vh
      </ht-form-item>
      <div
        v-if="
          data.ctrlType == 'hottable' ||
            data.ctrlType == 'subtable' ||
            data.ctrlType == 'subDiv'
        "
        class="custDialog-div"
      >
        <el-button
          class="custDialog-btn"
          icon="icon-list2"
          size="mini"
          @click="custOrgClick"
          >设置自动回填</el-button
        >
      </div>
      <span v-if="data.subtableBackfill">
        <div class="custDialog-div">
          <el-button
            class="custDialog-btn"
            v-if="data.customDialogjson.custDialog.alias"
            icon="icon-list2"
            size="mini"
            @click="custDialogClick"
            >设置返回值</el-button
          >
        </div>
        <ht-form-item
          label-width="100px"
          class="customQuery-inputs custDialog-item"
        >
          <template slot="label">
            <el-tooltip content="所选择的自定义查询作为选项时的绑定">
              <i class="property-tip icon-question" />
            </el-tooltip>
            <span>选择对话框</span>
          </template>
          <ht-select
            clearable
            filterable
            @change="changeCustDialog"
            v-model="data.customDialogjson.custDialog.alias"
            :options="customDialogs"
            :props="{key: 'alias', value: 'name'}"
          />
        </ht-form-item>
        <!-- 参数绑定 -->
        <div
          class="basics-property"
          v-if="
            data.customDialogjson.custDialog.conditions &&
              data.customDialogjson.custDialog.conditions.length > 0
          "
        >
          <ht-form-item>
            <template slot="label">
              <el-tooltip content="自定义对话框需要的参数传入">
                <i class="property-tip icon-question" />
              </el-tooltip>
              <span>参数绑定</span>
            </template>
          </ht-form-item>
        </div>
        <table
          v-if="
            data.customDialogjson.custDialog.conditions &&
              data.customDialogjson.custDialog.conditions.length > 0
          "
          class="form-table custDialog-table"
          cellspacing="0"
          cellpadding="0"
          border="0"
        >
          <tbody>
            <tr class="linkageTable-tr">
              <td width="100px;">参数名</td>
              <td>取值对象</td>
              <!-- <td>默认值</td> -->
            </tr>
            <tr
              class="linkageTable-tr"
              v-for="(condition, indexCondition) in data.customDialogjson
                .custDialog.conditions"
              :key="indexCondition"
            >
              <td>{{ condition.comment }}</td>
              <td>
                <ht-select
                  validate="required"
                  v-model="condition.bind"
                  :options="tablefields.filter(tab => tab.type == 'main')"
                  :props="{key: 'name', value: 'desc'}"
                  :clearable="true"
                  filterable
                >
                  <template slot-scope="{options}">
                    <el-option-group
                      v-for="group in options"
                      :key="group.name"
                      :label="group.desc"
                    >
                      <el-option
                        v-for="item in group.children"
                        :key="item.id"
                        :label="item.desc"
                        :value="'data.' + item.path + '.' + item.name"
                      ></el-option>
                    </el-option-group>
                  </template>
                </ht-select>
              </td>
            </tr>
          </tbody>
        </table>
        <ht-form-item
          label="按钮名称"
          label-width="100px"
          class="customQuery-inputs custDialog-item"
        >
          <ht-input v-model="data.customDialogjson.name"></ht-input>
        </ht-form-item>

        <div class="custDialog-div">
          <span>按钮图标</span>
          <div style="float: right; margin-right: 15px">
            <IconDialog @selected="icons" />
          </div>
          <i
            :class="this.data.customDialogjson.icon"
            style="float: right; line-height: 28px"
          ></i>
        </div>
      </span>
      <el-dialog
        title="设置子表对话框返回值"
        :visible.sync="dialogcustDialogVisible"
        append-to-body
        class="urgent-text"
        :close-on-click-modal="false"
        width="600px"
      >
        <table class="form-table" cellspacing="0" cellpadding="0" border="0">
          <tbody>
            <tr class="linkageTable-tr">
              <td width="150px">返回结果字段</td>
              <td width="220px">绑定显示的属性</td>
              <td width="80px">解除绑定</td>
            </tr>

            <tr
              class="linkageTable-tr"
              v-for="(field, index) in this.data.customDialogjson.resultField"
              :key="index"
            >
              <td>{{ field.comment }}</td>
              <td>
                <ht-select
                  v-model="custDialogprop[field.comment]"
                  :options="
                    subTables.filter(
                      item => item.name === data.options.boSubEntity
                    )
                  "
                  :props="{key: 'name', value: 'desc'}"
                  clearable
                  filterable
                >
                  <template slot-scope="{options}">
                    <el-option-group
                      v-for="(group, idenx) in options"
                      :key="idenx"
                      :label="group.desc"
                    >
                      <el-option
                        v-for="item in group.children"
                        :key="item.id"
                        :label="item.desc"
                        :value="item.path + '.' + item.name"
                      ></el-option>
                    </el-option-group>
                  </template>
                </ht-select>
              </td>
              <td>
                <el-button
                  icon="el-icon-delete"
                  @click="unbind(field.comment)"
                ></el-button>
              </td>
            </tr>
          </tbody>
        </table>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="custDialogOk">确 定</el-button>
          <el-button @click="dialogcustDialogVisible = false">取 消</el-button>
        </div>
      </el-dialog>

      <i18n-message-edit
        ref="i18nMessageEdit"
        :messageKey="i18nMessageKey"
        @after-save="afterSaveI18n"
      />
    </template>

    <!-- 孙表 -->
    <template
      v-else-if="
        data && (data.ctrlType == 'suntable' || data.ctrlType == 'sunDiv')
      "
    >
      <el-dialog
        title="设置孙表对话框返回值"
        :visible.sync="dialogSunDialog"
        append-to-body
        class="urgent-text"
        :close-on-click-modal="false"
        width="600px"
      >
        <table class="form-table" cellspacing="0" cellpadding="0" border="0">
          <tbody>
            <tr class="linkageTable-tr">
              <td width="150px">返回结果字段</td>
              <td width="220px">绑定显示的属性</td>
              <td width="80px">解除绑定</td>
            </tr>

            <tr
              class="linkageTable-tr"
              v-for="(field, index) in this.data.customDialogjson.resultField"
              :key="index"
            >
              <td>{{ field.comment }}</td>
              <td>
                <ht-select
                  v-model="custDialogprop[field.comment]"
                  :options="
                    sunTables.filter(
                      item => item.name === data.options.boSubEntity
                    )
                  "
                  :props="{key: 'name', value: 'desc'}"
                  clearable
                  filterable
                >
                  <template slot-scope="{options}">
                    <el-option-group
                      v-for="(group, idenx) in options"
                      :key="idenx"
                      :label="group.desc"
                    >
                      <el-option
                        v-for="item in group.children"
                        :key="item.id"
                        :label="item.desc"
                        :value="item.path + '.' + item.name"
                      ></el-option>
                    </el-option-group>
                  </template>
                </ht-select>
              </td>
              <td>
                <el-button
                  icon="el-icon-delete"
                  @click="unbind(field.comment)"
                ></el-button>
              </td>
            </tr>
          </tbody>
        </table>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="custDialogSunOk">确 定</el-button>
          <el-button @click="dialogSunDialog = false">取 消</el-button>
        </div>
      </el-dialog>
      <ht-form-item label-width label="绑定孙表">
        <ht-select
          filterable
          v-model="data.options.boSubEntity"
          :options="sunTables"
          :props="{key: 'name', value: 'desc'}"
          @change="subTableChange"
        ></ht-select>
      </ht-form-item>
      <ht-form-item label-width label="孙表标题">
        <ht-input v-model="data.desc" style="width: 215px">
          <el-button
            icon="el-icon-search"
            slot="append"
            @click="editI18nMessage"
            >国际化</el-button
          >
        </ht-input>
      </ht-form-item>
      <ht-form-item label-width label="孙表布局">
        <ht-select
          v-model="data.ctrlType"
          @change="subChange"
          :options="[
            {key: 'suntable', value: '孙表'},
            {key: 'sunDiv', value: 'DIV孙表'}
          ]"
        ></ht-select>
      </ht-form-item>
      <ht-form-item
        label-width
        label="最大行数"
        v-if="
          data.ctrlType !== 'hottable' && data.options.relation == 'onetomany'
        "
      >
        <el-tooltip
          class="item"
          effect="dark"
          content="0为无限制"
          placement="top-start"
        >
          <i class="el-icon-info"></i>
        </el-tooltip>
        <ht-input
          v-model="data.options.maxRow"
          type="number"
          :min="0"
        ></ht-input>
      </ht-form-item>
      <el-divider>
        <span>表头设置</span>
      </el-divider>
      <!-- header height setting -->
      <ht-form-item class="table-switch" label-width label="孙表头部高度">
        <ht-input
          size="mini"
          width="100px"
          v-model="data.options.headHeight"
          type="number"
        >
        </ht-input
        >&ensp;
        <el-radio-group size="mini" v-model="data.options.headHeightUnit">
          <el-radio-button label="pt">pt</el-radio-button>
          <el-radio-button label="px">px</el-radio-button>
          <el-radio-button label="rem">rem</el-radio-button>
        </el-radio-group>
      </ht-form-item>
      <!-- header line-height setting -->
      <ht-form-item class="table-switch" label-width label="孙表头部行高">
        <ht-input
          size="mini"
          width="100px"
          v-model="data.options.headLineHeight"
          type="number"
        >
        </ht-input
        >&ensp;
        <el-radio-group size="mini" v-model="data.options.headLineHeightUnit">
          <el-radio-button label="pt">pt</el-radio-button>
          <el-radio-button label="px">px</el-radio-button>
          <el-radio-button label="rem">rem</el-radio-button>
        </el-radio-group>
      </ht-form-item>
      <ht-form-item class="table-switch" label-width label="孙表头部计数">
        <el-switch
          v-model="data.options.counter"
          :active-value="true"
          :inactive-value="false"
          active-text="打开"
          inactive-text="关闭"
        ></el-switch>
      </ht-form-item>
      <ht-form-item label-width label="孙表头部背景">
        <el-color-picker
          v-model="data.options.bgColor"
          size="mini"
        ></el-color-picker>
      </ht-form-item>
      <ht-form-item label-width label="孙表头部字体颜色">
        <el-color-picker
          v-model="data.options.fontColor"
          size="mini"
        ></el-color-picker>
      </ht-form-item>
      <br />
      <ht-form-item label-width label="孙表头部字体大小">
        <ht-input
          v-model="data.options.fontSize"
          size="mini"
          width="90px"
          type="number"
        ></ht-input
        >&ensp;
        <el-radio-group size="mini" v-model="data.options.fontUnit">
          <el-radio-button label="pt">pt</el-radio-button>
          <el-radio-button label="px">px</el-radio-button>
          <el-radio-button label="rem">rem</el-radio-button>
        </el-radio-group>
      </ht-form-item>
      <ht-form-item class="table-switch" label="孙表头部分割线">
        <el-switch
          v-model="data.options.showDivider"
          :active-value="true"
          :inactive-value="false"
          active-text="启用"
          inactive-text="关闭"
        ></el-switch>
      </ht-form-item>
      <div v-if="data.options.showDivider">
      <ht-form-item label="分割内容位置">
        <el-radio-group v-model="data.options.dividerPosition">
          <el-radio label="left">left</el-radio>
          <el-radio label="center">center</el-radio>
          <el-radio label="right">right</el-radio>
        </el-radio-group>
      </ht-form-item>
      <ht-form-item label="分割内容描述">
        <el-input
          v-model="data.options.dividerDesc"
          type="text"
          size="mini"
        ></el-input>
      </ht-form-item>
      <ht-form-item class="table-switch" label="分割线逻辑下标">
        <el-switch
          v-model="data.options.useDividerIndex"
          :active-value="true"
          :inactive-value="false"
          active-text="启用"
          inactive-text="关闭"
        ></el-switch>
      </ht-form-item>
      </div>
      <el-button icon="icon-technology" size="mini" @click="includdingFile"
        >自定义表头</el-button
      >
      <div style="margin-top: 10px; margin-bottom: 10px">
        <el-checkbox v-model="data.subtableBackfill">孙表回填</el-checkbox>
        <el-tooltip
          content="需先配置自定义对话框，实现效果：配置孙表回填后会在孙表上显示配置的按钮，点击后弹出对话框，选择数据将已选数据回填到孙表中。"
        >
          <i class="property-tip icon-question" />
        </el-tooltip>
      </div>
      <ht-load-data
        url="/form/customDialog/v1/getAll"
        requestMethod="post"
        context="form"
        @after-load-data="afterCustomDialogLoadData"
      ></ht-load-data>
      <span v-if="data.subtableBackfill">
        <div class="custDialog-div">
          <el-button
            class="custDialog-btn"
            v-if="data.customDialogjson.custDialog.alias"
            icon="icon-list2"
            size="mini"
            @click="custDialogSunClick"
            >设置返回值</el-button
          >
        </div>

        <ht-form-item
          label-width="100px"
          class="customQuery-inputs custDialog-item"
        >
          <template slot="label">
            <el-tooltip content="所选择的自定义查询作为选项时的绑定">
              <i class="property-tip icon-question" />
            </el-tooltip>
            <span>选择对话框</span>
          </template>
          <ht-select
            clearable
            filterable
            @change="changeCustDialog"
            v-model="data.customDialogjson.custDialog.alias"
            :options="customDialogs"
            :props="{key: 'alias', value: 'name'}"
          />
        </ht-form-item>

        <ht-form-item
          label="按钮名称"
          label-width="100px"
          class="customQuery-inputs custDialog-item"
        >
          <ht-input v-model="data.customDialogjson.name"></ht-input>
        </ht-form-item>

        <div class="custDialog-div">
          <span>按钮图标</span>
          <div style="float: right; margin-right: 15px">
            <IconDialog @selected="icons" />
          </div>
          <i
            :class="this.data.customDialogjson.icon"
            style="float: right; line-height: 28px"
          ></i>
        </div>
      </span>
      <el-dialog
        title="设置对话框返回值"
        :visible.sync="dialogcustDialogVisible"
        append-to-body
        class="urgent-text"
        :close-on-click-modal="false"
        width="600px"
      >
        <table class="form-table" cellspacing="0" cellpadding="0" border="0">
          <tbody>
            <tr class="linkageTable-tr">
              <td width="150px">返回结果字段</td>
              <td width="220px">绑定显示的属性</td>
              <td width="80px">解除绑定</td>
            </tr>

            <tr
              class="linkageTable-tr"
              v-for="(field, index) in this.data.customDialogjson.resultField"
              :key="index"
            >
              <td>{{ field.comment }}</td>
              <td>
                <ht-select
                  v-model="custDialogprop[field.comment]"
                  :options="
                    subTables.filter(
                      item => item.name === data.options.boSubEntity
                    )
                  "
                  :props="{key: 'name', value: 'desc'}"
                  clearable
                  filterable
                >
                  <template slot-scope="{options}">
                    <el-option-group
                      v-for="(group, idenx) in options"
                      :key="idenx"
                      :label="group.desc"
                    >
                      <el-option
                        v-for="item in group.children"
                        :key="item.id"
                        :label="item.desc"
                        :value="item.path + '.' + item.name"
                      ></el-option>
                    </el-option-group>
                  </template>
                </ht-select>
              </td>
              <td>
                <el-button
                  icon="el-icon-delete"
                  @click="unbind(field.comment)"
                ></el-button>
              </td>
            </tr>
          </tbody>
        </table>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="custDialogOk">确 定</el-button>
          <el-button @click="dialogcustDialogVisible = false">取 消</el-button>
        </div>
      </el-dialog>

      <i18n-message-edit
        ref="i18nMessageEdit"
        :messageKey="i18nMessageKey"
        @after-save="afterSaveI18n"
      />
    </template>
    <template v-else-if="data && data.ctrlType == 'dataView'">
      <div class="custDialog-div">
        <span>数据视图设置</span>
        <el-button
          class="custDialog-btn"
          icon="icon-list2"
          size="mini"
          v-if="data.templateKey && data.templateKey != ''"
          @click="dataViewClick()"
          >设置参数绑定</el-button
        >
      </div>
      <ht-form-item
        label-width="120px"
        class="customQuery-inputs custDialog-item"
      >
        <template slot="label">
          <el-tooltip content="所选择的表单列表作为选项时的绑定">
            <i class="property-tip icon-question" />
          </el-tooltip>
          <span>选择表单列表</span>
        </template>
        <eip-data-template-selector
          v-model="data.templateObj"
          @handleRemove="handleDataRemove"
          placeholder="请选择表单列表"
          :single="true"
          v-if="templateShow"
        ></eip-data-template-selector>
      </ht-form-item>

      <el-dialog
        title="设置表单列表回填"
        :visible.sync="dialogcustDialogVisible"
        append-to-body
        class="urgent-text"
        :close-on-click-modal="false"
        width="600px"
      >
        <table class="form-table" cellspacing="0" cellpadding="0" border="0">
          <tbody>
            <tr class="linkageTable-tr">
              <td width="150px">返回结果字段</td>
              <td width="220px">绑定表单的字段属性</td>
              <td width="80px">解除绑定</td>
            </tr>
            <tr
              class="linkageTable-tr"
              v-for="(field, index) in data.templateField"
              :key="index"
            >
              <td>{{ field.desc }}</td>
              <td>
                <ht-select
                  filterable
                  validate="required"
                  v-model="custDialogprop[field.name]"
                  :options="tablefields"
                  :props="{key: 'name', value: 'desc'}"
                >
                  <template slot-scope="{options, propKey, propValue}">
                    <el-option-group
                      v-for="group in options"
                      :key="group.name"
                      :label="group.desc"
                    >
                      <el-option
                        v-for="item in group.children.filter(obj => {
                          return filterFields(obj)
                        })"
                        :key="item[propKey]"
                        :label="item[propValue]"
                        :value="item[propKey]"
                      ></el-option>
                    </el-option-group>
                  </template>
                </ht-select>
              </td>
              <td>
                <el-button
                  icon="el-icon-delete"
                  @click="unbind(field.name)"
                ></el-button>
              </td>
            </tr>
          </tbody>
        </table>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="custDialogOk">确 定</el-button>
          <el-button @click="dialogcustDialogVisible = false">取 消</el-button>
        </div>
      </el-dialog>

      <el-dialog
        title="设置数据视图参数"
        :visible.sync="dialogDataViewVisible"
        append-to-body
        class="urgent-text"
        :close-on-click-modal="false"
        width="800px"
      >
        <table class="form-table" cellspacing="0" cellpadding="0" border="0">
          <tbody>
            <tr class="linkageTable-tr">
              <td width="180px"></td>
              <td width="240px">表单字段</td>
              <td width="240px">表单列表字段</td>
              <td width="80px">操作</td>
            </tr>
            <tr class="linkageTable-tr">
              <td width="180px">
                <el-tooltip
                  content="表单参数绑定,可根据绑定表单字段对数据报表数据进行过滤展示;不绑定则显示所有数据"
                >
                  <i class="property-tip icon-question" />
                </el-tooltip>
                <span>关联查询字段</span>
                <el-button
                  class="btn-padding"
                  style="margin-left: 5px"
                  icon="el-icon-plus"
                  @click="addSelectList()"
                ></el-button>
              </td>
              <td colspan="6">
                <table class cellspacing="0" cellpadding="0" border="0">
                  <tr v-for="(item, index) in selectList" :key="index">
                    <td width="240px">
                      <ht-select
                        v-model="item.selectField"
                        :options="tablefields"
                        :props="{key: 'name', value: 'desc'}"
                        :clearable="true"
                        filterable
                        style="margin: 10px 20px"
                      >
                        <template slot-scope="{options, propKey, propValue}">
                          <el-option-group
                            v-for="group in options"
                            :key="group.name"
                            :label="group.desc"
                          >
                            <el-option
                              v-for="item in group.children.filter(obj => {
                                return filterFields(obj)
                              })"
                              :key="item[propKey]"
                              :label="item[propValue]"
                              :value="item[propKey]"
                            ></el-option>
                          </el-option-group>
                        </template>
                      </ht-select>
                    </td>
                    <td width="240px">
                      <el-select
                        v-model="item.bindSelectd"
                        clearable
                        placeholder="请选择"
                        style="margin: 10px 10px 10px 30px"
                      >
                        <el-option
                          v-for="item in data.templateField"
                          :key="item.id"
                          :label="item.desc"
                          :value="item.name"
                        ></el-option>
                      </el-select>
                    </td>
                    <td width="80px" style="text-align: center">
                      <el-button
                        class="btn-padding"
                        style="margin-left: 20px"
                        icon="el-icon-delete"
                        @click="selectList.remove(item)"
                      ></el-button>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr class="linkageTable-tr">
              <td width="180px">
                <el-tooltip
                  content="字段回填，将表单字段的值回填到数据视图表单字段中；不绑定则不回填。"
                >
                  <i class="property-tip icon-question" />
                </el-tooltip>
                <span>关联填充字段</span>
                <el-button
                  class="btn-padding"
                  style="margin-left: 5px"
                  icon="el-icon-plus"
                  @click="addBindList()"
                ></el-button>
              </td>
              <td colspan="6">
                <table class cellspacing="0" cellpadding="0" border="0">
                  <tr v-for="(item, index) in bindList" :key="index">
                    <td width="240px">
                      <ht-select
                        v-model="item.fillField"
                        :options="tablefields"
                        :props="{key: 'name', value: 'desc'}"
                        :clearable="true"
                        filterable
                        style="margin: 10px 20px"
                      >
                        <template slot-scope="{options, propKey, propValue}">
                          <el-option-group
                            v-for="group in options"
                            :key="group.name"
                            :label="group.desc"
                          >
                            <el-option
                              v-for="item in group.children.filter(obj => {
                                return filterFields(obj)
                              })"
                              :key="item[propKey]"
                              :label="item[propValue]"
                              :value="item[propKey]"
                            ></el-option>
                          </el-option-group>
                        </template>
                      </ht-select>
                    </td>
                    <td width="240px">
                      <el-select
                        v-model="item.bindFilld"
                        clearable
                        placeholder="请选择"
                        style="margin: 10px 10px 10px 30px"
                      >
                        <el-option
                          v-for="item in data.templateField"
                          :key="item.id"
                          :label="item.desc"
                          :value="item.name"
                        ></el-option>
                      </el-select>
                    </td>
                    <td width="80px" style="text-align: center">
                      <el-button
                        class="btn-padding"
                        style="margin-left: 20px"
                        icon="el-icon-delete"
                        @click="bindList.remove(item)"
                      ></el-button>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="confirmDataView()">确 定</el-button>
          <el-button @click="dialogDataViewVisible = false">取 消</el-button>
        </div>
      </el-dialog>
    </template>
    <template v-else>
      <div class="property-empty">当前布局字段没有可配置属性</div>
    </template>
    <el-dialog
      title="设置栅格布局样式"
      :visible.sync="dialogStyleVisible"
      append-to-body
      class="urgent-text"
      :before-close="includeStyleNo"
      :close-on-click-modal="false"
      width="600px"
    >
      <span style="color: red">
        编辑的只能为Style样式内容，如：border: 1px solid
        #ccc;&nbsp;&nbsp;border-left: none; &nbsp;&nbsp;border-right:
        none;&nbsp;&nbsp;border-top: none;&nbsp;&nbsp;border-bottom: none;
      </span>
      <el-row style="height: 100%">
        <codemirror
          v-model="style"
          :options="cmStyle"
          style="width: 99%; height: 100%"
        ></codemirror>
        <div style="width: 15%; float: left">
          <div>颜色：</div>
          <div class="block">
            <el-color-picker v-model="clickColor"></el-color-picker>
          </div>
        </div>
        <div style="width: 30%; float: left; margin-right: 25px">
          <div>类型：</div>
          <div class="block">
            <el-select v-model="selectBorderType" placeholder="请选择">
              <el-option
                v-for="item in borderType"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </div>
        </div>
        <div style="width: 30%; float: left">
          <div>可见性：</div>
          <el-select
            v-model="hiddenBorder"
            multiple
            collapse-tags
            placeholder="请选择"
          >
            <el-option
              v-for="item in hiddenBorderType"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </div>
      </el-row>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="includeStyleOk">确 定</el-button>
        <el-button @click="includeStyleNo">取 消</el-button>
      </div>
    </el-dialog>
    <el-dialog
      title="添加关联关系"
      :visible.sync="relationVisible"
      append-to-body
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :inline="true">
        <el-button type="primary" @click="add">添加</el-button>
      </el-form>
      <el-table style="width: 100%" :data="relations" border>
        <el-table-column type="selection" width="55" />
        <el-table-column label="子表字段">
          <template slot-scope="scope">
            <el-select v-model="scope.row.key_">
              <el-option
                v-for="result in data.list"
                :key="result.key"
                :label="result.name"
                :value="result.name"
              />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column prop="value_" label="主表字段">
          <template slot-scope="scope">
            <el-select v-model="scope.row.value_">
              <el-option
                v-for="result in tablefields[0].children"
                :key="result.id"
                :label="result.name"
                :value="result.path + '.' + result.name"
              />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-delete"
              @click="remove(scope.$index)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submit">确定</el-button>
        <el-button @click="relationVisible = false">取消</el-button>
      </div>
    </el-dialog>
    <!-- <hot-table-field-dialog ref="hotTableFieldDialog" @after-save="hotTableFieldSave" /> -->

    <el-dialog
      title="设置自动回填"
      :visible.sync="dialogcustOrgVisible"
      append-to-body
      class="urgent-text"
      :close-on-click-modal="false"
      width="600px"
    >
      <table
        v-if="data.customDialogjson && data.customDialogjson.orgConfig"
        class="form-table"
        cellspacing="0"
        cellpadding="0"
        border="0"
      >
        <tbody>
          <tr class="linkageTable-tr">
            <td width="150px">单位名称</td>
            <td width="220px">
              <ht-select
                filterable
                v-model="data.customDialogjson.orgConfig.name"
                :options="
                  subTables.filter(
                    item => item.name === data.options.boSubEntity
                  )
                "
                :props="{key: 'name', value: 'desc'}"
                clearable
              >
                <template slot-scope="{options}">
                  <el-option-group
                    v-for="(group, idenx) in options"
                    :key="idenx"
                    :label="group.desc"
                  >
                    <el-option
                      v-for="item in group.children"
                      :key="item.id"
                      :label="item.desc"
                      :value="item.path + '.' + item.name"
                    ></el-option>
                  </el-option-group>
                </template>
              </ht-select>
            </td>
          </tr>
          <tr class="linkageTable-tr">
            <td width="150px">单位ID</td>
            <td width="220px">
              <ht-select
                v-model="data.customDialogjson.orgConfig.id"
                :options="
                  subTables.filter(
                    item => item.name === data.options.boSubEntity
                  )
                "
                :props="{key: 'name', value: 'desc'}"
                clearable
                filterable
              >
                <template slot-scope="{options}">
                  <el-option-group
                    v-for="(group, idenx) in options"
                    :key="idenx"
                    :label="group.desc"
                  >
                    <el-option
                      v-for="item in group.children"
                      :key="item.id"
                      :label="item.desc"
                      :value="item.path + '.' + item.name"
                    ></el-option>
                  </el-option-group>
                </template>
              </ht-select>
            </td>
          </tr>
          <tr class="linkageTable-tr">
            <td width="150px">单位编码</td>
            <td width="220px">
              <ht-select
                v-model="data.customDialogjson.orgConfig.code"
                :options="
                  subTables.filter(
                    item => item.name === data.options.boSubEntity
                  )
                "
                :props="{key: 'name', value: 'desc'}"
                clearable
                filterable
              >
                <template slot-scope="{options}">
                  <el-option-group
                    v-for="(group, idenx) in options"
                    :key="idenx"
                    :label="group.desc"
                  >
                    <el-option
                      v-for="item in group.children"
                      :key="item.id"
                      :label="item.desc"
                      :value="item.path + '.' + item.name"
                    ></el-option>
                  </el-option-group>
                </template>
              </ht-select>
            </td>
          </tr>
          <tr class="linkageTable-tr">
            <td width="150px">实例ID</td>
            <td width="220px">
              <ht-select
                v-model="data.customDialogjson.orgConfig.instId"
                :options="
                  subTables.filter(
                    item => item.name === data.options.boSubEntity
                  )
                "
                :props="{key: 'name', value: 'desc'}"
                clearable
                filterable
              >
                <template slot-scope="{options}">
                  <el-option-group
                    v-for="(group, idenx) in options"
                    :key="idenx"
                    :label="group.desc"
                  >
                    <el-option
                      v-for="item in group.children"
                      :key="item.id"
                      :label="item.desc"
                      :value="item.path + '.' + item.name"
                    ></el-option>
                  </el-option-group>
                </template>
              </ht-select>
            </td>
          </tr>
        </tbody>
      </table>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="custOrgDialogOk">确 定</el-button>
        <el-button @click="dialogcustOrgVisible = false">取 消</el-button>
      </div>
    </el-dialog>

    <!-- <el-dialog
      title="设置表头"
      :visible.sync="dialogHotHeaderDialogVisible"
      append-to-body
      class="urgent-text"
      :close-on-click-modal="false"
      width="1000px"
    >
      <table class="form-table" cellspacing="0" cellpadding="0" border="0">
        <tbody>
          <tr class="linkageTable-tr">
            <td width="100px">字段别名</td>
            <td width="130px">字段名称</td>
            <td width="100px">首行汇总</td>
            <td width="420px">
              操作
              <el-button size="mini" icon="el-icon-refresh" @click="initHotColHeaders()">初始化表头</el-button>
            </td>
          </tr>

          <tr
            class="linkageTable-tr"
            v-for="(field, index) in this.data.options.colHeadersRelations"
            :key="index"
          >
            <td>{{ field.name }}</td>
            <td>
              <ht-input v-model="field.desc" style="width: 175px" />
            </td>
            <td>
              <el-checkbox v-model="field.isSum"></el-checkbox>
            </td>
            <td>
              <el-button
                icon="el-icon-edit"
                @click="setHotColumType(field)"
                :style="isFill(field.column)?{background:'#EBB563',color:'#ffffff'}:{background:'#ffffff'}"
              >控件</el-button>
              <el-button
                icon="el-icon-edit"
                @click="setHotMathExp(field)"
                :style="field.column.mathExp?{background:'#EBB563',color:'#ffffff'}:{background:'#ffffff'}"
              >行内统计</el-button>
              <el-button
                icon="el-icon-edit"
                @click="setHotRowMathExp(field)"
                :style="field.column.rowMathExp.length!==0?{background:'#EBB563',color:'#ffffff'}:{background:'#ffffff'}"
              >跨行统计</el-button>
              <el-button icon="el-icon-delete" @click="hotHeaderRemove(field)"></el-button>
              <el-button
                size="small"
                icon="el-icon-arrow-up"
                @click="up(index,data.options.colHeadersRelations)"
              ></el-button>
              <el-button
                icon="el-icon-arrow-down"
                @click="down(index,data.options.colHeadersRelations)"
              ></el-button>
            </td>
          </tr>
        </tbody>
      </table>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="hotHeaderDialogOk">确 定</el-button>
        <el-button @click="dialogHotHeaderDialogVisible = false">取 消</el-button>
      </div>
    </el-dialog>

    <el-dialog
      title="设置跨表取数"
      :visible.sync="dialogHotCrossMappingVisible"
      append-to-body
      class="urgent-text"
      :close-on-click-modal="false"
      width="1080px"
    >
      <el-container style="height:350px">
        <el-header
          style="height:30px;line-height:30px;background: #fafafa; font-weight: bold;font-size: 14px;"
        >
          <el-button size="small" type="text" icon="el-icon-plus" @click="addHotCrossMapping()">添加</el-button>
        </el-header>
        <el-main style="padding:0 0 0 20px">
          <table class="form-table" cellspacing="0" cellpadding="0" border="0">
            <tbody>
              <tr class="linkageTable-tr">
                <td width="160px">取数字段</td>
                <td width="90px">行号</td>
                <td width="500px">
                  取数源
                  <el-tooltip content="如果是从多个字段取数，则是做求和运算">
                    <i class="property-tip icon-question" />
                  </el-tooltip>
                </td>
                <td width="220px">操作</td>
              </tr>

              <tr
                class="linkageTable-tr"
                v-for="(field, index) in this.data.options.crossMapping"
                :key="index"
              >
                <td>
                  <ht-select
                    v-model="field.toField"
                    :options="
                          subTables.filter(
                            item => item.name === data.options.boSubEntity
                          )
                        "
                    :props="{ key: 'name', value: 'desc' }"
                    clearable
                    filterable
                  >
                    <template slot-scope="{ options }">
                      <el-option-group
                        v-for="(group, idenx) in options"
                        :key="idenx"
                        :label="group.desc"
                      >
                        <el-option
                          v-for="item in group.children"
                          :key="item.id"
                          :label="item.desc"
                          :value="item.path + '.' + item.name"
                        ></el-option>
                      </el-option-group>
                    </template>
                  </ht-select>
                </td>
                <td>
                  <ht-input
                    size="mini"
                    width="80px"
                    type="number"
                    v-model="field.toIndex"
                    :min="0"
                  />
                </td>
                <td>
                  <table class="form-table" cellspacing="0" cellpadding="0" border="0">
                    <tbody>
                      <tr class="linkageTable-tr">
                        <td width="180px">源子表</td>
                        <td width="160px">源字段</td>
                        <td width="90px">行号</td>
                        <td width="220px">
                          操作
                          <el-button icon="el-icon-plus" @click="addHotCrossMappingField(field)"></el-button>
                        </td>
                      </tr>
                      <tr
                        class="linkageTable-tr"
                        v-for="(ffield, index) in field.fromFields"
                        :key="index"
                      >
                        <td>
                          <ht-select
                            v-model="ffield.fromSubTabPath"
                            :options="
                                        subTables.filter(
                                          item => item.name !== data.options.boSubEntity
                                        )
                                      "
                            clearable
                            filterable
                            :props="{ key: 'path', value: 'desc' }"
                          />
                        </td>
                        <td>
                          <ht-select
                            v-model="ffield.fromField"
                            :options="
                                        subTables.filter(
                                          item => item.path === ffield.fromSubTabPath
                                        )
                                      "
                            :props="{ key: 'name', value: 'desc' }"
                            clearable
                            filterable
                          >
                            <template slot-scope="{ options }">
                              <el-option-group
                                v-for="(group, idenx) in options"
                                :key="idenx"
                                :label="group.desc"
                              >
                                <el-option
                                  v-for="item in group.children"
                                  :key="item.id"
                                  :label="item.desc"
                                  :value="item.path + '.' + item.name"
                                ></el-option>
                              </el-option-group>
                            </template>
                          </ht-select>
                        </td>
                        <td>
                          <ht-input
                            size="mini"
                            width="80px"
                            type="number"
                            v-model="ffield.fromIndex"
                            :min="0"
                          />
                        </td>
                        <td>
                          <el-button icon="el-icon-plus" @click="addHotCrossMappingField(field)"></el-button>
                          <el-button
                            icon="el-icon-delete"
                            @click="hotCrossMappingFiledRemove(field,ffield)"
                          ></el-button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
                <td>
                  <el-button icon="el-icon-delete" @click="hotCrossMappingRemove(field)"></el-button>
                  <el-button
                    size="small"
                    icon="el-icon-arrow-up"
                    @click="up(index,data.options.crossMapping)"
                  ></el-button>
                  <el-button
                    icon="el-icon-arrow-down"
                    @click="down(index,data.options.crossMapping)"
                  ></el-button>
                  <el-button
                    icon="el-icon-document-copy"
                    @click="data.options.crossMapping.push(JSON.parse(JSON.stringify(field)))"
                  ></el-button>
                </td>
              </tr>
            </tbody>
          </table>
        </el-main>
      </el-container>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="hotCrossMappingDialogOk">确 定</el-button>
        <el-button @click="dialogHotCrossMappingVisible = false">取 消</el-button>
      </div>
    </el-dialog>

    <el-dialog
      title="主表汇总"
      :visible.sync="dialogMainTableCalcVisible"
      append-to-body
      class="urgent-text"
      :close-on-click-modal="false"
      width="1080px"
    >
      <el-container style="height:350px">
        <el-header
          style="height:30px;line-height:30px;background: #fafafa; font-weight: bold;font-size: 14px;"
        >
          <el-button size="small" type="text" icon="el-icon-plus" @click="addHotMainTableCalc()">添加</el-button>
        </el-header>
        <el-main style="padding:0 0 0 20px">
          <table class="form-table" cellspacing="0" cellpadding="0" border="0">
            <tbody>
              <tr class="linkageTable-tr">
                <td width="160px">名称</td>
                <td width="160px">主表字段</td>
                <td width="160px">求和字段</td>
                <td width="220px">操作</td>
              </tr>

              <tr
                class="linkageTable-tr"
                v-for="(field, index) in this.data.options.mainTableCalcs"
                :key="index"
              >
                <td>
                  <ht-input size="mini" width="130px" v-model="field.name" />
                </td>
                <td>
                  <ht-select
                    v-model="field.mainField"
                    :options="boDefData.children"
                    :props="{ key: 'name', value: 'desc' }"
                    clearable
                    filterable
                  >
                    <template slot-scope="{ options }">
                      <el-option-group
                        v-for="(group, idenx) in options"
                        :key="idenx"
                        :label="group.desc"
                      >
                        <el-option
                          v-for="item in group.children"
                          v-show="item.nodeType=='field'"
                          :key="item.id"
                          :label="item.desc"
                          :value="item.path + '.' + item.name"
                        ></el-option>
                      </el-option-group>
                    </template>
                  </ht-select>
                </td>
                <td>
                  <ht-select
                    v-model="field.sumField"
                    :options="
                          subTables.filter(
                            item => item.name === data.options.boSubEntity
                          )
                        "
                    :props="{ key: 'name', value: 'desc' }"
                    clearable
                    filterable
                  >
                    <template slot-scope="{ options }">
                      <el-option-group
                        v-for="(group, idenx) in options"
                        :key="idenx"
                        :label="group.desc"
                      >
                        <el-option
                          v-for="item in group.children"
                          :key="item.id"
                          :label="item.desc"
                          :value="item.path + '.' + item.name"
                        ></el-option>
                      </el-option-group>
                    </template>
                  </ht-select>
                </td>

                <td>
                  <el-button icon="el-icon-delete" @click="hotMainTableCalcRemove(field)"></el-button>
                  <el-button
                    size="small"
                    icon="el-icon-arrow-up"
                    @click="up(index,data.options.mainTableCalcs)"
                  ></el-button>
                  <el-button
                    icon="el-icon-arrow-down"
                    @click="down(index,data.options.mainTableCalcs)"
                  ></el-button>
                </td>
              </tr>
            </tbody>
          </table>
        </el-main>
      </el-container>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="hotMainTableCalcDialogOk">确 定</el-button>
        <el-button @click="dialogMainTableCalcVisible = false">取 消</el-button>
      </div>
    </el-dialog>

    <el-dialog
      title="单元格计算"
      :visible.sync="dialogCellCalcVisible"
      append-to-body
      class="urgent-text"
      :close-on-click-modal="false"
      width="1280px"
    >
      <el-container style="height:520px">
        <el-header
          style="height:30px;line-height:30px;background: #fafafa; font-weight: bold;font-size: 14px;"
        >
          <el-button size="small" type="text" icon="el-icon-plus" @click="addHotCellCalc()">添加</el-button>
        </el-header>
        <el-main style="padding:0 0 0 20px">
          <table class="form-table" cellspacing="0" cellpadding="0" border="0">
            <tbody>
              <tr class="linkageTable-tr">
                <td width="160px">计算列</td>
                <td width="90px">行号</td>
                <td width="360px">计算公式</td>
                <td width="220px">操作</td>
              </tr>

              <tr
                class="linkageTable-tr"
                v-for="(field, index) in this.data.options.cellCalcs"
                :key="index"
              >
                <td>
                  <ht-select
                    v-model="field.cellField"
                    :options="
                          subTables.filter(
                            item => item.name === data.options.boSubEntity
                          )
                        "
                    :props="{ key: 'name', value: 'desc' }"
                    clearable
                    filterable
                  >
                    <template slot-scope="{ options }">
                      <el-option-group
                        v-for="(group, idenx) in options"
                        :key="idenx"
                        :label="group.desc"
                      >
                        <el-option
                          v-for="item in group.children"
                          :key="item.id"
                          :label="item.desc"
                          :value="item.path + '.' + item.name"
                        ></el-option>
                      </el-option-group>
                    </template>
                  </ht-select>
                </td>
                <td>
                  <ht-input
                    size="mini"
                    width="80px"
                    type="number"
                    v-model="field.rowIndex"
                    :min="0"
                  />
                </td>
                <td>
                  <ht-input type="textarea" v-model="field.mathExp" />
                </td>
                <td>
                  <el-button icon="el-icon-edit" @click="hotCellCalcEdit(field)"></el-button>
                  <el-button icon="el-icon-delete" @click="hotCellCalcRemove(field)"></el-button>
                  <el-button
                    size="small"
                    icon="el-icon-arrow-up"
                    @click="up(index,data.options.cellCalcs)"
                  ></el-button>
                  <el-button icon="el-icon-arrow-down" @click="down(index,data.options.cellCalcs)"></el-button>
                </td>
              </tr>
            </tbody>
          </table>
        </el-main>
      </el-container>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="hotCellCalcDialogOk">确 定</el-button>
        <el-button @click="dialogCellCalcVisible = false">取 消</el-button>
      </div>
    </el-dialog>

    <el-dialog
      title="设置嵌套表头"
      :visible.sync="dialogHotNestedHeadersVisible"
      append-to-body
      class="urgent-text"
      :close-on-click-modal="false"
      width="1200px"
    >
      <el-container style="height:350px">
        <el-header
          style="height:30px;line-height:30px;background: #fafafa; font-weight: bold;font-size: 14px;"
        >
          <el-button size="small" type="text" icon="el-icon-plus" @click="addHotNestedHeaders()">添加</el-button>
        </el-header>
        <el-main style="padding:0 0 0 20px">
          <table class="form-table" cellspacing="0" cellpadding="0" border="0">
            <tbody>
              <tr class="linkageTable-tr">
                <td width="60px">序号</td>
                <td>表头设置</td>
                <td width="200px">操作</td>
              </tr>

              <tr
                class="linkageTable-tr"
                v-for="(field, index) in data.options.nestedHeaders"
                :key="index"
              >
                <td>{{index+1}}</td>
                <td>
                  <table class="form-table" cellspacing="0" cellpadding="0" border="0">
                    <tbody>
                      <tr class="linkageTable-tr">
                        <td width="120px">合并列名</td>
                        <td width="150px">开始列</td>
                        <td width="150px">结束列</td>
                        <td width="220px">操作</td>
                      </tr>
                      <tr
                        class="linkageTable-tr"
                        v-for="(header, index) in field.headers"
                        :key="index"
                      >
                        <td>
                          <ht-input size="mini" type="text" v-model="header.name" />
                        </td>
                        <td>
                          <ht-select
                            v-model="header.startField"
                            :options="data.options.colHeadersRelations"
                            :props="{ key: 'name', value: 'desc' }"
                            clearable
                            filterable
                          >
                            <template slot-scope="{ options }">
                              <el-option
                                v-for="(item, cidenx) in options"
                                v-show="cidenx!=0"
                                :key="item.id"
                                :label="item.desc"
                                :value="item.name"
                              ></el-option>
                            </template>
                          </ht-select>
                        </td>
                        <td>
                          <ht-select
                            v-model="header.endField"
                            :options="data.options.colHeadersRelations"
                            :props="{ key: 'name', value: 'desc' }"
                            clearable
                            filterable
                          >
                            <template slot-scope="{ options }">
                              <el-option
                                v-for="(item, cidenx) in options"
                                v-show="cidenx!=0"
                                :key="item.id"
                                :label="item.desc"
                                :value="item.name"
                              ></el-option>
                            </template>
                          </ht-select>
                        </td>
                        <td>
                          <el-button
                            size="small"
                            icon="el-icon-plus"
                            @click="hotNestedHeadersItemAdd(field.headers)"
                          ></el-button>
                          <el-button
                            icon="el-icon-delete"
                            @click="hotNestedHeadersItemRemove(field.headers,header)"
                          ></el-button>
                          <el-button
                            size="small"
                            icon="el-icon-arrow-up"
                            @click="up(index,field.headers)"
                          ></el-button>
                          <el-button icon="el-icon-arrow-down" @click="down(index,field.headers)"></el-button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
                <td>
                  <el-button icon="el-icon-delete" @click="hotNestedHeadersRemove(field)"></el-button>
                  <el-button
                    size="small"
                    icon="el-icon-arrow-up"
                    @click="up(index,data.options.nestedHeaders)"
                  ></el-button>
                  <el-button
                    icon="el-icon-arrow-down"
                    @click="down(index,data.options.nestedHeaders)"
                  ></el-button>
                </td>
              </tr>
            </tbody>
          </table>
        </el-main>
      </el-container>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="hotNestedHeadersDialogOk">确 定</el-button>
        <el-button @click="dialogHotNestedHeadersVisible = false">取 消</el-button>
      </div>
    </el-dialog> -->

    <!-- <el-dialog
      title="统计函数"
      ref="hotMathDialog"
      :visible.sync="dialogHotCountVisible"
      destroy-on-close
      append-to-body
      :close-on-click-modal="false"
    >
      <math-dialog ref="mathDialog" :bo-def-data="boDefData" :visible.sync="dialogHotCountVisible" />
    </el-dialog>

    <hot-subDialog ref="hotSubDialog" :custdialog="data.customDialogjson"></hot-subDialog>

    <el-dialog
      title="单元格统计函数"
      ref="hotCellMathDialog"
      :visible.sync="dialogCellCountVisible"
      destroy-on-close
      append-to-body
      :close-on-click-modal="false"
    >
      <cell-math-dialog
        ref="cellMathDialog"
        :bo-def-data="boDefData"
        :visible.sync="dialogCellCountVisible"
      />
    </el-dialog>

    <el-dialog
      title="跨行统计函数"
      ref="hotRowsMathDialog"
      :visible.sync="dialogHotRowsCountVisible"
      destroy-on-close
      append-to-body
      :close-on-click-modal="false"
    >
      <math-row-dialog
        ref="mathRowDialog"
        :bo-sub-entity="data.options.boSubEntity"
        :bo-def-data="boDefData"
        :sub-tables="subTables"
        :visible.sync="dialogHotRowsCountVisible"
      />
    </el-dialog> -->
    <el-dialog
      title="自定义表头"
      :visible.sync="dialogincluddingFileVisible"
      append-to-body
      class="urgent-text"
      :before-close="includeFilesOk"
      :close-on-click-modal="false"
      width="900px"
    >
      <el-row style="height: 100%">
        <el-col :span="13">
          <textarea
            v-model="subCustomHeader"
            type="textarea"
            rows="30"
            autocomplete="off"
            ref="scriptText"
            style="width: 99%; height: 100%"
          ></textarea>
        </el-col>
        <el-col :span="10" :push="1">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span>使用说明</span>
            </div>
            <ol class="guide-ol">
              <li>
                可从
                <code>引入脚本</code>处复制头部 <code>thead标签</code>中行
                <code>tr标签</code>所有数据作为二级头部信息
              </li>
              <li>
                参照复制的二级头部数据，进行
                <code>th标签</code>的修改合并为一级头部
              </li>
              <li>
                示例：
                <el-input
                  v-model="tableHeaderExample"
                  :autosize="{minRows: 2, maxRows: 7}"
                  type="textarea"
                />
              </li>
            </ol>
          </el-card>
        </el-col>
      </el-row>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="includeFilesOk">确 定</el-button>
        <el-button
          @click="
            dialogincluddingFileVisible = false
            subCustomHeader = ''
          "
          >取 消</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>
<script>
import Draggable from 'vuedraggable'
import IconDialog from '@/components/dialog/IconDialog.vue'
import i18nMessageEdit from '@/components/system/I18nMessageEdit'
import HotTableFieldDialog from '@/components/form/HotTableFieldDialog'
import HotSubDialog from '@/components/form/HotSubDialog'
import MathDialog from '@/components/form/customView/MathDialog.vue'
import MathRowDialog from '@/components/form/customView/MathRowDialog.vue'
import CellMathDialog from '@/components/form/customView/CellMathDialog.vue'
import FormTabsDialog from '@/components/form/FormTabsDialog.vue'
import {} from 'js-base64'
import utils from '@/hotent-ui-util.js'
import form from '@/api/form.js'
const EipDataTemplateSelector = () =>
  import('@/components/selector/EipDataTemplateSelector.vue')
const SubImportMergeDialog = () =>
  import('@/components/form/customView/SubImportMergeDialog.vue')
import deepmerge from 'deepmerge'
export default {
  name: 'layout-property',
  components: {
    FormTabsDialog,
    Draggable,
    IconDialog,
    i18nMessageEdit,
    EipDataTemplateSelector,
    HotTableFieldDialog,
    HotSubDialog,
    MathDialog,
    MathRowDialog,
    CellMathDialog,
    SubImportMergeDialog
  },
  props: [
    'data',
    'subTables',
    'sunTables',
    'tablefields',
    'boDefData',
    'formType'
  ],
  data() {
    return {
      selectQueryDialog: false,
      subCustomHeader: '',
      customQuerys: [{alias: '', name: ''}],
      subTableEnt: [{name: '', desc: ''}],
      customDialogs: [], //对话框列表数据,
      dialogcustDialogVisible: false,
      dialogSunDialog: false,
      custDialogprop: {},
      dialogincluddingFileVisible: false,
      pageBtnScriptDialog: false,
      pageBtnScriptBase: '',
      i18nMessageKey: '',
      dialogStyleVisible: false, //编写栅格布局样式对话框
      selectList: [],
      bindList: [],
      dialogDataViewVisible: false, //
      templateShow: false,
      style: '', //栅格布局样式
      styleIndex: '', //栅格布局样式下标
      cmStyle: {
        value: '',
        mode: 'css',
        readOnly: false,
        smartIndent: true,
        tabSize: 2,
        theme: 'base16-light',
        lineNumbers: true,
        line: true
      },
      relationVisible: false,
      relations: [],
      dialogHotHeaderDialogVisible: false,
      dialogHotCrossMappingVisible: false,
      dialogHotNestedHeadersVisible: false,
      dialogHotCountVisible: false,
      dialogCellCountVisible: false,
      dialogHotRowsCountVisible: false,
      currentHotColumnField: {},
      dialogcustOrgVisible: false,
      dialogMainTableCalcVisible: false,
      dialogCellCalcVisible: false,
      currentMainTableCalcField: {},
      currentCellCalcField: {},
      clickColor: '',
      selectBorderType: '',
      borderType: [
        {value: ' border-style: solid; ', label: '————————————'},
        {value: ' border-style: dotted; ', label: '●●●●●●●●●●●●●●●●●●●●'},
        {
          value: ' border-style: dashed; ',
          label: '------------------------------'
        },
        {value: ' border-style: double; ', label: '=================='}
      ],
      hiddenBorder: '',
      hiddenBorderType: [
        {value: ' border-left: none; ', label: '隐藏左边框'},
        {value: ' border-right: none; ', label: '隐藏右边框'},
        {value: ' border-top: none; ', label: '隐藏上边框'},
        {value: ' border-bottom: none; ', label: '隐藏下边框'}
      ],
      tableHeaderExample:
        '<tr class="sub-table-header" @click="transitionIndex = -1">\n' +
        '\n' +
        '    <th colspan="2" style="min-width: 200px;font-weight:normal;color:#969799;;;"><span>*</span>\n' +
        '        <span style="color:#969799;margin-left: 5px;">一级表头名称</span>\n' +
        '    </th>\n' +
        '\n' +
        '</tr>\n' +
        '<tr class="sub-table-header" @click="transitionIndex = -1">\n' +
        '\n' +
        '    <th v-if="permission.fields.表名.字段名!=\'n\'" style="min-width: 200px;font-weight:normal;color:#969799;;;"><span\n' +
        '            v-if="permission.fields.表名.字段名==\'b\'">*</span>\n' +
        '        <span style="color:#969799;margin-left: 5px;">默认显示字段名</span>\n' +
        '    </th>\n' +
        '    <th v-if="permission.fields.表名.字段名!=\'n\'" style="min-width: 200px;font-weight:normal;color:#969799;;;"><span\n' +
        '            v-if="permission.fields.表名.字段名==\'b\'">*</span>\n' +
        '        <span style="color:#969799;margin-left: 5px;">默认显示字段名</span>\n' +
        '    </th>\n' +
        '\n' +
        '</tr>',
      tableTempAddRowIndex: 0,
      tableTempAddColIndex: 0,
      tableTempDelRowIndex: 0,
      tableTempDelColIndex: 0
    }
  },
  mounted() {
    //回填显示数据视图控件
    if (this.data.ctrlType) {
      if (this.data.templateId) {
        if (this.data.templateId != '') {
          form
            .getBpmDataTemplateById(this.data.templateId, '')
            .then(response => {
              this.data.templateObj = response.data
              this.templateShow = true
            })
        }
      } else {
        this.templateShow = true
      }
    }
  },
  watch: {
    'data.subtablePagination': function(newVal) {
      // 子表不支持前端分页时，也取消前端导入导出。
      if (!newVal) {
        delete this.data.subtableImportExport
        delete this.data.subtableImportMergeExp
      }
    },
    'data.subtableImportExport': function(newVal) {
      // 不支持导入导出时，也删除导入合并代码
      if (!newVal) {
        delete this.data.subtableImportMergeExp
      }
    },
    'data.templateObj': function(newVal, oldVal) {
      if (JSON.stringify(newVal) != '{}') {
        //保存boDefAlias
        this.tablefields.forEach(item => {
          if (item.type == 'main') {
            this.data.options.boDefAlias = item.boDefAlias
          }
        })
        if (newVal) {
          this.data.templateKey = newVal.alias
          this.data.templateId = newVal.id
          let data = newVal.formField
          if (data) {
            this.data.templateField = JSON.parse(data)
          }
          this.selectList = JSON.parse(
            JSON.stringify(this.data.options.selectList)
          )
          this.bindList = JSON.parse(JSON.stringify(this.data.options.bindList))
        }
      } else {
        this.data.templateField = []
        this.data.templateKey = ''
        this.data.templateId = ''
        this.data.options = {
          showLabel: true,
          boDefAlias: '',
          selectList: [],
          bindList: []
        }
      }
    },
    'data.ctrlType': function(newVal, oldVal) {
      if (newVal != oldVal) {
        if (newVal == 'hottable') {
          if (!this.data.customDialogjson.orgConfig) {
            this.data.customDialogjson.orgConfig = {
              name: '',
              code: '',
              id: ''
            }
          }
          if (!this.data.options.hasOwnProperty('initSumRowField')) {
            this.data.options.initSumRowField = ''
          }
          if (!this.data.options.hasOwnProperty('initSumRowValue')) {
            this.data.options.initSumRowValue = ''
          }
        }
      }
    }
  },
  methods: {
    //如果第一个值为空将启用第二关值
    getDefaultValue(realVal, defaultVal) {
      if (!defaultVal) {
        console.error(new Error('defaultVal cannot be empty!'))
      }
      return realVal || defaultVal
    },
    //ccwgq 2022-09-28 增加子表 颜色数组
    addSubBgColorList() {
      if (!Array.isArray(this.data.options.bgColorList)) {
        this.data.options.bgColorList = []
      }
      this.data.options.bgColorList.push('#fff')
    },
    delSubBgColorList(index) {
      const arr = this.data.options.bgColorList
      arr.splice(index, 1)
    },
    // limit array lenth to use disabled
    limitArrLength(data, key, limit) {
      if (Array.isArray(data[key])) {
        return data[key].length >= limit
      } else {
        this.$set(data, key, [])
        return true
      }
    },
    //子表布局切换
    subChange() {
      if (this.data.ctrlType == 'subtable' && this.data.list.length > 0) {
        let oldList = this.data.list
        let newList = []
        for (let i = 0; i < oldList.length; i++) {
          if (oldList[i].ctrlType == 'grid') {
            //DIV子表存在栅格布局
            if (oldList[i].columns.length > 0) {
              for (let j = 0; j < oldList[i].columns.length; j++) {
                if (oldList[i].columns[j].list.length > 0) {
                  for (let k = 0; k < oldList[i].columns[j].list.length; k++) {
                    newList.push(oldList[i].columns[j].list[k])
                  }
                }
              }
            }
          } else {
            newList.push(oldList[i])
          }
        }
        this.data.list = newList
      }
    },
    openFormtbsDialog(index) {
      this.$refs.FormtbsDialog.openDialog(index)
    },
    closeQueryDialog() {
      this.selectQueryDialog = false
      this.data.customQuery = {isUse: this.data.customQuery.isUse}
      $message('清空成功')
    },
    //选择下拉框控件并绑定关联查询
    setSelectQuery(alias) {
      const _this = this
      _this.customQuerys.forEach(item => {
        //判断选择的关联查询是否存在
        if (alias == item.alias) {
          if (typeof item.conditionfield == 'string') {
            item.conditionfield = JSON.parse(item.conditionfield) //parseToJson(item.customQuery.conditionfield);
            item.resultfield = JSON.parse(item.resultfield) // parseToJson(item.customQuery.resultfield);
            item.conditionfield.forEach(res => {
              _this.$set(res, 'fieldPath', '') //关联查询条件字段绑定的表单参数路径
            })
            item.resultfield.forEach(res => {
              _this.$set(res, 'fieldPath', '') //关联查询返回字段绑定的表单参数路径
            })
          }
          //把当前对象克隆一份到控件属性配置
          Object.assign(_this.data.customQuery, item)
          // 删除多余属性
          _this.slimCustomQuery(_this.data.customQuery)
        }
      })
    },
    // 当字段与关联查询绑定后，将关联查询中多余的属性删除
    slimCustomQuery(customQuery) {
      if (customQuery && customQuery.constructor == Object) {
        // 删除多余的属性
        delete customQuery['id']
        delete customQuery['createTime']
        delete customQuery['pkVal']
        delete customQuery['objName']
        delete customQuery['needPage']
        delete customQuery['pageSize']
        delete customQuery['dsalias']
        delete customQuery['dataParam']
        delete customQuery['sortfield']
        delete customQuery['diySql']
        delete customQuery['isTable']
        delete customQuery['sqlBuildType']
        // delete customQuery["dsType"];
        delete customQuery['url']
        delete customQuery['header']
        delete customQuery['requestType']
        delete customQuery['pageKey']
        delete customQuery['pageSizeKey']
        delete customQuery['totalKey']
        delete customQuery['listKey']
      }
    },
    afterCustomQueryLoadData(data) {},
    //打开下拉框绑定关联查询弹框
    showSelectQueryDialog() {
      if (!this.data.options.boSubEntity) {
        this.$message.warning('请先绑定子表')
        return
      }
      this.subTableEnt = this.subTables.filter(
        ent => ent.name == this.data.options.boSubEntity
      )
      this.data.customQuery.path = 'data.' + this.subTableEnt[0].path

      this.$http.post('${form}/form/customQuery/v1/list').then(res => {
        this.customQuerys = res.data.rows
        this.selectQueryDialog = true
      })
    },
    filterFields(obj) {
      if (obj.nodeType == 'sub') {
        return false
      } else {
        return true
      }
    },
    //编写栅格布局样式后取消事件
    includeStyleNo() {
      this.style = ''
      this.styleIndex = ''
      this.clickColor = ''
      this.hiddenBorder = ''
      this.selectBorderType = ''
      this.dialogStyleVisible = false
    },
    //编写栅格布局样式后确认事件
    includeStyleOk() {
      let color = ''
      if (this.clickColor) {
        color = ' border-color: ' + this.clickColor + '; '
      }
      let hiddenBorder = ''
      if (this.hiddenBorder) {
        this.hiddenBorder.forEach(v => {
          hiddenBorder += v
        })
      }
      if (this.style || color || this.selectBorderType || hiddenBorder) {
        this.data.columns[this.styleIndex].style =
          this.style + color + this.selectBorderType + hiddenBorder
      } else {
        this.data.columns[this.styleIndex].style = ''
      }
      this.style = ''
      this.clickColor = ''
      this.hiddenBorder = ''
      this.selectBorderType = ''
      this.styleIndex = ''
      this.dialogStyleVisible = false
    },
    //打开编写栅格布局样式对话框
    handleGridColumnStyle(index) {
      this.styleIndex = index
      if (this.data.columns[index].style) {
        this.style = this.data.columns[index].style
      } else {
        this.style = ''
      }
      this.dialogStyleVisible = true
    },
    autoRunJSScript(type, isBnt) {
      this.BtnScriptType = type
      let script
      if (type == 1) {
        //下一步按钮的前置脚本
        script = this.data.options.nextBntjson.preScript
      }
      this.pageBtnScriptDialog = true
      if (!script) return
      this.pageBtnScriptBase = Base64.decode(script)
    },
    pageBtnScriptDialogOk() {
      this.pageBtnScriptDialog = false
    },
    pageBtnScriptDialogClose() {
      this.pageBtnScriptDialog = false
    },
    pegeNextIcon(icon) {
      this.data.nextButton.icon = icon
    },
    pegeBackIcon(icon) {
      this.data.backButton.icon = icon
    },
    includeFilesOk() {
      this.dialogincluddingFileVisible = false
      if (this.subCustomHeader) {
        this.data.customHeader = Base64.encode(this.subCustomHeader, 'utf-8')
      } else {
        this.data.customHeader = ''
      }
    },
    includdingFile() {
      this.dialogincluddingFileVisible = true
      if (this.data.customHeader) {
        this.subCustomHeader = Base64.decode(this.data.customHeader, 'utf-8')
      } else {
        this.subCustomHeader = ''
      }
    },
    unbind(key) {
      for (var item in this.custDialogprop) {
        if (key == item) {
          this.$set(this.custDialogprop, key, '')
          delete this.custDialogprop[key]
        }
      }
    },
    editI18nMessage() {
      this.i18nMessageKey = this.data.options.subTablePath
      this.$refs.i18nMessageEdit.handleOpen()
    },
    afterSaveI18n(data) {
      data.key = data.key.replace('$', '#')
      this.data.desc = data.key
      this.data.desc_zh = data.desc
    },
    // 子表对话框确定事件
    custDialogOk(isDialog) {
      //对话框返回值
      var mappingConf = []
      for (var key in this.custDialogprop) {
        mappingConf.push({
          from: key,
          target: [this.custDialogprop[key]]
        })
      }
      this.data.customDialogjson.custDialog.mappingConf = mappingConf
      this.dialogcustDialogVisible = false
    },
    custOrgDialogOk() {
      this.dialogcustOrgVisible = false
    },
    //打开设置子表对话框返回值
    custDialogClick() {
      this.dialogcustDialogVisible = true
      this.custDialogprop = null
      let tempGroup = {}
      var initConf = this.data.customDialogjson
      if (initConf.custDialog.mappingConf) {
        for (var i = 0, c; (c = initConf.custDialog.mappingConf[i++]); ) {
          if (!c) continue
          var target = c.target
          if (target) target = target.join(',')
          tempGroup[c.from] = target
        }
      }
      initConf.resultField.forEach(f => {
        if (!tempGroup[f.comment]) {
          tempGroup[f.comment] = ''
        }
      })
      this.custDialogprop = tempGroup
    },
    custOrgClick() {
      if (!this.data.customDialogjson.orgConfig) {
        this.data.customDialogjson.orgConfig = {
          name: '',
          code: '',
          id: '',
          instId: ''
        }
      }
      this.dialogcustOrgVisible = true
    },
    initHotColHeaders() {
      let nowHeaders = this.data.options.colHeadersRelations
      let children = []
      this.subTables.forEach(sub => {
        if (sub.name == this.data.options.boSubEntity) {
          children = sub.children
        }
      })
      if (children.length > 0) {
        for (let index = 0; index < children.length; index++) {
          let child = children[index]
          let isExist = false
          nowHeaders.forEach(f => {
            if (f.name == child.name) {
              isExist = true
            }
          })
          if (!isExist) {
            let columnPropertis = {
              data: child.name,
              readOnly: false,
              readOnlyRows: '',
              required: false,
              requiredRows: '',
              mergeCell: false,
              type: 'text',
              source: [],
              dateFormat: '',
              mathExp: '',
              rowMathExp: [],
              width: 90,
              style: {
                size: 0,
                color: '',
                bold: false,
                background: '',
                diyStyle: ''
              }
            }
            this.data.options.colHeadersRelations.push({
              name: child.name,
              desc: child.comment,
              column: columnPropertis,
              isSum: false
            })
          }
        }
      }
    },
    setColHeader() {
      this.dialogHotHeaderDialogVisible = true
    },
    setCrossMapping() {
      if (!this.data.options.crossMapping) {
        this.data.options.crossMapping = [
          {
            toField: '',
            toIndex: 1,
            fromFields: [{fromSubTabPath: '', fromField: '', fromIndex: 1}]
          }
        ]
      }
      this.dialogHotCrossMappingVisible = true
    },
    setNestedHeaders() {
      if (!this.data.options.nestedHeaders) {
        this.data.options.nestedHeaders = []
      }
      this.dialogHotNestedHeadersVisible = true
    },
    setMainTableCalc() {
      if (!this.data.options.mainTableCalcs) {
        this.data.options.mainTableCalcs = []
      }
      this.dialogMainTableCalcVisible = true
    },
    setCellCalc() {
      if (!this.data.options.cellCalcs) {
        this.data.options.cellCalcs = []
      }
      this.dialogCellCalcVisible = true
    },
    hotHeaderDialogOk(isDialog) {
      if (this.data.options.colHeadersRelations) {
        let newColHeadersRelations = JSON.stringify(
          this.data.options.colHeadersRelations
        )
        this.data.options.colHeadersRelations = []
        this.data.options.colHeadersRelations = JSON.parse(
          newColHeadersRelations
        )
      }
      this.dialogHotHeaderDialogVisible = false
    },
    hotCrossMappingDialogOk() {
      this.dialogHotCrossMappingVisible = false
    },
    hotMainTableCalcDialogOk() {
      this.dialogMainTableCalcVisible = false
    },
    hotCellCalcDialogOk() {
      this.dialogCellCalcVisible = false
    },
    hotNestedHeadersDialogOk() {
      this.dialogHotNestedHeadersVisible = false
    },
    addHotCrossMapping() {
      this.data.options.crossMapping.push({
        toField: '',
        toIndex: 1,
        fromFields: [{fromSubTabPath: '', fromField: '', fromIndex: 1}]
      })
    },
    addHotCrossMappingField(field) {
      field.fromFields.push({
        fromSubTabPath: '',
        fromField: '',
        fromIndex: 1
      })
    },
    addHotMainTableCalc() {
      this.data.options.mainTableCalcs.push({
        name: '',
        mainField: '',
        sumField: ''
      })
    },
    addHotCellCalc() {
      this.data.options.cellCalcs.push({
        cellField: '',
        rowIndex: 1,
        mathExp: ''
      })
    },
    addHotNestedHeaders() {
      this.data.options.nestedHeaders.push({
        headers: [{name: '', startField: '', endField: ''}]
      })
    },
    hotHeaderRemove(item) {
      this.data.options.colHeadersRelations.remove(item)
    },
    hotCrossMappingRemove(item) {
      this.data.options.crossMapping.remove(item)
    },
    hotCrossMappingFiledRemove(field, item) {
      field.fromFields.remove(item)
    },
    hotMainTableCalcRemove(item) {
      this.data.options.mainTableCalcs.remove(item)
    },
    hotCellCalcRemove(item) {
      this.data.options.cellCalcs.remove(item)
    },
    hotMainTableCalcEdit(item) {
      this.currentHotColumnField = {}
      this.dialogHotCountVisible = true
      let _this = this
      setTimeout(function() {
        _this.$refs.mathDialog.mathExpAssign(item.script)
        _this.currentMainTableCalcField = item
      }, 0)
    },
    hotCellCalcEdit(item) {
      this.currentCellCalcField = {}
      this.dialogCellCountVisible = true
      let _this = this
      setTimeout(function() {
        _this.$refs.cellMathDialog.mathExpAssign(item.mathExp)
        _this.currentCellCalcField = item
      }, 0)
    },
    hotNestedHeadersRemove(item) {
      this.data.options.nestedHeaders.remove(item)
    },
    hotNestedHeadersItemAdd(headers) {
      headers.push({name: '', startField: '', endField: ''})
    },
    hotNestedHeadersItemRemove(headers, item) {
      headers.remove(item)
    },
    setHotMathExp(fillField) {
      this.currentMainTableCalcField = {}
      this.dialogHotCountVisible = true
      let _this = this
      setTimeout(function() {
        _this.$refs.mathDialog.mathExpAssign(fillField.column.mathExp)
        _this.currentHotColumnField = fillField
      }, 0)
    },
    setHotRowMathExp(fillField) {
      this.currentMainTableCalcField = {}
      this.dialogHotRowsCountVisible = true
      let _this = this
      setTimeout(function() {
        if (!fillField.column.rowMathExp) {
          fillField.column.rowMathExp = []
        }
        _this.$refs.mathRowDialog.mathExpAssign(fillField.column.rowMathExp)
        _this.currentHotColumnField = fillField
      }, 0)
    },
    setHotColumMathExp(exp) {
      if (Object.keys(this.currentMainTableCalcField) != 0) {
        this.currentMainTableCalcField.script = exp
      } else if (Object.keys(this.currentHotColumnField) != 0) {
        this.currentHotColumnField.column.mathExp = exp
      }
      this.$refs.mathDialog.mathExpAssign('')
    },
    setHotCellMathExp(exp) {
      if (Object.keys(this.currentCellCalcField) != 0) {
        this.currentCellCalcField.mathExp = exp
      }
      this.$refs.cellMathDialog.mathExpAssign('')
    },
    setHotColumRowMathExp(exp) {
      this.currentHotColumnField.column.rowMathExp = exp
      this.$refs.mathRowDialog.mathExpAssign([])
    },
    setHotColumType(item) {
      this.$refs.hotTableFieldDialog.handleOpen(item)
    },
    hotTableFieldSave(field) {},
    // 孙表对话框确定事件
    custDialogSunOk(isDialog) {
      //对话框返回值
      var mappingConf = []
      for (var key in this.custDialogprop) {
        mappingConf.push({
          from: key,
          target: [this.custDialogprop[key]]
        })
      }
      this.data.customDialogjson.custDialog.mappingConf = mappingConf
      this.dialogSunDialog = false
    },
    //打开设置孙表对话框返回值
    custDialogSunClick() {
      this.dialogSunDialog = true
      this.custDialogprop = null
      let tempGroup = {}
      var initConf = this.data.customDialogjson
      if (initConf.custDialog.mappingConf) {
        for (var i = 0, c; (c = initConf.custDialog.mappingConf[i++]); ) {
          if (!c) continue
          var target = c.target
          if (target) target = target.join(',')
          tempGroup[c.from] = target
        }
      }
      initConf.resultField.forEach(f => {
        if (!tempGroup[f.comment]) {
          tempGroup[f.comment] = ''
        }
      })
      this.custDialogprop = tempGroup
    },
    //数据视图控件方法
    dataViewClick() {
      if (!this.data.templateKey || this.data.templateKey == '') {
        this.$message.warning('请先选择表单列表')
        return
      }
      if (this.data.options.selectList) {
        this.selectList = JSON.parse(
          JSON.stringify(this.data.options.selectList)
        )
      }
      if (this.data.options.bindList) {
        this.bindList = JSON.parse(JSON.stringify(this.data.options.bindList))
      }
      this.dialogDataViewVisible = true
    },
    handleDataRemove() {
      //删除方法
      this.selectList = [{selectField: '', bindSelectd: ''}]
      this.bindList = [{fillField: '', bindFilld: ''}]
      this.data.templateObj = {}
    },
    confirmDataView() {
      //校验
      if (this.selectList && this.selectList.length > 0) {
        for (var i = 0; i < this.selectList.length; i++) {
          if (
            this.selectList[i].selectField == '' ||
            this.selectList[i].bindSelectd == ''
          ) {
            this.$message.warning(
              '关联查询第' + (i + 1) + '行表单字段、数据报表字段为空！'
            )
            return false
          }
        }
      }
      if (this.bindList && this.bindList.length > 0) {
        for (var i = 0; i < this.bindList.length; i++) {
          if (
            this.bindList[i].fillField == '' ||
            this.bindList[i].bindFilld == ''
          ) {
            this.$message.warning(
              '关联填充第' + (i + 1) + '行表单字段、数据报表字段为空！'
            )
            return false
          }
        }
      }
      let resField = this.isRepeat(this.selectList, 'selectField')
      if (!resField) {
        this.$message.warning('关联查询字段只能绑定唯一的表单字段')
        return false
      }
      let resultSelect = this.isRepeat(this.selectList, 'bindSelectd')
      if (!resultSelect) {
        this.$message.warning('关联查询字段只能绑定唯一的表单列表字段')
        return false
      }
      let resultFill = this.isRepeat(this.bindList, 'fillField')
      if (!resultFill) {
        this.$message.warning('关联填充字段只能绑定唯一的表单字段')
        return false
      }
      let resultBind = this.isRepeat(this.bindList, 'bindFilld')
      if (!resultBind) {
        this.$message.warning('关联填充字段只能绑定唯一的表单列表字段')
        return false
      }
      this.data.options.selectList = JSON.parse(JSON.stringify(this.selectList))
      this.data.options.bindList = JSON.parse(JSON.stringify(this.bindList))
      this.dialogDataViewVisible = false
    },
    isRepeat(arr, key) {
      var obj = {}
      for (let i = 0; i < arr.length; i++) {
        if (obj[arr[i][key]]) {
          return false
        } else {
          obj[arr[i][key]] = arr[i]
        }
      }
      return true
    },
    addSelectList() {
      if (this.tablefields) {
        for (let i = 0; i < this.tablefields.length; i++) {
          if (this.tablefields[i].nodeType == 'main') {
            let children = this.tablefields[i].children
            if (children) {
              if (this.selectList.length >= children.length) {
                this.$message.warning('不能添加更多的关联查询字段！')
                return false
              }
            }
          }
        }
      }
      let selectObj = {selectField: '', bindSelectd: ''}
      this.selectList.push(selectObj)
    },
    addBindList() {
      if (this.tablefields) {
        for (let i = 0; i < this.tablefields.length; i++) {
          if (this.tablefields[i].nodeType == 'main') {
            let children = this.tablefields[i].children
            if (children) {
              if (this.bindList.length >= children.length) {
                this.$message.warning('不能添加更多的关联填充字段！')
                return false
              }
            }
          }
        }
      }
      let bindObj = {fillField: '', bindFilld: ''}
      this.bindList.push(bindObj)
    },
    afterCustomDialogLoadData(data) {
      this.customDialogs = data
    },
    icons(icon) {
      this.data.options.customDialogjson.icon = icon
    },
    changeCustDialog() {
      this.custDialogprop = {}
      this.data.customDialogjson.custDialog.conditions = []
      this.data.customDialogjson.custDialog.conditions.custQueryJson = []
      this.data.customDialogjson.custDialog.mappingConf = []
      if (this.customDialogs.length == 0) return
      if (this.data.customDialogjson.custDialog.alias == null) {
        this.data.customDialogjson.custDialog.conditions = []
        return
      }
      for (var i = 0, d; (d = this.customDialogs[i++]); ) {
        if (d.alias == this.data.customDialogjson.custDialog.alias) {
          var treeData
          if (d.listDialog && d.listDialog.resultfield) {
            treeData = eval('(' + d.listDialog.resultfield + ')')
            this.data.customDialogjson.custDialog.type = 'combiDialog'
          }
          if (d.resultfield) {
            treeData = eval('(' + d.resultfield + ')')
            this.data.customDialogjson.custDialog.type = 'custDialog'
          }
          for (var q = 0, f; (f = treeData[q++]); ) {
            f.field = f.comment
          }
          this.data.customDialogjson.resultField = treeData
          var conditionList = eval('(' + d.conditionfield + ')')
          this.data.customDialogjson.custDialog.conditions = []
          //只处理类型等于1的对话框参数（defaultType：1：用户输入，2：固定值 ，3：参数传入）
          if (conditionList && conditionList.length > 0) {
            for (var j = 0, c; (c = conditionList[j++]); ) {
              if (c.defaultType == '3') {
                var has = false
                if (!has)
                  this.data.customDialogjson.custDialog.conditions.push(c)
              }
            }
          }
        }
      }
    },
    handleGridColumnRemove(index) {
      if (this.data.options.activeNames != undefined) {
        this.data.options.activeNames.remove(this.data.columns[index].idKey)
      }
      this.data.columns.splice(index, 1)
    },
    handleGridColumnAdd(type) {
      if (type == 'tab') {
        this.data.columns.push({
          span: '标签页' + (this.data.columns.length + 1),
          list: [],
          permission: '',
          permissionPath: ''
        })
      } else if (type == 'page') {
        this.data.columns.push({
          span: '分页' + (this.data.columns.length + 1),
          list: []
        })
      } else if (type == 'collapse') {
        this.data.columns.push({
          span: '折叠面板' + (this.data.columns.length + 1),
          idKey: Date.parse(new Date()) + utils.getName(),
          isOpen: false,
          list: []
        })
      } else {
        this.data.columns.push({
          span: '',
          list: []
        })
      }
    },
    switchChange(item) {
      if (eval(item.isOpen)) {
        this.data.options.activeNames.push(item.idKey)
      } else {
        this.data.options.activeNames.remove(item.idKey)
      }
    },
    subTableChange(value, data) {
      this.data.name = data.name
      this.data.list = []
      this.data.desc = data.desc
      this.data.options.subTablePath = data.path
      if (data.show == '子实体') {
        this.data.options.subDivTablePath = data.path
      }
      this.data.options.relation = data.relation
      if (this.data.ctrlType == 'hottable' && data.children) {
        let fields = []
        let list = []
        for (let index = 0; index < data.children.length; index++) {
          let child = data.children[index]
          let columnPropertis = {
            data: child.name,
            readOnly: false,
            readOnlyRows: '',
            required: false,
            requiredRows: '',
            mergeCell: false,
            type: 'text',
            source: [],
            dateFormat: '',
            mathExp: '',
            rowMathExp: [],
            width: 90,
            style: {
              size: 0,
              color: '',
              bold: false,
              background: '',
              diyStyle: ''
            }
          }
          fields.push({
            name: child.name,
            desc: child.comment,
            column: columnPropertis
          })
          let listField = {options: {}}
          listField.boDefId = child.boDefId
          listField.boAttrId = child.id
          listField.fieldPath = child.path + '.' + child.name
          listField.name = child.name
          listField.desc = child.desc
          listField.title = child.desc
          listField.entId = child.entId
          listField.boDefAlias = child.boDefAlias
          listField.tableName = child.tableName
          listField.columnType = child.columnType
          if (child.dataType == 'date') {
            listField.options.format = child.format
            listField.options.inputFormat = child.format
          } else if (child.dataType == 'number') {
            listField.options.maxDecimalDigits = child.decimalLen
            listField.options.decimalDigits = child.decimalLen
          }
          list.push(listField)
        }
        this.data.list = list
        this.data.options.colHeadersRelations = fields
      }
    },
    addRelation() {
      this.relationVisible = true
      this.relations = []
      this.data.list.forEach(item => {
        if (item.options.mapping) {
          this.relations.push({
            key_: item.name,
            value_: item.options.mapping
          })
        }
      })
    },
    add() {
      this.relations.push({
        key_: '',
        value_: ''
      })
    },
    remove(index) {
      this.relations.splice(index, 1)
    },
    submit() {
      let flag = false
      let map = new Map()
      this.relations.forEach(item => {
        if (!item.key_ || !item.value_) {
          flag = true
        }
        map.set(item.key_, item.value_)
      })
      if (flag) {
        this.$message('映射关系不能为空')
        return
      }
      this.data.list.forEach(item => {
        if (map.has(item.name)) {
          item.options.mapping = map.get(item.name)
        } else {
          delete item.options.mapping
        }
      })
      this.relationVisible = false
    },
    initHotTableData() {
      this.$refs.hotSubDialog.showDialog()
    },
    hotTableInitData(initData) {
      this.data.options.initFillbackData = initData
    },
    up(index, data) {
      if (index === 0) {
        this.$message({
          message: '已经是列表中第一位',
          type: 'warning'
        })
      } else {
        let temp = data[index - 1]
        this.$set(data, index - 1, data[index])
        this.$set(data, index, temp)
      }
    },
    down(index, data) {
      if (index === data.length - 1) {
        this.$message({
          message: '已经是列表中最后一位',
          type: 'warning'
        })
      } else {
        this.isTransition = true
        let i = data[index + 1]
        this.$set(data, index + 1, data[index])
        this.$set(data, index, i)
      }
    },
    handleTableTdClose(rowIndex, colIndex) {
      const tempRow = this.data.rows[rowIndex]
      if (tempRow.cols.length > 1) {
        if (colIndex > 0) {
          tempRow.cols[colIndex - 1].colspan += 1
        } else if (colIndex == 0 && tempRow.cols.length > 1) {
          tempRow.cols[colIndex + 1].colspan += 1
        }
        tempRow.cols.splice(colIndex, 1)
      } else {
        const rows = this.data.rows
        rows.splice(rowIndex, 1)
        this.$set(this.data, 'rows', rows)
      }
    },
    tableOperation(oType, dType) {
      const rows = this.data.rows
      if (dType == 'row') {
        let rowIndex =
          oType == 'add' ? this.tableTempAddRowIndex : this.tableTempDelRowIndex
        if (!rowIndex) {
          this.$message({
            message: '请输入具体下标（大于0）。',
            type: 'warning'
          })
          return
        }
        if (
          (oType == 'add' && rowIndex > rows.length + 1) ||
          (oType == 'del' && rowIndex > rows.length)
        ) {
          this.$message({
            message: '行下标超出范围，当前最大值为：' + rows.length,
            type: 'warning'
          })
          return
        }
        if (oType == 'add') {
          rows.splice(rowIndex - 1, 0, this.getTableRowInit(rows[0].cols))
        } else if (oType == 'del') {
          rows.splice(rowIndex - 1, 1)
        }
        this.$set(this.data, 'rows', [...rows])
      } else if (dType == 'col') {
        let celIndex =
          oType == 'add' ? this.tableTempAddColIndex : this.tableTempDelColIndex
        if (!celIndex) {
          this.$message({
            message: '请输入具体下标（大于0）。',
            type: 'warning'
          })
          return
        }
        let colslen = 0
        rows[0].cols.forEach(_item => {
          colslen += _item.colspan
        })
        if (
          (oType == 'add' && celIndex > colslen + 1) ||
          (oType == 'del' && celIndex > colslen)
        ) {
          this.$message({
            message: '列下标超出范围，当前最大值为：' + colslen,
            type: 'warning'
          })
          return
        }
        if (oType == 'add') {
          rows.forEach(item => {
            let cols = item.cols
            cols.splice(celIndex - 1, 0, {colspan: 1, list: []})
          })
        } else if (oType == 'del') {
          let countColSpan = 0
          rows.forEach(item => {
            countColSpan = 0
            let _celIndex = celIndex - 1

            let removeColIndex = 0
            // 中间的删除
            let modifyColspan = false
            item.cols.forEach(_item => {
              countColSpan += _item.colspan
              if (countColSpan >= _celIndex + 1) {
                if (_item.colspan > 1) {
                  //_item.list.pop();
                  _item.colspan = _item.colspan - 1
                  modifyColspan = true
                } else {
                  if (removeColIndex == 0) {
                    removeColIndex = _celIndex
                  }
                }
              }
            })
            if (removeColIndex != 0 && !modifyColspan) {
              if (removeColIndex >= item.cols.length) {
                removeColIndex = item.cols.length - 1
              }
              item.cols.splice(removeColIndex, 1)
            }
          })
        }
        this.$nextTick(() => {
          this.$set(this.data, 'rows', [...rows])
        })
      }
    },
    getTableRowInit(cols) {
      let size = 2
      if (cols && cols.length > 0) {
        size = 0
        cols.forEach(col => {
          size += col.colspan
        })
      }
      let row = {cols: []}
      for (let i = 0; i < size; i++) {
        row.cols.push({colspan: 1, list: []})
      }
      return {...row}
    },
    isFill(column) {
      if (
        column.readOnly ||
        column.readOnlyRows ||
        column.required ||
        column.requiredRows ||
        column.mergeCell ||
        column.dateFormat ||
        column.style.background ||
        column.style.color ||
        column.style.bold ||
        column.style.size !== 0 ||
        column.style.diyStyle
      ) {
        return true
      }
      return false
    },
    handleTableCol(rowIndex, colIndex) {
      let rows = this.data.rows
      if (rows.length == 1 && rows[rowIndex].cols.length == 1) {
        this.$message({message: '最后一行不能删除！', type: 'warning'})
        return
      }
      if (rows[rowIndex].cols.length == 1) {
        rows.splice(rowIndex, 1)
      } else if (rows[rowIndex].cols.length > 1) {
        if (colIndex > 0) {
          rows[rowIndex].cols[colIndex - 1].colspan =
            rows[rowIndex].cols[colIndex - 1].colspan +
            rows[rowIndex].cols[colIndex].colspan
        } else {
          rows[rowIndex].cols[colIndex + 1].colspan =
            rows[rowIndex].cols[colIndex + 1].colspan +
            rows[rowIndex].cols[colIndex].colspan
        }
        rows[rowIndex].cols.splice(colIndex, 1)
      }
      this.$set(this.data, 'rows', [...rows])
    },
    // 打开子表导入数据合并代码的编辑对话框
    openSubImportMergeDialog() {
      this.$refs.subImportMergeDialog && this.$refs.subImportMergeDialog.open()
    },
    // 更新子表导入数据合并代码
    handleUpdateExpression(expression) {
      this.$set(this.data, 'subtableImportMergeExp', expression)
    },
    tableHasColspan(rowIndex) {
      let row = this.data.rows[rowIndex]
      let showAdd = false
      row.cols.forEach(td => {
        if (td.colspan > 1) {
          showAdd = true
          return true
        }
      })
      return showAdd
    },
    tableAddTd(rowIndex) {
      let row = this.data.rows[rowIndex]
      let canAdd = false
      for (let index = row.cols.length - 1; index >= 0; index--) {
        const col = row.cols[index]
        if (col.colspan > 1) {
          --col.colspan
          this.data.rows[rowIndex].cols.push({colspan: 1, list: []})
          return
        }
      }
      this.$message({
        message: '当前行列数已达上限，请按整列添加！',
        type: 'warning'
      })
    }
  }
}
</script>
<style lang="scss" scoped>
@import '@/assets/css/form-editor.scss';
@import '@/assets/css/element-variables.scss';

>>> .el-dialog__body {
  /*padding: 10px !important;*/
  color: #606266;
  font-size: 14px;
  word-break: break-all;
}
.column-ul {
  list-style: none;
  padding: 0;
  margin: 4px 0 0 0;
}

.column-ul li {
  margin-bottom: 5px;
}

.column-ul .icon-draggable {
  font-weight: bold;
  font-size: 18px;
  cursor: move;
  margin-right: 8px;
}

.grid-remove-button {
  margin-left: 50px;
}

.ghost {
  background: #f56c6c;
  border: 2px solid #f56c6c;
  outline-width: 0;
  height: 3px;
  box-sizing: border-box;
  font-size: 0;
  content: '';
  overflow: hidden;
  padding: 0;
}

.property-empty {
  text-align: center;
  width: 100%;
  margin-top: 150px;
  font-size: 16px;
  color: #ccc;
}
.linkageTable-tr td {
  text-align: center;
}
.custDialog-div {
  height: 28px;
  line-height: 28px;
  margin-bottom: 3px;
  float: left;
}
.custDialog-div .custDialog-btn {
  float: right;
  margin-right: 15px;
}
.custDialog-table td {
  padding: 5px;
}
>>> .custDialog-item {
  margin-bottom: 5px;
}

.basics-property .el-form-item {
  margin-bottom: 0px;
}
.linkageTable-tr td {
  text-align: center;
}
.basics-property >>> .el-form-item {
  margin-bottom: 0px;
}
.basics-label >>> .el-form-item__label {
  text-align: center;
}
.hottable_btn_row {
  margin: 5px;
}
.el-tag + .el-tag {
  margin-left: 10px;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
.subimport-mergedialog_button {
  margin-left: 10px;
}
.tableUl {
  padding-inline-start: 10px;
}
.tableTdAddBt {
  padding: 3px;
  margin-left: 5px;
}
.table-switch {
  /deep/ .el-switch__label {
    margin-top: -13px;
  }
}
</style>
