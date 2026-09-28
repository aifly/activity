import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'

/** 将工作台各功能入口映射到可直接访问、可刷新并支持浏览器前进后退的 Web 路由。 */
export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/overview' },
    { path: '/overview', name: 'overview', component: App, meta: { navId: 'overview' } },
    { path: '/activities', name: 'activities', component: App, meta: { navId: 'activities' } },
    { path: '/activities/:activityId/editor', name: 'editor', component: App, meta: { navId: 'editor' } },
    { path: '/tasks', name: 'tasks', component: App, meta: { navId: 'tasks' } },
    { path: '/prizes', name: 'prizes', component: App, meta: { navId: 'prizes' } },
    { path: '/assets', name: 'assets', component: App, meta: { navId: 'assets' } },
    { path: '/publish', name: 'publish', component: App, meta: { navId: 'publish' } },
    { path: '/analytics', name: 'analytics', component: App, meta: { navId: 'analytics' } },
    { path: '/settings', name: 'settings', component: App, meta: { navId: 'settings' } },
    { path: '/help', name: 'help', component: App, meta: { navId: 'help' } },
    { path: '/:pathMatch(.*)*', redirect: '/overview' },
  ],
  /** 路由切换回到页面顶部，浏览器返回时优先恢复用户离开页面前的位置。 */
  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition ?? { top: 0 }
  },
})
