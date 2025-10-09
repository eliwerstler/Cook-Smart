# TRAP App - Testing Guide

## 🧪 Test User Accounts

I've created 5 test accounts for you to test the app's social features:

| Username | Email | Password |
|----------|-------|----------|
| `sarah_drinks` | sarah@test.com | password123 |
| `mike_party` | mike@test.com | password123 |
| `jen_cocktails` | jen@test.com | password123 |
| `alex_beers` | alex@test.com | password123 |
| `chris_wine` | chris@test.com | password123 |

Plus your main account:
- `eliwerstler` / eliwerstler@gmail.com

## 🎯 How to Test the App

### 1. **Test User Search & Friend Requests**

**On your main account (`eliwerstler`):**
1. Open the app
2. Go to the **Discover** tab (magnifying glass icon)
3. Search for "sarah" - you should see `sarah_drinks`
4. Tap the blue + button to send a friend request
5. Search for "mike" and send a friend request to `mike_party`
6. Search for "jen" and send a friend request to `jen_cocktails`

**Log out and test accepting requests:**
1. Tap your profile picture → Log out
2. Log in as `sarah_drinks` / password123
3. Go to the **Friends** tab (people icon)
4. Tap on "Requests" tab - you should see a friend request from `eliwerstler`
5. Tap **Accept** button
6. The request should move to your Friends list!

### 2. **Test Friend Search States**

**Back on `eliwerstler` account:**
1. Go to Discover tab
2. Search for "sarah" again
3. Notice the status changed from "+" button to "✓ Friends" badge
4. Search for "mike" - should show "Cancel" button (pending request you sent)
5. Tap Cancel to remove the friend request

### 3. **Test Posting Drinks**

**On any account:**
1. Tap the blue **+** button in the center of the bottom tab bar
2. Allow camera permissions if prompted
3. Take a photo (or skip and use placeholder)
4. Select a drink type (e.g., Beer 🍺)
5. Add a caption like "First drink of the night! 🎉"
6. Tap **Post**
7. Go to Home tab - your drink should appear!

**Create drinks on multiple accounts:**
- Post 2-3 drinks from `eliwerstler`
- Post 1-2 drinks from `sarah_drinks` (after accepting friend request)
- Post 1 drink from `alex_beers`

### 4. **Test the Feed**

**On `eliwerstler` account:**
1. Go to **Home** tab
2. You should see:
   - Your own drinks
   - Drinks from `sarah_drinks` (because you're friends)
   - You should NOT see drinks from `alex_beers` (not friends)
3. Pull down to refresh the feed
4. Tap the **heart** icon to like a drink
5. Tap the **comment** icon to open comments
6. Add a comment like "Cheers! 🍻"

### 5. **Test Comments**

1. Tap the comment bubble on any drink
2. Type a comment in the text box
3. Tap **Post**
4. Your comment should appear immediately
5. Close the modal
6. Notice the comment count increased on the drink card
7. Tap comments again to see your comment persisted

### 6. **Test Profile**

**On any account:**
1. Go to **Profile** tab (person icon)
2. You should see:
   - Your avatar (first letter of username)
   - Your stats (drinks, standards, peak BPH)
   - All your posted drinks below
3. Tap heart/comment on your own posts
4. Pull down to refresh

### 7. **Test Friends Management**

**On `eliwerstler` account:**
1. Go to **Friends** tab
2. **Friends** sub-tab should show:
   - `sarah_drinks` with stats
   - Tap the remove icon (person-minus) to test unfriend
   - Confirm the removal dialog
3. **Requests** sub-tab should show:
   - Any pending incoming requests
   - Badge notification if there are pending requests
4. Pull down to refresh

### 8. **Test Multiple Accounts Simultaneously**

**Use multiple devices or log out/in:**

**Device 1 - `eliwerstler`:**
1. Send friend request to `jen_cocktails`
2. Post a new drink

**Device 2 - `jen_cocktails`:**
1. Go to Friends → Requests tab
2. Accept the request from `eliwerstler`
3. Go to Home tab
4. Pull to refresh
5. You should now see `eliwerstler`'s drinks!

### 9. **Test Session & BPH Calculation**

**On any account:**
1. Post a Beer (1.0 standard drinks)
2. Wait 30 seconds
3. Post another Beer (1.0 standard drinks)
4. Go to Profile tab
5. Check your stats:
   - Lifetime Drinks: 2
   - Total Standards: 2.0
   - Peak BPH: Should show ~2.0 (2 drinks in first hour)

### 10. **Test Empty States**

**Create a new test account:**
1. Register as a new user
2. Check each screen:
   - **Home**: "No posts yet" message
   - **Friends**: "No friends yet" message
   - **Discover**: Search prompt
   - **Profile**: "No posts yet" message

## 🐛 What to Look For (Known Limitations)

✅ **Working:**
- User registration and login
- Auto-login (for development)
- Sending/accepting/rejecting friend requests
- Posting drinks with camera
- Viewing feed from friends only
- Like/unlike drinks
- Adding/viewing comments
- Friend search with status
- Session auto-creation
- BPH calculation
- Pull-to-refresh everywhere

⚠️ **Not Yet Implemented:**
- Actual photo upload (using placeholders)
- Real-time notifications
- Push notifications
- Groups/Leaderboards
- Photo gallery (can only take new photos)
- Edit/delete drinks
- User profile editing

## 📱 Quick Test Scenario

**5-Minute Full Feature Test:**

1. **Login** as `eliwerstler`
2. **Search** for "sarah", send friend request
3. **Logout**, login as `sarah_drinks`
4. **Accept** friend request in Friends tab
5. **Post** a drink with camera
6. **Logout**, login back as `eliwerstler`
7. **Refresh** Home tab - see sarah's drink
8. **Like** sarah's drink
9. **Comment** "Nice!" on sarah's drink
10. **Post** your own drink
11. **Check** Profile tab - see your stats update

Done! You've tested:
- ✅ Authentication
- ✅ Friend requests
- ✅ Posting drinks
- ✅ Feed filtering
- ✅ Likes
- ✅ Comments
- ✅ Stats tracking

## 🎉 Have Fun Testing!

All test accounts use the same password: **password123**

Feel free to create more test users or test different scenarios!
