
<#function getNgModel field type>
 	<#assign rtn><#if type!=1>item.${field.name}<#else>data.${field.fieldPath}</#if></#assign>
	<#return rtn>
</#function>
<#function getPermissionLine field type hasLinkage>
 	<#assign rtn>
 		<#if type!=1 && hasLinkage==true>v-permission-line="'${field.parentNodeType}_${field.tableName}_${field.name}'"<#else></#if></#assign>
	<#return rtn>
</#function>
<#function getAtter field type>
 	<#assign rtn><#if type!=1>item.${field.name}<#else>data.${field.tableName}.${field.name}</#if></#assign>
	<#return rtn>
</#function>
<#function getPermission field type>
	<#assign rtn>permission.fields.${field.tableName}.${field.name}</#assign>
	<#if rtn?matches("^permission\\.fields\\.\\w+\\.\\w+$")>
		<#return rtn>
	<#else>
		<#stop "Incorrect field format: ${field.desc}">
	</#if>
</#function>
<#function getFormula field type>
	<#assign rtn>
		<#if type==2>
			'data.${field.boDefAlias}.${field.parentNodeType}_${field.tableName}['+index+'].${field.name}'
		<#elseif type==1>
			'${getNgModel(field,type)}'
		<#elseif type == true>
			'data.${field.boDefAlias}.${field.parentNodeType}_${field.tableName}['+index+'].${field.name}'
		<#else>
			'data.${subName}['+sunIndex+'].${field.name}'
		</#if>
	</#assign>
	<#return rtn>
</#function>
<#function getInput field type hasLinkage >
	<#assign rtn>
        <eip-input v-model="${getNgModel(field,type)}"  model-name="${getNgModel(field,type)}"
                  model-expression="${getNgModel(field,type)}"
                  placeholder="${field.options.placeholder}"
                  :permission="${getPermission(field,type)}"
                  ${getPermissionLine(field,type,hasLinkage)}
                 <#if field.options.isReadonly ?if_exists>:readonly="true"</#if>
                  bindPreAndSufFixjson ='${util.getMapString(field.options,"bindPreAndSufFixjson")}'
                  atter="${getAtter(field,type)}" style="width: ${field.options.width?default('100%')}"
                <#if field.options.validate?if_exists && field.options.validate?length gt 0 && !field.options.isInputEdit> :validate="${field.options.validate}"</#if>
				  :configAttributes="${util.getInputAdvancedAttributes(field.options)}"
                  <#if field.options.mathExp?if_exists>math-exp="${field.options.mathExp}"</#if>
				<#if field.options.isCountDate> :date-calc-exp="{start:'${field.options.isStartDate}',end:'${field.options.isEndDate}',diffType:'${field.options.countFormat}'}"</#if>
				<#if field.options.formulasDiyJs?if_exists > v-formula="{value:${field.options.formulasDiyJs},bindPath:${getFormula(field,type)}}"</#if>
        		<#if field.options.mapping?if_exists>v-mapping="data.${field.options.mapping}"</#if>
        		<#if field.options.showCondition.fieldPath?if_exists>v-if="${field.options.showCondition.fieldPath}=='${field.options.showCondition.value}'"</#if>
        >
        	<span slot="labeldesc">${field.desc}</span>
        </eip-input>
	</#assign>
	<#return rtn>
