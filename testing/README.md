# Signup System Testing

This folder contains testing tools and documentation for the yoga class signup system.

## 🧪 Testing Tools

### `test-signup-node.js`
Automated Node.js test suite that tests all signup scenarios:
```bash
node test-signup-node.js
```

### `test-signup-simple.sh`
Bash script for quick testing using curl:
```bash
./test-signup-simple.sh
```

### `monitor-signups.js`
Monitoring script to track signup success rates and errors:
```bash
node monitor-signups.js
```

## 📖 Documentation

### `BROWSER_TESTING_GUIDE.md`
Comprehensive manual testing guide covering:
- User scenarios
- Error conditions
- Mobile testing
- Cross-browser testing
- Performance testing

## 🚀 When to Use These Tests

- **Before deploying updates** - Ensure nothing broke
- **When issues are reported** - Quickly identify problems
- **After making changes** - Verify functionality still works
- **Regular maintenance** - Periodic health checks

## 📊 Expected Results

All tests should pass with 100% success rate. If any tests fail, check the error messages and fix the underlying issues before deploying to production.

## 🔧 Setup

Make sure your server is running on port 5001 before running tests:
```bash
cd server && npm start
```

Then run tests from the project root:
```bash
node testing/test-signup-node.js
```
