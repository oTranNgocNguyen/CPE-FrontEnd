/* ---------------------------------------- Common ---------------------------------------- */
var changeTab = function (increment) {
    var activedTab;
    $('.create-template-tab-item').each(function () {
        if ($(this).hasClass('actived')) {
            activedTab = this;
        }
    });
    if (activedTab) {
        var step = parseInt($(activedTab).attr('step')) + increment;
        $(activedTab).removeClass('actived');
        switch (step) {
            case 1:
                $('#tab-step-one').addClass('actived');
                $('#box-step-one').css('display', 'block');
                $('#box-step-two').css('display', 'none');
                $('#box-step-three').css('display', 'none');
                $('#box-step-four').css('display', 'none');
                break;
            case 2:
                $('#tab-step-two').addClass('actived');
                $('#box-step-one').css('display', 'none');
                $('#box-step-two').css('display', 'block');
                $('#box-step-three').css('display', 'none');
                $('#box-step-four').css('display', 'none');
                break;
            case 3:
                $('#tab-step-three').addClass('actived');
                $('#box-step-one').css('display', 'none');
                $('#box-step-two').css('display', 'none');
                $('#box-step-three').css('display', 'block');
                $('#box-step-four').css('display', 'none');
                break;
            case 4:
                $('#tab-step-four').addClass('actived');
                $('#box-step-one').css('display', 'none');
                $('#box-step-two').css('display', 'none');
                $('#box-step-three').css('display', 'none');
                $('#box-step-four').css('display', 'block');
                break;
        }
    }
};

var enableButton = function (that) {
    $(that).removeAttr("disabled");
};



/* ---------------------------------------- Step 1 ---------------------------------------- */
var maxFileSize = 4 * 1024 * 1024;
var sourceId;
var acceptableFileTypes =
{
    'application/pdf': true,
    'image/png': true,
    'image/jpg': true,
    'image/jpeg': true
};
var templateObject = {
    Name: "",
    Description: "",
    Sample: "",
    SampleExtension: "",
    Option: 1
};
var fieldList = [];
var fieldItem = {
    Index: 0,
    Name: "",
    Area: { X: 0, Y: 0, Width: 0, Height: 0 },
    Type: 0,
    Status: 0
};
var ratio;

var showOneFileOnUploadBox = function (files) {
    if (files.length > 1) {
        $('.file-selected').html(messageList.EM_004);
        $('.file-selected').addClass('file-error');
    } else if (files.length === 1) {
        $('.file-selected').html(files[0].name);
        $('.file-selected').removeClass('file-error');
    } else {
        $('.file-selected').html("");
        $('.file-selected').removeClass('file-error');
    }
};

var validateSampleFile = function (files) {
    // Validate number of file
    if (files.length > 1) {
        $('.file-selected').html(messageList.EM_004);
        $('.file-selected').addClass('file-error');
        return false;
    } else if (files.length === 0) {
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
                return false;
            } else if (file.size === 0) {
                $('.file-selected').html(messageList.EM_020);
                $('.file-selected').addClass('file-error');
                return false;
            } else {
                return true;
            }
        } else {
            $('.file-selected').html(messageList.EM_002);
            $('.file-selected').addClass('file-error');
            return false;
        }
    }
};

var uploadSampleFile = function (files, that) {
    var valid = validateSampleFile(files);
    if (valid) {
        var file = files[0];

        // Check that user re-upload new sample file or not
        if (file === settings.currentSampleFile) {
            changeTab(1);
            enableButton(that);
            return;
        }

        var data = new FormData();
        data.append(file.name, file);

        $.ajax({
            type: "POST",
            url: "/Template/ImportSampleFile",
            contentType: false,
            processData: false,
            data: data,
            success: function (data) {
                if (data.status === 200) {
                    $("#box-fields").html("");
                    lstRect = [];
                    clearCurrentRect();
                    settings.currentSampleFile = file;

                    sourceId = data.imageData.sourceId;
                    buildBackgroundForCanvas(data.imageData);
                    changeTab(1);
                } else {
                    $('.file-selected').html(data.message);
                    $('.file-selected').addClass('file-error');
                }
                enableButton(that);
                // prevent leaving page accidentally
                prevent_leaving_page(true);
            },
            error: function () {
                alert("There was error uploading files!");
                enableButton(that);
            }
        });
    } else {
        enableButton(that);
    }
};

var buildBackgroundForCanvas = function (data) {
    templateObject.Sample = data.imageByte;
    templateObject.SampleExtension = data.extension;
    var myCanvas = document.getElementById('canvas');
    ratio = myCanvas.width / data.width;
    myCanvas.height = data.height * ratio;
    $("#canvas").css("background-image", "url(" + "data:image/" + data.extension + ";base64," + data.base64 + ")");
    $("#canvas").css("background-repeat", "no-repeat");
    $("#canvas").css("background-size", "100% auto");
};



