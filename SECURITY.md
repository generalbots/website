# Security Policy — General Bots

General Bots serves government and enterprise deployments. We take reports seriously and publish authoritative advisories at <https://generalbots.org/security/>.

## Supported versions

Security fixes are provided for the latest stable release and the preceding minor release. Older versions should be upgraded before a fix is expected.

| Version | Supported |
| --- | --- |
| Latest stable | Yes |
| Previous minor | Yes |
| Older | No |

## Reporting a vulnerability

**Do not open a public GitHub issue for a security problem.**

Send a private report to **security@pragmatismo.com.br**. Include:

- affected product and version,
- steps to reproduce,
- impact and, if known, a CVE or dependency identifier,
- whether you have already shared it with anyone else.

If the issue is sensitive, ask for the current PGP fingerprint in your first email. An encrypted channel will be arranged before you send technical details.

### What to expect

- Acknowledgment within **3 business days**.
- Triage and an initial assessment within **10 business days**.
- Coordinated disclosure with a **90-day embargo**, extendable by agreement when a fix needs more time.
- Public credit in the advisory and hall of fame if you want to be named.

### No bug bounty

**There is no bug bounty program. Reward budget: 0.** Reports are rewarded with recognition only. We will never promise payment for a finding.

## Scope

In scope: General Bots server, Suite UI, desktop edition, installers and shipped bot scripts.

Out of scope: third-party services we do not operate, reports about already-public vulnerabilities with no new information, and issues requiring physical access to a customer-managed site.

## Privacy

Reporting data is handled under the site privacy policy and LGPD: we collect only a working contact method, do not log IPs or analytics on the reporting channel, and delete rejected or duplicate reports on a defined schedule.

## Canonical references

- Security contact: <https://generalbots.org/.well-known/security.txt>
- Bulletin: <https://generalbots.org/security/>
- CSAF provider metadata: <https://generalbots.org/.well-known/csaf/provider-metadata.json>
- Advisory index: <https://generalbots.org/security/advisories.json>
