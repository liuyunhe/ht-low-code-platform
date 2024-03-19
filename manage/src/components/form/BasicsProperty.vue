<template>
  <el-form data-vv-scope="field" size="small" inline>
    <!-- 子表联动设置 目前只支持单行文本框配置 -->
    <template
      v-if="
        (field.ctrlType == 'input' || field.ctrlType == 'button') &&
        field.parentNodeType == 'sub'
      "
    >
      <ht-form-item
        label="显示设置"
        label-width="100px"
        style="margin-bottom: -10px"
      >
        <template slot="label">
          <el-tooltip content="为true时,绑定字段显示">
            <i class="property-tip icon-question" />
          </el-tooltip>
          <span>显示设置</span>
        </template>
        <ht-select
          clearable
          v-model="field.options.showCondition.target"
          :options="mainBoFields"
          :props="{key: 'name', value: 'desc'}"
          filterable
          style="width: 100px"
          @change="changeShowCondition"
        >
          <template slot-scope="{options, propKey, propValue}">
            <el-option-group
              v-for="group in options"
              :key="group.name"
              :label="group.desc"
            >
              <el-option
                v-for="item in group.children.filter((obj) => {
                  return filterFields(obj)
                })"
                :key="item[propKey]"
                :label="item[propValue]"
                :value="item[propKey]"
              ></el-option>
            </el-option-group>
          </template>
        </ht-select>
        <ht-input
          style="width: 100px"
          v-model="field.options.showCondition.value"
          placeholder="请输入值"
        />
      </ht-form-item>
      <pre
        style="color: red"
      ><span v-if="field.options.showCondition.fieldPath">{{field.options.showCondition.fieldPath+'=='+field.options.showCondition.value}}</span> 为true时，显示绑定的字段</pre>
    </template>
    <!-- 下拉框基本属性 -->
    <template
      v-if="isBasicsProperty(field.options.basicsProperty, 'selectConfig')"
    >
      <ht-form-item label label-width="100px">
        <el-checkbox-button
          v-model="field.options.multiple"
          label="isMultiple"
          v-if="
            field.ctrlType != 'eip-cascader' && field.ctrlType != 'autocomplete'
          "
          >是否多选</el-checkbox-button
        >
        <el-checkbox-button
          v-if="field.ctrlType == 'dropdown' && field.options.multiple"
          v-model="field.options.cascade"
          label="cascade"
          >父子节点级联选中</el-checkbox-button
        >

        <el-checkbox-button
          v-model="field.options.filterable"
          label="filterable"
          v-if="
            field.ctrlType != 'eip-cascader' && field.ctrlType != 'autocomplete'
          "
          >是否可搜索</el-checkbox-button
        >
        <el-checkbox-button
          v-if="field.options.filterable && field.ctrlType != 'dropdown'"
          v-model="field.options.allowCreate"
          label="allowCreate"
          >是否可创建条目</el-checkbox-button
        >
      </ht-form-item>
    </template>

    <!-- 下拉框 下拉树固态|动态选项配置 choiceType -->
    <template
      v-if="isBasicsProperty(field.options.basicsProperty, 'choiceType')"
    >
      <ht-form-item
        label="选项配置"
        label-width="100px"
        style="margin-bottom: 0px; margin-right: 0px"
      >
        <el-checkbox
          v-if="
            field.options.type == 'radio' || field.options.type == 'checkbox'
          "
          v-model="field.options.inline"
        >
          换行显示
          <el-tooltip content="是否换行显示">
            <i class="property-tip icon-question" />
          </el-tooltip>
        </el-checkbox>
        <span v-else style="margin-left: 96px"></span>
        <el-radio-group
          @change="dynamicClick"
          v-model="field.options.choiceType"
          size="mini"
          class="btn-radio"
        >
          <el-radio-button
            label="static"
            :disabled="
              field.ctrlType == 'cascader' ||
              field.ctrlType == 'dropdown' ||
              field.ctrlType == 'eip-cascader'
            "
            >固定选项</el-radio-button
          >
          <el-radio-button label="dynamic">动态选项</el-radio-button>
        </el-radio-group>
      </ht-form-item>
      <div v-if="field.options.choiceType == 'static'">
        <table
          class="form-table choiceType-table"
          cellspacing="0"
          cellpadding="0"
          border="0"
        >
          <tbody v-if="field.ctrlType == 'autocomplete'">
            <tr class="linkageTable-tr">
              <td>选项配置</td>
              <td style="width: 60px">
                操作
                <el-button
                  class="btn-padding"
                  icon="el-icon-plus"
                  @click="field.options.options.push({value: ''})"
                ></el-button>
              </td>
            </tr>
            <tr v-for="(item, index) in field.options.options" :key="index">
              <td>
                <el-input
                  size="mini"
                  placeholder="请填写输入建议"
                  v-model="item.value"
                ></el-input>
              </td>
              <td style="text-align: center">
                <el-button
                  class="btn-padding"
                  style="margin-left: 0px"
                  icon="el-icon-delete"
                  @click="field.options.options.remove(item)"
                ></el-button>
              </td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr class="linkageTable-tr">
              <td style="width: 100px">选项值</td>
              <td>选项标签</td>
              <td style="width: 60px">
                操作
                <el-button
                  class="btn-padding"
                  icon="el-icon-plus"
                  @click="field.options.options.push({key: '', value: ''})"
                ></el-button>
              </td>
            </tr>
            <tr v-for="(item, index) in field.options.options" :key="index">
              <td>
                <el-input
                  size="mini"
                  placeholder="选项值"
                  v-model="item.key"
                ></el-input>
              </td>
              <td>
                <el-input
                  size="mini"
                  placeholder="选项标签"
                  v-model="item.value"
                ></el-input>
              </td>
              <td style="text-align: center">
                <el-button
                  class="btn-padding"
                  style="margin-left: 0px"
                  icon="el-icon-delete"
                  @click="field.options.options.remove(item)"
                ></el-button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div
        v-if="field.options.choiceType == 'dynamic'"
        class="customQuery-inputs"
      >
        <!-- 获取单选复选控件动态值选项 @change="setCurrentCustomQuery()"-->
        <ht-load-data
          url="/form/customQuery/v1/list"
          requestMethod="post"
          context="form"
          @after-load-data="afterCustomQueryLoadData"
        ></ht-load-data>
        <ht-select
          clearable
          filterable
          @change="setCurrentCustomQuery()"
          v-model="field.options.customQuery.alias"
          :options="customQuerys"
          :props="{key: 'alias', value: 'name'}"
        />
        <ht-form-item
          label
          label-width
          v-if="field.options.bind && field.options.bind.length > 0"
          class="basics-property"
        >
          <template slot="label">
            <el-tooltip content="自定义查询需要的参数传入">
              <i class="property-tip icon-question" />
            </el-tooltip>
            <span>参数绑定</span>
          </template>
          <template v-if="field.ctrlType == 'eip-cascader'">
            <table
              class="form-table custDialog-table"
              cellspacing="0"
              cellpadding="0"
              border="0"
            >
              <tbody>
                <tr class="linkageTable-tr">
                  <td width="100px;">参数名</td>
                  <td>取值对象</td>
                </tr>
                <tr
                  class="linkageTable-tr"
                  style="text-align: center"
                  v-for="(bind, indexBind) in field.options.bind"
                  :key="indexBind"
                >
                  <td>{{ bind.comment }}</td>
                  <td>
                    <ht-select
                      clearable
                      v-model="bind.fieldPath"
                      :options="field.options.customQuery.resultfield"
                      :props="{key: 'field', value: 'comment'}"
                    ></ht-select>
                  </td>
                </tr>
              </tbody>
            </table>
          </template>
          <template v-else>
            <table
              class="form-table custDialog-table"
              cellspacing="0"
              cellpadding="0"
              border="0"
            >
              <tbody>
                <tr class="linkageTable-tr">
                  <td width="100px;">参数名</td>
                  <td>取值对象</td>
                </tr>
                <!-- <tr
                  style="text-align: center"
                  v-for="(bind, index) in field.options.bind"
                  :key="index"
                > -->
                <tr
                  style="text-align: center"
                  v-for="(bind, index) in getDialogParamsEntity.children"
                  :key="index"
                >
                  <td>{{ bind.comment }}</td>
                  <td>
                    <ht-select
                      clearable
                      v-model="bind.fieldPath"
                      :options="allBoData"
                      :props="{key: 'name', value: 'desc'}"
                    >
                      <template slot-scope="{options}">
                        <el-option-group
                          v-for="(group, idenx) in options"
                          :key="idenx"
                          :label="group.desc"
                        >
                          <el-option
                            v-for="item in group.children.filter(
                              (i) => i.name !== field.name
                            )"
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
          </template>
        </ht-form-item>
        <ht-form-item label label-width v-if="field.ctrlType != 'eip-cascader'">
          <el-checkbox v-model="field.options.customQuery.noInit">
            初始化时不加载选项
            <el-tooltip>
              <div slot="content">
                初始化时不加载动态选项，当展开下拉框时再加载。
                <br />注意勾选该选项后：
                <br />1.只读时只会显示下拉框的选项值，不会显示值所对应的标签值；
                <br />2.下拉框多选、可创建条目时数据不会及时回显。
              </div>
              <i class="property-tip icon-question" />
            </el-tooltip>
          </el-checkbox>
        </ht-form-item>
        <ht-form-item label label-width>
          <template slot="label">
            <el-tooltip content="返回值作为选项时的绑定">
              <i class="property-tip icon-question" />
            </el-tooltip>
            <span>选项绑定</span>
          </template>
          <div v-if="field.ctrlType == 'autocomplete'">
            <ht-form-item
              label="输入建议候选"
              label-width="90px"
              class="customQuery-inputs"
            >
              <ht-select
                clearable
                style="width: 200px"
                v-model="field.options.customQuery.valueBind"
                :options="field.options.customQuery.resultfield"
                :props="{key: 'field', value: 'comment'}"
              />
            </ht-form-item>
          </div>
          <div v-else>
            <ht-form-item
              label="值"
              label-width="40px"
              class="customQuery-inputs"
            >
              <ht-select
                clearable
                style="width: 110px"
                v-model="field.options.customQuery.valueBind"
                :options="field.options.customQuery.resultfield"
                :props="{key: 'field', value: 'comment'}"
              />
            </ht-form-item>
            <ht-form-item
              label="标签"
              label-width="40px"
              class="customQuery-inputs"
            >
              <ht-select
                clearable
                style="width: 120px"
                v-model="field.options.customQuery.labelBind"
                :options="field.options.customQuery.resultfield"
                :props="{key: 'field', value: 'comment'}"
              />
            </ht-form-item>

            <ht-form-item
              label="PId"
              v-if="field.ctrlType == 'dropdown'"
              label-width="40px"
              class="customQuery-inputs"
            >
              <ht-select
                clearable
                style="width: 120px"
                v-model="field.options.customQuery.PId"
                :options="field.options.customQuery.resultfield"
                :props="{key: 'field', value: 'comment'}"
              />&nbsp;
              <el-tooltip>
                <div slot="content">
                  非必填。当数据为纯列表时使用。会根据该字段和值字段，将列表数据转化为树形数据。
                </div>
                <i class="property-tip icon-question" />
              </el-tooltip>
            </ht-form-item>
          </div>
        </ht-form-item>
      </div>
      <!-- 下拉框动态查询绑定关联查询 -->
      <el-button
        style="width: 100%; margin-left: 0px !important; margin-bottom: 5px"
        class="custDialog-btn"
        icon="icon-list2"
        size="mini"
        v-if="
          field.options.choiceType == 'dynamic' &&
          !field.isMultiple &&
          field.ctrlType != 'autocomplete' &&
          field.ctrlType != 'eip-cascader'
        "
        @click="showSelectQueryDialog"
        >绑定关联查询</el-button
      >
      <el-dialog
        title="下拉框添加关联查询"
        width="60%"
        append-to-body
        top="8vh"
        :visible.sync="selectQueryDialog"
        :close-on-click-modal="false"
      >
        <el-button
          class="btn-padding"
          icon="el-icon-plus"
          style="margin-bottom: 5px"
          @click="field.options.customQuery.custQueryJson.push({})"
          >添加关联查询</el-button
        >
        <el-tag type="warning"
          >当前下拉框的值发生变化时触发关联查询，可以添加多个关联查询（不能重复）。</el-tag
        >
        <div style="width: 100%; height: 550px; overflow: auto">
          <div
            v-for="(condition, indexCondition) in field.options.customQuery
              .custQueryJson"
            :key="indexCondition"
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
                    <ht-load-data
                      url="/form/customQuery/v1/list"
                      requestMethod="post"
                      context="form"
                      @after-load-data="afterCustomQueryLoadData"
                    ></ht-load-data>
                    <ht-select
                      clearable
                      filterable
                      @change="setSelectQuery(condition.alias, indexCondition)"
                      v-model="condition.alias"
                      :options="customQuerys"
                      :props="{key: 'alias', value: 'name'}"
                    />
                    <el-button
                      class="btn-padding"
                      icon="el-icon-delete"
                      style="margin-left: 10px"
                      @click="
                        field.options.customQuery.custQueryJson.remove(
                          condition
                        )
                      "
                    ></el-button>
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
                      v-for="(bind, indexBind) in field.options.customQuery
                        .custQueryJson[indexCondition].conditionfield"
                      :key="indexBind"
                    >
                      <th width="110px">{{ bind.comment }}:</th>
                      <td>
                        <ht-select
                          clearable
                          v-model="bind.fieldPath"
                          :options="returnData"
                          :props="{key: 'name', value: 'desc'}"
                        >
                          <template slot-scope="{options}">
                            <el-option-group
                              v-for="(group, idenxOptions) in options"
                              :key="idenxOptions"
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
                      v-for="(bind, indexBind) in field.options.customQuery
                        .custQueryJson[indexCondition].resultfield"
                      :key="indexBind"
                    >
                      <th width="110px">{{ bind.comment }}:</th>
                      <td>
                        <ht-select
                          clearable
                          v-model="bind.fieldPath"
                          :options="returnData"
                          :props="{key: 'name', value: 'desc'}"
                        >
                          <template slot-scope="{options}">
                            <el-option-group
                              v-for="(group, idenxOptions) in options"
                              :key="idenxOptions"
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
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button
            type="primary"
            @click="selectQueryDialog = false"
            size="small"
            >确定</el-button
          >
        </div>
      </el-dialog>
      <el-button
        v-if="
          field.options.choiceType == 'static' &&
          field.ctrlType != 'autocomplete'
        "
        class="el-icon-edit"
        size="mini"
        style="width: 100%; margin-top: 5px; margin-bottom: 5px"
        @click="openLinkage"
        >联动设置</el-button
      >
      <el-dialog
        title="字段联动设置"
        :visible.sync="dialogLinkageVisible"
        top="8vh"
        append-to-body
        class="urgent-text"
        :close-on-click-modal="false"
        width="1040px"
      >
        <!-- width="500px" -->
        <el-button
          icon="el-icon-plus"
          size="mini"
          @click="addRows()"
          style="margin-bottom: 5px"
          plain
          >添加</el-button
        >
        <table class="form-table" cellspacing="0" cellpadding="0" border="0">
          <tbody>
            <tr class="linkageTable-tr">
              <td width="190px">所选值</td>
              <td width="190px">变换条件</td>
              <td width="190px">变换字段</td>
              <td width="140px">变换类型</td>
              <td width="460px">
                <span>字段验证</span>
                <el-tooltip effect="light">
                  <!-- <div style="margin-top: 15px;margin-bottom: 25px;" slot="content">
                      <code>
                        <span style="color: red;margin-left: 15px;">*正则表达式：</span>
                        <span>两个参数，第一个参数为正则表达式，第二个参数为校验未通过时的提示信息</span>
                        <br />
                        <span style="color: red;margin-left: 25px;">例如：</span>
                       <span>^[0-9]+$,校验失败，请输入数字</span>
                        <br />
                        <span style="color: red;margin-left: 25px;">注意：</span>
                       <span>字符串格式的表达式以英文逗号`,`来分割参数</span>
                      </code>
                   </div> -->
                  <div slot="content">
                    <h3>校验规则：</h3>
                    <div style="margin-top: 15px; margin-bottom: 25px">
                      <span style="color: red">*正则表达式：</span>
                      <span
                        >两个参数，第一个参数为正则表达式，第二个参数为校验未通过时的提示信息</span
                      >
                      <br />
                      <span style="color: red">例如：</span>
                      <span>"^[0-9]+$","校验失败，请输入数字"</span>
                      <br />
                      <span style="color: red">注意：</span>
                      <span>字符串格式的表达式以英文逗号‘,’来分割参数</span>
                    </div>
                  </div>
                  <i class="property-tip icon-question" />
                </el-tooltip>
              </td>
              <td width="60px">操作</td>
            </tr>

            <tr v-for="(column, index) in linkage" :key="index">
              <td width="190px">
                <ht-select
                  v-model="column.value"
                  :options="field.options.options"
                  :filterable="true"
                />
              </td>
              <td colspan="4">
                <table class cellspacing="0" cellpadding="0" border="0">
                  <tr v-for="(effects, index1) in column.effect" :key="index1">
                    <td width="190px">
                      <ht-select
                        v-model="effects.linkageType"
                        :options="getLinkageTypeList(effects)"
                        clearable
                        :props="{key: 'key', value: 'desc'}"
                      />
                    </td>
                    <td width="190px">
                      <ht-select
                        style="margin-left: 30px"
                        v-if="effects.linkageType == 'subTable'"
                        v-model="effects.targetSub"
                        :options="subTables"
                        clearable
                        :props="{key: 'name', value: 'desc'}"
                      />

                      <ht-select
                        v-if="effects.linkageType == 'field'"
                        style="margin-left: 30px"
                        v-model="effects.target"
                        :options="getEffectsTargetOptions()"
                        clearable
                        :filterable="true"
                        :props="{key: 'name', value: 'desc'}"
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
                              :value="getEffectsTarget(group, item)"
                            ></el-option>
                          </el-option-group>
                        </template>
                      </ht-select>
                    </td>
                    <td width="160px">
                      <ht-select
                        v-model="effects.type"
                        :options="items"
                        style="margin-left: 40px"
                      />
                    </td>
                    <td width="460px">
                      <div style="margin-left: 20px" class="basics-property">
                        <ValidataProperty
                          :data="effects.validateObj"
                          :boData.sync="mainBoFields"
                        />
                      </div>
                    </td>
                    <td width="150px" style="text-align: center">
                      <el-button
                        class="btn-padding"
                        icon="el-icon-document-copy"
                        @click="copyEffectObj(column.effect, effects)"
                      ></el-button>
                      <el-button
                        class="btn-padding"
                        style="margin-left: 5px"
                        icon="el-icon-plus"
                        @click="addEffectObj(column.effect, effectObj)"
                      ></el-button>
                      <el-button
                        class="btn-padding"
                        v-if="column.effect.length > 1"
                        style="margin-left: 5px"
                        icon="el-icon-delete"
                        @click="column.effect.remove(effects)"
                      ></el-button>
                    </td>
                  </tr>
                </table>
              </td>
              <td width="150px" style="text-align: center">
                <el-button
                  icon="el-icon-document-copy"
                  class="btn-padding"
                  @click="copyEffect(column)"
                ></el-button>
                <el-button
                  icon="el-icon-delete"
                  class="btn-padding"
                  @click="linkage.remove(column)"
                ></el-button>
              </td>
            </tr>
          </tbody>
        </table>

        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="linkageOk">确 定</el-button>
          <el-button
            @click="
              dialogLinkageVisible = false
              linkage.length = 0
            "
            >取 消</el-button
          >
        </div>
      </el-dialog>
    </template>

    <!-- 复选单选 选项配置 choiceType -->
    <template
      v-if="isBasicsProperty(field.options.advancedProperty, 'choiceType')"
    >
      <ht-form-item
        label="选项配置"
        label-width="100px"
        style="margin-bottom: 0px; margin-right: 0px"
      >
        <el-checkbox v-model="field.options.inline">
          换行显示
          <el-tooltip content="是否换行显示">
            <i class="property-tip icon-question" />
          </el-tooltip>
        </el-checkbox>
        <el-radio-group
          @change="dynamicClick"
          v-model="field.options.choiceType"
          size="mini"
          class="btn-radio"
        >
          <el-radio-button label="static">固定选项</el-radio-button>
          <el-radio-button label="dynamic">动态选项</el-radio-button>
        </el-radio-group>
      </ht-form-item>
      <div
        v-if="field.options.choiceType == 'static'"
        style="margin-bottom: 10px"
      >
        <table
          class="form-table choiceType-table"
          cellspacing="0"
          cellpadding="0"
          border="0"
        >
          <tbody>
            <tr>
              <td style="width: 100px">选项值</td>
              <td>选项标签</td>
              <td style="width: 60px">
                操作
                <el-button
                  class="btn-padding"
                  icon="el-icon-plus"
                  @click="field.options.options.push({key: '', value: ''})"
                ></el-button>
              </td>
            </tr>
            <tr v-for="(item, index) in field.options.options" :key="index">
              <td>
                <el-input
                  size="mini"
                  placeholder="选项值"
                  v-model="item.key"
                ></el-input>
              </td>
              <td>
                <el-input
                  size="mini"
                  placeholder="选项标签"
                  v-model="item.value"
                ></el-input>
              </td>
              <td style="text-align: center">
                <el-button
                  class="btn-padding"
                  style="margin-left: 0px"
                  icon="el-icon-delete"
                  @click="field.options.options.remove(item)"
                ></el-button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div
        v-if="field.options.choiceType == 'dynamic'"
        class="customQuery-inputs"
      >
        <!-- 获取单选复选控件动态值选项 @change="setCurrentCustomQuery()"-->
        <ht-load-data
          url="/form/customQuery/v1/list"
          requestMethod="post"
          context="form"
          @after-load-data="afterCustomQueryLoadData"
        ></ht-load-data>
        <ht-select
          filterable
          @change="setCurrentCustomQuery()"
          v-model="field.options.customQuery.alias"
          :options="customQuerys"
          :props="{key: 'alias', value: 'name'}"
        />
        <ht-form-item
          label
          label-width
          v-if="field.options.bind && field.options.bind.length > 0"
          class="choiceType-bottom"
        >
          <template slot="label">
            <el-tooltip content="自定义查询需要的参数传入">
              <i class="property-tip icon-question" />
            </el-tooltip>
            <span>参数绑定</span>
          </template>
          <ht-form-item
            :label="bind.comment"
            label-width="80px"
            class="customQuery-inputs"
            v-for="(bind, index) in field.options.bind"
            :key="index"
          >
            <ht-select
              v-model="bind.fieldPath"
              :options="allBoData"
              :props="{key: 'name', value: 'desc'}"
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
                    :value="'data.' + item.path + '.' + item.name"
                  ></el-option>
                </el-option-group>
              </template>
            </ht-select>
          </ht-form-item>
        </ht-form-item>
        <ht-form-item label label-width>
          <template slot="label">
            <el-tooltip content="返回值作为选项时的绑定">
              <i class="property-tip icon-question" />
            </el-tooltip>
            <span>选项绑定</span>
          </template>
          <div>
            <ht-form-item label="值" label-width="60px">
              <ht-select
                v-model="field.options.customQuery.valueBind"
                :options="field.options.customQuery.resultfield"
                :props="{key: 'field', value: 'comment'}"
              />
            </ht-form-item>
            <ht-form-item
              label="标签"
              label-width="60px"
              class="customQuery-inputs"
            >
              <ht-select
                v-model="field.options.customQuery.labelBind"
                :options="field.options.customQuery.resultfield"
                :props="{key: 'field', value: 'comment'}"
              />
            </ht-form-item>
          </div>
        </ht-form-item>
      </div>
      <el-button
        v-if="field.options.choiceType == 'static'"
        class="el-icon-edit"
        @click="openLinkage"
        size="mini"
        >联动设置</el-button
      >
      <el-dialog
        title="字段联动设置"
        :visible.sync="dialogLinkageVisible"
        append-to-body
        class="urgent-text"
        top="8vh"
        :before-close="closeDialogLinkage"
        :close-on-click-modal="false"
        width="1040px"
      >
        <!-- width="500px" -->
        <el-button
          icon="el-icon-plus"
          size="mini"
          @click="addRows()"
          style="margin-bottom: 5px"
          plain
          >添加</el-button
        >
        <table class="form-table" cellspacing="0" cellpadding="0" border="0">
          <tbody>
            <tr class="linkageTable-tr">
              <td width="190px">所选值</td>
              <td width="190px">变换条件</td>
              <td width="190px">变换字段</td>
              <td width="140px">变换类型</td>
              <td width="460px">字段验证</td>
              <td width="60px">操作</td>
            </tr>

            <tr v-for="(column, index) in linkage" :key="index">
              <td width="190px">
                <ht-select
                  v-model="column.value"
                  :filterable="true"
                  :options="field.options.options"
                />
              </td>
              <td colspan="4">
                <table class cellspacing="0" cellpadding="0" border="0">
                  <tr v-for="(effects, index1) in column.effect" :key="index1">
                    <td width="190px">
                      <ht-select
                        v-model="effects.linkageType"
                        :options="getLinkageTypeList(effects)"
                        clearable
                        :props="{key: 'key', value: 'desc'}"
                      />
                    </td>
                    <td width="190px">
                      <ht-select
                        style="margin-left: 30px"
                        v-if="effects.linkageType == 'subTable'"
                        v-model="effects.targetSub"
                        :options="subTables"
                        :filterable="true"
                        clearable
                        :props="{key: 'name', value: 'desc'}"
                      />

                      <ht-select
                        v-if="effects.linkageType == 'field'"
                        style="margin-left: 30px"
                        v-model="effects.target"
                        filterable
                        :options="getEffectsTargetOptions()"
                        clearable
                        :props="{key: 'name', value: 'desc'}"
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
                              :value="getEffectsTarget(group, item)"
                            ></el-option>
                          </el-option-group>
                        </template>
                      </ht-select>
                    </td>
                    <td width="160px">
                      <ht-select
                        v-model="effects.type"
                        :options="items"
                        clearable
                        style="margin-left: 40px"
                      />
                    </td>
                    <td width="460px">
                      <div style="margin-left: 20px" class="linkage-div-bottom">
                        <ValidataProperty :data="effects.validateObj" />
                      </div>
                    </td>
                    <td width="150px" style="text-align: center">
                      <el-button
                        class="btn-padding"
                        icon="el-icon-document-copy"
                        @click="copyEffectObj(column.effect, effects)"
                      ></el-button>
                      <el-button
                        class="btn-padding"
                        style="margin-left: 5px"
                        icon="el-icon-plus"
                        @click="column.effect.push({...effectObj})"
                      ></el-button>
                      <el-button
                        class="btn-padding"
                        v-if="column.effect.length > 1"
                        style="margin-left: 5px"
                        icon="el-icon-delete"
                        @click="column.effect.remove(effects)"
                      ></el-button>
                    </td>
                  </tr>
                </table>
              </td>
              <td width="150px" style="text-align: center">
                <el-button
                  icon="el-icon-document-copy"
                  class="btn-padding"
                  @click="copyEffect(column)"
                ></el-button>
                <el-button
                  icon="el-icon-delete"
                  class="btn-padding"
                  @click="linkage.remove(column)"
                ></el-button>
              </td>
            </tr>
          </tbody>
        </table>

        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="linkageOk">确 定</el-button>
          <el-button @click="closeDialogLinkage">取 消</el-button>
        </div>
      </el-dialog>
    </template>

    <!-- 是否分页显示 目前只有相关流程用到  isPaging-->
    <!-- <template v-if="isBasicsProperty(field.options.basicsProperty, 'isPaging')">
      <ht-form-item label-width="100px">
        <el-checkbox v-model="field.options.isPaging">是否分页</el-checkbox>
        <span style="margin-left:96px"></span>
        <ht-form-item
          v-if="field.options.isPaging"
          label="分页大小"
          label-width="100px"
        >
          <el-input-number
            v-model="field.options.pageSize"
            placeholder="分页大小"
            controls-position="right"
            :min="10"
            :max="1000"
            :step="10"
          ></el-input-number>
        </ht-form-item>
      </ht-form-item>
    </template>-->
    <!-- 选择器设置  selector-->
    <template v-if="isBasicsProperty(field.options.basicsProperty, 'selector')">
      <ht-form-item
        label="选择器设置"
        label-width="100px"
        class="customQuery-inputs"
      >
        <ht-select
          @change="changeFieldBind"
          v-model="field.options.selector.type.alias"
          :options="selectors"
          validate="required"
          :props="{key: 'alias', value: 'name'}"
        />
      </ht-form-item>
      <div>
        <el-checkbox
          v-if="field.options.selector.type.alias"
          v-model="field.options.selector.isSingle"
          >单选</el-checkbox
        >
        <el-checkbox
          v-if="'eip-user-selector' == field.options.selector.type.alias"
          v-model="field.options.selector.selectCurrent"
          >当前用户</el-checkbox
        >
        <el-checkbox
          v-if="'eip-org-selector' == field.options.selector.type.alias"
          v-model="field.options.selector.selectCurrent"
          >当前组织</el-checkbox
        >
        <el-checkbox
          v-if="'eip-post-selector' == field.options.selector.type.alias"
          v-model="field.options.selector.selectCurrent"
          >当前岗位</el-checkbox
        >
      </div>
      <div
        v-if="field.options.bind && field.options.bind.length > 0"
        class="basics-property"
      >
        <H3 style="margin-bottom: 0px">
          <el-tooltip
            content="选择器的返回值绑定的属性，选择器控件绑定的属性不能作为返回值绑定"
          >
            <i class="property-tip icon-question" /> </el-tooltip
          >返回值
        </H3>
        <ht-form-item
          :label="bind.value"
          label-width="100px"
          class="customQuery-inputs"
          v-for="(bind, index) in field.options.bind"
          :key="index"
        >
          <!-- 主表选择器 -->
          <ht-select
            v-if="!field.parentNodeType"
            v-model="bind.jsonPath"
            :options="allBoData.filter((tab) => tab.type == 'main')"
            :props="{key: 'name', value: 'desc'}"
            clearable
            filterable
          >
            <template slot-scope="{options}">
              <el-option key="0" label="请选择" :value="''" />
              <el-option-group
                v-for="(group, idenx) in options"
                :key="Math.random() + idenx"
                :label="group.desc"
              >
                <el-option
                  v-for="item in group.children"
                  :disabled="item.name == field.name"
                  :key="item.id"
                  :label="item.desc"
                  :value="item.path + '.' + item.name"
                ></el-option>
              </el-option-group>
            </template>
          </ht-select>
          <!-- 子表选择器 -->
          <ht-select
            v-if="field.parentNodeType && field.parentNodeType == 'sub'"
            v-model="bind.jsonPath"
            :options="
              allBoData.filter(
                (tab) => tab.nodeType == 'sub' && tab.name == field.tableName
              )
            "
            :props="{key: 'name', value: 'desc'}"
            clearable
            filterable
          >
            <template slot-scope="{options}">
              <el-option key="0" label="请选择" :value="''" />
              <el-option-group
                v-for="(group, idenx) in options"
                :key="Math.random() + idenx"
                :label="group.desc"
              >
                <el-option
                  v-for="item in group.children"
                  :disabled="item.name == field.name"
                  :key="item.id"
                  :label="item.desc"
                  :value="item.path + '.' + item.name"
                ></el-option>
              </el-option-group>
            </template>
          </ht-select>
          <!-- 孙表选择器 -->
          <ht-select
            v-if="field.parentNodeType && field.parentNodeType == 'sun'"
            v-model="bind.jsonPath"
            :options="allBoData"
            :props="{key: 'name', value: 'desc'}"
            clearable
            filterable
          >
            <template slot-scope="{options}">
              <el-option key="0" label="请选择" :value="''" />
              <el-option-group
                v-for="(group, idenx) in options"
                :key="Math.random() + idenx"
                :label="group.desc"
              >
                <el-option
                  v-for="item in group.children"
                  :disabled="item.name == field.name"
                  :key="item.id"
                  :label="item.desc"
                  :value="item.path + '.' + item.name"
                ></el-option>
              </el-option-group>
            </template>
          </ht-select>
        </ht-form-item>
      </div>
    </template>

    <!-- ccwgq 2022-10-20 增加业务条线对话框 -->
    <template v-if="field.ctrlType == 'business-dialog'">
      <div class="custDialog-div">
        <span>对话框设置</span>
        <div style="float: right; margin-right: 24px">
          <IconDialog @selected="icons" />
        </div>
      </div>
      <ht-form-item
        label="按钮名称"
        label-width="100px"
        class="customQuery-inputs custDialog-item"
      >
        <ht-input v-model="field.options.customDialogjson.name"></ht-input>
      </ht-form-item>
      <ht-form-item label-width="100%" class="custDialog-item">
        <template slot="label">
          <el-tooltip content="对话框的别名,元件设计中指定的对话框别名">
            <i class="property-tip icon-question" />
          </el-tooltip>
          <span>对话框别名</span>
        </template>
        <el-input
          validate="required"
          clearable
          type="text"
          size="small"
          v-model="field.options.customDialogjson.alias"
          placeholder="选择对话框别名"
        ></el-input>
      </ht-form-item>
      <ht-form-item label-width="100%" class="custDialog-item">
        <template slot="label">
          <el-tooltip
            content="自定义对话框的标题(title)，而不是使用默认接口返回的标题"
          >
            <i class="property-tip icon-question" />
          </el-tooltip>
          <span>自定义对话框标题</span>
        </template>
        <el-input
          clearable
          type="text"
          size="small"
          v-model="field.options.customDialogjson.selfTitle"
          placeholder="选择业务条线"
        ></el-input>
      </ht-form-item>
      <ht-form-item label-width="100%" class="custDialog-item">
        <template slot="label">
          <span>对话框单选/多选</span>
        </template>
        <el-radio-group v-model="field.options.customDialogjson.selectType">
          <el-radio label="single">单选</el-radio>
          <el-radio label="multiple">多选</el-radio>
        </el-radio-group>
      </ht-form-item>
      <ht-form-item label-width="100%" class="custDialog-item">
        <template slot="label">
          <el-tooltip content="将保留历史选中的数据">
            <i class="property-tip icon-question" />
          </el-tooltip>
          <span>追加数据</span>
        </template>
        <el-switch
          v-model="field.options.customDialogjson.openHistory"
          inactive-text="关闭"
          :inactive-value="false"
          active-text="开启"
          :active-value="true"
        ></el-switch>
      </ht-form-item>
      <!-- 选择id字段 -->
      <ht-form-item label-width="100%" class="custDialog-item">
        <template slot="label">
          <el-tooltip content="业务条线必须选择一个ID字段">
            <i class="property-tip icon-question" />
          </el-tooltip>
          <span>ID字段</span>
        </template>
        <ht-select
          validate="required"
          v-model="field.options.customDialogjson.id"
          :options="mainBoFields"
          :props="{key: 'keyName', value: 'desc'}"
          filterable
          clearable
        >
          <template v-slot="{options, propKey, propValue}">
            <el-option-group
              v-for="group in options"
              :key="group.name"
              :label="group.desc"
            >
              <el-option
                v-for="item in group.children.filter((obj) => {
                  return obj.keyName !== field.target
                })"
                :key="item[propKey]"
                :label="item[propValue]"
                :value="item[propKey]"
              ></el-option>
            </el-option-group>
          </template>
        </ht-select>
      </ht-form-item>
    </template>

    <!-- 对话框基本属性  custDialog -->
    <template
      v-if="isBasicsProperty(field.options.basicsProperty, 'custDialog')"
    >
      <div class="custDialog-div">
        <span>对话框设置</span>
        <div style="float: right; margin-right: 24px">
          <!-- <IconDialog @selected="icons" /> -->
        </div>
        <div style="float: right; margin-right: 80px; font-size: 20px">
          <span
            style="font-size: inherit"
            v-show="field.options.customDialogjson.icon != ''"
            :class="field.options.customDialogjson.icon"
          >
          </span>
        </div>
      </div>
      <ht-form-item
        label="按钮名称"
        label-width="100px"
        class="customQuery-inputs custDialog-item"
      >
        <ht-input v-model="field.options.customDialogjson.name"></ht-input>
      </ht-form-item>
      <!-- 2022-10-13 ccwgq 增加自定义对话框title的属性 -->
      <ht-form-item label-width="100%" class="custDialog-item">
        <template slot="label">
          <el-tooltip
            content="自定义对话框的标题(title)，而不是使用默认接口返回的标题"
          >
            <i class="property-tip icon-question" />
          </el-tooltip>
          <span>自定义对话框标题</span>
        </template>
        <el-input
          clearable
          type="text"
          size="small"
          v-model="field.options.customDialogjson.defineTitleText"
          placeholder="为空时标题使用默认值"
        ></el-input>
      </ht-form-item>
      <!--   2021-09-01  ccwgq 增加了是否可录入的功能 -->
      <ht-form-item
        label="是否可录入"
        label-width="100px"
        class="customQuery-inputs custDialog-item"
      >
        <el-select
          v-model="field.options.customDialogjson.inputReadonly"
          placeholder="请选择"
        >
          <el-option label="可录入" :value="false"></el-option>
          <el-option label="不可录入" :value="true"></el-option>
        </el-select>
      </ht-form-item>
      <!-- 2021-09-01 ccwgq 是否可录入  增加结束 -->
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
          v-model="field.options.customDialogjson.custDialog.alias"
          :options="customDialogs"
          :props="{key: 'alias', value: 'name'}"
        />
      </ht-form-item>
      <div
        class="basics-property"
        v-if="
          field.options.customDialogjson.custDialog.conditions &&
          field.options.customDialogjson.custDialog.conditions.length > 0
        "
      >
        <ht-form-item label label-width>
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
          field.options.customDialogjson.custDialog.conditions &&
          field.options.customDialogjson.custDialog.conditions.length > 0
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
            v-for="(condition, indexCondition) in field.options.customDialogjson
              .custDialog.conditions"
            :key="indexCondition"
          >
            <td>{{ condition.comment }}</td>
            <td>
              <ht-select
                clearable
                v-model="condition.bind"
                :options="allBoData.filter((tab) => tab.type == 'main')"
                :props="{key: 'name', value: 'desc'}"
              >
                <template slot-scope="{options}">
                  <el-option-group
                    v-for="(group, idenxOptions) in options"
                    :key="idenxOptions"
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
            <!-- <td>
              <ht-input v-model="condition.defaultValue" placeholder="默认值"></ht-input>
            </td>-->
          </tr>
        </tbody>
      </table>
      <el-button
        style="width: 100%; margin-top: 5px"
        class="custDialog-btn"
        v-if="field.options.customDialogjson.custDialog.alias"
        icon="icon-list2"
        size="mini"
        @click="custDialogClick"
        >设置返回值</el-button
      >
      <!-- 对话框绑定关联查询 -->
      <el-button
        style="width: 100%; margin-top: 5px; margin-left: 0px !important"
        class="custDialog-btn"
        icon="icon-list2"
        size="mini"
        v-if="field.options.customDialogjson.custDialog.selectNum == '1'"
        @click="showDialogQuery"
        >绑定关联查询</el-button
      >
      <!-- ccwgq 2022-06-07 加入树形对话框可选择是否展开所有的树形节点 -->
      <ht-form-item
        label-width="130px"
        class="customQuery-switch custDialog-item"
      >
        <template slot="label">
          <el-tooltip
            content="当对话框为树形对话框时,可选择是否默认展开树形节点"
          >
            <i class="property-tip icon-question" />
          </el-tooltip>
          <span>树形节点是否展开</span>
        </template>
        <el-switch
          inactive-text="折叠"
          active-text="展开"
          inactive-value="false"
          active-value="true"
          v-model="field.options.expandAll"
        >
        </el-switch>
      </ht-form-item>
      <!-- ccwgq 2022-07-22 加入对话框支持标题处 tooltip提示功能 -->
      <ht-form-item
        label-width="130px"
        class="customQuery-switch custDialog-item"
      >
        <template slot="label">
          <el-tooltip
            content="将在标题后增加一个文字说明，详细描述对话框的功能"
          >
            <i class="property-tip icon-question" />
          </el-tooltip>
          <span>对话框说明</span>
        </template>
        <el-switch
          inactive-text="否"
          active-text="是"
          :inactive-value="false"
          :active-value="true"
          v-model="field.options.openDialogNotes"
          @change="dialogNotesSwitchChange"
        ></el-switch>
      </ht-form-item>
      <!-- 说明内容 -->
      <ht-form-item
        v-show="field.options.openDialogNotes"
        label-width="100px"
        class="customQuery-inputs custDialog-item"
      >
        <template slot="label">
          <span>说明内容</span>
        </template>
        <el-input
          type="textarea"
          ref="dialogNotesContent"
          clearable
          v-model="field.options.dialogNotesContent"
        ></el-input>
      </ht-form-item>
      <!-- ccwgq 2022-08-12 加入用户动态链接配置 -->
      <ht-form-item
        label-width="130px"
        class="customQuery-switch custDialog-item"
      >
        <template slot="label">
          <el-tooltip content="支持选中后的数据点击后跳转">
            <i class="property-tip icon-question" />
          </el-tooltip>
          <span>跳转链接</span>
        </template>
        <el-switch
          inactive-text="否"
          active-text="是"
          :inactive-value="false"
          :active-value="true"
          v-model="field.options.useCustomLink"
          @change="dialogNotesSwitchChange"
        ></el-switch>
      </ht-form-item>
      <div v-if="field.options.useCustomLink">
        <ht-form-item
          label-width="130px"
          class="customQuery-switch custDialog-item"
        >
          <template slot="label">
            <el-tooltip content="对话框每次回填链接时，回填到的字段">
              <i class="property-tip icon-question" />
            </el-tooltip>
            <span>回填字段</span>
          </template>
          <div>
            <ht-select
              validate="required"
              v-model="field.options.customDialogjson.customLink.linkFieldName"
              :options="mainBoFields"
              :props="{key: 'fieldName', value: 'desc'}"
              filterable
              clearable
              @change="handleDialogSelectChange"
            >
              <template slot-scope="{options, propKey, propValue}">
                <el-option-group
                  v-for="group in options"
                  :key="group.name"
                  :label="group.desc"
                >
                  <!-- 做好映射处理 -->
                  <el-option
                    v-for="item in group.children"
                    :key="item[propKey]"
                    :label="item[propValue]"
                    :value="item[propKey]"
                  ></el-option>
                </el-option-group>
              </template>
            </ht-select>
            <el-button
              style="margin-left: 50px"
              type="text"
              @click="openRelativeLinkDialog()"
              >编辑链接</el-button
            >
          </div>
        </ht-form-item>
      </div>
      <relative-link-dialog ref="linkDialog" :data="field">
      </relative-link-dialog>
      <!-- ccwgq 2022-10-13 增加历史选择数据的记录 -->
      <div v-if="field.options.customDialogjson.custDialog.mappingConf.length">
        <ht-form-item
          label-width="130px"
          class="customQuery-switch custDialog-item"
        >
          <template slot="label">
            <el-tooltip
              content="历史选中的数据保留禁止修改，在原数据的基础上追加数据，仅支持多选对话框"
            >
              <i class="property-tip icon-question" />
            </el-tooltip>
            <span>历史数据追加</span>
          </template>
          <el-switch
            inactive-text="否"
            active-text="是"
            :inactive-value="false"
            :active-value="true"
            v-model="field.options.saveHistory"
          ></el-switch>
        </ht-form-item>
        <!-- 历史数据相关配置 -->
        <div v-if="field.options.saveHistory">
          <h3 style="margin-bottom: 0px">历史数据追加设置</h3>
          <ht-form-item label-width="150px" class="custDialog-item">
            <template slot="label">
              <el-tooltip
                content="通过追加javascript脚本来实现根据表单字段却分场景，正确使用追加功能"
              >
              </el-tooltip>
              <el-checkbox v-model="field.options.openHistoryScript"
                >是否启用js脚本</el-checkbox
              >
            </template>
            <el-button
              v-if="field.options.openHistoryScript"
              class="btn-padding"
              icon="el-icon-plus"
              @click="historyDialogOpen"
              >设置自定义脚本</el-button
            >
          </ht-form-item>
          <ht-form-item label-width="130px" class="custDialog-item">
            <template slot="label">
              <el-tooltip
                content="记录回填字段中的某个可以标识唯一数据的字段，用于确认历史选择项目。"
              >
                <i class="property-tip icon-question" />
              </el-tooltip>
              <span>唯一标识字段</span>
            </template>
            <ht-select
              validate="required"
              v-model="field.options.customDialogjson.uniqueField.from"
              :options="field.options.customDialogjson.custDialog.mappingConf"
              :props="{key: 'from', value: 'from'}"
              @change="changeUniqueField"
            >
              <template slot-scope="{options}">
                <el-option
                  v-for="(group, index) in options"
                  :key="index"
                  :label="group.from"
                  :value="group.from"
                >
                </el-option>
              </template>
            </ht-select>
          </ht-form-item>
          <el-dialog
            title="设置历史数据逻辑js脚本"
            :visible.sync="dialogHistoryVisible"
            :append-to-body="true"
            custom-class="history-dialog"
          >
            <div>
              <codemirror
                ref="historyCode"
                v-model="historyScript"
                :options="historyScriptOptions"
                class="historycode"
                style="width: 99%; height: 100%"
              ></codemirror>
            </div>
            <div slot="footer">
              <el-button type="danger" size="mini" @click="historyDialogClose"
                >关闭</el-button
              >
              <el-button type="success" size="mini" @click="historyDialogSave"
                >保存</el-button
              >
            </div>
          </el-dialog>
        </div>
      </div>
      <el-dialog
        title="对话框添加关联查询"
        width="60%"
        append-to-body
        top="8vh"
        :visible.sync="dialogQuery"
        :close-on-click-modal="false"
      >
        <el-button
          class="btn-padding"
          icon="el-icon-plus"
          style="margin-bottom: 5px"
          @click="
            field.options.customDialogjson.custDialog.custQueryJson.push({})
          "
          >添加关联查询</el-button
        >
        <div style="width: 100%; height: 550px; overflow: auto">
          <div
            v-for="(condition, indexCondition) in field.options.customDialogjson
              .custDialog.custQueryJson"
            :key="indexCondition"
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
                    <ht-load-data
                      url="/form/customQuery/v1/list"
                      requestMethod="post"
                      context="form"
                      @after-load-data="afterCustomQueryLoadData"
                    ></ht-load-data>
                    <ht-select
                      clearable
                      @change="setDialogQuery(condition.alias, indexCondition)"
                      v-model="condition.alias"
                      :options="customQuerys"
                      :props="{key: 'alias', value: 'name'}"
                    />
                    <el-button
                      class="btn-padding"
                      icon="el-icon-delete"
                      style="margin-left: 10px"
                      @click="
                        field.options.customDialogjson.custDialog.custQueryJson.remove(
                          condition
                        )
                      "
                    ></el-button>
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
                      v-for="(bind, indexBind) in field.options.customDialogjson
                        .custDialog.custQueryJson[indexCondition]
                        .conditionfield"
                      :key="indexBind"
                    >
                      <th width="110px">{{ bind.comment }}:</th>
                      <td>
                        <ht-select
                          clearable
                          v-model="bind.fieldPath"
                          :options="returnData"
                          :props="{key: 'name', value: 'desc'}"
                        >
                          <template slot-scope="{options}">
                            <el-option-group
                              v-for="(group, idenxOptions) in options"
                              :key="idenxOptions"
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
                      v-for="(bind, indexBind) in field.options.customDialogjson
                        .custDialog.custQueryJson[indexCondition].resultfield"
                      :key="indexBind"
                    >
                      <th width="110px">{{ bind.comment }}:</th>
                      <td>
                        <ht-select
                          clearable
                          v-model="bind.fieldPath"
                          :options="returnData"
                          :props="{key: 'name', value: 'desc'}"
                        >
                          <template slot-scope="{options}">
                            <el-option-group
                              v-for="(group, idenxOptions) in options"
                              :key="idenxOptions"
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
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="dialogQuery = false" size="small"
            >确 定</el-button
          >
        </div>
      </el-dialog>
      <!-- 获取对话框选项列表-->
      <ht-load-data
        url="/form/customDialog/v1/getAll"
        requestMethod="post"
        context="form"
        @after-load-data="afterCustomDialogLoadData"
      ></ht-load-data>
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
              <!-- <td width="80px">解除绑定</td> -->
            </tr>

            <tr
              class="linkageTable-tr"
              v-for="(field, index) in this.field.options.customDialogjson
                .resultField"
              :key="index"
            >
              <td>{{ field.comment }}</td>
              <td>
                <ht-select
                  v-model="custDialogprop[field.comment]"
                  :options="returnData"
                  :props="{key: 'name', value: 'desc'}"
                  clearable
                  filterable
                  @change="updateCustDialogprop()"
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
              <!-- <td>
                <el-button icon="el-icon-delete" @click="unbind(field.comment)"></el-button>
              </td>-->
            </tr>
          </tbody>
        </table>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="custDialogOk">确 定</el-button>
          <el-button @click="dialogcustDialogVisible = false">取 消</el-button>
        </div>
      </el-dialog>
    </template>
    <!-- 关联数据设置  relation -->
    <template v-if="isBasicsProperty(field.options.basicsProperty, 'relation')">
      <div class="custDialog-div">
        <span>关联数据设置</span>
        <el-button
          class="custDialog-btn"
          v-if="field.options.customQuery.alias"
          icon="icon-list2"
          size="mini"
          @click="custDialogClick"
          >设置返回值</el-button
        >
      </div>
      <div
        class="customQuery-inputs custDialog-item"
        style="margin-right: 15px"
      >
        <ht-select
          clearable
          @change="setCurrentCustomQuery()"
          v-model="field.options.customQuery.alias"
          :options="customQuerys"
          :props="{key: 'alias', value: 'name'}"
        />
      </div>

      <ht-form-item
        label
        label-width
        v-if="field.options.bind && field.options.bind.length > 0"
        class="basics-property"
      >
        <template slot="label">
          <el-tooltip content="自定义查询需要的参数传入">
            <i class="property-tip icon-question" />
          </el-tooltip>
          <span>参数绑定</span>
        </template>
        <ht-form-item
          :label="bind.comment"
          label-width="80px"
          class="customQuery-inputs"
          v-for="(bind, index) in field.options.bind"
          :key="index"
        >
          <ht-select
            clearable
            v-model="bind.fieldPath"
            :options="allBoData"
            :props="{key: 'name', value: 'desc'}"
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
                  :value="'data.' + item.path + '.' + item.name"
                ></el-option>
              </el-option-group>
            </template>
          </ht-select>
        </ht-form-item>
      </ht-form-item>

      <ht-form-item label label-width class="basics-property">
        <template slot="label">
          <el-tooltip content="返回值作为选项时的绑定">
            <i class="property-tip icon-question" />
          </el-tooltip>
          <span>选项绑定</span>
        </template>
        <ht-form-item label="值" label-width="37px" class="customQuery-inputs">
          <ht-select
            :validate="{required: true}"
            clearable
            style="width: 103px"
            v-model="field.options.customQuery.valueBind"
            :options="field.options.customQuery.resultfield"
            :props="{key: 'field', value: 'comment'}"
          />
        </ht-form-item>
        <ht-form-item
          label="标签"
          label-width="50px"
          class="customQuery-inputs"
        >
          <ht-select
            :validate="{required: true}"
            clearable
            style="width: 110px"
            v-model="field.options.customQuery.labelBind"
            :options="field.options.customQuery.resultfield"
            :props="{key: 'field', value: 'comment'}"
          />
        </ht-form-item>
      </ht-form-item>

      <!-- 获取关联数据选项列表-->
      <ht-load-data
        url="/form/customQuery/v1/list"
        requestMethod="post"
        context="form"
        @after-load-data="afterCustomQueryLoadData"
      ></ht-load-data>
      <el-dialog
        title="设置关联数据返回值"
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
              v-for="(field, index) in field.options.customQuery.resultfield"
              :key="index"
            >
              <td>{{ field.comment }}</td>
              <td>
                <ht-select
                  v-model="custDialogprop[field.comment]"
                  :options="allBoData"
                  :props="{key: 'name', value: 'desc'}"
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
                        :value="item.tableName + '.' + item.name"
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
    </template>

    <!-- 文件上传 fileupload -->
    <template
      v-if="isBasicsProperty(field.options.basicsProperty, 'fileupload')"
    >
      <H3 style="margin-bottom: 0px">文件上传</H3>
      <ht-form-item label-width="50px" class="custDialog-item">
        <el-checkbox v-model="field.options.file.multiple">
          是否多选
          <el-tooltip content="是否可同时选择多个文件上传">
            <i class="property-tip icon-question" />
          </el-tooltip>
        </el-checkbox>
        <el-checkbox v-model="field.options.file.simplicity">
          是否简版
          <el-tooltip content="附件上传后以简约方法显示">
            <i class="property-tip icon-question" />
          </el-tooltip>
        </el-checkbox>
        <ht-form-item
          class="custDialog-item"
          label="最多上传个数"
          label-width="100px"
        >
          <el-input-number
            style="width: 200px"
            v-model="field.options.file.limit"
            value="5"
            placeholder="最多上传个数"
            controls-position="right"
            :min="1"
            :max="100"
          ></el-input-number>
        </ht-form-item>
        <ht-form-item
          class="custDialog-item"
          label="限制大小（M）"
          label-width="100px"
        >
          <el-input-number
            style="width: 200px"
            v-model="field.options.file.size"
            value="50"
            placeholder="单个文件限制大小（M）"
            controls-position="right"
            :min="1"
            :max="1024"
          ></el-input-number>
        </ht-form-item>
      </ht-form-item>
      <H3 style="margin-bottom: 0px">支持的类型</H3>
      <el-radio-group v-model="field.options.file.acceptType">
        <el-radio-button label="any">任意类型</el-radio-button>
        <el-radio-button label="custom">自定义类型</el-radio-button>
      </el-radio-group>
      <div
        v-if="field.options.file.acceptType == 'custom'"
        style="margin-top: 5px"
      >
        <el-button type="primary" plain @click="selectAll">全选</el-button>
        <el-button type="success" plain @click="selectNotAll">全不选</el-button>
        <el-button type="warning" plain @click="counterSelect">反选</el-button>
      </div>
      <H3
        style="margin-bottom: 0px"
        v-if="field.options.file.acceptType == 'custom'"
        >选择类型</H3
      >
      <el-checkbox-group
        v-if="field.options.file.acceptType == 'custom'"
        v-model="field.options.file.accept"
        class="file-checkbox"
      >
        <el-checkbox
          v-for="accept in upLoadAcceptList"
          :label="accept"
          :key="accept"
          >{{ accept }}</el-checkbox
        >
      </el-checkbox-group>
      <H3
        style="margin-bottom: 0px"
        v-if="field.options.file.acceptType == 'custom'"
      >
        <el-tooltip
          content="配置扩展类型的后缀名，多个用逗号隔开，如：DOC,DOCX"
        >
          <i class="property-tip icon-question" /> </el-tooltip
        >扩展类型
      </H3>
      <ht-input
        v-if="field.options.file.acceptType == 'custom'"
        type="textarea"
        :rows="5"
        v-model="field.options.file.acceptStr"
      ></ht-input>
      <H3 style="margin-bottom: 0px">附件扩展属性配置</H3>
      <ht-form-item
        label-width="50px"
        class="custDialog-item"
        :label="conf.name"
        v-for="(conf, index) in field.options.propConf"
        :key="index"
      >
        <ht-input v-model="conf.desc"></ht-input>
        <el-checkbox v-model="conf.requried" style="margin-left: 3px"
          >必填</el-checkbox
        >
      </ht-form-item>
    </template>

    <!--属性文本内容 textValue -->
    <template
      v-if="isBasicsProperty(field.options.basicsProperty, 'property-text')"
    >
      <H3 style="margin-bottom: 0px">文本内容</H3>
      <el-button
        @click="
          textValue = field.options.textValue
          dialogTextVisible = true
        "
        >属性文本内容</el-button
      >
      <el-dialog
        title="属性文本内容"
        :visible.sync="dialogTextVisible"
        append-to-body
        class="urgent-text"
        :close-on-click-modal="false"
        width="60%"
      >
        <FormVarSelector
          type="1"
          :boData="formVarData"
          @node-click="textClick"
        />
        <!--<el-tag type="warning" style="margin-left: 30px">
          <span v-pre>在子表中使用当前行数据的其他字段时，请修改为{{ item.字段名 }}</span>
        </el-tag>-->
        <vue-ueditor-wrap
          v-model="textValue"
          :config="config"
        ></vue-ueditor-wrap>
        <div slot="footer" class="dialog-footer">
          <el-button
            type="primary"
            @click="
              dialogTextVisible = false
              field.options.textValue = textValue
            "
            >确 定</el-button
          >
          <el-button
            @click="
              dialogTextVisible = false
              textValue = ''
            "
            >取 消</el-button
          >
        </div>
      </el-dialog>
    </template>

    <!--文本内容 textValue -->
    <template
      v-if="isBasicsProperty(field.options.basicsProperty, 'textValue')"
    >
      <!--<ht-form-item
        label-width="50px"
        class="custDialog-item"
        label="字段"
      >
        <ht-input v-model="field.name" validate="alpha_num"></ht-input>
      </ht-form-item>-->
      <H3 style="margin-bottom: 0px">文本内容</H3>
      <el-button
        @click="
          textValue = field.options.textValue
          dialogTextVisible = true
        "
        >文本内容</el-button
      >
    </template>

    <el-dialog
      title="文本内容"
      :visible.sync="dialogTextVisible"
      append-to-body
      class="urgent-text"
      :close-on-click-modal="false"
      width="60%"
    >
      <FormVarSelector type="1" :boData="allBoData" @node-click="textClick" />
      <!-- <el-tag type="warning" style="margin-left: 30px">
        <span v-pre>在子表中使用当前行数据的其他字段时，请修改为{{item.字段名}}</span>
      </el-tag> -->
      <vue-ueditor-wrap v-model="textValue" :config="config"></vue-ueditor-wrap>
      <div slot="footer" class="dialog-footer">
        <el-button
          type="primary"
          @click="
            dialogTextVisible = false
            field.options.textValue = textValue
          "
          >确 定</el-button
        >
        <el-button
          @click="
            dialogTextVisible = false
            textValue = ''
          "
          >取 消</el-button
        >
      </div>
    </el-dialog>

    <!-- 日期基本属性 -->
    <template v-if="isBasicsProperty(field.options.basicsProperty, 'date')">
      <ht-form-item label="指定日期输入框的格式" label-width>
        <ht-select
          :options="[
            {key: 'yyyy-MM-dd', value: 'yyyy-MM-dd'},
            {key: 'yyyy 年 MM 月 dd 日', value: 'yyyy 年 MM 月 dd 日'},
            {key: 'yyyy-M-d H:m:s', value: 'yyyy-M-d H:m:s'},
            {key: 'yyyy-MM-dd HH:mm:ss', value: 'yyyy-MM-dd HH:mm:ss'},
            {key: 'HH:mm:ss', value: 'HH:mm:ss'},
          ]"
          disabled
          v-model="field.options.inputFormat"
          placeholder="请选择日期格式"
        />
      </ht-form-item>
      <ht-form-item label="日期绑定值设置" label-width>
        <ht-checkbox
          v-model="field.options.showCurrentDate"
          :options="[{key: 'true', value: '当前时间'}]"
        />
        <ht-checkbox
          v-if="field.options.showCurrentDate"
          v-model="field.options.isServerDate"
          :options="[{key: 'true', value: '获取服务器当前时间'}]"
        />
        <div v-if="field.options.showCurrentDate">
          与当前日期相差的天数:
          <ht-input
            size="mini"
            :min="0"
            type="number"
            v-model.number="field.options.day"
          />
        </div>
      </ht-form-item>
    </template>
    <!-- 时间基本属性 -->
    <template v-if="isBasicsProperty(field.options.basicsProperty, 'time')">
      <ht-form-item label="时间设置" label-width>
        <el-radio-group v-model="field.options.type">
          <el-radio-button label="select" title="时间不包含年月日"
            >固定时间点</el-radio-button
          >
          <el-radio-button label="picker" title="时间包含当前年月日"
            >任意时间点</el-radio-button
          >
        </el-radio-group>
      </ht-form-item>
    </template>

    <!-- 公式计算 -->
    <div
      v-if="
        field.options.formulasDiyJs !== undefined &&
        !(
          field.ctrlType == 'button' &&
          field.options.bindEventjson.isShowInput == false
        )
      "
    >
      <template>
        <ht-form-item
          label="公式编辑"
          label-width="100px"
          style="margin-top: 10px"
        >
          <el-button
            v-if="!field.options.formulasDiyJs"
            style="min-width: 200px"
            type="primary"
            plain
            @click="formulasDialog"
            >编写公式</el-button
          >
          <el-button
            v-if="field.options.formulasDiyJs"
            style="min-width: 200px"
            type="success"
            plain
            @click="formulasDialog"
            >编写公式</el-button
          >
        </ht-form-item>
        <formulas-dialog
          ref="formulasDialog"
          :boDefData="boDefData"
          :field="field"
        />
      </template>
    </div>

    <!--日期计算-->
    <template
      v-if="isBasicsProperty(field.options.basicsProperty, 'dateCount')"
    >
      <ht-form-item label-width="100px">
        <el-checkbox v-model="field.options.isCountDate">
          日期计算
          <el-tooltip content="文本框内容是否由日期计算得出">
            <i class="property-tip icon-question" />
          </el-tooltip>
        </el-checkbox>

        <ht-form-item
          v-if="field.options.isCountDate"
          label="开始时间"
          label-width="90px"
        >
          <ht-select
            validate="required"
            v-model="field.options.isStartDate"
            :options="mainBoFields"
            :props="{key: 'name', value: 'desc'}"
          >
            <template slot-scope="{options, propKey, propValue}">
              <el-option-group
                v-for="group in options"
                :key="group.name"
                :label="group.desc"
              >
                <template
                  v-if="
                    field.parentNodeType == 'sub' ||
                    field.parentNodeType == 'sun'
                  "
                >
                  <el-option
                    v-for="obj in group.children.filter((item) => {
                      return item.dataType == 'date'
                    })"
                    :key="'item.' + obj[propKey]"
                    :label="obj[propValue]"
                    :value="'item.' + obj[propKey]"
                  ></el-option>
                </template>
                <template v-else>
                  <el-option
                    v-for="obj in group.children.filter((item) => {
                      return item.dataType == 'date'
                    })"
                    :key="'data.' + group.path + '.' + obj[propKey]"
                    :label="obj[propValue]"
                    :value="'data.' + group.path + '.' + obj[propKey]"
                  ></el-option>
                </template>
              </el-option-group>
            </template>
          </ht-select>
        </ht-form-item>
        <ht-form-item
          v-if="field.options.isCountDate"
          label="结束时间"
          label-width="90px"
        >
          <ht-select
            validate="required"
            v-model="field.options.isEndDate"
            :options="mainBoFields"
            :props="{key: 'name', value: 'desc'}"
          >
            <template slot-scope="{options, propKey, propValue}">
              <el-option-group
                v-for="group in options"
                :key="group.name"
                :label="group.desc"
              >
                <template
                  v-if="
                    field.parentNodeType == 'sub' ||
                    field.parentNodeType == 'sun'
                  "
                >
                  <el-option
                    v-for="obj in group.children.filter((item) => {
                      return item.dataType == 'date'
                    })"
                    :key="'item.' + obj[propKey]"
                    :label="obj[propValue]"
                    :value="'item.' + obj[propKey]"
                  ></el-option>
                </template>
                <template v-else>
                  <el-option
                    v-for="obj in group.children.filter((item) => {
                      return item.dataType == 'date'
                    })"
                    :key="'data.' + group.path + '.' + obj[propKey]"
                    :label="obj[propValue]"
                    :value="'data.' + group.path + '.' + obj[propKey]"
                  ></el-option>
                </template>
              </el-option-group>
            </template>
          </ht-select>
        </ht-form-item>
        <ht-form-item
          v-if="field.options.isCountDate"
          label="计算周期"
          label-width="90px"
        >
          <ht-radio
            v-model="field.options.countFormat"
            :options="[
              {key: 'year', value: '年'},
              {key: 'month', value: '月份'},
              {key: 'day', value: '天数'},
              {key: 'hour', value: '小时'},
              {key: 'minute', value: '分钟'},
              {key: 'second', value: '秒'},
            ]"
          />
        </ht-form-item>
        <div style="width: 200px"></div>
      </ht-form-item>
    </template>

    <!-- 数字控件配置 -->
    <template v-if="isBasicsProperty(field.options.basicsProperty, 'currency')">
      <h4>数字设置</h4>
      <ht-form-item label="最小值" label-width="100px">
        <ht-input
          v-model="field.options.min"
          placeholder="最小值"
          controls-position="right"
          type="number"
        ></ht-input>
      </ht-form-item>
      <ht-form-item label="最大值" label-width="100px">
        <ht-input
          v-model="field.options.max"
          placeholder="最大值"
          controls-position="right"
          type="number"
        ></ht-input>
      </ht-form-item>
      <ht-form-item label="步长" label-width="100px">
        <ht-input
          v-model="field.options.step"
          placeholder="步长"
          controls-position="right"
          type="number"
        ></ht-input>
      </ht-form-item>

      <ht-form-item label="小数位" label-width="100px">
        <ht-input
          v-model="field.options.decimalDigits"
          placeholder="小数位"
          controls-position="right"
          :min="0"
          :max="field.options.maxDecimalDigits"
          type="number"
        ></ht-input>
      </ht-form-item>

      <ht-form-item label="格式化显示设置" label-width="100px">
        <el-checkbox-button v-model="field.options.filterthousandBit"
          >千分位</el-checkbox-button
        >
        <el-checkbox-button v-model="field.options.filtercurrency"
          >货币(大写)</el-checkbox-button
        >
      </ht-form-item>
      <ht-form-item label="单位" label-width="100px">
        <el-select
          v-model="field.options.company"
          filterable
          allow-create
          clearable
          default-first-option
          placeholder="请选择(其他输入即可)"
        >
          <el-option
            v-for="(item, index) in companys"
            :key="index"
            :label="item.label"
            :value="item.label"
          ></el-option>
        </el-select>
      </ht-form-item>
    </template>

    <!-- 背景图片 -->
    <template v-if="isBasicsProperty(field.options.basicsProperty, 'img')">
      <ht-form-item label-width="200px">
        <template slot="label">
          <el-tooltip content="可以上传本地图片和输入网络图片地址">
            <i class="property-tip icon-question" />
          </el-tooltip>
          <span>图片配置</span>
        </template>
        <el-row>
          <el-col :span="10">图片地址</el-col>
          <el-col :span="14">
            <el-checkbox v-model="field.options.isDisplay"
              >本地上传</el-checkbox
            >
          </el-col>
        </el-row>
        <el-row v-show="field.options.isDisplay">
          <el-col :span="24">
            <img-file-upload
              v-model="field.options.fileJson"
              :fileJson="field.options.fileJson"
            ></img-file-upload>
          </el-col>
        </el-row>
        <el-row v-show="!field.options.isDisplay">
          <el-col :span="24" v-if="!field.options.isDisplay">
            <ht-input
              type="textarea"
              :rows="8"
              v-model="field.options.imgSrc"
            ></ht-input>
          </el-col>
        </el-row>
      </ht-form-item>

      <ht-form-item>
        <template slot="label">
          <el-tooltip content="默认为原始图片宽高">
            <i class="property-tip icon-question" />
          </el-tooltip>
          <span>图片宽高</span>
        </template>
        <ht-input
          v-model="field.options.size.width"
          placeholder="宽度：默认图片宽度"
          :min="0"
          :max="999"
          type="number"
          style="width: 150px; float: left"
        />
        <ht-input
          v-model="field.options.size.height"
          type="number"
          :min="0"
          :max="999"
          placeholder="高度：默认图片高度"
          style="width: 150px"
        />
      </ht-form-item>
    </template>

    <!-- 图片 -->
    <template
      v-if="isBasicsProperty(field.options.basicsProperty, 'imageViewer')"
    >
      <ht-form-item>
        <template slot="label">
          <el-tooltip content="默认为原始图片宽高">
            <i class="property-tip icon-question" />
          </el-tooltip>
          <span>图片宽高</span>
        </template>
        <ht-input
          v-model="field.options.size.width"
          placeholder="宽度：默认图片宽度"
          :min="0"
          type="number"
          style="width: 150px; float: left"
        />
        <ht-input
          v-model="field.options.size.height"
          type="number"
          :min="0"
          placeholder="高度：默认图片高度"
          style="width: 150px"
        />
      </ht-form-item>
      <ht-form-item>
        <template slot="label">
          <el-tooltip content="图片的上传方式">
            <i class="property-tip icon-question" />
          </el-tooltip>
          <span>上传方式</span>
        </template>
        <el-radio v-model="field.options.uploadType" label="local" border
          >本地上传</el-radio
        >
        <el-radio v-model="field.options.uploadType" label="https" border
          >网络图片</el-radio
        >
      </ht-form-item>
      <el-checkbox v-model="field.options.file.multiple">
        是否多选
        <el-tooltip content="是否可同时选择多个文件上传">
          <i class="property-tip icon-question" />
        </el-tooltip>
      </el-checkbox>
      <ht-form-item
        class="custDialog-item"
        label="最多上传个数"
        label-width="100px"
      >
        <el-input-number
          style="width: 200px"
          v-model="field.options.file.limit"
          value="3"
          placeholder="最多上传个数"
          controls-position="right"
          :min="1"
          :max="100"
        ></el-input-number>
      </ht-form-item>
    </template>

    <!-- iframe -->
    <template v-if="isBasicsProperty(field.options.basicsProperty, 'iframe')">
      <ht-form-item label-width label="Iframe标签链接地址">
        <ht-input
          type="textarea"
          :rows="8"
          v-model="data.options.iframeSrc"
        ></ht-input>
      </ht-form-item>

      <ht-form-item label="iframe宽高" label-width>
        <!-- config.labelWidth  -->
        <el-input
          v-model="data.options.iframeSrcHeight"
          placeholder="高度：500px"
          style="width: 150px"
        />
        <el-input
          v-model="data.options.iframeSrcWidth"
          placeholder="宽度：100%"
          style="width: 150px; float: left"
        />
      </ht-form-item>
      <ht-form-item label="iframe样式" label-width>
        <ht-radio
          v-model="data.options.frameborder"
          :options="[
            {key: '0', value: '无边框'},
            {key: '1', value: '有边框'},
          ]"
        ></ht-radio>
        <span v-if="data.options.frameborder">
          颜色：
          <el-color-picker
            v-model="data.options.lableColor"
            size="mini"
          ></el-color-picker>
        </span>
      </ht-form-item>
    </template>

    <!-- contract -->
    <template v-if="isBasicsProperty(field.options.basicsProperty, 'contract')">
      <ht-form-item label="合同预览宽高" label-width>
        <!-- config.labelWidth  -->
        <el-input
          v-model="data.options.iframeSrcHeight"
          placeholder="高度：500px"
          style="width: 150px"
        />
        <el-input
          v-model="data.options.iframeSrcWidth"
          placeholder="宽度：100%"
          style="width: 150px; float: left"
        />
      </ht-form-item>
      <ht-form-item label="合同预览样式" label-width>
        <ht-radio
          v-model="data.options.frameborder"
          :options="[
            {key: '0', value: '无边框'},
            {key: '1', value: '有边框'},
          ]"
        ></ht-radio>
        <span v-if="data.options.frameborder">
          颜色：
          <el-color-picker
            v-model="data.options.lableColor"
            size="mini"
          ></el-color-picker>
        </span>
      </ht-form-item>
    </template>

    <!-- 设置自定义脚本  script-->
    <!-- <template v-if="isBasicsProperty(field.options.basicsProperty,'script')">
      <H3 style="margin-bottom: 0px;">设置控件执行的方法</H3>
      <el-button class="btn-padding" icon="el-icon-plus" @click="autoRunJSScript">设置自定义脚本</el-button>
    </template>-->

    <!-- placeholder 填写说明 placeholder-->
    <template
      v-if="
        isBasicsProperty(field.options.basicsProperty, 'placeholder') &&
        !field.noPlaceholder
      "
    >
      <ht-form-item label-width="100px">
        <template slot="label">
          <el-tooltip content="字段没有内容时显示的文本（placeholder）">
            <i class="property-tip icon-question" />
          </el-tooltip>
          <span>填写说明</span>
        </template>
        <ht-input v-model="field.options.placeholder" style="width: 215px">
          <el-button
            icon="el-icon-search"
            slot="append"
            style="width: 80px"
            @click="editI18nMessage('placeholder')"
            >国际化</el-button
          >
        </ht-input>
      </ht-form-item>
    </template>

    <!-- 按钮基础属性  onetextBtn-->
    <template
      v-if="isBasicsProperty(field.options.basicsProperty, 'onetextBtn')"
    >
      <h3 style="margin-bottom: 0px">按钮事件绑定设置</h3>
      <ht-form-item label-width="190px" class="custDialog-item">
        <template slot="label">
          <el-tooltip
            content="目前只添加系统中需使用到的事件，如果不满足需求，需自行扩展事件。"
          >
            <i class="property-tip icon-question" />
            <el-checkbox v-model="field.options.isBindBtn"
              >绑定按钮调用JS方法</el-checkbox
            >
          </el-tooltip>
        </template>
        <el-button
          v-if="field.options.isBindBtn"
          class="btn-padding"
          icon="el-icon-plus"
          @click="autoRunJSScript(true)"
          >设置自定义脚本</el-button
        >
      </ht-form-item>
      <ht-form-item label-width="190px">
        <template slot="label">
          <el-tooltip
            content="是否显示输入框,如果显示需要绑定属性,js方法返回的值将填写到输入框中"
          >
            <i class="property-tip icon-question" />
            <el-checkbox
              v-model="field.options.bindEventjson.isShowInput"
              @change="clickNoBindModel"
              >是否显示输入框</el-checkbox
            >
          </el-tooltip>
        </template>
      </ht-form-item>
      <ht-form-item class="table-switch" label-width="190px">
        <template slot="label">
          <el-tooltip content="启用后，可在按钮完成后自动调用自身的JS脚本">
            <i class="property-tip icon-question" />
            <el-checkbox v-model="field.options.bindEventjson.autoClick"
              >JS脚本自调用</el-checkbox
            >
          </el-tooltip>
        </template>
      </ht-form-item>
      <ht-form-item label-width="190px">
        <template slot="label">
          <el-tooltip
            content="按钮是否需要只读状态取消禁用,比如在只读权限时也可以点击之类"
          >
            <i class="property-tip icon-question" />
            <el-checkbox v-model="field.options.notDisabled"
              >是否只读时取消禁用</el-checkbox
            >
          </el-tooltip>
        </template>
      </ht-form-item>
      <!-- TODO:按钮组件在只读时的权限控制 -->
      <!-- <ht-form-item label-width="190px">
        <template slot="label">
          <el-tooltip
            content="在权限只读时是否隐藏按钮"
          >
            <i class="property-tip icon-question" />
            <el-checkbox
              v-model="field.options.bindEventjson.isShowInput"
              @change="clickNoBindModel"
              >是否显示输入框</el-checkbox
            >
          </el-tooltip>
        </template>
      </ht-form-item> -->
      <ht-form-item
        label="按钮名称"
        label-width="100px"
        class="customQuery-inputs custDialog-item"
      >
        <ht-input v-model="field.options.bindEventjson.name"></ht-input>
      </ht-form-item>
      <!-- lyzcw:添加按钮类型 2022-2-10-->
      <ht-form-item
        label="按钮类型"
        label-width="100px"
        class="customQuery-inputs custDialog-item"
      >
        <ht-select
          class="read-option-select"
          v-model="field.options.bindEventjson.btnType"
          :options="[
            {key: 'default', value: 'default', label: '缺省'},
            {key: 'primary', value: 'primary', label: '蓝色'},
            {key: 'success', value: 'success', label: '绿色'},
            {key: 'info', value: 'info', label: '灰色'},
            {key: 'warning', value: 'warning', label: '黄色'},
            {key: 'danger', value: 'danger', label: '红色'},
            {key: 'text', value: 'text', label: '文字'},
          ]"
        ></ht-select>
      </ht-form-item>

      <div class="custDialog-div">
        <span>按钮图标</span>
        <div style="float: right; margin-right: 15px">
          <IconDialog @selected="icons" />
        </div>

        <!-- <el-button
          class="custDialog-btn"
          icon="icon-magnify"
          size="mini"
          @click="custDialogClick"
        >选择</el-button>-->
      </div>
    </template>
    <!-- 图片生成二维码 -->
    <!-- <template v-if="isBasicsProperty(field.ctrlType, 'imgQRcode')">
      <ht-form-item label="常用语">
        <el-input v-model="field.options.contentStr" />
      </ht-form-item> 
    </template> -->

    <!-- 里程碑配置基本属性  script-->
    <template
      v-if="isBasicsProperty(field.options.basicsProperty, 'stepControl')"
    >
      <ht-form-item
        label="里程碑样式"
        label-width="210px"
        style="margin-bottom: 0px"
      >
        <el-radio-group
          v-model="field.options.direction"
          size="mini"
          class="btn-radio"
        >
          <el-radio-button label="horizontal">横向</el-radio-button>
          <!-- <el-radio-button label="buttom">下</el-radio-button> -->
          <el-radio-button label="vertical">纵向</el-radio-button>
          <!-- <el-radio-button label="right">右</el-radio-button> -->
        </el-radio-group>
      </ht-form-item>
      <ht-form-item
        label="里程碑内容设置"
        label-width="210px"
        style="margin-bottom: 0px"
      >
        <table
          class="form-table choiceType-table"
          cellspacing="0"
          cellpadding="0"
          border="0"
        >
          <tbody>
            <tr class="linkageTable-tr">
              <td style="width: 100px">名称</td>
              <td>描述</td>
              <td style="width: 55px">操作</td>
            </tr>
            <tr v-for="(item, index) in field.options.steps" :key="index">
              <td>
                <el-input
                  size="mini"
                  placeholder="名称"
                  v-model="item.title"
                ></el-input>
              </td>
              <td>
                <el-input
                  size="mini"
                  placeholder="名称"
                  v-model="item.description"
                ></el-input>
              </td>
              <td style="text-align: center">
                <el-button
                  class="btn-padding"
                  icon="el-icon-plus"
                  @click="
                    field.options.steps.push({title: '', description: ''})
                  "
                ></el-button>
                <el-button
                  class="btn-padding"
                  v-if="field.options.steps.length > 1"
                  style="margin-left: 0px"
                  icon="el-icon-delete"
                  @click="field.options.steps.remove(item)"
                ></el-button>
              </td>
            </tr>
          </tbody>
        </table>
      </ht-form-item>
    </template>

    <!--数据字典基本配置 dic -->
    <template
      v-if="isBasicsProperty(field.options.basicsProperty, 'dicConfig')"
    >
      <H3 style="margin-bottom: 0px">数据字典</H3>
      <div class="customQuery-inputs">
        <el-select
          @visible-change="dicClick"
          clearable
          v-model="field.options.dic"
          placeholder="请选择数据字典"
          style="width: 100%"
          ref="dicSelect"
        >
          <el-option
            :value="field.options.dic"
            :label="field.options.dicName"
            style="
              width: 100%;
              height: 100%;
              overflow: auto;
              background-color: #fff;
            "
          >
            <el-tree
              :data="dicData"
              :props="dicDefaultProps"
              @node-click="dicNodeClick"
            ></el-tree>
          </el-option>
        </el-select>
      </div>
      <ht-form-item>
        <el-checkbox-group size="mini" v-model="field.options.filterable">
          <el-checkbox-button label="filterable"
            >字典是否可搜索</el-checkbox-button
          >
        </el-checkbox-group>
      </ht-form-item>
    </template>

    <!-- 标签 -->
    <template
      v-if="isBasicsProperty(field.options.basicsProperty, 'tagConfig')"
    >
      <H3 style="margin-bottom: 0px">标签</H3>
      <div class="customQuery-inputs">
        <el-select
          @visible-change="tagClick"
          clearable
          v-model="field.options.tag"
          placeholder="请选择标签"
          style="width: 100%"
          ref="tagSelect"
        >
          <el-option
            :value="field.options.tag"
            :label="field.options.tagName"
            style="
              width: 100%;
              height: 100%;
              overflow: auto;
              background-color: #fff;
            "
          >
            <el-tree
              :data="tagData"
              :props="dicDefaultProps"
              @node-click="tagNodeClick"
            ></el-tree>
          </el-option>
        </el-select>
      </div>
      <ht-form-item>
        <el-switch
          v-model="field.options.filterable"
          active-color="#13ce66"
          inactive-color="#ff4949"
          active-text="可搜索"
          inactive-text="不可搜索"
        >
        </el-switch>
        <br />
        <el-switch
          v-model="field.options.expand"
          active-color="#13ce66"
          inactive-color="#ff4949"
          active-text="可扩展"
          inactive-text="不可扩展"
        >
        </el-switch>
        <br />
        <el-switch
          v-model="field.isMultiple"
          active-color="#13ce66"
          inactive-color="#ff4949"
          active-text="多选"
          inactive-text="单选"
        >
        </el-switch>
      </ht-form-item>
    </template>

    <!-- officeConfig -->
    <template
      v-if="isBasicsProperty(field.options.basicsProperty, 'officeConfig')"
    >
      <ht-form-item>
        <el-switch
          v-model="field.options.isRevision"
          active-color="#13ce66"
          inactive-color="#ff4949"
          active-text="显示痕迹"
          inactive-text="隐藏痕迹"
        >
        </el-switch>
      </ht-form-item>
    </template>

    <!--开关配置 switch -->
    <template v-if="isBasicsProperty(field.ctrlType, 'switch')">
      <ht-form-item label="打开时的值">
        <el-input
          v-model="field.options.activeValue"
          @input="field.options.defaultValue = field.options.activeValue"
        />
      </ht-form-item>
      <ht-form-item label="关闭时的值">
        <el-input v-model="field.options.inactiveValue" />
      </ht-form-item>
      <ht-form-item label="打开时文字描述">
        <el-input v-model="field.options.activeText" />
      </ht-form-item>
      <ht-form-item label="关闭时文字描述">
        <el-input v-model="field.options.inactiveText" />
      </ht-form-item>
    </template>

    <!-- 签章 -->
    <template v-if="isBasicsProperty(field.ctrlType, 'signature')">
      <ht-form-item label="最大签章人数">
        <el-input-number :min="1" v-model="field.options.maxPeople" />
      </ht-form-item>
    </template>

    <!-- 通用的不放在 template中-->
    <el-dialog
      title="自定义运行脚本设置"
      :visible.sync="dialogScriptVisible"
      append-to-body
      class="urgent-text"
      :close-on-click-modal="false"
    >
      <div>
        <p>
          <span>
            <strong>备注：</strong>
          </span>
        </p>
        <p>只需要填写function内的业务逻辑 内置参数有</p>
        <code>
          function(req,data,i18n,Message,Loading,formVm,_this){
          <br />// 业务逻辑代码 <br />// req 异步请求封装
          可以查看带中的request.js <br />// i18n 国际化对象
          i18n.t('login.login'); // data 在线表单数据对象 <br />// Message,
          Loading 分别ElementUI 的message 和 loading组件 <br />// formVm
          form的vue实例对象 使用如下 <br />// formVm.data 表单数据 <br />//
          formVm.$t('login.login') 国际化 <br />// _this 当前控件的vue对象
          _this.inputVal 控件绑定的model值 <br />} // 如果是设置树控件的脚本
          多三个参数 nodeData节点数据 ,node节点对象,treeComponent 树组件对象
        </code>
        <p>如果设置了输入框 返回值将直接绑带到输入框中</p>
      </div>
      <ht-form-item label="自定义JS脚本" label-width>
        <ht-select
          clearable
          placeholder="选择表单变量"
          v-model="diyScript"
          :options="allBoData"
          :props="{key: 'name', value: 'desc'}"
          @change="diyScriptChange"
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
                :value="
                  'data.' +
                  item.path +
                  (group.nodeType == 'sub' ? '[0]' : '') +
                  '.' +
                  item.name
                "
              ></el-option>
            </el-option-group>
          </template>
        </ht-select>
      </ht-form-item>
      <div style="width: 100%; height: 100%">
        <textarea
          v-model="scriptText"
          type="textarea"
          rows="15"
          autocomplete="off"
          ref="scriptText"
          style="width: 99%; height: 100%"
        ></textarea>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="scriptOk">确 定</el-button>
        <el-button
          @click="
            dialogScriptVisible = false
            scriptText = ''
          "
          >取 消</el-button
        >
      </div>
    </el-dialog>
    <i18n-message-edit
      ref="i18nMessageEdit"
      :messageKey="i18nMessageKey"
      @after-save="afterSaveI18n"
    />
  </el-form>
