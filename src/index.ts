import 'reflect-metadata';
import cors from 'cors';
import express from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import { initDatabase } from './db';
import { seedDatabase } from './db/seed';
import { setupRoutes } from './routes';
import { errorHandler } from './utils/middleware/error-handler.middleware';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
    },
    tags: [
      { name: 'User', description: 'User management endpoints' },
      { name: 'Courses', description: 'Course management endpoints' },
      { name: 'Chapters', description: 'Chapter management endpoints' },
      { name: 'Lessons', description: 'Lesson management endpoints' },
      { name: 'Achievements', description: 'Achievement management endpoints' },
      { name: 'Progress', description: 'Lesson progress endpoints' },
    ],
  },
  apis: ['./src/routes.ts', './src/modules/**/*.ts'], // Adjust as needed
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Initialize database and start server
const initializeApp = async (): Promise<void> => {
  try {
    // Initialize database and run migrations
    initDatabase();

    // Seed the database
    await seedDatabase();

    setupRoutes(app);

    app.use(errorHandler);

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(
        `API documentation available at http://localhost:${PORT}/swagger`,
      );
    });
  } catch (error: unknown) {
    console.error('Error during application initialization:', error);
    process.exit(1);
  }
};

initializeApp();
