<template>
  <div class="container">
    <el-form
      class="login-form"
      ref="loginFormRef"
      :model="loginForm"
      :rules="rules"
      label-width="120px"
      status-icon
    >
      <el-form-item label="登录用户" prop="user">
        <el-input v-model="loginForm.user" placeholder="请输入用户名" clearable>
        </el-input>
      </el-form-item>

      <el-form-item label="登录密码" prop="pwd">
        <el-input
          v-model="loginForm.pwd"
          placeholder="请输入密码"
          show-password
          clearable
        >
        </el-input>
      </el-form-item>

      <el-form-item>
        <el-button class="btn-login" type="primary" @click="handleLogin"
          >登录</el-button
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

const { ipcRenderer } = require("electron");
ipcRenderer.send("checkForUpdate");

const router = useRouter();

const loginFormRef = ref(null);

const loginForm = reactive({
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

const checkLoginUser = () => {
  const stmt = db.prepare(`SELECT * FROM login WHERE user = ?`);
  const res = stmt.get(loginForm.user);
  console.log(res);
  if (loginForm.user === "admin" && loginForm.pwd === "123456") {
    router.push("/home");
  } else {
    if (!res) {
      ElMessage({
        message: "用户未注册",
        type: "error",
      });
      return;
    }
    if (res.user === loginForm.user && res.pwd === loginForm.pwd) {
      router.push("/home");
    }
  }
};

const handleLogin = async () => {
  if (!loginFormRef.value) return;
  await loginFormRef.value.validate((valid, fields) => {
    if (valid) {
      console.log("submit!");
      localStorage.setItem("login", JSON.stringify(loginForm));
      checkLoginUser();
    } else {
      console.log("error submit!", fields);
    }
  });
};
</script>

<style lang="scss" scoped>
@import "./index.scss";
</style>
