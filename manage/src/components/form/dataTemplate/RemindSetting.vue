<template>
	<div>
		<el-form ref="form" label-width="80px" style="width:100%;" v-form data-vv-scope="form">
			<el-button
					icon="el-icon-plus"
					size="small"
					type="primary"
					style="margin-bottom: 10px;"
					@click="addRemindSetting"
			>添加
			</el-button
			>
			<el-table
					ref="remindSettingTable"
					border
					class="dt-manage__table"
					:max-height="tabHeight"
					:data="remindSettingList"
					tooltip-effect="dark"
			>
				<el-table-column label="提醒对象" width="280px">
					<template slot-scope="scope">
						<el-row :gutter="2">
							<el-col :span="8">
								<ht-select @change="changeTypeObj($event,scope.row)" name="提醒对象" :validate="{required:true}" style="display: inline-block;"
								           v-model="scope.row.typeObj" :options="userPluginList"/>
							</el-col>
							<el-col :span="16">
								<template v-if="scope.row.typeObj=='user'">
									<eip-user-selector
											name="用户"
											:validate="{required:true}"
											:appendToBody="true"
											v-model="scope.row.objName"
											:config="{id:'remindSettingList['+scope.$index+'].objId'}"
									/>
								</template>
								<template v-else-if="scope.row.typeObj=='org'">
									<eip-org-selector
											name="组织"
											:validate="{required:true}"
											style="display: inline-block;"
											:appendToBody="true"
											v-model="scope.row.objName"
											:config="{id:'remindSettingList['+scope.$index+'].objId'}"
									/>
								</template>
								<template v-else-if="scope.row.typeObj=='position'">
									<eip-post-selector
											name="岗位"
											:validate="{required:true}"
											style="display: inline-block;"
											:appendToBody="true"
											v-model="scope.row.objName"
											:config="{id:'remindSettingList['+scope.$index+'].objId'}"
									/>
								</template>
								<template v-else-if="scope.row.typeObj=='role'">
									<eip-role-selector
											name="角色"
											:validate="{required:true}"
											style="display: inline-block;"
											:appendToBody="true"
											v-model="scope.row.objName"
											:config="{id:'remindSettingList['+scope.$index+'].objId'}"
									/>
								</template>
								<template v-else-if="scope.row.typeObj=='job'">
									<eip-job-selector
											name="职务"
											:validate="{required:true}"
											style="display: inline-block;"
											:appendToBody="true"
											v-model="scope.row.objName"
											:config="{id:'remindSettingList['+scope.$index+'].objId'}"
									/>
								</template>
								<template v-else-if="scope.row.typeObj=='script'">
									<ht-select name="变量" style="display: inline-block;" v-model="scope.row.objId"
									           :validate="{required:true}"
									           :options="displaySettingFields" :props="{key:'name', value: 'desc'}"/>
								</template>
							</el-col>
						</el-row>
					</template>
				</el-table-column>
				<el-table-column label="提醒内容">
					<template slot-scope="scope">
						<el-container>
							<el-main :id="'mainHeight'+scope.$index">
								<el-container>
									<el-header height="30px">
										<div>主题:<span v-text="scope.row.subject"></span></div>
									</el-header>
									<el-main>
										<div>内容:<span v-html="scope.row.content"></span></div>
									</el-main>
								</el-container>
							</el-main>
							<el-aside width="80px" :style="'line-height:'+scope.row.mainHeight+'px'">
								<ht-input v-model="scope.row.content" placeholder="请输入主题" autocomplete="off"
								          :validate="{required:true}" v-show="false" name="主题"></ht-input>

								<el-button type="primary" icon="el-icon-edit" size="small"
								           @click="setContent(scope.row,scope.$index)">设置
								</el-button>
							</el-aside>
						</el-container>
					</template>
				</el-table-column>
				<el-table-column label="提醒条件" width="100px">
					<template slot-scope="scope">
						<el-button type="primary" icon="el-icon-edit" size="small"
						           @click="setRule(scope.row.rule,scope.$index)">设置
						</el-button>
					</template>
				</el-table-column>
				<el-table-column label="提醒次数" width="250px">
					<template slot-scope="scope">
						<ht-radio :validate="{required:true}" v-model="scope.row.count"
						          :options="[{key:'0',value:'一直提醒'},{key:'1',value:'一次'}]"/>
					</template>
				</el-table-column>
				<el-table-column label="操作" width="80px">
					<template slot-scope="scope">
						<el-button
								@click="remindSettingList.remove(scope.row)"
								type="danger"
								size="small"
								icon="el-icon-delete"
								plain
						></el-button>
					</template>
				</el-table-column>
			</el-table>
		</el-form>

		<div>
			<el-dialog
					title="字段提示"
					:visible.sync="dialogContentVisible"
					append-to-body
					class="urgent-text"
					:close-on-click-modal="false"
					:destroy-on-close="true"
			>
				<el-form :model="dialogContentData" data-vv-scope="contentForm" v-form>
					<el-form-item label="主题" label-width="80px">
						<ht-input v-model="dialogContentData.subject" placeholder="请输入主题" autocomplete="off"
						          :validate="{required:true}" style="width: 100%" name="主题" :maxlength="50" :showWordLimit="true"></ht-input>
					</el-form-item>
					<el-form-item label="详情" label-width="80px">
						<htEditor v-model="dialogContentData.content" :config="myConfig"></htEditor>
						<ht-input v-model="dialogContentData.content" name="详情" :validate="{required:true}"
						          placeholder="请输入详情" v-show="false"></ht-input>
					</el-form-item>
				</el-form>
				<div slot="footer" class="dialog-footer">
					<el-button type="primary" @click="contentOk">确定</el-button>
					<el-button @click="dialogContentVisible=false;dialogContentData={}">取 消</el-button>
				</div>
			</el-dialog>

			<el-dialog
					title="设置提醒规则"
					v-if="dialogMethodVisible"
					:visible.sync="dialogMethodVisible"
					append-to-body
					class="urgent-text"
					:close-on-click-modal="false"
					:destroy-on-close="true"
			>

				<table class="form-table" cellspacing="0" cellpadding="0" border="0">
					<tbody>
					<tr>
						<td colspan="6">
							<el-container>
								<el-main style="width:100%;">
									<div style="position: relative; height: 360px;overflow: auto;width:100%;">
										<div style="position: absolute; z-index: 2;">
											<form data-vv-scope="form1" v-form>
												<table
														class="table-list custom_condition_tab table"
														:style="tab.style"
														v-for="tab in tabList"
														:key="tab.indexStr"
												>
													<tbody>
													<tr>
														<td style="width:220px">
															<el-select
																	v-model="tab.property"
																	v-validate="{required:true}"
																	@change="setFieldOtherInfo(this,tab,1)"
																	style="width:200px;"
																	size="mini"
															>
																<el-option
																		:value="m.name"
																		:label="m.desc"
																		v-for="m in remainSettingFields"
																		:key="m.pathStr"
																></el-option>
															</el-select>
														</td>
														<td style="width:100px;">
															<el-select v-model="tab.operator" style="width:100px;"
															           size="mini">
																<el-option label="等于" value="1"></el-option>
																<el-option label="不等于" value="2"></el-option>
																<el-option label="大于"
																           v-if="tab.dataType =='date'|| tab.dataType =='number'"
																           value="3"></el-option>
																<el-option label="大于等于"
																           v-if="tab.dataType =='date'|| tab.dataType =='number'"
																           value="7">大于等于
																</el-option>
																<el-option label="小于"
																           v-if="tab.dataType =='date'|| tab.dataType =='number'"
																           value="4"></el-option>
																<el-option label="小于等于"
																           v-if="tab.dataType =='date'|| tab.dataType =='number'"
																           value="8">小于等于
																</el-option>
																<el-option label="包含" v-if="tab.dataType =='varchar' "
																           value="5">包含
																</el-option>
																<el-option label="不包含" v-if="tab.dataType =='varchar' "
																           value="6">不包含
																</el-option>
																<el-option label="属于" value="9">属于</el-option>
															</el-select>
														</td>
                                                        <td>
                                                            	<el-select v-model="tab.type" style="width:100px;"
															           size="mini">
                                                                     <el-option label="固定值" value="1">固定值</el-option>
                                                                     <el-option label="脚本" value="2">脚本</el-option>
                                                                 </el-select>
                                                        </td>
														<td
																v-if="tab.compType!='2' && tab.dataType=='date' && (tab.operator!=7 && tab.operator!=8) && tab.type == 1"
																style="width:220px;"
														>
															<ht-date
                                                                    v-if="tab.type == 1 "
																	v-model="tab.value"
																	style="width:215px;"
																	:validate="{'required':true}"
																	:format="tab.format"
																	:showDate="true"
																	:day="-3"
															/>
														</td>

														<td
																v-if="tab.dataType !='date' && tab.type == 1"
																style="width:220px;"
														>
															<ht-input
                                                                    v-if="tab.type == 1"
																	style="width:203px;"
																	v-model="tab.value"
																	:validate="{'required':true}"
																	:maxlength="50"
																	:showWordLimit="true"
															/>
														</td>
                                                        <td v-if="tab.type == 2">
                                                              <el-select v-model="tab.value" filterable placeholder="请选择脚本" >
                                                                    <el-option
                                                                    v-for="item in scripts"
                                                                    :key="item.id"
                                                                    :label="item.name"
                                                                    :value="item.script">
                                                                    </el-option>
                                                                </el-select>
                                                        </td>
														<td style="width:60px;">
															<el-button
																	@click="removeCondition(tab.indexStr)"
																	size="mini"
																	icon="el-icon-delete"
															></el-button>
														</td>
													</tr>
													</tbody>
												</table>
											</form>
											<div
													class="labelrag"
													:style="branch.style+';height: 24px'"
													v-for="(branch,$index) in branchList"
													:key="branch.indexStr"
											>
												<el-select
														v-model="branch.newjunction"
														class="selected_search"
														@change="changecondition($index)"
												>
													<el-option label="并且" value="and"></el-option>
													<el-option label="或者" value="or"></el-option>
													<el-option label="添加条件" value="3"></el-option>
													<el-option label="添加联合条件" value="4"
													           v-if="branch.condition !='noAdd' "></el-option>
													<el-option label="删除" value="5"
													           v-if="branch.condition !='noDel' "></el-option>
												</el-select>
											</div>
										</div>
										<div
												v-html="svgHtml"
												style="position: absolute; z-index: 1; width:100%; height: 100%;"
										></div>
									</div>
								</el-main>
								<el-footer>
									<div v-text="dialogRuleData"></div>
								</el-footer>
							</el-container>
						</td>
					</tr>
					</tbody>
				</table>

				<div slot="footer" class="dialog-footer">

					<el-button type="primary" @click="previewCondition(false)">预览表达式</el-button>
					<el-button type="primary" @click="previewCondition(true)">确定</el-button>
					<el-button @click="dialogMethodVisible = false">取 消</el-button>
				</div>
			</el-dialog>
		</div>

	</div>

