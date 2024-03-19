<template>
  <div class="opinion-container">
    <textarea
      placeholder="请输入......"
      rows="3"
      maxlength="500"
      @input="opinionInput"
      v-model="opinion"
      :validate="'email'"
    />
    <el-row style="padding: 10px;background: #fafafa;">
      <el-col :span="22">
        <span>常用语：</span>
        <el-tag
          v-for="commonOpinion in approvalItem"
          @click.native="choseCommonOpinion(commonOpinion)"
          :key="commonOpinion"
        >{{commonOpinion}}</el-tag>
      </el-col>
      <el-col :span="2" class="number-opinion">
        <span :span="2">{{wordCount}}/500</span>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import req from "@/request.js";

export default {
  name: "opinionText",
  props:["procDefKey","text"],
  data() {
    return {
      wordCount: 0,
      opinion: "",
      approvalItem:[],
    };
  },
  watch: {
      text: function(newVal,oldVal){
          this.opinion = newVal;  //newVal即是instId
      },
			opinion: function(newVal,oldVal){
				this.$emit("getOpinion",this.opinion);
			}
  },

  methods: {
    opinionInput() {
      this.wordCount = this.opinion.length;
    },
    choseCommonOpinion(commonOpinion) {
      this.opinion += commonOpinion;
      this.opinionInput();
    },
    getOpinion(){
      return this.opinion;
    }
  },
  created(){
    let this_ =this;
    this.opinion = this.text; 
    req.get(window.context.bpmModel + '/flow/approvalItem/v1/getApprovalByDefKeyAndTypeId?defKey='+this.procDefKey).then(function (rep) {
        this_.approvalItem = rep.data;    
    });
  }
};
</script>
<style lang="stylus" scoped>
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
</style>
