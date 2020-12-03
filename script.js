/*jslint browser: true, indent: 3 */
/* Amponsah Nana, Lewis Jon */
document.addEventListener('DOMContentLoaded', function () {
   'use strict';
   var state, createStateObject;

   createStateObject = function (oldState) {
      var persistentModel, model, self;
      // Great and Glorious Site Model

      /*
       * A to-do list item is an object with the following properties:
       * name: the item's name
       * tags: An array of tags/project names (these can be entered comma separated)
       * priority: one of P1, P2, P3, or P4
       * timer: boolean representing timer or no timer set
       */

      // These things should be saved and loaded
      persistentModel = {
         items: [],
         tags: {},
         completed: [0]
      };

      // These things should be reset every session; they control site UI elements
      model = {
         addButtonClass: '',
         addPaneClass: 'hidden',
         projectsClass: 'left',
         prioritiesClass: 'left'

      };

      // Import the old state if it exists
      if (typeof oldState === 'string') {
         try {
            persistentModel = JSON.parse(oldState);
            persistentModel.completed.push(0);
         } catch (ignore) {
         }
      }

      self = {
         getState: function () {
            return JSON.stringify(persistentModel);
         },

         // AddPane Methods
         getAddButtonClass: function () {
            return model.addButtonClass;
         },
         getAddPaneClass: function () {
            return model.addPaneClass;
         },
         toggleAddPane: function () {
            model.addPaneClass = (model.addPaneClass === '') ? 'hidden' : '';
            model.addButtonClass = (model.addButtonClass === '') ? 'deg45' : '';
         },

         // To-Do List Methods
         addTag: function (tag) {
            persistentModel.tags[tag] = tag;
         },
         getTags: function () {
            return Object.keys(persistentModel.tags);
         },
         addItem: function (item) {
            Object.keys(item.tags).forEach(function (tag) {
               self.addTag(tag);
            });
            persistentModel.items.push(item);
         },
         rmItem: function (item) {
            var index;

            index = persistentModel.items.indexOf(item); //https://www.w3schools.com/jsref/jsref_indexof_array.asp

            persistentModel.items = persistentModel.items.slice(0, index).concat(persistentModel.items.slice(index + 1));
            persistentModel.completed[persistentModel.completed.length - 1] += 1;

            if (item.timerHandle !== undefined) {
               window.clearTimeout(item.timerHandle);
            }
            Object.keys(persistentModel.tags).forEach(function (tag) {
               if (self.getItemsByTag(tag).length === 0) {
                  delete persistentModel.tags[tag];
               }
            });
         },
         getItems: function () {
            return persistentModel.items;
         },
         itemCount: function () {
            return persistentModel.items.length;
         },
         getItemsByTag: function (tag) {
            return persistentModel.items.filter(function (x) {return x.tags.hasOwnProperty(tag); });
         },
         getItemsByPriority: function (priority) {
            return persistentModel.items.filter(function (x) {return x.priority === priority; });
         },

         // Sidebar State
         toggleProjectsList: function () {
            model.projectsClass = (model.projectsClass === 'left') ? 'left active' : 'left';
         },
         getProjectsClass: function () {
            return model.projectsClass;
         },
         togglePrioritiesList: function () {
            model.prioritiesClass = (model.prioritiesClass === 'left') ? 'left active' : 'left';
         },
         getPrioritiesClass: function () {
            return model.prioritiesClass;
         },

         // Sundry
         getCompleted: function () {
            return persistentModel.completed.slice(-5);
         }
      };

      return Object.freeze(self);
   };

   (function () {
      //Controller Closure
      var toggleAddPane, refreshToDoList, refreshProjectsList, refreshPrioritiesList, refreshCanvas;

      (function () {
         // Add Pane Controller

         var plus_button;

         toggleAddPane = function () {

            // Change the +/- text and show/hide the pane

            plus_button.className = state.getAddButtonClass();
            document.querySelector('#create-fieldset').className = state.getAddPaneClass();
            state.toggleAddPane();
         };

         plus_button = document.querySelector('#create-to-do-list');

         plus_button.addEventListener('click', function () {

            // This code runs when the +/- button is clicked
            toggleAddPane();
         }, false);

         document.querySelector('#add-item').addEventListener('click', function () {
            var nameElement, priority, tagElement, timerElement, tags, item;

            nameElement = document.querySelector('#item-name');
            priority = document.forms[0].elements.Priority;
                       //https://developer.mozilla.org/en-US/docs/Web/API/RadioNodeList/value
            tagElement = document.querySelector('#tag-name');
            timerElement = document.querySelector('#remind-time');

            tags = {};
            tagElement.value.split(',').forEach(function (tag) {
               tags[tag.toLowerCase()] = tag;
            });
            item = {
               name: nameElement.value,
               tags: tags,
               priority: priority.value,
               timer: (!isNaN(parseFloat(timerElement.value)) && isFinite(parseFloat(timerElement.value)) && parseFloat(timerElement.value) >= 0)
            };

            if (item.name !== '') {
               state.addItem(item);
               if (item.timer) {
                  item.timerHandle = window.setTimeout(function () {
                     window.alert(item.name);
                  }, (parseFloat(timerElement.value) * 60000));
               }
            }
            // Reset form
            nameElement.value = '';
            priority.value = 'P1';
            tagElement.value = '';
            timerElement.value = '';
            refreshToDoList();
         }, false);

      }());

      refreshToDoList = (function () {
         // To-Do List Controller
         var saveState;

         saveState = function () {
            if (localStorage && localStorage.setItem) {
               localStorage.setItem('Schema ToDo List', state.getState());
            }
         };

         return function (tag, priority) {
            var toDoListOutputElement, items;
            toDoListOutputElement = document.querySelector('#to-do-list-output');

            while (toDoListOutputElement.hasChildNodes()) {
               toDoListOutputElement.removeChild(toDoListOutputElement.lastChild);
            }

            // If we were given a list of tags, get only the items with that tag
            // Otherwise, get all items
            items = (tag === undefined) ? state.getItems() : state.getItemsByTag(tag);
            items = (priority === undefined) ? items : state.getItemsByPriority(priority);

            items.forEach(function (item) {
               var newElement, tagsElement;
               // Create a new li element in HTML and insert it just inside the end of the list.
               newElement = document.createElement('li');
               newElement.textContent = '☐ ' + item.name + '\t';

               tagsElement = document.createElement('div');
               tagsElement.textContent = ((item.timer) ? '⧖\t' : '');
               tagsElement.textContent += '[' + Object.keys(item.tags).join(',') + ']\t';
               tagsElement.textContent += item.priority;
               tagsElement.style.cssFloat = "right"; //https://www.w3schools.com/cssref/pr_class_float.asp
               newElement.appendChild(tagsElement);
               toDoListOutputElement.appendChild(newElement);

               newElement.addEventListener('click', function () {
                  state.rmItem(item);
                  refreshToDoList();

               }, false);
            });
            refreshProjectsList();
            refreshPrioritiesList();
            refreshCanvas();
            saveState();
         };
      }());

      refreshProjectsList = (function () {
         // ProjectsList Controller

         document.querySelector('#everything').addEventListener('click', function () {
            refreshToDoList();
         }, false);

         document.querySelector('#projects-triangle').addEventListener('click', function () {
            state.toggleProjectsList();
            refreshToDoList();
         }, false);

         return function () {
            var projectsListOutputElement;

            projectsListOutputElement = document.querySelector('#projects-list');

            while (projectsListOutputElement.hasChildNodes()) {
               projectsListOutputElement.removeChild(projectsListOutputElement.lastChild);
            }

            if (state.getProjectsClass() === 'left') {
               state.getTags().forEach(function (tag) {
                  var newElement;

                  // Create a new li element in HTML and insert it just inside the end of the list.
                  newElement = document.createElement('li');
                  newElement.textContent = tag;
                  newElement.className = 'hoverSelect';
                  projectsListOutputElement.appendChild(newElement);

                  newElement.addEventListener('click', function () {
                     refreshToDoList(tag);
                  }, false);
               });

            }

            document.querySelector('#projects-triangle').className = state.getProjectsClass();
         };
      }());

      refreshPrioritiesList = (function () {
         // ProjectsList Controller

         document.querySelector('#priorities-triangle').addEventListener('click', function () {
            state.togglePrioritiesList();
            refreshToDoList();
         }, false);

         return function () {
            var prioritiesListOutputElement, priorityLabels;

            prioritiesListOutputElement = document.querySelector('#priorities-list');
            priorityLabels = ['Urgent Priority', 'High Priority', 'Medium Priority', 'Low Priority'];

            while (prioritiesListOutputElement.hasChildNodes()) {
               prioritiesListOutputElement.removeChild(prioritiesListOutputElement.lastChild);
            }

            if (state.getPrioritiesClass() === 'left') {
               ["P1", "P2", "P3", "P4"].forEach(function (priority, whichPriority) {
                  var newElement;

                  // Create a new li element in HTML and insert it just inside the end of the list.
                  newElement = document.createElement('li');
                  newElement.textContent = priority + ": " + priorityLabels[whichPriority];
                  newElement.className = 'hoverSelect';
                  prioritiesListOutputElement.appendChild(newElement);

                  newElement.addEventListener('click', function () {
                     refreshToDoList(undefined, priority);
                  }, false);
               });
            }
            document.querySelector('#priorities-triangle').className = state.getPrioritiesClass();
         };
      }());

      refreshCanvas = (function () {
         var graphElement, graphContext, baseOffset, spacing, lineSkip, fontSize;
         graphElement = document.querySelector("#graph");
         graphContext = graphElement.getContext('2d');

         graphElement.width = 400;
         graphElement.height = 300;
         baseOffset = 20;
         fontSize = 30;
         spacing = 30;
         lineSkip = 2;

         return function () {
            var i, largest, completedArray, heightUnit, widthUnit;
            /*
             * Several trips to w3schools were made during the creation of
             * this canvas.
             */

            // Clear canvas
            graphContext.beginPath();
            graphContext.fillStyle = "#252525";
            graphContext.rect(0, 0, graphElement.width, graphElement.height);
            graphContext.fill();

            completedArray = state.getCompleted();
            largest = Math.max.apply(null, completedArray);
            //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply
            largest = (largest > 0) ? largest : 1;
            heightUnit = (graphElement.height - 40 - baseOffset) / largest;
            widthUnit = 50;

            for (i = graphElement.height - baseOffset; i > 0; i -= lineSkip * heightUnit) {
               graphContext.moveTo(0, i);
               graphContext.lineTo(graphElement.width, i);
               graphContext.strokeStyle = '#ddd';
               graphContext.stroke();
            }

            completedArray.forEach(function (completed, whichCompleted) {
               // Draw bar
               graphContext.beginPath();
               graphContext.fillStyle = 'rgb(255,255,255)';
               graphContext.rect(((widthUnit + spacing) * whichCompleted), graphElement.height - baseOffset, widthUnit, -((completed * heightUnit)));
               graphContext.fill();

               // Draw bar height text
               graphContext.font = fontSize.toString() + "px Arial";
               graphContext.fillStyle = 'white';
               graphContext.fillText(completed.toString(), (widthUnit + spacing) * whichCompleted + Math.floor(widthUnit / 3), graphElement.height - (heightUnit * completed) - baseOffset);

               // Draw day number text
               graphContext.font = (fontSize / 2).toString() + "px Arial";
               graphContext.fillText('Session ' + (whichCompleted + 1).toString(), (widthUnit + spacing) * whichCompleted, graphElement.height);

            });

         };
      }());

      (function () {
         // Initialize site
         state = createStateObject(localStorage && localStorage.getItem && localStorage.getItem('Schema ToDo List'));
         toggleAddPane();
         //state.toggleProjectsList();

         refreshToDoList();
         refreshCanvas();
         //refreshProjectsList();
      }());
   }());
}, false);
