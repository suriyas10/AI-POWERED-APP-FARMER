let tasks = [
  { id: 1, title: 'Complete math assignment', completed: false, priority: 'high' },
  { id: 2, title: 'Read chapter 5 of biology', completed: false, priority: 'medium' },
  { id: 3, title: 'Prepare notes for tomorrow', completed: true, priority: 'low' },
]

export async function PUT(request, { params }) {
  try {
    const body = await request.json()
    const id = Number(params.id)
    let found = false

    tasks = tasks.map((task) => {
      if (task.id === id) {
        found = true
        return { ...task, ...body, id }
      }
      return task
    })

    if (!found) {
      return Response.json({ error: 'Task not found' }, { status: 404 })
    }

    return Response.json({ message: 'Task updated', tasks })
  } catch (err) {
    return Response.json({ error: 'Failed to update task' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const id = Number(params.id)
    const before = tasks.length
    tasks = tasks.filter((task) => task.id !== id)

    if (tasks.length === before) {
      return Response.json({ error: 'Task not found' }, { status: 404 })
    }

    return Response.json({ message: 'Task deleted', tasks })
  } catch (err) {
    return Response.json({ error: 'Failed to delete task' }, { status: 500 })
  }
}
