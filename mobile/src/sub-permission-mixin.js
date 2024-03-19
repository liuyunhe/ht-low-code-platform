export default {
    data() {
     return {
        permission_sub: null,
        sub_work: false,
     }
    },
    watch: {
        permission: {
          handler(newVal, oldVal) {
            if(!this.sub_work){
              this.permission_sub = _.cloneDeep(newVal);
            }
          }
        }
    },
    created() {
        this.permission_sub = _.cloneDeep(this.permission);
    }
}