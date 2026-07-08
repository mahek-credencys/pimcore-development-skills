---
name: php-security-hardening
description: >
  This skill should be used when the user asks about "PHP security",
  "SQL injection PHP", "XSS prevention", "password_hash", "CSRF token",
  "file upload security", or discusses hardening PHP applications.
version: 1.0.0
---

## PHP Security Hardening

### SQL injection — prepared statements, always

```php
// BAD — injectable
$pdo->query("SELECT * FROM users WHERE email = '$email'");

// GOOD — parameterized
$stmt = $pdo->prepare('SELECT * FROM users WHERE email = :email');
$stmt->execute(['email' => $email]);
```

Identifiers (table/column names) can't be bound — allowlist them explicitly.

### XSS — escape on output, per context

```php
// HTML context
echo htmlspecialchars($userInput, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
```

In Twig/Blade templates auto-escaping is on — never mark user data `|raw`.
Set `Content-Security-Policy` headers as the second layer.

### Passwords & sessions

```php
$hash = password_hash($password, PASSWORD_ARGON2ID);   // never md5/sha1
if (password_verify($password, $hash)) {
    session_regenerate_id(true);                       // prevent session fixation
}
```

Cookies: `session.cookie_httponly=1`, `cookie_secure=1`, `cookie_samesite=Lax`.

### File uploads

- Validate MIME by content (`finfo_file`), never trust the client filename/type.
- Store outside the webroot with a generated name; serve via a controller.
- Reject double extensions (`shell.php.jpg`) and block execution in upload dirs.

### Everyday rules

- CSRF tokens on every state-changing form (framework CSRF middleware, or
  `random_bytes(32)` + `hash_equals` comparison).
- `declare(strict_types=1);` + validated DTOs at the boundary — type juggling
  (`'0e123' == '0'`) has caused real auth bypasses; always use `===`.
- Never `unserialize()` user input — use JSON.
- `display_errors=Off` in production; log instead.
- `composer audit` in CI; keep PHP on a supported line (8.3+ as of 2026).
