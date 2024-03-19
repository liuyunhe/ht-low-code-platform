<#macro sunDiv layout>
<#assign subTablePath=layout.options.subTablePath>
<#assign sunTablePath=util.getSunTablePath(layout.options.subTablePath,"index")>
<#assign sunName=util.getSubName(layout.options.subTablePath,"index")>
<#--  sun table header settings  -->
<#assign sunHeadHeight=layout.options.headHeight!30>
<#assign sunHeadHeightUnit=layout.options.headHeightUnit!'px'>
<#assign sunHeadLineHeight=layout.options.headLineHeight!30>
<#assign sunHeadLineHeightUnit=layout.options.headLineHeightUnit!'px'>
<#assign sunCounter=layout.options.counter!true>
<#assign sunBgColor=layout.options.bgColor!'#FAFAFA'>
<#assign sunFontColor=layout.options.fontColor!'#303133'>
<#assign sunFontSize=layout.options.fontSize!12>
<#assign sunFontUnit=layout.options.fontUnit!'px'>
<#assign sunFontWeight=layout.options.fontWeight!'bold'>
<#--  ==================================================  -->
<#assign hasLinkage=util.getHasLinkage(layout.list)>
<el-container class="sun-container__div" v-if="!permission.table.${layout.options.boSubEntity}.hidden">
    <el-header class="sun-header__div" style="height:${sunHeadHeight}${sunHeadHeightUnit};line-height:${sunHeadLineHeight}${sunHeadLineHeightUnit};background: ${sunBgColor};color:${sunFontColor};font-weight:${sunFontWeight};font-size:16px;">
    <#--  ccwgq 2022-04-08 增加头部计数的功能  -->
     <#if sunCounter=true><span style="font-size:inherit !important;">${layout.desc}({{data.${sunTablePath}.length}})</span>
     <#else><span style="font-size:inherit !important;">${layout.desc}</span>
     </#if>
      <div v-if="permission.table.${layout.options.boSubEntity}.del && '${layout.options.relation}'!='onetoone'"  :style="{display:'inline-block',float:'right'}">
	    <el-button type="text" icon="el-icon-delete" size="mini" :style="{padding:'0px 5px'}" @click="clearAll('${subTablePath}',null,index)">
	      	清空
    	</el-button>
      </div>
  	 <#if layout.subtableBackfill>
         ${getSunDialog(layout)}
     </#if>
      <#if layout.options.relation!='onetoone'>
              <el-button
                      v-if="permission.table.${layout.options.boSubEntity}.add"
                      size="small"
                      type="text"
                      icon="el-icon-plus"
                      @click="addSunTab('data.${subTablePath}',index)"
                      <#if leyout.options.maxRow == null>
                                  :disabled="isShowAddButton('data.${subTablePath}',0,index)"
                      </#if>
                      <#if leyout.options.maxRow !=null>
                      :disabled="isShowAddButton('data.${subTablePath}',${layout.options.maxRow},index)"
                      </#if>
              >{{$t('common.add')}}</el-button>
      </#if>
      <#if layout.options.relation=='onetoone'>
                  <el-button
                          v-show="'${layout.options.relation}'=='onetoone' && data.${sunTablePath}.length<1"
                          size="small"
                          type="text"
                          icon="el-icon-plus"
                          @click="addSunTab('data.${subTablePath}',index)"
                  >{{$t('common.add')}}</el-button>
      </#if>
    </el-header>
    <el-main class="sun-main__div">
    	<#assign orgConfigStr = util.getJsonByPath(layout,'customDialogjson.orgConfig')>
      	<#assign orgConfigJson = util.getJsonStr(orgConfigStr)>
        <table class="form-table sun-table" :onload='initFill("${subListPath}",${orgConfigJson})' cellspacing="0" cellpadding="0" border="0" v-for="(item, sunIndex) in data.${sunTablePath}" :key="item.sub_guid || sunIndex" :data-index="sunIndex" :data-sunname="'data.${sunName}'">
            <tbody>
            <tr>
                <td colspan="15">
              <#list layout.list as field>
                          <#if field.ctrlType=='grid'>
                              <el-row type="flex" <#if hasLinkage==true> v-if="(!permission || !permission.subFields) ||(permission.subFields && !(${util.getSubRowPermission(field.columns)}) )" </#if> :gutter="${field.options.gutter}" justify="${field.options.justify}" align="${field.options.align}">
                                  <#list field.columns as gridGroup>
                                      <el-col :span="${gridGroup.span}" style="${gridGroup.style}">
                                          <#list gridGroup.list as gridField>
                                              ${getFormItem(gridField,3,hasLinkage)}
                                          </#list>
                                      </el-col>
                                  </#list>
                              </el-row>
                              <#if field_index==0>
                                       <el-row v-if="isMobile">
                                            <el-button data-path="${sunTablePath}"
                                            type="primary" style="width:100%;" class="collapse-button__sun" @click="collapseBtnSun($event.target,'${sunTablePath}')">收起</el-button>
                                       </el-row>
                                   </#if>
                          <#else>
                              <el-row <#if !field.options.noBindModel || util.isNoAttrField(field)> v-if="${getPermission(field,true)}!='n' && !(permission.sub_${field.tableName} && permission.sub_${field.tableName}.${field.name}sunIndex !='n')" </#if>>
                                  ${getFormItem(field,3,hasLinkage)}
                              </el-row>
                              <#--  ccwgq 2022-04-07 加入折叠按钮控制  -->
                                   <#if field_index==0>
                                       <el-row v-if="isMobile">
                                            <el-button data-path="${sunTablePath}"
                                            type="primary" style="width:100%;" class="collapse-button__sun" @click="collapseBtnSun($event.target,'${sunTablePath}')">收起</el-button>
                                       </el-row>
                                   </#if>
                          </#if>
              </#list>
                </td>
            </tr>
            </tbody>
            <tfoot v-if="isView && !(!permission.table.${layout.options.boSubEntity}.del &&
            !permission.table.${layout.options.boSubEntity}.add) && '${layout.options.relation}'!='onetoone'" @click="transitionIndex = -1" >
            <tr >
                <td colspan="15">
                    <#if layout.options.relation!='onetoone'  && subDivTablePath != ''>
                        <#--  <el-button
                                v-if="permission.table.${layout.options.boSubEntity}.add"
                                size="small"
                                type="text"
                                icon="el-icon-plus"
                                @click="addSunTab('data.${subTablePath}',index)"
                                <#if leyout.options.maxRow == null>
                                    :disabled="isShowAddButton('data.${subTablePath}',0,index)"
                                </#if>
                                <#if leyout.options.maxRow !=null>
                                    :disabled="isShowAddButton('data.${subTablePath}',${layout.options.maxRow},index)"
                                </#if>
                        >{{$t('common.add')}}</el-button>  -->
                        <el-button size="small" type="text" icon="el-icon-delete" v-if="permission.table.${layout.options.boSubEntity}.del" @click="deleteSunRow('${subTablePath}',item,index)">{{$t('common.delete')}}</el-button>
                        <el-button size="small" type="text" icon="el-icon-document-copy" v-if="permission.table.${layout.options.boSubEntity}.copy || false" @click="copy(data.${sunTablePath},item)">{{$t('common.copy')}}</el-button>
                    </#if>
                </td>
            </tr>
            </tfoot>
        </table>
    </el-main>
</el-container>
</#macro>

<#function getSunDialog layout >
    <#assign custdialogConf  = util.getStringConf(layout.customDialogjson)>
    <#assign rtn>
    	 <eip-sunDialog
             relation="${layout.options.relation}"
             :custdialog='${custdialogConf}'
             maxRow="${layout.options.maxRow}"
             initFillData="${layout.initTemplateData}"
	  		 initFillDataType="${layout.initTemplateDataType}"
         />
    </#assign>
    <#return rtn>
</#function>
