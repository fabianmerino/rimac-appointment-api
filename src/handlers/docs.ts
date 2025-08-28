import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import path from 'path';
import fs from 'fs';
import mime from 'mime-types';

// Robustly find the 'docs' directory whether running locally or in Lambda
const findDocsPath = (): string => {
  let currentPath = __dirname;
  // Search up to 5 levels up for the 'docs' directory
  for (let i = 0; i < 5; i++) {
    const potentialPath = path.join(currentPath, 'docs');
    if (fs.existsSync(potentialPath)) {
      return potentialPath;
    }
    currentPath = path.join(currentPath, '..');
  }
  // Fallback for environments where the above might fail
  return path.join(process.cwd(), 'docs');
};

const UI_PATH = findDocsPath();

function getFile(filePath: string): { content: string; contentType: string } | null {
  const resolvedPath = path.resolve(UI_PATH, filePath);

  // Security check: Ensure the resolved path is still within the UI_PATH directory
  if (!resolvedPath.startsWith(UI_PATH)) {
    return null;
  }

  if (fs.existsSync(resolvedPath)) {
    const content = fs.readFileSync(resolvedPath, 'utf-8');
    const contentType = mime.lookup(resolvedPath) || 'application/octet-stream';
    return { content, contentType };
  }
  return null;
}

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  console.log('Request for API documentation');

  try {
    const requestPath = event.rawPath.startsWith('/docs')
      ? event.rawPath.substring('/docs'.length)
      : event.rawPath;

    let filePath = requestPath === '/' || requestPath === '' ? 'index.html' : requestPath.substring(1);

    // If the path is for api.yaml, serve it from the correct location
    if (filePath === 'api.yaml') {
      filePath = 'api.yaml';
    }

    const file = getFile(filePath);

    if (file) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': file.contentType },
        body: file.content,
      };
    }

    // Fallback to index.html for SPA-like behavior within /docs
    const indexFile = getFile('index.html');
    if (indexFile) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': indexFile.contentType },
        body: indexFile.content,
      };
    }

    return {
      statusCode: 404,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Not Found',
    };
  } catch (error) {
    console.error('Error serving documentation:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Internal Server Error',
    };
  }
};
