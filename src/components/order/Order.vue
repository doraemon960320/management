<template>
    <div class="order">
        <!--面包屑导航区-->
      <bread-crumb>
        <span slot="center">订单管理</span>
        <span slot="right">订单列表</span>
      </bread-crumb>
      <!-- 卡片视图区 -->
      <card class="card">
          <!-- 顶部搜索框 -->
            <el-input placeholder="请输入内容" 
                  v-model="queryInfo.query" 
                  clearable 
                  @clear="getOrderList"
                  class="input-with-select">
            <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
        </el-input>
        <!-- table表格 -->
        <el-table :data="orderList"
                  border
                  style="width: 100%">
          <el-table-column type="index">
          </el-table-column>
          <el-table-column prop="order_number"
                           label="订单编号">
          </el-table-column>
          <el-table-column prop="order_price"
                           label="订单价格">
          </el-table-column>
          <el-table-column prop="pay_status"
                           label="是否付款">
            <template slot-scope="scope">
                <el-tag v-if="scope.row.pay_status==='0'" type="danger">未付款</el-tag>
                <el-tag type="success" v-else>已付款</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="is_send"
                           label="是否发货">
          </el-table-column>
          <el-table-column prop="create_time"
                           label="下单时间">
            <template slot-scope="scope">
                {{scope.row.create_time | formatTime}}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="260">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="editClick(scope.row.user_id)"></el-button>
              <el-button type="success" icon="el-icon-location" size="mini" @click="showProgressBox"></el-button>
              </template>
              
          </el-table-column>
        </el-table>
        <!-- 分页 -->
         <el-pagination @size-change="handleSizeChange"
                        @current-change="handleCurrentChange"
                        :current-page="this.queryInfo.pagenum"
                        :page-sizes="[5,10,15,20]"
                        :page-size="this.queryInfo.pagesize"
                        layout="total, sizes, prev, pager, next, jumper"
                        :total="total">
        </el-pagination>
      </card>
      <!-- 点击编辑按钮，弹出的对话框 -->
      <el-dialog title="修改地址"
                 :visible.sync="editVisible"
                  width="50%" @close="editClose">
       <el-form :model="editRuleForm" 
                :rules="editRules" 
                ref="editRuleFormRef" 
                label-width="100px">
        <el-form-item label="省市区/县" prop="addr1">
            <el-cascader v-model="editRuleForm.addr1"
                         :options="cityData">
            </el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="addr2">
            <el-input v-model="editRuleForm.addr2"></el-input>
        </el-form-item>
       </el-form>
       <span slot="footer" class="dialog-footer">
         <el-button @click="editVisible = false">取 消</el-button>
         <el-button type="primary" @click="editVisible = false">确 定</el-button>
       </span>
      </el-dialog>
      <!-- 展示物流进度对话框 -->
      <el-dialog title="物流进度"
                 :visible.sync="showVisible"
                 width="50%">
        <!-- 时间线timeline -->
        <el-timeline :reverse="false">
          <el-timeline-item v-for="(activity, index) in progressInfo"
                            :key="index"
                            :timestamp="activity.timestamp">
                {{activity.content}}
          </el-timeline-item>
        </el-timeline>
        <span slot="footer" class="dialog-footer">
          <el-button @click="showVisible = false">取 消</el-button>
          <el-button type="primary" @click="showVisible = false">确 定</el-button>
        </span>
      </el-dialog>
    </div>
</template>
<script>
//引入公共组件
import BreadCrumb from '../../common/breadcrumb/BreadCrumb'
import Card from '../../common/card/Card'
//引入方法
import {getRequest} from '../../network/Request'
import cityData from './citydata'
export default {
    name:'Order',
    components:{
        BreadCrumb,
        Card
    },
    data(){
        return {
            //获取订单列表的参数
            orderList:[],
            total:0,
            queryInfo:{
                query:'',
                pagenum:1,
                pagesize: 5,
                user_id:'',
                pay_status:'',
                is_send:'',
                order_fapiao_title:[],
                order_fapiao_company:'',
                order_fapiao_content:'',
                consignee_addr:''
            },
            //编辑
            editVisible:false,
            editRuleForm:{
                addr1:[],
                addr2:''
            },
            editRules:{
                addr1:[
                  { required: true, message: '请选择省市区/县', trigger: 'blur' }
                ],
                addr2:[
                  { required: true, message: '请选择省市区/县', trigger: 'blur' }
                ]
            },
            cityData:cityData,
            //物流进度
            showVisible:false,
            progressInfo:[
                {
                    content: '已签收，感谢您的支持，期待下次使用',
                    timestamp:'2018-05-03 21:00:00'
                },
                {
                    content:'[北京市]北京市海淀区派件员正在派件',
                    timestamp:'2018-05-03 18:00:00'
                },
                {
                    content:'[北京市]北京市物流中转',
                    timestamp:'2018-05-02 05:00:00'
                }
            ]
        }
    },
    created(){
        this.getOrderList();
    },
    methods: {
        //1.获取订单列表
        getOrderList(){
            getRequest('orders',this.queryInfo).then(res=>{
                console.log(res);
                if(res.data.meta.status!==200){
                    return this.$message.error('获取订单列表失败');
                }
                this.orderList=res.data.data.goods;
                this.total = res.data.data.total;
            })
        },
        //2.更新每页显示条数
        handleSizeChange(newSize){
            this.queryInfo.pagesize = newSize;
            this.getOrderList();
        },
        //3.更新当前页码
        handleCurrentChange(newPage){
            this.queryInfo.pagenum = newPage;
            this.getOrderList();
        },
        //4.点击编辑按钮
        editClick(id){
            this.editVisible=true;
        },
        //5.关闭编辑对话框
        editClose(){
            this.$refs.editRuleFormRef.resetFields();
        },
        //6.点击位置信息对话框 
        showProgressBox(){
            this.showVisible=true;
        }
        
    },
    filters:{
        formatTime(value){
            var date = new Date(value*1000);
            let y = date.getFullYear();
            let m = date.getMonth()+1;
            m = m<10? '0'+m:m;
            let dd = date.getDate();
            dd = dd<10? '0'+dd:dd;
            let hh = date.getHours();
            hh = hh < 10 ? "0" + hh : hh;
            let mm = date.getMinutes();
            mm = mm<10?'0'+mm:mm;
            let ss = date.getSeconds();
            ss=ss<10? '0'+ss:ss;
            return y+"-"+m+"-"+dd+" "+hh+":"+mm+":"+ss;
        }
    }
}
</script>
<style scoped>
.card {
    margin-top: 15px;
}
.input-with-select {
    width: 400px;
}
.el-table {
    margin: 15px 0;
}
</style>