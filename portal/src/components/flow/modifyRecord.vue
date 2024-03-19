<template>
<div class="bpm-btn-dialog">
    <el-dialog 
        title="表单修改记录"
        v-if="modifyRecordDialog"
        :visible.sync="modifyRecordDialog"
        :close-on-click-modal="false"
    >
        <ht-table
            @load="loadRecordData"
            :data="data"
            :pageResult="pageResult"
            quick-search-props="userName,taskName"
            ref="htTable"
            :show-export="false"
            :show-custom-column="false"
            :defaultQuerys="[
            { property: 'instId', value: instId, operation: 'EQUAL'}]"
        >
            <template v-slot:toolbar>
                <el-button-group>
                    <ht-delete-button
                        :url="deleteUrl"
                        :htTable="$refs.htTable"
                        @after-delete="$refs.htTable.load();"
                    >删除</ht-delete-button>
                </el-button-group>
            </template>
            <template>
                <ht-table-column type="index" width="60" align="center" label="序号" />
                <ht-table-column prop="userName" label="修改人"  width="140" />
                <ht-table-column prop="taskName" label="任务名称"  width="140" />
                <ht-table-column prop="reason" label="审批意见" show-overflow-tooltip width="200" />
                <ht-table-column prop="modifyTime" label="修改时间" width="160" />
                <ht-table-column prop="detail" label="修改详情" show-overflow-tooltip>
                    <template v-slot="{row}">
                        <el-link type="primary" @click="openModifyDetail(row)" title="查看明细" >{{row.detail}}</el-link>
                    </template>
                </ht-table-column>
            </template>
        </ht-table>

        <el-dialog
            width="60%"
            title="修改明细"
            :visible.sync="detailDialogVisible"
            top="8vh"
            :append-to-body="true"
            :close-on-click-modal="false"
            >
            <el-form v-if="detailDialogVisible" v-model="curRow" data-vv-scope="editModifyForm">
                <ht-input style="width:100%" type="textarea" v-model="curRow.detail" :rows="20" :readonly="true" />
            </el-form>
        </el-dialog>
    </el-dialog>
</div>
</template>

<script>


export default {
    name:"modifyRecord",
    props: ["instId"],
    components: {},
    data() {
        return {
            modifyRecordDialog:false,
            detailDialogVisible:false,
            data: [],
            curRow:{},
            pageResult: {
                page: 1,
                pageSize: 10,
                total: 0
            },
        };
    },
    computed:{
        deleteUrl: function() {
            return window.context.bpmRunTime + "/bpm/boDataModifyRecord/v1/remove";
        }
    },
    mounted() {
        
    },
    methods: {
        handleClose(done) {
            this.modifyRecordDialog = true;
        },
        openModifyDetail(row) {
            this.curRow = row;
            this.detailDialogVisible = true;
        },
        loadRecordData(param, cb) {
            let this_ = this;
            this.$http.post(window.context.bpmRunTime + "/bpm/boDataModifyRecord/v1/listJson",param)
            .then(data => {
                let response = data.data;
                this.data = response.rows;
                this.pageResult = {
                    page: response.page,
                    pageSize: response.pageSize,
                    total: response.total
            };
        })
        .finally(() => cb());
        },
    }
}
</script>

<style>

</style>