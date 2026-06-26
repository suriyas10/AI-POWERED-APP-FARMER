export async function POST(request) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email || !email.includes('@')) {
      return Response.json({ error: 'Valid email required' }, { status: 400 })
    }

    const user = {
      id: Date.now(),
      email: email.trim().toLowerCase(),
      name: email.split('@')[0],
    }

    return Response.json({ message: 'Login successful', user })
  } catch (err) {
    return Response.json({ error: 'Login failed' }, { status: 500 })
  }
}
