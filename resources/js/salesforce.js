//////////////////////////////////////////////////////////////////////////////////////////////////////////
//	object definition and initialization
//////////////////////////////////////////////////////////////////////////////////////////////////////////

function salesforce( app_type, env ){

	if( env === 'sandbox' ){

		this.app_type      = app_type;

		this.login_url 	   = "https://test.salesforce.com/";
		this.client_id     = "3MVG9rFJvQRVOvk45VP3Fsi93do3Bi9ZcxKx33hA.L.mX_Kq9fsz81Rek4Y094mLjhLVjptJpakO_aENGuCoH";

		this.refresh_token = "5Aep861.EkZJuT7_lvjXyNCNwLYzGbIyM54.xUiNb6C.t7BMrVFjn3ggvGfsBVo25wOh.v.HkPZcw==";

	}else if( env === 'production' ){

		this.app_type      = app_type;

		this.login_url 	   = "https://login.salesforce.com/";
		this.client_id     = "3MVG9rFJvQRVOvk45VP3Fsi93do3Bi9ZcxKx33hA.L.mX_Kq9fsz81Rek4Y094mLjhLVjptJpakO_aENGuCoH";

		this.refresh_token = "5Aep861.EkZJuT7_lvjXyNCNwLYzGbIyM54.xUiNb6C.t7BMrVFjn3ggvGfsBVo25wOh.v.HkPZcw==";
	}

	this.proxy_url     = "http://localhost:8888/proxy/proxy.php?mode=native";    // osx

	// initialization - get a force tk client and set it up accordingly to the app type
	this.client 	   = this._getClient( app_type );

	this.apiVersion    = 'v26.0';

	// whether or not the access_token is fresh
	this.refreshed 	   = false;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////
//	object methods
//////////////////////////////////////////////////////////////////////////////////////////////////////////

salesforce.prototype.refreshAccessToken = function( callback, error ){
	var salesforce = this;

	salesforce.client.refreshAccessToken(function(success_response){
	    console.log('> success_token', success_response);

	    salesforce.client.setSessionToken(success_response['access_token'], salesforce.apiVersion, success_response['instance_url']);

	    // token is now fresh and ready to be used
	    salesforce.refreshed = true;

	    // runt the passed function
	    callback.call( salesforce.client );

	},function(error_response){
	    console.log('> error_token', error_response);
	});
}



//////////////////////////////////////////////////////////////////////////////////////////////////////////
//	object service methods
//////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * return a new forcetk client object set up with salesforce connection parameters chosen by the user
 */

salesforce.prototype._getClient = function(app_type){

	if( this.client === undefined ){

		// instanciate a new forcetk client
		if( app_type === 'web_app' ){
			// a web app needs to use a proxy.php
			this.client = new forcetk.Client(this.client_id, this.login_url, this.proxy_url);
		}
		else if( app_type === 'mobile_app' ){
			// a mobile app doesn't need to use a proxy.php
			this.client = new forcetk.Client(this.client_id, this.login_url);
		}

        this.client.setRefreshToken(this.refresh_token);
	}
	return this.client;
};