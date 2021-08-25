<template>
  <div class="right-list">
     <!-- 面包屑导航 -->
    <BreadCrumb>
        <span slot="center">权限管理</span>
        <span slot="right">权限列表</span>
    </BreadCrumb>
    <!-- 卡片视图区 -->
    <Card class="card">
        <!-- 表格区域 -->
      <el-table :data="rightList"
                border
                style="width: 100%">
          <el-table-column type="index" label="#"></el-table-column>
          <el-table-column prop="authName"
                         label="权限名称"
                         width="180">
          </el-table-column>
          <el-table-column prop="path"
                         label="路径" 
                         width="180">
          </el-table-column>
          <el-table-column prop="level" 
                           label="权限等级" 
                           width="180">
         <!-- 自定义权限列表区域,这里放一个作用域插槽，自定义输出格式 -->
            <template slot-scope="scope">
                <el-tag v-if="scope.row.level==='0'">一级</el-tag>
                <el-tag v-else-if="scope.row.level==='1'" type="success">二级</el-tag>
                <el-tag v-else type="warning">三级</el-tag>
            </template>
          </el-table-column>
      </el-table>
    </Card>
  </div>
</template>
<script>
//引入公共组件
import BreadCrumb from '../../../common/breadcrumb/BreadCrumb'
import Card from '../../../common/card/Card'
//引入方法
import {getRequest} from '../../../network/Request'
export default{
   name:'RightList',
   components:{
       BreadCrumb,
       Card
   },
   data(){
       return {
         rightList:[]
       }
   },
   created(){
       this.getRightList();
   },
   methods:{
    getRightList(){
      getRequest('rights/list').then(res=>{
          console.log(res);
          if(res.data.meta.status!==200){
              return this.$message.error('获取权限列表失败');
          }
          this.$message.success('获取权限列表成功');
          this.rightList = res.data.data;
      })
    }  
   }
}
</script>
<style scoped>
    .card {
        margin-top: 15px;
    }
    .el-table {
        margin-top: 15px;
    }
</style>