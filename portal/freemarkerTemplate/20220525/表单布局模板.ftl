<#-- type: 表类型，1：主表； 2：子表； 3：孙表 -->
<#function getFormItem field type hasLinkage>

	<#assign rtn>
		<#if field.ctrlType!='iframe' && field.ctrlType!='show-lc' && field.ctrlType!='contractPreview' && field.ctrlType!='table'>
			<#if field.noTitle>
				<@input field=field type=type hasLinkage=hasLinkage/>
			<#else>
				<#if  field.ctrlType!=''>
					<ht-form-item
                        <#if formSetting && formSetting.align> align="${formSetting.align?replace('\"','')}" </#if>
                        <#if formSetting && formSetting.customColon==true> :custom-colon="${formSetting.customColon}" </#if>
                        <#if formSetting && formSetting.fontColor> label-color="${formSetting.fontColor?replace('\"','')}" </#if>
                        <#if field.options.hideCtrl> v-show="false"</#if>
                        <#if !field.options.noBindModel || util.isNoAttrField(field)> v-if="${getPermission(field,false)}!='n'  && data.${util.getBoDefAlias(field)} <#if field.options.showCondition.fieldPath?if_exists> && ${field.options.showCondition.fieldPath} =='${field.options.showCondition.value}'</#if>" </#if>
                        <#if (!field.options.hideLabel)&&(field.options.labelstyleWidth??)>label-width="${field.options.labelstyleWidth}"</#if>
					>
						<#if !field.options.hideLabel &&field.ctrlType!=''>
							<template slot="label">
								<#if field.options.tip?default("")?trim?length gt 1>
									<el-tooltip placement="top" <#if type!=1 && hasLinkage==true> v-permission-line-lable="'${field.parentNodeType}_${field.tableName}_${field.name}'" </#if> >
										<div slot="content" >${field.options.tip}</div>
										<i class="el-icon-question" />
									</el-tooltip>
								</#if>
								<span <#if type!=1 && hasLinkage==true> v-permission-line-lable="'${field.parentNodeType}_${field.tableName}_${field.name}'" </#if>  style="${util.getFieldStyle(field.options)}
                                    <#if formSetting && formSetting.fontColor> color:${formSetting.fontColor?replace('\"','')} !important;</#if>${util.getDiyColorOrNull(field.options)}">${field.desc}</span>
							</template>
						</#if>
						<@input field=field type=type hasLinkage=hasLinkage/>
					</ht-form-item>
				</#if>
			</#if>
		<#elseif  field.ctrlType=='iframe'>
			<iframe
				src="${field.options.iframeSrc}"
				height="${field.options.iframeSrcHeight}"
				width="${field.options.iframeSrcWidth}"
				style="border-color:${field.options.lableColor}"
				frameborder="${field.options.frameborder}" ></iframe>
		<#elseif  field.ctrlType=='show-lc'>
			<eip-show-lc  <#if field.options.lcId>:lcId="${field.options.lcId}"</#if>  :lcType="${field.options.lcType}"></eip-show-lc>
		<#elseif  field.ctrlType=='table'>
			<#if (field.rows?size > 0)>
				<#assign colSum = util.getMainTableColSum(field.rows)>
				<#assign labelWidthType = field.options.labelWidthType!'percent'>
				<#assign labelWidth = field.options.labelWidth!30>
				<#assign titleWidth = (labelWidth/colSum)>
				<#assign fieldWidth = ((100-labelWidth)/colSum)>
				<#assign lineHeight = field.options.lineHeight!40>
				<#assign borderColor = field.options.borderColor!'#b5b5b5'>
				<#assign borderWidth = field.options.borderWidth!1>
				<#assign fontColor = field.options.fontColor!'#808080'>
				<el-main>
					<div class="table_layout_wrap">
                        <table width="100%" border="0" cellspacing="0" class="main-table" cellpadding="0" style="border-right:${borderWidth}px solid ${borderColor};border-bottom:${borderWidth}px solid ${borderColor};">
						<#list field.rows as row>
							<#if (row.cols?size> 0)>
								<tr style="line-height:${lineHeight}px;">
									<#list row.cols as col>
										<#if (col.list?size == 0)>
											<td colspan="${col.colspan*2}" style="border-left:${borderWidth}px solid ${borderColor};border-top:${borderWidth}px solid ${borderColor};line-height:${lineHeight-5}px;">&nbsp;</td>
										<#else>
											<#list col.list as tdField>
												<#assign colspan = col.colspan>
												<#if !tdField.options.hideCtrl &&tdField.ctrlType!=''>
													<#if !tdField.options.hideLabel &&tdField.ctrlType!=''>
                                                        <#assign cfieldWidth = (fieldWidth*colspan)>
                                                        <#--控件隐藏时-->
                                                        <td v-if="${getPermission(tdField,type)}=='n'"
                                                            style="border-left:${borderWidth}px solid ${borderColor};border-top:${borderWidth}px solid ${borderColor};line-height:${lineHeight-5}px;
                                                                    <#if formSetting && formSetting.align && formSetting.align?replace('\"','') !='justify'>
                                                                        text-align: ${formSetting.align?replace('\"','')} !important;
                                                                    <#elseif formSetting && formSetting.align &&  formSetting.align?replace('\"','') =='justify'>
                                                                        text-align:justify !important;text-align-last: justify !important;
                                                                    <#else>
                                                                        text-align:right !important;
                                                                    </#if>"
                                                                <#if labelWidthType=='percent'>
                                                                    width="${titleWidth}%"
                                                                <#else>
                                                                    width="${labelWidth}px"
                                                                </#if>
                                                        ></td>
                                                        <td v-if="${getPermission(tdField,type)}=='n'"
                                                                style="border-left:${borderWidth}px solid ${borderColor};border-top:${borderWidth}px solid ${borderColor};line-height:${lineHeight-5}px;"
															<#if colspan==1 && labelWidthType=='percent'>
																width="${cfieldWidth}%"
                                                            <#else>
																colspan="${colspan*2-1}"
                                                            </#if>
                                                        ></td>
                                                        <#--控件显示时-->
                                                        <#--增加单元格背景样式 -->
														<td v-if="${getPermission(tdField,type)}!='n'" class="main-title <#if tdField.options.validate?if_exists && tdField.options.validate?length gt 0> is-required</#if>"
                                                            style="border-left:${borderWidth}px solid ${borderColor};border-top:${borderWidth}px solid ${borderColor};line-height:${lineHeight-5}px;background-color:#e7f3fc!important;font-size:11pt!important;
                                                                    <#if formSetting && formSetting.align && formSetting.align?replace('\"','') !='justify'>
                                                                        text-align: ${formSetting.align?replace('\"','')} !important;
                                                                    <#elseif formSetting && formSetting.align &&  formSetting.align?replace('\"','') =='justify'>
                                                                        text-align:justify !important;text-align-last: justify !important;
                                                                    <#else>
                                                                        <#--text-align:right !important;-->
                                                                        text-align:center !important;
                                                                    </#if>"
                                                            <#if labelWidthType=='percent'>
                                                                width="${titleWidth}%"
                                                            <#else>
                                                                width="${labelWidth}px"
                                                            </#if>
														 >
															<#if tdField.options.tip?default("")?trim?length gt 1>
																<el-tooltip <#if !tdField.options.noBindModel || util.isNoAttrField(tdField)> v-if="${getPermission(tdField,type)}!='n'" </#if> placement="top">
																	<div slot="content" >${tdField.options.tip}</div>
																	<i class="el-icon-question" />
																</el-tooltip>
															</#if>
                                                            <span <#if !tdField.options.noBindModel || util.isNoAttrField(tdField)> v-if="${getPermission(tdField,type)}!='n'" </#if> style="${util.getFieldStyle(tdField.options)}color:<#if formSetting && formSetting.fontColor>${formSetting.fontColor?replace('\"','')}<#else>${fontColor}</#if> !important;
                                                                    min-width: 125px !important;${util.getDiyColorOrNull(tdField.options)}">${tdField.desc}<#if formSetting && formSetting.customColon!=true>：</#if></span>
														</td>
														<td v-if="${getPermission(tdField,type)}!='n'" class="main-field"  style="border-left:${borderWidth}px solid ${borderColor};border-top:${borderWidth}px solid ${borderColor};line-height:${lineHeight-5}px;"
															<#if colspan==1 && labelWidthType=='percent'>
																width="${cfieldWidth}%"
															<#else>
																colspan="${colspan*2-1}"
															</#if>
														>
															<@input field=tdField type=type hasLinkage=hasLinkage/>
														</td>
													<#else>
														<td class="main-field" colspan="${colspan*2}" style="border-left:${borderWidth}px solid ${borderColor};border-top:${borderWidth}px solid ${borderColor};line-height:${lineHeight-5}px;">
                                                            <@input field=tdField type=type hasLinkage=hasLinkage/>
														</td>
													</#if>
												</#if>
											</#list>
										</#if>
									</#list>
					 			</tr>
							</#if>
					 	</#list>
		    		</table>
                    </div>
		    	</el-main>
    		</#if>
		<#else>
			<contract-preview
				options='${util.objectToJsonString(field.options)}'>
			</contract-preview>
		</#if>
	</#assign>
	<#return rtn>
