<template>
  <div class="add-good">
    <!-- 面包屑导航区 -->
    <BreadCrumb>
      <span slot="center">商品管理</span>
      <span slot="right">添加商品</span>
    </BreadCrumb>
    <!-- 卡片视图区 -->
    <Card class="card">
        <!-- 顶部说明区域 -->
         <el-alert title="添加商品信息"
                   type="info"
                   center
                   show-icon>
        </el-alert>
        <!-- 步骤条 -->
        <el-steps :space="200" 
                      :active="activeIndex-0" 
                      align-center 
                      finish-status="success">
              <el-step title="基本信息"></el-step>
              <el-step title="商品参数"></el-step>
              <el-step title="商品属性"></el-step>
              <el-step title="商品图片"></el-step>
              <el-step title="商品内容"></el-step>
              <el-step title="完成"></el-step>
            </el-steps>
        <el-form :model="addGoodForm" 
                 :rules="addGoodRule" 
                 ref="addGoodFormRef" 
                 label-position="top">
            <!-- tabs标签页 -->
        <el-tabs :tab-position="tabPosition" 
                 v-model="activeIndex" 
                 :before-leave="beforeTabLeave" 
                 @tab-click="tabClick">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addGoodForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addGoodForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addGoodForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addGoodForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader v-model="addGoodForm.goods_cat"
                           :options="cateList"
                           :props="cateProps"
                            @change="handleChange"></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name='1'>
              <el-form-item v-for="(item,index) in manyTableData" 
                            :key="index" :label="item.attr_name">
              <!-- 复选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox v-for="(cb,index1) in item.attr_vals" 
                             :key="index1" 
                             :label="cb" 
                             border></el-checkbox>
              </el-checkbox-group>
              </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name='2'>
            <el-form-item v-for="(item,index) in onlyTableData" 
                          :key="index" 
                          :label="item.attr_name">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name='3'>
            <el-upload :action="uploadURL"
                       :on-preview="handlePreview"
                       :on-remove="handleRemove"
                       :on-success="handleSuccess"
                       list-type="picture"
                       :headers="headerObj">
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name='4'>
            <quill-editor v-model="addGoodForm.goods_introduce">
            </quill-editor>
            <el-button type="primary" class="btn" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
        </el-form>
    </Card>
    <!--图片预览-->
    <el-dialog title="图片预览"
              :visible.sync="previewVisible"
              width="50%">
      <img :src="previewPath" alt="" class="previewImg">
    </el-dialog>
  </div>
