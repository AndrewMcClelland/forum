"use strict"

function submitItem() {
    newContent = {
        requested: "reportModal",
        type: getPressed().replace('#', ''),
        content: getContent(getPressed().replace('#', ''))
    };

    if (!checkFields(newContent.type))
        return;

//info --> requestResponder --> build handler--> add case in requestResponder

    var buttonName = '#' + newContent.type + '-button';

    $(buttonName).prop('disabled', true);

    var href = 'report';

    AJAXCall(href, newContent, false, onSuccessfulInsert);

}

function onSuccessfulInsert(data) {
    if (data.id)
        document.location = '/' + newContent.type + '?id=' + data.id;
    else
        console.error('Error inserting new item');
}

function addReport()
{

}