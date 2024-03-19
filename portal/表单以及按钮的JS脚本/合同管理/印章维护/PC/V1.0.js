/**
 * ccwgq 印章维护脚本
 * @version 1.0 HtFile组件报错
 */

 const modelName = "d_stampers";
 const mainData = _this.data[modelName];
 const mainPermission = _this.permission['fields'][modelName];
 
 function addWatch() {
     //电子印章时，安心签id和图片必填
     _this.$watch('data.' + modelName + '.sta_type', function(val) {
         if (['92'].includes(val)) {
             mainPermission['cfc_sta_id'] = 'b';
             // mainPermission['attach_json'] = 'b';
         } else {
             mainPermission['cfc_sta_id'] = 'w';
             // mainPermission['attach_json'] = 'w';
         }
     })
 }
 
 addWatch();