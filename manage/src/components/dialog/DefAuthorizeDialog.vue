<template>
  <div>
    <el-dialog
        width="70%"
        :title="(authId ? '编辑' : '添加') + '分管授权'"
        :visible="dialogVisible"
        :before-close="handleClose"
        :destroy-on-close="true"
        :close-on-click-modal="false"
        custom-class="authorization-dialog-wrap"
      >
        <form v-form data-vv-scope="editFlowAuthForm">
          <table class="form-table" cellspacing="0" cellpadding="0" border="0">
            <tbody>
              <tr>
                <th width="140px" class="is-required">权限描述:</th>
                <td>
                  <ht-input
                    v-model="flowAuth.authorizeDesc"
                    validate="required"
                    :maxlength="200"
                    :showWordLimit="true"
                  />
                </td>
              </tr>
              <tr>
                <th width="140px" >
                  <!--<el-tooltip class="item" effect="dark" content="勾选任务时必须勾选实例，任务的部门权限来源于实例" placement="left">
                    <div class="control-label left-label">
                      <i class="el-icon-warning"></i>权限类型
                    </div>
                  </el-tooltip>-->
                  <span class="is-required" style="color: #666">权限类型</span>
                  </th>
                <td>
                  <el-checkbox
                    v-for="(key, value) in authorizeTypes"
                    v-model="authorizeTypes_[value]"
                    @change="authorizeTypesChange"
                    :key="value"
                    >{{ key }}</el-checkbox
                  >
                  <span style="margin-left: 5px;color: red">(注：勾选任务时必须勾选实例，任务的部门权限来源于实例)</span>
                </td>
              </tr>
              <tr>
                <th width="140px" class="is-required">授权人员名称:</th>
                <td>
                  <el-table :data="calOwnerNameJson">
                    <el-table-column prop="title">
                      <template slot="header">
                        <el-button
                          type="primary"
                          size="mini"
                          icon="el-icon-plus"
                          @click="showAuthDialog"
                          >选择</el-button
                        >权限分类
                      </template>
                    </el-table-column>
                    <el-table-column prop="name" label="授权给"></el-table-column>
                    <!-- <el-table-column prop="name" label="实例查询权限范围" >
                      <template v-slot="{ row, column, $index }">
                        <eip-org-selector
                          v-if="row.type != 'everyone'"
                          v-model="row.authOrgName"
                          :config="{id:'calOwnerNameJson['+$index+'].authOrg'}"
                          append-to-body
                        />
                      </template>
                    </el-table-column>-->
                  </el-table>
                </td>
              </tr>
              <tr>
                <th width="140px" class="is-required">授权流程类型</th>
                <td>
                  <ht-radio
                    v-model="flowAuth.multiple"
                    :options="[
                      { key: '1', value: '流程' },
                      { key: '2', value: '分类' }
                    ]"
                    validate="required"
                  ></ht-radio>
                </td>
              </tr>
              <tr v-show="flowAuth.multiple == '1'">
                <th width="140px" class="is-required">授权流程名称:</th>
                <td>
                  <el-table :data="defNameJson">
                    <el-table-column prop="defName" width="160">
                      <template slot="header">
                        <el-button
                          type="primary"
                          size="mini"
                          icon="el-icon-plus"
                          @click="showFlowDialog"
                          >选择</el-button
                        >流程名称
                      </template>
                    </el-table-column>
                    <el-table-column label="授权内容">
                      <el-table-column :render-header="renderLastHeader">
                        <template v-slot="{ row, column, $index }">
                          <div v-show="authorizeTypes_.management">
                            <el-checkbox @change="checked=>handleDefauthSelect(checked, row, 'def')" v-model="checkMap[row.defKey]"></el-checkbox>
                            定义(
                            <el-checkbox v-model="row.right.m_edit"
                              >编辑</el-checkbox
                            >
                            <el-checkbox v-model="row.right.m_del"
                              >删除</el-checkbox
                            >
                            <el-checkbox v-model="row.right.m_start"
                              >启动</el-checkbox
                            >
                            <!-- <el-checkbox v-model="row.right.m_set">设置</el-checkbox> -->
                            <el-checkbox v-model="row.right.m_clean"
                              >清除数据</el-checkbox
                            >)
                          </div>
                          <div v-show="authorizeTypes_.instance">
                            实例(
                            <el-checkbox v-model="row.right.i_del"
                              >删除</el-checkbox
                            >)
                            <el-checkbox v-model="row.right.i_org">本部门</el-checkbox>
                          </div>
                        </template>
                      </el-table-column>
                    </el-table-column>
                    <el-table-column label="操作" width="100">
                      <template v-slot="{ row, column, $index }">
                        <el-button
                          type="danger"
                          @click="defNameJson.remove(defNameJson[$index])"
                          icon="el-icon-delete"
                          >删除</el-button
                        >
                      </template>
                    </el-table-column>
                  </el-table>
                </td>
              </tr>
              <tr v-show="flowAuth.multiple == '2'">
                <th width="140px" class="is-required">授权流程分类名称:</th>
                <td>
                  <el-table :data="defAllNameJson">
                    <el-table-column prop="defName" width="160">
                      <template slot="header">
                        <el-button
                          type="primary"
                          size="mini"
                          icon="el-icon-plus"
                          @click="showSysTypeDialog"
                          >选择</el-button
                        >流程分类名称
                      </template>
                    </el-table-column>
                    <el-table-column label="授权内容">
                      <el-table-column :render-header="renderLastHeader">
                        <template v-slot="{ row, column, $index }">
                          <div v-show="authorizeTypes_.management">
                            <el-checkbox @change="checked=>handleDefauthSelect(checked, row, 'type')" v-model="typeCheckMap[row.defKey]"></el-checkbox>
                            定义(
                            <el-checkbox v-model="row.right.m_edit"
                              >设计</el-checkbox
                            >
                            <el-checkbox v-model="row.right.m_del"
                              >删除</el-checkbox
                            >
                            <el-checkbox v-model="row.right.m_start"
                              >启动</el-checkbox
                            >
                            <el-checkbox v-model="row.right.m_set"
                              >设置</el-checkbox
                            >
                            <el-checkbox v-model="row.right.m_clean"
                              >清除数据</el-checkbox
                            >)
                          </div>
                          <div v-show="authorizeTypes_.instance">
                            实例(
                            <el-checkbox v-model="row.right.i_del"
                              >删除</el-checkbox
                            >)
                            <el-checkbox v-model="row.right.i_org">本部门</el-checkbox>
                          </div>
                        </template>
                      </el-table-column>
                    </el-table-column>
                    <el-table-column label="操作" width="100">
                      <template v-slot="{ row, column, $index }">
                        <el-button
                          type="danger"
                          @click="defAllNameJson.remove(defAllNameJson[$index])"
                          icon="el-icon-delete"
                          >删除</el-button
                        >
                      </template>
                    </el-table-column>
                  </el-table>
                </td>
              </tr>
            </tbody>
          </table>
        </form>
        <div slot="footer" class="dialog-footer">
          <ht-submit-button
            url="${bpmModel}/flow/defAuthorize/v1/save"
            :model="flowAuth"
            :is-submit="isSubmit"
            scope-name="editFlowAuthForm"
            @before-save-data="beforeSaveData"
            @after-save-data="afterSaveData"
            >{{ $t("eip.common.save") }}</ht-submit-button
          >
          <el-button @click="dialogCancle('dialogVisible')">{{
            $t("eip.common.cancel")
          }}</el-button>
        </div>
      </el-dialog>
      <!-- 选择对话框  -->
      <eip-auth-dialog
        ref="eipAuthDialog"
        name="eipAuthDialog"
        @onConfirm="dialogOnConfirm"
        append-to-body
      />
      <!-- 流程选择对话框  -->
      <eip-flow-dialog
        ref="eipFlowDialog"
        name="eipFlowDialog"
        @onConfirm="dialogOnConfirm"
        append-to-body
      />

      <!-- 分类对话框  -->
      <eip-sys-type-dialog
        ref="flowTypeDialog"
        name="flowTypeDialog"
        show-checkbox
        type-key="FLOW_TYPE"
        @onConfirm="dialogOnConfirm"
      ></eip-sys-type-dialog>

      <ht-load-data ref="htLoadData"></ht-load-data>
  </div>
