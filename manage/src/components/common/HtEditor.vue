<template>
  <div>
    <div v-if="config">
     <vue-ueditor-wrap v-model="inputVal" :config="config"></vue-ueditor-wrap>
    </div>
    <div v-if="!config">
     <vue-ueditor-wrap v-model="inputVal" :config="ueditorConf"></vue-ueditor-wrap>
    </div>
  </div>
</template>

<script>

export default {
  name: "ht-ueditor",
  props: {
    config: {
      type: Object,
      default(){
        return {};
      }
    },
    value: {
      type: String,
      default: ""
    },
  },
  data() {
    return {
      defaultConf : {
        initialFrameHeight: 240,
        UEDITOR_HOME_URL: window.location.origin +'/'+ window.location.pathname.split('/')[1]+'/static/ueditor/',
        toolbars: [
          [
            // 'source', //源代码
            'undo', //撤销
            'bold', //加粗
            'indent', //首行缩进
            'italic', //斜体
            'underline', //下划线
            'strikethrough', //删除线
            'subscript', //下标
            'fontborder', //字符边框
            'superscript', //上标
            'formatmatch', //格式刷
            'forecolor',//字体颜色
            'justifyleft', //居左对齐
            'justifycenter', //居中对齐
            'justifyright', //居右对齐
            'justifyjustify', //两端对齐
            'fontfamily', //字体
            'fontsize', //字号
            'insertorderedlist', //有序列表
            'insertunorderedlist', //无序列表
            'lineheight',//行间距
            'inserttable', //插入表格
            'link', //超链接
            'simpleupload', //单图上传
            'insertimage', //多图上传
            'attachment', //附件
          ]
        ],
        // 初始容器宽度
        initialFrameWidth: "100%",
        zIndex:9999,
        enableAutoSave: false,
        readonly : false
      },
    }
  },
  computed: {
    inputVal: {
      get: function() {
        return this.value;
      },
      set: function(val) {
        this.$emit("input", val);
      }
    },
    ueditorConf: function() {
      return {...this.defaultConf,...this.config};
    }
  },
};
</script>

<style lang="scss" scoped>


</style>