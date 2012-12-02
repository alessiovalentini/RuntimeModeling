Ext.define('RuntimeModeling.controller.AppCtrl', {
	extend: 'Ext.app.Controller',

	// application backend startup
	init: function(){
		var AppCtrl = this;

		console.log('> AppCtrl initialized');

		// connect to salesforce
		RuntimeModeling.salesforce = new salesforce( 'web_app', 'production' );

		// refresh the token and start app
		RuntimeModeling.salesforce.refreshAccessToken( function() {
			console.log('> connected to salesforce. client is', RuntimeModeling.salesforce.client );

			// generate the array or passed model
			AppCtrl.defineModelsAndStores( ['News__c'] );
		});
	},

	myInit: function() {
		// body...
	},

	launch : function () {
		// body...
	},

	config: {

		// cache dom objects references + get functions for free
		refs: {


		},

		// how controller must react at events on the referenced objects
		control: {


		},

		routes: {

		}
	},

	defineModelsAndStores : function ( modelsArray ) {
		var AppCtrl = this;

		// iterate through the modelsArray calling salesforce and generating all the models dynamically
		for(var i in modelsArray ){

			// get objects metadata and generate models
			RuntimeModeling.salesforce.client.describe( modelsArray[i],
				function success ( success_response ) {
					console.log('> got ' + success_response.label + ' describe successfully', success_response);

					// generate the model runtime
					AppCtrl._defineObjectModel( success_response.label, success_response.fields );

					// generate the store as well
					AppCtrl._defineObjectStore( success_response.label, 'localstorage' );

					// fire an ready event when they are ready (attach this to the document)
					$(document).trigger('ModelsAndStoresReady');
				},

				function error( error_response) {

				}
			);

			// news object metadata
			// RuntimeModeling.salesforce.client.metadata( modelsArray[i],
			// 	function success ( success_response ) {

			// 		console.log('> news metadata', success_response);
			// 	},

			// 	function error( error_response) {

			// 	}
			// );
		}

	},

	defineSimpleModel : function(){
		Ext.define('User', {
		    extend: 'Ext.data.Model',

		    config: {

		        fields: [
		            {name: 'name',  type: 'string'},
		            {name: 'age',   type: 'int'},
		            {name: 'phone', type: 'string'},
		            {name: 'alive', type: 'boolean', defaultValue: true}
		        ]
		    },

		    changeName: function() {
		        var oldName = this.get('name'),
		            newName = oldName + " The Barbarian";

		        this.set('name', newName);
		    }
		});

		var user = Ext.create('User');

		var User = Ext.ModelManager.getModel('User');

		console.log(user);
		console.log(User);

		// user.changeName();
		// console.log('> user', user.get('name') );

	},

	///////////////////////////////////////////////////////////////////////////////////////////
	//	Internal methods
	///////////////////////////////////////////////////////////////////////////////////////////

	_defineObjectModel : function ( modelName, fields ) {
		var fieldsNames;

		// fields => array under success_response.fields
		//			fields[i].name | fields[i].label

		// preparing the fields array for the model
		fieldsNames = [];
		for( var i in fields ){
			fieldsNames.push( fields[i].name );
		}

		// define the model
		Ext.define( this.getApplication().name +  '.model.' + modelName, {		// ex RuntimeModeling.model.News
			extend: 'Ext.data.Model',

			// config and fields
			config: {
				fields     : fieldsNames,
				// identifier: 'uuid',		// ATTENTION!!! this makes the runtime modeling not working
				// identifier : {
		  //           type: 'sequential',
		  //           prefix: modelName + '_',
		  //           seed: 1000
		  //       }
			},

			// utilities methods
			timeAgoInWords : function( date ) {
			    try {
			        var now = Math.ceil(Number(new Date()) / 1000),
			            dateTime = Math.ceil(Number(new Date(date)) / 1000),
			            diff = now - dateTime,
			            str;

			        if (diff < 60) {
			        	return String(diff) + ' seconds ago';
			        } else if (diff < 3600) {
			            str = String(Math.ceil(diff / (60)));
			            return str + (str == "1" ? ' minute' : ' minutes') + ' ago';
			        } else if (diff < 86400) {
			            str = String(Math.ceil(diff / (3600)));
			            return str + (str == "1" ? ' hour' : ' hours') + ' ago';
			        } else if (diff < 60 * 60 * 24 * 365) {
			            str = String(Math.ceil(diff / (60 * 60 * 24)));
			            return str + (str == "1" ? ' day' : ' days') + ' ago';
			        } else {
			            return Ext.Date.format(new Date(date), 'jS M \'y');
			        }
			    } catch (e) {
			        return '';
			    }
			}
		});
	},

	_defineObjectStore : function( storeName, proxyType ){

		// define the store
		Ext.define( this.getApplication().name + '.store.' + storeName + 'Store', {		// ex RuntimeModeling.store.NewsStore
			extend: 'Ext.data.Store',

			config: {

				// use an unique id to reference the store [solve warnings and more problems]
				// storeId: this.getApplication().name + '_' + storeName + 'Store',	// ex: RuntimeModeling_NewsStore
				model  : this.getApplication().name + '.model.' + storeName,		// ex: RuntimeModeling.model.News

				autoLoad: true,		// NOTE then it's not necessary to use store.load();
				autoSync: true,		// NOTE then it's not necessary to use store.sync();

		        proxy:{

		            type: proxyType,
		            id  : this.getApplication().name + '_' + storeName + 'LocalStorage'	// ex: RuntimeModeling_NewsLocalStorage
		        }
			},

			wipe: function(){
				this.removeAll();	// autosync ons
			}
		});
	},


	///////////////////////////////////////////////////////////////////////////////////////////
	//	Test methods
	///////////////////////////////////////////////////////////////////////////////////////////

	testModel : function( objectName ) {
		var storeInstance, modelInstance;

		if( objectName === 'News' ){

			// store instance
			storeInstance = Ext.create( this.getApplication().name + '.store.' + objectName + 'Store' );

			// once the model is defined it's possible to create it
			modelInstance = Ext.create( this.getApplication().name +  '.model.' + objectName, {

				Title__c    : 'testtitle',
				CreatedDate : Date.now()
			});


			// use of the timeAgoInWord() utility function
			modelInstance.set('CreatedDate', modelInstance.timeAgoInWords(modelInstance.get('CreatedDate')) );

			console.log('> model instance after timeAgoInWord', modelInstance);
			console.log('> store instance', storeInstance);
		}
	}
});