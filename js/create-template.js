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
        /* */
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
                var id = generateId(30);
                $('#box-fields .box-field').last().attr('id', id);
            },
            error: function () {
            }
        });
        /* */
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

    $(document).on("click", ".txt-field-name", function (e) {
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
        var valid = validateCoordination(this, currentRect);
        if (valid) {
            buildRectList($(this).closest('.box-field').attr('id'), false);
            // getPreviewForField();
            displayCoordinationBtns(this, "set");
        }
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

    $(document).on("click", "#btn-step2-next", function (e) {
        collapseFields();
        var valid = validateStep2();
        if (valid) {
            changeTab();
        }
    });



    /* ---------------------------------------- Step 3 ---------------------------------------- */
    $('#box-verification button').click(function () {
        if ($(this).hasClass('locked_active') || $(this).hasClass('unlocked_inactive')) {
            /* code to do when unlocking */
            console.log('Switched on.');
        } else {
            /* code to do when locking */
            console.log('Switched off.');
        }

        /* reverse locking status */
        $('#box-verification button').eq(0).toggleClass('unlocked_inactive unlocked_active btn-info btn-default');
        $('#box-verification button').eq(1).toggleClass('locked_inactive locked_active btn-default btn-info');
    });

    $(document).on("click", "#btn-step3-next", function (e) {
        var valid = validateStep3();
        if (valid) {
            changeTab();
        }
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
var sourceId;
var acceptableFileTypes =
{
    'application/pdf': true,
    'image/png': true,
    'image/jpg': true,
    'image/jpeg': true,
};

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
        if (acceptableFileTypes[file.type]) {
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
            success: function (data) {
                sourceId = data.sourceId;
                $("#canvas").css("background-image", "url(" + data.base64 + ")");
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

// Validate coordination before call OCR
var validateCoordination = function (that, rect) {
    if (rect.x == 0 && rect.y == 0 && rect.w == 0 && rect.h == 0) {
        $(that).closest(".box-field").find(".txt-coordination-error").css("display", "inline-block");
        $(that).closest(".box-field").find(".txt-coordination-error").html(messageList.EM_011);
        return false;
    } else {
        $("#box-step-two .txt-coordination-error").css("display", "none");
        return true;
    }
}

// Get preview for field
var getPreviewForField = function () {
    $.ajax({
        type: "POST",
        url: "/Template/ExecuteScan",
        data: {
            fieldName: "nguyen",
            x: 50,
            y: 50,
            w: 100,
            h: 100,
            sourceId: sourceId
        },
        headers: {
            token: "foo"
        },
        success: function (data) {
            sourceId = data.message;
        },
        error: function () {
            alert("There was error uploading files!");
        }
    });
};

var validateStep2 = function () {
    var valid = true;
    var length = $("#box-fields .box-field").length;
    if (length == 0) {
        valid = false;
        alert(messageList.EM_008);
    }
    $("#box-fields .box-field").each(function () {
        var localValid = true;

        var name = $(this).find(".txt-field-name")[0];
        if (name.value.trim().length == 0) {
            $(this).find(".txt-field-name").addClass("error");
            $(this).find(".txt-field-name-error").css("display", "block");
            $(this).find(".txt-field-name-error").html(messageList.EM_009);
            localValid = false;
        } else if (name.value.trim().length > 50) {
            $(this).find(".txt-field-name").addClass("error");
            $(this).find(".txt-field-name-error").css("display", "block");
            $(this).find(".txt-field-name-error").html(messageList.EM_010);
            localValid = false;
        } else {
            $(this).find(".txt-field-name").removeClass("error");
            $(this).find(".txt-field-name-error").css("display", "none");
        }

        var isSet = checkCoordinationIsSet($(this).attr("id"));
        if (!isSet) {
            localValid = false;
            $(this).find(".txt-coordination-error").css("display", "inline-block");
            $(this).find(".txt-coordination-error").html(messageList.EM_012);
        } else {
            $(this).find(".txt-coordination-error").css("display", "none");
        }

        if (!localValid) {
            if ($(this).children(".box-field-body").css("display") == "none") {
                $(this).find(".glyphicon").addClass("glyphicon-menu-up");
                $(this).children(".box-field-body").toggle("fast");
            }
            valid = false;
        }
    });
    return valid;
}



/* ---------------------------------------- Step 3 ---------------------------------------- */
var validateStep3 = function () {
    var valid = true;

    var templateName = $("#box-step-three #txt-template-name")[0];
    if (templateName.value.trim().length == 0) {
        $("#box-step-three #txt-template-name").addClass("error");
        $("#box-step-three #txt-template-name-error").css("display", "block");
        $("#box-step-three #txt-template-name-error").html(messageList.EM_013);
        valid = false;
    } else if (templateName.value.trim().length > 50) {
        $("#box-step-three #txt-template-name").addClass("error");
        $("#box-step-three #txt-template-name-error").css("display", "block");
        $("#box-step-three #txt-template-name-error").html(messageList.EM_014);
        valid = false;
    } else {
        $("#box-step-three #txt-template-name").removeClass("error");
        $("#box-step-three #txt-template-name-error").css("display", "none");
    }

    var templateDesc = $("#box-step-three #txt-template-description")[0];
    if (templateDesc.value.trim().length == 0) {
        $("#box-step-three #txt-template-description").addClass("error");
        $("#box-step-three #txt-template-description-error").css("display", "block");
        $("#box-step-three #txt-template-description-error").html(messageList.EM_015);
        valid = false;
    } else if (templateDesc.value.trim().length > 500) {
        $("#box-step-three #txt-template-description").addClass("error");
        $("#box-step-three #txt-template-description-error").css("display", "block");
        $("#box-step-three #txt-template-description-error").html(messageList.EM_016);
        valid = false;
    } else {
        $("#box-step-three #txt-template-description").removeClass("error");
        $("#box-step-three #txt-template-description-error").css("display", "none");
    }

    return valid;
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