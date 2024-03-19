<template>
  <ht-sidebar-dialog
    :visible.sync="dialogVisible"
    :before-close="handleDialogClose"
    :show-close="false"
    class="cd-column__dialog"
    destroy-on-close
    width="100%"
  >
    <template slot="title">
      <div class="flex" style="justify-content: space-between">
        <el-page-header @back="handleDialogClose" content="业务建模"></el-page-header>
        <el-button-group>
          <el-button type="primary" @click="validatorForm('save')">保 存</el-button>
          <el-button v-if="!formData.deployed" @click="validatorForm('deployed')">发 布</el-button>
          <el-button @click="validatorForm('createTableForm')">创建表单</el-button>
        </el-button-group>
      </div>
    </template>
    <el-form :model="formData" class="cd-column__form" data-vv-scope="form">
      <el-container class="container">
        <el-header height="70px">
          <business-obj-header @blur="blur()" :dataView="dataView" ref="objHeader" :formData="formData" />
        </el-header>
        <el-container>
          <el-aside width="320px" class="aside-tree__wrap" v-if="asideShow">
            <business-obj-ents
              @addEntRows="addEntRows"
              @addEntExts="addEntExts"
              @getEntsByIndex="getEntsByIndex"
              @addGrandSonEnt="addGrandSonEnt"
              @deleteEntRows="deleteEntRows"
              @entBlur="entBlur"
              @chineseFormat="chineseFormat"
              @getGrandSonEntsByIndex="getGrandSonEntsByIndex"
              @deleteGrandSonEntRows="deleteGrandSonEntRows"
              :formData="formData"
            />
          </el-aside>
          <div
            class="navbar-collapse"
            :class="{'navbar-collapse-right': !asideShow}"
            @click="asideShow = !asideShow"
          >
            <div class="navbar-collapse-bg">
              <i class="navbar-collapse-arrow" :class="{'el-icon-arrow-left': asideShow, 'el-icon-arrow-right': !asideShow}"></i>
            </div>
          </div>
          <el-main>
            <business-obj-attr
              @handleDialogClose="handleDialogClose"
              @entBlur="entBlur"
              @chineseFormat="chineseFormat"
              @getFormData="getFormData"
              @getEntsByIndex="getEntsByIndex"
              :openGrandSonAttr="openGrandSonAttr"
              :attrTableData="attrTableData"
              :formData.sync="formData"
              :entIndex.sync="entIndex"
              :grandSonIndex="grandSonIndex"
            />
          </el-main>
        </el-container>
      </el-container>
    </el-form>
    <BusinessObjExternalDialog
      ref="businessObjExternalDialog"
      @selectExternal="handleSelectExternal"
      @addExternalTable="addExternalTable"
    ></BusinessObjExternalDialog>
    <FormTemplateDialog @onConfirm="conFirmTemplate" @onCancel="cancelFirmTemplate" :formType="'pc'" ref="formTemplateDialog" />
  </ht-sidebar-dialog>
</template>

<script>
import form from '@/api/form.js'
import req from '@/request.js'
import util from '@/hotent-ui-util.js'
import main from '@/main.js'
import BusinessObjHeader from '@/views/form/BusinessObjHeader.vue'
import BusinessObjEnts from '@/views/form/BusinessObjEnts.vue'
import BusinessObjAttr from '@/views/form/BusinessObjAttr.vue'
import BusinessObjExternalDialog from '@/views/form/BusinessObjExternalDialog.vue'
import FormTemplateDialog from '@/components/dialog/FormTemplateDialog.vue'

