# 🌍 Time & Currency App

A mobile application that centralizes **time zones, weather and currency conversion** into a single, intuitive comparison experience.

Built for travelers, remote workers and digital nomads who need fast, reliable access to global information without switching between multiple apps.

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

This reduces confusion and improves usability.

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
