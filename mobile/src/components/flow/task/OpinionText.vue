<template>
  <div class="opinion-container">
    <textarea
      placeholder="请输入......"
      :rows="opinion_rows"
      maxlength="500"
      @input="opinionInput"
      v-model="opinion"
      :validate="'email'"
    />
    <el-row style="padding: 10px;background: #fafafa;">
      <el-col :span="22">
        <span>常用语：</span>

        <div class="tag-wrap">
          <div
            v-for="commonOpinion in approvalItem"
            :key="commonOpinion"
            class="tag-wrap__item"
          >
            <!-- <el-tooltip
            class="item"
            effect="dark"
            :content="commonOpinion"
            placement="top-end"
            
            > -->
            <p
              class="common-opinion__text"
              @click="choseCommonOpinion(commonOpinion)"
              v-if="commonOpinion.length > 20"
            >
              {{ commonOpinion }}
            </p>
            <!-- </el-tooltip> -->
            <el-tag @click.native="choseCommonOpinion(commonOpinion)" v-else>{{
              commonOpinion
            }}</el-tag>
          </div>
        </div>
      </el-col>
      <el-col :span="2" class="number-opinion">
        <span :span="2">{{ wordCount }}/500</span>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import { mapState, mapActions } from "vuex";
export default {
  name: "opinionText",
  props: ["procDefKey", "text", "opinion_r"],
  data() {
    return {
      wordCount: 0,
      opinion: "",
      opinion_rows: this.opinion_r ? this.opinion_r : 3,
    };
  },
  watch: {
    text: function(newVal, oldVal) {
      this.opinion = newVal; //newVal即是instId
    },
    opinion: function(newVal, oldVal) {
      this.$emit("getOpinion", this.opinion);
    },
  },
  computed: mapState({
    approvalItem: (state) => state.storeProcess.approvalItem,
  }),
  methods: {
    opinionInput() {
      this.wordCount = this.opinion.length;
    },
    choseCommonOpinion(commonOpinion) {
      this.opinion += commonOpinion;
      this.opinionInput();
    },
    getOpinion() {
      return this.opinion;
    },
    setOpinion(opinion) {
      this.opinion = opinion;
    },
  },
  created() {
    this.$store.dispatch(
      "storeProcess/getApprovalByDefKeyAndTypeId",
      this.procDefKey
    );
  },
};
</script>
<style lang="scss" scoped>
.opinion-container {
  border: 1px solid #ebeef5;
}

.opinion-container > textarea {
  padding: 5px;
  margin-bottom: -3px;
  border: none;
  width: calc(100% - 10px);
  resize: none;
  outline: none;
}

.number-opinion {
  text-align: right;
}

.el-tag {
  margin-right: 7px;
  height: 23px;
  line-height: 21px;
  color: #666;
  background-color: transparent;
  border-color: #ebeef5;
  cursor: pointer;
}

.el-tag:hover {
  border-color: #2761ff;
  color: #2761ff;
}
.tag-wrap {
  display: flex;
  flex-wrap: wrap;
  .common-opinion__text {
    font-size: 12px;
    color: #666;
    margin: 0 0 6px 0;
    border: 1px solid #ebeef5;
    border-radius: 2px;
    padding: 5px;
    &:hover {
      border-color: #2761ff;
      color: #2761ff;
      cursor: pointer;
    }
  }
}
</style>
