<template>
  <div class="fullheight">
    <table>
      <tr>
        <th><span>标题:</span></th>
        <td>{{data.subject}}</td>
      </tr>
      <tr>
        <th><span>委托人ID:</span></th>
        <td>{{data.authId}}</td>
      </tr>
      <tr>
        <th><span>委托人姓名:</span></th>
        <td>{{data.authName}}</td>
      </tr>
      <tr>
        <th><span>开始生效时间:</span></th>
        <td>{{data.startDate}}</td>
      </tr>
      <tr>
        <th><span>结束日期:</span></th>
        <td>{{data.endDate}}</td>
      </tr>
      <tr>
        <th><span>是否有效:</span></th>
        <td>{{data.isEnabled==1?'是':'否'}}</td>
      </tr>
      <tr>
        <th><span>被委托人ID:</span></th>
        <td>{{data.agentId}}</td>
      </tr>
      <tr>
        <th><span>被委托人:</span></th>
        <td>{{data.agent}}</td>
      </tr>
      <tr>
        <th><span>流程定义KEY:</span></th>
        <td>
          <span v-if="data.type==2"><span v-for="def in data.defList" :key="def.flowKey" style="margin:0px 2px;">{{def.flowKey}}</span></span>
          <span v-if="data.type!=2">{{data.flowKey}}</span>
        </td>
      </tr>
      <tr>
        <th><span>委托类型(1,全权委托,2,部分委托):</span></th>
        <td>
          {{data.type==1?'全权委托':'部分委托'}}
        </td>
      </tr>
      <tr>
        <th><span>创建人ID:</span></th>
        <td>{{data.createBy}}</td>
      </tr>
      <tr>
        <th><span>创建时间:</span></th>
        <td>{{data.createTime}}</td>
      </tr>
      <tr>
        <th><span>创建者所属组织ID:</span></th>
        <td>{{data.createOrgId}}</td>
      </tr>
      <tr>
        <th><span>更新人ID:</span></th>
        <td>{{data.updateBy}}</td>
      </tr>
      <tr>
        <th><span>更新时间:</span></th>
        <td>{{data.updateTime}}</td>
      </tr>
    </table>
  </div>
</template>

<script>
  export default {
    props:{
      detailData:{
        type:Object,
        default:()=>{}
      }
    },
    computed:{
      data:function () {
        return {...this.detailData};
      }
    }
  }
</script>

<style scoped>
  table{
    width: 100%;
  }
  th{
    width: 50%;
    padding: 8px;
  }
  td{
    font-size: 13px;
  }
  span{
    font-size: 13px;
    float: left;
  }
</style>
