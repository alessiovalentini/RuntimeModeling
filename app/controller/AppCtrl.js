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

			// triggering token ready => app will generate the models and stores
			$(document).trigger('AccessTokenReady');
		});

		// generating model and stores runtime (once accessTokenReady)
		$(document).on('AccessTokenReady', AppCtrl.defineModelsAndStores( [ 'Account', 'Contact', 'News__c'] ));
	},

	myInit: function() {
		// body...
	},

	launch : function () {
		// generating test record
		var AppCtrl = this;
		var appNamespace = Ext.namespace()[ this.getApplication().name ];
		var app = this.getApplication();
        var store, testRecord;

        $(document).bind("ModelsAndStoresReady", function(){

        	// generate a test record for each model/store created at runtime
            for(var i in app.getModels() ){
            	console.log('> generating a test records for ', app.getModels()[i] );

	            // create a news test record
	            testRecord = Ext.create( app.name +  '.model.' + app.getModels()[i], {

	                // Title__c    : 'testtitle',
	                // CreatedDate : Date.now(),
	                // Id          : 'aX54345345vvccfghdfg'
	            });

	            // add the news to the store (please note the autosync and autoload)
	           	appNamespace.runtimeStores[ app.getModels()[i] ].add( testRecord );
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
		var AppCtrl 	 = this;
		var appNamespace = Ext.namespace()[ this.getApplication().name ];
		var appName 	 = this.getApplication().name;
		var objectName;

		// attach generated storeS instance to the app as an hash for easy access -they will be added in _defineObjectStore()
		appNamespace.runtimeStores = {};

		// iterate through the modelsArray calling salesforce and generating all the models dynamically
		for(var i in modelsArray ){

			// get objects metadata and generate models
			appNamespace.salesforce.client.describe( modelsArray[i],
				function success ( success_response ) {
					objectName = success_response.label

					console.log('> got ' + objectName + ' sobject describe successfully', success_response);

					// generate the model runtime
					AppCtrl._defineObjectModel( objectName, success_response.fields );

					// generate the store as well -define where to save it
					AppCtrl._defineObjectStore( objectName, 'localstorage' );

	            	// generate store instance and save it in the app runtimeStores hash
	            	appNamespace.runtimeStores[ objectName ] = Ext.create( appName + '.store.' + objectName );
				},

				function error( error_response) {
					console.log('> error getting ' + objectName + ' sobject describe', error_response);
				}
			);
		}

		// when all the models are ready trigger that they are
		this.checkModelsAndStoresReadyIntervalId = setInterval(function checkModelsAndStoresReady(){
			// they are ready if the number of registered stores === number of requested models
			if( Object.keys(appNamespace.runtimeStores).length === modelsArray.length ){
				console.log('> all requested sobjects are ready in <appName>.runtimeStores' );
				// trigger the event
				$(document).trigger('ModelsAndStoresReady');
				// stop watch interval
				window.clearInterval( AppCtrl.checkModelsAndStoresReadyIntervalId );
			}
		}, 1000 )

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

		// add the runtime generated model definition name to the app models array
		this.getApplication()._models.push( objectName );
	},

	_defineObjectStore : function( objectName, proxyType ){

		// define the store
		Ext.define( this.getApplication().name + '.store.' + objectName, {		// ex RuntimeModeling.store.NewsStore
			extend: 'Ext.data.Store',

			config: {

				// use an unique id to reference the store [solve warnings and more problems]
				// storeId: this.getApplication().name + '_' + objectName + 'Store',	// ex: RuntimeModeling_NewsStore
				model    : this.getApplication().name + '.model.' + objectName,		// ex: RuntimeModeling.model.News

				autoLoad : true,		// NOTE then it's not necessary to use store.load();
				autoSync : true,		// NOTE then it's not necessary to use store.sync();

		        proxy    :{

		            type : proxyType,
		            id   : this.getApplication().name + '_' + objectName + '_' + proxyType	// ex: RuntimeModeling_News_LocalStorage
		        }
			},

			wipe: function(){
				this.removeAll();	// autosync ons
			}
		});

		// add the runtime generated store definition name to the app stores array
		this.getApplication()._stores.push( objectName );
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