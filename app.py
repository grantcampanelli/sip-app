#!/usr/bin/env python3
"""
Farmers Market API
A RESTful API service for managing farmers market data.
"""

import csv
import json
import os
from datetime import datetime
from typing import Dict, List, Optional, Any
from flask import Flask, request, jsonify
import re

app = Flask(__name__)

# Global storage for markets data
markets_data: List[Dict[str, Any]] = []
CSV_FILE_PATH = "resources/farmers_markets.csv"


def load_csv_data() -> List[Dict[str, Any]]:
    """Load farmers market data from CSV file into memory."""
    data = []
    try:
        with open(CSV_FILE_PATH, 'r', newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                # Convert boolean fields
                row['accepts_snap'] = row['accepts_snap'].lower() == 'true'
                # Convert numeric fields
                try:
                    row['latitude'] = float(row['latitude'])
                    row['longitude'] = float(row['longitude'])
                except (ValueError, TypeError):
                    row['latitude'] = None
                    row['longitude'] = None
                # Parse products into a list
                row['products'] = [p.strip() for p in row['products'].split(',') if p.strip()]
                data.append(row)
    except FileNotFoundError:
        print(f"Warning: CSV file {CSV_FILE_PATH} not found. Starting with empty data.")
    except Exception as e:
        print(f"Error loading CSV data: {e}")
    return data


def save_csv_data(data: List[Dict[str, Any]]) -> None:
    """Save markets data back to CSV file."""
    if not data:
        return
    
    fieldnames = [
        'market_id', 'market_name', 'city', 'state', 'zip', 'day',
        'open_time', 'close_time', 'accepts_snap', 'products',
        'latitude', 'longitude', 'contact_name', 'phone', 'website'
    ]
    
    try:
        with open(CSV_FILE_PATH, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            for row in data:
                # Convert back to CSV format
                csv_row = row.copy()
                csv_row['accepts_snap'] = str(row['accepts_snap'])
                csv_row['products'] = ', '.join(row['products'])
                writer.writerow(csv_row)
    except Exception as e:
        print(f"Error saving CSV data: {e}")
        raise


def validate_time_format(time_str: str) -> bool:
    """Validate time format is HH:MM."""
    if not time_str:
        return False
    pattern = re.compile(r'^([0-1][0-9]|2[0-3]):[0-5][0-9]$')
    return bool(pattern.match(time_str))


def validate_market_data(data: Dict[str, Any]) -> tuple[bool, str]:
    """Validate market data for POST requests."""
    required_fields = ['market_id', 'market_name', 'city', 'state', 'day']
    
    # Check required fields
    for field in required_fields:
        if field not in data or not data[field]:
            return False, f"Missing required field: {field}"
    
    # Validate time formats if provided
    if 'open_time' in data and data['open_time']:
        if not validate_time_format(data['open_time']):
            return False, "Invalid open_time format. Expected HH:MM"
    
    if 'close_time' in data and data['close_time']:
        if not validate_time_format(data['close_time']):
            return False, "Invalid close_time format. Expected HH:MM"
    
    # Validate accepts_snap is boolean if provided
    if 'accepts_snap' in data:
        if not isinstance(data['accepts_snap'], bool):
            return False, "accepts_snap must be a boolean value"
    
    # Validate latitude/longitude if provided
    if 'latitude' in data and data['latitude'] is not None:
        try:
            lat = float(data['latitude'])
            if not (-90 <= lat <= 90):
                return False, "Latitude must be between -90 and 90"
        except (ValueError, TypeError):
            return False, "Invalid latitude format"
    
    if 'longitude' in data and data['longitude'] is not None:
        try:
            lon = float(data['longitude'])
            if not (-180 <= lon <= 180):
                return False, "Longitude must be between -180 and 180"
        except (ValueError, TypeError):
            return False, "Invalid longitude format"
    
    # Check if market_id already exists
    if any(market['market_id'] == data['market_id'] for market in markets_data):
        return False, f"Market with ID {data['market_id']} already exists"
    
    return True, ""


@app.route('/markets', methods=['GET'])
def get_markets():
    """Return a list of all farmers markets."""
    return jsonify(markets_data)


@app.route('/markets/<market_id>', methods=['GET'])
def get_market(market_id: str):
    """Return details for a specific market."""
    market = next((m for m in markets_data if m['market_id'] == market_id), None)
    if market is None:
        return jsonify({'error': 'Market not found'}), 404
    return jsonify(market)


@app.route('/markets/search', methods=['GET'])
def search_markets():
    """Filter markets by state, city, or day."""
    state = request.args.get('state', '').upper()
    city = request.args.get('city', '').lower()
    day = request.args.get('day', '').lower()
    
    filtered_markets = markets_data
    
    if state:
        filtered_markets = [m for m in filtered_markets if m['state'].upper() == state]
    
    if city:
        filtered_markets = [m for m in filtered_markets if m['city'].lower() == city]
    
    if day:
        filtered_markets = [m for m in filtered_markets if m['day'].lower() == day]
    
    return jsonify(filtered_markets)


@app.route('/markets/products/<product>', methods=['GET'])
def get_markets_by_product(product: str):
    """Return all markets that sell a given product."""
    product_lower = product.lower()
    matching_markets = [
        market for market in markets_data
        if any(p.lower() == product_lower for p in market['products'])
    ]
    return jsonify(matching_markets)


@app.route('/markets', methods=['POST'])
def add_market():
    """Add a new market record and persist it to the CSV file."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        # Validate the data
        is_valid, error_message = validate_market_data(data)
        if not is_valid:
            return jsonify({'error': error_message}), 400
        
        # Set default values for optional fields
        new_market = {
            'market_id': data['market_id'],
            'market_name': data['market_name'],
            'city': data['city'],
            'state': data['state'],
            'zip': data.get('zip', ''),
            'day': data['day'],
            'open_time': data.get('open_time', ''),
            'close_time': data.get('close_time', ''),
            'accepts_snap': data.get('accepts_snap', False),
            'products': data.get('products', []),
            'latitude': data.get('latitude'),
            'longitude': data.get('longitude'),
            'contact_name': data.get('contact_name', ''),
            'phone': data.get('phone', ''),
            'website': data.get('website', '')
        }
        
        # Ensure products is a list
        if isinstance(new_market['products'], str):
            new_market['products'] = [p.strip() for p in new_market['products'].split(',') if p.strip()]
        
        # Add to in-memory data
        markets_data.append(new_market)
        
        # Save to CSV file
        save_csv_data(markets_data)
        
        return jsonify(new_market), 201
        
    except Exception as e:
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors."""
    return jsonify({'error': 'Endpoint not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors."""
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    # Load data on startup
    markets_data = load_csv_data()
    print(f"Loaded {len(markets_data)} farmers markets from CSV")
    
    # Run the Flask app
    app.run(debug=True, host='0.0.0.0', port=5000)
