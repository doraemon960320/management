<template>
  <div class="role">
      <!-- 面包屑导航区 -->
    <BreadCrumb>
    <span slot="center">角色管理</span>
    <span slot="right">角色列表</span>
    </BreadCrumb>
    <!-- 卡片视图区 -->
    <Card class="card">
        <!-- 添加角色按钮 -->
        <el-row>
          <el-col>
            <el-button type="primary" @click="addRoleVisible=true">添加角色</el-button>
          </el-col>
        </el-row>
        <!-- 表格区域 -->
        <el-table :data="roleList"
                  stripe
                  style="width: 100%" 
                  border>
                  <!--第一列： 左侧展开栏列表 -->
          <el-table-column type="expand">
            <template slot-scope="scope">
                <el-row v-for="(item,index) in scope.row.children" 
                        :key="index" 
                        :class="['bdbottom',index === 0 ? 'bdtop':'','vcenter']">
                <!-- 一级标签 -->
                  <el-col :span="5">
                      <el-tag closable @close="removeRoleTag(scope.row.id,item.id)">{{item.authName}}</el-tag>
                      <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 二级标签 -->
                  <el-col :span="19">
                    <el-row v-for="(item2,index2) in item.children" 
                              :key="index2" :class="[index2===0 ?'':'bdtop','vcenter']">
                      <el-col :span="6">
                          <el-tag closable 
                                  type="success" 
                                  @close="removeRoleTag(scope.row.id,item2.id)">{{item2.authName}}</el-tag>
                          <i class="el-icon-caret-right"></i>
                      </el-col>
                      <!-- 三级标签 -->
                       <el-col :span="18">
                          <el-tag closable 
                                  type="warning" 
                                  v-for="(item3,index3) in item2.children" :key="index3" 
                                  @close="removeRoleTag(scope.row.id,item3.id)">
                              {{item3.authName}}
                          </el-tag>
                       </el-col>
                    </el-row>
                  </el-col>
                </el-row>
            </template>
          </el-table-column>
          <!--第二列： 索引值列 -->
          <el-table-column type="index" 
                           label="#" 
                           width="100"></el-table-column>
          <!-- 第三列 -->
          <el-table-column prop="roleName"
                           label="角色名称"
                           width="200">
          </el-table-column>
          <!-- 第四列 -->
          <el-table-column prop="roleDesc"
                           label="角色描述"
                           width="200">
          </el-table-column>
          <!-- 第五列 -->
          <el-table-column label="操作" width='300'>
            <template slot-scope="scope">
              <el-button type="primary" 
                         icon="el-icon-edit" 
                         size="mini" 
                         @click="editRole(scope.row.id)">编辑</el-button>
              <el-button type="danger" 
                         icon="el-icon-delete" 
                         size="mini" @click="deleteRole(scope.row.id)">删除</el-button>
              <el-button type="warning" 
                         icon="el-icon-setting" 
                         size="mini" @click="setClick(scope.row.id)">分配权限</el-button>
            </template>
          </el-table-column>
        </el-table>
    </Card>
    <!-- 点击添加角色对话框 -->
    <el-dialog title="提示"
               :visible.sync="addRoleVisible"
               width="50%">
      <el-form ref="addRoleRef" 
               :model="addRoleForm"
               label-width="80px">
        <el-form-item label="角色名称">
        <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
        <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 点击编辑，弹出编辑对话框 -->
    <el-dialog title="提示"
               :visible.sync="editVisible"
               width="50%" @close="editClose">
      <el-form :model="editForm" 
               :rules="editRule" 
               ref="editFormRef"      
               label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveEdit(editRoleId)">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 点击分配权限，弹出分配权限对话框 -->
    <el-dialog title="分配权限"
               :visible.sync="setVisible"
               width="50%" @close="setRoleClose">
      <el-tree :data="rightList"
               show-checkbox
               node-key="id"
               default-expanded-all
               :default-checked-keys="defKeys"
               :props="defaultProps" 
               ref="treeRef">
      </el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setVisible = false">取 消</el-button>
        <el-button type="primary" @click="allowRight">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
