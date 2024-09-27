import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/:pathMatch(.*)*', name: 'notfound', component: () => import('../views/NotFoundView.vue') },
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue')
    },
    {
      path: '/pta/:id',
      name: 'pta',
      component: () => import('../views/PtaView.vue'),
      children: [
        {
          path: '',
          name: 'overview',
          component: () => import('../views/pta/PtaOverviewView.vue')
        },
        {
          path: 'test/:testId',
          name: 'test',
          component: () => import('../views/pta/PtaTestView.vue')
        }
      ]
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/DashboardView.vue')
    }
  ]
})

export default router
