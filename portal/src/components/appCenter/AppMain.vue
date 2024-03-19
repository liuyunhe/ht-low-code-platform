<template>
  <div>
    <el-row>
      <el-col :span="3" :key="app.id" v-for="(app,index) in apps">
        <el-tooltip placement="top-end" effect="light" :manual="true" v-model="visibleTag[index]">
          <div
            slot="content"
            @mouseenter="mouseEnter(index)"
            @mouseleave="mouseLeave(index)"
            :index="index"
          >
            <el-link type="info" @click="appDescClick(app.id)">应用说明</el-link>
          </div>
          <el-card
            shadow="hover"
            class="card"
            @click.native="click(app)"
          >
            <div
              :style="{background: app.iconColor?app.iconColor:'#1339E0'}"
              class="card-background"
              @mouseenter="mouseEnter(index)"
              @mouseleave="mouseLeave(index)"
            >
              <el-image
                class="app-image"
                :src="app.icon"
                v-if="app.icon && app.icon.indexOf('icon')<0"
              ></el-image>
              <i
                :class="app.icon?app.icon:'el-icon-warning'"
                :style="{color:'#ffffff',paddingTop:'10px'}"
              ></i>
            </div>
            <br />
            <span class="card-title">{{app.name}}</span>
          </el-card>
        </el-tooltip>
      </el-col>
    </el-row>
    <!--      <el-pagination-->
    <!--                background-->
    <!--                layout="prev, pager, next"-->
    <!--                :total="pageResult.total"-->
    <!--                :page-size="pageResult.pageSize"-->
    <!--                class="pagination">-->
    <!--        </el-pagination>-->
    <el-dialog title="应用说明" width="70%" :visible="dialogVisible" :before-close="beforeClose">
      <el-form>
        <div v-for="(item,index) in appParamList" :key="index">
          <ht-form-item :label="item.name">
            <!--<ht-input v-model="item.value" v-if="item.controlType == 'textarea'" :disabled="true"></ht-input>-->
            <div>
              <span
                v-text="item.value"
                v-if="item.controlType == 'textarea' || item.controlType == 'number'
                           || item.controlType == 'date' || item.controlType == 'dateTime'"
              ></span>
            </div>
            <!--<ht-input v-model="item.value" v-if="item.controlType == 'number'" type="number" :disabled="true"></ht-input>
                <ht-date v-model="item.value" v-if="item.controlType == 'date'" format="yyyy-MM-dd" :disabled="true"></ht-date>
            <ht-date v-model="item.value" v-if="item.controlType == 'dateTime'" format="yyyy-MM-dd HH:mm:ss" :disabled="true"></ht-date>-->
            <div v-if="item.controlType == 'attachment'">
              <el-tag
                type="primary"
                v-for="file in JSON.parse(item.value)"
                :key="file.id"
                @click="downloadFile(file.id)"
              >{{file.name}}</el-tag>
            </div>
            <div>
              <span v-html="item.value" v-if="item.controlType == 'richText'"></span>
            </div>
          </ht-form-item>
        </div>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import req from '@/request.js'
