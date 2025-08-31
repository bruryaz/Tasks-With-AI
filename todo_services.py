# todo_services.py
tasks = []
next_id = 1 

def get_tasks():
    return tasks

def add_task(task):
    global next_id
    task.id = next_id
    next_id += 1
    tasks.append(task)
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
