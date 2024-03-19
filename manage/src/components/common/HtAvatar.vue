<template>
  <el-avatar :src="userPhoto">
    <img :src="userPhoto" />
  </el-avatar>
</template>

<script>
export default {
  props: ["user"],
  data() {
    return {
      userPhoto: null,
      userPhotoUrl: null,
      defaultUserPhoto: window.context.manage +  "/img/defaultPhoto.jpg"
    };
  },
  watch: {
    user: {
      handler: function(val, oldVal) {
        if (val && val.user && val.user.photo && val !== oldVal && val.user.photo != '/img/defaultPhoto.jpg' ) {
          this.$store.dispatch("menu/downloadImg",val.user.photo).then(res => {
            if (res != "") {
              this.userPhoto =  res;
            }else{
              this.userPhoto = this.defaultUserPhoto;
            }
          });
        } else {
          this.userPhoto = this.defaultUserPhoto;
        }
      },
      deep: true
    }
  }
};
</script>
