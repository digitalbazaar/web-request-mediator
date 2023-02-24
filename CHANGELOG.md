# web-request-mediator ChangeLog

## 2.0.5 - 2023-02-24

### Fixed
- Fix error handling typo.

## 2.0.4 - 2023-02-24

### Fixed
- Handle storage errors in third party contexts on any browser that
  requires a first party dialog to access storage.

## 2.0.3 - 2023-02-21

### Fixed
- Remove superfluous logging.

## 2.0.2 - 2023-02-21

### Fixed
- Handle storage errors in third party contexts in brave when checking
  permissions.

## 2.0.1 - 2023-02-15

### Fixed
- Fix `remove()` bug when cookie driver is used to store hints. The
  cookie options must be passed to `remove()` and were not previously.

## 2.0.0 - 2022-06-13

### Changed
- **BREAKING**: Use `web-request-rpc@2`.
- **BREAKING**: Allow passing relying origin as a promise.
- **BREAKING**: Allow permissions to be set in 1p windows and return
  results to 3p controlling iframes that indicate that this storage
  occurred.

## 1.2.1 - 2021-05-19

### Fixed
- Ensure entries stored via `cookieDriver` are set to `secure`.

## 1.2.0 - 2021-05-16

### Added
- Expose `WebRequestHandlersService_setRegistration` to enable mediators to
  set registrations for any origin from within the mediator itself.

## 1.1.4 - 2019-03-11

### Fixed
- Only check for cookie existence on Safari.

## 1.1.3 - 2019-03-11

### Fixed
- Only check for cookie presence when storage access API is present.

## 1.1.2 - 2019-01-22

### Fixed
- Ensure to check for cookie presence when checking for storage
  access in Safari.

## 1.1.1 - 2019-01-22

### Fixed
- Ensure an error is set when storage access is denied.

## 1.1.0 - 2019-01-21

### Added
- Add `hasStorageAccess` and `requestStorageAccess` wrapper functions.

## 1.0.2 - 2018-09-27

### Changed
- Update dependencies.

## 1.0.1 - 2018-07-20

### Changed
- Update dependencies.

## 1.0.0 - 2018-07-13

### Added
- Add storage driver that uses cookies. This allows
  the Storage Access API to be used to enable polyfills
  to work in Safari and other webkit-based browsers.

## 0.1.2 - 2017-09-01

### Fixed
- Include `.js` extension on imports.

## 0.1.1 - 2017-08-30

### Fixed
- Fix `SimpleContainerService` `delete` bug.

## 0.1.0 - 2017-08-18

## 0.0.5 - 2017-08-15

### Added
- Added `SimpleContainerService`.

## 0.0.4 - 2017-08-14

### Added
- Added generic `WebRequestHandlersService`.

## 0.0.3 - 2017-08-10

### Changed
- Update dependencies.

## 0.0.2 - 2017-08-10

## 0.0.1 - 2017-08-10

### Added
- Add core files.

- See git history for changes previous to this release.
