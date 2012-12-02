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
