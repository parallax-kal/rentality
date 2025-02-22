Here’s a **comprehensive README.md** for your GitHub repository. This README includes all the necessary information about your project, how to set it up, and how to contribute. You can customize it further based on your specific needs.

---

# Rentality - Property Booking Platform

Rentality is a modern property booking platform that allows users to rent properties and hosts to manage their listings. Built with **Next.js**, **Prisma**, and **PostgreSQL**, this platform provides a seamless experience for both renters and hosts.

## Features

- **User Roles**:
  - **Renters**: Browse properties, book dates, and manage bookings.
  - **Hosts**: List properties, manage bookings, and update property statuses.

- **Booking Management**:
  - Renters can book properties for specific dates.
  - Hosts can approve or reject bookings.
  - Overlapping booking dates are automatically prevented.

- **Database**:
  - Uses **PostgreSQL** for robust data storage.
  - Managed with **Prisma** for type-safe database access.

- **Authentication**:
  - Secure user authentication using **NextAuth.js**.

- **Responsive Design**:
  - Built with a mobile-first approach for seamless use on all devices.

## Tech Stack

- **Frontend**: Next.js, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Deployment**: Docker, Docker Compose

---

## Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installed on your machine.
- [Node.js](https://nodejs.org/) (v18 or higher) for local development.

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/your-username/rentality.git
   cd rentality
   ```

2. **Set up environment variables**:

   - Copy the `.env.example` file to `.env`:

     ```bash
     cp .env.example .env
     ```

   - Open the `.env` file and replace the placeholder values with your actual credentials:

     ```plaintext
     # Google OAuth Credentials
     GOOGLE_CLIENT_ID=your-google-client-id
     GOOGLE_CLIENT_SECRET=your-google-client-secret

     # Database Connection URL
     DATABASE_URL=postgresql://user:password@localhost:5432/database_name

     # NextAuth.js Configuration
     NEXTAUTH_SECRET=your-secret-key
     NEXTAUTH_URL=http://localhost:3000/api/auth

     # Google Maps API Key
     NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key

     # Base URL for the Application
     BASE_URL=http://localhost:3000
     ```

3. **Start the application with Docker**:

   ```bash
   docker-compose up --build
   ```

   This will:
   - Start a PostgreSQL database.
   - Build and run the Next.js application.

4. **Access the application**:

   - Frontend: `http://localhost:3000`
   - PostgreSQL: `http://localhost:5432` (if needed)

---

### Running Locally (Without Docker)

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Start the PostgreSQL database**:

   - Ensure PostgreSQL is running locally or update the `DATABASE_URL` in `.env` to point to your database.

3. **Run the development server**:

   ```bash
   npm run dev
   ```

4. **Access the application**:

   Open your browser and navigate to `http://localhost:3000`.

---

## Docker Setup

This project includes a `Dockerfile` and `docker-compose.yml` for easy containerization and deployment. The setup includes:

- **PostgreSQL**: Database service.
- **Frontend**: Next.js application.

To start the services:

```bash
docker-compose up --build
```

---

## Environment Variables

The following environment variables are required for the application to run:

| Variable Name                  | Description                                                                 |
|--------------------------------|-----------------------------------------------------------------------------|
| `GOOGLE_CLIENT_ID`             | Google OAuth Client ID for authentication.                                  |
| `GOOGLE_CLIENT_SECRET`         | Google OAuth Client Secret for authentication.                              |
| `DATABASE_URL`                 | PostgreSQL database connection URL.                                         |
| `NEXTAUTH_SECRET`              | Secret key for NextAuth.js session encryption.                              |
| `NEXTAUTH_URL`                 | URL for NextAuth.js authentication endpoints.                               |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | API key for Google Maps integration.                                      |
| `BASE_URL`                     | Base URL for the application (used for API calls and links).                |

---

## Contributing

Contributions are welcome! If you'd like to contribute, please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/YourFeatureName`).
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/YourFeatureName`).
5. Open a pull request.

---


## Support

If you encounter any issues or have questions, feel free to open an issue on GitHub or contact us at [gthecoderkalisa@gmail.com](mailto:gthecoderkalisa@gmail.com).

---

This README provides a clear overview of your project, how to set it up, and how others can contribute. You can add more details, such as screenshots, demo links, or additional features, to make it even more engaging! Let me know if you need further assistance. 🚀