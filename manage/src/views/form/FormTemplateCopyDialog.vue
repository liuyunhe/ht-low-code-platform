<template>
  <el-dialog
    width="50%"
    title="模板复制"
    :visible="dialogVisible"
    :before-close="handleClose"
    append-to-body
  >
    <el-form :model="newValue" data-vv-scope="templateForm">
      <el-row>
        <el-col :offset="2" :span="12">
          <span>旧模板</span>
        </el-col>
        <el-col :span="10">
          <span>新模板</span>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="10">
          <span>模板名字：</span
          ><ht-input disabled v-model="oldValue.templateName" />
        </el-col>
        <el-col :span="10" :offset="2">
          <el-input v-model="newValue.name" />
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="10">
          <span>模板别名：</span><ht-input disabled v-model="oldValue.alias" />
        </el-col>
        <el-col :span="10" :offset="2">
          <el-input
            v-model="newValue.alias"
            v-pinyin="newValue.name"
          />
        </el-col>
      </el-row>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="save()">保 存</el-button>
      <el-button @click="handleClose">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import form from "@/api/form.js";
export default {
  props: ["oldValue"],
  data() {
    return {
      dialogVisible: false,
      newValue: {
        id: "",
        name: "",
        alias: ""
      }
    };
  },
  methods: {
    handleOpen() {
      this.dialogVisible = true;
      this.newValue = {name:'',alias:""}
    },
    handleClose() {
      this.dialogVisible = false;
      this.$emit("loadData");
    },
    save() {
      if (this.newValue.alias == "" || this.newValue.name == "") {
        this.$message({ message: "请填写完整信息", type: "warning" });
        return;
      }
      form
        .copyTemplate(this.oldValue.id, this.newValue.name, this.newValue.alias)
        .then(resp => {
          if (resp.data.state) {
            this.$message({ message: resp.data.message, type: "success" });
            this.$emit("loadData");
            this.dialogVisible=false;
            this.newValue={};
          }
        });
    }
  }
};
</script>

<style scoped></style>
