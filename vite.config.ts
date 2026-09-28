import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

/**
 * 创建本地活动管理后台的 Vite 配置。
 * 当前版本仅启用 Vue 单文件组件编译；后续接入真实接口时可在 server.proxy 中补充网关代理，
 * 避免在业务组件里散落环境地址。
 */
export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
})
