// Dev-only: throws during render so the route's errorElement (ServerErrorPage)
// can be verified live. Reachable at /dev/throw inside the protected app.
export default function DevThrowPage(): never {
  throw new Error('Intentional render error — verifying ServerErrorPage.')
}
