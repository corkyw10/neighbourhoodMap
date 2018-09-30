//Default locations on map
var locations = [
	{
		title: 'Wales Millennium Centre', 
		location: {
			lat: 51.4648421, 
			lng: -3.163183
		}, 
		placeID: 'ChIJ0UmZ-zYDbkgRxoXaGGUhG7I', 
		fsID: '4b49b54ff964a520b77226e3'
	},
	{
		title: 'National Museum Cardiff', 
		location: {
			lat: 51.48557659999999, 
			lng: -3.1771279
		}, 
		placeID: 'ChIJy34izLscbkgRjrmqq9ULIxA', 
		fsID: '4b5b2625f964a52094e628e3'
	},
	{
		title: 'Barkers Tea Rooms',
		location: {
		 	lat: 51.4806164, 
		 	lng: -3.1795395
		}, 
		placeID: 'ChIJkbgnW7AcbkgRP5G2ZXdlnpM', 
		fsID: '52b572af11d22f8479a51d1d'
	},
	{
		title: 'Hopbunker', 
		location: {
			lat: 51.4819021, 
			lng: -3.1790081
		}, 
		placeID: 'ChIJt0bRfLAcbkgRpeF2eBwB28s', 
		fsID: '557ac40f498ec3ab9948fd7a'
	},
	{
		title: 'St David\'s Hall', 
		location: {
			lat: 51.4802476, 
			lng: -3.1765908
		}, 
		placeID: 'ChIJdR--y7AcbkgRvWsCrDbK05c', 
		fsID: '4b7d3303f964a52066b22fe3'
	},
	{
		title: 'Porters', 
		location: {
			lat: 51.47792099999999, 
			lng: -3.172044
		}, 
		placeID: 'ChIJTUeFfbYcbkgRb7dD_V2TPYU', 
		fsID: '509299a5e4b054e683cf2a9c'
	},
	{
		title: 'New Theatre', 
		location: {
			lat: 51.48361620000001, 
			lng: -3.1754451
		}, 
		placeID: 'ChIJx4fd8LkcbkgREx7CY1P35XE', 
		fsID: '4b5b46cbf964a520b6f028e3'
	},
	{
		title: 'Tiny Rebel', 
		location: {
			lat: 51.4799453, 
			lng: -3.1810969
		}, 
		placeID: 'ChIJr3LQLLAcbkgRW0g1kZi44gg', 
		fsID: '5229e7dd049331b94a75425f'
	}
];

