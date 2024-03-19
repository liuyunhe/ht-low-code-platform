<template>
    <el-container>
      <el-main>
          <div class="tab-bar">
             我的通讯录
          </div>
          <tabBar :activeIndex="5"></tabBar>
      </el-main>
    </el-container>
    
</template>

<script>
const tabBar = () => import("@/components/tabbar/TabBar.vue");
export default {
    components:{tabBar},
}

</script>