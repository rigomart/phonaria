# Lab cutover rollback runbook

Rollback procedure for the Cloudflare Lab cutover, required by #205 AC 11 and
executed, if ever needed, during the seven-day window #196 keeps the Vercel
project alive.

Cutover itself is #206. This runbook describes how to undo it.

## Rollback target health

Verified 2026-09-14, before any cutover:

| Check | Result |
| --- | --- |
| `https://phonaria-lab.rigos.dev/` | 200, `server: Vercel`, `x-vercel-cache: HIT` |
| `https://phonaria-lab.vercel.app/` (Vercel alias) | 200 |
| Complete `e2e:lab` contract against `vercel-production` | 33 passed, 6 skipped, 0 failed |

The Vercel deployment is healthy and behaviourally complete. It remains a valid
rollback target.

## DNS state to restore

**Capture this before cutover; it is what rollback puts back.**

The `rigos.dev` zone is on Cloudflare DNS (`naomi.ns.cloudflare.com`,
`renan.ns.cloudflare.com`), so cutover and rollback both happen in the same
zone as the Worker.

| Field | Pre-cutover value |
| --- | --- |
| Name | `phonaria-lab.rigos.dev` |
| Type | `CNAME` |
| Target | `a75aec73d77054af.vercel-dns-017.com.` |
| Proxy | DNS only (unproxied — resolves straight to Vercel IPs) |
| TTL | 300s (Cloudflare auto) |

Re-verify immediately before cutover, since Vercel can reissue the
`*.vercel-dns-*.com` target:

```bash
dig phonaria-lab.rigos.dev CNAME +noall +answer
```

## When to roll back

Any of these, observed on production after cutover:

- Repeatable `exceededCpu` invocation outcomes, or user-visible Cloudflare
  `1102` responses, that the Workers Free allowance cannot absorb and a Paid
  upgrade has not resolved.
- Transcription failing for words that resolve on Vercel — a Turso access or
  credential failure on the Worker.
- The complete contract failing against production where it passes on Vercel.
- Sustained latency well outside the recorded baselines.

Prefer upgrading to Workers Paid over rolling back when the only symptom is CPU
limit exhaustion; #196 calls that an operational signal, not a design failure.

## Procedure

1. **Confirm Vercel is still serving.** The project must not have been deleted.

   ```bash
   curl -sI https://phonaria-lab.vercel.app/ | head -1
   ```

2. **Detach the custom domain from the Worker.** In the Cloudflare dashboard,
   Workers & Pages → `phonaria-lab` → Settings → Domains & Routes, remove
   `phonaria-lab.rigos.dev`. This releases the hostname and removes the
   Cloudflare-managed record.

3. **Restore the Vercel CNAME** in the `rigos.dev` zone using the table above:
   `phonaria-lab` CNAME → `a75aec73d77054af.vercel-dns-017.com.`, **DNS only**,
   TTL auto.

   Leaving the record proxied will route traffic through Cloudflare's edge to
   Vercel, which is not the pre-cutover configuration.

4. **Revert the route configuration in the repository** so a later deploy does
   not silently re-attach the domain. Remove the `routes` entry #206 added to
   the production environment in `apps/lab/wrangler.jsonc`.
   `apps/lab/scripts/assert-no-custom-domain.ts` then passes again and guards
   future production deploys.

5. **Wait out the TTL.** 300s at the record, plus resolver caching.

## Verification

```bash
dig phonaria-lab.rigos.dev CNAME +noall +answer
curl -sI https://phonaria-lab.rigos.dev/ | grep -i '^server'   # expect: Vercel
```

Then run the complete contract against the restored origin:

```bash
gh workflow run lab-qualify.yml --ref main -f target=vercel-production
```

A green run means the rollback is behaviourally complete, not merely resolving.

## Rehearsal status

**Not yet rehearsed end to end.** A true rehearsal requires a cutover to undo,
which has not happened — #206 owns that.

What is verified today is everything the rehearsal depends on: the rollback
target is healthy and passes the full contract, the exact record to restore is
captured above, the zone is under our control on Cloudflare, and the repository
guard that prevents accidental re-cutover exists and is tested.

The remaining step belongs to the cutover ticket: immediately after attaching
the custom domain in #206, detach it and restore the record once, confirm
Vercel serves again, then re-attach. That exercises the full path while the
change is fresh and the window is small.
