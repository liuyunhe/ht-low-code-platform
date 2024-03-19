<template>
  <div class="fullheight">
    <el-dialog
      :title="title"
      width="70%"
      :visible.sync="dialogVisible"
      :before-close="beforeClose"
      :close-on-click-modal="false"
      :append-to-body="true"
      top="8vh">
      <el-container>
        <el-aside>
          <el-tree
            :data="treeData"
            :props="defaultProps"
            :load="loadTree"
            lazy
            @node-click="nodeClick"></el-tree>
        </el-aside>
        <el-main>
          <custom-dialog-show-detail
            v-if="detailVisible"
            ref="customDialogShowDetail"
            :alias="listAlias"
            :custom-dialog="list"
            @orgRowClick="orgRowClick"></custom-dialog-show-detail>
        </el-main>
      </el-container>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="save">确 定</el-button>
        <el-button @click="dialogVisible = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {Message} from "element-ui";

const customDialogShowDetail = () => import("@/views/form/customDialog/CustomDialogShowDetail.vue");
import form from "@/api/form.js";
import req from "@/request.js";
export default {
  components: {
    customDialogShowDetail,
  },
  props: {
    alias: String
  },
  name: "combine-dialog-show",
  data() {
    return {
      dialogVisible: false,
      detailVisible: false,
      title: "",
      list: {},
      listAlias: "",
      selections: [],
      combineConfig: {},
      treeData: [],
      defaultProps: {
        children: "children",
        label: "name",
      },
      treeList: [],
      displayField: {}
    }
  },
  methods: {
    orgRowClick(row) {
      this.selections = [row];
    },
    getByAlias(alias) {
      form.getCustomDialogByAlias(alias).then(data => {
        this.combineConfig = JSON.parse(data.combineConfig);
        this.title = data.name+"组合对话框";
        this.getTree(this.combineConfig.leftTree);
        this.listAlias = this.combineConfig.rightList;
        form.getCustomDialogByAlias(this.listAlias).then(data => {
          this.list = data;
          this.list.displayfield = JSON.parse(data.displayfield);
          for (let i = 0; i < data.displayfield.length; i++) {
            this.list.displayfield[i].field = data.displayfield[i].field.toLowerCase();
          }
          this.list.resultfield = JSON.parse(data.resultfield);
          this.list.sortfield = JSON.parse(data.sortfield);
          this.list.conditionfield = JSON.parse(data.conditionfield);
          this.detailVisible = true;
        });

      });
    },
    getTree(alias) {
      form.getCustomDialogByAlias(alias).then(data => {
        //判断数据来源是否是数据源，如果是数据源请求类型就为GET请求；如果数据来源是REST接口，请求类型就获取对话框配置的请求；
        let requestType = data.dsType == "dataSource" ? "GET":data.requestType ? data.requestType:"POST";
        //数据来源是数据源的URL
        let url = "${form}/form/customDialog/v1/getTreeData?alias=" + alias + "&mapParam=";
        let paramsObj = {};
        //数据来源是REST接口
        if (data.dsType != "dataSource") {
          url = data.url;
          //判断是否有条件字段
          if (data.conditionfield.length>0) {
            let conditions = data.conditionfield;//条件字段
            for (let i = 0; i < conditions.length; i++) {
              let con = conditions[i];
              //判断是否是POST请求
              if (requestType == "POST") {
                paramsObj[con.field] = con.defaultValue;
              } else {
                let ljChar = url.indexOf("?") == -1 ? "?" : "&";
                url = url + ljChar + con.field + "=" + con.defaultValue;
              }
            }
          }
        }
        let requestParams = {};
        requestParams.requestType = requestType;
        requestParams.url = url;
        requestParams.paramsObj = paramsObj;
        this.searchTree(requestParams, data);
      });
    },
    //树形查询
    searchTree(requestParams, tree) {
      const this_=this;
      let query = requestParams.requestType == 'POST'?req.post(requestParams.url,requestParams.paramsObj):req.get(requestParams.url);
      query.then(function (response) {
        //显示字段配置
        let displayfield = JSON.parse(tree.displayfield);
        this_.displayField = displayfield;
        //把对话框配置的显示字段显示名称赋值给树形的显示值
        this_.defaultProps.label = displayfield.displayName;
        this_.treeList = response.data;
        //得到要加载树的信息
        this_.treeData = this_.toTreeData(response.data,displayfield.id,displayfield.pid,displayfield.displayName, displayfield.pvalue ? displayfield.pvalue : 0);
      });
    },
    //加载树的信息
    toTreeData(data, id, pid, name, pvalue) {
      // 建立个树形结构,需要定义个最顶层的父节点，pvalue是0
      return this.translateDataToTree(data,pid,id,name,pvalue);
    },
    translateDataToTree(data,pid,id,name,pvalue) {
      //把树数据有子节点的数据全部过滤掉（只留父节点的数据）
      let parents = data.filter(value => value[id] == value[pid] || value[pid] == null || value[pid] == pvalue);
      if (!parents){
        parents = data.filter(value => value[pid] !== 'undefined' && value[pid] != null && value[id] != value[pid]);
      }
      return parents
    },
    loadTree(node, resolve){
      if (node){
        resolve(this.treeList.filter(value => value[this.displayField.pid] === node.data[this.displayField.id]));
      }else {
        resolve([])
      }
    },
    nodeClick(data) {
      let defaultQuery = [];
      for (let i=0;i<this.combineConfig.fields.length;i++) {
        let item = this.combineConfig.fields[i];
        defaultQuery.push({
          comment: item.value,
          value: data[item.field]
        });
      }
      this.$refs.customDialogShowDetail.load(defaultQuery);
    },
    showDialog() {
      this.dialogVisible = true;
    },
    beforeClose() {
      this.dialogVisible = false
    },
    save() {
      let elTable = this.$refs.customDialogShowDetail.$refs.htTable;
      if (elTable && elTable.$refs.htTable) {
        elTable = elTable.$refs.htTable;
      }
      //多选
      if (elTable && elTable.selection && elTable.selection.length == 0 && this.list.selectNum === -1) {
        Message.error("请至少选择一条数据");
        return;
      }
      //单选
      if (this.selections == 0 && this.list.selectNum === 1) {
        Message.error("请至少选择一条数据");
        return;
      }
      //拿到配置的返回字段
      let returnStr = this.list.resultfield;
      //返回字段的字段名有多少个
      let field = new Array([returnStr.length]);
      //返回字段的返回名称有多少个
      let comment = new Array([returnStr.length]);
      let str = [];
      for (let i = 0; i < returnStr.length; i++) {
        //得到返回字段的字段名
        field[i] =
                this.list.dsType == "dataSource"
                        ? returnStr[i].field
                        : returnStr[i].field;
        //得到返回字段的返回名称
        comment[i] =
                this.list.dsType == "dataSource"
                        ? returnStr[i].comment
                        : returnStr[i].comment;
      }
      let s = [];
      //获取选择的数据集合
      if (this.list.selectNum === 1) {
        s = this.selections;
      } else {
        s = elTable.selection;
      }
      this.$emit("return-all-data", s);
      //是否单选  1：单选；-1：多选
      if (this.list.selectNum === 1) {
        let temp = "";
        for (let i = 0; i < comment.length; i++) {
          temp += '"' + comment[i] + '":"' + s[0][field[i]] + '",';
        }
        //去除字符串最后一个字符逗号
        if (temp != "") {
          temp = "{" + temp.substring(0, temp.length - 1) + "}";
        }
        str.push(JSON.parse(temp));
      } else {
        for (let i = 0; i < s.length; i++) {
          let temp = "";
          for (let j = 0; j < comment.length; j++) {
            temp += '"' + comment[j] + '":"' + s[i][field[j]] + '",';
          }
          //去除字符串最后一个字符逗号
          if (temp != "") {
            temp = "{" + temp.substring(0, temp.length - 1) + "}";
          }
          str.push(JSON.parse(temp));
        }
      }
      //发布确认事件，并返回选中的数据
      this.$emit("handle-save", str);
      this.dialogVisible = false;
    }
  },
  watch: {
    alias: {
      handler(newVal, oldVal){
        if (newVal && newVal !== oldVal) {
          this.getByAlias(newVal);
        }
      },
      immediate: true
    }
  }
};
</script>

<style scoped></style>
