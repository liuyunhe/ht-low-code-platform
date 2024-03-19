<#-- 
Name: 自定义视图模板
Desc:自定义视图模板

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

<#--显示字段-->
<#assign fields=showList>
<#--字段Map-->

<#assign factFieldMap=showMap>

<#--是否显示行号-->
<#assign showRowsNum="false">
<#--是否初始化查询-->
<#assign initQuery="false">
<#--是否初始化查询-->
<#assign pageSize=queryView.pageSize>
<#assign buttons=queryView.buttons?eval>
<#assign displayFields=queryView.shows?eval>
<#assign conditions=queryView.conditions?eval>
<#assign summarySetting=queryView.summarySetting?eval>
<#--是否分组-->
<#assign supportGroup="false">
<#if (queryView.supportGroup==1)>
    <#assign supportGroup="true">
</#if>


<#if (queryView.showRowsNum==1)>
    <#assign showRowsNum="true">
</#if>

<#if (queryView.initQuery==1)>
    <#assign initQuery="true">
</#if>

<#-- 判断是否需要显示操作列 -->
<#function isShowManageColumn field> 
	<#if (rowButtons?exists && rowButtons?size>0) >
		<#list buttons as btn>
			<#if (!(btn.hidden?exists)|| btn.hidden==0) && (btn.inRow==1|| btn.inRow==true) >
				<#return 'true'>
			</#if>
		</#list>
	</#if>
	<#return 'false'>
</#function>

<#--日期选择器 -->
<#macro genQueryDate field>
		<#switch field.operate>
			<#case "BETWEEN">
				<#switch field.dateFormat>
					<#case "yyyy-MM-dd">
						<el-date-picker class="search-item" v-model="searchForm.${field.fieldName}" type="daterange"   range-separator="至"      start-placeholder="${field.fieldDesc}开始日期"
                                    end-placeholder="${field.fieldDesc}结束日期"  operation="between"  placeholder="${field.fieldDesc}" ht-query="${field.fieldName}" field-query="${field.name}" value-format="yyyy-MM-dd"> </el-date-picker>
						<#break>
					<#default>
						<el-date-picker class="search-item" v-model="searchForm.${field.fieldName}" type="datetimerange"   range-separator="至"      start-placeholder="${field.fieldDesc}开始日期"
									end-placeholder="${field.fieldDesc}结束日期"  operation="between"  placeholder="${field.fieldDesc}" ht-query="${field.fieldName}" field-query="${field.name}" value-format="yyyy-MM-dd HH:mm:ss"> </el-date-picker>
						<#break>
				</#switch>
				<#break>
			<#default>
				<#switch field.dateFormat>
					<#case "yyyy-MM-dd">
						<el-date-picker  size="mini" v-model="searchForm.${field.fieldName}" value-format="${field.dateFormat}"  type="date" class="search-item" operation="${field.operate}" placeholder="${field.fieldDesc}" ht-query="${field.fieldName}" field-query="${field.name}" > </el-date-picker>
					<#break>
					<#default>
						<el-date-picker  size="mini" v-model="searchForm.${field.fieldName}" value-format="${field.dateFormat}" type="datetime" class="search-item" operation="${field.operate}" placeholder="${field.fieldDesc}" ht-query="${field.fieldName}" field-query="${field.name}" > </el-date-picker>
					<#break>
				</#switch>
				<#break>
		</#switch>
</#macro>
<#--默认的日期选择器 -->
<#macro genQueryDateDefault field>
		<el-date-picker class="search-item" v-model="searchForm.${field.fieldName}" type="datetimerange"   range-separator="至"      start-placeholder="${field.fieldDesc}开始日期"      end-placeholder="${field.fieldDesc}结束日期"  operation="between"  placeholder="${field.fieldDesc}" ht-query="${field.fieldName}" field-query="${field.name}" value-format="yyyy-MM-dd HH:mm:ss"> </el-date-picker>
</#macro>

<#--汇总设置-->
<#macro genSummaryField>
	<div style="text-align: center;margin: 5px 0;">
		<span style="font-weight: bold;font-size: 20px;margin: 0 10px" v-for="item in summarySetting">{{item.name}}: {{summary(item.method,item.field,item.decimal)}}</span>
	</div>
</#macro>

