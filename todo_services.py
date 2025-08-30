# todo_services.py
tasks = []

def get_tasks():
    return tasks

def add_task(task):
    print("Adding task:", task)
    tasks.append(task)
    print("Current tasks after add_task:", tasks)
    return task

def update_task(task):
    for i, t in enumerate(tasks):
        if t.id == task.id:
            tasks[i] = task
            return task
    return None

def delete_task(task_id):
    for i, t in enumerate(tasks):
        if t.id == task_id:
            del tasks[i]
            return True
    return False
