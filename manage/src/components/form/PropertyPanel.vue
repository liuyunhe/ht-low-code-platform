<template>
  <el-form
    data-vv-scope="field"
    class="form"
    size="small"
    inline
    label-position="left"
  >
    <el-tabs
      class="field__tabs"
      v-model="activeTabName"
      type="card"
      @tab-click="handleClick"
    >
      <el-tab-pane label="字段属性" name="field">
        <el-scrollbar class="scrollbar-fullheight">
          <el-collapse
            v-if="field && !field.isLayout"
            accordion
            v-model="avtiveCollapseName"
          >
            <el-collapse-item title="基础属性" name="basic">
              <!-- iframe 配置项显示在基础属性中 -->
              <template
                v-if="
                  !field.isLayout &&
                  (field.ctrlType == 'iframe' ||
                    field.ctrlType == 'contractPreview')
                "
              >
                <BasicsProperty
                  :data="field"
                  :main-bo-fields="tableFields"
                  :all-bo-data="allBoData"
                  :bo-def-data="boDefData"
                  :formVarData="formVarData"
                  :returnData="returnData"
                  :formType="formData.formType"
                  :linkageNoAttrFieldList="noAttrFieldList"
                />
              </template>
              <!-- TODO w 自定义属性 -->
              <template v-if="field.bindModelType">
                <el-form-item label="属性类型" label-width="100px">
                  <template slot="label" >
                    <span>属性类型</span>
                  </template>
                  <el-select v-model="field.bindModelType" :change="diyBind(field.bindModelType)">
                    <el-option key="model" value="model" label="模型属性"></el-option>
                    <el-option key="diyModel" value="diyModel" label="自定义属性"></el-option>
                  </el-select >
                </el-form-item>
              </template>
              <template  v-if="field.bindModelType == 'diyModel'">
                
                <el-form-item label="绑定自定义属性" required label-width="100px">
                  <ht-input v-model="field.modelName" :validate="{required: true}" placeholder="请输入自定义属性"></ht-input>
                  <!-- <el-input v-model="field.modelName" placeholder="请输入自定义属性"></el-input> -->
                </el-form-item>
              </template>
              <template v-if="!field.isLayout && !field.noBasics">
                <ht-form-item label-width="100px" v-if="isNoAttrField()">
                  <template slot="label">
                    <el-tooltip content="请选择控件所绑定的业务对象属性">
                      <i class="property-tip icon-question" />
                    </el-tooltip>
                    <span>绑定对象</span>
                  </template>
                  <ht-select
                    validate="required"
                    v-model="field.tableName"
                    :options="tableFields"
                    :props="{key: 'keyName', value: 'desc'}"
                    filterable
                    clearable
                    @change="changeNoAttrFile"
                  >
                    <template slot-scope="{options}">
                      <el-option
                        v-for="group in options"
                        :key="group.name"
                        :label="group.desc"
                        :value="group.name"
                      ></el-option>
                    </template>
                  </ht-select>
                </ht-form-item>

                <ht-form-item
                  v-show="false"
                  label-width="100px"
                  v-if="isNoAttrField()"
                >
                  <template slot="label">
                    <span>控件别名</span>
                  </template>
                  <ht-input v-model="field.name" readonly></ht-input>
                </ht-form-item>
              </template>
              <template v-if="!field.isLayout && !field.noBasics">
                <ht-form-item
                  label-width="100px"
                  v-if="!field.options || !field.options.noBindModel|| diyBind(field.bindModelType)"
                >
                  <template slot="label">
                    <el-tooltip content="请选择字段所绑定的业务对象属性">
                      <i class="property-tip icon-question" />
                    </el-tooltip>
                    <span>绑定属性</span>
                  </template>
                  <ht-select
                    validate="required"
                    v-model="field.target"
                    :options="tableFields"
                    :props="{key: 'keyName', value: 'desc'}"
                    filterable
                    clearable
                    @change="change"
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
                </ht-form-item>
                <ht-form-item
                  label="字段标题"
                  label-width="100px"
                  v-if="!field.noTitle"
                >
                  <ht-input v-model="field.desc" style="width: 215px">
                    <el-button
                      icon="el-icon-search"
                      slot="append"
                      style="width: 80px"
                      @click="editI18nMessage('')"
                      >国际化</el-button
                    >
                  </ht-input>
                </ht-form-item>
                <!-- 控件类型 -->
                <ht-form-item
                  v-if="field.ctrlType != 'divider'"
                  label="控件类型"
                  label-width="100px"
                >
                  <el-select
                    v-model="field.ctrlType"
                    :filterable="true"
                    @change="isChangeWatch"
                  >
                    <el-option-group label="基础字段">
                      <el-option
                        v-for="item in basicComponents.filter((obj) => {
                          return filterFieldsByCurrentField(obj)
                        })"
                        :key="item.ctrlType"
                        :label="item.desc"
                        :value="item.ctrlType"
                      />
                    </el-option-group>
                    <el-option-group label="高级字段">
                      <el-option
                        v-for="item in advanceComponents.filter((obj) => {
                          return filterAdvanceFields(obj)
                        })"
                        :key="item.ctrlType"
                        :label="item.desc"
                        :value="item.ctrlType"
                      />
                    </el-option-group>
                  </el-select>
                </ht-form-item>
                <!-- TODO:ccwgq 2022-07-29  增加栅格布局中控件的transfrom:translateY垂直位移的调整-->
                <!-- 子孙表table布局列宽设置 -->
                <ht-form-item
                  label-width="100px"
                  v-if="!field.noTitle && field.options"
                >
                  <template slot="label">
                    <el-tooltip content="子孙表Table布局列宽请设置为：px">
                      <i class="property-tip icon-question" />
                    </el-tooltip>
                    <span>标题宽度</span>
                  </template>
                  <ht-input
                    v-model="field.options.labelstyleWidth"
                    placeholder="宽度：100%"
                  ></ht-input>
                </ht-form-item>
                <!-- 高德地图 -->
                <template v-if="field.ctrlType == 'amap'">
                  <ht-form-item label-width="100px">
                    <template slot="label">
                      <el-tooltip content="请选择地图返回的地址要绑定的字段">
                        <i class="property-tip icon-question" />
                      </el-tooltip>
                      <span>绑定字段</span>
                    </template>
                    <ht-select
                      validate="required"
                      v-model="field.options.addressName"
                      :options="tableFields"
                      :props="{key: 'name', value: 'desc'}"
                      @change="changeMap"
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
                  </ht-form-item>
                  <ht-form-item label-width="100px">
                    <template slot="label">
                      <el-tooltip
                        content="高德地图控件的高度，默认高度为：350px。"
                      >
                        <i class="property-tip icon-question" />
                      </el-tooltip>
                      <span>地图高度</span>
                    </template>
                    <ht-input
                      type="number"
                      v-model="field.options.heightMap"
                      v-if="!field.noTitle"
                      :min="0"
                    ></ht-input>
                  </ht-form-item>
                </template>
                <!-- ccwgq 2022-05-25  增加流程附件  流程附件中需要绑定nodeName的值以及nodeId的值 -->
                <!-- 启用流程功能 -->
                <template v-if="field.ctrlType == 'ou-attachment'">
                <ht-form-item
                  class="table-switch"
                  label-width="120px"
                >
                  <template slot="label">
                    <el-tooltip
                      content="是否把流程节点信息传入控件,并指定相关的字段"
                    >
                      <i class="property-tip icon-question" />
                    </el-tooltip>
                    <span>流程信息</span>
                  </template>
                  <el-switch
                    v-model="field.options.showFlowInfo"
                    active-text="启用"
                    inactive-text="关闭"
                    :active-value="true"
                    :inactive-value="false"
                  ></el-switch>
                </ht-form-item>
                <!-- 节点名称 -->
                <ht-form-item
                  label-width="120px"
                  v-if="
                    field.options.showFlowInfo
                  "
                >
                  <template slot="label">
                    <el-tooltip
                      content="请选择流程附件记录流程名所绑定的业务对象属性"
                    >
                      <i class="property-tip icon-question" />
                    </el-tooltip>
                    <span>节点名称绑定</span>
                  </template>
                  <ht-select
                    validate="required"
                    v-model="field.options.nodeName"
                    :options="tableFields"
                    :props="{key: 'keyName', value: 'desc'}"
                    filterable
                    clearable
                    @change="changeAttachmentNodeField"
                  >
                    <template slot-scope="{options, propKey, propValue}">
                      <el-option-group
                        v-for="group in options"
                        :key="group.name"
                        :label="group.desc"
                      >
                        <el-option
                          v-for="item in group.children.filter((obj) => {
                            return (
                              (obj.columnType == 'varchar' ||
                                obj.dataType == 'varchar') &&
                              obj.keyName !== field.options.nodeId
                            )
                          })"
                          :key="item[propKey]"
                          :label="item[propValue]"
                          :value="item[propKey]"
                        ></el-option>
                      </el-option-group>
                    </template>
                  </ht-select>
                </ht-form-item>
                <!-- 节点ID -->
                <ht-form-item
                  label-width="120px"
                  v-if="
                    field.options.showFlowInfo
                  "
                >
                  <template slot="label">
                    <el-tooltip
                      content="请选择流程附件记录流程节点ID所绑定的业务对象属性"
                    >
                      <i class="property-tip icon-question" />
                    </el-tooltip>
                    <span>节点ID绑定</span>
                  </template>
                  <ht-select
                    validate="required"
                    v-model="field.options.nodeId"
                    :options="tableFields"
                    :props="{key: 'keyName', value: 'desc'}"
                    filterable
                    clearable
                    @change="changeAttachmentNodeField"
                  >
                    <template slot-scope="{options, propKey, propValue}">
                      <el-option-group
                        v-for="group in options"
                        :key="group.name"
                        :label="group.desc"
                      >
                        <el-option
                          v-for="item in group.children.filter((obj) => {
                            return (
                              (obj.columnType == 'varchar' ||
                                obj.dataType == 'varchar') &&
                              obj.keyName !== field.options.nodeName
                            )
                          })"
                          :key="item[propKey]"
                          :label="item[propValue]"
                          :value="item[propKey]"
                        ></el-option>
                      </el-option-group>
                    </template>
                  </ht-select>
                </ht-form-item>
                <!-- TODO:当前用户限制 -->
                <!-- TODO:历史版本 -->
                <!-- TODO:三方权限控制 -->
                <!-- ou-attatchment 自定义一部分显示的列 -->
                <!-- <div v-if="field.ctrlType == 'ou-attachment'">
                  <el-divider>自定义列开始</el-divider>
                  <el-button
                    @click="attachmentAddDefineColumn(field.options)"
                    type="primary"
                    size="mini"
                    round
                    ><i class="el-icon-plus"></i>新增</el-button
                  >
                  <el-table :data="field.options.defineColumns">
                    <el-table-column label="表头标题名">
                      <template slot-scope="scope">
                        <el-input
                          v-model="scope.row.label"
                          type="text"
                          size="mini"
                        ></el-input>
                      </template>
                    </el-table-column>
                    <el-table-column label="选择字段">
                      <template slot-scope="scope">
                        <ht-select
                          validate="required"
                          v-model="scope.row.fieldPath"
                          :options="tableFields"
                          :props="{key: 'keyName', value: 'desc'}"
                          filterable
                          clearable
                          @change="changeAttachmentNodeField"
                        >
                          <template slot-scope="{options, propKey, propValue}">
                            <el-option-group
                              v-for="group in options"
                              :key="group.name"
                              :label="group.desc"
                            >
                              <el-option
                                v-for="item in group.children.filter((obj) => {
                                  return (
                                    (obj.columnType == 'varchar' ||
                                      obj.dataType == 'varchar') &&
                                    obj.keyName !== field.options.nodeName
                                  )
                                })"
                                :key="item[propKey]"
                                :label="item[propValue]"
                                :value="item[propKey]"
                              ></el-option>
                            </el-option-group>
                          </template>
                        </ht-select>
                      </template>
                    </el-table-column>
                  </el-table>
                  <el-divider>自定义列结束</el-divider>
                </div> -->
                <!-- 是否使用水印功能 -->
                <ht-form-item
                  class="table-switch"
                  label-width="120px"
                >
                  <template slot="label">
                    <el-tooltip content="是否启用给附件打上水印">
                      <i class="property-tip icon-question" />
                    </el-tooltip>
                    <span>附件水印</span>
                  </template>
                  <el-switch
                    v-model="field.options.watermark"
                    active-text="启用"
                    inactive-text="关闭"
                    :active-value="true"
                    :inactive-value="false"
                  ></el-switch>
                </ht-form-item>
                <!-- 默认水印文字 -->
                <ht-form-item
                  label-width="120px"
                >
                  <template slot="label">
                    <el-tooltip content="默认的水印文字,例如:xxx财务部">
                      <i class="property-tip icon-question" />
                    </el-tooltip>
                    <span>水印文字</span>
                  </template>
                 <el-input size="small" type="text" v-model="field.options.defaultMarkText"></el-input>
                </ht-form-item>
                <!-- 启用水印要绑定编号字段 -->
                <ht-form-item
                  label-width="120px"
                  v-if="
                     field.options.watermark
                  "
                >
                  <template slot="label">
                    <el-tooltip
                      content="启用水印功能需要绑定一个编号字段，这个编号由表单字段提供"
                    >
                      <i class="property-tip icon-question" />
                    </el-tooltip>
                    <span>编号字段绑定</span>
                  </template>
                  <ht-select
                    validate="required"
                    v-model="field.options.serialNo"
                    :options="tableFields"
                    :props="{key: 'keyName', value: 'desc'}"
                    filterable
                    clearable
                    @change="changeAttachmentNodeField"
                  >
                    <template slot-scope="{options, propKey, propValue}">
                      <el-option-group
                        v-for="group in options"
                        :key="group.name"
                        :label="group.desc"
                      >
                        <el-option
                          v-for="item in group.children.filter((obj) => {
                            return (
                              (obj.columnType == 'varchar' ||
                                obj.dataType == 'varchar') &&
                              obj.keyName !== field.options.nodeName
                            )
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
                <!-- ccwgq 2022-10-09 增加流程意见 -->
                <template v-if="field.ctrlType == 'ou-opinion'">
                <ht-form-item label-width="100px">
                    <template slot="label">
                      <el-tooltip
                        content="意见为空时,显示什么提示文字，默认为空"
                      >
                        <i class="property-tip icon-question" />
                      </el-tooltip>
                      <span>默认文字</span>
                    </template>
                    <el-input size="small" type="text" v-model="field.options.emptyText" placeholder=""></el-input>
                  </ht-form-item>
                    <ht-form-item label-width="100px">
                    <template slot="label">
                      <el-tooltip
                        content="意见排序方式,支持按创建时间的正序或者倒序进行排序"
                      >
                        <i class="property-tip icon-question" />
                      </el-tooltip>
                      <span>意见排序</span>
                    </template>
                    <el-radio-group v-model="field.options.sort">
                      <el-radio label="aesc">正序</el-radio>
                      <el-radio label="desc">倒序</el-radio>
                    </el-radio-group>
                  </ht-form-item>
                  <ht-form-item class="table-switch" label-width="120px">
                    <template slot="label">
                      <el-tooltip
                        content="除了显示意见发起人之外,是否展示对应的部门名称信息"
                      >
                        <i class="property-tip icon-question" />
                      </el-tooltip>
                      <span>部门信息</span>
                    </template>
                    <el-switch v-model="field.options.showDepartInfo"
                    inactive-text="隐藏"
                    :inactive-value="false"
                    active-text="显示"
                    :active-value="true"
                    ></el-switch>
                  </ht-form-item>
                  <!-- 日期时间控制 -->
                  <ht-form-item class="table-switch" label-width="120px">
                    <template slot="label">
                      <el-tooltip
                        content="最后一行显示日期，例如2000-01-01"
                      >
                        <i class="property-tip icon-question" />
                      </el-tooltip>
                      <span>日期显示</span>
                    </template>
                    <el-switch v-model="field.options.showDate"
                    inactive-text="隐藏"
                    :inactive-value="false"
                    active-text="显示"
                    :active-value="true"
                    ></el-switch>
                  </ht-form-item>
                   <ht-form-item  label-width="120px" v-if="field.options.showDate">
                    <template slot="label">
                      <el-tooltip
                        content="支持自定义的日期格式,用YYYY表示年,M表示月,D表示日。
                        2000年01月01日即是:YYYY年MM月DD日；如果为空将使用默认值YYYY-MM-DD。"
                      >
                        <i class="property-tip icon-question" />
                      </el-tooltip>
                      <span>日期格式</span>
                    </template>
                   <el-input clearable size="small" type="text" v-model="field.options.datePattern" placeholder="默认:YYYY-MM-DD"></el-input>
                  </ht-form-item>
                  <ht-form-item class="table-switch" label-width="120px">
                    <template slot="label">
                      <el-tooltip
                        content="最后一行显示具体时间，例如16:00:00"
                      >
                        <i class="property-tip icon-question" />
                      </el-tooltip>
                      <span>时间显示</span>
                    </template>
                    <el-switch v-model="field.options.showTime"
                    inactive-text="隐藏"
                    :inactive-value="false"
                    active-text="显示"
                    :active-value="true"
                    ></el-switch>
                  </ht-form-item>
                   <ht-form-item  label-width="120px" v-if="field.options.showTime">
                    <template slot="label">
                      <el-tooltip
                        content="支持自定义的时间格式,用HH表示小时(24小时),h表示小时(12小时),m表示分,d表示秒。
                        16时34分56秒即是:HH时mm分ss秒；如果为空将使用默认值HH:mm:ss。"
                      >
                        <i class="property-tip icon-question" />
                      </el-tooltip>
                      <span>时间格式</span>
                    </template>
                   <el-input clearable size="small" type="text" v-model="field.options.timePattern" placeholder="默认:HH:mm:ss"></el-input>
                  </ht-form-item>
                   <ht-form-item  label-width="120px">
                    <template slot="label">
                      <el-tooltip
                        content="意见之间支持分割线进行分割,分割线可用实线、虚线等,具体参考css中border属性支持的样式"
                      >
                        <i class="property-tip icon-question" />
                      </el-tooltip>
                      <span>分割线</span>
                    </template>
                   <el-select v-model="field.options.dividerLine" placeholder="">
                    <el-option label="无" value="none">
                      <div>无</div>
                    </el-option>
                     <el-option value="dashed" label="----------------">
                     <div style="height:5px;border-top:1px dashed black;margin-top:5px;">
                     </div>
                     </el-option>
                     <el-option value="solid" label="——————————————————">
                     <div style="height:5px;border-top:1px solid black;margin-top:5px;">
                     </div>
                     </el-option>
                   </el-select>
                  </ht-form-item>
                  <ht-form-item  label-width="120px">
                    <template slot="label">
                      <el-tooltip
                        content="意见超过指定条数显示'查看更多',并通过对话框显示"
                      >
                        <i class="property-tip icon-question" />
                      </el-tooltip>
                      <span>默认显示条数</span>
                    </template>
                  <el-input-number v-model="field.options.defaultNumber" size="small" :min="0"></el-input-number>
                  </ht-form-item>
                  <ht-form-item  label-width="120px">
                    <template slot="label">
                      <el-tooltip
                        content="底部意见人、部分、日期和时间如何显示：靠左，居中或者靠右？"
                      >
                        <i class="property-tip icon-question" />
                      </el-tooltip>
                      <span>底部信息位置</span>
                    </template>
                   <el-radio-group v-model="field.options.userInfoAlign">
                     <el-radio label="left">靠左</el-radio>
                     <el-radio label="center">居中</el-radio>
                     <el-radio label="right">靠右</el-radio>
                   </el-radio-group>
                  </ht-form-item>
                  <!-- 自定义js脚本 -->
                   <ht-form-item class="table-switch" label-width="120px">
                    <template slot="label">
                      <el-tooltip
                        content="通过自定义的js脚本，可实现对意见html的处理"
                      >
                        <i class="property-tip icon-question" />
                      </el-tooltip>
                      <span>自定义JS脚本</span>
                    </template>
                    <el-switch v-model="field.options.useTextJs"
                    inactive-text="关闭"
                    :inactive-value="false"
                    active-text="启用"
                    :active-value="true"
                    ></el-switch>
                  </ht-form-item>
                   <ht-form-item class="table-switch" label-width="120px" v-if="field.options.useTextJs">
                    <el-button size="mini" @click="opinionJsClick">+设置自定义js脚本</el-button>
                  </ht-form-item>
                  <!-- todo:弹窗支持 -->
                  <el-dialog title="自定义js脚本设置"
                  :visible.sync="jsDialogVisible"
                  :append-to-body="true"
                  ></el-dialog>
                </template>
                <!-- 对应某些控件是基础属性 但又不是所有控件的基础属性放入BasicsProperty组件中 -->
                <BasicsProperty
                  :data="field"
                  :main-bo-fields="tableFields"
                  :all-bo-data="allBoData"
                  :bo-def-data="boDefData"
                  :formVarData="formVarData"
                  :returnData="returnData"
                  :formType="formData.formType"
                  :linkageNoAttrFieldList="noAttrFieldList"
                />
              </template>
            </el-collapse-item>
            <el-collapse-item
              title="高级属性"
              name="advanced"
              v-if="!field.noAdvanced"
            >
              <advanced-property
                :data.sync="field"
                :main-bo-fields="tableFields"
                :all-bo-data="allBoData"
                :boDefData="boDefData"
                :fieldIndexData="fieldIndexData"
              />
            </el-collapse-item>
          </el-collapse>
          <template v-else-if="field && field.isLayout">
            <layout-property
              :data.sync="field"
              :sub-tables="subTables"
              :sun-tables="sunTables"
              :tablefields="tableFields"
              :bo-def-data="boDefData"
              :formType="formData.formType"
            />
          </template>
          <div v-else class="field-empty">选择一个字段进行属性设置</div>
        </el-scrollbar>
      </el-tab-pane>
      <el-tab-pane
        label="表单属性"
        name="form"
        style="padding: 0 10px 10px"
        data-vv-scope="editBpmForm"
      >
        <el-scrollbar class="scrollbar-fullheight">
          <el-collapse v-model="formCollapseActiveNames">
            <el-collapse-item title="基础属性" name="formBasic">
              <el-form
                :model="formData"
                data-vv-scope="editBpmForm"
                class="form__property-content"
              >
                <ht-form-item label="表单分类" label-width="80px">
                  <EipSysTypeSelector
                    placeholder="请选择表单分类"
                    cat-id="7"
                    v-model="formData.typeName"
                    :sys-type-id.sync="formData.typeId"
                    :validate="{required: true}"
                  />
                </ht-form-item>
                <ht-form-item label="表单名称" label-width="80px">
                  <ht-input
                    v-model="formData.name"
                    autocomplete="off"
                    :validate="{required: true}"
                    placeholder="请输入名称"
                    :maxlength="50"
                    :showWordLimit="true"
                  ></ht-input>
                </ht-form-item>
                <div style="display: flex">
                  <ht-form-item label="表单别名" label-width="80px">
                    <ht-input
                      v-model="formData.formKey"
                      v-pinyin="formData.name"
                      :disabled="formData.id ? true : false"
                      autocomplete="off"
                      :validate="{
                        required: true,
                        isExist: '${form}/form/form/v1/checkKey?key=',
                        regex: {
                          exp: '^[a-zA-Z][a-zA-Z0-9_]*$',
                          message: '只能输入字母、数字、下划线，且以字母开头',
                        },
                      }"
                      :maxlength="50"
                      :showWordLimit="true"
                      placeholder="请输入别名"
                    ></ht-input>
                  </ht-form-item>
                  <el-tooltip
                    class="item"
                    effect="dark"
                    content="别名只能填写英文、数字、下划线"
                    placement="right-start"
                  >
                    <span
                      class="el-icon-question"
                      style="margin-left: -5px; margin-top: 10px"
                    ></span>
                  </el-tooltip>
                </div>
                <ht-form-item label="表单描述" label-width="80px">
                  <ht-input
                    type="textarea"
                    v-model="formData.desc"
                    :maxlength="200"
                    :showWordLimit="true"
                    placeholder="请输入描述"
                  />
                </ht-form-item>
              </el-form>
            </el-collapse-item>
            <el-collapse-item title="表单配置" name="formConfig">
              <el-form
                :model="formData"
                data-vv-scope="editBpmForm"
                class="form__property-content"
              >
                <ht-form-item label="样式配置" label-width="80px">
                  <el-button
                    @click="formSettingClick"
                    type="primary"
                    plain
                    class="style__config-btn"
                    >设计样式</el-button
                  >
                </ht-form-item>
              </el-form>
            </el-collapse-item>
            <!-- ccwgq 2022-10-18 加入表单任务权限 -->
            <el-collapse-item name="formTaskAuth" title="表单任务权限脚本">
             <el-form
                :model="formData"
                data-vv-scope="editBpmForm"
                class="form__property-content"
              >
                <ht-form-item label="脚本配置" label-width="80px">
                  <el-button
                    @click="formTaskAuthClick"
                    type="primary"
                    plain
                    class="style__config-btn"
                    >编辑脚本</el-button
                  >
                </ht-form-item>
              </el-form>
            </el-collapse-item>
          </el-collapse>
        </el-scrollbar>
      </el-tab-pane>
    </el-tabs>
    <el-dialog
      title="表单配置"
      :visible.sync="formSettingVisible"
      append-to-body
      class="urgent-text"
      :close-on-click-modal="false"
      width="60%"
    >
      <table class="form-table" cellspacing="0" cellpadding="0" border="0">
        <tbody>
          <tr>
            <th style="min-width: 130px">字体颜色:</th>
            <td>
              <el-color-picker
                v-model="formSetting.fontColor"
                size="mini"
              ></el-color-picker>
            </td>
          </tr>
          <tr>
            <th style="min-width: 130px">是否隐藏冒号:</th>
            <td>
              <el-checkbox v-model="formSetting.customColon">是</el-checkbox>
            </td>
          </tr>
          <tr>
            <th style="min-width: 130px">标题位置:</th>
            <td>
              <ht-select
                v-model="formSetting.align"
                :options="[
                  {key: 'right', value: '居右'},
                  {key: 'center', value: '居中'},
                  {key: 'left', value: '居左'},
                  {key: 'justify', value: '两端对齐'},
                ]"
              />
            </td>
          </tr>
        </tbody>
      </table>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="formSettingOk">确 定</el-button>
        <el-button type="danger" @click="formSettingReset">重 置</el-button>
        <el-button @click="formSettingVisible = false">取 消</el-button>
      </div>
    </el-dialog>
    <el-dialog
      title="引入脚本"
      :visible.sync="dialogincluddingFileVisible"
      append-to-body
      class="urgent-text"
      :close-on-click-modal="false"
      width="1024"
    >
      <el-row style="height: 100%">
        <el-col :span="12" style="padding: 5px; height: 100%">
          <codemirror
            ref="mycode"
            v-model="formHtml"
            :options="cmOptions"
            class="mycode"
            style="width: 99%; height: 100%"
          ></codemirror>
        </el-col>
        <el-col :span="12" style="padding: 5px">
          <ht-form-item label="自定义JS脚本" label-width>
            <el-dropdown @command="variablesClick" size="mini">
              <el-button type="primary">
                常用变量
                <i class="el-icon-arrow-down el-icon--right"></i>
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item :command="{value: 'currentUser.account'}"
                  >当前用户账号</el-dropdown-item
                >
                <el-dropdown-item :command="{value: 'currentUser.username'}"
                  >当前用户名称</el-dropdown-item
                >
              </el-dropdown-menu>
            </el-dropdown>
          </ht-form-item>
          <span style="color: red"
            >编辑的脚本内容会直接填充到【script】里面；如需使用到表单BO数据例：data.实体表名.实体表字段</span
          >
          <codemirror
            ref="mycode2"
            v-model="includeFiles.diyJs"
            :options="cmOptions2"
            class="code"
            style="width: 99%; height: 100%"
          ></codemirror>
        </el-col>
      </el-row>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="includeFilesOk">确 定</el-button>
        <el-button
          @click="
            dialogincluddingFileVisible = false
            includeFiles.diyJs = ''
          "
          >取 消</el-button
        >
      </div>
    </el-dialog>
    <form-task-auth-dialog :visible.sync="formTaskAuthVisible" :formId="formData.id" :authData="formData.formTaskAuth"></form-task-auth-dialog>
    <ht-load-data
      :url.sync="formHtmlUrl"
      context="form"
      @after-load-data="afterformHtml"
    ></ht-load-data>
    <i18n-message-edit
      ref="i18nMessageEdit"
      :messageKey="i18nMessageKey"
      @after-save="afterSaveI18n"
    />
  </el-form>
