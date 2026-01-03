# Project Management App

A modern, role-based project management application built with React Native and Firebase. This app helps teams collaborate on projects, manage tasks, and track progress in real-time.

## Features

### For All Users
- 🔐 Secure authentication with Firebase
- 👤 User profile management
- 📱 Responsive design for mobile devices
- 🎨 Themed UI based on user role

### For Team Members
- 📋 View assigned tasks
- ✅ Update task status (To Do, In Progress, Completed)
- 🔍 Search and filter tasks
- 📊 View task statistics and progress

### For Managers
- 🏗️ Create and manage projects
- 👥 Add/remove team members
- 📊 View project analytics
- 📝 Create and assign tasks
- 🎯 Set task priorities and due dates

## Tech Stack

- **Frontend**: React Native, React Navigation
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **State Management**: React Context API
- **UI Components**: React Native Paper
- **Form Handling**: Formik with Yup validation
- **Icons**: Material Icons

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- React Native CLI
- Android Studio / Xcode (for emulator)
- Firebase project setup

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/talawarsneha/project_management_app.git
   cd project_management_app
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up Firebase:
   - Create a new Firebase project
   - Enable Authentication (Email/Password)
   - Set up Firestore Database
   - Create a web app in Firebase console
   - Add your Firebase config to `src/config/firebase.js`

4. Start the development server:
   ```bash
   npx react-native start
   ```

5. Run the app:
   ```bash
   # For Android
   npx react-native run-android
   
   # For iOS
   cd ios && pod install && cd ..
   npx react-native run-ios
   ```

## Project Structure

```
src/
├── components/     # Reusable components
├── config/        # Configuration files
├── contexts/      # React Context providers
├── screens/       # App screens
│   ├── auth/      # Authentication screens
│   ├── manager/   # Manager-specific screens
│   └── member/    # Member-specific screens
├── services/      # API and service layers
└── utils/         # Utility functions
```

## Screenshots

*Add your app screenshots here*

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [React Native](https://reactnative.dev/)
- [Firebase](https://firebase.google.com/)
- [React Navigation](https://reactnavigation.org/)
- [React Native Paper](https://reactnativepaper.com/)

## Contact

Your Name - [@your_twitter](https://twitter.com/your_twitter) - your.email@example.com

Project Link: [https://github.com/talawarsneha/project_management_app](https://github.com/talawarsneha/project_management_app)
