import TencentCloudChat from '@tencentcloud/chat';
const chat = TencentCloudChat.create({ SDKAppID: 1400187352 }); // Try a known demo app id
console.log(chat ? "Created successfully with 1400187352" : "Failed");
