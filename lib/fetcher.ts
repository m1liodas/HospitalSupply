export async function fetchJson<T = any>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    cache: 'no-store',
    ...init,
  })

  if (!response.ok) {
    const text = await response.text()
    const errorMessage = text || response.statusText || 'Request failed'
    throw new Error(errorMessage)
  }

  return response.json()
}
