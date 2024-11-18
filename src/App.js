import React, { useState, useEffect } from "react";
import { BrowserProvider, Contract } from "ethers";
import TaskList from "./components/TaskList";
import "./App.css";
import TodoListABI from "./contracts/TodoListABI.json";

const contractAddress = "0xc52F167c6FB4A38b3a557Fa02c7422A283EDa6ce";

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [category, setCategory] = useState("Work");
  const [tags, setTags] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("Low");
  const [contract, setContract] = useState(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (isConnected && contract) {
      loadTasks();
    }
  }, [isConnected, contract]);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const browserProvider = new BrowserProvider(window.ethereum);
        const signer = await browserProvider.getSigner();
        const address = await signer.getAddress();
        setWalletAddress(address);

        const contract = new Contract(contractAddress, TodoListABI, signer);
        setContract(contract);
        setIsConnected(true);
      } catch (error) {
        console.error("Error connecting wallet:", error);
        alert("Failed to connect wallet. Please try again.");
      }
    } else {
      alert("MetaMask is not installed. Please install it to use this DApp.");
    }
  };

  const loadTasks = async () => {
    try {
      const tasks = await contract.getTasks();
      const formattedTasks = tasks.map(task => ({
        id: Number(task.id),
        content: task.content,
        completed: Boolean(Number(task.completed)),
        category: task.category,
        tags: task.tags || [],
        dueDate: Number(task.dueDate),
        priority: Number(task.priority),
        color: task.color || '#ffffff'
      }));
      setTasks(formattedTasks);
    } catch (error) {
      console.error("Error loading tasks:", error);
      setTasks([]); // Set to empty array in case of error
    }
  };

  const addTask = async () => {
    try {
      const tagArray = tags.split(",").map(tag => tag.trim());
      const dueDateUnix = new Date(dueDate).getTime() / 1000;
      const taskPriority = priority === "Low" ? 0 : priority === "Medium" ? 1 : 2;

      await contract.createTask(newTask, category, tagArray, dueDateUnix, taskPriority);
      await loadTasks();
      setNewTask("");
      setTags("");
      setDueDate("");
      setPriority("Low");
    } catch (error) {
      console.error("Error adding task:", error);
      alert("Failed to add task. Please try again.");
    }
  };

  const toggleTask = async (id) => {
    try {
      await contract.toggleTask(id);
      await loadTasks();
    } catch (error) {
      console.error("Error toggling task:", error);
      alert("Failed to toggle task. Please try again.");
    }
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  const handlePriorityChange = (e) => {
    setPriority(e.target.value);
  };

  const filterTasks = (tasks, filterCategory) => {
    return tasks.filter((task) =>
      filterCategory === "All" ? true : task.category === filterCategory
    );
  };

  const onChangeColor = (taskId, newColor) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, color: newColor } : task
    );
    setTasks(updatedTasks);
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1 className="app-title">Decentralized Todo List</h1>
        {!isConnected ? (
          <button onClick={connectWallet} className="connect-button">
            Connect Wallet
          </button>
        ) : (
          <div className="profile">
            <p className="wallet-info">
              Connected: {walletAddress.substring(0, 6)}...{walletAddress.slice(-4)}
            </p>
            <p className="task-stats">Tasks: {tasks.length}</p>
          </div>
        )}
      </header>
      {isConnected && (
        <div className="content">
          <div className="task-input">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Enter a new task..."
              className="task-input-field"
            />
            <select
              value={category}
              onChange={handleCategoryChange}
              className="category-select"
            >
              <option value="Work">Work</option>
              <option value="Personal">Personal</option>
              <option value="Urgent">Urgent</option>
            </select>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Enter tags (comma-separated)"
              className="task-input-field"
            />
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="task-input-field"
            />
            <select
              value={priority}
              onChange={handlePriorityChange}
              className="category-select"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
            <button onClick={addTask} className="add-task-button">
              Add Task
            </button>
          </div>
          <div className="task-filters">
            <button onClick={() => setCategory("All")} className="filter-button">
              All
            </button>
            <button onClick={() => setCategory("Work")} className="filter-button">
              Work
            </button>
            <button onClick={() => setCategory("Personal")} className="filter-button">
              Personal
            </button>
            <button onClick={() => setCategory("Urgent")} className="filter-button">
              Urgent
            </button>
          </div>
          <TaskList tasks={filterTasks(tasks, category)} onToggleTask={toggleTask} onChangeColor={onChangeColor} />
        </div>
      )}
    </div>
  );
}

export default App;