# Restaurant and Cuisine API with Redis

This project is a RESTful API built using Redis as the primary database to manage and cache restaurant and cuisine data. It leverages various Redis data structures and features to efficiently store, retrieve, and query data.

## Features

### Redis Data Structures and Features Used
- **Hashes**: Store restaurant details (e.g., name, address, contact) as key-value pairs for efficient retrieval and updates.
- **Lists**: Manage ordered collections, such as lists of cuisines or restaurant reviews.
- **Sets**: Store unique collections, such as unique cuisine types or restaurant categories.
- **Sorted Sets**: Rank restaurants or cuisines based on scores, such as ratings or popularity.
- **JSON**: Store complex restaurant or cuisine data in JSON format for flexible querying and manipulation.
- **Search**: Enable full-text search capabilities for restaurant names, cuisines, or other attributes.
- **Bloom Filters**: Optimize membership queries to check for the existence of restaurants or cuisines with minimal memory usage.

### Use Case
The API uses Redis to cache restaurant and cuisine data, enabling fast retrieval and querying for applications. It supports operations like:
- Storing and retrieving restaurant details.
- Managing lists of cuisines or reviews.
- Ranking restaurants by ratings or other criteria.
- Searching for restaurants or cuisines by keywords.
- Efficiently checking for the existence of specific data using Bloom Filters.

## Setup and Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/waleed21121/Redis.git
   cd Redis
   ```

2. **Install Dependencies**:
   Ensure Redis is installed and running. Install required dependencies (e.g., Node.js, Python, or other runtime based on implementation) using:
   ```bash
   npm install  # For Node.js-based projects
   ```

3. **Configure Redis**:
   - Ensure Redis server is running (default: `localhost:6379`).
   - Update connection settings in the configuration file if necessary.

4. **Run the API**:
   Start the API server:
   ```bash
   npm run dev
   ```

## Usage

- **Example**:
  ```bash
  curl http://localhost:3000/restaurants
  ```

## License

MIT License. See `LICENSE` for more details.