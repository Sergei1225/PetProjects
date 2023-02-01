/// npm init -y создаем package
/// npm i -D typescript загружаем ts
/// ./node_modules/.bin/tsc --init создаем конфиг для ts

type ID = string | number;

interface IToDO {
    userId: ID;
    id: ID;
    title: string;
    completed: boolean;
}
interface IUser {
    id: ID;
    name: string;
}

(function () {
    // Globals
    const todoList = document.getElementById("todo-list");
    const userSelect = document.getElementById("user-todo");
    const form = document.querySelector("form");
    let todos: IToDO[] = [];
    let users: IUser[] = [];

    // Attach Events
    document.addEventListener("DOMContentLoaded", initApp);
    form?.addEventListener("submit", handleSubmit);

    // Basic Logic
    function getUserName(userId: ID) {
        const user = users.find((u) => u.id === userId);
        return user?.name || "";
    }
    function printTodo({ id, userId, title, completed }: IToDO) {
        const li = document.createElement("li");
        li.className = "todo-item";
        if (typeof id === "string") {
            li.dataset.id = id;
        } else {
            li.dataset.id = String(id);
        }
        li.innerHTML = `<span>${title} <i>by</i> <b>${getUserName(userId)}</b></span>`;

        const status = document.createElement("input");
        status.type = "checkbox";
        status.checked = completed;
        status.addEventListener("change", handleTodoChange);

        const close = document.createElement("span");
        close.innerHTML = "&times;";
        close.className = "close";
        close.addEventListener("click", handleClose);

        li.prepend(status);
        li.append(close);

        todoList?.prepend(li);
    }

    function createUserOption(user: IUser) {
        const option = document.createElement("option");
        if (typeof user.id === "string") {
            option.value = user.id;
        } else {
            option.value = String(user.id);
        }

        option.innerText = user.name;

        userSelect ? userSelect.append(option) : null;
    }

    function removeTodo(todoId: ID) {
        todos = todos.filter((todo) => todo.id !== todoId);

        if (todoList) {
            const todo = todoList.querySelector(`[data-id="${todoId}"]`);

            if (todo) {
                todo.querySelector("input")?.removeEventListener("change", handleTodoChange);
                todo.querySelector(".close")?.removeEventListener("click", handleClose);

                todo?.remove();
            }
        }
    }

    function alertError(error: Error) {
        alert(error.message);
    }

    // Event Logic
    function initApp() {
        Promise.all([getAllTodos(), getAllUsers()]).then((values) => {
            [todos, users] = values;

            // Отправить в разметку
            todos.forEach((todo) => printTodo(todo));
            users.forEach((user) => createUserOption(user));
        });
    }
    function handleSubmit(event: Event) {
        event.preventDefault();

        if (form) {
            createTodo({
                userId: Number(form.user.value),
                title: form.todo.value,
                completed: false,
            });
        }
    }
    function handleTodoChange(this: HTMLInputElement) {
        const todoId = this.parentElement?.dataset.id;
        const completed = this.checked;
        if (todoId) {
            toggleTodoComplete(todoId, completed);
        }
    }
    function handleClose(this: HTMLSpanElement) {
        const todoId = this.parentElement?.dataset.id;
        if (todoId) {
            deleteTodo(todoId);
        }
    }

    // Async logic
    async function getAllTodos(): Promise<IToDO[]>  {
        try {
            const response = await fetch("https://jsonplaceholder.typicode.com/todos?_limit=15");
            const data = await response.json();

            return data;
        } catch (error) {
            if (error instanceof Error) {
                alertError(error);
            }
            return []
        }
    }

    async function getAllUsers(): Promise <IUser[]> {
        try {
            const response = await fetch("https://jsonplaceholder.typicode.com/users?_limit=5");
            const data = await response.json();

            return data;
        } catch (error) {
            if (error instanceof Error) {
                alertError(error);
            }
            return []
        }
    }

    async function createTodo(todo: Omit<IToDO, "id">) {
        try {
            const response = await fetch("https://jsonplaceholder.typicode.com/todos", {
                method: "POST",
                body: JSON.stringify(todo),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const newTodo = await response.json();

            printTodo(newTodo);
        } catch (error) {
            if (error instanceof Error) {
                alertError(error);
            }
        }
    }

    async function toggleTodoComplete(todoId: ID, completed: boolean) {
        try {
            const response = await fetch(`https://jsonplaceholder.typicode.com/todos/${todoId}`, {
                method: "PATCH",
                body: JSON.stringify({ completed }),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Failed to connect with the server! Please try later.");
            }
        } catch (error) {
            if (error instanceof Error) {
                alertError(error);
            }
        }
    }

    async function deleteTodo(todoId: ID) {
        try {
            const response = await fetch(`https://jsonplaceholder.typicode.com/todos/${todoId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                removeTodo(todoId);
            } else {
                throw new Error("Failed to connect with the server! Please try later.");
            }
        } catch (error) {
            if (error instanceof Error) {
                alertError(error);
            }
        }
    }
})();
