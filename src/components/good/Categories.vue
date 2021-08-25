<template>
  <div class="categories">
      <!-- 面包屑导航区 -->
      <BreadCrumb>
        <span slot="center">分类管理</span>
        <span slot="right">分类列表</span>
      </BreadCrumb>
      <!-- 卡片视图区 -->
      <Card class="card">
          <!-- 顶部按钮区 -->
          <el-row>
              <el-col>
                  <el-button type="primary" @click="addCategory">添加分类</el-button>
              </el-col>
          </el-row>
          <!-- 表格数据区 -->
          <table-tree class="table-tree" 
                      :data="cateList" 
                      :columns="columns" 
                      :selection-type="false" 
                      :expand-type="false" 
                      show-index 
                      index-text="#"
                      border 
                      :show-row-hover="false">
            <template slot="isok" slot-scope="scope">
                <i class="el-icon-success" style="color:#67C23A" v-if="scope.row.cat_deleted===false"></i>
                <i class="el-icon-error" style="color:#F56C6C" v-else></i>
            </template>
            <template slot="orderd" slot-scope="scope">
              <el-tag v-if="scope.row.cat_level===0">一级</el-tag>
              <el-tag type="success" v-else-if="scope.row.cat_level===1">二级</el-tag>
              <el-tag type="warning" v-else>三级</el-tag>
            </template>
            <template slot="setting" slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="editCate(scope.row.cat_id)">编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteCate(scope.row.cat_id)">删除</el-button>
            </template>
          </table-tree>
         <!-- 底部页码条 -->
          <el-pagination @size-change="handleSizeChange"
                         @current-change="handleCurrentChange"
                         :current-page="queryInfo.pagenum"
                         :page-sizes="[5,10,15,20]"
                         :page-size="queryInfo.pagesize"
                         layout="total, sizes, prev, pager, next, jumper"
                         :total="total">
         </el-pagination>
      </Card>
      <!-- 点击添加分类弹出的对话框 -->
      <el-dialog title="添加商品分类"
                 :visible.sync="addCategoryVisible"
                 width="50%" @close="addCateClose">
        <el-form :model="addRuleForm" 
                 :rules="addRule" 
                 ref="addRuleFormRef" 
                 label-width="100px">
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="addRuleForm.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="父级分类:">
            <el-cascader v-model="selectKeyValue"
                         :options="parentCateList"
                         :props="selectedProps"
                         @change="handleChange" 
                         clearable></el-cascader>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addCategoryVisible = false">取 消</el-button>
          <el-button type="primary" @click="confirmAddCate">确 定</el-button>
        </span>
     </el-dialog>
     <!-- 点击编辑弹出的对话框 -->
     <el-dialog title="编辑分类"
                :visible.sync="editVisible"
                 width="50%">
        <el-form ref="editFormRef" :model="editForm" label-width="80px">
          <el-form-item label="分类名称">
           <el-input v-model="editForm.cat_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editVisible = false">取 消</el-button>
          <el-button type="primary" @click="confirmEdit">确 定</el-button>
        </span>
     </el-dialog>
  </div>
