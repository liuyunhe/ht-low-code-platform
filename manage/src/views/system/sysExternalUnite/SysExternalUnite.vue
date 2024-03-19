<template>
  <div>
    <el-container >
      <el-header style="padding:0;height:auto">
        <el-button
          v-if="data.length < 3"
          type="primary"
          icon="el-icon-add"
          @click="handleCommand({ command: 'add' })"
        >添加</el-button>
      </el-header>
      <el-main>
        <el-row :gutter="10">
          <el-col :span="8" v-for="item in data" :key="item.id">
            <el-card class="box-card" body-style="margin:5px;padding:5px;min-height:150px;">
              <el-row>
                <el-col :span="10">
                  <img :src="'img/' + item.type + '.png'" class="image" />
                </el-col>
                <el-col :span="14">
                  <div class="divText">{{ item.corpName }}</div>
                </el-col>
              </el-row>
              <div class="bottom clearfix">
                <el-row type="flex" justify="space-around">
                  <el-button-group>
                    <el-button size="small" @click="handleCommand({ command: 'edit', row: item })">编辑</el-button>
                    <el-button size="small" @click="handleCommand({ command: 'setAgent', row: item })" v-if="item.type == 'weChatWork' || item.type == 'dingtalk'">配置应用</el-button>
                    <el-button size="small" @click="syncUser(item)" v-if="item.type == 'weChatWork' || item.type == 'dingtalk'">上传通讯录</el-button>
                    <el-button size="small" @click="pullUser(item)" v-if="item.type == 'weChatWork' || item.type == 'dingtalk'">拉取通讯录</el-button>
                    <el-button size="small" @click="getMenu(item)" v-if="item.type == 'weChatOffAcc'">生成菜单</el-button>
                    <el-button size="small" @click="openTempMsgIdDialog(item)"  v-if="item.type == 'weChatOffAcc'">设置模板消息ID</el-button>
                    <el-button size="small" @click="handleCommand({ command: 'del', row: item })">删除</el-button>
                  </el-button-group>
                </el-row>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-main>
    </el-container>
    <el-dialog
      width="40%"
      :title="title"
      :visible="dialogVisible"
      v-if="dialogVisible"
      :before-close="handleClose"
      append-to-body
      :close-on-click-modal="false"
    >
      <el-form
        :disabled="systemDisabled"
        v-model="sysExternalUnite"
        data-vv-scope="sysExternalUniteForm"
      >
        <ht-form-item label="集成类型" prop="type" label-width="120px" class="identity-input-width">
          <ht-select
            :disabled="sysExternalUnite.id != ''"
            v-model="sysExternalUnite.type"
            :options="typeList"
            :validate="{ required: true }"
            placeholder="请选择集成类型"
          />
        </ht-form-item>
        <ht-form-item
          label-width="120px"
          class="identity-input-width"
          prop="corpId"
          v-if="sysExternalUnite.type"
        >
          <template slot="label" v-if="sysExternalUnite.type == 'weChatWork'">
            <el-tooltip placement="top">
              <div slot="content">
                企业id。第三方平台给予的企业标识。 在
                <a
                  href="https://work.weixin.qq.com/wework_admin/frame#profile"
                  target="_blank"
                  style="color:#90c2f7;text-decoration:underline"
                >企业微信开放平台</a>的基本信息
              </div>
              <i class="el-icon-question" />
            </el-tooltip>
            <span>corpId</span>
          </template>
          <template slot="label" v-else-if="sysExternalUnite.type == 'dingtalk'">
            <el-tooltip placement="top">
              <div slot="content">
                企业id。第三方平台给予的企业标识。 在
                <a
                  href="https://open-dev.dingtalk.com/#/corpAuthInfo"
                  target="_blank"
                  style="color:#90c2f7;text-decoration:underline"
                >钉钉开放平台</a>的基本信息-开发信息(旧版)
              </div>
              <i class="el-icon-question" />
            </el-tooltip>
            <span>corpId</span>
          </template>
          <template slot="label" v-else-if="sysExternalUnite.type == 'weChatOffAcc'">
            <el-tooltip placement="top">
              <div slot="content">开发者ID(AppID)。在微信公众平台-开发-基本配置</div>
              <i class="el-icon-question" />
            </el-tooltip>
            <span>AppID</span>
          </template>

          <ht-input
            v-model.trim="sysExternalUnite.corpId"
            autocomplete="off"
            :validate="{ required: true }"
            placeholder="请输入corpId"
          ></ht-input>
        </ht-form-item>

        <ht-form-item
          label-width="120px"
          class="identity-input-width"
          prop="corpSecret"
          v-if="
            sysExternalUnite.type == 'weChatWork' ||
              sysExternalUnite.type == 'weChatOffAcc'
          "
        >
          <template slot="label" v-if="sysExternalUnite.type == 'weChatWork'">
            <el-tooltip placement="top">
              <div slot="content">
                第三方同步通讯录的secret。 在
                <a
                  href="https://work.weixin.qq.com/wework_admin/frame#apps/contactsApi"
                  target="_blank"
                  style="color:#90c2f7;text-decoration:underline"
                >企业微信</a>的管理工具-通讯录同步
              </div>
              <i class="el-icon-question" />
            </el-tooltip>
            <span>corpSecret</span>
          </template>
          <template slot="label" v-else>
            <el-tooltip placement="top">
              <div slot="content">开发者密码(AppSecret)。在微信公众平台-开发-基本配置</div>
              <i class="el-icon-question" />
            </el-tooltip>
            <span>AppSecret</span>
          </template>
          <ht-input
            v-model.trim="sysExternalUnite.corpSecret"
            autocomplete="off"
            :validate="{ required: true }"
            placeholder="请输入corpSecret"
          ></ht-input>
        </ht-form-item>

        <ht-form-item prop="baseUrl" label-width="120px" class="identity-input-width">
          <template slot="label">
            <el-tooltip placement="top">
              <div slot="content">
                格式：【http或https】+【域名】+【端口号】+【根路径】
                如：http://www.hotent.org:8280/mobilevue
              </div>
              <i class="el-icon-question" />
            </el-tooltip>
            <span>移动端地址</span>
          </template>
          <ht-input
            v-model.trim="sysExternalUnite.baseUrl"
            autocomplete="off"
            :validate="{ required: true }"
            placeholder="请输入本系统地址"
          ></ht-input>
        </ht-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <ht-submit-button
          v-show="!systemDisabled"
          :url="saveSysExternalUnite()"
          :model="sysExternalUnite"
          :is-submit="isSubmit"
          request-method="POST"
          scope-name="sysExternalUniteForm"
          @before-save-data="beforeSaveData"
          @after-save-data="afterSaveData"
        >{{ $t("eip.common.save") }}</ht-submit-button>
        <el-button @click="dialogCancle()">
          {{
          $t("eip.common.cancel")
          }}
        </el-button>
      </div>
    </el-dialog>

    <ht-sidebar-dialog
      width="33%"
      title="配置应用"
      :visible="sysExtUniSetAgentVisible"
      :destroy-on-close="true"
      v-if="sysExtUniSetAgentVisible"
      @before-close="handleClose"
    >
      <el-form v-model="sysExternalUnite" data-vv-scope="sysExtUniSetAgentForm">
        <ht-form-item label-width="120px" class="identity-input-width" prop="agentId">
          <template slot="label">
            <el-tooltip placement="top">
              <div slot="content">
                第三方应用id。
                <span v-if="sysExternalUnite.type == 'weChatWork'">
                  在
                  <a
                    href="https://work.weixin.qq.com/wework_admin/frame#apps"
                    target="_blank"
                    style="color:#90c2f7;text-decoration:underline"
                  >企业微信</a>的应用管理里
                </span>
                <span v-else>
                  在
                  <a
                    href="https://open-dev.dingtalk.com/#/corph5"
                    target="_blank"
                    style="color:#90c2f7;text-decoration:underline"
                  >钉钉开放平台</a>企业内部开发-H5微应用里-进入微应用-【应用信息-查看详情】
                </span>
              </div>
              <i class="el-icon-question" />
            </el-tooltip>
            <span>agentId</span>
          </template>

          <ht-input
            v-model.trim="sysExternalUnite.agentId"
            autocomplete="off"
            :validate="{ required: true }"
            placeholder="agentId"
          ></ht-input>
        </ht-form-item>
        <ht-form-item
          label-width="120px"
          class="identity-input-width"
          prop="appKey"
          v-if="sysExternalUnite.type == 'dingtalk'"
        >
          <template slot="label">
            <el-tooltip placement="top">
              <div slot="content">
                第三方应用key。 在
                <a
                  href="https://open-dev.dingtalk.com/#/corph5"
                  target="_blank"
                  style="color:#90c2f7;text-decoration:underline"
                >钉钉开放平台</a>企业内部开发-H5微应用里-进入微应用-【应用信息-查看详情】
              </div>
              <i class="el-icon-question" />
            </el-tooltip>
            <span>appKey</span>
          </template>

          <ht-input
            v-model.trim="sysExternalUnite.agentKey"
            autocomplete="off"
            :validate="{ required: true }"
            placeholder="请输入appKey"
          ></ht-input>
        </ht-form-item>
        <ht-form-item label-width="120px" class="identity-input-width" prop="agentSecret">
          <template slot="label">
            <el-tooltip placement="top">
              <div slot="content">
                第三方应用secret。
                <span v-if="sysExternalUnite.type == 'weChatWork'">
                  在
                  <a
                    href="https://work.weixin.qq.com/wework_admin/frame#apps"
                    target="_blank"
                    style="color:#90c2f7;text-decoration:underline"
                  >企业微信</a>的应用管理里
                </span>
                <span v-else>
                  在
                  <a
                    href="https://open-dev.dingtalk.com/#/corph5"
                    target="_blank"
                    style="color:#90c2f7;text-decoration:underline"
                  >钉钉开放平台</a>企业内部开发-H5微应用里-进入微应用-【应用信息-查看详情】
                </span>
              </div>
              <i class="el-icon-question" />
            </el-tooltip>
            <span>应用secret</span>
          </template>

          <ht-input
            v-model.trim="sysExternalUnite.agentSecret"
            autocomplete="off"
            :validate="{ required: true }"
            placeholder="请输入agentSecret"
          ></ht-input>
        </ht-form-item>

        <ht-form-item
          label="菜单名称"
          label-width="120px"
          class="identity-input-width"
          prop="menuName"
          v-if="sysExternalUnite.type == 'weChatWork'"
        >
          <ht-input
            v-model.trim="sysExternalUnite.menuName"
            autocomplete="off"
            :validate="{ required: true }"
            placeholder="请输入菜单名称"
          ></ht-input>
        </ht-form-item>

        <ht-form-item label-width="120px" prop="menuUrl">
          <template slot="label">
            <el-tooltip placement="top" v-if="sysExternalUnite.type == 'dingtalk'">
              <div slot="content">
                钉钉不支持发布菜单，请自行拷贝并配置在
                <a
                  href="https://open-dev.dingtalk.com/#/corph5"
                  target="_blank"
                  style="color:#90c2f7;text-decoration:underline"
                >钉钉开放平台</a>
                企业内部开发-H5微应用里-进入微应用-【应用信息-查看详情】-应用首页地址
              </div>
              <i class="el-icon-question" />
            </el-tooltip>
            <span>菜单url</span>
          </template>
          <ht-input
            type="textarea"
            prop="menuUrl"
            :rows="18"
            v-model.trim="sysExternalUnite.menuUrl"
            autocomplete="off"
            :validate="{ required: true }"
            placeholder="请输入菜单名称"
          ></ht-input>
          <el-button
            size="mini"
            type="primary"
            icon="el-icon-printer"
            @click="generateMenuUrl(sysExternalUnite)"
          >一键生成</el-button>
          <el-button type="primary"
            size="mini"
            v-clipboard:copy="sysExternalUnite.menuUrl"
            v-clipboard:success="()=>{$message.success('内容已复制到剪切板！')}"
            v-clipboard:error="()=>{$message.error('抱歉，复制失败！')}"
          >复 制</el-button>
        </ht-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <ht-submit-button
          url="/portal/sysExternalUnite/v1/saveAgent"
          context="portal"
          :model="sysExternalUnite"
          scope-name="sysExtUniSetAgentForm"
          @before-save-data="sysExternalUnite.isPublish = 0"
          @after-save-data="afterSaveData"
        >{{ $t("eip.common.save") }}</ht-submit-button>

        <ht-submit-button
          v-if="sysExternalUnite.type == 'weChatWork'"
          url="/portal/sysExternalUnite/v1/saveAgent"
          context="portal"
          :model="sysExternalUnite"
          scope-name="sysExtUniSetAgentForm"
          @after-save-data="afterSaveData"
          @before-save-data="sysExternalUnite.isPublish = 1"
        >
        <el-tooltip placement="top">
            <div slot="content">保存数据并且将菜单发布到企业微信应用里</div>
            <i class="el-icon-question" style="color:#606266"/>
          </el-tooltip>&nbsp;保存并发布</ht-submit-button>
        <el-button @click="handleClose">
          {{
          $t("eip.common.cancel")
          }}
        </el-button>
      </div>
    </ht-sidebar-dialog>

    <ht-load-data :url="loadDataUrl" context="portal" @after-load-data="afterLoadData"></ht-load-data>

    <el-dialog
      title="公众号菜单"
      :visible.sync="wcoaMenuDialogViasible"
      :close-on-click-modal="false"
      width="33%"
    >
      <el-row>
        <el-col :span="4">
          <el-tooltip placement="top">
            <div slot="content">将右侧URL地址设置在公众号菜单里即可。</div>
            <i class="el-icon-question" />
          </el-tooltip>菜单URL:
        </el-col>
        <el-col :span="20">{{wcoaMenuUrl}}</el-col>
      </el-row>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="wcoaMenuDialogViasible = false"
        v-clipboard:copy="wcoaMenuUrl"
        v-clipboard:success="()=>{$message.success('内容已复制到剪切板！')}"
        v-clipboard:error="()=>{$message.error('抱歉，复制失败！')}"
        >复 制</el-button>
      </div>
    </el-dialog>
    <el-dialog
      title="模板消息ID设置"
      :visible.sync="setTempMsgIdDialogVisible"
      :close-on-click-modal="false"
      width="33%"
    >
      <el-form data-vv-scope="setTempMsgIdForm">
        <ht-form-item label="模板消息ID">
          <template slot="label">
            <el-tooltip placement="top">
              <div slot="content">在微信公众号后台-功能-模板消息-我的模板-模板消息ID</div>
              <i class="el-icon-question" />
            </el-tooltip>
            <span>模板消息ID</span>
          </template>
          <ht-input
            width="100%"
            v-model="sysExternalUnite.tempMsgId"
            autocomplete="off"
            :validate="{ required: true }"
            placeholder="请输入模板消息ID"
          ></ht-input>
        </ht-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <ht-submit-button
          v-show="!systemDisabled"
          :url="saveSysExternalUnite()"
          :model="sysExternalUnite"
          :is-submit="isSubmit"
          request-method="POST"
          scope-name="setTempMsgIdForm"
          @before-save-data="beforeSaveData"
          @after-save-data="()=>{loadData();setTempMsgIdDialogVisible=false}"
        >{{ $t("eip.common.save") }}</ht-submit-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import sys from "@/api/portal.js";
