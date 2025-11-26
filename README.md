# CookiefyManager

This document provides step-by-step instructions to set up the Cookiefy Manager App React Native application using Expo Go and JavaScript.

## Prerequisites

Before starting, ensure you have the following installed on your development machine:

- **Node.js** (LTS version 18.x or higher)
  - Download from: https://nodejs.org/
  - Verify installation: `node --version`
- **npm** (comes with Node.js) or **yarn**
  - Verify npm installation: `npm --version`
- **Visual Studio Code**
  - Download from: https://code.visualstudio.com/
- **Expo Go app** on your mobile device
  - iOS: Download from App Store
  - Android: Download from Google Play Store

## Project Setup

### Step 1: Install Expo CLI

Install the Expo command-line interface globally:

```bash
npm install -g expo-cli
```

### Step 2: Create a New Expo Project

Create a new Expo project using the following command:

```bash
npx create-expo-app cookiefy-mgmt
```

When prompted, select the **blank** template for a clean JavaScript setup.

Navigate into your project directory:

```bash
cd cookiefy-mgmt
```

### Step 3: Open Project in Visual Studio Code

Open the project in VSCode using the command line:

```bash
code .
```

Alternatively, you can:
1. Open Visual Studio Code
2. Go to **File > Open Folder**
3. Select your project directory (`cookiefy-mgmt`)

### Step 4: Install Dependencies

If dependencies aren't automatically installed, run:

```bash
npm install
```

### Step 5: Start the Development Server

Start the Expo development server:

```bash
npx expo start
```

This command will:
- Start the Metro bundler
- Open Expo DevTools in your browser
- Display a QR code in your terminal

## Running the App

### On Physical Device (Recommended)

1. Open the **Expo Go** app on your mobile device
2. Scan the QR code displayed in your terminal or browser
   - **iOS**: Use the Camera app or scan from Expo DevTools
   - **Android**: Use the Expo Go app's QR scanner
3. Your app will load on your device

### On Simulator/Emulator

**iOS Simulator** (macOS only):
```bash
# Press 'i' in the terminal after starting the dev server
```

**Android Emulator**:
```bash
# Press 'a' in the terminal after starting the dev server
```

## Recommended VSCode Extensions

Install these extensions to enhance your development experience:

1. **ES7+ React/Redux/React-Native snippets**
   - Publisher: dsznajder
   - Provides useful code snippets for React Native

2. **React Native Tools**
   - Publisher: Microsoft
   - Debugging and IntelliSense support

3. **Prettier - Code formatter**
   - Publisher: Prettier
   - Automatic code formatting

4. **ESLint**
   - Publisher: Microsoft
   - JavaScript linting and code quality

5. **React Native Snippet**
   - Publisher: jundat95
   - Additional React Native code snippets

## Project Structure

```
cookiefy-mgmt/
├── .expo/              # Expo configuration files (auto-generated)
├── assets/             # Images, fonts, and other static files
│   ├── adaptive-icon.png
│   ├── favicon.png
│   ├── icon.png
│   └── splash.png
├── node_modules/       # Installed dependencies
├── .gitignore         # Git ignore rules
├── App.js             # Main application component
├── app.json           # Expo app configuration
├── babel.config.js    # Babel configuration
├── package.json       # Project dependencies and scripts
└── package-lock.json  # Locked dependency versions
```

## Development Workflow

### Making Changes

1. Open `App.js` in Visual Studio Code
2. Make your changes
3. Save the file (Ctrl+S / Cmd+S)
4. The app will automatically reload on your device (hot reload)

### Available Scripts

```bash
# Start development server
npx expo start

# Start with cleared cache
npx expo start --clear

# Run on iOS simulator
npx expo start --ios

# Run on Android emulator
npx expo start --android

# Run on web browser
npx expo start --web
```
## Building the APK

### For Testing (APK Build)

Run the following command to build an APK for testing:

```bash
npx eas-cli build --platform android --profile preview
```

**What happens next:**
1. EAS will ask if you want to generate a new Android keystore (first time only) - select **Yes**
2. Your code will be uploaded to Expo's build servers
3. The build process takes approximately 10-20 minutes
4. You'll receive a download link when complete

### For Production (AAB Build)

For Google Play Store submission, use:

```bash
npx eas-cli build --platform android --profile production
```

This creates an `.aab` file instead of an `.apk`.

## Installing the APK on Your Device

### Method 1: Direct Download on Device

1. Open the build URL on your Android device
2. Download the APK
3. Enable "Install from Unknown Sources" in your device settings
4. Install the APK

### Method 2: Transfer from Computer

1. Download the APK from the build URL to your computer
2. Connect your Android device via USB
3. Transfer the APK file to your device
4. Use a file manager to locate and install the APK

## Testing Checklist

After installing, verify the following:

- [ ] App launches without crashing
- [ ] All screens load correctly
- [ ] Navigation works as expected
- [ ] API calls are functioning
- [ ] Environment variables are loaded properly
- [ ] All features work as in development
- [ ] Permissions are requested (if applicable)
- [ ] App doesn't crash on different Android versions

## Quick Development Testing

For rapid testing during development without building an APK:

### Option 1: Run on Connected Device

```bash
npx expo run:android
```

This builds and installs directly on a connected Android device or emulator.

### Option 2: Use Expo Go App

```bash
npx expo start
```

Scan the QR code with the Expo Go app on your device.

## Troubleshooting

### Common Issues

**Issue**: QR code not scanning
- **Solution**: Ensure your phone and computer are on the same Wi-Fi network

**Issue**: "Unable to resolve module"
- **Solution**: Clear cache and reinstall dependencies
  ```bash
  rm -rf node_modules
  npm install
  npx expo start --clear
  ```

**Issue**: Metro bundler issues
- **Solution**: Kill the process and restart
  ```bash
  # Find and kill the process using port 8081
  npx expo start --clear
  ```

**Issue**: App not updating after changes
- **Solution**: Shake your device to open the developer menu and tap "Reload"

## Useful Commands

```bash
# Update Expo CLI
npm install -g expo-cli@latest

# Install a new package
npm install package-name

# View Expo project info
npx expo whoami

# Build for production
npx expo build:android
npx expo build:ios
```

## Next Steps

- Read the [Expo Documentation](https://docs.expo.dev/)
- Check out [React Native Documentation](https://reactnative.dev/docs/getting-started)
- Explore [Expo SDK](https://docs.expo.dev/versions/latest/) for available APIs
- Join the [Expo Community](https://chat.expo.dev/) for support

## Additional Resources

- **Expo Documentation**: https://docs.expo.dev/
- **React Native Documentation**: https://reactnative.dev/
- **Expo Snack** (Online playground): https://snack.expo.dev/
- **React Navigation**: https://reactnavigation.org/

## License

This project is open source and available under the [MIT License](LICENSE).

---

**Happy Coding! 🚀**
