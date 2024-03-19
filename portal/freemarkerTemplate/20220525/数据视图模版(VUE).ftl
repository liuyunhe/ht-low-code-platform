<#--
Name: 数据列表模板
Desc:数据列表模板

本模板需要通过2次解析才能得到最终的Html
第一次解析：
*************************************************************
*************************************************************
*数据模型:****************************************************
*************************************************************
*************************************************************

tbarTitle：Tool Bar 的标题

********************************************
conditionFields:条件字段
--joinType：	条件联合类型
--name：	列名
--name：完全指定名
--operate：条件类型: =|>=|<=|….
--comment：注释
--type：	类型
--value：值
--valueFrom：值来源

************************************************************
displayFields：显示字段
--name：列名
--name：完全指定名
--label：别名
--index：索引
--comment：注释
--type：类型

******************************************************
tableIdCode:Table ID Code

**************************************************
displayId: 自定义显示的ID

**************************************************
pageHtml：分页的Html 详见pageAjax.xml

*************************************************
pageURL：当前页面的URL

searchFormURL：搜索表单的Action


sortField：当前排序字段

orderSeq：当前的排序类型

***********************************************
pkcols:主键列

deleteBaseURL：删除一行数据的BaseURL
editBaseURL：编辑一行数据的BaseURL
 -->


<#setting number_format="#">
<#assign displayFields=bpmDataTemplate.displayField?eval>
<#assign conditionFields=bpmDataTemplate.conditionField?eval>
<#assign filterFields=bpmDataTemplate.filterField?eval>
<#assign manageFields=bpmDataTemplate.manageField?eval>
<#assign sortFields=bpmDataTemplate.sortField?eval>
<#assign treeFields=bpmDataTemplate.treeField?eval>
<#assign summaryFields=bpmDataTemplate.summaryField?eval>

<#noparse>
<#setting number_format="#">
<#assign displayFields=bpmDataTemplate.displayField?eval>
<#assign conditionFields=bpmDataTemplate.conditionField?eval>
<#assign filterFields=bpmDataTemplate.filterField?eval>
<#assign manageFields=bpmDataTemplate.manageField?eval>
<#assign sortFields=bpmDataTemplate.sortField?eval>
<#assign boAlias=bpmDataTemplate.boDefAlias>
<#assign templateId=bpmDataTemplate.id>
<#assign pageSize=bpmDataTemplate.pageSize>
<#assign urlPre="$">
</#noparse>

<#--日期选择器 -->
<#macro genQueryDate field>
		<#switch field.qt>
			<#case "between">
				<el-date-picker size="mini" v-model="searchForm.${colPrefix}${field.na}" type="${field.ctrlType}" class="search-item" value-format="${field.format}" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" operation="${field.qt}" placeholder="${field.cm}" ht-query="${colPrefix}${field.na}" name="Q^${colPrefix}${field.na}^${field.qt}"> </el-date-picker>
			<#break>
			<#default>
				<el-date-picker size="mini" v-model="searchForm.${colPrefix}${field.na}" type="${field.ctrlType}" class="search-item" value-format="${field.format}" operation="${field.qt}" placeholder="${field.cm}" ht-query="${colPrefix}${field.na}" name="Q^${colPrefix}${field.na}^${field.qt}"> </el-date-picker>
			<#break>
		</#switch>
</#macro>

<#--单选按钮或复选框 -->
<#function getCheckboxOrRadio field>
	<#assign rtn>
			<#if field.controlContent?if_exists>
				<#if field.controlContent?if_exists>
					<#if field.ct=='radio'>
			            <el-radio-group size="mini" v-model="searchForm.${colPrefix}${field.na}" class="search-item" operation="${field.qt}" ht-query="${colPrefix}${field.na}" name="Q^${colPrefix}${field.na}^${field.qt}">
			            <#list field.controlContent as opt>
			            	 <el-radio label="${opt.key}">${opt.value}</el-radio>
						</#list>
						</el-radio-group>
			        <#else>
			        	<el-checkbox-group size="mini" v-model="searchForm.${colPrefix}${field.na}" class="search-item" operation="${field.qt}" ht-query="${colPrefix}${field.na}" name="Q^${colPrefix}${field.na}^${field.qt}">
			            <#list field.controlContent as opt>
			            	 <el-checkbox label="${opt.key}">${opt.value}</el-checkbox>
						</#list>
						</el-checkbox-group>
			        	<#--<#assign controlContent=util.getJsonByPath(field,'controlContent')>
			        	<ht-checkbox v-model="searchForm.${colPrefix}${field.na}" cklist='${controlContent}' permission='w' operation="${field.qt}" ht-query="${colPrefix}${field.na}" name="Q^${colPrefix}${field.na}^${field.qt}"  -->
			        </#if>
				</#if>
			</#if>
	</#assign>
	<#return rtn>
</#function>

<#--获取条件-->
<#function getCondition condition field>
    <#assign rtn="">
    <#list condition as con>
        <#--处理运算符-->
        <#assign operate=con.op >
        <#--处理值-->
        <#assign val=con.val >
        <#if (field.dataType=="varchar") >
            <#assign val="'"+val+"'" >
        </#if>

        <#if con_index==0>
            <#assign rtn="value" + operate + val >
        <#else>
            <#assign rtn=rtn + " && value" + operate + val >
        </#if>
    </#list>
    <#return rtn>
</#function>

