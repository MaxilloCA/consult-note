# Security

This is a local manual consultation note builder. No regulatory or compliance certification is claimed.

## Included controls

- No credentials, external clinical integrations, or persistent note store.
- Loopback-only server with an exact static-resource allowlist.
- Content Security Policy limits scripts, styles, and connections to the same origin; framing and form submission are blocked.
- User text is rendered as text, not HTML.
- No third-party runtime dependencies or remotely loaded assets.

## Limits

There is no authentication, authorization, encryption at rest, clinical audit trail, device management, or backup workflow. The app cannot protect content from browser extensions, local users, endpoint compromise, clipboard consumers, or screenshots. Keep the bundled server on its loopback interface. Clinical use requires an appropriately managed local workstation and your organization’s privacy and recordkeeping procedures; the app itself does not supply those controls.

Review all selected statements and manually edited output before any reuse. Template statements about consent, counseling, examination, and treatment must reflect what actually occurred. The catalog is not a clinical decision engine.

## Reporting

Report suspected security or privacy issues privately to the repository owner. Do not post credentials or identifiable patient information in public issues. There is no dedicated security-response SLA for this snapshot.
