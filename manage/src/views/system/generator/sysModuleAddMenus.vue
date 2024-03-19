<template>
  <el-dialog
    title="添加到菜单"
    :visible.sync="dialogVisible"
    width="45%"
    appendToBody
    :close-on-click-modal="false"
    :before-close="handleClose"
  >
    <el-form v-model="menu" data-vv-scope="TemplateMenuForm">
      <ht-form-item label="菜单类型" prop="alias" label-width="180px">
        <el-radio v-model="type" label="manage" :validate="{ required: true }"
          >后端菜单</el-radio
        >
        <el-radio v-model="type" label="front" :validate="{ required: true }"
          >前端菜单</el-radio
        >
        <el-radio v-model="type" label="app" :validate="{ required: true }" @change="change">PC模块</el-radio>
      </ht-form-item>
      <ht-form-item label-width="180px" prop="parentMenu" v-if="type!=='app'">
        <template slot="label">
          <span>父节点</span>
        </template>
        <Treeselect
          v-model="menu.parentMenuName"
          :normalizer="normalizer"
          @select="handleNodeClick"
          :multiple="false"
          :options="menuTreeData"
          noOptionsText=" "
          noChildrenText=" "
          placeholder="请选择父节点"
          style="width:80%;"
        />
      </ht-form-item>
      <ht-form-item label="Url地址" prop="alias" label-width="180px">
        <ht-input v-model="menu.href" disabled></ht-input>
      </ht-form-item>

      <ht-form-item :label="type==='app'?'应用名称':'菜单名称'" prop="name" label-width="180px">
        <ht-input v-model="menu.name" :validate="{ required: true }"></ht-input>
      </ht-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="onConfirm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </span>
  </el-dialog>
</template>
<script>
import portal from "@/api/portal.js";
import { mapState } from "vuex";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
export default {
  name: "template-add-to-menu",
  props: ["alias","moduleName"],
  components: { Treeselect },
  data() {
    return {
      id: "",
      menu: {},
      type: "manage",
      manageAliasPre: "templateMenu/",
      frontAliasPre: "template/preview/",
      menuTreeData: [],
      dialogVisible: false,
      normalizer(node) {
        return {
          id: node.id,
          label: node.name,
          children: node.children,
          isDefaultExpanded: false
        };
      },
      from: "",
      sysModule: {}
    };
  },
  computed: {
    ...mapState({
      currentUser: state => state.login.currentUser
    })
  },
  watch: {
    type: {
      handler(newVal, oldVal) {
        if (!newVal) {
          return;
        }
        if (newVal != oldVal) {
          this.getMenuDataByType();
        }
      }
    }
  },
  created() {
    this.$validator = this.$root.$validator;
  },
  methods: {
    onConfirm() {
      if (!this.menu.parentAlias && this.type!=='app') {
        this.$message.error("请选择父节点！");
        return;
      }
      const this_ = this;
      this_.$validator.validateAll("TemplateMenuForm").then(result => {
        if (result) {
          if (this.type==='app'){
            let contentStr = JSON.stringify({id: this.sysModule.id, name: this.sysModule.name});
            let app = {
              name: this_.menu.name,
              type: 7,
              sn: 0,
              content: contentStr,
              icon: 'icon-hotent-H',
              iconColor: ""
            }
            portal.saveApp(app).then(data => {
              if (data.state){
                this_.$emit("close-dialog");
                this_.dialogVisible = false;
                this.$message.success(data.message);
              }
            });
          }else{
            let menu = { ...this_.menu };
            delete menu.parentMenuName;
            portal.saveDataTemplateToMenu(menu).then(rep => {
              if (rep.state) {
                this_.$emit("close-dialog");
                this_.dialogVisible = false;
                this.$message.success(rep.message);
              }
            });
          }
        } else {
          let arr = this_.$validator.errors.items.filter(
            item => item.scope == "TemplateMenuForm"
          );
          let errorLength = arr.length;
          this_.$message({
            showClose: true,
            message: `有${errorLength}个字段未通过校验，请正确填写表单内容。`,
            type: "warning"
          });
        }
      });
    },
    handleClose() {
      this.dialogVisible = false;
    },
    getMenuDataByType() {
      let menuAlias = this.type == "front" ? "front_menu" : "manage_menu";
      portal.getCurrentMenuByAlias(menuAlias).then(rep => {
        if (rep.state && rep.value.length > 0) {
          let menus = rep.value.filter(item => {
            if (item.alias !== 'appCenterFront') {
              return true;
            }
            return false;
          });
          this.removeEmptyChildren(menus);
          if(this.type != "front"){
            //添加为后端菜单时如果二级菜单不是URL菜单则模块开发生成的菜单不能添加到这个菜单下面
            //如：设计中心->业务表单  设计中心下的业务表单菜单是下级菜单不是URL菜单则模块开发生成的菜单不能添加到这个菜单下面
            for(let i =0;i<menus.length;i++){
              if(menus[i].children){
                for(let j=menus[i].children.length-1;j>=0;j--){
                  if(menus[i].children[j].alias.indexOf("href/template")==-1){
                    menus[i].children.splice(j,1);
                  }
                }
              }
            }
          }
          this.menuTreeData = menus;
        }
      });
    },
    removeEmptyChildren(menus) {
      menus.forEach(m => {
        if (m.children) {
          if (m.children.length < 1) {
            delete m.children;
          } else {
            //不允许选择4级菜单
            if(m.path.split(".").length==6){
              delete m.children;
            }else{
              this.removeEmptyChildren(m.children);
            }
          }
        }
      });
    },
    handleNodeClick(node) {
      let menuAlias = "";
      const key =
        Date.parse(new Date()) + "_" + Math.ceil(Math.random() * 99999);
      menuAlias = "href/template/" + key;
      //后台外部菜单URL地址
      this.menu.href = window.context.front + "/sysModulePreview/" + this.id+ "/" + this.moduleName;
      let this_ = this;
      portal.isMenuExist(this.menu.alias).then(rep => {
        if (rep.state) {
          this_.menu.menuId = node.id;
          if (rep.value) {
            this_.$message.error("菜单别名：" + menuAlias + "已存在！");
            this_.menu.alias = "";
            this_.$forceUpdate();
          } else {
            this_.menu.alias = menuAlias;
            this_.menu.parentAlias = node.alias;
            this_.$forceUpdate();
          }
        } else {
          this_.$message.error("菜单别名校验失败！");
        }
      });
    },
    showDialog(id) {
      this.menu={};
      this.id = id;
      portal.getSysModuleById(id).then(data => {
        this.sysModule = data;
      });
      this.getMenuDataByType();
      this.dialogVisible = true;
    },
    change(data){
      this.$set(this.menu,"href",window.context.front + "/sysModulePreview/" + this.id)
    }
  }
};
</script>
<style scoped>
form >>> .inputs {
  width: 80%;
}
</style>
