<template>
  <div></div>
</template>
<script>
export default {
  created() {
    if (this.$route.params) {
      let type = this.$route.params.type
      let id = this.$route.params.id
      let frombrowser = this.browserRedirect()
      if ('pc' == frombrowser) {
        if (type == 'task') {
          this.$router.push('/task/' + id + '/0')
        } else if (type == 'instance') {
          this.$router.push('/instRead/' + id + '/myRequest')
        }
      } else {
        let baseUrl = window.context.mobile
        let url = ''
        if (type == 'task') {
          url = '/task/' + id + '/0'
        } else if (type == 'instance') {
          url = '/instRead/' + id + '/myRequest'
        }
        window.location.href = baseUrl + url
      }
    }
  },
  methods: {
    browserRedirect() {
      var sUserAgent = navigator.userAgent.toLowerCase()
      var bIsIpad = sUserAgent.match(/ipad/i) == 'ipad'
      var bIsIphoneOs = sUserAgent.match(/iphone os/i) == 'iphone os'
      var bIsMidp = sUserAgent.match(/midp/i) == 'midp'
      var bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == 'rv:1.2.3.4'
      var bIsUc = sUserAgent.match(/ucweb/i) == 'ucweb'
      var bIsAndroid = sUserAgent.match(/android/i) == 'android'
      var bIsCE = sUserAgent.match(/windows ce/i) == 'windows ce'
      var bIsWM = sUserAgent.match(/windows mobile/i) == 'windows mobile'
      document.writeln('您的浏览设备为：')
      if (
        bIsIpad ||
        bIsIphoneOs ||
        bIsMidp ||
        bIsUc7 ||
        bIsUc ||
        bIsAndroid ||
        bIsCE ||
        bIsWM
      ) {
        return 'mobile'
      } else {
        return 'pc'
      }
    },
  },
}
</script>