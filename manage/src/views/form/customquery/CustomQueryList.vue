<template>
  <div class="fullheight">
    <!-- 关联查询数据 -->
    <ht-table
      @load="loadData"
      :data="data"
      :pageResult="pageResult"
      quick-search-props="name,alias"
      :defaultSorter="[{'property':'CREATE_TIME_','direction':'DESC'}]"
      :show-export="false"
      ref="htTable"
      @row-click="rowClick"
    >
      <template v-slot:toolbar>
        <el-button-group>
          <el-button size="small" @click="showDialog('add')" icon="el-icon-plus">添加</el-button>
          <el-button size="small" @click="uploadDialogVisible = true;" icon="el-icon-back">导入</el-button>
          <el-button size="small" @click="handleExport" icon="el-icon-right">导出</el-button>
          <ht-delete-button :url="deleteUrl" :htTable="$refs.htTable" style="margin:0;">删除</ht-delete-button>
        </el-button-group>
      </template>
      <template>
        <ht-table-column type="index" width="50" align="center" label="序号" />
        <ht-table-column label="名称" prop="name" :sortable="true" :show-overflow-tooltip="true">
          <template v-slot="{ row }">
            <el-link @click="showDialog('edit', row.id)" type="primary" title="编辑详情">{{ row.name }}</el-link>
          </template>
        </ht-table-column>
        <ht-table-column prop="alias" width="120" label="别名" :sortable="true" />
        <ht-table-column
          prop="dsType"
          label="数据来源"
          width="110"
          :filters="[
            { text: '数据源', value: 'dataSource' },
            { text: 'REST接口', value: 'restful' }
          ]"
        >
          <template v-slot="{ row }">
            <el-tag type="info" v-if="row.dsType == 'dataSource'">数据源</el-tag>
            <el-tag type="success" v-if="row.dsType == 'restful'">REST接口</el-tag>
          </template>
        </ht-table-column>
        <ht-table-column prop="objName" label="对象名称" width="200" :sortable="true" />
        <ht-table-column prop="dsalias" label="数据源的别名" width="130" :sortable="true" />
        <ht-table-column width="250" label="操作">
          <template v-slot="{ row }">
            <el-dropdown
              size="mini"
              split-button
              @command="handleCommond"
              @click="handleCommond({ row: row, command: 'preview' })"
            >
              <span>
                <i class="el-icon-view"></i>预览
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item
                  icon="el-icon-plus"
                  :command="{ row: row, command: 'dialog' }"
                >添加为对话框</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </ht-table-column>
      </template>
    </ht-table>
    <!-- 添加编辑关联查询 -->
    <el-dialog
      width="70%"
      top="6vh"
      :title="title"
      :visible="dialogVisible"
      :before-close="handleClose"
      :close-on-click-modal="false"
      append-to-body
    >
      <el-form
        style="width:100%;height: 500px;"
        :model="treeSidebarData"
        :inline="true"
        data-vv-scope="editCustomQueryList"
      >
        <ht-form-item label="名称" label-width="120px">
          <ht-input
            v-model="treeSidebarData.name"
            class="ht"
            placeholder="请输入名称"
            autocomplete="off"
            validate="required"
            :maxlength="50"
            :showWordLimit="true"
          ></ht-input>
        </ht-form-item>
        <ht-form-item label="别名" label-width="120px">
          <ht-input
            v-model="treeSidebarData.alias"
            class="ht"
            v-pinyin="treeSidebarData.name"
            placeholder="请输入别名"
            autocomplete="off"
            :validate="{ required: true, regex:{exp:'^[a-zA-Z][a-zA-Z0-9_]*$', message:'只能输入字母、数字、下划线，且以字母开头' } }"
            :disabled="treeSidebarData.id ? true : false"
            :maxlength="50"
            :showWordLimit="true"
          ></ht-input>
        </ht-form-item>

        <ht-form-item label="分页大小" label-width="120px" v-if="treeSidebarData.needPage == 1">
          <ht-input
            v-model="treeSidebarData.pageSize"
            class="ht"
            placeholder="请输入分页大小"
            autocomplete="off"
            :validate="{ required: true, numeric: true, max_value: 500 }"
          >
            <template slot="append">
              <el-tooltip slot="label" effect="dark" content="关联查询时固定按照该分页大小返回第一页数据，分页大小上限为500。">
                <i class="icon-question"></i>
              </el-tooltip>
            </template>
          </ht-input>
        </ht-form-item>

        <ht-form-item label="数据来源" label-width="120px">
          <ht-radio
            v-model="treeSidebarData.dsType"
            class="ht"
            :readonly="disabled"
            :options="[
              { key: 'dataSource', value: '数据源' },
              { key: 'restful', value: 'REST接口' }
            ]"
          />
        </ht-form-item>
        <!-- 数据源配置 -->
        <div v-show="treeSidebarData.dsType == 'dataSource'">
          <ht-form-item label="数据源" v-if="!treeSidebarData.id" label-width="120px">
            <ht-select
              class="ht"
              v-model="treeSidebarData.dsalias"
              :options="dataSourcesInBean"
              :props="{ key: 'alias', value: 'name' }"
            />
          </ht-form-item>
          <ht-form-item label="查询表(视图)" v-if="!treeSidebarData.id" label-width="120px">
            <ht-select
              style="width:100px;"
              v-model="treeSidebarData.isTable"
              :options="isTableList"
            />&nbsp;&nbsp;
            <ht-input
              v-model="objName"
              style="width:170px;"
              placeholder="请输入表或视图名称"
              autocomplete="off"
            ></ht-input>&nbsp;&nbsp;
            <el-button type="primary" @click="getByDsObjectName">查 询</el-button>
          </ht-form-item>
          <ht-form-item label="选择表或视图" label-width="120px">
            <ht-select
              v-show="!treeSidebarData.id"
              v-model="treeSidebarData.objName"
              :options="tableOrViewList"
              :remote-method="getByDsObjectName"
              :props="{ key: 'name', value: 'comment' }"
            />&nbsp;&nbsp;
            <label v-if="treeSidebarData.id">
              对象名称：{{ treeSidebarData.objName }}&nbsp;&nbsp;所属数据源：{{
              treeSidebarData.dsalias
              }}
            </label>&nbsp;&nbsp;
            <el-button type="primary" v-if="treeSidebarData.objName" @click="showSettingDialog">设置列</el-button>
          </ht-form-item>
        </div>
        <!-- restful配置 -->
        <div v-if="treeSidebarData.dsType == 'restful'">
          <ht-form-item label="请求地址" label-width="120px">
            <ht-input
              v-model="treeSidebarData.url"
              class="ht"
              placeholder="请输入请求地址"
              autocomplete="off"
              validate="required"
            >
              <template slot="append">
                <el-tooltip
                  slot="label"
                  effect="dark"
                  content="Restful接口地址，若要请求当前系统的某个微服务，以${服务名称}为前缀，如：${form}/base/tools/v1/getPinyin"
                >
                  <i class="icon-question"></i>
                </el-tooltip>
              </template>
            </ht-input>
          </ht-form-item>
          <ht-form-item label="请求类型" label-width="120px">
            <ht-radio
              v-model="treeSidebarData.requestType"
              class="ht"
              :options="[
                { key: 'POST', value: 'POST' },
                { key: 'GET', value: 'GET' }
              ]"
            />
          </ht-form-item>
          <ht-form-item label-width="120px" label="接口头部">
            <ht-input
              v-model="treeSidebarData.header"
              class="ht"
              placeholder="请求接口的头部信息"
              autocomplete="off"
            >
              <template slot="append">
                <el-tooltip
                  slot="label"
                  effect="dark"
                  content="接口头部（header）为JSON格式，如：{'Authorization':'Bearer eyJhbGciOiJIUzUxMiJ9'}"
                >
                  <i class="icon-question"></i>
                </el-tooltip>
              </template>
            </ht-input>
          </ht-form-item>
          <ht-form-item
            label="页号(key)"
            label-width="120px"
            v-if="
              treeSidebarData.requestType == 'POST' &&
                treeSidebarData.needPage == 1
            "
          >
            <ht-input
              v-if="treeSidebarData.needPage == 1"
              v-model="treeSidebarData.pageKey"
              class="ht"
              placeholder="请输入页号"
              autocomplete="off"
              validate="required"
            ></ht-input>
          </ht-form-item>
          <ht-form-item
            label="分页大小(key)"
            label-width="120px"
            v-if="
              treeSidebarData.requestType == 'POST' &&
                treeSidebarData.needPage == 1
            "
          >
            <ht-input
              v-model="treeSidebarData.pageSizeKey"
              class="ht"
              placeholder="请输入分页大小"
              autocomplete="off"
              validate="required"
            ></ht-input>
          </ht-form-item>
          <ht-form-item
            label="总条数(key)"
            label-width="120px"
            v-if="
              treeSidebarData.requestType == 'POST' &&
                treeSidebarData.needPage == 1
            "
          >
            <ht-input
              v-model="treeSidebarData.totalKey"
              class="ht"
              placeholder="请输入总条数"
              autocomplete="off"
              validate="required"
            ></ht-input>
          </ht-form-item>
          <ht-form-item label="列表(key)" label-width="120px">
            <ht-input
              v-model="treeSidebarData.listKey"
              class="ht"
              placeholder="列表所对应key"
              autocomplete="off"
            >
              <template slot="append">
                <el-tooltip
                  slot="label"
                  effect="dark"
                  content="如果返回的数据为复杂结构，请输入列表数据的key(支持多级嵌套结构，例如result.rows)"
                >
                  <i class="icon-question"></i>
                </el-tooltip>
              </template>
            </ht-input>
          </ht-form-item>
          <ht-form-item label="参数配置" label-width="120px">
            <el-button type="primary" @click="showSettingDialog">设置参数</el-button>
          </ht-form-item>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <ht-submit-button
          :url="saveUrl"
          :model="treeSidebarData"
          scope-name="editCustomQueryList"
          @before-save-data="beforeSaveData"
          @after-save-data="afterSaveData"
          :isSubmit="isSubmit"
        >{{ $t("eip.common.save") }}</ht-submit-button>
        <el-button @click="handleClose">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 设置列 -->
    <ht-sidebar-dialog
      width="100%"
      :title="titleSetting"
      class="cd-column__dialog"
      :visible="dialogVisibleSetting"
      :before-close="close"
      :close-on-click-modal="false"
      append-to-body
      :show-close="false"
    >
      <template v-slot:title>
        <div class="flex" style="justify-content: space-between;width: 100%;">
          <div style="float: left;width: 100%;">
            <el-page-header style="float: left;" @back="close" :content="titleSetting"></el-page-header>
            <el-button
              style="float: left;margin-left: 20px;"
              type="success"
              @click="addFields"
              v-if="treeSidebarData.dsType!='dataSource'"
              icon="el-icon-plus"
            >添加字段</el-button>
            <el-button style="float: right;" type="primary" @click="save" icon="el-icon-check">保 存</el-button>
          </div>
        </div>
      </template>
      <el-form data-vv-scope="settingSave" class="form-table__wrap">
        <el-row :gutter="20" class="form-table__row">
          <el-col :span="7" class="form-table__left">
            <el-table
              :data="table.columnList"
              @selection-change="handleSelectionChange"
              border
              ref="htTableSetting"
            >
              <el-table-column type="selection" width="40" />
              <el-table-column
                v-if="treeSidebarData.dsType == 'dataSource'"
                prop="fieldName"
                key="1"
                label="字段"
                width="150"
              />
              <el-table-column
                v-if="treeSidebarData.dsType != 'dataSource'"
                key="1"
                label="字段"
                width="150"
              >
                <template v-slot="{ row }">
                  <ht-input
                    v-model="row.fieldName"
                    placeholder="请输入字段"
                    autocomplete="off"
                    validate="required"
                    :maxlength="50"
                  ></ht-input>
                </template>
              </el-table-column>
              <el-table-column label="注解" key="3">
                <template v-slot="{ row }">
                  <ht-input
                    v-model="row.comment"
                    style="width:100%;"
                    placeholder="请输入注解"
                    autocomplete="off"
                    validate="required"
                    :maxlength="50"
                  ></ht-input>
                </template>
              </el-table-column>
              <el-table-column label="类型" prop="columnType" width="80" key="4" />
              <el-table-column
                label="操作"
                width="100"
                v-if="treeSidebarData.dsType != 'dataSource'"
                key="2"
              >
                <template v-slot="{ row, $index }">
                  <el-button
                    size="mini"
                    type="danger"
                    icon="el-icon-delete"
                    @click="deleteSetting(table.columnList, $index)"
                  >删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-col>
          <el-col :span="1">
            <el-button
              type="primary"
              circle
              icon="icon-hide"
              :title="addColumnsTitle"
              style="-webkit-transform: rotate(270deg);transform: rotate(270deg)"
              @click="addColumns"
            />
          </el-col>
          <el-col :span="16" class="form-table__right">
            <el-tabs v-model="tabStatus" @tab-click="handleTabSwitch" type="border-card">
              <el-tab-pane label="返回字段" name="return">
                <div v-if="treeSidebarData.dsType != 'dataSource'">
                  <el-tag type="warning">如果返回的数据为复杂的JSON结构，可以指定列表（key）字段，当前返回字段为列表中的字段。</el-tag>
                  <ol class="guide-ol">
                    <li>
                      例如返回的数据为：
                      <code>{state: true, message: "数据请求成功", result: {page: 1, size:20, total: 200, rows: [{name: "name1",age: 20},{name: "name2",age: 18}]}}</code>
                    </li>
                    <li>
                      指定列表（key）字段为
                      <code>result.rows</code>，现在返回字段就可以指定
                      <code>{name: "name1",age: 20}</code>中的字段，如：
                      <code>name</code>或者
                      <code>age</code>
                    </li>
                  </ol>
                  <br />
                </div>
                <el-table :data="treeSidebarData.resultfield" border>
                  <el-table-column prop="field" label="字段名" width="200">
                    <template v-slot="{ row }">
                      <ht-input
                        :permission="treeSidebarData.dsType != 'dataSource' ? 'w':'r'"
                        v-model="row.field"
                        placeholder="返回的字段名"
                        autocomplete="off"
                        validate="required"
                        :maxlength="50"
                        :showWordLimit="true"
                      ></ht-input>
                    </template>
                  </el-table-column>
                  <el-table-column label="返回名称">
                    <template v-slot="{ row }">
                      <ht-input
                        v-model="row.comment"
                        placeholder="请输入返回名称"
                        autocomplete="off"
                        validate="required"
                        :maxlength="50"
                        :showWordLimit="true"
                      ></ht-input>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="100">
                    <template v-slot="{ row, $index }">
                      <el-button
                        size="mini"
                        type="danger"
                        icon="el-icon-delete"
                        @click="
                          deleteSetting(treeSidebarData.resultfield, $index)
                        "
                      >删除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>
              <el-tab-pane label="条件字段" name="condition">
                <el-table :data="treeSidebarData.conditionfield" border>
                  <el-table-column label="字段名" width="130">
                    <template v-slot="{ row }">
                      <ht-input
                        :permission="treeSidebarData.dsType != 'dataSource' ? 'w':'r'"
                        v-model="row.field"
                        placeholder="字段名"
                        autocomplete="off"
                        validate="required"
                        :maxlength="50"
                      ></ht-input>
                    </template>
                  </el-table-column>
                  <el-table-column label="显示名" width="130">
                    <template v-slot="{ row }">
                      <ht-input
                        v-model="row.comment"
                        placeholder="请输入显示名"
                        autocomplete="off"
                        validate="required"
                        :maxlength="50"
                      ></ht-input>
                    </template>
                  </el-table-column>
                  <el-table-column
                    label="条件"
                    width="120"
                    v-if="treeSidebarData.dsType == 'dataSource'"
                  >
                    <template v-slot="{ row }">
                      <ht-select
                        v-show="row.dbType == 'number' || row.dbType == 'int'"
                        v-model="row.condition"
                        :options="number_opList"
                        :validate="{ required: true }"
                      />
                      <ht-select
                        v-show="row.dbType == 'varchar' || row.dbType == 'clob'"
                        v-model="row.condition"
                        :options="string_opList"
                        :validate="{ required: true }"
                      />
                      <ht-select
                        v-show="row.dbType == 'date'"
                        v-model="row.condition"
                        :options="date_opList"
                        :validate="{ required: true }"
                      />
                    </template>
                  </el-table-column>
                  <el-table-column label="值来源" width="130">
                    <template v-slot="{ row }">
                      <ht-select
                        v-show="treeSidebarData.style != '1'"
                        v-model="row.defaultType"
                        :options="value_sourceList_list"
                        @change="sourceListChang(row)"
                        :validate="{ required: true }"
                      />
                      <ht-select
                        v-show="treeSidebarData.style == '1'"
                        v-model="row.defaultType"
                        @change="sourceListChang(row)"
                        :options="value_sourceList_tree"
                        :validate="{ required: true }"
                      />
                    </template>
                  </el-table-column>
                  <el-table-column label="默认值">
                    <template v-slot="{ row }">
                      <ht-input
                        type="textarea"
                        v-if="row.dbType != 'date' && row.defaultType == 2"
                        :autosize="{ minRows: 1, maxRows: 4 }"
                        v-model="row.defaultValue"
                        placeholder="请输入默认值"
                        autocomplete="off"
                        :validate="{'required':row.defaultType == '2'}"
                        :maxlength="200"
                        :showWordLimit="true"
                      ></ht-input>
                      <ht-date
                        v-if="row.dbType == 'date'"
                        v-model="row.defaultValue"
                        :validate="{'required':row.defaultType == '2'}"
                        format="yyyy-MM-dd"
                      />
                      <div v-if="row.dbType == 'date' && row.condition == 'BETWEEN'">
                        <ht-date
                          v-model="row.endDate"
                          placeholder="选择结束日期"
                          :validate="{'required':row.defaultType == '2'}"
                          format="yyyy-MM-dd"
                        />
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column label="控件类型" width="140">
                    <template v-slot="{ row }">
                      <ht-select
                        v-if="
                          row.defaultType == '1'
                            ? (row.controllerType = '1')
                            : (row.controllerType = '')
                        "
                        v-model="row.controllerType"
                        :options="param_ctList"
                        :validate="{ required: true }"
                      />
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="100">
                    <template v-slot="{ row, $index }">
                      <el-button
                        size="mini"
                        type="danger"
                        icon="el-icon-delete"
                        @click="
                          deleteSetting(treeSidebarData.conditionfield, $index)
                        "
                      >删除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>
              <el-tab-pane
                label="POST请求参数"
                name="dataParam"
                v-if="treeSidebarData.dsType != 'dataSource' && treeSidebarData.requestType == 'POST'"
              >
                <div style="min-height: 320px;">
                  <el-tag type="warning">以POST方式请求接口时传入的参数，参数中可以通过${field}传入条件字段中定义的参数。</el-tag>
                  <VariablesSelector
                    :data="treeSidebarData.conditionfield"
                    node-key="field"
                    :props="{label:'comment', children: 'children'}"
                    @node-click="handleVarSelectorClick"
                  />
                  <codemirror
                    ref="dataParamCode"
                    v-model="treeSidebarData.dataParam"
                    :options="cmOptions"
                    class="code"
                    style="width: 95%;min-height:270px;"
                  ></codemirror>
                </div>
              </el-tab-pane>
              <el-tab-pane label="排序字段" name="order" v-if="treeSidebarData.dsType == 'dataSource'">
                <el-table :data="treeSidebarData.sortfield" border>
                  <el-table-column prop="field" label="字段名" width="200" />
                  <el-table-column prop="comment" label="注解" width="200" />
                  <el-table-column label="排序类型">
                    <template v-slot="{ row }">
                      <ht-select
                        v-model="row.sortType"
                        :options="sort_typeList"
                        :validate="{ required: true }"
                      />
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="100">
                    <template v-slot="{ row, $index }">
                      <el-button
                        size="mini"
                        type="danger"
                        icon="el-icon-delete"
                        @click="
                          deleteSetting(treeSidebarData.sortfield, $index)
                        "
                      >删除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>
              <el-tab-pane
                label="自定义SQL"
                name="custom"
                v-if="treeSidebarData.dsType == 'dataSource'"
              >
                <el-checkbox v-model="isSqlBuildType">
                  自定义SQL
                  <el-tooltip class="item" effect="dark" placement="top">
                    <div slot="content">
                      <ul>
                        <li>
                          自定义SQL
                          <ul>
                            <li>if(map.get('ACTDEFID')!=null){</li>
                            <li>return 'select * from where ACTDEFID like '%'+map.get('ACTDEFID')+'%'' ;</li>
                            <li>}</li>
                            <li>其中的map为系统所封装的一个参数</li>
                            <li>
                              在脚本中使用map.get('ACTDEFID')可以获取表单提交时所携带的ACTDEFID参数值，
                              脚本应拼接并返回任意的可执行的sql语句;同时，sql语句字段返回应该包含我们定义的
                              返回字段，和显示字段，通常使用select * from的方式保证需求字段都在这个查询里面
                            </li>
                          </ul>
                        </li>
                      </ul>
                    </div>
                    <i class="icon-question" style="margin-right: 8px" />
                  </el-tooltip>
                </el-checkbox>
                <ht-select
                  v-model="selectOp"
                  @change="changeOptions()"
                  :options="selectOptions"
                  :props="{key:'field', value:'comment'}"
                ></ht-select>
                <br />
                <br />
                <!--<el-button @click="getScriptList">常用脚本</el-button>-->
                <el-input
                  type="textarea"
                  :autosize="{ minRows: 12 }"
                  placeholder="请输入内容"
                  v-model="treeSidebarData.diySql"
                  @input="diySqlChange($event)"
                ></el-input>
              </el-tab-pane>
            </el-tabs>
          </el-col>
        </el-row>
      </el-form>
    </ht-sidebar-dialog>
    <!-- 关联查询预览 -->
    <custom-query-show ref="customQueryShow" />
    <!--导入功能上传-->
    <el-dialog title="上传文件" :visible="uploadDialogVisible" :before-close="beforeClose"  name="uploadDialog" width="40%" custom-class="upload-dialog"
      top="30vh">
      <el-upload :action="uploadUrl" :http-request="handleImport" accept=".zip" 
      :file-list="fileList" :limit="1" :auto-upload="false" ref="elUpload" class="upload-dialog__content">
        <el-button size="small" icon="el-icon-upload">点击上传</el-button>
        <div slot="tip" class="el-upload__tip">只能上传zip文件</div>
      </el-upload>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="uploadSubmit" >上传</el-button>
        <el-button type="default" @click="beforeClose">取消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { Message } from "element-ui";
