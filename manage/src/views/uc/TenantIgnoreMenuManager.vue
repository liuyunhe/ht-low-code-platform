<template>
  <div class="fullheight">
      <ht-tree
          :data="baseMenuList"
          :props="{label:'name'}"
          support-filter
          @node-click="handleNodeClick"
        ></ht-tree>
  </div>
</template>
<script>

export default {
   name: "tenantMailSereverManager",
   props: {
    tenantId: String
  },
  data() {
    return {
      dialogVisible: false,
      baseMenuList: [],
      tenantIgnoreMenus:[],
    };
  },
  mounted() {
    this.$validator = this.$root.$validator;
    let url = "${uc}/uc/tenantMailServer/v1/getByCurrent";
    if(this.tenantId){
        url += "?tenantId="+this.tenantId;
    }
    this.$http.get(url).then(resp => {
        this.tenantMailServer = resp.data;
    }, error => {
        reject(error);
    })
  },
  methods: {
    handleNodeClick(){

    }
  }
};
</script>

<style lang="scss" scoped>
.sp-manager__dialog /deep/ > .el-dialog > .el-dialog__body {
  height: calc(100% - 170px);
}
</style>
