<template>
  <div class="user">
    <!-- 面包屑导航 -->
    <BreadCrumb>
      <span slot="center">用户管理</span>
      <span slot="right">用户列表</span>
    </BreadCrumb>
    <!-- 卡片区域 -->
    <Card class="card">
      <!-- 卡片视图区顶部搜索框 -->
       <el-input placeholder="请输入内容" class="input-text" v-model="queryInfo.query" clearable @clear="getUserList">
        <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
       </el-input>
       <!-- 按钮 -->
       <el-button type="primary" @click="userVisible = true">添加用户</el-button>
       <!-- 表格区域 -->
       <el-table :data="userList"
                  style="width: 100%" 
                  stripe 
                  border>
          <el-table-column type="index"></el-table-column>
          <el-table-column prop="username"
                           label="姓名"
                           width="150">
          </el-table-column>
          <el-table-column prop="email"
                           label="邮箱"
                           width="150">
          </el-table-column>
          <el-table-column prop="mobile"
                           label="电话"
                           width="150">
          </el-table-column>
          <el-table-column prop="role_name"
                           label="角色"
                           width="150">
          </el-table-column>
          <el-table-column label="状态"
                           width="150">
            <template slot-scope="scope">
              <el-switch v-model="scope.row.mg_state" @change="userChange(scope.row)"></el-switch>
            </template>
          </el-table-column>
          <el-table-column label="操作"
                           width="180">
          <template slot-scope="scope">
            <!-- 编辑按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="editUserInfo(scope.row.id)"></el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteClick(scope.row.id)"></el-button>
            <!-- 角色分配按钮 -->
            <el-tooltip effect="dark" content="角色分配" placement="top">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="setClick(scope.row)"></el-button>
            </el-tooltip>
          </template>    
          </el-table-column>
        </el-table>
        <!-- 页码条 -->
        <el-pagination @size-change="handleSizeChange"
                       @current-change="handleCurrentChange"
                       :current-page="queryInfo.pagenum"
                       :page-sizes="[2,4,6,8]"
                       :page-size="queryInfo.pagesize"
                       layout="total, sizes, prev, pager, next, jumper"
                       :total="total">
        </el-pagination>
    </Card>
    <!-- 添加用户弹出的dialog对话框 -->
    <el-dialog title="添加用户"
               :visible.sync="userVisible"
               width="50%" @close="userDialogClose">
        <el-form :model="userRuleForm" 
                 :rules="userRule" 
                 ref="userFormRef" 
                 label-width="100px">
          <el-form-item label="用户名" prop="username">
          <el-input v-model="userRuleForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
          <el-input v-model="userRuleForm.password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
          <el-input v-model="userRuleForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
          <el-input v-model="userRuleForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="userVisible = false">取 消</el-button>
          <el-button type="primary" @click="addUser">确 定</el-button>
        </span>
    </el-dialog>
    <!-- 点击编辑按钮，弹出的对话框 -->
    <el-dialog title="编辑用户信息"
               :visible.sync="editDialogVisible"
               width="50%" @close="editClose">
      <!-- 表单内容 -->
      <el-form :model="editRuleForm" :rules="editRule" ref="editFormRef" label-width="100px">
        <el-form-item label="用户名">
          <el-input v-model="editRuleForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editRuleForm.email"></el-input>
          </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editRuleForm.mobile"></el-input>
        </el-form-item>
        <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editDialogVisible = false">确 定</el-button>
      </span>
      </el-form>
    </el-dialog>
    <!--点击分配角色，分配角色弹窗  -->
    <el-dialog title="角色分配"
               :visible.sync="setRoleVisible"
               width="50%">
      <p>当前的用户:{{setRoleInfo.username}}</p>
      <p>当前角色:{{setRoleInfo.role_name}}</p>
      <p>分配新角色:
        <el-select v-model="selectedRoleId" placeholder="请选择">
          <el-option v-for="item in setRoleList"
                     :key="item.id"
                     :label="item.roleName"
                     :value="item.id">
          </el-option>
        </el-select>
    </p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