//引入公共组件
import BreadCrumb from '../../../common/breadcrumb/BreadCrumb'
import Card from '../../../common/card/Card'
//引入方法
import {getRequest,postRequest,putRequest,deleteRequest} from '../../../network/Request'
export default {
    name:'Role',
    components:{
        BreadCrumb,
        Card
    },
    data(){
        return {
            //角色列表
            roleList:[],
            //添加角色对话框的显示与隐藏布尔值
            addRoleVisible:false,
            addRoleForm:{
                roleName:'',
                roleDesc:''
            },
            //编辑角色
            editVisible:false,
            editForm:{
                roleName:'',
                roleDesc:''
            },
            editRule:{
                roleName:[
                    { required: true, message: '请输入角色名称', trigger: 'blur' }
                ]
            },
            editRoleId:'',
            //分配权限
            setVisible:false,
            roleId:''  ,
            rightList:[],
            defKeys:[],
            defaultProps:{
              children:'children',
              label:'authName'
            }
        }
    },
    created(){
      this.getRoleList();
    },
    methods:{
    //1.获取表格中的角色列表数据
      getRoleList(){
        getRequest('/roles').then(res=>{
            console.log(res);
            if(res.data.meta.status!==200){
                return this.$message.error('获取角色列表失败');
            }
            //如果获取角色列表成功
            this.roleList = res.data.data;
        })
      },
      //2. 点击添加角色按钮，输入好角色名称和角色描述后点击确定按钮，确定添加角色
      addRole(){
        postRequest('roles',this.addRoleForm).then(res=>{
            console.log(res);
            if(res.data.meta.status!==201){
                return this.$message.error('添加角色失败');
            }
            this.$message.success('添加角色成功');
            this.addRoleVisible=false;
            //角色添加之后重新刷新角色列表
            this.getRoleList();
        })
      },
      //3.点击编辑，查询角色
      editRole(id){
         getRequest('roles/'+id).then(res=>{
             console.log(res);
             if(res.data.meta.status!==200){
                 return this.$message.error('获取角色信息失败');
             }
             this.$message.success('获取角色信息成功！');
             this.editVisible=true;
             this.editRoleId = id;
            //  console.log(this.roleId);
         })
      },
      //4.编辑框关闭，重置表单
      editClose(){
          this.$refs.editFormRef.resetFields();
      },
      //5.点击编辑弹框中的确定按钮，提交编辑信息
      saveEdit(id){
        // console.log(this.roleId);
        putRequest('roles/'+id,this.editForm).then(res=>{
            console.log(res);
            if(res.data.meta.status!==200){
                return this.$message.error('编辑角色信息失败');
            }
            this.$message.success('编辑角色信息成功');
            this.editVisible=false;
            this.getRoleList();
        })
      },
      //6.点击删除,删除角色
      deleteRole(id){
        //删除信息确认
         this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(config=>{
          console.log(config);
          if(config==='confirm'){
            //点击确定删除按钮，删除角色
            deleteRequest('roles/'+id).then(res=>{
              console.log(res);
              if(res.data.meta.status!==200){
                return this.$message.error('删除角色失败');
              }
              this.$message.success('删除角色成功');
              //刷新列表
              this.getRoleList();
            })
          }
        }).catch(err=>{
          console.log(err);
          if(err==='cancel'){
            return this.$message.info('已取消删除');
          }
        })
      },
      //7.分配权限
      setClick(id){
        this.roleId = id;
        getRequest('rights/tree').then(res=>{
          console.log(res);
          if(res.data.meta.status!==200){
            return this.$message.error('获取权限信息失败');
          }
          this.$message.success('获取权限信息成功');
          this.setVisible=true;
          this.rightList=res.data.data;
        })
      },
      //8.角色授权,点击确定按钮，进行角色授权
      allowRight(){
        const keys = [
          ...this.$refs.treeRef.getCheckedKeys(),
          ...this.$refs.treeRef.getHalfCheckedKeys()
        ];
        const idStr = keys.join(',');
        postRequest(`roles/${this.roleId}/rights`,{rids:idStr}).then(res=>{
          console.log(res);
          if(res.data.meta.status!==200){
            this.$message.error('更新失败');
          }
          this.$message.success('更新成功');
          this.setVisible=false;
          this.getRoleList();
        })
      },
      //9.监听分配权限的关闭事件，清空选中节点
      setRoleClose(){
        this.defKeys=[];
      },
      //10.删除角色指定权限
      removeRoleTag(roleId,rightId){
        deleteRequest(`roles/${roleId}/rights/${rightId}`).then(res=>{
          console.log(res);
          if(res.data.meta.status!==200){
            return this.$message.error('删除权限失败');
          }
          this.$message.success('删除权限成功');
          this.getRoleList();
        })
      }
    }
}
</script>
<style scoped>
 .card {
     margin-top: 15px;
 }
 .el-button {
     margin-bottom: 15px;
 }
 .bdbottom {
     border-bottom: 1px solid #eee;
 }
 .bdtop {
     border-top: 1px solid #eee;
 }
 .vcenter {
     display: flex;
     align-items: center;
 }
 .el-tag {
     margin: 7px 7px;
 }
</style>