</#function>
<#function getNumberInput field type hasLinkage>
	<#assign rtn>
        <eip-input v-model="${getNgModel(field,type)}"  model-name="${getNgModel(field,type)}"
        		  model-expression="${getNgModel(field,type)}"
				  type="number"
                  placeholder="${field.options.placeholder}"
                  company="${field.options.company}"
                  :permission="${getPermission(field,type)}"
                  bindPreAndSufFixjson ='${util.getMapString(field.options,"bindPreAndSufFixjson")}'
                  atter="${getAtter(field,type)}"  style="width: ${field.options.width?default('100%')}"
                  ${getPermissionLine(field,type,hasLinkage)}
				 <#if field.options.mathExp?if_exists>math-exp="${field.options.mathExp}"</#if>
                <#if field.options.validate?if_exists && field.options.validate?length gt 0 && !field.options.isInputEdit> :validate="${field.options.validate}"</#if>
				<#if field.options.min?if_exists>:min=${field.options.min?c}</#if>
				<#if field.options.max?if_exists>:max=${field.options.max?c}</#if>
				<#if field.options.step?if_exists>:step=${field.options.step?c}</#if>
				<#if field.options.decimalDigits?if_exists>:precision=${field.options.decimalDigits?c}</#if>
                <#if field.options.filterthousandBit?if_exists>filterthousandBit="true"</#if> <#--千分位-->
                <#if field.options.filtercurrency?if_exists>filtercurrency="true"</#if> <#--货币大写-->
                <#if field.options.formulasDiyJs?if_exists > v-formula="{value:${field.options.formulasDiyJs},bindPath:${getFormula(field, type)}}"</#if>
        		<#if field.options.mapping?if_exists>v-mapping="data.${field.options.mapping}"</#if>
        		<#if field.options.isCountDate> :date-calc-exp="{start:'${field.options.isStartDate}',end:'${field.options.isEndDate}',diffType:'${field.options.countFormat}'}"</#if>
        >
        	<span slot="labeldesc">${field.desc}</span>
        </eip-input>
	</#assign>
	<#return rtn>
</#function>
<#function getRadio field type hasLinkage>
	<#assign rtn>
        <eip-radio v-model="${getNgModel(field,type)}"  model-name="${getNgModel(field,type)}"
                   <#if field.options.inline >optionLayout="vertical"<#else>optionLayout="horizontal"</#if>
                   <#if field.options.validate?if_exists && field.options.validate?length gt 0> :validate="${field.options.validate}"</#if>
                   ${util.getLinkage(field.options)}
                   :ganged="${util.getSelectQuery(field.options,type!=1)}"
                   :permission="${getPermission(field,type)}"
                   rdlist='${util.getJsonByPath(field.options,'options')}'
				   style="width: ${field.options.width?default('100%')}"
                   :style='${util.getMapString(field,"controlstyle")}'
                   ${getPermissionLine(field,type,hasLinkage)}
                    <#if field.options.formulasDiyJs?if_exists > v-formula="{value:${field.options.formulasDiyJs},bindPath:${getFormula(field, type)}}"</#if>
        >
            <span slot="labeldesc">${field.desc}</span>
        </eip-radio>
	</#assign>
	<#return rtn>
</#function>
<#function getCheckbox field type hasLinkage>
    <#assign rtn>
        <eip-checkbox v-model="${getNgModel(field,type)}"  model-name="${getNgModel(field,type)}"
                      <#if field.options.inline >optionLayout="vertical"<#else>optionLayout="horizontal"</#if>
                      :ganged="${util.getSelectQuery(field.options,type!=1)}"
                      :permission="${getPermission(field,type)}"
                      <#if field.options.validate?if_exists && field.options.validate?length gt 0> :validate="${field.options.validate}"</#if>
                      ${util.getLinkage(field.options)}
                      cklist='${util.getJsonByPath(field.options,'options')}'
					  style="width: ${field.options.width?default('100%')}"
                      :style='${util.getMapString(field,"controlstyle")}'
                      ${getPermissionLine(field,type,hasLinkage)}
						<#if field.options.formulasDiyJs?if_exists > v-formula="{value:${field.options.formulasDiyJs},bindPath:${getFormula(field, type)}}"</#if>
        >
            <span slot="labeldesc">${field.desc}</span>
        </eip-checkbox>
    </#assign>
    <#return rtn>
</#function>
<#function getSelect field type hasLinkage>
    <#assign customQuery  = util.getStringConf(field.options.customQuery)>
    <#assign rtn>
        <eip-select v-model="${getNgModel(field,type)}"  model-name="${getNgModel(field,type)}"
                    placeholder="${field.options.placeholder}"
                    :ganged="${util.getSelectQuery(field.options,type!=1)}"
				    <#if field.options.validate?if_exists && field.options.validate?length gt 0> :validate="${field.options.validate}"</#if>
					${util.getLinkage(field.options)}
                    ${util.getAttrs(':multiple,:filterable,:allowCreate,:related-query',field)}
                    :permission="${getPermission(field,type)}"
                    :selectlist='${util.getJsonByPath(field.options,'options')}'
					style="width: ${field.options.width?default('100%')}"
					${getPermissionLine(field,type,hasLinkage)}
                    <#if field.options.formulasDiyJs?if_exists > v-formula="{value:${field.options.formulasDiyJs},bindPath:${getFormula(field, type)}}"</#if>
		>
            <span slot="labeldesc">${field.desc}</span>
        </eip-select>
    </#assign>
    <#return rtn>
