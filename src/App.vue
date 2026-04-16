<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { TUIKit } from "./TUIKit";

// --- 登录逻辑 ---
const isLoggedIn = ref(false);
const username = ref("");
const password = ref("");
const loginError = ref("");
const isLoading = ref(false);

const imConfig = ref({
  SDKAppID: 0,
  userID: "",
  userSig: ""
});

const handleLogin = async () => {
  if (!username.value) {
    loginError.value = "请输入客服账号";
    return;
  }
  
  isLoading.value = true;
  loginError.value = "";
  
  try {
    // 1. 请求后端获取 UserSig
    const res = await fetch(`http://127.0.0.1:9501/customer/im/get_user_sig?user_id=${username.value}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      mode: 'cors'
    });
    const result = await res.json();
    
    if (result.code !== 200) {
      throw new Error(result.msg || "获取签名失败");
    }

    const { user_id, user_sig, sdk_app_id } = result.data;

    // 2. 将凭证保存给 TUIKit 使用
    imConfig.value = {
      SDKAppID: Number(sdk_app_id),
      userID: user_id,
      userSig: user_sig
    };
    
    isLoggedIn.value = true;
  } catch (error: any) {
    loginError.value = "登录失败: " + error.message;
    console.error("IM 登录错误", error);
  } finally {
    isLoading.value = false;
  }
};

// 退出登录
const handleLogout = async () => {
  // TUILogin.logout();
  isLoggedIn.value = false;
};
</script>

<template>
  <!-- 登录页面 -->
  <div v-if="!isLoggedIn" class="login-container">
    <div class="login-box">
      <div class="logo">NJD</div>
      <h2>宁嘉迪客服工作台</h2>
      <div class="input-group">
        <input v-model="username" type="text" placeholder="请输入客服账号 (admin)" @keydown.enter="handleLogin" />
      </div>
      <div class="input-group">
        <input v-model="password" type="password" placeholder="请输入密码 (123456)" @keydown.enter="handleLogin" />
      </div>
      <div v-if="loginError" class="error-msg">{{ loginError }}</div>
      <button class="login-btn" @click="handleLogin" :disabled="isLoading">
        {{ isLoading ? '登录中...' : '登 录' }}
      </button>
    </div>
  </div>

  <!-- IM 主界面 (TUIKit) -->
  <div v-else class="im-container">
    <TUIKit 
      :SDKAppID="imConfig.SDKAppID"
      :userID="imConfig.userID"
      :userSig="imConfig.userSig"
    />
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #f0f2f5;
}

.login-box {
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 360px;
}

.logo {
  font-size: 32px;
  font-weight: bold;
  color: #1890ff;
  margin-bottom: 20px;
}

h2 {
  margin-bottom: 30px;
  color: #333;
}

.input-group {
  margin-bottom: 20px;
}

.input-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 16px;
  box-sizing: border-box;
}

.error-msg {
  color: #ff4d4f;
  margin-bottom: 15px;
  font-size: 14px;
}

.login-btn {
  width: 100%;
  padding: 12px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;
}

.login-btn:hover {
  background: #40a9ff;
}

.login-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.im-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  background: #f5f5f5;
  overflow: hidden;
}
</style>