<#--生成格式化函数-->
<#macro genFormaterFunction>
	<#if displayFields?if_exists>
	    <#list displayFields as field>
	        <#assign alarmSetting=field.alarmSetting >
	        <#assign formater=field.formater>
	        <#if formater?if_exists>
	            function ${field.name}_Formater(value, row, index){
	                 ${formater};
	            }
	        <#elseif alarmSetting?if_exists>
	            <#assign alarm=alarmSetting >
	            function ${field.name}_AlarmFormater(value, row, index){
	                <#list alarm as item>
	                    if(${getCondition(item.condition,field)}){
	                        return "<span style='color:${item.color};font-weight:bold;'>" + value +"</span>";
	                    }
	                </#list>
	                return value;
	            }

	        </#if>
	    </#list>
	 </#if>
</#macro>

<#--生成查询条件宏 -->
<#macro genCondition field>
	<#assign content=field.controlContent>
	<el-form-item label="${field.cm}" style="padding-right:10px;" v-if="display('${field.mpDisplay}')" v-show="${!field.isShow}">
	<#if field.vf=="static" >
		<#switch field.ct>
			<#case "onetext">
				<#if field.ty == 'number'>
					<el-input type="number" size="mini" class="search-item" ht-query="${colPrefix}${field.na}" v-model="searchForm.${colPrefix}${field.na}" operation="${field.qt}" placeholder="${field.cm}" name="Q^${colPrefix}${field.na}^${field.qt}" clearable></el-input>
				<#else>
					<el-input type="text" size="mini" class="search-item" ht-query="${colPrefix}${field.na}" v-model="searchForm.${colPrefix}${field.na}" operation="${field.qt}" placeholder="${field.cm}" name="Q^${colPrefix}${field.na}^${field.qt}" clearable @keyup.enter.native="searchEnterFun"></el-input>
				</#if>
			<#break>
			<#-- 自定义对话框 -->
			<#case "customDialog">
	            <#assign dg=content>
	        	<ht-dialog class="search-item" isFromList="true" ht-query="${colPrefix}${field.na}" special-query="${colPrefix}${field.na}" v-model="searchForm.${colPrefix}${field.na}" operation="${field.qt}" :custdialog='${util.getCustDialogAttr(colPrefix,field)}' permission="w" atter="searchForm.${colPrefix}${field.na}" />
	        <#break>
			<#case "date"><#--日期选择器 -->
				<@genQueryDate field=field/>
			<#break>
			<#case "select"><#--下拉选项-->
				<#assign options=content>
				<div style="display:inline">
					<#if util.getJsonByPath(field.option,'choiceType')=="dynamic">
						<#--<el-select size="mini" v-model="searchForm.${colPrefix}${field.na}" class="search-item" placeholder="${field.cm}" operation="${field.qt}" ht-select-query="${util.getSelectQuery(field.option,false)}" ht-query="${colPrefix}${field.na}" name="Q^${colPrefix}${field.na}^${field.qt}" clearable>
					    </el-select>-->
					    <eip-select v-model="searchForm.${colPrefix}${field.na}"  model-name="searchForm.${colPrefix}${field.na}"
				                    placeholder="${field.cm}"
				                    :ganged="${util.getSelectQuery(field.option,type!=1)}"
				                    permission="w">
				        </eip-select>
					<#else>
						<el-select size="mini" v-model="searchForm.${colPrefix}${field.na}" class="search-item" placeholder="${field.cm}" operation="${field.qt}" ht-query="${colPrefix}${field.na}" name="Q^${colPrefix}${field.na}^${field.qt}">
					    	<el-option label="全部" value=""></el-option>
					    	<#list field.controlContent as opt>
					    		<el-option label="${opt.value}" value="${opt.key}"></el-option>
							</#list>
					    </el-select>
					</#if>
	            </div>
			<#break>
			<#case "dic"><#--数据字典-->
				<#assign dickey=util.getJsonByPath(field.controlContent,'alias')>
				<#assign resultField=util.getJsonByPath(field.controlContent,'resultField')>
				<div style="display:inline-block;" class="col-md-12">
					<div ht-dic='${colPrefix}${field.na}' dickey="${dickey}" resultfield="${resultField}" ht-query="${colPrefix}${field.na}" bind="${colPrefix}${field.na}" desc="数据字典" type="text"  ng-model="${colPrefix}${field.na}" class="form-control"  ></div>
				</div>
			<#break>
			<#case "radio"><#--单选按钮 -->
			<#case "checkbox"><#--复选框 -->
				${getCheckboxOrRadio(field)}
			<#break>
			<#default>
				<el-input type="text" size="mini" class="search-item" ht-query="${colPrefix}${field.na}" v-model="searchForm.${colPrefix}${field.na}" operation="${field.qt}" placeholder="${field.cm}" name="Q^${colPrefix}${field.na}^${field.qt}" clearable @keyup.enter.native="searchEnterFun"></el-input>
			<#break>
		</#switch>
	</#if>
	</el-form-item>
</#macro>

<#--汇总设置-->
<#macro genSummaryField>
	<div style="text-align: center;margin: 5px 0;">
		<span style="font-weight: bold;font-size: 20px;margin: 0 10px" v-for="item in summaryFields">{{item.name}}: {{summary(item.method,item.field,item.decimal)}}</span>
	</div>
</#macro>