export default {
  components: {
    BusinessObjHeader,
    BusinessObjEnts,
    BusinessObjAttr,
    BusinessObjExternalDialog,
    FormTemplateDialog
  },
  props: ['dataView', 'deployedId', 'clickTree', 'data'],
  data() {
    return {
      asideShow:true,
      messageCations: {}, //用来获取校验弹窗提示的实例，以对对应弹窗进行操作
      entExtsTableHeight: 0,
      typeData: [],
      entIndex: 0, //选中实体下标
      isHide: true,
      entExts: {
        //TODO
        comment: '',
        desc: '',
        dsName: '',
        index: 0,
        isExternal: '1',
        name: '',
        packageId: '',
        pk: '',
        pkType: '',
        relation: '',
        show: '',
        status: '',
        tableName: '',
        attributeList: [],
        type: ''
      },
      formData: {
        //表单
        alias: '',
        categoryId: '',
        categoryName: '',
        deployed: 0,
        description: '',
        dsName: '',
        isCreateTable: '',
        isExternal: '',
        status: 'normal',
        supportDb: true,
        ents: []
      },
      countAttrLength: 0,
      dialogVisible: false,
      openGrandSonAttr: false,
      grandSonIndex: -1,
      attrTableData: [],
      addFk: false, //TODO
      extLen: 0,
      showMessage: false,
      externalTables: [] // 当前外部表的字段
    }
  },
  mounted() {
    const this_ = this
    this_.$root.$on('validateField', function(res) {
      this_.closeAllNotification()
      util
        .validateForm(this, 'form')
        .then(() => {
          this_.closeAllNotification()
        })
        .catch(reason => {
          let rule = reason.map(v => {
            return v.rule
          })
          rule = rule.unique()
          this_.closeAllNotification()
          if (rule.includes('required')) {
            let n = this_.$message.warning('请将信息填写完整')
            this_.messageCations[n.id] = n
          } else if (rule.includes('regex')) {
            let n = this_.$message.warning('只能输入字母、数字、下划线，且以字母开头')
            this_.messageCations[n.id] = n
          }
        })
    })
  },
  created() {
    this.$validator = this.$root.$validator
  },
  watch: {
    data: {
      handler(v) {
        if (this.dataView.id) {
          this.formData = v
        }
      },
      deep: true
    }
  },
  methods: {
    //关闭所有校验通知
    closeAllNotification() {
      for (let key in this.messageCations) {
        this.messageCations[key].close()
        delete this.messageCations[key]
      }
    },
    addGrandSonEnt(index) {
      this.getEntsByIndex(index)
      let row = {
        desc: '',
        index: this.entIndex,
        name: '',
        packageId: '',
        show: '孙实体',
        relation: 'onetomany',
        attributeList: [],
        status: '',
        isCheck: true
      }
      if (!this.formData.ents[index].children) {
        this.$set(this.formData.ents[index], 'children', [])
      }
      if (this.checkGrandSonEnts(index)) {
        return
      }
      this.formData.ents[index].children.push(row)
      this.grandSonIndex = this.formData.ents[index].children.length - 1
      this.openGrandSonAttr = true
      this.attrTableData = this.formData.ents[index].children[this.grandSonIndex].attributeList
    },
    checkGrandSonEnts(index, param) {
      if ((this.formData.ents[index].children && this.formData.ents[index].children.length == 0) || !this.formData.ents[index].children) {
        return false
      }
      let child = this.formData.ents[index].children
      let len = this.formData.ents[index].children.length - 1
      child[len].comment = child[len].desc
      child[len].description = child[len].desc
      if (!param && child[len].attributeList.length == 0) {
        this.$message({message: '请添加字段信息', type: 'warning'})
        return true
      }
    },
    //输入检测
    checkIsChinese(param) {
      var check = new RegExp('[\u4e00-\u9fa5]')
      var pattern = new RegExp("[%--`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——| {}【】‘；：”“'。，、？]")
      if (check.test(param) || pattern.test(param)) {
        this.$message({message: '请勿输入中文或特殊字符', type: 'warning'})
        return true
      }
    },
    //输入检测
    checkInSpecialCharacters(param) {
      var pattern = new RegExp("[%--`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——| {}【】‘；：”“'。，、？]")
      if (pattern.test(param)) {
        this.$message({message: '请勿输入特殊字符', type: 'warning'})
        return true
      }
    },
    getGrandSonEntsByIndex(i, index) {
      this.getEntsByIndex(index, 'grandSonEnt')
      this.grandSonIndex = i
      if (this.formData.ents[this.entIndex].children && this.formData.ents[this.entIndex].children[i]) {
        this.attrTableData = this.formData.ents[this.entIndex].children[i].attributeList
      }
    },
    //获取选中实体
    getEntsByIndex(index, param) {
      //如果是删除自动选择上一个实体
      if (param=='delete'){
        if (this.formData.ents[index]) {
          this.entIndex = index
          this.formData.ents.forEach(data => {
            data.isCheck = false
          })
          this.formData.ents[index].isCheck = true
          return true
        }
      }else{
        let this_ = this
        util.validateForm(this, 'form')
                .then(() => {
                  this.openGrandSonAttr = false
                  if (param == 'grandSonEnt') {
                    this.openGrandSonAttr = true
                  }
                  if (this.formData.ents[index]) {
                    this.entIndex = index
                    this.formData.ents.forEach(data => {
                      data.isCheck = false
                    })
                    this.formData.ents[index].isCheck = true
                    return true
                  }
                })
                .catch(reason => {
                  let rule = reason.map(v => {
                    return v.rule
                  })
                  rule = rule.unique()
                  this_.closeAllNotification()
                  if (rule.includes('required')) {
                    let n = this_.$message.warning('请将信息填写完整')
                    this_.messageCations[n.id] = n
                  } else if (rule.includes('regex')) {
                    let n = this_.$message.warning('只能输入字母、数字、下划线，且以字母开头')
                    this_.messageCations[n.id] = n
                  }
                })
      }

    },

    //表单对话框
    handleOpen() {
      this.dialogVisible = true
      this.init()
    },
    init() {
      this.formData.categoryId = this.clickTree.id
      this.formData.categoryName = this.clickTree.name
      if (this.dataView.entIndex) {
        this.entIndex = this.dataView.entIndex
      }
    },
    //表单数据加载
    getFormData() {
      if (this.dataView.id) {
        form.getEntData(this.dataView.id, resp => {
          resp.data.ents.forEach((entData, index) => {
            if (entData.isExternal == '1' && index == 0) {
              entData.show = '主实体-外'
            } else if (entData.isExternal == '1') {
              entData.show = '子实体-外'
            }
            if (index === 0) {
              entData.isCheck = true
            }
            if (entData.children) {
              entData.children.forEach(v => {
                if (v.isExternal == '1') {
                  v.show = '孙实体-外'
                }
              })
            }
            for (let q = 0; q < entData.attributeList.length; q++) {
              if (entData.attributeList[q]) {
                if (entData.attributeList[q].isRequired == 0) {
                  entData.attributeList[q].isRequired = '0'
                } else {
                  entData.attributeList[q].isRequired = '1'
                }
              }
              for (let i = 0; i < entData.attributeList.length - 1 - q; i++) {
                if (entData.attributeList[i].index > entData.attributeList[i + 1].index) {
                  let temp = entData.attributeList[i]
                  entData.attributeList[i] = entData.attributeList[i + 1]
                  entData.attributeList[i + 1] = temp
                }
              }
            }
          })
          this.formData = resp.data
        })
      }
    },
    //关闭表单对话框
    handleDialogClose() {
      this.$emit('loadTableData')
      this.dialogVisible = false
      this.isSave = false
      this.entIndex = 0
      this.grandSonIndex = -1
      this.openGrandSonAttr = false
      this.countAttrLength = 0
      this.formData = {
        alias: '',
        categoryId: '',
        categoryName: '',
        deployed: 0,
        description: '',
        dsName: '',
        isCreateTable: '',
        isExternal: '',
        status: 'normal',
        supportDb: true,
        ents: []
      }
      this.$router.push({path: `/form#businessObj`})
    },
    //新增实体
    addEntRows() {
      const this_ = this;
      util
        .validateForm(this_, 'form')
        .then(() => {
          if(this_.formData.ents.length>0){
            for (let i = 0; i < this_.formData.ents.length; i++) {
              if (this_.checkGrandSonEnts(i)) {
                return
              }
            }
            this_.countAttrLength = 0
            if (!this_.checkEntFunc(this_.formData.ents)) {
              return false
            }
            this_.extLen = 0
          }
          this_.formData.ents.forEach(data => {
            data.isCheck = false
          })
          this_.entIndex = ++this_.entIndex
          let row = {
            desc: '',
            index: this_.entIndex,
            name: '',
            packageId: '',
            show: '子实体',
            children: [],
            relation: 'onetomany',
            attributeList: [],
            status: '',
            isCheck: true
          }
          if (this_.formData.ents.length == 0) {
            this_.entIndex = 0
            row = {
              desc: '',
              index: 0,
              name: '',
              packageId: '',
              show: '主实体',
              relation: 'main',
              status: '',
              attributeList: [],
              isCheck: true
            }
          }
          if (this_.formData.ents.length > 0 && this_.checkGrandSonEnts(this_.formData.ents.length - 1)) {
            return
          }
          this_.formData.ents.push(row)
        })
        .catch(reason => {
          let rule = reason.map(v => {
            return v.rule
          })
          rule = rule.unique()
          if (rule.includes('required')) {
            let n = this_.$message.warning('请将信息填写完整')
            this_.messageCations[n.id] = n
          } else if (rule.includes('regex')) {
            this_.$message.warning('只能输入字母、数字、下划线，且以字母开头')
          }
        })
    },
    //删除实体
    deleteEntRows(index) {
      this.entIndex = index
      if (!this.formData.ents[this.entIndex].attributeList) {
        this.formData.ents[this.entIndex].attributeList = []
      }
      //处理加入的外部表数组
      if (this.formData.ents[index] && this.formData.ents[index].isExternal == 1 && this.externalTables && this.externalTables.length > 0) {
        let extName = this.formData.ents[index].tableName
        this.externalTables.forEach((item, idx) => {
          if (item == extName) {
            this.externalTables.splice(idx, 1)
          }
        })
      }
      this.formData.ents.splice(index, 1)
      if (this.entIndex >= this.formData.ents.length) {
        this.entIndex = this.formData.ents.length - 1
        this.getEntsByIndex(this.entIndex)
      }
      if (this.formData.ents.length > 0) {
        if (index == 0) {
          if (this.formData.ents[0].isExternal != '1') {
            this.formData.ents[0].show = '主实体'
            this.formData.ents[0].relation = 'main'
            this.formData.ents[0].children = []
          } else {
            this.formData.ents[0].show = '主实体-外'
            this.formData.ents[0].relation = 'main'
          }
        }
      }
    },
    deleteGrandSonEntRows(i, index) {
      this.getEntsByIndex(index, 'noCheck')
      this.grandSonIndex = i
      if (!this.formData.ents[this.entIndex].attributeList) {
        this.formData.ents[this.entIndex].children[i].attributeList = []
      }
      this.formData.ents[this.entIndex].children.splice(i, 1)
      this.openGrandSonAttr = false
      this.attrTableData = this.formData.ents[this.entIndex].attributeList
      if (this.formData.ents[this.entIndex].children[i - 1] && this.formData.ents[this.entIndex].children[i - 1].attributeList.length > 0) {
        this.attrTableData = this.formData.ents[this.entIndex].children[i - 1].attributeList
      }
    },
    //数据源
    addEntExts(index, i) {
      let currentEnt = null,
        currentEntType = ''
      if (typeof index != 'undefined') {
        if (typeof i != 'undefined') {
          currentEntType = 'sunTable'
          currentEnt = this.formData.ents[index].children[i]
        } else {
          currentEnt = this.formData.ents[index]
          currentEntType = index > 0 ? 'subTable' : 'mainTable'
        }
      }
      this.$refs.businessObjExternalDialog.open(currentEnt, currentEntType, index == 0 ? 0 : this.formData.ents.length, this.externalTables)
    },
    validatorForm(param) {
      util
        .validateForm(this, 'form')
        .then(() => {
          for (let i = 0; i < this.formData.ents.length; i++) {
            if (this.checkGrandSonEnts(i)) {
              return
            }
          }
          this.countAttrLength = 0
          if (!this.checkEntFunc(this.formData.ents)) {
            return false
          }
          this.extLen = 0
          if (param == 'deployed') {
            this.deployedEntData()
            return true
          } else if (param == 'save') {
            this.saveEntData()
            return true
          } else if (param == 'createTableForm') {
            this.createTableForm()
            return true
          }
          return true
        })
        .catch(reason => {
          let rule = reason.map(v => {
            return v.rule
          })
          rule = rule.unique()
          if (rule.includes('required')) {
            let n = this.$message.warning('请将信息填写完整')
            this.messageCations[n.id] = n
          } else if (rule.includes('regex')) {
            this.$message.warning('只能输入字母、数字、下划线，且以字母开头')
          }
        })
    },
    checkEntFunc(ent, sonIndex) {
      let entVal = {}
      if (ent.length < 1) {
        this.$message({type: 'warning', message: '请添加实体对象！'})
        return false
      }
      for (let i = 0; i < ent.length; i++) {
        if (ent[i].show != '孙实体') {
          ent[i].description = ent[i].comment
          ent[i].desc = ent[i].comment
        }
        if (!entVal['desc' + ent[i].desc]) {
          entVal['desc' + ent[i].desc] = ent[i].desc
        } else {
          this.entBlurDescRepeatIndex = i
          if (document.getElementById('changeEntsDesc' + i) && ent[i].show == '子实体') {
            this.$message({message: '已存在子实体描述为【' + ent[i].desc + '】的bo实体', type: 'warning'})
            document
              .getElementById('changeEntsDesc' + i)
              .getElementsByTagName('div')[0]
              .lastElementChild.focus()
            document.getElementById('changeEntsDesc' + i).getElementsByTagName('div')[0].firstElementChild.style.border = '1px solid red'
          } else {
            this.$message({message: '已存在孙实体描述为【' + ent[i].desc + '】的bo实体', type: 'warning'})
            document
              .getElementById('changeGrandSonEntsDesc' + i)
              .getElementsByTagName('div')[0]
              .lastElementChild.focus()
            document.getElementById('changeGrandSonEntsDesc' + i).getElementsByTagName('div')[0].firstElementChild.style.border =
              '1px solid red'
          }
          return false
        }
        if (!entVal['name' + ent[i].name]) {
          entVal['name' + ent[i].name] = ent[i].name
        } else {
          this.entBlurNameRepeatIndex = i
          if (document.getElementById('entName' + i) && ent[i].show == '子实体') {
            this.$message({message: '已存在子实体名称为【' + ent[i].name + '】的bo实体', type: 'warning'})
            document
              .getElementById('entName' + i)
              .getElementsByTagName('div')[0]
              .lastElementChild.focus()
            document.getElementById('entName' + i).getElementsByTagName('div')[0].firstElementChild.style.border = '1px solid red'
          } else {
            this.$message({message: '已存在孙实体名称为【' + ent[i].name + '】的bo实体', type: 'warning'})
            document
              .getElementById('changeGrandSonEntsName' + i)
              .getElementsByTagName('div')[0]
              .lastElementChild.focus()
            document.getElementById('changeGrandSonEntsName' + i).getElementsByTagName('div')[0].firstElementChild.style.border =
              '1px solid red'
          }
          return false
        }
        if (ent[i].isExternal == '1') {
          ++this.extLen
          if (i != 0 && this.extLen > 1 && !ent[i].fk) {
            this.$message({
              message: '请给' + ent[i].comment + '实体添加外键！',
              type: 'warning'
            })
            return false
          }
        }
        if (ent[i].attributeList.length > 0) {
          if (!this.checkAttrFunc(ent[i], i, sonIndex)) {
            return false
          }
        } else {
          this.$message({message: '请添加字段！', type: 'warning'})
          return false
        }
        if (ent[i].children && ent[i].children.length > 0) {
          this.countAttrLength = 0
          if (!this.checkEntFunc(ent[i].children, i)) {
            return false
          }
        }
        this.countAttrLength = 0
      }
      return true
    },
    checkAttrFunc(ent, i, sonIndex) {
      let regPos = new RegExp('^\\d*(?:\\.\\d{1,2})?$')
      let attrVal = {}
      let attr = ent.attributeList
      for (let j = 0; j < attr.length; j++) {
        attr[j].desc = attr[j].comment
        if (attr[j].defaultValue == null) {
          attr[j].defaultValue = ''
        }
        attr[j].defaultValue = attr[j].defaultValue.trim()
        this.attrCommentElementId = attr[j].name + 'comment' + j
        if (ent.isExternal != '1') {
          if (!attrVal['name' + attr[j].name]) {
            attrVal['name' + attr[j].name] = attr[j].name
          } else {
            this.entAttrIndex = i
            if (sonIndex) {
              this.sonAttrIndex = sonIndex
            }
            this.attrNameElementId = attr;
            this.checkAttrNameIndex = j;
            const msg = '实体：'+ent.desc+'（'+ent.name+'）中存在重复字段名【'+attr[j].name+'】';
            this.$message({message: msg, type: 'warning'});
            document.getElementById(this.attrNameElementId[j].name + 'attrName' + j).focus();
            document
              .getElementById(this.attrNameElementId[j].name + 'attrName' + j)
              .getElementsByTagName('div')[0].firstElementChild.style.border = '1px solid red';
            return false
          }
          this.attrLenElementId = attr[j].name + 'attrLen' + j
          if (attr[j].attrLength && attr[j].attrLength !== 0) {
            if (!regPos.test(attr[j].attrLength)) {
              this.entAttrIndex = i
              if (sonIndex) {
                this.sonAttrIndex = sonIndex
              }
              document.getElementById(this.attrLenElementId).focus()
              document.getElementById(this.attrLenElementId).style.border = '1px solid red'
              let n = this.$message.warning('请输入正确数字')
              this.messageCations[n.id] = n
              return false
            }
          }
          this.attrDecimaElementId = attr[j].name + 'decima' + j
          if (attr[j].decimalLen && attr[j].decimalLen !== 0) {
            if (!regPos.test(attr[j].decimalLen)) {
              this.entAttrIndex = i
              if (sonIndex) {
                this.sonAttrIndex = sonIndex
              }
              document.getElementById(this.attrDecimaElementId).focus()
              document.getElementById(this.attrDecimaElementId).style.border = '1px solid red'
              let n = this.$message.warning('请输入正确数字')
              this.messageCations[n.id] = n
              return false
            }
          }
          if (attr[j].decimalLen) {
            if (attr[j].decimalLen.length > 1) {
              let decimalLen = attr[j].decimalLen.substr(0, 1)
              if (decimalLen == '0') {
                attr[j].decimalLen = attr[j].decimalLen.substr(1, attr[j].decimalLen.length)
              }
            }
            if (attr[j].decimalLen < 0 || attr[j].decimalLen > 30) {
              this.entAttrIndex = i
              if (sonIndex) {
                this.sonAttrIndex = sonIndex
              }
              document.getElementById(this.attrDecimaElementId).focus()
              document.getElementById(this.attrDecimaElementId).style.border = '1px solid red'
              this.$message({
                message: '小数长度不能小于0或者大于30',
                type: 'warning'
              })
              return false
            }
          }
          if (attr[j].dataType === 'varchar') {
            this.countAttrLength += parseInt(attr[j].attrLength)
          }
          if (attr[j].attrLength) {
            if (attr[j].attrLength.length > 1) {
              let attrLength = attr[j].attrLength.substr(0, 1)
              if (attrLength == '0') {
                attr[j].attrLength = attr[j].attrLength.substr(1, attr[j].attrLength.length)
              }
            }
            if (attr[j].dataType === 'varchar') {
              if (attr[j].attrLength < 1 || this.countAttrLength > 21500) {
                this.entAttrIndex = i
                if (sonIndex) {
                  this.sonAttrIndex = sonIndex
                }
                document.getElementById(this.attrLenElementId).focus()
                document.getElementById(this.attrLenElementId).style.border = '1px solid red'
                this.$message({
                  message: '整数长度不能小于1或者长度总和超出21500',
                  type: 'warning'
                })
                return false
              }
            }

            if (attr[j].dataType === 'number' || attr[j].dataType == '数字') {
              let defaultVal = attr[j].defaultValue.split('.')
              if (Number(attr[j].attrLength) < 1) {
                this.entAttrIndex = i
                if (sonIndex) {
                  this.sonAttrIndex = sonIndex
                }
                document.getElementById(this.attrLenElementId).focus()
                document.getElementById(this.attrLenElementId).style.border = '1px solid red'
                this.$message({
                  message: '整数长度不能小于1',
                  type: 'warning'
                })
                return false
              }
              if (Number(attr[j].attrLength) + Number(attr[j].decimalLen) > 38) {
                this.entAttrIndex = i
                if (sonIndex) {
                  this.sonAttrIndex = sonIndex
                }
                document.getElementById(this.attrLenElementId).focus()
                document.getElementById(this.attrLenElementId).style.border = '1px solid red'
                this.$message({
                  message: '整数长度与小数长度之和不能超过38',
                  type: 'warning'
                })
                return false
              }
              if (defaultVal[1] && Number(defaultVal[1].length) > Number(attr[j].decimalLen)) {
                this.defaultValueIndex = j
                this.defaultValueType = 'number'
                document.getElementsByName('defaultValue' + j)[0].focus()
                document.getElementsByName('defaultValue' + j)[0].style.border = '1px solid red'
                this.$message({
                  message: '默认值中小数长度超出设置值',
                  type: 'warning'
                })
                return false
              }
              if (attr[j].defaultValue && attr[j].defaultValue.length > 21) {
                this.defaultValueIndex = j
                this.defaultValueType = 'number'
                document.getElementsByName('defaultValue' + j)[0].focus()
                document.getElementsByName('defaultValue' + j)[0].style.border = '1px solid red'
                this.$message({message: '整数长度不能超过21', type: 'warning'})
                return false
              }
              if (!regPos.test(Number(attr[j].defaultValue))) {
                this.defaultValueIndex = j
                this.defaultValueType = 'number'
                document.getElementsByName('defaultValue' + j)[0].focus()
                document.getElementsByName('defaultValue' + j)[0].style.border = '1px solid red'
                this.$message({message: '默认值应为数字', type: 'warning'})
                return false
              }
            }
            let d = attr[j].defaultValue
            if (d.indexOf('.') > -1) {
              let i = d.indexOf('.')
              let start = d.substring(0, i)
              let end = d.substring(i + 1, attr[j].defaultValue.length)
              d = start + end
            }
            if (d.length > attr[j].attrLength + attr[j].decimalLen) {
              this.defaultValueIndex = j
              this.defaultValueType = 'varchar'
              document.getElementsByName('defaultValue' + j)[0].focus()
              document.getElementsByName('defaultValue' + j)[0].style.border = '1px solid red'
              this.$message({
                message: '默认值长度需小于整数长度',
                type: 'warning'
              })
              return false
            }
          } else if (attr[j].dataType === 'varchar' || attr[j].dataType === 'number') {
            this.entAttrIndex = i
            if (sonIndex) {
              this.sonAttrIndex = sonIndex
            }
            document.getElementById(this.attrLenElementId).focus()
            document.getElementById(this.attrLenElementId).style.border = '1px solid red'
            this.$message({message: '请添加整数长度', type: 'warning'})
            return false
          }
        }
      }
      return true
    },
    entBlur() {
      if (
        this.openGrandSonAttr &&
        this.formData.ents[this.entIndex].children[this.grandSonIndex].attributeList &&
        this.formData.ents[this.entIndex].children[this.grandSonIndex].attributeList.length > 0
      ) {
        this.formData.ents[this.entIndex].children[this.grandSonIndex].attributeList.forEach(item => {
          item.desc = item.comment
        })
      }
      if (typeof this.entBlurDescRepeatIndex == 'number') {
        if (document.getElementById('changeEntsDesc' + this.entBlurDescRepeatIndex)) {
          document
            .getElementById('changeEntsDesc' + this.entBlurDescRepeatIndex)
            .getElementsByTagName('div')[0].firstElementChild.style.border = ''
        }
        if (document.getElementById('changeGrandSonEntsDesc' + this.entBlurDescRepeatIndex)) {
          document
            .getElementById('changeGrandSonEntsDesc' + this.entBlurDescRepeatIndex)
            .getElementsByTagName('div')[0].firstElementChild.style.border = ''
        }
      }
      if (typeof this.entBlurNameRepeatIndex == 'number') {
        if (document.getElementById('entName' + this.entBlurNameRepeatIndex)) {
          document.getElementById('entName' + this.entBlurNameRepeatIndex).getElementsByTagName('div')[0].firstElementChild.style.border =
            ''
        }
        if (document.getElementById('changeGrandSonEntsName' + this.entBlurNameRepeatIndex)) {
          document
            .getElementById('changeGrandSonEntsName' + this.entBlurNameRepeatIndex)
            .getElementsByTagName('div')[0].firstElementChild.style.border = ''
        }
      }
      if (this.attrCommentElementId && document.getElementById(this.attrCommentElementId)) {
        document.getElementById(this.attrCommentElementId).getElementsByTagName('div')[0].firstElementChild.style.border = ''
      }
      if (typeof this.checkAttrNameIndex == 'number') {
        if (
          document.getElementById(
            this.formData.ents[this.entAttrIndex].attributeList[this.checkAttrNameIndex].name + 'attrName' + this.checkAttrNameIndex
          )
        ) {
          document
            .getElementById(
              this.formData.ents[this.entAttrIndex].attributeList[this.checkAttrNameIndex].name + 'attrName' + this.checkAttrNameIndex
            )
            .getElementsByTagName('div')[0].firstElementChild.style.border = ''
        }
        let sonAttr = this.formData.ents[this.sonAttrIndex]
        if (sonAttr) {
          document
            .getElementById(
              sonAttr.children[this.entAttrIndex].attributeList[this.checkAttrNameIndex].name + 'attrName' + this.checkAttrNameIndex
            )
            .getElementsByTagName('div')[0].firstElementChild.style.border = ''
        }
        this.checkAttrNameIndex = null
      }
      if (this.defaultValueType) {
        document.getElementsByName('defaultValue' + this.defaultValueIndex)[0].style.border = ''
        this.defaultValueType = null
      }
      if (this.attrLenElementId && document.getElementById(this.attrLenElementId)) {
        document.getElementById(this.attrLenElementId).style.border = ''
      }
      if (this.attrDecimaElementId && document.getElementById(this.attrDecimaElementId)) {
        document.getElementById(this.attrDecimaElementId).style.border = ''
      }
    },
    //发布并保存实体
    deployedEntData() {
      let formData = this.formData
      this.formData.deployed = true
      let _this = this
      let loading = this.$loading()
      form
        .saveEntData(this.formData)
        .then(resp => {
          if (resp.data.state) {
            this.$confirm('发布成功，是否跳转到业务表单页面？', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            })
              .then(() => {
                loading.close()
                //this.handleDialogClose();
                if (!formData.id) {
                  formData.id = resp.data.message
                  formData.pkVal = resp.data.message
                }
                _this.$refs.formTemplateDialog.showDialog(formData.id)
              })
              .catch(() => {
                loading.close()
                this.handleDialogClose()
                this.dataView.id = ''
              })
          }
        })
        .catch(() => {
          this.formData.deployed = false
        })
    },
    //保存实体
    saveEntData() {
      let loading = this.$loading()
      let formData = this.formData
      if (this.isSave) {
        this.formData.deployed = true
      }
      form.saveEntData(this.formData).then(resp => {
        if (resp.data.state) {
          if (!this.isSave) {
            this.$confirm('保存成功，是否退出？', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            })
              .then(() => {
                loading.close()
                this.$emit('loadTableData')
                this.handleDialogClose()
                this.dataView.id = ''
              })
              .catch(() => {
                loading.close()
                if (resp.data.message != null) {
                  this.dataView.id = resp.data.message
                }
                this.$emit('opreta', 'edit')
                this.$emit('opretaId', this.dataView.id)
              })
          } else {
            this.$confirm('保存成功，是否跳转到业务表单页面', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            })
              .then(() => {
                if (this.isSave) {
                  if (!formData.id) {
                    formData.id = resp.data.message
                    formData.pkVal = resp.data.message
                  }
                  this.$refs.formTemplateDialog.showDialog(formData.id)
                }
              })
              .catch(() => {
                this.$emit('loadTableData')
                this.handleDialogClose()
                this.dataView.id = ''
              }).finally(()=>loading.close())
          }
        }
      })
    },
    conFirmTemplate(templateModel) {
      this.$router.push({
        path: '/form#formManager',
        query: {
          bos: [this.formData],
          templateConf: templateModel
        }
      })
    },
    cancelFirmTemplate() {
      this.handleDialogClose()
    },
    //外部表数据加入表单
    handleSelectExternal(externalEnt) {
      let {entExts, addFk, entExtsTable} = externalEnt

      let selectEnt = this.entIndex
      this.entIndex = entExts.index
      let data = {}
      if (this.formData.ents.length == 0 && !addFk) {
        entExts.show = '主实体-外'
        entExts.relation = 'main'
        this.formData.ents.splice(this.entIndex, 1, entExts)
        this.formData.ents[this.entIndex].attributeList = entExtsTable
        data = this.formData.ents[this.entIndex]
      } else if (entExts.type == 'sunTable' && !addFk) {
        if (!this.formData.ents[selectEnt].children) {
          this.$set(this.formData.ents[selectEnt], 'children', [])
        }
        this.formData.ents[selectEnt].children.push(entExts)
        this.grandSonIndex = this.formData.ents[selectEnt].children.length - 1
        this.formData.ents[selectEnt].children[this.grandSonIndex].attributeList = entExtsTable
        data = this.formData.ents[selectEnt].children[this.grandSonIndex]
        data.desc = entExts.comment
        data.name = entExts.name
        data.show = '孙实体-外'
      } else if (!addFk) {
        this.formData.ents.push(entExts)
        this.formData.ents[this.entIndex].attributeList = entExtsTable
        data = this.formData.ents[this.entIndex]
      } else if (addFk) {
        this.entIndex = selectEnt
        this.formData.ents[selectEnt].fk = entExts.fk
        this.formData.ents[selectEnt].attributeList = entExtsTable
        data = this.formData.ents[selectEnt]
      }
      let _this = this
      data.attributeList = data.attributeList.filter(item => {
        let val = item.name.toUpperCase()
        return (
          val != entExts.pk.toUpperCase() &&
          val != 'F_FORM_DATA_REV_' &&
          val != 'REF_ID_' &&
          (!entExts.fk || val != entExts.fk.toUpperCase()) &&
          val.toUpperCase() != 'TENANT_ID_'
        )
      })
      data.attributeList.forEach((item, index) => {
        item.index = index + 1
        // 数字类型长度
        if (item.attrLength == 0 && item.intLen != 0) {
          item.attrLength = item.intLen
        }
      })
      if (entExts.type == 'sunTable') {
        this.getGrandSonEntsByIndex(this.grandSonIndex, selectEnt)
      } else {
        this.getEntsByIndex(this.entIndex)
      }
    },
    //创建表单
    createTableForm() {
      if (!this.dataView.id) {
        this.deployedEntData()
      } else {
        this.isSave = true
        //this.saveEntData();
        this.deployedEntData()
      }
    },
    chineseFormat(id, list, param, index, v) {
      let _this = this
      let d = document.getElementById(id)
      // disabled 或者 readonly 时 不需要请求
      let timer = null
      if (d === null || d.__vue__.disabled || d.__vue__.readonly || !v) return
      if (timer) {
        clearTimeout(timer)
      }
      timer = setTimeout(function() {
        req
          .request({
            url: `${window.context.uc}/base/tools/v1/getPinyin`,
            method: 'GET',
            params: {chinese: v, type: 0}
          })
          .then(res => {
            if (res.data.state) {
              list[index][param] = res.data.value
              main.$nextTick(() => {
                main.$validator.validate()
              })
            }
          })
      }, 500)
    },
    addExternalTable(tableName) {
      // 添加外部表
      this.externalTables.push(tableName)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/css/element-variables.scss';

.cd-column__dialog {
  /deep/ .el-dialog {
    .el-dialog__header {
      padding: 8px 15px;
      border-color: $--border-color-base;
    }

    .el-dialog__body {
      padding: 0;
      height: calc(100% - 50px);
    }
  }

  .cd-column__form {
    background: $--background-color-secondary;
    padding: 0 10px 10px 10px;
    height: calc(100% - 10px);
  }
  .aside-tree__wrap{
    position: relative;
  }
.navbar-collapse{
    margin-top: 68px;
    width: 0;
  }
  .navbar-collapse-bg{
    margin-left: 1px;
    height: 28px;
    border-top: 8px solid transparent;
    border-bottom: 8px solid transparent;
    border-left: 10px solid #f5f5f5;
    border-right: none;
    position: relative;
  }
  .navbar-collapse-bg:hover{
    cursor: pointer;
  }
  .navbar-collapse-arrow{
    position: absolute;
    left: -12px;
    top: 7px;
  }
}

.container {
  height: 100%;

  .el-header {
    padding: 0;
  }
  .el-container {
    margin-top: 15px;
    height: calc(100% - 70px);
  }
  .el-main {
    padding: 0;
  }
}
</style>
