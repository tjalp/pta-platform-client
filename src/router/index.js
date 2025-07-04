import {createRouter, createWebHistory} from 'vue-router'
import {useUserStore} from "@/stores/user.js";
import {rolePermissions} from "@/config/roles.js";

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
      component: () => import('../views/DashboardView.vue'),
      meta: {
        permissions: ['view_dashboard']
      }
    },
    {
      path: '/sign-in',
      name: 'sign-in',
      component: () => import('../views/SignInView.vue'),
    },
    {
      path: '/sign-up',
      name: 'sign-up',
      component: () => import('../views/SignUpView.vue'),
    },
    {
      path: '/help',
      name: 'help',
      component: () => import('../views/HelpView.vue'),
    }
  ]
})

router.beforeEach(async (to) => {
  const { user, fetchUser } = useUserStore()
  const required = to.meta.permissions || []

  if (!required.length || to.name === 'sign-in') return

  if (!user) return { name: 'sign-in', query: { redirect: to.fullPath } }

  const permissions = new Set()
  const roles = user.roleIds || []

  roles.forEach(role => {
      (rolePermissions[role] || []).forEach(p => permissions.add(p))
  })

  const ok = required.every(p => permissions.has(p))

  if (!ok) return { name: 'notfound' }
})

export default router
