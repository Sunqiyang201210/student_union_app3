import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LogBox } from 'react-native';
import Toast from 'react-native-toast-message';
import { Provider } from '@/components/Provider';

import '../global.css';

LogBox.ignoreLogs([
  "TurboModuleRegistry.getEnforcing(...): 'RNMapsAirModule' could not be found",
]);

export default function RootLayout() {
  return (
    <Provider>
      <Stack
        screenOptions={{
          animation: 'slide_from_right',
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          headerShown: false
        }}
      >
        <Stack.Screen name="(tabs)" options={{ title: "" }} />
        <Stack.Screen name="feedback" options={{ title: "意见反馈" }} />
        <Stack.Screen name="schedule" options={{ title: "赛程详情" }} />
        <Stack.Screen name="login" options={{ title: "管理员登录" }} />
        <Stack.Screen name="manage" options={{ title: "内容管理" }} />
      </Stack>
      <Toast />
    </Provider>
  );
}
