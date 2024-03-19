//function(req,data,i18n,Message,Loading,formVm,_this){}

//先自我折叠
// console.log(_this);
const $btn=$(_this.$el).find('button')
const $table=$(_this.$el).parents('table');
const $row=$(_this.$el).parents('.el-row');
const $broRows=$row.siblings();
const keys=['waiting_sign_json','attach_json']
if($btn.text()=='收起'){
    $broRows.each(function(index){
        $(this).hide();
        const $item=$(this).find(`div[model-name]`)
        if($item.length===1){
           const val= $item.attr('model-name').replace('item.','');
           if(keys.includes(val)){
            $(this).show();
           }
        }
    })

    $btn.text('展开')
}
else if($btn.text()=='展开'){
    $broRows.each(function(index){
        $(this).show();
    })
    $btn.text('收起')
}

//再折叠其它的子表