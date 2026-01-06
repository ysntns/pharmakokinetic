import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import api, { authAPI } from './api';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const registerForPushNotificationsAsync = async (): Promise<string | null> => {
  let token: string | null = null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }

    try {
      token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('Push token:', token);

      // Register token with backend
      await api.post('/auth/push-token', {
        token,
        device_type: Platform.OS,
      });
    } catch (error) {
      console.error('Error getting push token:', error);
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
};

export const unregisterPushNotifications = async () => {
  try {
    await api.delete('/auth/push-token');
  } catch (error) {
    console.error('Error unregistering push token:', error);
  }
};

export const scheduleMedicationReminder = async (
  medicationId: string,
  drugName: string,
  dosage: string,
  scheduledTime: Date,
  minutesBefore: number = 15
) => {
  try {
    const trigger = new Date(scheduledTime.getTime() - minutesBefore * 60 * 1000);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'İlaç Hatırlatıcısı',
        body: `${drugName} (${dosage}) alma zamanı yaklaşıyor`,
        data: { medicationId, scheduledTime: scheduledTime.toISOString() },
        sound: true,
      },
      trigger,
    });

    console.log(`Reminder scheduled for ${drugName} at ${trigger}`);
  } catch (error) {
    console.error('Error scheduling reminder:', error);
  }
};

export const cancelMedicationReminder = async (notificationId: string) => {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error('Error canceling reminder:', error);
  }
};

export const cancelAllNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error canceling all notifications:', error);
  }
};