<#--单选按钮或复选框 -->
<#function getCheckboxOrRadio field> 
	<#assign rtn>
			<#if field.controlContent?if_exists>
				<#if field.controlContent?if_exists>
					<#if field.ct=='radio'>
			            <el-radio-group size="small" v-model="searchForm.${field.fieldName}" class="search-item" operation="${field.operate}" ht-query="${field.fieldName}" field-query="${field.name}" >
			            <#list field.controlContent as opt>
			            	 <el-radio label="${opt.optionValue}">${opt.optionKey}</el-radio>
						</#list>
						</el-radio-group>
			        <#else>
			        	<el-checkbox-group size="small" v-model="searchForm.${field.fieldName}" class="search-item" operation="${field.operate}" ht-query="${field.fieldName}" field-query="${field.name}" >
			            <#list field.controlContent as opt>
			            	 <el-checkbox label="${opt.optionValue}">${opt.optionKey}</el-checkbox>
						</#list>
						</el-checkbox-group>
			        	<#--<#assign controlContent=util.getJsonByPath(field,'controlContent')>
			        	<ht-checkbox v-model="searchForm.${field.fieldName}" cklist='${controlContent}' permission='w' operation="${field.operate}" ht-query="${field.fieldName}" field-query="${field.name}"   -->
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
	            function ${field.fieldName}_Formater(value, row, index){
	                 ${formater};
	            }
	        <#elseif alarmSetting?if_exists>
	            <#assign alarm=alarmSetting >
	            function ${field.fieldName}_AlarmFormater(value, row, index){
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
	<el-form-item v-if="!${field.hidden}" label="${field.cm}" style="padding-right:10px;">
	<#switch field.controlType>
		<#case "onetext">
			<#if field.dataType == 'number'>
				<el-input  type="number" size="mini" class="search-item" ht-query="${field.fieldName}" field-query="${field.name}" v-model="searchForm.${field.fieldName}" operation="${field.operate}" placeholder="${field.fieldDesc}" :clearable="true"></el-input>
			<#elseif field.dataType == 'date'>
				<@genQueryDateDefault field=field/>
			<#else>
				<el-input  type="text" size="mini" class="search-item" ht-query="${field.fieldName}" field-query="${field.name}" v-model="searchForm.${field.fieldName}" operation="${field.operate}" placeholder="${field.fieldDesc}" :clearable="true"></el-input>
			</#if>
		<#break>
		<#-- 自定义对话框 -->
		<#case "customdialog">
			<#assign dg=content>
			<ht-dialog class="search-item" ht-query="${field.fieldName}" field-query="${field.name}" special-query="${field.fieldName}" v-model="searchForm.${colPrefix}${field.na}" operation="${field.operate}" :custdialog='${util.getCustDialogAttr(colPrefix,field)}' permission="w" atter="searchForm.${colPrefix}${field.na}" placeholder="${field.fieldDesc}" />
		<#break>
		<#case "date"><#--日期选择器 -->
			<@genQueryDate field=field/>
		<#break>
		<#case "select"><#--下拉选项-->
			<#assign options=content>
			<div style="display:inline">
				<#if util.getJsonByPath(field.option,'choiceType')=="dynamic">
					<el-select   size="mini" v-model="searchForm.${field.fieldName}" clearable class="search-item" placeholder="${field.fieldDesc}" operation="${field.operate}" ht-select-query="${util.getSelectQuery(field.option,false)}" ht-query="${field.fieldName}" field-query="${field.name}" clearable>
				    </el-select>
				<#else>
					<#assign controlContent=util.getListByPath(field,'controlContent')>
					<el-select  size="mini" v-model="searchForm.${field.fieldName}"	 class="search-item" placeholder="${field.fieldDesc}" operation="${field.operate}" ht-query="${field.fieldName}" field-query="${field.name}" >
				    	<el-option label="全部" value=""></el-option>
				    	<#list controlContent as opt>
				    		<el-option label="${opt.optionValue}" value="${opt.optionKey}"></el-option>
						</#list>
				    </el-select>
				</#if>
            </div>
		<#break>
		<#case "dic"><#--数据字典-->
			<#assign dickey=util.getJsonByPath(field.controlContent,'alias')>
			<#assign resultField=util.getJsonByPath(field.controlContent,'resultField')>
			<div  style="display:inline-block;" class="col-md-12">
				<div ht-dic='${colPrefix}${field.na}' dickey="${dickey}" resultfield="${resultField}" ht-query="${field.fieldName}" field-query="${field.name}" bind="${colPrefix}${field.na}" desc="数据字典" type="text"  ng-model="${colPrefix}${field.na}" class="form-control"  ></div>
			</div>
		<#break>
		<#case "radio"><#--单选按钮 -->
		<#case "checkbox"><#--复选框 -->
			${getCheckboxOrRadio(field)}  
		<#break>
		<#default>
			<el-input  type="text" size="mini" class="search-item" ht-query="${field.fieldName}" field-query="${field.name}" v-model="searchForm.${field.fieldName}" operation="${field.operate}" placeholder="${field.fieldDesc}" ></el-input>
		<#break>
	</#switch>
	</el-form-item>
</#macro>

<#--过滤条件
<#noparse><#if filterFields?if_exists>
<div class="panel" ajax="ajax"  displayId="${bpmDataTemplate.id}" filterKey="${filterKey}" >
<#if filterFields?size gt 1>
<div class='panel-nav'>
	<div class="l-tab-links">
		<ul style="left: 0px; ">
			<#list filterFields as field>
			<li tabid="${field.key}" <#if field.key ==filterKey> class="l-selected"</#if>>
				<a href="${field.url}" title="${field.fieldName}">${field.desc}</a>
			</li>
			</#list>
		</ul>
	</div>
</div>
</#if>
</#noparse> -->
	<#-- 主体内容 start  -->
	<el-container>
	    <el-main>
			<div class="search-and-btn__wrap">
				<div class="top_btn_col">
					<#list buttons as btn>
						<#if !(btn.hidden?exists)|| btn.hidden==0>
							<#if btn.inRow=='0'|| btn.inRow==false>
								<#if btn.triggerType=="href">
									<el-button type="primary" size="mini" onclick="window.open('${btn.urlPath}')" icon="${btn.icon}">${btn.name}</el-button>
								<#else>
									<el-button type="success" size="mini" @click="${btn.urlPath}" icon="${btn.icon}">${btn.name}</el-button>
								</#if>
							</#if>
						</#if>
					</#list>
					<el-button type="primary" size="mini" @click="printList" icon="el-icon-printer">打印</el-button>
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
												width="65">
										</el-table-column>
										<el-table-column
												prop="fieldName"
												label="字段名称"
												width="130">
										</el-table-column>
										<el-table-column
												prop="fieldDesc"
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
				</div>
	      <#--查询条件-->
	      <#if conditions?if_exists>
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
					  <#list conditions as field>
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
								  <#list conditions as field>
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
			<span id="printData">
				<#if summarySetting?if_exists>
					<@genSummaryField/>
				</#if>
	      		<el-table
	      	ref="queryViewList"
	        :data="rows"
	        stripe
	        border
	        <#if showSummary==true>
	        	:summary-method="getSummaries"
	        	show-summary
	        </#if>
	        style="width: 100%"
	        header-cell-class-name="todo-header-row"
	        row-class-name="todo-row"
	        size="small"
	        @selection-change="handleSelectionChange"
	      >
	        <el-table-column type="selection" width="55"></el-table-column>
	        <#if queryView.showRowsNum!=0>
	        	<el-table-column fixed="left" type="index" width="50" label="序号"></el-table-column>
	        </#if>
	        <#list displayFields as field>
	        	<#if field.hidden==0>
					<el-table-column prop="${field.fieldName}" label="${field.fieldDesc}" <#if field.sortable!=0>sortable</#if> <#if field.width!=0>width="${field.width}px"</#if> align="${field.align}"
						<#if field.frozen!=0>fixed="left"</#if> <#if field.formater?exists>:formatter="columnFormatter"</#if>
							<#if (!field.formater?exists) && field.dataType == 'date'>
								:formatter="dateFormatter"
							</#if>
					>
						<#if field.alarmSetting?exists || field.url?exists>
							<template slot-scope="scope">
						      <span
							  <#if field.alarmSetting?exists> :style="getAlarmColor('${field.fieldName}',scope.row.${field.fieldName})" </#if>
									  <#if field.url?exists> ${field.url}</#if>
							  	 >
							  	 <#if field.formater?exists>{{ columnFormatter(scope.row,scope.column,scope.row.${field.fieldName}) }}<#else>{{ scope.row.${field.fieldName}}}</#if></span>
	
							</template>
						</#if>
					</el-table-column>
				</#if>
			</#list>
			<#if isShowManageColumn(rowButtons)=='true' >
				<el-table-column
			      	fixed="right"
			      	label="操作"
			      	min-width="100px"
			        align="left">
			      	<template slot-scope="scope">
						<#if (rowButtons?size > 0) >
							<#list buttons as btn>
		                    	<#if !(btn.hidden?exists)|| btn.hidden==0>
		                    		<#if btn.inRow==1|| btn.inRow==true>
				                    	<#if btn.triggerType=="href">
								            <el-button type="text" size="small" onclick="window.open('${btn.urlPath}')" icon="${btn.icon}">${btn.name}</el-button>
								        <#else>
								            <el-button type="text" size="small" @click="${btn.urlPath}" icon="${btn.icon}">${btn.name}</el-button>
								        </#if>
							        </#if>
						        </#if>
		                    </#list>
						</#if>
			      	</template>
			    </el-table-column>													
	    	</#if>
	      </el-table>
			</span>
	    </el-main>
	    <#if queryView.needPage!=0>
		    <el-footer height="45px">
		      <el-row type="flex" justify="end">
		        <el-pagination
		      	@size-change="handleSizeChange"
		        @current-change="handleCurrentChange"
		        :current-page="pagination.page"
		      	:page-sizes="[10, 20, 30, 50, 100]"
		      	:page-size="pagination.pageSize"
		      	layout="total, sizes, prev, pager, next, jumper"
		      	:total="total">
		    	</el-pagination>
		      </el-row>
		    </el-footer>
		 </#if>
	  </el-container>
	
	
	
	
	<#-- 主体内容 end  -->	
<#-- 
<#noparse>
<#else>
   <div style="padding:6px 0px 12px 0px;">当前用户没有满足的过滤条件,请设置过滤条件。<div>
</#if>
</#noparse> 
-->