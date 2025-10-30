# Changelog

All notable changes to the 3 Wise Men project are documented in this file.

## [2.0.0] - 2025-10-30

### Major Modernization Update

This release represents a complete modernization of the legacy codebase to work with modern Node.js (v18+) and current best practices.

### Added

- **package.json**: Created proper dependency management with modern package versions
- **Environment Variables**: Added dotenv support for configuration management
  - `.env.example` file for reference
  - Support for PORT, NODE_ENV, and SESSION_SECRET
- **Error Handling**: Comprehensive error handling throughout the application
  - Error page template
  - Try-catch blocks in route handlers
  - Proper error middleware
- **Security Enhancements**:
  - Session secrets via environment variables
  - Input validation on all POST routes
  - Secure cookies in production mode
  - Input sanitization (trim, lowercase)
- **Documentation**:
  - Comprehensive README.md with installation and usage instructions
  - This CHANGELOG.md file
  - Inline code comments and improvements
- **.gitignore**: Proper exclusions for node_modules, .env, logs, etc.

### Changed

- **Express Framework**: Upgraded from Express 2.x to Express 4.21.2
  - Replaced `express.createServer()` with `express()`
  - Removed deprecated `app.configure()` blocks
  - Updated to use standard Express 4.x patterns
- **Middleware**: Migrated to standalone packages
  - body-parser 1.20.3 (was built-in)
  - cookie-parser 1.4.7 (was built-in)
  - express-session 1.18.1 (was built-in)
- **Template Engine**: Updated Jade references to Pug 3.0.3
  - Set view engine to 'pug'
  - Maintained backward compatibility with .jade files
- **Module System**: Modernized to ES6 patterns
  - Replaced `var` with `const`/`let` where appropriate
  - Updated `require('sys')` to `require('util')`
  - Better module organization with `path` module
- **Route Syntax**: Updated all routes to modern Express 4.x syntax
  - Removed `locals` wrapper (direct object passing to Pug)
  - Added proper HTTP status codes
  - Improved response handling
- **Logging**: Replaced `sys.puts()` with `console.log()`
- **Server Initialization**: Modernized server startup
  - Added startup logging
  - Configurable port via environment
  - Proper server instance handling
  - Module exports for testing

### Fixed

- **Critical Bugs**:
  - Fixed `question.remove` typo → `questions.remove` (app.js:153)
  - Fixed missing route slash in `/open_question/:who` (app.js:162)
  - Fixed `Math.parseInt` → `parseInt` (questions.js:127)
  - Fixed `module.getRandom` → `module.exports.getRandom` (questions.js:121)
- **Logic Issues**:
  - Fixed `questions.remove()` to properly load collection before removing
  - Fixed `questions.getRandom()` to correctly access random items
  - Added proper callback handling for async operations
- **File Path Handling**: Updated to use `path.join()` for cross-platform compatibility
- **Variable Naming**: Fixed shadowing issue in feedback routes (`all` → `allFeedback`)

### Security

- Session secrets now use environment variables instead of hardcoded values
- Added input validation to prevent empty/malformed submissions
- Secure cookie settings for production environment
- Error messages no longer expose internal details

### Performance

- Static file caching with 1-year maxAge in production
- Proper middleware ordering for optimal performance

### Development

- Added npm scripts for development and production modes
- Better error messages and logging
- Cleaner code structure and organization

### Breaking Changes

- **Node.js**: Now requires Node.js >= 18.0.0 (was compatible with ancient versions)
- **Configuration**: Session secret must be set via environment variable in production
- **Port**: Default port remains 10689 but can now be configured via PORT environment variable

### Migration Notes

If upgrading from the legacy version:

1. Install dependencies: `npm install`
2. Create `.env` file from `.env.example`
3. Set SESSION_SECRET to a random string
4. Update any deployment scripts to use new npm scripts
5. Ensure Node.js version is >= 18.0.0

### Dependencies

- express: ^4.21.2
- body-parser: ^1.20.3
- cookie-parser: ^1.4.7
- express-session: ^1.18.1
- pug: ^3.0.3
- dotenv: ^16.4.7

---

## [1.0.0] - Original Release

Initial version of the 3 Wise Men game with Express 2.x and legacy Node.js patterns.
