import {request} from './index'
//get请求
export function getRequest(url,params){
    return request({
        method: 'get',
        url:url,
        params:params
    })
}
//post请求
export function postRequest(url,data){
    //注意post请求，这里需要写data,而不是params
    return request({
        method: 'post',
        url:url,
        data:data
    })
}
//put请求
export function putRequest(url,data){
    return request({
        //注意：方法要写成method不是methods!!!
        //put方法中传的参数也是data
        method: 'put',
        url:url,
        data:data
    })
}
//delete请求
export function deleteRequest(url) {
    return request({
        method: 'delete',
        url:url
    })
}