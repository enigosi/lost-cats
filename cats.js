function findCats(lostCatsNum) {

	'use strict';

	// final stations object
	var stations = {};

	// our cats and owners pairs
	var pairs = [];

	// array with all station ids (helper)
	var stationsIds = [];

	// stations blocked by Love
	var blockedStations = [];

	// stats
	var numOfMoventsToFind = [];

	// when is set to 100 000 program is getting slow
	var maxNumOfIterations = 1000;


	// init search
	init();


	////////////////////////
	// load data
	// stations and connections data

	var connectionsData;
	var stationsData;

	var connectionsLoaded;
	var stationsLoaded;

	function init() {

		loadJSON('tfl_connections.json', function(response) {
			 connectionsData = JSON.parse(response);
			 connectionsLoaded = true;
			 if (stationsLoaded) startSearch();
		});
		loadJSON('tfl_stations.json', function(response) {
			 stationsData = JSON.parse(response);
			 stationsLoaded = true;
			 if (connectionsLoaded) startSearch();
		});
	}

	function processData() {

		stationsData.map(function(station) {

			stations[station[0]] = {
				name: station[1],
				connections: getAvlConnections(station[0])
			};

			stationsIds.push(station[0]);
		});
	}

	function getAvlConnections(stationID) {

		var matches = [];

		connectionsData.map(function(connection) {

			if (connection[0] === stationID) {

				matches.push(connection[1]);

			} else if(connection[1] === stationID) {

				matches.push(connection[0]);

			}

		});

		return matches;
	}


	//////////////////////////
	// search for cats

	function startSearch() {

		// process Stations and Connections data to more usable format
		processData();

		// init all owners and cats
		var newCat;
		var newOwner;
		var newPair;

		for (var i = 0; i < lostCatsNum; i++) {

			newCat = new Cat(i);
			newOwner = new Owner(i, newCat.position);

			newPair = {
				cat: newCat,
				owner: newOwner
			};

			pairs.push(newPair);

		}

		runSimulation();

		printFinalStats();

	}

	function runSimulation() {

		var i = 0;

		// all cats are stuck or found
		while (i < maxNumOfIterations && pairs.length > 0) {

			// make next move
			nextIteration(i);

			i++;
		}
	}


	function nextIteration(iteration) {

		var catLastMove;
		var ownerLastMove;

		pairs = pairs.map(function(pair) {

			catLastMove = pair.cat.makeMove();
			ownerLastMove = pair.owner.makeMove();

			if (catLastMove !== false && catLastMove === ownerLastMove) {

				console.log('Owner ' + pair.owner.name + ' found cat ' + pair.cat.name + ' - ' + stations[pair.owner.position].name + ' is now closed');

				numOfMoventsToFind.push(iteration + 1);

				// love is blocking station
				blockedStations.push(pair.owner.position);

				return pairs;
			}
		});

	}


	/////////////////////////////////////////
	// Cat

	function Cat(name) {

		this.position = getRandomStation();
		this.name = name;

	}

	Cat.prototype.makeMove = function() {

		var nextStation;
		var avlConec = filterBlockedStations(stations[this.position].connections);

		if (!avlConec.length) return false;

		nextStation = randomInt(avlConec.length);
		this.position = avlConec[nextStation];
		return this.position;
	};


	/////////////////////////////////////////
	// Owner

	function Owner(name, excludedStation) {

		this.position = getRandomStation(excludedStation);
		this.visitedStations = [];
		this.name = name;

	}

	Owner.prototype.makeMove = function () {

		var nextStation;
		var uniqueAvlConec;
		var avlConec = filterBlockedStations(stations[this.position].connections);

		if (!avlConec.length) return false;

		uniqueAvlConec = this.filterVisitedStations(avlConec);

		if (!uniqueAvlConec.length) uniqueAvlConec = avlConec;

		nextStation = randomInt(uniqueAvlConec.length);
		this.position = uniqueAvlConec[nextStation];
		this.visitedStations.push(this.position);
		return this.position;

	};

	Owner.prototype.filterVisitedStations = function(stations) {

		var that = this;

		function isVisited(stationID) {
			return that.visitedStations.indexOf(stationID) !== -1;
		}

		return stations.filter(isVisited);
	};

	/////////
	// utils

	function filterBlockedStations(stations) {

		function isBlocked(stationID) {
			return blockedStations.indexOf(stationID) === -1;
		}

		return stations.filter(isBlocked);
	}

	function getRandomStation(excludedStation) {

		var station = stationsIds[randomInt(stationsIds.length)];

		if (excludedStation && station === excludedStation) {
			station = getRandomStation(station);
		}

		return station;
	}

	function printFinalStats() {

		console.log('###');

		console.log('Total number of cats: ' + lostCatsNum);

		var numberOfCatsFound = numOfMoventsToFind.length;
		console.log('Number of cats found: ' + numberOfCatsFound);

		var sumNumOfMoves = numOfMoventsToFind.reduce(function(a, b) { return a + b; }, 0);
		var avrgNumOfMoves = sumNumOfMoves / numberOfCatsFound;
		console.log('Average number of movements required to find a cat: ' + avrgNumOfMoves);

	}
}