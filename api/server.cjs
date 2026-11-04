
import('./src/server.js').catch((error) => {
  console.error('Failed to start Nursery API:', error);
  process.exit(1);
});
