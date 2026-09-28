import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './styles.css'
import Root from './Root.vue'
import { router } from './router'

/**
 * 创建并挂载管理后台根应用。
 * Element Plus 在入口统一注册，保证原型阶段所有配置页面都能直接复用一致的表单、表格和反馈组件。
 */
const bootstrapApplication = () => {
  const app = createApp(Root)
  app.use(ElementPlus)
  app.use(router)
  app.mount('#app')
}

bootstrapApplication()
