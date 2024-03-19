<template>
	<el-dialog title="批量更新" :visible.sync="dialogFormVisible" :close-on-click-modal="false" :destroy-on-close="true"
	           append-to-body>
		<el-form v-form data-vv-scope="form" label-width="80px" style="width:100%;">
			<el-form-item v-for="(item,index) in listForm" :key="index" :label="item.desc">
				<template v-if="item.outType=='input'">
					<ht-input v-model="data[item.name]" style="width: 100%"></ht-input>
				</template>
				<template v-if="item.outType=='number'">
					<ht-input v-model="data[item.name]" style="width: 100%"  type="number"></ht-input>
				</template>
				<template v-if="item.outType=='data'">
					<ht-date v-model="data[item.name]" style="width: 100%"  ></ht-date>
				</template>
				<template v-if="item.outType=='select'">
					<ht-select v-model="data[item.name]" style="width: 100%"  :options="item.selectData"></ht-select>
				</template>
				<template v-else-if="item.outType=='user'">
					<eip-user-selector
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

export default {
	name: 'TemplateBatchUpdateDialog',
	components: {eipUserSelector, eipOrgSelector, eipJobSelector, eipPostSelector, eipRoleSelector,eipDemensionSelector},
	data () {
		return {
			dialogFormVisible: false,
			listForm: [],
			data: {}
		}
	},
	mounted () {
	},
	methods: {
		onConfirm () {
			this.dialogFormVisible = false
			this.$emit('onConfirm', this.data)
		},
		closeDialog () {
			this.dialogFormVisible = false

		},
		showDialog (data) {
			this.dialogFormVisible = true
			this.listForm = data
		},
	}
}
</script>

<style scoped>

</style>
