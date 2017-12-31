"use strict"

function submitItem() {
    var newContent = {
        requested: "reportModal",
        problemType: getPressed().replace('#', ''), // case: reportModal... reportModal.handle, don't close modal until success/failure is returned
        content: getContent(getPressed().replace('#', ''))
    };

    if (!checkFields(newContent.type))
        return;

//info --> requestResponder --> build handler--> add case in requestResponder

    var buttonName = '#' + newContent.type + '-button';

    $(buttonName).prop('disabled', true);

    var href = 'info';

    AJAXCall(href, newContent, false, onSuccessfulInsert);

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

