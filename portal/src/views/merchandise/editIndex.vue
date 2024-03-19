<template>
  <div>
    <h3 class="header">类目维护</h3>
    <div class="main">
      <el-form
        v-if="type == 1"
        ref="form"
        :model="form"
        inline
        label-suffix="："
      >
        <el-row>
          <el-col :span="8">
            <el-form-item label="类目名称">
              {{ form.CATEGORY_NAME }}
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="父类目名称">
              {{ form.PARENT_NAME }}
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="16">
            <el-form-item label="类目图片">
              <el-upload
                class="upload-demo"
                action="#"
                list-type="picture-card"
                :file-list="fileList"
                :class="{hideUpload: uploadBtn}"
              >
                <i slot="default" class="el-icon-plus"></i>
                <div slot="file" slot-scope="{file}">
                  <img
                    class="el-upload-list__item-thumbnail"
                    :src="file.url"
                    alt=""
                  />
                  <span class="el-upload-list__item-actions">
                    <span
                      class="el-upload-list__item-preview"
                      @click="handlePictureCardPreview(file)"
                    >
                      <i class="el-icon-zoom-in"></i>
                    </span>
                    <!-- <span
                      class="el-upload-list__item-delete"
                      @click="handleDownload(file)"
                    >
                      <i class="el-icon-download"></i>
                    </span> -->
                  </span>
                </div>
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <el-form v-else :model="form" inline label-suffix="：">
        <el-row>
          <el-col :span="8">
            <el-form-item label="类目名称">
              <el-input v-model="form.CATEGORY_NAME"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="9">
            <el-form-item label="父类目名称">
              <el-input placeholder="请输入内容" v-model="form.PARENT_NAME">
                <template slot="append">
                  <div style="cursor: pointer;" @click="handleChange">
                    请选择
                  </div>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="16">
            <el-form-item label="类目图片">
              <el-upload
                class="upload-demo"
                :action="action"
                :headers="headers"
                list-type="picture-card"
                :file-list="fileList"
                :on-success="onSuccess"
                :class="{hideUpload: uploadBtns}"
              >
                <i slot="default" class="el-icon-plus"></i>
                <div slot="file" slot-scope="{file}">
                  <img
                    class="el-upload-list__item-thumbnail"
                    :src="file.url"
                    alt=""
                  />
                  <span class="el-upload-list__item-actions">
                    <span
                      class="el-upload-list__item-preview"
                      @click="handlePictureCardPreview(file)"
                    >
                      <i class="el-icon-zoom-in"></i>
                    </span>
                    <!-- <span
                      class="el-upload-list__item-delete"
                      @click="handleDownload(file)"
                    >
                      <i class="el-icon-download"></i>
                    </span> -->
                    <span
                      class="el-upload-list__item-delete"
                      @click="handleRemove(file)"
                    >
                      <i class="el-icon-delete"></i>
                    </span>
                  </span>
                </div>
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div class="btn">
        <el-button v-if="type != 1" type="primary" @click="onSubmit"
          >保存</el-button
        >
        <el-button @click="bank">返回</el-button>
      </div>

      <el-dialog title="商品类目" :visible.sync="dialogVisible" width="30%">
        <span>
          <el-tree
            :data="typeData"
            :props="defaultProps"
            @node-click="handleNodeClick"
          ></el-tree>
        </span>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="okHandleNodeClick">
            确 定
          </el-button>
        </span>
      </el-dialog>
      <el-dialog :visible.sync="dialogVisibleImg">
        <img width="100%" :src="dialogImageUrl" alt="" />
      </el-dialog>
    </div>
  </div>
