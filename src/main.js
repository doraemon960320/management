import Vue from 'vue'
import App from './App.vue'
//引入路由组件
import router from './router/index'

//引入elementui库
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
Vue.use(ElementUI)

//引入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
 
// require styles
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
Vue.use(VueQuillEditor);

//树形结构
import TableTree from 'vue-table-with-tree-grid'
Vue.component('table-tree',TableTree)

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
  router
}).$mount('#app')
