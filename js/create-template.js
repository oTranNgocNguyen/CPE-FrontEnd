$(document).ready(function () {
    var form = $('.box-upload-file')[0];
    var input = form.querySelector('input[type="file"]');

    if (isAdvancedUpload) {
        form.classList.add('has-advanced-upload'); // letting the CSS part to know drag&drop is supported by the browser

        ['drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop'].forEach(function (event) {
            form.addEventListener(event, function (e) {
                // preventing the unwanted behaviours
                e.preventDefault();
                e.stopPropagation();
            });
        });
        ['dragover', 'dragenter'].forEach(function (event) {
            form.addEventListener(event, function () {
                form.classList.add('is-dragover');
            });
        });
        ['dragleave', 'dragend', 'drop'].forEach(function (event) {
            form.addEventListener(event, function () {
                form.classList.remove('is-dragover');
            });
        });
        form.addEventListener('drop', function (e) {
            droppedFiles = e.dataTransfer.files; // the files that were dropped
            showFiles(droppedFiles);

        });
    }

    input.addEventListener('change', function (e) {
        showFiles(e.target.files);
    });

    $("#btn-upload-file").click(function (evt) {
        /* For BE
        uploadSampleFile(input.files);
		*/
        /* For FE */
        changeTab();
        /* */
    });



    /* ---------------------------------------- Step 2 ---------------------------------------- */
    var canToggle = true;
	var currentId;
    $('#btn-add-field').click(function () {
        /* For BE
        $.ajax({
            type: "GET",
            url: "/Template/AddField",
            success: function (data) {
                $('#box-fields').append(data);
                drawStatus = 1;
            },
            error: function () {
            }
        });
		*/
        /* For FE */
        $('#box-fields').append($('#box-field-temp').html());
        var id = generateId(30);
        $('#box-fields .box-field').last().attr('id', id);
        /* */
    });

    $(document).on("click", ".box-field", function (e) {
        collapseFields($(this).attr('id'));
    });

    $(document).on("click", ".box-field-header", function (e) {
        if (canToggle) {
            if ($(this).parent().children('.box-field-body').css('display') == 'block') {
                $(this).find('.glyphicon').removeClass('glyphicon-menu-up');
            } else {
                $(this).find('.glyphicon').addClass('glyphicon-menu-up');
            }
            $(this).parent().children('.box-field-body').toggle("fast");
        } else {
            canToggle = true;
        }
    });

    $(document).on("click", ".field-name", function (e) {
        canToggle = false;
    });

    $(document).on("click", ".btn-set-coordination", function (e) {
        buildRectList($(this).closest('.box-field').attr('id'), true);
        drawStatus = 1;
        currentId = $(this).closest('.box-field').attr('id');

        // Display buttons and labels of coordination of all fields
        displayCoordinationBtns(this, "setting");
        displayCoordinationBtnsOfAllField($(this).closest('.box-field').attr('id'));
    });

    $(document).on("click", ".btn-edit-coordination", function (e) {
        buildRectList($(this).closest('.box-field').attr('id'), true);
        drawStatus = 2;
        getRectangeForEdit($(this).closest('.box-field').attr('id'));
        currentId = $(this).closest('.box-field').attr('id');

        // Display buttons and labels of coordination of all fields
        displayCoordinationBtns(this, "setting");
        displayCoordinationBtnsOfAllField($(this).closest('.box-field').attr('id'));
    });

    $(document).on("click", ".btn-save-coordination", function (e) {
        buildRectList($(this).closest('.box-field').attr('id'), false);
        displayCoordinationBtns(this, "set");
    });

    $(document).on("click", ".btn-cancel-coordination", function (e) {
        buildRectList($(this).closest('.box-field').attr('id'), true);
        var isSet = checkCoordinationIsSet($(this).closest('.box-field').attr('id'));
        if (isSet) {
            displayCoordinationBtns(this, "set");
        } else {
            displayCoordinationBtns(this, "new");
        }
    });

    $(document).on("click", ".btn-delete-field", function (e) {
        if ($(this).closest('.box-field').attr('id') == currentId) {
            drawStatus = 0;
            clearCurrentRect();
            edittingRect = false;
        }
        removeItemOutOfRectList($(this).closest('.box-field').attr('id'));
        draw();
        $('#' + $(this).closest('.box-field').attr('id')).remove();
    });
});



/* ---------------------------------------- Tab ---------------------------------------- */
var changeTab = function () {
    var activedTab;
    $('.create-template-tab-item').each(function () {
        if ($(this).hasClass('actived')) {
            activedTab = this;
        }
    });
    if (activedTab) {
        var id = $(activedTab).attr('id');
        $(activedTab).removeClass('actived');
        switch (id) {
            case "tab-step-one":
                $('#tab-step-two').addClass('actived');
                $('#box-step-one').css('display', 'none');
                $('#box-step-two').css('display', 'block');
                $('#box-step-three').css('display', 'none');
                $('#box-step-four').css('display', 'none');
                break;
            case "tab-step-two":
                $('#tab-step-three').addClass('actived');
                $('#box-step-one').css('display', 'none');
                $('#box-step-two').css('display', 'none');
                $('#box-step-three').css('display', 'block');
                $('#box-step-four').css('display', 'none');
                break;
            case "tab-step-three":
                $('#tab-step-four').addClass('actived');
                $('#box-step-one').css('display', 'none');
                $('#box-step-two').css('display', 'none');
                $('#box-step-three').css('display', 'none');
                $('#box-step-four').css('display', 'block');
                break;
            case "tab-step-four":
                break;
        }
    }
}



