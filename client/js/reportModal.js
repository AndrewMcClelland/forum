"use strict"

function submitReport() {
    var href = 'info';
    var newContent;

    if (!checkFields(newContent.type))
        return;

    // case: reportModal... reportModal.handle, don't close modal until success/failure is returned
    newContent = {
        requested: "reportModal", //
        problemType: 'ic', // I'm just hard-coding this guy for now , you need to use jQuery to determine which radio button is pressed
        content: 'There is an issue with this content',
    };

    // if (!checkFields(newContent.type)) // this function does not exist on this page (and throws an error)
    //     return;

//info --> requestResponder --> build handler--> add case in requestResponder

    AJAXCall(href, newContent, false, onSuccessfulInsert);
    reportItemRef = ''; // reset it back to no reference at the end
}

function triggerReportModal(element) {
    $('#reportModal').modal('show');

}

function onSuccessfulInsert(data) {
    if (data.id)
        document.location = '/' + newContent.type + '?id=' + data.id;
    else
        console.error('Error inserting new item');
}
