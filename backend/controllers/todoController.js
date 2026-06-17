import Todo from "../model/todo-model.js";
export const getTodoStats = async (req, res) => {
  try {
    console.log("USER:", req.user);
    const stats = await Todo.aggregate([
      {
        $match: {
          userId: req.user._id,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: {
            $sum: {
              $cond: ["$completed", 1, 0],
            },
          },
          pending: {
            $sum: {
              $cond: ["$completed", 0, 1],
            },
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      stats: stats[0] || {
        total: 0,
        completed: 0,
        pending: 0,
      },
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
