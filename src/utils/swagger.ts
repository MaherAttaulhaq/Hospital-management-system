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
        Doctor: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '1' },
            name: { type: 'string', example: 'Dr. John Doe' },
            specialty: { type: 'string', example: 'Cardiology' },
          },
        },
      },
    },
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