</#function>
<#function getDialog field type hasLinkage>
    <#assign name  = util.getJsonByPath(field.customDialogjson,'name')>
    <#assign icon  = util.getJsonByPath(field.customDialogjson,'icon')>
    <#assign custdialogConf  = util.getStringConf(field.options.customDialogjson)>
    <#assign rtn>
		<eip-dialog v-model="${getNgModel(field,type)}"  model-name="${getNgModel(field,type)}"
                    :custdialog='${custdialogConf}'
                    placeholder="${field.options.placeholder}"
                    :permission="${getPermission(field,type)}"
					style="width: ${field.options.width?default('100%')}"
                    atter="${getAtter(field,type)}"
                    ${util.getAttrs('tooltipplacement',field)}
                    ${getPermissionLine(field,type,hasLinkage)}
					<#if field.options.validate?if_exists && field.options.validate?length gt 0> :validate="${field.options.validate}"</#if>
                    :style='${util.getMapString(field,"controlstyle")}' >
            <span slot="labeldesc">${field.desc}</span>
        </eip-dialog>
    </#assign>
    <#return rtn>
</#function>
<#function getEipButton field type hasLinkage>
	<#assign name  = util.getJsonByPath(field.options.bindEventjson,'name')>
	<#assign icon  = util.getJsonByPath(field.options.bindEventjson,'icon')>
	<#assign btnType  = util.getJsonByPath(field.options.bindEventjson,'btnType')>
	<#assign isShowInput  = util.getJsonByPath(field.options.bindEventjson,'isShowInput')>
	<#assign alias  = util.getJsonByPath(field.options.bindEventjson,'alias')>
	<#assign rtn>
			<eip-button
					:isShowInput="${isShowInput?default(true)}"
					<#if field.tableName?if_exists && field.name?if_exists && !field.options.bindEventjson.isShowInput>
					:permission="${getPermission(field,type)}"
					</#if>
					<#if field.options.bindEventjson.isShowInput>
					:permission="${getPermission(field,type)}"
					v-model="${getNgModel(field,type)}"  model-name="${getNgModel(field,type)}"
					atter="${getAtter(field,type)}"
					</#if>
					<#if field.options.formulasDiyJs?if_exists > v-formula="{value:${field.options.formulasDiyJs},bindPath:${getFormula(field, type)}}"</#if>
					<#if field.options.showCondition.fieldPath?if_exists>v-if="${field.options.showCondition.fieldPath}=='${field.options.showCondition.value}'"</#if>
					icon="${icon}"
					btnName="${name}"
                    btnType="${btnType}"
					${getPermissionLine(field,type,hasLinkage)}
					htCustomScript="${field.options.script}" >
			</eip-button>
	</#assign>
	<#return rtn>
</#function>
<#function getEipDivider field type>
	<#assign rtn>
			<eip-divider
					<#if field.options.position?if_exists>content-position="${field.options.position}"</#if>
					 <#if field.options.color?if_exists>color="${field.options.color}"</#if>
					 >
					 <template>
					  <i <#if field.options.customDialogjson.icon?if_exists>class="${field.options.customDialogjson.icon}"</#if>><#if field.options.content?if_exists>${field.options.content}</#if></i>
					</template>
			</eip-divider>
	</#assign>
	<#return rtn>
