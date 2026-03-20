---
name: php-opcache
description: >
  This skill should be used when the user asks about "OPcache configuration",
  "preloading", "opcache settings", "php.ini performance", or discusses PHP
  bytecode cache, memory consumption, or validate_timestamps.
version: 1.0.0
---

## OPcache config

```ini
; php.ini — production settings
opcache.enable=1
opcache.memory_consumption=256
opcache.max_accelerated_files=20000
opcache.preload=/var/www/config/preload.php
opcache.preload_user=www-data
opcache.validate_timestamps=0
opcache.revalidate_freq=0
opcache.interned_strings_buffer=16
```
