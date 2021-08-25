<template>
  <div class="home">
    <!-- container布局容器 -->
    <el-container>
      <!-- 头部导航栏 -->
      <el-header>
        <div class="header-logo">
          <img src="../../assets/img/home/heima.png" alt="">
          <span class="header-text">电商后台管理系统</span>
        </div>
        <div class="btn">
          <el-button type="info" @click="backClick">退出</el-button>
        </div>
      </el-header>
      <el-container>
        <!-- 侧边栏 -->
        <el-aside :width="isCollapse ? '64px' : '200px'">
          <div class="aside-content" @click="collapseClick">|||</div>
          <el-menu background-color="#303641"
                   text-color="#fff"
                   active-text-color="#409BFF"
                   unique-opened
                   :collapse="isCollapse"
                   :collapse-transition="false"
                   :router="true"
                   :default-active="activePath">
              <el-submenu v-for="(item,index) in menuList" 
                          :key="index"
                          :index = " index+'' ">
                  <template slot="title">
                    <i :class="isObjectIcon[index]"></i>
                    <span>{{item.authName}}</span>
                   </template>
                   <el-menu-item-group>
                      <el-menu-item v-for="(subItem,subIndex) in item.children"      :key="subIndex" :index="'/'+subItem.path" @click="itemClick('/'+subItem.path)">
                        <i class="el-icon-menu"></i>
                        <span>{{subItem.authName}}</span>      
                      </el-menu-item>
                   </el-menu-item-group>
              </el-submenu>
            </el-menu>
        </el-aside>
        <!-- 中间区域 -->
        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>
<script>
import {getRequest} from '../../network/Request'
export default {
    name: 'Home',
    data(){
      return {
        //1.判断是否水平折起菜单,默认值设置为false
        isCollapse: false,
        //2.menuList菜单列表
        menuList:[],
        //3.小图标的类名
        isObjectIcon:{
          '0':'el-icon-s-custom',
          '1':'el-icon-s-tools',
          '2':'el-icon-present',
          '3':'el-icon-document-copy',
          '4':'el-icon-data-line'
        },
        //4.default-active="activePath"是当前激活菜单的 index
        activePath:''
      }
    },
    created(){
      this.getMenuList();
      //组件一创建就在sessionStotage中取值，赋值给activePath
      this.activePath = window.sessionStorage.getItem("activePath");
    },
    methods:{
     //1 点击导航栏上的退出，返回上一层路由
     backClick(){
       //1.1 清空token
       window.sessionStorage.clear();
       //1.2 在首页点击退出按钮，返回到登录界面
      this.$router.back();
     },
     //2.获取左侧侧边栏数据
     getMenuList(){
       getRequest('menus').then(res=>{
        //  console.log(res);
         if(res.data.meta.status!==200){
           return this.$message.error("获取列表数据失败");
         }
         this.menuList = res.data.data;
       })
     },
     //3.点击导航栏上的|||，折叠菜单栏
     collapseClick(){
       this.isCollapse = !this.isCollapse;
     },
     //4.点击对应的导航栏标签
     itemClick(activePath){
       //保存链接的激活状态'activePath'是键，activePath是值
       window.sessionStorage.setItem('activePath',activePath);
       this.activePath = activePath;
     }
    }
}
</script>
<style scoped>
  .home {
    height: 100%;
  }
  .el-container {
    height: 100%;
  }
  .el-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #353c3e;
  }
  .header-logo img {
    vertical-align: middle;
  }
  .header-text {
    font-size: 20px;
    color: #fff;
    margin-left: 20px;
  }
  .el-aside {
    background-color: #303641;
  }
  .aside-content {
    height: 24px;
    line-height: 24px;
    font-size: 10px;
    text-align: center;
    color: #fff;
    background-color: #4A5064;
    letter-spacing: 0.2em;
    cursor: pointer;
  }
  .el-main {
    background-color: #e8ecef;
  }
  .el-menu {
    border-right: 0;
  }
</style>
