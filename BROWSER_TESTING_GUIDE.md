# Signup Testing Guide

## 🧪 Frontend Testing Scenarios

### 1. **Returning Student Flow**
1. Go to calendar and select a class
2. Click "Sign Up" → "I'm a Returning Student"
3. Test these scenarios:
   - ✅ **Valid email** (use an email that exists in your database)
   - ❌ **Invalid email format** (e.g., "notanemail")
   - ❌ **Empty email field**
   - ❌ **Non-existent email** (use an email not in your database)
   - ❌ **Already registered email** (use an email already signed up for that class)

### 2. **New Student Flow**
1. Go to calendar and select a class
2. Click "Sign Up" → "I'm a New Student"
3. Test these scenarios:
   - ✅ **Complete valid form** with signature
   - ❌ **Missing name field**
   - ❌ **Missing email field**
   - ❌ **Invalid email format**
   - ❌ **Missing phone field**
   - ❌ **Missing signature** (try to submit without signing)
   - ❌ **Empty signature** (sign but don't save)

### 3. **Network Error Testing**
1. **Disconnect internet** and try to submit forms
2. **Slow network** - use browser dev tools to throttle connection
3. **Server down** - stop your server and try to submit

### 4. **reCAPTCHA Testing**
1. **Normal flow** - should work with reCAPTCHA
2. **reCAPTCHA blocked** - use ad blocker to block reCAPTCHA
3. **reCAPTCHA timeout** - slow down network during reCAPTCHA load

### 5. **Edge Cases**
1. **Very long names** (test with 100+ character names)
2. **Special characters** in name/email
3. **International characters** (accented letters, emojis)
4. **Very long phone numbers**
5. **Future dates** (test with dates far in the future)
6. **Past dates** (test with dates in the past)

## 🔍 What to Look For

### ✅ **Success Indicators**
- Clear success messages
- Email confirmations sent
- Form resets after successful submission
- Proper redirects to calendar
- Loading states show during processing

### ❌ **Error Indicators to Check**
- Clear, helpful error messages
- Form doesn't submit multiple times
- Loading states prevent double-clicks
- Network errors are handled gracefully
- Validation errors are specific and helpful

## 🛠️ Browser Developer Tools Testing

### Console Errors
1. Open browser dev tools (F12)
2. Go to Console tab
3. Try the signup flows
4. Look for any red error messages
5. Check for network errors in Network tab

### Network Tab
1. Go to Network tab in dev tools
2. Try signup flows
3. Check that API calls are made correctly
4. Verify response status codes
5. Check for failed requests

## 📱 Mobile Testing
1. Test on mobile devices
2. Check signature pad works on touch screens
3. Verify form validation on mobile keyboards
4. Test with different screen sizes

## 🌐 Cross-Browser Testing
Test on:
- Chrome
- Firefox
- Safari
- Edge
- Mobile browsers

## 🚨 Common Issues to Watch For

1. **Double submissions** - button should be disabled during processing
2. **Silent failures** - errors should be shown to user
3. **Loading states** - user should know something is happening
4. **Form validation** - should catch errors before submission
5. **Network timeouts** - should handle slow connections gracefully

## 📊 Performance Testing

1. **Slow connections** - test with throttled network
2. **Large signatures** - test with complex signatures
3. **Multiple tabs** - test with multiple signup forms open
4. **Memory usage** - check for memory leaks in dev tools

## 🔧 Debugging Tips

If something doesn't work:
1. Check browser console for errors
2. Check network tab for failed requests
3. Check server logs for backend errors
4. Try in incognito/private mode
5. Clear browser cache and cookies
6. Test with different browsers
