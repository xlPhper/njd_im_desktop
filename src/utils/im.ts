import TencentCloudChat from '@tencentcloud/chat';

class IMClient {
  private chat: any = null;
  private sdkAppID: number | string = '';

  // 初始化 SDK
  public init(sdkAppID: number | string) {
    this.sdkAppID = sdkAppID;
    if (!this.chat) {
      this.chat = TencentCloudChat.create({
        SDKAppID: Number(sdkAppID) || (sdkAppID as any), // 腾讯云正常情况下是数字
      });
      
      // 腾讯云 SDKAppID 必须是纯数字，如果传入非数字，create 会返回 null
      if (!this.chat) {
        throw new Error(`腾讯云 SDK 初始化失败: SDKAppID 无效 (${sdkAppID})。请确认在腾讯云控制台获取的是纯数字的 SDKAppID (如 140xxxxxxx)。`);
      }
      
      // 监听事件
      this.bindEvents();
    }
  }

  // 登录
  public async login(userID: string, userSig: string) {
    if (!this.chat) throw new Error('SDK未初始化');
    await this.chat.login({
      userID,
      userSig,
    });
  }

  // 退出登录
  public async logout() {
    if (!this.chat) return;
    await this.chat.logout();
  }

  // 获取会话列表
  public async getConversationList() {
    if (!this.chat) return [];
    const res = await this.chat.getConversationList();
    return res.data.conversationList;
  }

  // 获取消息列表
  public async getMessageList(conversationID: string, nextReqMessageID: string = '') {
    if (!this.chat) return [];
    const res = await this.chat.getMessageList({
      conversationID,
      nextReqMessageID,
      count: 15
    });
    return res.data;
  }

  // 发送文本消息
  public async sendTextMessage(to: string, payloadText: string) {
    if (!this.chat) throw new Error('SDK未初始化');
    // 1. 创建消息实例
    const message = this.chat.createTextMessage({
      to,
      conversationType: TencentCloudChat.TYPES.CONV_C2C,
      payload: {
        text: payloadText
      }
    });
    // 2. 发送消息
    const res = await this.chat.sendMessage(message);
    return res.data.message;
  }

  // 绑定基础事件监听
  private bindEvents() {
    this.chat.on(TencentCloudChat.EVENT.SDK_READY, this.onReady.bind(this));
    this.chat.on(TencentCloudChat.EVENT.MESSAGE_RECEIVED, this.onMessageReceived.bind(this));
  }

  // SDK Ready回调，可在外部覆盖重写
  public onReady() {
    console.log('IM SDK 准备就绪');
  }

  // 消息接收回调，可在外部覆盖重写
  public onMessageReceived(event: any) {
    console.log('收到新消息:', event.data);
  }
}

export const imClient = new IMClient();
