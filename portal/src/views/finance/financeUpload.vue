<template>
  <div>
    <h3 class="header">上传</h3>
    <div class="main">
      <el-upload
        :action="actionUrl"
        :headers="header"
        list-type="picture-card"
        :on-preview="handlePictureCardPreview"
        :on-remove="handleRemove"
        :on-success="handSuccess"
      >
        <i class="el-icon-plus"></i>
      </el-upload>
      <el-dialog :visible.sync="dialogVisible">
        <img width="100%" :src="dialogImageUrl" alt="" />
      </el-dialog>
      <div
      style="margin-top: 10px; color: #606266; font-size: 13px"
    >
      上传说明:
      <ul >
        <li >
          当前支持
          <a @click="open('01')">增值税普通发票</a>
          、
          <a @click="open('02')">增值税普通发票（电子）</a>
          、
          <a @click="open('03')">增值税专用发票</a>
        </li>
        <li >支持对5年以内的发票进行验真查询</li>

        <li >
          图片来源及质量：尽量采用电子发票文件，或使用平板扫描文件，扫描仪分辨率设置在150dpi以上，300dpi为佳
        </li>
        <li >{{ `最大上传文件数为5` }}</li>
        <li >
          若超过10个文件,请将文件压缩为压缩包后上传
        </li>
      </ul>
    </div>
    <div class="btn">
      <el-button type="primary">确定</el-button>
      <el-button @click="goBack">返回</el-button>
    </div>
    </div>
  </div>
</template>
<script>
import {mapState} from 'vuex'
export default {
  name:'financeUpload',
  data() {
    return {
      dialogVisible: false,
      dialogImageUrl: ''
    }
  },
  computed:mapState({
    header: state => {
      if (state.login && state.login.currentUser) {
        return {Authorization: `Bearer ${state.login.currentUser.token}`}
      }
      return {}
    },
    actionUrl: function() {
      return window.context.portal + '/system/file/v1/upload'
    }
  }),
  methods: {
     handleRemove(file, fileList) {
        console.log('文件列表移除文件时的钩子',file, fileList);
      },
      handlePictureCardPreview(file) {
        console.log('点击文件列表中已上传的文件时的钩子',file)
        this.dialogImageUrl = file.url
        this.dialogVisible = true;
      },
      handSuccess(response, file, fileList){
        console.log('文件上传成功时的钩子',response, file, fileList)
        this.dialogImageUrl = file.url
      },
      goBack(){
        this.$router.back()
      }
  },
}
</script>
<style scoped>
.header {
  padding: 10px 20px;
  margin-bottom: 0;
  border-bottom: 1px solid #ccc;
  margin-top: 8px;
  background: #fff;
  font-size: 14px;
}
.main {
  padding: 10px 20px 20px 20px;
}
.btn {
  text-align: center;
  margin-top: 50px;
}
</style>