/* ---------------------------------------- Step 1 ---------------------------------------- */
var maxFileSize = (4 * 1024 * 1024);

var isAdvancedUpload = function () {
    var div = document.createElement('div');
    return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
}();

var showFiles = function (files) {
    if (files.length > 1) {
        $('.file-selected').html(messageList.EM_004);
        $('.file-selected').addClass('file-error');
    } else {
        $('.file-selected').html(files[0].name);
        $('.file-selected').removeClass('file-error');
    }
};

var validateSampleFile = function (files) {
    // Validate number of file
    if (files.length > 1) {
        $('.file-selected').html(messageList.EM_004);
        $('.file-selected').addClass('file-error');
        return false;
    } else if (files.length == 0) {
        $('.file-selected').html(messageList.EM_001);
        $('.file-selected').addClass('file-error');
        return false;
    } else {
        // Validate type of file
        var file = files[0];
        if (file.type.indexOf('image/') > -1 || file.type.indexOf('application/pdf') > -1) {
            if (file.size > maxFileSize) {
                $('.file-selected').html(messageList.EM_003);
                $('.file-selected').addClass('file-error');
            } else {
                return true;
            }
            return true;
        } else {
            $('.file-selected').html(messageList.EM_002);
            $('.file-selected').addClass('file-error');
            return false;
        }
    }
}

var uploadSampleFile = function (files) {
    var valid = validateSampleFile(files);
    if (valid) {
        var file = files[0];
        var data = new FormData();
        data.append(file.name, file);

        $.ajax({
            type: "POST",
            url: "/Template/ImportSampleFile",
            contentType: false,
            processData: false,
            data: data,
            success: function (message) {
                changeTab();
            },
            error: function () {
                alert("There was error uploading files!");
            }
        });
    }
};



/* ---------------------------------------- Step 2 ---------------------------------------- */

// Collapse all fields which have set
var collapseFields = function (currentId) {
    for (var i = 0; i < lstRect.length; i++) {
        if (lstRect[i].id != currentId) {
            $('#' + lstRect[i].id).children('.box-field-body').css("display", "none");
            $('#' + lstRect[i].id).find('.glyphicon').removeClass('glyphicon-menu-up');
        }
    }
};

// Display buttons and labels of coordination of a field
// "new": display button "Set"
// "setting" (same for "editting"): display button "Yes" and "Cancel"
// "set": display label and button "Edit"
var displayCoordinationBtns = function (that, stt) {
    switch (stt) {
        case "new":
            $(that).parent().children(".btn-set-coordination").css("display", "inline-block");
            $(that).parent().children(".btn-save-coordination").css("display", "none");
            $(that).parent().children(".btn-cancel-coordination").css("display", "none");
            $(that).parent().children(".lbl-edit-coordination").css("display", "none");
            $(that).parent().children(".btn-edit-coordination").css("display", "none");
            break;
        case "setting":
            $(that).parent().children(".btn-set-coordination").css("display", "none");
            $(that).parent().children(".btn-save-coordination").css("display", "inline-block");
            $(that).parent().children(".btn-cancel-coordination").css("display", "inline-block");
            $(that).parent().children(".lbl-edit-coordination").css("display", "none");
            $(that).parent().children(".btn-edit-coordination").css("display", "none");
            break;
        case "set":
            $(that).parent().children(".btn-set-coordination").css("display", "none");
            $(that).parent().children(".btn-save-coordination").css("display", "none");
            $(that).parent().children(".btn-cancel-coordination").css("display", "none");
            $(that).parent().children(".lbl-edit-coordination").css("display", "inline-block");
            $(that).parent().children(".btn-edit-coordination").css("display", "inline-block");
            break;
    }
};

// Display buttons and labels of coordination of all fields (except current field which is determined by id)
// This function is used to change status of coordination of all fields from "setting" to "new"/"set" when user click buttons "Set"/"Edit"
var displayCoordinationBtnsOfAllField = function (id) {
    $('.box-field').each(function () {
        if ($(this).attr("id") != id) {
            var isSet = checkCoordinationIsSet($(this).attr("id"));
            if (isSet) {
                displayCoordinationBtns($(this).find(".btn-set-coordination"), "set");
            } else {
                displayCoordinationBtns($(this).find(".btn-set-coordination"), "new");
            }
        }
    });
}



/* ---------------------------------------- Common ---------------------------------------- */
var generateId = function (len) {
    var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOP1234567890";
    var passwordLength = len || 8;
    var Id = "";
    for (var x = 0; x < passwordLength; x++) {
        var i = Math.floor(Math.random() * chars.length);
        Id += chars.charAt(i);
    };
    return Id;
};