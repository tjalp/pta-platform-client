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
      component: () => import('../views/PtaView.vue'),
      children: [
        {
          path: '',
          name: 'pta-overview',
          component: () => import('../views/pta/PtaOverviewView.vue')
        },
        {
          path: 'weights',
          name: 'pta-weights',
          component: () => import('../views/pta/PtaWeightsView.vue')
        },
        {
          path: 'test/:testId',
          name: 'pta-test',
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
    },
    {
      path: '/sign-in',
      name: 'sign-in',
      component: () => import('../views/SignInView.vue')
    }
  ]
})

export default router
