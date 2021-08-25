<template>
    <div class="good-list">
    <!-- 面包屑导航 -->
      <BreadCrumb>
        <span slot="center">商品管理</span>
        <span slot="right">商品列表</span>
      </BreadCrumb>
      <!-- 卡片视图区 -->
      <Card class="card">
          <!-- 顶部搜索框 -->
        <el-input placeholder="请输入内容" 
                  v-model="queryInfo.query" 
                  clearable
                  @clear = "getGoodList" 
                  class="input-with-select">
          <el-button slot="append" icon="el-icon-search" @click="getGoodList"></el-button>
        </el-input>
        <!-- 添加商品按钮 -->
        <el-button type="primary" @click="addGood">添加商品</el-button>
        <!-- 表格数据 -->
        <el-table :data="goodList"
                  style="width: 100%">
          <el-table-column type="index" 
                           label="#">
          </el-table-column>
          <el-table-column prop="goods_name"
                           label="商品名称"
                           width="380">
          </el-table-column>
          <el-table-column prop="goods_price"
                           label="商品价格(元)"
                           width="100">
          </el-table-column>
          <el-table-column prop="goods_weight"
                           label="商品重量" 
                           width="100">
          </el-table-column>
          <el-table-column prop="add_time"
                           label="创建时间" 
                           width="180">
            <template slot-scope="scope">
                <div>{{scope.row.add_time | formatTime}}</div>
            </template>
          </el-table-column>
          <el-table-column label="操作" 
                           width="180">
            <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="editGood(scope.row.goods_id)"></el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteGood(scope.row.goods_id)"></el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页 -->
        <el-pagination  @size-change="handleSizeChange"
                        @current-change="handleCurrentChange" 
                        :current-page="queryInfo.pagenum"
                       :page-sizes="[5,10,15,20]"
                       :page-size="queryInfo.pagesize"
                       layout="total, sizes, prev, pager, next, jumper"
                       :total="total">
        </el-pagination>
      </Card>
      <!-- 点击编辑按钮，弹出编辑对话框 -->
      <el-dialog title="编辑商品"
                 :visible.sync="editVisible"
                 width="50%" @close="editClose">
        <el-form ref="editFormRef" :model="editForm" label-width="80px">
          <el-form-item label="商品名称">
            <el-input v-model="editForm.goods_name"></el-input>
          </el-form-item>
          <el-form-item label="商品价格">
            <el-input v-model="editForm.goods_price"></el-input>
          </el-form-item>
          <el-form-item label="商品重量">
            <el-input v-model="editForm.goods_weight"></el-input>
          </el-form-item>
          <el-form-item label="商品数量">
            <el-input v-model="editForm.goods_number"></el-input>
          </el-form-item>
          <el-form-item label="商品分类">
            <el-input v-model="editForm.goods_cat"></el-input>
          </el-form-item>
        </el-form>
         <span slot="footer" class="dialog-footer">
           <el-button @click="editVisible = false">取 消</el-button>
           <el-button type="primary" @click="confirmEditGood">确 定</el-button>
         </span>
      </el-dialog>
    </div>
</template>
<script>
//引入公共组件
import BreadCrumb from '../../common/breadcrumb/BreadCrumb'
import Card from '../../common/card/Card'
//引入方法
import {getRequest,putRequest,deleteRequest} from '../../network/Request'
export default {
   name:'GoodList',
   components:{
       BreadCrumb,
       Card
   },
   data(){
     return {
      goodList:[],
      queryInfo:{
          query:'',
          pagenum: 1,
          pagesize: 10
      },
      total:0,
      //编辑商品
      editVisible:false,
      editForm:{},
      editItem:{
        goods_name:'',
        goods_price:0,
        goods_number:0,
        goods_weight:0,
        //商品所属的分类数组
        goods_cat:[],
        goods_introduce:'',
        pics:[],
        attrs:[]
      },
      editId:'',
     }
   },
   created(){
       this.getGoodList();
   },
   methods:{
     //1.获取商品列表数据
    getGoodList(){
      getRequest('goods',this.queryInfo).then(res=>{
          console.log(res);
          if(res.data.meta.status!==200){
              return this.$message.error('获取商品列表数据失败');
          }
          this.$message.success('获取商品列表数据成功');
          this.goodList = res.data.data.goods;
          this.total = res.data.data.total;
      })
    },
    //2.监听每页显示条数的改变
    handleSizeChange(newSize){
      this.queryInfo.pagesize=newSize;
      this.getGoodList();
    },
    //3.监听页码改变
    handleCurrentChange(newPage){
    this.queryInfo.pagenum = newPage;
    this.getGoodList();
    },
    //4.点击编辑按钮
    editGood(id){
      this.editId=id;
      getRequest('goods/'+id).then(res=>{
        console.log(res);
        if(res.data.meta.status!==200){
          return this.$message.error('获取商品信息失败');
        }
        this.$message.success('获取商品信息成功');
        this.editVisible=true;
      })
      
    },
    //5.点击编辑对话框中的确认，提价编辑信息
    confirmEditGood(){
      this.editVisible=false;
      putRequest('goods/'+this.editId,this.editForm).then(res=>{
        console.log(res);
        if(res.data.meta.status!==200){
          return this.$message.error('提交商品信息失败');
        }
        this.$message.success('提交商品信息成功');
        this.getGoodList();
      })
    },
    //6.关闭编辑对话框后清空表单数据
    editClose(){
      this.$refs.editFormRef.resetFields();
    },
    //7.点击删除，删除对应商品
    deleteGood(id){
      deleteRequest('goods/'+id).then(res=>{
        console.log(res);
        if(res.data.meta.status!==200){
          return this.$message.error('删除商品失败');
        }
        this.$message.success('删除商品成功！');
        this.getGoodList();
      })
    },
    //点击添加商品
    addGood(){
      this.$router.push('/goods/add');
    }
   },
   filters:{
    formatTime(value){
     let date = new Date(value*1000);
     let year = date.getFullYear();
     year = year < 10 ? '0' + year : year;
     let month = date.getMonth()+1;
     month = month < 10 ? '0' + month : month;
     let dates = date.getDate();
     dates = dates < 10 ? '0' + dates : dates;
     let hours = date.getHours();
     hours = hours < 10 ? '0' + hours : hours;
     let minutes = date.getMinutes();
     minutes = minutes < 10 ? '0' + minutes : minutes;
     let seconds = date.getSeconds();
     seconds = seconds < 10 ? '0' + seconds : seconds;
     return year+'-'+month+'-'+dates+' '+hours+':'+minutes+':'+seconds;s
    }
   }
}
</script>
<style scoped>
.input-with-select {
    width: 500px;
    margin-right: 15px;
}
.card {
    margin-top: 15px;
}
.el-table {
    margin-top: 20px;
}
</style>