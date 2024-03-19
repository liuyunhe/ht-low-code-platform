<#macro subDiv layout>
<#assign subTablePath=layout.options.subTablePath>
<#assign subDivTablePath=layout.options.subDivTablePath>
<#assign subListPath=layout.options.subTablePath>
<#assign sunBos=util.getSunBos(layout.list)>
<#assign hasLinkage=util.getHasLinkage(layout.list)>
<el-container sunBos="${sunBos}" v-if="!permission.table.${layout.options.boSubEntity}.hidden">
  <el-header style="height:30px;line-height:30px;background: #fafafa; font-weight: bold;font-size: 14px;">
    <#--  ccwgq 2022-04-08 增加头部计数的功能  -->
    ${layout.desc}({{data.${subDivTablePath}.length}})
     <div v-if="permission.table.${layout.options.boSubEntity}.del && '${layout.options.relation}'!='onetoone'"  :style="{display:'inline-block',float:'right'}">
      <el-button type="text" icon="el-icon-delete" size="mini" :style="{padding:'0px 5px'}" @click="clearAll('${subTablePath}')">
          清空
      </el-button>
     </div>
     <#if layout.subtableBackfill>
      ${getSubDialog(layout)}
     </#if>
      <#if layout.options.relation!='onetoone'>
          <el-button
                  v-if="permission.table.${layout.options.boSubEntity}.add"
                  size="small"
                  type="text"
                  icon="el-icon-plus"
                  @click="addSubTab('data.${subTablePath}')"
                  :disabled="isShowAddButton('data.${subDivTablePath}',${layout.options.maxRow})"
          >{{$t('common.add')}}</el-button>
      </#if>
      <#if layout.options.relation=='onetoone'>
                  <el-button
                          v-show="'${layout.options.relation}'=='onetoone' && data.${subTablePath}.length<1"
                          v-if="permission.table.${layout.options.boSubEntity}.add"
                          size="small"
                          type="text"
                          icon="el-icon-plus"
                          @click="addSubTab('data.${subTablePath}')"
                  >{{$t('common.add')}}</el-button>
      </#if>
      <#if layout.customQuery && layout.customQuery.alias?? >
      ${getSubtableCustomQueryBackfill(layout)}
     </#if>
  </el-header>
  <el-main>
      <div class="formT_box">
          <div class="xh_table" id="xh_tablegd_${subListPath}" v-tableDrag>
              <div class="xh_hdleft" :style="left_image" id="lefthk_${subListPath}" @click="xhleft('${subListPath}')"></div>
              <table class="form-table" cellspacing="0" cellpadding="0" border="0" v-for="(item, index) in data.${subTablePath}" :key="item.sub_guid || index" :sub-index="index" :data-index="index" data-subname="data.${subTablePath}" :row_readonly="item.sub_row_readonly" >
                  <tbody>
                  <tr>
                      <td colspan="15">
                          <#list layout.list as field>
                            <#if (field.ctrlType != 'suntable' && field.ctrlType != 'sunDiv')>
                                  <#if field.ctrlType=='grid'>
                                      <el-row type="flex" <#if hasLinkage == true>  v-if="(!permission || !permission.subFields) ||(permission.subFields && !(${util.getSubRowPermission(field.columns)}) )" </#if> :gutter="${field.options.gutter}" justify="${field.options.justify}" align="${field.options.align}">
                                          <#list field.columns as gridGroup>
                                              <el-col :span="${gridGroup.span}" style="${gridGroup.style}">
                                                  <#list gridGroup.list as gridField>
                                                      ${getFormItem(gridField,2,hasLinkage)}
                                                  </#list>
                                              </el-col>
                                          </#list>
                                      </el-row>
                                      <#if field_index==0>
                                       <el-row v-if="isMobile">
                                            <el-button data-path="${subDivTablePath}"
                                            type="primary" style="width:100%;" class="collapse-button__sub" @click="collapseBtn($event.target,'${subListPath}')">收起</el-button>
                                       </el-row>
                                      </#if>
                                  <#else>
                                  <el-row <#if !field.options.noBindModel || util.isNoAttrField(field)> v-if="${getPermission(field,true)}!='n' && !(permission.sub_${field.tableName} && permission.sub_${field.tableName}.${field.name}index !='n')" </#if>>
                                           ${getFormItem(field,2,hasLinkage)}
                                       </el-row>
                                   <#--  ccwgq 2022-04-07 加入折叠按钮控制  -->
                                   <#if field_index==0>
                                       <el-row v-if="isMobile">
                                            <el-button data-path="${subDivTablePath}"
                                            type="primary" style="width:100%;" class="collapse-button__sub" @click="collapseBtn($event.target,'${subListPath}')">收起</el-button>
                                       </el-row>
                                   </#if>
                                  </#if>
                             <#else>
                                <el-row  v-if="!permission.table.${field.name}.hidden">
                                    <#if field.ctrlType == 'suntable'>
                                        <@sunTable layout=field />
                                    <#else>
                                        <@sunDiv layout=field />
                                    </#if>
                                </el-row>
                            </#if>
                        </#list>
                      </td>
                  </tr>
                  </tbody>
                  <tfoot v-if="isView && !(!permission.table.${layout.options.boSubEntity}.del &&
                  !permission.table.${layout.options.boSubEntity}.add) && '${layout.options.relation}'!='onetoone'" @click="transitionIndex = -1" >
                  <tr >
                      <td colspan="15">
                        <#if layout.options.relation!='onetoone' && subDivTablePath != ''>
                            <el-button
                                  v-if="permission.table.${layout.options.boSubEntity}.add"
                                  size="small"
                                  type="text"
                                  icon="el-icon-plus"
                                  @click="addSubTab('data.${subDivTablePath}')"
                                  :disabled="isShowAddButton('data.${subDivTablePath}',${layout.options.maxRow})"
                          >{{$t('common.add')}}</el-button>
                            <el-button size="small" type="text" v-if="permission.table.${layout.options.boSubEntity}.del && '${layout.options.relation}'!='onetoone' && !item.sub_row_readonly" @click="deleteRow('${subDivTablePath}',item)">{{$t('common.delete')}}</el-button>
                            <el-button size="small" type="text" v-if="permission.table.${layout.options.boSubEntity}.add
                                  && '${layout.options.relation}'!='onetoone' && !item.sub_row_readonly"
                                  <#if layout.options.maxRow>
                                    :disabled="isShowAddButton('data.${subListPath}',${layout.options.maxRow})"
                                  </#if>
                                  @click="copy(data.${subDivTablePath},item)"
                            >{{$t('common.copy')}}</el-button>
                        </#if>
                      </td>
                  </tr>
                  </tfoot>
              </table>
            <div class="xh_hd" :style="right_image" id="righthk_${subListPath}" @click="xhright('${subListPath}')"></div>
          </div>
      </div>
  </el-main>
</el-container>
</#macro>

<#function getSubDialog layout >
    <#assign custdialogConf  = util.getStringConf(layout.customDialogjson)>
    <#assign rtn>
       <eip-subDialog
                 relation="${layout.options.relation}"
                 :custdialog='${custdialogConf}'
                 initFillData="${layout.initTemplateData}"
                 initFillDataType="${layout.initTemplateDataType}"
                 maxRow="${layout.options.maxRow}"
         />
    </#assign>
    <#return rtn>
</#function>