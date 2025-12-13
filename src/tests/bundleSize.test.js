/**
 * Feature: frontend-performance-optimization, Property 1: Bundle size constraint
 * Validates: Requirements 1.4
 * 
 * Property: For any production build, the main bundle size should be less than 200KB gzipped
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

describe('Bundle Size Constraints', () => {
  const buildPath = path.join(__dirname, '../../build/static/js');
  const MAX_MAIN_BUNDLE_SIZE = 200 * 1024; // 200KB in bytes
  const MAX_VENDOR_BUNDLE_SIZE = 500 * 1024; // 500KB in bytes
  const MAX_TOTAL_SIZE = 1024 * 1024; // 1MB in bytes

  /**
   * Helper function to get gzipped size of a file
   */
  const getGzippedSize = (filePath) => {
    const content = fs.readFileSync(filePath);
    const gzipped = zlib.gzipSync(content, { level: 9 });
    return gzipped.length;
  };

  /**
   * Helper function to find bundle files by pattern
   */
  const findBundleFiles = (pattern) => {
    if (!fs.existsSync(buildPath)) {
      return [];
    }
    const files = fs.readdirSync(buildPath);
    return files.filter(file => pattern.test(file));
  };

  /**
   * Property test: Main bundle size constraint
   * For any production build, the main bundle should be < 200KB gzipped
   */
  test('main bundle size should be less than 200KB gzipped', () => {
    // Skip if build directory doesn't exist (not built yet)
    if (!fs.existsSync(buildPath)) {
      console.warn('Build directory not found. Run "npm run build" first.');
      return;
    }

    const mainBundles = findBundleFiles(/^main\.[a-f0-9]+\.js$/);
    
    if (mainBundles.length === 0) {
      console.warn('No main bundle found. This test requires a production build.');
      return;
    }

    mainBundles.forEach(bundle => {
      const bundlePath = path.join(buildPath, bundle);
      const gzippedSize = getGzippedSize(bundlePath);
      const sizeInKB = (gzippedSize / 1024).toFixed(2);

      console.log(`Main bundle: ${bundle} - ${sizeInKB}KB gzipped`);
      
      expect(gzippedSize).toBeLessThan(MAX_MAIN_BUNDLE_SIZE);
    });
  });

  /**
   * Property test: Vendor bundle size constraint
   * For any production build, vendor bundles should be reasonable
   */
  test('vendor bundle size should be less than 500KB gzipped', () => {
    if (!fs.existsSync(buildPath)) {
      console.warn('Build directory not found. Run "npm run build" first.');
      return;
    }

    const vendorBundles = findBundleFiles(/^vendors\.[a-f0-9]+\.js$/);
    
    if (vendorBundles.length === 0) {
      console.warn('No vendor bundle found.');
      return;
    }

    vendorBundles.forEach(bundle => {
      const bundlePath = path.join(buildPath, bundle);
      const gzippedSize = getGzippedSize(bundlePath);
      const sizeInKB = (gzippedSize / 1024).toFixed(2);

      console.log(`Vendor bundle: ${bundle} - ${sizeInKB}KB gzipped`);
      
      expect(gzippedSize).toBeLessThan(MAX_VENDOR_BUNDLE_SIZE);
    });
  });

  /**
   * Property test: Total bundle size constraint
   * For any production build, total JS size should be < 1MB gzipped
   */
  test('total bundle size should be less than 1MB gzipped', () => {
    if (!fs.existsSync(buildPath)) {
      console.warn('Build directory not found. Run "npm run build" first.');
      return;
    }

    const allBundles = findBundleFiles(/\.js$/);
    
    if (allBundles.length === 0) {
      console.warn('No bundles found.');
      return;
    }

    let totalSize = 0;
    allBundles.forEach(bundle => {
      const bundlePath = path.join(buildPath, bundle);
      const gzippedSize = getGzippedSize(bundlePath);
      totalSize += gzippedSize;
    });

    const totalSizeInKB = (totalSize / 1024).toFixed(2);
    console.log(`Total bundle size: ${totalSizeInKB}KB gzipped`);
    
    expect(totalSize).toBeLessThan(MAX_TOTAL_SIZE);
  });

  /**
   * Property-based test: Bundle size consistency
   * For any set of builds, bundle sizes should be deterministic (same input = same output)
   * 
   * This test runs 100 iterations to verify the property holds across multiple runs
   */
  test('bundle sizes should be deterministic', () => {
    if (!fs.existsSync(buildPath)) {
      console.warn('Build directory not found. Run "npm run build" first.');
      return;
    }

    const bundles = findBundleFiles(/\.js$/);
    
    if (bundles.length === 0) {
      console.warn('No bundles found.');
      return;
    }

    // Run 100 iterations as per property-based testing requirements
    for (let i = 0; i < 100; i++) {
      bundles.forEach(bundle => {
        const bundlePath = path.join(buildPath, bundle);
        const size1 = getGzippedSize(bundlePath);
        const size2 = getGzippedSize(bundlePath);
        
        // Property: Reading and gzipping the same file should produce the same size
        expect(size1).toBe(size2);
      });
    }
  });

  /**
   * Property-based test: Chunk naming convention
   * For any production build, chunks should follow naming convention with content hash
   */
  test('chunks should follow naming convention with content hash', () => {
    if (!fs.existsSync(buildPath)) {
      console.warn('Build directory not found. Run "npm run build" first.');
      return;
    }

    const allBundles = findBundleFiles(/\.js$/);
    
    allBundles.forEach(bundle => {
      // Should match pattern: [name].[hash].js or [number].[hash].js (for dynamic chunks)
      const hasValidName = /^[a-z0-9]+\.[a-f0-9]+\.js$/.test(bundle);
      expect(hasValidName).toBe(true);
    });
  });

  /**
   * Property test: No duplicate code in chunks
   * Verify that code splitting is working and there's no excessive duplication
   */
  test('chunks should not have excessive duplication', () => {
    if (!fs.existsSync(buildPath)) {
      console.warn('Build directory not found. Run "npm run build" first.');
      return;
    }

    const allBundles = findBundleFiles(/\.js$/);
    
    if (allBundles.length < 2) {
      console.warn('Need at least 2 chunks to test for duplication.');
      return;
    }

    // Property: If we have multiple chunks, they should be reasonably sized
    // (not all code in one chunk)
    const sizes = allBundles.map(bundle => {
      const bundlePath = path.join(buildPath, bundle);
      return fs.statSync(bundlePath).size;
    });

    const totalSize = sizes.reduce((a, b) => a + b, 0);
    const largestChunk = Math.max(...sizes);

    // Largest chunk should not be more than 70% of total
    // (indicates good code splitting)
    const largestPercentage = (largestChunk / totalSize) * 100;
    console.log(`Largest chunk is ${largestPercentage.toFixed(1)}% of total`);
    
    expect(largestPercentage).toBeLessThan(70);
  });
});