import api from './api';

/**
 * Upload an image to the server (Cloudinary)
 */
export async function uploadImage(uri: string, folder: string = 'drinks'): Promise<string> {
  try {
    // Create form data
    const formData = new FormData();

    // Extract filename from URI
    const filename = uri.split('/').pop() || 'photo.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    // Append image to form data
    formData.append('image', {
      uri,
      name: filename,
      type,
    } as any);

    formData.append('folder', folder);

    // Upload to server
    const response = await api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.url;
  } catch (error: any) {
    console.error('Upload error:', error);
    throw new Error(error.response?.data?.error || 'Failed to upload image');
  }
}

export const uploadService = {
  uploadImage,
};
