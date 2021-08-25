<template>
  <div class="report">
      <!-- 面包屑导航区 -->
      <bread-crumb>
        <span slot="center">数据统计</span>
        <span slot="right">数据报表</span>
      </bread-crumb>
        <!-- 卡片视图区 -->
      <card class="card">
          <!-- 为 ECharts 准备一个具备大小（宽高）的 DOM -->
         <div id="main" style="width: 800px;height:450px;"></div>
      </card>
  </div>
</template>
<script>
//引入公共组件
import BreadCrumb from '../../common/breadcrumb/BreadCrumb'
import Card from '../../common/card/Card'
//引入方法
import {getRequest} from '../../network/Request'
//引入echarts
import * as echarts from 'echarts';
import _ from 'lodash'
export default  {
    name:'Report',
    components:{
        BreadCrumb,
        Card
    },
    data(){
        return {
             // 指定图表的配置项和数据
        options:{
          title: {
            text: '用户来源'
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross',
              label: {
                backgroundColor: '#E9EEF3'
              }
            }
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: [
            {
              boundaryGap: false
            }
          ],
          yAxis: [
            {
              type: 'value'
            }
          ]
        }
        }
    },
    mounted(){
         // 基于准备好的dom，初始化echarts实例
        var myChart = echarts.init(document.getElementById('main'));
        getRequest('/reports/type/1').then(res=>{
            console.log(res);
            if(res.data.meta.status!==200){
                return this.$message.error('获取数据列表失败');
            }
             //指定图标的配置项和数据
        const result = _.merge(res.data.data,this.options);
        // 使用刚指定的配置项和数据显示图表。
        myChart.setOption(result);
        })
       
    }
}
</script>
<style scoped>
.card {
    margin-top: 15px;
}
</style>