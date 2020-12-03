/*jslint browser: true, indent: 3 */

// CS 3312, spring 2019
// Examples for Studio 8

// All the code below will be run once the page content finishes loading.
document.addEventListener('DOMContentLoaded', function () {
   'use strict';

   // Here's a very simple example of a model/view/controller design.
   (function () {
      var createCounter;

      // Create a factory that makes a simple counter object.
      createCounter = function () {
         var self, state;

         // The state is an object (maybe an array) that keeps track of all the data.
         state = {
            count: 0
         };

         // The self object contains public methods.
         self = {
            getCount: function () {
               return state.count;
            },
            increment: function () {
               state.count += 1;
            }
         };
         return Object.freeze(self);
      };

      // Create a new closure to hide the view and controller from the model code above.
      (function () {
         var clickCounter, updateClickCounter;

         // Create a function that updates everything that needs updating whenever the model changes.
         updateClickCounter = function () {
            // If we needed to save the new model state in web storage, we would do it here.
            // Update the view.
            document.querySelector('#unsaved-click-count').textContent = clickCounter.getCount();
            // If we needed to update the controller, we would do it here.
         };

         // Create a click handler for the entire document.
         document.addEventListener('click', function () {
            // Update the model.
            clickCounter.increment();
            // Update everything else based on the new model state.
            updateClickCounter();
         }, false);

         // Create a fresh new model.
         clickCounter = createCounter();
         // Update everything else based on the new model state.
         updateClickCounter();
      }());
   }());

   // This MVC design is identical to the one above except that it uses web storage to remember the model.
   (function () {
      var createCounter;

      // Create a factory that makes a simple counter object.
      createCounter = function (oldState) {
         var self, state;

         // Create a default starting state.
         state = {
            count: 0
         };
         // If there's a valid previous state, use it instead.
         if (typeof oldState === 'string') {
            try {
               state = JSON.parse(oldState);
            } catch (ignore) {
            }
         }

         // The self object contains public methods.
         self = {
            getCount: function () {
               return state.count;
            },
            getState: function () {
               // Return a string representation of the state object, to be used for web storage.
               return JSON.stringify(state);
            },
            increment: function () {
               state.count += 1;
            }
         };
         return Object.freeze(self);
      };

      // Create a new closure to hide the view and controller from the model code above.
      (function () {
         var clickCounter, updateClickCounter;

         // Create a function that updates everything that needs updating whenever the model changes.
         updateClickCounter = function () {
            // Save the new state in web storage (if available).
            if (localStorage && localStorage.setItem) {
               localStorage.setItem('CS 3312 Studio 8 click counter', clickCounter.getState());
            }
            // Update the view.
            document.querySelector('#saved-click-count').textContent = clickCounter.getCount();
            // If we needed to update the controller, we would do it here.
         };

         // Create a click handler for the entire document.
         document.addEventListener('click', function () {
            // Update the model.
            clickCounter.increment();
            // Update everything else based on the new model state.
            updateClickCounter();
         }, false);

         // When the page is loaded, get any saved state from web storage and use it.
         clickCounter = createCounter(localStorage && localStorage.getItem && localStorage.getItem('CS 3312 Studio 8 click counter'));
         // Update everything else based on the new model state.
         updateClickCounter();
      }());
   }());

   (function () {
      var createColorQuiz;

      // Create a factory that makes an object to keep track of a color-quiz game.
      createColorQuiz = function (oldState) {
         var randomizeColors, self, state;

         // The two squares' colors will need to be randomized at various times.
         randomizeColors = function () {
            state.colorLeft.red = Math.floor(Math.random() * 256);
            state.colorLeft.green = Math.floor(Math.random() * 256);
            state.colorLeft.blue = Math.floor(Math.random() * 256);
            state.colorRight.red = Math.floor(Math.random() * 256);
            state.colorRight.green = Math.floor(Math.random() * 256);
            // Make sure the blue levels of the two colors are at least a little different.
            do {
               state.colorRight.blue = Math.floor(Math.random() * 256);
            } while (state.colorLeft.blue === state.colorRight.blue);
         };

         // Create a default starting state.
         state = {
            colorLeft: {},
            colorRight: {},
            numCorrectGuesses: 0,
            numGuesses: 0
         };
         randomizeColors();
         // If there's a valid previous state, use it instead.
         if (typeof oldState === 'string') {
            try {
               state = JSON.parse(oldState);
            } catch (ignore) {
            }
         }

         // The self object contains public methods.
         self = {
            getAccuracy: function () {
               // Return a string that describes the guesser's accuracy so far.
               if (state.numGuesses > 0) {
                  return (state.numCorrectGuesses / state.numGuesses * 100).toFixed(2) + '%';
               }
               return 'TBD';
            },
            getLeftColor: function () {
               // Return the color of the left square for use in changing CSS.
               return 'rgb(' + state.colorLeft.red + ', ' + state.colorLeft.green + ', ' + state.colorLeft.blue + ')';
            },
            getRightColor: function () {
               // Return the color of the right square for use in changing CSS.
               return 'rgb(' + state.colorRight.red + ', ' + state.colorRight.green + ', ' + state.colorRight.blue + ')';
            },
            getState: function () {
               // Return a string representation of the state object, to be used for web storage.
               return JSON.stringify(state);
            },
            guessLeft: function () {
               // Process a guess that the left square has more blue in it.
               state.numGuesses += 1;
               if (state.colorLeft.blue > state.colorRight.blue) {
                  state.numCorrectGuesses += 1;
               }
               randomizeColors();
            },
            guessRight: function () {
               // Process a guess that the right square has more blue in it.
               state.numGuesses += 1;
               if (state.colorLeft.blue < state.colorRight.blue) {
                  state.numCorrectGuesses += 1;
               }
               randomizeColors();
            }
         };
         return Object.freeze(self);
      };

      // Create a new closure to hide the view and controller from the model code above.
      (function () {
         var colorQuiz, updateColorQuiz;

         // Create a function that updates everything that needs updating whenever the model changes.
         updateColorQuiz = function () {
            // Save the new state in web storage (if available).
            if (localStorage && localStorage.setItem) {
               localStorage.setItem('CS 3312 Studio 8 color quiz', colorQuiz.getState());
            }
            // Update the view.
            document.querySelector('#quiz-color-left').style.backgroundColor = colorQuiz.getLeftColor();
            document.querySelector('#quiz-color-right').style.backgroundColor = colorQuiz.getRightColor();
            document.querySelector('#color-quiz-accuracy').textContent = colorQuiz.getAccuracy();
            // If we needed to update the controller, we would do it here.
         };

         // Handle a guess that the left square has more blue in it.
         document.querySelector('#quiz-color-left').addEventListener('click', function () {
            // Update the model.
            colorQuiz.guessLeft();
            // Update everything else based on the new model state.
            updateColorQuiz();
         }, false);

         // Handle a guess that the right square has more blue in it.
         document.querySelector('#quiz-color-right').addEventListener('click', function () {
            // Update the model.
            colorQuiz.guessRight();
            // Update everything else based on the new model state.
            updateColorQuiz();
         }, false);

         // When the page is loaded, get any saved state from web storage and use it.
         colorQuiz = createColorQuiz(localStorage && localStorage.getItem && localStorage.getItem('CS 3312 Studio 8 color quiz'));
         // Update everything else based on the new model state.
         updateColorQuiz();
      }());
   }());

   (function () {
      var createToDoList;

      // Create a factory that makes an object to keep track of a to-do list.
      createToDoList = function (oldState) {
         var self, state;

         // Create a default starting state.
         state = [];
         // If there's a valid previous state, use it instead.
         if (typeof oldState === 'string') {
            try {
               state = JSON.parse(oldState);
            } catch (ignore) {
            }
         }

         // The self object contains public methods.
         self = {
            addItem: function (item) {
               // Add a new item to the end of the list.
               state.push(item);
            },
            getItem: function (whichItem) {
               return state[whichItem];
            },
            getList: function () {
               // Return a copy of the list array.
               return state.slice();
            },
            getNumItems: function () {
               return state.length;
            },
            getState: function () {
               // Return a string representation of the state object, to be used for web storage.
               return JSON.stringify(state);
            },
            removeItem: function (whichItem) {
               // Remove an item from anywhere in the list.
               state = state.slice(0, whichItem).concat(state.slice(whichItem + 1));
            }
         };
         return Object.freeze(self);
      };

      // Create a new closure to hide the view and controller from the model code above.
      (function () {
         var toDoList, updateToDoList;

         // Create a function that updates everything that needs updating whenever the model changes.
         updateToDoList = function () {
            var toDoListOutputElement;

            // Save the new state in web storage (if available).
            if (localStorage && localStorage.setItem) {
               localStorage.setItem('CS 3312 Studio 8 to-do list', toDoList.getState());
            }

            // Update the view.
            toDoListOutputElement = document.querySelector('#to-do-list-output');
            // Empty the #to-do-list-output element of all child elements.
            while (toDoListOutputElement.hasChildNodes()) {
               toDoListOutputElement.removeChild(toDoListOutputElement.lastChild);
            }
            // Insert the list items as new li elements one by one.
            toDoList.getList().forEach(function (item) {
               var newElement;
               // Create a new li element in HTML and insert it just inside the end of the list.
               newElement = document.createElement('li');
               newElement.textContent = item;
               toDoListOutputElement.appendChild(newElement);
            });

            // Update the controller:  Add a click handler to each new li element.
            Array.from(toDoListOutputElement.querySelectorAll('li')).forEach(function (element, whichItem) {
               element.addEventListener('click', function () {
                  // Update the model.
                  toDoList.removeItem(whichItem);
                  // Update everything else based on the new model state.
                  updateToDoList();
               }, false);
            });
         };

         // Set up the controller:  Handle adding a new to-do list item.
         document.querySelector('#add-to-do-list-item').addEventListener('click', function () {
            var itemToAdd;
            // Update the model.
            itemToAdd = document.querySelector('#to-do-list-item-to-add').value;
            if (itemToAdd.length > 0) {
               toDoList.addItem(itemToAdd);
            }
            // Update everything else based on the new model state.
            updateToDoList();
         }, false);

         // When the page is loaded, get any saved state from web storage and use it.
         toDoList = createToDoList(localStorage && localStorage.getItem && localStorage.getItem('CS 3312 Studio 8 to-do list'));
         // Update everything else based on the new model state.
         updateToDoList();
      }());
   }());

   // Give the user a convenient way to make this web app forget everything it's put into local storage.
   document.querySelector('#forget-everything').addEventListener('click', function (ev) {
      // Remove each item from web storage.
      localStorage.removeItem('CS 3312 Studio 8 click counter');
      localStorage.removeItem('CS 3312 Studio 8 color quiz');
      localStorage.removeItem('CS 3312 Studio 8 to-do list');
      // Keep this click event from being handled as a click on the page as a whole.
      ev.stopPropagation();
      // Now the click counter won't count this click.
   }, false);

}, false);
