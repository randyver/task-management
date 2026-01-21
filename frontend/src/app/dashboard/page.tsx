"use client";

import { useState, useEffect, useCallback } from "react";
import { Task, TaskStatus, UserSimple } from "@/types";
import { getTasks, getUsers, deleteTask, updateTaskStatus } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Pencil,
  Trash2,
  Calendar,
  User,
  Loader2,
  AlertCircle,
  GripVertical,
  Eye,
} from "lucide-react";
import { formatDate, isOverdue, isToday } from "@/lib/utils";
import TaskFormDialog from "@/components/tasks/TaskFormDialog";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
  { id: "todo", title: "To Do", color: "bg-slate-500" },
  { id: "in_progress", title: "In Progress", color: "bg-blue-500" },
  { id: "done", title: "Done", color: "bg-green-500" },
];

// Draggable Task Card Component
function TaskCard({
  task,
  onView,
  onEdit,
  onDelete,
  isDragging = false,
}: {
  task: Task;
  onView: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  isDragging?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isCurrentlyDragging = isDragging || isSortableDragging;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg border shadow-sm transition-all h-[140px] flex flex-col ${
        isCurrentlyDragging
          ? "opacity-50 shadow-lg ring-2 ring-primary"
          : "hover:shadow-md"
      } ${task.status === "done" ? "opacity-75" : ""}`}
    >
      <div className="p-3 flex flex-col flex-1">
        {/* Drag Handle & Title */}
        <div className="flex items-start gap-2">
          <button
            {...attributes}
            {...listeners}
            className="mt-0.5 p-1 rounded hover:bg-slate-100 cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 shrink-0"
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <h3
            className={`flex-1 font-medium text-sm line-clamp-2 ${
              task.status === "done" ? "line-through text-muted-foreground" : ""
            }`}
          >
            {task.title}
          </h3>
        </div>

        {/* Meta Info */}
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground pl-7 mt-2 flex-1">
          {task.deadline && (
            <div
              className={`flex items-center gap-1 ${
                isOverdue(task.deadline) && task.status !== "done"
                  ? "text-red-600 font-medium"
                  : isToday(task.deadline)
                  ? "text-orange-600 font-medium"
                  : ""
              }`}
            >
              <Calendar className="h-3 w-3" />
              <span>{formatDate(task.deadline)}</span>
            </div>
          )}
          {task.assignee && (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span className="truncate max-w-[100px]">{task.assignee.full_name}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-1 pl-7 mt-auto pt-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => onView(task)}
          >
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => onEdit(task)}
          >
            <Pencil className="h-3 w-3 mr-1" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => onDelete(task)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Static Task Card for Drag Overlay
function TaskCardOverlay({ task }: { task: Task }) {
  return (
    <div className="bg-white rounded-lg border shadow-xl ring-2 ring-primary w-[280px]">
      <div className="p-3 space-y-2">
        <div className="flex items-start gap-2">
          <div className="mt-0.5 p-1 text-slate-400">
            <GripVertical className="h-4 w-4" />
          </div>
          <h3 className="flex-1 font-medium text-sm line-clamp-2">
            {task.title}
          </h3>
        </div>
        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 pl-7">
            {task.description}
          </p>
        )}
      </div>
    </div>
  );
}

// Kanban Column Component
function KanbanColumn({
  column,
  tasks,
  onView,
  onEdit,
  onDelete,
  onAddTask,
}: {
  column: { id: TaskStatus; title: string; color: string };
  tasks: Task[];
  onView: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onAddTask: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div
      className={`flex flex-col bg-slate-100 rounded-xl min-w-[300px] max-w-[350px] flex-1 transition-colors ${
        isOver ? "bg-slate-200 ring-2 ring-primary ring-opacity-50" : ""
      }`}
    >
      {/* Column Header */}
      <div className="p-3 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${column.color}`}></div>
            <h2 className="font-semibold text-sm">{column.title}</h2>
            <span className="text-xs text-muted-foreground bg-white px-2 py-0.5 rounded-full">
              {tasks.length}
            </span>
          </div>
        </div>
      </div>

      {/* Column Content */}
      <div
        ref={setNodeRef}
        className="flex-1 p-2 space-y-2 overflow-y-auto"
      >
        <SortableContext
          items={tasks.map((t) => t.id.toString())}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-muted-foreground">No tasks</p>
            <p className="text-xs text-muted-foreground">
              Drag tasks here or create new
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<UserSimple[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Form dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // View dialog state
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [taskToView, setTaskToView] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const [tasksResponse, usersResponse] = await Promise.all([
        getTasks({ page_size: 100 }),
        getUsers(),
      ]);
      setTasks(tasksResponse.tasks);
      setUsers(usersResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id.toString() === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeTaskId = parseInt(active.id as string);
    const activeTask = tasks.find((t) => t.id === activeTaskId);

    if (!activeTask) return;

    // Determine target column
    let targetStatus: TaskStatus | null = null;

    // Check if dropped on a column
    if (COLUMNS.some((col) => col.id === over.id)) {
      targetStatus = over.id as TaskStatus;
    } else {
      // Dropped on another task - find its status
      const overTask = tasks.find((t) => t.id.toString() === over.id);
      if (overTask) {
        targetStatus = overTask.status;
      }
    }

    // Update status if changed
    if (targetStatus && activeTask.status !== targetStatus) {
      try {
        // Optimistically update UI
        setTasks((prev) =>
          prev.map((t) =>
            t.id === activeTaskId ? { ...t, status: targetStatus! } : t
          )
        );

        await updateTaskStatus(activeTaskId, targetStatus);
      } catch (err) {
        // Revert on error
        setTasks((prev) =>
          prev.map((t) =>
            t.id === activeTaskId ? { ...t, status: activeTask.status } : t
          )
        );
        setError(err instanceof Error ? err.message : "Failed to update status");
      }
    }
  };

  const handleView = (task: Task) => {
    setTaskToView(task);
    setViewDialogOpen(true);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormOpen(true);
  };

  const handleDelete = (task: Task) => {
    setTaskToDelete(task);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!taskToDelete) return;

    setIsDeleting(true);
    try {
      await deleteTask(taskToDelete.id);
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFormSuccess = () => {
    setFormOpen(false);
    setEditingTask(null);
    loadData();
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingTask(null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manage Your Tasks</h1>
          <p className="text-muted-foreground">
            Drag and drop tasks to change status
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {tasks.length} task{tasks.length !== 1 ? "s" : ""} total
          </span>
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-2 p-4 text-red-600 bg-red-50 border border-red-200 rounded-lg mb-4">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto"
            onClick={() => setError("")}
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Main Content Area */}
      {!isLoading && (
        <div className="flex gap-4 flex-1 overflow-hidden">
          {/* Kanban Board */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-4 overflow-x-auto p-2 flex-1">
              {COLUMNS.map((column) => (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  tasks={getTasksByStatus(column.id)}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onAddTask={() => setFormOpen(true)}
                />
              ))}
            </div>

            <DragOverlay>
              {activeTask && <TaskCardOverlay task={activeTask} />}
            </DragOverlay>
          </DndContext>

          {/* Sidebar - Progress & Assignees */}
          <div className="w-[280px] shrink-0 bg-white rounded-xl border p-4 space-y-6 overflow-y-auto">
            {/* Progress Section */}
            <div>
              <h3 className="font-semibold text-sm mb-3">Task Progress</h3>
              <div className="space-y-3">
                {/* Overall Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Completed</span>
                    <span className="font-medium">
                      {tasks.length > 0
                        ? Math.round((getTasksByStatus("done").length / tasks.length) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all duration-300"
                      style={{
                        width: `${tasks.length > 0
                          ? (getTasksByStatus("done").length / tasks.length) * 100
                          : 0}%`
                      }}
                    />
                  </div>
                </div>

                {/* Status Breakdown */}
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <div className="text-center p-2 bg-slate-50 rounded-lg">
                    <p className="text-lg font-bold text-slate-600">{getTasksByStatus("todo").length}</p>
                    <p className="text-xs text-muted-foreground">To Do</p>
                  </div>
                  <div className="text-center p-2 bg-blue-50 rounded-lg">
                    <p className="text-lg font-bold text-blue-600">{getTasksByStatus("in_progress").length}</p>
                    <p className="text-xs text-muted-foreground">In Progress</p>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded-lg">
                    <p className="text-lg font-bold text-green-600">{getTasksByStatus("done").length}</p>
                    <p className="text-xs text-muted-foreground">Done</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Assignees Section */}
            <div>
              <h3 className="font-semibold text-sm mb-3">Team Members</h3>
              <div className="space-y-2">
                {users.map((user) => {
                  const userTasks = tasks.filter((t) => t.assignee_id === user.id);
                  const completedTasks = userTasks.filter((t) => t.status === "done").length;
                  const progress = userTasks.length > 0
                    ? Math.round((completedTasks / userTasks.length) * 100)
                    : 0;

                  return (
                    <div key={user.id} className="p-2 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-medium">
                          {user.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{user.full_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {userTasks.length} task{userTasks.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">
                          {progress}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  );
                })}

                {/* Unassigned Tasks */}
                {(() => {
                  const unassignedTasks = tasks.filter((t) => !t.assignee_id);
                  if (unassignedTasks.length === 0) return null;

                  const completedTasks = unassignedTasks.filter((t) => t.status === "done").length;
                  const progress = Math.round((completedTasks / unassignedTasks.length) * 100);

                  return (
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-7 h-7 rounded-full bg-slate-300 flex items-center justify-center text-slate-600 text-xs font-medium">
                          ?
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">Unassigned</p>
                          <p className="text-xs text-muted-foreground">
                            {unassignedTasks.length} task{unassignedTasks.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">
                          {progress}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-slate-400 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Form Dialog */}
      <TaskFormDialog
        open={formOpen}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        task={editingTask}
        users={users}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{taskToDelete?.title}&quot;? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Task Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Task Details
            </DialogTitle>
          </DialogHeader>
          {taskToView && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Title</h3>
                <p className="text-base font-medium mt-1">{taskToView.title}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                <p className="text-sm mt-1 whitespace-pre-wrap">
                  {taskToView.description || "No description"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                  <p className="text-sm mt-1 capitalize">
                    {taskToView.status.replace("_", " ")}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Deadline</h3>
                  <p className="text-sm mt-1">
                    {taskToView.deadline ? formatDate(taskToView.deadline) : "No deadline"}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Assignee</h3>
                <p className="text-sm mt-1">
                  {taskToView.assignee?.full_name || "Unassigned"}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                setViewDialogOpen(false);
                if (taskToView) handleEdit(taskToView);
              }}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
