Ext.define('RuntimeModeling.view.Main', {
    extend: 'Ext.tab.Panel',
    xtype: 'main',
    requires: [
        'Ext.TitleBar',
        'Ext.Video'
    ],
    config: {

        tabBarPosition: 'bottom',

        items: [
            {
                title: 'Home',
                iconCls: 'home',

                // defaults for items
                styleHtmlContent: true,
                scrollable: true,
                style : 'background-image: url("resources/images/patterns/tileable_wood_texture.png")',

                items: [
                    {
                        docked: 'top',
                        xtype: 'titlebar',
                        title: 'Home'
                    },
                    {
                        xtype: 'HomeContainer'
                    }
                ]
            }
        ]
    }
});
