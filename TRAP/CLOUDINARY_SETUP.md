# Cloudinary Setup Guide

## 📸 Why Cloudinary?

Cloudinary provides free image hosting with automatic optimization, resizing, and CDN delivery. Perfect for a social app like TRAP!

## 🚀 Quick Setup (5 minutes)

### 1. Create a Free Cloudinary Account

1. Go to https://cloudinary.com
2. Click "Sign Up for Free"
3. Use your email or sign up with Google/GitHub
4. Verify your email

### 2. Get Your Credentials

After signing up:

1. You'll be on the Dashboard
2. Look for the "Product Environment Credentials" section
3. You'll see three values:
   - **Cloud Name** (e.g., `dxxxxxxxxx`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz123`)

### 3. Add Credentials to Backend

Open `/backend/.env` and update:

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name-here
CLOUDINARY_API_KEY=your-api-key-here
CLOUDINARY_API_SECRET=your-api-secret-here
```

**Example:**
```env
CLOUDINARY_CLOUD_NAME=dxyz123abc
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=a1b2c3d4e5f6g7h8i9j0
```

### 4. Restart Backend Server

```bash
# If server is running, stop it (Ctrl+C)
# Then restart:
cd backend
npm run dev
```

### 5. Test It!

1. Open your TRAP mobile app
2. Tap the + button to post a drink
3. Take a photo
4. Select drink type and post
5. The photo will upload to Cloudinary!
6. Check your Cloudinary dashboard → Media Library to see the uploaded image

## ✅ How It Works

### Upload Flow:

```
1. User takes photo in app
   ↓
2. Photo saved locally on phone
   ↓
3. App uploads photo to backend (/api/upload/image)
   ↓
4. Backend uploads to Cloudinary
   ↓
5. Cloudinary returns public URL
   ↓
6. Backend saves drink with Cloudinary URL
   ↓
7. Photo displays in feed from Cloudinary CDN
```

### Image Optimizations Applied:

- ✅ Max size: 1080x1080 pixels
- ✅ Automatic quality optimization
- ✅ Automatic format conversion (WebP when supported)
- ✅ CDN delivery for fast loading
- ✅ Organized in `trap/drinks/` folder

## 📊 Free Tier Limits

Cloudinary's free tier includes:
- ✅ 25 GB storage
- ✅ 25 GB monthly bandwidth
- ✅ Unlimited transformations
- ✅ CDN delivery

This is **plenty for testing** and early users!

## 🔍 Verify Upload

### Check Cloudinary Dashboard:

1. Go to https://console.cloudinary.com
2. Click "Media Library" in the left sidebar
3. Navigate to `trap/drinks/` folder
4. You should see your uploaded images!

### Check Network Requests:

In your app logs, you should see:
```
Uploading photo to Cloudinary...
Photo uploaded successfully: https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/...
```

## ⚠️ Troubleshooting

### "Upload failed" error:

1. **Check credentials**: Make sure `.env` has correct values
2. **Restart backend**: Stop and restart `npm run dev`
3. **Check logs**: Look at backend terminal for errors
4. **Verify account**: Make sure your Cloudinary account is verified

### "No image file provided":

This means the photo didn't upload from the app. Check:
- Camera permissions are granted
- Photo was actually taken (not skipped)
- Network connection is working

### Photos not showing in feed:

1. Check that the URL in the database starts with `https://res.cloudinary.com`
2. Verify the image exists in Cloudinary dashboard
3. Try opening the URL directly in a browser

## 🎉 Success!

Once setup, your photos will:
- ✅ Upload automatically when posting drinks
- ✅ Load fast from CDN
- ✅ Be automatically optimized
- ✅ Work on all devices

No need to manage storage or worry about image sizes!

## 💡 Optional: Test Without Cloudinary

If you don't want to set up Cloudinary yet, the app still works:
- Photos won't actually upload
- Placeholder images will be used
- All other features work normally

To test with placeholders:
- Leave `.env` credentials as-is
- Take/post photos normally
- They'll use placeholder URLs instead
