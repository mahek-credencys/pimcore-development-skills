---
name: pimcore-studio-backend
description: >
  This skill should be used when the user asks about "Pimcore Studio API",
  "Studio Backend Bundle", "custom Studio endpoint", "AbstractApiController",
  "/pimcore-studio/api", or building custom REST endpoints for Pimcore Studio.
version: 1.0.0
---

## Pimcore Studio Backend

Pimcore Studio is the new React-based Admin UI (replaces the legacy ExtJS Classic Admin UI).
The **Studio Backend Bundle** exposes a REST API consumed by Studio's frontend, and lets you
add custom endpoints that appear in the auto-generated Swagger docs.

### Install

```bash
composer require pimcore/studio-backend-bundle
php bin/console pimcore:bundle:enable PimcoreStudioBackendBundle
php bin/console doctrine:migrations:migrate --no-interaction
```

Swagger UI: `/pimcore-studio/api/docs`
OpenAPI JSON spec: `/pimcore-studio/api/docs.json`

### Custom endpoint

Extend `AbstractApiController`. Controllers are standard Symfony controllers — place them anywhere
and let Symfony's attribute route discovery pick them up:

```php
namespace App\Controller\Api;

use OpenApi\Attributes as OA;
use Pimcore\Bundle\StudioBackendBundle\Controller\AbstractApiController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[OA\Tag('Custom')]
#[Route('/pimcore-studio/api/custom')]
class CustomAssetController extends AbstractApiController
{
    #[OA\Get(
        path: '/pimcore-studio/api/custom/asset/{id}',
        summary: 'Get custom asset metadata',
        tags: ['Custom'],
    )]
    #[OA\Parameter(name: 'id', in: 'path', schema: new OA\Schema(type: 'integer'))]
    #[OA\Response(response: 200, description: 'Asset metadata')]
    #[Route('/asset/{id}', methods: ['GET'])]
    public function getAssetMetadata(int $id): JsonResponse
    {
        // constructor injection works normally — inject any service
        return $this->json(['id' => $id]);
    }
}
```

### Security

Studio endpoints use the standard Symfony firewall and voter system — no Studio-specific
auth layer. Use `denyAccessUnlessGranted()` exactly as in any other Symfony controller:

```php
public function getAssetMetadata(int $id): JsonResponse
{
    $asset = Asset::getById($id);
    $this->denyAccessUnlessGranted('ASSET_VIEW', $asset);
    return $this->json(['id' => $id, 'filename' => $asset->getFilename()]);
}
```