</#function>
<#function getTextarea field type hasLinkage >
	<#assign rtn>
        <eip-textarea v-model="${getNgModel(field,type)}"  model-name="${getNgModel(field,type)}"
                  placeholder="${field.options.placeholder}"
                  :permission="${getPermission(field,type)}"
                  atter="${getAtter(field,type)}"
                  textAlign="${field.options.textAlign}"
				  isEditor="${field.options.isEditor}"
				  isInputEdit="${field.options.isInputEdit}"
				  initialFrameWidth="${field.options.initialFrameWidth}"
				  initialFrameHeight="${field.options.initialFrameHeight}"
			      style="width: ${field.options.width?default('100%')}"
                  type="${field.ctrlType}"
                  ${getPermissionLine(field,type,hasLinkage)}
                <#if field.options.noToolbar?if_exists>noToolbar="${field.options.noToolbar}" </#if>
				<#if field.options.textValue?if_exists>textValue="${util.toJsonStr(field.options.textValue)}" </#if>
                <#if field.options.validate?if_exists && field.options.validate?length gt 0> :validate="${field.options.validate}"</#if>
                <#if field.options.formulasDiyJs?if_exists > v-formula="{value:${field.options.formulasDiyJs},bindPath:${getFormula(field, type)}}"</#if>
        		<#if field.options.mapping?if_exists>v-mapping="data.${field.options.mapping}"</#if>
        >
        	<span slot="labeldesc">${field.desc}</span>
        </eip-textarea>
	</#assign>
	<#return rtn>
</#function>
<#function getFont field type >
	<#assign rtn>
		<#if field.options.textValue?if_exists>
            <eip-font-ueditor 
            <#if field.tableName?if_exists && field.name?if_exists>
			:permission="${getPermission(field,type)}"
			</#if>
            textValue="${util.toJsonStr(field.options.textValue)}"></eip-font-ueditor>
		</#if>
	</#assign>
	<#return rtn>
</#function>
<#function getQRcode field type >
	<#assign rtn>
		<eip-qrcode>
		</eip-qrcode>
	</#assign>
	<#return rtn>
</#function>
<#function getAttachment field type hasLinkage >
	<#assign rtn>
		<#assign allowPreview = util.getJsonByPath(field.options.file,'allowPreview','false')>
		<#assign allowDownload = util.getJsonByPath(field.options.file,'allowDownload','false')>
        <eip-attachment v-model="${getNgModel(field,type)}"  model-name="${getNgModel(field,type)}"
                  :permission="${getPermission(field,type)}"
                   <#if field.options.validate?if_exists && field.options.validate?length gt 0> :validate="${field.options.validate}"</#if>
				  ${util.getAttrs('propConf,accept',field)}
                  limit="${field.options.file.limit}"
                  :allow-preview="${allowPreview}"
                  :allow-download="${allowDownload}"
                  :size="${util.getToString(field.options.file.size)}"
                  ${getPermissionLine(field,type,hasLinkage)}
				  :multiple="${util.getJsonByPath(field.options.file,'multiple','false')}"
                  :simplicity="${util.getJsonByPath(field.options.file,'simplicity','false')}"
        >
        	<span slot="labeldesc">${field.desc}</span>
        </eip-attachment>
	</#assign>
	<#return rtn>
</#function>
<#function getDic field type hasLinkage >
	<#assign rtn>
        <eip-dic v-model="${getNgModel(field,type)}"  model-name="${getNgModel(field,type)}"
                  :permission="${getPermission(field,type)}"
				 style="width: ${field.options.width?default('100%')}"
				<#if field.options.validate?if_exists && field.options.validate?length gt 0> :validate="${field.options.validate}"</#if>
				  dickey="${field.options.dic}"
				  ${util.getAttrs(':filterable',field)}
				  ${getPermissionLine(field,type,hasLinkage)}
				   placeholder="${field.options.placeholder}">
			<span slot="labeldesc">${field.desc}</span>
        </eip-dic>
	</#assign>
	<#return rtn>
</#function>
<#function getTag field type hasLinkage>
	<#assign rtn>
		<eip-tag
			v-model="${getNgModel(field,type)}"
			:permission="${getPermission(field,type)}"
			style="width:${field.options.width?default('100%')}"
			<#if field.options.validate?if_exists && field.options.validate?length gt 0>:validate="${field.options.validate}"</#if>
			tag-key="${field.options.tag}"
			placeholder="${field.options.placeholder}"
			${getPermissionLine(field,type,hasLinkage)}
			${util.getAttrs(':filterable',field)}
			${util.getAttrs(':expand',field)}
			${util.getAttrs(':multiple',field)}>
			<span slot="labeldesc">${field.desc}</span>
		</eip-tag>
	</#assign>
	<#return rtn>
