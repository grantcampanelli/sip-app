#!/usr/bin/env python3
"""
Unit tests for the Farmers Market API
"""

import unittest
import json
import tempfile
import os
import sys
from unittest.mock import patch, mock_open

# Add parent directory to path to import app
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app, load_csv_data, validate_time_format, validate_market_data, markets_data


class TestFarmersMarketAPI(unittest.TestCase):
    """Test cases for the Farmers Market API."""

    def setUp(self):
        """Set up test fixtures before each test method."""
        self.app = app.test_client()
        self.app.testing = True
        
        # Sample test data
        self.test_markets = [
            {
                'market_id': 'FM-TEST-001',
                'market_name': 'Test Market',
                'city': 'Test City',
                'state': 'CA',
                'zip': '12345',
                'day': 'Saturday',
                'open_time': '08:00',
                'close_time': '14:00',
                'accepts_snap': True,
                'products': ['fruits', 'vegetables', 'honey'],
                'latitude': 37.7749,
                'longitude': -122.4194,
                'contact_name': 'Test Contact',
                'phone': '555-1234',
                'website': 'https://test-market.com'
            },
            {
                'market_id': 'FM-TEST-002',
                'market_name': 'Another Market',
                'city': 'Another City',
                'state': 'NY',
                'zip': '67890',
                'day': 'Sunday',
                'open_time': '09:00',
                'close_time': '15:00',
                'accepts_snap': False,
                'products': ['honey', 'dairy', 'meat'],
                'latitude': 40.7128,
                'longitude': -74.0060,
                'contact_name': 'Another Contact',
                'phone': '555-5678',
                'website': 'https://another-market.com'
            }
        ]

    def test_trivial(self):
        """Trivial test to confirm test framework setup."""
        assert 1 == 1

    def test_get_markets_empty(self):
        """Test GET /markets with empty data."""
        with patch('app.markets_data', []):
            response = self.app.get('/markets')
            self.assertEqual(response.status_code, 200)
            data = json.loads(response.data)
            self.assertEqual(data, [])

    def test_get_markets_with_data(self):
        """Test GET /markets with sample data."""
        with patch('app.markets_data', self.test_markets):
            response = self.app.get('/markets')
            self.assertEqual(response.status_code, 200)
            data = json.loads(response.data)
            self.assertEqual(len(data), 2)
            self.assertEqual(data[0]['market_id'], 'FM-TEST-001')

    def test_get_market_by_id_found(self):
        """Test GET /markets/<id> for existing market."""
        with patch('app.markets_data', self.test_markets):
            response = self.app.get('/markets/FM-TEST-001')
            self.assertEqual(response.status_code, 200)
            data = json.loads(response.data)
            self.assertEqual(data['market_name'], 'Test Market')

    def test_get_market_by_id_not_found(self):
        """Test GET /markets/<id> for non-existing market."""
        with patch('app.markets_data', self.test_markets):
            response = self.app.get('/markets/FM-NONEXISTENT')
            self.assertEqual(response.status_code, 404)
            data = json.loads(response.data)
            self.assertIn('error', data)

    def test_search_markets_by_state(self):
        """Test GET /markets/search?state=CA."""
        with patch('app.markets_data', self.test_markets):
            response = self.app.get('/markets/search?state=CA')
            self.assertEqual(response.status_code, 200)
            data = json.loads(response.data)
            self.assertEqual(len(data), 1)
            self.assertEqual(data[0]['state'], 'CA')

    def test_search_markets_by_city(self):
        """Test GET /markets/search?city=test city."""
        with patch('app.markets_data', self.test_markets):
            response = self.app.get('/markets/search?city=test city')
            self.assertEqual(response.status_code, 200)
            data = json.loads(response.data)
            self.assertEqual(len(data), 1)
            self.assertEqual(data[0]['city'], 'Test City')

    def test_search_markets_by_day(self):
        """Test GET /markets/search?day=saturday."""
        with patch('app.markets_data', self.test_markets):
            response = self.app.get('/markets/search?day=saturday')
            self.assertEqual(response.status_code, 200)
            data = json.loads(response.data)
            self.assertEqual(len(data), 1)
            self.assertEqual(data[0]['day'], 'Saturday')

    def test_search_markets_multiple_filters(self):
        """Test GET /markets/search with multiple filters."""
        with patch('app.markets_data', self.test_markets):
            response = self.app.get('/markets/search?state=CA&day=Saturday')
            self.assertEqual(response.status_code, 200)
            data = json.loads(response.data)
            self.assertEqual(len(data), 1)
            self.assertEqual(data[0]['market_id'], 'FM-TEST-001')

    def test_get_markets_by_product_found(self):
        """Test GET /markets/products/<product> for existing product."""
        with patch('app.markets_data', self.test_markets):
            response = self.app.get('/markets/products/honey')
            self.assertEqual(response.status_code, 200)
            data = json.loads(response.data)
            self.assertEqual(len(data), 2)  # Both markets sell honey

    def test_get_markets_by_product_not_found(self):
        """Test GET /markets/products/<product> for non-existing product."""
        with patch('app.markets_data', self.test_markets):
            response = self.app.get('/markets/products/electronics')
            self.assertEqual(response.status_code, 200)
            data = json.loads(response.data)
            self.assertEqual(len(data), 0)

    def test_get_markets_by_product_case_insensitive(self):
        """Test that product search is case insensitive."""
        with patch('app.markets_data', self.test_markets):
            response = self.app.get('/markets/products/HONEY')
            self.assertEqual(response.status_code, 200)
            data = json.loads(response.data)
            self.assertEqual(len(data), 2)

    def test_post_market_valid(self):
        """Test POST /markets with valid data."""
        new_market = {
            'market_id': 'FM-NEW-001',
            'market_name': 'New Market',
            'city': 'New City',
            'state': 'TX',
            'day': 'Monday',
            'open_time': '07:00',
            'close_time': '13:00',
            'accepts_snap': True,
            'products': ['fruits', 'vegetables']
        }
        
        with patch('app.markets_data', []), \
             patch('app.save_csv_data') as mock_save:
            response = self.app.post('/markets',
                                   data=json.dumps(new_market),
                                   content_type='application/json')
            self.assertEqual(response.status_code, 201)
            data = json.loads(response.data)
            self.assertEqual(data['market_id'], 'FM-NEW-001')
            mock_save.assert_called_once()

    def test_post_market_missing_required_field(self):
        """Test POST /markets with missing required field."""
        incomplete_market = {
            'market_name': 'Incomplete Market',
            'city': 'Some City',
            'state': 'CA'
            # Missing market_id and day
        }
        
        with patch('app.markets_data', []):
            response = self.app.post('/markets',
                                   data=json.dumps(incomplete_market),
                                   content_type='application/json')
            self.assertEqual(response.status_code, 400)
            data = json.loads(response.data)
            self.assertIn('error', data)

    def test_post_market_invalid_time_format(self):
        """Test POST /markets with invalid time format."""
        invalid_market = {
            'market_id': 'FM-INVALID-001',
            'market_name': 'Invalid Market',
            'city': 'Some City',
            'state': 'CA',
            'day': 'Tuesday',
            'open_time': '25:00',  # Invalid hour
            'close_time': '14:00'
        }
        
        with patch('app.markets_data', []):
            response = self.app.post('/markets',
                                   data=json.dumps(invalid_market),
                                   content_type='application/json')
            self.assertEqual(response.status_code, 400)
            data = json.loads(response.data)
            self.assertIn('error', data)

    def test_post_market_duplicate_id(self):
        """Test POST /markets with duplicate market_id."""
        duplicate_market = {
            'market_id': 'FM-TEST-001',  # Same as existing market
            'market_name': 'Duplicate Market',
            'city': 'Some City',
            'state': 'CA',
            'day': 'Wednesday'
        }
        
        with patch('app.markets_data', self.test_markets):
            response = self.app.post('/markets',
                                   data=json.dumps(duplicate_market),
                                   content_type='application/json')
            self.assertEqual(response.status_code, 400)
            data = json.loads(response.data)
            self.assertIn('already exists', data['error'])

    def test_validate_time_format(self):
        """Test time format validation function."""
        # Valid formats
        self.assertTrue(validate_time_format('08:00'))
        self.assertTrue(validate_time_format('23:59'))
        self.assertTrue(validate_time_format('00:00'))
        
        # Invalid formats
        self.assertFalse(validate_time_format('24:00'))
        self.assertFalse(validate_time_format('08:60'))
        self.assertFalse(validate_time_format('8:00'))  # Single digit hour without leading zero
        self.assertFalse(validate_time_format('08-00'))  # Wrong separator
        self.assertFalse(validate_time_format(''))
        self.assertFalse(validate_time_format(None))

    def test_validate_market_data(self):
        """Test market data validation function."""
        # Valid data
        valid_data = {
            'market_id': 'FM-VALID-001',
            'market_name': 'Valid Market',
            'city': 'Valid City',
            'state': 'CA',
            'day': 'Friday'
        }
        
        with patch('app.markets_data', []):
            is_valid, error = validate_market_data(valid_data)
            self.assertTrue(is_valid)
            self.assertEqual(error, '')

        # Invalid data - missing required field
        invalid_data = {
            'market_name': 'Invalid Market',
            'city': 'Invalid City'
            # Missing market_id, state, and day
        }
        
        with patch('app.markets_data', []):
            is_valid, error = validate_market_data(invalid_data)
            self.assertFalse(is_valid)
            self.assertIn('Missing required field', error)


class TestCSVOperations(unittest.TestCase):
    """Test CSV loading and saving operations."""

    def test_load_csv_data_file_not_found(self):
        """Test loading CSV data when file doesn't exist."""
        with patch('app.CSV_FILE_PATH', 'nonexistent_file.csv'):
            data = load_csv_data()
            self.assertEqual(data, [])

    def test_load_csv_data_valid_file(self):
        """Test loading CSV data from valid file."""
        csv_content = """market_id,market_name,city,state,zip,day,open_time,close_time,accepts_snap,products,latitude,longitude,contact_name,phone,website
FM-TEST,Test Market,Test City,CA,12345,Saturday,08:00,14:00,True,"fruits, vegetables",37.7749,-122.4194,Test Contact,555-1234,https://test.com"""
        
        with patch('builtins.open', mock_open(read_data=csv_content)):
            with patch('app.CSV_FILE_PATH', 'test.csv'):
                data = load_csv_data()
                self.assertEqual(len(data), 1)
                self.assertEqual(data[0]['market_id'], 'FM-TEST')
                self.assertTrue(data[0]['accepts_snap'])
                self.assertIsInstance(data[0]['products'], list)
                self.assertEqual(len(data[0]['products']), 2)


if __name__ == '__main__':
    unittest.main()

