<template>
  <div class="login">
    <div class="login-content">
      <!-- 头像区域 -->
      <div class="login-logo">
        <img src="../../assets/img/login/login.png" alt="">
      </div>
      <!-- 表单区域 -->
      <el-form ref="loginFormRef" 
               class="login-form" 
               :model="loginForm" 
               :rules="loginRule">
        <el-form-item prop="username">
          <!-- input输入框 -->
          <el-input v-model="loginForm.username" placeholder="请输入内容" prefix-icon="el-icon-s-custom"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <!-- 密码输入框 -->
          <el-input placeholder="请输入密码" v-model="loginForm.password" show-password></el-input>
        </el-form-item>
        <!-- 按钮区域 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="loginIn">登录</el-button>
          <el-button type="info" @click="loginReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
//引入网络请求axios,login中使用post请求
import {postRequest} from '../../network/Request'
export default {
  name: "Login",
  data(){
    return {
      loginForm: {
        username: 'admin',
        password:'123456'
      },
      loginRule:{
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入登录密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    //事件点击
    //1.点击登录
    loginIn(){
      // console.log("我点击了");
      //首先判断用户名和密码是否合法
      this.$refs.loginFormRef.validate(valid=>{
        //1.1 如果输入的用户名和密码不合法，就不发送网络请求
        if(!valid) return
        //1.2 如果用户名和密码输入合法，就开始发送网络请求
        postRequest('login',this.loginForm).then(res=>{
          console.log(res);
          if(res.data.meta.status!==200){
            //1.2.1 如果验证失败
            return this.$message.error('登录失败');
          }
          //1.2.2 如果验证成功
          this.$message.success('登录成功');
          //1.3 登陆成功之后的token,保存到客户端的sessionStorage中，项目中出现了登录之外的其他API接口，必须在登陆之后才能访问，token只应在当前网页打开期间生效，所以token保存在sessionStorage中
          // console.log(window.sesstionStorage);  
          window.sessionStorage.setItem('token',res.data.data.token);
          //1.4 登陆成功之后，页面跳转到home组件中
          this.$router.push('/home');
        })
      })
      
    },
    //2.点击重置
    loginReset(){
      // console.log("点击重置");
      //表单重置按钮,resetFields对整个表单进行重置,将所有字段值重置为初始值并移除校验结果
      this.$refs.loginFormRef.resetFields();
    }
  }
}
</script>
<style scoped>
  .login {
    height: 100%;
    background-color: #002e4f;
  }
  .login-content {
    position: absolute;
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 5px;
    box-shadow: 0 10px 10px rgba(0,0,0,0.3);
    left: 50%;
    top: 50%;
    transform: translate(-50%,-50%);
  }
  .login-logo {
    position: absolute;
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background-color: #eee;
    box-shadow: 0 10px 10px rgba(0,0,0,0.3);
    left: 50%;
    top: -50px;
    transform: translate(-50%);
  }
  .login-logo img {
    width: 100px;
    height: 100px;
  }
  .login-form {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 0 20px;
  }
  .btns {
    display: flex;
    justify-content: flex-end;
  }
</style>