</template>

<script>
import ValidataProperty from '@/components/form/ValidataProperty.vue'
import FormVarSelector from '@/components/form/FormVarSelector.vue'
import ImgFileUpload from '@/components/common/ImgFileUpload.vue'
import IconDialog from '@/components/dialog/IconDialog.vue'
import {isArray} from 'util'
import {Base64} from 'js-base64'
import form from '@/api/form.js'
// import HtFormItem from "hotent-ui/src/components/common/HtFormItem";
import i18nMessageEdit from '@/components/system/I18nMessageEdit.vue'
import FormulasDialog from '@/components/form/customView/FormulasDialog.vue'
//ccwgq 2022-08-15 引入自定义的编辑关联链接的对话框组件
import RelativeLinkDialog from '@/components/form/customView/RelativeLinkDialog'
import {cloneDeep} from 'lodash'
import {Message} from 'element-ui'
export default {
  name: 'basics-property',
  props: [
    'data',
    'mainBoFields',
    'boDefData',
    'allBoData',
    'formVarData',
    'returnData',
    'formType',
    'linkageNoAttrFieldList',
  ],
  computed: {
    getCustomLink() {
      if (this.field.options.useCustomLink) {
        let customLink = this.field.options.customDialogjson.customLink
        if (typeof customLink === 'object') {
          return [customLink]
        }
        if (customLink.length) {
          customLink = customLink[0]
          return [customLink]
        }
      } else {
        return []
      }
    },
    //ccwgq 2022-10-09 获得对话框参数绑定的实体对象
    getDialogParamsEntity() {
      const emptyData = {children: []}
      if (this.field.ctrlType !== 'dialog') return emptyData
      let boData = this.allBoData.filter(
        (item) => item.tableName === this.data.tableName
      )
      boData = boData.length > 0 ? boData[0] : emptyData
      return boData
    },
  },
  components: {
    // HtFormItem,
    ValidataProperty,
    IconDialog,
    FormVarSelector,
    ImgFileUpload,
    i18nMessageEdit,
    FormulasDialog,
    RelativeLinkDialog,
  },
  data() {
    return {
      selectQueryDialog: false,
      dialogQuery: false,
      dialogImageUrl: '',
      dialogVisible: false,
      effectObj: {
        linkageType: 'field',
        validateObj: {
          fieldPath: this.data.fieldPath,
          options: {
            validateList: [],
            validate: '',
            validateType:
              'confirmed|email|regex|min|max|min_value|max_value|isAfter|isBefore|isStart|isEnd|numeric|between|is|digits|mobile|required|alpha_spaces|alpha_dash|alpha_num|alpha|method',
          },
        },
      },
      field: this.data,
      customQuerys: [],
      customQueryUrl: '',
      fields: [],
      filterListType: ['number', 'currency', 'date', 'amap'],
      dialogLinkageVisible: false, //联动设置对话框
      linkage: [
        {
          value: '',
          effect: [
            {
              validateObj: {
                fieldPath: this.data.fieldPath,
                options: {
                  validateList: [],
                  validate: '',
                  validateType:
                    'confirmed|email|regex|min|max|min_value|max_value|isAfter|isBefore|isStart|isEnd|numeric|between|is|digits|mobile|required|alpha_spaces|alpha_dash|alpha_num|alpha|method',
                },
              },
            },
          ],
        },
      ], //联动表达式
      items: [
        //联动校验显示隐藏
        {key: 'n', value: '隐藏'},
        {key: 'w', value: '显示'},
        {key: 'b', value: '必填'},
      ],
      selectors: [
        //选择器数组
        {
          name: '用户选择器',
          alias: 'eip-user-selector',
          fields: [
            {key: 'id', value: '用户ID'},
            {key: 'account', value: '用户账号'},
            {key: 'fullname', value: '用户姓名'},
            {key: 'mobile', value: '用户手机'},
            {key: 'email', value: '用户邮箱'},
          ],
        },
        {
          name: '组织选择器',
          alias: 'eip-org-selector',
          fields: [
            {key: 'id', value: '组织ID'},
            {key: 'code', value: '组织代码'},
            {key: 'name', value: '组织名称'},
            {key: 'pathName', value: '组织路径'},
          ],
        },
        {
          name: '角色选择器',
          alias: 'eip-role-selector',
          fields: [
            {key: 'id', value: '角色ID'},
            {key: 'code', value: '角色代码'},
            {key: 'name', value: '角色名称'},
          ],
        },
        {
          name: '职务选择器',
          alias: 'eip-job-selector',
          fields: [
            {key: 'id', value: '职务ID'},
            {key: 'code', value: '职务代码'},
            {key: 'name', value: '职务名称'},
          ],
        },
        {
          name: '岗位选择器',
          alias: 'eip-post-selector',
          fields: [
            {key: 'id', value: '岗位ID'},
            {key: 'code', value: '岗位代码'},
            {key: 'name', value: '岗位名称'},
          ],
        },
        {
          name: '维度选择器',
          alias: 'eip-demension-selector',
          fields: [
            {key: 'id', value: '维度ID'},
            {key: 'code', value: '维度代码'},
            {key: 'demName', value: '维度名称'},
          ],
        },
      ],
      dialogcustDialogVisible: false, //对话框
      customDialogs: [], //对话框列表数据
      custDialogprop: {}, //对话框返回值对象
      config: {
        initialFrameHeight: 240,
        UEDITOR_HOME_URL:
          window.location.origin +
          '/' +
          window.location.pathname.split('/')[1] +
          '/static/ueditor/',
        toolbars: [
          [
            // 'source', //源代码
            'undo', //撤销
            'bold', //加粗
            'indent', //首行缩进
            'italic', //斜体
            'underline', //下划线
            'strikethrough', //删除线
            'subscript', //下标
            'fontborder', //字符边框
            'superscript', //上标
            'formatmatch', //格式刷
            'forecolor', //字体颜色
            'justifyleft', //居左对齐
            'justifycenter', //居中对齐
            'justifyright', //居右对齐
            'justifyjustify', //两端对齐
            'fontfamily', //字体
            'fontsize', //字号
            'insertorderedlist', //有序列表
            'insertunorderedlist', //无序列表
            'lineheight', //行间距
            'inserttable', //插入表格
          ],
        ],
        // 初始容器宽度
        initialFrameWidth: '100%',
        zIndex: 9999,
        enableAutoSave: false,
        readonly: false,
      },
      upLoadAcceptList: [
        'jpg',
        'jpeg',
        'png',
        'bmp',
        'pdf',
        'JPG',
        'JPEG',
        'PNG',
        'BMP',
        'PDF',
        'doc',
        'docx',
        'xls',
        'xlsx',
        'ppt',
        'pptx',
        'rtf',
        'txt',
        'zip',
        'rar',
        'vsd',
        'dwg',
        'mp4',
        'avi',
        '3gp',
        'rmvb',
        'rm',
        'wmv',
      ], //附件上传支持的类型
      dialogTextVisible: false, //属性文本对话框
      textValue: '', //属性文本值
      dialogScriptVisible: false, //自定义js脚本对话框
      diyScript: '', //自定义js脚本对话框表单值
      scriptText: '', //自定义js脚本对话框值
      isBnt: false, //是否按钮脚本
      dicData: [],
      tagData: [],
      dicDefaultProps: {
        children: 'children',
        label: 'name',
      },
      custDialogpropKey: 1,
      i18nMessageKey: '',
      createKeyMap: {
        text: true,
        image: true,
        'immediate-single': true,
        'immediate-textarea': true,
      },
      companys: [
        {
          label: '台',
        },
        {
          label: '件',
        },
        {
          label: '元',
        },
      ],
      subTables: [], //子表对象
      linkageTypeList: [
        {key: 'field', desc: '字段'},
        {key: 'subTable', desc: '子表'},
      ], //联动类型列表
      //ccwgq 2022-08-15 增加关联链接的相关配置
      dialogRelativeDialog: false, //对话框隐藏控制
      relativeData: null, //选中的那一条数据
      dialogHistoryVisible: false,
      historyScript: '',
      historyScriptOptions: {
        value: '',
        mode: 'javascript',
        readOnly: false,
        smartIndent: true,
        tabSize: 2,
        theme: 'base16-light',
        lineNumbers: true,
        line: true,
      },
    }
  },
  methods: {
    historyDialogOpen() {
      let val = this.field.options.selfHistoryScript || ''
      if (val) {
        val = Base64.decode(val)
      }
      this.historyScript = val
      this.dialogHistoryVisible = true
    },
    historyDialogClose() {
      this.historyScript = ''
      this.dialogHistoryVisible = false
    },
    historyDialogSave() {
      this.field.options.selfHistoryScript = Base64.encode(this.historyScript)
      this.historyScript = ''
      this.dialogHistoryVisible = false
    },
    //ccwgq 2022-10-13 唯一标识字段
    changeUniqueField(value) {
      //获得表单字段路径
      if (!!value) {
        let mappingConf = null
        mappingConf = this.field.options.customDialogjson.custDialog.mappingConf
        if (mappingConf && !mappingConf.length) {
          mappingConf = []
        }
        const item = mappingConf.filter((item) => item.from === value)
        if (item && item.length) {
          const val = item[0].target[0]
          this.field.options.customDialogjson.uniqueField.target = val
          if (val && val.split) {
            const list = val.split('.')
            const name = list[list.length - 1]
            this.field.options.customDialogjson.uniqueField.targetName = name
          }
        }
        let resultField = this.field.options.customDialogjson.resultField
        if (resultField && !resultField.length) {
          resultField = []
        }
        const map = resultField.filter((item) => item.field === value)
        if (map && map.length) {
          this.field.options.customDialogjson.uniqueField.field =
            map[0].realField
        }
        return
      }
      //拿到为空
    },
    handleDialogSelectChange(val) {
      const row = this.field.options.customDialogjson.customLink
      row.linkFieldPath = this.mainBoFields[0].path + '.' + val
    },
    //附件类型全选
    selectAll() {
      this.field.options.file.accept = [...this.upLoadAcceptList]
    },
    //附件类型全不选
    selectNotAll() {
      this.field.options.file.accept = []
    },
    //附件类型反选
    counterSelect() {
      let list = [...this.upLoadAcceptList]
      for (var i = 0; i < this.field.options.file.accept.length; i++) {
        for (var j = 0; j < list.length; j++) {
          if (list[j] == this.field.options.file.accept[i]) {
            list.splice(j, 1)
            break
          }
        }
      }
      this.field.options.file.accept = list
    },
    changeShowCondition(value) {
      if (value) {
        this.field.options.showCondition.fieldPath =
          'item.' + this.field.options.showCondition.target
      } else {
        this.field.options.showCondition.fieldPath = ''
      }
    },
    filterFields(obj) {
      if (this.filterListType.indexOf(this.field.ctrlType) > -1) {
        return obj.dataType == this.field.options.dataType
      } else if (obj.nodeType == 'sub') {
        return false
      } else {
        return true
      }
    },
    formulasDialog() {
      if (!this.field.fieldPath) {
        this.$message('请选择需要修改的组件或绑定属性')
        return
      }
      this.$refs.formulasDialog.handleOpen()
    },
    //选择子表，控制子表权限
    subTableChange(value, data) {},
    afterSaveI18n(data) {
      data.key = data.key.replace('$', '#')
      if (data.prop.endsWith('placeholder')) {
        this.field.options.placeholder = data.key
        this.field.options.placeholder_zh = data.desc
      } else if (data.prop.endsWith('tip')) {
        this.tooltip = data.key
      } else {
        this.field.desc = data.key
        this.field.desc_zh = data.desc
      }
    },
    editI18nMessage(after) {
      this.i18nMessageKey = this.field.fieldPath || this.field.path
      if (this.createKeyMap[this.field.ctrlType]) {
        this.i18nMessageKey =
          this.formData.formKey +
          '.' +
          this.field.ctrlType +
          Math.random() * 5000
      }
      if (this.i18nMessageKey && after) {
        this.i18nMessageKey += after
      }
      this.$refs.i18nMessageEdit.handleOpen()
    },
    //关闭联动设置对话框
    closeDialogLinkage() {
      this.dialogLinkageVisible = false
      this.linkage.length = 0
    },
    getEffectsTargetOptions() {
      let boDataList = []
      if (this.field.parentNodeType) {
        boDataList = this.allBoData.filter(
          (tab) => tab.name == this.field.boSubEntity
        )
      } else {
        boDataList = this.allBoData
      }
      let linkageBoDataList = JSON.parse(JSON.stringify(boDataList))
      //处理联动无属性字段
      try {
        if (
          this.effectObj.linkageType == 'field' &&
          this.linkageNoAttrFieldList &&
          this.linkageNoAttrFieldList.length > 0
        ) {
          let tableName = this.field.parentNodeType
            ? this.field.boSubEntity
            : ''
          let noAttrObj = {
            name: 'noAttrField',
            desc: '无属性字段',
            children: [],
          }
          this.linkageNoAttrFieldList.forEach((item) => {
            if (!tableName || item.tableName === tableName) {
              if (item.ctrlType == 'button') {
                item.desc = item.options.bindEventjson.name
              }
              noAttrObj.children.push(item)
            }
          })
          if (noAttrObj.children.length > 0) {
            linkageBoDataList.push(noAttrObj)
          }
        }
      } catch (error) {}
      return JSON.parse(JSON.stringify(linkageBoDataList))
    },
    getLinkageTypeList(effects) {
      if (this.field.parentNodeType) {
        effects.boType = this.field.parentNodeType
          ? this.field.parentNodeType
          : 'sub'
        return this.linkageTypeList.filter((type) => type.key == 'field')
      } else {
        effects.boType = 'main'
        return this.linkageTypeList
      }
    },
    //按钮控件如果选择了不显示输入框,可以不用绑定属性
    clickNoBindModel(value) {
      if (!value) {
        this.field.fieldPath = ''
        this.field.options.noBindModel = true
        this.field.noTitle = true
        this.field.noPlaceholder = true
        this.field.noTooltip = true
      } else {
        this.field.options.noBindModel = false
        this.field.noTitle = false
        this.field.noPlaceholder = false
        this.field.noTooltip = false
      }
    },
    //按钮在只读时可以控制是否禁用
    clickDisabledModel(value) {
      if (value) {
        field.options.readDisabled = true
      } else {
        field.options.readDisabled = false
      }
    },
    icons(icon) {
      if (this.field.ctrlType == 'button') {
        this.field.options.bindEventjson.icon = icon
      } else {
        this.field.options.customDialogjson.icon = icon
      }
    },
    scriptOk() {
      this.dialogScriptVisible = false
      if (!this.scriptText) {
        this.field.options.script = ''
        return
      }
      if (!this.isBnt) {
        this.field.options.script = Base64.encode(this.scriptText)
      } else {
        this.field.options.script = Base64.encode(this.scriptText)
      }
    },
    async diyScriptChange(myValue) {
      const myField = this.$refs.scriptText
      var value = myValue
      if (myField.selectionStart || myField.selectionStart === 0) {
        var startPos = myField.selectionStart
        var endPos = myField.selectionEnd
        this.scriptText =
          myField.value.substring(0, startPos) +
          value +
          myField.value.substring(endPos, myField.value.length)
        await this.$nextTick() // 这句是重点, 圈起来
        myField.focus()
        myField.setSelectionRange(endPos + value.length, endPos + value.length)
      } else {
        this.scriptText += value
      }
    },
    autoRunJSScript(isBnt) {
      if (isBnt) {
        this.isBnt = true
      }
      this.dialogScriptVisible = true
      if (!this.field.options.script) return
      this.scriptText = Base64.decode(this.field.options.script)
    },
    textClick(node) {
      var value = ''
      if (node.nodeType == 'field') {
        value = '{{data.' + node.path + '.' + node.name + '}}'
      } else if (node.nodeType == 'var') {
        value = '{' + node.desc + ':' + node.name + '}'
      }
      this.textValue = this.textValue + value
    },
    handleRemove(file, fileList) {},
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url
      this.dialogVisible = true
    },
    // 对话框确定事件
    custDialogOk(isDialog) {
      //对话框返回值
      if (this.custDialogprop && ['dialog'].includes(this.field.ctrlType)) {
        var mappingConf = []
        for (var key in this.custDialogprop) {
          mappingConf.push({
            from: key,
            target: [this.custDialogprop[key]],
            targetSub: [this.custDialogprop[key]],
          })
        }
        this.field.options.customDialogjson.custDialog.mappingConf = mappingConf
        //关联数据返回值对象
      } else if (this.custDialogprop && this.field.ctrlType == 'relation') {
        this.field.options.gangedBind = this.custDialogprop
      }
      this.dialogcustDialogVisible = false
    },
    //对话框返回值解除绑定事件
    unbind(key) {
      for (var item in this.custDialogprop) {
        if (key == item) {
          this.$set(this.custDialogprop, key, '')
          delete this.custDialogprop[key]
        }
      }
    },
    //对话框change事件
    changeCustDialog() {
      const this_ = this
      this_.custDialogprop = {}
      this_.field.options.customDialogjson.custDialog.conditions = []
      this_.field.options.customDialogjson.custDialog.mappingConf = []
      this_.field.options.customDialogjson.custDialog.custQueryJson = []
      this_.field.options.customDialogjson.custDialog.selectNum = ''
      if (this_.customDialogs.length == 0) return
      if (this_.field.options.customDialogjson.custDialog.alias == null) {
        this_.field.options.customDialogjson.custDialog.conditions = []
        return
      }
      for (var i = 0, d; (d = this_.customDialogs[i++]); ) {
        if (d.alias == this_.field.options.customDialogjson.custDialog.alias) {
          this_.field.options.customDialogjson.custDialog.selectNum =
            d.selectNum //单选多选  1：单选。-1：多选
          let treeData
          if (d.style === 2) {
            let combineConfig = JSON.parse(d.combinationRule)
            let listDialog = this_.customDialogs.filter(
              (item) => item.alias === combineConfig.rightDialog
            )
            treeData = JSON.parse(listDialog[0].resultfield)
            this_.field.options.customDialogjson.custDialog.type = 'combiDialog'
          }
          if (d.listDialog && d.listDialog.resultfield) {
            treeData = eval('(' + d.listDialog.resultfield + ')')
            this_.field.options.customDialogjson.custDialog.type = 'combiDialog'
          }
          if (d.resultfield && d.resultfield !== '[]') {
            treeData = eval('(' + d.resultfield + ')')
            this_.field.options.customDialogjson.custDialog.type = 'custDialog'
          }
          for (let q = 0, f; (f = treeData[q++]); ) {
            //记录字段的变量值
            f.realField = f.field
            f.field = f.comment
          }
          this_.field.options.customDialogjson.resultField = treeData
          let conditionList = eval('(' + d.conditionfield + ')')
          this_.field.options.customDialogjson.custDialog.conditions = []
          //只处理类型等于1的对话框参数（defaultType：1：用户输入，2：固定值 ，3：参数传入）
          if (conditionList && conditionList.length > 0) {
            for (let j = 0, c; (c = conditionList[j++]); ) {
              if (c.defaultType == '3') {
                let has = false
                if (!has)
                  this_.field.options.customDialogjson.custDialog.conditions.push(
                    c
                  )
              }
            }
          }
        }
      }
      //ccwgq 2022-10-13 完善逻辑
      if (!this.field.options.customDialogjson.custDialog.alias) {
        this.field.options.customDialogjson.resultField = []
      }
    },
    dialogNotesSwitchChange(val) {
      //
      if (val == 'false') {
        this.field.options.dialogNotesContent = ''
      }
      if (val == 'true') {
        this.$nextTick(() => {
          this.$refs.dialogNotesContent.focus()
        })
      }
    },
    custDialogClick() {
      this.dialogcustDialogVisible = true
      var initConf = this.field.options.customDialogjson.custDialog.mappingConf
      if (initConf) {
        for (var i = 0, c; (c = initConf[i++]); ) {
          if (!c) continue
          var target = c.target
          if (target) target = target.join(',')
          this.custDialogprop[c.from] = target

          var targetSub = c.targetSub
          if (targetSub) targetSub = targetSub.join(',')
          this.custDialogprop[c.from] = targetSub
        }
      }
    },
    changeFieldBind() {
      if (
        !this.field ||
        !this.field.options ||
        !this.field.options.selector ||
        !this.field.options.selector.type
      )
        return
      var alias = this.field.options.selector.type.alias,
        oldBind = this.field.options.bind
      if (!alias) {
        delete this.field.options
        return
      }
      if (
        oldBind &&
        oldBind.length > 0 &&
        this.field.options.bind[0].alias == alias
      )
        return
      var keyValues = []
      for (var i = 0; i < this.selectors.length; i++) {
        if (alias == this.selectors[i].alias) {
          var fields = this.selectors[i].fields
          for (var j = 0; j < fields.length; j++) {
            keyValues.push({
              alias: alias,
              key: fields[j].key,
              value: fields[j].value,
            })
          }
        }
      }
      this.field.options.bind = []
      this.field.options.bind = keyValues
    },
    linkageOk() {
      if (this.field.ctrlType == 'select') {
        if (this.linkage.length == 0) {
          this.dialogLinkageVisible = false
          this.field.options.linkage = []
        } else {
          try {
            this.linkage.forEach((column) => {
              column.effect.forEach((effects) => {
                if (effects.type && (effects.target || effects.targetSub)) {
                  this.dialogLinkageVisible = false
                  this.field.options.linkage = [...this.linkage]
                  // Object.assign(this.field.options.linkage, this.linkage);
                } else {
                  this.$message({message: '请将信息填写完整', type: 'warning'})
                  throw new Error('breakForEach')
                  return false
                }
              })
            })
          } catch (e) {
            if (e.message != 'breakForEach') throw e
          }
        }
      } else {
        this.dialogLinkageVisible = false
        this.field.options.linkage = [...this.linkage]
        // Object.assign(this.field.options.linkage, this.linkage);
      }
    },
    addRows() {
      this.linkage.push({
        value: '',
        effect: [
          {
            linkageType: 'field',
            validateObj: {
              fieldPath: this.field.fieldPath,
              options: {
                validateList: [],
                validate: '',
                validateType:
                  'confirmed|email|regex|min|max|min_value|max_value|isAfter|isBefore|isStart|isEnd|numeric|between|is|digits|mobile|required|alpha_spaces|alpha_dash|alpha_num|alpha|method',
              },
            },
          },
        ],
      })
    },
    //打开联动设置对话框
    openLinkage() {
      this.subTables = []
      for (let i = 0; i < this.allBoData.length; i++) {
        if (this.allBoData[i].nodeType == 'sub') {
          this.subTables.push(this.allBoData[i])
        }
      }
      if (this.field.options.linkage && this.field.options.linkage.length > 0) {
        this.linkage = [...this.field.options.linkage]
      } else {
        this.linkage = []
      }
      this.dialogLinkageVisible = true
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
    //选择下拉框控件并绑定关联查询
    setSelectQuery(alias, index) {
      const _this = this
      _this.customQuerys.forEach((item) => {
        //判断选择的关联查询是否存在
        if (alias == item.alias) {
          if (typeof item.conditionfield == 'string') {
            item.conditionfield = JSON.parse(item.conditionfield) //parseToJson(item.customQuery.conditionfield);
            item.resultfield = JSON.parse(item.resultfield) // parseToJson(item.customQuery.resultfield);
            item.conditionfield.forEach((res) => {
              _this.$set(res, 'fieldPath', '') //关联查询条件字段绑定的表单参数路径
            })
            item.resultfield.forEach((res) => {
              _this.$set(res, 'fieldPath', '') //关联查询返回字段绑定的表单参数路径
            })
          }
          //把当前对象克隆一份到控件属性配置
          Object.assign(
            _this.field.options.customQuery.custQueryJson[index],
            item
          )
          // 删除多余属性
          _this.slimCustomQuery(
            _this.field.options.customQuery.custQueryJson[index]
          )
        }
      })
    },
    //打开下拉框绑定关联查询弹框
    showSelectQueryDialog() {
      this.selectQueryDialog = true
    },
    //打开对话框绑定关联查询弹框
    showDialogQuery() {
      this.dialogQuery = true
    },
    //选择对话框控件并绑定关联查询
    setDialogQuery(alias, index) {
      const _this = this
      _this.customQuerys.forEach((item) => {
        //判断选择的关联查询是否存在
        if (alias == item.alias) {
          if (typeof item.conditionfield == 'string') {
            item.conditionfield = JSON.parse(item.conditionfield) //parseToJson(item.customQuery.conditionfield);
            item.resultfield = JSON.parse(item.resultfield) // parseToJson(item.customQuery.resultfield);
            item.conditionfield.forEach((res) => {
              _this.$set(res, 'fieldPath', '') //关联查询条件字段绑定的表单参数路径
            })
            item.resultfield.forEach((res) => {
              _this.$set(res, 'fieldPath', '') //关联查询返回字段绑定的表单参数路径
            })
          }
          //把当前对象克隆一份到控件属性配置
          Object.assign(
            _this.field.options.customDialogjson.custDialog.custQueryJson[
              index
            ],
            item
          )
          _this.slimCustomQuery(
            _this.field.options.customDialogjson.custDialog.custQueryJson[index]
          )
        }
      })
    },
    //选择动态选项
    setCurrentCustomQuery() {
      const _this = this
      _this.field.options.customQuery.custQueryJson = []
      _this.customQuerys.forEach((item) => {
        if (_this.field.options.customQuery.alias == item.alias) {
          if (typeof item.conditionfield == 'string') {
            item.conditionfield = JSON.parse(item.conditionfield) //parseToJson(item.customQuery.conditionfield);
            item.resultfield = JSON.parse(item.resultfield) // parseToJson(item.customQuery.resultfield);
          }
          //把当前对象克隆一份到控件属性配置
          Object.assign(_this.field.options.customQuery, item)
          _this.slimCustomQuery(_this.field.options.customQuery)
        }
      })
      //删除掉无效的参数
      var bind = []
      this.field.options.customQuery.conditionfield.forEach((item) => {
        if (item.defaultType == 1) {
          bind.push(item)
        }
      })
      this.field.options.bind = bind
      //切换关联数据设置项或下拉框动态值 同时清空绑定返回值、参数绑定、选项绑定
      this.custDialogprop = {}
      this.field.options.gangedBind = {}
      this.field.options.customQuery.valueBind = ''
      this.field.options.customQuery.labelBind = ''
      if (this.field.options.customQuery.conditionfield) {
        this.field.options.customQuery.conditionfield.forEach((element) => {
          this.$set(element, 'fieldPath', '')
        })
      }
    },
    //切换固定选项和动态选项时
    dynamicClick() {
      this.customQueryUrl = '/form/customQuery/v1/list'
      this.field.options.customQuery = {
        valueBind: '',
        labelBind: '',
        conditionfield: [],
        custQueryJson: [],
      }
      this.field.options.bind = []
      this.field.options.options = []
      if (this.field.options.choiceType == 'dynamic') {
        this.field.options.linkage = []
      }
    },
    //数据字典列表
    afterDicLoadData(data) {
      this.dicData = data.rows
    },
    dicClick(visible) {
      if (this.dicData && this.dicData.length > 0) return
      form.getCategory('DIC', (data) => {
        this.dicData = data.data
      })
    },
    tagClick(visible) {
      if (this.tagData && this.tagData.length > 0) return
      form.getCategory('TAG', (data) => {
        this.tagData = data.data.filter(
          (item) => item.id === '31120'
        )[0].children
      })
    },
    dicNodeClick(data) {
      this.field.options.dic = data.typeKey
      this.field.options.dicName = data.name
      this.$refs.dicSelect.blur()
    },
    tagNodeClick(data) {
      this.field.options.tag = data.typeKey
      this.field.options.tagName = data.name
      this.$refs.tagSelect.blur()
    },
    afterCustomQueryLoadData(data) {
      this.customQuerys = data.rows
    },
    afterCustomDialogLoadData(data) {
      this.customDialogs = data
    },
    //判断控件是否有特殊基础属性
    isBasicsProperty(basicsProperty, alias) {
      if (basicsProperty && alias) {
        const basicsPropertys = basicsProperty.split('|')
        if (basicsPropertys.includes(alias)) {
          return true
        } else {
          return false
        }
      }
      return false
    },
    clearFunction() {
      this.field.options.mathExp = undefined
    },
    updateCustDialogprop() {
      this.$forceUpdate()
    },
    addEffectObj(effect, effectObj) {
      let cloneObj = JSON.parse(JSON.stringify(effectObj))
      if (cloneObj.validateObj) {
        if (cloneObj.validateObj.options) {
          cloneObj.validateObj.options.validateList = []
        }
      }
      effect.push(cloneObj)
    },
    copyEffectObj(effect, effectObj) {
      effect.push(JSON.parse(JSON.stringify(effectObj)))
    },
    copyEffect(column) {
      this.linkage.push(JSON.parse(JSON.stringify(column)))
    },
    filteredAllBoData() {
      this.field
    },
    getEffectsTarget(group, item) {
      let groupName = group.name === 'noAttrField' ? item.tableName : group.name
      return item.path + '.' + item.name + '|' + groupName + '.' + item.name
    },
    //ccwgq 2022-08-15 打开设置关联链接对话框
    openRelativeLinkDialog() {
      const row = this.field.options.customDialogjson.customLink
      //TODO:一些数据校验的准备工作
      this.relativeData = row
      if (!row.linkFieldPath) {
        Message.warning('请先选择回填字段')
        return
      }
      const vm = this.$refs.linkDialog
      vm.dialogResultFields = this.field.options.customDialogjson.resultField
      vm.formData = row
      if (row.selectTypeField) {
        vm.selectResultField = row.selectTypeField
      }
      vm.handleOpen()
    },
    addCustomLinkItem() {
      const emptyItem = {
        linkFieldPath: '', //链接字段,将关联到的字段路径
        linkingConf: [
          {
            field: '', //从返回数据中的字段取出一个值
            value: '', //字段的值
            linkTmp: '', //映射的路径模板(核心,占位符在此使用)
          },
        ], //链接映射
      }
      this.field.options.customDialogjson.customLink.push(emptyItem)
    },
    //ccwgq 2022-08-15 移除关联链接映射中的某一项
    removeRelativeMapItem(row) {
      let array = this.field.options.customDialogjson.customLink
      const index = this.indexArray(array, row)
      array.splice(index, 1)
    },
    //ccwgq  2020-08-15 判断数据是否包含某个对象，并返回数据包含对象的下标
    indexArray(array, item) {
      if (array.length == 0) {
        return -1
      }
      for (let i = 0; i < array.length; i++) {
        if (JSON.stringify(array[i]) == JSON.stringify(item)) {
          return i
        }
      }
      return -1
    },
  },
  watch: {
    data(val) {
      if (val.options && val.options.selector) {
        if (!val.options.selector.isSingle) {
          this.$set(val.options.selector, 'isSingle', false)
        }
        if (!val.options.selector.selectCurrent) {
          this.$set(val.options.selector, 'selectCurrent', false)
        }
      }
      this.field = val
    },
    field: {
      handler(val) {
        this.$emit('update:data', val)
      },
      deep: true,
    },
  },
}
</script>
<style lang="scss" scoped>
@import '@/assets/css/element-variables.scss';
@import '@/assets/css/form-editor.scss';

.btn-radio >>> .el-radio-button__inner {
  padding: 5px;
}
.btn-padding {
  padding: 5px;
}
.btn-radio {
  margin-left: 14px;
}
.btn-radio >>> .el-radio-button__inner {
  padding: 5px;
}
.choiceType-table td {
  padding: 3px;
}
.customQuery-inputs >>> .inputs,
.customQuery-inputs >>> .inputs .el-select {
  width: 100%;
  height: fit-content;
}
.customQuery-switch {
  width: 100%;
  /deep/ .el-form-item__label {
    margin-top: 9px !important;
  }
  /deep/ .el-switch__core {
    margin-top: 12px !important;
  }
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
.custDialog-div {
  height: 28px;
  line-height: 28px;
  margin-bottom: 3px;
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
.file-checkbox .el-checkbox {
  margin-right: 10px;
}
code {
  background-color: #f9f2f4;
  border-radius: 4px;
  color: #ca4440;
  font-size: 90%;
  padding: 2px 4px;
  white-space: nowrap;
}
>>> .el-dialog__body {
  padding: 0px 20px;
  color: #606266;
  font-size: 14px;
  word-break: break-all;
}
.history-dialog {
  height: 300px;
}
</style>