import req from "@/request.js";
const customQueryShow = () =>
  import("@/views/form/customquery/CustomQueryShow.vue");
const VariablesSelector = () =>
  import("@/components/common/VariablesSelector.vue");
import form from "@/api/form.js";
export default {
  components: { customQueryShow, VariablesSelector },
  computed: {
    //删除关联查询数据的URL
    deleteUrl: function () {
      return window.context.form + "/form/customQuery/v1/removes";
    },
    //保存关联查询数据的URL （关联查询新增修改时）
    saveUrl: function () {
      return window.context.form + "/form/customQuery/v1/save";
    },
    addColumnsTitle: function () {
      let statusWord = "";
      switch (this.tabStatus) {
        case "condition":
          statusWord = "条件";
          break;
        case "return":
          statusWord = "返回";
          break;
        case "order":
          statusWord = "排序";
          break;
      }
      return `将左侧所选字段添加到${statusWord}字段中`;
    },
  },
  data() {
    return {
      isSqlBuildType: false,
      isSubmit: true, //侧边栏是否提交
      number_opList: [
        { value: "等于", key: "EQ" },
        { value: "大于等于", key: "GE" },
        { value: "大于", key: "GT" },
        { value: "小于", key: "LT" },
        { value: "小于等于", key: "LE" },
        { value: "in", key: "IN" },
      ], //运算条件数组-number
      string_opList: [
        { value: "等于", key: "EQ" },
        { value: "like", key: "LK" },
        { value: "likeEnd", key: "LFK" },
        { value: "in", key: "IN" },
      ], //运算条件数组-varchar
      date_opList: [
        { value: "等于", key: "EQ" },
        // { value: "between", key: "BETWEEN" },
        { value: "大于等于", key: "GE" },
        { value: "小于等于", key: "LE" },
      ], //运算条件数组-日期
      value_sourceList_list: [
        { value: "参数传入", key: "1" },
        { value: "固定值", key: "2" },
      ], //值来源数组_列表
      value_sourceList_tree: [
        { value: "固定值", key: "2" },
        { value: "动态传入", key: "4" },
      ], //值来源数组_树
      sort_typeList: [
        { value: "升序", key: "asc" },
        { value: "降序", key: "desc" },
      ], //排序字段升序还是降序
      param_ctList: [{ value: "单行文本框", key: "1" }], //控制器的类型
      tabStatus: "return", //设置列的条件字段、返回字段等的tabs标签页
      table: {}, //获取设置列获取字段信息
      titleSetting: "未命名-设置列", //设置列侧边栏的名称
      dialogVisibleSetting: false, //是否显示可配置设置列
      disabled: false, //是否禁止操作
      tableOrViewList: [], //数据源表
      objName: "", //查询数据源时表或视图名称
      title: "添加关联查询",
      data: [], //列表数据
      treeSidebarData: {
        diySql: "",
      }, //关联查询的新增修改数据
      pageResult: {
        page: 1,
        pageSize: 20,
        total: 0,
      },
      dataSourcesInBean: [], //数据源池
      isTableList: [
        {
          key: 0,
          value: "视图",
        },
        {
          key: 1,
          value: "表",
        },
      ], //表和视图
      dialogVisible: false, //侧边栏是否显示
      selectOptions: [],
      selectOp: "",
      cmOptions: {
        showCursorWhenSelecting: true,
        value: "",
        mode: "application/json",
        readOnly: false,
        smartIndent: true,
        autofocus: true,
        tabSize: 2,
        theme: "eclipse",
        lineNumbers: true,
        line: true,
        inputStyle: "textarea",
      },
      uploadDialogVisible: false,
      fileList:[],
      uploadUrl: window.context.form + "/form/customQuery/v1/import",
      innerValidation:true
    };
  },
  methods: {
    //鼠标选中行改变复选框
    rowClick(row, column, event) {
      this.$refs.htTable.$refs.htTable.toggleRowSelection(row);
    },
    changeOptions() {
      if (this.treeSidebarData.diySql) {
        this.treeSidebarData.diySql =
          this.treeSidebarData.diySql + this.selectOp;
      } else {
        this.treeSidebarData.diySql = this.selectOp;
      }
      this.selectOp = null;
      this.$forceUpdate();
    },
    diySqlChange(e){
      this.$forceUpdate();
    },
    handleVarSelectorClick(s, n) {
      if (n && n.data && n.data.field) {
        const fieldExp = "${" + n.data.field + "}";
        this.$refs.dataParamCode &&
          this.$refs.dataParamCode.codemirror.replaceSelection(fieldExp);
      }
    },
    //添加为对话框
    saveDialogByQuery(id) {
      this.$confirm("确认添加为对话框？")
        .then((_) => {
          this.getDialogById(id, "add");
        })
        .catch((_) => {});
    },
    //预览
    preview(row) {
      if (!row || !row.alias) {
        this.$message.error(`所要预览的关联查询为空或其别名不存在`);
        return;
      }
      const title = `${row.name} - 关联查询预览`;
      this.$refs.customQueryShow.showDialog(row.alias, title); //显示自定义对话框列表预览弹框
    },
    //判断数据是否包含某个对象，并返回数据包含对象的下标
    indexArray(array, item) {
      if (array.length == 0) {
        return -1;
      }
      for (let i = 0; i < array.length; i++) {
        if (JSON.stringify(array[i]) == JSON.stringify(item)) {
          return i;
        }
      }
      return -1;
    },
    //批量勾选设置列的字段
    handleSelectionChange(rows) {
      //先把所有选择的字段设置为未选中
      for (let i = 0; i < this.table.columnList.length; i++) {
        if (this.table.columnList[i].selected) {
          this.table.columnList[i].selected = false;
        }
      }
      if (rows && rows.length > 0) {
        //再根据勾选的字段设置为选中
        for (let i = 0; i < rows.length; i++) {
          let res = this.indexArray(this.table.columnList, rows[i]);
          this.table.columnList[res].selected = true;
        }
      }
    },
    //保存设置列的内容
    save() {
      const this_ = this;
      this_.$validator.validateAll("settingSave").then((result) => {
        if (result) {
          for (let i in this.treeSidebarData.conditionfield) {
            let column = this.treeSidebarData.conditionfield[i];
            if (column.dbType == "date" && column.condition == "BETWEEN") {
              column.defaultValue += "|" + column.endDate;
            }
          }
          if (!this_.treeSidebarData.diySql && this_.isSqlBuildType) {
            Message.warning("请添加sql语句");
            return;
          }
          if (
            this.treeSidebarData.sortfield &&
            this.treeSidebarData.sortfield.length > 3
          ) {
            Message.warning("您添加的排序字段太多，最多只能添加3个排序字段！");
            return;
          }
          this.dialogVisibleSetting = false;
        } else {
          let arr = this_.$validator.errors.items.filter(
            (item) => item.scope == "settingSave"
          );
          let errorLength = arr.length;
          this_.$message({
            showClose: true,
            message: `有${errorLength}个字段未通过校验，请正确填写表单内容。`,
            type: "warning",
          });
        }
      });
    },
    //关闭设置列弹框
    close() {
      let this_ = this;
      this_.$validator.validateAll("settingSave").then(result=>{
        if(!result){
          this_.innerValidation = false;
          this_.doClose();
          return ;
        }
        for (let i in this.treeSidebarData.conditionfield) {
          let column = this.treeSidebarData.conditionfield[i];
          if (column.dbType == "date" && column.condition == "BETWEEN") {
            column.defaultValue += "|" + column.endDate;
          }
        }
        if (!this_.treeSidebarData.diySql && this_.isSqlBuildType) {
          this_.innerValidation = false;
          this_.doClose();
          return;
        }
        if (
          this.treeSidebarData.sortfield &&
          this.treeSidebarData.sortfield.length > 3
        ) {
          this_.innerValidation = false;
          this_.doClose();
          return;
        }
        this_.innerValidation = true;
        this_.doClose();
      })
    },
    doClose(){
      this.dialogVisibleSetting = false;
    },
    //添加设置列的字段
    addFields() {
      let column = {};
      column.fieldName = "";
      column.comment = "";
      column.columnType = "varchar";
      this.table.columnList.push(column);
    },
    //把设置列的字段新增到条件字段、返回字段等
    addColumns() {
      //检查是否选择了列
      for (let i in this.table.columnList) {
        let c = this.table.columnList[i];
        if (c.selected) break;
        if (i == this.table.columnList.length - 1) {
          if (i == this.table.columnList.length - 1) {
            Message.warning("请选择左边的列");
          }
        }
      }
      //判断tabs标签页是否选择了条件字段
      if (this.tabStatus == "condition") {
        for (let i in this.table.columnList) {
          let c = this.table.columnList[i];
          if (!c.selected) continue;
          let column = {};
          column.field = c.fieldName;
          column.comment = c.comment;
          column.condition = "EQ";
          column.dbType = c.columnType;
          column.defaultType = "2";
          column.defaultValue = "";

          let show = this.judgeAryData(
            this.treeSidebarData.conditionfield,
            column
          );
          if (show) {
            this.treeSidebarData.conditionfield.push(column);
          }
        }
        //去除重复项
        this.treeSidebarData.resultfield.unique(function (a, b) {
          return a.field == b.field;
        });
        //判断tabs标签页是否选择了返回字段
      } else if (this.tabStatus == "return") {
        for (let i in this.table.columnList) {
          let c = this.table.columnList[i];

          if (!c.selected) continue;
          let column = {};
          column.field = c.fieldName;
          column.comment = c.comment;
          column.idKey = "0";
          column.AggFuncOp = ""; //合计函数运算符
          column.columnType = c.columnType; //字段类型

          let show = this.judgeAryData(
            this.treeSidebarData.resultfield,
            column
          );
          if (show) {
            this.treeSidebarData.resultfield.push(column);
          }
        }
        //去除重复项
        this.treeSidebarData.resultfield.unique(function (a, b) {
          return a.field == b.field;
        });
      } else if (this.tabStatus == "order") {
        let errorMsg="";
        //判断tabs标签页是否选择了排序字段
        for (let i in this.table.columnList) {
          let c = this.table.columnList[i];
          if (!c.selected) continue;
          let column = {};
          //大文本类型与一些未明确的字段类型不可作为排序字段
          if(c.columnType =='clob' || !c.columnType ){
            errorMsg+=c.fieldName+"  ";
          
            continue;
          }
          column.field = c.fieldName;
          column.sortType = "asc";
          column.comment = c.comment;

          let show = this.judgeAryData(this.treeSidebarData.sortfield, column);
          if (show) {
            this.treeSidebarData.sortfield.push(column);
          }
        }
        if(errorMsg){
            this.$message.error('字段:'+errorMsg+'的字段类型不支持作为排序字段');
        }
        //去除重复项
        this.treeSidebarData.sortfield.unique(function (a, b) {
          return a.field == b.field;
        });
      }
    },
    //判断是否存在重复字段
    judgeAryData(data, column) {
      let show = true;
      for (var i = 0; i < data.length; i++) {
        if (
          data[i].field == column.field &&
          data[i].comment == column.comment
        ) {
          show = false;
          break;
        }
      }
      return show;
    },
    //删除字段
    deleteSetting(list, index) {
      list.splice(index, 1);
    },
    sourceListChang(item){
      //条件字段是参数传入或动态传入，但是固定值还有值，则清空固定值
      if((item.defaultType=="1" ||  item.defaultType=="4")  && item.defaultValue!=""){
        for(let i =0;i<this.treeSidebarData.conditionfield.length;i++){
          if((this.treeSidebarData.conditionfield[i].defaultType=="1" || this.treeSidebarData.conditionfield[i].defaultType=="4") 
          && this.treeSidebarData.conditionfield[i].defaultValue!=""){
            this.treeSidebarData.conditionfield[i].defaultValue="";
          }
        }
      }
    },
    //打开设置列弹框
    showSettingDialog() {
      this.tabStatus = "return"; //默认打开返回字段
      this.dialogVisibleSetting = true;
      if (
        this.treeSidebarData.conditionfield &&
        this.treeSidebarData.conditionfield.length > 0 &&
        this.selectOptions.length == 0
      ) {
        this.treeSidebarData.conditionfield.forEach((item) => {
          if (item.defaultType == "1") {
            let selectOp = {};
            selectOp.field = item.field;
            selectOp.comment = item.comment;
            this.selectOptions.push(selectOp);
          }
        });
      }
      if (
        this.treeSidebarData.sqlBuildType === 0 ||
        !this.treeSidebarData.sqlBuildType
      ) {
        this.isSqlBuildType = false;
      } else {
        this.isSqlBuildType = true;
      }
      if (this.treeSidebarData.name) {
        this.titleSetting = this.treeSidebarData.name + "-设置列";
      } else {
        this.titleSetting = "未命名-设置列";
      }
      //打开设置如果是数据源，先获取数据源的字段
      if (this.treeSidebarData.dsType == "dataSource") {
        let params = {
          dsalias: this.treeSidebarData.dsalias,
          isTable: this.treeSidebarData.isTable,
          objName: this.treeSidebarData.objName,
        };
        const this_ = this;
        //获取数据源的字段
        let url = window.context.form + "/form/customQuery/v1/getTable";
        req.post(url, params).then(function (data) {
          this_.table = data.data.table;
          this_.handleFilterColumn();
        });
      }
      //打开设置列如果不是数据源
      if (this.treeSidebarData.dsType != "dataSource") {
        //值来源数组_树改变如下
        this.value_sourceList_tree = [{ key: "固定值", value: "2" }];
        //判断REST接口是否是GET请求
        if (this.treeSidebarData.requestType == "GET") {
          //运算条件数组-varchar改变如下
          this.string_opList = [{ value: "等于", key: "EQ" }];
        } else {
          //运算条件数组-varchar改变如下
          this.string_opList = [{ value: "like", key: "LK" }];
        }
        if (this.treeSidebarData.conditionfield) {
          this.treeSidebarData.conditionfield.forEach((item) => {
            if (item.defaultValue == "1") {
              let selectOp = {};
              selectOp.field = item.field;
              selectOp.comment = item.comment;
              this.selectOptions.push(selectOp);
            }
          });
        }
        //字段设置为空
        this.table = { columnList: [] };
      }
    },
    //查询数据源表或视图
    getByDsObjectName() {
      if (this.treeSidebarData.id) {
        return;
      }
      if (this.treeSidebarData.dsalias == null) {
        Message.warning("请选择数据源");
        return;
      }
      this.params = {};
      this.params.dsalias = this.treeSidebarData.dsalias;
      this.params.isTable = this.treeSidebarData.isTable;
      this.params.objName = this.objName;
      const this_ = this;
      let url = window.context.form + "/form/customQuery/v1/getByDsObjectName";
      req.post(url, this_.params).then(function (data) {
        this_.tableOrViewList = []; //每次查询前先设置为空
        if (!data || data.data.length == 0) {
          Message.warning("该数据源中未查询到表或视图");
          return;
        }
        Message.success("查询成功");
        for (let i = 0; i < data.data.length; i++) {
          data.data[i].comment =
            data.data[i].name + "(" + data.data[i].comment + ")";
          this_.tableOrViewList.push(data.data[i]);
        }
        //选择表或试图时默认选择第一个
        this_.treeSidebarData.objName = this_.tableOrViewList[0].name;
      });
    },
    //关闭侧边栏
    handleClose() {
      this.treeSidebarData = {}; //清除保存过的数据
      this.isSqlBuildType = false;
      this.dialogVisible = false;
    },
    //关联查询新增修改保存后操作
    afterSaveData() {
      if (this.treeSidebarData.conditionfield.length == 0) {
        this.selectOptions = [];
      }
      this.dialogVisible = false;
      this.$refs.htTable.load(); //重新加载列表数据
    },
    //关联查询新增修改保存前操作
    beforeSaveData() {
      if(!this.innerValidation){
        Message.warning("设置列校验失败，请进入设置列中完善信息并点击右上角保存按钮");
        this.isSubmit = false;
        return ;
      }
      //如果数据来源不是数据源则没有所属数据源
      if (this.treeSidebarData.dsType != "dataSource") {
        this.treeSidebarData.dsalias = "";
      }
      //sql生成的方式(0:页面设置 1:diy)
      if (this.isSqlBuildType) {
        this.treeSidebarData.sqlBuildType = 1;
      } else {
        this.treeSidebarData.sqlBuildType = 0;
      }
      if (
        this.treeSidebarData.dsType == "dataSource" &&
        !this.treeSidebarData.id
      ) {
        if (this.treeSidebarData.objName == "") {
          Message.warning("请选择表或视图");
          this.isSubmit = false;
          return;
        }
      }
      if (this.treeSidebarData.resultfield.length == 0) {
        Message.warning("请设置需要返回的字段");
        this.isSubmit = false;
        return;
      }
      this.isSubmit = true;
      //保存成功后清除vuex中的数据，预览时不用再刷新
      this.$store.dispatch("form/clearCustomQuery", this.treeSidebarData.alias);
    },
    //点击按钮打开侧边栏
    showDialog(action, id) {
      this.dialogVisible = true;
      if (action) {
        this.objName = "";
        if (action == "add") {
          this.title = "添加关联查询";
          this.disabled = false;
          this.treeSidebarData = {
            objName: "",
            conditionfield: [],
            resultfield: [],
            sortfield: [],
            needPage: 0,
            dsType: "dataSource",
            isTable: 1,
            dsalias: "LOCAL",
            alias: "",
            requestType: "POST",
            pageKey: "page",
            pageSizeKey: "pageSize",
            totalKey: "total",
            listKey: "",
            name: "",
            pageSize: 10,
          };
        } else if (action == "edit") {
          this.disabled = true;
          this.title = "编辑关联查询";
          this.getDialogById(id); //根据关联查询信息ID查询关联查询所有信息\
        }
      }
    },
    //根据关联查询信息ID查询关联查询所有信息
    getDialogById(id, action) {
      const this_ = this;
      if (!id) return;
      let url = window.context.form + "/form/customQuery/v1/" + id;
      req.get(url).then(function (data) {
        data = data.data;
        this_.treeSidebarData = data;
        this_.treeSidebarData.resultfield = JSON.parse(data.resultfield);
        this_.treeSidebarData.sortfield = JSON.parse(data.sortfield);
        this_.treeSidebarData.conditionfield = JSON.parse(data.conditionfield);

        //添加为对话框
        if (action && action == "add") {
          if (this_.treeSidebarData.needPage == 0) {
            this_.treeSidebarData.needPage = false;
          } else {
            this_.treeSidebarData.needPage = true;
          }
          for (let i = 0; i < this_.treeSidebarData.resultfield.length; i++) {
            this_.treeSidebarData.resultfield[i].idKey = "0";
            this_.treeSidebarData.resultfield[i].AggFuncOp = ""; //合计函数运算符
          }
          let url =
            window.context.form + "/form/customQuery/v1/saveDialogByQuery";
          req.post(url, this_.treeSidebarData).then(function (rep) {
            rep = rep.data;
            if (rep && rep.state) {
              Message.success(rep.message);
            } else {
              Message.error(rep.message || "保存失败");
            }
          });
        }
      });
    },
    //页面加载显示数据
    loadData(param, cb) {
      // param.sorter = [{ property: "CREATE_TIME_", direction: "DESC" }]; //排序字段
      req
        .post(window.context.form + "/form/customQuery/v1/list", param)
        .then((response) => {
          this.data = response.data.rows;
          this.pageResult = {
            page: response.data.page,
            pageSize: response.data.pageSize,
            total: response.data.total,
          };
        })
        .finally(() => cb());
    },
    handleCommond(param) {
      switch (param.command) {
        case "preview":
          this.preview(param.row);
          break;
        case "dialog":
          this.saveDialogByQuery(param.row.id);
          break;
      }
    },
    // 设置参数的面板中tab切换时
    handleTabSwitch(m) {
      if (m.name == "dataParam") {
        this.$refs.dataParamCode && this.$refs.dataParamCode.refresh();
      }
      // 选中自定义SQL tab
      if(m.name == "custom"){
        // 清空自定义sql条件字段
        this.selectOptions.splice(0,this.selectOptions.length);
        if (this.treeSidebarData.conditionfield) {
          this.treeSidebarData.conditionfield.forEach(item => {
            if (item.defaultType == "1") {
              let selectOp = {};
              selectOp.field = item.field;
              selectOp.comment = item.comment;
              this.selectOptions.push(selectOp);
            }
          });
        }
      }
    },
    handleExport(){
      let selection = this.$refs.htTable.$refs.htTable.selection;
      if(!selection || selection.length == 0){
        this.$message({type:"warning",message:"请至少选择一条数据"});
        return;
      }
      let ids = [];
      for(let i = 0;i < selection.length ; i++){
        ids.push(selection[i].id);
      }
      req.download(window.context.form + "/form/customQuery/v1/export?ids="+ids.join(","));
    },
    //上传对话框关闭
    beforeClose(){
      this.fileList = [];
      this.uploadDialogVisible = false;
    },
    handleImport(param){
      let formData = new FormData();
      formData.append("file",param.file);
      form.importCustomQuery(formData).then(resp=>{
        if(resp.state){
          this.$message({type:"success",message:resp.message});
          this.beforeClose();
          this.$refs.htTable.load(); //重新加载列表数据
        }else{
          this.beforeClose();
        }
      })
    },
    uploadSubmit(){
      if(this.$refs.elUpload.uploadFiles.length == 0){
        this.$message({type:"warning",message:"请上传文件"});
      }
      this.$refs.elUpload.submit();
    },
    handleFilterColumn(){
      for(let i = this.table.columnList.length - 1 ; i >= 0 ; i--){
        if(this.table.columnList[i].fieldName && this.table.columnList[i].fieldName.toLowerCase() == "f_form_data_rev_"){
          this.table.columnList.splice(i,1);
        }
      }
    }
  },
  mounted() {
    this.$validator = this.$root.$validator;
    const this_ = this;
    //获取数据源池
    req
      .get(window.context.portal + "/sys/sysDataSource/v1/getDataSources")
      .then(function (data) {
        this_.dataSourcesInBean = data.data;
      });
  },
};
</script>
<style lang="scss" scoped>
div >>> .el-dialog__body {
  padding: 10px 20px;
  color: #606266;
  font-size: 14px;
  word-break: break-all;
  height: calc(100% - 140px);
  overflow-y: auto;  
}
.cd-column__dialog{
  /deep/.el-dialog__body{
    height: calc(100% - 100px);
  }
}
.todo-subject {
  cursor: pointer;
}

