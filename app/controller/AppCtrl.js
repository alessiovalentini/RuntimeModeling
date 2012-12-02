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
			console.log('> access token refreshed. client is', RuntimeModeling.salesforce.client );

			// triggering token ready
			$(document).trigger('AccessTokenReady');
		});

		// generating model and stores runtime (once accessTokenReady)
		$(document).on('AccessTokenReady', AppCtrl.defineModelsAndStores( ['News__c'] ));
	},

	myInit: function() {
		// body...
	},

	launch : function () {
		// generating test record
        var app = this.getApplication();
        var store, testRecord;
        // attach generated store instance to the app
        app.runtimeStores = [];

        $(document).bind("ModelsAndStoresReady", function(){
            console.log('> models and stores are defined. generating test records for ', app.getModels() );

            for(var i in app.getModels() ){

            	// generate store instance..
            	store = Ext.create( app.name + '.store.' + app.getModels()[i] + 'Store' );
            	// ..and save it in the app variable
            	app.runtimeStores.push( store );

	            // create a news test record
	            testRecord = Ext.create( app.name +  '.model.' + app.getModels()[i], {

	                Title__c    : 'testtitle',
	                CreatedDate : Date.now(),
	                Id          : 'aX54345345vvccfghdfg'
	            });

	            // add the news to the store (please note the autosync and autoload)
	            app.runtimeStores[i].add( testRecord );
	        }

        });
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
					console.log('> got ' + success_response.label + ' sobject describe successfully', success_response);

					// generate the model runtime
					AppCtrl._defineObjectModel( success_response.label, success_response.fields );

					// generate the store as well -define where to save it
					AppCtrl._defineObjectStore( success_response.label, 'sessionstorage' );

					// triggering models and stores ready
					$(document).trigger('ModelsAndStoresReady');
				},

				function error( error_response) {
					// error code
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

	///////////////////////////////////////////////////////////////////////////////////////////
	//	Internal methods
	///////////////////////////////////////////////////////////////////////////////////////////

	_defineObjectModel : function ( objectName, fields ) {
		var fieldsNames;	// array under success_response.fields | fields[i].name | fields[i].label

		// preparing the fields array for the model
		fieldsNames = [];
		for( var i in fields ){
			fieldsNames.push( fields[i].name );
		}

		// define the model
		Ext.define( this.getApplication().name +  '.model.' + objectName, {		// ex RuntimeModeling.model.News
			extend: 'Ext.data.Model',
			config: {
				fields     : fieldsNames
			},
		});

		// add the runtime generated model to the app models array
		this.getApplication()._models.push( objectName );
	},

	_defineObjectStore : function( objectName, proxyType ){

		// define the store
		Ext.define( this.getApplication().name + '.store.' + objectName + 'Store', {		// ex RuntimeModeling.store.NewsStore
			extend: 'Ext.data.Store',

			config: {

				// use an unique id to reference the store [solve warnings and more problems]
				// storeId: this.getApplication().name + '_' + objectName + 'Store',	// ex: RuntimeModeling_NewsStore
				model  : this.getApplication().name + '.model.' + objectName,		// ex: RuntimeModeling.model.News

				autoLoad: true,		// NOTE then it's not necessary to use store.load();
				autoSync: true,		// NOTE then it's not necessary to use store.sync();

		        proxy:{

		            type: proxyType,
		            id  : this.getApplication().name + '_' + objectName + proxyType	// ex: RuntimeModeling_NewsLocalStorage
		        }
			},

			wipe: function(){
				this.removeAll();	// autosync ons
			}
		});

		// add the runtime generated model to the app stores array
		this.getApplication()._stores.push( objectName + 'Store' );
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

	}
});