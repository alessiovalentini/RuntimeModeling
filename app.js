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
    ],

    views       : ['Main', 'HomeContainer'],
    controllers : ['AppCtrl'],
    // models      : [],
    // stores      : [],

    launch: function() {
        Ext.Viewport.add(Ext.create('RuntimeModeling.view.Main'));


        // var model = Ext.create('RuntimeModeling.model.News');
        // console.log(model);

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
