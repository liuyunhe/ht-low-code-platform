<template>
    <el-dialog
      class="form-editor-dialog"
      destroy-on-close
      :visible="previewShow"
      :before-close="() => previewShow=false"
    >
      <ht-column :column-alias="previewAlias" v-if="previewShow" :fromPreview="true"/>
    </el-dialog>
</template>
<script>
let Base64 = require('js-base64').Base64;
import HtColumn from "@/components/common/HtColumn.vue";
export default {
    props:{
        previewAlias:{
            type:String
        }
    },
    components:{HtColumn},
    data(){
        return{
            previewShow:true
        }
    },
    created(){

    },
    methods:{

    }
}
</script>