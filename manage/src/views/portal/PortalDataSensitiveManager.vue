<template>
  <div class="fullheight">
    <ht-table
      @load="loadData"
      :data="data"
      :pageResult="pageResult"
      :selection="true"
      quick-search-props="dataSourceAlias,tableName"
      :show-export="false"
      :show-custom-column="false"
      ref="htTable"
      @row-click="rowClick"
    >
      <template v-slot:toolbar>
        <el-button-group>
          <el-button size="small" @click="showDialog()" icon="el-icon-plus">添加</el-button>
          <ht-delete-button style="margin:0;" url="${portal}/portal/portalDataSensitive/v1/remove" :htTable="$refs.htTable">删除</ht-delete-button>
        </el-button-group>
      </template>
      <template>
        <ht-table-column type="index" width="50" align="center" label="序号" />
        <ht-table-column prop="tableName" label="表名" :sortable="true" :show-overflow-tooltip="true">
          <template v-slot="{row}">
            <el-link type="primary" @click="showDialog(row.id)" title="查看详情">{{row.tableName}}</el-link>
          </template>
        </ht-table-column>
        <ht-table-column prop="reulesRemark" label="脱敏规则说明" :sortable="true" :show-overflow-tooltip="true">
        </ht-table-column>
      </template>
    </ht-table>
    <el-dialog
      width="1240px"
      title="表字段脱敏处理"
      class="sp-manager__dialog"
      :visible="dialogVisible"
      :before-close="beforeCloseDialog"
      :close-on-click-modal="false"
    >
      <el-form v-form data-vv-scope="portalDataSensitiveForm">
        <ht-form-item label="表名">
          <template slot="label">
          <el-tooltip
            content="数据库表名,小写，如果是建模生成的实体则为w_ + 实体名称 如: w_userinfo"
          >
            <i class="property-tip icon-question" />
          </el-tooltip>
          <span>表名</span>
        </template>
          <ht-input v-model="portalDataSensitive.tableName" validate="required|alpha_dash" />
          <span style="color:red">注:表名为已经存在数据库中的表名，表名不存在配置无法生效</span>
        </ht-form-item>
        <ht-form-item label="脱敏规则">
          <el-table :data="portalDataSensitive.desensitizationRulesArr" style="width: 100%">
            <el-table-column prop="fieldName" label width="120">
              <template slot="header">
                <el-button
                  type="primary"
                  size="mini"
                  icon="el-icon-plus"
                  circle
                  @click="addField"
                  title="添加"
                ></el-button><span class="is-required">字段</span>
                <el-tooltip content="数据库表的字段,忽略大小写，如果是建模生成的则为F_ + 字段名称,如： F_mobile" placement="right">
                  <i class="icon-question" style="margin-right: 8px" />
                </el-tooltip>
              </template>
              <template slot-scope="scope">
                <ht-input
                  v-model="scope.row.fieldName"
                  autocomplete="off"
                  validate="required"
                  placeholder="字段"
                ></ht-input>
              </template>
            </el-table-column>
            <el-table-column prop="fieldName" label width="120">
              <template slot="header">
                <span class="is-required">掩码处理方式</span>
              </template>
              <template slot-scope="scope">
                <ht-select  v-model="scope.row.calType"
                  autocomplete="off"
                  validate="required"
                  :options="[{key:'1',value:'掩码规则'},{key:'2',value:'自定义'}]"
                  placeholder="请选择"></ht-select>
              </template>
            </el-table-column>
            <el-table-column prop="rules" label width="280" >
              <template slot="header">
                  <span class="is-required">掩码规则</span>
                <el-tooltip content="掩码规则,将该字段的开始位置到结束位置的根据填字符替换" placement="right">
                  <i class="icon-question" style="margin-right: 8px" />
                </el-tooltip>
              </template>
              <template slot-scope="scope">
                <el-form :inline="true" class="demo-form-inline" style="margin-top:13px"  v-show="scope.row.calType=='1'">
                  <el-form-item>
                    <el-tooltip content="掩码开始位置" placement="top">
                      <ht-input
                        type="number"
                        v-model="scope.row.rules.startPosition"
                        autocomplete="off"
                        :min=1
                        validate="required"
                        placeholder="开始位置"
                        ></ht-input>
                    </el-tooltip>
                  </el-form-item>
                  <el-form-item>
                    <el-tooltip content="掩码结束位置" placement="top">
                      <ht-input
                        type="number"
                        v-model="scope.row.rules.endPosition"
                        autocomplete="off"
                        :min=1
                        validate="required"
                        placeholder="结束位置"
                      ></ht-input>
                    </el-tooltip>
                  </el-form-item>
                  <el-form-item>
                    <el-tooltip content="掩码填充符" placement="top">
                      <ht-select  v-model="scope.row.rules.pad"
                        autocomplete="off"
                        :options="[{key:'*',value:'*'},{key:'_',value:'_'},{key:'.',value:'.'},{key:'#',value:'#'}]"
                        placeholder="填充字符默认为*" />
                    </el-tooltip>
                  </el-form-item>
                </el-form>
              </template>
            </el-table-column>
            <el-table-column prop="groovyScript" label width="auto">
              <template slot="header">
                  <span class="is-required">自定义脚本</span>
                <el-tooltip content="自定义脚本处理当前字段的掩码规则如：com.hotent.base.util.StringUtil.wordMask(F_sjhm, 1, 5, '#') F_sjhm为字段名" placement="right">
                  <i class="icon-question" style="margin-right: 8px" />
                </el-tooltip>
              </template>
              <template slot-scope="scope">
                <div v-show="scope.row.calType=='2'">
                  <ht-input type="textarea" v-model="scope.row.groovyScript" ></ht-input>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="rights" label width="auto">
              <template slot="header">
                  <span>白名单</span>
              </template>
              <template  v-slot="{ row, $index }">
                 <el-table :data="row.rights">
                  <el-table-column prop="title">
                    <template slot="header">
                      <el-button
                        type="primary"
                        size="mini"
                        icon="el-icon-plus"
                        @click="showAuthDialog(row.rights,$index)"
                        >选择</el-button
                      >
                    </template>
                  </el-table-column>
                  <el-table-column prop="name" label="授权给"></el-table-column>
                </el-table>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80">
              <template  v-slot="{ $index }">
                <el-button
                    type="danger"
                    icon="el-icon-delete"
                    circle
                    @click="portalDataSensitive.desensitizationRulesArr.remove(portalDataSensitive.desensitizationRulesArr[$index])"
                  ></el-button>
              </template>
            </el-table-column>

          </el-table>
        </ht-form-item>
        <ht-form-item label="脱敏说明">
          <ht-input type="textarea" v-model="portalDataSensitive.reulesRemark" validate="required" />
        </ht-form-item>
      </el-form>
      <div slot="footer" style="text-align: center">
