import React, { useState } from 'react';

const Task = ({ task, onToggleTask, onChangeColor }) => {
  const [taskColor, setTaskColor] = useState(task.color || '#ffffff');

  const handleColorChange = (e) => {
    const newColor = e.target.value;
    setTaskColor(newColor);
    onChangeColor(task.id, newColor);
  };

  // Convert BigInt to regular number for comparison
  const isCompleted = Boolean(Number(task.completed));

  return (
    <div className={`task ${isCompleted ? 'completed' : ''}`} style={{ backgroundColor: taskColor }}>
      <div className="task-info">
        <input
          type="checkbox"
          checked={isCompleted}
          onChange={() => onToggleTask(Number(task.id))}
        />
        <span className="task-title">{task.content}</span>
        <span className="category">{task.category}</span>
      </div>
      <div className="task-details">
        <div className="task-tags">
          {task.tags.map((tag, index) => (
            <span key={index} className="tag">{tag}</span>
          ))}
        </div>
        <div className="task-due-date">
          Due: {new Date(Number(task.dueDate) * 1000).toLocaleString()}
        </div>
        <div className="task-priority">
          Priority: {['Low', 'Medium', 'High'][Number(task.priority)]}
        </div>
      </div>
      <div className="task-controls">
        <input
          type="color"
          value={taskColor}
          onChange={handleColorChange}
          className="color-picker"
        />
      </div>
    </div>
  );
};

const TaskList = ({ tasks, onToggleTask, onChangeColor }) => (
  <div className="task-list">
    {tasks.map((task) => (
      <Task key={Number(task.id)} task={task} onToggleTask={onToggleTask} onChangeColor={onChangeColor} />
    ))}
  </div>
);

export default TaskList;