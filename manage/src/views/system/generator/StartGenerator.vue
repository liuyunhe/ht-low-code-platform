<template>
  <el-container style="outline: 1px solid #e7eaec;margin:1px;height: calc(100% - 2px)">
    <el-aside width="400px" class="fullheight" style="padding: 20px 0">
      <el-form data-vv-scope="codeGenForm" :model="codeModel" size="mini">
        <ht-form-item label="生成模式" label-width="150px">
          <ht-radio
            v-model="codeModel.type"
            style="margin-top: 4px;"
            :options="[{key: 'table', value: '物理表'}, {key: 'form', value: '表单'}]"
            :validate="'required'"
          />
        </ht-form-item>
        <ht-form-item v-if="codeModel.type=='table'" label="数据源" label-width="150px">
          <ht-select
            v-model="codeModel.dataSourceAlias"
            :options="dataSourcesInBean"
            :props="{key:'alias',value:'name'}"
            @change="dataSourceAliasChange"
            :validate="'required'"
          />
        </ht-form-item>
        <ht-form-item v-if="codeModel.type=='table'" label="选择表" label-width="150px">
          <ht-select
            v-model="codeModel.tableNameSingle"
            :options="tableList"
            :filterable="true"
            :validate="{ required: true }"
            @visible-change="getByDsObjectName"
            :props="{ key: 'name', value: 'comment' }"
          />
        </ht-form-item>
        <ht-form-item v-if="codeModel.type=='form'" label="选择表单" label-width="150px">
          <ht-input
            type="text"
            readonly="readonly"
            style="width: 202px"
            :validate="{ required: true }"
            placeholder="请选择表单"
            v-model="codeModel.formName"
          >
            <el-button slot="append" icon="el-icon-search" @click="selectForm"></el-button>
          </ht-input>
        </ht-form-item>
        <ht-form-item label="所在系统名" label-width="150px">
          <ht-input v-model="codeModel.system" :validate="{ required: true }" />
        </ht-form-item>
        <ht-form-item label="包路径" label-width="150px">
          <ht-input v-model="codeModel.basePackage" :validate="{ required: true }" />
        </ht-form-item>
        <ht-form-item label="作者名" label-width="150px">
          <ht-input v-model="codeModel.authorName" :validate="{ required: true }" />
        </ht-form-item>
        <ht-form-item label="模块名称" label-width="150px">
          <ht-input v-model="codeModel.moduleName" />
        </ht-form-item>
        <ht-form-item label="公司名称" label-width="150px">
          <ht-input v-model="codeModel.companyName" />
        </ht-form-item>
        <ht-form-item label="作者邮箱" label-width="150px">
          <ht-input v-model="codeModel.authorEmail" />
        </ht-form-item>
        <div style="text-align:center;margin-top:50px;">
          <ht-submit-button
            :url="saveUrl"
            :model="codeModel"
            scope-name="codeGenForm"
            @before-save-data="beforeSaveData"
            @after-response-value="afterSaveData"
          >开始生成</ht-submit-button>
        </div>
      </el-form>
    </el-aside>
    <el-container class="fullheight">
      <el-aside width="300px" style="outline: 1px solid #e7eaec;">
        <ht-tree
          :data="codeFolderData"
          :props="defaultProps"
          node-key="id"
          :default-expanded-keys="[5, 7, 22]"
        />
      </el-aside>
      <el-main class="fullheight">
        <el-card class="box-card">
          <div slot="header" class="header">
            <span>代码生成使用说明</span>
          </div>
          <ol class="guide-ol">
            <li>
              配置好相应的参数，点击
              <code>开始生成</code>按钮后代码会在服务端生成并打包为
              <code>ZIP文件</code>下载到你本地，这个
              <code>ZIP文件</code>解压后的结构如中间的
              <code>代码目录</code>所示；
            </li>
            <li>
              生成的代码目录中，将
              <code>src</code>目录拷贝到对应的Java项目中，并重新编译启动Java系统；
            </li>
            <li>
              将
              <code>web</code>目录中的
              <code>src</code>拷贝到相应的前端项目中，并在该前端项目的路由配置
              <code>route.js</code>中注册该页面；
            </li>
            <li>
              注册好路由的页面通过
              <code>菜单管理</code>添加为系统的菜单页面。
            </li>
          </ol>
          <div style="text-align:center;margin-top:20px">
            <el-tag type="warning">想了解更多代码开发的相关内容，请查看《系统开发手册》</el-tag>
          </div>
        </el-card>
      </el-main>
    </el-container>
    <!-- 表单选择器 -->
    <EipFormDialog
      ref="eipFormDialog"
      :single="true"
      @onConfirm="dialogFormConfirm"
      formType="pc"
      appendToBody
    />
  </el-container>