var viewModel = function() {
	var self = this;

	// Observable to determine if navigation is open or closed.
	self.isOpen = ko.observable(true);
	self.toggleNav = function() {
		// Opens and closes navigation and keeps map full
		self.isOpen(!self.isOpen());
	},


	self.map;
	self.markers = ko.observableArray([]);
	self.list_item = ko.observable();

	// Gives google place information and infowindow global scope so it can be accessed by list links
	self.largeInfowindow;
	self.service;

	self.initMap = function() {
		// Initialises Google Map and centres on Cardiff City
		map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 51.48158100000001, lng: -3.17909},
		zoom: 13
		});

		locations.forEach(function(item, index) {
			// Creates marker on map for each location and adds to marker array
			var marker = new google.maps.Marker({
				position: item.location,
				title: item.title,
				icon: 'img/marker32.png',
				animation: google.maps.Animation.DROP,
				map: map,
				placeID: item.placeID,
				fsID: item.fsID,
				});

			self.markers.push(marker);

			marker.addListener('click', function() {
				// Opens and populates infowindow when marker is clicked. Centers to marker on map.
        		populateInfoWindow(this, largeInfowindow);
        		map.panTo(marker.position);
        		map.setZoom(17);
      		});

			marker.addListener('mouseover', function() {
				// Marker bounces when mouse hovers over it.
				this.setAnimation(google.maps.Animation.BOUNCE);
			});

			marker.addListener('mouseout', function() {
				this.setAnimation(null);
			});

		});


		largeInfowindow = new google.maps.InfoWindow();
		

		self.populateInfoWindow = function(marker, infowindow) {
			// Populates infowindow with name, image, opening hours and website url
			// using foursquare and google place service images.
			service = new google.maps.places.PlacesService(map);
			var img_url = '';
			service.getDetails({
				placeId: marker.placeID,
				fields: ['photos']
			}, function(place, status) {
				if (status === google.maps.places.PlacesServiceStatus.OK) {
					if (place.photos) {
						img_url += '<br><img src="' + place.photos[0].getUrl(
							{maxHeight: 100, maxWidth: 200}) + '">';
					}
				}
			}),
			$.ajax({
				// AJAX call to foursquare API
				url: 'https://api.foursquare.com/v2/venues/' + marker.fsID,
				data: {
					v: 20180930,
					client_id: 'UPFB1WNAK1R53LLLYEGE5UFAGNWRYZOU2JK430XS41BJVKDF',
					client_secret: 'STSHXZBILVN5XT4BECKG0ZMCWK32UZQ04TJJBSBQTHMO00VH'
				},
				dataType: 'jsonp',
				success: function(data) {
					// Populates infowindow
					var website = data.response.venue.url;
					var rating = data.response.venue.rating;
					var opening_hours = data.response.venue.popular.timeframes;
					if (infowindow.marker != marker) {
						infowindow.marker = marker;
						var innerHTML = '<div><p><strong>' + marker.title + '</strong></p>';
						if (img_url) {
							innerHTML += img_url;
						}
						if (opening_hours) {
							innerHTML += '<br><br><div class="hours"><strong>Hours:</strong><br><br>'
							for (var i = 0; i < opening_hours.length; i ++) {
								innerHTML += opening_hours[i].days + ' ';
								for (var j=0; j<opening_hours[i].open.length; j++) {
									innerHTML += opening_hours[i].open[j].renderedTime + ' ';
								}
								innerHTML += '<br>';
							}
						}
						if (website) {
							innerHTML += '<br><br><a class="info-link" target="_blank" href="' + website + '">' + 'Go to website</a>';
						}
						if (rating) {
							innerHTML += '<br><br>Foursquare Rating: ' + rating + '/10<br>';
						}						
	          			innerHTML += '</div>';
				
					infowindow.setContent(innerHTML);
					}
				},
				error: function(data) {
					infowindow.setContent('<p>Unable to load venue information from Foursquare. Please see console');
				}
			});
			infowindow.addListener('closeclick', function() {
				infowindow.marker = null;
			});
		infowindow.open(map, marker);
		};
		
	};


	self.animate = function(item, event) {
		// Marker bounces when hovering over corresponding link
		var item_title = item.title;
		self.markers().forEach(function(marker, index) {
			if (marker.title === item_title) {
				marker.setAnimation(google.maps.Animation.BOUNCE);
			};
		});
	},

	self.stopAnimation = function(item, event) {
		// Stops marker animation when no longer hovering over link
		var item_title = item.title;
		self.markers().forEach(function(marker, index) {
			if (marker.title === item_title) {
				marker.setAnimation(null);
			};
		});
	},

	self.populateInfoWindowViaLink = function(item, event) {
		// Centres and opens infowindow on marker when corresponding link is clicked.
		var item_title = item.title;
		self.markers().forEach(function(marker, index) {
			if (marker.title === item_title) {				
				populateInfoWindow(marker, largeInfowindow);
				marker.setMap(map);
				map.panTo(marker.position);
				map.setZoom(17);
			};
		});
	},

	// ______ Filter functions ______

	// Observable for input to filter text box
	self.filter = ko.observable("");

	self.applyFilter = function() {
		// Filters markers visibility
		self.markers().forEach(function(marker, index) {
			if (marker.title.toLowerCase().includes(filter().toLowerCase())) {
				marker.setMap(map);
			}
			if (!marker.title.toLowerCase().includes(filter().toLowerCase())) {
				marker.setMap(null);
			}
			if (filter.text === "") {
				marker.setMap(map);
			}
		});
	},

	self.resetFilter = function() {
		// Resets all markers and list to default and 
		self.markers().forEach(function(marker, index) {
			marker.setMap(map);
		});
		self.filter('');
	},

	self.list = ko.computed(function() {
		// Filters list view
	    if (!self.filter()) {
	      return self.markers();
	    } else {
	      return self.markers()
	        .filter(marker => marker.title.toLowerCase().includes(filter().toLowerCase()));
	    }
	  });


	// ____ AJAX call to OpenWeatherMap_____

	self.weather = ko.observable();
	$.ajax( {
		// Connects to and loads OpenWeatherMap API
		url: 'https://api.openweathermap.org/data/2.5/weather?',
		data: {
			id: '2653822',
			APPID: '676372e2847444698a8950ce6cdd10d3',
			units: 'metric',
		},
		dataType: 'jsonp',
		success: function(data) {
			// Displays temperature and weather conditions for Cardiff city
			var temp = data.main.temp;
			var weather_conditions = data.weather[0].main;
			if (weather_conditions == 'Clouds') {
				weather_conditions = 'cloudy';
			} else if (data.weather[0].main === 'Rain') {
				weather_conditions = 'like rain';
			}
			self.weather('<p id="temp">It\s looking ' + weather_conditions.toLowerCase() + ' in Cardiff today and the temperature is ' + temp.toFixed(1) + '°C</p>');
		},
		statusCode: {
			404: function() {
				self.weather('<p>Couldn\'t connect to OpenWeatherMap. URL not recogised</p>')
			},
			429: function() {
				self.weather('<p>Request limit exceeded</p>')
			}
		},

	});	
}

ko.applyBindings(viewModel);
