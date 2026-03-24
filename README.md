# Google Maps Places Scraper

![Apify](https://img.shields.io/badge/Platform-Apify-blue)

Extract business listings from Google Maps - restaurants, shops, services, and more.

## Features

- 🔍 **Search by keyword** - restaurants, cafes, gyms, hotels, etc.
- 📍 **Location filtering** - search in specific cities or areas
- ⭐ **Rich data** - name, rating, reviews, address, phone, website
- 📊 **Lead generation** - perfect for B2B sales and market research

## Use Cases

- **Lead Generation** - Build lists of local businesses
- **Market Research** - Analyze competition in specific areas
- **Business Directories** - Create or enrich your database
- **Real Estate** - Find businesses in target locations

## Input

```json
{
  "query": "restaurants",
  "location": "New York",
  "limit": 20
}
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| query | string | What to search for (required) |
| location | string | Optional location |
| limit | integer | Max results (default 20) |
| language | string | Language code (default en) |

## Output

```json
{
  "query": "restaurants New York",
  "total": 20,
  "places": [
    {
      "name": "Restaurant Name",
      "rating": 4.5,
      "reviews": 230,
      "category": "Restaurant",
      "address": "123 Main St, New York, NY",
      "phone": "+1 555-123-4567",
      "website": "",
      "coordinates": { "lat": 0, "lng": 0 },
      "url": "",
      "openingHours": []
    }
  ]
}
```

## Running on Apify

1. Go to [Apify Console](https://console.apify.com)
2. Create a new Actor or import from GitHub
3. Paste input JSON
4. Run

## Example Use Cases

**Find all coffee shops in London:**
```json
{
  "query": "coffee shop",
  "location": "London",
  "limit": 50
}
```

**Find Chinese restaurants in San Francisco:**
```json
{
  "query": "Chinese restaurant",
  "location": "San Francisco",
  "limit": 30
}
```

## License

MIT
