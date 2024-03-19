<template>
  <div>
    <el-dialog
      title="表单授权"
      :visible.sync="dialogVisible"
      width="80%"
      appendToBody
      :close-on-click-modal="false"
      :before-close="handleClose"
      top="8vh"
      v-if="dialogVisible"
    >
      <el-container>
        <el-header style="padding: 0;height:30px">
          <el-button @click="getDefaultByFormKey()" style="margin-left: 10px;float:left">
            <el-tooltip content="将表单权限重置为初始化权限，点击确定按钮后生效。">
              <i class="btn-tip icon-question" />
            </el-tooltip>重置
          </el-button>
          <el-popconfirm
            title="确定清空吗？"
            @onConfirm="emptyAll"
            trigger="hover"
            style="margin-left: 10px;float:left"
          >
            <el-button type="danger" slot="reference">
              <el-tooltip content="该功能将直接清空表单的权限设置，请谨慎使用。">
                <i class="btn-tip icon-question" />
              </el-tooltip>清空
            </el-button>
          </el-popconfirm>
          <el-button @click="addNewField()" style="float:right;margin-right: 10px;">
            <el-tooltip content="该功能将获取新增字段，初始化新增字段的默认权限。">
              <i class="btn-tip icon-question" />
            </el-tooltip>新增字段权限
          </el-button>
        </el-header>
        <el-main style="padding: 10px;max-height: 500px;min-height: 200px;overflow:hidden;">
          <el-scrollbar class="scrollbar-fullheight" :wrapStyle="[{maxHeight:'500px'}]">
            <table
              class="table table-bordered form-auth__table"
              style="border-spacing: 0;width: 100%;max-height: 400px;overflow: initial;"
            >
              <thead>
                <tr>
                  <th width="15%" rowspan="2">字段</th>
                  <th width="20%" v-if="pageParams.type !='2' && pageParams.type != '5'" >只读权限</th>
                  <th width="80%" v-if="pageParams.type =='2' || pageParams.type == '5'" >只读权限</th>
                  <th width="20%" v-if="pageParams.type !='2' && pageParams.type != '5'" >编辑权限</th>
                  <th width="20%" v-if="pageParams.type !='2' && pageParams.type != '5'" >必填权限</th>
                  <th width="20%" v-if="pageParams.type !='2' && pageParams.type != '5'" >是否隐藏</th>
                </tr>
                <tr>
                  <td>
                    <el-button @click="clickAll('read','everyone')">所有人</el-button>
                    <el-button @click="clickAll('read','none')">无权限</el-button>
                  </td>
                  <td v-if="pageParams.type !='2' && pageParams.type != '5'">
                    <el-button @click="clickAll('write','everyone')">所有人</el-button>
                    <el-button @click="clickAll('write','none')">无权限</el-button>
                  </td>
                  <td v-if="pageParams.type !='2' && pageParams.type != '5'">
                    <el-button @click="clickAll('required','everyone')">所有人</el-button>
                    <el-button @click="clickAll('required','none')">无权限</el-button>
                  </td>
                  <td v-if="pageParams.type !='2' && pageParams.type != '5'">
                    <el-button @click="hideOrShowAll()">{{checkIsAllhide()?'隐藏':'显示'}}</el-button>
                  </td>
                </tr>
              </thead>
              <tbody v-for="table in subTableList" :key="table.tableName" class="filed_body">
                <tr>
                  <th colspan="5">
                    <span style="float: left;">
                      <span v-if="table.main">主表</span>
                      <span v-if="!table.main && table.ctrlType !='dataView'">{{table.grade == 'sub'?'子表':'孙表'}}</span>
                      <span v-if="!table.main && table.ctrlType =='dataView'">数据视图</span>
                      ——{{table.description}}
                    </span>

                    <span v-if="pageParams.type =='2'&&!table.main" class="sub-auth__span">
                      <el-checkbox v-model="table.rights.hidden">隐藏</el-checkbox>
                      <el-checkbox v-if="table.ctrlType =='dataView'" v-model="table.rights.export">导出</el-checkbox>
                    </span>

                    <span v-if="pageParams.type !='2'&&!table.main" class="sub-auth__span">
                      <el-checkbox v-model="table.rights.add">{{table.ctrlType !='dataView'?'添加':'添加/导入'}}</el-checkbox>
                      <el-checkbox v-if="table.ctrlType =='dataView'" v-model="table.rights.export">导出</el-checkbox>
                      <el-checkbox v-model="table.rights.del">删除</el-checkbox>
                      <el-checkbox v-if="table.ctrlType =='dataView'" v-model="table.rights.edit">编辑</el-checkbox>
                      <el-checkbox v-model="table.rights.hidden">隐藏</el-checkbox>
                      <el-checkbox v-if="table.ctrlType !='dataView'" v-model="table.rights.copy">复制</el-checkbox>
                      <el-checkbox v-if="table.ctrlType !='dataView'" v-model="table.rights.required">必填</el-checkbox>
                    </span>

                    <el-button v-if="table.grade == 'sub'" @click="openSunRowAuthDailog(table)" style="float:right;margin-right: 10px;">
                      <el-tooltip content="针对子表的整行数据进行编辑或只读的权限设置。">
                        <i class="btn-tip icon-question" />
                      </el-tooltip>行级权限控制
                    </el-button>
                  </th>
                </tr>
                <tr v-for="(field,index) in table.fields " :key="field.fieldName">
                  <td>
                    <span v-if="indexOf(field.description,'固定文本')">固定文本</span>
                    <span v-if="!indexOf(field.description,'固定文本')">{{field.description}}</span>
                  </td>
                  <td>
                    <label class="radioIn">
                      <input
                        type="radio"
                        :name="'read'+table.description+index"
                        value="everyone"
                        :checked="rightToDesc(field['read'])=='所有人'"
                        @click="selectField(field,'read','everyone')"
                      />所有人
                    </label>
                    <label class="radioIn">
                      <input
                        type="radio"
                        :name="'read'+table.description+index"
                        value="none"
                        :checked="rightToDesc(field['read'])=='无'"
                        @click="selectField(field,'read','none')"
                      />无
                    </label>
                    <label class="radioIn">
                      <input
                        type="radio"
                        :name="'read'+table.description+index"
                        value="none"
                        :checked="rightToDesc(field['read'])!='无'&&rightToDesc(field['read'])!='所有人'"
                        @click="fieldDialog(field,'read')"
                      />
                      <el-button size="mini" @click="fieldDialog(field,'read')">明细</el-button>
                    </label>
                  </td>
                  <td v-if="pageParams.type !='2' && pageParams.type != '5'">
                    <label class="radioIn">
                      <input
                        type="radio"
                        :name="'write'+table.description+index"
                        value="everyone"
                        :checked="rightToDesc(field['write'])=='所有人'"
                        @click="selectField(field,'write','everyone')"
                      />所有人
                    </label>
                    <label class="radioIn">
                      <input
                        type="radio"
                        :name="'write'+table.description+index"
                        value="none"
                        :checked="rightToDesc(field['write'])=='无'"
                        @click="selectField(field,'write','none')"
                      />无
                    </label>
                    <label class="radioIn">
                      <input
                        type="radio"
                        :name="'write'+table.description+index"
                        value="none"
                        :checked="rightToDesc(field['write'])!='无'&&rightToDesc(field['write'])!='所有人'"
                        @click="fieldDialog(field,'write')"
                      />
                      <el-button size="mini" @click="fieldDialog(field,'write')">明细</el-button>
                    </label>
                  </td>
                  <td v-if="pageParams.type !='2' && pageParams.type != '5'">
                    <label class="radioIn">
                      <input
                        type="radio"
                        :name="'required'+table.description+index"
                        value="everyone"
                        :checked="rightToDesc(field['required'])=='所有人'"
                        @click="selectField(field,'required','everyone')"
                      />所有人
                    </label>
                    <label class="radioIn">
                      <input
                        type="radio"
                        :name="'required'+table.description+index"
                        value="none"
                        :checked="rightToDesc(field['required'])=='无'"
                        @click="selectField(field,'required','none')"
                      />无
                    </label>
                    <label class="radioIn">
                      <input
                        type="radio"
                        :name="'required'+table.description+index"
                        value="none"
                        :checked="rightToDesc(field['required'])!='无'&&rightToDesc(field['required'])!='所有人'"
                        @click="fieldDialog(field,'required')"
                      />
                      <el-button size="mini" @click="fieldDialog(field,'required')">明细</el-button>
                    </label>
                  </td>
                  <td v-if="pageParams.type !='2' && pageParams.type != '5'">
                    {{checkIshide(field)}}
                    <el-button @click="hideColumn(field)">{{checkIshide(field) =='是'?'显示':'隐藏'}}</el-button>
                  </td>
                </tr>
              </tbody>
            </table>
          </el-scrollbar>
        </el-main>
      </el-container>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="saveAuth" size="medium">确 定</el-button>
        <el-button @click="handleClose()" size="medium">取 消</el-button>
      </span>
    </el-dialog>
    <eip-auth-dialog @onConfirm="filedAuthConfirm" ref="flowFormFiledAuth" />
    <flowFormSubRowAuth @onConfirm="filedAuthConfirm" ref="flowFormSubRowAuth" />
  </div>
