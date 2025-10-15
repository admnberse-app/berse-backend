# Metadata API Documentation

## Overview
The Metadata API provides endpoints for accessing countries, regions, timezones, and other reference data. All endpoints use Redis caching for optimal performance.

**Base URL:**
- **Production:** `https://api.berse-app.com/v2/metadata`
- **Development:** `http://localhost:3000/v2/metadata`

**Authentication:** None required (public endpoints)

> **Note:** All metadata endpoints are cached with Redis for 100-160x faster response times.

---

## Table of Contents
- [Countries](#countries)
  - [Get All Countries](#get-all-countries)
  - [Get Country by Code](#get-country-by-code)
  - [Search Countries](#search-countries)
- [Regions](#regions)
  - [Get All Regions](#get-all-regions)
  - [Get Countries by Region](#get-countries-by-region)
- [Timezones](#timezones)
  - [Get All Timezones](#get-all-timezones)
- [Caching](#caching)
- [Examples](#examples)

---

## Countries

### Get All Countries
Get a complete list of all countries with their details.

**Endpoint:** `GET /v2/metadata/countries`

**Cache:** 1 day (86400 seconds)

**Query Parameters:** None

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "countries": [
      {
        "code": "MY",
        "code3": "MYS",
        "name": "Malaysia",
        "officialName": "Malaysia",
        "capital": "Kuala Lumpur",
        "region": "Asia",
        "subregion": "South-Eastern Asia",
        "currencies": {
          "MYR": {
            "name": "Malaysian ringgit",
            "symbol": "RM"
          }
        },
        "languages": {
          "msa": "Malay"
        },
        "flag": "🇲🇾",
        "dialCode": "+60"
      },
      {
        "code": "US",
        "code3": "USA",
        "name": "United States",
        "officialName": "United States of America",
        "capital": "Washington, D.C.",
        "region": "Americas",
        "subregion": "North America",
        "currencies": {
          "USD": {
            "name": "United States dollar",
            "symbol": "$"
          }
        },
        "languages": {
          "eng": "English"
        },
        "flag": "🇺🇸",
        "dialCode": "+1"
      }
    ],
    "total": 250
  }
}
```

**Use Cases:**
- Populate country dropdowns in forms
- Display country flags
- Get dial codes for phone numbers
- Show currency information

---

### Get Country by Code
Get detailed information for a specific country.

**Endpoint:** `GET /v2/metadata/countries/:code`

**Cache:** 1 day

**URL Parameters:**
- `code` (required) - ISO 3166-1 alpha-2 country code (e.g., "MY", "US", "SG")

**Example:**
```
GET /v2/metadata/countries/MY
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "code": "MY",
    "code3": "MYS",
    "name": "Malaysia",
    "officialName": "Malaysia",
    "nativeName": {
      "msa": {
        "official": "Malaysia",
        "common": "Malaysia"
      }
    },
    "capital": "Kuala Lumpur",
    "region": "Asia",
    "subregion": "South-Eastern Asia",
    "currencies": {
      "MYR": {
        "name": "Malaysian ringgit",
        "symbol": "RM"
      }
    },
    "languages": {
      "msa": "Malay"
    },
    "flag": "🇲🇾",
    "dialCode": "+60",
    "timezones": [
      "UTC+08:00"
    ],
    "coordinates": [2.5, 112.5],
    "nationality": "Malaysian"
  }
}
```

**Error Responses:**
- `404` - Country not found

**Additional Fields:**
- `nativeName` - Country name in native languages
- `timezones` - Array of timezone offsets
- `coordinates` - [latitude, longitude] of country center
- `nationality` - Demonym for country citizens

---

### Search Countries
Search for countries by name, code, or filter by region.

**Endpoint:** `GET /v2/metadata/countries/search`

**Cache:** 1 hour (3600 seconds)

**Query Parameters:**
- `q` (optional) - Search query (searches name, official name, and country codes)
- `region` (optional) - Filter by region (Africa, Americas, Asia, Europe, Oceania)

**Examples:**
```
GET /v2/metadata/countries/search?q=mala
GET /v2/metadata/countries/search?region=Asia
GET /v2/metadata/countries/search?q=united&region=Americas
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "countries": [
      {
        "code": "MY",
        "code3": "MYS",
        "name": "Malaysia",
        "officialName": "Malaysia",
        "capital": "Kuala Lumpur",
        "region": "Asia",
        "subregion": "South-Eastern Asia",
        "flag": "🇲🇾",
        "dialCode": "+60"
      }
    ],
    "total": 1
  }
}
```

**Search Logic:**
- Case-insensitive search
- Searches in: common name, official name, ISO codes (2 & 3 letter)
- Region filter is exact match
- Returns empty array if no matches found

**Use Cases:**
- Autocomplete in country selection
- Filtered country lists by region
- Quick lookup by country code

---

## Regions

### Get All Regions
Get a list of all unique geographic regions.

**Endpoint:** `GET /v2/metadata/regions`

**Cache:** 1 day

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "regions": [
      "Africa",
      "Americas",
      "Asia",
      "Europe",
      "Oceania"
    ],
    "total": 5
  }
}
```

**Use Cases:**
- Regional filtering options
- Geographic analysis
- User preferences by region

---

### Get Countries by Region
Get all countries in a specific geographic region.

**Endpoint:** `GET /v2/metadata/regions/:region/countries`

**Cache:** 1 day

**URL Parameters:**
- `region` (required) - Region name (Africa, Americas, Asia, Europe, Oceania)

**Example:**
```
GET /v2/metadata/regions/Asia/countries
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "region": "Asia",
    "countries": [
      {
        "code": "MY",
        "name": "Malaysia",
        "capital": "Kuala Lumpur",
        "flag": "🇲🇾",
        "dialCode": "+60"
      },
      {
        "code": "SG",
        "name": "Singapore",
        "capital": "Singapore",
        "flag": "🇸🇬",
        "dialCode": "+65"
      }
    ],
    "total": 50
  }
}
```

**Error Responses:**
- `404` - No countries found in specified region

**Use Cases:**
- Regional user directories
- Region-specific features
- Geographic analytics

---

## Timezones

### Get All Timezones
Get a complete list of all unique timezones from all countries.

**Endpoint:** `GET /v2/metadata/timezones`

**Cache:** 1 day

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "timezones": [
      "UTC",
      "UTC+01:00",
      "UTC+02:00",
      "UTC+03:00",
      "UTC+03:30",
      "UTC+04:00",
      "UTC+04:30",
      "UTC+05:00",
      "UTC+05:30",
      "UTC+05:45",
      "UTC+06:00",
      "UTC+06:30",
      "UTC+07:00",
      "UTC+08:00",
      "Asia/Kuala_Lumpur",
      "Asia/Singapore",
      "America/New_York",
      "Europe/London"
    ],
    "total": 400
  }
}
```

**Notes:**
- Includes both UTC offset format and IANA timezone names
- Sorted alphabetically
- Useful for timezone selection in user profiles

**Use Cases:**
- Timezone dropdown in settings
- Scheduling and event planning
- Time conversion utilities

---

## Caching

### Cache Strategy
All metadata endpoints use **Redis caching** with a cache-aside pattern for optimal performance.

### Cache Keys
| Endpoint | Cache Key | TTL |
|----------|-----------|-----|
| Get All Countries | `metadata:countries:all` | 1 day |
| Get Country by Code | `metadata:country:{CODE}` | 1 day |
| Search Countries | `metadata:countries:search:{query}:{region}` | 1 hour |
| Get Regions | `metadata:regions:all` | 1 day |
| Get Countries by Region | `metadata:region:{region}:countries` | 1 day |
| Get Timezones | `metadata:timezones:all` | 1 day |

### Performance Improvements
- **Cache Hit Rate:** 95%+
- **Response Time:** 3-5ms (cached) vs 300-800ms (uncached)
- **Speed Improvement:** 100-160x faster
- **Memory Usage:** ~5MB for all countries data

### Cache Invalidation
Cache automatically expires based on TTL. Manual invalidation (if needed):

```bash
# Clear specific cache
redis-cli DEL "metadata:countries:all"

# Clear all metadata cache
redis-cli KEYS "metadata:*" | xargs redis-cli DEL

# Check cache status
redis-cli GET "metadata:countries:all"
redis-cli TTL "metadata:countries:all"
```

---

## Examples

### JavaScript/Fetch Examples

**Get All Countries:**
```javascript
const getCountries = async () => {
  const response = await fetch('https://api.berse-app.com/v2/metadata/countries');
  const data = await response.json();
  
  if (data.success) {
    return data.data.countries;
  }
};

// Use in dropdown
const countries = await getCountries();
countries.forEach(country => {
  console.log(`${country.flag} ${country.name} (${country.code})`);
});
```

**Search Countries:**
```javascript
const searchCountries = async (query) => {
  const response = await fetch(
    `https://api.berse-app.com/v2/metadata/countries/search?q=${encodeURIComponent(query)}`
  );
  const data = await response.json();
  return data.data.countries;
};

// Autocomplete
const results = await searchCountries('mala');
// Returns Malaysia, Malawi, Mali, etc.
```

**Get Country Details:**
```javascript
const getCountryDetails = async (code) => {
  const response = await fetch(
    `https://api.berse-app.com/v2/metadata/countries/${code}`
  );
  const data = await response.json();
  return data.data;
};

const malaysia = await getCountryDetails('MY');
console.log(`Capital: ${malaysia.capital}`);
console.log(`Currency: ${Object.keys(malaysia.currencies)[0]}`);
console.log(`Nationality: ${malaysia.nationality}`);
```

**Get Countries by Region:**
```javascript
const getAsianCountries = async () => {
  const response = await fetch(
    'https://api.berse-app.com/v2/metadata/regions/Asia/countries'
  );
  const data = await response.json();
  return data.data.countries;
};
```

### cURL Examples

**Get All Countries:**
```bash
curl https://api.berse-app.com/v2/metadata/countries
```

**Search Countries:**
```bash
curl "https://api.berse-app.com/v2/metadata/countries/search?q=united&region=Americas"
```

**Get Country by Code:**
```bash
curl https://api.berse-app.com/v2/metadata/countries/MY
```

**Get All Regions:**
```bash
curl https://api.berse-app.com/v2/metadata/regions
```

**Get Asian Countries:**
```bash
curl https://api.berse-app.com/v2/metadata/regions/Asia/countries
```

**Get All Timezones:**
```bash
curl https://api.berse-app.com/v2/metadata/timezones
```

### React Native/Mobile Examples

**Country Picker Component:**
```typescript
import React, { useState, useEffect } from 'react';
import { View, Picker } from 'react-native';

const CountryPicker = ({ onSelect }) => {
  const [countries, setCountries] = useState([]);
  
  useEffect(() => {
    fetch('https://api.berse-app.com/v2/metadata/countries')
      .then(res => res.json())
      .then(data => setCountries(data.data.countries));
  }, []);
  
  return (
    <Picker onValueChange={onSelect}>
      <Picker.Item label="Select Country" value="" />
      {countries.map(country => (
        <Picker.Item 
          key={country.code}
          label={`${country.flag} ${country.name}`}
          value={country.code}
        />
      ))}
    </Picker>
  );
};
```

**Country Search with Autocomplete:**
```typescript
const CountryAutocomplete = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  
  const searchCountries = async (searchQuery) => {
    if (searchQuery.length < 2) return;
    
    const response = await fetch(
      `https://api.berse-app.com/v2/metadata/countries/search?q=${searchQuery}`
    );
    const data = await response.json();
    setResults(data.data.countries);
  };
  
  useEffect(() => {
    const debounce = setTimeout(() => {
      searchCountries(query);
    }, 300);
    
    return () => clearTimeout(debounce);
  }, [query]);
  
  return (
    <View>
      <TextInput 
        value={query}
        onChangeText={setQuery}
        placeholder="Search countries..."
      />
      <FlatList
        data={results}
        renderItem={({ item }) => (
          <Text>{item.flag} {item.name}</Text>
        )}
      />
    </View>
  );
};
```

**Region Filter:**
```typescript
const RegionFilter = ({ onRegionSelect }) => {
  const [regions, setRegions] = useState([]);
  
  useEffect(() => {
    fetch('https://api.berse-app.com/v2/metadata/regions')
      .then(res => res.json())
      .then(data => setRegions(data.data.regions));
  }, []);
  
  return (
    <View style={{ flexDirection: 'row' }}>
      {regions.map(region => (
        <Button
          key={region}
          title={region}
          onPress={() => onRegionSelect(region)}
        />
      ))}
    </View>
  );
};
```

---

## Data Source

All country data is sourced from the **REST Countries API** via the `@yusifaliyevpro/countries` library, which provides:

- ✅ 250+ countries with complete data
- ✅ ISO 3166-1 alpha-2 and alpha-3 codes
- ✅ Official and common names in multiple languages
- ✅ Currencies with symbols
- ✅ Languages with ISO codes
- ✅ Geographic coordinates
- ✅ Timezones
- ✅ Calling codes
- ✅ Flag emojis
- ✅ Regularly updated data

---

## Best Practices

### 1. Caching on Client Side
Since the data is already cached on the server, you can cache it locally on the client for even better performance:

```javascript
// Cache countries in localStorage
const getCountriesWithCache = async () => {
  const cached = localStorage.getItem('countries');
  const cacheTime = localStorage.getItem('countries_time');
  
  // Cache for 24 hours
  if (cached && cacheTime && Date.now() - cacheTime < 86400000) {
    return JSON.parse(cached);
  }
  
  const response = await fetch('https://api.berse-app.com/v2/metadata/countries');
  const data = await response.json();
  
  localStorage.setItem('countries', JSON.stringify(data.data.countries));
  localStorage.setItem('countries_time', Date.now().toString());
  
  return data.data.countries;
};
```

### 2. Use Search for Large Lists
Instead of loading all 250+ countries and filtering on the client, use the search endpoint:

```javascript
// ❌ Bad: Load all and filter
const countries = await getAllCountries();
const filtered = countries.filter(c => c.name.includes(query));

// ✅ Good: Use search endpoint
const filtered = await searchCountries(query);
```

### 3. Preload Common Data
For better UX, preload frequently used data on app startup:

```javascript
// On app initialization
Promise.all([
  fetch('/v2/metadata/countries'),
  fetch('/v2/metadata/regions'),
  fetch('/v2/metadata/timezones')
]).then(responses => {
  // Cache for later use
});
```

### 4. Display Flags Properly
Use the flag emoji field for visual appeal:

```javascript
// Good UX
`${country.flag} ${country.name} (${country.dialCode})`
// 🇲🇾 Malaysia (+60)
```

### 5. Handle Edge Cases
```javascript
// Some countries have multiple capitals
const capital = Array.isArray(country.capital) 
  ? country.capital[0] 
  : country.capital;

// Some countries have multiple currencies
const currency = Object.keys(country.currencies)[0];
```

---

## Rate Limiting

Metadata endpoints are public and have generous rate limits:

- **Rate Limit:** 1000 requests per 15 minutes per IP
- **Burst:** Up to 100 requests per second
- **Recommended:** Cache responses on client side to minimize API calls

---

## Changelog

### v1.0.0 (2024-01-15)
- Initial metadata API release
- All countries endpoint with full data
- Search and filter capabilities
- Region and timezone endpoints
- Redis caching implementation
- 100-160x performance improvement

---

## Support

For questions or issues:
- **Documentation:** [Full API Docs](../README.md)
- **Swagger UI:** http://localhost:3000/api-docs
- **Cache Guide:** [Geospatial & Caching Guide](../GEOSPATIAL_PRIVACY_CACHING.md)
