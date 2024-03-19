<template>
  <div>
    <el-dialog title="页签属性设置" :visible.sync="dialogVisible" width="30%" :append-to-body="true" :close-on-click-modal="false">
      <ht-form-item label="权限继承" label-width="100px" v-if="dialogVisible">
        <ht-select
          v-model="permission"
          :options="tablefields"
          :props="{ key: 'name', value: 'desc' }"
          filterable
          allow-create
          clearable
          @change="change"
        >
          <template slot-scope="{ options, propKey, propValue }">
            <el-option-group v-for="group in options" :key="group.name" :label="group.desc">
              <el-option
                v-for="item in group.children.filter(obj => {
                          return filterFields(obj);
                        })"
                :key="item[propKey]"
                :label="item[propValue]"
                :value="item[propKey]"
              ></el-option>
            </el-option-group>
          </template>
        </ht-select>
      </ht-form-item>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="confirm()">确 定</el-button>
        <el-button @click="dialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  name: "form-tabs-dialog",
  props: ["data", "tablefields"],
  data() {
    return {
      permission: "",
      dialogVisible: false,
      index: null,
      permissionPath: "",
    };
  },
  watch: {},
  created() {},
  methods: {
    confirm: function () {
      if (this.permission && this.permissionPath) {
        this.data.columns[this.index].permissionPath = this.permissionPath;
        this.data.columns[this.index].permission = this.permission;
      }else{
        this.data.columns[this.index].permissionPath = "";
        this.data.columns[this.index].permission = "";
      }
      this.$message({type:"success",message:"保存成功"});
      this.dialogVisible = false;
    },
    openDialog: function (index) {
      this.index = index;
      if (this.data.columns[index].permission) {
        this.permission = this.data.columns[index].permission;
        this.permissionPath = this.data.columns[index].permissionPath;
      }else{
         this.permission = "";
        this.permissionPath = "";
      }
      this.dialogVisible = true;
    },
    filterFields(obj) {
      if (obj.nodeType == "sub") {
        return false;
      } else {
        return true;
      }
    },
    change(value) {
      let selectObj = null;
      this.tablefields.forEach((boData) => {
        if (!selectObj) {
          selectObj = boData.children.find((opt) => opt.name === value);
          this.permissionPath = boData.name + "." + value;
        }
      });
    },
  },
};
</script>
