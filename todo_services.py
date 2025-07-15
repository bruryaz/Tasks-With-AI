tasks = []

def get_tasks():
    return tasks

def add_task(task):
    tasks.append(task)

def update_task(task):
    for i, t in enumerate(tasks):
        if t.id == task.id:
            tasks[i] = task

def delete_task(task_id):
    for i, t in enumerate(tasks):
        if t.id == task_id:
            del tasks[i]
            return True
    return False
