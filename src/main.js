import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

const pinia = createPinia()
const app = createApp(App)       // 创建vue实例
app.use(pinia)
app.use(router)                  // 使用路由
app.mount('#app')                // 挂载到id为app的div
