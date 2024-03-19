<template>
  <div>
    <el-dialog
      title="授权页面"
      :visible.sync="dialogVisible"
      width="70%"
      appendToBody
      :close-on-click-modal="false"
      destory-on-close
      top="8vh"
      v-if="dialogVisible"
    >
      <el-container>
        <el-main style="padding: 10px;height: 530px">
          <form v-form>
            <table
              class="table table-bordered"
              style="border-spacing: 0;width: 100%;max-height: 400px;overflow: initial;"
            >
              <thead>
                <th style="width:15%">权限类型</th>
                <th>内容</th>
                <th style="width:15%">操作</th>
              </thead>
              <tbody>
                <tr v-for="item in noNeedSetArr" :key="item.title">
                  <th>{{item.title}}</th>
                  <td></td>
                  <td>
                    <el-checkbox @change="checkNoSetting(item)" v-model="item.checked"></el-checkbox>
                  </td>
                </tr>
                <tr
                  v-for="(item,$index) in needSetArr"
                  :key="item.title"
                  v-show="showNeedRight && showSelectors[item.type] && item.title!='脚本'"
                  :data-index="$index"
                  data-subname="needSetArr"
                >
                  <th>{{item.title}}</th>
                  <td>
                    <eip-user-selector
                      v-if="item.type=='user'"
                      :appendToBody="true"
                      v-model="item.name"
                      :config="{id:'item.id'}"
                      :key="selectorKey"
                    />
                    <eipRoleSelector
                      v-if="item.type=='role'"
                      :appendToBody="true"
                      v-model="item.name"
                      :config="{id:'item.id'}"
                      :key="selectorKey"
                    />
                    <eipOrgSelector
                      v-if="item.type=='org'"
                      :appendToBody="true"
                      v-model="item.name"
                      :config="{id:'item.id'}"
                      :key="selectorKey"
                    />
                    <eipPostSelector
                      v-if="item.type=='pos'"
                      :appendToBody="true"
                      v-model="item.name"
                      :config="{id:'item.id'}"
                      :key="selectorKey"
                    />
                  </td>
                  <td>
                    <el-button @click="updateNeedSetArr($index)">重置</el-button>
                  </td>
                </tr>
              </tbody>
            </table>
          </form>
        </el-main>
      </el-container>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleClose" size="medium">确 定</el-button>
        <el-button @click="dialogVisible = false" size="medium">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
    import deepmerge from 'deepmerge';

    const eipUserSelector = () =>
  import("@/components/selector/EipUserSelector.vue");
const eipRoleSelector = () =>
  import("@/components/selector/EipRoleSelector.vue");
const eipOrgSelector = () => import("@/components/selector/EipOrgSelector.vue");
const eipPostSelector = () =>
  import("@/components/selector/EipPostSelector.vue");

