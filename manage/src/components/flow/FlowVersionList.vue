<template>
  <div style="height:calc(100% - 20px);margin:10px;">
    <ht-table
      @load="loadData"
      :data="versionList"
      :selectable="false"
      :pageResult="pageResult"
      :nopagination="false"
      :show-export="false"
      :show-custom-column="false"
      ref="htTable"
    >
      <ht-table-column type="index" width="50" align="center" label="序号" />
      <ht-table-column prop="name" align="center" :show-overflow-tooltip="true" label="流程名称" />
      <ht-table-column prop="defKey" width="200" align="center" label="流程key" />
      <ht-table-column
        prop="status"
        label="流程状态"
        width="120"
        :filters="[{text:'已发布', value:'deploy'},{text:'未发布', value:'draft'},{text:'禁用', value:'forbidden'},{text:'禁止实例', value:'forbidden_instance'}]"
      >
        <template v-slot="{row}">
          <el-tag type="success" v-if="row.status=='deploy'">已发布</el-tag>
          <el-tag type="info" v-if="row.status=='draft'">未发布</el-tag>
          <el-tag type="danger" v-if="row.status=='forbidden'">禁用</el-tag>
          <el-tag type="warning" v-if="row.status=='forbidden_instance'">禁止实例</el-tag>
        </template>
      </ht-table-column>
      <ht-table-column prop="version" width="80" align="center" label="版本号" />
      <ht-table-column
        prop="isMain"
        label="是否主版本"
        width="150"
        :filters="[{text:'主版本', value:'Y'},{text:'非主版本', value:'N'}]"
      >
        <template v-slot="{row}">
          <el-tag type="success" v-if="row.isMain=='Y'">主版本</el-tag>
          <el-tag type="info" v-if="row.isMain=='N'">非主版本</el-tag>
        </template>
      </ht-table-column>
      <ht-table-column width="300" label="操作" align="left">
        <template v-slot="{row}">
          <el-button size="mini" icon="el-icon-edit" @click="hisVersionDefDetail(row.id)">明细</el-button>
          <el-button
            size="mini"
            v-if="row.isMain=='N'"
            icon="el-icon-setting"
            @click="switchMainVersion(row.id)"
          >设为主版本</el-button>
          <el-button
            size="mini"
            type="danger"
            v-if="row.isMain=='N'"
            icon="el-icon-delete"
            @click="remove(row.id)"
          >删除</el-button>
        </template>
      </ht-table-column>
    </ht-table>
    <el-dialog
      title="版本明细"
      :visible.sync="dialogDetailVisible"
      append-to-body
      :before-close="close"
      class="urgent-text"
      :close-on-click-modal="false"
    >
      <el-form :model="data" data-vv-scope="settingSave">
        <table class="form-table" cellspacing="0" cellpadding="0" border="0">
          <tbody>
            <tr>
              <th width="160px">流程名称:</th>
              <td>{{data.name}}</td>
              <th width="160px">流程业务主键:</th>
              <td>{{data.defKey}}</td>
            </tr>
            <tr>
              <th width="160px">流程描述:</th>
              <td>{{data.desc}}</td>
              <th width="160px">创建时间:</th>
              <td>{{data.createTime}}</td>
            </tr>
            <tr>
              <th width="160px">流程状态:</th>
              <td>
                <span v-if="data.status=='draft'">草稿</span>
                <span v-if="data.status=='deploy'">发布</span>
                <span v-if="data.status=='forbidden'">禁用</span>
                <span v-if="data.status=='forbidden_instance'">禁止实例</span>
              </td>
              <th width="160px">更新时间:</th>
              <td>{{data.updateTime}}</td>
            </tr>
            <tr>
              <th width="160px">版本 - 是否主版本:</th>
              <td>
                <span v-if="data.isMain=='Y'">是</span>
                <span v-if="data.isMain=='N'">否</span>
              </td>
              <th width="160px">测试状态:</th>
              <td>
                <span v-if="data.testStatus=='run'">正式</span>
                <span v-if="data.testStatus=='test'">测试</span>
              </td>
            </tr>
            <tr>
              <th width="160px">版本 - 当前版本号:</th>
              <td>{{data.version}}</td>
              <th width="160px">版本 - 主版本流程ID:</th>
              <td>{{data.mainDefId}}</td>
            </tr>
            <tr>
              <th width="160px">版本 - 变更理由:</th>
              <td>{{data.reason}}</td>
              <th width="160px">流程定义ID:</th>
              <td>{{data.defId}}</td>
            </tr>
          </tbody>
        </table>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { Message } from "element-ui";
import req from "@/request.js";
export default {
  name: "FlowVersionList",
  props: {
    defId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      data: {}, //版本明细信息
      dialogDetailVisible: false, //是否显版本明细
      versionList: [], //列表数据
      pageResult: {
        page: 1,
        pageSize: 20,
        total: 0
      }
    };
  },
  methods: {
    //设为主版本
    switchMainVersion(id) {
      const this_ = this;
      req
        .get("${bpmModel}/flow/def/v1/switchMainVersion?defId=" + id)
        .then(rep => {
          rep = rep.data;
          if (rep.state) {
            if (rep.message) {
              Message.success(rep.message);
              this_.$refs.htTable.load(); //重新加载列表数据
            }
          } else {
            Message.error(rep.message);
          }
        });
    },
    //查看明细
    hisVersionDefDetail(id) {
      const this_ = this;
      req.get("${bpmModel}/flow/def/v1/defGet?defId=" + id).then(rep => {
        this_.data = rep.data;
        this_.dialogDetailVisible = true;
      });
    },
    //删除版本管理
    remove(id) {
      const this_ = this;
      let url =
        "${bpmModel}/flow/def/v1/removeByDefIds?ids=" + id + "&isVersion=true";
      this_
        .$confirm("是否确认删除？", "提示", {
          cancelButtonText: "取消",
          confirmButtonText: "确定",
          type: "warning",
          closeOnClickModal: false
        })
        .then(() => {
          req.remove(url).then(function(rep) {
            rep = rep.data;
            if (rep.state) {
              if (rep.message) {
                Message.success(rep.message);
                this_.$refs.htTable.load(); //重新加载列表数据
              }
            }
          });
        });
    },
    //关闭侧边栏
    close() {
      this.dialogDetailVisible = false;
    },
    //页面加载显示数据
    loadData(param, cb) {
      const this_ = this;
      req
        .post(
          "${bpmModel}/flow/def/v1/versions?defId=" + this_.defId + "&defKey=",
          param
        )
        .then(response => {
          this_.versionList = response.data.rows;
          this_.pageResult = {
            page: response.data.page,
            pageSize: response.data.pageSize,
            total: response.data.total
          };
        })
        .finally(() => cb());
    }
  }
};
</script>
<style lang="scss" scoped>
.el-main {
  padding-top: 0px;
}
.urgent-text .inputs {
  width: 100%;
}
</style>
