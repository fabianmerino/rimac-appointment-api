#!/usr/bin/env node

const SwaggerParser = require('@apidevtools/swagger-parser');
const path = require('path');

async function validateAPI() {
  const apiFile = path.join(__dirname, '../docs/api.yaml');

  console.log('🔍 Validating Rimac API specification...');
  console.log(`📄 File: ${apiFile}`);
  console.log('');

  try {
    // Parse and validate the API specification
    const api = await SwaggerParser.validate(apiFile, {
      validate: {
        spec: true,
        schema: true,
        responses: true,
        parameters: true
      }
    });

    console.log('✅ API specification is valid!');
    console.log('');
    console.log('📊 API Details:');
    console.log(`   Title: ${api.info.title}`);
    console.log(`   Version: ${api.info.version}`);
    console.log(`   OpenAPI: ${api.openapi}`);
    console.log('');

    // Count endpoints
    const paths = Object.keys(api.paths || {});
    let totalEndpoints = 0;
    paths.forEach(path => {
      const methods = Object.keys(api.paths[path]);
      totalEndpoints += methods.length;
    });

    console.log('🎯 Endpoints:');
    console.log(`   Paths: ${paths.length}`);
    console.log(`   Total endpoints: ${totalEndpoints}`);

    paths.forEach(path => {
      const methods = Object.keys(api.paths[path]);
      methods.forEach(method => {
        const endpoint = api.paths[path][method];
        console.log(`   ${method.toUpperCase()} ${path} - ${endpoint.summary || 'No summary'}`);
      });
    });

    console.log('');

    // Count schemas
    const schemas = Object.keys(api.components?.schemas || {});
    console.log('📦 Schemas:');
    console.log(`   Total schemas: ${schemas.length}`);
    schemas.forEach(schema => {
      console.log(`   - ${schema}`);
    });

    console.log('');
    console.log('🎉 Validation completed successfully!');

  } catch (error) {
    console.error('❌ API specification validation failed:');
    console.error('');

    if (error.details) {
      error.details.forEach((detail, index) => {
        console.error(`${index + 1}. ${detail.message}`);
        if (detail.path) {
          console.error(`   Path: ${detail.path.join(' → ')}`);
        }
        console.error('');
      });
    } else {
      console.error(error.message);
    }

    process.exit(1);
  }
}

// Handle CLI execution
if (require.main === module) {
  validateAPI().catch(error => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });
}

module.exports = { validateAPI };
