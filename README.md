# Menuteca 🍽️

A restaurant discovery and menu browsing application built with Expo and React Native.

## Features

- 🔍 Discover restaurants near you
- 📱 Browse restaurant menus
- ⭐ Read and write reviews
- 🗺️ Interactive map integration
- 📤 Share restaurants via deep links
- 🌐 Web, iOS, and Android support
- 🌍 Multi-language support (ES, CA, EN, FR)

## Tech Stack

- **Framework**: Expo 53 + React Native
- **Router**: Expo Router (file-based routing)
- **UI**: React Native components with custom styling
- **State Management**: Zustand
- **Backend**: Supabase
- **Maps**: React Native Maps
- **Authentication**: Google OAuth, Apple Sign-In

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

### Installation

1. Clone the repository
   ```bash
   git clone <your-repo-url>
   cd menuteca-expo
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

4. Start the development server
   ```bash
   npm start
   ```

### Running on Different Platforms

```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## Deployment

### Web Deployment (Netlify)

See **[NETLIFY_DEPLOYMENT.md](./NETLIFY_DEPLOYMENT.md)** for complete instructions.

Quick deploy:
```bash
# Build for web
npm run build:web

# Preview locally
npm run preview:web

# Deploy to Netlify
npm run deploy:netlify
```

### Mobile Deployment (EAS)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

## Deep Linking

The app supports deep linking for sharing restaurants:

- **Web**: `https://menutecaapp.com/restaurant/123`
- **Mobile**: `menutecaapp://restaurant/123`

See **[DEEP_LINKING_SETUP.md](./DEEP_LINKING_SETUP.md)** for setup instructions.

## Project Structure

```
menuteca-expo/
├── app/                    # Expo Router pages (file-based routing)
│   ├── (tabs)/            # Tab navigation
│   ├── auth/              # Authentication screens
│   ├── profile/           # Profile screens
│   └── restaurant/        # Restaurant screens
├── assets/                # Images, fonts, icons
├── components/            # Reusable components
├── api/                   # API service layer
├── hooks/                 # Custom React hooks
├── shared/                # Shared utilities and types
│   ├── functions/         # Utility functions
│   └── types.ts           # TypeScript types
├── locales/               # i18n translations
├── zustand/               # Zustand stores
├── public/                # Static files for web
└── netlify.toml           # Netlify configuration
```

## Available Scripts

### Development
- `npm start` - Start Expo development server
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android emulator
- `npm run web` - Run on web browser

### Web Deployment
- `npm run build:web` - Build for production (web)
- `npm run preview:web` - Preview production build locally
- `npm run deploy:netlify` - Deploy to Netlify

### Utilities
- `npm run lint` - Run ESLint
- `npm run reset-project` - Reset to starter template

## Environment Variables

Required environment variables (see `.env.example`):

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_KEY=your_supabase_key
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_google_client_id
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

## Configuration Files

- **`app.json`** - Expo configuration
- **`netlify.toml`** - Netlify deployment configuration
- **`eas.json`** - EAS Build configuration
- **`tsconfig.json`** - TypeScript configuration

## Documentation

- **[DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md)** - Deployment overview
- **[NETLIFY_DEPLOYMENT.md](./NETLIFY_DEPLOYMENT.md)** - Web deployment guide
- **[DEEP_LINKING_SETUP.md](./DEEP_LINKING_SETUP.md)** - Deep linking setup

## Features in Detail

### Restaurant Discovery
- Search restaurants by name, cuisine, location
- Filter by price, rating, distance, categories
- View on interactive map
- Get directions via Google Maps, Apple Maps, or Waze

### Menu Browsing
- View daily menus with pricing
- Filter by dietary requirements (vegan, gluten-free, etc.)
- AI-powered menu scanning from photos
- Multi-language menu support

### Reviews & Ratings
- Read user reviews
- Write and edit your own reviews
- Upload photos with reviews
- Restaurant response to reviews

### User Profiles
- Manage multiple restaurants
- View your reviews
- Edit profile information
- Language preferences

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary software. All rights reserved.

## Support

For issues or questions:
- Create an issue on GitHub
- Contact: support@menutecaapp.com

## Acknowledgments

- Built with [Expo](https://expo.dev)
- Hosted on [Netlify](https://netlify.com)
- Backend powered by [Supabase](https://supabase.com)

---

Made with ❤️ by the Menuteca team
