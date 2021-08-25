import axios from 'axios'

//axios是一个基于promise的HTTP库

export function request(config){
    //1. 自定义实例默认值，创建实例，设置全局的 axios 默认值
    const instance = axios.create({
        baseURL: 'http://127.0.0.1:8888/api/private/v1/',
        // baseURL:'http://106.53.73.30:8888/api/private/v1/',
        timeout: 5000
    })
//2. axios拦截器
//2.1 请求拦截
    instance.interceptors.request.use(config=>{
        //请求头对象，添加Token验证的Authorization字段
        //headers 是即将被发送的自定义请求头
        //token用来保存状态,HTTP协议是无状态的
        config.headers.Authorization = window.sessionStorage.getItem('token')
        //这里必须有返回值
        return config
    })
    //2.2 响应拦截
    instance.interceptors.response.use(config=>{
        return config
    })
    //3.发送真正的网络请求
    return instance(config)
}