<#noparse>
<#--管理列-->
<#macro genManage manage managePermission actionUrl data>
	<#--编辑-->
	<#if manage.name == 'edit'>
		<#if managePermission.edit>
			<el-button v-if="permission.edit && display('${manage.mpDisplay}')" type="text" @click='operating("${templateId}",scope.row.${pkField},"edit","${bpmDataTemplate.defId}",scope.row.isStartFlow,"${manage.openType}");' size="mini" plain>${manage.desc}</el-button>
		</#if>
    <#--打印-->
    <#elseif manage.name == 'printDetail'>
        <#if managePermission.printDetail>
            <el-button type="text" v-if="display('${manage.mpDisplay}')" size="mini" @click='printDetail("${templateId}",scope.row.${pkField},"get")'>${manage.desc}</el-button>
        </#if>
	<#--删除-->
	<#elseif manage.name == 'del' >
		<#if managePermission.del>
			<el-button type="text" v-if="permission.del && display('${manage.mpDisplay}')" @click='del(scope.row.${pkField});' size="mini" plain>${manage.desc}</el-button>
		</#if>

	<#--子表-->
	<#elseif manage.name == 'sub'>
		<#if managePermission.sub && hasSub>
			<el-button type="text" v-if="display('${manage.mpDisplay}')" @click='showSubList(scope.row.${pkField});' size="mini" plain>${manage.desc}</el-button>
		</#if>
	<#--生成二维码-->
	<#elseif manage.name == 'produceQRCode' >
		<#if managePermission.produceQRCode>
			<el-button type="text" v-if="display('${manage.mpDisplay}') && <#if bpmDataTemplate.mobileFormAlias?exists>true<#else>false</#if>" @click='getQRCode("${templateId}",scope.row.${pkField},"${bpmDataTemplate.mobileFormAlias}",${JsonUtil.toJson(manage.display)},scope.$index,${manage.QRCodePattern})' size="mini" plain>${manage.desc}</el-button>
	</#if>
	<#--明细-->
	<#elseif manage.name == 'detail' >
		<#if managePermission.detail>
			<el-button type="text" v-if="display('${manage.mpDisplay}')" @click='operating("${templateId}",scope.row.${pkField},"get","","","${manage.openType}");' size="mini" plain>${manage.desc}</el-button>
		</#if>
	<#elseif manage.name == 'url' &&manage.type=='1'>
		<#if managePermission.url>
		<el-button type="text" v-if="display('${manage.mpDisplay}')" @click="openUrl('${manage.url}','new','','')" size="mini" plain>${manage.desc}</el-button>
		</#if>
	<#--表单修改记录-->
	<#elseif manage.name == 'record' >
		<#if managePermission.record>
			<el-button type="text" v-if="display('${manage.mpDisplay}')" @click="openRecordList(scope.row.${pkField})" size="mini" plain>${manage.desc}</el-button>
		</#if>
	<#elseif manage.name == 'switch' >
		<#if managePermission.switch>
			<el-tooltip content="${manage.desc}" effect="dark" v-if="display('${manage.mpDisplay}')">
				<el-switch
					@change='switchChange(scope.row.${pkField},"${manage.switchOn}","${manage.switchOff}","${manage.bind}",scope.row,"${manage.switchDefaultTrue}")'
					v-model="scope.row.${manage.bind}"
					active-value="${manage.switchOn}"
					inactive-value="${manage.switchOff}"
					v-if="scope.row.${manage.bind} == ${manage.switchOn} || scope.row.${manage.bind} == ${manage.switchOff}"
					>
				</el-switch>
				<el-switch
					@change='switchChange(scope.row.${pkField},"${manage.switchOn}","${manage.switchOff}","${manage.bind}",scope.row,"${manage.switchDefaultTrue}")'
					active-value="${manage.switchOn}"
					inactive-value="${manage.switchOff}"
					:value="'${manage.switchDefaultTrue}'=='true'?'${manage.switchOn}':'${manage.switchOff}'"
					v-else
				>
				</el-switch>
			</el-tooltip>
		</#if>
	<#elseif manage.name == 'js' >
		<#if managePermission.js>
		<el-button type="text" v-if="display('${manage.mpDisplay}')" @click='customEvilJS(scope.row,"${manage.jsValue}")' size="small" plain>${manage.desc}</el-button>
	</#if>
	<#else>
	</#if>
</#macro>


