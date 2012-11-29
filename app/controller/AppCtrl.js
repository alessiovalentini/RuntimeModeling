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
			AppCtrl.generateModels( ['News__c'] );
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

	generateModels : function ( modelsArray ) {
		var AppCtrl = this;

		// iterate through the modelsArray calling salesforce and generating all the models dynamically
		for(var i in modelsArray ){

			// get objects metadata and generate models
			RuntimeModeling.salesforce.client.describe( modelsArray[i],
				function success ( success_response ) {
					console.log('> got ' + success_response.label + ' describe successfully', success_response);

					// generate the model runtime
					AppCtrl._generateObjectModel( success_response.label, success_response.fields );

					// generate the store as well
					AppCtrl._generateObjectStore( success_response.label, 'localstorage' );
				},

				function error( error_response) {

				}
			);
		}

	},

	_generateObjectModel : function ( modelName, fields ) {
		var fieldsNames;

		// fields => array under success_response.fields
		//			fields[i].name | fields[i].label

		// preparing the fields array for the model
		fieldsNames = [];
		for( var i in fields ){
			fieldsNames.push( fields[i].name );
		}

		// defining News__c model at runtime | can use name (api name) or label
		// this is directly addicng the model to the global app object
		Ext.define( this.getApplication().name +  '.model.' + modelName, {
			extend: 'Ext.data.Model',

			config: {
				identifier: 'uuid',	// use the best strategy
				fields: fieldsNames
			}
		});

		// testing if the created model is correct
		// var newsModel = Ext.create(modelName);
		// console.log('> created ' +  modelName + ' model',  RuntimeModeling );
	},

	_generateObjectStore : function( storeName, proxyType ){

		Ext.define( this.getApplication().name + '.store.' + storeName + 'Store', {
			extend: 'Ext.data.Store',

			config: {

				// use an unique id to reference the store [solve warnings and more problems]
				storeId: this.getApplication().name + '_' + storeName + 'Store',	// ex: RuntimeModeling_NewsStore
				model  : this.getApplication().name + '.model.' + storeName,		// ex: RuntimeModeling.model.News

				autoLoad: true,		// NOTE then it's not necessary to use store.load();
				autoSync: true,		// NOTE then it's not necessary to use store.sync();

		        proxy:{

		            type: proxyType,
		            id  : this.getApplication().name + '_' + storeName + 'LocalStorage'	// ex: RuntimeModeling_NewsLocalStorage
		        }
			},

			wipe: function(){
				this.removeAll();
			}
		});
	}
});