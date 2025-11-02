# 🩸 BloodBridge - Blood Donation Management App

> Connecting blood donors with those in need. Save lives, one donation at a time.

![BloodBridge Logo](./assets/splash-icon.png)

## 📱 About

BloodBridge is a comprehensive blood donation management application that bridges the gap between blood donors and recipients. The app enables:

- **Donors** to register, track their donations, and respond to blood requests
- **Recipients** to post blood requirements and find matching donors quickly
- **Real-time tracking** of donation history and availability
- **Location-based search** to find nearby donors
- **Partial fulfillment** allowing multiple donors to contribute to a single request

---

## ✨ Features

### For Donors
- ✅ Simple registration with blood type and location
- ✅ Browse active blood requests by urgency and location
- ✅ Donate specific units of blood
- ✅ Track donation history with dates and units
- ✅ Update availability status and profile information
- ✅ Emergency contact and medical history management

### For Recipients
- ✅ Post blood requests with urgency levels
- ✅ Search for donors by blood type and location
- ✅ View detailed donor profiles with verification status
- ✅ Contact donors directly via phone
- ✅ Partial fulfillment - multiple donors can contribute

### General Features
- 🎨 Modern, intuitive UI with professional branding
- 🔐 Secure token-based authentication
- 📊 Real-time statistics dashboard
- 🔔 Urgency-based request prioritization
- 📱 Cross-platform support (iOS, Android)
- 🌐 Offline-first architecture with data persistence

---

## 🚀 Quick Start Guide

### Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
2. **Python** (v3.8 or higher) - [Download](https://python.org/)
3. **Expo CLI** - Install globally:
   ```bash
   npm install -g expo-cli
   ```
4. **Git** - [Download](https://git-scm.com/)

### For Mobile Testing
- **Expo Go App** - Install on your phone from:
  - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
  - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

---

## 🛠️ Installation & Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/EmonThePrince/BloodBridge.git
cd BloodBridge
```

### Step 2: Backend Setup (Django)

```bash
# Navigate to backend directory
cd BloodBridge/blood_bridge_backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser (optional - for admin panel)
python manage.py createsuperuser

# Find your local IP address
# On Windows:
ipconfig
# On macOS/Linux:
ifconfig
# Look for IPv4 Address (e.g., 192.168.0.101)

# Start the backend server
python manage.py runserver <YOUR_IP>:8000
# Example: python manage.py runserver 192.168.0.101:8000
```

**Backend will run at:** `http://<YOUR_IP>:8000`

### Step 3: Frontend Setup (React Native + Expo)

```bash
# Navigate to frontend directory
cd ../../blood-bridge

# Install dependencies
npm install
# or
yarn install

# Update API configuration
# Edit src/config.js and set your IP address:
```

Open `src/config.js` and update:
```javascript
export const API_BASE_URL = 'http://YOUR_IP_ADDRESS:8000';
// Example: export const API_BASE_URL = 'http://192.168.0.101:8000';
```

```bash
# Start the Expo development server
npm start
# or
expo start
```

### Step 4: Run on Your Device

#### Option A: Physical Device (Recommended)

1. Install **Expo Go** app on your phone
2. Make sure your phone and computer are on the **same WiFi network**
3. Scan the QR code shown in the terminal/browser with:
   - **iOS**: Camera app
   - **Android**: Expo Go app
4. The app will load on your device

#### Option B: Android Emulator

```bash
# Press 'a' in the Expo terminal to open Android emulator
```

#### Option C: iOS Simulator (Mac only)

```bash
# Press 'i' in the Expo terminal to open iOS simulator
```

---

## 📂 Project Structure

```
BloodBridge/
├── blood-bridge/                 # Frontend (React Native + Expo)
│   ├── src/
│   │   ├── screens/             # App screens
│   │   │   ├── HomeTab.js       # Dashboard
│   │   │   ├── DonateTab.js     # Browse & donate
│   │   │   ├── SearchTab.js     # Find donors
│   │   │   ├── RequestTab.js    # Post requests
│   │   │   ├── ProfileTab.js    # User profile
│   │   │   ├── LoginScreen.js   # Authentication
│   │   │   └── RegisterScreen.js
│   │   ├── context/             # State management
│   │   │   └── AuthContext.js
│   │   └── config.js            # API configuration
│   ├── assets/                  # Images & icons
│   ├── App.js                   # Main app component
│   ├── app.json                 # Expo configuration
│   └── package.json             # Dependencies
│
└── BloodBridge/
    └── blood_bridge_backend/    # Backend (Django)
        ├── api/                 # Main API app
        │   ├── models.py        # Database models
        │   ├── serializers.py   # API serializers
        │   ├── views.py         # API endpoints
        │   └── urls.py          # URL routing
        ├── backend/             # Django settings
        │   └── settings.py
        ├── db.sqlite3           # SQLite database
        ├── manage.py            # Django management
        └── requirements.txt     # Python dependencies
```

---

## 🔧 Configuration

### Backend Configuration

Edit `backend/settings.py`:

```python
# Allow connections from your network
ALLOWED_HOSTS = ['localhost', '127.0.0.1', 'YOUR_IP_ADDRESS']

# CORS settings (already configured)
CORS_ALLOW_ALL_ORIGINS = True  # For development

# Database (SQLite - default)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```

### Frontend Configuration

Edit `src/config.js`:

```javascript
// Set to your computer's local IP address
export const API_BASE_URL = 'http://192.168.0.101:8000';
```

---

## 📱 Building for Production

### Android APK Build

```bash
cd blood-bridge

# Install EAS CLI
npm install -g eas-cli

# Login to Expo account
eas login

# Configure EAS build
eas build:configure

# Build Android APK
eas build --platform android --profile preview

# Or build AAB for Play Store
eas build --platform android --profile production
```

### iOS Build (Mac only)

```bash
# Build iOS app
eas build --platform ios --profile production
```

The build will be available in your Expo account dashboard.

---

## 🎯 Usage Guide

### For Donors

1. **Register/Login**
   - Tap "Register" on the home screen
   - Fill in your details (name, blood group, location, contact)
   - Set password and submit

2. **Browse Blood Requests**
   - Navigate to "Donate" tab
   - View requests filtered by your blood type and location
   - Check urgency levels (Critical, Urgent, High, etc.)

3. **Donate Blood**
   - Tap on a request to view details
   - Click "I Can Donate Blood"
   - Enter the number of units you can donate
   - Confirm donation

4. **Update Profile**
   - Go to "Profile" tab
   - Edit your availability, contact info, medical history
   - View your donation history

### For Recipients

1. **Post Blood Request**
   - Go to "Request" tab
   - Fill in patient details, blood group, units needed
   - Set urgency level and required date
   - Submit request

2. **Search for Donors**
   - Navigate to "Search" tab
   - Filter by blood type and location
   - View donor profiles with donation history
   - Contact donors directly via phone

---

## 🔐 API Endpoints

### Authentication
- `POST /api/donors/login/` - Donor login
- `POST /api/donors/` - Register new donor

### Donors
- `GET /api/donors/` - List all donors
- `GET /api/donors/{id}/` - Get donor details
- `PATCH /api/donors/{id}/` - Update donor profile
- `DELETE /api/donors/delete_account/` - Delete account

### Blood Requests
- `GET /api/requests/` - List active requests
- `POST /api/requests/` - Create new request
- `POST /api/requests/{id}/donated/` - Mark donation (with units)
- `DELETE /api/requests/{id}/` - Delete request

### Donation History
- `GET /api/donations/my_donations/` - Get user's donation history

### Statistics
- `GET /api/requests/stats/` - Get dashboard statistics

---

## 🐛 Troubleshooting

### Common Issues

**1. Cannot connect to backend**
- ✅ Ensure backend is running (`python manage.py runserver <IP>:8000`)
- ✅ Check if both devices are on the same WiFi
- ✅ Verify IP address in `src/config.js` matches your computer's IP
- ✅ Check firewall settings - allow port 8000

**2. Expo app won't load**
```bash
# Clear Expo cache
expo start -c
# or
npm start -- --reset-cache
```

**3. Module not found errors**
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

**4. Database errors**
```bash
# Reset database
cd blood_bridge_backend
rm db.sqlite3
python manage.py makemigrations
python manage.py migrate
```

**5. Port already in use**
```bash
# Backend
python manage.py runserver <IP>:8001

# Frontend - Update config.js to match new port
```

---

## 🎨 Customization

### Change Theme Colors

Edit styles in each screen file:

```javascript
// Primary Red: #E53935
// Dark Red: #C62828
// Light Red: #FFEBEE
// Teal: #95E1D3 (for accents)
```

### Update Logo

Replace files in `assets/` directory:
- `icon.png` - App icon (1024x1024)
- `splash-icon.png` - Logo for screens (512x512)
- `adaptive-icon.png` - Adaptive icon for Android

### Modify App Name

Edit `app.json`:
```json
{
  "expo": {
    "name": "Your App Name",
    "slug": "your-app-slug"
  }
}
```

---

## 📊 Database Schema

### Donor Model
- name, bloodGroup, contact, location
- age, weight, bloodPressure
- lastDonated, donationCount, availability
- emergencyContact, medicalHistory, notes
- verified status, registration date

### Blood Request Model
- name, bloodGroup, contact, location
- hospital, patientAge, unitsNeeded
- urgency (Critical/Urgent/High/Medium/Low)
- requiredBy date, status
- notes, requestedAt timestamp

### Donation History Model
- donor (ForeignKey)
- bloodRequest (ForeignKey)
- donationDate (auto-generated)
- unitsDonated
- hospital, location, notes

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👨‍💻 Author

**Saim Ahmed Emon**
- Student at University of Rajshahi
- Department of Computer Science and Engineering
- GitHub: [@EmonThePrince](https://github.com/EmonThePrince)

---

## 🙏 Acknowledgments

- React Native & Expo for cross-platform development
- Django REST Framework for robust backend
- All blood donors who save lives every day

---

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Email: [your-email@example.com]

---

## 🎯 Roadmap

- [ ] Push notifications for urgent requests
- [ ] Real-time chat between donors and recipients
- [ ] Blood bank integration
- [ ] Appointment scheduling
- [ ] Multi-language support
- [ ] Dark mode theme
- [ ] Social sharing features

---

## ⚠️ Disclaimer

This app is designed to facilitate blood donation coordination. Always consult with medical professionals and follow proper blood donation protocols. The app developers are not responsible for any medical decisions made using this platform.

---

**Made with ❤️ for saving lives**

🩸 Every drop counts. Every donor matters.
