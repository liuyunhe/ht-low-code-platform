<template>
  <el-card class="card">
    <div slot="header" class="flex card__header">
      <el-tooltip
        class="item"
        effect="dark"
        content="一个业务对象有且仅有一个主实体，可以添加任意数量的子实体"
        placement="right-start"
      >
        <span class="el-icon-question m-l-10">
          <strong>实体列表</strong>
        </span>
      </el-tooltip>
      <div>
        <el-button class="m-l-20" @click="addEntRows()" type="primary"
          >添加实体</el-button
        >
        <el-button @click="addEntExts()">添加外部表</el-button>
      </div>
    </div>

    <div class="card__body">
      <el-scrollbar class="scrollbar-fullheight">
        <div
          class="card__ent"
          v-for="(item, index) in formData.ents"
          :key="index"
          :class="{active: item.isCheck && currentSunIndex < 0}"
        >
          <div @click="getEntsByIndex(index)">
            <div class="card__ent--header flex">
              <span class="card__ent--title">{{ item.show }}</span>
              <div class="card__ent--btngroup">
                <span
                  v-if="item.isExternal == '1'"
                  class="el-icon-search"
                  title="查看外部表详情"
                  @click.stop="addEntExts(index)"
                ></span>
                <span
                  v-if="item.isExternal != '1' && item.relation != 'main'"
                  class="el-icon-plus"
                  title="添加孙实体"
                  @click.stop="addGrandSonEnt(index)"
                ></span>
                <el-popconfirm
                  title="确定删除吗？"
                  @onConfirm="deleteEntRows(index)"
                >
                  <span
                    title="删除"
                    class="el-icon-delete"
                    slot="reference"
                    v-if="!item.id || !deployed"
                  ></span>
                </el-popconfirm>
                <el-popconfirm
                  class="external-delete"
                  title="确定删除吗？此操作会把子实体下的所有孙实体一并删除并且不可逆转且表单需要重新配置！"
                  icon="el-icon-info"
                  icon-color="red"
                  @onConfirm="deleteEnt(index)"
                >
                  <span
                    title="删除"
                    class="el-icon-delete"
                    slot="reference"
                    v-if="
                      item.id && item.isExternal == 1 && item.type != 'main'
                    "
                  ></span>
                </el-popconfirm>
              </div>
            </div>
            <div class="card__ent--body">
              <ht-form-item label="实体描述" label-width="90px">
                <ht-input
                  v-model="item.comment"
                  placeholder="请输入内容"
                  :id="'changeEntsDesc' + index"
                  type="textarea"
                  autosize
                  @input="
                    chineseFormat(
                      'entName' + index,
                      formData.ents,
                      'name',
                      index,
                      item.comment
                    )
                  "
                  :maxlength="50"
                  :showWordLimit="true"
                  :validate="{required: true}"
                  @blur="entBlur(index)"
                ></ht-input>
              </ht-form-item>

              <ht-form-item label="实体名称" label-width="90px">
                <ht-input
                  :disabled="item.id && deployed"
                  v-model="item.name"
                  placeholder="请输入内容"
                  :id="'entName' + index"
                  :name="'entName' + index"
                  :validate="'required: true|regex:^[a-zA-Z][a-zA-Z0-9_]*$,只能输入字母、数字、下划线，且以字母开头'"
                  :maxlength="50"
                  :showWordLimit="true"
                  @blur="entBlur(index)"
                ></ht-input>
              </ht-form-item>

              <ht-form-item
                v-if="item.relation != 'main'"
                label="实体关系"
                label-width="90px"
              >
                <ht-radio
                  option-layout="horizontal"
                  :disabled="item.id && deployed"
                  :options="relationData"
                  v-model="item.relation"
                ></ht-radio>
              </ht-form-item>
            </div>
          </div>
          <div v-if="item.children && item.children.length > 0">
            <el-collapse v-model="activeNames" accordion>
              <el-collapse-item
                v-for="(v, i) in item.children"
                :class="{active: i == currentSunIndex}"
                :key="i"
                :name="i"
              >
                <div
                  class="flex card__acd--header"
                  slot="title"
                  @click="getGrandSonEntsByIndex(i, index)"
                >
                  <span class="card__acd--title">{{ v.show }}</span>
                  <div class="card__acd--btngroup">
                    <span
                      v-if="item.isExternal == '1' && i == currentSunIndex"
                      class="el-icon-search"
                      title="查看外部表详情"
                      @click.stop="addEntExts(index, i)"
                    ></span>
                    <span
                      title="删除"
                      class="el-icon-delete"
                      v-if="(!deployed || !v.id) && i == currentSunIndex"
                      @click.stop="deleteGrandSonEntRows(i, index)"
                    ></span>
                  </div>
                </div>
                <div class="card__acd--body">
                  <ht-form-item label="实体描述" label-width="90px">
                    <ht-input
                      v-model="v.desc"
                      placeholder="请输入内容"
                      :id="'changeGrandSonEntsDesc' + i"
                      @blur="entBlur(i)"
                      @input="
                        chineseFormat(
                          'changeGrandSonEntsName' + i,
                          formData.ents[index].children,
                          'name',
                          i,
                          v.desc
                        )
                      "
                      :validate="{required: true}"
                      :maxlength="50"
                      :showWordLimit="true"
                    ></ht-input>
                  </ht-form-item>

                  <ht-form-item label="实体名称" label-width="90px">
                    <ht-input
                      :disabled="v.id && deployed"
                      v-model="v.name"
                      placeholder="请输入内容"
                      :id="'changeGrandSonEntsName' + i"
                      :name="'changeGrandSonEntsName' + i"
                      @blur="entBlur(i)"
                      :validate="'required: true|regex:^[a-zA-Z][a-zA-Z0-9_]*$,只能输入字母、数字、下划线，且以字母开头'"
                      :maxlength="50"
                      :showWordLimit="true"
                    ></ht-input>
                  </ht-form-item>
                  <ht-form-item label="实体关系" label-width="90px">
                    <ht-radio
                      :disabled="v.id && deployed"
                      :options="relationData"
                      v-model="v.relation"
                    ></ht-radio>
                  </ht-form-item>
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>
        </div>
      </el-scrollbar>
    </div>
  </el-card>
