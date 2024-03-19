<#macro hotTable layout>
<#assign subTablePath=layout.options.subTablePath>
<#assign sunTablePath=util.getSunTablePath(layout.options.subTablePath,"index")>
<el-container v-if="!permission.table.${layout.options.boSubEntity}.hidden">
  <el-header style="height:30px;line-height:30px;background: #fafafa; font-weight: bold;font-size: 14px;">
  	<#if layout.showTitle!=false>
  		${layout.desc}
  	 </#if>
  	 <div v-if="permission.table.${layout.options.boSubEntity}.del" class="inputs" :style="{display:'inline-block',float:'right'}">
	    <el-button type="text" icon="el-icon-delete" size="mini" :style="{padding:'0px 5px'}" @click="clearAll('${subTablePath}',true)">
	      	清空
    	</el-button>
    </div>
    <div v-if="permission.table.${layout.options.boSubEntity}.add" class="inputs" :style="{display:'inline-block',float:'right'}">
	    <el-button type="text" icon="el-icon-plus" size="mini" :style="{padding:'0px 5px'}" @click="addInitTemplateData('${subTablePath}')">
	      	${layout.addInitBtnName}
    	</el-button>
    </div>
    <#assign isMathExp = util.getHasMathExp(layout.options)>
    <#assign isCrossMapping = util.getHasCrossMapping(layout.options)>
    <#assign mergeCellSize = util.getMergeCellSize(layout.options)>
    <#if isMathExp gt 0>
	  	 <div class="inputs" :style="{display:'inline-block',float:'right'}">
		    <el-button type="text" icon="el-icon-refresh" size="mini" :style="{padding:'0px 5px'}" @click="execCellMathExp('${subTablePath}')">
		      	运行计算公式
	    	</el-button>
	    </div>
    </#if>
    <#if isCrossMapping gt 0>
	  	 <div class="inputs" :style="{display:'inline-block',float:'right'}">
		    <el-button type="text" icon="el-icon-magic-stick" size="mini" :style="{padding:'0px 5px'}" @click="execCrossMapping('${subTablePath}')">
		      	运行跨表取数
	    	</el-button>
	    </div>
    </#if>
    <#if mergeCellSize gt 0>
	    <div v-if="permission.table.${layout.options.boSubEntity}.del" class="inputs" :style="{display:'inline-block',float:'right'}">
		    <el-button type="text" icon="el-icon-refresh" size="mini" :style="{padding:'0px 5px'}" @click="mergeCellRefresh('${subTablePath}')">
		      	合并单元格
	    	</el-button>
	    </div>
	 </#if>
  	 <#if layout.subtableBackfill && !layout.initTemplateData>
  	 	${getHotSubDialog(layout)}
  	 </#if>
  </el-header>
  <el-main style="padding:5px;">
  	  <#assign initConf  = util.getStringConf(layout.customDialogjson)>
      <eip-hot-table
      		:name='`${layout.desc}`'
      		ref='hottable.${layout.options.subTablePath}'
			options='${util.objectToJsonString(layout.options)}'
			:permission='permission'
			isInitTemplateData="${layout.initTemplateData}"
			initFillDataType="${layout.initTemplateDataType}"
			addInitTemplateData="${layout.addInitTemplateData}"
			initSumRow="${layout.initSumRow}"
			initconf='${initConf}'>
	  </eip-hot-table>
  </el-main>
</el-container>
</#macro>

<#function getHotSubDialog layout >
    <#assign custdialogConf  = util.getStringConf(layout.customDialogjson)>
    <#assign rtn>
    	 <eip-hot-subDialog
    	  :custdialog='${custdialogConf}'
        />
    </#assign>
    <#return rtn>
</#function>