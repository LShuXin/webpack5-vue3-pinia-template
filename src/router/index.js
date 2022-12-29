import { createRouter, createMemoryHistory } from 'vue-router'
import Home from './Home.vue'
import About from './About.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About },
]

const router = createRouter({
  history: createMemoryHistory(),
  routes,
})

export default router
