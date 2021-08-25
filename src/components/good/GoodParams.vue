<template>
 <div class="good-params">
     <!-- 面包屑导航区 -->
    <BreadCrumb>
      <span slot="center">商品管理</span>
      <span slot="right">参数列表</span>
    </BreadCrumb>
    <!-- 卡片视图区 -->
    <Card class="card">
        <!-- 警告条 -->
        <el-alert title="注意：只允许为第三级标题设置相关参数"
                  type="warning"
                  show-icon :closable="false">
        </el-alert>
        <el-row>
            <el-col>
                <span class="params-text">选择商品分类: </span>
                <!-- 选择商品分类的级联选择器 -->
                <el-cascader v-model="selectedKeys"
                             :options="paramsList"
                             :props="paramsProp"
                             @change="handleChange"></el-cascader>
            </el-col>
        </el-row>
        <el-tabs v-model="activeName" @click="handleTableClick">
          <el-tab-pane label="动态参数" name="many">
              <!-- 添加参数的按钮 -->
              <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addManyVisible=true">添加参数</el-button>
              <!-- 动态参数表格 -->
              <el-table :data="manyTableData"
                        border
                        style="width: 100%">
                <el-table-column type="expand">
                  <template slot-scope="scope">
                    <el-tag v-for="(item,index) in scope.row.attr_vals"
                            :key="index"
                            closable @close="handleClose(index,scope.row)">
                        {{item}}
                    </el-tag> 
                    <!-- 输入的文本 -->
                    <el-input class="input-new-tag" 
                              v-if="scope.row.inputVisible"
                              v-model="scope.row.inputValue" 
                              ref="saveTagInput" size="small" 
                              @keyup.enter.native="handleInputConfirm(scope.row)"
                              @blur="handleInputConfirm(scope.row)"></el-input> 
                    <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+New Tag</el-button>  
                  </template>
                </el-table-column>
                <el-table-column type="index"></el-table-column>
                <el-table-column prop="attr_name"
                                 label="参数名称">
                </el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" size='mini' @click="editParams(scope.row.attr_id)">编辑</el-button>
                        <el-button type="danger" icon="el-icon-delete" size='mini' @click="deleteParams(scope.row.attr_id)">删除</el-button>
                    </template>
                </el-table-column>
              </el-table>
          </el-tab-pane>
          <el-tab-pane label="静态属性" name="only">
              <!-- 添加属性按钮 -->
              <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addManyVisible=true">添加属性</el-button>

          </el-tab-pane>
        </el-tabs>
    </Card>
    <!-- 点击添加属性弹出的对话框 -->
    <el-dialog :title="'修改'+ titleText"
               :visible.sync="addManyVisible"
               width="50%">
        <el-form :model="addRuleForm" 
                 :rules="addRule" 
                 ref="addRuleFormRef" 
                 label-width="100px">
            <el-form-item :label="titleText" prop="attr_name">
                <el-input v-model="addRuleForm.attr_name"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="addManyVisible = false">取 消</el-button>
            <el-button type="primary" @click="addParams">确 定</el-button>
        </span>
    </el-dialog>
    <!-- 点击编辑弹出的对话框 -->
    <el-dialog :title="'编辑'+titleText"
               :visible.sync="editVisible"
                width="50%">
      <el-form ref="editFormRef" 
               :model="editForm" 
               :rules="editFormRules" 
               label-width="80px">
        <el-form-item :label="titleText" 
                      prop="attr_name">
            <el-input v-model="editForm.attr_name"></el-input>
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
//引入公共组件
import BreadCrumb from '../../common/breadcrumb/BreadCrumb'
import Card from '../../common/card/Card'
//引入方法
import {getRequest,putRequest,deleteRequest,postRequest} from '../../network/Request'
export default {
   name:'GoodParams',
   components:{
       BreadCrumb,
       Card
   },
   data(){
       return {
           //级联选择器双向绑定到的数组
        selectedKeys:[],
        //获取到的参数列表
        paramsList:[],
        paramsProp:{
            expandTrigger: 'hover',
            value:'cat_id',
            label:'cat_name',
            children:'children'
        },
        //被激活的标签
        activeName:'many',
        addManyVisible:false,
        manyTableData:[],
        onlyTableData:[],
        addRuleForm:{
            attr_name:''
        },
        addRule:{
            attr_name:[
              { required: true, message: '请输入参数名称', trigger: 'blur' }
            ]
        },
        editVisible:false,
        editForm:{},
        editFormRules:{
            attr_name:[
                { required: true, message: '请输入参数名称', trigger: 'blur' }
            ]
        }
       }
   },
   created(){
       this.getGoodParams();
   },
   methods:{
     getGoodParams(){
         getRequest('categories').then(res=>{
             console.log(res);
             if(res.data.meta.status!==200){
                 return this.$message.error('获取分类参数失败');
             }
             this.$message.success('获取分类参数成功！');
             this.paramsList=res.data.data;
         })
     },
     //2.级联选择器选项发生改变
     handleChange(){
         this.getParamsData();
     },
     //3.点击切换Tab栏，更新数据
     handleTableClick(){
         this.getParamsData();
     },
     //4.参数列表数据
     getParamsData(){
         console.log(this.selectedKeys);
         //判断选中的不是三级菜单
         if(this.selectedKeys.length!==3){
             this.selectedKeys=[];
             this.manyTableData=[];
             this.onlyTableData=[];
             return
         }
         //根据所选的id和当前所处的面板，获取对应的参数
        getRequest(`categories/${this.catedId}/attributes`,{sel:this.activeName}).then(res=>{
            console.log(res);
            if(res.data.meta.status!==200){
              return this.$message.error('获取参数失败');       
            }
            // this.$message.success('获取参数成功！');
            res.data.data.forEach(item=>{
                //split把一个字符串分割成字符串数组
                item.attr_vals=item.attr_vals?item.attr_vals.split(' '):[];
                //控制文本的显示与隐藏
                item.inputVisible=false;
                //文本框输入的值
                item.inputValue='';
            })
            if(this.activeName==='many'){
                this.manyTableData= res.data.data;
            }else {
                this.onlyTableData=res.data.data;
            }
        })
     },
     //5.点击展开栏中标签中的X删除对应的版式
     handleClose(index,row){
         row.attr_vals.splice(index,1);
        this.confirmEdit();
     },
     handleInputConfirm(row){
         if(row.inputValue.trim().length===0){
             row.inputValue='';
             row.inputVisible=false;
             return 
         }
         //如果没有return 证明输入了内容 需要做后续处理
        row.attr_vals.push(row.inputValue.trim());
        row.inputVaue='';
        row.inputVisible=false;
     },
     showInput(row){
         row.inputVisible=true;
         this.$nextTick(_=>{
             this.$refs.saveTagInput.$refs.input.focus();
         })
     },
     //添加参数
     addParams(){
         this.addManyVisible=false;
         postRequest(`categories/${this.catedId}/attributes`,{
             attr_name:this.addRuleForm.attr_name,
             attr_sel:this.activeName,
             attr_vals:this.addRuleForm.attr_vals
         }).then(res=>{
             console.log(res);
             if(res.data.meta.status!==200){
                 return this.$message.error('添加参数失败');
             }
             this.$message.success('添加参数成功！');
            this.getGoodParams();
         })
     },
     //编辑动态参数
     editParams(attrId){
         this.editVisible=true;
         getRequest(`categories/${this.catedId}/attributes/${attrId}`).then(res=>{
             console.log(res);
             if(res.data.meta.status!==200){
                 return this.$message.error('获取参数信息失败');
             }
             this.editForm=res.data.data;
         })
     },
     //确定编辑提交
     confirmEdit(){
         this.editVisible=false;
         this.$refs.editFormRef.validate(valid=>{
             if(!valid) return
            putRequest(`categories/${this.catedId}/attributes/${this.editForm.attr_id}`,{
                attr_name:this.editForm.attr_name,
                attr_sel:this.activeName}
            ).then(res=>{
                console.log(res);
                if(res.data.meta.status!==200){
                    return this.$message.error('编辑信息提交失败');
                }
                this.$message.success('编辑信息提交成功');
            })
         })
     },
     //删除
     deleteParams(attrId){
         deleteRequest(`categories/${this.catedId}/attributes/${attrId}`).then(res=>{
             console.log(res);
             if(res.data.meta.status!==200){
                 return this.$message.error('删除失败');
             }
             this.$message.success('删除成功！');
         })
     }

   },
   computed:{
       isBtnDisabled(){
           if(this.selectedKeys.length!==3) return true
           return false
       },
       //当前选中三级菜单的id
       catedId(){
           //当前选中是三级菜单的话
           if(this.selectedKeys.length===3){
               //返回id值，最后一个参数的id值就是长度-1，因为长度为3，所以需要返回2
               return this.selectedKeys[2];
           }
           return null;
       },
       titleText(){
           if(this.activeName==="many"){
               return "动态参数"
           }
           return "静态属性"
       }
   }
}
</script>
<style scoped>
.card {
    margin-top: 15px;
}
.el-row {
    margin-top: 15px;
}
.params-text{
    margin-right: 10px;
}
.el-tag {
    margin: 7px 7px;
}
.input-new-tag {
    width: 120px;
}
</style>