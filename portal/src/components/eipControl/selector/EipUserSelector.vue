<template>
  <div>
    <ht-user-selector
      v-model="value"
      :validate="validate"
      :name="inputName"
      :placeholder="placeholder"
      :permission="permission_sub"
      :single="single"
      :config="config"
      :data="data"
      :table-columns="tableColumns"
      :pagination="pagination"
      :demensions="demensions"
      :default-demension="defaultDemension"
      :orgs="orgs"
      :load-org-tree="loadOrgTree"
      :append-to-body="appendToBody"
      @load="handleLoad"
      @valueChange="valueChange"
      @loadDemensions="loadDemensions"
      @changeDemension="changeDemension"
      @loadOrgUser="loadOrgUser"
      select-label="fullname"
      quick-search-props="fullname,account,email"
      v-if="permission_sub != 'n'"
    >
      <span style="display: none" v-validate>
        <slot name="labeldesc">{{ inputName }}</slot>
      </span>
    </ht-user-selector>
  </div>
</template>
<script>
import utils from '@/hotent-ui-util.js'
import sub_pio_mixin from '@/sub-permission-mixin.js'
export default {
  name: 'eip-user-selector',
  props: {
    validate: [String, Object],
    value: String,
    name: String,
    placeholder: String,
    permission: String,
    single: Boolean,
    config: Object,
    appendToBody: {
      type: Boolean,
      default: false,
    },
    selectCurrent: Boolean,
  },
  mixins: [sub_pio_mixin], //混入方式引入表单组件中公共属性，处理子表、孙表行内联动（切面修改permission）
  data() {
    return {
      data: [],
      demensions: [],
      defaultDemension: '',
      orgs: [],
      tableColumns: [
        {prop: 'fullname', label: '名称', width: '120'},
        {prop: 'account', label: '账号', width: '120'},
        {prop: 'mobile', label: '手机', width: '120'},
        {prop: 'email', label: '邮件'},
      ],
      pagination: {
        page: 1,
        pageSize: 50,
        total: 0,
        showTotal: true,
      },
    }
  },
  computed: {
    inputName: function () {
      let labeldesc = ''
      if (
        this.$slots &&
        this.$slots.labeldesc &&
        this.$slots.labeldesc[0].children &&
        this.$slots.labeldesc[0].children[0].text
      ) {
        labeldesc = this.$slots.labeldesc[0].children[0].text
        return this.name ? this.name : utils.getName() + '-' + labeldesc
      } else {
        return this.name ? this.name : utils.getName()
      }
    },
  },
  mounted() {
    // 没有值而且需要显示当前用户
    if (!this.value && this.selectCurrent) {
      let user = null
      if (this.$store.state.user.currentUserDetail == null) {
        this.$store
          .dispatch('user/loadCurrentUserDetail')
          .then((currentUserDetail) => {
            user = currentUserDetail.user
          })
          .then(() => {
            this.initCurrentValue(user)
          })
      } else {
        user = this.$store.state.user.currentUserDetail.user
        this.initCurrentValue(user)
      }
    }
  },
  methods: {
    initCurrentValue(user) {
      this.$emit('input', user.fullname)
      // 同时更新绑定的字段
      if (this.config) {
        // 配置了id的绑定关系，则回填到指定属性上
        if (this.config.hasOwnProperty('id')) {
          utils.setValueByConfigKey(this, this.config, 'id', user.id)
        }
        // 配置了fullname的绑定关系，则回填到指定的属性上
        if (this.config.hasOwnProperty('fullname')) {
          utils.setValueByConfigKey(
            this,
            this.config,
            'fullname',
            user.fullname
          )
        }
        // 配置了account的绑定关系，则回填到指定的属性上
        if (this.config.hasOwnProperty('account')) {
          utils.setValueByConfigKey(this, this.config, 'account', user.account)
        }
        if (this.config.hasOwnProperty('mobile')) {
          utils.setValueByConfigKey(this, this.config, 'mobile', user.mobile)
        }
        if (this.config.hasOwnProperty('email')) {
          utils.setValueByConfigKey(this, this.config, 'email', user.email)
        }
      }
    },
    handleLoad(param, cb) {
      let queryFilter = param

      if (param.path) {
        let query = {
          property: 'path_',
          value: param.path,
          group: 'main',
          operation: 'RIGHT_LIKE',
          relation: 'AND',
        }
        if (!queryFilter.querys) {
          queryFilter.querys = []
        }
        queryFilter.querys.push(query)
      }
      //必须设置分页。以免请求全部数据而导致前端卡死。
      if (!queryFilter.pageBean) {
        queryFilter.pageBean = {
          page: 1,
          pageSize: 50,
          total: 0,
          showTotal: true,
        }
      }
      let _this = this
      this.$http
        .post('${uc}/api/user/v1/users/queryByType', queryFilter)
        .then((rep) => {
          let data = rep.data
          _this.data = data.rows
          _this.pagination.page = data.page
          _this.pagination.pageSize = data.pageSize
          _this.pagination.total = data.total
        })
        .finally(() => {
          cb()
        })
    },
    valueChange(value) {
      this.$emit('input', value)
    },
    loadOrgTree(node, resolve) {
      if (node && node.data && node.data.isParent) {
        if (node.data.children) {
          resolve(node.data.children)
        } else {
          this.$http
            .post('${uc}/api/org/v1/orgs/getByParentAndDem', {
              demId: node.data.demId,
              parentId: node.data.id,
            })
            .then((rep) => {
              resolve(rep.data)
            })
            .catch(function (error) {})
        }
      } else {
        resolve([])
      }
    },
    changeDemension(currentDemensionId) {
      // 维度改变 重新获取组织
      let _this = this
      this.$http
        .post('${uc}/api/org/v1/orgs/getByParentAndDem', {
          demId: currentDemensionId,
        })
        .then((rep) => {
          _this.orgs = utils.tile2nest(rep.data)
        })
        .catch(function (error) {})
    },
    loadOrgUser(org) {
      // 根据组织获取用户
      this.handleLoad({path: org.path}, () => {})
    },
    loadDemensions() {
      if (this.demensions.length == 0) {
        let _this = this
        this.$http
          .get('${uc}/api/demension/v1/dems/getAll')
          .then((rep) => {
            let data = rep.data
            _this.demensions = data
            data.forEach((element) => {
              if (element.isDefault == 1) {
                _this.defaultDemension = element.id
              }
            })
            if (!_this.defaultDemension) {
              _this.defaultDemension = data[0].id
            }
          })
          .catch(function (error) {})
      }
    },
  },
}
</script>
