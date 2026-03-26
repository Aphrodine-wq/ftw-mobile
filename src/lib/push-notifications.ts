import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { apiFetch } from "@src/api/client";

/**
 * Configure notification handler — shows notifications even when app is foregrounded.
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Registers for push notifications:
 * 1. Checks device (must be physical device)
 * 2. Requests permission
 * 3. Gets Expo push token
 * 4. Sends token to backend
 *
 * Returns the Expo push token string, or null if registration failed.
 */
export async function registerForPushNotifications(): Promise<string | null> {
  // Push notifications only work on physical devices
  if (!Device.isDevice) {
    console.log("Push notifications require a physical device");
    return null;
  }

  // Check existing permissions
  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request permission if not already granted
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Push notification permission denied");
    return null;
  }

  // Android needs a notification channel
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#C41E3A",
    });
  }

  try {
    // Get the Expo push token
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: projectId ?? undefined,
    });

    const token = tokenData.data;
    const platform = Platform.OS === "ios" ? "ios" : "android";

    // Register token with backend
    await apiFetch("/api/push/register", {
      method: "POST",
      body: JSON.stringify({ token, platform }),
    });

    console.log("Push token registered:", token);
    return token;
  } catch (error) {
    console.error("Failed to register push token:", error);
    return null;
  }
}

/**
 * Unregisters the current device's push token from the backend.
 */
export async function unregisterPushNotifications(): Promise<void> {
  try {
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: projectId ?? undefined,
    });

    await apiFetch("/api/push/unregister", {
      method: "DELETE",
      body: JSON.stringify({ token: tokenData.data }),
    });

    console.log("Push token unregistered");
  } catch (error) {
    console.error("Failed to unregister push token:", error);
  }
}

/**
 * Add a listener for when a notification is received while the app is foregrounded.
 * Returns a subscription that should be removed on cleanup.
 */
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
) {
  return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Add a listener for when the user taps a notification.
 * Returns a subscription that should be removed on cleanup.
 */
export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}
