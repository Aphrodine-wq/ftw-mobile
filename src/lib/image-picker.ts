import * as ImagePicker from "expo-image-picker";
import { API_BASE } from "@src/lib/constants";
import { useAuthStore } from "@src/stores/auth";

/**
 * Launch the device image library and return the selected image URI.
 * Returns null if the user cancels.
 */
export async function pickImage(): Promise<string | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: false,
    quality: 0.8,
  });

  if (result.canceled || result.assets.length === 0) {
    return null;
  }

  return result.assets[0].uri;
}

/**
 * Launch the device camera and return the captured photo URI.
 * Returns null if the user cancels.
 */
export async function takePhoto(): Promise<string | null> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== "granted") {
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: false,
    quality: 0.8,
  });

  if (result.canceled || result.assets.length === 0) {
    return null;
  }

  return result.assets[0].uri;
}

/**
 * Upload an image to the backend.
 * Creates FormData and POSTs to the uploads endpoint with auth token.
 */
export async function uploadImage(
  uri: string,
  entityType: string,
  entityId: string
): Promise<{ id: string; url: string }> {
  const token = useAuthStore.getState().token;

  const filename = uri.split("/").pop() || "photo.jpg";
  const match = /\.(\w+)$/.exec(filename);
  const ext = match ? match[1] : "jpg";
  const mimeType = `image/${ext === "jpg" ? "jpeg" : ext}`;

  const formData = new FormData();
  formData.append("file", {
    uri,
    name: filename,
    type: mimeType,
  } as any);
  formData.append("entity_type", entityType);
  formData.append("entity_id", entityId);

  const res = await fetch(`${API_BASE}/api/uploads`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Upload failed: ${res.status}`);
  }

  return res.json();
}
