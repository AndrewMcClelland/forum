/**
 * Advanced.js
 * Written by Michael Albinson 06/08/17
 */

"use strict";

var select2Options = {data: [], tags: true, tokenSeparators: [',', ' '], width: 'resolve',
    theme: "classic",  maximumSelectionLength: 3, forcebelow: true};

function sendQuery() {
    //get params as /list?advanced=true&table=<TABLE>&tags=<TAGS>&keywords=<KEYWORDS COMMA SEPARATED NO SPACES>&exactPhrase=<EXACT PHRASE>&titleContains=<TITLE WORDS COMMA SEPARATED>
    // if a text field is empty DO NOT INCLUDE IT in the query

    var queryString  = '/list?advanced=true&table='+currentButton.replace('#','');


    if(currentButton === '#posts'){
        var postTags = $('#postTags')[0].value;
        var keywords = $('#postKeywords')[0].value;
        var exactPhrase = $('#exact-words')[0].value;
        var postTitle = $('#postTitle')[0].value;

        if (postTags.length > 0)
            queryString += '&postTags=' + getCommaDelimitedString(postTags);

        else if (keywords.length > 0)
            queryString += '&keywords=' + getCommaDelimitedString(keywords);

        else if (exactPhrase.length > 0)
            queryString += '&exactPhrase=' + exactPhrase;

        else if (postTitle.length > 0)
            queryString += '&postTitle=' + getCommaDelimitedString(postTitle);
    }

    else if(currentButton === '#links'){
        var link = $('#link')[0].value;
        var linkTags = $('#linkTags')[0].value;
        var linkTitle = $('#linkTitle')[0].value;

        if (link.length > 0)
            queryString += '&link=' + link;

        else if (linkTags.length > 0)
            queryString += '&linkTags=' + getCommaDelimitedString(linkTags);

        else if (linkTitle.length > 0)
            queryString += '&linkTitle=' + getCommaDelimitedString(linkTitle);
    }

    else if(currentButton === '#classes'){
        var classTags = $('#classTags')[0].value;
        var classTitle = $('#classTitle')[0].value;
        var courseCode = $('#courseCode')[0].value;

        if (classTags.length > 0)
            queryString += '&classTags=' + getCommaDelimitedString(classTags);

        else if (classTitle.length > 0)
            queryString += '&classTitle=' + getCommaDelimitedString(classTitle);

        else if (courseCode.length > 0)
            queryString += '&courseCode=' + courseCode;
    }

    else if(currentButton === '#users'){
        var user = $('#user')[0].value;

        if(user.length > 0)
            queryString += '&user=' + user;
    }


    // this is all good FOR THE POST TABLE ONLY -- need more logic for other tables and will probably want to modify the
    // associated advanced page .pug file





    location.href = queryString;
}

function getCommaDelimitedString(s) {
    return s.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s{2,}/g," ").replace(/[\s,]+/g, ',')
}
//make a function that depending on the value of the button, will select
//only the text fields within the desired table
//button changes depending on the field, ie: posts, links, classes

var currentButton = 'all'; // hint, this is the table name
var firstClick = true;
function toggleSelection(button) {
    $('#toggle').addClass('hidden');
    $(currentButton).removeClass('active');
    currentButton = "#" + button;
    $(currentButton).addClass('active');

    if (firstClick) {
        $('#filter').fadeIn();
        firstClick = false;
    }

}