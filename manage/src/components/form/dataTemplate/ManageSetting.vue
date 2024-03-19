<template>
  <el-container>
    <el-form ref="form" label-width="80px" style="width: 100%">
      <el-button
        icon="el-icon-plus"
        size="small"
        type="primary"
        style="margin-bottom: 10px"
        @click="addManageBtns"
        >添加</el-button
      >
      <el-table
        ref="manageSettingTable"
        border
        class="dt-manage__table"
        :max-height="tabHeight"
        :data="manageFields"
        tooltip-effect="dark"
      >
        <el-table-column prop="name" label="类型" width="140">
          <template slot-scope="scope">
            <el-select
              @change="handleManageChange(scope.row)"
              v-model="scope.row.name"
            >
              <el-option
                v-for="btn in defaultBtnOptions"
                :key="btn.key"
                :label="btn.value"
                :value="btn.key"
                :disabled="btn.disabled"
              ></el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column prop="desc" label="名称" width="200">
          <template slot-scope="scope">
            <el-input
              style="width: 60%"
              v-model="scope.row.desc"
              placeholder="请输入按钮名称"
            ></el-input>
          </template>
        </el-table-column>
        <el-table-column
          prop="right"
          label="权限"
          :render-header="mrightRenderHeader"
          width="200"
        >
          <template slot-scope="scope">
            <span>{{ rightToDesc(scope.row.right) }}</span>
            <span style="float: right">
              <el-button
                size="small"
                @click="setFieldRightDialog(scope.row)"
                icon="el-icon-edit"
              ></el-button>
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="show" label="显示条件" width="200">
          <template scope="scope">
            <!-- <el-input
              style="width: 100%"
              v-model="scope.row.show"
              placeholder="请输入条件"
            ></el-input> -->
            <el-button
              size="small"
              @click="setShowJs(scope.row, scope.$index)"
              icon="el-icon-edit"
              >设置</el-button
            >
          </template>
        </el-table-column>
        <el-table-column label="排序" width="120">
          <template slot-scope="scope">
            <el-button
              @click="sort(scope.$index, 'down')"
              size="small"
              icon="el-icon-arrow-down"
              plain
            ></el-button>
            <el-button
              @click="sort(scope.$index, 'up')"
              size="small"
              icon="el-icon-arrow-up"
              plain
            ></el-button>
          </template>
        </el-table-column>
        <el-table-column label="管理">
          <template slot-scope="scope">
            <el-button
              :plain="scope.row.mpDisplay === btnType.notShow"
              class="mobile-btn"
              :class="{
                'is-active__btn': scope.row.mpDisplay === btnType.isShow,
              }"
              :disabled="isDisabled(scope.row)"
              v-show="
                scope.row.mpDisplay
                  ? (scope.row.mpDisplay = scope.row.mpDisplay)
                  : initMpDisplay(scope.row)
              "
              @click="btnChange(scope.row)"
              >移动端</el-button
            >
            <el-button
              v-if="
                scope.row.name === 'add' ||
                scope.row.name === 'edit' ||
                scope.row.name === 'detail'
              "
              @click="setAuth(scope.row)"
            >
              设置表单权限
            </el-button>
            <span style="margin-right: 13px">
              <el-button
                v-if="scope.row.name === 'url'"
                size="small"
                @click="setButtonValue('url', scope.row)"
                icon="el-icon-edit"
                >设置Url地址</el-button
              >
              <el-button
                v-if="scope.row.name === 'switch'"
                size="small"
                @click="setButtonValue('switch', scope.row)"
                icon="el-icon-edit"
                >设置开关值</el-button
              >
            </span>
            <el-button
              v-if="scope.row.name === 'js'"
              size="small"
              @click="setButtonJs(scope.row, scope.$index)"
              icon="el-icon-edit"
              >设置</el-button
            >
            <el-button
              v-if="scope.row.name === 'batchUpdate'"
              size="small"
              @click="setButtonUpdate(scope.row, scope.$index)"
              icon="el-icon-edit"
              >设置</el-button
            >
            <el-button
              v-if="scope.row.name === 'export'"
              size="small"
              @click="setExport(scope.row, scope.$index)"
              icon="el-icon-edit"
              >设置</el-button
            >
            <el-button
              @click="remove(scope.$index)"
              type="danger"
              size="small"
              icon="el-icon-delete"
              plain
            ></el-button>
            <el-button
              v-if="
                scope.row.name == 'js' ||
                scope.row.name == 'url' ||
                scope.row.name == 'switch' ||
                scope.row.name == 'batchUpdate'
              "
              @click="copy(scope.$index)"
              type="primary"
              size="small"
              icon="el-icon-document-copy"
              plain
            ></el-button>
            <ht-radio
              v-if="scope.row.name === 'url'"
              v-model="scope.row.type"
              :options="[
                {key: '1', value: '列表按钮'},
                {key: '2', value: '表头按钮'},
              ]"
            />
            <ht-radio
              v-if="
                scope.row.name === 'add' ||
                scope.row.name === 'edit' ||
                scope.row.name === 'detail'
              "
              v-model="scope.row.openType"
              :options="[
                {key: 'old', value: '当前页面打开'},
                {key: 'new', value: '新窗口打开'},
              ]"
            />
            <template v-if="scope.row.name === 'produceQRCode'">
              <el-tooltip
                content="免登陆模式下生成的二维码链接只有只读权限,登陆模式下需要用户登录,登陆后拥有编辑权限"
              >
                <i class="icon-question" style="margin-right: 8px" />
              </el-tooltip>
              <el-switch
                style="margin-right: 15px"
                v-model="scope.row.QRCodePattern"
                active-text="免登陆"
                inactive-text="登陆"
              ></el-switch>
            </template>
            <div
              v-if="scope.row.name == 'import'"
              @click="handleImportClick(scope)"
              style="padding-left: 10px; display: inline-block"
            >
              <span>导入行数限制</span>&nbsp;
              <el-input-number
                style="width: 120px; margin-right: 10px"
                size="small"
                controls-position="right"
                v-model="scope.row.limit"
                :min="1"
                :max="10000"
                :step="10"
              ></el-input-number>
              <span>校验Jar包</span>&nbsp;
              <el-tag
                style="height: 32px; line-height: 28px"
                v-if="scope.row.jarId"
                size="medium"
                closable
                :disable-transitions="false"
                @close="
                  scope.row.jarId = ''
                  scope.row.jarDesc = ''
                "
              >
                {{ scope.row.jarDesc }}
              </el-tag>
              <el-button
                size="small"
                icon="el-icon-search"
                @click="selectJar()"
              ></el-button>

              <el-tooltip
                class="item"
                effect="dark"
                content="下载默认模板"
                placement="top-end"
              >
                <el-button
                  size="small"
                  icon="el-icon-download"
                  @click="downloadTemplate()"
                ></el-button>
              </el-tooltip>
              <el-upload
                class="upload-demo"
                style="display: inline-block; margin-left: 10px"
                :action="actionUrl"
                :on-remove="handleRemove"
                :file-list="scope.row.importTemplate"
                :headers="header"
                :on-success="success"
                :before-upload="beforeUpload"
                ref="fileUp"
                :limit="2"
                accept=".xls"
              >
                <el-tooltip
                  class="item"
                  effect="dark"
                  content="上传自定义模板，第一行可自定义内容描述，第二行为表头(不可修改)，从第三行开始解析数据"
                  placement="top-end"
                >
                  <el-button size="small" icon="el-icon-upload"></el-button>
                </el-tooltip>
              </el-upload>
            </div>
            <el-select
              :key="refreshTime"
              :multiple="scope.row.name === 'produceQRCode'"
              style="margin-right: 15px"
              v-if="scope.row.name === 'produceQRCode'"
              v-model="scope.row.display"
              placeholder="请选择映射字段"
            >
              <el-option
                v-for="item in displayField"
                :key="item.name"
                :label="item.label"
                :value="JSON.stringify(item)"
              ></el-option>
            </el-select>
            <el-select
              :key="refreshTime"
              :multiple="false"
              style="margin-right: 15px"
              v-if="scope.row.name == 'switch'"
              v-model="scope.row.bind"
            >
              <el-option
                v-for="item in displayField"
                :key="item.name"
                :label="item.desc"
                :value="item.name"
              ></el-option>
            </el-select>
          </template>
        </el-table-column>
      </el-table>
    </el-form>
    <!-- 选择对话框  -->
    <eip-auth-dialog
      ref="eipAuthDialog"
      name="eipAuthDialog"
      @onConfirm="authDialogOnConfirm"
      append-to-body
    />
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="50%"
      appendToBody
      :close-on-click-modal="false"
      destory-on-close
      top="8vh"
    >
      <el-input
        v-model="url"
        placeholder="URL地址"
        v-if="dialogTitle === '设置Url地址'"
      ></el-input>
      <div v-if="dialogTitle === '设置开关值'" align="center" width="500px">
        <table width="80%">
          <tr>
            <td>开状态下值</td>
            <td>
              <el-input v-model="switchOn" placeholder="开时置值"></el-input>
            </td>
          </tr>
          <tr>
            <td>开状态下显示</td>
            <td>
              <el-input
                v-model="switchOnLabel"
                placeholder="开时显示值"
              ></el-input>
            </td>
          </tr>
          <tr>
            <td>关状态下值</td>
            <td>
              <el-input
                v-model="switchOff"
                placeholder="关时置值"
                style="padding-top: 20px"
              ></el-input>
            </td>
          </tr>
          <tr>
            <td>关状态下显示</td>
            <td>
              <el-input
                v-model="switchOffLabel"
                placeholder="关时显示值"
              ></el-input>
            </td>
          </tr>
          <tr>
            <td>默认状态</td>
            <td>
              <el-select
                v-model="switchDefaultTrue"
                placeholder="默认状态"
                style="padding-top: 20px"
                width="100%"
              >
                <el-option
                  v-for="item in switchOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </td>
          </tr>
        </table>
      </div>

      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogOnconfirm()">确 定</el-button>
        <el-button @click="dialogVisible = false" size="medium"
          >取 消</el-button
        >
      </span>
    </el-dialog>

    <!-- 选择校验jar包 -->
    <ImportJarSelector
      ref="importJarSelector"
      name="importJarSelector"
      @on-confirm="jarSelectorOnConfirm"
      append-to-body
    />

    <!-- 权限设置 -->
    <flow-form-auth ref="flowFormAuth" />
    <el-dialog
      title="设置需要执行的js"
      :visible="dialogMethodVisible"
      append-to-body
      class="urgent-text"
      :close-on-click-modal="false"
      :destroy-on-close="true"
      @close="dialogMethodVisible = false"
    >
      <div style="margin-top: 15px; margin-bottom: 25px">
        <code>
          <code>
            <span style="color: red; margin-left: 15px"
              >javascript脚本,在点将js按钮时触发，参数：_req用来请求后台的
              ,row当前列的数据,_this数据列表this对象</span
            >
            <br />
            <span style="color: red; margin-left: 15px">
              使用http请求后台接口地址的方法 this.$http.get(url).then(res => {
              })
            </span>
            <br />
            <span style="color: red; margin-left: 15px">
              使用http请求后台接口地址的方法 _req.get(url).then(res => { })
            </span>
          </code>
        </code>
      </div>
      <div>
        表单变量:
        <ht-select
          clearable
          placeholder="选择表单变量"
          v-model="diyScript"
          :options="displaySettingFields"
          :props="{key: 'name', value: 'desc'}"
          @change="diyScriptChange"
        >
        </ht-select>
      </div>
      <div style="width: 100%; height: 100%">
        <codemirror
          ref="scriptText"
          v-model="dialogRuleData"
          :options="cmOptions"
          style="width: 99%; height: 100%"
          name="jsCode"
        ></codemirror>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="methodOk()">确 定</el-button>
        <el-button @click="dialogMethodVisible = false">取 消</el-button>
      </div>
    </el-dialog>
    <el-dialog
      :close-on-click-modal="false"
      :destroy-on-close="true"
      :visible.sync="batchUpdateVisible"
      append-to-body
    >
      <el-form
        label-width="80px"
        style="width: 100%"
        v-form
        data-vv-scope="form"
      >
        <el-button
          icon="el-icon-plus"
          size="small"
          type="primary"
          style="margin-bottom: 10px"
          @click="addBatchUpdategData"
          >添加
        </el-button>
        <el-table
          border
          :max-height="tabHeight"
          :data="batchUpdateData"
          :show-header="false"
        >
          <el-table-column width="200">
            <template slot-scope="scope">
              <ht-select
                clearable
                placeholder="请选择"
                v-model="scope.row.name"
                :validate="{required: true}"
                :options="displaySettingFields"
                :props="{key: 'name', value: 'desc'}"
              >
              </ht-select>
            </template>
          </el-table-column>
          <el-table-column width="200">
            <template slot-scope="scope">
              <ht-select
                clearable
                placeholder="请选择"
                v-model="scope.row.valueType"
                :validate="{required: true}"
                :options="[
                  {key: 0, value: '固定值'},
                  {key: 1, value: '用户录入'},
                ]"
              >
              </ht-select>
            </template>
          </el-table-column>
          <el-table-column>
            <template slot-scope="scope">
              <template v-if="scope.row.valueType == 0">
                <ht-input
                  v-model="scope.row.defaultValue"
                  :validate="{required: true}"
                >
                </ht-input>
              </template>
              <template v-else-if="scope.row.valueType == 1">
                <ht-select
                  clearable
                  placeholder="请选择"
                  v-model="scope.row.outValueType"
                  :validate="{required: true}"
                  :options="outvalueTypeList"
                  @change="resetOutConfig(scope.row, scope.$index)"
                >
                </ht-select>
                <el-button
                  v-if="
                    scope.row.outValueType &&
                    scope.row.outValueType != 'input' &&
                    scope.row.outValueType != 'data' &&
                    scope.row.outValueType != 'number'
                  "
                  size="small"
                  icon="el-icon-edit"
                  @click="setOutValue(scope.row, scope.$index)"
                  >设置</el-button
                >
              </template>
            </template>
          </el-table-column>
          <el-table-column label="是否必填" width="110px">
            <template slot-scope="scope">
              <el-checkbox v-model="scope.row.isRequired">
                是否必填
              </el-checkbox>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80px">
            <template slot-scope="scope">
              <el-button
                @click="batchUpdateData.remove(scope.row)"
                type="danger"
                size="small"
                icon="el-icon-delete"
                plain
              ></el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="batchUpdateOk">确 定</el-button>
        <el-button @click="batchUpdateVisible = false">取 消</el-button>
      </div>
    </el-dialog>

    <el-dialog
      title="设置需要执行的js"
      :visible="dialogMethodVisible_show"
      append-to-body
      class="urgent-text"
      :close-on-click-modal="false"
      :destroy-on-close="true"
      @close="dialogMethodVisible_show = false"
    >
      <div style="margin-top: 15px; margin-bottom: 25px">
        <code>
          <code>
            <span style="color: red; margin-left: 15px"
              >javascript脚本,在点将js按钮时触发，参数：_req用来请求后台的
              ,row当前列的数据,_this数据列表this对象</span
            >
            <br />
            <span style="color: red; margin-left: 15px">
              使用http请求后台接口地址的方法 this.$http.get(url).then(res => {
              })
            </span>
            <br />
            <span style="color: red; margin-left: 15px">
              使用http请求后台接口地址的方法 _req.get(url).then(res => { })
            </span>
          </code>
        </code>
      </div>
      <div>
        表单变量:
        <ht-select
          clearable
          placeholder="选择表单变量"
          v-model="diyScript"
          :options="displaySettingFields"
          :props="{key: 'name', value: 'desc'}"
          @change="diyScriptChange"
        >
        </ht-select>
      </div>
      <div style="width: 100%; height: 100%">
        <codemirror
          ref="scriptText"
          v-model="dialogRuleData_show"
          :options="cmOptions"
          style="width: 99%; height: 100%"
          name="jsCode_show"
        ></codemirror>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="methodOk_show()">确 定</el-button>
        <el-button @click="dialogMethodVisible_show = false">取 消</el-button>
      </div>
    </el-dialog>
    <el-dialog
      :close-on-click-modal="false"
      :destroy-on-close="true"
      :visible.sync="exportUpdateVisible"
      append-to-body
    >
      <el-row :gutter="20" style="width: 100%">
        <el-col :span="10">
          <el-table
            ref="displaySettingTable"
            border
            :max-height="tabHeight"
            :data="displayExportSettingFields"
            tooltip-effect="dark"
            @row-dblclick="fillToDisplay"
          >
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column
              prop="name"
              label="列名"
              class="is-required"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              prop="desc"
              label="注释"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              prop="type"
              label="类型"
              width="80"
            ></el-table-column>
          </el-table>
        </el-col>
        <el-col :span="1">
          <el-button
            type="primary"
            circle
            icon="icon-hide"
            title="将所选字段添加为显示字段"
            style="-webkit-transform: rotate(270deg); transform: rotate(270deg)"
            @click="allFillToDisplay()"
          />
        </el-col>
        <el-col :span="10">
          <el-table border :data="exportSettingFields">
            <el-table-column
              label="序号"
              type="index"
              width="50"
            ></el-table-column>
            <el-table-column label="注释" prop="desc"></el-table-column>
            <el-table-column
              label="列名"
              prop="name"
              width="150"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  @click="removeExport(scope.$index)"
                  type="danger"
                  size="mini"
                  icon="el-icon-delete"
                  plain
                ></el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-col>
      </el-row>

      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="exportOk">确 定</el-button>
        <el-button @click="exportUpdateVisible = false">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 获取对话框选项列表-->
    <ht-load-data
      url="/form/customDialog/v1/getAll"
      requestMethod="post"
      context="form"
      @after-load-data="afterCustomDialogLoadData"
    ></ht-load-data>
    <ht-load-data
      url="/form/customQuery/v1/list"
      requestMethod="post"
      context="form"
      @after-load-data="afterCustomQueryLoadData"
    ></ht-load-data>
    <el-dialog
      v-if="outValueTypeVisible"
      :visible.sync="outValueTypeVisible"
      :close-on-click-modal="false"
      :destroy-on-close="true"
      append-to-body
    >
      <el-form v-if="outConfig.type == 'select'" label-width="120px">
        <el-form-item label="选项配置">
          <el-radio-group
            v-model="outConfig.choiceType"
            size="mini"
            class="btn-radio"
          >
            <el-radio-button label="static">固定选项</el-radio-button>
            <el-radio-button label="dynamic">动态选项</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <template v-if="outConfig.choiceType == 'dynamic'">
          <el-form-item label="选择关联查询">
            <ht-select
              filterable
              @change="setCurrentCustomQuery"
              v-model="outConfig.customQuery.alias"
              :options="customQuerys"
              :props="{key: 'alias', value: 'name'}"
            />
          </el-form-item>
          <el-form-item label="值">
            <ht-select
              clearable
              v-model="outConfig.customQuery.valueBind"
              :options="outConfig.customQuery.resultfield"
              :props="{key: 'field', value: 'comment'}"
            />
          </el-form-item>
          <el-form-item label="标签">
            <ht-select
              clearable
              v-model="outConfig.customQuery.labelBind"
              :options="outConfig.customQuery.resultfield"
              :props="{key: 'field', value: 'comment'}"
            />
          </el-form-item>
        </template>
        <template v-else>
          <el-table style="width: 100%" :data="outConfig.selectData" border>
            <el-table-column label="选项值" width="300px">
              <template slot-scope="scope">
                <ht-input
                  v-model="scope.row.key"
                  style="width: 100%"
                ></ht-input>
              </template>
            </el-table-column>
            <el-table-column label="选项标签">
              <template slot-scope="scope">
                <ht-input
                  v-model="scope.row.value"
                  style="width: 100%"
                ></ht-input>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100px">
              <template slot="header">
                操作
                <el-button
                  class="btn-padding"
                  icon="el-icon-plus"
                  @click="outConfig.selectData.push({key: '', value: ''})"
                ></el-button>
              </template>
              <template slot-scope="scope">
                <el-button
                  class="btn-padding"
                  style="margin-left: 0px"
                  icon="el-icon-delete"
                  @click="outConfig.selectData.remove(scope.row)"
                ></el-button>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </el-form>

      <el-form v-else-if="outConfig.type == 'dialog'" label-width="120px">
        <ht-form-item label="按钮名称">
          <ht-input v-model="outConfig.dialogConfig.name"></ht-input>
        </ht-form-item>
        <ht-form-item>
          <template slot="label">
            <el-tooltip content="所选择的自定义查询作为选项时的绑定">
              <i class="property-tip icon-question" />
            </el-tooltip>
            <span>选择对话框</span>
          </template>
          <ht-select
            filterable
            @change="changeCustDialog"
            v-model="outConfig.dialogConfig.alias"
            :options="customDialogs"
            :props="{key: 'alias', value: 'name'}"
          />
          <table class="form-table" cellspacing="0" cellpadding="0" border="0">
            <tbody>
              <tr class="linkageTable-tr">
                <td width="150px">返回结果字段</td>
                <td width="220px">绑定显示的属性</td>
                <!-- <td width="80px">解除绑定</td> -->
              </tr>

              <tr
                class="linkageTable-tr"
                v-for="(field, index) in outConfig.dialogConfig.resultField"
                :key="index"
              >
                <td>{{ field.comment }}</td>
                <td>
                  <ht-select
                    clearable
                    v-model="outConfig.parameter[field.comment]"
                    :options="displaySettingFields"
                    :props="{key: 'name', value: 'desc'}"
                  >
                    <template slot-scope="{options}">
                      <el-option
                        v-for="item in options"
                        :key="item.id"
                        :label="item.desc"
                        :value="item.name"
                      ></el-option>
                    </template>
                  </ht-select>
                </td>
              </tr>
            </tbody>
          </table>
        </ht-form-item>
      </el-form>

      <el-form v-else v-form data-vv-scope="form" :model="outConfig">
        <el-form-item>
          <template>
            <el-checkbox v-model="outConfig.isSingle">单选</el-checkbox>
            <el-checkbox
              v-model="outConfig.selectCurrent"
              v-if="outConfig.type == 'user'"
              >当前用户</el-checkbox
            >
            <el-checkbox
              v-model="outConfig.selectCurrent"
              v-else-if="outConfig.type == 'org'"
              >当前组织</el-checkbox
            >
          </template>
        </el-form-item>
        <el-form-item>
          <template slot="label">
            <el-tooltip placement="top">
              <div slot="content">
                选择器的返回值绑定的属性，选择器控件绑定的属性不能作为返回值绑定
              </div>
              <i class="el-icon-question" />
            </el-tooltip>
            <span>返回值</span>
          </template>
          <br />
          <template v-if="outConfig.type == 'user'">
            <ht-form-item label="用户ID" label-width="100px">
              <ht-select
                clearable
                v-model="outConfig.parameter.id"
                :options="displaySettingFields"
                :props="{key: 'name', value: 'desc'}"
              >
                <template slot-scope="{options}">
                  <el-option
                    v-for="item in options"
                    :disabled="item.name == outConfig.bind"
                    :key="item.id"
                    :label="item.desc"
                    :value="item.name"
                  ></el-option>
                </template>
              </ht-select>
            </ht-form-item>
            <ht-form-item label="用户账号" label-width="100px">
              <ht-select
                clearable
                v-model="outConfig.parameter.account"
                :options="displaySettingFields"
                :props="{key: 'name', value: 'desc'}"
              >
                <template slot-scope="{options}">
                  <el-option
                    v-for="item in options"
                    :disabled="item.name == outConfig.bind"
                    :key="item.id"
                    :label="item.desc"
                    :value="item.name"
                  ></el-option>
                </template>
              </ht-select>
            </ht-form-item>
            <ht-form-item label="用户姓名" label-width="100px">
              <ht-select
                clearable
                v-model="outConfig.parameter.fullname"
                :options="displaySettingFields"
                :props="{key: 'name', value: 'desc'}"
              >
                <template slot-scope="{options}">
                  <el-option
                    v-for="item in options"
                    :disabled="item.name == outConfig.bind"
                    :key="item.id"
                    :label="item.desc"
                    :value="item.name"
                  ></el-option>
                </template>
              </ht-select>
            </ht-form-item>
            <ht-form-item label="用户手机" label-width="100px">
              <ht-select
                clearable
                v-model="outConfig.parameter.mobile"
                :options="displaySettingFields"
                :props="{key: 'name', value: 'desc'}"
              >
                <template slot-scope="{options}">
                  <el-option
                    v-for="item in options"
                    :disabled="item.name == outConfig.bind"
                    :key="item.id"
                    :label="item.desc"
                    :value="item.name"
                  ></el-option>
                </template>
              </ht-select>
            </ht-form-item>
            <ht-form-item label="用户邮箱" label-width="100px">
              <ht-select
                clearable
                v-model="outConfig.parameter.email"
                :options="displaySettingFields"
                :props="{key: 'name', value: 'desc'}"
              >
                <template slot-scope="{options}">
                  <el-option
                    v-for="item in options"
                    :disabled="item.name == outConfig.bind"
                    :key="item.id"
                    :label="item.desc"
                    :value="item.name"
                  ></el-option>
                </template>
              </ht-select>
            </ht-form-item>
          </template>
          <template v-else-if="outConfig.type == 'org'">
            <ht-form-item label="组织ID" label-width="100px">
              <ht-select
                clearable
                v-model="outConfig.parameter.id"
                :options="displaySettingFields"
                :props="{key: 'name', value: 'desc'}"
              >
                <template slot-scope="{options}">
                  <el-option
                    v-for="item in options"
                    :disabled="item.name == outConfig.bind"
                    :key="item.id"
                    :label="item.desc"
                    :value="item.name"
                  ></el-option>
                </template>
              </ht-select>
            </ht-form-item>
            <ht-form-item label="组织代码" label-width="100px">
              <ht-select
                clearable
                v-model="outConfig.parameter.code"
                :options="displaySettingFields"
                :props="{key: 'name', value: 'desc'}"
              >
                <template slot-scope="{options}">
                  <el-option
                    v-for="item in options"
                    :disabled="item.name == outConfig.bind"
                    :key="item.id"
                    :label="item.desc"
                    :value="item.name"
                  ></el-option>
                </template>
              </ht-select>
            </ht-form-item>
            <ht-form-item label="组织名称" label-width="100px">
              <ht-select
                clearable
                v-model="outConfig.parameter.name"
                :options="displaySettingFields"
                :props="{key: 'name', value: 'desc'}"
              >
                <template slot-scope="{options}">
                  <el-option
                    v-for="item in options"
                    :disabled="item.name == outConfig.bind"
                    :key="item.id"
                    :label="item.desc"
                    :value="item.name"
                  ></el-option>
                </template>
              </ht-select>
            </ht-form-item>
          </template>
          <template v-else-if="outConfig.type == 'post'">
            <ht-form-item label="岗位ID" label-width="100px">
              <ht-select
                clearable
                v-model="outConfig.parameter.id"
                :options="displaySettingFields"
                :props="{key: 'name', value: 'desc'}"
              >
                <template slot-scope="{options}">
                  <el-option
                    v-for="item in options"
                    :disabled="item.name == outConfig.bind"
                    :key="item.id"
                    :label="item.desc"
                    :value="item.name"
                  ></el-option>
                </template>
              </ht-select>
            </ht-form-item>
            <ht-form-item label="岗位代码" label-width="100px">
              <ht-select
                clearable
                v-model="outConfig.parameter.code"
                :options="displaySettingFields"
                :props="{key: 'name', value: 'desc'}"
              >
                <template slot-scope="{options}">
                  <el-option
                    v-for="item in options"
                    :disabled="item.name == outConfig.bind"
                    :key="item.id"
                    :label="item.desc"
                    :value="item.name"
                  ></el-option>
                </template>
              </ht-select>
            </ht-form-item>
            <ht-form-item label="岗位名称" label-width="100px">
              <ht-select
                clearable
                v-model="outConfig.parameter.name"
                :options="displaySettingFields"
                :props="{key: 'name', value: 'desc'}"
              >
                <template slot-scope="{options}">
                  <el-option
                    v-for="item in options"
                    :disabled="item.name == outConfig.bind"
                    :key="item.id"
                    :label="item.desc"
                    :value="item.name"
                  ></el-option>
                </template>
              </ht-select>
            </ht-form-item>
          </template>
          <template v-else-if="outConfig.type == 'job'">
            <ht-form-item label="职务ID" label-width="100px">
              <ht-select
                clearable
                v-model="outConfig.parameter.id"
                :options="displaySettingFields"
                :props="{key: 'name', value: 'desc'}"
              >
                <template slot-scope="{options}">
                  <el-option
                    v-for="item in options"
                    :disabled="item.name == outConfig.bind"
                    :key="item.id"
                    :label="item.desc"
                    :value="item.name"
                  ></el-option>
                </template>
              </ht-select>
            </ht-form-item>
            <ht-form-item label="职务代码" label-width="100px">
              <ht-select
                clearable
                v-model="outConfig.parameter.code"
                :options="displaySettingFields"
                :props="{key: 'name', value: 'desc'}"
              >
                <template slot-scope="{options}">
                  <el-option
                    v-for="item in options"
                    :disabled="item.name == outConfig.bind"
                    :key="item.id"
                    :label="item.desc"
                    :value="item.name"
                  ></el-option>
                </template>
              </ht-select>
            </ht-form-item>
            <ht-form-item label="职务名称" label-width="100px">
              <ht-select
                clearable
                v-model="outConfig.parameter.name"
                :options="displaySettingFields"
                :props="{key: 'name', value: 'desc'}"
              >
                <template slot-scope="{options}">
                  <el-option
                    v-for="item in options"
                    :disabled="item.name == outConfig.bind"
                    :key="item.id"
                    :label="item.desc"
                    :value="item.name"
                  ></el-option>
                </template>
              </ht-select>
            </ht-form-item>
          </template>
          <template v-else-if="outConfig.type == 'dem'">
            <ht-form-item label="维度ID" label-width="100px">
              <ht-select
                clearable
                v-model="outConfig.parameter.id"
                :options="displaySettingFields"
                :props="{key: 'name', value: 'desc'}"
              >
                <template slot-scope="{options}">
                  <el-option
                    v-for="item in options"
                    :disabled="item.name == outConfig.bind"
                    :key="item.id"
                    :label="item.desc"
                    :value="item.name"
                  ></el-option>
                </template>
              </ht-select>
            </ht-form-item>
            <ht-form-item label="维度代码" label-width="100px">
              <ht-select
                clearable
                v-model="outConfig.parameter.code"
                :options="displaySettingFields"
                :props="{key: 'name', value: 'desc'}"
              >
                <template slot-scope="{options}">
                  <el-option
                    v-for="item in options"
                    :disabled="item.name == outConfig.bind"
                    :key="item.id"
                    :label="item.desc"
                    :value="item.name"
                  ></el-option>
                </template>
              </ht-select>
            </ht-form-item>
            <ht-form-item label="维度名称" label-width="100px">
              <ht-select
                clearable
                v-model="outConfig.parameter.demName"
                :options="displaySettingFields"
                :props="{key: 'name', value: 'desc'}"
              >
                <template slot-scope="{options}">
                  <el-option
                    v-for="item in options"
                    :disabled="item.name == outConfig.bind"
                    :key="item.id"
                    :label="item.desc"
                    :value="item.name"
                  ></el-option>
                </template>
              </ht-select>
            </ht-form-item>
          </template>
          <template v-else-if="outConfig.type == 'role'">
            <ht-form-item label="角色ID" label-width="100px">
              <ht-select
                clearable
                v-model="outConfig.parameter.id"
                :options="displaySettingFields"
                :props="{key: 'name', value: 'desc'}"
              >
                <template slot-scope="{options}">
                  <el-option
                    v-for="item in options"
                    :disabled="item.name == outConfig.bind"
                    :key="item.id"
                    :label="item.desc"
                    :value="item.name"
                  ></el-option>
                </template>
              </ht-select>
            </ht-form-item>
            <ht-form-item label="角色代码" label-width="100px">
              <ht-select
                clearable
                v-model="outConfig.parameter.code"
                :options="displaySettingFields"
                :props="{key: 'name', value: 'desc'}"
              >
                <template slot-scope="{options}">
                  <el-option
                    v-for="item in options"
                    :disabled="item.name == outConfig.bind"
                    :key="item.id"
                    :label="item.desc"
                    :value="item.name"
                  ></el-option>
                </template>
              </ht-select>
            </ht-form-item>
            <ht-form-item label="角色名称" label-width="100px">
              <ht-select
                clearable
                v-model="outConfig.parameter.name"
                :options="displaySettingFields"
                :props="{key: 'name', value: 'desc'}"
              >
                <template slot-scope="{options}">
                  <el-option
                    v-for="item in options"
                    :disabled="item.name == outConfig.bind"
                    :key="item.id"
                    :label="item.desc"
                    :value="item.name"
                  ></el-option>
                </template>
              </ht-select>
            </ht-form-item>
          </template>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="outValueOk">确 定</el-button>
        <el-button @click="outValueTypeVisible = false">取 消</el-button>
      </div>
    </el-dialog>
  </el-container>
