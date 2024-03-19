<template>
  <el-dialog
    title="过滤条件"
    :visible="dialogVisible"
    :before-close="beforeClose"
    :close-on-click-modal="false"
    width="45%"
    append-to-body
  >
    <el-form data-vv-scope="filterForm" v-form>
      <table class="form-table">
        <tbody>
          <tr>
            <th style="width: 80px;">脚本类型</th>
            <th style="width: 135px;">
              <ht-select
                :options="scriptType"
                :props="{key:'key',value:'value'}"
                v-model="data.type"
              />
            </th>
            <th style="width: 80px;">
              名称
              <span class="required">*</span>
            </th>
            <th style="width: 150px;">
              <ht-input v-model="data.name" :disabled="!isEditabled" :validate="{'required':true}" :maxlength="50" />
            </th>
            <th style="width: 80px;">
              Key
              <span class="required">*</span>
            </th>
            <th style="width: 150px;">
              <ht-input
                v-model="data.key"
                :disabled="!isAdd"
                v-pinyin="data.name"
                :validate="{'required':true, regex:{exp:'^[a-zA-Z][a-zA-Z0-9_]*$', message:'只能输入字母、数字、下划线，且以字母开头' }}"
                :maxlength="50"
              />
            </th>
          </tr>
        </tbody>
      </table>
      <template v-if="data.type==='1'">
        <el-dropdown @command="addRule('common',conditions,$event)" style="margin-right: 10px">
          <el-button>
            添加规则<i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="and">规则AND</el-dropdown-item>
            <el-dropdown-item command="or">规则OR</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-dropdown @command="addRule('combine',conditions,$event)">
          <el-button>
            添加联合规则<i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="and">规则AND</el-dropdown-item>
            <el-dropdown-item command="or">规则OR</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <div>
          <template v-for="(condition,index) in conditions">
            <ht-select
                :options="conditionOptions"
                v-model="condition.compType"
                v-if="index!==0"  :key="index"/>
            <el-card
                shadow="always"
                :key="index"
                style="margin: 5px 0;">
              <div slot="header" v-if="condition.branch">
                <span>组合条件</span>
                <el-button
                    style="float: right"
                    icon="el-icon-delete"
                    @click="removeRule(conditions,index)"
                />
                <el-dropdown @command="addRule('combine',condition.sub,$event)" style="float: right;margin:0 3px">
                  <el-button>
                    添加联合规则<i class="el-icon-arrow-down el-icon--right"></i>
                  </el-button>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item command="and">规则AND</el-dropdown-item>
                    <el-dropdown-item command="or">规则OR</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
                <el-dropdown @command="addRule('common',condition.sub,$event)" style="float: right">
                  <el-button>
                    添加规则<i class="el-icon-arrow-down el-icon--right"></i>
                  </el-button>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item command="and">规则AND</el-dropdown-item>
                    <el-dropdown-item command="or">规则OR</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </div>
              <template v-for="(sub,index) in condition.sub">
                <ht-select
                    :options="conditionOptions"
                    v-model="sub.compType"
                    v-if="index!==0"/>
                <el-card
                    :id="sub.key"
                    shadow="always"
                    :key="index"
                    style="margin: 5px 0;"
                    v-if="condition.branch"
                >
                  <div slot="header" v-if="sub.branch">
                    <span>组合条件</span>
                    <el-button
                        style="float: right"
                        icon="el-icon-delete"
                        @click="removeRule(condition.sub,index)"
                    />&nbsp;
                    <el-dropdown @command="addRule('common',sub.sub,$event)" style="float: right">
                      <el-button>
                        添加规则<i class="el-icon-arrow-down el-icon--right"></i>
                      </el-button>
                      <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item command="and">规则AND</el-dropdown-item>
                        <el-dropdown-item command="or">规则OR</el-dropdown-item>
                      </el-dropdown-menu>
                    </el-dropdown>
                  </div>
                  <template v-for="(sub1,index) in sub.sub">
                    <ht-select
                        :options="conditionOptions"
                        v-model="sub1.compType"
                        v-if="index!==0"/>
                    <el-card
                        shadow="always"
                        :key="index"
                        style="margin: 5px 0;"
                        v-if="sub.branch">
                      普通条件
                      <ht-select
                          v-model="sub1.flowvarKey"
                          :options="newMetafields"
                          :props="{key:'name',value:'name'}"
                          style="width: 25%;margin:0 3px;"
                      />
                      <ht-select
                          v-model="sub1.judgeCon1"
                          :options="judgeConditions"
                          :props="{key:'key',value:'value'}"
                          style="width: 25%;margin:0 3px;"
                      />
                      <ht-select
                          v-model="sub1.judgeVal1"
                          :options="[{key:'\'[curUserId]\'',value:'当前用户id'},{key:'\'[curUserAccount]\'',value:'当前用户账号'}]"
                          style="width: 25%;margin:0 3px;"
                          v-if="['7','8'].includes(sub1.judgeCon1)"
                      />
                      <ht-input style="width: 25%;margin:0 3px;" v-model="sub1.judgeVal1" v-if="!['7','8'].includes(sub1.judgeCon1)" :maxlength="50" :showWordLimit="true"/>
                      <el-button icon="el-icon-delete" @click="removeRule(sub.sub,index)" />
                    </el-card>
                  </template>

                  <template v-if="!sub.branch">
                    普通条件
                    <ht-select
                        v-model="sub.flowvarKey"
                        :options="newMetafields"
                        :props="{key:'name',value:'name'}"
                        style="width: 25%;margin:0 3px;"
                    />
                    <ht-select
                        v-model="sub.judgeCon1"
                        :options="judgeConditions"
                        :props="{key:'key',value:'value'}"
                        style="width: 25%;margin:0 3px;"
                    />
                    <ht-select
                        v-model="sub.judgeVal1"
                        :options="[{key:'\'[curUserId]\'',value:'当前用户id'},{key:'\'[curUserAccount]\'',value:'当前用户账号'}]"
                        style="width: 25%;margin:0 3px;"
                        v-if="['7','8'].includes(sub.judgeCon1)"
                    />
                    <ht-input style="width: 25%;margin:0 3px;" v-model="sub.judgeVal1" v-if="!['7','8'].includes(sub.judgeCon1)" :maxlength="50" :showWordLimit="true"/>
                    <el-button icon="el-icon-delete" @click="removeRule(condition.sub,index)" />
                  </template>
                </el-card>
              </template>
              <template v-if="!condition.branch">
                普通条件
                <ht-select
                    v-model="condition.flowvarKey"
                    :options="newMetafields"
                    :props="{key:'name',value:'name'}"
                    style="width: 25%;margin:0 3px;"
                />
                <ht-select
                    v-model="condition.judgeCon1"
                    :options="judgeConditions"
                    :props="{key:'key',value:'value'}"
                    style="width: 25%;margin:0 3px;"
                />
                <ht-input style="width: 25%;margin:0 3px;" v-model="condition.judgeVal1" v-if="!['7','8'].includes(condition.judgeCon1)" :maxlength="50" :showWordLimit="true"/>
                <ht-select
                    v-model="condition.judgeVal1"
                    :options="[{key:'\'[curUserId]\'',value:'当前用户id'},{key:'\'[curUserAccount]\'',value:'当前用户账号'}]"
                    v-if="['7','8'].includes(condition.judgeCon1)"
                    style="width: 25%;margin:0 3px;"/>
                <el-button icon="el-icon-delete" @click="removeRule(conditions,index)" />
              </template>
            </el-card>
          </template>

        </div>
      </template>
      <template v-if="data.type==='2' || data.type==='3'">
        <table class="form-table">
          <tr>
            <td>
              <el-select
                style="margin: 5px 0"
                v-model="selectVar"
                placeholder="请选择"
                @change="selectColumn"
              >
                <el-option-group key="sql" label="sql字段">
                  <el-option
                    v-for="item in newMetafields"
                    :key="item.name"
                    :label="item.name"
                    :value="colPrefix+item.name"
                  ></el-option>
                </el-option-group>
                <el-option-group key="comVar" label="常用变量">
                  <el-option
                    v-for="item in comVarList"
                    :key="item.alias"
                    :label="item.title"
                    :value="colPrefix+item.alias"
                  ></el-option>
                </el-option-group>
                <el-option-group key="condition" label="条件变量">
                  <el-option
                    v-for="item in conditionfields"
                    :key="item.name"
                    :label="item.name"
                    :value="colPrefix+item.name"
                  ></el-option>
                </el-option-group>
              </el-select>
            </td>
          </tr>
          <tr>
            <td>
              <ht-input
                type="textarea"
                :cols="80"
                :autosize="{ minRows: 2, maxRows: 4}"
                v-model="diySql"
              />
            </td>
          </tr>
        </table>
      </template>
      <template v-if="data.type==='4'">
        <table class="form-table" style="width: 100%">
          <tbody>
            <tr>
              <td>权限字段</td>
              <td>数据关系</td>
              <td>权限类型</td>
            </tr>
            <tr>
              <td>
                <ht-select
                  :options="newMetafields"
                  :props="{key:'name',value:'name'}"
                  v-model="authConditions[0].field"
                  clearable
                />
              </td>
              <td style="text-align: center">等于</td>
              <td>
                <div class="checkbox checkbox-info">
                  <el-switch
                    v-model="authConditions[0].enabled"
                    active-color="#13ce66"
                    inactive-color="#ff4949"
                  />当前登录用户ID
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <ht-select
                  :options="newMetafields"
                  :props="{key:'name',value:'name'}"
                  v-model="authConditions[1].field"
                  clearable
                />
              </td>
              <td style="text-align: center">等于</td>
              <td>
                <div class="checkbox checkbox-info">
                  <el-switch
                    v-model="authConditions[1].enabled"
                    active-color="#13ce66"
                    inactive-color="#ff4949"
                  />当前登陆用户所属组织ID
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <ht-select
                  :options="newMetafields"
                  :props="{key:'name',value:'name'}"
                  v-model="authConditions[2].field"
                  clearable
                />
              </td>
              <td style="text-align: center">属于</td>
              <td>
                <div class="checkbox checkbox-info">
                  <el-switch
                    v-model="authConditions[2].enabled"
                    active-color="#13ce66"
                    inactive-color="#ff4949"
                  />当前登陆用户所属组织及下属组织ID
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <ht-select
                  :options="newMetafields"
                  :props="{key:'name',value:'name'}"
                  v-model="authConditions[3].field"
                  clearable
                />
              </td>
              <td style="text-align: center">属于</td>
              <td>
                <eip-org-selector
                  v-model="orgSelect.name"
                  :config="{id:'orgSelect.id',name: 'orgSelect.name'}"
                  append-to-body
                />
              </td>
            </tr>
          </tbody>
        </table>
      </template>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="afterSaveData(save)">保存</el-button>
      <el-button @click="dialogVisible = false">返回</el-button>
    </div>
  </el-dialog>
