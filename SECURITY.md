# Security Policy

## Supported versions

Bezi currently has no tagged production release. Security fixes are maintained
on the default branch and should be validated by the repository checks before
deployment.

## Reporting a vulnerability

Do not open a public issue for credentials, personal data exposure, or an
exploitable vulnerability. Private vulnerability reporting is not currently
enabled for this repository. Contact the maintainer through the GitHub profile
below without including sensitive details, and request a private channel:

https://github.com/yungtang20

After a private channel is established, include the affected commit, impact,
minimal reproduction, and any suggested mitigation. Remove real API keys and
personal birth data from all evidence.

Ordinary reliability bugs without sensitive details can use the public bug
report form.

## Deployment responsibility

The application treats astrology output as cultural and personal reference,
not medical, legal, or financial advice. Public deployments must configure
HTTPS, allowed origins, authentication or BYOK policy, shared rate limiting for
multiple instances, logging retention, and incident response appropriate to
their environment.
