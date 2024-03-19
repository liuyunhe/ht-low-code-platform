<template>
  <el-card class="card" shadow="never">
    <div class="flex">
      <ht-form-item label="模型描述" label-width="100px">
        <ht-input
          autocomplete="off"
          v-model="formData.description"
          :validate="{ required: true }"
          :disabled="editing && deployed"
          :maxlength="50"
          :showWordLimit="true"
          @change="getPinyin"
        ></ht-input>
      </ht-form-item>
      <ht-form-item label="模型别名" label-width="100px">
        <ht-input
          v-model="formData.alias"
          :disabled="editing && deployed"
          autocomplete="off"
          @blur="entBlur"
          name="alias"
          validate="required: true|regex:^[a-zA-Z][a-zA-Z0-9_]*$,只能输入字母、数字、下划线，且以字母开头"
          :maxlength="50"
          :showWordLimit="true"
        ></ht-input>
      </ht-form-item>
      <ht-form-item label="所属分类" label-width="100px">
        <eip-sys-type-selector
          placeholder="请选择分类"
          :cat-id="'9'"
          v-model="formData.categoryName"
          :sys-type-id.sync="formData.categoryId"
          :validate="{ required: true }"
        />
      </ht-form-item>
      <ht-form-item label="支持数据库" label-width="100px">
        <el-tooltip
          class="item"
          effect="dark"
          content="勾选后，会在数据库生成对应的库表用于存储业务数据"
          placement="top-end"
        >
          <el-switch :disabled="editing && deployed" v-model="formData.supportDb"></el-switch>
        </el-tooltip>
      </ht-form-item>
    </div>
  </el-card>
</template>

<script>
const eipSysTypeSelector = () =>
  import("@/components/selector/EipSysTypeSelector.vue");
export default {
  components: {
    eipSysTypeSelector,
  },
  name: "BusinessObjHeader",
  props: ["dataView", "formData"],
  computed: {
    editing: function () {
      return this.dataView && this.dataView.type == "edit";
    },
    deployed: function () {
      return this.formData && this.formData.deployed == 1;
    },
  },
  methods: {
    entBlur() {
      this.$emit("entBlur");
    },
    getPinyin(){
      this.$http.request({
				url: `${window.context.uc}/base/tools/v1/getPinyin`,
				method: "GET",
				params: { chinese: this.formData.description, type: 0 }
			}).then(res => {
				if (res.data.state) {
					this.formData.alias = res.data.value;
				}
			})
    }
  },
};
</script>

<style lang="scss" scoped>
.card {
  height: 100%;
  /deep/ .el-card__body {
    padding: 10px 0;
  }
  .ht-form-item {
    margin-bottom: 0;
  }
}
</style>
