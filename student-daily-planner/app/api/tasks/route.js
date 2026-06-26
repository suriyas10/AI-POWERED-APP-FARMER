let tasks = [
  { id: 1, title: 'Complete math assignment', completed: false, priority: 'high' },
  { id: 2, title: 'Read chapter 5 of biology', completed: false, priority: 'medium' },
  { id: 3, title: 'Prepare notes for tomorrow', completed: true, priority: 'low' },
]

export async function GET() {
  return Response.json({ tasks })
}

export async function POST(request) {
  try {
    const body = await request.json()

    if (!body.title || body.title.trim().length === 0) {
      return Response.json({ error: 'Title is required' }, { status: 400 })
    }

    const newTask = {
      id: Date.now(),
      title: body.title.trim(),
      completed: false,
      priority: body.priority || 'medium',
    }

    tasks.push(newTask)
    return Response.json({ message: 'Task created', task: newTask }, { status: 201 })
  } catch (err) {
    return Response.json({ error: 'Failed to create task' }, { status: 500 })
  }
}
