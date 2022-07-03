/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * phobycatcafe implementation : © <Julien Coignet> <breddabasse@hotmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * phobycatcafe.js
 *
 * phobycatcafe user interface script
 * 
 * In this file, you are describing the logic of your user interface, in Javascript language.
 *
 */

define([
    "dojo","dojo/_base/declare", "dojo/query", "dojo/aspect", "dojo/dom", "dojo/_base/connect",
    "ebg/core/gamegui",
    "ebg/counter"
],
function (dojo, declare) {
    return declare("bgagame.phobycatcafe", ebg.core.gamegui, {
        constructor: function(){
            console.log('phobycatcafe constructor');
              
            // Here, you can init the global variables of your user interface
            // Example:
            // this.myGlobalValue = 0;

        },
        
        /*
            setup:
            
            This method must set up the game user interface according to current game situation specified
            in parameters.
            
            The method is called each time the game interface is displayed to a player, ie:
            _ when the game starts
            _ when a player refreshes the game page (F5)
            
            "gamedatas" argument contains all datas retrieved by your "getAllDatas" PHP method.
        */
        
        setup: function( gamedatas )
        {
            console.log( "$$$ Starting game setup" );

            console.log( gamedatas );
            
            this.connections = [];

            // Constants
            this.gameConstants = gamedatas.constants;

            // Setting up player boards
            for( var player_id in gamedatas.players )
            {
                var player = gamedatas.players[player_id];
                         
                // TODO: Setting up players boards if needed
                dojo.place( this.format_block('jstpl_player_board', {
                    player:player_id,

                } ), $ ( 'ctc_game_area' ) );

                dojo.place( this.format_block('jstpl_player_name', {
                    player:player_id,
                } ), $ ( 'player_board_' + player_id) );

                this.slideToObjectPos( $('player_name_'+player_id), $('player_board_'+player_id), 230, 5, 10 ).play();
                $('player_name_'+player_id).innerHTML = gamedatas.players[player_id].name
                dojo.style( 'player_name_'+player_id, 'color', '#'+gamedatas.players[player_id].color );

                // Setup squares
                // for( var id in gamedatas.squarespositions )
                // {
                //     var squaresposition = gamedatas.squarespositions[id];

                //     // console.log( squaresposition );

                //     dojo.place( this.format_block('jstpl_square', {
                //         value:0,
                //         x:squaresposition.x,
                //         y:squaresposition.y,
                //         player:player_id,
                //     } ), $ ( 'player_board_' + player_id) );

                //     this.slideToObjectPos( $('square_'+player_id+'_'+squaresposition.x+'_'+squaresposition.y), $('player_board_'+player_id), this.getXPixelCoordinates(squaresposition.x), this.getYPixelCoordinates(squaresposition.y, squaresposition.x), 10 ).play();
                // }

                for( var id in gamedatas.drawings[player_id] )
                {
                    var square = gamedatas.drawings[player_id][id];

                    // console.log( squaresposition );

                    dojo.place( this.format_block('jstpl_square', {
                        value:0,
                        x:square.x,
                        y:square.y,
                        player:player_id,
                        shape:square.shape,
                    } ), $ ( 'player_board_' + player_id) );

                    this.slideToObjectPos( $('square_'+player_id+'_'+square.x+'_'+square.y), $('player_board_'+player_id), this.getXPixelCoordinates(square.x), this.getYPixelCoordinates(square.y, square.x), 10 ).play();
                    if (square.shape > 0) {
                        dojo.removeClass('square_'+player_id+'_'+square.x+'_'+square.y, 'ctc_square_0');
                        dojo.addClass('square_'+player_id+'_'+square.x+'_'+square.y, 'ctc_square_'+square.shape);
                    }
                }

                // Column sub scoring
                for (let i=0; i<5; i++) {
                    dojo.place( this.format_block('jstpl_column_scoring', {
                        player_id:player_id,
                        id1:i,
                        id2:0,
                    } ), $ ( 'player_board_' + player_id) );
                    this.slideToObjectPos( $('sub_scoring_'+player_id+'_'+i+'_0'), $('player_board_'+player_id), this.getXPixelCoordinatesSubScoringColumn(i), this.getYPixelCoordinatesSubScoringColumn(i), 10 ).play();
                    
                    dojo.place( this.format_block('jstpl_column_scoring', {
                        player_id:player_id,
                        id1:i,
                        id2:1,
                    } ), $ ( 'player_board_' + player_id) );
                    this.slideToObjectPos( $('sub_scoring_'+player_id+'_'+i+'_1'), $('player_board_'+player_id), this.getXPixelCoordinatesSubScoringColumn(i) + 17, this.getYPixelCoordinatesSubScoringColumn(i), 10 ).play();
                }

                // player dice
                for (let i=0; i<2; i++) {
                    dojo.place( this.format_block('jstpl_dice_player', {
                        dice_face:0,
                        player_id:player_id,
                        id:i,
                    } ), $ ( 'player_board_' + player_id) );
                }
                this.slideToObjectPos( $('dice_player_'+player_id+'_0'), $('player_board_'+player_id), 52, 7, 10 ).play();
                this.slideToObjectPos( $('dice_player_'+player_id+'_1'), $('player_board_'+player_id), 92, 7, 10 ).play();

                // Shapes selection
                for (let i=1; i<7; i++) {
                    dojo.place( this.format_block('jstpl_shape_selection', {
                        player_id:player_id,
                        shape_id:i,
                    } ), $ ( 'player_board_' + player_id) );

                    this.slideToObjectPos( $('shape_selection_'+player_id+'_'+i), $('player_board_'+player_id), this.getXPixelCoordinatesShapeSelection(i), this.gameConstants['SHAPE_SELECTION_Y_ORIGIN'], 10 ).play();
                }

                // Cat footprints
                let available = parseInt(gamedatas.players[player_id]["footprint_available"], 10);
                let used = parseInt(gamedatas.players[player_id]["footprint_used"], 10);

                for (let i=0; i<used; i++) {
                    dojo.place( this.format_block('jstpl_cat_footprint', {
                        player_id:player_id,
                        id:i,
                        state:2,
                    } ), $ ( 'player_board_' + player_id) );

                    this.slideToObjectPos( $('cat_footprint_'+player_id+'_'+i), $('player_board_'+player_id), this.getXPixelCoordinatesFootprints(i), this.getYPixelCoordinatesFootprints(i), 10 ).play();
                }
                console.log('available : '+available);
                for (let i=used; i<used+available; i++) {
                    dojo.place( this.format_block('jstpl_cat_footprint', {
                        player_id:player_id,
                        id:i,
                        state:1,
                    } ), $ ( 'player_board_' + player_id) );

                    this.slideToObjectPos( $('cat_footprint_'+player_id+'_'+i), $('player_board_'+player_id), this.getXPixelCoordinatesFootprints(i), this.getYPixelCoordinatesFootprints(i), 10 ).play();
                }
                for (let i=available + used; i<18; i++) {
                    dojo.place( this.format_block('jstpl_cat_footprint', {
                        player_id:player_id,
                        id:i,
                        state:0,
                    } ), $ ( 'player_board_' + player_id) );

                    this.slideToObjectPos( $('cat_footprint_'+player_id+'_'+i), $('player_board_'+player_id), this.getXPixelCoordinatesFootprints(i), this.getYPixelCoordinatesFootprints(i), 10 ).play();
                }

                // Cat selection
                for ( let i=1; i<=6; i++ ) {
                    dojo.place( this.format_block('jstpl_cat_selection', {
                        player_id:player_id,
                        id:i,
                    } ), $ ( 'player_board_' + player_id) );

                    this.slideToObjectPos( $('cat_selection_'+player_id+'_'+i), $('player_board_'+player_id), this.getXPixelCoordinatesCatSelection(i - 1), this.getYPixelCoordinatesCatSelection(i), 10 ).play();
                }

                // Sub scoring
                for ( let i=1; i<=6; i++ ) {
                    dojo.place( this.format_block('jstpl_sub_scoring', {
                        player_id:player_id,
                        id:i,
                    } ), $ ( 'player_board_' + player_id) );

                    this.slideToObjectPos( $('sub_scoring_'+player_id+'_'+i), $('player_board_'+player_id), this.getXPixelCoordinatesSubScoring(i - 1), this.getYPixelCoordinatesSubScoring(i), 10 ).play();
                }
            }
            
            // TODO: Set up your game interface here, according to "gamedatas"
            // rolled dices
            this.setupDices( gamedatas );

            dices = gamedatas.dices;

            // console.log( "dices :");
            // console.log( dices );

            // for (var id in dices) {
            //     let elmt_id = 'dice_'+dices[id].id+'_'+dices[id].dice_value;
            //     let elmt = $(elmt_id);
            //     //dojo.addClass(elmt, 'ctc_square_selectionnable');

            //     if( this.isCurrentPlayerActive() ) {
            //         this.connections.push( dojo.connect( elmt , 'click', () => this.onClickDice(elmt_id) ) );
            //     }
            // }

            // console.log( "Connections :" );
            // console.log( this.connections );

            // picked dices
            let nb_total_dice = 0;
            let nb_selected_dice = 0;
            let remaining_dice_val = -1;
            for (var id in dices) {
                nb_total_dice++;

                if (dices[id].player_id !== null) {
                    nb_selected_dice++;

                    dojo.removeClass( 'dice_player_' + dices[id].player_id + '_0', 'ctc_dice_0' );
                    dojo.addClass( 'dice_player_' + dices[id].player_id + '_0', 'ctc_dice_' + dices[id].dice_value );
                } else {
                    remaining_dice_val = dices[id].dice_value;
                }
            }

            // Everybody has chosen his dice. The one remaining is available for everybody.
            if ((nb_total_dice - nb_selected_dice) == 1) {
                for( var player_id in gamedatas.players )
                {
                    dojo.removeClass( 'dice_player_' + player_id + '_1', 'ctc_dice_0' );
                    dojo.addClass( 'dice_player_' + player_id + '_1', 'ctc_dice_' + remaining_dice_val );
                }
            }

            // let nb_total_dice = 0;
            // let nb_selected_dice = 0;
            // let remaining_dice_val = -1;
            // for( var id in gamedatas.dices )
            // {
            //     nb_total_dice++;

            //     var dice = gamedatas.dices[id];

            //     console.log( dice );

            //     if (dice.dice_value !== null) {
            //         if (dice.player_id === null) {
            //             remaining_dice_val = dice.dice_value;
            //             console.log( "face : " + dice.dice_value );
            //             dojo.place( this.format_block('jstpl_dice', {
            //                 dice_face:dice.dice_value,
            //                 id:id,
            //                 dice:dice.dice_value,
            //             } ), $ ( 'ctc_dice_area' ) );
            //         } else {
            //             // dojo.place( this.format_block('jstpl_dice', {
            //             //     dice_face:0,
            //             //     id:id,
            //             //     dice:dice.dice_value,
            //             // } ), $ ( 'ctc_dice_area' ) );

            //             nb_selected_dice++;
            //             dojo.removeClass( 'dice_player_' + dice.player_id + '_0', 'ctc_dice_0' );
            //             dojo.addClass( 'dice_player_' + dice.player_id + '_0', 'ctc_dice_' + dice.dice_value );
            //         }
            //     }
            // }

            // Everybody has chosen his dice. The one remaining is available for everybody.
            // if ((nb_total_dice - nb_selected_dice) == 1) {
            //     for( var player_id in gamedatas.players )
            //     {
            //         dojo.removeClass( 'dice_player_' + player_id + '_1', 'ctc_dice_0' );
            //         dojo.addClass( 'dice_player_' + player_id + '_1', 'ctc_dice_' + remaining_dice_val );
            //     }
            // }

            // Add events on active elements (the third parameter is the method that will be called when the event defined by the second parameter happens - this method must be declared beforehand)
            // this.addEventToClass( "ctc_dice_pickable", "onclick", "onClickDice");

            // this.addEventToClass( "ctc_dice_player", "onclick", "onClickPlayerDice");

            // Setup game notifications to handle (see "setupNotifications" method below)
            this.setupNotifications();

            console.log( "Ending game setup" );
        },
       

        ///////////////////////////////////////////////////
        //// Game & client states
        
        // onEnteringState: this method is called each time we are entering into a new game state.
        //                  You can use this method to perform some user interface changes at this moment.
        //
        onEnteringState: function( stateName, args )
        {
            console.log( 'Entering state: '+stateName );
            
            switch( stateName )
            {
            
            /* Example:
            
            case 'myGameState':
            
                // Show some HTML block at this game state
                dojo.style( 'my_html_block_id', 'display', 'block' );
                
                break;
           */
                case 'rollDices':
                    break;

                case 'setupDices':
                    this.setupDices( args.args );
                    break;

                case 'playerTurnPicking':
                    if( this.isCurrentPlayerActive() ) {
                        dices = args.args.dices;
                        console.log( "dices :" );
                        console.log( dices );
                        for (var id in dices) {
                            if (dices[id].player_id == null) {
                                let elmt_id = 'dice_'+dices[id].id+'_'+dices[id].dice_value;
                                let elmt = $(elmt_id);
    
                                this.connections.push( dojo.connect( elmt , 'click', () => this.onClickDice(elmt_id) ) );
    
                                console.log( "elmt_id :" + elmt_id );
                            }
                        }
                    }

                    console.log( "Connections :" );
                    console.log( this.connections );
                    break;

                case 'setupDrawing':
                    // this.addEventToClass( "ctc_dice_player", "onclick", "onClickPlayerDice");
                    
                    break;

                // Choose dice for location
                case 'playerTurnDrawingPhase1':
                    //this.updatePossibleDrawings( args.args.possibleDrawings );
                    this.updatePlayerSecondDice( args.args );
                    // this.addEventToClass( "ctc_dice_player", "onclick", "onClickPlayerDice");

                    var player_id = this.getActivePlayerId();
                    if( this.isCurrentPlayerActive() ) {
                        for (let i=0; i<2; i++) {
                            let elmt_id = 'dice_player_'+player_id+'_'+i;
                            let elmt = $(elmt_id);

                            // this.connections.push( dojo.connect( elmt , 'click', (evt) => this.onClickPlayerDice(evt) ) );
                            this.connections.push( dojo.connect( elmt , 'click', () => this.onClickPlayerDice(elmt_id) ) );
                        }
                    }

                    break;

                // Choose location for drawing
                case 'playerTurnDrawingPhase2':
                    // this.updatePlayerBoardForLocationChoice( args.args );
                    this.updatePlayerBoardForLocationChoice( args.args );
                    // this.addEventToClass( "ctc_square_selectionnable", "onclick", "onClickSquare");
                    // var elements = document.querySelectorAll(".ctc_square_selectionnable");
                    // for (var i = 0; i < elements.length; i++) {
                    //     elements[i].addEventListener("click", (evt) => this.onClickSquare(evt));
                    // }
                    // dojo.query( '.ctc_square_selectionnable' ).connect( 'click', this, 'onClickSquare' );
                    if( this.isCurrentPlayerActive() ) {
                        //this.activateSquares( args.args.squares )

                        let possibleLocations = args.args.possibleLocations;

                        let player_id = this.getActivePlayerId();

                        for (var id in possibleLocations[player_id]) {
                            let x = possibleLocations[player_id][id].x;
                            let y = possibleLocations[player_id][id].y;
                            //dojo.removeClass($('dice_player_'+id+'_1'), 'ctc_dice_0');

                            let elmt = $('square_'+player_id+'_'+x+'_'+y);
                            //dojo.addClass(elmt, 'ctc_square_selectionnable');

                            this.connections.push( dojo.connect( elmt , 'click', () => this.onClickSquare('square_'+player_id+'_'+x+'_'+y) ) );
                        }
                    }
                    break;

                case 'playerTurnDrawingPhase3':
                    this.updatePlayerBoardForShapeSelection( args.args );
                    // this.addEventToClass("ctc_shape_selectionnable", "onclick", "onClickShape");
                    // var elements = document.querySelectorAll(".ctc_shape_selectionnable");
                    // for (var i = 0; i < elements.length; i++) {
                    //     elements[i].addEventListener("click", (evt) => this.onClickShape(evt));
                    // }
                    
                    // dojo.query( '.ctc_shape_selectionnable' ).connect( 'click', this, 'onClickShape' );

                    console.log("args.args :");
                    console.log(args.args);

                    player_id = args.args.player_id; 
                    let min_shape = args.args.min_shape;
                    let max_shape = args.args.max_shape;

                    for (var i=min_shape; i<=max_shape; i++) {
                        let elmt_id = 'shape_selection_'+player_id+'_'+i;
                        let elmt = $(elmt_id);

                        console.log('------> elmt_id : ' + elmt_id);
                        this.connections.push( dojo.connect( elmt , 'click', () => this.onClickShape(elmt_id) ) );

                        //dojo.addClass($('shape_selection_'+player_id+'_'+i), 'ctc_shape_selectionnable');
                    }

                    break;

                case 'playerTurnCatSelection':
                    this.updatePlayerBoardForCatSelection( args.args );
                    // this.addEventToClass("ctc_cat_selectionnable", "onclick", "onClickCat");
                    // var elements = document.querySelectorAll(".ctc_cat_selectionnable");
                    // for (var i = 0; i < elements.length; i++) {
                    //     elements[i].addEventListener("click", (evt) => this.onClickCat(evt));
                    // }
                    // dojo.query( '.ctc_cat_selectionnable' ).connect( 'click', this, 'onClickCat' );

                    player_id = args.args.player_id;

                    if( this.isCurrentPlayerActive() ) {
                        for ( var id in args.args.score_cat ) {
                            if ( args.args.score_cat[id] == 0 ) {
                                let elmt_id = 'cat_selection_' + player_id + '_'+ (parseInt(id) + 1);
                                let elmt = $(elmt_id);

                                this.connections.push( dojo.connect( elmt , 'click', () => this.onClickCat(elmt_id) ) );
                            }
                        }
                    }

                    break;

                case 'cleanBoardForNextRound':
                    this.cleanBoardForNextRound( args.args );
                    break;

                case 'setupNewRound':
                    this.setupNewRound( args.args );
                    break;

                case 'dummmy':
                    break;
            }
        },

        // onLeavingState: this method is called each time we are leaving a game state.
        //                 You can use this method to perform some user interface changes at this moment.
        //
        onLeavingState: function( stateName )
        {
            console.log( 'Leaving state: '+stateName );
            
            switch( stateName )
            {
            
            /* Example:
            
            case 'myGameState':
            
                // Hide the HTML block we are displaying only during this game state
                dojo.style( 'my_html_block_id', 'display', 'none' );
                
                break;
           */
            case 'rollDices':
                
                break;

            case 'setupDices':
                // this.desableConnections();
                break;

            case 'playerTurnPicking':
                // this.removeEventFromClass( "ctc_dice_pickable", "onclick", "onClickDice" );
                dojo.forEach(this.connections, dojo.disconnect);
                this.connections = [];
                break;

            case 'playerTurnDrawingPhase1':
                dojo.forEach(this.connections, dojo.disconnect);
                this.connections = [];
                break;

            case 'playerTurnDrawingPhase2':
                var player_id = this.getActivePlayerId();
                for (let i=0; i<5; i++) {
                    for (let j=0; j<6; j++) {
                        var elmt = dojo.byId('square_'+player_id+'_'+i+'_'+j);
                        if (elmt != null) {
                            dojo.removeClass('square_'+player_id+'_'+i+'_'+j, 'ctc_square_selectionnable');
                        }
                    }
                }

                dojo.forEach(this.connections, dojo.disconnect);
                this.connections = []; 

                break;

            case 'playerTurnDrawingPhase3':
                // var elements = document.querySelectorAll(".ctc_shape_selectionnable");
                // for (var i = 0; i < elements.length; i++) {
                //     elements[i].removeEventListener("click", "onClickShape");
                // }

                // dojo.query('.ctc_shape_selectionnable').forEach((node) => {
                //     this.disconnect(node, 'click'); // here we remove the eventListener with dojo
                // });

                dojo.forEach(this.connections, dojo.disconnect);
                this.connections = [];

                playersBasicInfos = this.gamedatas.gamestate.args.playersBasicInfos;
                for ( var player_id in playersBasicInfos ) {
                    for (let i=1; i<=6; i++) {
                        dojo.removeClass('shape_selection_'+player_id+'_'+i, 'ctc_shape_selectionnable');
                    }
                }

                break;

            case 'playerTurnCatSelection':
                // var elements = document.querySelectorAll(".ctc_cat_selectionnable");
                // for (var i = 0; i < elements.length; i++) {
                //     elements[i].removeEventListener("click", "onClickCat");
                // }
                // dojo.query('.ctc_cat_selectionnable').forEach((node) => {
                //     this.disconnect(node, 'click'); // here we remove the eventListener with dojo
                // });

                dojo.forEach(this.connections, dojo.disconnect);
                this.connections = [];

                playersBasicInfos = this.gamedatas.gamestate.args.playersBasicInfos;
                for ( var player_id in playersBasicInfos ) {
                    for (var i=1; i<=6; i++) {
                        // let shape_elmt_id = 'shape_selection_'+player_id+'_'+i;
                        // dojo.removeClass(shape_elmt_id, 'ctc_shape_selectionnable');
                        let cat_elmt_id = 'cat_selection_'+player_id+'_'+i;
                        dojo.removeClass(cat_elmt_id, 'ctc_cat_selectionnable');
                    }
                }

                break;

            case 'dummmy':
                break;
            }               
        }, 

        // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
        //                        action status bar (ie: the HTML links in the status bar).
        //        
        onUpdateActionButtons: function( stateName, args )
        {
            console.log( 'onUpdateActionButtons: '+stateName );
            // console.log( '****************' );
            // console.log( args );
            // console.log( '****************' );
                      
            if( this.isCurrentPlayerActive() )
            {            
                switch( stateName )
                {
/*               
                 Example:
 
                 case 'myGameState':
                    
                    // Add 3 action buttons in the action status bar:
                    
                    this.addActionButton( 'button_1_id', _('Button 1 label'), 'onMyMethodToCall1' ); 
                    this.addActionButton( 'button_2_id', _('Button 2 label'), 'onMyMethodToCall2' ); 
                    this.addActionButton( 'button_3_id', _('Button 3 label'), 'onMyMethodToCall3' ); 
                    break;
*/
                    case 'playerTurnDrawingPhase1' :
                        this.addActionButton( 'button_pass', _('Pass'), (evt) => this.onPassDrawing(evt, args) ); 
                        break;

                    case 'playerTurnDrawingPhase2' :
                        this.addActionButton( 'button_cancel_location_dice_choice', _('Cancel'), (evt) => this.onCancelLocationDiceChoice(evt, args) ); 
                        break;

                    case 'playerTurnDrawingPhase3' :
                        this.addActionButton( 'button_cancel_location_choice', _('Cancel'), (evt) => this.onCancelLocationChoice(evt, args) ); 
                        break;

                    case 'playerTurnCatSelection' :
                        this.addActionButton( 'button_cancel_shape_choice', _('Cancel'), (evt) => this.onCancelShapeChoice(evt, args) ); 
                        break;
                }
            }
        },

        // -------------------------------> on a une autre fonction du même nom
        // onClickSquare: function( evt ) 
        // {
        //     console.log( '$$$$ Event : onClickSquare' );
        //     dojo.stopEvent( evt );
        // },

        onClickDice: function( elmt_id )
        {
            console.log( '$$$$ Event : onClickDice' );
            // dojo.stopEvent( evt );

            if( ! this.checkAction( 'pickDice' ) )
            { return; }

            var dice_id = elmt_id.split('_')[1];
            var dice_face = elmt_id.split('_')[2];
            
            console.log( '$$$$ Selected dice : (' + dice_id + ')' );
            
            if ( this.isCurrentPlayerActive() ) {
                this.ajaxcall( "/phobycatcafe/phobycatcafe/pickDice.html", { lock: true, dice_id: dice_id, dice_face: dice_face }, this, function( result ) {}, function( is_error ) {} );
            }
        },

        // onClickPlayerDice: function( evt ) {
        //     console.log( '$$$$ Event : onClickPlayerDice' );
        //     dojo.stopEvent( evt );

        //     if( ! this.checkAction( 'chooseDiceForLocation' ) )
        //     { return; }

        //     var node = evt.currentTarget.id;
        //     console.log( 'Node : ' + node );

        //     var player_id = node.split('_')[2];
        //     var num_player_dice = node.split('_')[3];
        //     var dice_face = this.getDiceFace( node, 'ctc_dice' );

        //     if ( this.getActivePlayerId() != player_id) {
        //         return;
        //     }

        //     if ( this.isCurrentPlayerActive() ) {
        //         this.ajaxcall( "/phobycatcafe/phobycatcafe/chooseDiceForLocation.html", { lock: true, player_id: player_id, num_player_dice: num_player_dice, dice_face: dice_face }, this, function( result ) {}, function( is_error ) {} );
        //     }
        // },
        onClickPlayerDice: function( elmt_id ) {
            console.log( '$$$$ Event : onClickPlayerDice' );
            // dojo.stopEvent( evt );

            if( ! this.checkAction( 'chooseDiceForLocation' ) )
            { return; }

            var node = $(elmt_id);
            console.log( 'Node : ' + node );

            var player_id = elmt_id.split('_')[2];
            var num_player_dice = elmt_id.split('_')[3];
            var dice_face = this.getDiceFace( node, 'ctc_dice' );

            if ( this.getActivePlayerId() != player_id) {
                return;
            }

            if ( this.isCurrentPlayerActive() ) {
                this.ajaxcall( "/phobycatcafe/phobycatcafe/chooseDiceForLocation.html", { lock: true, player_id: player_id, num_player_dice: num_player_dice, dice_face: dice_face }, this, function( result ) {}, function( is_error ) {} );
            }
        },

        onClickSquare: function( node_id )
        {
            console.log( '$$$$ Event : onClickSquare' );
            // console.log( evt );
            //dojo.stopEvent( evt );



            if( ! this.checkAction( 'chooseDrawingLocation' ) )
            { return; }

            // var node = evt.currentTarget.id;
            // console.log( 'Node : ' + node );

            console.log( "------- conections :");
            console.log( this.connections );

            var player_id = node_id.split('_')[1];
            var x = node_id.split('_')[2];
            var y = node_id.split('_')[3];
            var shape = 0;

            node = dojo.byId(node_id);

            if (dojo.hasClass(node, 'ctc_square_1')) {
                shape = 1;
            } else if (dojo.hasClass(node, 'ctc_square_2')) {
                shape = 2;
            } else if (dojo.hasClass(node, 'ctc_square_3')) {
                shape = 3;
            } else if (dojo.hasClass(node, 'ctc_square_4')) {
                shape = 4;
            } else if (dojo.hasClass(node, 'ctc_square_5')) {
                shape = 5;
            } else if (dojo.hasClass(node, 'ctc_square_6')) {
                shape = 6;
            }
            
            if ( this.isCurrentPlayerActive() ) {
                this.ajaxcall( "/phobycatcafe/phobycatcafe/chooseDrawingLocation.html", { lock: true, player_id: player_id, x: x, y: y }, this, function( result ) {}, function( is_error ) {} );
            }
        },

        onClickShape: function( elmt_id )
        {
            console.log( '$$$$ Event : onClickShape' );
            //dojo.stopEvent( evt );

            if( ! this.checkAction( 'chooseShape' ) )
            { return; }

            //var node = evt.currentTarget.id;
            //console.log( 'Node : ' + node );

            var player_id = elmt_id.split('_')[2];
            var shape = elmt_id.split('_')[3];

            console.log( 'elmt_id : ' + elmt_id );
            console.log( 'Shape : ' + shape );

            if ( this.isCurrentPlayerActive() ) {
                this.ajaxcall( "/phobycatcafe/phobycatcafe/chooseShape.html", { lock: true, player_id: player_id, shape: shape }, this, function( result ) {}, function( is_error ) {} );
            }
        },

        onClickCat: function( elmt_id )
        {
            console.log( '$$$$ Event : onClickCat' );
            // dojo.stopEvent( evt );

            if( ! this.checkAction( 'chooseCat' ) )
            { return; }

            // var node = evt.currentTarget.id;
            // console.log( 'Node : ' + node );

            var player_id = elmt_id.split('_')[2];
            var cat = elmt_id.split('_')[3];

            if ( this.isCurrentPlayerActive() ) {
                this.ajaxcall( "/phobycatcafe/phobycatcafe/chooseCat.html", { lock: true, player_id: player_id, cat: cat }, this, function( result ) {}, function( is_error ) {} );
            }
        },

        ///////////////////////////////////////////////////
        //// Utility methods
        
        /*
        
            Here, you can defines some utility methods that you can use everywhere in your javascript
            script.
        
        */
        getXPixelCoordinatesSubScoringColumn: function( i )
        {

            // let offset = this.gameConstants['SUB_SCORING_X_OFFSET'];
    
            // if (i == 1) {
            //     return this.gameConstants['SUB_SCORING_X_ORIGIN'] + (i * (offset + this.gameConstants['SUB_SCORING_WIDTH'])) + 4;
            // } else {
            //     return this.gameConstants['SUB_SCORING_X_ORIGIN'] + (i * (offset + this.gameConstants['SUB_SCORING_WIDTH']));
            // }

            let offset = 0;

            return this.gameConstants['SCORING_COLUMN_X_ORIGIN'] + (i * this.gameConstants['SCORING_COLUMN_X_OFFSET']);
        },
        
        getYPixelCoordinatesSubScoringColumn: function( i )
        {
            var y = this.gameConstants['SCORING_COLUMN_Y_ORIGIN'];

            switch (i) {
                case 1:
                    y -= 24;
                    break;
                case 2:
                    y -= 50;
                    break;
                case 3:
                    y -= 24;
                    break;
                case 4:
                    y += 53;
                    break;
                default:
                    break;
            } 
            
            return y;
        },

        getXPixelCoordinates: function( square_x )
        {
            return this.gameConstants['X_ORIGIN'] + square_x * (this.gameConstants['SQUARE_WIDTH']); 
        },
        
        getYPixelCoordinates: function( square_y, square_x )
        {
            offset = 0;
            if (square_x % 2 > 0) {
                offset = this.gameConstants['Y_OFFSET'];
            }
            return this.gameConstants['Y_ORIGIN'] - square_y * (this.gameConstants['SQUARE_HEIGHT']) + offset; 
        },

        getXPixelCoordinatesShapeSelection: function( x )
        {
            return this.gameConstants['SHAPE_SELECTION_X_ORIGIN'] + ((x - 1) * (this.gameConstants['SHAPE_SELECTION_X_OFFSET'] + this.gameConstants['SHAPE_SELECTION_WIDTH'])); 
        },

        getXPixelCoordinatesFootprints: function( i )
        {
            offset = 0;
            if (i % 2 != 0) {
                offset = this.gameConstants['CAT_FOOTPRINT_X_OFFSET'];
            }
            return this.gameConstants['CAT_FOOTPRINT_X_ORIGIN'] + offset;
        },
        
        getYPixelCoordinatesFootprints: function( i )
        {
            offset = this.gameConstants['CAT_FOOTPRINT_Y_OFFSET']
            if (i < 3) {
                y = this.gameConstants['CAT_FOOTPRINT_Y_ORIGIN'] + (i * (this.gameConstants['CAT_FOOTPRINT_HEIGHT'] - offset)); 
            } else if (i < 5) {
                y = this.gameConstants['CAT_FOOTPRINT_Y_ORIGIN'] + (i * (this.gameConstants['CAT_FOOTPRINT_HEIGHT'] - offset)) - 3;
            } else if (i == 5) {
                y = this.gameConstants['CAT_FOOTPRINT_Y_ORIGIN'] + (i * (this.gameConstants['CAT_FOOTPRINT_HEIGHT'] - offset));
            } else if (i <= 8) {
                y = this.gameConstants['CAT_FOOTPRINT_Y_ORIGIN'] + (i * (this.gameConstants['CAT_FOOTPRINT_HEIGHT'] - offset));
            } else if (i <= 12) {
                y = this.gameConstants['CAT_FOOTPRINT_Y_ORIGIN'] + (i * (this.gameConstants['CAT_FOOTPRINT_HEIGHT'] - offset)) + 4;
            } else if (i == 12) {
                y = this.gameConstants['CAT_FOOTPRINT_Y_ORIGIN'] + (i * (this.gameConstants['CAT_FOOTPRINT_HEIGHT'] - offset)) + 2;
            } else if (i < 17) {
                y = this.gameConstants['CAT_FOOTPRINT_Y_ORIGIN'] + (i * (this.gameConstants['CAT_FOOTPRINT_HEIGHT'] - offset)) + 8;
            } else {
                y = this.gameConstants['CAT_FOOTPRINT_Y_ORIGIN'] + (i * (this.gameConstants['CAT_FOOTPRINT_HEIGHT'] - offset)) + 10;
            }

            return y; 
        },

        getXPixelCoordinatesCatSelection: function( i )
        {

            offset = this.gameConstants['CAT_SELECTION_X_OFFSET'];
            return this.gameConstants['CAT_SELECTION_X_ORIGIN'] + (i * (offset + this.gameConstants['CAT_SELECTION_WIDTH']));
        },
        
        getYPixelCoordinatesCatSelection: function( i )
        {
            return this.gameConstants['CAT_SELECTION_Y_ORIGIN'];
        },

        getXPixelCoordinatesSubScoring: function( i )
        {

            let offset = this.gameConstants['SUB_SCORING_X_OFFSET'];
 
            if (i == 1) {
                return this.gameConstants['SUB_SCORING_X_ORIGIN'] + (i * (offset + this.gameConstants['SUB_SCORING_WIDTH'])) + 4;
            } else {
                return this.gameConstants['SUB_SCORING_X_ORIGIN'] + (i * (offset + this.gameConstants['SUB_SCORING_WIDTH']));
            }
        },
        
        getYPixelCoordinatesSubScoring: function( i )
        {
            return this.gameConstants['SUB_SCORING_Y_ORIGIN'];
        },

        desableConnections: function()
        {
            console.log( 'dekonnexx');
            console.log( this.connections); 

            dojo.forEach(this.connections, dojo.disconnect);
            this.connections = [];            

            console.log( 'dekonnexx after');
            console.log( this.connections);
        },

        updatePossibleDrawings: function( possibleDrawings )
        {
            console.log(possibleDrawings);

            for( var player_id in possibleDrawings ) {
                for( var id in possibleDrawings[player_id] ) {
                    // console.log(possibleDrawings[player_id][id]);
                    dojo.removeClass( 'square_'+player_id+'_'+possibleDrawings[player_id][id].x+'_'+possibleDrawings[player_id][id].y, 'ctc_square_0' );
                    dojo.addClass( 'square_'+player_id+'_'+possibleDrawings[player_id][id].x+'_'+possibleDrawings[player_id][id].y, 'ctc_square_'+possibleDrawings[player_id][id].shape );
                    dojo.addClass( 'square_'+player_id+'_'+possibleDrawings[player_id][id].x+'_'+possibleDrawings[player_id][id].y, 'ctc_square_clickable' );
                }
            }

            // Add events on active elements (the third parameter is the method that will be called when the event defined by the second parameter happens - this method must be declared beforehand)
            // this.addEventToClass( "ctc_square_clickable", "onclick", "onClickSquare");
        },

        updateFootprintsState: function( player_id, used, available ) {
            console.log( '$$$$ : updateFootprintsState' );
            console.log( 'player_id : '+player_id );
            console.log( 'used : '+used );
            console.log( 'available : '+available );
            for (let i=0; i<18; i++) {
                for (let j=0; j<4; j++) {
                    if (dojo.hasClass($('cat_footprint_'+player_id+'_'+i), 'ctc_cat_footprint_'+j)) {
                        dojo.removeClass($('cat_footprint_'+player_id+'_'+i), 'ctc_cat_footprint_'+j);
                    }
                }
                // dojo.removeClass($('cat_footprint_'+player_id+'_'+i), 'ctc_cat_footprint_0');
                // dojo.removeClass($('cat_footprint_'+player_id+'_'+i), 'ctc_cat_footprint_1');
                // dojo.removeClass($('cat_footprint_'+player_id+'_'+i), 'ctc_cat_footprint_2');
                // dojo.removeClass($('cat_footprint_'+player_id+'_'+i), 'ctc_cat_footprint_3');
            }
            for (let i=0; i<used; i++) {
                console.log( 'i : '+i );
                dojo.addClass($('cat_footprint_'+player_id+'_'+i), 'ctc_cat_footprint_2');
            }
            for (let i=used; i<parseInt(used, 10)+parseInt(available, 10); i++) {
                console.log( 'i : '+i );
                dojo.addClass($('cat_footprint_'+player_id+'_'+i), 'ctc_cat_footprint_1');
            }
            for (let i=parseInt(used, 10)+parseInt(available, 10); i<18; i++) {
                console.log( 'i : '+i );
                dojo.addClass($('cat_footprint_'+player_id+'_'+i), 'ctc_cat_footprint_0');
            }
            console.log( '$$$$ : End updateFootprintsState' );
        },

        setupDices: function( args ) {
            console.log( '$$$$ : setupDices' );

            console.log(args);

            for( var id in args.dices ) {
                var dice = args.dices[id];

                if (dice.player_id === null) {
                    console.log( "face : " + dice.dice_value );
                    dojo.place( this.format_block('jstpl_dice', {
                        dice_face:dice.dice_value,
                        id:dice.id,
                        dice:dice.dice_value,
                    } ), $ ( 'ctc_dice_area' ) );
                }
            }
            // let nb_total_dice = 0;
            // let nb_selected_dice = 0;
            // let remaining_dice_val = -1;
            // for( var id in gamedatas.dices )
            // {
            //     nb_total_dice++;

            //     var dice = gamedatas.dices[id];

            //     console.log( dice );

            //     if (dice.dice_value !== null) {
            //         if (dice.player_id === null) {
            //             remaining_dice_val = dice.dice_value;
            //             console.log( "face : " + dice.dice_value );
            //             dojo.place( this.format_block('jstpl_dice', {
            //                 dice_face:dice.dice_value,
            //                 id:id,
            //                 dice:dice.dice_value,
            //             } ), $ ( 'ctc_dice_area' ) );
            //         } else {
            //             // dojo.place( this.format_block('jstpl_dice', {
            //             //     dice_face:0,
            //             //     id:id,
            //             //     dice:dice.dice_value,
            //             // } ), $ ( 'ctc_dice_area' ) );

            //             nb_selected_dice++;
            //             dojo.removeClass( 'dice_player_' + dice.player_id + '_0', 'ctc_dice_0' );
            //             dojo.addClass( 'dice_player_' + dice.player_id + '_0', 'ctc_dice_' + dice.dice_value );
            //         }
            //     }
            // }
        },

        updatePlayerSecondDice: function( args ) {
            console.log( '$$$$ : updatePlayerSecondDice' );

            console.log(args);

            for( var id in args.playersBasicInfos ) {
                console.log(id);
                console.log(args.diceCommon);
                console.log('dice_'+args.diceCommon['id']+'_'+args.diceCommon['dice_value']);

                // Attempt to create 2 dices and make them slide to the player's dices location
                // var div = document.getElementById('dice_'+args.diceCommon['id']+'_'+args.diceCommon['dice_value']),
                // clone = div.cloneNode(true); // true means clone all childNodes and all event handlers
                // clone.id = 'dice_tmp_'+id;
                // //document.getElementById('ctc_dice_area').appendChild(clone);
                // div.appendChild(clone);

                // var slide = this.slideToObject( $( 'dice_tmp_'+id ), $( 'dice_player_' + notif.args.player_id + '_0' ), 1000 );
                // slide.play();

                // Faire poper les des à l'emplacement player -----------------------------------------------------
                dojo.removeClass($('dice_player_'+id+'_1'), 'ctc_dice_0');
                dojo.addClass($('dice_player_'+id+'_1'), 'ctc_dice_'+args.diceCommon['dice_value']);




                // let tmp = dojo.clone($('dice_'+args.diceCommon['id']+'_'+args.diceCommon['dice_value']));
                // //console.log(tmp);
                // dojo.attr(tmp, 'id', 'dice_tmp_'+id);



                // var slide = this.slideToObject( $( 'dice_tmp_'+id ), $( 'dice_player_'+id+'_1' ), 1000 );
                // slide.play();

                // var slide = this.slideToObject( $( 'dice_' + notif.args.dice_id + "_" + notif.args.dice_face ), $( 'dice_player_' + notif.args.player_id + '_0' ), 1000 );
                // dojo.connect( slide, 'onEnd', this, dojo.hitch( this, function() {
                //             // At the end of the slide, update the intersection 
                //             // dojo.removeClass( 'intersection_' + notif.args.coord_x + '_' + notif.args.coord_y, 'no_stone' );
                //             // dojo.addClass( 'intersection_' + notif.args.coord_x + '_' + notif.args.coord_y, 'stone_'  + notif.args.color );
                //             // dojo.removeClass( 'intersection_' + notif.args.coord_x + '_' + notif.args.coord_y, 'clickable' );
                        
                //             dojo.addClass( 'dice_player_' + notif.args.player_id + '_0', 'ctc_dice_' + notif.args.dice_face );

                //             // We can now destroy the stone since it is now visible through the change in style of the intersection
                //             dojo.destroy( 'dice_' + notif.args.dice_id + "_" + notif.args.dice_face );
                // }));
                // slide.play();
            }
        },

        updatePlayerDiceChosen: function( args ) {
            console.log( '$$$$ : updatePlayerDiceChosen' );
            //dojo.removeClass($('dice_player_'+player_id+'_'+dice_num), 'ctc_selected');
            //dojo.addClass($('dice_player_'+player_id+'_'+dice_num), 'ctc_selected');
            
            console.log( "----" );
            console.log( args );
            console.log( "----" );
            //var active_player = args.diceCommon['id']

            console.log( "++++" );
            console.log( args['player_id'] );
            console.log( "++++" );

            var obj = { color:"#f00" };
            dojo.setAttr('dice_player_'+args['player_id']+'_'+args['first_chosen_dice_num'], "style", obj);

            console.log( '$$$$ : End updatePlayerDiceChosen' );
        },

        updatePlayerBoardForLocationChoice: function( args ) {
            console.log( '$$$$ : updatePlayerBoardForLocationChoice' );
            console.log( args );

            var player_id = args.player_id; 

            for (var id in args.possibleLocations[player_id]) {
                console.log( args.possibleLocations[player_id][id] );

                let x = args.possibleLocations[player_id][id].x;
                let y = args.possibleLocations[player_id][id].y;
                // dojo.removeClass($('dice_player_'+id+'_1'), 'ctc_dice_0');
                
                //dojo.addClass($('square_'+player_id+'_'+x+'_'+y), 'ctc_square_selectionnable');
                dojo.addClass($('square_'+player_id+'_'+x+'_'+y), 'ctc_square_selectionnable');
            }

            console.log( '$$$$ : End updatePlayerBoardForLocationChoice' );
        },

        updatePlayerBoardForShapeSelection: function( args ) {
            console.log( '$$$$ : updatePlayerBoardForShapeSelection' );
            console.log( args );

            let player_id = args.player_id; 
            let min_shape = args.min_shape;
            let max_shape = args.max_shape;

            for (var i=min_shape; i<=max_shape; i++) {
                dojo.addClass($('shape_selection_'+player_id+'_'+i), 'ctc_shape_selectionnable');
            }

            console.log( '$$$$ : updatePlayerBoardForShapeSelection Ended' );
        },

        updatePlayerBoardForCatSelection: function( args ) {
            console.log( '$$$$ : updatePlayerBoardForCatSelection' );
            console.log( args );
            console.log( args.score_cat );

            player_id = args.player_id;

            for ( var id in args.score_cat ) {
                console.log( args.score_cat );
                if ( args.score_cat[id] == 0 ) {
                    dojo.addClass( 'cat_selection_' + player_id + '_'+ (parseInt(id) + 1), 'ctc_cat_selectionnable');
                }
            }

            console.log( '$$$$ : updatePlayerBoardForCatSelection Ended' );
        },

        cleanBoardForNextRound: function( args ) {
            console.log( '$$$$ : cleanBoardForNextRound' );
            console.log( args );

            //////////////////////
            // var el = document.getElementById('ctc_dice_area');
            // while ( el.firstChild ) el.removeChild( el.firstChild );

            var obj = { color:"" };;

            for( var id in args.dices ) {
                console.log(args.dices[id].dice_value);
                if (args.dices[id].player_id > 0) {
                    dojo.removeClass('dice_player_' + args.dices[id].player_id + '_0', 'ctc_dice_' + args.dices[id].dice_value);

                    dojo.setAttr('dice_player_'+args.dices[id].player_id+'_0', "style", obj);
                } else {
                    dojo.destroy( 'dice_' + args.dices[id].id + "_" + args.dices[id].dice_value );
                    for( var id2 in args.players ) {
                        console.log(args.players[id2]);
                        dojo.removeClass('dice_player_' + args.players[id2].id + '_1', 'ctc_dice_' + args.dices[id].dice_value);

                        dojo.setAttr('dice_player_'+args.players[id2].id+'_1', "style", obj);
                    }
                }
            }

            console.log( '$$$$ : cleanBoardForNextRound Ended' );
        },

        setupNewRound: function( args ) {
            console.log( '$$$$ : setupNewRound' );
            console.log( args );

            // for( var id in args.dices )
            // {
            //     console.log(args.dices[id].dice_value);
            //     dojo.place( this.format_block('jstpl_dice', {
            //         dice_face:args.dices[id].dice_value,
            //         id:args.dices[id].id,
            //         dice:args.dices[id].dice_value,
            //     } ), $ ( 'ctc_dice_area' ) );
            // }

            // this.addEventToClass( "ctc_dice_pickable", "onclick", "onClickDice");

            console.log( '$$$$ : setupNewRound Ended' );
        },

        getDiceFace: function( node, prefix ) {

            let diceFace = 0;

            if (prefix.substring(prefix.length-1, prefix.length) != '_') {
                prefix += '_'
            }

            let found = false;
            let i = 1;

            while (i<=6 && !found) {
                if (dojo.hasClass(node, prefix+i)) {
                    diceFace = i;
                    found = true;
                } else {
                    i++;
                }
            }

            return diceFace;
        },

        updateScoreCat: function( player_id, cat, score_cat ) {
            dojo.byId("sub_scoring_" + player_id + "_" + cat).innerHTML = score_cat;
        },

        // Remove the shape created for animation
        remove_temp_shape: function(params) {
            console.log('$$$$ : remove_temp_shape');

            dojo.removeClass('square_'+params.player_id+'_'+params.x+'_'+params.y, 'ctc_square_selected');
            dojo.addClass('square_'+params.player_id+'_'+params.x+'_'+params.y, 'ctc_square_'+params.shape);
            var elmt_id = 'square_tmp_'+params.x+'_'+params.y;
            dojo.destroy( elmt_id );

            console.log('$$$$ : remove_temp_shape Ended');
         },

        // removeClassCatSelectionnable: function() {
        //     $player_id = this.getActivePlayerId();

        //     for ( var i=0; i<6; i++ ) {
        //         dojo.removeClass( 'shape_selection_' + player_id + '_'+ (id + 1), 'ctc_cat_selectionnable');
        //     }
        // },

        // removeEventFromClass: function( classname, type, functionName ) {
        //     var elements = document.getElementsByClassName( classname );

        //     for (var i = 0; i < elements.length; i++) {
        //         elements[i].removeEventListener(type, functionName, false);
        //     }
        // },


        ///////////////////////////////////////////////////
        //// Player's action
        
        /*
        
            Here, you are defining methods to handle player's action (ex: results of mouse click on 
            game objects).
            
            Most of the time, these methods:
            _ check the action is possible at this game state.
            _ make a call to the game server
        
        */
        
        /* Example:
        
        onMyMethodToCall1: function( evt )
        {
            console.log( 'onMyMethodToCall1' );
            
            // Preventing default browser reaction
            dojo.stopEvent( evt );

            // Check that this action is possible (see "possibleactions" in states.inc.php)
            if( ! this.checkAction( 'myAction' ) )
            {   return; }

            this.ajaxcall( "/phobycatcafe/phobycatcafe/myAction.html", { 
                                                                    lock: true, 
                                                                    myArgument1: arg1, 
                                                                    myArgument2: arg2,
                                                                    ...
                                                                 }, 
                         this, function( result ) {
                            
                            // What to do after the server call if it succeeded
                            // (most of the time: nothing)
                            
                         }, function( is_error) {

                            // What to do after the server call in anyway (success or failure)
                            // (most of the time: nothing)

                         } );        
        },        
        
        */
        onPassDrawing: function( evt, args )
        {
            console.log( 'onPassDrawing' );
            console.log( '****************' );
            console.log( args );
            console.log( '****************' );
            
            // Preventing default browser reaction
            dojo.stopEvent( evt );

            // Check that this action is possible (see "possibleactions" in states.inc.php)
            if( ! this.checkAction( 'pass' ) )
                { return; }

            this.ajaxcall( "/phobycatcafe/phobycatcafe/pass.html", { 
                                                                    lock: true, 
                                                                    player_id: args.player_id
                                                                 }, 
                         this, function( result ) {
                            
                            // What to do after the server call if it succeeded
                            // (most of the time: nothing)
                            
                         }, function( is_error) {

                            // What to do after the server call in anyway (success or failure)
                            // (most of the time: nothing)

                         } );
        },

        onCancelLocationDiceChoice: function( evt, args )
        {
            console.log( 'onCancelLocationDiceChoice' );
            console.log( '****************' );
            console.log( args );
            console.log( '****************' );
            
            // Preventing default browser reaction
            dojo.stopEvent( evt );

            // Check that this action is possible (see "possibleactions" in states.inc.php)
            if( ! this.checkAction( 'cancelLocationDiceChoice' ) )
                { return; }
            
            this.ajaxcall( "/phobycatcafe/phobycatcafe/cancelLocationDiceChoice.html", { 
                                                                    lock: true, 
                                                                    player_id: args.player_id
                                                                 }, 
                         this, function( result ) {
                            
                            // What to do after the server call if it succeeded
                            // (most of the time: nothing)
                            
                         }, function( is_error) {

                            // What to do after the server call in anyway (success or failure)
                            // (most of the time: nothing)

                         } );
        },

        onCancelLocationChoice: function( evt, args )
        {
            console.log( 'onCancelLocationChoice' );
            console.log( '****************' );
            console.log( args );
            console.log( '****************' );
            
            // Preventing default browser reaction
            dojo.stopEvent( evt );

            // Check that this action is possible (see "possibleactions" in states.inc.php)
            if( ! this.checkAction( 'cancelLocationChoice' ) )
                { return; }
            
            this.ajaxcall( "/phobycatcafe/phobycatcafe/cancelLocationChoice.html", { 
                                                                    lock: true, 
                                                                    player_id: args.player_id
                                                                 }, 
                         this, function( result ) {
                            
                            // What to do after the server call if it succeeded
                            // (most of the time: nothing)
                            
                         }, function( is_error) {

                            // What to do after the server call in anyway (success or failure)
                            // (most of the time: nothing)

                         } );
        },

        onCancelShapeChoice: function( evt, args )
        {
            console.log( 'onCancelShapeChoice' );
            console.log( '****************' );
            console.log( args );
            console.log( '****************' );
            
            // Preventing default browser reaction
            dojo.stopEvent( evt );

            // Check that this action is possible (see "possibleactions" in states.inc.php)
            if( ! this.checkAction( 'cancelShapeChoice' ) )
                { return; }
            
            this.ajaxcall( "/phobycatcafe/phobycatcafe/cancelShapeChoice.html", { 
                                                                    lock: true, 
                                                                    player_id: args.player_id
                                                                 }, 
                         this, function( result ) {
                            
                            // What to do after the server call if it succeeded
                            // (most of the time: nothing)
                            
                         }, function( is_error) {

                            // What to do after the server call in anyway (success or failure)
                            // (most of the time: nothing)

                         } );
        },
        
        ///////////////////////////////////////////////////
        //// Reaction to cometD notifications

        /*
            setupNotifications:
            
            In this method, you associate each of your game notifications with your local method to handle it.
            
            Note: game notification names correspond to "notifyAllPlayers" and "notifyPlayer" calls in
                  your phobycatcafe.game.php file.
        
        */
        setupNotifications: function()
        {
            console.log( 'notifications subscriptions setup' );
            
            // TODO: here, associate your game notifications with local methods
            
            // Example 1: standard notification handling
            // dojo.subscribe( 'cardPlayed', this, "notif_cardPlayed" );
            
            // Example 2: standard notification handling + tell the user interface to wait
            //            during 3 seconds after calling the method in order to let the players
            //            see what is happening in the game.
            // dojo.subscribe( 'cardPlayed', this, "notif_cardPlayed" );
            // this.notifqueue.setSynchronous( 'cardPlayed', 3000 );
            // 

            dojo.subscribe( 'dicePicked', this, "notif_dicePicked" );
            dojo.subscribe( 'drawn', this, "notif_drawn" );
            dojo.subscribe( 'passed', this, "notif_passed" );
            dojo.subscribe( 'diceForLocationChosen', this, "notif_diceForLocationChosen" );
            dojo.subscribe( 'drawingLocationChosen', this, "notif_drawingLocationChosen" );
            dojo.subscribe( 'shapeChosen', this, "notif_shapeChosen" );
            dojo.subscribe( 'catChosen', this, "notif_catChosen" );
            dojo.subscribe( 'columnSubScoringMax', this, "notif_columnSubScoringMax" );
            dojo.subscribe( 'columnSubScoringMin', this, "notif_columnSubScoringMin" );
            dojo.subscribe('score', this, "notif_score");
            dojo.subscribe('backToTurnDrawingPhase1', this, "notif_backToTurnDrawingPhase1");
        },  
        
        // TODO: from this point and below, you can write your game notifications handling methods
        
        /*
        Example:
        
        notif_cardPlayed: function( notif )
        {
            console.log( 'notif_cardPlayed' );
            console.log( notif );
            
            // Note: notif.args contains the arguments specified during you "notifyAllPlayers" / "notifyPlayer" PHP call
            
            // TODO: play the card in the user interface.
        },    
        
        */
        notif_dicePicked: function( notif )
        {
            console.log( '**** Notification : dicePicked' );
            console.log( notif );

            var slide = this.slideToObject( $( 'dice_' + notif.args.dice_id + "_" + notif.args.dice_face ), $( 'dice_player_' + notif.args.player_id + '_0' ), 1000 );
            dojo.connect( slide, 'onEnd', this, dojo.hitch( this, function() {
                        // At the end of the slide, update the intersection 
                        // dojo.removeClass( 'intersection_' + notif.args.coord_x + '_' + notif.args.coord_y, 'no_stone' );
                        // dojo.addClass( 'intersection_' + notif.args.coord_x + '_' + notif.args.coord_y, 'stone_'  + notif.args.color );
                        // dojo.removeClass( 'intersection_' + notif.args.coord_x + '_' + notif.args.coord_y, 'clickable' );
        			
                        dojo.addClass( 'dice_player_' + notif.args.player_id + '_0', 'ctc_dice_' + notif.args.dice_face );

                        // We can now destroy the stone since it is now visible through the change in style of the intersection
                        /////////////////////
                        dojo.destroy( 'dice_' + notif.args.dice_id + "_" + notif.args.dice_face );
                        //dojo.removeClass('dice_' + notif.args.dice_id + "_" + notif.args.dice_face, 'ctc_dice_' + notif.args.dice_face);
       	    }));
            slide.play();
        },

        notif_drawn: function( notif )
        {
            console.log( '**** Notification : drawn' );
            console.log( notif );

            dojo.addClass( 'square_' + notif.args.player_id + '_' + notif.args.x +'_' + notif.args.y, 'ctc_square_' + notif.args.shape );

            // var slide = this.slideToObject( $( 'dice_' + notif.args.dice_id + "_" + notif.args.dice_face ), $( 'dice_player_' + notif.args.player_id ), 1000 );
            // dojo.connect( slide, 'onEnd', this, dojo.hitch( this, function() {
            //             // At the end of the slide, update the intersection 
            //             // dojo.removeClass( 'intersection_' + notif.args.coord_x + '_' + notif.args.coord_y, 'no_stone' );
            //             // dojo.addClass( 'intersection_' + notif.args.coord_x + '_' + notif.args.coord_y, 'stone_'  + notif.args.color );
            //             // dojo.removeClass( 'intersection_' + notif.args.coord_x + '_' + notif.args.coord_y, 'clickable' );
        			
            //             dojo.addClass( 'dice_player_' + notif.args.player_id, 'ctc_dice_' + notif.args.dice_face );

            //             // We can now destroy the stone since it is now visible through the change in style of the intersection
            //             dojo.destroy( 'dice_' + notif.args.dice_id + "_" + notif.args.dice_face );
       	    // }));
            // slide.play();
        },

        notif_passed: function( notif )
        {
            console.log( '**** Notification : passed' );
            console.log( 'notif : ' );
            console.log( notif );

            dojo.removeClass('cat_footprint_' + notif.args.player_id + '_' + 0, "ctc_cat_footprint_1");

            // for (let i=0; i<18; i++) {
            //     let id = 'cat_footprint_' + notif.args.player_id + '_' + notif.args.id;
            //     var node = dojo.byId(id);
            //     if (node != null) {
            //         dojo.removeClass(id, "ctc_cat_footprint_0");
            //     }
            // }

            this.updateFootprintsState( notif.args.player_id, notif.args.footprint_used, notif.args.footprint_available );

            console.log( '**** Notification : passed Ended' );
            // dojo.addClass( 'square_' + notif.args.player_id + '_' + notif.args.x +'_' + notif.args.y, 'ctc_square_' + notif.args.shape );

            // var slide = this.slideToObject( $( 'dice_' + notif.args.dice_id + "_" + notif.args.dice_face ), $( 'dice_player_' + notif.args.player_id ), 1000 );
            // dojo.connect( slide, 'onEnd', this, dojo.hitch( this, function() {
            //             // At the end of the slide, update the intersection 
            //             // dojo.removeClass( 'intersection_' + notif.args.coord_x + '_' + notif.args.coord_y, 'no_stone' );
            //             // dojo.addClass( 'intersection_' + notif.args.coord_x + '_' + notif.args.coord_y, 'stone_'  + notif.args.color );
            //             // dojo.removeClass( 'intersection_' + notif.args.coord_x + '_' + notif.args.coord_y, 'clickable' );
        			
            //             dojo.addClass( 'dice_player_' + notif.args.player_id, 'ctc_dice_' + notif.args.dice_face );

            //             // We can now destroy the stone since it is now visible through the change in style of the intersection
            //             dojo.destroy( 'dice_' + notif.args.dice_id + "_" + notif.args.dice_face );
       	    // }));
            // slide.play();
        },

        notif_diceForLocationChosen: function( notif )
        {
            console.log( '**** Notification : diceForLocationChosen' );
            console.log( 'notif : ' );
            console.log( notif );

            // dojo.removeClass('cat_footprint_' + notif.args.player_id + '_' + 0, "ctc_cat_footprint_1");

            // for (let i=0; i<18; i++) {
            //     let id = 'cat_footprint_' + notif.args.player_id + '_' + notif.args.id;
            //     var node = dojo.byId(id);
            //     if (node != null) {
            //         dojo.removeClass(id, "ctc_cat_footprint_0");
            //     }
            // }

            console.log( notif.args.player_id );
            console.log( notif.args.first_chosen_dice_num );
            console.log( notif.args.first_chosen_dice_val );

            this.updatePlayerDiceChosen( notif.args );



            console.log( '**** Notification : diceForLocationChosen Ended' );
            // dojo.addClass( 'square_' + notif.args.player_id + '_' + notif.args.x +'_' + notif.args.y, 'ctc_square_' + notif.args.shape );

            // var slide = this.slideToObject( $( 'dice_' + notif.args.dice_id + "_" + notif.args.dice_face ), $( 'dice_player_' + notif.args.player_id ), 1000 );
            // dojo.connect( slide, 'onEnd', this, dojo.hitch( this, function() {
            //             // At the end of the slide, update the intersection 
            //             // dojo.removeClass( 'intersection_' + notif.args.coord_x + '_' + notif.args.coord_y, 'no_stone' );
            //             // dojo.addClass( 'intersection_' + notif.args.coord_x + '_' + notif.args.coord_y, 'stone_'  + notif.args.color );
            //             // dojo.removeClass( 'intersection_' + notif.args.coord_x + '_' + notif.args.coord_y, 'clickable' );
        			
            //             dojo.addClass( 'dice_player_' + notif.args.player_id, 'ctc_dice_' + notif.args.dice_face );

            //             // We can now destroy the stone since it is now visible through the change in style of the intersection
            //             dojo.destroy( 'dice_' + notif.args.dice_id + "_" + notif.args.dice_face );
       	    // }));
            // slide.play();
        },

        notif_drawingLocationChosen: function( notif )
        {
            console.log( '**** Notification : drawingLocationChosen' );

            let player_id = notif.args.player_id;
            let x = notif.args.x;
            let y = notif.args.y;

            this.updateFootprintsState( notif.args.player_id, notif.args.footprint_used, notif.args.footprint_available );
            
            // for (let i=0; i<5; i++) {
            //     for (let j=0; j<6; j++) {
            //         var elem = dojo.byId('square_'+player_id+'_'+i+'_'+j);
            //         if (elem != null) {
            //             dojo.removeClass('square_'+player_id+'_'+i+'_'+j, 'ctc_square_selectionnable');
            //         }
            //     }
            // }
            dojo.removeClass('square_'+player_id+'_'+x+'_'+y, 'ctc_square_0');
            dojo.addClass('square_'+player_id+'_'+x+'_'+y, 'ctc_square_selected');

            console.log( '**** Notification : drawingLocationChosen Ended' );
        },

        notif_shapeChosen: function( notif )
        {
            console.log( '**** Notification : shapeChosen' );

            let player_id = notif.args.player_id;
            let x = notif.args.x;
            let y = notif.args.y;
            let shape = notif.args.shape;

            this.updateFootprintsState( notif.args.player_id, notif.args.footprint_used, notif.args.footprint_available );


            dojo.place( this.format_block( 'jstpl_square_tmp', {
                value: shape,
                x: x,
                y:y
            } ) , 'player_board_'+player_id );
            
            var parameters = {
                x: x,
                y: y,
                player_id: player_id,
                shape: shape
            }

            this.placeOnObject( 'square_tmp_'+x+'_'+y, 'overall_player_board_'+player_id );
            var animation_id = this.slideToObject( 'square_tmp_'+x+'_'+y, 'square_'+player_id+'_'+x+'_'+y, 1000 );
            dojo.connect(animation_id, 'onEnd', dojo.hitch(this, 'remove_temp_shape', parameters));
            animation_id.play();



            // dojo.removeClass('square_'+player_id+'_'+x+'_'+y, 'ctc_square_selected');
            // dojo.addClass('square_'+player_id+'_'+x+'_'+y, 'ctc_square_'+shape);

            // for (let i=1; i<=6; i++) {
            //     dojo.removeClass('shape_selection_'+player_id+'_'+i, 'ctc_shape_selectionnable');
            // }

            console.log( '**** Notification : shapeChosen Ended' );
        },

        notif_catChosen: function( notif )
        {
            console.log( '**** Notification : catChosen' );

            let player_id = notif.args.player_id;
            let x = notif.args.x;
            let y = notif.args.y;
            let cat = notif.args.cat;
            let score_cat = notif.args.score_cat;

            this.updateScoreCat( player_id, cat, score_cat );

            for (let i=1; i<=6; i++) {
                dojo.removeClass('cat_selection_'+player_id+'_'+i, 'ctc_cat_selectionnable');
            }

            console.log( '**** Notification : catChosen Ended' );
        },

        notif_columnSubScoringMax: function( notif )
        {
            console.log( '**** Notification : columnSubScoringMax' );

            let player_id = notif.args.player_id;
            let column_number = notif.args.column_number;

            let players = this.gamedatas.players;

            dojo.addClass('sub_scoring_'+player_id+'_'+column_number+'_0', 'ctc_column_scoring_validated');
            dojo.addClass('sub_scoring_'+player_id+'_'+column_number+'_1', 'ctc_column_scoring_erased');

            for( var id in players ) {
                // console.log( id + " / " + players[id].id + "player_id");
                if (players[id].id != player_id) {
                    dojo.addClass('sub_scoring_'+players[id].id+'_'+column_number+'_0', 'ctc_column_scoring_erased');
                }
            }

            console.log( '**** Notification : columnSubScoringMax Ended' );
        },

        notif_columnSubScoringMin: function( notif )
        {
            console.log( '**** Notification : columnSubScoringMin' );

            let player_id = notif.args.player_id;
            let column_number = notif.args.column_number;

            dojo.addClass('sub_scoring_'+player_id+'_'+column_number+'_1', 'ctc_column_scoring_validated');

            console.log( '**** Notification : columnSubScoringMin Ended' );
        },

        notif_score: function( notif ) {
            this.scoreCtrl[notif.args.player_id].setValue(notif.args.player_score);
        },

        notif_backToTurnDrawingPhase1: function( notif ) {
            console.log( '**** Notification : backToTurnDrawingPhase1' );

            let player_id = notif.args.player_id;

            for (var i=0; i<2; i++) {
                let elmt_id = 'dice_player_'+player_id+'_'+i;

                console.log( dojo.style(elmt_id, 'color') );
                dojo.style(elmt_id, 'color', 'rgb(0, 0, 0)');
            }

            let x = notif.args.x;
            let y = notif.args.y;

            console.log( '---------- x='+x+', y='+y+' -------------' );

            if (x >= 0 && y >= 0) {
                let elmt_id = 'square_'+player_id+'_'+x+'_'+y;
                for (var i=1; i<7; i++) {
                    dojo.removeClass(elmt_id, 'ctc_square_'+i);

                    console.log( 'ctc_square_'+i );
                }
                dojo.removeClass(elmt_id, 'ctc_square_selected');
                
                dojo.addClass(elmt_id, 'ctc_square_0');
            }

            for (var i=1; i<=6; i++) {
                let shape_elmt_id = 'shape_selection_'+player_id+'_'+i;
                dojo.removeClass(shape_elmt_id, 'ctc_shape_selectionnable');
                let cat_elmt_id = 'cat_selection_'+player_id+'_'+i;
                dojo.removeClass(cat_elmt_id, 'ctc_cat_selectionnable');
            }

            console.log( '**** Notification : backToTurnDrawingPhase1 Ended' );
        },
   });             
});