</template>
<script>
import req from "@/request.js";
import { mapState } from "vuex";
const EipFormDialog = () => import("@/components/dialog/EipFormDialog.vue");
import codeFolderData from "@/api/mock/code-folder-data.js";

export default {
  components: { EipFormDialog },
  data() {
    return {
      codeModel: {
        type: "table",
        dataSourceAlias: "LOCAL",
        system: "form",
        basePackage: "com.hotent.test",
        companyName: "开联信息技术有限公司"
      },
      dataSourcesInBean: [],
      tableList: null,
      defaultProps: {
        children: "children",
        label: "name"
      }
    };
  },
  computed: {
    ...mapState({
      currentUser: state => state.login.currentUser
    }),
    saveUrl: function() {
      return `${window.context.form}/form/generator/v1/start`;
    },
    codeFolderData: function() {
      return codeFolderData.getData();
    }
  },
  methods: {
    dataSourceAliasChange() {
      // 切换数据源时清空当前表集合
      this.$set(this, "tableList", null);
    },
    selectForm() {
      this.$refs.eipFormDialog.showDialog();
    },
    dialogFormConfirm(data) {
      if (data && data.length > 0) {
        this.$nextTick(() => {
          this.$set(this.codeModel, "formkey", data[0].formKey);
          this.$set(this.codeModel, "formName", data[0].name);
        });
      }
    },
    getByDsObjectName() {
      if (this.tableList != null) {
        return;
      }
      if (!this.codeModel.dataSourceAlias) {
        Message.warning("请选择数据源");
        return;
      }
      const params = {
        dsalias: this.codeModel.dataSourceAlias,
        isTable: "1"
      };
      let url = window.context.form + "/form/customQuery/v1/getByDsObjectName";
      req.post(url, params).then(data => {
        this.tableList = [];
        if (!data || data.data.length == 0) {
          Message.warning("该数据源中未查询到表");
          return;
        }
        for (let i = 0; i < data.data.length; i++) {
          data.data[i].comment =
            data.data[i].name + "(" + data.data[i].comment + ")";
          this.tableList.push(data.data[i]);
        }
      });
    },
    beforeSaveData() {
      if (this.codeModel.tableNameSingle) {
        this.$set(this.codeModel, "tableName", [
          this.codeModel.tableNameSingle
        ]);
      }
    },
    afterSaveData(data) {
      if (data) {
        const url = `${window.context.form}/form/generator/v1/download?codeFolder=${data}`;
        req.download(url);
      } else {
        this.$message.error("未返回生成的代码目录，无法下载生成的代码");
      }
    }
  },
  mounted() {
    //获取数据源池
    req
      .get(window.context.portal + "/sys/sysDataSource/v1/getDataSources")
      .then(data => {
        this.dataSourcesInBean = data.data;
      });
    if (this.currentUser) {
      this.$set(this.codeModel, "authorName", this.currentUser.username);
    }
  }
};
</script>
<style lang="scss" scoped>
.header > span {
  font-size: 16px;
  font-weight: bold;
  color: #666;
}
</style>