</#function>
<#macro getLayout layout>
<#if layout.ctrlType=='grid'>
	<el-row :gutter="${layout.options.gutter}" justify="${layout.options.justify}" align="${layout.options.align}" type="flex">
		<#list layout.columns as group>
			<el-col :span="${group.span}" style="${group.style}">
				<#list group.list as field>
					${getFormItem(field,1,false)}
				</#list>
			</el-col>
		</#list>
	</el-row>
<#elseif  layout.ctrlType=='tab'>
    <eip-tabs :tabsValue="'${layout.key}0'" :tabPosition="'${layout.options.align}'"
              <#if layout.options.nextCheck?if_exists>:beforeLeave='leaveTabVerify'</#if>
              <#if layout.options.type?if_exists>:type="'${layout.options.type}'"</#if>
    >
        <template>
            <#list layout.columns as group>
				<el-tab-pane <#if group.permissionPath?if_exists>v-if="permission.fields.${group.permissionPath}!='n'"  :isShow="permission.fields.${group.permissionPath}!='n'"</#if>
							  label="${group.span}" name="${layout.key}${group_index}" ref="${layout.key}${group_index}">
					<template slot="label">
						<#if group.span?length gt 10>
							<el-tooltip class="item" effect="dark" content="${group.span}" placement="top-start">
								<a>${group.span?substring(0,10)}</a>
							</el-tooltip>
						</#if>
						<#if group.span?length lt 10>
							<span class="${layout.key}${group_index}">${group.span}</span>
						</#if>
					</template>
					<#list group.list as field>
						<#if field.ctrlType=='grid'>
							<el-row type="flex" :gutter="${field.options.gutter}" justify="${field.options.justify}" align="${field.options.align}">
								<#list field.columns as gridGroup>
									<el-col :span="${gridGroup.span}" style="${gridGroup.style}">
										<#list gridGroup.list as gridField>
											${getFormItem(gridField,1,false)}
										</#list>
									</el-col>
								</#list>
							</el-row>
						<#elseif field.ctrlType=='subtable'>
							<@subTable layout=field />
						<#elseif field.ctrlType=='subDiv'>
							<@subDiv layout=field />
						<#elseif field.ctrlType=='hottable'>
							<@hotTable layout=field />
						<#elseif field.ctrlType=='dataView'>
						<eip-data-view
							templateKey="${field.templateKey}"
							options='${util.objectToJsonString(field.options)}'
						>
						</eip-data-view>
						<#else>
							<el-row>
								${getFormItem(field,1,false)}
							</el-row>
						</#if>
					</#list>
				</el-tab-pane>
			</#list>
        </template>
    </eip-tabs>