/* ---------------------------------------- Step 2 ---------------------------------------- */

// Collapse all fields which have set
var collapseFields = function (currentId) {
    for (var i = 0; i < lstRect.length; i++) {
        if (lstRect[i].id !== currentId) {
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
        if ($(this).attr("id") !== id) {
            var isSet = checkCoordinationIsSet($(this).attr("id"));
            if (isSet) {
                displayCoordinationBtns($(this).find(".btn-set-coordination"), "set");
            } else {
                displayCoordinationBtns($(this).find(".btn-set-coordination"), "new");
            }
        }
    });
};

// Validate coordination before call OCR
var validateCoordination = function (that, rect) {
    if (rect.x === 0 && rect.y === 0 && rect.w === 0 && rect.h === 0) {
        $(that).closest(".box-field").find(".txt-coordination-error").css("display", "inline-block");
        $(that).closest(".box-field").find(".txt-coordination-error").html(messageList.EM_011);
        return false;
    } else {
        $("#box-step-two .txt-coordination-error").css("display", "none");
        return true;
    }
};

var getAjaxById = function (id) {
    for (var i = 0; i < settings.ajaxListOfStep2.length; i++) {
        if (settings.ajaxListOfStep2[i].id === id) {
            return settings.ajaxListOfStep2[i];
        }
    }
    return null;
};

// Get preview for field
var getPreviewForField = function (divField, fieldId) {
    var myRect = getCoordinationById(fieldId);
    myRect = buildCoordinationByRatio(myRect.rect, ratio);
    loadingPreview(divField, true);
    var request = $.ajax({
        type: "POST",
        url: "/Template/ExecuteScan",
        data: {
            fieldName: "nguyen",
            sourceId: sourceId,
            area: { X: myRect.x, Y: myRect.y, Width: myRect.w, Height: myRect.h }
        },
        headers: {
            token: "foo"
        },
        success: function (data) {
            getResult(divField, data.id, fieldId, 0);
        },
        error: function () {
            loadPreview(fieldId, { status: 4 });
        }
    });
};

var getResult = function (divField, ScanResultId, fieldId, countAjax) {
    if (countAjax > settings.maxGetPreviewRequest) {
        loadPreview(fieldId, { status: 4 });
        return;
    }
    setPreviewsAjax(fieldId, ScanResultId);
    var request = $.ajax({
        type: "GET",
        url: "/Template/GetResult",
        data: {
            ScanResultId: ScanResultId
        },
        headers: {
            token: "foo"
        },
        success: function (data) {
            if (isCancelPreviewsAjax(fieldId, ScanResultId)) {
                return;
            }
            if (data.status < 3) {
                setTimeout(
                    function () {
                        getResult(divField, ScanResultId, fieldId, countAjax + 1)
                    }, settings.waitNextGetPreviewRequest);
            } else {
                loadPreview(fieldId, data);
            }
        },
        error: function () {
            loadPreview(fieldId, { status: 4 });
        }
    });
};

var loadingPreview = function (that, isLoading) {
    if (isLoading) {
        $(that).find(".icon-loading").css("display", "inline-block");
        $(that).find(".desc-preview").css("display", "none");
    } else {
        $(that).find(".icon-loading").css("display", "none");
        $(that).find(".desc-preview").css("display", "inline-block");
    }
};

var loadPreview = function (fieldId, preview) {
    if(preview.status === 3){
        if (preview.scanData === "") {
            $("#" + fieldId).find('.desc-preview').html(messageList.EM_017);
            $("#" + fieldId).find('.desc-preview').addClass("error");
            $("#" + fieldId).find('.full-desc-preview').html(messageList.EM_017);
        } else {
            $("#" + fieldId).find('.desc-preview').html(preview.scanData);
            $("#" + fieldId).find('.desc-preview').removeClass("error");
            $("#" + fieldId).find('.full-desc-preview').html(preview.scanData);
        }
    } else {
        $("#" + fieldId).find('.desc-preview').html(messageList.EM_018);
        $("#" + fieldId).find('.desc-preview').addClass("error");
        $("#" + fieldId).find('.full-desc-preview').html(messageList.EM_018);
        alert(messageList.EM_019);
    }
    loadingPreview($("#" + fieldId), false);
}

var validateStep2 = function () {
    var valid = true;
    var length = $("#box-fields .box-field").length;
    if (length === 0) {
        valid = false;
        alert(messageList.EM_008);
    }
    $("#box-fields .box-field").each(function () {
        var localValid = true;

        var name = $(this).find(".txt-field-name")[0];
        if (name.value.trim().length === 0) {
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
            if ($(this).children(".box-field-body").css("display") === "none") {
                $(this).find(".glyphicon").addClass("glyphicon-menu-up");
                $(this).children(".box-field-body").toggle("fast");
            }
            valid = false;
        }
    });
    return valid;
};

