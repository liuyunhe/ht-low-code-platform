<#macro sunDiv layout>
<#assign subTablePath=layout.options.subTablePath>
<#assign sunTablePath=util.getSunTablePath(layout.options.subTablePath,"index")>
<#assign subName=util.getSubName(layout.options.subTablePath,"index")>
<#assign hasLinkage=util.getHasLinkage(layout.list)>
<el-container v-if="!permission.table.${layout.options.boSubEntity}.hidden">
    <el-header style="height:30px;line-height:30px;background: #fafafa; font-weight: bold;font-size: 14px;">
    <#--  ccwgq 2022-04-08 增加头部计数的功能  -->
        ${layout.desc}({{data.${sunTablePath}.length}})
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
    <el-main>
    	<#assign orgConfigStr = util.getJsonByPath(layout,'customDialogjson.orgConfig')>
      	<#assign orgConfigJson = util.getJsonStr(orgConfigStr)>
        <table class="form-table"  data-test="'${sunTablePath}'" :onload='initFill("${subListPath}",${orgConfigJson})' cellspacing="0" cellpadding="0" border="0" v-for="(item, sunIndex) in data.${sunTablePath}" :key="item.sub_guid || sunIndex" :data-index="sunIndex" :data-subname="'data.${subName}'">
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
                        <el-button size="small" type="text" v-if="permission.table.${layout.options.boSubEntity}.del" @click="deleteSunRow('${subTablePath}',item,index)">{{$t('common.delete')}}</el-button>
                        <el-button size="small" type="text" v-if="permission.table.${layout.options.boSubEntity}.add" @click="copy(data.${sunTablePath},item)">{{$t('common.copy')}}</el-button>
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
