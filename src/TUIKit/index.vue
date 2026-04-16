<template>
  <div :key="currentLanguage" style="width: 100%; height: 100%;">
    <slot>
      <div :class="['TUIKit', isH5 && 'TUIKit-h5']" style="display: flex; height: 100vh; background: #fff;">
        
        <!-- 左侧导航栏 (NavBar) - 模仿官方 Demo -->
        <div class="njd-navbar" v-if="!(isH5 && currentConversationID)">
          <!-- 顶部：头像 -->
          <div class="njd-navbar-header">
            <img class="njd-avatar" :src="currentUserProfile.avatar || 'https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png'" />
          </div>

          <!-- 中部：菜单项 -->
          <div class="njd-navbar-list">
            <div
              v-for="item in navbarList"
              :key="item.id"
              :class="['njd-navbar-item', currentNavbar === item.id && 'njd-navbar-item-active']"
              @click="currentNavbar = item.id"
              :title="TUITranslateService.t(item.label)"
            >
              <img :src="currentNavbar === item.id ? item.selectedIcon : item.icon" class="njd-nav-icon" />
            </div>
          </div>
        </div>

        <!-- 右侧主内容区 -->
        <div class="TUIKit-main-container" style="flex: 1; display: flex;">
          <div
            v-if="currentNavbar === 'message'"
            class="TUIKit-main"
            style="display: flex; flex: 1;"
          >
            <!-- 会话列表栏 -->
            <div
              v-if="!(isH5 && currentConversationID)"
              class="TUIKit-main-aside"
              style="width: 280px; border-right: 1px solid #E4E8EE; display: flex; flex-direction: column; background: #fff;"
            >
              <TUISearch searchType="global" />
              <TUIConversation />
            </div>
            <!-- 聊天主窗口 -->
            <div
              v-if="!isH5 || currentConversationID"
              class="TUIKit-main-main"
              style="flex: 1; display: flex; flex-direction: column; background: #F4F5F9;"
            >
              <TUIChat>
                <!-- 干净的欢迎页 / 空状态 -->
                <div class="njd-empty-state">
                  <div class="empty-icon">💬</div>
                  <h2>NJD 客服工作台</h2>
                </div>
              </TUIChat>
              <TUIGroup :class="isH5 ? 'chat-popup' : 'chat-aside'" />
              <TUISearch
                :class="isH5 ? 'chat-popup' : 'chat-aside'"
                searchType="conversation"
              />
            </div>
            <TUIGroup
              v-if="isH5 && !currentConversationID"
              class="chat-popup"
            />
            <TUIContact displayType="selectFriend" />
          </div>
          <div
            v-else-if="currentNavbar === 'contact'"
            class="TUIKit-main"
            style="flex: 1; background: #fff;"
          >
            <TUIContact
              displayType="contactList"
              @switchConversation="currentNavbar = 'message'"
            />
          </div>
        </div>
      </div>
    </slot>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, framework } from './adapter-vue';
import { TUILogin } from '@tencentcloud/tui-core-lite';
import { TUIStore, StoreName, TUIConversationService, TUITranslateService, TUIReportService } from '@tencentcloud/chat-uikit-engine-lite';
import { TUISearch, TUIConversation, TUIChat, TUIContact, TUIGroup } from './components';
import { isH5 } from './utils/env';

// 引入图标
import messageIcon from '../assets/message.svg';
import messageSelectedIcon from '../assets/message-selected.svg';
import relationIcon from '../assets/relation.svg';
import relationSelectedIcon from '../assets/relation-selected.svg';

const currentConversationID = ref<string>('');
const currentNavbar = ref<string>('message');
const currentLanguage = ref<string>('zh');
const currentUserProfile = ref<any>({});
const navbarList = [
  {
    id: 'message',
    label: '消息',
    icon: messageIcon,
    selectedIcon: messageSelectedIcon
  },
  {
    id: 'contact',
    label: '通讯录',
    icon: relationIcon,
    selectedIcon: relationSelectedIcon
  },
];

