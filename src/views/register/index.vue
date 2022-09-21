<template>
  <div class="container">
    <el-button class="btn-back" type="primary" round @click="goBack"
      >返回上一页</el-button
    >

    <el-form
      class="register-form"
      ref="registerFormRef"
      :model="registerForm"
      :rules="rules"
      label-width="120px"
      status-icon
    >
      <el-form-item label="注册用户" prop="user">
        <el-input
          v-model="registerForm.user"
          placeholder="请输入用户名"
          clearable
        >
        </el-input>
      </el-form-item>

      <el-form-item label="注册密码" prop="pwd">
        <el-input
          v-model="registerForm.pwd"
          placeholder="请输入密码"
          show-password
          clearable
        >
        </el-input>
      </el-form-item>

      <el-form-item>
        <el-button class="btn-register" type="primary" @click="handleRegister"
          >注册</el-button
        >
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";

import db from "@/better-sql3";

const router = useRouter();

const registerFormRef = ref(null);

const registerForm = reactive({
  user: "",
  pwd: "",
});

const rules = reactive({
  user: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  pwd: [
    {
      required: true,
      message: "请输入密码",
      trigger: "blur",
    },
  ],
});

const goBack = () => {
  router.back();
};

const handleRegister = async () => {
  if (!registerFormRef.value) return;
  await registerFormRef.value.validate((valid, fields) => {
    if (valid) {
      console.log("submit!");
      // const { user, pwd } = registerForm;
      const stmt = db.prepare(
        `INSERT OR REPLACE INTO login(user, pwd, createdAt) VALUES (@user, @pwd, @createdAt)`
      );
      stmt.run({
        ...registerForm,
        createdAt: new Date().getTime(),
      });
      ElMessage({
        message: "注册用户成功",
        type: "success",
      });
      goBack();
    } else {
      console.log("error submit!", fields);
    }
  });
};
</script>

<style lang="scss" scoped>
@import "./index.scss";
</style>
