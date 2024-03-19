<template>
    <ht-dialog
            :single="single"
            :data="data"
            :table-columns="tableColumns"
            :pagination="pagination"
            search-placeholder="名称或编码"
            dialog-title="当前组织岗位对话框"
            quick-search-props="name,p.code_"
            :append-to-body="appendToBody"
            :destroy-on-close="destroyOnClose"
            @load="handleLoad"
            @onConfirm="onConfirm"
            ref="htDialog"
    />
</template>

<script>
    import uc from "@/api/uc.js";

    export default {
        name: "PostDialog",
        props: {
            value: Array,
            name: String,
            single: Boolean,
            appendToBody: {
                type: Boolean,
                default: false
            },
            destroyOnClose: {
                type: Boolean,
                default: false
            },
            orgId: {
                type: String,
                default: ""
            }
        },
        data() {
            return {
                data: [],
                tableColumns: [
                    { prop: "name", label: "名称", width: "300" },
                    { prop: "code", label: "编码" }
                ],
                pagination: {
                    page: 1,
                    pageSize: 50,
                    total: 0,
                    showTotal: true
                }
            };
        },
        methods: {
            showDialog() {
                this.$refs.htDialog.showDialog();
            },
            handleLoad(param, cb) {
                let query = {
                    group: "defaultQueryGroup",
                    operation: "EQUAL",
                    relation: "AND",
                    property: "o.ID_",
                    value: this.orgId
                };
                param.querys.push(query);
                uc.getOrgPostPage(param)
                    .then(response => {
                        this.data = response.rows;
                        this.pagination.page = response.page;
                        this.pagination.pageSize = response.pageSize;
                        this.pagination.total = response.total;
                        cb();
                    })
                    .catch(err => {
                        cb();
                    });
            },
            onConfirm(selection) {
                this.$emit("onConfirm", selection, this.name);
                this.$emit("input", selection);
            }
        }
    };
</script>

<style scoped></style>
