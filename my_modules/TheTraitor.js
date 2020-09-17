const fs = require('fs');

var Discord = require("discord.js");
var client = new Discord.Client();

// Login
client.login("Mzg2MjUzMzIwMDkzNjk2MDAw.D2B8hg.2HYXHP90PmiezLEHixsWp-mM2RY"); // Log the client in with the token

// Need to be included in app.js to get the discoord packahhes and be working.


///////////
// CLASS //
///////////

const { error } = require("console");
const { listenerCount } = require("process");
const { throws } = require("assert");
const { PassThrough } = require('stream');
const { SSL_OP_TLS_BLOCK_PADDING_BUG } = require('constants');

/**
 * Game Class
 */
class Game {
	// Variables
	playersList;
	allActionCards;

	// Constructor
	constructor(users) {
		this.playersList = [];
		if (users != null) {
			users.forEach(user => {
				this.addPlayer(user);
			});
		}
	}

	addPlayer(playeruser) {
		this.playersList.push(new Player(playeruser));
	}

	getPlayer(playerId) {
		if (playerId == null) return;
		for (let i = 0; i < this.playersList.length; i++) {
			if (this.playersList[i].id == playerId) {
				return this.playersList[i];
			}
			
		}
	}

	toStringPlayersName() {
		let message = "";
		this.playersList.forEach(player => {
			message += player.user + " ";
		});
		return message;
	}

	createCards() {
		let nbPlayers = this.playersList.length;
		this.allIdentityCards = [];
		this.allActionCards = [];
		var cards = JSON.parse(fs.readFileSync('./cards.json'));
		let innocentCard;
		let traitorCard;
		cards.identity.forEach(card => {
			if (card.name == "Innocent") innocentCard = card;
			if (card.name == "Traitre") traitorCard = card;
			if (card.name == "Danielo" && nbPlayers < 7) {}
			else this.allIdentityCards.push(card);
		});
		if (nbPlayers > 7) this.allIdentityCards.push(innocentCard);
		if (nbPlayers > 8) this.allIdentityCards.push(traitorCard);
		if (nbPlayers > 9) this.allIdentityCards.push(innocentCard);
		if (nbPlayers > 10) this.allIdentityCards.push(innocentCard);
		if (nbPlayers > 11) this.allIdentityCards.push(traitorCard);

		let nbActionsCardsToAdd = 0;

		if (nbPlayers > 7) nbActionsCardsToAdd++;
		if (nbPlayers > 10) nbActionsCardsToAdd++;

		cards.action.forEach(card => {
			for (let i = 0; i < card.nbCopies + nbActionsCardsToAdd; i++) {
				this.allActionCards.push(card);
			}
		});
	}

	giveIdentitys() {
		shuffle(this.allIdentityCards);
		this.playersList.forEach(player => {
			player.identityCard = this.allIdentityCards.pop();
		});
	}

	giveActions() {
		shuffle(this.allActionCards);
		this.playersList.forEach(player => {
			player.actionCardsList = [];
			for (let i = 0; i < 3; i++) {
				player.actionCardsList.push(this.allActionCards.pop());
			}
		});
	}
}


/**
 * Player Class
 */
class Player {
	// Variables
	id
	user;
	identityCard;
	actionCardsList;

	selectActionsBool = false;

