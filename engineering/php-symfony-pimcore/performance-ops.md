---
id: performance-ops
category: Performance & ops
level: Expert
skills:
  - name: Profiling
    detail: Blackfire, Xdebug
  - name: Redis caching
    detail: Sessions, cache pools
  - name: Elasticsearch
    detail: Search, product listing
  - name: CI/CD & Docker
    detail: Deploy, containers
---

## Profiling

```bash
# Blackfire — profile a CLI command
blackfire run php bin/console app:import-products

# Blackfire — profile an HTTP request
blackfire curl https://your-pimcore-site.com/products

# Xdebug — enable profiling mode
XDEBUG_MODE=profile php bin/console app:import-products
# Open var/cache/xdebug/*.cachegrind in PHPStorm / KCachegrind
```

Key metrics: peak memory, wall time, I/O wait, SQL query count.
Target: < 50 SQL queries per page, < 32 MB memory per request.

## Redis caching

```yaml
# config/packages/framework.yaml
framework:
  cache:
    default_redis_provider: '%env(REDIS_URL)%'
    pools:
      cache.products:
        adapter: cache.adapter.redis
        default_lifetime: 3600
      cache.pimcore:
        adapter: cache.adapter.redis
        default_lifetime: 600
  session:
    handler_id: '%env(REDIS_URL)%'
```

```bash
# .env
REDIS_URL=redis://localhost:6379
```

## Elasticsearch

```bash
composer require friendsofsymfony/elastica-bundle
php bin/console fos:elastica:create     # create indices
php bin/console fos:elastica:populate   # index all objects
```

```yaml
# config/packages/fos_elastica.yaml
fos_elastica:
  clients:
    default: { host: '%env(ELASTICSEARCH_HOST)%', port: 9200 }
  indexes:
    products:
      persistence:
        driver: orm
        model: App\Entity\Product
        finder: ~
      properties:
        name:  { type: text }
        price: { type: float }
        slug:  { type: keyword }
```

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
      - name: Install skill pack
        run: |
          git clone https://github.com/mahek-credencys/pimcore-development-skills \
            ~/.claude/skills/pimcore-development-skills
          claude skills install php-symfony-pimcore-expert
      - name: Build & push Docker image
        run: |
          docker build -t credencys/pimcore:${{ github.sha }} .
          docker push credencys/pimcore:${{ github.sha }}
      - name: Run migrations
        run: php bin/console doctrine:migrations:migrate --no-interaction
```
