import { useEffect, useState } from "react";
import './Todos.css'
function Todos() {

  const userJS = localStorage.getItem("user");
  const user = JSON.parse(userJS);
  const MyUserId = user?.id;
  const [todosArray, setTodosArray] = useState([]);
  const [filteredTodos, setFilteredTodos] = useState([]);
  const [todos, setTodos] = useState({
    userId: MyUserId,
    id: "",
    title: "",
    completed: false,
  });
  const [searchId, setSearchId] = useState("");
  const [searchTitle, setSearchTitle] = useState("");
  const [showAddTodos, setShowAddTodos] = useState(false);

  // Fetch todos from API
  useEffect(() => {
    fetch("http://localhost:3001/todos")
      .then((response) => response.json())
      .then((data) => {
        const filtered = data.filter((item) => String(item.userId) === MyUserId);
        setTodosArray(filtered);
        setFilteredTodos(filtered);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, [MyUserId]);

  // Filter todos based on search
  useEffect(() => {
    const result = todosArray.filter((todo) => {
      return (
        (searchId ? todo.id.toString().includes(searchId) : true) &&
        (searchTitle
          ? todo.title.toLowerCase().includes(searchTitle.toLowerCase())
          : true)
      );
    });
    setFilteredTodos(result);
  }, [searchId, searchTitle, todosArray]);

  // Handle sorting and filtering with select input
  const handleSelectChange = (event) => {
    let sortedTodos = [...todosArray];
    switch (event.target.value) {
      case "opt1":
        sortedTodos.sort((a, b) => a.id - b.id);
        break;
      case "opt2":
        sortedTodos.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "opt3":
        sortedTodos.sort((a, b) => a.completed - b.completed);
        break;
      case "opt4":
        sortedTodos = sortedTodos.sort(() => Math.random() - 0.5);
        break;
      case "true":
        setFilteredTodos(todosArray.filter((todo) => todo.completed));
        return;
      case "false":
        setFilteredTodos(todosArray.filter((todo) => !todo.completed));
        return;
      default:
        break;
    }
    setFilteredTodos(sortedTodos);
  };

  // Handle adding a new todo
  const handleAddTodos = () => {
    const newTodosObj = {
      userId: +MyUserId,
      title: todos.title,
      completed: todos.completed,
    };

    fetch("http://localhost:3001/todos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newTodosObj),
    })
      .then((response) => response.json())
      .then((data) => {
        setTodosArray([data, ...todosArray]);
        setFilteredTodos([data, ...filteredTodos]);
        setTodos({ userId: MyUserId, id: "", title: "", completed: false });
      })
      .catch((error) => console.error("Error adding todo:", error));
  };

  return (
    <>
      <h1>Todos</h1>
      <div id="add">
        <button onClick={() => setShowAddTodos(!showAddTodos)}>Add a todo</button>
        {showAddTodos && (
          <div>
            <input
              type="text"
              placeholder="Title"
              value={todos.title}
              onChange={(e) =>
                setTodos((prev) => ({ ...prev, title: e.target.value }))
              }
            />
            <input
              type="checkbox"
              checked={todos.completed}
              onChange={() =>
                setTodos((prev) => ({ ...prev, completed: !prev.completed }))
              }
            />
            <button onClick={handleAddTodos}>Add</button>
          </div>
        )}
      </div>

      <div id="search">
        <input
          type="text"
          placeholder="Search by ID"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
        />
        <input
          type="text"
          placeholder="Search by Title"
          value={searchTitle}
          onChange={(e) => setSearchTitle(e.target.value)}
        />
        <select onChange={handleSelectChange}>
          <option value="opt1">sort</option>
          <option value="opt2">Alphabetic</option>
          <option value="opt3">Completed Or not</option>
          <option value="opt4">random</option>

        </select>
        <select onChange={handleSelectChange}>
          <option value="null">Any</option>
          <option value="true">Completed</option>
          <option value="false">Not Completed</option>
        </select>
      </div>

      <div id="todos">
        <ul>
          {filteredTodos.map((todo) => (
            <LittleTodos
              key={todo.id}
              item={todo}
              todosArray={todosArray}
              setTodosArray={setTodosArray}
            />
          ))}
        </ul>
      </div>
    </>
  );
}

function LittleTodos({ item, todosArray, setTodosArray }) {
  const [showUpdateTodos, setShowUpdateTodos] = useState(false);
  const [title, setTitle] = useState(item.title);
    //checkbox 
  const handleCheckboxChange = (id) => {
    const todo = todosArray.find((t) => t.id === id);
    if (todo) {
      fetch(`http://localhost:3001/todos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...todo, completed: !todo.completed }),
      })
        .then((response) => response.json())
        .then((updatedTodo) => {
          setTodosArray((prev) =>
            prev.map((t) => (t.id === updatedTodo.id ? updatedTodo : t))
          );
        });
    }
  };
    //update
  const handleUpdateTodo = () => {
    fetch(`http://localhost:3001/todos/${item.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...item, title }),
    })
      .then((response) => response.json())
      .then((updated) => {
        setTodosArray((prev) =>
          prev.map((t) => (t.id === updated.id ? updated : t))
        );
        setShowUpdateTodos(false);
      });
  };
    //delete
  const handleDeleteTodo = () => {
    fetch(`http://localhost:3001/todos/${item.id}`, {
      method: "DELETE",
    }).then(() => {
      setTodosArray((prev) => prev.filter((t) => t.id !== item.id));
    });
  };

  return (
    <li>
      <input
        type="checkbox"
        checked={item.completed}
        onChange={() => handleCheckboxChange(item.id)}
      />
      <p>{item.title}</p>
      <div id="actions">
        <button onClick={handleDeleteTodo}>Delete</button>
        <button onClick={() => setShowUpdateTodos(!showUpdateTodos)}>
          Update
        </button>
        {showUpdateTodos && (
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <button onClick={handleUpdateTodo}>Save</button>
          </div>
        )}
      </div>
    </li>
  );
}

export default Todos;
