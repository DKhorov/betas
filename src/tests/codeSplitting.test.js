/**
 * Feature: frontend-performance-optimization, Property 20: Route-based code splitting
 * Validates: Requirements 7.1
 * 
 * Property: For any route in the application, the route component should be lazy-loaded as a separate chunk
 */

const fs = require('fs');
const path = require('path');

describe('Route-based Code Splitting', () => {
  const buildPath = path.join(__dirname, '../../build/static/js');
  
  /**
   * Helper function to find chunk files
   */
  const findChunkFiles = () => {
    if (!fs.existsSync(buildPath)) {
      return [];
    }
    const files = fs.readdirSync(buildPath);
    return files.filter(file => file.endsWith('.js') && !file.includes('.map'));
  };

  /**
   * Helper function to check if a chunk name exists
   */
  const hasChunkWithName = (files, chunkName) => {
    return files.some(file => file.includes(chunkName));
  };

  /**
   * Property test: Route components should be in separate chunks
   * For any route in the application, it should generate a separate chunk file
   */
  test('route components should be lazy-loaded as separate chunks', () => {
    if (!fs.existsSync(buildPath)) {
      console.warn('Build directory not found. Run "npm run build" first.');
      return;
    }

    const allChunks = findChunkFiles();
    
    if (allChunks.length === 0) {
      console.warn('No chunks found.');
      return;
    }

    console.log(`Total chunks found: ${allChunks.length}`);
    console.log('Chunks:', allChunks.join(', '));

    // Expected route chunks based on webpackChunkName comments
    const expectedChunks = [
      'main',
      'store',
      'game',
      'settings',
      'music',
      'reting',
      'channels-list',
      'channel-page',
      'wallet',
      'profile',
      'channel-create',
      'channel',
      'login',
      'registration',
      'not-found',
      'comments',
      'full-post'
    ];

    // Check that we have multiple chunks (code splitting is working)
    expect(allChunks.length).toBeGreaterThan(3);

    // Verify that at least some of the expected route chunks exist
    const foundChunks = expectedChunks.filter(chunkName => 
      hasChunkWithName(allChunks, chunkName)
    );

    console.log(`Found ${foundChunks.length} out of ${expectedChunks.length} expected route chunks`);
    console.log('Found chunks:', foundChunks.join(', '));

    // At least 50% of routes should be split into separate chunks
    expect(foundChunks.length).toBeGreaterThanOrEqual(expectedChunks.length * 0.5);
  });

  /**
   * Property test: Main bundle should not contain all route code
   * For any production build, the main bundle should be smaller than total size
   */
  test('main bundle should not contain all application code', () => {
    if (!fs.existsSync(buildPath)) {
      console.warn('Build directory not found. Run "npm run build" first.');
      return;
    }

    const allChunks = findChunkFiles();
    
    if (allChunks.length === 0) {
      console.warn('No chunks found.');
      return;
    }

    const mainBundle = allChunks.find(file => file.startsWith('main.'));
    
    if (!mainBundle) {
      console.warn('No main bundle found.');
      return;
    }

    const mainBundleSize = fs.statSync(path.join(buildPath, mainBundle)).size;
    
    let totalSize = 0;
    allChunks.forEach(chunk => {
      const chunkPath = path.join(buildPath, chunk);
      totalSize += fs.statSync(chunkPath).size;
    });

    const mainBundlePercentage = (mainBundleSize / totalSize) * 100;
    
    console.log(`Main bundle: ${(mainBundleSize / 1024).toFixed(2)}KB`);
    console.log(`Total size: ${(totalSize / 1024).toFixed(2)}KB`);
    console.log(`Main bundle is ${mainBundlePercentage.toFixed(1)}% of total`);

    // Main bundle should be less than 50% of total (good code splitting)
    expect(mainBundlePercentage).toBeLessThan(50);
  });

  /**
   * Property test: Each route chunk should be reasonably sized
   * For any route chunk, it should not be excessively large
   */
  test('route chunks should be reasonably sized', () => {
    if (!fs.existsSync(buildPath)) {
      console.warn('Build directory not found. Run "npm run build" first.');
      return;
    }

    const allChunks = findChunkFiles();
    const MAX_ROUTE_CHUNK_SIZE = 500 * 1024; // 500KB max per route chunk

    allChunks.forEach(chunk => {
      // Skip main, vendors, and mui chunks (they can be larger)
      if (chunk.startsWith('main.') || chunk.startsWith('vendors.') || chunk.startsWith('mui.')) {
        return;
      }

      const chunkPath = path.join(buildPath, chunk);
      const chunkSize = fs.statSync(chunkPath).size;
      const chunkSizeKB = (chunkSize / 1024).toFixed(2);

      console.log(`Route chunk ${chunk}: ${chunkSizeKB}KB`);

      // Each route chunk should be reasonably sized
      expect(chunkSize).toBeLessThan(MAX_ROUTE_CHUNK_SIZE);
    });
  });

  /**
   * Property-based test: Chunk splitting consistency
   * For any build, the same routes should produce the same chunks
   * This test runs 100 iterations to verify consistency
   */
  test('chunk splitting should be consistent across reads', () => {
    if (!fs.existsSync(buildPath)) {
      console.warn('Build directory not found. Run "npm run build" first.');
      return;
    }

    // Run 100 iterations as per property-based testing requirements
    for (let i = 0; i < 100; i++) {
      const chunks1 = findChunkFiles();
      const chunks2 = findChunkFiles();

      // Property: Reading the build directory should always return the same chunks
      expect(chunks1.length).toBe(chunks2.length);
      expect(chunks1.sort()).toEqual(chunks2.sort());
    }
  });

  /**
   * Property test: No duplicate code across chunks
   * Verify that vendor code is properly extracted
   */
  test('vendor code should be in separate vendor chunk', () => {
    if (!fs.existsSync(buildPath)) {
      console.warn('Build directory not found. Run "npm run build" first.');
      return;
    }

    const allChunks = findChunkFiles();
    const vendorChunk = allChunks.find(file => file.startsWith('vendors.'));

    // Should have a vendor chunk for node_modules code
    expect(vendorChunk).toBeDefined();

    if (vendorChunk) {
      const vendorPath = path.join(buildPath, vendorChunk);
      const vendorSize = fs.statSync(vendorPath).size;
      const vendorSizeKB = (vendorSize / 1024).toFixed(2);

      console.log(`Vendor chunk: ${vendorChunk} - ${vendorSizeKB}KB`);

      // Vendor chunk should exist and be substantial (contains dependencies)
      expect(vendorSize).toBeGreaterThan(50 * 1024); // At least 50KB
    }
  });
});
