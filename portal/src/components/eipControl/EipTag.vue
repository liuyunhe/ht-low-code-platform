<template>
  <div class="inputs" ref="inputs">
    <el-select :filterable="filterable" :remote="filterable" :remote-method="remoteMethod" :multiple="multiple" v-if="inputWriteable && permission_sub != 'n'" ref="fuzzySearch" 
                @focus="focusSelectValue" v-model="inputVal" clearable style="width: 100%" @visible-change="visibleChange" :name="inputName" v-validate="inputValidate">
      <div v-loading="loading">
        <el-option v-for="item in options" :key="item.id" :label="item.name" :value="item.name"> </el-option>
      </div>

      <div class="text-center">
        <a class="text-normal">
          <el-pagination @current-change="currentChange" layout="prev, pager, next" :page-size="pagination.pageSize" :pager-count="5" :current-page="pagination.page" :total="pagination.total"> </el-pagination>
        </a>
      </div>
      <el-button style="width: 100%" @click="add" v-if="expand && this.currentQuery !== ''">添加</el-button>
      <template slot="empty" v-if="expand">
        <el-button style="width: 100%" @click="add">添加</el-button>
      </template>
    </el-select>
    <ht-field-tail 
      :fieldName="inputName"
      :readonly="!inputWriteable"
      :inputValue="inputVal"
      :tag-format-value="values"
    />
  </div>
</template>

<script>
import utils from '@/hotent-ui-util.js';
import portal from '@/api/portal.js';
import sub_pio_mixin from '@/sub-permission-mixin.js';
import hotentUiUtils from '@/hotent-ui-util.js';

export default {
  name: 'eip-tag',
  props: {
    filterable: {
      type: Boolean,
      default: false,
    },
    expand: {
      type: Boolean,
      default: false,
    },
    tagKey: String,
    value: String,
    permission: String | Object,
    multiple: {
      type: Boolean,
      default: false,
    },
  },
  mixins: [sub_pio_mixin], //混入方式引入表单组件中公共属性，处理子表、孙表行内联动（切面修改permission_sub_sub）
  data() {
    return {
      options: [],
      pagination: {
        pageSize: 5,
        page: 1,
        total: 0,
      },
      loading: false,
      currentQuery: '',
      values: [],
      writeable:true,
    };
  },
  methods: {
    focusSelectValue() {
      if (this.$refs.fuzzySearch.$refs.input) {
        this.$refs.fuzzySearch.$refs.input.blur = () => {
          this.currentQuery = '';
          this.search();
        };
      }
    },
    visibleChange(flag) {
      //单选时输入框关闭时重新搜索内容
      if (!flag && !this.multiple) {
        this.currentQuery = '';
        this.search();
      }
    },
    remoteMethod(query) {
      this.currentQuery = query;
      let param = {
        pageBean: this.pagination,
        querys: [{ property: 'type_key_', value: this.tagKey, group: 'query', operation: 'EQUAL', relation: 'AND' }],
      };
      if (query) {
        param.querys.push({ property: 'name_', value: query, group: 'query', operation: 'LIKE', relation: 'AND' });
      }
      this.loading = true;
      portal
        .getTagList(param)
        .then((data) => {
          this.options = data.rows;
          this.pagination = {
            pageSize: data.pageSize,
            page: data.page,
            total: data.total,
          };
        })
        .finally(() => {
          this.loading = false;
        });
    },
    currentChange(page) {
      this.pagination.page = page;
      this.remoteMethod(this.currentQuery);
    },
    add() {
      let param = {
        name: this.currentQuery,
        typeKey: this.tagKey,
      };
      portal.saveTag(param).then((data) => {
        if (data.state) {
          this.$message({ type: 'success', message: '添加成功' });
          this.remoteMethod(this.currentQuery);
        }
      });
    },
    search() {
      let param = {
        pageBean: this.pagination,
        querys: [{ property: 'type_key_', value: this.tagKey, group: 'query', operation: 'EQUAL', relation: 'AND' }],
      };
      portal.getTagList(param).then((data) => {
        this.options = data.rows;
        this.pagination = {
          pageSize: data.pageSize,
          page: data.page,
          total: data.total,
        };
      });
      if (this.value) {
        this.values = this.value.split(',');
      }
    },
  },
  mounted() {
    const { subScopeEl, index } = hotentUiUtils.getSubScopeElAndIndex(this.$el);
    if (subScopeEl && (subScopeEl.getAttribute("row_readonly") == 'true' || subScopeEl.getAttribute("row_readonly") === true)) {
      this.writeable = false;
    }
    this.search();
  },
  computed: {
    inputName: function() {
      let labeldesc = "";
      if (
        this.$slots &&
        this.$slots.labeldesc &&
        this.$slots.labeldesc[0].children &&
        this.$slots.labeldesc[0].children[0].text
      ) {
        labeldesc = this.$slots.labeldesc[0].children[0].text;
        return this.name ? this.name : utils.getName() + "-" + labeldesc;
      } else {
        return this.name ? this.name : utils.getName();
      }
    },
    inputValidate: function() {
      return utils.addRequiredOrNot(this.permission, this.validate, this);
    },
    inputWriteable: function () {
      if(!this.writeable){
        return this.writeable;
      }
      return utils.getWriteable(this.permission_sub);
    },
    inputVal: {
      set(value) {
        if (value && this.multiple) {
          this.$emit('input', value.join(','));
        } else {
          this.$emit('input', value);
        }
      },
      get() {
        if (this.value && this.multiple) {
          this.values = this.value.split(',');
          return this.value.split(',');
        }
        return this.value;
      },
    },
  },
   created() {
    this.$validator = this.$root.$validator;
  },
};
</script>

<style scoped>
.text-center {
  position: sticky;
  background: #fff;
  height: 30px;
  top: 0;
  z-index: 1;
  text-align: center;
}
div[aria-invalid="true"] >>> .el-input__inner,
div[aria-invalid="true"] >>> .el-input__inner:focus {
  border-color: #f56c6c;
}
</style>
