"use strict";

var reportItemRef = '';

function submitReport() {
    var href = 'info';

    var reportReason = $('#txtOther')[0].value;
    var newContent;
    var buttonPressed;
    if (reportItemRef === '') // don't allow a submission if there's no item referenced
        return;

    if ($('#checkIC').is(':checked')) {

        buttonPressed = 0;

    }

    if ($('#checkIL').is(':checked')) {

        buttonPressed = 1;
    }
    if ($('#checkIR').is(':checked')) {

        buttonPressed = 2;
    }
    if ($('#checkOther').is(':checked')) {

        buttonPressed = 3;

    }



    // case: reportModal... reportModal.handle, don't close modal until success/failure is returned
    newContent = {
        requested: "reportModal", //
        problemType: buttonPressed, // I'm just hard-coding this guy for now , you need to use jQuery to determine which radio button is pressed
        content: "Content",
        itemID: reportItemRef,
        reportedUser: "a userid",
        reason: reportReason,


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

function showText() {
    $('#txtOther').removeClass('hidden');
}
function dropText() {
    $('#txtOther').addClass('hidden');
    $('#txtOther')[0].value = '';
}
