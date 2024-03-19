<template>
  <div class="opinion-container">
    <!-- <textarea
      placeholder="请输入意见内容......"
      rows="3"
      maxlength="500"
      @input="opinionInput"
      v-model="opinion"
      :validate="'email'"
    /> -->
    <vue-ueditor-wrap
      ref="vue_ueditor_wrap"
      v-model="opinion"
      :config="ueditor_config"
    ></vue-ueditor-wrap>

    <el-row style="padding: 10px; background: #fafafa">
      <el-col :span="22">
        <el-button
          @click="addCommonOpinion"
          title="添加常用语"
          icon="el-icon-plus"
          size="mini"
          style="margin-right: 10px"
        />
        <span>常用语：</span>
        <span v-for="commonOpinion in approvalItem" :key="commonOpinion">
          <el-tag
            @click.native="choseCommonOpinion(commonOpinion)"
            v-if="commonOpinion.length > 30"
            >{{ commonOpinion.substring(0, 30) }}...</el-tag
          >
          <el-tag v-else @click.native="choseCommonOpinion(commonOpinion)">{{
            commonOpinion
          }}</el-tag>
        </span>
      </el-col>
      <el-col :span="2" class="number-opinion">
        <span :span="2">{{ wordCount }}/500</span>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import {mapState, mapActions} from 'vuex'
import bpmDeputy from '../../api/bpmDeputy'
// import EipTextarea from '@/components/eipControl/EipTextarea.vue'

export default {
  name: 'opinionText',
  props: ['procDefKey', 'text'],
  data() {
    return {
      wordCount: 0,
      opinion: this.text || '',
      ueditor_config: {
        // 设置编辑器不自动被内容撑高
        autoHeightEnabled: false,
        // 初始容器高度
        initialFrameHeight: 160,
        // 初始容器宽度
        initialFrameWidth: '100%',
        wordCount: false,
        toolbars: [],
        elementPathEnabled: false ,//是否启用元素路径，默认是true显示
        				UEDITOR_HOME_URL: window.location.origin +'/'+ window.location.pathname.split('/')[1]+'/static/ueditor/',
      }
    }
  },
  components: {
    // EipTextarea
  },
  watch: {
    text: function(newVal, oldVal) {
      console.log('opinion text===>', newVal)
      this.opinion = newVal //newVal即是instId
    },
    opinion: function (newVal, oldVal) {
      // this.$emit('getOpinion', this.opinion.replace(/<[^>]+>/g, ''))
      this.$emit('getOpinion', this.opinion)
    }
  },
  computed: mapState({
    approvalItem: state => state.storeProcess.approvalItem
  }),
  methods: {

    opinionInput() {
      this.wordCount = this.opinion.length
    },
    choseCommonOpinion(commonOpinion) {
      //先判断输入长度不可大于500长度
      let strLength = this.opinion + commonOpinion
      if (strLength.length < 500) {
        this.opinion = _.cloneDeep(strLength)
        this.opinionInput()
      }
    },
    getOpinion() {
      return this.opinion
    },
    getText(text){
      this.opinion=text
    },
    addCommonOpinion() {
      if (!this.opinion) {
        this.$message.warning('请输入审批意见')
        return
      }
      this.$confirm("确认添加'" + this.opinion.replace(/<[^>]+>/g, '') + "'为常用语？")
        .then(() => {
          let param = {
            expression: this.opinion.replace(/<[^>]+>/g, ''),
            departmentId: '',
            postId: '',
            roleId: '',
            type: 4
          }
          bpmDeputy.addApprovalItem(param).then(data => {
            if (data.state) {
              this.$message({type: 'success', message: data.message})
              this.$store.dispatch(
                'storeProcess/getApprovalByDefKeyAndTypeId',
                this.procDefKey
              )
            }
          })
        })
        .catch(() => {})
    }
  },
  created() {
    this.$store.dispatch(
      'storeProcess/getApprovalByDefKeyAndTypeId',
      this.procDefKey
    )
  }
}
</script>
<style lang="scss" scoped>
@import '@/assets/css/element-variables.scss';
.opinion-container {
  // border: 1px solid #ebeef5;
}

.opinion-container > vue-ueditor-wrap {
  // padding: 5px;
  // margin-bottom: -3px;
  border: none;
  // width: calc(100% - 10px);
  width: 100%;
  resize: none;
  outline: none;
}

.number-opinion {
  text-align: right;
}

.el-tag {
  margin-right: 7px;
  height: 23px;
  line-height: 21px;
  color: #666;
  background-color: transparent;
  border-color: #ebeef5;
  cursor: pointer;
}

.el-tag:hover {
  border-color: $--theme-color;
  color: $--theme-color;
}
</style>