const props = defineProps({
  // When deploying a production environment, you do not need to pass in SDKAppID, userID, and userSig through props.
  // eslint-disable-next-line vue/prop-name-casing
  SDKAppID: {
    type: Number,
    default: 0,
    required: false,
  },
  userID: {
    type: String,
    default: '',
    required: false,
  },
  userSig: {
    type: String,
    default: '',
    required: false,
  },
  conversationID: {
    type: String,
    default: '',
    required: false, // When integrating Chat independently, you need to pass the conversationID
  },
});

onMounted(() => {
  TUIStore.watch(StoreName.CONV, {
    currentConversationID: (id: string) => {
      currentConversationID.value = id;
    },
  });

  TUIStore.watch(StoreName.USER, {
    userProfile: (profile: any) => {
      currentUserProfile.value = profile || {};
    },
  });

  // Default login logic
  login();

  // init language by SDKAppID
  initLanguage();

  // Modify CallKit style in H5 environment
  modifyCallKitStyle();
});

function login() {
  const { SDKAppID, userID, userSig, conversationID } = props;
  if (SDKAppID && userID && userSig) {
    TUILogin.login({
      SDKAppID,
      userID,
      userSig,
      framework,
    } as any).then(() => {
      // Execute the following code when integrating Chat independently
      if (conversationID.startsWith('C2C') || conversationID.startsWith('GROUP')) {
        TUIConversationService.switchConversation(conversationID);
      }
      // report language
      TUIReportService.reportFeature(201, currentLanguage.value);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    }).catch((error) => { });
  }
}

function isIntlSDKAppID(SDKAppID: number) {
  if ((SDKAppID === 0)
    || (SDKAppID >= 20000000 && SDKAppID < 90000000)
    || (SDKAppID >= 1720000000 && SDKAppID < 1790000000)) {
    return true;
  }
  return false;
}

function initLanguage() {
  currentLanguage.value = isIntlSDKAppID(props.SDKAppID) ? 'en' : 'zh';
  TUITranslateService.changeLanguage(currentLanguage.value);
}

function modifyCallKitStyle() {
  if (isH5) {
    const bodyStyle = document.getElementsByTagName('body')[0].style;
    bodyStyle.setProperty('--callLeft', '0');
    bodyStyle.setProperty('--callTop', '0');
    bodyStyle.setProperty('--callWidth', '100%');
    bodyStyle.setProperty('--callHeight', '100%');
  }
}
</script>
<style scoped lang="scss">
  @import "./assets/styles/common";
  @import "./assets/styles/sample";

  .njd-navbar {
    width: 60px;
    background-color: #F4F5F9;
    display: flex;
    flex-direction: column;
    align-items: center;
    border-right: 1px solid #E4E8EE;
    padding-top: 30px;
    flex-shrink: 0;
  }

  .njd-navbar-header {
    margin-bottom: 30px;
  }

  .njd-avatar {
    width: 40px;
    height: 40px;
    border-radius: 4px;
    cursor: pointer;
  }

  .njd-navbar-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: 100%;
    align-items: center;
  }

  .njd-navbar-item {
    width: 40px;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    border-radius: 6px;
    transition: background 0.2s;
  }

  .njd-navbar-item:hover {
    background: #E4E8EE;
  }

  .njd-navbar-item-active {
    background: #E4E8EE;
  }

  .njd-nav-icon {
    width: 24px;
    height: 24px;
  }

  .njd-empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #999;
  }

  .njd-empty-state .empty-icon {
    font-size: 64px;
    margin-bottom: 20px;
    opacity: 0.5;
  }

  .njd-empty-state h2 {
    font-size: 20px;
    color: #999;
    font-weight: normal;
  }
</style>
<style lang="scss">
  /* stylelint-disable-next-line */
  $left: var(--callLeft, calc(50% - 25rem));
  /* stylelint-disable-next-line */
  $top: var(--callTop, calc(50% - 18rem));
  /* stylelint-disable-next-line */
  $width: var(--callWidth, 50rem);
  /* stylelint-disable-next-line */
  $height: var(--callHeight, 36rem);

  .callkit-container {
    position: fixed !important;
    left: $left !important;
    top: $top !important;
    width: $width !important;
    height: $height !important;
  }
</style>
