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
        /* For BE */
        uploadSampleFile(input.files);
        /* */
        /* For FE
        changeTab();
        /* */
    });



    /* ---------------------------------------- Step 2 ---------------------------------------- */
    var canToggle = true;
    var currentId;
    $('#btn-add-field').click(function () {
        /* For BE */
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
        /* For FE
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
        var valid = validateCoordination(this, currentRect);
        if (valid) {
            buildRectList($(this).closest('.box-field').attr('id'), false);
            getPreviewForField($(this).closest('.box-field'), $(this).closest('.box-field').attr('id'));
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

    $(document).on("click", "#btn-step2-next", function (e) {
        collapseFields();
        var valid = validateStep2();
        if (valid) {
            buildDataOfStep2();
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
            buildDataOfStep3();
            displayDataForStep4();
            changeTab();
        }
    });



    /* ---------------------------------------- Step 4 ---------------------------------------- */
    $(document).on("click", "#btn-step4-next", function (e) {
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
            },
            error: function () {
                alert("There was error creating template!");
            }
        });
    });
});