</template>
<script>
import {serachCategory} from '@/api/merchandise.js'
import req from '@/request.js'
import utils from '@/utils.js'
export default {
  name: 'editIndex',
  data() {
    return {
      form: {
        STATUS: '1'
      },
      action: `${window.context.portal}/system/file/v1/upload`,
      headers: {
        Authorization: `Bearer ${
          JSON.parse(sessionStorage.getItem('currentUser')).token
        }`
      },
      dialogVisible: false,
      dialogVisibleImg: false,
      options: '',
      type: '',
      id: '',
      typeData: [],
      defaultProps: {
        children: 'cjStoreCategoryVOList',
        label: 'categoryName',
        id: 'categoryId'
      },
      temporary: {},
      fileList: [],
      dialogImageUrl: '',
      uploadBtn: true,
      uploadBtns:false,
      num:0
    }
  },
  created() {
    console.log()
    const params = this.$route.params
    this.id = params.id
    this.type = params.type
    this.getList()
    if (this.id) {
      this.getDetail()
    }
    console.log(utils.formatDateByWFString(new Date()))
  },
  methods: {
    // 类目树形结构
    getList() {
      this.typeData = []
      serachCategory().then(res => {
        const {data} = res
        this.loading = false
        if (data.state) {
          this.loopMuduleTreeDisabled(data.value.cjStoreCategoryVOList, this)
          this.typeData.push(data.value)
        }
      })
    },
    loopMuduleTreeDisabled(arr, that) {
      this.num++
      arr.forEach(item => {
        if (this.num==2) {
          that.$set(item, 'disabled', true)
        }
        this.loopMuduleTreeDisabled(item.cjStoreCategoryVOList, that)
      })
    },
    // 详情
    getDetail() {
      let data = {
        formKey: 'splmwh',
        boAlias: 'splmwh',
        id: this.id,
        action: 'edit'
      }
      this.$store.dispatch('form/getTemplateForm', data).then(rep => {
        if (rep.result) {
          this.form = rep.data.splmwh
          this.fileList = rep.data.splmwh.CATEGORY_IMAGE
            ? JSON.parse(rep.data.splmwh.CATEGORY_IMAGE)
            : []
            if(this.fileList.length>0){
              this.uploadBtns = true
            }
        }
      })
    },
    // 提交
    onSubmit() {
      this.form.CREATE_TIME = utils.formatDateByWFString(new Date())
      let saveData = {
        boAlias: 'splmwh',
        boData: {
          formKey: 'splmwh',
          splmwh: this.form,
          templateKey: 'splmwh'
        },
        formKey: 'splmwh',
        templateKey: 'splmwh'
      }
      this.$store.dispatch('form/boSave', saveData).then(result => {
        if (result.state) {
          this.$message({
            type: 'success',
            message: '保存成功'
          })
          this.$router.back()
        } else {
          this.$message({
            type: 'error',
            message: '保存失败'
          })
        }
      })
    },
    // 返回
    bank() {
      this.$router.back()
    },
    // 选择商品类目
    handleNodeClick(data) {
      console.log("data=>",data)
      this.temporary = {
        PARENT_NAME: data.categoryName,
        PARENT_ID: data.categoryId
      }
    },
    // 选择商品类目弹层确定
    okHandleNodeClick() {
      this.form.PARENT_NAME = this.temporary.PARENT_NAME
      this.form.PARENT_ID = this.temporary.PARENT_ID
      this.dialogVisible = false
    },
    //父类目名称选择类目
    handleChange() {
      this.dialogVisible = true
    },
    // 删除上传图片
    handleRemove(file) {
      this.fileList=[]
      this.uploadBtns = false
      console.log(file)
    },
    // 查看图片
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url
      this.dialogVisibleImg = true
    },
    // 下载图片
    handleDownload(file) {
      console.log(file)
      req.download(
        '${portal}/system/file/v1/downloadFile?fileId=' + file.response.fileId
      )
    },
    onSuccess(response, file, fileList) {
      this.uploadBtns = true
      const newFile = []
      fileList.map(item => {
        const data = {
          fileName: item.name,
          previewUrl: '',
          url: `${window.context.portal}/file/onlinePreviewController/v1/getFileById_${item.response.fileId}`
        }
        newFile.push(data)
      })
      this.form.CATEGORY_IMAGE = JSON.stringify(newFile)
    }
  }
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
  padding: 30px 20px 20px 30px;
}
.btn {
  text-align: center;
  margin-top: 50px;
}
.hideUpload /deep/ .el-upload--picture-card {
  display: none;
}
</style>