var buildDataOfStep2 = function () {
    var index = 0;
    fieldList = [];
    $("#box-fields .box-field").each(function () {
        var fieldItem = {
            Index: 0,
            Name: "",
            Area: { X: 0, Y: 0, Width: 0, Height: 0 },
            Type: 0,
            Status: 0
        };
        fieldItem.Index = index;
        fieldItem.Name = $(this).find(".txt-field-name")[0].value.trim();
        var area = getCoordinationById($(this).attr("id")).rect;
        area = buildCoordinationByRatio(area, ratio);
        fieldItem.Area.X = parseInt(area.x);
        fieldItem.Area.Y = parseInt(area.y);
        fieldItem.Area.Width = parseInt(area.w);
        fieldItem.Area.Height = parseInt(area.h);
        fieldItem.Type = parseInt($(this).find(".field-type")[0].value);
        fieldItem.Status = 0;

        fieldList.push(fieldItem);
        index++;
    });
};



/* ---------------------------------------- Step 3 ---------------------------------------- */
var checkNameIsDuplicated = function (name) {
    var result = {IsDuplicated: false, Message: ""};
    $.ajax({
        type: "GET",
        url: "/Template/checkNameIsDuplicated",
        async: false,
        data: {
            name: name
        },
        success: function (data) {
            result = data;
        },
        error: function () {
        }
    });
    return result;
};

var validateStep3 = function () {
    var valid = true;

    var templateName = $("#box-step-three #txt-template-name")[0];
    if (templateName.value.trim().length === 0) {
        $("#box-step-three #txt-template-name").addClass("error");
        $("#box-step-three #txt-template-name-error").css("display", "block");
        $("#box-step-three #txt-template-name-error").html(messageList.EM_013);
        templateName.value = "";
        valid = false;
    } else if (templateName.value.trim().length > 50) {
        $("#box-step-three #txt-template-name").addClass("error");
        $("#box-step-three #txt-template-name-error").css("display", "block");
        $("#box-step-three #txt-template-name-error").html(messageList.EM_014);
        valid = false;
    } else {
        var data = checkNameIsDuplicated(templateName.value.trim());
        if (data.isDuplicated) {
            $("#box-step-three #txt-template-name").addClass("error");
            $("#box-step-three #txt-template-name-error").css("display", "block");
            $("#box-step-three #txt-template-name-error").html(data.message);
            valid = false;
        } else {
            $("#box-step-three #txt-template-name").removeClass("error");
            $("#box-step-three #txt-template-name-error").css("display", "none");
        }
    }

    var templateDesc = $("#box-step-three #txt-template-description")[0];
    if (templateDesc.value.trim().length > 500) {
        $("#box-step-three #txt-template-description").addClass("error");
        $("#box-step-three #txt-template-description-error").css("display", "block");
        $("#box-step-three #txt-template-description-error").html(messageList.EM_016);
        valid = false;
    } else {
        $("#box-step-three #txt-template-description").removeClass("error");
        $("#box-step-three #txt-template-description-error").css("display", "none");
    }

    return valid;
};

var buildDataOfStep3 = function () {
    templateObject.Name = $("#box-step-three #txt-template-name")[0].value.trim();
    templateObject.Description = $("#box-step-three #txt-template-description")[0].value.trim().replace(/\n/g, '<br />');
};



/* ---------------------------------------- Step 4 ---------------------------------------- */
var displayDataForStep4 = function () {
    $("#box-step-four").find("#title-template-name").text(templateObject.Name);
    $("#box-step-four").find("#title-template-description").text(templateObject.Description);
    $("#box-step-four").find("#title-template-verification-required").text(templateObject.Option == 1 ? "Yes" : "No");
    $("#box-step-four").find("#title-template-email").text(templateObject.Name + "@cpe.com");
    $("#box-step-four").find("#box-defined-fields-body").html("");
    for (var i = 0; i < fieldList.length; i++) {
        var div = document.createElement('div');
        div.className = "box-defined-field";
        div.textContent = fieldList[i].Name;
        $("#box-step-four").find("#box-defined-fields-body").append(div);
    }
};

var showFinishCreateTemplatePopup = function () {
    // stop preventing leaving page accidentally
    prevent_leaving_page(false);
    var dialog = $("#dialog-create-template");
    $(dialog).find(".modal-body").text(templateObject.Name + " has been created successfully.");
    dialog.modal();
    $(dialog).on('hide.bs.modal', function (aEvent) {
        window.location.href = '/Template/List/';
    });
};



/* ---------------------------------------- Common ---------------------------------------- */
var generateId = function (len) {
    var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOP1234567890";
    var passwordLength = len || 8;
    var Id = "";
    for (var x = 0; x < passwordLength; x++) {
        var i = Math.floor(Math.random() * chars.length);
        Id += chars.charAt(i);
    }
    return Id;
};