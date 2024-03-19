<template>
  <div style="display:flex;" ref="wrapper">
  <slot></slot>
  </div>
</template>

<script>
import {setStyle} from "element-ui/src/utils/dom"
export default {
  name: 'CopyText',
  props: {
    tag:{
        type:String,
        default:'div'
    },
    text: {
      type: String,
      default: ''
    },
    selfStyle:{
        type:String,
        default:''
    }
  },
  mounted(){
    const el=this.$el;
    // const child= document.createElement(this.tag);
    // child.innerText=this.text;
    // child.style=this.selfStyle;
    // setStyle(child,'display','block');
    // el.appendChild(child)
  },
  methods: {
    handleClick() {
      const input = document.createElement('input')
      input.value = this.text
      document.body.appendChild(input)
      input.select()
      input.setSelectionRange(0, input.value.length)
      document.execCommand('copy')
      document.body.removeChild(input)
      this.$message.success('复制成功')
    }
  }
}
</script>
