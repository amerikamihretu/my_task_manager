import mongoose from "mongoose";

export const TASK_STATUSES = ["pending", "in-progress", "completed"];
export const TASK_PRIORITIES = ["low", "medium", "high"];

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    status: {
      type: String,
      enum: { values: TASK_STATUSES, message: "Invalid status" },
      default: "pending",
    },
    priority: {
      type: String,
      enum: { values: TASK_PRIORITIES, message: "Invalid priority" },
      default: "medium",
    },
    dueDate: {
      type: Date,
      default: null,
    },
    tags: {
      type: [
        {
          type: String,
          trim: true,
          maxlength: 30,
        },
      ],
      default: [],
      validate: {
        validator: (value) => value.length <= 10,
        message: "You can add up to 10 tags",
      },
    },
    subtasks: {
      type: [
        {
          title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
          },
          completed: {
            type: Boolean,
            default: false,
          },
        },
      ],
      default: [],
      validate: {
        validator: (value) => value.length <= 20,
        message: "You can add up to 20 subtasks",
      },
    },
    archived: {
      type: Boolean,
      default: false,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.user;
        return ret;
      },
    },
  },
);

// Speeds up owner-scoped listing and filtering
taskSchema.index({ user: 1, status: 1, priority: 1, createdAt: -1 });

export const Task = mongoose.model("Task", taskSchema);
