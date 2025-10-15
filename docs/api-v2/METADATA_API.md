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
- [States/Provinces](#statesprovinces)
  - [Get States by Country](#get-states-by-country)
- [Cities](#cities)
  - [Get All Cities](#get-all-cities)
  - [Get Cities by Country](#get-cities-by-country)
  - [Get Cities by State](#get-cities-by-state)
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

## States/Provinces

### Get States by Country
Get all states, provinces, or administrative divisions for a specific country.

**Endpoint:** `GET /v2/metadata/countries/:countryCode/states`

**Cache:** 1 day

**URL Parameters:**
- `countryCode` (required) - ISO 3166-1 alpha-2 country code (e.g., "US", "CA", "AU")

**Example:**
```
GET /v2/metadata/countries/US/states
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "countryCode": "US",
    "states": [
      {
        "code": "CA",
        "name": "California",
        "latitude": "36.77826100",
        "longitude": "-119.41793240"
      },
      {
        "code": "NY",
        "name": "New York",
        "latitude": "40.71277530",
        "longitude": "-74.00597280"
      },
      {
        "code": "TX",
        "name": "Texas",
        "latitude": "31.96860000",
        "longitude": "-99.90181000"
      }
    ],
    "total": 51
  }
}
```

**Error Responses:**
- `404` - No states found for specified country code

**Use Cases:**
- Populate state/province dropdowns in address forms
- Location-based user registration
- Shipping/delivery address validation
- Regional analytics and reporting

**Notes:**
- Returns states for countries with administrative divisions
- Includes geographic coordinates for each state
- State codes are ISO 3166-2 subdivision codes

---

## Cities

### Get All Cities
Get cities with optional filtering by country and/or state.

**Endpoint:** `GET /v2/metadata/cities`

**Cache:** 1 day

**Query Parameters:**
- `countryCode` (optional) - Filter by ISO 3166-1 alpha-2 country code
- `stateCode` (optional) - Filter by state code (requires countryCode)
- `limit` (optional, default: 100) - Maximum number of results to return

**Examples:**
```
GET /v2/metadata/cities
GET /v2/metadata/cities?countryCode=US&limit=50
GET /v2/metadata/cities?countryCode=US&stateCode=CA&limit=20
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "cities": [
      {
        "name": "Los Angeles",
        "countryCode": "US",
        "stateCode": "CA",
        "latitude": "34.05223",
        "longitude": "-118.24368"
      },
      {
        "name": "San Francisco",
        "countryCode": "US",
        "stateCode": "CA",
        "latitude": "37.77493",
        "longitude": "-122.41942"
      }
    ],
    "total": 20
  }
}
```

**Data Coverage:**
- **Total Cities:** 130,000+ worldwide
- **Countries Covered:** 250+
- **Coordinates:** Included for all cities

**Use Cases:**
- General city browsing
- Quick city lookup with filters
- Bulk city data extraction

---

### Get Cities by Country
Get all cities for a specific country with optional search functionality.

**Endpoint:** `GET /v2/metadata/countries/:countryCode/cities`

**Cache:** 1 day

**URL Parameters:**
- `countryCode` (required) - ISO 3166-1 alpha-2 country code

**Query Parameters:**
- `search` (optional) - Search cities by name (case-insensitive substring match)
- `limit` (optional, default: 1000) - Maximum number of results

**Examples:**
```
GET /v2/metadata/countries/MY/cities
GET /v2/metadata/countries/MY/cities?search=Kuala
GET /v2/metadata/countries/MY/cities?search=Shah&limit=10
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "countryCode": "MY",
    "cities": [
      {
        "name": "Kuala Lumpur",
        "stateCode": "14",
        "latitude": "3.14117",
        "longitude": "101.68653"
      },
      {
        "name": "Kuala Terengganu",
        "stateCode": "11",
        "latitude": "5.33018",
        "longitude": "103.14323"
      },
      {
        "name": "Kuala Kangsar",
        "stateCode": "08",
        "latitude": "4.76667",
        "longitude": "100.93333"
      }
    ],
    "total": 3
  }
}
```

**Error Responses:**
- `404` - No cities found for specified country code

**Search Behavior:**
- Case-insensitive substring matching
- Matches anywhere in city name
- Returns results up to specified limit

**Use Cases:**
- Country-specific city dropdowns
- City autocomplete for address forms
- Location-based search within a country
- Event location selection

**Performance Tips:**
- Use `limit` parameter to control response size
- Implement debouncing for search (300ms recommended)
- Cache results on client side for frequently accessed countries

---

### Get Cities by State
Get all cities for a specific state/province within a country.

**Endpoint:** `GET /v2/metadata/countries/:countryCode/states/:stateCode/cities`

**Cache:** 1 day

**URL Parameters:**
- `countryCode` (required) - ISO 3166-1 alpha-2 country code
- `stateCode` (required) - State/province code

**Query Parameters:**
- `search` (optional) - Search cities by name (case-insensitive substring match)

**Examples:**
```
GET /v2/metadata/countries/US/states/CA/cities
GET /v2/metadata/countries/US/states/CA/cities?search=Los
GET /v2/metadata/countries/US/states/NY/cities?search=New
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "countryCode": "US",
    "stateCode": "CA",
    "cities": [
      {
        "name": "Los Angeles",
        "latitude": "34.05223",
        "longitude": "-118.24368"
      },
      {
        "name": "Los Gatos",
        "latitude": "37.22662",
        "longitude": "-121.97468"
      },
      {
        "name": "Los Altos",
        "latitude": "37.38522",
        "longitude": "-122.11413"
      }
    ],
    "total": 3
  }
}
```

**Error Responses:**
- `404` - No cities found for specified state/country combination

**Use Cases:**
- State-specific city selection
- Precise location filtering
- Address form cascading dropdowns (Country → State → City)
- Regional event listings

**Integration Pattern:**
```javascript
// 1. User selects country → Load states
const states = await fetch(`/v2/metadata/countries/${countryCode}/states`);

// 2. User selects state → Load cities
const cities = await fetch(
  `/v2/metadata/countries/${countryCode}/states/${stateCode}/cities`
);

// 3. User searches cities → Filter results
const filtered = await fetch(
  `/v2/metadata/countries/${countryCode}/states/${stateCode}/cities?search=${query}`
);
```

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
| Get States by Country | `metadata:states:country:{CODE}` | 1 day |
| Get All Cities | `metadata:cities:{country}:{state}:{limit}` | 1 day |
| Get Cities by Country | `metadata:cities:country:{CODE}:{search}:{limit}` | 1 day |
| Get Cities by State | `metadata:cities:state:{CODE}:{STATE}:{search}` | 1 day |
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

**Cascading Location Dropdowns (Country → State → City):**
```javascript
const LocationSelector = () => {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedState, setSelectedState] = useState('');

  // Load countries on mount
  useEffect(() => {
    fetch('/v2/metadata/countries')
      .then(res => res.json())
      .then(data => setCountries(data.data.countries));
  }, []);

  // Load states when country changes
  const handleCountryChange = async (countryCode) => {
    setSelectedCountry(countryCode);
    setSelectedState('');
    setCities([]);
    
    const res = await fetch(`/v2/metadata/countries/${countryCode}/states`);
    const data = await res.json();
    setStates(data.data.states || []);
  };

  // Load cities when state changes
  const handleStateChange = async (stateCode) => {
    setSelectedState(stateCode);
    
    const res = await fetch(
      `/v2/metadata/countries/${selectedCountry}/states/${stateCode}/cities`
    );
    const data = await res.json();
    setCities(data.data.cities || []);
  };

  return (
    <div>
      <select onChange={(e) => handleCountryChange(e.target.value)}>
        <option value="">Select Country</option>
        {countries.map(c => (
          <option key={c.code} value={c.code}>
            {c.flag} {c.name}
          </option>
        ))}
      </select>
      
      {states.length > 0 && (
        <select onChange={(e) => handleStateChange(e.target.value)}>
          <option value="">Select State</option>
          {states.map(s => (
            <option key={s.code} value={s.code}>{s.name}</option>
          ))}
        </select>
      )}
      
      {cities.length > 0 && (
        <select>
          <option value="">Select City</option>
          {cities.map(c => (
            <option key={c.name} value={c.name}>{c.name}</option>
          ))}
        </select>
      )}
    </div>
  );
};
```

**City Search with Autocomplete:**
```javascript
const CityAutocomplete = ({ countryCode }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchCities = async (searchQuery) => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(
        `/v2/metadata/countries/${countryCode}/cities?search=${encodeURIComponent(searchQuery)}&limit=10`
      );
      const data = await response.json();
      setResults(data.data.cities || []);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchCities(query);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [query, countryCode]);

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search cities..."
      />
      {loading && <div>Loading...</div>}
      <ul>
        {results.map(city => (
          <li key={city.name} onClick={() => onSelectCity(city)}>
            {city.name}
            <span style={{ color: '#666', fontSize: '0.9em' }}>
              ({city.latitude}, {city.longitude})
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
```

**Get States by Country:**
```javascript
const getStates = async (countryCode) => {
  const response = await fetch(
    `https://api.berse-app.com/v2/metadata/countries/${countryCode}/states`
  );
  const data = await response.json();
  
  if (data.success) {
    return data.data.states;
  }
  return [];
};

// Example usage
const usStates = await getStates('US');
console.log(`${usStates.length} states found`);
```

**Get Cities by Country:**
```javascript
const getCities = async (countryCode, searchTerm = '', limit = 100) => {
  const params = new URLSearchParams();
  if (searchTerm) params.append('search', searchTerm);
  params.append('limit', limit.toString());
  
  const response = await fetch(
    `https://api.berse-app.com/v2/metadata/countries/${countryCode}/cities?${params}`
  );
  const data = await response.json();
  return data.data.cities;
};

// Get all cities in Malaysia
const cities = await getCities('MY');

// Search for cities containing "Kuala"
const kualaCities = await getCities('MY', 'Kuala', 10);
```

**Get Cities by State:**
```javascript
const getCitiesByState = async (countryCode, stateCode, searchTerm = '') => {
  const params = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '';
  
  const response = await fetch(
    `https://api.berse-app.com/v2/metadata/countries/${countryCode}/states/${stateCode}/cities${params}`
  );
  const data = await response.json();
  return data.data.cities;
};

// Get all cities in California
const caCities = await getCitiesByState('US', 'CA');

// Search California cities
const losCities = await getCitiesByState('US', 'CA', 'Los');
```

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

**Get States by Country:**
```bash
curl https://api.berse-app.com/v2/metadata/countries/US/states
```

**Get Cities by Country:**
```bash
# Get all cities in Malaysia (limit 10)
curl "https://api.berse-app.com/v2/metadata/countries/MY/cities?limit=10"

# Search for cities containing "Kuala"
curl "https://api.berse-app.com/v2/metadata/countries/MY/cities?search=Kuala&limit=5"
```

**Get Cities by State:**
```bash
# Get all cities in California
curl https://api.berse-app.com/v2/metadata/countries/US/states/CA/cities

# Search California cities containing "Los"
curl "https://api.berse-app.com/v2/metadata/countries/US/states/CA/cities?search=Los"
```

**Get Cities with Filters:**
```bash
# Get cities in Singapore
curl "https://api.berse-app.com/v2/metadata/cities?countryCode=SG&limit=10"

# Get cities in California, USA
curl "https://api.berse-app.com/v2/metadata/cities?countryCode=US&stateCode=CA&limit=20"
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

## Data Sources

### Countries Data
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

### States & Cities Data
States, provinces, and cities data is sourced from the **country-state-city** library, which provides:

- ✅ 4,900+ states/provinces worldwide
- ✅ 130,000+ cities across 250+ countries
- ✅ Geographic coordinates (latitude/longitude) for all locations
- ✅ ISO 3166-2 subdivision codes for states
- ✅ Hierarchical data structure (Country → State → City)
- ✅ Comprehensive global coverage
- ✅ Regularly maintained and updated

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

### 6. Optimize City Search
For better performance with city searches:

```javascript
// ✅ Good: Use debouncing
const debouncedSearch = debounce(async (query) => {
  const results = await fetch(
    `/v2/metadata/countries/${countryCode}/cities?search=${query}&limit=10`
  );
  // Update UI
}, 300);

// ✅ Good: Set reasonable limits
const cities = await fetch(`/v2/metadata/countries/US/cities?limit=100`);

// ❌ Bad: No limit on large datasets
const cities = await fetch(`/v2/metadata/countries/US/cities`); // Could return 10,000+ cities
```

### 7. Use Cascading Selects
Implement proper cascading for better UX:

```javascript
// Step 1: Select Country → Load States
handleCountryChange(countryCode) {
  // Reset dependent selections
  setSelectedState('');
  setCities([]);
  
  // Load states
  loadStates(countryCode);
}

// Step 2: Select State → Load Cities
handleStateChange(stateCode) {
  // Load cities for this state
  loadCities(selectedCountry, stateCode);
}
```

### 8. Cache Strategically
```javascript
// Cache countries (rarely changes)
const COUNTRIES_CACHE_KEY = 'metadata_countries';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

const getCachedCountries = async () => {
  const cached = localStorage.getItem(COUNTRIES_CACHE_KEY);
  const cacheTime = localStorage.getItem(`${COUNTRIES_CACHE_KEY}_time`);
  
  if (cached && cacheTime && Date.now() - cacheTime < CACHE_DURATION) {
    return JSON.parse(cached);
  }
  
  const countries = await fetchCountries();
  localStorage.setItem(COUNTRIES_CACHE_KEY, JSON.stringify(countries));
  localStorage.setItem(`${COUNTRIES_CACHE_KEY}_time`, Date.now().toString());
  
  return countries;
};
```

---

## Rate Limiting

Metadata endpoints are public and have generous rate limits:

- **Rate Limit:** 1000 requests per 15 minutes per IP
- **Burst:** Up to 100 requests per second
- **Recommended:** Cache responses on client side to minimize API calls

---

## Changelog

### v2.0.0 (2025-10-15)
- Added states/provinces endpoints
- Added cities endpoints with search functionality
- Added 130,000+ cities worldwide with coordinates
- Added cascading location support (Country → State → City)
- Enhanced caching for cities and states data
- Improved search performance with filtering

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