export default {
  name: "executeJobList",
  components: {},
  data() {
    return {
      typeList: [
        { key: "weChatWork", value: "企业微信" },
        { key: "dingtalk", value: "阿里钉钉" },
        { key: "weChatOffAcc", value: "微信公众号" }
      ],
      sysExternalUnite: {
        id: "",
        corpName: "",
        corpId: "",
        corpSecret: "",
        type: "",
        baseUrl: "",
        agentId: "",
        menuName: "",
        agentKey: "",
        agentSecret: "",
        menuUrl: "",
        tempMsgId: ""
      },
      loadDataUrl: "",
      title: "",
      isSubmit: true,
      dialogVisible: false,
      sysExtUniSetAgentVisible: false,
      systemDisabled: false,
      data: [],
      wcoaMenuUrl: "",
      wcoaMenuDialogViasible: false,
      setTempMsgIdDialogVisible: false
    };
  },

  computed: {},

  mounted() {
    this.loadData();
  },
  methods: {
    dialogCancle() {
      this.loadDataUrl = "";
      this.dialogVisible = false;
      setTimeout(() => (this.systemDisabled = false), 500);
    },
    afterSaveData() {
      this.loadData();
      this.dialogVisible = false;
      this.sysExtUniSetAgentVisible = false;
    },
    beforeSaveData() {
      this.isSubmit = true;
    },
    handleClose() {
      this.dialogVisible = false;
      this.sysExtUniSetAgentVisible = false;
      this.loadDataUrl = "";
      setTimeout(() => (this.systemDisabled = false), 500);
    },
    saveSysExternalUnite: function() {
      return window.context.portal + "/portal/sysExternalUnite/v1/save";
    },
    afterLoadData(data) {
      // 编辑第三方集成信息
      if (this.dialogVisible) {
        this.sysExternalUnite = data;
        setTimeout(() => this.$validator.validateAll("sysExternalUniteForm"));
      }
    },
    showDialog(row) {
      this.dialogVisible = false;
      this.$nextTick(() => {
        this.dialogVisible = true;
      })
      if (row) {
        this.loadDataUrl = `/portal/sysExternalUnite/v1/getJson?id=${row.id}`;
      }
    },
    loadData() {
      sys.getSysExternalUnitePageJson({}).then(response => {
        this.data = response.rows;
      });
    },
    handleCommand(params) {
      switch (params.command) {
        case "setAgent":
          this.sysExtUniSetAgentVisible = true;
          this.sysExternalUnite = params.row;
          setTimeout(() =>
            this.$validator.validateAll("sysExtUniSetAgentForm")
          );
          break;
        case "edit":
          this.title = "编辑第三方集成信息";
          this.showDialog(params.row);
          break;
        case "add":
          this.sysExternalUnite = {
            id: "",
            corpName: "",
            corpId: "",
            corpSecret: "",
            type: "",
            baseUrl: "",
            agentId: "",
            menuName: "",
            agentKey: "",
            agentSecret: "",
            menuUrl: "",
            tempMsgId: ""
          };
          this.title = "添加第三方集成信息";
          this.showDialog();
          break;
        case "del":
          this.$confirm("是否确认删除？", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          }).then(() => {
            sys.delSysExternalUniteById(params.row.id).then(
              data => {
                if (data.state) {
                  this.$message.success(data.message);
                  this.loadData();
                } else {
                  this.$message.error(data.message || "删除失败");
                }
              },
              error => {
                this.$message.error(error || "删除失败");
              }
            );
          }).catch(()=>{});
          break;
        default:
          break;
      }
    },
    syncUser(item) {
      this.$confirm(
        "将同步所有有手机号的用户至第三方通讯录，确定继续操作？",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).then(() => {
        const loading = this.$loading({
          lock: true,
          text: "正在同步用户到[" + item.corpName + "]，请等待...",
          spinner: "el-icon-loading",
          background: "rgba(0, 0, 0, 0.7)"
        });
        sys.syncUser(item.id).then(
          data => {
            loading.close();
            try {
              let str = this.arrayBufferToString(data)
              let respo = JSON.parse(str||"{}");
              if (respo.state) {
                this.$message({ type: 'success',message:respo.message,showClose: true})
                this.loadData();
              } else {
                this.$message({ type: 'error', message:respo.message||"同步用户失败",showClose: true})
              }
            } catch (error) { }
          },
          error => {
            loading.close();
            this.$message({ type: 'error', message:error||"同步用户失败",showClose: true})
          }
        );
      }).catch(()=>{});;
    },
    arrayBufferToString(arr){
        if(typeof arr === 'string') {
            return arr;
        }
        var dataview=new DataView(arr);
        var ints=new Uint8Array(arr.byteLength);
        for(var i=0;i<ints.length;i++){
          ints[i]=dataview.getUint8(i);
        }
        arr=ints;
        var str = '',
            _arr = arr;
        for(var i = 0; i < _arr.length; i++) {
            var one = _arr[i].toString(2),
                v = one.match(/^1+?(?=0)/);
            if(v && one.length == 8) {
                var bytesLength = v[0].length;
                var store = _arr[i].toString(2).slice(7 - bytesLength);
                for(var st = 1; st < bytesLength; st++) {
                    store += _arr[st + i].toString(2).slice(2);
                }
                str += String.fromCharCode(parseInt(store, 2));
                i += bytesLength - 1;
            } else {
                str += String.fromCharCode(_arr[i]);
            }
        }
        return str;
    },
    pullUser(item) {
      this.$confirm("将从第三方拉取通讯录至本系统，确定继续操作？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        const loading = this.$loading({
          lock: true,
          text: "正在拉取通讯录，请等待...",
          spinner: "el-icon-loading",
          background: "rgba(0, 0, 0, 0.7)"
        });
        sys.pullUser(item.id).then(
          data => {
            loading.close();
            if (data.state) {
               this.$message({ type: 'success', message:data.message,showClose: true})
              this.loadData();
            } else {
              }
          },
          error => {
            loading.close();
            this.$message({ type: 'error', message:error|| "拉取用户失败",showClose: true})
          }
        );
      }).catch(()=>{});;
    },
    getMenu(item) {
      sys.generateMenuUrl(item.id).then(
        data => {
          if (data.state) {
            this.wcoaMenuDialogViasible = true;
            this.wcoaMenuUrl = data.value;
            // this.$alert(data.value, "拷贝以下链接并将其设置在公众号菜单里", {
            //   confirmButtonText: "确定"
            // });
          } else {
            this.$message.error(data.message || "获取失败");
          }
        },
        error => {
          this.$message.error(error || "获取失败");
        }
      );
    },
    generateMenuUrl(item) {
      sys.generateMenuUrl(item.id).then(
        data => {
          if (data.state) {
            this.$set(this.sysExternalUnite, "menuUrl", data.value);
          } else {
            this.$message.error(data.message || "获取失败");
          }
        },
        error => {
          this.$message.error(error || "获取失败");
        }
      );
    },
    openTempMsgIdDialog(item) {
      this.sysExternalUnite = item;
      this.setTempMsgIdDialogVisible = true;
    },
    saveTempMsgId() {}
  }
};
</script>

<style scoped>
.box-card {
  width: 320;
}
imargin {
  margin-right: 20px;
}

.li {
  width: 56px;
  height: 14px;
  font-size: 14px;
  color: rgba(51, 51, 51, 1);
  line-height: 20px;
}

.bottom {
  margin-top: 20px;
  line-height: 12px;
}

.divText {
  width: 100px;
  height: 20px;
  font-size: 20px;
  font-weight: bold;
  color: rgba(51, 51, 51, 1);
  line-height: 60px;
}

.image {
  height: 80px;
  margin-left: 12px;
  margin-right: 12px;
  font-size: 60px;
  display: block;
}
.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}

.clearfix:after {
  clear: both;
}
.identity-item-bottom {
  margin-bottom: 5px;
}

.identity-input-width .inputs {
  width: 100%;
}
</style>