</template>
<script>
//引入面包屑导航
import BreadCrumb from '../../common/breadcrumb/BreadCrumb'
import Card from '../../common/card/Card'
//引入方法
import {getRequest,postRequest} from '../../network/Request'
//引入lodash实现深拷贝
import _ from 'lodash'
export default {
    name:'AddGood',
    components:{
        BreadCrumb,
        Card
    },
    data(){
      return {
        activeIndex:0,
        tabPosition:'left',
        addGoodForm:{
          goods_name:'',
          goods_price:0,
          goods_number:0,
          goods_weight:0,
          //商品所属分类属性
          goods_cat:[],
          //商品详情的描述
          goods_introduce:'',
          //上传图片的临时路径
          pics:[],
          //商品参数(数组)
          attrs:[]
        },
        addGoodRule:{
          goods_name:[
            { required: true, message: '请输入商品名称', trigger: 'blur' }
          ],
          goods_price:[
            { required: true, message: '请输入商品价格', trigger: 'blur' }
          ],
          goods_number:[
            { required: true, message: '请输入商品数量', trigger: 'blur' }
          ],
          goods_weight:[
            { required: true, message: '请输入商品重量', trigger: 'blur' }
          ],
          goods_cat:[
            { required: true, message: '请输入商品属性分类', trigger: 'blur' } 
          ]
        },
        cateList:[],
        cateProps:{
          label:'cat_name',
          value:'cat_id',
          children:'children',
          expandTrigger: 'hover'
        },
        //动态参数列表
        manyTableData:[],
        //静态属性
        onlyTableData:[],
        //上传图片
        uploadURL:'http://127.0.0.1:8888/api/private/v1/upload',
        headerObj:{
          //因为上传图片组件没有请求axios，所以这里要添加请求头
          Authorization:window.sessionStorage.getItem('token')
        },
        previewVisible:false,
        previewPath:''
      }
    },
    created(){
        this.getCateList();
    },
    methods:{
      //1.获取所有商品分类数据
      getCateList(){
          getRequest('categories').then(res=>{
              console.log(res);
              if(res.data.meta.status!==200){
                  return this.$message.error('获取商品分类数据失败');
              }
            //   this.$message.success('获取商品分类数据成功');
              this.cateList=res.data.data;
              
          })
      },
      //2.级联选择器中发生变化，会触发这个函数
      handleChange(){
        // console.log(this.addGoodForm.goods_cat);
        if(this.addGoodForm.goods_cat.length!==3){
            //这里说明只能选择存在三级的标签，否则失效
            this.addGoodForm.goods_cat=[];
        }
      },
      //3.切换标签之前的钩子,若返回 false 或者返回 Promise 且被 reject，则阻止切换。
      beforeTabLeave(beforeActiveName,oldActiveName){
        //   console.log('即将离开的标签名字是：'+ oldActiveName);
        //   console.log('即将进入的标签名字是：'+ beforeActiveName);
        if(oldActiveName==='0' && this.addGoodForm.goods_cat.length!==3){
         this.$message.info('请先选择商品分类');
         return false;
        }
      },
      //4.tab 被选中时触发
      tabClick(){
        //  console.log(this.addGoodForm.goods_cat);
        //   console.log(this.activeIndex);
        if(this.activeIndex==='1'){
          getRequest(`categories/${this.cateId}/attributes`,{sel:'many'}).then(res=>{
            console.log(res);
            if(res.data.meta.status!==200){
                return this.message.error('获取列表数据失败');
            }
            res.data.data.forEach(item=>{
             item.attr_vals=item.attr_vals.length===0?[]:item.attr_vals.split(',');
            })
            this.manyTableData=res.data.data;
          })
        }else if(this.activeIndex==="2"){
            //如果索引值为2，证明点击了静态列表属性
            getRequest(`categories/${this.cateId}/attributes`,{sel:'only'}).then(res=>{
                console.log(res);
                if(res.data.meta.status!==200){
                    return this.$message.error('获取静态参数失败');
                }
                this.onlyTableData=res.data.data;
            })
        }
      },
      //5.图片预览
      handlePreview(file){
        console.log(file);
        this.previewPath=file.response.data.url;
        this.previewVisible=true;
      },
      //6. 图片删除
      handleRemove(file){
        console.log(file);
        //6.1.获取将要删除的数组的路径
        const filePath = file.response.data.tmp_path;
        //6.2 从pics数组中，找到这个图片的索引值
        const ii=this.addGoodForm.pics.findIndex(item=>{
          item.pic = filePath;
        })
        //6.3 调用数组的splice方法，把图片信息对象从pic数组中移除
        this.addGoodForm.pics.splice(ii,1);
      },
      //7. 图片上传成功
      handleSuccess(response){
        console.log(response);//图片上传成功返回
        //7.1 拼接得到一个图片信息对象
        const picInfo = {pic:response.data.tmp_path};
        //7.2将图片信息push到pics数组中
        this.addGoodForm.pics.push(picInfo);
        console.log(this.addGoodForm);
      },
      //8.添加商品
      add(){
        //添加商品时首先验证表单规则，只有前面表单全都输入完整信息后，才能添加商品
        this.$refs.addGoodFormRef.validate(valid=>{
          if(!valid){
            return this.$message.error('请填写正确的表单项！');
          } 
          //如果前面内容全部填写完整，即可实现添加商品
          //执行添加的业务逻辑
          //使用深拷贝的方法，拷贝this.addGoodForm.goods_cat,由于前面使用的是数组形式，这里需要使用字符串的形式，如果直接进行this.addGoodForm.goods_cat=this.addGoodForm.goods_cat.join(',');会报错，因为这样直接赋值，导致前面的数组也会变成字符串，所以这里考虑采用深拷贝的方式
          const form = _.cloneDeep(this.addGoodForm)
          form.goods_cat = form.goods_cat.join(',');
          // console.log(form.goods_cat);
          //处理动态参数
          this.manyTableData.forEach(item=>{
           const newInfo = {
             attr_id:item.attr_id,
             attr_value:item.attr_vals.join('')
           }
            this.addGoodForm.attrs.push(newInfo);
          })
          //处理静态参数
          this.onlyTableData.forEach(item=>{
            const newInfo = {
              attr_id:item.attr_id,
              attr_value:item.attr_vals
            }
            this.addGoodForm.attrs.push(newInfo);
          })
          form.attrs=this.addGoodForm.attrs;
          // console.log(form);
          //发起请求，添加商品
          postRequest('goods',form).then(res=>{
            console.log(res);
            if(res.data.meta.status!==201){
              return this.$message.error('添加商品失败');
            }
            this.$message.success('添加商品成功！');
            this.$router.push('/goods');
          })
        })
      }
    },
    computed:{
     cateId(){
        if(this.addGoodForm.goods_cat.length===3){
            //如果长度为3,证明选择了三级分类
            return this.addGoodForm.goods_cat[2];
        }
        return null;
     }
    }
}
</script>
<style scoped>
.card {
    margin-top: 15px;
}
.el-step__title{
   font-size: 10px!important;
}
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.previewImg {
  width: 100%;
}
.btn {
  margin-top: 15px;
}
</style>