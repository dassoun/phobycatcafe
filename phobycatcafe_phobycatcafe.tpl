{OVERALL_GAME_HEADER}

<!-- 
--------
-- BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
-- phobycatcafe implementation : © <Julien Coignet> <breddabasse@hotmail.com>
-- 
-- This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
-- See http://en.boardgamearena.com/#!doc/Studio for more information.
-------

    phobycatcafe_phobycatcafe.tpl
    
    This is the HTML template of your game.
    
    Everything you are writing in this file will be displayed in the HTML page of your game user interface,
    in the "main game zone" of the screen.
    
    You can use in this template:
    _ variables, with the format {MY_VARIABLE_ELEMENT}.
    _ HTML block, with the BEGIN/END format
    
    See your "view" PHP file to check how to set variables and control blocks
    
    Please REMOVE this comment before publishing your game on BGA
-->


This is your game interface. You can edit this HTML in your ".tpl" file.

<div id="ctc_game_area">

    <!-- BEGIN player -->
    <!--  <div class="cc_player_board">
        <div class="cc_square">
            
        </div>
    </div> -->
    <!-- END player -->

    <div id="ctc_dice_area">

    </div>

</div>

<script type="text/javascript">

// Javascript HTML templates

/*
// Example:
var jstpl_some_game_item='<div class="my_game_item" id="my_game_item_${MY_ITEM_ID}"></div>';

*/
var jstpl_player_board='<div class="ctc_player_board" id="player_board_${player}"></div>';

var jstpl_square='<div class="ctc_square ctc_square_${value}" id="square_${player}_${x}_${y}"></div>';

var jstpl_square_tmp='<div class="ctc_square ctc_square_${value}" id="square_tmp_${x}_${y}"></div>';

var jstpl_dice='<div class="ctc_dice ctc_dice_${dice_face} ctc_dice_pickable" id="dice_${id}_${dice}"></div>';

var jstpl_dice_player='<div class="ctc_dice ctc_dice_${dice_face} ctc_dice_player" id="dice_player_${player_id}_${id}"></div>';

var jstpl_column_scoring='<div class="ctc_column_scoring" id="sub_scoring_${player_id}_${id1}_${id2}"></div>';

var jstpl_shape_selection='<div class="ctc_shape_selection" id="shape_selection_${player_id}_${shape_id}"></div>';

var jstpl_cat_footprint='<div class="ctc_cat_footprint ctc_cat_footprint_${state}" id="cat_footprint_${player_id}_${id}"></div>';

var jstpl_cat_selection='<div class="ctc_cat_selection" id="cat_selection_${player_id}_${id}"></div>';

var jstpl_sub_scoring='<div class="ctc_sub_scoring" id="sub_scoring_${player_id}_${id}"></div>';

</script>  

{OVERALL_GAME_FOOTER}
