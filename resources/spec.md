# Interview Question: Farmers Market API

You are given a CSV file (`farmers_markets.csv`) containing information about farmers markets across the United States.  
The CSV includes the following fields:

- `market_id`  
- `market_name`  
- `city`  
- `state`  
- `zip`  
- `day` (day of week the market is open)  
- `open_time`  
- `close_time`  
- `accepts_snap` (boolean)  
- `products` (comma-separated string of offered goods)  
- `latitude` / `longitude`  
- `contact_name`  
- `phone`  
- `website`

---

## Task

Build a small backend service in **Python** (you may use Flask, Django, or FastAPI) that exposes RESTful API endpoints to interact with this data.

### Requirements

1. **Ingest Data**
   - On startup, load the `farmers_markets.csv` file into memory or a lightweight storage layer.

2. **Endpoints**
   - `GET /markets`: Return a list of all farmers markets in JSON.
   - `GET /markets/<market_id>`: Return details for a specific market.
   - `GET /markets/search?state=CA&day=Saturday`: Allow filtering by state, city, or day.
   - `GET /markets/products/<product>`: Return all markets that sell a given product (e.g., `"honey"`).

3. **Add Market**
   - `POST /markets`: Accept a JSON payload to add a new market record and persist it back to the CSV file.

4. **Validation**
   - Validate inputs (e.g., times in HH:MM format, SNAP acceptance is boolean).
   - Handle errors with appropriate HTTP status codes and messages.

5. **Testing**
   - Include at least one unit test (e.g., `pytest`) for a core function (e.g., filtering markets by product).
   - Provide a trivial test (`assert 1 == 1`) to confirm test framework setup.

---

## Stretch Goals (Optional)

- Implement query parameters for pagination (e.g., `?limit=20&offset=40`).
- Add support for partial text search by market name or city.
- Expose a `GET /markets/nearby?lat=...&lon=...&radius=10km` endpoint that returns markets within a given radius.

---

## Deliverables

- `app.py` (or equivalent entrypoint)
- Any helper modules (`storage.py`, `models.py`, etc.)
- `tests/` folder with at least one functional test
- `README.md` with instructions for running the server locally

---

## Example

```bash
# List all markets in California open on Saturday
curl "http://localhost:5000/markets/search?state=CA&day=Saturday"

# Add a new market
curl -X POST http://localhost:5000/markets \
     -H "Content-Type: application/json" \
     -d '{"market_id":"FM-9999","market_name":"Mission Bay Farmers Market", ... }'
