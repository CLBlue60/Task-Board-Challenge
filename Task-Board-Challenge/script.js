let taskList = JSON.parse(localStorage.getItem("tasks"));
let nextId = JSON.parse(localStorage.getItem("nextId"));

function readTasksFromStorage() {
  let tasks = localStorage.getItem("tasks");
  if (!tasks) {
    return [];
  }
  let tasksParsed = JSON.parse(tasks);
  return tasksParsed;
}

function saveTasksToStorage(tasks) {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function generateTaskId() {
  return crypto.randomUUID();
}

function createTaskCard(task) {
  const taskCard = $("<div>");
  taskCard.addClass("card project-card draggable my-3");
  taskCard.attr("data-project-id", task.id);

  const cardHeader = $("<div>");
  cardHeader.addClass("card-header h4");
  cardHeader.text(task.title);

  const cardBody = $("<div>");
  cardBody.addClass("card-body");

  const cardDate = $("<p>");
  cardDate.addClass("card-text");
  cardDate.text(task.dueDate);

  const cardDesc = $("<p>");
  cardDesc.addClass("card-text");
  cardDesc.text(task.description);

  const cardDeleteButton = $("<button>");
  cardDeleteButton.addClass("btn btn-danger delete");
  cardDeleteButton.text("delete");
  cardDeleteButton.attr("data-project-id", task.id);

  cardBody.append(cardDate);
  cardBody.append(cardDesc);
  cardBody.append(cardDeleteButton);

  taskCard.append(cardHeader);
  taskCard.append(cardBody);

  if (task.dueDate && task.status !== "done") {
    const now = dayjs();
    const taskDueDate = dayjs(task.dueDate, "DD/MM/YYYY");

    let sevenDaysAway = now.add(7, "day");
    const isBetween = window.dayjs_plugin_isBetween;
    dayjs.extend(isBetween);

    if (dayjs(taskDueDate).isBetween(now, sevenDaysAway, "day", "[)")) {
      taskCard.addClass("bg-warning text-white");
    } else if (now.isAfter(taskDueDate, "day")) {
      taskCard.addClass("bg-danger text-white");
      cardDeleteButton.addClass("border-light");
    }

    return taskCard;
  }

  return taskCard;
}

function renderTaskList() {
  const tasks = readTasksFromStorage();

  const todoList = $("#todo-cards");
  todoList.empty();

  const inProgressList = $("#in-progress-cards");
  inProgressList.empty();

  const doneList = $("#done-cards");
  doneList.empty();

  for (let i of tasks) {
    const newCard = createTaskCard(i);
    if (i.status === "to-do") {
      todoList.append(newCard);
    } else if (i.status === "in-progress") {
      inProgressList.append(newCard);
    } else {
      doneList.append(newCard);
    }
  }
  $(".draggable").draggable({
    opacity: 0.5,
    zIndex: 100,

    helper: function (e) {
      const original = $(e.target).hasClass("ui-draggable")
        ? $(e.target)
        : $(e.target).closest(".ui-draggable");

      return original.clone().css({
        width: original.outerWidth(),
      });
    },
  });
}

function handleAddTask(event) {
  event.preventDefault();

  const newTask = {
    id: generateTaskId(),
    title: $("#taskTitle").val(),
    dueDate: $("#taskDueDate").val(),
    description: $("#taskDescription").val(),
    status: "to-do",
  };

  const tasks = readTasksFromStorage();
  tasks.push(newTask);

  saveTasksToStorage(tasks);

  renderTaskList();

  $("#taskTitle").val("");
  $("#taskDueDate").val("");
  $("#taskDescription").val("");
}

function handleDeleteTask(event) {
  const taskId = $(this).attr("data-project-id");
  const tasks = readTasksFromStorage();

  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].id == taskId) {
      tasks.splice([i], 1);
    }
  }
  saveTasksToStorage(tasks);
  renderTaskList();
}

function handleDrop(event, ui) {
  const tasks = readTasksFromStorage();
  const taskId = ui.draggable[0].dataset.projectId;
  const newStatus = event.target.id;

  for (i of tasks) {
    if (i.id === taskId) {
      i.status = newStatus;
    }
  }

  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderTaskList();
}

$(document).ready(function () {
  renderTaskList();

  $(".swim-lanes").on("click", ".delete", handleDeleteTask);

  $("#project-form").on("submit", handleAddTask);

  $(".lane").droppable({
    accept: ".draggable",
    drop: handleDrop,
  });

  $("#taskDueDate").datepicker({
    changeMonth: true,
    changeYear: true,
  });
});
