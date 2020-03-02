/*global jQuery, Handlebars, Router */
jQuery(function ($) {
	'use strict';

	Handlebars.registerHelper('eq', function (a, b, options) {
		return a === b ? options.fn(this) : options.inverse(this);
	});

	var ENTER_KEY = 13;
	var ESCAPE_KEY = 27;

	var util = {
		uuid: function () {
			/*jshint bitwise:false */
			var i, random;
			var uuid = '';

			for (i = 0; i < 32; i++) {
				random = Math.random() * 16 | 0;
				if (i === 8 || i === 12 || i === 16 || i === 20) {
					uuid += '-';
				}
				uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
			}

			return uuid;
		},
		pluralize: function (count, word) {
			return count === 1 ? word : word + 's';
		},
		store: function (namespace, data) {
			if (arguments.length > 1) {
				return localStorage.setItem(namespace, JSON.stringify(data));
			} else {
				var store = localStorage.getItem(namespace);
				return (store && JSON.parse(store)) || [];
			}
		}
	};

	var App = {
		init: function () {

			this.todos = util.store('todos-jquery');
			this.todoTemplate = Handlebars.compile($('#todo-template').html());
			this.footerTemplate = Handlebars.compile($('#footer-template').html());
			this.bindEvents();

			new Router({
				'/:filter': function (filter) {
					this.filter = filter;
					this.render();
				}.bind(this)
			}).init('/all');
		},
		bindEvents: function () {
			$('.new-todo').on('keyup', this.create.bind(this));
			$('.toggle-all').on('change', this.toggleAll.bind(this));
			$('.footer').on('click', '.clear-completed', this.destroyCompleted.bind(this));
			$('.todo-list')
				.on('change', '.toggle', this.toggle.bind(this))
				.on('dblclick', 'label', this.editingMode.bind(this))
				.on('keyup', '.edit', this.editKeyup.bind(this))
				.on('focusout', '.edit', this.update.bind(this))
				.on('click', '.destroy', this.destroy.bind(this));
		},
		render: function () {
			var todos = this.getFilteredTodos();
			var jsonRes = '';
			$.get( "/drupal/index.php/todo/tasklist/", function( data ) {
				jsonRes = data;
			  }, "json" );
			
			$.each(jsonRes, function() {
				var dynamic_html = '';
					if(this.completed == true)
					{
						dynamic_html += '<li class="completed task_'+this.id+'" data-id='+this.id+'>';
					}
					else
					{
						dynamic_html += '<li class="task_'+this.id+'" data-id='+this.id+'>';
					}
					
					dynamic_html += '<div class="view">';
					dynamic_html += '<input class="toggle" type="checkbox">';
					dynamic_html += '<label>'+ this.name +'</label>';
					dynamic_html += '<button class="destroy" id="'+this.id+'"></button>';					
					dynamic_html += '</div>';
					dynamic_html += '<input class="edit" value="'+ this.name+'">';
					dynamic_html += '</li>';
				$('.todo-list').append(dynamic_html);
			});  
			//$('.main').toggle(todos.length > 0);
			$('.toggle-all').prop('checked', this.getActiveTodos().length === 0);
			this.renderFooter();
			$('.new-todo').focus();
			util.store('todos-jquery', this.todos);
		},
		renderFooter: function () {
			var todoCount = this.todos.length;
			var activeTodoCount = this.getActiveTodos().length;
			var template = this.footerTemplate({
				activeTodoCount: activeTodoCount,
				activeTodoWord: util.pluralize(activeTodoCount, 'item'),
				completedTodos: todoCount - activeTodoCount,
				filter: this.filter
			});

			$('.footer').html(template);
		},
		toggleAll: function (e) {
			var isChecked = $(e.target).prop('checked');

			this.todos.forEach(function (todo) {
				todo.completed = isChecked;
			});

			this.render();
		},
		getActiveTodos: function () {
			return this.todos.filter(function (todo) {
				return !todo.completed;
			});
		},
		getCompletedTodos: function () {
			return this.todos.filter(function (todo) {
				return todo.completed;
			});
		},
		getFilteredTodos: function () {
			if (this.filter === 'active') {
				return this.getActiveTodos();
			}

			if (this.filter === 'completed') {
				return this.getCompletedTodos();
			}

			return this.todos;
		},
		destroyCompleted: function () {
			this.todos = this.getActiveTodos();
			this.render();
		},
		// accepts an element from inside the `.item` div and
		// returns the corresponding index in the `todos` array
		getIndexFromEl: function (el) {
			var id = $(el).closest('li').data('id');
			var todos = this.todos;
			var i = todos.length;

			while (i--) {
				if (todos[i].id === id) {
					return i;
				}
			}
		},
		create: function (e) {
			var $input = $(e.target);
			var val = $input.val().trim();

			if (e.which !== ENTER_KEY || !val) {
				return;
			}

			$.post( "/drupal/index.php/todo/taskadd/", { name: val })
			  .done(function( data ) {
				  console.log(data);
				$('.todo-list').html('');  
				$.each(data, function() {
					var dynamic_html = '';
						if(this.completed === true)
						{
							dynamic_html += '<li class="completed task_'+this.id+'" data-id='+this.id+'>';
						}
						else
						{
							dynamic_html += '<li class="task_'+this.id+'" data-id='+this.id+'>';
						}
						
						dynamic_html += '<div class="view">';
						dynamic_html += '<input class="toggle" type="checkbox">';
						dynamic_html += '<label>'+ this.name +'</label>';
						dynamic_html += '<button class="destroy" id="'+this.id+'"></button>';					
						dynamic_html += '</div>';
						dynamic_html += '<input class="edit" value="'+ this.name +'">';
						dynamic_html += '</li>';
					$('.todo-list').append(dynamic_html);
				});
				$('.todo-count').html($('.todo-list li').length+' left');	
			}, "json");

			$input.val('');
			
			
		},
		toggle: function (e) {
			
			if($(e.target).closest('li').hasClass('completed') == true)
			{
				var completed = 0;
			}
			else
			{
				completed = 1;
			}

			$.post( "/drupal/index.php/todo/taskcomplete/", { id: $(e.target).closest('li').data('id'), status:completed })
			  .done(function( data ) {
				if(data.status == 1)
				{
					$('li.task_'+data.id).addClass('completed');
				}
				else
				{
					$('li.task_'+data.id).removeClass('completed');
				}  
				
				$('.todo-count').html($('.todo-list li:not([completed])').length+' left');
			}, "json");
		},
		editingMode: function (e) {
			var $input = $(e.target).closest('li').addClass('editing').find('.edit');
			// puts caret at end of input
			var tmpStr = $input.val();
			$input.val('');
			$input.val(tmpStr);
			$input.focus();
		},
		editKeyup: function (e) {
			if (e.which === ENTER_KEY) {
				e.target.blur();
			}

			if (e.which === ESCAPE_KEY) {
				$(e.target).data('abort', true).blur();
			}
		},
		update: function (e) {
			var el = e.target;
			var $el = $(el);
			var val = $el.val().trim();
			if ($el.data('abort')) {
				$el.data('abort', false);
			} else if (!val) {
				this.destroy(e);
				return;
			}

			$.post( "/drupal/index.php/todo/taskupdate/", { id: $(e.target).closest('li').data('id'),name:val })
			  .done(function( data ) {
				$('li.task_'+data.id+' label').html(data.name);
			}, "json");

			this.render();
		},
		destroy: function (e) {
			$.post( "/drupal/index.php/todo/taskremove/", { id: e.target.id })
			  .done(function( data ) {
				$('.task_'+data.id).remove();
				$('.todo-count').html($('.todo-list li').length+' left');
			}, "json");  
			
			this.render();
		}
	};

	App.init();
});