<#elseif layout.ctrlType=='accordion'>
	<eip-collapse :openDefault='${util.objectToJsonString(layout.options.activeNames)}' <#if layout.options.nextCheck?if_exists>:isVerify=${layout.options.nextCheck}</#if> >
        <template>
            <#list layout.columns as group>
                <el-collapse-item title="${group.span}" name="${group.idKey}" ref="${group.idKey}">
                    <#list group.list as field>
                        <#if field.ctrlType=='grid'>
                            <el-row type="flex" :gutter="${field.options.gutter}" justify="${field.options.justify}" align="${field.options.align}">
                                <#list field.columns as gridGroup>
                                    <el-col :span="${gridGroup.span}" style="${gridGroup.style}">
                                        <#list gridGroup.list as gridField>
                                            ${getFormItem(gridField,1,false)}
                                        </#list>
                                    </el-col>
                                </#list>
                            </el-row>
                        <#elseif field.ctrlType=='subtable'>
                                <@subTable layout=field />
                        <#elseif field.ctrlType=='subDiv'>
                            <@subDiv layout=field />
                        <#elseif field.ctrlType=='hottable'>
                            <@hotTable layout=field />
                        <#elseif field.ctrlType=='tab'>
                            <eip-tabs :tabsValue="'${field.key}0'" :tabPosition="'${field.options.align}'"
                                      <#if field.options.nextCheck?if_exists>:beforeLeave='leaveTabVerify'</#if>
                                      <#if field.options.type?if_exists>:type="'${field.options.type}'"</#if>>
                                <template>
                                    <#list field.columns as group>
                                        <el-tab-pane <#if group.permissionPath?if_exists>v-if="permission.fields.${group.permissionPath}!='n'"  :isShow="permission.fields.${group.permissionPath}!='n'" </#if>
													   label="${group.span}" name="${field.key}${group_index}" ref="${field.key}${group_index}">
                                            <template slot="label">
                                                <#if group.span?length gt 10>
                                                    <el-tooltip class="item" effect="dark" content="${group.span}" placement="top-start">
                                                        <a>${group.span?substring(0,10)}</a>
                                                    </el-tooltip>
                                                </#if>
                                                <#if group.span?length lt 10>
                                                    <span class="${field.key}${group_index}">${group.span}</span>
                                                </#if>
                                            </template>
                                            <#list group.list as gfield>
                                                <#if gfield.ctrlType=='grid'>
                                                    <el-row type="flex" :gutter="${gfield.options.gutter}" justify="${gfield.options.justify}" align="${gfield.options.align}">
                                                        <#list gfield.columns as gridGroup>
                                                            <el-col :span="${gridGroup.span}" style="${gridGroup.style}">
                                                                <#list gridGroup.list as gridField>
                                                                    ${getFormItem(gridField,1,false)}
                                                                </#list>
                                                            </el-col>
                                                        </#list>
                                                    </el-row>
                                                <#elseif gfield.ctrlType=='subtable'>
                                                    <@subTable layout=gfield />
                                                <#elseif gfield.ctrlType=='subDiv'>
                                                    <@subDiv layout=gfield />
                                                <#elseif gfield.ctrlType=='hottable'>
                                                    <@hotTable layout=gfield />
                                                <#elseif gfield.ctrlType=='dataView'>
                                                <eip-data-view
                                                    templateKey="${gfield.templateKey}"
                                                    options='${util.objectToJsonString(gfield.options)}'
                                                >
                                                </eip-data-view>
                                                <#else>
                                                    <el-row>
                                                        ${getFormItem(gfield,1,false)}
                                                    </el-row>
                                                </#if>
                                            </#list>
                                        </el-tab-pane>
                                    </#list>
                                </template>
                            </eip-tabs>
                        <#elseif field.ctrlType=='dataView'>
                            <eip-data-view
                                templateKey="${field.templateKey}"
                                options='${util.objectToJsonString(field.options)}'
                            >
                            </eip-data-view>
                        <#else>
                            <el-row>
                                ${getFormItem(field,1,false)}
                            </el-row>
                        </#if>
                    </#list>
                </el-collapse-item>
            </#list>
        </template>
	</eip-collapse>