</#function>
<#function getDropdown field type hasLinkage >
    <#assign customQuery  = util.getStringConf(field.options.customQuery)>
	<#assign rtn>
		<eip-treeselect style="width: ${field.options.width?default('100%')}"
                        :ganged="${util.getSelectQuery(field.options,type!=1)}"
                        v-model="${getNgModel(field,type)}"
                        model-name="${getNgModel(field,type)}"
                        ${util.getAttrs(':multiple,:filterable,:allowCreate',field)}
                        :permission="${getPermission(field,type)}"
                        ${getPermissionLine(field,type,hasLinkage)}
		 <#if field.options.validate?if_exists && field.options.validate?length gt 0> :validate="${field.options.validate}"</#if>
		<#if field.options.formulasDiyJs?if_exists > v-formula="{value:${field.options.formulasDiyJs},bindPath:${getFormula(field, type)}}"</#if>>
		<span slot="labeldesc">${field.desc}</span>
	</eip-treeselect>
	</#assign>
	<#return rtn>
</#function>
<#function getAutocomplete field type hasLinkage >
	<#assign rtn>
		<eip-autocomplete
				v-model="${getNgModel(field,type)}"  model-name="${getNgModel(field,type)}"
				:permission="${getPermission(field,type)}"
				autoTiplist='${util.getJsonByPath(field.options,'options')}'
				:ganged="${util.getSelectQuery(field.options,type!=1)}"
				:style='${util.getMapString(field,"controlstyle")}'
				placeholder="${field.options.placeholder}"
				${getPermissionLine(field,type,hasLinkage)}
				<#if field.options.validate?if_exists && field.options.validate?length gt 0> :validate="${field.options.validate}"</#if>
				<#if field.options.mapping?if_exists>v-mapping="data.${field.options.mapping}"</#if>
		>
			<span slot="labeldesc">${field.desc}</span>
		</eip-autocomplete>
	</#assign>
	<#return rtn>
</#function>
<#function getEipCascader field type hasLinkage >
	<#assign rtn>
		<eip-cascader
				v-model="${getNgModel(field,type)}"  model-name="${getNgModel(field,type)}"
				<#if field.options.validate?if_exists && field.options.validate?length gt 0> :validate="${field.options.validate}"</#if>
				:permission="${getPermission(field,type)}"
				atter="${getAtter(field,type)}"
				:ganged="${util.getSelectQuery(field.options,type!=1)}"
				placeholder="${field.options.placeholder}"
				${getPermissionLine(field,type,hasLinkage)}
		>
			<span slot="labeldesc">${field.desc}</span>
		</eip-cascader>
	</#assign>
	<#return rtn>
</#function>
<#function getEipDate field type hasLinkage >
    <#assign day  = util.getJsonByPath(field.options,'day','0')>
    <#assign showDate  = util.getJsonByPath(field.options,'showCurrentDate','false')>
	<#assign rtn>
		<eip-date
                width="${field.options.width?default('100%')}"
				v-model="${getNgModel(field,type)}"  model-name="${getNgModel(field,type)}"
				atter="${getAtter(field,type)}"
                isServerDate="${field.options.isServerDate}"
				:permission="${getPermission(field,type)}"
				${getPermissionLine(field,type,hasLinkage)}
				model-expression="${getNgModel(field,type)}"
                selectType="${field.options.type}"
                <#if field.options.validate?if_exists && field.options.validate?length gt 0> :validate="${field.options.validate}"</#if>
                <#if showDate?length gt 1>:showDate="${showDate}"</#if>
				:day="${day?default('0')}"
				<#if field.options.format?if_exists && field.options.format?length gt 0>format="${field.options.format}"</#if>
				inputFormat="${field.options.inputFormat}"
				<#if field.options.mapping?if_exists>v-mapping="data.${field.options.mapping}"</#if>
				<#if field.options.formulasDiyJs?if_exists > v-formula="{value:${field.options.formulasDiyJs},bindPath:${getFormula(field, type)}}"</#if>
				bindPreAndSufFixjson ='${util.getMapString(field.options,"bindPreAndSufFixjson")}'
		>
			<span slot="labeldesc">${field.desc}</span>
		</eip-date>
	</#assign>
	<#return rtn>
