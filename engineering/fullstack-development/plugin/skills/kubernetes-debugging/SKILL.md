---
name: kubernetes-debugging
description: >
  This skill should be used when the user asks about "CrashLoopBackOff",
  "ImagePullBackOff", "pod pending", "OOMKilled", "kubectl debug", "service
  not reachable", or discusses troubleshooting workloads on Kubernetes.
version: 1.0.0
---

## Kubernetes Debugging

### The triage sequence — always in this order

```bash
kubectl get pods -o wide                     # 1. what state is it in?
kubectl describe pod <pod>                   # 2. Events section = the answer 80% of the time
kubectl logs <pod> --previous                # 3. logs of the CRASHED container, not the new one
kubectl get events --sort-by=.lastTimestamp  # 4. cluster-level picture
```

### Decode the status

| Status | Meaning | Usual fix |
|---|---|---|
| `CrashLoopBackOff` | Container exits repeatedly | `logs --previous`; app crash, bad env, missing dep |
| `ImagePullBackOff` | Image fetch fails | Tag typo, private registry → `imagePullSecrets` |
| `Pending` | Unschedulable | `describe` → insufficient CPU/mem, node selectors, PVC unbound |
| `OOMKilled` (exit 137) | Memory limit exceeded | Raise limit or fix the leak; check `kubectl top pod` |
| `CreateContainerConfigError` | Missing ConfigMap/Secret key | `describe` names the missing key |
| Ready `0/1`, Running | Readiness probe failing | Probe endpoint/deps — pod gets no traffic |

### Service not reachable? Walk the chain

```bash
kubectl get endpoints api        # EMPTY endpoints = selector doesn't match pod labels
kubectl port-forward pod/<pod> 3000:3000        # does the app itself respond?
kubectl run tmp --rm -it --image=busybox -- wget -qO- http://api/healthz  # in-cluster DNS/Service
kubectl describe ingress api                    # host/path/backend wiring
```

90% of Service issues are a **label/selector mismatch** or a wrong `targetPort`.

### Live inspection

```bash
kubectl exec -it <pod> -- sh                    # shell in (if image has one)
kubectl debug <pod> -it --image=nicolaka/netshoot --target=api   # distroless: attach tools
kubectl top pods --containers                   # who is eating CPU/memory
kubectl rollout undo deployment/api             # bad deploy? roll back first, debug after
```

### Rules of thumb

- After a bad deploy, `rollout undo` immediately — restore service, then diagnose.
- Deleting a pod is safe (Deployment recreates it) and often clarifies whether
  the problem is the pod or the node.
- Recurring restarts with healthy logs → probe timeouts too aggressive under load.
- `kubectl get pod <pod> -o yaml` shows what's ACTUALLY running — the applied
  manifest may not be what you think (check `lastState`, `restartCount`, env).
