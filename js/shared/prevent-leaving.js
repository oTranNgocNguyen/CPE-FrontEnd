$(document).ready(function () {
    prevent_accidental_leave = false;
    on_leave_message = messageList.EM_007;

    window.addEventListener("beforeunload", function (e) {

        if (prevent_accidental_leave) {

            (e || window.event).returnValue = on_leave_message; //Gecko + IE
            return on_leave_message; //Gecko + Webkit, Safari, Chrome etc.
        }
        else {
            return;
        }
    });
});

function prevent_leaving_page(isActive) {
    prevent_accidental_leave = isActive;
}