</template>

<script>
import flow from "@/api/flow.js";
import req from "@/request.js";
import { mapState, mapActions } from "vuex";

const eipAuthDialog = () => import("@/components/dialog/EipAuthDialog.vue");
const flowFormSubRowAuth = () => import("@/components/flow/FlowFormSubRowAuth.vue");


export default {
  props: ["defId", "topDefKey"],
  components: { eipAuthDialog ,flowFormSubRowAuth},
  data() {
    return {
      dialogVisible: false,
      _oldPermission: {},
      subTableList: [],
      permissionList: [],
      pageParams: {},
      curAuthieldObj: {},
      subRowAuth:{},
      boTree:{}
    };
  },
  methods: {
    selectField: function(field, rightType, action) {
      let data = [{ checked: true, title: "无", type: "none" }];
      if (action == "everyone") {
        data = [{ checked: true, title: "所有人", type: "everyone" }];
      }
      field[rightType] = data;
      //当只读，编辑和必填是所有人时，将只读点击无时，自动将编辑和必填也设置为无
      if(rightType=='read' && action=='none'){
        field['write']=[{ checked: true, title: "无", type: "none" }];
        field['required']=[{ checked: true, title: "无", type: "none" }];
      }
      //当编辑和必填是所有人时，将编辑点击无时，自动将必填也设置为无
      if(rightType=='write' && action=='none'){
        field['required']=[{ checked: true, title: "无", type: "none" }];
      }
    },
    openSunRowAuthDailog(table){
      this.$refs.flowFormSubRowAuth.showDialog(this.subRowAuth,table,this.boTree);
    },
    showDialog: function(param) {
      this.dialogVisible = true;
      let this_ = this;
      this.pageParams = param;
      req
        .post(window.context.form + "/form/rights/v1/getPermission", param)
        .then(response => {
          let data = response.data;
          data.permissionList.push({ type: "none", title: "无" });
          this_._oldPermission = JSON.parse(JSON.stringify(data));
          this_.handleData(data);
          let permissionObj = {};
          for (var i = 0, p; (p = data.permissionList[i++]); ) {
            permissionObj[p.type] = p.title;
          }
          this_.permissionList = permissionObj;
        });
        req
        .get(window.context.form + "/form/form/v1/generateBoTreeData?formKey="+this.pageParams.formKey)
        .then(response => {
          let data = response.data;
          if (data && data.value) {
            this_.boTree = JSON.parse(data.value)
          }
        });
    },
    handleClose: function() {
      this._oldPermission = {};
      this.subTableList = [];
      this.permissionList = [];
      this.pageParams = {};
      this.curAuthieldObj = {};
      this.subRowAuth = {};
      this.boTree = {};
      this.dialogVisible = false;
    },
    addNewField: function() {
      let this_ = this;
      req
        .post(
          window.context.form +
            "/form/rights/v1/getDefaultByFormKey?type=1&formKey=" +
            this.pageParams.formKey,
          this.pageParams
        )
        .then(response => {
          let data = response.data;
          if (this_._oldPermission) {
            // 不存在的字段，添加进来
            this.deepMerge(data, this_._oldPermission);
          }
          this_.handleData(data);
        });
    },
    deepMerge: function(obj1, obj2) {
      var key;
      for (key in obj2) {
        // 如果target(也就是obj1[key])存在，且是对象的话再去调用deepMerge，否则就是obj1[key]里面没这个对象，需要与obj2[key]合并
        if (!obj2.hasOwnProperty(key)) continue;
        obj1[key] =
          obj1[key] && obj1[key].toString() === "[object Object]"
            ? this.deepMerge(obj1[key], obj2[key])
            : (obj1[key] = obj2[key]);
      }
      return obj1;
    },
    emptyAll: function() {
      let this_ = this;
      req
        .get(
          window.context.form +
            "/form/rights/v1/emptyAll?flowKey=" +
            this.pageParams.flowKey
        )
        .then(response => {
          let data = response.data;
          if (data.state) {
            this_.$message.success(data.message);
            this_.showDialog(this.pageParams);
          } else {
            this_.$message.fail(data.message);
          }
        });
    },
    getDefaultByFormKey: function() {
      let this_ = this;
      req
        .post(
          window.context.form +
            "/form/rights/v1/getDefaultByFormKey?type=1&formKey=" +
            this.pageParams.formKey,
          this.pageParams
        )
        .then(response => {
          let data = response.data;
          this_.handleData(data);
        });
    },
    hideOrShowAll: function() {
      if (this.checkIsAllhide()) {
        this.hiddenAll();
      } else {
        this.editAll();
      }
    },
    hiddenAll: function() {
      this.clickAll("read", "none");
      this.clickAll("write", "none");
      this.clickAll("required", "none");
    },
    editAll: function() {
      this.clickAll("read", "everyone");
      this.clickAll("write", "none");
      this.clickAll("required", "none");
    },
    /**
     * 批量权限选择 rightType：权限类型 只读-"read" 编辑-"write" 必填-"required"
     */
    clickAll: function(rightType, type) {
      for (let index = 0; index < this.subTableList.length; index++) {
        //子表
        if(!this.subTableList[index].main && this.subTableList[index].ctrlType!="dataView"){
          if(rightType == "write" && type == "none"){
            this.subTableList[index].rights.add = false;
            this.subTableList[index].rights.del = false;
          }else if(rightType == "write" && type == "everyone"){
            this.subTableList[index].rights.add = true;
            this.subTableList[index].rights.del = true;
          }
        }
        const fields = this.subTableList[index].fields;
        for (let j = 0, f; (f = fields[j++]); ) {
          f[rightType] = [{ type: type }];
          //当只读，编辑和必填是所有人时，将只读点击无时，自动将编辑和必填也设置为无
          if(rightType=='read' && type=='none'){
            f['write']=[{ checked: true, title: "无", type: "none" }];
            f['required']=[{ checked: true, title: "无", type: "none" }];
          }
          //当编辑和必填是所有人时，将编辑点击无时，自动将必填也设置为无
          if(rightType=='write' && type=='none'){
            f['required']=[{ checked: true, title: "无", type: "none" }];
          }
        }
      }
    },
    checkIsAllhide: function() {
      for (let index = 0; index < this.subTableList.length; index++) {
        const fields = this.subTableList[index].fields;
        if (fields && fields.constructor == Array) {
          for (var j = 0; j < fields.length; j++) {
            var file = fields[j];
            if (this.checkIshide(file) == "否") {
              return true;
            }
          }
        }
      }
      return false;
    },
    checkIshide: function(file) {
      let desc = "是";
      if (file && file.read && file.read.length > 0) {
        if (file.read[0].type != "none") {
          desc = "否";
          return desc;
        }
      }
      if (file && file.required && file.required.length > 0) {
        if (file.required[0].type != "none") {
          desc = "否";
          return desc;
        }
      }
      if (file && file.write && file.write.length > 0) {
        if (file.write[0].type != "none") {
          desc = "否";
          return desc;
        }
      }
      return desc;
    },
    hideColumn: function(field) {
      if (this.checkIshide(field) == "否") {
        field.read = [{ type: "none" }];
        field.required = [{ type: "none" }];
        field.write = [{ type: "none" }];
      } else {
        field.read = [{ type: "everyone" }];
        field.required = [{ type: "none" }];
        field.write = [{ type: "everyone" }];
      }
    },
    fieldDialog: function(field, rightType) {
      this.curAuthieldObj["f"] = field;
      this.curAuthieldObj["t"] = rightType;
      let tmp = JSON.parse(JSON.stringify(field[rightType]));
      let conf = {
        right: tmp,
        permissionList: this._oldPermission.permissionList
      };
      this.$refs.flowFormFiledAuth.showDialog(conf);
    },
    filedAuthConfirm: function(conf) {
      this.curAuthieldObj["f"][this.curAuthieldObj["t"]] = conf;
    },
    rightToDesc: function(right) {
      let desc = "";
      right.forEach(element => {
        if (desc) {
          desc += " 和 ";
        }
        let str = this.permissionList[element.type];
        if (element.name) {
          str += ":" + element.name;
        } else if (element.id) {
          str += ":" + element.id;
        }
        desc += str;
      });
      return desc;
    },
    indexOf: function(data, val) {
      if (data.indexOf(val) != -1) {
        return true;
      }
      return false;
    },
    saveAuth: function() {
      let param = JSON.parse(JSON.stringify(this.pageParams));
      // 提交前拼装回json
      param.permission = {};
      param.permission.table = {};
      var tmp = JSON.parse(JSON.stringify(this.subTableList));
      for (const iterator of tmp) {
        let _fields = {};
        for (const f of iterator.fields) {
          _fields[f.fieldName] = f;
        }
        iterator.fields = _fields;
        param.permission.table[iterator.tableName] = iterator;
      }
      //如果为实例情况，清除读写权限。
      if (param.type == "2") {
        this.handPermissionData(param.permission);
      }else{
        param.permission.subRowAuth = this.subRowAuth;
      }
      param.permission = JSON.stringify(param.permission);
      let this_ = this;
      req
        .post(window.context.form + "/form/rights/v1/save", param)
        .then(response => {
          let data = response.data;
          if (data.state) {
            this_.$message.success(data.message);
            this_.handleClose();
          } else {
            this_.$message.fail(data.message);
          }
        });
    },
    handPermissionData: function(json) {
      //param.permission
      let tableJson = json.table;
      //遍历表
      for (let key in tableJson) {
        //获取字段
        let fields = tableJson[key].fields;
        //遍历字段
        for (let fieleName in fields) {
          //字段信息
          let field = fields[fieleName];
          delete field.write;
          delete field.required;
        }
      }
      let opinions = json.opinion;
      if (!opinions) return;

      for (var key in opinions) {
        let opinion = opinions[key];
        delete opinion.write;
        delete opinion.required;
      }
    },
    handleData: function(data) {
      let tableSn = data.tableSn;
      data = data.json;
      this.subRowAuth = data.subRowAuth || {};
      this.subTableList = [];
      tableSn.forEach(obj => {
        let temp = data.table[obj.name_];
        if (temp) {
          temp.tableName = obj.name_;
          temp.grade = obj.grade_;
          let tempArr = [];
          for (let fieldName in temp.fields) {
            let fieldTemp = temp.fields[fieldName];
            fieldTemp.fieldName = fieldName;
            tempArr.push(fieldTemp);
          }
          tempArr.sort(function(a, b) {
            return a.sn - b.sn;
          });
          temp.fields = tempArr;
          this.subTableList.push(temp);
        }
      });
    }
  }
};
</script>

<style  scoped>
.radioIn {
  margin: 0px 5px 0px 5px;
}
div >>> .el-dialog__body {
  padding: 10px;
}

i.btn-tip {
  margin-right: 5px;
}

.form-auth__table th,
.form-auth__table td {
  border-top: 1px solid #e7eaec;
  border-left: 1px solid #e7eaec;
  line-height: 1.4em;
  padding: 8px;
  vertical-align: middle;
}

.form-auth__table > thead > tr > th,
.form-auth__table > tbody > tr > th {
  background: #fafafa;
}

.table {
  border-bottom: 1px solid #e7eaec;
  border-right: 1px solid #e7eaec;
}

.filed_body >>> .el-button {
  /* float: right; */
  padding: 4px 6px;
}

.sub-auth__span {
  float: left;
  margin-left: 20px;
}

.sub-auth__span >>> .el-checkbox__label {
  font-size: 12px;
}
</style>
