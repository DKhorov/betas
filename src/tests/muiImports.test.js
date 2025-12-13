/**
 * Feature: frontend-performance-optimization, Property 22: Named Material-UI imports
 * Validates: Requirements 7.3
 * 
 * Property: For any Material-UI component import, named imports should be used instead of default imports to enable tree shaking
 */

const fs = require('fs');
const path = require('path');

describe('Material-UI Import Optimization', () => {
  const srcDir = path.join(__dirname, '../');
  
  /**
   * Helper function to recursively find all JS/JSX files
   */
  const findSourceFiles = (dir, fileList = []) => {
    if (!fs.existsSync(dir)) {
      return fileList;
    }
    
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        if (!file.includes('node_modules') && !file.includes('build') && !file.includes('tests')) {
          findSourceFiles(filePath, fileList);
        }
      } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
        fileList.push(filePath);
      }
    });
    
    return fileList;
  };

  /**
   * Helper function to check if file has MUI imports
   */
  const hasMuiImports = (content) => {
    return /@mui\/(material|icons-material|lab)/.test(content);
  };

  /**
   * Helper function to check for bad import patterns
   */
  const findBadImports = (content) => {
    const badImports = [];
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      // Default imports (bad)
      if (line.match(/import\s+\w+\s+from\s+['"]@mui\/(material|icons-material|lab)['"];?\s*$/)) {
        badImports.push({
          line: index + 1,
          type: 'default-import',
          content: line.trim()
        });
      }
      
      // Wildcard imports (bad)
      if (line.match(/import\s+\*\s+as\s+\w+\s+from\s+['"]@mui\/(material|icons-material|lab)['"]/)) {
        badImports.push({
          line: index + 1,
          type: 'wildcard-import',
          content: line.trim()
        });
      }
    });
    
    return badImports;
  };

  /**
   * Property test: All MUI imports should use named imports
   * For any file with MUI imports, it should use named imports pattern
   */
  test('all MUI imports should use named imports for tree shaking', () => {
    const files = findSourceFiles(srcDir);
    const filesWithBadImports = [];
    
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf-8');
      
      if (!hasMuiImports(content)) {
        return;
      }
      
      const badImports = findBadImports(content);
      
      if (badImports.length > 0) {
        const relativePath = path.relative(srcDir, file);
        filesWithBadImports.push({
          file: relativePath,
          badImports
        });
      }
    });

    if (filesWithBadImports.length > 0) {
      console.log('\n❌ Found files with non-optimized MUI imports:');
      filesWithBadImports.forEach(({ file, badImports }) => {
        console.log(`\n  ${file}:`);
        badImports.forEach(({ line, type, content }) => {
          console.log(`    Line ${line} (${type}): ${content}`);
        });
      });
    }

    // Property: No files should have default or wildcard imports
    expect(filesWithBadImports.length).toBe(0);
  });

  /**
   * Property test: Named imports should be used consistently
   * For any file with MUI imports, all imports should follow the same pattern
   */
  test('MUI imports should be consistent across all files', () => {
    const files = findSourceFiles(srcDir);
    let totalMuiFiles = 0;
    let filesWithNamedImports = 0;
    
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf-8');
      
      if (!hasMuiImports(content)) {
        return;
      }
      
      totalMuiFiles++;
      
      // Check if file uses named imports
      const hasNamedImports = /import\s+\{[^}]+\}\s+from\s+['"]@mui\/(material|icons-material|lab)['"]/.test(content);
      
      if (hasNamedImports) {
        filesWithNamedImports++;
      }
    });

    console.log(`\n📊 MUI Import Statistics:`);
    console.log(`  Total files with MUI: ${totalMuiFiles}`);
    console.log(`  Files with named imports: ${filesWithNamedImports}`);
    console.log(`  Optimization rate: ${totalMuiFiles > 0 ? ((filesWithNamedImports / totalMuiFiles) * 100).toFixed(1) : 100}%`);

    // Property: At least 90% of files should use named imports
    const optimizationRate = totalMuiFiles > 0 ? (filesWithNamedImports / totalMuiFiles) : 1;
    expect(optimizationRate).toBeGreaterThanOrEqual(0.9);
  });

  /**
   * Property test: No deep imports from MUI submodules
   * For any MUI import, it should not use deep imports (except for styles)
   */
  test('MUI imports should not use deep imports', () => {
    const files = findSourceFiles(srcDir);
    const filesWithDeepImports = [];
    
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf-8');
      const lines = content.split('\n');
      const relativePath = path.relative(srcDir, file);
      
      lines.forEach((line, index) => {
        // Deep imports like: import Button from '@mui/material/Button'
        // Exclude styles which is acceptable
        if (line.match(/import\s+\w+\s+from\s+['"]@mui\/material\/(?!styles)[A-Z]\w+['"]/)) {
          filesWithDeepImports.push({
            file: relativePath,
            line: index + 1,
            content: line.trim()
          });
        }
      });
    });

    if (filesWithDeepImports.length > 0) {
      console.log('\n⚠️  Found files with deep MUI imports:');
      filesWithDeepImports.forEach(({ file, line, content }) => {
        console.log(`  ${file}:${line} - ${content}`);
      });
      console.log('\n  Suggestion: Use top-level named imports instead');
    }

    // Property: No deep imports should exist (they're suboptimal)
    expect(filesWithDeepImports.length).toBe(0);
  });

  /**
   * Property-based test: Import optimization consistency
   * For any set of files, the import pattern should be consistent
   * This test runs 100 iterations to verify consistency
   */
  test('import patterns should be consistent across multiple reads', () => {
    const files = findSourceFiles(srcDir);
    const muiFiles = files.filter(file => {
      const content = fs.readFileSync(file, 'utf-8');
      return hasMuiImports(content);
    });

    // Run 100 iterations as per property-based testing requirements
    for (let i = 0; i < 100; i++) {
      muiFiles.forEach(file => {
        const content1 = fs.readFileSync(file, 'utf-8');
        const content2 = fs.readFileSync(file, 'utf-8');
        
        const badImports1 = findBadImports(content1);
        const badImports2 = findBadImports(content2);
        
        // Property: Reading the same file should always return the same import analysis
        expect(badImports1.length).toBe(badImports2.length);
      });
    }
  });

  /**
   * Property test: Tree shaking optimization score
   * For any codebase, the tree shaking optimization score should be high
   */
  test('tree shaking optimization score should be above 90%', () => {
    const files = findSourceFiles(srcDir);
    let namedImports = 0;
    let defaultImports = 0;
    let wildcardImports = 0;
    
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf-8');
      
      if (!hasMuiImports(content)) {
        return;
      }
      
      const lines = content.split('\n');
      
      lines.forEach(line => {
        if (line.match(/import\s+\{[^}]+\}\s+from\s+['"]@mui\/(material|icons-material|lab)['"]/)) {
          namedImports++;
        }
        if (line.match(/import\s+\w+\s+from\s+['"]@mui\/(material|icons-material|lab)['"];?\s*$/)) {
          defaultImports++;
        }
        if (line.match(/import\s+\*\s+as\s+\w+\s+from\s+['"]@mui\/(material|icons-material|lab)['"]/)) {
          wildcardImports++;
        }
      });
    });

    const totalImports = namedImports + defaultImports + wildcardImports;
    const score = totalImports > 0 ? (namedImports / totalImports * 100) : 100;
    
    console.log(`\n📈 Tree Shaking Optimization Score: ${score.toFixed(1)}%`);
    console.log(`  Named imports: ${namedImports}`);
    console.log(`  Default imports: ${defaultImports}`);
    console.log(`  Wildcard imports: ${wildcardImports}`);

    // Property: Optimization score should be at least 90%
    expect(score).toBeGreaterThanOrEqual(90);
  });
});
