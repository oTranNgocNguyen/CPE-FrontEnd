var isAdvancedUpload = function () {
    var div = document.createElement('div');
    return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
}();

var showFiles = function (files) {
    if (files.length > 1) {
        $('.file-selected').html('Please choose only one sample file.');
        $('.file-selected').addClass('file-error');
    } else {
        $('.file-selected').html(files[0].name);
        $('.file-selected').removeClass('file-error');
    }
};


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
        drawStatus = 0;
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
        drawStatus = 1;
        clearCurrentRect();
        displayCoordinationBtns(this, "setting");

        /* Check and display buttons of all fields */
        var id = $(this).closest('.box-field').attr('id');
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

    $(document).on("click", ".btn-edit-coordination", function (e) {
        drawStatus = 2;
        getRectangeForEdit($(this).closest('.box-field').attr('id'));
        displayCoordinationBtns(this, "setting");
    });

    $(document).on("click", ".btn-delete-field", function (e) {
        drawStatus = 0;
        removeItemOutOfRectList($(this).closest('.box-field').attr('id'));
        clearCurrentRect();
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
var validateSampleFile = function (files) {
    // Validate number of file
    if (files.length > 1) {
        $('.file-selected').html('Please choose only one sample file.');
        $('.file-selected').addClass('file-error');
        return false;
    } else if (files.length == 0) {
        $('.file-selected').html('Please choose a sample file.');
        $('.file-selected').addClass('file-error');
        return false;
    } else {
        // Validate type of file
        var file = files[0];
        if (file.type.indexOf('image/') > -1 || file.type.indexOf('application/pdf') > -1) {
            return true;
        } else {
            $('.file-selected').html('Please choose image file or pdf file.');
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

/* Collapse all fields which have set */
function collapseFields(currentId) {
    for (var i = 0; i < lstRect.length; i++) {
        if (lstRect[i].id != currentId) {
            $('#' + lstRect[i].id).children('.box-field-body').css("display", "none");
            $('#' + lstRect[i].id).find('.glyphicon').removeClass('glyphicon-menu-up');
        }
    }
};

function displayCoordinationBtns(that, stt) {
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



/* ---------------------------------------- Common ---------------------------------------- */
function generateId(len) {
    var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOP1234567890";
    var passwordLength = len || 8;
    var Id = "";
    for (var x = 0; x < passwordLength; x++) {
        var i = Math.floor(Math.random() * chars.length);
        Id += chars.charAt(i);
    };
    return Id;
};