# 🌍 Time & Currency App

> One mobile app to compare time zones, weather, and currencies across 
> multiple countries — built for remote workers, travelers, and digital 
> nomads who got tired of juggling 5 different apps.

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Expo](https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white)

**Status:** Personal project • Built solo • Designed in Figma → Shipped in React Native

[📱 Watch Demo](#-demo) • [🧠 Product Decisions](#-product-decisions) • [🏗 Architecture](#-architecture)

---

## 📱 Demo

You can check the project visuals and case study in the portfolio.

> 30-second walkthrough of all three modules (Time, Weather, Currency)

https://github.com/user-attachments/assets/e4180e63-d0da-4bae-8f88-c9dd5d41eb29


### Weather:
Real-time weather comparison with expandable details such as rain, UV index and wind conditions and the "+" button to add more cities with a search bar.
<p align="left">
    <img width="28%" alt="weather" src="https://github.com/user-attachments/assets/26164e7f-bb08-46b6-862a-9b9bc4078f00" style="margin-right: 20px;" />
    <img width="28%" alt="weather info2" src="https://github.com/user-attachments/assets/23137e17-7729-4cfb-a7cb-d049ebb3ecf0" style="margin-right: 20px;" />
    <img width="28%" alt="add city search" src="https://github.com/user-attachments/assets/25db3834-ba8b-4d79-ab7e-87e5e72cb6a0" />
</p>

### Time:
Real-time comparison of multiple time zones with support for 12h/24h formats and editable time simulation for planning across locations.
<p align="left">
    <img width="28%" alt="time ampm" src="https://github.com/user-attachments/assets/44adeb1c-9a4a-4291-9e18-c796c424772d" style="margin-right: 20px;" />
    <img width="28%" alt="time 24h" src="https://github.com/user-attachments/assets/8a4dfd42-49fb-4fbe-95fc-aaa15095b491" style="margin-right: 20px;" />
    <img width="28%" alt="time 14h" src="https://github.com/user-attachments/assets/2b0974b2-7319-41ce-8cc6-1ec3115acaaf" />
</p>

### Currency:
Real-time currency conversion with flexible base selection and support for comparing multiple currencies simultaneously.
<p align="left">
    <img width="28%" alt="currency" src="https://github.com/user-attachments/assets/ae78aeb7-770d-48d2-ae68-00a77546abae" style="margin-right: 20px;" />
    <img width="28%" alt="currency add" src="https://github.com/user-attachments/assets/601eada4-bcae-40c0-b8fa-e7715ce6938c" />
    <img width="28%" alt="currency many" src="https://github.com/user-attachments/assets/68a01793-091d-4869-b798-2dba89a2e342" />
</p>

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

### Trade-offs I made

- **No user accounts (yet).** Local persistence only. Faster to build, 
  zero backend cost, and most users don't need cross-device sync for 
  this use case.
- **Context API over Redux.** App is small, state is simple. Redux 
  would have been overengineering.
- **Styled Components over Tailwind.** Personal preference for 
  component-scoped styles in React Native; would reconsider on a 
  larger team.

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

## ⚙️ Built With

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
```bash
npm install
```
### 3. Configure environment variables
Create a .env file in the root:
```bash
OPENWEATHER_API_KEY=your_key_here
CURRENCY_API_KEY=your_key_here
```
### 4. Run the project
```bash
npx expo start
```

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

## 🧭 Why this project matters

This project reflects how I approach building products:
- Start from real user needs
- Simplify complex workflows
- Balance UX decisions with technical constraints

---

## 👩‍💻 Author

**Thamires Stoppelli**  
Design Engineer — React Native + TypeScript + Figma

[![Portfolio](https://img.shields.io/badge/Portfolio-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://thamiresstoppelli-portfolio.vercel.app)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/thamires-stoppelli)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/ThamiStoppelli)
[![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:thamiresstoppelli@gmail.com)

---

## 📄 License

MIT License — see [LICENSE](LICENSE) file for details.