<#--顶部按钮-->
<#macro genToolBar manage managePermission actionUrl>
    <#--打印-->
    <#if manage.name == 'print'>
        <#if managePermission.print>
            <el-button type="primary" v-if="permission.print && display('${manage.mpDisplay}')" size="mini" @click="printList()" icon="el-icon-printer">${manage.desc}</el-button>
        </#if>
    </#if>
	<#-- 新增 -->
	<#if manage.name == 'add'>
		<#if managePermission.add>
            <el-button type="primary" v-if="permission.add && display('${manage.mpDisplay}')" size="mini" @click="operating('${templateId}','', 'add','${bpmDataTemplate.defId}','','${manage.openType}')" icon="el-icon-plus">${manage.desc}</el-button>
		</#if>
	</#if>
	<#-- 生成二维码 -->
	<#if manage.name == 'produceQRCode'>
		<#if managePermission.produceQRCode>
			<el-button  v-if="display('${manage.mpDisplay}') && <#if bpmDataTemplate.mobileFormAlias?exists>true<#else>false</#if>" @click='downloadAllQRCode("${templateId}","${bpmDataTemplate.mobileFormAlias}",${JsonUtil.toJson(manage.display)},"${pkField}",${manage.QRCodePattern})' size="mini" plain icon="el-icon-s-grid">${manage.desc}</el-button>
		</#if>
	</#if>
	<#-- 启动流程 -->
	<#--<#if manage.name == 'startFlow'>
		<#if managePermission.startFlow  >
		   <el-button type="success" @click="toStartFlow('${bpmDataTemplate.defId}')" icon="el-icon-success">${manage.desc}</el-button>
		</#if>
	</#if> -->

	<#-- 删除 -->
	<#if manage.name == 'del'>
		<#if managePermission.del>
		   <el-button type="danger" v-if="permission.del && display('${manage.mpDisplay}')" size="mini" @click="deleted()" icon="el-icon-delete">${manage.desc}</el-button>
		</#if>
	</#if>

	<#-- 批量更新数据 -->
		<#if manage.name == 'batchUpdate'>
			<#if managePermission.batchUpdate>
				<el-button type="primary" v-if="display('${manage.mpDisplay}')" size="mini" @click="batchUpdate('${manage.desc}','${manage.batchUpdateData}','${manage.filedsObj}')" icon="el-icon-edit">${manage.desc}</el-button>
			</#if>
		</#if>

	<#-- 导出 -->
	<#if manage.name == 'export'>
		<#if managePermission.export>
		    <el-button type="success" v-if="permission.export && display('${manage.mpDisplay}')" size="mini" @click="exports('${manage.exportSettingFields}')" icon="el-icon-download">${manage.desc}</el-button>

		</#if>
	</#if>
	<#-- 导入 -->
	<#if manage.name == 'import'>
		<#if managePermission.import>
			<el-dropdown split-button v-if="permission.add  && display('${manage.mpDisplay}')" size="mini" type="success" @command="importCommand" class="dropdown-upload__btn">
			  <el-upload
				action=""
				:show-file-list="false"
				:http-request="importMain"
				accept=".xls,.xlsx">
				<span style="display:inline-block;width:68px;height:26px;line-height:26px;"> <i class="el-icon-upload2"></i>${manage.desc}</span>
			</el-upload>
			  <el-dropdown-menu slot="dropdown">
			    <el-dropdown-item :command="{command:'downloadTempFile'}">下载模板</el-dropdown-item>
			    <el-dropdown-item v-if="dataView && dataView.refIdValue" :command="{command:'log'}">查看异常日志</el-dropdown-item>
			  </el-dropdown-menu>
			</el-dropdown>
		</#if>
	</#if>
	<#if manage.name == 'url'&&manage.type=='2'>
	<#if managePermission.url>
		<el-button type="info" v-if="display('${manage.mpDisplay}')"  size="mini" @click="openUrl('${manage.url}','new','','')" icon="el-icon-share">${manage.desc}</el-button>
	</#if>
	</#if>

</#macro>

<#--我的草稿按钮-->
<#macro myDraftListToolBar manage managePermission actionUrl>
    <#if manage.name == 'add'>
        <#if managePermission.add>
            <el-button type="primary"  v-if="permission.add && display('2')  && showDraftList" @click="myDraftList"  size="mini" style="float:right;"> <i class="icon-caogao my-draft__icon"></i>我的草稿</el-button>
        </#if>
    </#if>
</#macro>

</#noparse>


<#--过滤条件
<#noparse><#if filterFields?if_exists>
<div class="panel" ajax="ajax"  displayId="${bpmDataTemplate.id}" filterKey="${filterKey}" >
<#if filterFields?size gt 1>
<div class='panel-nav'>
	<div class="l-tab-links">
		<ul style="left: 0px; ">
			<#list filterFields as field>
			<li tabid="${field.key}" <#if field.key ==filterKey> class="l-selected"</#if>>
				<a href="${field.url}" title="${field.name}">${field.desc}</a>
			</li>
			</#list>
		</ul>
	</div>
