# Parking Reservation System - NodeJS REST API

> A simple CRUD REST API to serve a Parking Reservation System built using NodeJS in TypeScript.

### Overview

This project is the **backend** for Parking Management System built using **Node.js**, **TypeScript**, and **SQLite**, incorporating **Role-Based Access Control (RBAC)** to manage user permissions effectively. The system provides a comprehensive **RESTful API** for user authentication, garage management, parking spot management, parking reservations, and payment processing. The architecture is designed for maintainability and scalability, leveraging **built-in Node.js libraries for cryptographic functions** and **Zod** for data validation.

### Table of Contents

- [Parking Reservation System - NodeJS REST API](#parking-reservation-system---nodejs-rest-api)
    - [Overview](#overview)
    - [Table of Contents](#table-of-contents)
    - [Features](#features)
    - [Technologies](#technologies)
    - [RBAC Implementation](#rbac-implementation)
      - [Decorator: `@authorize`](#decorator-authorize)
        - [Usage Example](#usage-example)
    - [Getting Started](#getting-started)
    - [Project Structure](#project-structure)
    - [Usage](#usage)
    - [Testing](#testing)
    - [Contributing](#contributing)
    - [API Endpoints](#api-endpoints)
      - [A. User Auth](#a-user-auth)
      - [B. Garage Management](#b-garage-management)
      - [C. Parking Spot Management (IN PROGRESS)](#c-parking-spot-management-in-progress)
      - [D. Parking Reservation (IN PROGRESS)](#d-parking-reservation-in-progress)
      - [E. Payment Processing (IN PROGRESS)](#e-payment-processing-in-progress)
    - [License](#license)
    - [Summary](#summary)

### Features

- **User Authentication**:
  - [x] Create new accounts
  - [x] User login (regular users and garage admins)
  - [x] Logout functionality
  - [x] Token refresh for maintaining sessions

- **Garage Management**:
  - [x] Retrieve a list of all garages
  - [x] Open a new garage
  - [x] Update garage details
  - [x] Delete or close a garage

- **Parking Spot Management**:
  - [ ] Retrieve all parking spots
  - [ ] Add new parking spots
  - [ ] Update parking spot details
  - [ ] Delete parking spots

- **Parking Reservation**:
  - [ ] Reserve a parking spot
  - [ ] Retrieve reservation details
  - [ ] Update existing reservations
  - [ ] Cancel reservations

- **Payment Processing**:
  - [ ] Pay reservation fees

### Technologies

- **Node.js**: JavaScript runtime for building scalable network applications.
- **TypeScript**: A superset of JavaScript that compiles to plain JavaScript, providing static typing.
- **SQLite**: A lightweight database engine for local data storage. Supported in NodeJS as a built-in package since Node v22.5.0.
- **Crypto**: Node.js's built-in library for cryptographic functions, used for password hashing and verification.
- **JWT (JSON Web Tokens)**: For secure user authentication and session management.
- **Zod**: A TypeScript-first schema declaration and validation library, used for validating user input and API requests.

### RBAC Implementation

Role-Based Access Control (RBAC) is a critical component of this Parking Management System. It ensures that users can only access resources and perform actions that are permitted based on their assigned roles. The system currently supports two roles:

- **Garage Admin**: Users with this role have permissions to **manage garages and parking spots**, including creating, updating, and deleting them.
- **User**: Regular users can **reserve parking spots and manage their reservations** but do not have access to garage management functionalities.

#### Decorator: `@authorize`

To enforce RBAC, we have created a custom decorator `@authorize(roles: string[])`. This decorator can be applied to controller methods to restrict access based on the user's role. The decorator checks the user's role against the required roles for the endpoint.

##### Usage Example

Here’s how you can use the `@authorize` decorator in your controller methods:

```typescript
import { IncomingMessage, ServerResponse } from 'http';
import authorize from '../../decorators/authorize';

class GarageController {
  @authorize([EnumUserRole.USER, EnumUserRole.GARAGE_ADMIN])
  public async getGarages(req: IncomingMessage, res: ServerResponse) {
    // Logic of this controller method
  }
  
  @authorize([EnumUserRole.GARAGE_ADMIN])
  public async createGarage(req: IncomingMessage, res: ServerResponse) {
    // Logic of this controller method
  }
}
```

In the above example, the `createGarage` method can be accessed only by users with the `garage_admin` role while the `getGarages` method can be accessed by users with the `user` or `garage_admin` roles.

If a user without the appropriate role attempts to access these endpoints, they will receive a `403 Forbidden` response.

### Getting Started

To get started with this project, follow these steps:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/ricoputrap/node-parking-reservation
   cd node-parking-reservation
   ```

2. **Install Dependencies**:
   Make sure you have Node.js v22.5.0 or above and npm installed. Then run:
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**:
   Create a `.env` file in the root directory and add the following environment variables:
    ```
    PORT=8000

    CRYPTO_ALGO=aes-256-cbc
    CRYPTO_KEY=<random string>
    CRYPTO_IV=<random string>

    ACCESS_TOKEN_SECRET=<random secret string>
    REFRESH_TOKEN_SECRET=<random secret string>
    ```

    1. How to generate values for `CRYPTO_KEY` and `CRYPTO_IV`
       1. Write a simple JS script below:
          ```javascript
          // generate-crypto-keys.js
          const crypto = require('crypto');

          const key = crypto.randomBytes(32);
          const iv = crypto.randomBytes(16);

          const CRYPTO_KEY = key.toString('hex');
          const CRYPTO_IV = iv.toString('hex');

          console.log("CRYPTO_KEY:", CRYPTO_KEY)
          console.log("CRYPTO_IV:", CRYPTO_IV)
          ```
       2. Run the JS script above: `node generate-crypto-keys.js`
       3. Store the generated value of `CRYPTO_KEY` and `CRYPTO_IV` in your `.env` file.
    2. How to generate values for `ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET`
       1. Basically you can put anything inside those two variables.

4. **Compile TypeScript**:
   Compile the TypeScript files to JavaScript:
   ```bash
   npm run build
   ```

5. **Run the Application**:
   Start the server:
   ```bash
   npm start
   ```

6. **Testing the API**:
   You can use tools like Thunder Client, Postman, or cURL to test the API endpoints.

### Project Structure

```
node-parking-reservation/
├── config/
|   ├── constants.ts
|   ├── database.ts
|   ├── enums.ts
├── scripts/
|   ├── db-setup.js
├── src/
|   ├── @types/
│   │   ├── http.d.ts
|   ├── decorators/
│   │   ├── authorize.ts
|   ├── entity/
│   │   ├── garage.entity.ts
│   │   ├── user.entity.ts
|   ├── errors/
│   │   ├── BadRequestError.ts
│   │   ├── ForbiddenError.ts
│   │   ├── NotFoundError.ts
│   │   ├── UnauthorizedError.ts
|   ├── features/
│   │   ├── auth/
│   │   │   ├── handlers/
│   │   │   │   ├── index.ts
│   │   │   │   ├── login.ts
│   │   │   │   ├── logout.ts
│   │   │   │   ├── refresh.ts
│   │   │   │   ├── register.ts
│   │   │   ├── controller.ts
│   │   │   ├── route.ts
│   │   │   ├── validation.ts
│   │   ├── garages/
│   │   │   ├── handlers/
│   │   │   │   ├── create.ts
│   │   │   │   ├── delete.ts
│   │   │   │   ├── getAll.ts
│   │   │   │   ├── getByAdmin.ts
│   │   │   │   ├── index.ts
│   │   │   │   ├── update.ts
│   │   │   ├── controller.ts
│   │   │   ├── route.ts
│   │   │   ├── validation.ts
│   │   ├── parking-spots/
│   │   ├── reservations/
│   │   ├── payments/
|   ├── models/
│   │   ├── garage-model/
│   │   │   ├── index.ts
│   │   │   ├── index.types.ts
│   │   ├── user-model/
│   │   │   ├── index.ts
│   │   │   ├── index.types.ts
│   │   ├── types.ts
|   ├── stores/
│   │   ├── tokens.ts
|   ├── utils/
│   │   ├── http/
│   │   │   ├── index.ts
│   │   ├── logger/
│   │   │   ├── index.ts
│   │   ├── passwordHashing/
│   │   │   ├── index.ts
│   │   ├── token/
│   │   │   ├── index.ts
│   │   │   ├── index.types.ts
│   │   ├── validations/
│   │   │   ├── index.ts
├── index.ts
├── .env
├── .gitignore
├── tsconfig.json
├── package.json
```

### Usage

After setting up the project, you can use the API endpoints listed above to manage users, garages, parking spots, reservations, and payments. Each endpoint adheres to RESTful principles, ensuring a consistent and intuitive interface.

### Testing

You can write unit tests and integration tests for your application using testing frameworks like Jest or Mocha. Ensure that your tests cover all critical functionalities, including user authentication, CRUD operations for garages and parking spots, and reservation management.

### Contributing

Contributions are welcome! If you would like to contribute to this project, please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/YourFeature`).
3. Make your changes and commit them (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/YourFeature`).
5. Open a pull request.


### API Endpoints

#### A. User Auth

1. **Create New Account**
   - **POST** `/api/auth/register`
   - **Request Body**:
      ```json
      {
        "name": string,
        "email": string,
        "password": string,
        "role": string // EnumUserRole
      }
      ```
   - **Response**:
      ```json
      {
        "success": true,
        "message": "User created successfully",
        "data": {
          "id": 1,
          "name": "John Doe",
          "email": "john.doe@gmail.com",
          "role": "user" // or "garage_admin"
        }
      }
      ```

2. **Login**
   - **POST** `/api/auth/login`
   - **Request Body**:
      ```json
      {
        "email": string,
        "password": string
        }
      ```
   - **Response**:
      ```json
      {
        "success": true,
        "message": "Login successful",
        "data": {
          "accessToken": "ajsdjkansdkjsandsa.asdlansdk.asdasd"
        }
      }
      ```

3. **Logout**
   - **POST** `/api/auth/logout`
   - **Request Headers**: `Authorization: Bearer <accessToken>`
   - **Response**:
      ```json
      {
        "success": true,
        "message": "Logout successful"
      }
      ```

4. **Refresh Token**
   - **POST** `/api/auth/refresh`
   - **Request Headers**:
     - `Authorization: Bearer <accessToken>`
     - `refreshToken` httpOnly cookie
   - **Response**:
      ```json
      {
        "success": true,
        "message": "Access token refreshed successfully",
        "data": {
          "accessToken": "aksjdnasd.asdasdasd.asdasdsa"
        }
      }
      ```

#### B. Garage Management

1. **Create a New Garage**
   - **POST** `/api/garages`
   - **Roles**: Garage Admin
   - **Request Headers**: `Authorization: Bearer <accessToken>`
   - - **Allowed role**: Garage Admin
   - **Request Headers**: `Authorization: Bearer <accessToken>`
   - **Request Body**:
      ```json
      {
        "name": "string",
        "location": "string",
        "pricePerHour": "number"
      }
      ```

   - **Response**:
      ```json
      {
        "success": true,
        "message": "Garage created successfully with id 1",
        "data": {
          "id": 1,
          "name": "Downtown Garage",
          "location": "123 Main St, City",
          "pricePerHour": 5.25, // in USD
          "adminID": 1
        }
      }
      ```

2. **Get All Garages**
   - **GET** `/api/garages`
   - **Roles**: Garage Admin and Regular User
   - **Request Headers**: `Authorization: Bearer <accessToken>`
   - **Query Params**:
     - `name`: string
     - `location`: string
     - `startPrice`: number (decimal)
     - `endPrice`: number (decimal)
     - `page`: number
     - `size`: number
  
   - **Response**:
      ```json
      {
        "success": true,
        "message": "Successfully fethced 2 garages",
        "data": [
          {
            "id": 1,
            "name": "Downtown Garage",
            "location": "123 Main St, City",
            "price": 5.25,
            "active": true,
            "adminID": 1
          },
          {
            "id": 1,
            "name": "Uptown Garage",
            "location": "456 Elm St, City",
            "price": 2.5,
            "active": true,
            "adminID": 1
          },
        ]
      }
      ```

3. **Update Garage Information**
   - **PUT** `/api/garages/{garageId}`
   - **Allowed role**: Garage Admin
   - **Request Headers**: `Authorization: Bearer <accessToken>`
   - **Request Body**:
      ```json
      {
        "name": "string",
        "location": "string",
        "pricePerHour": "number"
      }
      ```

   - **Response**:
    ```json
    {
      "success": true,
      "message": "Garage updated successfully",
      "data": {
        "id": 1,
        "name": "Downtown Garage",
        "location": "123 Main St, City",
        "price": 2.25,
        "adminID": 1
      },
    }
    ```

4. **Delete a Garage**
   - **DELETE** `/api/garages/{garageId}`
   - **Allowed role**: Garage Admin
   - **Request Headers**: `Authorization: Bearer <accessToken>`
   - **Response**:
    ```json
    {
      "success": true,
      "message": "Garage deleted successfully"
    }
    ```

---

#### C. Parking Spot Management (IN PROGRESS)

1. **Add a New Parking Spot**
   - **POST** `/api/spots`
   - **Allowed role**: Garage Admin
   - **Request Headers**: `Authorization: Bearer <accessToken>`
   - **Request Body**:
    ```json
    {
      "name": "A1",
      "garageID": 1,
    }
    ```
   - **Response**:
    ```json
    {
      "success": true,
      "message": "Parking spot added successfully",
      "data": {
        "id": 1,
        "garageID": 1,
        "name": "A1",
        "reserved": false,
      }
    }
    ```

2. **Get All Parking Spots in a Garage**
   - **GET** `/api/garages/{garageID}/spots`
   - **Allowed role**: Garage Admin and Regular User
   - **Request Headers**: `Authorization: Bearer <accessToken>`
   - **Response**:
    ```json
    {
      "success": true,
      "message": "Successfully fetched 2 parking spots in garage 1",
      "data": [
        {
          "id": 1,
          "garageID": 1,
          "name": "A1",
          "reserved": false,
        },
        {
          "id": 1,
          "garageID": 1,
          "name": "A1",
          "reserved": false,
        },
      ]
    }
    ```

3. **Update Parking Spot Detail**
   - **PUT** `/api/spots/{spotId}`
   - **Allowed role**: Garage Admin
   - **Request Headers**: `Authorization: Bearer <accessToken>`
   - **Request Body**:
    ```json
    {
      "name": "A1 New Name"
    }
    ```
   - Response:
    ```json
    {
      "success": true,
      "message": "Parking spot status updated successfully",
      "data": {
        "id": 1,
        "garageID": 1,
        "name": "A1 New Name",
        "reserved": false,
      }
    }
    ```

4. **Delete a Parking Spot**
   - **DELETE** `/api/spots/{spotId}`
   - **Allowed role**: Garage Admin
   - **Request Headers**: `Authorization: Bearer <accessToken>`authentication
   - **Response**:
    ```json
    {
      "success": true,
      "message": "Parking spot deleted successfully"
    }
    ```

---

#### D. Parking Reservation (IN PROGRESS)

1. **Create a Parking Reservation**
   - **POST** `/api/reservations`
   - Headers:
     - `Authorization`: `Bearer <token>` // JWT token for user authentication
   - Request Body:
    ```json
    {
      "userId": 1,
      "parkingSpotId": 1,
      "startTime": "2023-10-01T10:00:00Z",
      "endTime": "2023-10-01T12:00:00Z"
    }
    ```
   - Response:
    ```json
    {
      "success": true,
      "message": "Reservation created successfully",
      "data": {
        "reservationId": 1,
        "userId": 1,
        "parkingSpotId": 1,
        "startTime": "2023-10-01T10:00:00Z",
        "endTime": "2023-10-01T12:00:00Z",
        "status": "confirmed"
      }
    }
    ```

2. **Get All Reservations for a User**
   - **GET** `/api/reservations/user`
   - Headers:
     - `Authorization`: `Bearer <token>` // JWT token for user authentication
   - Response:
    ```json
    {
      "success": true,
      "data": [
        {
          "reservationId": 1,
          "userId": 1,
          "parkingSpotId": 1,
          "startTime": "2023-10-01T10:00:00Z",
          "endTime": "2023-10-01T12:00:00Z",
          "status": "confirmed"
        },
        {
          "reservationId": 2,
          "userId": 1,
          "parkingSpotId": 2,
          "startTime": "2023-10-02T10:00:00Z",
          "endTime": "2023-10-02T12:00:00Z",
          "status": "confirmed"
        }
      ]
    }
    ```

3. **Get Reservation Details**
   - **GET** `/api/reservations/{reservationId}`
   - Headers:
     - `Authorization`: `Bearer <token>` // JWT token for user authentication
   - Response:
    ```json
    {
      "success": true,
      "data": {
        "reservationId": 1,
        "userId": 1,
        "parkingSpotId": 1,
        "startTime": "2023-10-01T10:00:00Z",
        "endTime": "2023-10-01T12:00:00Z",
        "status": "confirmed"
      }
    }
    ```

4. **Update a Reservation**
   - **PUT** `/api/reservations/{reservationId}`
   - Headers:
     - `Authorization`: `Bearer <token>` // JWT token for user authentication
   - Request Body:
    ```json
    {
      "parkingSpotId": 2,
      "startTime": "2023-10-01T11:00:00Z",
      "endTime": "2023-10-01T13:00:00Z"
    }
    ```
   - Response:
    ```json
    {
      "success": true,
      "message": "Reservation updated successfully",
      "data": {
        "reservationId": 1,
        "userId": 1,
        "parkingSpotId": 2,
        "startTime": "2023-10-01T11:00:00Z",
        "endTime": "2023-10-01T13:00:00Z",
        "status": "confirmed"
      }
    }
    ```

5. **Cancel a Reservation**
   - **DELETE** `/api/reservations/{reservationId}`
   - Headers:
     - `Authorization`: `Bearer <token>` // JWT token for user authentication
   - Response:
    ```json
    {
      "success": true,
      "message": "Reservation canceled successfully"
    }
    ```

---

#### E. Payment Processing (IN PROGRESS)

1. **Initiate Payment**
   - **POST** `/api/payments`
   - Headers:
     - `Authorization`: `Bearer <token>` // JWT token for user authentication
   - Request Body:
    ```json
    {
      "reservationId": 1,
      "amount": 20.00,
      "paymentMethod": "credit_card",
      "cardDetails": {
        "cardNumber": "string",
        "expiryDate": "MM/YY",
        "cvv": "string"
      }
    }
    ```
   - Response:
    ```json
    {
      "success": true,
      "message": "Payment processed successfully",
      "data": {
        "paymentId": 1,
        "reservationId": 1,
        "amount": 20.00,
        "status": "completed"
      }
    }
    ```

2. **Get Payment Details**
   - **GET** `/api/payments/{paymentId}`
   - Headers:
     - `Authorization`: `Bearer <token>` // JWT token for user authentication
   - Response:
    ```json
    {
      "success": true,
      "data": {
        "paymentId": 1,
        "reservationId": 1,
        "amount": 20.00,
        "status": "completed",
        "paymentMethod": "credit_card",
        "transactionDate": "2023-10-01T10:00:00Z"
      }
    }
    ```

3. **Get All Payments for a User**
   - **GET** `/api/payments/user`
   - Headers:
     - `Authorization`: `Bearer <token>` // JWT token for user authentication
   - Response:
    ```json
    {
      "success": true,
      "data": [
        {
          "paymentId": 1,
          "reservationId": 1,
          "amount": 20.00,
          "status": "completed",
          "paymentMethod": "credit_card",
          "transactionDate": "2023-10-01T10:00:00Z"
        },
        {
          "paymentId": 2,
          "reservationId": 2,
          "amount": 15.00,
          "status": "completed",
          "paymentMethod": "paypal",
          "transactionDate": "2023-10-02T10:00:00Z"
        }
      ]
    }
    ```

4. **Refund Payment**
   - **POST** `/api/payments/refund`
   - Headers:
     - `Authorization`: `Bearer <admin_token>` // JWT token for admin authentication
   - Request Body:
    ```json
    {
      "paymentId": 1,
      "amount": 20.00
    }
    ```
   - Response:
    ```json
    {
      "success": true,
      "message": "Payment refunded successfully",
      "data": {
        "refundId": 1,
        "paymentId": 1,
        "amount": 20.00,
        "status": "refunded"
      }
    }
    ```

5. **Get Payment History**
   - **GET** `/api/payments/history`
   - Headers:
     - `Authorization`: `Bearer <admin_token>` // JWT token for admin authentication
   - Response:
    ```json
    {
      "success": true,
      "data": [
        {
          "paymentId": 1,
          "reservationId": 1,
          "amount": 20.00,
          "status": "completed",
          "transactionDate": "2023-10-01T10:00:00Z"
        },
        {
          "paymentId": 2,
          "reservationId": 2,
          "amount": 15.00,
          "status": "refunded",
          "transactionDate": "2023-10-02T10:00:00Z"
        }
      ]
    }
    ```



### License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.


### Summary
This comprehensive API specification covers the essential functionalities of a Parking Reservation System, including Garage Management, Parking Spot Management, Parking Reservation, and Payment Processing. Each endpoint is meticulously detailed, specifying the required HTTP methods, request bodies, and expected response formats. This structure ensures clarity and precision, enabling developers to implement and utilize the API effectively for their applications. Adjust the specifics as necessary to align with your business logic and application requirements.