</template>
<script>
const eipAuthDialog = () => import('@/components/dialog/EipAuthDialog.vue')
const ImportJarSelector = () =>
  import('@/components/form/dataTemplate/ImportCheckJarManager.vue')
const flowFormAuth = () => import('@/components/flow/FlowFormAuth.vue')
import {mapState} from 'vuex'
import {Base64} from 'js-base64'
import utils from '@/hotent-ui-util.js'
import deepmerge from 'deepmerge'
const BTN_TYPE = {
  isShow: '1',
  notShow: '2',
}
export default {
  components: {
    eipAuthDialog,
    ImportJarSelector,
    flowFormAuth,
  },
  name: 'manage-setting',
  props: ['data'],
  data() {
    return {
      btnType: BTN_TYPE,
      dialogVisible: false,
      dialogModel: {},
      url: {},
      dataTemplate: {},
      manageFields: [],
      permissionMap: {},
      permissionList: [],
      displayExportSettingFields: [],
      dialogRuleData_show:'',
      exportSettingFields: [],
      customQuerys: [],
      customDialogs: [],
      displayField: [],
      btnoptions: [],
      defaultBtnOptions: [
        {key: 'add', value: '新增', disabled: false},
        {key: 'edit', value: '编辑', disabled: false},
        {key: 'del', value: '删除', disabled: false},
        {key: 'detail', value: '明细', disabled: false},
        {key: 'record', value: '修改记录', disabled: false},
        {key: 'printDetail', value: '打印明细', disabled: false},
        {key: 'sub', value: '子表数据', disabled: false},
        {key: 'sun', value: '查看孙表', disabled: false},
        {key: 'export', value: '导出', disabled: false},
        {key: 'js', value: 'js按钮', disabled: false},
        {
          key: 'import',
          value: '导入',
          limit: 1000,
          importTemplate: [],
          jarId: '',
          jarDesc: '',
          disabled: false,
        },
        {key: 'produceQRCode', value: '生成二维码', disabled: false},
        {key: 'print', value: '打印', disabled: false},
        {key: 'url', value: 'URL按钮', disabled: false},
        {key: 'switch', value: '开关', disabled: false},
        {key: 'batchUpdate', value: '更新数据', disabled: false},
      ],
      tabHeight: `${document.documentElement.clientHeight}` - 280,
      currentAuthRow: null,
      dialogTitle: '',
      switchOn: '',
      switchOff: '',
      switchDefaultTrue: false,
      switchOptions: [
        {
          value: true,
          label: '默认为开',
        },
        {
          value: false,
          label: '默认为关',
        },
      ],
      switchOnLabel: '',
      switchOffLabel: '',
      files: [],
      curSelectIndex: 0,
      diyScript: '',
      index: 0,
      dialogMethodVisible: false,
      dialogMethodVisible_show: false,
      dialogRuleData: '',
      displaySettingFields: [],
      cmOptions: {
        value: '',
        mode: 'javascript',
        readOnly: false,
        smartIndent: true,
        tabSize: 1,
        theme: 'base16-light',
        lineNumbers: true,
        line: true,
        lineWiseCopyCut: true,
        showCursorWhenSelecting: true,
      },
      outvalueTypeList: [
        {key: 'input', value: '文本框'},
        {key: 'data', value: '日期'},
        {key: 'number', value: '数字'},
        {key: 'select', value: '下拉框'},
        {key: 'dialog', value: '对话框'},
        {key: 'user', value: '用户选择器'},
        {key: 'org', value: '组织选择器'},
        {key: 'post', value: '岗位选择器'},
        {key: 'job', value: '职位选择器'},
        {key: 'dem', value: '维度选择器'},
        {key: 'role', value: '角色选择器'},
      ],
      batchUpdateVisible: false,
      exportUpdateVisible: false,
      batchUpdateData: [],
      outConfig: {
        choiceType: 'static',
        parameter: {},
        selectData: [],
        customQuery: {alias: '', valueBind: '', labelBind: ''},
        dialogConfig: {name: '请选择'},
      },
      outIndex: '',
      outValueTypeVisible: false,
      filedsObj: {},
      refreshTime: new Date().getTime(),
    }
  },
  watch: {
    'data.bpmDataTemplate.subject': function (newVal) {
      //判断是否绑定了流程，绑定了流程功能按钮可以选择发起流程按钮
      if (newVal) {
        this.btnoptions.push({
          key: 'startFlow',
          value: '发起流程',
          disabled: false,
        })
        this.defaultBtnOptions.push({
          key: 'startFlow',
          value: '发起流程',
          disabled: false,
        })
      } else {
        this.btnoptions = this.btnoptions.filter((b) => b.key != 'startFlow')
        this.defaultBtnOptions = this.btnoptions.filter(
          (b) => b.key != 'startFlow'
        )
        this.manageFields = this.manageFields.filter(
          (f) => f.name != 'startFlow'
        )
      }
    },
    deep: true,
    immediate: true,
  },
  computed: mapState({
    header: (state) => {
      return {Authorization: `Bearer ${state.login.currentUser.token}`}
    },
    actionUrl: function () {
      return window.context.portal + '/system/file/v1/upload'
    },
  }),
  mounted() {
    this.dataTemplate = this.data.bpmDataTemplate
    if (this.data.displaySettingFields) {
      this.displaySettingFields = JSON.parse(
        this.data.displaySettingFields
      ).filter((item) => {
        return item.isFlowField != true
      })
      this.displayExportSettingFields = deepmerge(
        {},
        this.displaySettingFields,
        {clone: true}
      )
    }
    //判断是否绑定了流程，绑定了流程功能按钮可以选择发起流程按钮
    if (this.data.bpmDataTemplate.subject) {
      this.btnoptions.push({
        key: 'startFlow',
        value: '发起流程',
        disabled: false,
      })
      this.defaultBtnOptions.push({
        key: 'startFlow',
        value: '发起流程',
        disabled: false,
      })
    }
    this.manageFields = this.dataTemplate.manageField
      ? JSON.parse(this.dataTemplate.manageField)
      : []
    this.displayField = this.dataTemplate.displayField
      ? JSON.parse(this.dataTemplate.displayField)
      : []

    this.permissionMap = this.data.permissionList
    if (this.permissionMap) {
      for (let key in this.permissionMap) {
        this.permissionList.push({type: key, title: this.permissionMap[key]})
      }
      this.displaySettingFields.forEach((item) => {
        this.filedsObj[item.name] = item.desc
      })
    }
    const manageFields = JSON.parse(this.dataTemplate.manageField)
    const alreadyAddedFields = new Map()
    if (manageFields) {
      manageFields.forEach((manageField) => {
        alreadyAddedFields.set(manageField.name, manageField.name)
        this.defaultBtnOptions.forEach((btn) => {
          if (
            manageField.name === btn.key &&
            !(
              btn.key == 'js' ||
              btn.key == 'url' ||
              btn.key == 'switch' ||
              btn.key == 'batchUpdate'
            )
          ) {
            btn.disabled = true
          }
        })
      })
    }
    this.btnoptions = this.defaultBtnOptions.filter(
      (btn) => !alreadyAddedFields.has(btn.key)
    )
  },
  methods: {
    isDisabled(row) {
      return row
        ? row.name != 'add' &&
            row.name != 'edit' &&
            row.name != 'detail' &&
            row.name != 'del'
        : false
    },
    btnChange(row) {
      this.$set(row, 'mpDisplay', row.mpDisplay === '1' ? '2' : '1')
    },
    diyScriptChange(myValue) {
      var cm = this.$refs.scriptText.codemirror
      var doc = cm.getDoc()
      var cursor = doc.getCursor() //gets the line number in the cursor position
      var line = doc.getLine(cursor.line) //get the line contents
      var pos = {
        line: cursor.line,
        ch: line.length - 1, //set the character position to the end of the line
      }
      doc.replaceRange(' ' + 'row.' + myValue + ' ', pos) //adds a new line
    },
    setButtonJs(row, index) {
      this.index = index
      if (row.jsValue) {
        this.dialogRuleData = Base64.decode(row.jsValue)
      }
      this.dialogMethodVisible = true
    },
    setShowJs(row, index) {
      this.index = index
      if (row.jsValue_show) {
        this.dialogRuleData_show = Base64.decode(row.jsValue_show)
      }
      this.dialogMethodVisible_show = true
    },
    methodOk_show() {
      this.dialogMethodVisible_show = false
      this.manageFields[this.index].jsValue_show = Base64.encode(this.dialogRuleData_show)
    },
    methodOk() {
      this.dialogMethodVisible = false
      this.manageFields[this.index].jsValue = Base64.encode(this.dialogRuleData)
    },
    selectJar() {
      this.$refs.importJarSelector && this.$refs.importJarSelector.show()
    },
    downloadTemplate() {
      this.$http.post(
        '${form}/form/dataTemplate/v1/downloadMainTempByFormKey/' +
          this.dataTemplate.formKey,
        this.dataTemplate.formKey,
        this.dataTemplate.formKey,
        'arraybuffer'
      )
    },
    beforeUpload(file) {
      if (
        this.manageFields[this.curSelectIndex].importTemplate &&
        this.manageFields[this.curSelectIndex].importTemplate.length > 0
      ) {
        if (this.manageFields[this.curSelectIndex].importTemplate.length == 1) {
          return new Promise((resolve, reject) => {
            this.$confirm('已有模板, 是否确认覆盖?', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning',
            })
              .then(() => {
                resolve()
              })
              .catch(() => {
                reject()
              })
          })
        } else {
          this.$message.waring('最多只能上传一个模板')
          return false
        }
      } else {
        return true
      }
    },
    handleImportClick(scope) {
      this.curSelectIndex = scope.$index
    },
    handleRemove(file, fileList) {
      if (fileList && fileList.length == 1) {
        return
      }
      let this_ = this
      setTimeout(function () {
        this_.manageFields[this_.curSelectIndex].importTemplate = []
      }, 50)
    },
    success(response, file, fileList) {
      this.files = []
      for (let i = 0; i < fileList.length; i++) {
        if (fileList[i].response) {
          let value = fileList[i].response
          let arrarFile = {}
          arrarFile.id = value.fileId
          arrarFile.name = value.fileName
          arrarFile.size = value.size
          this.files.push(arrarFile)
        }
      }
      this.manageFields[this.curSelectIndex].importTemplate = this.files
    },
    jarSelectorOnConfirm(d) {
      this.$set(this.manageFields[this.curSelectIndex], 'jarId', d.id)
      this.$set(this.manageFields[this.curSelectIndex], 'jarDesc', d.desc)
    },
    copy(index) {
      let obj = JSON.parse(JSON.stringify(this.manageFields[index]))
      this.manageFields.push(obj)
    },
    //保存按钮数据
    saveManageField() {
      //处理开关字段
      if (this.manageFields) {
        this.dataTemplate.manageField = JSON.stringify(this.manageFields)
      } else {
        this.dataTemplate.manageField = null
      }
    },
    validateManageField() {
      //开关按钮校验，开关按钮必须绑定一列，开时值和关时值必填
      let this_ = this
      let fields = this_.manageFields
      for (let i = 0; i < fields.length; i++) {
        if (fields[i].name === 'switch') {
          if (!fields[i].bind) {
            this_.$message.warning('请选择开关的绑定字段')
            return
          }
          if (!fields[i].switchOn || !fields[i].switchOff) {
            this_.$message({
              type: 'warning',
              message: '请完善开关的开时值和关时值',
            })
            return false
          }
          if (!fields[i].desc || !fields[i].name) {
            this_.$message({type: 'warning', message: '请完善开关信息'})
            return false
          }
        }
      }
      return true
    },
    //显示字段排序
    sort(index, type) {
      if ('up' == type) {
        if (index === 0) {
          this.$message({
            message: '已经是列表中第一位',
            type: 'warning',
          })
        } else {
          let temp = this.manageFields[index - 1]
          this.$set(this.manageFields, index - 1, this.manageFields[index])
          this.$set(this.manageFields, index, temp)
        }
      } else {
        if (index === this.manageFields.length - 1) {
          this.$message({
            message: '已经是列表中最后一位',
            type: 'warning',
          })
        } else {
          let i = this.manageFields[index + 1]
          this.$set(this.manageFields, index + 1, this.manageFields[index])
          this.$set(this.manageFields, index, i)
        }
      }
    },
    //删除显示字段
    remove(index) {
      const manageField = this.manageFields[index]
      const btn = this.defaultBtnOptions.filter(
        (btn) => manageField.name === btn.key
      )[0]
      this.btnoptions.push(btn)
      this.manageFields.splice(index, 1)
      this.defaultBtnOptions.forEach((button) => {
        if (button.key === btn.key) {
          button.disabled = false
          return
        }
      })
    },
    //添加管理按钮
    addManageBtns() {
      if (this.btnoptions.length > 0) {
        const btn = this.btnoptions.shift()
        if (
          btn &&
          (btn.key == 'js' ||
            btn.key == 'url' ||
            btn.key == 'switch' ||
            btn.key == 'batchUpdate')
        ) {
          this.btnoptions.unshift(btn)
        }
        this.defaultBtnOptions.forEach((button) => {
          if (
            button.key === btn.key &&
            !(
              btn.key == 'js' ||
              btn.key == 'url' ||
              btn.key == 'switch' ||
              btn.key == 'batchUpdate'
            )
          ) {
            button.disabled = true
          }
        })
        let manageField = {
          desc: btn.value,
          name: btn.key,
          type: '1',
          openType: 'old',
          QRCodePattern: false,
          disabled: false,
        }
        if (!this.noRights) {
          manageField.right = JSON.stringify([{type: 'everyone'}])
        }
        if (btn.key === 'import') {
          manageField.limit = 1000
        }
        this.manageFields.push(manageField)
      } else {
        this.$message({
          type: 'warning',
          message: '所有按钮都添加好了, 不能继续再添加!',
        })
      }
    },
    //处理按钮切换
    handleManageChange(row) {
      //切换按钮类型置空映射字段
      if (row.display) {
        row.display = []
        this.refreshTime = new Date().getTime()
      }
      this.defaultBtnOptions.forEach((btn) => {
        if (btn.key == row.name) {
          if (btn.limit) {
            row.limit = btn.limit
          }
          row.desc = btn.value
        }
        btn.disabled = false
      })

      const alreadyAddedFields = new Map()
      this.manageFields.forEach((manageField) => {
        alreadyAddedFields.set(manageField.name, manageField.name)
        this.defaultBtnOptions.forEach((btn) => {
          if (
            manageField.name === btn.key &&
            !(
              btn.key == 'js' ||
              btn.key == 'url' ||
              btn.key == 'switch' ||
              btn.key == 'batchUpdate'
            )
          ) {
            btn.disabled = true
          }
        })
      })
      this.btnoptions = this.defaultBtnOptions.filter(
        (btn) => !alreadyAddedFields.has(btn.key)
      )

      //如果按钮类型不是新增、编辑、明细、删除时，移动端显示
      if (
        row.name != 'add' &&
        row.name != 'edit' &&
        row.name != 'detail' &&
        row.name != 'del'
      ) {
        row.mpDisplay = '2'
      }
    },
    //打开设置权限
    setFieldRightDialog(row) {
      let conf = {
        right: JSON.parse(row.right),
        permissionList: this.permissionList,
      }
      this.currentAuthRow = row
      this.$refs.eipAuthDialog.showDialog(conf)
    },
    //设置权限
    authDialogOnConfirm(data) {
      if (this.currentAuthRow) {
        this.currentAuthRow.right = JSON.stringify(data)
      }
    },
    //显示权限信息
    rightToDesc(right) {
      if (right) {
        try {
          right = JSON.parse(right)
        } catch (error) {}
      }
      let desc = ''
      let _this = this
      right.forEach((r) => {
        if (desc) {
          desc += ' 和 '
        }
        var str = _this.permissionMap[r.type]
        if (r.name) {
          str += ':' + r.name
        } else if (r.id) {
          str += ':' + r.id
        }
        desc += str
      })
      return desc
    },
    //标题统一权限设置
    mrightRenderHeader(h, para) {
      //下拉框选项
      let _this = this
      let rights = [
        {key: '', value: '请选择'},
        {key: 'none', value: '无'},
        {key: 'everyone', value: '所有人'},
      ]
      let rightMap = {'': '请选择', none: '无', everyone: '所有人'}
      //下拉框内容包裹在一个div里面
      return h('div', {}, [
        h(
          'span',
          {
            //div里面有一个文字提示：下拉框所属内容
            style: {},
            class: 'level-font-class',
          },
          para.column.label
        ),
        h(
          'el-select',
          {
            //el-select实现下拉框
            size: 'mini',
            style: {
              width: '120px',
              marginLeft: '10px',
            },
            on: {
              input: (value) => {
                //随着下拉框的不同，文字框里的内容在边
                _this.rightLab = rightMap[value]
                if (
                  value &&
                  _this.manageFields &&
                  _this.manageFields.length > 0
                ) {
                  _this.manageFields.forEach((field) => {
                    if (field.right) {
                      try {
                        field.right = JSON.parse(field.right)
                      } catch (error) {}
                    }
                    if (field.right[0].hasOwnProperty('v')) {
                      field.right[0] = {v: value}
                    } else {
                      field.right[0] = {type: value}
                    }
                    field.right = JSON.stringify(field.right)
                  })
                }
              },
            },
            props: {
              value: _this.rightLab, //文字框的内容取决于这个value，如果value不存在，会报错
            },
          },
          [
            //下拉框里面填充选项，通过rights遍历map，为每一个选项赋值。
            rights.map((item) => {
              return h('el-option', {
                props: {
                  value: item.key,
                  label: item.value,
                },
              })
            }),
          ]
        ),
      ])
    },
    //URL按钮和开关按钮设置事件
    setButtonValue(option, row) {
      this.dialogVisible = true
      if (option === 'url') {
        this.dialogTitle = '设置Url地址'
        this.url = row.url
      } else if (option === 'switch') {
        this.dialogTitle = '设置开关值'
        this.switchOn = row.switchOn
        this.switchOff = row.switchOff
        this.switchOnLabel = row.switchOnLabel
        this.switchOffLabel = row.switchOffLabel
      }
      this.dialogModel = row
    },
    //设置URL按钮和开关后确认
    dialogOnconfirm() {
      if (this.dialogTitle === '设置开关值') {
        this.dialogModel.switchOn = this.switchOn
        this.dialogModel.switchOff = this.switchOff
        this.dialogModel.isActive = 'off'
        this.dialogModel.switchDefaultTrue = this.switchDefaultTrue
        this.dialogModel.switchOnLabel = this.switchOnLabel
        this.dialogModel.switchOffLabel = this.switchOffLabel
        if (!this.switchOn || !this.switchOff) {
          this.$message({
            type: 'warning',
            message: '开关需要设置开时值和关时值',
          })
        }
      } else if (this.dialogTitle === '设置Url地址') {
        this.dialogModel.url = this.url
      }
      this.dialogVisible = false
    },
    initMpDisplay(row) {
      this.$set(row, 'mpDisplay', '2')
    },
    setAuth(row) {
      let param = {
        formKey: this.dataTemplate.formKey,
        dataKey: this.dataTemplate.alias,
        type: row.name === 'add' ? 3 : row.name === 'edit' ? 4 : 5,
      }
      this.$refs.flowFormAuth.showDialog(param)
    },

    batchUpdateOk() {
      const me_ = this
      utils
        .validateForm(this, 'form')
        .then((r) => {
          me_.batchUpdateVisible = false
          me_.manageFields[me_.index].batchUpdateData = Base64.encode(
            JSON.stringify(me_.batchUpdateData)
          )
          me_.manageFields[me_.index].filedsObj = Base64.encode(
            JSON.stringify(me_.filedsObj)
          )
        })
        .catch((items) => {
          this.$message.error(`还有内容未填写。`)
        })
    },

    fillToDisplay(row, event, column) {
      let isIn = this.isInDisplayFields(row.name)
      if (!isIn) {
        let fileds = {name: row.name, desc: row.desc, type: row.type}
        this.exportSettingFields.push(fileds)
      }
    },
    isInDisplayFields(name) {
      let isIn = false
      if (this.exportSettingFields && this.exportSettingFields.length > 0) {
        this.exportSettingFields.forEach((obj) => {
          if (obj.name == name) {
            isIn = true
            return
          }
        })
      }
      return isIn
    },
    allFillToDisplay() {
      let selectrows = this.$refs.displaySettingTable.store.states.selection
      if (!selectrows || selectrows.length < 1) {
        this.$message({
          message: '请在左侧列表中选择要显示的字段',
          type: 'warning',
        })
      }
      selectrows.forEach((obj) => {
        if (!this.isInDisplayFields(obj.name)) {
          let fileds = {name: obj.name, desc: obj.desc, type: obj.type}
          this.exportSettingFields.push(fileds)
        }
      })
    },
    removeExport(index) {
      this.exportSettingFields.splice(index, 1)
    },
    setExport(row, index) {
      this.exportSettingFields = []
      if (row.exportSettingFields) {
        this.exportSettingFields = JSON.parse(
          Base64.decode(row.exportSettingFields)
        )
      }
      this.index = index

      let displayExportSettingFields = []
      this.displaySettingFields.forEach((obj) => {
        displayExportSettingFields.push({
          name: obj.name,
          desc: obj.desc,
          type: obj.type,
        })
      })
      if (this.data.displaySettingFields) {
        let displayField = JSON.parse(this.data.displaySettingFields)
        displayField.forEach((item) => {
          let findObj = displayExportSettingFields.find(
            (row) => item.name == row.name
          )
          if (findObj == undefined) {
            displayExportSettingFields.push({
              name: item.name,
              desc: item.desc,
              type: item.type,
            })
          }
        })
      }
      this.displayExportSettingFields = displayExportSettingFields
      this.exportUpdateVisible = true
    },
    exportOk() {
      if (this.exportSettingFields) {
        this.manageFields[this.index].exportSettingFields = Base64.encode(
          JSON.stringify(this.exportSettingFields)
        )
      } else {
        this.manageFields[this.index].exportSettingFields = ''
      }
      this.exportUpdateVisible = false
    },
    setButtonUpdate(row, index) {
      this.$set(this, 'batchUpdateData', this.$options.data().batchUpdateData)
      if (row.batchUpdateData) {
        this.batchUpdateData = JSON.parse(Base64.decode(row.batchUpdateData))
      }
      this.batchUpdateVisible = true
      this.index = index
    },
    resetOutConfig(row, index) {
      debugger
      if (
        row.outValueType &&
        row.outValueType != 'input' &&
        row.outValueType != 'data' &&
        row.outValueType != 'number'
      ) {
        this.outConfig = {
          type: row.outValueType,
          choiceType: 'static',
          parameter: {},
          selectData: [],
          customQuery: {alias: '', valueBind: '', labelBind: ''},
          dialogConfig: {name: '请选择'},
        }
        row.outConfig = JSON.stringify(this.outConfig)
      }
    },
    setOutValue(row, index) {
      Object.assign(this.$data.outConfig, this.$options.data().outConfig)
      this.outIndex = index
      this.outConfig.type = row.outValueType
      this.outConfig.bind = row.name
      if (row.outConfig) {
        this.outConfig = JSON.parse(row.outConfig)
        if (!this.outConfig.customQuery) {
          this.outConfig.customQuery = {valueBind: '', labelBind: ''}
        }
      }
      this.outValueTypeVisible = true
    },
    outValueOk() {
      this.batchUpdateData[this.outIndex].outConfig = JSON.stringify(
        this.outConfig
      )
      this.outValueTypeVisible = false
    },
    addBatchUpdategData() {
      this.batchUpdateData.push({})
    },
    afterCustomQueryLoadData(data) {
      this.customQuerys = data.rows
    },
    afterCustomDialogLoadData(data) {
      this.customDialogs = data
    },
    changeCustDialog(value) {
      const _this = this
      _this.outConfig.dialogConfig.conditions = []
      this.outConfig.dialogConfig.mappingConf = []
      this.outConfig.dialogConfig.custQueryJson = []
      this.outConfig.dialogConfig.selectNum = ''
      let obj = this.customDialogs.find((item) => item.alias == value)
      if (obj) {
        this.outConfig.dialogConfig.selectNum = obj.selectNum
        let treeData
        if (obj.style === 2) {
          let combineConfig = JSON.parse(obj.combinationRule)
          let listDialog = this.customDialogs.find(
            (item) => item.alias == combineConfig.rightDialog
          )
          treeData = JSON.parse(listDialog.resultfield)
          this.outConfig.dialogConfig.type = 'combiDialog'
        }
        if (obj.listDialog && obj.listDialog.resultfield) {
          treeData = eval('(' + obj.listDialog.resultfield + ')')
          this.outConfig.dialogConfig.type = 'combiDialog'
        }
        if (obj.resultfield && obj.resultfield !== '[]') {
          treeData = eval('(' + obj.resultfield + ')')
          this.outConfig.dialogConfig.type = 'custDialog'
        }
        for (let q = 0, f; (f = treeData[q++]); ) {
          f.field = f.comment
        }
        this.outConfig.dialogConfig.resultField = treeData
        let conditionList = eval('(' + obj.conditionfield + ')')
        let conditions = []
        //只处理类型等于1的对话框参数（defaultType：1：用户输入，2：固定值 ，3：参数传入）
        if (conditionList && conditionList.length > 0) {
          for (let j = 0, c; (c = conditionList[j++]); ) {
            if (c.defaultType == '3') {
              let has = false
              if (!has) conditions.push(c)
            }
          }
        }
        this.outConfig.dialogConfig.conditions = conditions
      }
    },
    setCurrentCustomQuery() {
      const _this = this
      _this.outConfig.customQuery.labelBind = ''
      _this.outConfig.customQuery.valueBind = ''
      _this.customQuerys.forEach((item) => {
        if (_this.outConfig.customQuery.alias == item.alias) {
          if (typeof item.conditionfield == 'string') {
            item.conditionfield = JSON.parse(item.conditionfield) //parseToJson(item.customQuery.conditionfield);
            item.resultfield = JSON.parse(item.resultfield) // parseToJson(item.customQuery.resultfield);
          }
          //把当前对象克隆一份到控件属性配置
          Object.assign(_this.outConfig.customQuery, item)
          _this.slimCustomQuery(_this.outConfig.customQuery)
        }
      })
    },
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
  },
}
</script>
<style lang="scss" scoped>
// .dt-manage__table >>> .cell {
//   text-align: center;
// }
.el-table >>> .el-radio-group {
  margin-left: 10px;
  margin-right: 10px;
}
.upload-demo >>> .el-upload-list--text {
  display: inline-table;
}
.mobile-btn {
  &:focus {
    border: 1px solid #dcdfe6;
    color: #606266;
  }
}

.is-active__btn {
  border: 1px solid #409eff;
  background: #409eff;
  color: #fff;
  &:focus {
    color: #fff;
  }
}
</style>
