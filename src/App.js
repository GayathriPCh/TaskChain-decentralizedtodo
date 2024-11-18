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
  const [isNavExpanded, setIsNavExpanded] = useState(false);
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
  const features = [
    {
      title: "Decentralized Storage",
      description: "Your tasks are stored on the blockchain, ensuring complete data ownership"
    },
    {
      title: "Smart Categorization",
      description: "Organize tasks with custom categories and tags"
    },
    {
      title: "Priority Management",
      description: "Set task priorities and due dates for better organization"
    }
  ];

  const steps = [
    "Connect your MetaMask wallet",
    "Create your first task",
    "Organize with categories and tags",
    "Track your progress"
  ];
  return (
    <div className="app-container">
      {!isConnected ? (
        // Landing Page
        <>
          <nav className={`vertical-nav ${isNavExpanded ? 'expanded' : ''}`}>
            <button 
              className="nav-toggle"
              onClick={() => setIsNavExpanded(!isNavExpanded)}
            >
              ☰
            </button>
            <div className="nav-content">
              <a href="#home">Home</a>
              <a href="#features">Features</a>
              <a href="#how-it-works">How It Works</a>
              <a href="#get-started">Get Started</a>
            </div>
          </nav>
  
          <main className="landing-page">
            <section id="home" className="hero-section">
              <h1 className="hero-title">TASKCHAIN</h1>
              <p className="hero-subtitle">Your Tasks, Your Chain, Your Control</p>
              <button onClick={connectWallet} className="cta-button">
                Connect Wallet to Get Started
              </button>
            </section>
  
            <section id="features" className="features-section">
              <h2>Why TaskChain?</h2>
              <div className="features-grid">
                <div className="feature-card">
                  <h3>Decentralized Storage</h3>
                  <p>Your tasks are stored on the blockchain, ensuring complete data ownership</p>
                </div>
                <div className="feature-card">
                  <h3>Smart Categorization</h3>
                  <p>Organize tasks with custom categories and tags</p>
                </div>
                <div className="feature-card">
                  <h3>Priority Management</h3>
                  <p>Set task priorities and due dates for better organization</p>
                </div>
              </div>
            </section>
  
            <section id="how-it-works" className="steps-section">
              <h2>How It Works</h2>
              <div className="steps-container">
                <div className="step-card">
                  <div className="step-number">1</div>
                  <p>Connect your MetaMask wallet</p>
                </div>
                <div className="step-card">
                  <div className="step-number">2</div>
                  <p>Create your first task</p>
                </div>
                <div className="step-card">
                  <div className="step-number">3</div>
                  <p>Organize with categories and tags</p>
                </div>
                <div className="step-card">
                  <div className="step-number">4</div>
                  <p>Track your progress</p>
                </div>
              </div>
            </section>
          </main>
        </>
      ) : (
        // Todo List Application
        <div className="todo-app">
          <nav className={`vertical-nav ${isNavExpanded ? 'expanded' : ''}`}>
            <button 
              className="nav-toggle"
              onClick={() => setIsNavExpanded(!isNavExpanded)}
            >
              ☰
            </button>
            <div className="nav-content">
              <div className="nav-section">
                <h3>Getting Started</h3>
                <p>1. Add a new task using the input field</p>
                <p>2. Set category and priority</p>
                <p>3. Add tags for better organization</p>
              </div>
              <div className="nav-section">
                <h3>Features</h3>
                <p>• Color code your tasks</p>
                <p>• Filter by categories</p>
                <p>• Track completion status</p>
              </div>
            </div>
          </nav>
  
          <div className="main-content">
            <header className="app-header">
              <h1 className="app-title">Decentralized Todo List</h1>
              <div className="profile">
                <p className="wallet-info">
                  Connected: {walletAddress.substring(0, 6)}...{walletAddress.slice(-4)}
                </p>
                <p className="task-stats">Tasks: {tasks.length}</p>
              </div>
            </header>
  
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
          </div>
        </div>
      )}
    </div>
  );
}

export default App;