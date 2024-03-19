<template>
	<el-dialog :title="title" :visible.sync="dialogFormVisible" :close-on-click-modal="false" width="30%" destroy-on-close>
			<el-form  data-vv-scope="custom-form" label-width="100px" style="width:100%;"   v-form name="online-form" :model="data">
					<el-form-item v-for="(item,index) in listForm" :key="index" :label="item.desc">
						<template v-if="item.outType=='input'">
							<ht-input v-model="data[item.name]" style="width: 95%" :validate="{required:item.isRequired}"></ht-input>
						</template>
						<template v-if="item.outType=='number'">
							<ht-input v-model="data[item.name]" style="width: 95%"  type="number" :validate="{required:item.isRequired}"></ht-input>
						</template>
						<template v-if="item.outType=='data'">
							<ht-date v-model="data[item.name]" style="width: 95%"  :validate="{required:item.isRequired}"></ht-date>
						</template>
						<template v-if="item.outType=='select'">
							<eip-select v-model="data[item.name]" :validate="{required:item.isRequired}"  model-name="data[item.name]" placeholder=""
							            :ganged="item.ganged"
							            :multiple='false' :filterable='false' :allowCreate='false'
							            permission="w"
							            :selectlist="item.selectData"
							            style="width: 95%">
								<span slot="labeldesc">字符串</span>
							</eip-select>
						</template>
						<template v-if="item.outType=='dialog'">
							<eip-dialog v-model="data[item.name]"  :validate="{required:item.isRequired}" model-name="data.bxsp.sqr"
							            :custdialog='item.custdialog'
							            permission="w"
							            style="width: 95%">
							</eip-dialog>
						</template>
						<template v-else-if="item.outType=='user'">
							<eip-user-selector
							style="width: 95%"
							 :validate="{required:item.isRequired}"
									:selectCurrent="item.selectCurrent"
									:single="item.single"
									:appendToBody="true"
									v-model="data[item.name]"
									:config="item.bindConfig"
							/>
						</template>
						<template v-else-if="item.outType=='org'">
							<eip-org-selector
									:selectCurrent="item.selectCurrent"
									:single="item.single"
									:appendToBody="true"
									v-model="data[item.name]"
									:config="item.bindConfig"
							/>
						</template>
						<template v-else-if="item.outType=='post'">
							<eip-post-selector
									:appendToBody="true"
									v-model="data[item.name]"
									:config="item.bindConfig"
							/>
						</template>
						<template v-else-if="item.outType=='role'">
							<eip-role-selector
									:appendToBody="true"
									v-model="data[item.name]"
									:config="item.bindConfig"
							/>
						</template>
						<template v-else-if="item.outType=='job'">
							<eip-job-selector
									:appendToBody="true"
									v-model="data[item.name]"
									:config="item.bindConfig"
							/>
						</template>
						<template v-else-if="item.outType=='dem'">
							<eip-demension-selector
									:appendToBody="true"
									v-model="data[item.name]"
									:config="item.bindConfig"
							/>
						</template>
					</el-form-item>
				</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="dialogFormVisible = false">取 消</el-button>
				<el-button type="primary" @click="onConfirm">确 定</el-button>
			</div>
	</el-dialog>
</template>

<script>

import eipUserSelector from '@/components/eipControl/selector/EipUserSelector.vue'
import eipJobSelector from '@/components/eipControl/selector/EipJobSelector.vue'
import eipOrgSelector from '@/components/eipControl/selector/EipOrgSelector.vue'
import eipPostSelector from '@/components/eipControl/selector/EipPostSelector.vue'
import eipRoleSelector from '@/components/eipControl/selector/EipRoleSelector.vue'
import eipDemensionSelector from '@/components/eipControl/selector/EipDemensionSelector.vue'
import EipSelect from '@/components/eipControl/EipSelect.vue'
import EipDialog from '@/components/eipControl/EipDialog.vue'
import utils from '@/hotent-ui-util.js'
export default {
	name: 'TemplateBatchUpdateDialog',
	components: {
		EipSelect,
		eipUserSelector, eipOrgSelector, eipJobSelector, eipPostSelector, eipRoleSelector,eipDemensionSelector,EipDialog},
	data () {
		return {
			dialogFormVisible: false,
			listForm: [],
			data: {},
			title:""
		}
	},
	mounted () {
	},
	methods: {
		onConfirm () {
			const me_ = this
      utils.validateForm(this, 'custom-form')
              .then(r => {
                me_.dialogFormVisible = false;
                me_.$emit('onConfirm', me_.data)
              })
              .catch(items => {
                me_.$message.error(`还有内容未填写。`)
              })
		},
		closeDialog () {
			this.dialogFormVisible = false

		},
		showDialog (title,data) {
			Object.assign(this.$data, this.$options.data());
			this.dialogFormVisible = true
			this.listForm = data
			this.title =title;
		},
	}
}
</script>

<style scoped>

</style>
