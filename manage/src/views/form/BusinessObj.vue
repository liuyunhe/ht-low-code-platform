<template>
  <el-container class="fullheight" style="border: 1px solid #eee">
    <ht-aside-tree cat-id="9" @node-click="handleNodeClick" @check="checkNode" />
    <el-main>
      <ht-table @load="loadTableData" :data="tableData" :pageResult="pageResult" :selection="true"
        quick-search-props="alias,description" :default-sorter="[{ direction: 'DESC', property: 'createTime' }]"
        ref="htTable" @select-all="tableSelect" @select="tableSelect" @row-click="rowClick" :show-export="false"
        :show-custom-column="false" class="dddd">
        <template v-slot:toolbar>
          <el-button-group>
            <el-button icon="el-icon-plus" size="small" @click="openBusinessObjDialog()">添加</el-button>
            <el-button @click="showDialog('entsType')">设置分类</el-button>
            <ht-delete-button style="margin: 0px" :url="formDeleteUrl" :htTable="$refs.htTable">删除</ht-delete-button>
          </el-button-group>
        </template>
        <template>
          <ht-table-column type="index" width="50" align="center" label="序号" />
          <ht-table-column label="描述" :sortable="true" prop="description" :show-overflow-tooltip="true">
            <template v-slot="scope">
              <el-link type="primary" @click="openBusinessObjDialog('edit',scope.row.id)">{{scope.row.description}}
              </el-link>
            </template>
          </ht-table-column>
          <ht-table-column width="150" prop="categoryName" label="所属分类" />
          <ht-table-column prop="alias" label="别名" />
          <ht-table-column prop="status" width="80" label="状态"
            :filters="[{text:'禁用', value:'forbidden'},{text:'启用', value:'normal'}]">
            <template slot-scope="scope">
              <span v-if="scope.row.status == 'forbidden'">
                <el-tag type="warning">禁用</el-tag>
              </span>
              <span v-if="scope.row.status == 'normal'">
                <el-tag type="success">启用</el-tag>
              </span>
            </template>
          </ht-table-column>
          <ht-table-column prop="deployed" width="100" label="是否已发布"
            :filters="[{text:'未发布', value:0},{text:'已发布', value:1}]">
            <template slot-scope="scope">
              <span v-if="scope.row.deployed == true">
                <el-tag type="info">已发布</el-tag>
              </span>
              <span v-if="scope.row.deployed == false">
                <el-tag type="warning">未发布</el-tag>
              </span>
            </template>
          </ht-table-column>
          <ht-table-column width="160" label="操作">
            <template v-slot="{ row }">
              <el-dropdown size="mini" split-button @command="showFormDialog"
                @click="showFormDialog({ row: row, command: 'bind' })">
                <span>
                  <i class="el-icon-paperclip"></i>绑定关系
                </span>
                <el-dropdown-menu slot="dropdown">
                  <!-- <el-dropdown-item
                    icon="el-icon-paperclip"
                    :command="{ row: row, command: 'bind' }"
                    >绑定关系</el-dropdown-item
                  >-->
                  <el-dropdown-item icon="el-icon-menu" :command="{ row: row, command: 'formation' }">数据结构
                  </el-dropdown-item>
                  <el-dropdown-item icon="el-icon-menu" v-if="row.deployed == 0"
                    :command="{ row: row, command: 'deployed' }">发布</el-dropdown-item>
                  <el-dropdown-item v-if="row.status == 'normal'" icon="el-icon-warning"
                    :command="{ row: row, command: 'normal' }">禁用</el-dropdown-item>
                  <el-dropdown-item v-else icon="el-icon-warning" :command="{ row: row, command: 'forbidden' }">启用
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </template>
          </ht-table-column>
        </template>
      </ht-table>
    </el-main>
    <!--数据结构-->
    <ht-sidebar-dialog width="20%" title="数据结构" :visible.sync="dialogVisible" :before-close="handleClose">
      <pre style="border: 1px solid #ccc;background-color: #f5f5f5; border-radius: 4px">{{ this.dataformation }}</pre>
    </ht-sidebar-dialog>

    <!--建模表单-->
    <business-obj-dialog @opretaId="opretaId" :clickTree="clickTree" :dataView="dataView" ref="objDialog"
      @loadTableData="handleNodeClick" :data="formData"></business-obj-dialog>

    <ht-sidebar-dialog width="28%" title="绑定关系" :visible.sync="dialogVisible2" :before-close="handleClose">
      <el-row>
        <el-col>
          实体对象：
          <span v-for="(item,index) in bindData.entData" :key="index">
            <el-tag style="margin-right: 5px;cursor: pointer;"
              @click="closeBindDialog;openBusinessObjDialog('edit', item.defId , item.id_)">{{item.name_}}</el-tag>
          </span>
        </el-col>
      </el-row>
      <br />
      <el-row>
        <el-col>
          PC表单：
          <span v-for="(item,index) in bindData.formData" :key="index">
            <el-tag style="margin-right: 5px;" v-if="item.form_type_ != 'mobile'">
              <router-link replace :to="{path:'form#formManager',query:{formId:item.id_,defId:item.def_id_}}">
                {{item.name_}}</router-link>
            </el-tag>
          </span>
        </el-col>
      </el-row>
      <br />
      <el-row>
        <el-col>
          手机表单：
          <span v-for="(item,index) in bindData.formData" :key="index">
            <el-tag style="margin-right: 5px;" v-if="item.form_type_ != 'pc'">
              <router-link replace :to="{path:'form#mobileFormManager',query:{formId:item.id_,defId:item.def_id_}}">
                {{item.name_}}</router-link>
            </el-tag>
          </span>
        </el-col>
      </el-row>
      <br />
      <el-row>
        <el-col>
          流程定义：
          <template v-if="bindData && bindData.bpmData">
            <div v-for="(item, index) in bindData.bpmData" :key="index" style="margin: 10px">
              <span>{{item.flowName}}</span>
              <span v-for="ship in item.ships" :key="ship.flowId">
                <el-tag type="danger" v-if="ship.main" class="m-l-5">
                  <router-link :to="{ path: 'flowDesign', query: { bpmId: ship.flowId } }">版本:{{ship.version}}(主版本)
                  </router-link>
                </el-tag>
                <el-tag v-else class="m-l-5">
                  <router-link :to="{ path: 'flowDesign', query: { bpmId: ship.flowId } }">版本:{{ship.version}}
                  </router-link>
                </el-tag>
              </span>
            </div>
          </template>
          <span v-if="bindData && bindData.bpmData && bindData.bpmData.length == 0">未绑定</span>
        </el-col>
      </el-row>
    </ht-sidebar-dialog>
    <eip-sys-type-dialog ref="entsType" name="entsType" :cat-id="'9'" @onConfirm="sysTypeDialogOnConfirm">
    </eip-sys-type-dialog>
    <form-template-dialog @onConfirm="confirmTemplate" formType="pc" ref="formTemplateDialog" />
  </el-container>
