"use strict";

var reportItemRef = '';

function submitReport() {
    var href = 'info';
    var newContent;
    var buttonPressed;
    if (reportItemRef === '') // don't allow a submission if there's no item referenced
        return;

    if ($('#checkIC').is(':checked')) {

        console.log(0);
        buttonPressed = 0;
    }

    if ($('#checkIL').is(':checked')) {

        console.log(1);
        buttonPressed = 1;
    }
    if ($('#checkIR').is(':checked')) {

        console.log(2);
        buttonPressed = 2;
    }

    // case: reportModal... reportModal.handle, don't close modal until success/failure is returned
    newContent = {
        requested: "reportModal", //
        problemType: buttonPressed, // I'm just hard-coding this guy for now , you need to use jQuery to determine which radio button is pressed
        content: 'There is an issue with this content',
        itemID: reportItemRef


    };

    // if (!checkFields(newContent.type)) // this function does not exist on this page (and throws an error)
    //     return;

//info --> requestResponder --> build handler--> add case in requestResponder

    AJAXCall(href, newContent, false, onSuccessfulInsert);
    reportItemRef = ''; // reset it back to no reference at the end
}

function triggerReportModal(element) {
    $('#reportModal').modal('show');
    reportItemRef = getItemAttr($(element), 'id');
}

function onSuccessfulInsert(data) {
    if (data.id)
        document.location = '/' + newContent.type + '?id=' + data.id;
    else
        console.error('Error inserting new item');
}