</template>

<script>
import req from '@/request.js'
export default {
  name: 'BusinessObjEnts',
  props: ['formData'],
  data() {
    return {
      relationData: [
        {key: 'onetoone', value: '一对一'},
        {key: 'onetomany', value: '一对多'},
      ],
      activeNames: ['-1'],
      currentEntType: null, //当前编辑的实体类型：main,sub,sun
      currentSunIndex: -1, //当前编辑的孙实体索引
    }
  },
  computed: {
    // 业务对象是否已经发布
    deployed: function () {
      return this.formData && this.formData.deployed == 1
    },
  },
  methods: {
    deleteEnt(index) {
      this.$confirm('是否确认删除？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.deleteEntRows(index)
      })
    },
    addEntRows() {
      this.$emit('addEntRows')
    },
    addEntExts(index, i) {
      this.$emit('addEntExts', index, i)
    },
    getEntsByIndex(index) {
      this.$emit('getEntsByIndex', index)
      this.$forceUpdate()
      this.currentEntType = index > 0 ? 'sub' : 'main'
    },
    addGrandSonEnt(index) {
      this.$emit('addGrandSonEnt', index)
    },
    deleteEntRows(index) {
      if (index - 1 >= 0) {
        //删除实体之后自动选择上一个实体
        this.$emit('getEntsByIndex', index - 1, 'delete')
      }
      this.$emit('deleteEntRows', index)
    },
    entBlur(index) {
      this.$emit('entBlur', index)
    },
    chineseFormat(id, list, param, index, v) {
      this.$emit('chineseFormat', id, list, param, index, v)
    },
    getGrandSonEntsByIndex(i, index) {
      this.currentSunIndex = i
      this.$emit('getGrandSonEntsByIndex', i, index)
      this.currentEntType = 'sun'
    },
    deleteGrandSonEntRows(i, index) {
      this.$emit('deleteGrandSonEntRows', i, index)
    },
  },
  watch: {
    currentEntType: function (newVal) {
      // 不再编辑孙实体时重置 索引为-1
      if (newVal != 'sun') {
        this.currentSunIndex = -1
        this.activeNames = [-1]
      }
    },
  },
}
</script>

<style lang="scss" scoped>
@import '@/assets/css/element-variables.scss';

.card {
  height: calc(100% - 10px);
  color: $--color-text-primary;

  /deep/ .el-card__header,
  /deep/ .el-card__body {
    padding: 18px 0;
  }
  /deep/ .el-card__body {
    height: calc(100% - 100px);
  }
  /deep/ .el-form-item__label {
    font-size: 12px;
  }
  /deep/ .el-radio-horizontal {
    margin-right: 15px;
    padding-top: 10px;
  }
  .card__header {
    justify-content: space-around;
  }
  .card__body {
    height: 100%;
  }
  .height-32 {
    height: 32px;
  }
  .float-l {
    float: left;
  }
  .scrollbar-fullheight {
    height: 95%;
  }
  .card__ent {
    width: 281px;
    border-radius: 5px;
    background: $--color-white;
    border: 1px solid $--border-color-base;
    margin-bottom: 10px;
    margin-left: 10px;
  }
  .card__ent.active {
    border-color: $--color-primary;
    .card__ent--header {
      background: $--color-primary;
      border-color: $--color-primary;
      .card__ent--title,
      .card__ent--btngroup span {
        color: $--color-white;
        visibility: visible;
      }
    }
  }
  .card__ent--header {
    height: 30px;
    margin: -1px -1px 0 -1px;
    background: $--border-color-extra-light;
    border: 1px solid $--border-color-base;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
    justify-content: space-between;
  }
  .card__ent--body {
    padding: 15px 15px 5px 5px;
  }
  .card__ent--title {
    cursor: default;
    line-height: 30px;
    font-weight: 700;
    margin-left: 10px;
  }
  .card__ent--btngroup {
    margin-right: 10px;
  }
  .card__ent--btngroup span {
    visibility: hidden;
    cursor: pointer;
    font-size: 14px;
    font-weight: 700;
  }
  .card__ent--btngroup span + span {
    margin-left: 10px;
  }

  /** 孙实体 begin **/
  .el-collapse-item /deep/ .el-collapse-item__header.is-active {
    border-bottom: 1px solid $--border-color-base;
  }
  .el-collapse-item /deep/ .el-collapse-item__content {
    padding: 10px 15px 0 5px;
  }
  .el-collapse-item /deep/ .el-collapse-item__wrap {
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
  }
  .card__acd--header {
    width: calc(100% - 30px);
    height: 100%;
    justify-content: space-between;
  }
  .card__acd--title {
    cursor: default;
    line-height: 30px;
    font-weight: 700;
    margin-left: 10px;
  }
  .card__acd--btngroup span {
    font-size: 14px;
    font-weight: 700;
  }
  .card__acd--btngroup span + span {
    margin-left: 10px;
  }
  .el-collapse-item.active /deep/ .el-collapse-item__header {
    background: $--color-primary;
    border-color: $--color-primary;
    color: $--color-white;
  }
  /** 孙实体 end **/
}
/deep/.el-textarea /deep/.el-input__count {
  height: 29px;
  bottom: 1px;
}
</style>
