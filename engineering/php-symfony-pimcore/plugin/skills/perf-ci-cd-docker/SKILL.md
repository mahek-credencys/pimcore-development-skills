---
name: perf-ci-cd-docker
description: >
  This skill should be used when the user asks about "Docker", "Dockerfile",
  "CI/CD pipeline", "GitHub Actions deploy", "composer install production",
  or discusses containerising a Pimcore/Symfony application.
version: 1.0.0
---

## CI/CD & Docker

```dockerfile
# Dockerfile
FROM php:8.3-fpm-alpine
RUN docker-php-ext-install opcache pdo_mysql
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
WORKDIR /var/www
COPY . .
RUN composer install --no-dev --optimize-autoloader
```

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      # Note: "Install skill pack" step from source file intentionally excluded —
      # it references a superseded installation method (direct skills clone).
      - name: Build & push Docker image
        run: |
          docker build -t credencys/pimcore:${{ github.sha }} .
          docker push credencys/pimcore:${{ github.sha }}
      - name: Run migrations
        run: php bin/console doctrine:migrations:migrate --no-interaction
```
