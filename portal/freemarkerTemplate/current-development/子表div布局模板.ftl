<#macro subDiv layout>
<#assign subTablePath=layout.options.subTablePath>
<#assign subDivTablePath=layout.options.subDivTablePath>
<#assign subListPath=layout.options.subTablePath>
<#--  sub table header settings  -->
<#assign subHeadHeight=layout.options.headHeight!30>
<#assign subHeadHeightUnit=layout.options.headHeightUnit!'px'>
<#assign subHeadLineHeight=layout.options.headLineHeight!30>
<#assign subHeadLineHeightUnit=layout.options.headLineHeightUnit!'px'>
<#assign subCounter=layout.options.counter!true>
<#assign subBgColor=layout.options.bgColor!'#FAFAFA'>
<#assign subFontColor=layout.options.fontColor!'#303133'>
<#assign subFontSize=layout.options.fontSize!12>
<#assign subFontUnit=layout.options.fontUnit!'px'>
<#assign subFontWeight=layout.options.fontWeight!'bold'>
<#--  分割线控制  -->
<#assign showDivider=layout.options.showDivider!false>
<#assign dividerDesc=layout.options.dividerDesc!layout.desc>
<#assign dividerPosition=layout.options.dividerPosition!'left'>
<#assign useDividerIndex=layout.options.useDividerIndex!true>
<#--  ==================================================  -->
<#assign sunBos=util.getSunBos(layout.list)>
<#assign hasLinkage=util.getHasLinkage(layout.list)!true>
<el-container class="sub-container__div" sunBos="${sunBos}" v-if="!permission.table.${layout.options.boSubEntity}.hidden">
  <el-header class="sub-header__div" style="height:${subHeadHeight}${subHeadHeightUnit};line-height:${subHeadLineHeight}${subHeadLineHeightUnit};background: ${subBgColor};color:${subFontColor}; font-weight: ${subFontWeight};font-size: ${subFontSize}${subFontUnit};margin:0 20px;">
    <#--  ccwgq 2022-04-08 增加头部计数的功能  -->
     <#if subCounter=true><span style="font-weight:inherit;">${layout.desc}（{{data.${subDivTablePath}.length}}）</span>
     <#else><span style="font-weight:inherit;">${layout.desc}</span>
     </#if>
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
  <el-main class="sub-main" style="padding-top:0px;">
      <div class="formT_box sub-container">
          <div class="xh_table" id="xh_tablegd_${subListPath}" v-tableDrag>
              <div class="xh_hdleft" :style="left_image" id="lefthk_${subListPath}" @click="xhleft('${subListPath}')"></div>
              <div v-for="(item, index) in data.${subTablePath}" :key="item.sub_guid || index">
              <#--  divider settings  -->
              <el-card :class="['sub-box-card__'+ (index%2)]">
                <#if (showDivider==true)> <el-divider content-position="${dividerPosition}">${dividerDesc}&nbsp;<#if (useDividerIndex==true)>{{index+1}}</#if></el-divider> </#if>
                    <table class="form-table sub-table" cellspacing="0" cellpadding="0" border="0"  :sub-index="index" :data-index="index" data-subname="data.${subTablePath}" :row_readonly="item.sub_row_readonly" >
                        <tbody>
                        <tr>
                            <td colspan="15">
                                <#list layout.list as field>
                                    <#if (field.ctrlType != 'suntable' && field.ctrlType != 'sunDiv')>
                                        <#if field.ctrlType=='grid'>
                                            <el-row type="flex" <#if hasLinkage==true> v-if="(!permission || !permission.subFields) ||(permission.subFields && !(${util.getSubRowPermission(field.columns)}) )" </#if> :gutter="${field.options.gutter}" justify="${field.options.justify}" align="${field.options.align}">
                                                <#list field.columns as gridGroup>
                                                    <el-col data-hasLinkage="${hasLinkage}" :span="${gridGroup.span}" style="${gridGroup.style}">
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
                        <tfoot style="background: ${subBgColor};" v-if="isView && !(!permission.table.${layout.options.boSubEntity}.del &&
                        !permission.table.${layout.options.boSubEntity}.add) && '${layout.options.relation}'!='onetoone'" @click="transitionIndex = -1" >
                        <tr >
                            <td colspan="15">
                                <#if layout.options.relation!='onetoone' && subDivTablePath != ''>
                                    <#--  <el-button
                                        v-if="permission.table.${layout.options.boSubEntity}.add"
                                        size="small"
                                        type="text"
                                        icon="el-icon-plus"
                                        @click="addSubTab('data.${subDivTablePath}')"
                                        :disabled="isShowAddButton('data.${subDivTablePath}',${layout.options.maxRow})"
                                >{{$t('common.add')}}</el-button>  -->
                                    <el-button size="small" type="text" icon="el-icon-delete" v-if="permission.table.${layout.options.boSubEntity}.del && '${layout.options.relation}'!='onetoone' && !item.sub_row_readonly" @click="deleteRow('${subDivTablePath}',item)">{{$t('common.delete')}}</el-button>
                                    <el-button size="small" type="text" icon="el-icon-document-copy" v-if="(permission.table.${layout.options.boSubEntity}.copy || false)
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
              </el-card>
              </div>
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