</#function>
<#function getEipRelFlow field type hasLinkage >
	<#assign rtn>
		<eip-rel-flow
				modelName="${getNgModel(field,type)}"
				v-model="${getNgModel(field,type)}"
				model-name="${getNgModel(field,type)}"
				:permission="${getPermission(field,type)}"
				${getPermissionLine(field,type,hasLinkage)}
				:searchConfig="{isPaging:${field.options.isPaging},pageSize:${field.options.pageSize}}" >
			<span slot="labeldesc">${field.desc}</span>
		</eip-rel-flow>
	</#assign>
	<#return rtn>
</#function>
<#function getEipImg field type >
    <#assign rtn>
        <eip-img
                isDisplay="${field.options.isDisplay?default(false)}"
                imgSrc="${field.options.imgSrc}"
                fileJson='${field.options.fileJson}'
                :imgHeight='${field.options.size.height?default(0)}'
                :imgWidth='${field.options.size.width?default(0)}'
                 />
    </#assign>
    <#return rtn>
</#function>
<#function getPhotograph field type >
    <#assign rtn>
        <eip-photograph
            <#if field.bindModelType && field.bindModelType == 'model'>
            modelName="${getNgModel(field,type)}"
			v-model="${getNgModel(field,type)}"
			model-name="${getNgModel(field,type)}"
            :model="${getNgModel(field,type)}"
            <#else>
            modelName="${field.modelName}"
			v-model="${field.modelName}"
			model-name="${field.modelName}"
            :model="${field.modelName}"
            </#if>
			
			:limit="${field.options.limit}" >
        </eip-photograph>
    </#assign>
    <#return rtn>
</#function>

<#function getShowText field type >
    <#assign rtn>
        <eip-show-text
            <#if field.bindModelType && field.bindModelType == 'model'>
            :value="${getNgModel(field,type)}"
            <#else>
            :value="${field.modelName}"
            </#if>
		>
        </eip-show-text>
    </#assign>
    <#return rtn>
</#function>

<#function getShowLc field type >
    <#assign rtn>
        <eip-show-lc
            <#if field.options.lcId>
            :lcId="${field.options.lcId}"
            </#if>
            :lcType="${field.options.lcId}"
		>
        </eip-show-lc>
    </#assign>
    <#return rtn>
</#function>

<#function getEipViewer field type hasLinkage>
	<#assign rtn>
		<#assign allowPreview = util.getJsonByPath(field.options.file,'allowPreview','true')>
		<#assign allowDownload = util.getJsonByPath(field.options.file,'allowDownload','false')>
		<eip-viewer
                <#if field.options.validate?if_exists && field.options.validate?length gt 0> :validate="${field.options.validate}"</#if>
				v-model="${getNgModel(field,type)}"
				model-expression="${getNgModel(field,type)}"
				:permission="${getPermission(field,type)}"
				:imgHeight='${field.options.size.height?default(0)}'
				:imgWidth='${field.options.size.width?default(0)}'
				uploadType="${field.options.uploadType}"
				limit="${field.options.file.limit}"
				:multiple="${util.getJsonByPath(field.options.file,'multiple','false')}"
				:allow-preview="${allowPreview}"
                :allow-download="${allowDownload}"
                ${getPermissionLine(field,type,hasLinkage)}
        >
            <span slot="labeldesc">${field.desc}</span>
        </eip-viewer>
	</#assign>
	<#return rtn>
</#function>
<#function getSwitch field type hasLinkage>
    <#assign rtn>
        <eip-switch
        	v-model="${getNgModel(field,type)}"  model-name="${getNgModel(field,type)}"
            :permission="${getPermission(field,type)}"
            ${getPermissionLine(field,type,hasLinkage)}
             <#if field.options.validate?if_exists && field.options.validate?length gt 0> :validate="${field.options.validate}"</#if>
             style="display: block"
          active-value="${field.options.activeValue}"
          inactive-value="${field.options.inactiveValue}"
          active-text="${field.options.activeText}"
          inactive-text="${field.options.inactiveText}"
			<#if field.options.formulasDiyJs?if_exists > v-formula="{value:${field.options.formulasDiyJs},bindPath:${getFormula(field, type)}}"</#if>
             />
    </#assign>
    <#return rtn>
