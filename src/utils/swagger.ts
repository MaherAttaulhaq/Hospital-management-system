import swaggerJsdoc from 'swagger-jsdoc';
import { join } from 'node:path';

// Build swagger spec manually to avoid next-swagger-doc matching directories
// whose names end with .json (for example `src/app/api/swagger.json` which
// is a valid Next app-route folder). The package's glob patterns can match
// that folder and cause EISDIR when swagger-jsdoc tries to read it as a file.
export const getApiDocs = async () => {
  const apiFolder = 'src/app/api'; // Path to API routes
  const schemaFolders: string[] = [];
  const scanFolders = [apiFolder, ...schemaFolders];

  const apis = scanFolders.flatMap((folder) => {
    const buildApiDirectory = join(process.cwd(), '.next/server', folder);
    const apiDirectory = join(process.cwd(), folder);
    const publicDirectory = join(process.cwd(), 'public');

    // Exclude 'json' from apiDirectory scanning because folders in the app
    // router may include a segment like `swagger.json` (a directory), which
    // would be matched by `**/*.json` and then attempted to be read as a file.
    const fileTypesForApiDir = ['ts', 'tsx', 'jsx', 'js', 'swagger.yaml'];

    return [
      ...fileTypesForApiDir.map((fileType) => `${apiDirectory}/**/*.${fileType}`),
      // Only scan build directory for *.swagger.yaml, *.js and *.json files
      ...['js', 'swagger.yaml', 'json'].map(
        (fileType) => `${buildApiDirectory}/**/*.${fileType}`
      ),
      // Support load static files from public directory
      ...['swagger.yaml', 'json'].map((fileType) => `${publicDirectory}/**/*.${fileType}`),
    ];
  });

  const definition = {
    openapi: '3.0.0',
    info: {
      title: 'HMS API Documentation',
      version: '1.0.0',
      description: 'Documentation for Hospital Management System API',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        Patient: {
          type: "object",
          properties: {
            id: { type: "integer" },
            userId: { type: "integer" },
            dob: { type: "string" },
            gender: { type: "string" },
            medicalHistory: { type: "string" },
          },
        },
        Appointment: {
          type: "object",
          properties: {
            id: { type: "integer" },
            date: { type: "string" },
            patientId: { type: "integer" },
            doctorId: { type: "integer" },
            status: { type: "string" },
          },
        },
        Billing: {
          type: "object",
          properties: {
            id: { type: "integer" },
            patientId: { type: "integer" },
            appointmentId: { type: "integer" },
            amount: { type: "integer" },
            status: { type: "string" },
            paymentMethod: { type: "string" },
          },
        },
        Prescription: {
          type: "object",
          properties: {
            id: { type: "integer" },
            patientId: { type: "integer" },
            doctorId: { type: "integer" },
            appointmentId: { type: "integer" },
            medicineList: { type: "string" },
            notes: { type: "string" },
          },
        },
        Pharmacy: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            quantity: { type: "integer" },
            price: { type: "number" },
            expiryDate: { type: "string" },
          },
        },
        Register: {
          type: "object",
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", format: "password" },
            name: { type: "string" },
          },
        },
        Doctor: {
          type: "object",
          properties: {
            userId: { type: "integer" },
            specialization: { type: "string" },
            fees: { type: "integer" },
            availability: { type: "string" },
          },
        },
      },
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  } as const;

  // Allow NEXT_ROUTER_BASEPATH to inject servers entry similar to next-swagger-doc
  // Merge definition and optionally add servers from NEXT_ROUTER_BASEPATH
  let mergedDefinition: any = { ...definition };
  if (process.env.__NEXT_ROUTER_BASEPATH && !definition.servers) {
    mergedDefinition.servers = [
      {
        url: process.env.__NEXT_ROUTER_BASEPATH,
        description: 'next-js',
      },
    ];
  }

  const options = {
    apis,
    definition: mergedDefinition,
  } as const;

  const spec = swaggerJsdoc(options as any);
  return spec;
};