</template>

<script>
import {Base64} from 'js-base64'
import htEditor from '@/components/common/HtEditor.vue'

const eipUserSelector = () => import('@/components/selector/EipUserSelector.vue')
const eipOrgSelector = () => import('@/components/selector/EipOrgSelector.vue')
const eipJobSelector = () => import('@/components/selector/EipJobSelector.vue')
const eipPostSelector = () => import('@/components/selector/EipPostSelector.vue')
const eipRoleSelector = () => import('@/components/selector/EipRoleSelector.vue')
import utils from '@/hotent-ui-util.js'
import flow from "@/api/flow.js";
export default {
	name: 'RemindSetting',
	components: {htEditor, eipUserSelector, eipOrgSelector, eipJobSelector, eipPostSelector, eipRoleSelector},
	props: ['data'],
	data () {
		return {
			myConfig:{
				initialFrameHeight: 240,
				UEDITOR_HOME_URL: window.location.origin +'/'+ window.location.pathname.split('/')[1]+'/static/ueditor/',
				toolbars: [
					[
						// 'source', //源代码
						'undo', //撤销
						'bold', //加粗
						'indent', //首行缩进
						'italic', //斜体
						'underline', //下划线
						'strikethrough', //删除线
						'subscript', //下标
						'fontborder', //字符边框
						'superscript', //上标
						'formatmatch', //格式刷
						'forecolor',//字体颜色
						'justifyleft', //居左对齐
						'justifycenter', //居中对齐
						'justifyright', //居右对齐
						'justifyjustify', //两端对齐
						'fontfamily', //字体
						'fontsize', //字号
						'insertorderedlist', //有序列表
						'insertunorderedlist', //无序列表
						'lineheight',//行间距
						'inserttable', //插入表格
					]
				],
				// 初始容器宽度
				initialFrameWidth: "100%",
				zIndex:9999,
				enableAutoSave: false,
				readonly : false
			},
			tabHeight: `${document.documentElement.clientHeight}` - 280,
			dialogContentData: {content: '', subject: ''},
			dialogRuleData: '',
			index: '',
			dialogMethodVisible: false,
			dialogContentVisible: false,
			dataTemplate: {},
			// lyzcw:2021-12-23 todo:暂时开放提醒对象为表单字段，待测
			userPluginList: [{key: 'user', value: '用户'}, {key: 'script', value: '变量'}],
			remindSettingList: [],
			diyScript: '',
			conditionObj: {},
			tabList: [],
			branchList: [],
			svgHtml: '',
			svgHeight: '400px',
			defaultCondition: {
				property: '',
				operator: '1',
				dataType: '',
				value: '',
				compType: '1'
			},
			Mleft: 50, //初始左边距50
			Mtop: 20, //初始上边距40
			XIncase: 100, //x轴递增数值70
			YIncase: 50, //y轴递增数据50
			varTree: [],
			filedsObj: {},
            displaySettingFields: [],
			remainSettingFields: [], // lyzcw: 2022-07-29 添加子表孙表提醒设置字段
            scripts: [] // 常用脚本列表
		}
	},
	updated(){
		this.remindSettingList.forEach((v, i) =>{
			v.mainHeight = document.getElementById('mainHeight'+i).offsetHeight;
		})
	},
	mounted () {
        this.getAllScript();
		console.log("this.data即currentDataTemplateData：", this.data)
		this.dataTemplate = this.data.bpmDataTemplate
		this.remindSettingList = !this.dataTemplate.remindSettingList ? [] : JSON.parse(this.dataTemplate.remindSettingList)
		if (this.data.displaySettingFields) {
			this.displaySettingFields = JSON.parse(this.data.displaySettingFields).filter(item => {
				return item.isFlowField != true
			})
			this.displaySettingFields.forEach(item => {
				this.filedsObj[item.name] = item
			})
			// lyzcw: displaySettingFields 加入到提醒设置字段
			this.remainSettingFields = this.remainSettingFields.concat(this.displaySettingFields)
		}
		// lyzcw: 子表孙表 加入到提醒设置字段
		// 如果有子表
		if(this.data.subFormField){
			this.data.subFormField.forEach(subTable => {
				var subTableName = subTable.name
				var subTableDesc = subTable.desc
				// 子表字段
				if(subTable.attributeList){
					subTable.attributeList.forEach( subField => {
						var subFieldName = subField.name
						var subFieldDesc = subField.desc
						var subFieldType = subField.dateType
						this.remainSettingFields.push({"type":subFieldType, "name": "#sub_"+ subTableName + "." + subFieldName + "#", "desc": "子表-" + subTableDesc + "." + subFieldDesc})
					})
				}
				// 如果有孙表
				if( subTable.childEnts){
					subTable.childEnts.forEach( sunTable=>{
						var sunTableName = sunTable.name
						var sunTableDesc = sunTable.desc
						// 孙表字段
						if(sunTable.attributeList){
							sunTable.attributeList.forEach( sunField => {
								var sunFieldName = sunField.name
								var sunFieldDesc = sunField.desc
								var sunFieldType = sunField.dateType
								this.remainSettingFields.push({"type":sunFieldType, "name": "#sub_"+ subTableName + ".sub_" + sunTableName + "." + sunFieldName + "#", "desc": "孙表-" + subTableDesc + "." + sunTableDesc + "."+ sunFieldDesc})
							})
						}	
					})
					
				}	
				
			})
		}
	},
	methods: {
		//切换对象 清除之前已选择的对象
		changeTypeObj(name,row){
			row.objId ='';
			row.objName ='';
		},
        getAllScript(){
            // 查询所有的常用脚本
            const _this = this;
            flow.getAllScript().then(resp => {
                for (let index = 0; index < resp.length; index++) {
                    const script = resp[index].script;
                    script=script.replace("return ","");
                    script=script.replace(";","");
                    resp[index].script = script;
                }
                _this.scripts = resp;
            })
        },
		previewCondition (isConfirm) {
			const me_ = this
			utils.validateForm(this, 'form1')
					.then(r => {
						if (!this.conditionObj) return
						var data = this.getConditionStr(this.conditionObj)
						data.conditionObj = JSON.stringify(this.conditionObj)
						if (!isConfirm) {
							this.dialogRuleData = data.conditionString
						} else {
							this.remindSettingList[this.index].rule = JSON.stringify({
								scriptStr: Base64.encode('import com.hotent.base.util.StringUtil;import com.hotent.base.util.time.DateUtil;' + data.conditionString),
								conditionObj: data.conditionObj
							})
							this.dialogMethodVisible = false
						}
					})
					.catch(items => {
						this.$message.error(`还有内容未填写，无法生成表表达式。`)
					})
		},
		getConditionStr (obj) {
			if (!obj || !obj.condition) return
			var returnData = {}
			var data = obj.condition
			var res = ''
			var desString = ''
			for (var i = 0; i < data.length; i++) {
				//第一节点的表达式
				var curcondStr1 = ''
				var curcondDes1 = ''
				//如果第一节点有分支则计算
				if (data[i].condition && data[i].condition.length > 0) {
					curcondStr1 += '('
					curcondDes1 += '('
					for (var j = 0; j < data[i].condition.length; j++) {
						//第二节点的表达式
						var curcondStr2 = ''
						var curcondDes2 = ''
						//如果第三级节点有分支，则计算分支
						if (
								data[i].condition[j].condition &&
								data[i].condition[j].condition.length > 0
						) {
							curcondStr2 += '('
							curcondDes2 += '('
							var curcondStr3 = ''
							var curcondDes3 = ''
							for (var z = 0; z < data[i].condition[j].condition.length; z++) {
								curcondStr3 = this.getConditionStrByObj(
										data[i].condition[j].condition[z]
								)
								curcondDes3 = this.getConditionStrByObj(
										data[i].condition[j].condition[z],
										'des'
								)
								if (curcondStr3 != '') {
									//循环拼接第三节点的条件
									if (z == 0) {
										//第一个不拼接运算符
										curcondStr2 += curcondStr3
										curcondDes2 += curcondDes3
									} else {
										curcondStr2 +=
												this.getjunction(data[i].condition[j].junction) +
												curcondStr3
										curcondDes2 +=
												this.getjunction(data[i].condition[j].junction) +
												curcondDes3
									}
								}
							}
							curcondStr2 += ')'
							curcondDes2 += ')'
						} else if (data[i].condition[j].property) {
							//第二节点没有分只
							curcondStr2 = this.getConditionStrByObj(data[i].condition[j])
							curcondDes2 = this.getConditionStrByObj(
									data[i].condition[j],
									'des'
							)
						}
						if (curcondStr2 != '') {
							//循环拼接第二节点的条件
							if (j == 0) {
								//第一个不拼接运算符
								curcondStr1 += curcondStr2
								curcondDes1 += curcondDes2
							} else {
								curcondStr1 += this.getjunction(data[i].junction) + curcondStr2
								curcondDes1 += this.getjunction(data[i].junction) + curcondDes2
							}
						}
					}
					curcondStr1 += ')'
					curcondDes1 += ')'
				} else if (data[i].property) {
					//第一节点没有分只
					curcondStr1 = this.getConditionStrByObj(data[i])
					curcondDes1 = this.getConditionStrByObj(data[i], 'des')
				}
				if (curcondStr1 != '') {
					//循环拼接第一节点的条件
					if (i == 0) {
						//第一个不拼接运算符
						res += curcondStr1
						desString += curcondDes1
					} else {
						res += this.getjunction(obj.junction) + curcondStr1
						desString += this.getjunction(obj.junction) + curcondDes1
					}
				}
			}
			returnData.conditionString = res
			returnData.conditionDes = desString
			return returnData
		},
		getjunction (str) {
			var res = ''
			switch (str) {
				case 'and':
					res = ' && '
					break
				case 'or':
					res = ' || '
					break
			}
			return res
		},
		getConditionStrByObj (obj, type) {
			var res = ''
			switch (obj.dataType) {
				case 'varchar':
					res = this.buildStringCondition(obj, type)
					break
				case 'date':
					res = this.buildDateCondition(obj, type)
					break
				case 'number':
					res = this.buildIntCondition(obj, type)
					break
			}
			return res
		},
		buildDateCondition (obj, type) {
			var value = obj.value
			var valueDes = ''
			var property = obj.property
			let res = ''
			if (obj.compType == 1) {
				value = '"' + obj.value + '"'
				valueDes = value
			} else {
				valueDes = obj.changeDesc
			}
			if (type == 'des') {
				property = obj.chooseDesc
				value = valueDes
				switch (obj.operator) {
					case '1':
						res = property + '==' + value
						break
					case '2':
						res = property + '!=' + value
						break
					case '3':
						res = property + '>' + value
						break
					case '4':
						res = property + '<' + value
						break
				}
			} else {
				switch (obj.operator) {
					case '1':
						res = 'scriptImpl.isDateEquals(' + property + ',' + value + ')'
						break
					case '2':
						res = '!scriptImpl.isDateEquals(' + property + ',' + value + ')'
						break
					case '3':
						res = 'scriptImpl.isDateLarge(' + property + ',' + value + ')'
						break
					case '4':
						res = 'scriptImpl.isDateLittle(' + property + ',' + value + ')'
						break
					case '7':
						res = 'scriptImpl.isDateLargeEquals(' + property + ',' + value + ')'
						break
					case '8':
						res = 'scriptImpl.isDateLittleEquals(' + property + ',' + value + ')'
						break
					case '9':
						res = 'scriptImpl.isDateBelongTo(' + property + ',' + value + ')'
						break
				}
			}

			return res
		},
		buildStringCondition (obj, type) {
			var value = obj.value
			var valueDes = ''
			var property = obj.property
			let res = ''
			if (obj.compType == 1 && obj.type == 1) {
				value = '"' + obj.value + '"'
				valueDes = value
			} else if(obj.type ==2){
                value = obj.value;
                valueDes = value;
            }else {
				valueDes = obj.changeDesc
			}
			if (type == 'des') {
				property = obj.chooseDesc
				value = valueDes
				switch (obj.operator) {
					case '1':
						res = property + '==' + value
						break
					case '2':
						res = property + '!=' + value
						break
					case '3':
						res = property + '>' + value
						break
					case '4':
						res = property + '<' + value
						break
					case '5':
						res = property + 'contains' + value
						break
					case '6':
						res = property + '! contains' + value
						break
				}
			} else {
				switch (obj.operator) {
					case '1':
						res = 'StringUtil.equals(' + property + ',' + value + ')'
						break
					case '2':
						res = '!StringUtil.equals(' + property + ',' + value + ')'
						break
					case '3':
						res = 'StringUtil.LargeThen(' + property + ',' + value + ')'
						break
					case '4':
						res = 'StringUtil.littleThen(' + property + ',' + value + ')'
						break
					case '5':
						res = 'StringUtil.contains(' + property + ',' + value + ')'
						break
					case '6':
						res = '!StringUtil.contains(' + property + ',' + value + ')'
						break
					case '9':
						res = 'StringUtil.isStringBelongTo(' + property + ',' + value + ')'
						break
				}
			}

			return res
		},
		buildIntCondition (obj, type) {
			var value = obj.value
			var valueDes = ''
			var property = obj.property
			if (obj.compType == 1) {
				value = obj.value
				valueDes = value
			} else {
				valueDes = obj.changeDesc
			}
			if (type == 'des') {
				property = obj.chooseDesc
				value = valueDes
			}
			var res = ''
			switch (obj.operator) {
				case '1':
					res = property + '==' + value
					break
				case '2':
					res = property + '!=' + value
					break
				case '3':
					res = property + '>' + value
					break
				case '4':
					res = property + '<' + value
					break
				case '7':
					res = property + '>=' + value
					break
				case '8':
					res = property + '<=' + value
					break
				case '9':
					// res = "scriptImpl.isNumberBelongTo(" + property + ",\"" + value + "\")";
					let valueArr = value.split(',')
					res = `(${property}>=${valueArr[0]} && ${property}<=${valueArr[1]})`
					break
			}
			return res
		},
		buildDateCondition (obj, type) {
			var value = obj.value
			var valueDes = ''
			var property = obj.property
			let res = ''
			console.log("obj.type：", obj.type)
			console.log("obj.compType", obj.compType)
			if (obj.compType == 1  && obj.type == 1 ) { // lyzcw:2022-06-28, 固定参数才要有引号
				value = '"' + obj.value + '"'
				valueDes = value
			}else if ( obj.type == 2 ) { // lyzcw:2022-06-28, 脚本参数也不要有引号
				value = obj.value
				valueDes = value
			} else {
				valueDes = obj.changeDesc
			}
			if (type == 'des') {
				property = obj.chooseDesc
				value = valueDes
				switch (obj.operator) {
					case '1':
						res = property + '==' + value
						break
					case '2':
						res = property + '!=' + value
						break
					case '3':
						res = property + '>' + value
						break
					case '4':
						res = property + '<' + value
						break
				}
			} else {
				switch (obj.operator) {
					case '1':
						res = 'DateUtil.isDateEquals(' + property + ',' + value + ')'
						break
					case '2':
						res = '!DateUtil.isDateEquals(' + property + ',' + value + ')'
						break
					case '3':
						res = 'DateUtil.isDateLarge(' + property + ',' + value + ')'
						break
					case '4':
						res = 'DateUtil.isDateLittle(' + property + ',' + value + ')'
						break
					case '7':
						res = 'DateUtil.isDateLargeEquals(' + property + ',' + value + ')'
						break
					case '8':
						res = 'DateUtil.isDateLittleEquals(' + property + ',' + value + ')'
						break
					case '9':
						res = 'DateUtil.isDateBelongTo(' + property + ',' + value + ')'
						break
				}
			}

			return res
		},

		setRule (rule, index) {
			if (rule) {
				this.conditionObj = JSON.parse(JSON.parse(rule).conditionObj)
			} else {
				this.conditionObj = {junction: 'and', condition: []}
			}
			this.dialogMethodVisible = true
			this.buildConditionTree(this.conditionObj)
			/*if (rule != undefined) {
				this.dialogRuleData = Base64.decode(rule)
			}*/
			this.index = index
		},
		setContent (row, index) {
			this.dialogContentVisible = true
			let dialogContentData = {content: row.content, subject: row.subject}
			this.dialogContentData = dialogContentData
			this.index = index
		},
		contentOk () {
			utils.validateForm(this, 'contentForm').then(result => {
				this.remindSettingList[this.index].content = this.dialogContentData.content
				this.remindSettingList[this.index].subject = this.dialogContentData.subject
				this.dialogContentVisible = false
				setTimeout(() =>{
					this.remindSettingList[this.index].mainHeight = document.getElementById('mainHeight'+this.index).offsetHeight;
				}, 200)
			}).catch(items => {
				this.$message.error(`还有内容未填写。`)
			})
		},
		changecondition (index) {
			var oldVal = this.branchList[index].oldjunction
			var newVal = this.branchList[index].newjunction
			if (newVal == '3' || newVal == '4' || newVal == '5') {
				this.branchList[index].newjunction = this.branchList[index].oldjunction
				var indexStr = this.branchList[index].indexStr
				if (newVal == '3') {
					this.addCondition(indexStr)
				} else if (newVal == '4') {
					this.addUnionCondition(indexStr)
				} else {
					this.$confirm(
							'确定要删除此联合条件及其下属的所有子条件吗？',
							'提示',
							{
								cancelButtonText: '取消',
								confirmButtonText: '确定',
								type: 'warning',
								closeOnClickModal: false
							}
					).then(() => {
						this.removeCondition(indexStr)
					})
				}
			} else {
				this.branchList[index].oldjunction = this.branchList[index].newjunction
				var indexStr = this.branchList[index].indexStr
				var indexArr = indexStr.split(',')
				if (indexStr == 'root') {
					this.conditionObj.junction = newVal
				} else if (indexArr.length == 1) {
					this.conditionObj.condition[indexStr].junction = newVal
				} else if (indexArr.length == 2) {
					this.conditionObj.condition[indexArr[0]].condition[
							indexArr[1]
							].junction = newVal
				}
			}
		},
		setFieldOtherInfo (ele, tab, type) {
			let selectFiled = this.filedsObj[tab.property]
			console.log("tab：", tab )
			console.log("this.filedsObj：", this.filedsObj )
			console.log("selectFiled：", selectFiled )

			if (type == 1) {
				tab.dataType = selectFiled.type
				tab.format = selectFiled.format
				tab.chooseDesc = selectFiled.desc
				tab.value = ''
			} else {
				tab.changeDesc = selectFiled.desc
			}
		},
		addRemindSetting () {
			let rule = JSON.stringify({
				scriptStr: Base64.encode('true'),
				conditionObj: JSON.stringify({junction: 'and', condition: []})
			})
			this.remindSettingList.push({content: '', count: '1', objId: '', rule: rule, mainHeight: '133'})
		},
		saveRemindSettingList () {
			return new Promise((resolve, reject) => {
				utils.validateForm(this, 'form').then(result => {
					this.dataTemplate.remindSettingList = this.remindSettingList ? JSON.stringify(this.remindSettingList) : null
					resolve(true)
				}).catch(errors => {
					errors.forEach(item => {
						setTimeout(() => {
							this.$notify.error({
								title: '错误',
								message: item.field + item.msg
							})
						}, 500)
					})
					resolve(false)
				})
			})
		},

		buildData (conditionData, pathArr, tableArr, branchArr) {
			let curYIndex = 0
			let data = conditionData.condition
			//算三级节点总共分支个数
			let yIncaseNum =
					this.getyIncaseNum(conditionData.condition) > 1
							? this.getyIncaseNum(conditionData.condition)
							: 1
			//第一个节点 this.Mtop 最后一个节点Mtop+this.YIncase*（yIncaseNum-1）
			let startY1 = (this.Mtop * 2 + this.YIncase * (yIncaseNum - 1)) / 2

			branchArr.push({
				newjunction: conditionData.junction,
				oldjunction: conditionData.junction,
				style: 'left:' + (this.Mleft - 35) + 'px; top:' + (startY1 - 15) + 'px',
				indexStr: 'root',
				condition: 'noDel'
			})
			for (var i = 0; i < data.length; i++) {
				if (data[i].condition) {
					var curchildNum = this.getyIncaseNum(data[i].condition)
					//如果该节点，没有分支条件，则保留节点
					var isEmpty0 = false
					if (curchildNum < 1) {
						curchildNum = 1
						isEmpty0 = true
					}
					//计算一级节点和该节点的连线
					var startY2 =
							(this.Mtop * 2 + this.YIncase * (2 * curYIndex + curchildNum - 1)) /
							2
					var path =
							'M' +
							this.Mleft +
							',' +
							startY1 +
							'C' +
							this.Mleft +
							',' +
							startY2 +
							',' +
							this.Mleft +
							',' +
							startY2 +
							',' +
							(this.Mleft + this.XIncase) +
							',' +
							startY2
					pathArr.push(path)
					branchArr.push({
						newjunction: data[i].junction,
						oldjunction: data[i].junction,
						style:
								'left:' +
								(this.Mleft + this.XIncase - 35) +
								'px; top:' +
								(startY2 - 15) +
								'px',
						indexStr: '' + i
					})
					if (isEmpty0) curYIndex++

					for (var j = 0; j < data[i].condition.length; j++) {
						//如果第三级节点有分支，则计算分支
						if (data[i].condition[j].condition) {
							//计算改节点分支个数
							let curchildNum2 = this.getyIncaseNum(
									data[i].condition[j].condition
							)
							//如果该节点，没有分支条件，则保留节点,默认其占一行
							let isEmpty = false
							if (curchildNum2 < 1) {
								curchildNum2 = 1
								isEmpty = true
							}
							// 改分支第一个节点纵坐标= this.Mtop+this.YIncase*curYIndex  上一个节点纵坐标加上递增值
							// 改分支最后节点纵坐标=改分支第一个节点纵坐标 +计算改节点分支个数*y递增值 this.Mtop+this.YIncase*curYIndex+this.YIncase*(curchildNum2-1)
							// 计算改节点的纵坐标。（改分支第一个节点纵坐标+该分支的最后一个纵坐标）/2
							// 该节点起始点纵坐标=  this.Mtop+this.YIncase*curYIndex+ this.Mtop+this.YIncase*curYIndex+this.YIncase*(curchildNum2-1)
							let startY3 =
									(this.Mtop * 2 +
											this.YIncase * (2 * curYIndex + curchildNum2 - 1)) /
									2
							//改分支指引线的终点的纵坐标等于startY2
							let path =
									'M' +
									(this.Mleft + this.XIncase) +
									',' +
									startY2 +
									'C' +
									(this.Mleft + this.XIncase) +
									',' +
									startY3 +
									',' +
									(this.Mleft + this.XIncase) +
									',' +
									startY3 +
									',' +
									(this.Mleft + this.XIncase * 2) +
									',' +
									startY3
							pathArr.push(path)
							branchArr.push({
								newjunction: data[i].condition[j].junction,
								oldjunction: data[i].condition[j].junction,
								style:
										'left:' +
										(this.Mleft + this.XIncase * 2 - 35) +
										'px; top:' +
										(startY3 - 15) +
										'px',
								indexStr: i + ',' + j,
								condition: 'noAdd'
							})
							if (isEmpty) {
								curYIndex++
							}
							for (let z = 0; z < data[i].condition[j].condition.length; z++) {
								let obj = data[i].condition[j].condition[z]
								obj.style =
										'left:' +
										(this.Mleft + this.XIncase * 3) +
										'px; top:' +
										(this.Mtop + this.YIncase * curYIndex - 19) +
										'px'
								obj.indexStr = i + ',' + j + ',' + z
								tableArr.push(obj)
								//改分支下所有节点的起始纵坐标为startY3，终点纵坐标根据该节点位置决定
								let path =
										'M' +
										(this.Mleft + this.XIncase * 2) +
										',' +
										startY3 +
										'C' +
										(this.Mleft + this.XIncase * 2) +
										',' +
										(this.Mtop + this.YIncase * curYIndex) +
										',' +
										(this.Mleft + this.XIncase * 2) +
										',' +
										(this.Mtop + this.YIncase * curYIndex) +
										',' +
										(this.Mleft + this.XIncase * 3) +
										',' +
										(this.Mtop + this.YIncase * curYIndex)
								pathArr.push(path)
								curYIndex++
							}
						} else {
							//第二级节点没有分支
							let obj = data[i].condition[j]
							obj.style =
									'left:' +
									(this.Mleft + this.XIncase * 2) +
									'px; top:' +
									(this.Mtop + this.YIncase * curYIndex - 19) +
									'px'
							obj.indexStr = i + ',' + j
							tableArr.push(obj)
							//计算改分支的路径。因为是第二节点。startY2
							let path =
									'M' +
									(this.Mleft + this.XIncase) +
									',' +
									startY2 +
									'C' +
									(this.Mleft + this.XIncase) +
									',' +
									(this.Mtop + this.YIncase * curYIndex) +
									',' +
									(this.Mleft + this.XIncase) +
									',' +
									(this.Mtop + this.YIncase * curYIndex) +
									',' +
									(this.Mleft + this.XIncase * 2) +
									',' +
									(this.Mtop + this.YIncase * curYIndex)
							pathArr.push(path)
							curYIndex++
						}
					}
				} else {
					let obj = data[i]
					obj.style =
							'left:' +
							(this.Mleft + this.XIncase) +
							'px; top:' +
							(this.Mtop + this.YIncase * curYIndex - 19) +
							'px'
					obj.indexStr = '' + i
					tableArr.push(obj)
					let path =
							'M' +
							this.Mleft +
							',' +
							startY1 +
							'C' +
							this.Mleft +
							',' +
							(this.Mtop + this.YIncase * curYIndex) +
							',' +
							this.Mleft +
							',' +
							(this.Mtop + this.YIncase * curYIndex) +
							',' +
							(this.Mleft + this.XIncase) +
							',' +
							(this.Mtop + this.YIncase * curYIndex)
					pathArr.push(path)
					curYIndex++
				}
			}
		},
		//获取条件总数
		getyIncaseNum (data) {
			var sum = 0
			for (var i = 0; i < data.length; i++) {
				if (data[i].condition && data[i].condition.length > 0) {
					for (var j = 0; j < data[i].condition.length; j++) {
						if (
								data[i].condition[j].condition &&
								data[i].condition[j].condition.length > 0
						) {
							for (var z = 0; z < data[i].condition[j].condition.length; z++) {
								sum++
							}
						} else {
							sum++
						}
					}
				} else {
					sum++
				}
			}
			return sum
		},
		//根据条件数组构建条件分支界面
		buildConditionTree (data) {

			let pathArr = []
			let tableArr = []
			let branchArr = []
			this.buildData(data, pathArr, tableArr, branchArr)
			this.pathList = pathArr
			this.branchList = branchArr
			this.tabList = tableArr
			//取路径最后一条数据，因为该条数据的高度距离顶部最大
			let lastPath = pathArr[pathArr.length - 1]
			let lastIndexArr = []
			if (lastPath) lastIndexArr = lastPath.split(',')
			//取最后一个坐标点。终点纵坐标为整个svg中最大的纵坐标
			let lastYIndex = lastIndexArr[lastIndexArr.length - 1]
			//设置svg的高度为最大纵坐标+100，从而实现svg页面高度自适应
			if (lastYIndex) {
				this.svgHeight = parseInt(lastYIndex) + 50 + 'px'
			}
			this.createSvgHtml(pathArr)
		},
		//构建svg图形页面
		createSvgHtml (pathArr) {
			this.svgHtml = ''
			var html =
					'<svg height="' +
					this.svgHeight +
					'" version="1.1" width="692" xmlns="http://www.w3.org/2000/svg" style="overflow: hidden; position: relative;">'
			for (var i = 0; i < pathArr.length; i++) {
				html +=
						'<path fill="none" stroke="#787878"' +
						'd="' +
						this.pathList[i] +
						'" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"></path>'
			}
			html += '</svg>'
			this.svgHtml = html
		},
		addCondition (indexStr) {
			var data = this.conditionObj.condition
			if (indexStr == 'root') {
				data.push(JSON.parse(JSON.stringify(this.defaultCondition)))
			} else {
				var indexArr = []
				if (indexStr) indexArr = indexStr.split(',')
				for (var i = 0; i < data.length; i++) {
					if (indexArr.length > 0 && i == indexArr[0]) {
						if (indexArr.length > 1) {
							for (var j = 0; j < data[i].condition.length; j++) {
								if (j == indexArr[1]) {
									data[i].condition[j].condition.push(
											JSON.parse(JSON.stringify(this.defaultCondition))
									)
									break
								}
							}
						} else {
							data[i].condition.push(
									JSON.parse(JSON.stringify(this.defaultCondition))
							)
						}
						break
					}
				}
			}
			this.conditionObj.condition = data
			this.buildConditionTree(this.conditionObj)
		},
		removeCondition (indexStr) {
			var indexArr = []
			if (indexStr) indexArr = indexStr.split(',')
			if (indexArr.length > 0) {
				var data = this.conditionObj.condition
				for (var i = 0; i < data.length; i++) {
					if (i == indexArr[0]) {
						if (indexArr.length > 1) {
							for (var j = 0; j < data[i].condition.length; j++) {
								if (j == indexArr[1]) {
									if (indexArr.length > 2) {
										for (
												var z = 0;
												z < data[i].condition[j].condition.length;
												z++
										) {
											if (z == indexArr[2]) {
												data[i].condition[j].condition.splice(z, 1)
												break
											}
										}
									} else {
										data[i].condition.splice(j, 1)
									}
									break
								}
							}
						} else {
							data.splice(i, 1)
						}
						break
					}
				}
				this.conditionObj.condition = data
				this.buildConditionTree(this.conditionObj)
			}
		},
		//添加一个联合条件条件
		addUnionCondition (indexStr) {
			var data = this.conditionObj.condition
			if (indexStr == 'root') {
				data.push({junction: 'or', condition: []})
			} else {
				var indexArr = []
				if (indexStr) indexArr = indexStr.split(',')
				for (var i = 0; i < data.length; i++) {
					if (indexArr.length > 0 && i == indexArr[0]) {
						if (indexArr.length > 1) {
							for (var j = 0; j < data[i].condition.length; j++) {
								if (j == indexArr[1]) {
									data[i].condition[j].condition.push({
										junction: 'or',
										condition: []
									})
									break
								}
							}
						} else {
							data[i].condition.push({junction: 'or', condition: []})
						}
						break
					}
				}
			}
			this.conditionObj.condition = data
			this.buildConditionTree(this.conditionObj)
		}

	}

}
</script>
<style scoped>
	div >>> .el-dialog__body {
		padding: 10px;
	}

	.table > thead > tr > th,
	.table > thead > th,
	.table > tbody > tr > th,
	.table > tfoot > tr > th,
	.table > thead > tr > td,
	.table > tbody > tr > td,
	.table > tfoot > tr > td {
		border-top: 1px solid #e7eaec;
		border-left: 1px solid #e7eaec;
		line-height: 1.42857;
		vertical-align: middle;
		padding: 4px;
	}

	.table > tbody > tr > td {
		text-align: center;
	}

	.table {
		border-bottom: 1px solid #e7eaec;
		border-right: 1px solid #e7eaec;
		border-spacing: 0;
	}

	.table >>> .el-button {
		padding: 6px 8px;
	}

	div >>> .el-tabs__content {
		height: 450px;
		overflow: auto;
	}

	.labelrag {
		padding: 0.2em 0.2em 0.3em;
		font-size: 75%;
		font-weight: 700;
		line-height: 1;
		background-color: #fff;
		text-align: center;
		white-space: nowrap;
		vertical-align: baseline;
		border-radius: 12px;
		width: 70px;
		line-height: 20px;
		border: solid 1px;
		position: absolute;
		z-index: 3;
	}

	div >>> .labelrag > .selected_search {
		width: 60px;
		border: none;
		outline: none;
		height: 22px;
	}

	div >>> .labelrag > .el-select > .el-input > .el-input__inner {
		padding: 0px;
		border: none;
		height: 26px;
	}

	.custom_condition_tab {
		width: 700px;
		position: absolute;
	}

	.inputs >>> .el-form-item__error {
		display: none;
	}

	div >>> [aria-invalid="true"] .el-input .el-input__inner {
		border-color: #f56c6c;
	}

	.el-tag + .el-tag {
		margin-left: 5px;
		margin-right: 5px;
	}
</style>