</#function>
<#function getOuSwitch field type>
    <#assign rtn>
        <ou-switch
          <#if field.bindModelType && field.bindModelType == 'model'>
            v-model="${getNgModel(field,type)}"  model-name="${getNgModel(field,type)}"
            :switchValue="${getNgModel(field,type)}"
            <#else>
            v-model="${field.modelName}"  model-name="${field.modelName}"
            :switchValue="${field.modelName}"
            </#if>
          active-value="${field.options.activeValue}"
          inactive-value="${field.options.inactiveValue}"
          active-text="${field.options.activeText}"
          inactive-text="${field.options.inactiveText}"
        />
    </#assign>
    <#return rtn>
</#function>
<#function getEipMap field type >
    <#assign rtn>
        <eip-map :heightMap="${field.options.heightMap}" addressMap="data.${field.options.addressMap}"></eip-map>
    </#assign>
    <#return rtn>
</#function>
<#function getOffice field type hasLinkage>
	<#assign rtn>
		<eip-office
				v-model="${getNgModel(field,type)}"
				${util.getAttrs(':isRevision',field)}
				${getPermissionLine(field,type,hasLinkage)}
				:permission="${getPermission(field,type)}"></eip-office>
	</#assign>
	<#return rtn>
</#function>
<#function getSignature field type hasLinkage>
	<#assign rtn>
		<eip-signature
				v-model="${getNgModel(field,type)}"
				${getPermissionLine(field,type,hasLinkage)}
				${util.getAttrs(':maxPeople',field)}
				:permission="${getPermission(field,type)}"
				:fieldPath="'${field.fieldPath}'"></eip-signature>
	</#assign>
	<#return rtn>
</#function>
<#-- 子表关联查询回填 -->
<#function getSubtableCustomQueryBackfill layout >
    <#assign queryConfig  = util.getStringConf(layout.customQuery)>
    <#assign rtn>
    	 <eip-subtable-backfill
    	  :customQuery='${queryConfig}'
        />
    </#assign>
    <#return rtn>
</#function>

<#-- 注意不能加空格  -->
<#macro input field type hasLinkage>
<#switch field.ctrlType>
	<#case 'input' ><#--单行文本框-->${getInput(field,type,hasLinkage)}
<#break>
	<#case 'textarea'><#--多行文本框-->${getTextarea(field,type,hasLinkage)}
<#break>
    <#case 'property-text'><#--属性文本-->${getTextarea(field,type,hasLinkage)}
<#break>
	<#case 'text'>${getFont(field,type)}
<#break>
	<#case 'QRcode'>${getQRcode(field,type)}
<#break>
	<#case 'number'><#--数字框-->${getNumberInput(field,type,hasLinkage)}
<#break>
    <#case 'currency'><#--数字框-->${getNumberInput(field,type,hasLinkage)}
<#break>
	<#case 'radio'><#--单选框-->${getRadio(field,type,hasLinkage)}
<#break>
	<#case 'checkbox'><#--多选框-->${getCheckbox(field,type,hasLinkage)}
<#break>
	<#case 'select'><#--下拉框-->${getSelect(field,type,hasLinkage)}
<#break>
	<#case 'dialog'><#--对话框-->${getDialog(field,type,hasLinkage)}
<#break>
	<#case 'selector'><#--选择器(包括组织，岗位，角色，用户选择器等控件组合)-->
		<${util.getHtSelectorType(field.options,type!=1)} ${util.getAttrs(':validate',field)}
			v-model="${getNgModel(field,type)}"  model-name="${getNgModel(field,type)}"
			:permission="${getPermission(field,type!=1)}"
			:config="${util.getHtSelectorBind(field.options,type!=1)}"
			<#if field.options.selector.selectCurrent> :selectCurrent="true"</#if>
			style="width: ${field.options.width?default('100%')}"
			<#if field.options.selector.isSingle> :single="true"</#if>
			<#if field.options.validate?if_exists> :validate="${field.options.validate}" </#if>
			<#if field.options.placeholder?if_exists> placeholder="${field.options.placeholder}" </#if>
			 ${getPermissionLine(field,type,hasLinkage)}
			>
		<span slot="labeldesc">${field.desc}</span>
	</${util.getHtSelectorType(field.options,type!=1)}>
