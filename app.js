(function ( $, m, doc, undefined ) {
	$( function () {
		var available_zones = moment.tz.names();

		// App init
		var app = new Vue( {
			el      : '#timezones',
			data    : {
				selected_zones: [],
				datetime      : m()
			},
			computed: {
				// compute [zones] prop when any other property gets updated
				zones: function () {
					var zones = [];

					for ( var index = 0, len = this.selected_zones.length; index < len; index++ ) {
						var zone = this.selected_zones[ index ];
						if ( 'string' === typeof zone ) {
							zone = this.setup_zone( zone );
						}

						var zone_now = this.datetime.tz( zone.timezone );

						zones.push( {
							name: zone.alias.length ? zone.alias : zone_now.tz(),
							date: zone_now.format( 'dddd Do MMMM YYYY' ),
							time: zone_now.format( 'hh:mm A' )
						} );
					}

					return zones;
				}
			},
			watch   : {
				// when [selected_zones] prop gets changed
				selected_zones: function ( selected_zones ) {
					// save updated value to WebStorage
					store.set( 'selected_zones', selected_zones );
				}
			},
			methods : {
				move_up         : function ( index ) {
					this.swap_zones( index, index - 1 );
				},
				move_down       : function ( index ) {
					this.swap_zones( index, index + 1 );
				},
				swap_zones      : function ( old_index, new_index ) {
					if ( new_index < 0 || new_index > this.selected_zones.length - 1 ) {
						// skip invalid index
						return;
					}

					this.selected_zones[ old_index ] = this.selected_zones.splice( new_index, 1, this.selected_zones[ old_index ] )[ 0 ];
				},
				setup_zone      : function ( zone ) {
					return {
						alias   : '',
						timezone: zone
					};
				},
				update_zone_name: function ( index, e ) {
					if ( this.selected_zones[ index ] !== undefined ) {
						var zone = this.selected_zones[ index ];
						if ( 'string' === typeof zone ) {
							zone = this.setup_zone( zone );
						}

						// update alias
						zone.alias = e.target.value;

						// update prop
						this.selected_zones.splice( index, 1, zone );
					}
				},
				import_list     : function () {
					if ( false === confirm( 'Importing another list will override the current one, are your sure?' ) ) {
						return;
					}

					var self = this;

					// file input element
					var file_input = doc.createElement( 'input' );
					file_input.setAttribute( 'type', 'file' );
					file_input.addEventListener( 'change', function ( e ) {
						if ( e.target.files.length ) {
							var file = e.target.files[ 0 ];
							if ( file.size > 0 && ( '' === file.type || 'text/plain' === file.type ) ) {
								var reader    = new FileReader();
								reader.onload = function ( file_event ) {
									try {
										var file_content = JSON.parse( file_event.target.result );
										if ( file_content ) {
											self.selected_zones = file_content;
										}
									} catch ( ex ) {
										alert( 'Invalid JSON string!' );
									}
								};
								reader.readAsText( file );
							} else {
								alert( 'Please choose plain text file!' );
							}
						}
					} );
					file_input.click();
				},
				export_list     : function () {
					// convert list to json
					var list_json = JSON.stringify( this.selected_zones ),
					    anchor_el = doc.createElement( 'a' );

					// set download content & flag
					anchor_el.setAttribute( 'href', 'data:text/plain;charset=utf-8,' + encodeURIComponent( list_json ) );
					anchor_el.setAttribute( 'download', 'timezones.json' );
					anchor_el.click();

					// clear data
					anchor_el = null;
				},
				update_datetime : function ( type, add, amount ) {
					amount = amount || 1;

					if ( add ) {
						this.datetime.add( amount, type );
					} else {
						this.datetime.subtract( amount, type );
					}

					this.datetime = m( this.datetime.format() );
				},
				remove_zone     : function ( index ) {
					if ( this.selected_zones[ index ] !== undefined && confirm( 'Are you sure?' ) ) {
						// remove zone from list
						this.selected_zones.splice( index, 1 );
					}
				}
			},
			created : function () {
				// load from WebStorage
				var storage = store.get( 'selected_zones' );
				if ( storage === undefined ) {
					storage = [ 'Africa/Cairo' ];
				}

				// default/first zone
				this.selected_zones = storage;
			}
		} );

		// auto-select input content on focus
		$( '#timezones' ).on( 'focus', '.table input.input-auto-select', function ( e ) {
			e.currentTarget.select();
		} );

		// Dropdown init
		$( '#timezones-dropdown' ).select2( {
			// prepare zones list for Select2 format
			data: [ {
				id  : -1,
				text: 'Select a timezone'
			} ].concat( available_zones.map( function ( zone, index ) {
				return {
					id  : index,
					text: zone
				};
			} ) )
		} )
		// when zone gets selected
		.on( 'change', function ( e ) {
			var zone_index = e.currentTarget.value,
			    zone_name  = available_zones[ zone_index ];
			if ( zone_name !== undefined && app.selected_zones.indexOf( zone_name ) === -1 ) {
				// update app zones list
				app.selected_zones.push( app.setup_zone( zone_name ) );
			}
		} );
	} );
})( jQuery, moment, document );