</template>

<script>
import form from "@/api/form.js";

const businessObjDialog = () => import("@/views/form/BusinessObjDialog.vue");
const htAsideTree = () => import("@/components/common/HtAsideTree.vue");
import FormTemplateDialog from "@/components/dialog/FormTemplateDialog.vue";
const eipSysTypeDialog = () =>
  import("@/components/dialog/EipSysTypeDialog.vue");
export default {
  components: {
    businessObjDialog,
    htAsideTree,
    eipSysTypeDialog,
    FormTemplateDialog,
  },
  data() {
    return {
      selectTypeIds: "",
      selectTypeName: "",
      currentRow: null, // 当前选中的数据行
      dataView: { id: "", type: "" },
      dialogVisible: false,
      dialogVisible2: false,
      tableData: [], //表格
      updateTableData: [], //修改分类数据
      deployedId: "",
      dataformation: "", //数据视图
      pageResult: {
        page: 1,
        pageSize: 20,
        total: 0,
      },
      bindData: "",
      clickTree: { id: "", name: "" },
      formData: {
        //表单
        alias: "",
        categoryId: "",
        categoryName: "",
        deployed: 0,
        description: "",
        dsName: "",
        isCreateTable: "",
        isExternal: "",
        status: "normal",
        supportDb: true,
        ents: [],
      },
    };
  },
  computed: {
    formDeleteUrl: function () {
      return `${window.context.form}/bo/def/v1/removes`;
    },
  },
  methods: {
    //鼠标选中行改变复选框
    rowClick(row, column, event) {
      this.$refs.htTable.$refs.htTable.toggleRowSelection(row);
    },
    //获取建模id
    opretaId(id) {
      this.openBusinessObjDialog("edit", id);
    },
    //关闭绑定关系
    closeBindDialog() {
      this.dialogVisible2 = false;
    },
    //表格选中数据
    tableSelect(selection) {
      this.updateTableData = selection;
    },
    //表格操作
    showFormDialog(param) {
      switch (param.command) {
        case "edit":
          this.openBusinessObjDialog("edit", param.row.id);
          break;
        case "deployed":
          this.deployedId = param.row.id;
          this.deploy(param.row);
          break;
        case "formation":
          this.getFormation(param);
          break;
        case "normal":
          this.updateStatus(param, "forbidden");
          break;
        case "forbidden":
          this.updateStatus(param, "normal");
          break;
        case "bind":
          this.openBind(param);
          break;
      }
    },
    openBind(param) {
      this.dialogVisible2 = true;
      this.getBingData(param);
    },
    //获取绑定数据
    getBingData(param) {
      form.getBindData(param.row.id, param.row.alias).then((resp) => {
        this.bindData = resp.data;
      });
    },
    //表单对话框
    openBusinessObjDialog(status, id, entId) {
      this.dataView.type = status;
      this.dataView.id = id;
      if (entId) {
        for (let i = 0; i < this.bindData.entData.length; i++) {
          if (entId == this.bindData.entData[i].id_) {
            this.dataView.entIndex = i;
            this.dialogVisible2 = false;
          }
        }
      }
      this.getFormData();
    },
    //数据视图对话框
    getFormation(param) {
      this.dialogVisible = true;
      form.getDataformation(param.row.alias, (data) => {
        this.dataformation = data.data;
      });
    },
    //关闭数据视图
    handleClose() {
      this.dialogVisible = false;
      this.dialogVisible2 = false;
      this.$refs.htTable.load();
      this.bindData = "";
    },
    //设置状态
    updateStatus(param, status) {
      form.updateBusinessObjStatus(param.row.id, status).then((resp) => {
        if (resp.data.state == true) {
          this.$message({ message: resp.data.message, type: "success" });
          this.loadTableData();
          return;
        }
        this.$message(resp.message);
      });
    },
    //通过分类树筛选数据
    handleNodeClick: function (data) {
      if (data && data.id != "9") {
        this.clickTree.id = data.id;
        this.clickTree.name = data.name;
        this.selectTypeName = data.name;
        this.$refs.htTable.quickSearch();
      } else {
        if(data){
          this.selectTypeName = data.name;
        }
        this.$refs.htTable.load();
      }
    },
    //加载列表
    loadTableData: function (param, cb) {
      let pageInfo = {
        pageBean: {
          page: 1,
          pageSize: 20,
          showTotal: true,
        },
        sorter: [{ direction: "DESC", property: "createTime" }],
      };
      if (this.selectTypeName && this.selectTypeName!="建模分类") {
        if (!param.querys) {
          param.querys = []
        }
        if (param.querys) {
          // 标记是否有选择分类
          let hasCategoryName = false;
          param.querys.forEach(query => {
            if (query.property == "categoryName") {
              hasCategoryName = true;
              query.value = this.selectTypeName;
            }
          })
          if (!hasCategoryName) {
            param.querys.push({
              property: "categoryName",
              value: this.selectTypeName,
              group: "main",
              operation: "EQUAL",
              relation: "AND",
            })
          }
        }
      }
      if (param == undefined) {
        form
          .getBusinessObjData(pageInfo)
          .then((resp) => {
            this.tableData = resp.rows;
            this.pageResult = {
              page: resp.page,
              pageSize: resp.pageSize,
              total: resp.total,
            };
          })
          .finally(() => cb && cb());
      } else {
        form
          .getBusinessObjData(param)
          .then((resp) => {
            this.tableData = resp.rows;
            this.pageResult = {
              page: resp.page,
              pageSize: resp.pageSize,
              total: resp.total,
            };
          })
          .finally(() => cb && cb());
      }
    },

    //表单对话框
    handleOpen() {
      this.$refs.objDialog.handleOpen();
    },
    //表单数据加载
    getFormData() {
      if (this.dataView.id) {
        form.getEntData(this.dataView.id, (resp) => {
          resp.data.ents.forEach((entData, index) => {
            if (entData.isExternal == "1" && index == 0) {
              entData.show = "主实体-外";
            } else if (entData.isExternal == "1") {
              entData.show = "子实体-外";
            }
            if (index === 0) {
              entData.isCheck = true;
            }
            if (entData.children) {
              entData.children.forEach((v) => {
                if (v.isExternal == "1") {
                  v.show = "孙实体-外";
                }
              });
            }
            for (let q = 0; q < entData.attributeList.length; q++) {
              if (entData.attributeList[q]) {
                if (entData.attributeList[q].isRequired == 0) {
                  entData.attributeList[q].isRequired = "0";
                } else {
                  entData.attributeList[q].isRequired = "1";
                }
              }
              for (let i = 0; i < entData.attributeList.length - 1 - q; i++) {
                if (
                  entData.attributeList[i].index >
                  entData.attributeList[i + 1].index
                ) {
                  let temp = entData.attributeList[i];
                  entData.attributeList[i] = entData.attributeList[i + 1];
                  entData.attributeList[i + 1] = temp;
                }
              }
            }
          });
          this.formData = resp.data;
          this.handleOpen();
        });
      }else{
        this.handleOpen();
      }
    },
    //发布
    deploy(row) {
      form.deploy(this.deployedId).then((resp) => {
        this.$confirm(resp.data.message + "，是否创建表单？", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
          .then(() => {
            this.currentRow = row;
            this.$refs.formTemplateDialog.showDialog(row.id);
            this.loadTableData();
          })
          .catch(() => {
            this.loadTableData();
          });
      });
    },
    //多选
    checkNode(data, checkObj) {
      this.selectTypeIds = checkObj.checkedKeys.join(",");
      let param = {
        pageBean: {
          page: 1,
          pageSize: 20,
          showTotal: true,
        },
        querys: [
          {
            property: "categoryId",
            value: this.selectTypeIds,
            group: "main",
            operation: "IN",
            relation: "AND",
          },
        ],
      };
      this.selectTypeName = "";
      this.loadTableData(param);
    },
    sysTypeDialogOnConfirm(data) {
      var id = [];
      for (let i = 0; i < this.updateTableData.length; i++) {
        id.push(this.updateTableData[i].id);
      }
      form.updateCategory(id, data.id, encodeURI(data.name)).then((resp) => {
        if (resp.data.state == true) {
          this.$message({ message: resp.data.message, type: "success" });
          this.dialogVisible = false;
          this.updateTableData = [];
          this.loadTableData();
          return;
        }
        this.$message.error(resp.data.message);
      });
    },

    showDialog(ref) {
      if (this.updateTableData.length == 0) {
        this.$message({
          message: "请先选择需要设置分类的数据",
          type: "warning",
        });
        return;
      }
      this.$refs[ref].showDialog({});
    },
    // 选择生成表单的模板
    confirmTemplate(templateModel) {
      const row = { ...this.currentRow };
      this.currentRow = null;
      let query = { bos: [row] };

      if (templateModel) {
        query.templateConf = templateModel;
      }

      this.$router.push({
        path: "/form#formManager",
        query: query,
      });
    },
  },

  mounted() {
    //业务表单-》查看绑定关系
    if (this.$route.query.id) {
      this.openBusinessObjDialog("edit", this.$route.query.id);
    }
  },
};
</script>

<style lang="scss" scoped>
.m-l-5 {
  margin-left: 5px;
}

@media (max-width: 1152px) {
  /deep/ .search-container__col {
    flex-wrap: wrap;
    .el-button-group {
      margin-top: 10px;
    }
  }
}
</style>
