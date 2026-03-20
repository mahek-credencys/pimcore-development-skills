---
name: testing-cs-fixer
description: >
  This skill should be used when the user asks about "PHP CS Fixer",
  "code style", "PSR-12", "php-cs-fixer fix", ".php-cs-fixer.dist.php",
  or discusses PHP linting, code formatting, or Symfony coding standards.
version: 1.0.0
---

## CS Fixer

```bash
vendor/bin/php-cs-fixer fix src --rules=@Symfony,@PSR12 --diff
```

```php
// .php-cs-fixer.dist.php
return (new Config())
    ->setRules([
        '@Symfony'     => true,
        '@PSR12'       => true,
        'strict_param' => true,
        'array_syntax' => ['syntax' => 'short'],
    ])
    ->setFinder(
        Finder::create()->in(['src', 'tests'])
    );
```