<#elseif layout.ctrlType=='subtable'>
<@subTable layout=layout />
<#elseif layout.ctrlType=='subDiv'>
<@subDiv layout=layout />
<#elseif layout.ctrlType=='page'>
	</template>
	</eip-pagination-layout>
	<eip-pagination-layout :pageIndex='${pageIndex}'>
	<template>
	<#assign pageIndex = pageIndex+1>
<#elseif layout.ctrlType=='pageSteps'>
	<eip-pagination-steps :columns='${util.objectToJsonString(layout.pageStepsArr)}'
       <#if layout.isShow>v-if="true"<#else>v-if='false'</#if>>
	</eip-pagination-steps>
	<eip-pagination-layout :pageIndex='${pageIndex}'>
	<template>
	<#assign pageIndex = pageIndex+1>
<#elseif layout.ctrlType=='pageButton'>
	</template>
	</eip-pagination-layout>
	<eip-pagination :pageSize='${expandMap.pageSize}' :nextButton='${util.objectToJsonString(layout.nextButton)}' :backButton='${util.objectToJsonString(layout.backButton)}'></eip-pagination>
<#elseif layout.ctrlType=='hottable'>
	<@hotTable layout=layout />
<#elseif layout.ctrlType=='dataView'>
	<eip-data-view
		templateKey="${layout.templateKey}"
		options='${util.objectToJsonString(layout.options)}'
	>
	</eip-data-view>
<#else>
<el-row>
	<el-col :span="24">
		${getFormItem(layout,1,false)}
	</el-col>
</el-row>


</#if>
</#macro>