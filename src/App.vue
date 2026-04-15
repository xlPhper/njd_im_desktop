<script setup lang="ts">
import { ref } from "vue";

const msg = ref("");
const messages = ref([
  { id: 1, text: "你好！我想咨询一下产品。", isSelf: false },
  { id: 2, text: "您好！我是宁嘉迪客服，请问有什么可以帮您？", isSelf: true },
]);

const sendMsg = () => {
  if (!msg.value.trim()) return;
  messages.value.push({ id: Date.now(), text: msg.value, isSelf: true });
  msg.value = "";
  // 模拟回复
  setTimeout(() => {
    messages.value.push({ id: Date.now(), text: "收到您的消息，稍后为您处理。", isSelf: false });
  }, 1000);
};
</script>

<template>
  <div class="im-container">
    <!-- 侧边栏：联系人列表 -->
    <div class="sidebar">
      <div class="user-profile">
        <div class="avatar">客服</div>
        <div class="name">小宁 (在线)</div>
      </div>
      <ul class="contact-list">
        <li class="contact active">
          <div class="avatar-sm">U1</div>
          <div class="info">
            <span class="c-name">用户A</span>
            <span class="c-msg">你好！我想咨询...</span>
          </div>
        </li>
        <li class="contact">
          <div class="avatar-sm">U2</div>
          <div class="info">
            <span class="c-name">用户B (离线)</span>
            <span class="c-msg">上次的问题...</span>
          </div>
        </li>
      </ul>
    </div>

    <!-- 主聊天区域 -->
    <div class="main-chat">
      <!-- 聊天头部 -->
      <div class="chat-header">
        <h2>正在与 用户A 沟通</h2>
      </div>

      <!-- 聊天历史记录 -->
      <div class="chat-history">
        <div 
          v-for="item in messages" 
          :key="item.id" 
          :class="['message-row', item.isSelf ? 'sent' : 'received']"
        >
          <div class="message-bubble">{{ item.text }}</div>
        </div>
      </div>

      <!-- 聊天输入框 -->
      <div class="chat-input">
        <textarea 
          v-model="msg" 
          placeholder="请输入消息 (回车发送)..." 
          @keydown.enter.prevent="sendMsg"
        ></textarea>
        <div class="input-actions">
          <button @click="sendMsg" class="send-btn">发 送</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.im-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background-color: #f5f5f5;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

/* 侧边栏 */
.sidebar {
  width: 260px;
  background-color: #e8e8e8;
  border-right: 1px solid #dcdcdc;
  display: flex;
  flex-direction: column;
}

.user-profile {
  padding: 20px;
  display: flex;
  align-items: center;
  background-color: #dcdcdc;
}

.avatar {
  width: 40px;
  height: 40px;
  background-color: #108ee9;
  color: white;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  margin-right: 12px;
}

.name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.contact-list {
  list-style: none;
  padding: 0;
  margin: 0;
  overflow-y: auto;
  flex: 1;
}

.contact {
  display: flex;
  padding: 15px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.contact:hover {
  background-color: #dedede;
}

.contact.active {
  background-color: #c9e0f7;
}

.avatar-sm {
  width: 36px;
  height: 36px;
  background-color: #999;
  color: white;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  margin-right: 10px;
}

.info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
}

.c-name {
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
}

.c-msg {
  font-size: 12px;
  color: #888;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 主聊天区 */
.main-chat {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.chat-header {
  padding: 0 20px;
  height: 60px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e0e0e0;
}

.chat-header h2 {
  font-size: 16px;
  font-weight: normal;
  margin: 0;
}

.chat-history {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.message-row {
  display: flex;
  margin-bottom: 15px;
}

.message-row.received {
  justify-content: flex-start;
}

.message-row.sent {
  justify-content: flex-end;
}

.message-bubble {
  max-width: 60%;
  padding: 10px 14px;
  border-radius: 6px;
  font-size: 14px;
  line-height: 1.5;
}

.received .message-bubble {
  background-color: #ffffff;
  color: #333;
  border: 1px solid #e0e0e0;
}

.sent .message-bubble {
  background-color: #95ec69; /* 经典微信绿 */
  color: #333;
}

/* 输入区 */
.chat-input {
  height: 140px;
  border-top: 1px solid #e0e0e0;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
}

.chat-input textarea {
  flex: 1;
  border: none;
  resize: none;
  padding: 15px;
  font-size: 14px;
  outline: none;
  font-family: inherit;
}

.input-actions {
  height: 40px;
  display: flex;
  justify-content: flex-end;
  padding: 0 15px 10px;
}

.send-btn {
  background-color: #e9e9e9;
  color: #07c160;
  border: 1px solid #e0e0e0;
  padding: 6px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.send-btn:hover {
  background-color: #129611;
  color: #fff;
}
</style>
