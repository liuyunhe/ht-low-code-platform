<template>
  <div class="amap-page-container" :style="{width:'100%',height:heightMap+'px'}" v-if="plugin.length>0">
    <el-amap-search-box
      class="search-box"
      :search-option="searchOption"
      :on-search-result="onSearchResult"
    ></el-amap-search-box>
    <el-amap
      vid="amap"
      :plugin="plugin"
      :center="mapCenter"
      class="amap-demo"
      :zoom="zoom"
      :resizeEnable="resizeEnable"
    >
      <el-amap-marker v-for="(marker,$index) in markers" :key="$index" :position="marker"></el-amap-marker>
    </el-amap>
  </div>
</template>
<script>
import VueAMap from "vue-amap"; //高德地图插件
VueAMap.initAMapApiLoader({
  // 高德的key
  key: "1f8f479e9b787974efaa9bda1bf8ef92",
  // 插件集合
  plugin: [
    "AMap.Autocomplete",
    "AMap.PlaceSearch",
    "AMap.Scale",
    "AMap.OverView",
    "AMap.ToolBar",
    "AMap.MapType",
    "AMap.PolyEditor",
    "AMap.CircleEditor",
    "AMap.Geolocation",
    "AMap.Autocomplete",
    "AMap.PlaceSearch"
  ],
  // 默认高德 sdk 版本为 1.4.4
  v: "1.4.4"
});
import utils from "@/utils.js";
export default {
  name: "eip-map",
  props: ["heightMap", "addressMap"],
  data() {
    const self = this;
    return {
      mapCenter: [121.59996, 31.197646],
      markers: [],
      address: "",
      zoom: 12,
      resizeEnable: true,
      lng: 0,
      lat: 0,
      loaded: false,
      searchOption: {
        //poi搜索条件  默认全国
        city: "全国",
        citylimit: false //是否限制城市内搜索
      },
      plugin: [],
    };
  },
  methods: {
    onSearchResult(pois) {
      let latSum = 0;
      let lngSum = 0;
      if (pois.length > 0) {
        //获取选择的地址经纬度
        this.mapCenter = [pois[0].lng, pois[0].lat];
        if (
          this.markers.length > 0 &&
          this.markers[0][0] != this.mapCenter[0] &&
          this.markers[0][1] != this.mapCenter[1]
        ) {
          this.markers = []; //清空经纬度
          this.markers.push([pois[0].lng, pois[0].lat]);
        } else if (this.markers.length == 0) {
          this.markers.push([pois[0].lng, pois[0].lat]);
        }
        //判断地图返回的地址是否有绑定的字段
        if (this.addressMap) {
          const pInst = utils.getOnlineFormInstance(this);
          //赋值给绑定的字段
          utils.setValueByPath(pInst, this.addressMap, pois[0].address+"."+pois[0].name,null);
        }
      }
    }
  },
  mounted() {
    const self = this;
    setTimeout(()=>{
      self.plugin=[
        "AMap.Scale",
        "AMap.ToolBar",
        "AMap.Autocomplete",
        {
          enableHighAccuracy: true, //是否使用高精度定位，默认:true
          timeout: 10000, //超过10秒后停止定位，默认：5s
          buttonPosition: "RB", //定位按钮的停靠位置
          buttonOffset: new AMap.Pixel(5, 10), //定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
          zoomToAccuracy: true, //定位成功后是否自动调整地图视野到定位点
          markerOptions: {
            //自定义定位点样式，同Marker的Options
            offset: new AMap.Pixel(-18, -36),
            content:
              '<img src="https://a.amap.com/jsapi_demos/static/resource/img/user.png" style="width:36px;height:36px"/>'
          },
          showCircle: true, //是否显示定位精度圈
          circleOptions: {
            //定位精度圈的样式
            strokeColor: "#0093FF",
            noSelect: true,
            strokeOpacity: 0.5,
            strokeWeight: 1,
            fillColor: "#02B0FF",
            fillOpacity: 0.25
          },
          extensions: "all",
          pName: "Geolocation",
          events: {
            init(o) {
              if (!self.address) {
                // o 是高德地图定位插件实例  获取当前位置
                o.getCurrentPosition((status, result) => {
                  if (result && result.position) {
                    self.lng = result.position.lng;
                    self.lat = result.position.lat;
                    self.center = [self.lng, self.lat];
                    self.loaded = true;
                    self.$nextTick();
                  }
                });
              }
            }
          }
        },
        {
          //poi搜索插件
          pName: "PlaceSearch",
          events: {
            init(o) {
              if (self.address) {
                var placeSearch = new AMap.PlaceSearch({
                  city: "全国"
                });
                placeSearch.search(self.address, function(status, result) {
                  if (result.info == "OK") {
                    self.mapCenter = [
                      result.poiList.pois[0].location.lng,
                      result.poiList.pois[0].location.lat
                    ];
                    self.markers.push([
                      result.poiList.pois[0].location.lng,
                      result.poiList.pois[0].location.lat
                    ]);
                  }
                });
              }
            }
          }
        }
      ];
      //判断地图返回的地址是否有绑定的字段
      if (self.addressMap) {
        const pInst = utils.getOnlineFormInstance(self);
        //获取绑定字段的值
        self.address = utils.getValueByPath(pInst, self.addressMap,null);
      }
    },500);
  }
};
</script>
<style>
.search-box {
  position: absolute !important;
  top: 10px;
  right: 10px;
}
.amap-page-container {
  position: relative;
}
.el-vue-search-box-container .search-tips {
  position: absolute;
  top: 100%;
  height: 280px;
  border: 0 !important;
  background: #fff;
  overflow: auto;
}
</style>