</template>
<script>
import req from "@/request.js";
import { Base64 } from "js-base64";
import utils from "@/hotent-ui-util.js";
const eipAuthDialog = () => import("@/components/dialog/EipAuthDialog.vue");
const eipOrgSelector = () => import("@/components/selector/EipOrgSelector.vue");
const eipFlowDialog = () => import("@/components/dialog/EipFlowDialog.vue");
const eipSysTypeDialog = () => import("@/components/dialog/EipSysTypeDialog.vue");
export default {
  components: {
    eipAuthDialog,
    eipOrgSelector,
    eipFlowDialog,
    eipSysTypeDialog
  },
  name: "def-authorize-dialog",
  data() {
    return {
      dialogVisible: false,
      dialogVisibleMenuPerm: false,
      flowAuth: {
        authorizeTypes: { start: true },
        defAllNameJson: [],
        defNameJson: [],
        multiple: "1"
      },
      authorizeTypes_: { start: true },
      authorizeTypes: {
        start: "启动",
        management: "定义",
        task: "任务",
        instance: "实例"
      },
      calOwnerNameJson: [],
      defAllNameJson: [],
      defNameJson: [],
      isSubmit: true,
      data: [],
      pageResult: {
        page: 1,
        pageSize: 50,
        total: 0
      },
      authId: "",
      checkMap:{},
      typeCheckMap:{}
    };
  },
  methods: {
    showDialog(id,defRow) {
      this.dialogVisible = true;
      this.initData(id,defRow);
    },
    initData(id,defRow){
      this.dialogVisible = true;
      const me = this;
      if (id) {
        this.authId = id;
        this.$refs.htLoadData
          .loadData(
            "${bpmModel}/flow/defAuthorize/v1/defAuthorizeGet?id=" + id
          )
          .then(data => {
            me.flowAuth = data;
            me.authorizeTypes_ = JSON.parse(data.authorizeTypes);
            me.flowAuth.authorizeTypes = me.authorizeTypes_;
            me.defNameJson = JSON.parse(data.defNameJson);

            // right 转为对象
            me.defNameJson.forEach(item => {
              if (item.right && item.right.constructor == String) {
                item.right = JSON.parse(item.right);
              }
            });

            me.defAllNameJson = JSON.parse(data.defAllNameJson);

            // right 转为对象
            me.defAllNameJson.forEach(item => {
              if (item.right && item.right.constructor == String) {
                item.right = JSON.parse(item.right);
              }
            });

            me.calOwnerNameJson = JSON.parse(data.ownerNameJson);
          });
      } else {
        this.authId = "";
        me.flowAuth = {
          authorizeTypes: { start: true },
          defAllNameJson: [],
          defNameJson: [],
          multiple: "1"
        };
        me.defNameJson = [];
        me.defAllNameJson = [];
        me.calOwnerNameJson = [];
        me.authorizeTypes_ = { start: true };
        if(defRow && defRow.defKey){
          let defaultRight = {
              m_edit: false,
              m_del: false,
              m_start: false,
              m_set: false,
              m_clean: false,
              i_del: false,
              i_log: false,
              i_org: false,
            };
            me.defNameJson.push({
              defName: defRow.name,
              defKey: defRow.defKey,
              right: defaultRight
            });
        }
      }
    },
    dialogCancle(dialogVisible) {
      this[dialogVisible] = false;
      this.$emit("onConfirm",false);
    },
    renderLastHeader(h) {
      //下拉框选项
      let managementFilters = [
        { key: "m_edit", value: "编辑", falseLabel: "un_m_edit" },
        { key: "m_del", value: "删除", falseLabel: "un_m_del" },
        { key: "m_start", value: "启动", falseLabel: "un_m_start" }
      ];
      if (this.flowAuth.multiple == 2) {
        managementFilters.push({
          key: "m_set",
          value: "设置",
          falseLabel: "un_m_set"
        });
      }
      let managementAllFilters = [
        { key: "m_all", value: "", falseLabel: "un_m_all" }
      ];
      managementFilters.push({
        key: "m_clean",
        value: "清除数据",
        falseLabel: "un_m_clean"
      });
      let instanceFilters = [
        { key: "i_del", value: "删除", falseLabel: "un_i_del" }
      ];
      let instanceOrgFilters = [
        { key: "i_org", value: "本部门", falseLabel: "un_i_org" }
      ];
      return h("div", {}, [
        [
          managementAllFilters.map(item => {
            if (this.authorizeTypes_.management) {
              return h("el-checkbox", {
                props: {
                  trueLabel: item.key,
                  falseLabel: item.falseLabel,
                  label: item.value
                },
                on: {
                  change: this.updateAllSelectedAll // 选中事件
                }
              });
            }
          })
        ],
        h(
          "span",
          {
            //div里面有一个文字提示：多选所属内容
            style: {}
          },
          this.appendHtml(1)
        ),
        [
          managementFilters.map(item => {
            if (this.authorizeTypes_.management) {
              return h("el-checkbox", {
                props: {
                  trueLabel: item.key,
                  falseLabel: item.falseLabel,
                  label: item.value
                },
                on: {
                  change: this.updateAllSelected // 选中事件
                }
              });
            }
          })
        ],
        h("span", {}, this.appendHtml(2)),
        h("div", {}, ""),
        h("span", {}, this.appendHtml(3)),
        [
          instanceFilters.map(item => {
            if (this.authorizeTypes_.instance) {
              return h("el-checkbox", {
                props: {
                  trueLabel: item.key,
                  falseLabel: item.falseLabel,
                  label: item.value
                },
                on: {
                  change: this.updateAllSelected // 选中事件
                }
              });
            }
          })
        ],
        h("span", {}, this.appendHtml(4)),
        [
          instanceOrgFilters.map(item => {
            if (this.authorizeTypes_.instance) {
              return h("el-checkbox", {
                props: {
                  trueLabel: item.key,
                  falseLabel: item.falseLabel,
                  label: item.value
                },
                on: {
                  change: this.updateAllSelectedAll // 选中事件
                }
              });
            }
          })
        ],
      ]);
    },
    appendHtml(op) {
      if (op == 1 && this.authorizeTypes_.management) {
        return "定义(";
      } else if (op == 2 && this.authorizeTypes_.management) {
        return ")";
      } else if (op == 3 && this.authorizeTypes_.instance) {
        return "实例(";
      } else if (op == 4 && this.authorizeTypes_.instance) {
        return ")";
      }
      return "";
    },
    updateAllSelectedAll(oValue) {
      let res = true;
      if (oValue.indexOf("un_") != -1) {
        res = false;
      }
      let jsonName = this.flowAuth.multiple == 1?'defNameJson':'defAllNameJson';
      let _this = this;
      let idx = 0;
      this[jsonName].forEach(item => {
        if(oValue.indexOf("i_org") != -1){
          _this.$set(_this[jsonName][idx].right,"i_org", res);
          idx++;
        }else{
          let map = this.flowAuth.multiple == 1 ? this.checkMap : this.typeCheckMap;
          map[item.defKey] = res;
          item.right['m_edit'] = res;
          item.right['m_del'] = res;
          item.right['m_start'] = res;
          item.right['m_clean'] = res;
          if(this.flowAuth.multiple != 1){
            item.right['m_set'] = res;
          }
        }
      });
    },
    updateAllSelected(oValue) {
      let res = true;
      if (oValue.indexOf("un_") != -1) {
        res = false;
      }
      var name = oValue.replace("un_", "");
      if (this.flowAuth.multiple == 1) {
        this.defNameJson.forEach(item => {
          item.right[name] = res;
        });
      } else {
        this.defAllNameJson.forEach(item => {
          item.right[name] = res;
        });
      }
    },
    showSysTypeDialog() {
      this.$refs.flowTypeDialog.showDialog();
    },
    showAuthDialog() {
      let conf = {
        right: [],
        permissionList: [
          { type: "everyone", title: "所有人" },
          { type: "user", title: "用户" },
          { type: "org", title: "组织" },
          { type: "pos", title: "岗位" },
          { type: "role", title: "角色" }
          // ,{ type: "none", title: "无" }
        ]
      };
      if (this.calOwnerNameJson) {
        conf.right = this.calOwnerNameJson;
      }
      this.$refs.eipAuthDialog.showDialog(conf);
    },
    dialogOnConfirm(data, name) {
      if (name == "eipAuthDialog") {
        this.calOwnerNameJson = data;
      }
      if (name == "eipFlowDialog") {
        data.forEach(element => {
          let isEquals = false;
          this.defNameJson.forEach(item => {
            if (!isEquals && item.defKey == element.defKey) {
              isEquals = true;
            }
          });

          if (!isEquals) {
            let defaultRight = {
              m_edit: false,
              m_del: false,
              m_start: false,
              m_set: false,
              m_clean: false,
              i_del: false,
              i_log: false,
              i_org: false,
            };
            this.defNameJson.push({
              defName: element.name,
              defKey: element.defKey,
              right: defaultRight
            });
          }
        });
      }

      if (name == "flowTypeDialog") {
        data.forEach(element => {
          if(element.parentId == "0"){
            return ;
          }
          let isEquals = false;
          this.defAllNameJson.forEach(item => {
            if (!isEquals && item.defKey == element.id) {
              isEquals = true;
            }
          });

          if (!isEquals) {
            let defaultRight = {
              m_edit: false,
              m_del: false,
              m_start: false,
              m_set: false,
              m_clean: false,
              i_del: false,
              i_log: false,
              i_org: false,
            };
            this.defAllNameJson.push({
              defName: element.name,
              defKey: element.id,
              right: defaultRight
            });
          }
        });
      }
    },
    showFlowDialog() {
      this.$refs.eipFlowDialog.showDialog();
    },
    async beforeSaveData() {
      this.isSubmit = true;

      let isSelectType = false;
      for (const type in this.authorizeTypes_) {
        if (this.authorizeTypes_[type]) {
          isSelectType = true;
        }
      }
      if (!isSelectType) {
        this.$message.error("请选择权限类型");
        this.isSubmit = false;
        return;
      }

      if (this.calOwnerNameJson.length == 0) {
        this.$message.error("请选择授权人员");
        this.isSubmit = false;
        return;
      }

      if (this.flowAuth.multiple == "1") {
        if (this.defNameJson.length == 0) {
          this.$message.error("请选择授权流程");
          this.isSubmit = false;
          return;
        }
        this.flowAuth.defAllNameJson = [];
      } else {
        if (this.defAllNameJson.length == 0) {
          this.$message.error("请选择授权分类");
          this.isSubmit = false;
          return;
        }
        this.flowAuth.defNameJson = [];
      }
      this.flowAuth.ownerNameJson = JSON.stringify(this.calOwnerNameJson);

      this.flowAuth.defNameJson = JSON.stringify(this.defNameJson);
      this.flowAuth.defAllNameJson = JSON.stringify(this.defAllNameJson);
      this.flowAuth.authorizeTypes = JSON.stringify(this.authorizeTypes_);
    },
    afterSaveData() {
      this.dialogVisible = false;
      this.$emit("onConfirm",true);
    },
    handleDefauthSelect(value, row, type){
      if(value){
        row.right.m_edit = true;
        row.right.m_del = true;
        row.right.m_start = true;
        row.right.m_clean = true;
        if(type=='type'){
          row.right.m_set = true;
        }
      }else{
        row.right.m_edit = false;
        row.right.m_del = false;
        row.right.m_start = false;
        row.right.m_clean = false;
        if(type=='type'){
          row.right.m_set = false;
        }
      }
    },
    handleClose(){
      this.dialogVisible = false;
      this.$emit("onConfirm",false);
    },
    authorizeTypesChange(){
      if(this.authorizeTypes_.task === true && !this.authorizeTypes_.instance){
        this.$set(this.authorizeTypes_,'instance',true);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
div[aria-invalid="true"] >>> .el-input__inner,
div[aria-invalid="true"] >>> .el-input__inner:focus {
  border-color: #f56c6c;
}
/deep/.el-dialog__wrapper {
  overflow: unset !important;
}
 /deep/.el-dialog__body {
  height: calc(100% - 170px);
  overflow-y: auto;  
}
/deep/.el-dialog {
  height: 90%;
  min-height: 400px;
  margin-top: 3vh !important;
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
</style>