# File uploader

Express application which requires authentication and allows the user to create folders and upload files. Files can be shared using a link for a selected period of time. Folders, files, users and share links are stored in PostgreSQL tables managed using Prisma ORM. Files are stored on a remote server and can be downloaded.

## Table of contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Preview](#preview)
- [Setup](#setup)

## Tech Stack

- Express
- passport-local
- Prisma ORM
- Supastore
- EJS
- Bootstrap

## Preview

<kbd><img src='./screenshots/home.png' alt='Home'></kbd>

## Setup

Clone the repository:

```
git clone https://github.com/mateoo04/file-uploader
cd file-uploader
```

Create a .env file in the project root and define the necessary variables:

```
DATABASE_URL=your_db_url
SECRET=your_secret
FILES_DB_URL=your_files_db_url
FILES_DB_API_KEY=your_db_api_key
```

Run the following commands to install dependencies and set up the database:

```
npm install
npx prisma generate
npx run migrate:deploy
```

Run `npm start` to start the server.