</template>

<script>
import form from '@/api/form.js'
import {Base64} from 'js-base64'
import deepmerge from 'deepmerge'
import {
  advanceComponents,
  basicComponents,
  layoutComponents,
} from '@/api/controlsConfig.js'
import LayoutProperty from '@/components/form/LayoutProperty.vue'
import AdvancedProperty from '@/components/form/AdvancedProperty.vue'
import BasicsProperty from '@/components/form/BasicsProperty.vue'
import htEditor from '@/components/common/HtEditor.vue'
import i18nMessageEdit from '@/components/system/I18nMessageEdit.vue'
import WidgetFormBus from '@/components/form/bus/WidgetFormBus.js'
import FormTaskAuthDialog from '@/components/form/FormTaskAuthDialog'
import utils from '@/hotent-ui-util.js'

const EipSysTypeSelector = () =>
  import('@/components/selector/EipSysTypeSelector.vue')
export default {
  name: 'property-panel',
  props: [
    'data',
    'boDefData',
    'formData',
    'mainBoFields',
    'subTables',
    'sunTablesMap',
  ],
  components: {
    LayoutProperty,
    AdvancedProperty,
    BasicsProperty,
    htEditor,
    i18nMessageEdit,
    EipSysTypeSelector,
    FormTaskAuthDialog,
  },
  data() {
    return {
      formCollapseActiveNames: 'formBasic',
      basicComponents,
      layoutComponents,
      advanceComponents,
      copyAdvanceComponents: '',
      activeTabName: 'field',
      avtiveCollapseName: 'basic',
      field: this.data,
      formObj: this.formData,
      dialogincluddingFileVisible: false, //引入脚本dialog
      formSettingVisible: false, //表单配置dialog
      formSetting: {
        align: 'right',
        customColon: false,
        fontColor: 'rgb(150, 151, 153)',
      },
      formTaskAuth:[],//ccwgq 2022-10-18 表单任务权限脚本
      formTaskAuthVisible:false,//ccwgq 2022-10-18 表单任务权限对话框
      formHtmlUrl: '', //获取表单HTML url
      formHtml: '', //表单html数据
      formExpand: '', //表单json数据
      isWatch: false,
      includeFiles: {diyFile: '', diyCss: '', diyJs: ''}, //引入脚本和样式对象
      tableFields: [],
      filterListType: ['number', 'currency', 'date', 'amap'],
      clobFieldList: [
        'textarea',
        'dialog',
        'imageViewer',
        'related-process',
        'signature',
        'button',
        'immediate-single',
        'immediate-textarea',
        'milepost',
        'eip-cascader',
        'dataView',
        'text',
        'QRcode',
        'iframe',
        'image',
        'attachment',
        'ou-attachment',
        'ou-opinion',
        'business-dialog'
      ], //大文本类型字段允许绑定的控件,ccwgq 2022-07-05 附件控件 2022-10-10 流程意见,20220-10-20 业务条线对话框
      allBoData: [],
      formVarData: [],
      returnData: [],
      cmOptions: {
        value: '',
        mode: 'vue',
        readOnly: false,
        smartIndent: true,
        tabSize: 2,
        theme: 'base16-light',
        lineNumbers: true,
        line: true,
      },
      cmOptions2: {
        value: '',
        mode: 'javascript',
        readOnly: false,
        smartIndent: true,
        tabSize: 2,
        theme: 'base16-light',
        lineNumbers: true,
        line: true,
      },
      i18nMessageKey: '',
      createKeyMap: {
        text: true,
        image: true,
        'immediate-single': true,
        'immediate-textarea': true,
      },
      sunTables: [],
      currentBoSubEntity: '',
      fieldIndexData: {},
      noAttrFieldList: [],
      jsDialogVisible:false
    }
  },
  created() {
    const me_ = this
    //表单初始化时收集无属性控件字段
    WidgetFormBus.$on('initNoAttrField', (obj) => {
      if (this.isNoAttrField(obj) && obj.tableName) {
        me_.noAttrFieldListChange(obj, true)
      }
    })
  },
  methods: {
    //ccwgq 2022-10-18
    formTaskAuthClick(){
      this.formTaskAuthVisible=true;
    },
    //重置表单配置信息
    formSettingReset() {
      this.formSetting = {
        align: 'right',
        customColon: false,
        fontColor: 'rgb(150, 151, 153)',
      }
      this.formData.formSetting = ''
    },
    //打开表单配置弹框
    formSettingClick() {
      if (this.formData.formSetting) {
        this.formSetting = JSON.parse(this.formData.formSetting)
      }
      this.formSettingVisible = true
    },
    //保存表单配置信息
    formSettingOk() {
      this.formData.formSetting = JSON.stringify(this.formSetting)
      this.formSettingVisible = false
    },
    saveValidate() {
      const this_ = this
      utils
        .validateForm(this, 'editBpmForm')
        .then(() => {
          //手机表单保存时 表单类型指定为手机表单类型
          if (this_.formData.formType && this_.formData.formType != 'mobile') {
            this_.formData.formType = 'pc'
          }
          // this.formData.name = this.formData.formName;
          this_.$emit('saveEnd')
        })
        .catch((reason) => {
          let rules = reason.map((obj) => {
            return obj.rule
          })
          if (
            this_.formData &&
            this_.formData.typeName &&
            this_.formData.name &&
            this_.formData.formKey
          ) {
            if (rules.includes('isExist')) {
              this.$message.error('表单别名重复')
            } else if (rules.includes('regex')) {
              this.$message.error('只能输入字母、数字、下划线，且以字母开头')
            }
          } else {
            //获取到报错后的规则数组
            if (rules.includes('required')) {
              this.$message.error('请完整填写表单内容')
            } else if (rules.includes('isExist')) {
              this.$message.error('表单别名重复')
            }
          }
          this.activeTabName = 'form'
        })
    },
    filterFields(obj) {
      if (
        (obj.columnType == 'clob' || obj.dataType == 'clob') &&
        this.clobFieldList.indexOf(this.field.ctrlType) == -1
      ) {
        return false
      }
      if (this.filterListType.indexOf(this.field.ctrlType) > -1) {
        if (
          this.field.ctrlType == 'date' &&
          this.field.options.dataType != 'date'
        ) {
          this.field.options.dataType = 'date'
        }
        return obj.dataType == this.field.options.dataType
      } else if (obj.nodeType == 'sub') {
        return false
      } else {
        return true
      }
    },
    //高级控件
    filterAdvanceFields(obj) {
      //子/孙表不能选择的控件类型 返回false 不能选择
      let types = ['dataView', 'QRcode', 'milepost']
      if (this.field.boSubEntity && types.includes(obj.ctrlType)) {
        return false
      }
      return true
    },
    //常用控件
    filterFieldsByCurrentField(obj) {
      //子/孙表不能选择的控件类型 返回false 不能选择
      let types = ['related-process', 'amap']
      if (this.field.boSubEntity && types.includes(obj.ctrlType)) {
        return false
      }
      if (!obj.options.dataType) {
        return true
      }
      if (!this.field.options) {
        return true
      }
      if (!this.field.options.dataType) {
        return true
      }
      if (this.field.options.dataType == obj.options.dataType) {
        return true
      }
      let dataTypes = obj.options.dataType.split('|')
      if (dataTypes.indexOf('string') != -1) {
        dataTypes.push('varchar')
        dataTypes.push('nvarchar')
      }
      // 数字控件不能绑定日期控件
      if (this.field.options.dataType == 'number') {
        return obj.options.dataType != 'date'
      }
      // 日期控件不能绑定数字控件
      if (this.field.options.dataType == 'date') {
        return obj.options.dataType != 'number'
      }
      // 大文本类型默认多行文本,但是可以支持附件、单选、和下拉和关联链接
      if (this.field.options.dataType == 'clob') {
        if(['textarea','attachment','input','select'].includes(obj.ctrlType)){
          return true
        }
        // if (obj.ctrlType == 'textarea' || obj.ctrlType == 'attachment' || obj.ctrlType=='input') {
        //   return true
        // }
      }
      // 字符串类型可以选择所有字段
      let charArr = ['string', 'varchar', 'nvarchar']
      // 需要兼容以前的代码  this.field.options.dataType == ""
      let result = this.field.options.dataType.split('|').filter((item) => {
        return dataTypes.indexOf(item) != -1 || charArr.indexOf(item) != -1
      })

      if (result && result.length >= 1) {
        return true
      }
      return false
    },
    /**
     * 新旧属性的替换,并保留原有的双向绑定,
     * 具体逻辑为:
     * 1.新属性有值的,旧属性没有的,新增
     * 2.新属性没有的,旧属性有的,删除
     * 3.新属性有的,旧属性也有,,则保留旧属性(desc等一些特殊key 需要特殊逻辑处理)
     */
    attributeToReplace(oldV, newV) {
      for (let key in oldV) {
        //2.新属性没有的,旧属性有的,删除
        if (
          key != 'key' &&
          newV[key] === undefined &&
          (oldV[key] || oldV[key] === '')
        ) {
          delete oldV[key]
        }
      }
      for (let key in newV) {
        let value = newV[key]
        //1.新属性有值的,旧属性没有的,新增
        if (oldV[key] === undefined || oldV[key] === '') {
          this.$set(oldV, key, value)
          //3.新属性有的,旧属性也有,,则保留旧属性(options等一些特殊key 需要特殊逻辑处理)
        } else {
          if (key === 'options') {
            // 保留绑定的dataType
            let boDataType = oldV[key].dataType
            oldV[key] = value
            if (boDataType) {
              oldV[key].dataType = boDataType
            }
          }
        }
      }
      //旧属性有值 和新属性的值不一样 要重置
      for (let keys in oldV) {
        if (!(oldV[keys] instanceof Object)) {
          if (oldV[keys] != newV[keys] && newV[keys] != undefined) {
            oldV[keys] = newV[keys]
          }
        }
      }
    },
    attachmentAddDefineColumn(options) {
      var columns = options.defineColumns
      if (typeof columns === 'object' && columns instanceof Array) {
        columns.push({label: '', fieldPath: ''})
      } else {
        columns = new Array()
        columns.push({label: '', fieldPath: ''})
        this.$set(options, 'defineColumns', columns)
      }
      // options.defineColumns=columns;
    },
    //切换控件类型对应改变属性
    changeCtrlType(isClean) {
      const me_ = this
      const selectObj = deepmerge({}, me_.field, {clone: true})
      basicComponents.forEach((item) => {
        if (me_.field.ctrlType == item.ctrlType) {
          // me_.field = deepmerge({}, item, { clone: true });
          let i = deepmerge({}, item, {clone: true})
          i.parentNodeType = me_.data.parentNodeType
          i.boSubEntity = me_.data.boSubEntity
          me_.attributeToReplace(me_.field, i)

          me_.field.key = me_.data.key
          if (!isClean) {
            me_.field.boDefId = selectObj.boDefId
            me_.field.target = selectObj.target
            me_.field.boAttrId = selectObj.boAttrId
            me_.field.fieldPath = selectObj.fieldPath
            me_.field.name = selectObj.name
            me_.field.desc = selectObj.desc
            me_.field.title = selectObj.desc
            me_.field.entId = selectObj.entId
            me_.field.boDefAlias = selectObj.boDefAlias
            me_.field.tableName = selectObj.tableName
            me_.field.columnType = selectObj.columnType
            me_.field.options.format = selectObj.options.format
            me_.field.options.inputFormat = selectObj.options.format
            me_.field.options.decimalDigits = selectObj.decimalLen
            me_.field.options.maxDecimalDigits = selectObj.decimalLen
          }
          //me_.$emit("data:update",  me_.field);
          //WidgetFormBus.$emit("changeCtrlType", me_.field);
        }
      })
      advanceComponents.forEach((item) => {
        if (me_.field.ctrlType == item.ctrlType) {
          // me_.field = deepmerge({}, item, { clone: true });
          let e = deepmerge({}, item, {clone: true})
          e.parentNodeType = me_.data.parentNodeType
          e.boSubEntity = me_.data.boSubEntity
          me_.attributeToReplace(me_.field, e)
          me_.field.key = me_.data.key
          if (!isClean) {
            me_.field.boDefId = selectObj.boDefId
            me_.field.target = selectObj.target
            me_.field.boAttrId = selectObj.boAttrId
            me_.field.fieldPath = selectObj.fieldPath
            me_.field.name = selectObj.name
            me_.field.desc = selectObj.desc
            me_.field.title = selectObj.desc
            me_.field.entId = selectObj.entId
            me_.field.boDefAlias = selectObj.boDefAlias
            me_.field.tableName = selectObj.tableName
            me_.field.columnType = selectObj.columnType
            me_.field.options.format = selectObj.format
            me_.field.options.inputFormat = selectObj.format
            me_.field.options.decimalDigits = selectObj.decimalLen
            me_.field.options.maxDecimalDigits = selectObj.decimalLen
          }
          // WidgetFormBus.$emit("changeCtrlType", me_.field);
        }
      })
      layoutComponents.forEach((item) => {})
      me_.$nextTick(() => {
        me_.$emit('update:data', me_.field)
      })
    },
    //引入脚本和样式对象保存
    includeFilesOk() {
      if (!this.formHtml) {
        this.$message.warning('模板HTML不能为空！')
        return
      }
      this.dialogincluddingFileVisible = false
      form
        .saveFormJs({
          formId: this.formData.id,
          diyJs: this.includeFiles.diyJs,
          formHtml: Base64.encode(this.formHtml, 'utf-8'),
          formExpand: Base64.encode(this.formExpand, 'utf-8'),
        })
        .then((resp) => {
          if (resp.state) {
            this.$message.success(resp.message)
          }
        })
    },
    variablesClick(data) {
      this.includeFiles.diyJs += data.value
    },
    afterformHtml(data) {
      this.formExpand = data.bpmForm.formExpand
      this.formHtml = data.bpmForm.formHtml
      this.includeFiles.diyJs = data.bpmForm.diyJs
    },
    includdingFile() {
      this.dialogincluddingFileVisible = true
      this.formHtmlUrl =
        '/form/form/v1/previewDesignVue?formId=' + this.formData.id
      this.includeFiles = this.formData.includeFiles
        ? Base64.decode(this.formData.includeFiles, 'utf-8')
        : {diyFile: ' ', diyCss: ' ', diyJs: ' '}
    },

    /* TODO w */
    diyBind(type) {
      if(type != 'diyModel')this.field.modelName = null;
      return type == 'model';
    },
    handleClick(tab, event) {
      console.info(tab)
    },
    // 改变地图地址绑定的字段 设置fieldPath
    changeMap(value) {
      let selectObj = null
      this.tableFields.forEach((boData) => {
        if (!selectObj) {
          selectObj = boData.children.find((opt) => opt.name === value)
          if (selectObj) {
            selectObj.boDefAlias =
              boData.boDefAlias || boData.fieldPath.split('.')[0]
            selectObj.tableName = boData.name
          }
        }
      })
      this.field.options.addressMap = selectObj.path + '.' + selectObj.name
    },
    // 改变绑定的字段 设置fieldPath
    change(value) {
      let selectObj = null
      this.fieldIndexData = {}
      this.tableFields.forEach((boData) => {
        boData.children.forEach((v, i) => {
          let keyName = v.name
          if (value.indexOf('.') != -1) {
            keyName = v.path + '.' + v.name
          }
          if (v.isRequired && keyName == value) {
            if (!this.fieldIndexData.fieldName) {
              this.fieldIndexData.fieldName = v.fieldName
              this.fieldIndexData.index = i
            }
          }
        })
        if (!selectObj) {
          selectObj = boData.children.find((opt) => opt.name === value)
          if (value.indexOf('.') != -1) {
            selectObj = boData.children.find(
              (opt) => opt.path + '.' + opt.name === value
            )
          }

          if (selectObj) {
            selectObj.boDefAlias =
              boData.boDefAlias || boData.path.split('.')[0]
            selectObj.tableName = boData.name
          }
        }
      })

      if (!selectObj) {
        if (this.field.parentNodeType == 'sub') {
          this.field.fieldPath = 'item.' + value
          this.field.name = 'item.' + value
        } else {
          this.$message.warning('只允许子表绑定虚拟字段')
        }
        return
      }

      this.field.boDefId = selectObj.boDefId
      this.field.boAttrId = selectObj.id
      if (this.field.parentNodeType == 'sub') {
        this.field.fieldPath = 'item.' + selectObj.name
      } else {
        this.field.fieldPath = selectObj.path + '.' + selectObj.name
      }

      this.field.options.dataType = selectObj.dataType

      this.field.name = selectObj.name
      this.field.desc = selectObj.desc
      this.field.title = selectObj.desc
      this.field.entId = selectObj.entId
      this.field.boDefAlias = selectObj.boDefAlias
      this.field.tableName = selectObj.tableName
      this.field.columnType = selectObj.columnType
      if (selectObj.dataType == 'date') {
        this.field.options.format = selectObj.format
        this.field.options.inputFormat = selectObj.format
      } else if (selectObj.dataType == 'number') {
        this.field.options.maxDecimalDigits = selectObj.decimalLen
        this.field.options.decimalDigits = selectObj.decimalLen
      }
    },
    //  ccwgq 2022-05-22 流程附件 节点名绑定字段
    changeAttachmentNodeField(value) {
      // debugger
    },
    //给无属性控件设置关联ent属性
    changeNoAttrFile(value) {
      let _this = this
      this.tableFields.forEach((ent) => {
        if (ent.name == value) {
          _this.$set(_this.field, 'entId', ent.id)
          _this.$set(_this.field, 'boDefId', ent.boDefId)
        }
      })
    },
    isChangeWatch() {
      this.isWatch = true
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
    isNoAttrField(field) {
      if (!field) {
        field = this.field
      }
      if (
        field.ctrlType == 'text' ||
        field.ctrlType == 'immediate-single' ||
        field.ctrlType == 'immediate-textarea' ||
        (field.ctrlType == 'button' && !field.options.bindEventjson.isShowInput)
      ) {
        return true
      }
      return false
    },
    noAttrFieldListChange(field, isAdd) {
      //无属性控件的变化实时其更新联动列表
      let inList = false
      this.noAttrFieldList.forEach((item) => {
        if (item.key === field.key) {
          if (isAdd) {
            inList = true
          } else {
            this.noAttrFieldList.remove(item)
            return
          }
        }
      })
      if (isAdd && !inList) {
        if (field.ctrlType == 'button') {
          field.desc = field.options.bindEventjson.name
        }
        this.noAttrFieldList.push(field)
      }
    },
    //ccwgq 2022-10-10
    opinionJsClick(){
      this.jsDialogVisible=true
    }
  },
  watch: {
    data(val) {
      this.field = val
    },
    field: {
      handler(val) {
        // 下拉框 多选isMultiple 属性废弃 使用options.multiple属性 为了兼容以前的代码 将isMultiple true 值赋值给 options.multiple属性
        if (val.ctrlType == 'select' && val.isMultiple) {
          val.options.multiple = true
          val.isMultiple = false
        }

        if (val.parentNodeType == 'sub' || val.parentNodeType == 'sun') {
          if (val.boSubEntity) {
            this.currentBoSubEntity = val.boSubEntity
            this.tableFields = this.subTables.filter(
              (item) => item.name === val.boSubEntity
            )
            if (this.tableFields.length > 0) {
              for (let e = 0; e < this.tableFields.length; e++) {
                if (this.tableFields[e].children.length > 0) {
                  for (
                    let w = 0;
                    w < this.tableFields[e].children.length;
                    w++
                  ) {
                    this.tableFields[e].children[w].keyName =
                      this.tableFields[e].children[w].name
                  }
                }
              }
            }
          }

          //如果是孙表，则选取子表里的孙表供选择绑定
          if (
            (val.ctrlType == 'suntable' || val.ctrlType == 'sunDiv') &&
            this.currentBoSubEntity
          ) {
            this.sunTables = this.sunTablesMap[this.currentBoSubEntity] || []
          }
          //如果是孙表里的控件，则找到这个一个孙表供其选择属性
          if (val.parentNodeType == 'sun') {
            for (const subName in this.sunTablesMap) {
              let sunTabs = this.sunTablesMap[subName]
              if (sunTabs) {
                sunTabs.forEach((sunTab) => {
                  if (sunTab.name == this.currentBoSubEntity) {
                    this.tableFields = [sunTab]
                  }
                })
                if (this.tableFields.length > 0) {
                  for (let o = 0; o < this.tableFields.length; o++) {
                    if (this.tableFields[o].children.length > 0) {
                      for (
                        let h = 0;
                        h < this.tableFields[o].children.length;
                        h++
                      ) {
                        this.tableFields[o].children[h].keyName =
                          this.tableFields[o].children[h].name
                      }
                    }
                  }
                }
              }
            }
          }
        } else {
          if (this.mainBoFields.length > 0) {
            for (let y = 0; y < this.mainBoFields.length; y++) {
              if (this.mainBoFields[y].children.length > 0) {
                for (let t = 0; t < this.mainBoFields[y].children.length; t++) {
                  this.mainBoFields[y].children[t].keyName =
                    this.mainBoFields[y].children[t].path +
                    '.' +
                    this.mainBoFields[y].children[t].name
                }
              }
            }
          }
          if (val && val.ctrlType == 'time') {
            this.tableFields = JSON.parse(JSON.stringify(this.mainBoFields))
            this.tableFields.forEach((table) => {
              if (table.children) {
                let newFileds = []
                table.children = table.children.filter(
                  (f) => f.dataType != 'date' && f.dataType != 'number'
                )
              }
            })
          } else {
            this.mainBoFields.forEach((item) => {
              for (let q = 0; q < item.children.length; q++) {
                for (let i = 0; i < item.children.length - 1 - q; i++) {
                  if (item.children[i].index > item.children[i + 1].index) {
                    let temp = item.children[i]
                    item.children[i] = item.children[i + 1]
                    item.children[i + 1] = temp
                  }
                }
              }
            })
            this.tableFields = this.mainBoFields
          }
        }
        //合并数组对象
        let allBoData = []
        let formVarData = []
        let returnData = [] //对话框返回值选择的字段信息 主表对应主表，子表对应子表，孙表对应孙表。
        let returnTypes = ['select', 'dropdown', 'dialog']
        if (
          ((val.ctrlType == 'suntable' || val.ctrlType == 'sunDiv') &&
            this.currentBoSubEntity) ||
          val.parentNodeType == 'sun'
        ) {
          this.mainBoFields.forEach((mainBoField) => {
            formVarData.push({...mainBoField})
            allBoData.push({...mainBoField})
          })
          if (this.sunTables && this.sunTables.length > 0) {
            this.sunTables.forEach((sunTable) => {
              if (val.parentNodeType == 'sun') {
                if (sunTable.name == val.boSubEntity) {
                  allBoData.push({...sunTable})
                  formVarData.push({...sunTable})
                  returnData.push({...sunTable})
                }
              } else {
                allBoData.push({...sunTable})
                formVarData.push({...sunTable})
                returnData.push({...sunTable})
              }
            })
          }
        } else {
          if (
            val.parentNodeType != 'sub' &&
            returnTypes.includes(val.ctrlType)
          ) {
            //添加主表字段
            this.mainBoFields.forEach((mainBoField) => {
              returnData.push({...mainBoField})
            })
          } else if (
            val.parentNodeType == 'sub' &&
            returnTypes.includes(val.ctrlType)
          ) {
            //添加子表字段
            this.subTables.forEach((subTable) => {
              returnData.push({...subTable})
            })
          }
          //添加主表字段
          this.mainBoFields.forEach((mainBoField) => {
            allBoData.push({...mainBoField})
          })
          this.subTables.forEach((subTable) => {
            allBoData.push({...subTable})
            let sunTabs = this.sunTablesMap[subTable.name]
            if (sunTabs) {
              sunTabs.forEach((sunTab) => {
                allBoData.push({...sunTab})
              })
            }
          })
          formVarData = allBoData
        }
        //判断无属性控件 按钮
        if (
          this.isNoAttrField() &&
          this.tableFields &&
          this.tableFields.length > 0
        ) {
          if (!val.name) {
            this.$set(val, 'name', 'c_' + val.key)
          }
          if (!val.boDefAlias) {
            this.$set(val, 'boDefAlias', this.tableFields[0].boDefAlias)
          }
          if (!val.tableName) {
            this.$set(val, 'tableName', this.tableFields[0].name)
            this.changeNoAttrFile(this.tableFields[0].name)
          }
          this.noAttrFieldListChange(val, true)
        } else if (
          val.ctrlType == 'button' &&
          val.options.bindEventjson.isShowInput
        ) {
          this.noAttrFieldListChange(val, false)
        }

        this.allBoData = allBoData
        this.formVarData = formVarData
        this.returnData = returnData
        //增加
        this.$emit('update:data', val)
        //通过模板生成的表单字段需更改为 建模别名.字段名 （解决2个不同的建模，但主表建模字段一样）
        if (
          val.target &&
          val.parentNodeType != 'sub' &&
          val.parentNodeType != 'sun'
        ) {
          val.target = val.boDefAlias + '.' + val.name
        }
      },
      deep: true,
    },
    'field.ctrlType': {
      handler(newVal, oldVal) {
        if (oldVal == undefined || newVal == undefined || newVal == oldVal) {
          return
        }
        if (!this.isWatch) {
          return
        }
        if (oldVal == 'number' || oldVal == 'currency') {
          if (newVal == 'date' || newVal == 'time') {
            this.changeCtrlType(true)
          } else {
            this.changeCtrlType(false)
          }
        } else if (oldVal == 'date' || oldVal == 'time') {
          if (newVal == 'number' || newVal == 'currency') {
            this.changeCtrlType(true)
          } else {
            this.changeCtrlType(false)
          }
        } else if (newVal == 'select') {
          this.changeCtrlType(false)
        } else {
          if (newVal == 'number' || newVal == 'currency') {
            if (this.field.columnType == 'number') {
              this.changeCtrlType(false)
            } else {
              this.changeCtrlType(true)
            }
          } else if (newVal == 'date' || newVal == 'time') {
            if (this.field.columnType == 'date') {
              this.changeCtrlType(false)
            } else {
              this.changeCtrlType(true)
            }
          } else {
            this.changeCtrlType(false)
          }
        }
        this.isWatch = false
      },
    },
  },
  mounted() {
    // 声明
    this.$validator = this.$root.$validator
    // 复制高级字段列表
    this.copyAdvanceComponents = this.advanceComponents.slice()
  },
  destroyed() {},
}
</script>
<style lang="scss" scoped>
@import '@/assets/css/element-variables.scss';
@import '@/assets/css/form-editor.scss';

.form {
  height: 100%;
  .field__tabs {
    height: 100%;
    min-width: 300px;
    /deep/ .el-tabs__nav-scroll {
      padding: 10px 0 0 10px;
    }
    /deep/ .el-tabs__content {
      height: calc(100% - 70px);
    }
    /deep/ .el-collapse-item__header {
      font-weight: bold;
      color: #999;
      padding-left: 10px;
    }
    /deep/ .el-tab-pane {
      height: 100%;
    }
    /deep/ .el-collapse-item__header:hover {
      color: $--color-primary;
    }
    /deep/ .el-collapse-item__content {
      padding: 0 10px 10px;
    }
  }

  /deep/ .el-form-item__content {
    margin-left: 0px !important;
  }
  /deep/ .el-dialog__body {
    padding: 5px !important;
    color: #606266;
    font-size: 14px;
    word-break: break-all;
  }
  /deep/ .el-dialog__footer {
    padding: 10px !important;
    text-align: right;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
  }
  .mycode /deep/ .CodeMirror {
    font-family: monospace;
    height: 400px !important;
    color: black;
    direction: ltr;
  }
  .scrollbar-fullheight {
    height: 100%;
  }
  .field-empty {
    text-align: center;
    width: 100%;
    margin-top: 150px;
    font-size: 16px;
    color: #ccc;
  }
  i.property-tip {
    color: #999;
    font-size: 14px;
    margin-right: 3px;
  }
  i.property-tip:hover {
    color: $--color-primary;
  }
  .el-aside {
    padding-top: 0px;
  }
  .el-main {
    padding-top: 0px;
    overflow: hidden;
  }
}
.style__config-btn {
  min-width: 215px;
  margin-left: 5px;
}
/deep/.form__property-content {
  /deep/.el-form-item__content {
    width: 215px;
    .el-textarea__inner {
      margin-left: 5px;
    }
  }
  /deep/.el-form-item--small.el-form-item {
    display: flex;
    flex-wrap: nowrap;
    .el-form-item__label {
      text-align: right;
    }
  }
}
.table-switch {
  /deep/ .el-switch__label {
    margin-top: -13px;
  }
}
</style>
