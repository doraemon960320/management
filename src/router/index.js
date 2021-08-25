import Vue from 'vue'
import VueRouter from 'vue-router'
Vue.use(VueRouter)
//路由懒加载形式引入组件
const Login = () => import('../components/login/Login')
const Home = () => import('../components/home/Home')
const Welcome= () =>import('../components/welcome/Welcome')
const User=()=>import('../components/user/User')
const Role=()=>import('../components/rights/role/Role')
const RightList=()=>import('../components/rights/rightList/RightList')
const GoodList=()=>import('../components/good/GoodList')
const AddGood=()=>import('../components/good/AddGood')
const GoodParams=()=>import('../components/good/GoodParams')
const Categories=()=>import('../components/good/Categories')
const Order=()=>import('../components/order/Order')
const Report=()=>import('../components/report/Report')
const routes = [{
  path:'',
  redirect: '/login'
},
{
  path: '/login',
  component: Login
},
{
  path:'/home',
  component: Home,
  redirect:'/welcome',
  children:[{
    path: '/welcome',
    component: Welcome
  },
  {
    path:'/users',
    component: User
  },
  {
    path:'/roles',
    component: Role
  },
  {
    path:'/rights',
    component: RightList
  },
  {
    path:'/goods',
    component: GoodList,
  },
  {
    path:'/goods/add',
    component: AddGood
  },
  {
    path:'/params',
    component: GoodParams
  },
  {
    path:'/categories',
    component:Categories
  },
  {
    path: '/orders',
    component: Order
  },
  {
    path:'/reports',
    component: Report
  }]
}]
const router = new VueRouter({
  routes,
  mode:'history'
})

//路由导航守卫
router.beforeEach((to,from,next)=>{
  //to:下一跳
  //from:从哪个路由跳转
  //next():下一跳跳转
  //如果访问的是login页面，直接放行
  if(to.path === '/login') return next()
  //sessionStorage中获取保存到的token值
  const tokenStr = window.sessionStorage.getItem('token');
  //没有token 强制跳转到登录界面
  if(!tokenStr) return next('/login');
  //如果没有token，直接跳转即可
  next();
})

//导出router
export default router