.todo-subject:hover {
  color: #2761ff;
}

.ht {
  width: 320px;
}
.cd-column__dialog /deep/ .el-dialog > .el-dialog__header {
  padding: 8px 20px;
}
.label-tooltip {
  width: 0px;
}
@media (max-width: 1024px){
    /deep/ .search-container__col{
      flex-wrap: wrap;
      .el-button-group{
        margin-top: 10px;
      }
  }
}
 /deep/.el-dialog__wrapper {
  overflow: unset !important;
}

/deep/.el-dialog {
  height: 90%;
  min-height: 400px;
}
/deep/.el-dialog__body .selector-table {
  height: 100% !important;
}
/deep/.el-dialog .el-dialog__body .select-tree-div {
  height: calc(100% - 60px);
  min-height: unset;
}
@media (max-height: 960px) {
  /deep/.el-dialog__body .el-container {
      height: 100% !important;
  }
}
/deep/ [name='uploadDialog']{
  // height:30%;
}
/deep/ .el-dialog.upload-dialog{
  height: unset;
  /deep/.el-dialog__body{
    height: unset;
  }
 .upload-dialog__content{
   height: 150px;
 }
  min-height: unset;
}
.form-table__wrap,.form-table__row,.form-table__left,.form-table__right{
  height: 100%;
}
.form-table__left,.form-table__right{
  overflow-y: auto;
}
/deep/.CodeMirror{
  height: 100%;
}
</style>
