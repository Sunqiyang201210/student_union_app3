import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// 配置推送通知处理方式
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  } as Notifications.NotificationBehavior),
});

const EXPO_PUSH_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

/**
 * 请求推送通知权限
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Device.isDevice) {
    console.log('推送通知只能在真机上使用');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('未获得推送通知权限');
    return false;
  }

  return true;
}

/**
 * 获取推送通知token
 */
export async function getPushNotificationToken(): Promise<string | null> {
  try {
    // 获取Expo推送token
    const projectId = process.env.EXPO_PUBLIC_COZE_PROJECT_ID;
    if (!projectId) {
      console.log('未配置EXPO_PUBLIC_COZE_PROJECT_ID，跳过获取推送token');
      return null;
    }
    
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: projectId,
    }) as { data: string };
    
    console.log('Push token:', tokenData.data);
    return tokenData.data;
  } catch (error) {
    console.error('获取推送token失败:', error);
    return null;
  }
}

/**
 * 注册设备并发送token到后端
 */
export async function registerDeviceForPush(): Promise<boolean> {
  try {
    // 请求权限
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.log('用户拒绝了推送通知权限');
      return false;
    }

    // 获取token
    const token = await getPushNotificationToken();
    if (!token) {
      console.log('无法获取推送token');
      return false;
    }

    // 发送token到后端
    const response = await fetch(`${EXPO_PUSH_URL}/api/v1/push/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'bypass-tunnel-reminder': 'true',
      },
      body: JSON.stringify({
        token,
        platform: Platform.OS,
        deviceName: Device.modelName || 'Unknown',
      }),
    });

    if (response.ok) {
      console.log('设备注册成功');
      return true;
    } else {
      console.log('设备注册失败');
      return false;
    }
  } catch (error) {
    console.error('注册设备失败:', error);
    return false;
  }
}

/**
 * 发送本地通知（用于测试）
 */
export async function sendLocalNotification(
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: data || {},
      sound: true,
    },
    trigger: null, // 立即发送
  });
}

/**
 * 添加推送通知监听器
 */
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
): Notifications.EventSubscription {
  return Notifications.addNotificationReceivedListener(callback);
}

/**
 * 添加通知点击监听器
 */
export function addNotificationResponseReceivedListener(
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.EventSubscription {
  return Notifications.addNotificationResponseReceivedListener(callback);
}