import flow from '@/api/flow.js'
export default {
  name: 'app-main',
  props: {
    apps: Array,
    pageResult: Object
  },
  data() {
    return {
      dialogVisible: false,
      appParamList: [],
      visibleTag: [],
      appRightMap: {},
      closingWait: false
    }
  },
  methods: {
    //点击应用
    async click(app) {
      //1常规应用 2数据报表 3自定义视图 4图表 6表单 7模块 8启动流程
      let url = ''
      let prefix = window.context.front
      if (app.type == 4) {
        let content = JSON.parse(app.content)
        url = `/appContent/${app.type}/${content.id}/0/${app.name}`
      } else if (app.type === 2) {
        let content = JSON.parse(app.content)
        url = `/appContent/${app.type}/${content.key}/0/${app.name}`
      } else if (app.type === 3) {
        let content = JSON.parse(app.content)
        url = `/appContent/${app.type}/${content.alias}/${content.sqlAlias}/${app.name}`
      } else if (app.type === 1) {
        url = `/appContent/${app.type}/${app.id}/0/${app.name}`
      } else if (app.type === 6) {
        let content = JSON.parse(app.content)
        url = `/appContent/${app.type}/${content.id}/0/${app.name}`
      } else if (app.type === 7) {
        let content = JSON.parse(app.content)
        url = `/appContent/${app.type}/${content.id}/0/${app.name}`
      } else if (app.type === 8) {
        let content = JSON.parse(app.content)
        let resp = {}
        if (content.key) {
          resp = await flow.getMainByDefKey(content.key)
          url = `/agentStart/${resp.data.id}/0`
        } else {
          url = `/agentStart/${content.id}/0`
        }
      } else if (app.type === 5) {
        url = app.content
        if (url.startsWith('http')) {
          prefix = ''
        }
      }
      if (url){
        //ccwgq 2022-10-25 打开新窗口时传入token
        //window.open(prefix+url,new Date().getTime(),'height='+(screen.availHeight-50)+',width='+(screen.availWidth-10)+',top=0,left=0,toolbar=no,menubar=no,scrollbars=auto,resizeable=no,location=no,status=no',false);
        let currentUser = sessionStorage.getItem('currentUser');
        currentUser=JSON.parse(currentUser);

        window.open(prefix + url + "?token="+currentUser.token, '_blank')
      }
    },
    appDescClick(appId) {
      req
        .get(
          window.context.portal + '/portalAppParam/v1/getByAppId?appId=' + appId
        )
        .then(resp => {
          this.appParamList = resp.data.value
          this.dialogVisible = true
        })
    },
    mouseEnter(index) {
      let this_ = this
      let appId = this.apps[index].id
      let timeWait = 0
      if (this_.appRightMap.hasOwnProperty(appId)) {
        if (this_.appRightMap[appId]) {
          if (this_.closingWait) {
            timeWait = 200
          }
          setTimeout(() => {
            this_.visibleTag[index] = true
            this_.$forceUpdate()
          }, timeWait)
        }
        return
      }
      req
        .get(
          window.context.portal +
            '/portalAppParam/v1/isAppHasDesc?appId=' +
            appId
        )
        .then(resp => {
          if (resp.data.state) {
            this_.appRightMap[appId] = resp.data.value
            if (resp.data.value) {
              if (this_.closingWait) {
                timeWait = 200
              }
              setTimeout(() => {
                this_.visibleTag[index] = true
                this_.$forceUpdate()
              }, timeWait)
            }
          }
        })
    },
    mouseLeave(index) {
      this.closingWait = true
      setTimeout(() => {
        this.visibleTag[index] = false
        this.closingWait = true
        this.$forceUpdate()
      }, 200)
    },
    beforeClose() {
      this.appParamList = []
      this.dialogVisible = false
    },
    //附件下载
    downloadFile(fileId) {
      //"${portal}/system/file/v1/downloadFile?fileId=" + this.fileRow.id
      req.download('${portal}/system/file/v1/downloadFile?fileId=' + fileId)
    }
  }
}
</script>

<style scoped>
.card {
  margin: 10px 15px;
  height: 190px;
  text-align: center;
  cursor: pointer;
  background-color: transparent;
  border: #fff;
  -webkit-box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
.el-card.is-hover-shadow:hover, .el-card.is-hover-shadow:focus {
    -webkit-box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.4);
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.4);
}
.card i {
  font-size: 60px;
  display: block;
  margin: 10px 0;
}
.pagination {
  position: absolute;
  bottom: 0;
}
.card-background {
  width: 80px;
  height: 80px;
  margin: 10px auto;
  border-radius: 15px;
}
.card-title {
  font-size: 12px;
  /* font-weight: bold; */
}
.app-image {
  width: 60px;
  height: 60px;
  margin: 10px auto;
}
</style>