<template>
  <el-dropdown class="international" @command="handleSetLanguage"  placement="left-start">
    <span class="theme-color">{{$t('selectLang.switchLang')}}</span>
    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item :disabled="$i18n.locale==='zh-CN'" command="zh-CN">中文</el-dropdown-item>
      <el-dropdown-item :disabled="$i18n.locale==='en-US'" command="en-US">English</el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
import moment from 'moment';//日期格式化插件
export default {
  name:"lang-select",
  computed: {
    language() {
      return localStorage.getItem("lang")||"zh-CN"
    }
  },
  methods: {
    handleSetLanguage(lang) {
      this.$i18n.locale = lang
      this.$validator.locale = lang

      // 日期控件格式化
      if("zh-CN"==lang){
        moment.locale('zh-cn');
      }else{
        moment.locale('en');
      }

      localStorage.setItem("lang",lang)
      this.$message({
        message: this.$t('selectLang.switchLangMsg'),
        type: 'success'
      })
      if(this.$route.path.indexOf("login")==-1){
        window.location.reload();
      }
      
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/css/element-variables.scss";
.theme-color{
  color: $--color-text-regular;
}
</style>