//导入公共组件
import BreadCrumb from '../../common/breadcrumb/BreadCrumb'
import Card from '../../common/card/Card'
//导入get方法
import {postRequest,getRequest,putRequest,deleteRequest} from '../../network/Request'
export default {
    name: 'User',
    components: {
      BreadCrumb,
      Card
    },
    data(){
      //校验邮箱和手机号
      //校验邮箱
      var checkEmail = (rule,value,callback) => {
        const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
        if(regEmail.test(value)){
          //合法的邮箱
          return callback()
        }
        callback(new Error('请输入合法的邮箱'))
      }
      //校验手机号
      var checkMobile = (rule,value,callback) => {
        const regMobile = /^(0|86|17951)?(13[0-9]|15[0123456789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
        if(regMobile.test(value)){
          return callback()
        }
        callback(new Error('请输入合法的手机号'))
      }
      return {
        //用户列表
        userList:[],
        //获取用户列表数据
        queryInfo:{
          query:'',
          pagenum:1,
          pagesize:2
        },
        total: 0,
        userVisible: false,
        userRuleForm:{
          username:'',
          password:'',
          email:'',
          mobile:''
        },
        userRule:{
          username:[
            { required: true, message: '请输入用户名', trigger: 'blur' },
            { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
          ],
          password:[
            { required: true, message: '请输入密码', trigger: 'blur' },
            { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
          ],
          email:[
            { required: true, message: '请输入邮箱', trigger: 'blur' },
            {validator:checkEmail , trigger: 'blur'}
          ],
          mobile:[
            { required: true, message: '请输入手机号', trigger: 'blur' },
            {validator:checkMobile , trigger:'blur'}
          ]
        },
        //编辑按钮弹出对话框
        editDialogVisible:false,
        editRuleForm:{},
        editRule:{
           email:[
            { required: true, message: '请输入邮箱', trigger: 'blur' },
            {validator:checkEmail , trigger: 'blur'}
          ],
          mobile:[
            { required: true, message: '请输入手机号', trigger: 'blur' },
            {validator:checkMobile , trigger:'blur'}
          ]
        },
        //设置角色
        setRoleVisible: false,
        setRoleInfo:{},
        setRoleList:[],
        selectedRoleId:''
      }
    },
    created(){
      this.getUserList();
    },
    methods: {
      //1.获取用户列表数据
      getUserList(){
        getRequest('users',this.queryInfo).then(res=>{
          // console.log(res);
          if(res.data.meta.status!==200){
            return this.$message.error('获取用户列表数据失败');
          }
          //获取列表数据成功进行下面的操作
          this.userList = res.data.data.users;
          this.total = res.data.data.total;
        })
      },
      //2.监听页面尺寸发生变化
      handleSizeChange(newSize){
        this.queryInfo.pagesize = newSize;
        //更新数据后，重新渲染页面
        this.getUserList();
      },
      //3.监听页面中数据条数发生变化
      handleCurrentChange(newPage){
        this.queryInfo.pagenum = newPage;
        //更新完数据后，重新渲染页面
        this.getUserList();
      },
      //4.修改用户状态
      userChange(statechange){
        console.log(statechange)
        putRequest(`/users/${statechange.id}/state/${statechange.mg_state}`).then(res=>{
          console.log(res)
          if(res.data.meta.status!==200){
            return this.$message.error('更新用户数据信息失败');
          }
          this.$message.success('更新用户信息成功');
        })
      },
      //5.点击dialog中的确定按钮，添加用户
      addUser(){
        //判断验证规则是否合法
        this.$refs.userFormRef.validate(valid=>{
          console.log(valid)
          if(!valid) return 
          //如果输入规则合法，请求添加用户数据
         postRequest('users',this.userRuleForm).then(res=>{
          //  console.log(res)
           if(res.data.meta.status!==201){
             return this.$message.error('添加用户失败');
           }
           this.$message.success('添加用户成功');
           //对话框关闭
           this.userVisible=false;
          //更新用户列表数据
          this.getUserList();
         })
        })
      },
      //6.点击添加用户上面的关闭对话框，重置表单数据
      userDialogClose(){
        this.$refs.userFormRef.resetFields();
      },
      //7.点击编辑按钮，编辑用户信息
      editUserInfo(id){
        //请求数据
        putRequest('users/'+id).then(res=>{
          console.log(res);
          if(res.data.meta.status!==200){
            return this.$message.error('编辑用户信息失败');
          }
          //如果请求到用户数据，就对用户数据进行修改
          this.editRuleForm= res.data.data;
          this.editDialogVisible=true;
        })
      },
      //7.1 编辑完之后重置表单
      editClose(){
        this.$refs.editFormRef.resetFields();
      },
      //8.点击删除按钮，删除数据
     deleteClick(id){
        this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(config=>{
          console.log(config);
          if(config!="confirm"){
            return this.$message.info('已取消删除');
          }
          //如果确认删除，请求删除网络数据
          deleteRequest('users/'+id).then(res=>{
            console.log(res);
            if(res.data.meta.status!==200){
              return this.$message.error('删除用户失败');
            }
            this.$message.success('删除用户成功');
            //删除用户之后重新刷新列表数据
            this.getUserList();
          })
        }).catch(err=>{
          console.log(err)
        });
      },
      //9.点击分配角色，设置分配角色
      setClick(setRoleInfo){
        this.setRoleVisible=true;
        this.setRoleInfo = setRoleInfo;
        // console.log(this.setRoleInfo)
        getRequest('roles').then(res=>{
          console.log(res);
          if(res.data.meta.status!==200){
            return this.$message.error('获取分配角色数据失败');
          }
          this.setRoleList=res.data.data;
        })
    },
    //10.点击确定按钮，保存数据
        saveRole(){
          if(!this.selectedRoleId){
            return this.$message.error('请选择要分配的角色')
          }
          //点击确定按钮，关闭对话框
          this.setRoleVisible=false;
          putRequest(`users/${this.setRoleInfo.id}/role`,{rid:this.selectedRoleId}).then(res=>{
            console.log(res)
            if(res.data.meta.status!==200){
              return this.$message.error('分配角色失败');
            }
            this.$message.success('分配角色成功');
            //分配角色成功之后重新刷新用户列表数据
            this.getUserList();
          })
        }
      }  
}
</script>
<style scoped>
  .card {
    margin-top: 15px;
  }
  .input-text {
    width: 400px;
    margin-right: 15px;
  }
  .el-table {
    margin-top: 15px;
  }
  .el-pagination {
    margin-top: 15px;
  }
</style>