</template>
<script>
// 引入公共组件
import BreadCrumb from '../../common/breadcrumb/BreadCrumb'
import Card from '../../common/card/Card'
// 引入方法
import {getRequest,postRequest,putRequest,deleteRequest} from '../../network/Request'
export default {
    name:'Categories',
    components: {
       BreadCrumb,
       Card
    },
    data(){
        return {
            cateList:[],
            queryInfo:{
                type:3,
                pagenum:1,
                pagesize:5
            },
            total:0,
            columns:[
              {
                label:'分类名称',
                prop:'cat_name'
              },
              {
                label:'是否有效',
                type:'template',
                template:'isok'
              },
              {
                label:'排序',
                type:'template',
                template:'orderd'
              },
              {
                label:'操作',
                type:'template',
                template:'setting'
              }
            ],
            //添加分类
            addCategoryVisible:false,
            addRuleForm:{},
            addRule:{
                cat_name:[
                    { required: true, message: '请输入分类名称', trigger: 'blur' }
                ]
            },
            selectKeyValue:[],
            parentCateList:[],
            selectedProps:{
                expandTrigger:'hover',
                label:'cat_name',
                value:'cat_id',
                childern:'children',
                //是否严格的遵守父子节点不互相关联
                checkStrictly:true
            },
            //编辑
            editVisible:false,
            confirmEitId:0,
            categoryInfo:{
                cat_name:''
            },
            editForm:{
                cat_name:''
            }
        }
    },
    created(){
        this.getCateList();
    },
    methods: {
        //1.获取分类商品数据
        getCateList(){
            getRequest('categories',this.queryInfo).then(res=>{
                console.log(res);
                if(res.data.meta.status!==200){
                    return this.$message.error('获取商品分类数据失败');
                }
                this.cateList=res.data.data.result;
                this.total=res.data.data.total;
            })
        },
        //2.监听每页显示条数变化
        handleSizeChange(newSize){
            this.queryInfo.pagesize = newSize;
            //更新完之后刷新列表数据
            this.getCateList();
        },
        //3.监听页码改变
        handleCurrentChange(newPage){
            this.queryInfo.pagenum = newPage;
            //更新完之后刷新列表数据
            this.getCateList();
        },
        //4.添加分类
        addCategory(){
            this.addCategoryVisible=true;
            this.getParentCateList();
        },
        //5.获取二级菜单
        getParentCateList(){
            getRequest('categories',{type:2}).then(res=>{
                console.log(res);
                if(res.data.meta.status!==200){
                    return this.$message.error('获取二级商品分类失败');
                }
                this.parentCateList=res.data.data;
            })
        },
        //6.添加分类中级联选择器的变化
        handleChange(){
            console.log(this.selectKeyValue);
            if(this.selectKeyValue.length>0){
                //父级分类的id
                this.addRuleForm.cat_pid=this.selectKeyValue[this.selectKeyValue.length-1];
                this.addRuleForm.cat_level=this.selectKeyValue.length-1;
            }else {
                this.addRuleForm.cat_pid=0;
                this.addRuleForm.cat_level=0;
            }
        },
        //7.点击添加分类对话框的确定按钮，完成添加
        confirmAddCate(){
            this.addCategoryVisible=false;
            postRequest('categories',this.addRuleForm).then(res=>{
                console.log(res);
                if(res.data.meta.status!==200){
                    return this.$message.error('添加商品分类失败');
                }
                this.$message.success('添加商品分类成功！');
                this.getCateList();
            })
        },
        //8.关闭弹出框
        addCateClose(){
            this.$refs.addRuleFormRef.resetFields();
            this.selectKeyValue=[];
            this.addRuleForm.cat_level=0;
            this.addRuleForm.cat_pid=0;
        },
        //9.点击编辑实现的操作
        editCate(id){
            this.confirmEitId=id;
          getRequest('categories/'+id).then(res=>{
              console.log(res);
              if(res.data.meta.status!==200){
                  return this.$message.error('编辑商品分类失败');
              }
              this.editVisible=true;
          })
        },
        //10.点击编辑弹出框上的确定按钮，确定提交编辑
        confirmEdit(){
            this.editVisible=false;
            putRequest('categories/'+this.confirmEitId,{cat_name:this.editForm.cat_name}).then(res=>{
                console.log(res);
                if(res.data.meta.status!==200){
                    return this.$message.error('编辑提交失败');
                }
                this.$message.success('编辑提交成功');
                this.getCateList();
            })
        },
        //11.点击删除，删除对应商品分类
        deleteCate(id){
            deleteRequest('categories/'+id).then(res=>{
                console.log(res);
                if(res.data.meta.status!==200){
                    return this.$message.error('删除商品分类失败');
                }
                this.$message.success('删除商品分类成功');
                this.getCateList();
            })
        }
    }
}
</script>
<style scoped>
.card {
    margin-top: 15px;
}
.table-tree {
    margin-top: 15px;
}
</style>