</div>
</#if>
</#noparse> -->
	<#-- 主体内容 start  -->

	<el-container  v-loading="loading">
		<el-dialog
				:visible.sync="QRCodeDialog"
				width="340px"
				@opened="foundQRCode"
				:before-close="QRCodeDialogClose"
				:append-to-body=true
				:center=true
		>
			<div id="QRCodeAndDesc" style="text-align:center">
			<canvas id="QRCode" v-show="QRCodeShow"></canvas>
				<div v-show="QRCodeShow" v-for="item in QRCodeDesc">{{item}}</div>
			</div>
			<span slot="footer"  v-show="QRCodeShow">
                <el-button type="primary" v-clipboard:copy="QRCodeurl" v-clipboard:success="onCopy" v-clipboard:error="onError" >复制URL</el-button>
				<el-button type="success" @click="downloadQRCode">下载二维码</el-button>
              </span>
		</el-dialog>

		<el-dialog title="导出设置" :visible.sync="dialogExportVisible" width="750px" id="exportDialogs" :before-close="exportCancel">
			<el-form :model="exportData" status-icon ref="exportData" label-width="100px">
				<el-row type="flex" class="row-bg" justify="start" style="height:48px;border: 1px solid #eee;text-align:center;">
					<el-col :span="6" style="padding:15px 0px 0px 15px;">
						导出类型
					</el-col>
					<el-col :span="18" style="border-left: 1px solid #eee;padding:15px 0px 0px 15px;">
						<el-switch
								v-model="exportData.getType"
								active-text="全部数据"
								active-value="all"
								inactive-text="当前页数据"
								inactive-value="page">
						</el-switch>
					</el-col>
				</el-row>
				<el-row type="flex" class="row-bg" justify="start" style="border: 1px solid #eee;text-align:center;">
					<el-col :span="6" style="padding:15px 0px 0px 15px;">
						导出字段
					</el-col>
					<el-col :span="18" style="border-left: 1px solid #eee;padding:5px 0px 0px 5px;max-height:420px;overflow:auto;">
						<el-table
								ref="multipleExportTable"
								:data="displayFields"
								style="width:100%"
								@select-all="handleExportSelectAll"
								tooltip-effect="dark"
								@selection-change="handleExportSelectionChange">
							<el-table-column
									type="selection"
									width="55">
							</el-table-column>
							<el-table-column
									prop="desc"
									label="字段描述"
									width="180">
							</el-table-column>
							<el-table-column label="操作" width="160">
								<template slot-scope="scope">
									<el-button @click='sort(scope.$index,"down");' size="mini" icon="el-icon-arrow-down" plain></el-button>
									<el-button @click='sort(scope.$index,"up");' size="mini" icon="el-icon-arrow-up" plain></el-button>
								</template>
							</el-table-column>
						</el-table>
					</el-col>
				</el-row>
				<el-row type="flex" class="row-bg" justify="start" style="border: 1px solid #eee;text-align:center;" v-for="(item,index) in subDisplayFieldsList">
					<el-col :span="6" style="padding:15px 0px 0px 15px;">
						子表{{item.comment}}导出字段
					</el-col>
					<el-col :span="18" style="border-left: 1px solid #eee;padding:15px 0px 0px 15px;">
						<el-table
								ref="subExportTable"
								:data="item.fields"
								style="width:100%"
								tooltip-effect="dark">
							<el-table-column
									type="selection"
									width="55">
							</el-table-column>
							<el-table-column
									prop="name"
									label="字段名称"
									width="100">
							</el-table-column>
							<el-table-column
									prop="desc"
									label="字段描述"
									width="180">
							</el-table-column>
							<el-table-column label="操作" width="160">
								<template slot-scope="scope">
									<el-button @click='sort(scope.$index,"down");' size="mini" icon="el-icon-arrow-down" plain></el-button>
									<el-button @click='sort(scope.$index,"up");' size="mini" icon="el-icon-arrow-up" plain></el-button>
								</template>
							</el-table-column>
						</el-table>
					</el-col>
				</el-row>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button type="primary" @click="submitExport()" size="mini">确 定</el-button>
				<el-button @click="exportCancel()" size="mini">取 消</el-button>
			</div>
		</el-dialog>

		 <el-dialog
		      title="异常日志"
		      :visible.sync="dialogVisible"
		      width="80%"
		      top="8vh"
		      class="log_dialog"
		      v-if="dialogVisible"
		    >
		      <ht-table
		        @load="loadData"
		        :data="logData"
		        :selectable="false"
		        :pageResult="pageResult"
		        :show-export="false"
		        :show-custom-column="false"
		        size="mini"
		        quick-search-props="rowNumber,columnName,errorMsg"
		        ref="htTable"
		      >
		        <ht-table-column type="index" width="50" align="center" label="序号" />
		        <ht-table-column prop="rowNumber" label="EXCEL行号" width="120" />
		        <ht-table-column prop="columnName" label="EXCEL列名" width="120" />
		        <ht-table-column prop="errorMsg" align="left" label="异常描述" />
		      </ht-table>
		    </el-dialog>

		<#if treeFields?if_exists && treeFields.querys?if_exists>
				<el-aside width="200px">
					<el-scrollbar>
						<ht-tree
								:data="tree"
								:expand-on-click-node="false"
								:props='{children: "children",label: "${treeFields.showField}"}'
								@node-click="nodeClick"
								:load="loadTree"
								lazy/>
					</el-scrollbar>
				</el-aside>
			</#if>

		<el-container>
			<el-main>
				<TemplateBatchUpdateDialog ref="templateBatchUpdateDialog" @onConfirm="onConfirm"></TemplateBatchUpdateDialog>
				<div class="search-and-btn__wrap">
					<div class="top_btn_col">
						<#noparse><#list manageFields as manage>
						<@genToolBar manage=manage managePermission=managePermission actionUrl=actionUrl />
					</#list></#noparse>
                    <#noparse><#list manageFields as manage>
						<@myDraftListToolBar manage=manage managePermission=managePermission actionUrl=actionUrl />
					</#list></#noparse>
                    </div>
                    <div class="top_right_col">
                    	<el-button size="mini" type="primary" icon="el-icon-refresh" @click="search('find')">刷新</el-button>
                    </div>
                <#--查询条件-->
				<#if conditionFields?if_exists>
					<#if isIndistinct == 'show'>
							<el-form :inline="true" :model="queryForm" class="demo-form-inline blurred-search__row" @submit.native.prevent>
								<#--模糊查询区域-->
									<el-input
											type="text"
											size="mini"
											class="search-query"
											clearable
											placeholder="${conditionAllDesc }"
											prefix-icon="el-icon-search"
											v-model="queryForm.queryData"
											@keyup.enter.native="searchEnterFun"
											:disabled="formType"
											ht-quick-search="${conditionAllName }"
									></el-input>
									<el-button size="mini" style="margin-left: 10px" type="primary" icon="el-icon-search" @click="search('find')">查询</el-button>
									<el-button size="mini" class="blurred-search-btn__item" icon="el-icon-refresh" @click="reset">重置</el-button>
									<el-button size="mini" class="blurred-search-btn__item" @click="advanced()" :icon="incons" type="info"></el-button>
							</el-form>
                        <#--高级检索区域-->
						<el-form  ref="form" :model="searchForm" :inline="true" :label-position="labelPosition" v-show="formType">
							<#list conditionFields as field>
								<@genCondition field=field/>
							</#list>
						</el-form>
					</#if>
					<#if isIndistinct == 'hide'>
						<el-row v-if="showSearchPane()">
							<el-collapse v-model="activeNames">
							  <el-collapse-item name="1">
								  <template slot="title">
									  <el-button size="mini" type="primary" icon="el-icon-search">搜索</el-button>
								  </template>
									<el-form :inline="true" :model="searchForm" class="demo-form-inline" @submit.native.prevent>
										<#list conditionFields as field>
											<@genCondition field=field/>
										</#list>
										<el-form-item>
											<el-button size="small" type="primary" icon="el-icon-search" @click="search('find')">查询</el-button>
											<el-button size="small" icon="el-icon-refresh" @click="reset">重置</el-button>
										</el-form-item>
									</el-form>
							  	</el-collapse-item>
							  </el-collapse>
						</el-row>
					</#if>
				</#if>
                </div>
                <#if summaryFields?if_exists>
					<@genSummaryField/>
				</#if>
					<el-dialog title="查看子表数据" :visible.sync="dialogSubVisible" :close-on-click-modal="false" width="60%" id="subDialogs" :before-close="subCancel">
						<el-tabs type="border-card" v-model="currentTabName">
							<el-tab-pane v-for="tab in tabs" :label="tab.comment" :key="tab.id">
								<el-container>
									<el-main style="padding:0px;">
										<el-input placeholder="请输入字段内容查询" v-model="querySubValue" clearable>
											<el-button slot="append" icon="el-icon-search" @click="querySubTable(tab)"/>
										</el-input>
										<el-upload
												style="display: inline"
												action=""
												:http-request="importSub"
												:show-file-list="false"
												accept=".xls,.xlsx">
											<el-button @click="importButton(tab)" size="mini">导入</el-button>
										</el-upload>

										<el-button size="mini" @click="exportSub(tab)">导出</el-button>
										<el-table
												:data="tab.dataList"
												style="width:100%"
												border
												stripe
												tooltip-effect="dark"
												header-cell-class-name="todo-header-row"
												row-class-name="todo-row" size="mini"
												v-loading="subTableLoading">
											<el-table-column
													label="序号"
													type="index"
													width="50">
											</el-table-column>
											<el-table-column v-for="attributes in tab.attributeList" v-if="!attributes.isShow" :key="attributes.id"
															 :prop="attributes.fieldName"
															 :label="attributes.comment"
											>
                                                <template slot-scope="scope">
                                                    <span v-if="attributes.format && attributes.format=='yyyy-MM-dd'">
                                                        {{ scope.row[attributes.fieldName] | dateformat('yyyy-MM-dd') }}
                                                    </span>
                                                    <span v-if="(!attributes.format || (attributes.format && attributes.format!='yyyy-MM-dd'))">
                                                        {{scope.row[attributes.fieldName]}}
                                                    </span>
                                                </template>
											</el-table-column>
											<el-table-column
													label="操作"
													type="index"
													v-if="tab.childEnts.length>0"
													width="100">
												<template slot-scope="scope">
													<#--查看孙表-->
													<#noparse>
													<#list manageFields as manage>
													<#if manage.name == 'sun'&&managePermission.sun>
													<el-button type="text" size="small" @click="getSunData(tab,scope.row)">${manage.desc}</el-button>
												</#if>
											</#list>
											</#noparse>
											</template>
											</el-table-column>
										</el-table>
									</el-main>
									<el-footer>
										<el-pagination
												@current-change="handleSubCurrentChange($event,tab)"
												:current-page="tab.pagination.pageBean.page"
												:page-size="tab.pagination.pageBean.pageSize"
												layout="total, prev, pager, next, jumper"
												:total="tab.pagination.pageBean.total">
										</el-pagination>
									</el-footer>
								</el-container>
							</el-tab-pane>
						</el-tabs>
					</el-dialog>

                    <#--查看孙表数据对话框-->
                    <el-dialog title="查看孙表数据" :visible.sync="dialogSunVisible" width="60%" :close-on-click-modal="false" :before-close="sunCancel">
                        <el-tabs type="border-card" >
                            <el-tab-pane v-for="tab in sunTabs" :label="tab.comment" :key="tab.id">
                                <el-container>
                                    <el-main style="padding:0px;">
                                        <el-input placeholder="请输入字段内容查询" v-model="querySunValue" clearable>
                                            <el-button slot="append" icon="el-icon-search" @click="querySubTable(tab,querySunValue)"/>
                                        </el-input>
                                        <el-table
                                                :data="tab.dataList"
                                                style="width:100%"
                                                border
                                                stripe
                                                tooltip-effect="dark"
                                                header-cell-class-name="todo-header-row"
                                                row-class-name="todo-row" size="small"
                                                v-loading="subTableLoading">
                                            <el-table-column
                                                    label="序号"
                                                    type="index"
                                                    width="50">
                                            </el-table-column>
                                            <el-table-column v-for="attributes in tab.attributeList" v-if="!attributes.isShow" :key="attributes.id"
                                                             :prop="attributes.fieldName"
                                                             :label="attributes.comment"
                                            >
                                                <template slot-scope="scope">
                                                    <span v-if="attributes.format && attributes.format=='yyyy-MM-dd'">
                                                        {{ scope.row[attributes.fieldName] | dateformat('yyyy-MM-dd') }}
                                                    </span>
                                                    <span v-if="!attributes.format || (attributes.format && attributes.format!='yyyy-MM-dd')">
                                                        {{scope.row[attributes.fieldName]}}
                                                    </span>
                                                </template>
                                            </el-table-column>
                                        </el-table>
                                    </el-main>
                                    <el-footer>
                                        <el-pagination
                                                @current-change="handleSubCurrentChange($event,tab)"
                                                :current-page="tab.pagination.pageBean.page"
                                                :page-size="tab.pagination.pageBean.pageSize"
                                                layout="total, prev, pager, next, jumper"
                                                :total="tab.pagination.pageBean.total">
                                        </el-pagination>
                                    </el-footer>
                                </el-container>
                            </el-tab-pane>
                        </el-tabs>
                    </el-dialog>
					<#--修改记录对话框-->
					<el-dialog
						v-if="dialogRecordVisible"
						title="查看修改记录"
						:visible.sync="dialogRecordVisible"
						width="65%"
						:before-close="recordCancel"
					>
						<el-container>
							<el-main style="padding:0px;">
								<el-table
										:data="recordList"
										style="width:100%"
										border
										stripe
										tooltip-effect="dark"
										header-cell-class-name="todo-header-row"
										row-class-name="todo-row" size="mini"
										v-loading="recordTableLoading">
									<el-table-column label="序号" type="index" width="50" align="center" />
									<el-table-column prop="userName" label="修改人"  width="100" />
					              	<el-table-column prop="taskName" label="任务名称"  width="100" show-overflow-tooltip />
					              	<el-table-column prop="reason" label="审批意见" width="160" show-overflow-tooltip />
					              	<el-table-column prop="modifyTime" label="修改时间" width="160" show-overflow-tooltip />
							        <el-table-column prop="detail" label="修改详情" show-overflow-tooltip>
							        	<template slot-scope="scope">
											<el-link @click="openModifyDetail(scope.row)" title="查看明细" >{{scope.row.detail}}</el-link>
										</template>
							        </el-table-column>
									<el-table-column fixed="right" label="操作"  width="100" align="left">
										<template slot-scope="scope">
											<el-button type="text" @click="showModifyRecord(scope.row.id, scope.row.refId)">查看详情</el-button>
										</template>
									</el-table-column>
								</el-table>
							</el-main>
							<el-footer>
								<el-pagination
										@current-change="handleRecordCurrentChange($event,modifyRecord)"
										:current-page="modifyRecord.pagination.pageBean.page"
										:page-size="modifyRecord.pagination.pageBean.pageSize"
										layout="total, prev, pager, next, jumper"
										:total="modifyRecord.pagination.pageBean.total">
								</el-pagination>
							</el-footer>
							<el-dialog
					            width="60%"
					            title="修改明细"
					            :visible.sync="modifyDetailDialogVisible"
					            top="8vh"
					            :append-to-body="true"
					            :close-on-click-modal="false"
					            >
					            <el-form v-if="modifyDetailDialogVisible" v-model="currentModify" data-vv-scope="editModifyForm">
					                <ht-input style="width:100%" type="textarea" v-model="currentModify.detail" :rows="20" :readonly="true" />
					            </el-form>
					        </el-dialog>
						</el-container>
					</el-dialog>
                <span id="printData">
                    <el-table
                            ref="multipleTemplateTable"
                            :data="rows"
                            stripe
                            border
                            :max-height="tableHeight"
                            style="width: 100%"
                            header-cell-class-name="todo-header-row"
                            row-class-name="todo-row"
                            size="mini"
                            @selection-change="handleSelectionChange"
                            @sort-change="handleSortChange"
      						@filter-change="handleFilterChange">
                        <el-table-column v-if="listSelectable"  type="selection" width="55" align="center"></el-table-column>
                        <el-table-column type="index" width="50" label="序号" align="center" :fixed="getFixed('left')"></el-table-column>
                        <#list displayFields as field>
                        <#assign fieldType=field.type>
                        <#assign fieldName=field.name>
                        <#noparse><#if permission.</#noparse>${field.name}<#noparse>></#noparse>
                        <el-table-column prop="${field.name}" column-key="${field.name}" align="center" label="${field.desc}" <#if util.getJsonByPath(filteringFieldMap,fieldName) != "" >:filters='${util.getJsonByPath(filteringFieldMap,fieldName)}'</#if> style="width: 15%" <#if defaultAllSort || util.getJsonByPath(sortFieldMap,fieldName) != "" >:sortable="isSortable('${field.name}')"</#if> show-overflow-tooltip  v-if="display('${field.mpDisplay}')">
								<template slot-scope="scope">
										<#if field.proSetting>
										<#--进度条-->
											<el-progress :percentage="getProValue(scope.row.${field.name},${field.ruleSetting})"
														 :color="getProColor('${util.toJsonStr(field.ruleSettings)}',scope.row)"></el-progress>
										<#elseif field.urlType=='edit'>
											<el-link
													type="primary"
													@click='operating("${templateId}",scope.row.${pkField},"select","","","${field.openType}");'
													title="查看详情"
													<#if field.ruleSettings?if_exists>
														:style="getColor('${util.toJsonStr(field.ruleSettings)}',scope.row)"
													</#if>
											>
												<#if field.formatterData?if_exists>
													<#list field.formatterData as formatter>
														<#if formatter_index==0><span v-if='scope.row.${field.name}=="${formatter.key_}"'>${formatter.value_}</span></#if>
															<#if formatter_index!=0><span v-else-if='scope.row.${field.name}=="${formatter.key_}"'>${formatter.value_}</span></#if>
													</#list>
														<span v-else>{{scope.row.${field.name}}}</span>
												<#else>
													<span>{{scope.row.${field.name}}}</span>
												</#if>
											</el-link>
										<#elseif field.urlType=='reportForm'>
											<el-link
													type="primary"
                                                    @click='viewReport(scope.row,"${util.toJsonStr(field.reportNameConfigure)}","${field.openType}");'
													title="查看报表"
													<#if field.ruleSettings?if_exists>
														:style="getColor('${util.toJsonStr(field.ruleSettings)}',scope.row)"
													</#if>
											>
												<#if field.formatterData?if_exists>
													<#list field.formatterData as formatter>
														<#if formatter_index==0><span v-if='scope.row.${field.name}=="${formatter.key_}"'>${formatter.value_}</span></#if>
															<#if formatter_index!=0><span v-else-if='scope.row.${field.name}=="${formatter.key_}"'>${formatter.value_}</span></#if>
													</#list>
														<span v-else>{{scope.row.${field.name}}}</span>
												<#else>
													<span>{{scope.row.${field.name}}}</span>
												</#if>
											</el-link>
										<#elseif field.urlType=='url'>
											<el-link
													type="primary"
													@click='openUrl("${field.url}","${field.openType}",scope.row,"${field.name}");'
													title="跳转到其他URL地址"
													<#if field.ruleSettings?if_exists>
														:style="getColor('${util.toJsonStr(field.ruleSettings)}',scope.row)"
													</#if>
											>
												<#if field.formatterData?if_exists>
													<#list field.formatterData as formatter>
														<#if formatter_index==0><span v-if='scope.row.${field.name}=="${formatter.key_}"'>${formatter.value_}</span></#if>
															<#if formatter_index!=0><span v-else-if='scope.row.${field.name}=="${formatter.key_}"'>${formatter.value_}</span></#if>
													</#list>
														<span v-else>{{scope.row.${field.name}}}</span>
												<#else>
													<span>{{scope.row.${field.name}}}</span>
												</#if>
											</el-link>
										<#else>
											<span
												<#if field.ruleSettings?if_exists>
													:style="getColor('${util.toJsonStr(field.ruleSettings)}',scope.row)"
												</#if>
											>
												<#if field.formatterData?if_exists>
													<#list field.formatterData as formatter>
														<#if formatter_index==0><span v-if='scope.row.${field.name}=="${formatter.key_}"'>${formatter.value_}</span></#if>
															<#if formatter_index!=0><span v-else-if='scope.row.${field.name}=="${formatter.key_}"'>${formatter.value_}</span></#if>
													</#list>
														<span v-else>{{scope.row.${field.name}}}</span>
												<#else>
													<span v-if="display('0') && switchMap.${field.name}">
														<span v-if="scope.row.${field.name} == switchMap.${field.name}.on">
															{{switchMap.${field.name}.onLabel}}
														</span>
														<span v-else-if="scope.row.${field.name} == switchMap.${field.name}.off">
															{{switchMap.${field.name}.offLabel}}
														</span>
														<span v-else>
															{{scope.row.${field.name}}}
														</span>
													</span>
													<span v-else>
														{{scope.row.${field.name}}}
													</span>
												</#if>
											</span>
										</#if>
								</template>

                        </el-table-column>

                        <#noparse></#if></#noparse>
                    </#list>
                    <#noparse>
                    <#if (manageFields?size > 0) >
                    </#noparse>
                    <el-table-column
                            :fixed="getFixed('right')"
                            label="操作"
                            :width="operateColWidth"
                            class-name="right_menu"
                            align="center" v-if="!notPrint && showRightMenu">
                        <template slot-scope="scope">
                            <#noparse>
		                        <#list manageFields as manage>
		                           <@genManage manage=manage managePermission=managePermission actionUrl=actionUrl data=data/>
		                        </#list>
                                <#list manageFields as manage>
                                    <#if manage.name == 'startFlow'>
                                        <el-button size="mini" type="text" v-if='!scope.row.isStartFlow&&"${bpmDataTemplate.defId}"' @click='startFlow(scope.row.${pkField});'  plain>启动流程</el-button>
                                    </#if>
                                </#list>
		                        <el-button size="mini" type="text" v-if='isJoinFlow=="true"' @click='complete(scope.row,taskType);'  plain>任务明细</el-button>
		                    </#noparse>
                    	</template>
                    </el-table-column>
                    <#noparse>
                    </#if>
                    </#noparse>
                    </el-table>
                </span>
			</el-main>
			<el-footer height="45px">
				<el-row type="flex" justify="end">
					<el-pagination
							v-if="templateInfo && templateInfo.needPage && templateInfo.needPage===1"
							@size-change="handleSizeChange"
							@current-change="handleCurrentChange"
							:current-page="pagination.page"
							:page-sizes="[10, 20, 30, 50, 100]"
							:page-size="pagination.pageSize"
							:layout="paginationLayout"
							:total="total">
					</el-pagination>
				</el-row>
			</el-footer>
			<div  id="QRCodeAndDescAll" style="Opacity:0"></div>
		</el-container>

	  </el-container>




	<#-- 主体内容 end  -->
<#--
<#noparse>
<#else>
   <div style="padding:6px 0px 12px 0px;">当前用户没有满足的过滤条件,请设置过滤条件。<div>
</#if>
</#noparse>
-->