export default {
  components: {
    eipUserSelector,
    eipRoleSelector,
    eipOrgSelector,
    eipPostSelector
  },
  props: { name },
  data() {
    return {
      dialogVisible: false,
      showSelectors:{
        user: false,
        org: false,
        pos: false,
        role: false
      },
      needSetArr: [
        {
          type: "user",
          title: "用户",
          id: "",
          name: ""
        },
        {
          type: "org",
          title: "组织",
          id: "",
          name: ""
        },
        {
          type: "pos",
          title: "岗位",
          id: "",
          name: ""
        },
        {
          type: "role",
          title: "角色",
          id: "",
          name: ""
        }
      ],
      noNeedSetArr: [],
      right: "",
      permissionList: [],
      showNeedRight: true,
      curSelectItem: {},
      autoClose: true,
      selectorKey: 1
    };
  },
  methods: {
    showDialog: function(param_) {
      //重新初始化全部的 data数据
	  Object.assign(this.$data, this.$options.data());
      let param = deepmerge({},param_, { clone: true })
      if (param.autoClose === false) {
        this.autoClose = false;
      }
      
      this.showNeedRight = true;
      this.right = "";
      if(param.right){
        this.right = deepmerge({},param.right, { clone: true })
      }
      this.permissionList = param.permissionList || [];
      let needSetting = [];
      //不需要配置
      let noNeedSetting = [];
      for (var i = 0; i < this.permissionList.length; i++) {
        var obj = this.permissionList[i];
        var type = obj.type;
        var objRight = this.getRight(this.right, type);
        if (objRight) {
          objRight.title = obj.title;
          if (objRight.type == "everyone" || objRight.type == "none") {
            objRight.checked = true;
            this.showNeedRight = false;
            noNeedSetting.push(objRight);
          } else {
            Object.assign(this.getRight(this.needSetArr, type),objRight)
            needSetting.push(objRight);
            this.showSelectors[objRight.type] = true;
          }
        } else {
          if (obj.type == "everyone" || obj.type == "none") {
            obj.checked = false;
            noNeedSetting.push(obj);
          } else {
            obj.id = "";
            obj.name = "";
            needSetting.push(JSON.parse(JSON.stringify(obj)));
            this.showSelectors[obj.type] = true;
          }
        }
      }
      // 不能这样赋值  会导致选择器 编辑情况无法删除已选数据
      //2020-02-19 去掉会导致新增的时候再次打开之前选中的未被清空，先还原
      let otherAuth = {
        checked: false,
        title: "其他",
        type: "otherAuth"
      };
      let set = noNeedSetting.filter(v =>{
        return v.checked
      })
      if(set.length == 0){
        otherAuth.checked = true;
      }
      this.needSetArr = needSetting;
      this.noNeedSetArr = noNeedSetting;
      this.noNeedSetArr.push(otherAuth);
      this.dialogVisible = true;
    },
    getRight: function(aryRights, type) {
      if (!this.right || this.right.size == 0) return null;
      for (var i = 0; i < aryRights.length; i++) {
        var obj = aryRights[i];
        if (obj.type == type) {
          return obj;
        }
      }
      return null;
    },
    closeDialog: function() {
      this.dialogVisible = false;
    },
    handleClose: function() {
      let rtn = [];
      let isOtherAuth = false;
      for (let i = 0; i < this.noNeedSetArr.length; i++) {
        let obj = this.noNeedSetArr[i];
        if (obj.checked && obj.type != "otherAuth") {
          rtn.push(obj);
          this.$emit("onConfirm", rtn, this.name);
          this.dialogVisible = false;
          return rtn;
        }
        if(obj.checked && obj.type == "otherAuth"){
          isOtherAuth = true;
        }
      }
      let setting = this.needSetArr;
      for (let i = 0; i < setting.length; i++) {
        let obj = setting[i];
        //设置了值。
        if (obj.id) {
          rtn.push(obj);
        }
      }
      if(isOtherAuth && rtn.length < 1){
        this.$message({type: "warning", message: "请添加具体权限信息！"});
        return false;
      }
      this.$emit("onConfirm", rtn, this.name);
      if (this.autoClose) {
        this.dialogVisible = false;
      }
    },
    checkNoSetting: function(item) {
      var noNeedChecked = false;
      for (var i = 0; i < this.noNeedSetArr.length; i++) {
        var obj = this.noNeedSetArr[i];
        if (item.checked) {
          if (obj != item) {
            obj.checked = false;
          }
          if(item.type == 'otherAuth'){
            noNeedChecked = true;
          }
        }
      }
      this.showNeedRight = noNeedChecked;
      this.$forceUpdate();
    },
    updateNeedSetArr(index){
      this.needSetArr[index].id = "";
      this.needSetArr[index].name = "";
      ++this.selectorKey;
    }
  }
};
</script>

<style  scoped>
div >>> .el-dialog__body {
  padding: 10px;
}

.table > thead > tr > th,
.table > thead > th,
.table > tbody > tr > th,
.table > tfoot > tr > th,
.table > thead > tr > td,
.table > tbody > tr > td,
.table > tfoot > tr > td {
  border-top: 1px solid #e7eaec;
  border-left: 1px solid #e7eaec;
  line-height: 1.42857;
  padding: 8px;
  vertical-align: middle;
}
.table {
  border-bottom: 1px solid #e7eaec;
  border-right: 1px solid #e7eaec;
}
.filed_body >>> .el-button {
  float: right;
}
</style>
