//<debug>
Ext.Loader.setPath({
    'Ext': 'touch/src',
    'RuntimeModeling': 'app'
});
//</debug>

Ext.application({
    name: 'RuntimeModeling',

    requires: [
        'Ext.MessageBox',
        'Ext.data.Store',
        'Ext.data.proxy.LocalStorage',
        'Ext.data.proxy.SessionStorage'
    ],

    views       : ['Main', 'HomeContainer'],
    controllers : ['AppCtrl'],
    // models      : ['News'],          // to load objects defined in files
    // stores      : ['NewsStore'],

    launch: function() {
        // cache app
        var app = this;

        $(document).bind("ModelsAndStoresReady", function(){
            console.log('> models and stores are defined');

            var storeInstance, modelInstance;

            // create a news record
            modelInstance = Ext.create( app.name +  '.model.' + 'News', {

                Title__c    : 'testtitle',
                CreatedDate : Date.now(),
                Id          : 'aX54345345vvccfghdfg'
            });

            // create a store to store the news record
            storeInstance = Ext.create( app.name + '.store.' + 'News' + 'Store' );

            // add the news to the store (please note the autosync and autoload)
            storeInstance.add( modelInstance );

        });

        Ext.Viewport.add(Ext.create('RuntimeModeling.view.Main'));
    },

    onUpdated: function() {
        Ext.Msg.confirm(
            "Application Update",
            "This application has just successfully been updated to the latest version. Reload now?",
            function(buttonId) {
                if (buttonId === 'yes') {
                    window.location.reload();
                }
            }
        );
    }
});
