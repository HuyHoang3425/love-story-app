# Love Story Application

![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)

A backend application for "Love Story", designed to manage and share memorable moments. This application provides a RESTful API to interact with the data.

## ✨ Features

- RESTful API endpoints
- Environment-based configuration
- Structured logging with Winston and Morgan
- Code formatting with Prettier

## 🛠️ Technologies Used

- **Node.js**: JavaScript runtime environment
- **Express.js**: Web framework for Node.js
- **MongoDB**: NoSQL database
- **Mongoose**: ODM library for MongoDB and Node.js
- **dotenv**: For managing environment variables
- **Winston**: For logging
- **Morgan**: HTTP request logger middleware
- **Prettier**: Code formatter

## 🚀 Getting Started

### Prerequisites

Make sure you have Node.js and npm installed on your machine. You will also need a MongoDB database instance.

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/HuyHoang3425/love-story-app.git
    ```
2.  Navigate to the project directory:
    ```bash
    cd love-story-app
    ```
3.  Install the dependencies:
    ```bash
    npm install
    ```

### Configuration

This project uses environment variables for configuration. Create a `.env` file in the root of the project and add the following variables. You can use the `.env.example` file as a template.

```env
# Port for the server to run on
PORT=3000

# MongoDB Connection URI
MONGODB_URI=mongodb://localhost:27017/love-story-db

# Node environment
NODE_ENV=development
```

## Usage

You can run the application in two modes:

-   **Development Mode**: Starts the server with `nodemon` for automatic restarts on file changes.
    ```bash
    npm run dev
    ```

-   **Production Mode**: Starts the server in a production-ready state.
    ```bash
    npm run prod
    ```

The server will be accessible at `http://localhost:3000` (or the port you specified).

## 📜 Available Scripts

In the project directory, you can run the following commands:

| Script        | Description                                       |
| ------------- | ------------------------------------------------- |
| `npm run dev`   | Starts the server in development mode.            |
| `npm run prod`  | Starts the server in production mode.             |
| `npm run format`| Formats all code in the `src` directory with Prettier. |

## 📝 API Documentation

(The API documentation is not yet available. This section will be updated with details about the available endpoints.)

## 📄 License

This project is licensed under the ISC License.

## 👤 Author

-   **Name**: hit
-   **GitHub**: [@HuyHoang3425](https://github.com/HuyHoang3425) 