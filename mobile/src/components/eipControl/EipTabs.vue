<template>
  <el-tabs
    v-model="val"
    :tab-position="tabPosition"
    :before-leave="beforeLeave"
    :type="type"
    ref="tabs"
  >
    <slot></slot>
  </el-tabs>
</template>

<script>
export default {
  name: "eip-tabs",
  components: {},
  props: ["tabsValue", "tabPosition", "beforeLeave", "type"],
  data() {
    return {
      val: this.tabsValue,
    };
  },
  mounted() {
    let me_=this;
    this.$refs.tabs.$watch(
            "panes",
            function(newValPanes) {
              me_.val=me_.getShowPanes(me_.val);
            }
    );
  },
  methods:{
    getShowPanes(key){
      let panes= this.$refs.tabs.panes
      let name="";
      let flag=false;
      for (let i = 0; i <panes.length ; i++) {
        if (panes[i].name==key) {
          flag=true;
        }
        if(panes[i].$attrs.isShow && ! name ){
          name=panes[i].name;
        }
      }
      if (flag){
        return key;
      }else{
        return name;
      }

    },
  },
};
</script>
