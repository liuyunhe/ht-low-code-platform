<#macro sunTable layout>
<#assign subTablePath=layout.options.subTablePath>
<#assign sunTablePath=util.getSunTablePath(layout.options.subTablePath,"index")>
<#assign subName=util.getSubName(layout.options.subTablePath,"index")>
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
<el-container class="sun-container__table" v-if="!permission.table.${layout.options.boSubEntity}.hidden">
  <el-header class="sun-header__table printHide" style="height:${sunHeadHeight}${sunHeadHeightUnit};line-height:${sunHeadLineHeight}${sunHeadLineHeightUnit};background: ${sunBgColor};color:${sunFontColor}; font-weight: ${sunFontWeight};font-size: ${sunFontSize}${sunFontUnit};">
  	 <div>
     <#--  ccwgq 2022-04-08 增加头部计数的功能  -->
     <#if sunCounter=true><span>${layout.desc}({{data.${sunTablePath}.length}})</span>
     <#else><span>${layout.desc}</span>
     </#if>
  	 <div v-if="permission.table.${layout.options.boSubEntity}.del && '${layout.options.relation}'!='onetoone'"  :style="{display:'inline-block',float:'right'}">
	    <el-button type="text" icon="el-icon-delete" size="mini" :style="{padding:'0px 5px'}" @click="clearAll('${subTablePath}',null,index)">
            {{$t('eip.common.clear')}}
    	</el-button>
      </div>
  	 <#if layout.subtableBackfill>
  	 	${getSunDialog(layout)}
  	 </#if>
     </div>
  </el-header>
  <el-main class="sun-main__table">
      <el-scrollbar>
      <div class="grandson_table_wrap" v-tableDrag>
        <table class="form-table sun-table" cellspacing="0" cellpadding="0" border="0">
          <thead>
              <#if layout.customHeader gt 1 >
                ${util.decodeBase64(layout.customHeader)}
              <#else>
                <tr @click="transitionIndex = -1">
                  <#if layout.options.relation!='onetoone'><th style="min-width: 50px;text-align:center;">{{$t('common.seq')}}</th></#if>
                  <#list layout.list as field>
                    <#assign tip = util.getJsonByPath(field.options,"tip")>
                    <#assign labelstyleWidth = util.getJsonByPath(field.options,"labelstyleWidth")>
                    <th <#if field.options.hideCtrl> v-show="false"</#if>
                        <#if !field.options.noBindModel || util.isNoAttrField(field)> v-if="${getPermission(field,true)}!='n'"</#if>
                            style="<#if !field.options.labelstyleWidth>min-width:210px !important;</#if>
                                    font-weight:${util.getStyleBold(field.options,'boldLable')};
                                    ${util.getStyles(field.options,'color','lableColor')};
                                    ${util.getStyles(field.options,'min-width','labelstyleWidth')};text-align:center;">
                        <#if !field.options.noBindModel || util.isNoAttrField(field)><span  v-if="${getPermission(field,true)}=='b'">*</span></#if>
                        <#if tip?length gt 0>
                            <el-tooltip placement="top">
                                <div slot="content" >${field.options.tip}</div>
                                <i class="el-icon-question" />
                            </el-tooltip>
                        </#if>
                        <span style="${util.getFieldStyle(field.options)}">${field.desc}</span>
                    </th>
                  </#list>
                   <#if layout.options.relation!='onetoone'> <th class="printHide" style="min-width: 90px;text-align:center;" v-if="permission.table.${layout.options.boSubEntity}.del">{{$t('common.operation')}}</th></#if>
                </tr>
              </#if>
          </thead>
          <tbody>
              <tr v-for="(item, sunIndex) in data.${sunTablePath}" :key="item.sub_guid || sunIndex" :data-index="sunIndex" :class="{'transition':sunIndex==transitionIndex}" :data-sunname="'data.${subName}'">
                <#if layout.options.relation!='onetoone'><td @click="transitionIndex = -1" align="center" style="border-left: 1px solid #f9f9f9;">{{sunIndex + 1}}</td></#if>
                <#list layout.list as field>
                    <td <#if field.options.hideCtrl> v-show="false"</#if> @click="transitionIndex = -1" <#if !field.options.noBindModel || util.isNoAttrField(field)> v-if="${getPermission(field,3)}!='n' " </#if> style="font-weight:${util.getStyleBold(field,'boldValue')};${util.getStyles(field,'color','valueColor')};${util.getStyles(field,'width','width')};">
                       <@input field=field type=3 hasLinkage=hasLinkage/>
                    </td>
                </#list>
                <#if layout.options.relation!='onetoone'>
                  <td style="text-align:center;" <#if field.options.hideCtrl> v-show="false"</#if> class="trash printHide" v-if="permission.table.${layout.options.boSubEntity}.del">
                      <el-button size="small" type="text" v-if="permission.table.${layout.options.boSubEntity}.del" @click="deleteSunRow('${subTablePath}',item,index)">{{$t('common.delete')}}</el-button>
                      <el-button size="small" type="text" v-if="permission.table.${layout.options.boSubEntity}.copy || false"
                                 <#if layout.options.maxRow>
                                    :disabled="isShowAddButton('data.${subTablePath}',${layout.options.maxRow},index)"
                                 </#if>
                                 @click="copy(data.${sunTablePath},item)">{{$t('common.copy')}}</el-button>
                  </td>
                </#if>
              </tr>
          </tbody>
          <#if layout.options.relation!='onetoone'>
              <tfoot class="printHide" @click="transitionIndex = -1">
                <tr v-if="permission.table.${layout.options.boSubEntity}.add">
                  <td colspan="15">
                    <el-button
                      size="small"
                      type="text"
                      icon="el-icon-plus"
                      @click="addSunTab('data.${subTablePath}',index)"
                      <#if layout.options.maxRow>
                          :disabled="isShowAddButton('data.${subTablePath}',${layout.options.maxRow},index)"
                      </#if>
                    >{{$t('common.add')}}</el-button>
                  </td>
                </tr>
              </tfoot>
           </#if>
           <#if layout.options.relation=='onetoone'>
              <tfoot @click="transitionIndex = -1" v-show="'${layout.options.relation}'=='onetoone' && data.${sunTablePath}.length<1">
                <tr v-if="permission.table.${layout.options.boSubEntity}.add">
                  <td colspan="15">
                    <el-button
                      size="small"
                      type="text"
                      icon="el-icon-plus"
                      @click="addSunTab('data.${subTablePath}',index)"
                    >{{$t('common.add')}}</el-button>
                  </td>
                </tr>
              </tfoot>
           </#if>
        </table>
        </div>
      </el-scrollbar>
  </el-main>
</el-container>
</#macro>

<#function getSunDialog layout >
    <#assign custdialogConf  = util.getStringConf(layout.customDialogjson)>
    <#assign rtn>
    	 <eip-sunDialog
            relation="${layout.options.relation}"
            initFillData="${layout.initTemplateData}"
            initFillDataType="${layout.initTemplateDataType}"
    	    :custdialog='${custdialogConf}'
            maxRow="${layout.options.maxRow}"
        />
    </#assign>
    <#return rtn>
</#function>
