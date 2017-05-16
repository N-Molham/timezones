( function( $, m, undefined ) {
	$( function() {

		var available_zones = moment.tz.names();

		// App init
		var app = new Vue( {
			el: '#timezones',
			data: {
				selected_zones: [],
				datetime: m(),
			},
			computed: {
				// compute [zones] prop when any other property gets updated
				zones: function() {
					var zones = [];

					for ( var index in this.selected_zones ) {
						var zone = this.datetime.tz( this.selected_zones[index] );

						zones.push( {
							index: index,
							name: zone.tz(),
							date: zone.format( 'dddd Do MMMM YYYY' ),
							time: zone.format( 'hh:mm A' ),
						} );
					}

					return zones;
				}
			},
			methods: {
				remove_zone: function( index ) {
					if ( this.selected_zones[index] !== undefined ) {
						// remove zone from list
						this.selected_zones.splice( index, 1 );
					}
				},
			},
			created: function() {
				// default/first zone
				this.selected_zones = [ 'Africa/Cairo' ];
			}
		} );

		// auto-select input content on focus
		$( '#timezones' ).on( 'focus', '.table input', function( e ) {
			e.currentTarget.select();
		} );

		// Dropdown init
		$( '#timezones-dropdown' ).select2( {
			// prepare zones list for Select2 format
			data: [ { id: -1, text: 'Select a timezone' } ].concat( available_zones.map( function( zone, index ) {
				return { id: index, text: zone };
			} ) )
		} )
		// when zone gets selected
		.on( 'change', function( e ) {
			var zone_index = e.currentTarget.value,
				zone_name = available_zones[ zone_index ];
			if ( zone_name !== undefined && app.selected_zones.indexOf( zone_name ) === -1 ) {
				// update app zones list
				app.selected_zones.push( zone_name );
			}
		} );
	} );
} )( jQuery, moment );
