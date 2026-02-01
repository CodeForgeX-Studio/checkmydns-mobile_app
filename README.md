# Check My DNS Mobile

The **Check My DNS Mobile App** is the official mobile companion of [checkmydns.online](https://checkmydns.online).  
This app brings the same DNS check functionality to mobile devices, allowing users to quickly test and verify their DNS configuration anywhere, anytime.

## Purpose

The mobile version of Check My DNS is designed as an alternative to the web-based version.  
In the future, the web version might be limited or phased out, depending on user adoption and feedback regarding the mobile experience.  
For now, both versions are available and actively supported.

Because the mobile app relies on the **public API of the web version**, both are expected to coexist. The web version serves as the backbone for DNS lookups and data handling, while the mobile app provides a more streamlined, native interface.

If both continue long term, the **web version** may receive updates more frequently, as **mobile updates take longer** due to build and store submission processes.

## Platform Availability

- **Android:** The app will be released first on Android very soon.  
- **iOS (iPhone):** An iOS version is planned, but there is no confirmed release date yet.

## Tech Stack

This project is built using **[Expo](https://expo.dev/)**, a framework for developing cross-platform React Native applications.

- Framework: Expo (React Native)  
- Language: JavaScript / TypeScript  
- Target platforms: Android and iOS

## Deployment Status

The source code in this repository is fully ready for deployment to both Android and iOS.  
Only the final build and publishing steps remain.

- Ready for Android deployment  
- Ready for iOS deployment (pending build)  
- Awaiting store release

## Repository Contents

This repository includes the complete source code of the Check My DNS mobile app, including configuration files, dependencies, and assets.  
You can clone, build, or test the app locally for development and contribution.

## Development

To run the app locally:

```bash
# Install dependencies
npm install

# Run in development mode
npx expo start
```

The **Expo Go** app is required on your mobile device to preview and test the project in real time.

## Future Plans

- Continued optimization of the DNS testing engine through the shared API.  
- Potential integration of push notifications for network status alerts.  
- Improved offline support and caching.  
- UI/UX refinement to enhance the mobile experience.  
- Possible synchronization features between the mobile app and the web dashboard.  

## Project Links

- Website: [checkmydns.online](https://checkmydns.online)  
- Android release: Coming soon  
- iOS release: To be announced