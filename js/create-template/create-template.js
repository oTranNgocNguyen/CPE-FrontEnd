$(document).ready(function () {
    var formUpload = $('.box-upload-file')[0];
    var inputFile = formUpload.querySelector('input[type="file"]');

    initDraggableFileForUploadBox(formUpload, inputFile);

    inputFile.addEventListener('change', function (e) {
        showOneFileOnUploadBox(e.target.files);
    });

    $('.btn-submit-without-double').click(function () {
        $(this).attr('disabled', 'disabled');
    });

    $("#btn-upload-file").click(function (evt) {
        /* For BE
        uploadSampleFile(inputFile.files, this);
        /* */
        /* For FE */
        if (sourceId == undefined) {
            $("#box-fields").html("");
            lstRect = [];
            clearCurrentRect();
        }
        buildWidthForCanvas();
        changeTab(1);
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
            if ($(this).parent().children('.box-field-body').css('display') === 'block') {
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
        cancelPreviewsAjax($(this).closest('.box-field').attr('id'));
        var valid = validateCoordination(this, currentRect);
        if (valid) {
            buildRectList($(this).closest('.box-field').attr('id'), false);
            // getPreviewForField($(this).closest('.box-field'), $(this).closest('.box-field').attr('id'));
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
        if ($(this).closest('.box-field').attr('id') === currentId) {
            drawStatus = 0;
            clearCurrentRect();
            edittingRect = false;
        }
        removeItemOutOfRectList($(this).closest('.box-field').attr('id'));
        draw();
        $('#' + $(this).closest('.box-field').attr('id')).remove();
    });

    $("#btn-step2-next").click(function (evt) {
        collapseFields();
        var valid = validateStep2();
        if (valid) {
            buildDataOfStep2();
            changeTab(1);
        }
        enableButton(this);
    });

    $("#btn-step2-back").click(function (evt) {
        changeTab(-1);
        enableButton(this);
    });



    /* ---------------------------------------- Step 3 ---------------------------------------- */
    $('#box-verification button').click(function () {
        if ($(this).hasClass('locked_active') || $(this).hasClass('unlocked_inactive')) {
            templateObject.Option = 1;
        } else {
            templateObject.Option = 0;
        }

        /* reverse locking status */
        $('#box-verification button').eq(0).toggleClass('unlocked_inactive unlocked_active btn-info btn-default');
        $('#box-verification button').eq(1).toggleClass('locked_inactive locked_active btn-default btn-info');
    });

    $("#btn-step3-next").click(function (evt) {
        var valid = validateStep3();
        if (valid) {
            buildDataOfStep3();
            displayDataForStep4();
            changeTab(1);
        }
        enableButton(this);
    });

    $("#btn-step3-back").click(function (evt) {
        changeTab(-1);
        enableButton(this);
    });



    /* ---------------------------------------- Step 4 ---------------------------------------- */
    $("#btn-step4-next").click(function (evt) {
        $.ajax({
            type: "POST",
            url: "/Template/Create",
            data: {
                template: templateObject,
                lstField: fieldList
            },
            headers: {
                token: "foo"
            },
            success: function (data) {
                if (data.status === 200) {
                    showFinishCreateTemplatePopup();
                }
                enableButton(this);
            },
            error: function () {
                alert("There was error creating template!");
            }
        });
    });

    $("#btn-step4-back").click(function (evt) {
        changeTab(-1);
        enableButton(this);
    });
});