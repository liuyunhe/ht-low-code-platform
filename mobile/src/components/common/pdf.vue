<template>
  <div>
    <!--    ccwgq 2021-10-09 考虑实际小屏的情况，启用小型分页-->
    <!--    https://element.eleme.cn/#/zh-CN/component/pagination-->
    <el-pagination
      :small="true"
      background
      layout="prev, pager, next"
      :page-count="numberPages"
      :current-page.sync="currentPage"
      ref="elPage"
    >
    </el-pagination>
    <div style="transform-origin:0 0" id="touchPad" @click="pageChange">
      <Vpdf :src="src" :page="currentPage" ref="pdfs"></Vpdf>
    </div>
  </div>
</template>

<script>
import req from '@/request.js'
import Vpdf from 'vue-pdf'
export default {
  name: 'pdf',
  props: {
    src: String
  },
  data() {
    return {
      visiable: false,
      pdfSrc: '',
      numberPages: 0,
      currentPage: 1
    }
  },
  watch: {
    currentPage: function(newVal) {
      this.$emit('pageChange')
    }
  },
  methods: {
    handleOpen() {
      this.visiable = true
    },
    //ccwgq 2021-10-09  修正pdf只显示一页的问题
    //用新的initPdf1代替原来的initPdf,如果还原代码,则不使用initPdf1而是使用initPdf
    async initPdf1() {
      let this_ = this
      const pdfRes = await Vpdf.createLoadingTask(this.src).promise
      if (pdfRes.numPages) {
        this_.numberPages = pdfRes.numPages
        this_.$emit('pdf-loaded')
      }
    },
    initPdf() {
      let this_ = this
      Vpdf.createLoadingTask(this.src).then(pdf => {
        this_.numberPages = pdf.numPages
      })
    },
    pageChange(event) {
      let middle = event.target.offsetWidth / 2
      let clientX = event.clientX
      if (clientX > middle) {
        //下一页
        this.$refs.elPage.next()
      } else {
        this.$refs.elPage.prev()
      }
    }
  },
  mounted() {
    //ccwgq 2021-10-09 修正pdf只显示一页
    // this.initPdf()
    this.initPdf1()
  },
  components: {
    Vpdf
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/css/element-variables.scss';
.pdf__iframe {
  width: 100%;
  height: 100%;
  border: 0;
}
</style>