	// Constructor
	constructor(user) {
		if (user == null) new Error("No name found for this player, can't create the player.");
		this.id = user.replace(/[\\<>@#&!]/g, "");
		this.user = user;
	}
}

/**
 * Identity Class
 */
class Identity {
	// Variables
	name;
	description;

	// Constructor
	constructor(name, description) {
		if (name == null) new Error("No name found for this Identity, can't create the Identity.");
		if (description == null) new Error("No description found for this Identity, can't create the Identity.");
		this.name = name;
		this.description = description;
	}
}

/**
 * Identity Class 
 */
class Card {
	// Variables
	name;
	description;

	// Constructor
	constructor(name, description) {
		if (name == null) new Error("No name found for this Card, can't create the Card.");
		if (description == null) new Error("No description found for this Card, can't create the Card.");
		this.name = name;
		this.description = description;
	}
}


/////////////////////
// VARIABLES USED //
/////////////////////

var game = null;


///////////////////////
// UTILITY FUNCTIONS //
///////////////////////

/**
* Shuffle array in place.
* @param {array} array 
*/
function shuffle(array) {
	var j, x, i;
	for (i = array.length - 1; i > 0; i--) {
		j = Math.floor(Math.random() * (i + 1));
		x = array[i];
		array[i] = array[j];
		array[j] = x;
	}
	return array;
}

/**
 * 
 * @param {array} params 
 */
function playersNameToString(playersusers) {
	let stringToReturn = "";
	for (let i = 1; i < playersusers.length; i++) {
		if (i+1 === playersusers.length) stringToReturn = stringToReturn + playersusers[i];
		else stringToReturn = stringToReturn + playersusers[i] + ", ";
	}
	return stringToReturn;
}



//////////////////
// client Launched //
//////////////////

var idMainChannel = "386933751348854806";

client.on("ready", ready => {
	console.log("C'est partie yay"); // This thing gonna run when starting the client on the console
	//channel.send('My Message');
	// Message sur le salon discord.
	var channel = client.channels.get(idMainChannel);
	channel.send("Bip boop");

	//Status
	//client.user.setStatus("Idle"); // It could be Online, idle, invisible or dnd

	// Game and Streaming
	client.user.setGame("Biiip boooop");
});



//////////////////////
// DISCORD COMMANDS //
//////////////////////


client.on("message", message => {

	// Variables
	
	var sender = null;
	if (game != null) sender = game.getPlayer(message.author.id); // The	person who sent the message
	var nsg = message.content.split(" "); // Put each word separated by a space as element of an string array
	var prefix = "!"; // The text before commands, you can set this to what ever you want

	// Creating game without any other argument
	if (nsg[0] === prefix + "CreateGame" && nsg[1] == null && message.channel.type === "text") {
		if (game != null) {
			message.channel.send("There is already a game existing.\n" 
													+ "You can delete it with !ExitGame."); // Message displayed on discord
		} else {
			game = new Game();
			message.channel.send("Game Created, waiting for players to fill in"); // Message displayed on discord
		}
	}

	/*
	// Creating a game with the players and startting the game
	if (nsg[0] === prefix + "CreateGame" && nsg[1] != null) {
		if (game != null) {
			message.channel.send("There is already a game existing.\n" 
													+ "You can delete it with !StopGame."); // Message displayed on discord
		} else {
			game = new Game();
			for (let i = 1; i < nsg.length; i++) {
				game.addPlayer(nsg[i]);
			}
			message.channel.send("Game Created.\n"
			+ "Players in game : " + game.toStringPlayersName() + "\n"
			+ "Waiting for other players to fill in or the game starting.\n"
			+ "You can start the game using !StartGame"); // Message displayed on discord
		}
	}
	*/

	// Adding player to a non-playing game
	if (nsg[0] === prefix + "AddPlayer" && nsg[1] != null && message.channel.type === "text") {
		let playersAddedString = "";
		for (let i = 1; i < nsg.length; i++) {
			game.addPlayer(nsg[i]);
			if (i+1 === nsg.length) message += nsg[i] + "\n";
			else message += nsg[i] + ", ";
		}
		message.channel.send("Players Added : " + playersAddedString + "\n"
		+ "All players in game : " + game.toStringPlayersName()); // Message displayed on discord
	}

	// Adding player to a non-playing game
	if (nsg[0] === prefix + "ExitGame" && nsg[1] == null) {
		game = null;
		message.channel.send("Game Exited."); // Message displayed on discord
	}


	////////////////////////////////////////////////////////////
	// Creating a game with the players and starting the game //
	////////////////////////////////////////////////////////////
	if (nsg[0] === prefix + "CreateGame" && nsg[1] != null && message.channel.type === "text") {
		if (game != null) {
			message.channel.send("There is already a game existing.\n" 
													+ "You can delete it with !StopGame."); // Message displayed on discord
		} else {
			game = new Game();
			for (let i = 1; i < nsg.length; i++) {
				game.addPlayer(nsg[i]);
			}
			message.channel.send("Game Created.\n"
			+ "Players in game : " + game.toStringPlayersName() + "\n"
			+ "Waiting for other players to fill in or the game starting.\n"
			+ "You can start the game using !StartGame"); // Message displayed on discord
		}

		// Game Start
		/*
		if (game.playersList.length < 6) {
			message.channel.send("Not enough player too launch the game. You need at least 6 players."); // Message displayed on discord
		} else if (game.playersList.length > 12) {
			message.channel.send("To many player too launch the game. You need at less than 13 players."); // Message displayed on discord
		} else {
			message.channel.send("Game Started. You should have received your identity and your actions in private message"); // Message displayed on discord
		}
		*/

		game.createCards();

		game.giveIdentitys();
		game.giveActions();

		console.log(game.allActionCards);
		console.log(game.allIdentityCards);
		game.playersList.forEach(player => {
			console.log(player.cardList);
		});

		game.playersList.forEach(player => {
			client.users.get(player.id).send("You are : " + player.identityCard.name + "\n" 
			+ player.identityCard.description  + "\n\n"
			+ "Your cards :\n" 
			+ "01 : " + player.actionCardsList[0].name + "\n" 
			+ player.actionCardsList[0].description + "\n\n"
			+ "02 : " + player.actionCardsList[1].name + "\n" 
			+ player.actionCardsList[1].description + "\n\n"
			+ "03 : " + player.actionCardsList[2].name + "\n" 
			+ player.actionCardsList[2].description + "\n\n"
			+ "Select now 1 action card to discard")
		});

		game.playersList.forEach(player => {
			player.selectActionsBool = true;
		});
	}


	//message.channel.send("You can now debate and vote for someone to be the traitor and be executed."); // Message displayed on discord
	if (nsg[0] === prefix + "SelectAction" && message.channel.type === "dm" && game != null && sender.selectActionsBool == true) {
		nsg[1] = parseInt(nsg[1]);
		if (Number.isInteger(nsg[1]) == true && nsg[1] < 4  && nsg[1] > 0) {
			cardFoundBool = true;
			sender.actionCardsList.splice(nsg[1]-1, 1);
			sender.selectActionsBool = false;
			client.users.get(sender.id).send("Your cards : \n\n" 
			+ "01 : " + sender.actionCardsList[0].name + "\n" 
			+ sender.actionCardsList[0].description + "\n\n"
			+ "02 : " + sender.actionCardsList[1].name + "\n" 
			+ sender.actionCardsList[1].description + "\n\n"
			+ "Waiting for other players...")
		} else client.users.get(sender.id).send("Mettez un nombre entre 1 et 3.");
	}
		
	
});



////////////
// SCRIPT //
////////////



//////////
// TEST //
//////////

//var game = new Game();