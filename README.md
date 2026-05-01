# 🌍 Time & Currency App
Built as a personal product based on real daily needs while working remotely across different countries.

A mobile application designed to simplify how people compare time zones, weather and currencies across multiple countries — all in one place.

Highly useful for travelers, remote workers and digital nomads who need fast, reliable access to global information without switching between multiple apps.

---

## ✨ Features

### 🕒 Time Comparison
- Compare multiple cities in real time
- Automatic detection of user location
- Toggle between 12h and 24h formats
- Simulate custom times to plan across time zones

### 🌤 Weather Tracking
- Current weather for selected cities
- Expandable details (rain, UV index, wind)
- Quick comparison between locations
- Sync locations with Time module

### 💱 Currency Conversion
- Real-time exchange rates
- Multiple currencies comparison
- Flexible base currency selection
- Optimized input and conversion flow

---

## 🧠 Product Decisions

### Separation of mental models
Time and Weather are location-based → can be synced  
Currency follows a different logic → remains independent  

This reduces cognitive load and prevents inconsistent behavior between features.

### Modular architecture
Each feature is built as an independent module:
- Time
- Weather
- Currency

Enables scalability and cleaner state management.

### Sync system (Time ↔ Weather)
- Users can share selected locations across modules
- Prevents duplicate inputs
- Keeps workflows fast and consistent

---

## 🏗 Architecture

The project follows a modular and scalable structure:

    src/
    ├── components/  # UI components (cards, toggles)
    ├── screens/     # Main feature screens
    ├── services/    # API integrations
    ├── hooks/       # Custom hooks (location, logic)
    ├── context/     # Global state management
    ├── storage/     # Local persistence
    ├── utils/       # Helpers and formatting
    └── data/        # Static metadata

---

## 🔌 API Integrations

- Geocoding API → city search and location resolution  
- Time API → timezone data  
- Weather API → real-time weather data  
- Currency API → exchange rates  

---

## ⚙️ Tech Stack

- React Native (Expo)
- TypeScript
- Styled Components
- Context API (global state)
- REST APIs

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/ThamiStoppelli/Time-Currency-App.git
cd Time-Currency-App
```
### 2. Install dependencies
```npm install
```
### 3. Configure environment variables
```Create a .env file in the root:
OPENWEATHER_API_KEY=your_key_here
CURRENCY_API_KEY=your_key_here
```
### 4. Run the project
npx expo start

---

## 📱 Demo

You can check the project visuals and case study in the portfolio.

https://github.com/user-attachments/assets/47939048-e025-43c8-bf0e-9a1a55341e0c

### Weather:
Real-time weather comparison with expandable details such as rain, UV index and wind conditions and the "+" button to add more cities with a search bar.
<p align="left">
    <img width="28%" height="1600" alt="weather" src="https://github.com/user-attachments/assets/26164e7f-bb08-46b6-862a-9b9bc4078f00" style="margin-right: 20px;" />
    <img width="28%" height="1600" alt="weather info2" src="https://github.com/user-attachments/assets/23137e17-7729-4cfb-a7cb-d049ebb3ecf0" style="margin-right: 20px;" />
    <img width="28%" height="1600" alt="add city search" src="https://github.com/user-attachments/assets/25db3834-ba8b-4d79-ab7e-87e5e72cb6a0" />
</p>

### Time:
Real-time comparison of multiple time zones with support for 12h/24h formats and editable time simulation for planning across locations.
<p align="left">
    <img width="28%" height="1600" alt="time" src="https://github.com/user-attachments/assets/fefb2d05-7932-4db7-9874-3b197399d3a8" style="margin-right: 20px;" />
    <img width="28%" height="1600" alt="current time" src="https://github.com/user-attachments/assets/a4748f27-d974-41cf-b80f-37ec91280015" style="margin-right: 20px;"/>
    <img width="28%" height="1600" alt="time AMPM" src="https://github.com/user-attachments/assets/a1bb9caf-b0c8-4c5b-a438-e6f31b2a8ae2" />
</p>

### Currency:
Real-time currency conversion with flexible base selection and support for comparing multiple currencies simultaneously.
<p align="left">
    <img width="28%" height="1600" alt="currency" src="https://github.com/user-attachments/assets/ae78aeb7-770d-48d2-ae68-00a77546abae" style="margin-right: 20px;" />
    <img width="28%" height="1600" alt="add currency" src="https://github.com/user-attachments/assets/d831f418-d464-4922-bef5-ff32b8775a02" style="margin-right: 20px;" />
    <img width="28%" height="1600" alt="currency many" src="https://github.com/user-attachments/assets/68a01793-091d-4869-b798-2dba89a2e342" />
</p>

---

## 🔗 Case Study

Full product case study available here:  
👉 https://thamiresstoppelli-portfolio.vercel.app/project/timecurrencyapp

---

## 🧩 Next Steps

Planned improvements focus on enhancing usability, scalability and performance:
- Drag & drop reordering for comparison lists
- Dark mode
- Multi-language support
- More robust location model (lat/lon + timezone)
- Performance optimizations (caching + fewer API calls)

---

## 📚 Learnings

- Designing for clarity is more important than adding features
- Separation of concerns improves both UX and code architecture
- Syncing data across features requires clear mental models
- API-driven apps need fallback strategies and consistency handling

---

## 👩‍💻 Author

Thamires Stoppelli
Frontend & Mobile Developer • UI/UX Designer

---

## 📄 License

This project is for portfolio purposes.
