---
name: kubernetes-deployments
description: >
  This skill should be used when the user asks to "deploy to Kubernetes",
  "write a Deployment manifest", "k8s Service Ingress", "liveness readiness
  probe", "resource limits", or discusses running an application on Kubernetes.
version: 1.0.0
---

## Kubernetes Deployments

### The core trio — Deployment, Service, Ingress

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
  labels: { app: api }
spec:
  replicas: 3
  selector: { matchLabels: { app: api } }
  template:
    metadata: { labels: { app: api } }
    spec:
      containers:
        - name: api
          image: registry.example.com/api:1.4.2   # immutable tag — NEVER :latest
          ports: [{ containerPort: 3000 }]
          envFrom:
            - configMapRef: { name: api-config }
            - secretRef:    { name: api-secrets }
          resources:
            requests: { cpu: 100m, memory: 256Mi } # scheduler placement
            limits:   { memory: 512Mi }            # memory limit yes; CPU limit usually omit
          readinessProbe:                          # gate traffic: deps reachable?
            httpGet: { path: /healthz/ready, port: 3000 }
            periodSeconds: 5
          livenessProbe:                           # restart only if truly wedged
            httpGet: { path: /healthz/live, port: 3000 }
            initialDelaySeconds: 10
---
apiVersion: v1
kind: Service
metadata: { name: api }
spec:
  selector: { app: api }
  ports: [{ port: 80, targetPort: 3000 }]
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api
  annotations: { cert-manager.io/cluster-issuer: letsencrypt }
spec:
  rules:
    - host: api.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend: { service: { name: api, port: { number: 80 } } }
  tls: [{ hosts: [api.example.com], secretName: api-tls }]
```

### Probe discipline

- **Readiness** checks dependencies (DB ping) — fail ⇒ removed from load balancing.
- **Liveness** checks only "is this process wedged" — never check dependencies,
  or a DB blip restart-loops your whole fleet.
- Handle `SIGTERM`: stop accepting, drain in-flight requests, exit — pair with
  `terminationGracePeriodSeconds`.

### Config & secrets

- ConfigMap for non-sensitive config; Secret for credentials (RBAC-restricted,
  sourced from a manager like External Secrets/Vault — never committed as YAML).
- Changing a ConfigMap does **not** restart pods — roll the deployment
  (checksum annotation, or `kubectl rollout restart`).

### Rules of thumb

- Rolling updates are default; `maxUnavailable: 0` for zero-dip deploys.
- `replicas: 3` minimum for anything user-facing + a PodDisruptionBudget.
- HPA scales on CPU/custom metrics — requests must be set or it can't work.
- Kustomize overlays (dev/stage/prod) or Helm for env differences — never
  hand-edited per-env YAML copies.
