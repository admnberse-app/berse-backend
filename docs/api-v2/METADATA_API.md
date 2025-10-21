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
  - [Search Cities](#search-cities)
  - [Get Popular Cities](#get-popular-cities)
- [Regions](#regions)
  - [Get All Regions](#get-all-regions)
  - [Get Countries by Region](#get-countries-by-region)
- [Timezones](#timezones)
  - [Get All Timezones](#get-all-timezones)
- [Profile Metadata](#profile-metadata)
  - [Get All Profile Metadata](#get-all-profile-metadata)
  - [Get Interests List](#get-interests-list)
  - [Get Languages List](#get-languages-list)
  - [Get Professions List](#get-professions-list)
  - [Get Genders List](#get-genders-list)
  - [Get Travel Styles List](#get-travel-styles-list)
  - [Get Personality Types List](#get-personality-types-list)
- [Caching](#caching)
- [Examples](#examples)

---

## Pagination

All endpoints that return lists of data support pagination to improve performance and prevent large responses:

### Pagination Parameters
- `page` - Page number (1-based, default: 1)
- `limit` - Items per page (varies by endpoint, see individual endpoint docs)

### Pagination Limits
- **Countries:** Max 250 per page (default: 250)
- **Cities:** Max 500 per page (default: 100)
- **States:** No pagination (typically small datasets)
- **Other endpoints:** See individual endpoint documentation

### Pagination Response Format
All paginated endpoints include a `pagination` object in the response:

```json
{
  "success": true,
  "data": {
    "[items]": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalItems": 1000,
      "itemsPerPage": 100,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
}
```

### Pagination Best Practices
1. **Start with reasonable page sizes** - Use default limits unless you need more data
2. **Implement proper loading states** - Show loading indicators while fetching pages
3. **Cache pages locally** - Store fetched pages to avoid redundant requests
4. **Use search parameters** - Combine with search to reduce dataset size
5. **Handle edge cases** - Check `hasNextPage`/`hasPreviousPage` before navigation

### Performance Benefits
- **Faster response times** - Smaller payloads load quicker
- **Reduced memory usage** - Less data to process on client/server
- **Better user experience** - Progressive loading and smoother interactions
- **Lower bandwidth usage** - Only fetch data as needed

---

## Countries

### Get All Countries
Get a paginated list of all countries with their details.

**Endpoint:** `GET /v2/metadata/countries`

**Cache:** 1 day (86400 seconds)

**Query Parameters:**
- `page` (optional, default: 1) - Page number (1-based)
- `limit` (optional, default: 250, max: 250) - Number of countries per page

**Examples:**
```
GET /v2/metadata/countries
GET /v2/metadata/countries?page=1&limit=50
GET /v2/metadata/countries?page=2&limit=100
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
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 250,
      "itemsPerPage": 50,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
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
Get paginated cities with optional filtering by country and/or state.

**Endpoint:** `GET /v2/metadata/cities`

**Cache:** 1 day

**Query Parameters:**
- `countryCode` (optional) - Filter by ISO 3166-1 alpha-2 country code
- `stateCode` (optional) - Filter by state code (requires countryCode)
- `page` (optional, default: 1) - Page number (1-based)
- `limit` (optional, default: 100, max: 500) - Number of cities per page

**Examples:**
```
GET /v2/metadata/cities
GET /v2/metadata/cities?page=2&limit=50
GET /v2/metadata/cities?countryCode=US&page=1&limit=100
GET /v2/metadata/cities?countryCode=US&stateCode=CA&page=1&limit=50
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
    "pagination": {
      "currentPage": 1,
      "totalPages": 20,
      "totalItems": 1000,
      "itemsPerPage": 50,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
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
Get paginated cities for a specific country with optional search functionality.

**Endpoint:** `GET /v2/metadata/countries/:countryCode/cities`

**Cache:** 1 day

**URL Parameters:**
- `countryCode` (required) - ISO 3166-1 alpha-2 country code

**Query Parameters:**
- `search` (optional) - Search cities by name (case-insensitive substring match)
- `page` (optional, default: 1) - Page number (1-based)
- `limit` (optional, default: 100, max: 500) - Number of cities per page

**Examples:**
```
GET /v2/metadata/countries/MY/cities
GET /v2/metadata/countries/MY/cities?page=2&limit=50
GET /v2/metadata/countries/MY/cities?search=Kuala&page=1&limit=10
GET /v2/metadata/countries/MY/cities?search=Shah&page=1&limit=10
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
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 3,
      "itemsPerPage": 10,
      "hasNextPage": false,
      "hasPreviousPage": false
    }
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
Get paginated cities for a specific state/province within a country.

**Endpoint:** `GET /v2/metadata/countries/:countryCode/states/:stateCode/cities`

**Cache:** 1 day

**URL Parameters:**
- `countryCode` (required) - ISO 3166-1 alpha-2 country code
- `stateCode` (required) - State/province code

**Query Parameters:**
- `search` (optional) - Search cities by name (case-insensitive substring match)
- `page` (optional, default: 1) - Page number (1-based)
- `limit` (optional, default: 100, max: 500) - Number of cities per page

**Examples:**
```
GET /v2/metadata/countries/US/states/CA/cities
GET /v2/metadata/countries/US/states/CA/cities?page=2&limit=50
GET /v2/metadata/countries/US/states/CA/cities?search=Los&page=1&limit=10
GET /v2/metadata/countries/US/states/NY/cities?search=New&page=1&limit=20
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
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 3,
      "itemsPerPage": 10,
      "hasNextPage": false,
      "hasPreviousPage": false
    }
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

### Search Cities
Search for cities globally by name without needing to specify a country first.

**Endpoint:** `GET /v2/metadata/cities/search`

**Cache:** 1 day (86400 seconds)

**Query Parameters:**
- `q` (required) - Search query (minimum 2 characters)
- `page` (optional, default: 1) - Page number (1-based)
- `limit` (optional, default: 50, max: 100) - Number of cities per page

**Examples:**
```
GET /v2/metadata/cities/search?q=kuala
GET /v2/metadata/cities/search?q=new&page=1&limit=20
GET /v2/metadata/cities/search?q=san&page=2&limit=50
GET /v2/metadata/cities/search?q=paris
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "cities": [
      {
        "name": "Kuala Lumpur",
        "countryCode": "MY",
        "countryName": "Malaysia",
        "stateCode": "14",
        "stateName": "Wilayah Persekutuan Kuala Lumpur",
        "latitude": "3.139",
        "longitude": "101.6869"
      },
      {
        "name": "Kuala Terengganu",
        "countryCode": "MY",
        "countryName": "Malaysia",
        "stateCode": "11",
        "stateName": "Terengganu",
        "latitude": "5.33018",
        "longitude": "103.14323"
      },
      {
        "name": "Kuala Kangsar",
        "countryCode": "MY",
        "countryName": "Malaysia",
        "stateCode": "08",
        "stateName": "Perak",
        "latitude": "4.76667",
        "longitude": "100.93333"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 150,
      "itemsPerPage": 50,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
}
```

**Error Responses:**
- `400` - Invalid request (missing query or too short)
```json
{
  "success": false,
  "error": "Search query parameter \"q\" is required"
}
```
```json
{
  "success": false,
  "error": "Search query must be at least 2 characters long"
}
```

**Response Fields:**
- `name` - City name
- `countryCode` - ISO 3166-1 alpha-2 country code
- `countryName` - Full country name
- `stateCode` - State/province code (if available)
- `stateName` - State/province name (if available)
- `latitude` - City latitude coordinate
- `longitude` - City longitude coordinate

**Search Behavior:**
- Case-insensitive substring matching
- Matches anywhere in city name
- Minimum query length: 2 characters
- Searches across all 130,000+ cities globally
- Results include country and state information for context

**Use Cases:**
- Global city autocomplete
- Multi-country search without pre-selecting a country
- Quick city lookup from any part of the world
- Location suggestions for international users
- Travel destination search

**Performance Tips:**
- Results are cached for 1 day
- Use reasonable page sizes (50 is default)
- Implement debouncing for search (300ms recommended)
- More specific queries return faster results
- Consider using country-specific search for better performance on large result sets

---

### Get Popular Cities
Get popular cities based on user locations and published upcoming events.

**Endpoint:** `GET /v2/metadata/cities/popular`

**Cache:** 1 hour (3600 seconds)

**Query Parameters:**
- `userLatitude` (optional) - User's current latitude for location-based results
- `userLongitude` (optional) - User's current longitude for location-based results  
- `limit` (optional, default: 5, max: 20) - Number of cities to return
- `radius` (optional, default: 500) - Radius in kilometers for nearby cities (only used when location provided)

**Examples:**
```
GET /v2/metadata/cities/popular
GET /v2/metadata/cities/popular?limit=10
GET /v2/metadata/cities/popular?userLatitude=3.139&userLongitude=101.6869&limit=5&radius=300
GET /v2/metadata/cities/popular?userLatitude=1.3521&userLongitude=103.8198&limit=5&radius=500
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "cities": [
      {
        "name": "Kuala Lumpur",
        "country": "MY",
        "userCount": 150,
        "eventCount": 45,
        "latitude": "3.139",
        "longitude": "101.6869"
      },
      {
        "name": "Singapore",
        "country": "SG",
        "userCount": 120,
        "eventCount": 38,
        "latitude": "1.3521",
        "longitude": "103.8198"
      },
      {
        "name": "Jakarta",
        "country": "ID",
        "userCount": 95,
        "eventCount": 28,
        "latitude": "-6.2088",
        "longitude": "106.8456"
      },
      {
        "name": "Bangkok",
        "country": "TH",
        "userCount": 88,
        "eventCount": 32,
        "latitude": "13.7563",
        "longitude": "100.5018"
      },
      {
        "name": "Manila",
        "country": "PH",
        "userCount": 76,
        "eventCount": 24,
        "latitude": "14.5995",
        "longitude": "120.9842"
      }
    ],
    "total": 5,
    "criteria": {
      "userLocationProvided": false,
      "radius": 500,
      "limit": 5
    }
  }
}
```

**Response Fields:**
- `name` - City name
- `country` - ISO 3166-1 alpha-2 country code
- `userCount` - Number of users in this city (from UserLocation table)
- `eventCount` - Number of upcoming published events in this city
- `latitude` - City latitude coordinate
- `longitude` - City longitude coordinate
- `total` - Total number of cities returned
- `criteria.userLocationProvided` - Whether user coordinates were provided
- `criteria.radius` - Search radius in kilometers (when location provided)
- `criteria.limit` - Number of cities returned

**Algorithm:**

The endpoint uses a sophisticated scoring system to rank cities:

1. **User Location Score**: Each user in a city adds 2 points
2. **Event Score**: Each upcoming published event adds 1.5 points
3. **Proximity Bonus** (when user location provided):
   - Cities within radius get bonus points
   - Bonus = (1 - distance/radius) × 100
   - Closer cities get higher bonuses
4. **Fallback Logic**:
   - **With User Location**: If results < limit, returns the 5 closest cities to the user based on distance
   - **Without User Location**: If results < limit, adds these top cities:
     - Kuala Lumpur (MY)
     - Singapore (SG)
     - Jakarta (ID)
     - Bangkok (TH)
     - Manila (PH)

**Data Sources:**
- **User Locations**: Aggregates from `UserLocation` table (current city data)
- **Events**: Counts from `Event` table (only PUBLISHED events with future dates)
- **City Coordinates**: From `country-state-city` npm package

**Use Cases:**
- Event discovery - Show users where events are happening
- User onboarding - Suggest popular cities during setup
- Location filters - Pre-populate city dropdowns with relevant options
- Travel planning - Help users discover active communities
- City recommendations - Suggest where to connect with other users

**Examples:**

**Get Top 5 Popular Cities (Global):**
```javascript
const response = await fetch('/v2/metadata/cities/popular');
const data = await response.json();

console.log(`Top ${data.data.total} popular cities:`);
data.data.cities.forEach(city => {
  console.log(`${city.name}: ${city.userCount} users, ${city.eventCount} events`);
});
```

**Get Popular Cities Near User Location:**
```javascript
const getPopularNearby = async (latitude, longitude, radius = 300) => {
  const params = new URLSearchParams({
    userLatitude: latitude.toString(),
    userLongitude: longitude.toString(),
    limit: '5',
    radius: radius.toString()
  });
  
  const response = await fetch(`/v2/metadata/cities/popular?${params}`);
  const data = await response.json();
  
  return data.data.cities;
};

// Get cities within 300km of Kuala Lumpur
const nearbyCities = await getPopularNearby(3.139, 101.6869, 300);
```

**Get Top 10 Popular Cities:**
```javascript
const response = await fetch('/v2/metadata/cities/popular?limit=10');
const data = await response.json();

// Cities ranked by popularity (user count + event count)
const topCities = data.data.cities;
```

**Display Popular Cities in UI:**
```javascript
const PopularCities = () => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Try to get user's location
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const params = new URLSearchParams({
          userLatitude: position.coords.latitude.toString(),
          userLongitude: position.coords.longitude.toString(),
          limit: '5',
          radius: '500'
        });
        
        const response = await fetch(`/v2/metadata/cities/popular?${params}`);
        const data = await response.json();
        setCities(data.data.cities);
        setLoading(false);
      },
      async () => {
        // Fallback: Get global popular cities
        const response = await fetch('/v2/metadata/cities/popular?limit=5');
        const data = await response.json();
        setCities(data.data.cities);
        setLoading(false);
      }
    );
  }, []);
  
  if (loading) return <div>Loading popular cities...</div>;
  
  return (
    <div>
      <h3>Popular Cities</h3>
      {cities.map(city => (
        <div key={`${city.name}-${city.country}`}>
          <h4>{city.name}</h4>
          <p>{city.userCount} users · {city.eventCount} events</p>
        </div>
      ))}
    </div>
  );
};
```

**Performance:**
- Cached for 1 hour (shorter TTL as data changes frequently)
- Optimized database queries with manual aggregation
- Efficient distance calculations using Haversine formula
- Maximum 20 cities to prevent overload

**Notes:**
- Cities must have at least one user OR one event to appear in results
- Location coordinates enhance results but are not required
- Results automatically fall back to top global cities if needed
- Cache ensures fast response times for repeated queries
- Proximity bonus only applied when user coordinates are provided

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

## Profile Metadata

### Overview
The Profile Metadata API provides curated lists for user profile fields, replacing free-text inputs with structured, validated options. All endpoints return categorized data with emojis and descriptions for better user experience.

**Base URL:**
- **Production:** `https://api.berse-app.com/v2/metadata/profile`
- **Development:** `http://localhost:3001/v2/metadata/profile`

**Authentication:** None required (public endpoints)

**Data Coverage:**
- **Interests:** 69+ interests across 8 categories
- **Languages:** 27 languages with native names
- **Professions:** 49+ professions across 6 categories
- **Genders:** 5 gender options
- **Travel Styles:** 14 travel preferences
- **Personality Types:** 16 MBTI personality types

---

### Get All Profile Metadata
Get comprehensive lists of all profile field options in one call for efficient mobile app loading.

**Endpoint:** `GET /v2/metadata/profile`

**Cache:** 1 day (86400 seconds)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile metadata retrieved successfully",
  "data": {
    "version": "1.0.0",
    "lastUpdated": "2024-01-15T10:30:00.000Z",
    "interests": {
      "category": "Interests",
      "description": "User interests and hobbies",
      "items": [
        {
          "value": "fitness",
          "label": "Fitness",
          "category": "Sports & Fitness",
          "emoji": "💪"
        },
        {
          "value": "yoga",
          "label": "Yoga",
          "category": "Sports & Fitness",
          "emoji": "🧘"
        }
      ]
    },
    "languages": {
      "category": "Languages",
      "description": "Spoken languages",
      "items": [
        {
          "value": "en",
          "label": "English",
          "native": "English",
          "emoji": "🇬🇧"
        },
        {
          "value": "ms",
          "label": "Malay",
          "native": "Bahasa Melayu",
          "emoji": "🇲🇾"
        }
      ]
    },
    "professions": {
      "category": "Professions",
      "description": "Professional roles and occupations",
      "items": [
        {
          "value": "software_engineer",
          "label": "Software Engineer",
          "category": "Technology",
          "emoji": "👨‍💻"
        }
      ]
    },
    "genders": {
      "category": "Gender",
      "description": "Gender options",
      "items": [
        {
          "value": "Male",
          "label": "Male",
          "emoji": "♂️"
        }
      ]
    },
    "travelStyles": {
      "category": "Travel Styles",
      "description": "Travel preferences and styles",
      "items": [
        {
          "value": "Backpacker",
          "label": "Backpacker",
          "description": "Budget-friendly, spontaneous adventure",
          "emoji": "🎒"
        }
      ]
    },
    "personalityTypes": {
      "category": "Personality Types",
      "description": "MBTI personality types",
      "items": [
        {
          "value": "INTJ",
          "label": "INTJ - Architect",
          "category": "Analysts",
          "description": "Imaginative and strategic thinkers",
          "emoji": "🏛️"
        }
      ]
    }
  }
}
```

**Use Cases:**
- Mobile app profile setup screens
- Bulk loading of all profile options
- Offline caching of metadata
- Form validation and autocomplete

---

### Get Interests List
Get curated list of 69+ user interests and hobbies organized by category.

**Endpoint:** `GET /v2/metadata/profile/interests`

**Cache:** 1 day

**Success Response (200):**
```json
{
  "success": true,
  "message": "Interests retrieved successfully",
  "data": {
    "category": "Interests",
    "description": "User interests and hobbies",
    "items": [
      {
        "value": "fitness",
        "label": "Fitness",
        "category": "Sports & Fitness",
        "emoji": "💪"
      },
      {
        "value": "yoga",
        "label": "Yoga",
        "category": "Sports & Fitness",
        "emoji": "🧘"
      },
      {
        "value": "art",
        "label": "Art",
        "category": "Arts & Culture",
        "emoji": "🎨"
      },
      {
        "value": "technology",
        "label": "Technology",
        "category": "Technology",
        "emoji": "💻"
      }
    ]
  }
}
```

**Categories:**
- Sports & Fitness (10 items)
- Arts & Culture (10 items)
- Food & Drink (6 items)
- Technology (6 items)
- Travel & Adventure (5 items)
- Social & Community (5 items)
- Business & Career (5 items)
- Wellness & Mindfulness (5 items)
- Entertainment (4 items)
- Nature & Animals (4 items)
- Learning (5 items)
- Fashion & Style (2 items)
- Religion & Spirituality (2 items)

---

### Get Languages List
Get list of 27 supported languages with native names and flag emojis.

**Endpoint:** `GET /v2/metadata/profile/languages`

**Cache:** 1 day

**Success Response (200):**
```json
{
  "success": true,
  "message": "Languages retrieved successfully",
  "data": {
    "category": "Languages",
    "description": "Spoken languages",
    "items": [
      {
        "value": "en",
        "label": "English",
        "native": "English",
        "emoji": "🇬🇧"
      },
      {
        "value": "ms",
        "label": "Malay",
        "native": "Bahasa Melayu",
        "emoji": "🇲🇾"
      },
      {
        "value": "zh",
        "label": "Chinese",
        "native": "中文",
        "emoji": "🇨🇳"
      },
      {
        "value": "ja",
        "label": "Japanese",
        "native": "日本語",
        "emoji": "🇯🇵"
      }
    ]
  }
}
```

**Supported Languages:**
English, Malay, Chinese, Tamil, Hindi, Bengali, Indonesian, Thai, Vietnamese, Tagalog, Japanese, Korean, Arabic, Spanish, French, German, Portuguese, Russian, Italian, Dutch, Polish, Turkish, Urdu, Persian, Khmer, Burmese, Other

---

### Get Professions List
Get curated list of 49+ professions and occupations organized by category.

**Endpoint:** `GET /v2/metadata/profile/professions`

**Cache:** 1 day

**Success Response (200):**
```json
{
  "success": true,
  "message": "Professions retrieved successfully",
  "data": {
    "category": "Professions",
    "description": "Professional roles and occupations",
    "items": [
      {
        "value": "software_engineer",
        "label": "Software Engineer",
        "category": "Technology",
        "emoji": "👨‍💻"
      },
      {
        "value": "doctor",
        "label": "Doctor",
        "category": "Healthcare",
        "emoji": "👨‍⚕️"
      },
      {
        "value": "teacher",
        "label": "Teacher",
        "category": "Education",
        "emoji": "👨‍🏫"
      }
    ]
  }
}
```

**Categories:**
- Technology (6 items)
- Business & Finance (6 items)
- Creative & Media (7 items)
- Education (4 items)
- Healthcare (5 items)
- Hospitality & Tourism (4 items)
- Sports & Fitness (4 items)
- Marketing & Sales (4 items)
- Legal & Government (2 items)
- Other (7 items)

---

### Get Genders List
Get list of gender options for profile completion.

**Endpoint:** `GET /v2/metadata/profile/genders`

**Cache:** 1 day

**Success Response (200):**
```json
{
  "success": true,
  "message": "Genders retrieved successfully",
  "data": {
    "category": "Gender",
    "description": "Gender options",
    "items": [
      {
        "value": "Male",
        "label": "Male",
        "emoji": "♂️"
      },
      {
        "value": "Female",
        "label": "Female",
        "emoji": "♀️"
      },
      {
        "value": "Non-binary",
        "label": "Non-binary",
        "emoji": "⚧️"
      },
      {
        "value": "Prefer not to say",
        "label": "Prefer not to say",
        "emoji": "🤐"
      },
      {
        "value": "Other",
        "label": "Other",
        "emoji": "✨"
      }
    ]
  }
}
```

---

### Get Travel Styles List
Get list of 14 travel style preferences with descriptions.

**Endpoint:** `GET /v2/metadata/profile/travel-styles`

**Cache:** 1 day

**Success Response (200):**
```json
{
  "success": true,
  "message": "Travel styles retrieved successfully",
  "data": {
    "category": "Travel Styles",
    "description": "Travel preferences and styles",
    "items": [
      {
        "value": "Backpacker",
        "label": "Backpacker",
        "description": "Budget-friendly, spontaneous adventure",
        "emoji": "🎒"
      },
      {
        "value": "Luxury Traveler",
        "label": "Luxury Traveler",
        "description": "Comfort and premium experiences",
        "emoji": "✨"
      },
      {
        "value": "Cultural Explorer",
        "label": "Cultural Explorer",
        "description": "Deep dive into local culture",
        "emoji": "🏛️"
      },
      {
        "value": "Adventure Seeker",
        "label": "Adventure Seeker",
        "description": "Thrill and outdoor activities",
        "emoji": "🏔️"
      }
    ]
  }
}
```

---

### Get Personality Types List
Get list of 16 MBTI personality types organized by category.

**Endpoint:** `GET /v2/metadata/profile/personality-types`

**Cache:** 1 day

**Success Response (200):**
```json
{
  "success": true,
  "message": "Personality types retrieved successfully",
  "data": {
    "category": "Personality Types",
    "description": "MBTI personality types",
    "items": [
      {
        "value": "INTJ",
        "label": "INTJ - Architect",
        "category": "Analysts",
        "description": "Imaginative and strategic thinkers",
        "emoji": "🏛️"
      },
      {
        "value": "ENFP",
        "label": "ENFP - Campaigner",
        "category": "Diplomats",
        "description": "Enthusiastic, creative, and sociable",
        "emoji": "🎨"
      },
      {
        "value": "ISTJ",
        "label": "ISTJ - Logistician",
        "category": "Sentinels",
        "description": "Practical and fact-minded",
        "emoji": "📋"
      },
      {
        "value": "ESFP",
        "label": "ESFP - Entertainer",
        "category": "Explorers",
        "description": "Spontaneous, energetic, and enthusiastic",
        "emoji": "🎉"
      }
    ]
  }
}
```

**Categories:**
- Analysts (4 types): INTJ, INTP, ENTJ, ENTP
- Diplomats (4 types): INFJ, INFP, ENFJ, ENFP
- Sentinels (4 types): ISTJ, ISFJ, ESTJ, ESFJ
- Explorers (4 types): ISTP, ISFP, ESTP, ESFP

---

## Caching

### Cache Strategy
All metadata endpoints use **Redis caching** with a cache-aside pattern for optimal performance.

### Cache Keys
| Endpoint | Cache Key | TTL |
|----------|-----------|-----|
| Get All Countries | `metadata:countries:all:{page}:{limit}` | 1 day |
| Get Country by Code | `metadata:country:{CODE}` | 1 day |
| Search Countries | `metadata:countries:search:{query}:{region}` | 1 hour |
| Get States by Country | `metadata:states:country:{CODE}` | 1 day |
| Get All Cities | `metadata:cities:{country}:{state}:{page}:{limit}` | 1 day |
| Get Cities by Country | `metadata:cities:country:{CODE}:{search}:{page}:{limit}` | 1 day |
| Get Cities by State | `metadata:cities:state:{CODE}:{STATE}:{search}:{page}:{limit}` | 1 day |
| Search Cities | `metadata:cities:search:{query}:{page}:{limit}` | 1 day |
| Get Popular Cities | `metadata:cities:popular:{lat}:{lon}:{limit}:{radius}` | 1 hour |
| Get Regions | `metadata:regions:all` | 1 day |
| Get Countries by Region | `metadata:region:{region}:countries` | 1 day |
| Get Timezones | `metadata:timezones:all` | 1 day |
| Get All Profile Metadata | `metadata:profile:all` | 1 day |
| Get Interests List | `metadata:profile:interests` | 1 day |
| Get Languages List | `metadata:profile:languages` | 1 day |
| Get Professions List | `metadata:profile:professions` | 1 day |
| Get Genders List | `metadata:profile:genders` | 1 day |
| Get Travel Styles List | `metadata:profile:travel-styles` | 1 day |
| Get Personality Types List | `metadata:profile:personality-types` | 1 day |

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

**City Search with Autocomplete (Paginated):**
```javascript
const CityAutocomplete = ({ countryCode }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState(null);

  const searchCities = async (searchQuery, page = 1) => {
    if (searchQuery.length < 2) {
      setResults([]);
      setPagination(null);
      return;
    }
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: searchQuery,
        page: page.toString(),
        limit: '10'
      });
      
      const response = await fetch(
        `/v2/metadata/countries/${countryCode}/cities?${params}`
      );
      const data = await response.json();
      
      if (data.success) {
        setResults(page === 1 ? data.data.cities : [...results, ...data.data.cities]);
        setPagination(data.data.pagination);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMoreResults = () => {
    if (pagination?.hasNextPage && !loading) {
      searchCities(query, pagination.currentPage + 1);
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchCities(query, 1); // Always start from page 1 for new search
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
        {results.map((city, index) => (
          <li key={`${city.name}-${index}`} onClick={() => onSelectCity(city)}>
            {city.name}
            <span style={{ color: '#666', fontSize: '0.9em' }}>
              ({city.latitude}, {city.longitude})
            </span>
          </li>
        ))}
      </ul>
      {pagination?.hasNextPage && (
        <button onClick={loadMoreResults} disabled={loading}>
          {loading ? 'Loading...' : `Load More (${pagination.totalItems - results.length} remaining)`}
        </button>
      )}
      {pagination && (
        <div style={{ fontSize: '0.8em', color: '#666', marginTop: '8px' }}>
          Showing {results.length} of {pagination.totalItems} cities
        </div>
      )}
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

**Get Cities by Country (with pagination):**
```javascript
const getCities = async (countryCode, searchTerm = '', page = 1, limit = 100) => {
  const params = new URLSearchParams();
  if (searchTerm) params.append('search', searchTerm);
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  
  const response = await fetch(
    `https://api.berse-app.com/v2/metadata/countries/${countryCode}/cities?${params}`
  );
  const data = await response.json();
  
  if (data.success) {
    return {
      cities: data.data.cities,
      pagination: data.data.pagination,
      countryCode: data.data.countryCode
    };
  }
  return { cities: [], pagination: null };
};

// Get first page of cities in Malaysia
const result = await getCities('MY', '', 1, 50);
console.log(`Found ${result.pagination.totalItems} cities in ${result.countryCode}`);

// Search for cities containing "Kuala" (first page)
const kualaCities = await getCities('MY', 'Kuala', 1, 10);

// Load all pages of cities (for small datasets)
const getAllCities = async (countryCode) => {
  let allCities = [];
  let currentPage = 1;
  let hasMore = true;
  
  while (hasMore) {
    const result = await getCities(countryCode, '', currentPage, 100);
    allCities.push(...result.cities);
    hasMore = result.pagination?.hasNextPage || false;
    currentPage++;
  }
  
  return allCities;
};
```

**Get Cities by State (with pagination):**
```javascript
const getCitiesByState = async (countryCode, stateCode, searchTerm = '', page = 1, limit = 100) => {
  const params = new URLSearchParams();
  if (searchTerm) params.append('search', searchTerm);
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  
  const response = await fetch(
    `https://api.berse-app.com/v2/metadata/countries/${countryCode}/states/${stateCode}/cities?${params}`
  );
  const data = await response.json();
  
  if (data.success) {
    return {
      cities: data.data.cities,
      pagination: data.data.pagination,
      countryCode: data.data.countryCode,
      stateCode: data.data.stateCode
    };
  }
  return { cities: [], pagination: null };
};

// Get first page of cities in California
const result = await getCitiesByState('US', 'CA', '', 1, 50);

// Search California cities containing "Los"
const losCities = await getCitiesByState('US', 'CA', 'Los', 1, 20);

// Paginated city loader for UI
const CityPaginator = {
  async loadPage(countryCode, stateCode, page, limit = 50) {
    return await getCitiesByState(countryCode, stateCode, '', page, limit);
  },
  
  async searchCities(countryCode, stateCode, query, page = 1) {
    return await getCitiesByState(countryCode, stateCode, query, page, 25);
  }
};
```

**Search Cities Globally:**
```javascript
const searchCities = async (query, page = 1, limit = 50) => {
  if (query.length < 2) {
    throw new Error('Search query must be at least 2 characters');
  }

  const params = new URLSearchParams({
    q: query,
    page: page.toString(),
    limit: limit.toString()
  });
  
  const response = await fetch(
    `https://api.berse-app.com/v2/metadata/cities/search?${params}`
  );
  const data = await response.json();
  
  if (data.success) {
    return {
      cities: data.data.cities,
      pagination: data.data.pagination
    };
  }
  return { cities: [], pagination: null };
};

// Search for cities containing "kuala"
const results = await searchCities('kuala');

// Search with pagination
const page2 = await searchCities('new', 2, 20);

// Global city autocomplete component
const GlobalCityAutocomplete = ({ onSelectCity }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState(null);

  const handleSearch = async (searchQuery, page = 1) => {
    if (searchQuery.length < 2) {
      setResults([]);
      setPagination(null);
      return;
    }
    
    setLoading(true);
    try {
      const data = await searchCities(searchQuery, page, 20);
      
      if (page === 1) {
        setResults(data.cities);
      } else {
        setResults(prev => [...prev, ...data.cities]);
      }
      
      setPagination(data.pagination);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (pagination?.hasNextPage && !loading) {
      handleSearch(query, pagination.currentPage + 1);
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(query, 1);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search cities worldwide..."
        minLength={2}
      />
      {loading && <div>Loading...</div>}
      <ul>
        {results.map((city, index) => (
          <li 
            key={`${city.name}-${city.countryCode}-${index}`}
            onClick={() => onSelectCity(city)}
          >
            <strong>{city.name}</strong>
            {city.stateName && <span>, {city.stateName}</span>}
            <span> - {city.countryName}</span>
            <small style={{ color: '#666', display: 'block' }}>
              {city.latitude}, {city.longitude}
            </small>
          </li>
        ))}
      </ul>
      {pagination?.hasNextPage && (
        <button onClick={loadMore} disabled={loading}>
          {loading ? 'Loading...' : `Load More (${pagination.totalItems - results.length} remaining)`}
        </button>
      )}
      {pagination && (
        <div style={{ fontSize: '0.8em', color: '#666', marginTop: '8px' }}>
          Showing {results.length} of {pagination.totalItems} cities
        </div>
      )}
    </div>
  );
};
```

**Get All Countries (with pagination):**
```javascript
const getCountries = async (page = 1, limit = 50) => {
  const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
  const response = await fetch(`https://api.berse-app.com/v2/metadata/countries?${params}`);
  const data = await response.json();
  
  if (data.success) {
    return {
      countries: data.data.countries,
      pagination: data.data.pagination
    };
  }
  return { countries: [], pagination: null };
};

// Use in dropdown with pagination
const result = await getCountries(1, 50);
result.countries.forEach(country => {
  console.log(`${country.flag} ${country.name} (${country.code})`);
});

// Check for more pages
if (result.pagination?.hasNextPage) {
  const nextPage = await getCountries(result.pagination.currentPage + 1, 50);
  // Process next page...
}
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

**Get All Profile Metadata:**
```javascript
const getAllProfileMetadata = async () => {
  const response = await fetch('https://api.berse-app.com/v2/metadata/profile');
  const data = await response.json();
  
  if (data.success) {
    console.log(`Version: ${data.data.version}`);
    console.log(`Interests: ${data.data.interests.items.length}`);
    console.log(`Languages: ${data.data.languages.items.length}`);
    console.log(`Professions: ${data.data.professions.items.length}`);
    
    return data.data;
  }
  return null;
};

// Usage in mobile app for initial data loading
const loadProfileMetadata = async () => {
  try {
    const metadata = await getAllProfileMetadata();
    // Cache locally for offline use
    localStorage.setItem('profileMetadata', JSON.stringify(metadata));
    localStorage.setItem('metadataTimestamp', Date.now().toString());
  } catch (error) {
    console.error('Failed to load profile metadata:', error);
  }
};
```

**Get Interests for Profile Setup:**
```javascript
const loadInterestsForSelection = async () => {
  const response = await fetch('https://api.berse-app.com/v2/metadata/profile/interests');
  const data = await response.json();
  
  if (data.success) {
    // Group interests by category for UI
    const groupedInterests = data.data.items.reduce((acc, interest) => {
      if (!acc[interest.category]) {
        acc[interest.category] = [];
      }
      acc[interest.category].push(interest);
      return acc;
    }, {});
    
    return groupedInterests;
  }
  return {};
};

// React component for interest selection
const InterestSelector = () => {
  const [interests, setInterests] = useState({});
  const [selectedInterests, setSelectedInterests] = useState([]);
  
  useEffect(() => {
    loadInterestsForSelection().then(setInterests);
  }, []);
  
  const toggleInterest = (interest) => {
    setSelectedInterests(prev => 
      prev.includes(interest.value)
        ? prev.filter(i => i !== interest.value)
        : [...prev, interest.value]
    );
  };
  
  return (
    <div>
      {Object.entries(interests).map(([category, items]) => (
        <div key={category}>
          <h3>{category}</h3>
          {items.map(interest => (
            <button
              key={interest.value}
              onClick={() => toggleInterest(interest)}
              style={{
                background: selectedInterests.includes(interest.value) ? '#007bff' : '#fff'
              }}
            >
              {interest.emoji} {interest.label}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};
```

**Get Languages for Profile:**
```javascript
const getLanguages = async () => {
  const response = await fetch('https://api.berse-app.com/v2/metadata/profile/languages');
  const data = await response.json();
  return data.success ? data.data.items : [];
};

// Language dropdown component
const LanguageSelector = ({ selectedLanguage, onSelect }) => {
  const [languages, setLanguages] = useState([]);
  
  useEffect(() => {
    getLanguages().then(setLanguages);
  }, []);
  
  return (
    <select value={selectedLanguage} onChange={(e) => onSelect(e.target.value)}>
      <option value="">Select Language</option>
      {languages.map(lang => (
        <option key={lang.value} value={lang.value}>
          {lang.emoji} {lang.label} ({lang.native})
        </option>
      ))}
    </select>
  );
};
```

**Get Professions for Profile:**
```javascript
const getProfessions = async () => {
  const response = await fetch('https://api.berse-app.com/v2/metadata/profile/professions');
  const data = await response.json();
  return data.success ? data.data.items : [];
};

// Profession autocomplete
const ProfessionAutocomplete = ({ onSelect }) => {
  const [professions, setProfessions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [query, setQuery] = useState('');
  
  useEffect(() => {
    getProfessions().then(setProfessions);
  }, []);
  
  useEffect(() => {
    if (query.length > 0) {
      const filtered = professions.filter(prof =>
        prof.label.toLowerCase().includes(query.toLowerCase())
      );
      setFiltered(filtered.slice(0, 10)); // Limit results
    } else {
      setFiltered([]);
    }
  }, [query, professions]);
  
  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search profession..."
      />
      {filtered.length > 0 && (
        <ul>
          {filtered.map(prof => (
            <li key={prof.value} onClick={() => onSelect(prof)}>
              {prof.emoji} {prof.label} - {prof.category}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
```

**Get Travel Styles and Personality Types:**
```javascript
const getTravelStyles = async () => {
  const response = await fetch('https://api.berse-app.com/v2/metadata/profile/travel-styles');
  const data = await response.json();
  return data.success ? data.data.items : [];
};

const getPersonalityTypes = async () => {
  const response = await fetch('https://api.berse-app.com/v2/metadata/profile/personality-types');
  const data = await response.json();
  return data.success ? data.data.items : [];
};

// Combined profile completion component
const ProfileCompletion = () => {
  const [travelStyles, setTravelStyles] = useState([]);
  const [personalityTypes, setPersonalityTypes] = useState([]);
  const [selectedTravelStyle, setSelectedTravelStyle] = useState('');
  const [selectedPersonality, setSelectedPersonality] = useState('');
  
  useEffect(() => {
    Promise.all([
      getTravelStyles(),
      getPersonalityTypes()
    ]).then(([styles, types]) => {
      setTravelStyles(styles);
      setPersonalityTypes(types);
    });
  }, []);
  
  return (
    <div>
      <div>
        <h3>What's your travel style?</h3>
        {travelStyles.map(style => (
          <div key={style.value}>
            <input
              type="radio"
              id={style.value}
              name="travelStyle"
              value={style.value}
              checked={selectedTravelStyle === style.value}
              onChange={(e) => setSelectedTravelStyle(e.target.value)}
            />
            <label htmlFor={style.value}>
              {style.emoji} <strong>{style.label}</strong> - {style.description}
            </label>
          </div>
        ))}
      </div>
      
      <div>
        <h3>What's your personality type?</h3>
        {personalityTypes.map(type => (
          <div key={type.value}>
            <input
              type="radio"
              id={type.value}
              name="personalityType"
              value={type.value}
              checked={selectedPersonality === type.value}
              onChange={(e) => setSelectedPersonality(e.target.value)}
            />
            <label htmlFor={type.value}>
              {type.emoji} <strong>{type.label}</strong> ({type.category}) - {type.description}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### cURL Examples

**Get All Countries:**
```bash
# Get all countries (default pagination)
curl https://api.berse-app.com/v2/metadata/countries

# Get first 50 countries
curl "https://api.berse-app.com/v2/metadata/countries?page=1&limit=50"

# Get second page with 25 countries per page
curl "https://api.berse-app.com/v2/metadata/countries?page=2&limit=25"
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
# Get first page of cities in Malaysia (default 100 per page)
curl https://api.berse-app.com/v2/metadata/countries/MY/cities

# Get second page with 50 cities per page
curl "https://api.berse-app.com/v2/metadata/countries/MY/cities?page=2&limit=50"

# Search for cities containing "Kuala" (first page, 10 results)
curl "https://api.berse-app.com/v2/metadata/countries/MY/cities?search=Kuala&page=1&limit=10"
```

**Get Cities by State:**
```bash
# Get first page of cities in California (default 100 per page)
curl https://api.berse-app.com/v2/metadata/countries/US/states/CA/cities

# Get second page with 50 cities per page
curl "https://api.berse-app.com/v2/metadata/countries/US/states/CA/cities?page=2&limit=50"

# Search California cities containing "Los" (first page, 20 results)
curl "https://api.berse-app.com/v2/metadata/countries/US/states/CA/cities?search=Los&page=1&limit=20"
```

**Search Cities Globally:**
```bash
# Search for cities containing "kuala"
curl "https://api.berse-app.com/v2/metadata/cities/search?q=kuala"

# Search for cities containing "new" (first page, 20 results)
curl "https://api.berse-app.com/v2/metadata/cities/search?q=new&page=1&limit=20"

# Search for cities containing "san" (second page)
curl "https://api.berse-app.com/v2/metadata/cities/search?q=san&page=2&limit=50"

# Search for "paris"
curl "https://api.berse-app.com/v2/metadata/cities/search?q=paris"
```

**Get Cities with Filters:**
```bash
# Get first page of cities in Singapore (10 per page)
curl "https://api.berse-app.com/v2/metadata/cities?countryCode=SG&page=1&limit=10"

# Get cities in California, USA (second page, 20 per page)
curl "https://api.berse-app.com/v2/metadata/cities?countryCode=US&stateCode=CA&page=2&limit=20"

# Get all cities (first page of global dataset - large!)
curl "https://api.berse-app.com/v2/metadata/cities?page=1&limit=100"
```

**Get Popular Cities:**
```bash
# Get top 5 popular cities globally
curl https://api.berse-app.com/v2/metadata/cities/popular

# Get top 10 popular cities
curl "https://api.berse-app.com/v2/metadata/cities/popular?limit=10"

# Get popular cities near Kuala Lumpur (within 300km)
curl "https://api.berse-app.com/v2/metadata/cities/popular?userLatitude=3.139&userLongitude=101.6869&limit=5&radius=300"

# Get popular cities near Singapore (within 500km)
curl "https://api.berse-app.com/v2/metadata/cities/popular?userLatitude=1.3521&userLongitude=103.8198&limit=5&radius=500"
```

**Get All Profile Metadata:**
```bash
# Get all profile metadata in one call
curl https://api.berse-app.com/v2/metadata/profile

# Development endpoint
curl http://localhost:3001/v2/metadata/profile
```

**Get Interests List:**
```bash
curl https://api.berse-app.com/v2/metadata/profile/interests
```

**Get Languages List:**
```bash
curl https://api.berse-app.com/v2/metadata/profile/languages
```

**Get Professions List:**
```bash
curl https://api.berse-app.com/v2/metadata/profile/professions
```

**Get Genders List:**
```bash
curl https://api.berse-app.com/v2/metadata/profile/genders
```

**Get Travel Styles List:**
```bash
curl https://api.berse-app.com/v2/metadata/profile/travel-styles
```

**Get Personality Types List:**
```bash
curl https://api.berse-app.com/v2/metadata/profile/personality-types
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

**Profile Metadata Loading in React Native:**
```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';

const ProfileSetupScreen = () => {
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadProfileMetadata();
  }, []);
  
  const loadProfileMetadata = async () => {
    try {
      const response = await fetch('https://api.berse-app.com/v2/metadata/profile');
      const data = await response.json();
      
      if (data.success) {
        setMetadata(data.data);
        // Cache for offline use
        await AsyncStorage.setItem('profileMetadata', JSON.stringify(data.data));
      }
    } catch (error) {
      console.error('Failed to load metadata:', error);
      // Try to load from cache
      const cached = await AsyncStorage.getItem('profileMetadata');
      if (cached) {
        setMetadata(JSON.parse(cached));
      }
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) return <Text>Loading profile options...</Text>;
  if (!metadata) return <Text>Failed to load profile options</Text>;
  
  return (
    <View>
      <Text>Profile Setup</Text>
      <Text>Languages: {metadata.languages.items.length}</Text>
      <Text>Interests: {metadata.interests.items.length}</Text>
      <Text>Professions: {metadata.professions.items.length}</Text>
    </View>
  );
};
```

**Interest Selection Component:**
```typescript
const InterestSelector = ({ selectedInterests, onSelectionChange }) => {
  const [interests, setInterests] = useState([]);
  
  useEffect(() => {
    fetch('https://api.berse-app.com/v2/metadata/profile/interests')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Group by category
          const grouped = data.data.items.reduce((acc, item) => {
            if (!acc[item.category]) acc[item.category] = [];
            acc[item.category].push(item);
            return acc;
          }, {});
          setInterests(grouped);
        }
      });
  }, []);
  
  const toggleInterest = (interest) => {
    const isSelected = selectedInterests.includes(interest.value);
    if (isSelected) {
      onSelectionChange(selectedInterests.filter(i => i !== interest.value));
    } else {
      onSelectionChange([...selectedInterests, interest.value]);
    }
  };
  
  return (
    <FlatList
      data={Object.entries(interests)}
      keyExtractor={([category]) => category}
      renderItem={({ item: [category, items] }) => (
        <View>
          <Text style={{ fontWeight: 'bold' }}>{category}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {items.map(interest => (
              <TouchableOpacity
                key={interest.value}
                onPress={() => toggleInterest(interest)}
                style={{
                  backgroundColor: selectedInterests.includes(interest.value) 
                    ? '#007bff' : '#f0f0f0',
                  padding: 8,
                  margin: 4,
                  borderRadius: 4
                }}
              >
                <Text>{interest.emoji} {interest.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    />
  );
};
```

**Language Picker:**
```typescript
const LanguagePicker = ({ selectedLanguage, onSelect }) => {
  const [languages, setLanguages] = useState([]);
  
  useEffect(() => {
    fetch('https://api.berse-app.com/v2/metadata/profile/languages')
      .then(res => res.json())
      .then(data => data.success && setLanguages(data.data.items));
  }, []);
  
  return (
    <Picker selectedValue={selectedLanguage} onValueChange={onSelect}>
      <Picker.Item label="Select Language" value="" />
      {languages.map(lang => (
        <Picker.Item 
          key={lang.value} 
          label={`${lang.emoji} ${lang.label}`} 
          value={lang.value} 
        />
      ))}
    </Picker>
  );
};
```

### 8. Profile Metadata Best Practices
```javascript
// ✅ Good: Load all metadata once and cache locally
const ProfileMetadataManager = {
  data: null,
  lastFetched: null,
  
  async loadAll() {
    // Check if we have fresh data (less than 24 hours old)
    if (this.data && this.lastFetched && 
        Date.now() - this.lastFetched < 86400000) {
      return this.data;
    }
    
    const response = await fetch('/v2/metadata/profile');
    const result = await response.json();
    
    if (result.success) {
      this.data = result.data;
      this.lastFetched = Date.now();
      return this.data;
    }
    
    throw new Error('Failed to load profile metadata');
  },
  
  getInterests() { return this.data?.interests.items || []; },
  getLanguages() { return this.data?.languages.items || []; },
  getProfessions() { return this.data?.professions.items || []; },
  getGenders() { return this.data?.genders.items || []; },
  getTravelStyles() { return this.data?.travelStyles.items || []; },
  getPersonalityTypes() { return this.data?.personalityTypes.items || []; }
};

// ✅ Good: Group interests by category for better UX
const groupInterestsByCategory = (interests) => {
  return interests.reduce((acc, interest) => {
    if (!acc[interest.category]) {
      acc[interest.category] = [];
    }
    acc[interest.category].push(interest);
    return acc;
  }, {});
};

// ✅ Good: Implement smart search for professions
const searchProfessions = (professions, query) => {
  if (!query || query.length < 2) return [];
  
  const lowercaseQuery = query.toLowerCase();
  return professions
    .filter(prof => 
      prof.label.toLowerCase().includes(lowercaseQuery) ||
      prof.category.toLowerCase().includes(lowercaseQuery)
    )
    .slice(0, 10); // Limit results
};

// ✅ Good: Validate selections against metadata
const validateProfileSelections = (selections, metadata) => {
  const errors = {};
  
  // Check if selected interests exist
  if (selections.interests) {
    const validInterests = metadata.interests.items.map(i => i.value);
    const invalidInterests = selections.interests.filter(i => !validInterests.includes(i));
    if (invalidInterests.length > 0) {
      errors.interests = `Invalid interests: ${invalidInterests.join(', ')}`;
    }
  }
  
  // Check if selected language exists
  if (selections.language) {
    const validLanguages = metadata.languages.items.map(l => l.value);
    if (!validLanguages.includes(selections.language)) {
      errors.language = 'Invalid language selection';
    }
  }
  
  return errors;
};

// ✅ Good: Handle offline mode gracefully
const getProfileMetadataWithFallback = async () => {
  try {
    // Try network first
    const response = await fetch('/v2/metadata/profile');
    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        localStorage.setItem('profileMetadata', JSON.stringify(data.data));
        localStorage.setItem('metadataTimestamp', Date.now().toString());
        return data.data;
      }
    }
  } catch (error) {
    console.warn('Network request failed, trying cache');
  }
  
  // Fallback to cache
  const cached = localStorage.getItem('profileMetadata');
  const timestamp = localStorage.getItem('metadataTimestamp');
  
  if (cached && timestamp) {
    const age = Date.now() - parseInt(timestamp);
    if (age < 7 * 24 * 60 * 60 * 1000) { // 7 days
      console.log('Using cached metadata');
      return JSON.parse(cached);
    }
  }
  
  throw new Error('No metadata available');
};
```

### 9. Profile-Specific Integration Patterns
```javascript
// Multi-step profile creation with metadata validation
class ProfileCreator {
  constructor() {
    this.metadata = null;
    this.currentStep = 1;
    this.profileData = {};
  }
  
  async initialize() {
    this.metadata = await getProfileMetadataWithFallback();
  }
  
  // Step 1: Basic info (name, gender, language)
  setBasicInfo(data) {
    const errors = this.validateBasicInfo(data);
    if (Object.keys(errors).length > 0) {
      throw new Error(`Validation errors: ${Object.values(errors).join(', ')}`);
    }
    this.profileData = { ...this.profileData, ...data };
    this.currentStep = 2;
  }
  
  // Step 2: Interests and profession
  setInterestsAndProfession(data) {
    const errors = this.validateInterestsAndProfession(data);
    if (Object.keys(errors).length > 0) {
      throw new Error(`Validation errors: ${Object.values(errors).join(', ')}`);
    }
    this.profileData = { ...this.profileData, ...data };
    this.currentStep = 3;
  }
  
  // Step 3: Travel preferences and personality
  setPreferences(data) {
    const errors = this.validatePreferences(data);
    if (Object.keys(errors).length > 0) {
      throw new Error(`Validation errors: ${Object.values(errors).join(', ')}`);
    }
    this.profileData = { ...this.profileData, ...data };
    this.currentStep = 4;
  }
  
  validateBasicInfo(data) {
    const errors = {};
    const validGenders = this.metadata.genders.items.map(g => g.value);
    const validLanguages = this.metadata.languages.items.map(l => l.value);
    
    if (data.gender && !validGenders.includes(data.gender)) {
      errors.gender = 'Invalid gender';
    }
    if (data.language && !validLanguages.includes(data.language)) {
      errors.language = 'Invalid language';
    }
    return errors;
  }
  
  validateInterestsAndProfession(data) {
    const errors = {};
    const validInterests = this.metadata.interests.items.map(i => i.value);
    const validProfessions = this.metadata.professions.items.map(p => p.value);
    
    if (data.interests) {
      const invalidInterests = data.interests.filter(i => !validInterests.includes(i));
      if (invalidInterests.length > 0) {
        errors.interests = `Invalid interests: ${invalidInterests.join(', ')}`;
      }
    }
    if (data.profession && !validProfessions.includes(data.profession)) {
      errors.profession = 'Invalid profession';
    }
    return errors;
  }
  
  validatePreferences(data) {
    const errors = {};
    const validTravelStyles = this.metadata.travelStyles.items.map(t => t.value);
    const validPersonalityTypes = this.metadata.personalityTypes.items.map(p => p.value);
    
    if (data.travelStyle && !validTravelStyles.includes(data.travelStyle)) {
      errors.travelStyle = 'Invalid travel style';
    }
    if (data.personalityType && !validPersonalityTypes.includes(data.personalityType)) {
      errors.personalityType = 'Invalid personality type';
    }
    return errors;
  }
  
  getProgress() {
    return {
      currentStep: this.currentStep,
      totalSteps: 3,
      completed: this.currentStep > 3,
      profileData: this.profileData
    };
  }
}

// Usage
const creator = new ProfileCreator();
await creator.initialize();

// Step through profile creation
creator.setBasicInfo({
  name: 'John Doe',
  gender: 'Male',
  language: 'en'
});

creator.setInterestsAndProfession({
  interests: ['fitness', 'technology', 'travel'],
  profession: 'software_engineer'
});

creator.setPreferences({
  travelStyle: 'Backpacker',
  personalityType: 'INTJ'
});

console.log('Profile creation complete:', creator.getProgress());
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

### Profile Metadata Data
Profile metadata is curated from industry standards and user research:

- **Interests & Hobbies:** Categorized from common user preferences and activities
- **Languages:** ISO language codes with native names and flag emojis
- **Professions:** Based on standard occupational classifications
- **Genders:** Inclusive options following modern UX best practices
- **Travel Styles:** Derived from tourism industry categorizations
- **Personality Types:** Myers-Briggs Type Indicator (MBTI) 16-type system

**Data Quality:**
- ✅ Curated and categorized for consistency
- ✅ Includes emojis for visual appeal
- ✅ Localized where appropriate
- ✅ Regularly reviewed and updated
- ✅ Inclusive and diverse options

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

### 6. Optimize City Search and Pagination
For better performance with city searches and large datasets:

```javascript
// ✅ Good: Use debouncing with pagination
const debouncedSearch = debounce(async (query) => {
  const params = new URLSearchParams({
    search: query,
    page: '1',
    limit: '10'
  });
  
  const response = await fetch(
    `/v2/metadata/countries/${countryCode}/cities?${params}`
  );
  const data = await response.json();
  
  // Update UI with results and pagination info
  setResults(data.data.cities);
  setPagination(data.data.pagination);
}, 300);

// ✅ Good: Set reasonable page sizes
const cities = await fetch(`/v2/metadata/countries/US/cities?page=1&limit=100`);

// ✅ Good: Implement progressive loading for large datasets
const loadAllCitiesProgressively = async (countryCode) => {
  let allCities = [];
  let currentPage = 1;
  const limit = 100;
  
  while (true) {
    const response = await fetch(
      `/v2/metadata/countries/${countryCode}/cities?page=${currentPage}&limit=${limit}`
    );
    const data = await response.json();
    
    if (!data.success || data.data.cities.length === 0) break;
    
    allCities.push(...data.data.cities);
    
    if (!data.data.pagination.hasNextPage) break;
    currentPage++;
  }
  
  return allCities;
};

// ❌ Bad: No pagination on large datasets
const cities = await fetch(`/v2/metadata/countries/US/cities`); // Could return 10,000+ cities without pagination
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

### 8. Implement Smart Pagination
```javascript
// ✅ Good: Implement pagination with caching
class PaginatedCityLoader {
  constructor(countryCode) {
    this.countryCode = countryCode;
    this.cache = new Map(); // Cache pages by page number
    this.pageSize = 100;
  }
  
  async loadPage(page) {
    // Check cache first
    const cacheKey = `${this.countryCode}_page_${page}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    // Fetch from API
    const response = await fetch(
      `/v2/metadata/countries/${this.countryCode}/cities?page=${page}&limit=${this.pageSize}`
    );
    const data = await response.json();
    
    // Cache the result
    this.cache.set(cacheKey, data.data);
    
    return data.data;
  }
  
  async searchWithPagination(query, page = 1) {
    const params = new URLSearchParams({
      search: query,
      page: page.toString(),
      limit: this.pageSize.toString()
    });
    
    const response = await fetch(
      `/v2/metadata/countries/${this.countryCode}/cities?${params}`
    );
    return await response.json();
  }
}

// Usage
const cityLoader = new PaginatedCityLoader('US');
const firstPage = await cityLoader.loadPage(1);
```

### 9. Cache Strategically
```javascript
// Cache countries with pagination support
const COUNTRIES_CACHE_KEY = 'metadata_countries';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

const getCachedCountries = async (page = 1, limit = 250) => {
  const cacheKey = `${COUNTRIES_CACHE_KEY}_${page}_${limit}`;
  const cached = localStorage.getItem(cacheKey);
  const cacheTime = localStorage.getItem(`${cacheKey}_time`);
  
  if (cached && cacheTime && Date.now() - cacheTime < CACHE_DURATION) {
    return JSON.parse(cached);
  }
  
  // Fetch with pagination
  const response = await fetch(
    `/v2/metadata/countries?page=${page}&limit=${limit}`
  );
  const data = await response.json();
  
  localStorage.setItem(cacheKey, JSON.stringify(data.data));
  localStorage.setItem(`${cacheKey}_time`, Date.now().toString());
  
  return data.data;
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

### v2.2.0 (2025-10-19)
- **✨ NEW:** Added `/cities/search` endpoint for global city search by name
- Global city search without requiring country selection first
- Returns city name with country and state information for context
- Supports pagination (max 100 results per page)
- Minimum query length: 2 characters
- Case-insensitive substring matching across 130,000+ cities
- Cached for 1 day for optimal performance

### v2.1.0 (2025-10-16)
- **🎯 BREAKING CHANGE:** Added comprehensive pagination support to all city endpoints
- **🎯 BREAKING CHANGE:** Added pagination to countries endpoint for consistency
- **✨ NEW:** Added `/cities/popular` endpoint for dynamic city recommendations
- Added `page` and `limit` query parameters to all relevant endpoints
- Updated response format to include `pagination` object with navigation metadata
- Enhanced cache keys to include pagination parameters
- Updated documentation with pagination examples and best practices
- Set reasonable pagination limits: Countries (250), Cities (500), States (no limit)
- Improved performance for large datasets through proper pagination
- Added pagination support to JavaScript, cURL, and React examples
- Popular cities endpoint uses smart scoring based on users and events
- Location-aware ranking with proximity bonuses when user coordinates provided
- Automatic fallback to top global cities (KL, Singapore, Jakarta, Bangkok, Manila)

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
