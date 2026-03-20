---
name: symfony-custom-bundles
description: >
  This skill should be used when the user asks to "create a bundle",
  "extend Pimcore with a bundle", "use AbstractBundle", "write bundle
  configuration", or discusses DependencyInjection extension classes.
version: 1.0.0
---

## Custom bundles

```
src/
  CredencysProductBundle/
    CredencysProductBundle.php
    DependencyInjection/
      Configuration.php
      CredencysProductExtension.php
    EventListener/
      ProductSaveListener.php
    Resources/config/services.yaml
```

```php
class CredencysProductBundle extends AbstractBundle {
    public function configure(DefinitionConfigurator $def): void {
        $def->rootNode()->children()
            ->booleanNode('auto_publish')->defaultFalse()->end()
            ->integerNode('cache_ttl')->defaultValue(3600)->end()
        ->end();
    }
}
```