<!--        <ht-submit-button-->
<!--          url="${portal}/portal/portalDataSensitive/v1/save"-->
<!--          :model="saveData"-->
<!--          scope-name="portalDataSensitiveForm"-->
<!--          :is-submit="isSubmit"-->
<!--          @before-save-data="beforeSaveData"-->
<!--          @after-save-data="afterSaveData"-->
<!--        >{{$t("eip.common.save")}}</ht-submit-button>-->
        <el-button @click="save" type="primary">{{$t("eip.common.save")}}</el-button>
        <el-button @click="beforeCloseDialog">{{$t("eip.common.cancel")}}</el-button>
      </div>
    </el-dialog>
    <!-- 选择对话框  -->
    <eip-auth-dialog
      ref="eipAuthDialog"
      name="eipAuthDialog"
      @onConfirm="dialogOnConfirm"
      append-to-body
    />
  </div>
</template>
<script>
const eipAuthDialog = () => import("@/components/dialog/EipAuthDialog.vue");
import deepmerge from "deepmerge";
export default {
  components: {
    eipAuthDialog
  },
  data() {
    return {
      dialogVisible: false,
      data: [],
      isSubmit:true,
      currentIndex:0,
      pageResult: {
        page: 1,
        pageSize: 50,
        total: 0
      },
      portalDataSensitive: {dataSourceAlias:"local",calType:"1",desensitizationRulesArr:[]},
      saveData:{}
    };
  },
  mounted() {
    this.$validator = this.$root.$validator;
  },
  methods: {
    rowClick(row, column, event){
      this.$refs.htTable.$refs.htTable.toggleRowSelection(row);
    },
    addField() {
      let obj = {
        "fieldName": "",
        "rules": {
          "pad": "*"
        },
        "groovyScript": "",
        "rights": []
      };
     
      this.$nextTick(()=>{
        this.portalDataSensitive.desensitizationRulesArr.push(obj);
      });
    },
    async beforeSaveData() {
      this.isSubmit = true;
      this.saveData = deepmerge({},  this.portalDataSensitive, {
        clone: true
      });
      this.saveData.desensitizationRulesArr.forEach(item=>{
        if(item.calType==2 && !item.groovyScript ){
          this.$message.warning("掩码方式为自定义时,脚本必填");
          this.isSubmit = false;
        }
        if(item.calType==1 && !item.rules.pad ){
          this.$message.warning("掩码方式为掩码规则时,填充符必填");
          this.isSubmit = false;
        }
        item.rights = JSON.stringify(item.rights);
        item.rules = JSON.stringify(item.rules);
        
      });
      this.saveData.desensitizationRules = JSON.stringify(this.saveData.desensitizationRulesArr);
    },
    showAuthDialog(rightsArr,currentIndex) {
      this.currentIndex = currentIndex;
      let conf = {
        right: [],
        permissionList: [
          { type: "everyone", title: "所有人" },
          { type: "user", title: "用户" },
          { type: "org", title: "组织" },
          { type: "pos", title: "岗位" },
          { type: "role", title: "角色" }
        ]
      };
      conf.right = rightsArr||[];
      this.$refs.eipAuthDialog.showDialog(conf);
    },
    dialogOnConfirm(data, name) {
      if (name == "eipAuthDialog") {
        this.portalDataSensitive.desensitizationRulesArr[this.currentIndex].rights = data;
      }
    },
    showDialog(id) {
      if (id) {
    	  this.$http.get("${portal}/portal/portalDataSensitive/v1/getJson?id="+`${id}`).then(resp => {
              this.portalDataSensitive = resp.data;
              this.portalDataSensitive.desensitizationRulesArr = JSON.parse(this.portalDataSensitive.desensitizationRules);
              this.portalDataSensitive.desensitizationRulesArr.forEach(element => {
                element.rules = JSON.parse(element.rules);
                element.rights = JSON.parse(element.rights);
              });
              this.dialogVisible = true;
          }, error => {
              reject(error);
          })
      } else {
        this.dialogVisible = true;
      }
    },
    beforeCloseDialog() {
      this.portalDataSensitive = {dataSourceAlias:"local",calType:"1",desensitizationRulesArr:[]};
      this.dialogVisible = false;
    },
    loadData(param, cb) {
    	this.$http.post("${portal}/portal/portalDataSensitive/v1/listJson", param).then(resp => {
            let response = resp.data;
            this.data = response.rows;
            this.pageResult = {
              page: response.page,
              pageSize: response.pageSize,
              total: response.total
            };
        }, error => {
            reject(error);
        }).finally(() => cb());
    },
    afterSaveData() {
      setTimeout(() => {
        this.beforeCloseDialog();
        this.$refs.htTable.load();
      }, 500);
    },
    save() {
      this.beforeSaveData();
      if (this.saveData.id) {
        this.$http.post(`${window.context.portal}/portal/portalDataSensitive/v1/save`, this.saveData).then(resp => {
          this.afterSaveData();
        })
      }else {
        this.$http.get(`${window.context.portal}/portal/portalDataSensitive/v1/getByTableName/${this.saveData.tableName}`).then(resp => {
          if (resp.data) {
            this.$confirm("已存在表为【"+this.saveData.tableName+"】的配置，是否覆盖？").then(() => {
              this.saveData.id = resp.data.id;
              this.$http.post(`${window.context.portal}/portal/portalDataSensitive/v1/save`, this.saveData).then(resp => {
                this.afterSaveData();
              })
            }).catch(() => {
              this.beforeCloseDialog();
            })
          }else {
            this.$http.post(`${window.context.portal}/portal/portalDataSensitive/v1/save`, this.saveData).then(resp => {
              this.afterSaveData();
            })
          }
        })
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.sp-manager__dialog /deep/ > .el-dialog > .el-dialog__body {
  height: calc(100% - 170px);
}
.sp-manager__dialog /deep/ .demo-form-inline .el-input-number--small{
  width: 86px;
}
.sp-manager__dialog /deep/ .demo-form-inline .el-input--small{
  width: 86px;
}
.sp-manager__dialog /deep/ .demo-form-inline .el-form-item{
  margin-right:0px;
} 

</style>
