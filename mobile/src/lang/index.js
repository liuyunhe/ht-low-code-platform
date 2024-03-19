import Vue from 'vue'
import VueI18n from 'vue-i18n'
import elementEnLocale from 'element-ui/lib/locale/lang/en' // element-ui lang
import elementZhLocale from 'element-ui/lib/locale/lang/zh-CN'// element-ui lang
import enLocale from './en'
import zhLocale from './zh'


import hotentEnLocale from 'hotent-ui/src/locale/lang/en' // hotent-ui lang
import hotentZhLocale from 'hotent-ui/src/locale/lang/zh-CN'// hotent-ui lang

Vue.use(VueI18n)

const messages = {
  "en-US": {
    ...enLocale,
    ...elementEnLocale,
    ...hotentEnLocale

  },
  "zh-CN": {
    ...zhLocale,
    ...elementZhLocale,
    ...hotentZhLocale
  }
}

const i18n = new VueI18n({
  // set locale
  // options: en | zh 
  locale: localStorage.getItem("lang") || 'zh-CN',
  // set locale messages
  messages
})

export default i18n