---
name: symfony-security-voters
description: >
  This skill should be used when the user asks about "Symfony voters",
  "access control", "isGranted", "Voter class", "firewalls", or discusses
  Symfony security, authorization, or role-based access control.
version: 1.0.0
---

## Security — Voters

```php
class ProductVoter extends Voter {
    const EDIT   = 'PRODUCT_EDIT';
    const DELETE = 'PRODUCT_DELETE';

    protected function supports(string $attr, mixed $subject): bool {
        return in_array($attr, [self::EDIT, self::DELETE])
            && $subject instanceof Product;
    }

    protected function voteOnAttribute(
        string $attr, mixed $subject, TokenInterface $token
    ): bool {
        $user = $token->getUser();
        if (!$user instanceof User) return false;

        return match($attr) {
            self::EDIT   => $user->hasRole('ROLE_EDITOR'),
            self::DELETE => $user->hasRole('ROLE_ADMIN'),
            default      => false,
        };
    }
}
```
