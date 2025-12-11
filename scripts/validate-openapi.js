const fs = require('fs');
const yaml = require('js-yaml');

try {
  // Read and parse the OpenAPI spec
  const specContent = fs.readFileSync('api/openapi.yaml', 'utf8');
  const spec = yaml.load(specContent);

  console.log('✅ OpenAPI spec is valid YAML');

  // Check required version
  if (spec.info.version === '1.2.0') {
    console.log('✅ Schema version is correctly incremented to 1.2.0');
  } else {
    console.log('❌ Schema version should be 1.2.0, found:', spec.info.version);
  }

  // Check required paths exist
  const requiredPaths = [
    '/api/tasks/suggestions',
    '/api/tasks/combine',
    '/api/tasks/combine/rollback',
    '/api/tasks/bulk-assign',
    '/api/display/summary',
  ];

  let missingPaths = [];
  requiredPaths.forEach((path) => {
    if (!spec.paths[path]) {
      missingPaths.push(path);
    }
  });

  if (missingPaths.length === 0) {
    console.log('✅ All required API paths are present');
  } else {
    console.log('❌ Missing API paths:', missingPaths);
  }

  // Check for feature flags documentation
  if (spec.info.description.includes('feature flag')) {
    console.log('✅ Feature flags are documented in API description');
  } else {
    console.log('❌ Feature flags documentation missing from API description');
  }

  // Check schema_version in Meta
  if (spec.components.schemas.Meta.properties.schema_version.description) {
    console.log('✅ schema_version field is documented');
  } else {
    console.log('❌ schema_version field documentation missing');
  }

  console.log('\n🎉 OpenAPI spec validation complete!');
} catch (error) {
  console.error('❌ Error validating OpenAPI spec:', error.message);
  process.exit(1);
}
