<#macro subTable layout>
<#assign subListPath=layout.options.subTablePath>
<#assign sunBos=util.getSunBos(layout.list)>
<#assign subTablePath=layout.options.subTablePath>
<#assign hasLinkage=util.getHasLinkage(layout.list)>
<el-container v-if="!permission.table.${layout.options.boSubEntity}.hidden">
  <el-header sunBos="${sunBos}" style="height:30px;line-height:30px;background: #fafafa; font-weight: bold;font-size: 14px;">
  	<div class="flex" style="justify-content: space-between;">
  		<#--  ccwgq 2022-04-08 增加头部计数的功能  -->
    ${layout.desc}({{data.${subTablePath}.length}})
	  	<div style="float: right;" class="printHide">
            <div style="float: right;" v-if="permission.table.${layout.options.boSubEntity}.del && '${layout.options.relation}'!='onetoone'" class="inputs">
                <el-button type="text" icon="el-icon-delete" size="mini" @click="clearAll('${subTablePath}')">
                    {{$t('eip.common.clear')}}
                </el-button>
            </div>
             <#if layout.subtableBackfill>
                ${getSubDialog(layout)}
             </#if>
             <#if layout.subtableImportExport>
                 <span style="line-height: 0;" v-if="permission.table.${layout.options.boSubEntity}.add">${getSubImportDialog(layout)}</span>
             </#if>
	  	 </div>
  	 </div>
  	 <#if layout.customQuery && layout.customQuery.alias?? >
  	 	${getSubtableCustomQueryBackfill(layout)}
  	 </#if>
  </el-header>
  <el-main>
  	<#assign orgConfigStr = util.getJsonByPath(layout,'customDialogjson.orgConfig')>
    <#assign orgConfigJson = util.getJsonStr(orgConfigStr)>
    <div class="formT_box">
        <div class="xh_table" id="xh_tablegd_${subListPath}" v-tableDrag>
            <div class="xh_hdleft" :style="left_image" id="lefthk_${subListPath}" @click="xhleft('${subListPath}')"></div>
            <table class="form-table" :onload='initFill("${subListPath}",${orgConfigJson})' cellspacing="0" cellpadding="0" border="0" v-tableDrag>
              <thead>
                  <#if layout.customHeader gt 1 >
                    ${util.decodeBase64(layout.customHeader)}
                  <#else>
                    <tr class="sub-table-header" @click="transitionIndex = -1">
                      <#if layout.options.relation!='onetoone'><th style="min-width: 50px;">{{$t('common.seq')}}</th></#if>
                      <#list layout.list as field>
                        <#assign tip = util.getJsonByPath(field.options,"tip")>
                        <#assign labelstyleWidth = util.getJsonByPath(field.options,"labelstyleWidth")>
                            <#if (field.ctrlType != 'suntable' && field.ctrlType != 'sunDiv')>
                                <th <#if field.options.hideCtrl> v-show="false"</#if> <#if !field.options.noBindModel || util.isNoAttrField(field)> v-if="${getPermission(field,true)}!='n'"</#if>
                                        style="<#if !field.options.labelstyleWidth>min-width:210px !important;</#if>
                                                font-weight:${util.getStyleBold(field.options,'boldLable')};
                                                ${util.getStyles(field.options,'color','lableColor')};
                                                ${util.getStyles(field.options,'min-width','labelstyleWidth')};">
                                    <#if !field.options.noBindModel || util.isNoAttrField(field)><span  v-if="${getPermission(field,true)}=='b'">*</span></#if>
                                    <#if tip?length gt 0>
                                        <el-tooltip placement="top">
                                            <div slot="content" >${field.options.tip}</div>
                                            <i class="el-icon-question" />
                                        </el-tooltip>
                                    </#if>
                                    <span style="${util.getFieldStyle(field.options)}">${field.desc}</span>
                                </th>
                             <#else>
                                <th style="<#if !field.options.labelstyleWidth>min-width:350px !important;</#if>" v-if="!permission.table.${field.name}.hidden">
                                    <span>${field.desc}</span>
                                </th>
                            </#if>
                      </#list>
                       <#if layout.options.relation!='onetoone'> <th class="printHide" style="min-width: 90px" v-if="permission.table.${layout.options.boSubEntity}.del">{{$t('common.operation')}}</th></#if>
                    </tr>
                  </#if>
              </thead>
              <tbody>
                  <tr v-for="(item, index) in <#if layout.subtablePagination>pagingSubData('data.${subListPath}')<#else>data.${subListPath}</#if>" :key="item.sub_guid || index" :data-index="index" :sub-index="index" :class="{'transition':index==transitionIndex}" data-subname="data.${subListPath}" :row_readonly="item.sub_row_readonly">
                    <#if layout.options.relation!='onetoone'><td @click="transitionIndex = -1" align="center" style="border-left: 1px solid #f9f9f9;">{{index + 1}}</td></#if>
                    <#list layout.list as field>
                        <#if (field.ctrlType != 'suntable' && field.ctrlType != 'sunDiv')>
                            <td <#if field.options.hideCtrl> v-show="false"</#if> @click="transitionIndex = -1" <#if !field.options.noBindModel || util.isNoAttrField(field)> v-if="${getPermission(field,2)}!='n' && !(permission.sub_${field.tableName} && permission.sub_${field.tableName}.${field.name}index !='n')" </#if> style="font-weight:${util.getStyleBold(field,'boldValue')};${util.getStyles(field,'color','valueColor')};${util.getStyles(field,'width','width')};">
                               <@input field=field type=2 hasLinkage=hasLinkage/>
                            </td>
                        <#else>
                            <td <#if field.options.hideCtrl> v-show="false"</#if> v-if="!permission.table.${field.name}.hidden">
                                <#if field.ctrlType == 'suntable'>
                                    <@sunTable layout=field />
                                <#else>
                                    <@sunDiv layout=field />
                                </#if>
                            </td>
                        </#if>

                    </#list>
                    <#if layout.options.relation!='onetoone'>
                      <td <#if field.options.hideCtrl> v-show="false"</#if> class="trash printHide" v-if="permission.table.${layout.options.boSubEntity}.del">
                          <el-button size="small" type="text" v-if="permission.table.${layout.options.boSubEntity}.del && !item.sub_row_readonly" @click="deleteRow('${subListPath}',item)">{{$t('common.delete')}}</el-button>
                          <el-button size="small" type="text" v-if="permission.table.${layout.options.boSubEntity}.add"
                                     <#if layout.options.maxRow>
                                        :disabled="isShowAddButton('data.${subListPath}',${layout.options.maxRow})"
                                     </#if>
                                     @click="copy(data.${subListPath},item)">{{$t('common.copy')}}</el-button>
                      </td>
                    </#if>
                  </tr>
              </tbody>
              <#if layout.options.relation!='onetoone'>
                  <tfoot class="printHide" @click="transitionIndex = -1">
                    <tr>
                      <td colspan="${layout.list?size + 2}">
                        <el-button
                          v-if="isView && permission.table.${layout.options.boSubEntity}.add"
                          size="small"
                          type="text"
                          icon="el-icon-plus"
                          @click="addSubTab('data.${subListPath}')"
                          <#if layout.options.maxRow>
                            :disabled="isShowAddButton('data.${subListPath}',${layout.options.maxRow})"
                          </#if>
                        >{{$t('common.add')}}</el-button>
                        <#if layout.subtablePagination>
	                    	<eip-sub-pagination
	                          :rows="data.${subListPath}"
	                          data-subname="data.${subListPath}">
	                        </eip-sub-pagination>
					  	</#if>
                      </td>
                    </tr>
                  </tfoot>
               </#if>
               <#if layout.options.relation=='onetoone'>
                  <tfoot @click="transitionIndex = -1" v-show="'${layout.options.relation}'=='onetoone' && data.${subListPath}.length<1">
                    <tr v-if="permission.table.${layout.options.boSubEntity}.add">
                      <td colspan="15">
                        <el-button
                          size="small"
                          type="text"
                          icon="el-icon-plus"
                          @click="addSubTab('data.${subListPath}')"
                        >{{$t('common.add')}}</el-button>
                      </td>
                    </tr>
                  </tfoot>
               </#if>
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

<#function getSubImportDialog layout >
	<#assign columnsConfig  = util.getSubTableCols(layout.list)>
    <#assign rtn>
    	<eip-sub-export-dialog v-if="isView" data-columns="${columnsConfig}" data-subname="data.${subListPath}" data-subdesc="${layout.desc}"></eip-sub-export-dialog>
    	<eip-sub-import-dialog
            subDesc="${layout.desc}"
            <#if layout.options.maxRow>
                maxRow="${layout.options.maxRow}"
            </#if>
                v-if="isView" data-columns="${columnsConfig}"
            <#if layout.subtableImportMergeExp>merge-expression="${layout.subtableImportMergeExp}"</#if>
            data-subname="data.${subListPath}">
        </eip-sub-import-dialog>
    </#assign>
    <#return rtn>
</#function>