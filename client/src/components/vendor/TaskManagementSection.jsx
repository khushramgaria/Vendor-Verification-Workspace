import React, { useState } from "react";
import { CheckSquare, Square, Plus, Calendar, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import Button from "../common/Button";
import Input from "../common/Input";
import Modal from "../common/Modal";
import apiClient, { API_ENDPOINTS } from "../../utils/api";

const priorityStyles = {
  LOW: {
    bg: "bg-blue-50 text-blue-700 border-blue-200",
    label: "Low Priority",
  },
  MEDIUM: {
    bg: "bg-amber-50 text-amber-700 border-amber-200",
    label: "Medium Priority",
  },
  HIGH: {
    bg: "bg-rose-50 text-rose-700 border-rose-200",
    label: "High Priority",
  },
};

const TaskManagementSection = ({ vendorId, tasks = [], onTasksUpdated }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [togglingTaskId, setTogglingTaskId] = useState(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [dueDate, setDueDate] = useState("");

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!title || !dueDate) {
      toast.error("Please fill in task title and due date");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post(API_ENDPOINTS.VERIFICATION.CREATE_TASK, {
        vendorId,
        title,
        description,
        priority,
        dueDate,
      });

      toast.success("Action task created successfully");
      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
      setDueDate("");
      setIsModalOpen(false);

      if (onTasksUpdated) onTasksUpdated();
    } catch (error) {
      console.error("Error creating task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleTaskStatus = async (taskId, currentStatus) => {
    const newStatus = currentStatus === "COMPLETED" ? "PENDING" : "COMPLETED";
    setTogglingTaskId(taskId);

    try {
      await apiClient.patch(
        API_ENDPOINTS.VERIFICATION.UPDATE_TASK_STATUS(taskId),
        { status: newStatus }
      );

      toast.success(
        `Task marked as ${newStatus === "COMPLETED" ? "Completed" : "Pending"}`
      );
      if (onTasksUpdated) onTasksUpdated();
    } catch (error) {
      console.error("Error updating task status:", error);
    } finally {
      setTogglingTaskId(null);
    }
  };

  const pendingCount = tasks.filter((t) => t.status === "PENDING").length;
  const completedCount = tasks.filter((t) => t.status === "COMPLETED").length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-2xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <CheckSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Vendor Action Tasks & Follow-ups
            </h3>
            <p className="text-xs text-slate-500">
              Assign compliance tasks, set deadline priorities, and track completion progress
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-500 font-semibold hidden md:block">
            <span>{pendingCount} Pending</span> •{" "}
            <span className="text-emerald-600">{completedCount} Completed</span>
          </div>
          <Button
            size="sm"
            variant="primary"
            onClick={() => setIsModalOpen(true)}
            icon={Plus}
          >
            Create Task
          </Button>
        </div>
      </div>

      {/* Task List */}
      {tasks.length === 0 ? (
        <div className="text-center py-8 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-slate-500 space-y-1">
          <CheckSquare className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs font-bold text-slate-700">No action tasks assigned yet</p>
          <p className="text-[11px] text-slate-500">
            Click "Create Task" to assign compliance follow-ups or document requests.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {tasks.map((task) => {
            const isCompleted = task.status === "COMPLETED";
            const priorityConfig =
              priorityStyles[task.priority] || priorityStyles.MEDIUM;

            return (
              <div
                key={task.id}
                className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 transition-all ${
                  isCompleted
                    ? "bg-slate-50/70 border-slate-200 opacity-75"
                    : "bg-white border-slate-200 hover:border-slate-300 shadow-2xs"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox Toggle */}
                  <button
                    type="button"
                    disabled={togglingTaskId === task.id}
                    onClick={() =>
                      handleToggleTaskStatus(task.id, task.status)
                    }
                    className="mt-0.5 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    {isCompleted ? (
                      <CheckSquare className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-400 hover:text-slate-600" />
                    )}
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4
                        className={`text-xs font-bold ${
                          isCompleted
                            ? "line-through text-slate-400"
                            : "text-slate-900"
                        }`}
                      >
                        {task.title}
                      </h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${priorityConfig.bg}`}
                      >
                        {priorityConfig.label}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-xs text-slate-500 font-medium">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        Due:{" "}
                        {task.dueDate
                          ? new Date(task.dueDate).toLocaleDateString()
                          : "No date"}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  {isCompleted ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      Completed
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                      Pending
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Task Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Action Task"
        subtitle="Assign a vendor follow-up or compliance requirement task"
        icon={Plus}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <Input
            label="Task Title"
            placeholder="e.g. Verify renewed Tax Certificate"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Task Description
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Request updated GST certificate for Q4 compliance"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-900 placeholder-slate-400 text-sm font-semibold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 text-slate-900 text-sm font-semibold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 cursor-pointer"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>

            <Input
              label="Due Date"
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Create Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TaskManagementSection;