<#break>
<#case 'immediate-single'><#-- 表单实时控件  单行 -->
	<eip-realtime-input ${util.getAttrs('inputType,placeholder,tooltipplacement',field)} <#if field.tableName?if_exists && field.name?if_exists> :permission="${getPermission(field,type)}" </#if> style="font-weight:${util.getStyleBold(field,'boldValue')};${util.getStyles(field,'color','valueColor')}" :style='${util.getMapString(field,"controlstyle")}' :option='${util.getMapString(field,"options")}'>
	  <span slot="labeldesc">${field.desc}</span>
	</eip-realtime-input>
<#break>
<#case 'immediate-textarea'><#-- 表单实时控件  多行  -->
	<eip-realtime-textarea ${util.getAttrs('inputType,placeholder,tooltipplacement',field)} <#if field.tableName?if_exists && field.name?if_exists> :permission="${getPermission(field,type)}" </#if> style="font-weight:${util.getStyleBold(field,'boldValue')};${util.getStyles(field,'color','valueColor')}" :style='${util.getMapString(field,"controlstyle")}' :option='${util.getMapString(field,"options")}'>
	  <span slot="labeldesc">${field.desc}</span>
	</eip-realtime-textarea>
<#break>
<#case 'milepost'><#-- 里程碑 -->
		<eip-step direction='${field.options.direction}' :permission="${getPermission(field,type)}" ${getPermissionLine(field,type,hasLinkage)} v-model="${getNgModel(field,type)}"  model-name="${getNgModel(field,type)}"  content='${util.objectToJsonString(field.options.steps)}'></eip-step>
<#break>
        <#case 'attachment'><#--附件上传-->${getAttachment(field,type,hasLinkage)}
<#break>
        <#case 'dic'><#--数据字典-->${getDic(field,type,hasLinkage)}
	<#break>
		<#case 'tag'>${getTag(field,type,hasLinkage)}
<#break>
        <#case 'dropdown'><#--下拉树-->${getDropdown(field,type,hasLinkage)}
<#break>
<#break>
	<#case 'autocomplete'><#--自动完成-->${getAutocomplete(field,type,hasLinkage)}
<#break>
<#break>
	<#case 'eip-cascader'><#--级联-->${getEipCascader(field,type,hasLinkage)}
<#break>
	<#case 'button'>${getEipButton(field,type,hasLinkage)}
<#break>
	<#case 'divider'>${getEipDivider(field,type)} <#--分割线-->
<#break>
	<#case 'date'>${getEipDate(field,type,hasLinkage)} <#--日期-->
<#break>
	<#case 'time'>${getEipDate(field,type,hasLinkage)} <#--时间-->
<#break>
	<#case 'related-process'>${getEipRelFlow(field,type,hasLinkage)} <#--相关流程控件-->
<#break>
    <#case 'image'>${getEipImg(field,type)} <#--图片控件-->
<#break>
	<#case 'imageViewer'>${getEipViewer(field,type,hasLinkage)} <#--图片控件-->
<#break>
    <#case 'switch'>${getSwitch(field,type,hasLinkage)} <#-- 开关控件 -->
<#break>
<#break>
    <#case 'ou-switch'>${getOuSwitch(field,type)} <#-- 开关控件 -->
<#break>
    <#case 'amap'>${getEipMap(field,type)} <#-- 地图控件 -->
<#break>
	<#case 'signature'>${getSignature(field,type,hasLinkage)} <#-- 签章控件 -->
<#break>
	<#case 'office'>${getOffice(field,type,hasLinkage)} <#-- office控件 -->
<#break>
<#break>
	<#case 'photograph'>${getPhotograph(field,type)} <#-- 拍照控件 -->
<#break>
<#break>
	<#case 'show-text'>${getShowText(field,type)} <#-- 显示文本控件 -->
<#break>
<#break>
	<#case 'show-lc'>${getShowLc(field,type)} <#-- 显示信用证控件 -->
<#break>

</#switch>
</#macro>
