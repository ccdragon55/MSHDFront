// src/router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import Home from '../components/Home.vue';
import Login from '../components/Login.vue';
import BloodPressure from '../components/BloodPressure.vue';
import Register from '@/components/Register.vue';
import ForgetPassword from '@/components/ForgetPassword.vue';
import HealthAdvice from '@/components/HealthAdvice.vue';
import Medicine from '@/components/Medicine.vue';
import SetPassword from '@/components/SetPassword.vue';
import Profile from '@/components/Profile.vue';
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/bloodPressure',
    name: 'BloodPressure',
    component:BloodPressure
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/forgetPassword',
    name: 'ForgetPassword',
    component: ForgetPassword
  },
  {
    path: '/healthAdvice',
    name: 'HealthAdvice',
    component: HealthAdvice
  },
  {
    path: '/medicine',
    name: 'Medicine',
    component: Medicine
  },
  {
    path: '/setPassword',
    name: 'SetPassword',
    component: SetPassword
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile
  }
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
  });

// 添加全局导航守卫
router.beforeEach((to, from, next) => {
  const messageCode = localStorage.getItem('messageCode')
  
  // 检查用户访问注册页面时是否存在验证码
  if (to.name === 'SetPassword' && !messageCode) {
    alert('未检测到验证码，请重新获取验证码。')
    next({ name: 'Home' }) // 重定向到首页或其他页面
  } else {
    next() // 允许访问
  }

    // 检查用户是否已登录
  const token = localStorage.getItem('token')
  if( to.name === 'Profile' && !token) {
    alert('请先登录')
    next({ name: 'Login' })
  }

})

export default router;