</template>

<script>
import form from "@/api/form.js";
import utils from "hotent-ui/src/utils";
const eipOrgSelector = () => import("@/components/selector/EipOrgSelector.vue");
export default {
  components: {
    eipOrgSelector
  },
  props: {
    metafields: {
      type: Array,
      default: () => {}
    },
    conditionfields: {
      type: Array,
      default: () => {}
    },
    filterData: Object,
    keys: Array
  },
  data() {
    return {
      dialogVisible: false,
      data: {},
      isEditabled: true,
      isSelected: false,
      conditions: [],
      comVarList: [],
      colPrefix: "",
      selectVar: "",
      newMetafields: [],
      judgeConditions: [
        { key: "1", value: "等于" },
        { key: "3", value: "等于(忽略大小写)" },
        { key: "2", value: "不等于" },
        { key: "4", value: "like" },
        { key: "5", value: "like左" },
        { key: "6", value: "like右" },
        { key: "7", value: "等于变量" },
        { key: "8", value: "不等于变量" }
      ],
      scriptType: [
        { key: "1", value: "条件脚本" },
        { key: "2", value: "SQL" },
        { key: "3", value: "追加SQL" },
        { key: "4", value: "数据权限" }
      ],
      diySql: "",
      authConditions: [
        {
          type: "loginUser",
          name: "当前登录用户数据",
          field: "",
          enabled: false
        },
        {
          type: "loginUserOrgs",
          name: "当前登陆用户所属组织",
          field: "",
          enabled: false
        },
        {
          type: "loginUserSubOrgs",
          name: "当前登陆用户所属组织及下属组织",
          field: "",
          enabled: false
        },
        {
          type: "customOrgs",
          name: "自定义选择组织",
          orgs: [
            { id: "6777", name: "组织测试" },
            {
              id: "6645",
              name: "测试测试长度是否有变化啊测试测试长度是否有变化啊"
            }
          ],
          field: ""
        }
      ],
      orgSelect: {
        id: "",
        name: ""
      },
      isAdd: false,
      conditionOptions:[{key:'and',value:'and'},{key:'or',value:'or'}]
    };
  },
  mounted() {
    if (this.$store.state.login.currentUser.userAttrs.tenantId != -1) {
      this.scriptType.splice(1, 1);
    }

    form.getComVarList().then(data => {
      for (let i=0;i<data.length;i++){
        data[i].alias = "[" + data[i].alias + "]";
      }
      this.comVarList = data;
    });
  },
  methods: {
    afterSaveData(cb) {
      utils
        .validateForm(this, "filterForm")
        .then(r => {
          if (cb) {
            cb();
          }
        })
        .catch(items => {
          this.$message.warning(`还有内容尚未填写`);
        });
    },
    beforeClose() {
      this.dialogVisible = false;
    },
    handleOpen(isAdd) {
      this.dialogVisible = true;
      this.isAdd = isAdd;
      this.orgSelect = {
        id:"",
        name:""
      };
      this.$nextTick(() => {
        this.newMetafields = this.metafields.filter(function(item) {
          return item.isVirtual !== 1;
        });
        if (this.filterData.type) {
          this.data = { ...this.filterData };
        } else {
          this.data = {
            condition: [],
            name: "",
            key: "",
            type: "1",
            right: [{ type: "everyone", title: "所有人", checked: true }]
          };
          this.conditions = [];
          this.diySql = "";
        }
        if (this.data.type === "1") {
          this.conditions = this.data.condition;
        } else if (this.data.type === "2" || this.data.type === "3") {
          this.diySql = this.data.condition;
        } else if (this.data.type === "4") {
          let auth = JSON.parse(this.data.condition);
          for (let i = 0; i < this.authConditions.length - 1; i++) {
            for (let j = 0; j < auth.length; j++) {
              if (this.authConditions[i].type === auth[j].type) {
                this.authConditions[i].field = auth[j].field;
                this.authConditions[i].enabled = true;
              }
            }
          }
          for (let j = 0; j < auth.length; j++) {
            if (this.authConditions[3].type === auth[j].type) {
              this.authConditions[3].field = auth[j].field;
              for (let k = 0; k < auth[j].orgs.length; k++) {
                this.orgSelect.id += auth[j].orgs[k].id + ",";
                this.orgSelect.name += auth[j].orgs[k].name + ",";
              }
            }
          }
        }
      });
    },
    addRule(type, condition, event) {
      let con = {};
      if (type === "common") {
        con = {
          optType: "2",
          flowvarKey: "",
          judgeCon1: "1",
          judgeVal1: "",
          conDesc: "",
          ruleType: "1"
        };
      } else if (type === "combine") {
        con = {
          branch: true,
          sub: []
        };
      }
      con.compType = event;
      condition.push(con);
    },
    removeRule(conditions, index) {
      conditions.splice(index, 1);
    },
    save() {
      if (!this.data.name || !this.data.key) {
        this.$message.error("请填写名称与别名");
        return;
      }
      for (let i = 0; i < this.keys.length; i++) {
        if (this.keys[i].key === this.data.key && this.isAdd) {
          this.$message.error("别名已存在");
          return;
        }
      }
      if (this.data.key) {
        if (this.data.type === "1") {
          this.conditions = this.clearEmptyData(this.conditions);
          this.data.condition = this.conditions;
        } else if (this.data.type === "2" || this.data.type === "3") {
          this.data.condition = this.diySql;
        } else if (this.data.type === "4") {
          let orgSelectId = this.orgSelect.id.split(",");
          let orgSelectName = this.orgSelect.name.split(",");
          let auth = [];
          for (let i = 0; i < this.authConditions.length - 1; i++) {
            if (
              this.authConditions[i].enabled &&
              this.authConditions[i].field
            ) {
              auth.push({
                type: this.authConditions[i].type,
                name: this.authConditions[i].name,
                field: this.authConditions[i].field
              });
            }
          }
          if (orgSelectId.length > 0 && this.authConditions[3].field) {
            let orgs = [];
            for (let i = 0; i < orgSelectId.length; i++) {
              orgs.push({
                id: orgSelectId[i],
                name: orgSelectName[i]
              });
            }
            auth.push({
              type: this.authConditions[3].type,
              name: this.authConditions[3].name,
              field: this.authConditions[3].field,
              orgs: orgs
            });
          }
          this.data.condition = JSON.stringify(auth);
        }
        this.$emit("after-save", this.data);
        this.dialogVisible = false;
      } else {
        this.$message("请输入key");
      }
    },
    clearEmptyData(conditions) {
      if (conditions.length > 0) {
        for (let i = 0; i < conditions.length; i++) {
          if (conditions[i].branch) {
            conditions[i].sub = this.clearEmptyData(conditions[i].sub);
          } else {
            if (!conditions[i].flowvarKey) {
              conditions.splice(i, 1);
              i = i - 1;
            } else {
              conditions[i].conDesc =
                conditions[i].flowvarKey +
                " " +
                this.getJudgeConditionName(conditions[i].judgeCon1) +
                " " +
                conditions[i].judgeVal1;
            }
          }
        }
      }
      return conditions;
    },
    getJudgeConditionName(key) {
      for (let i = 0; i < this.judgeConditions.length; i++) {
        if (this.judgeConditions[i].key === key) {
          return this.judgeConditions[i].value;
        }
        return "";
      }
    },
    selectColumn(data) {
      this.diySql += data;
    }
  }
};
</script>

<style scoped>
</style>
