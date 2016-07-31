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



    /* Step 2 */
    $('#btn-add-field').click(function () {
		/* For BE
        $.ajax({
            type: "GET",
            url: "/Template/AddField",
            success: function (data) {
                $('.box-field').each(function () {
                    $(this).children('.box-field-body').css("display", "none");
                    $(this).find('.glyphicon').removeClass('glyphicon-menu-up');
                });
                $('#box-fields').append(data);
                drawStatus = 1;
            },
            error: function () {
            }
        });
		*/
		/* For FE */
		$('#box-fields .box-field').each(function () {
			$(this).children('.box-field-body').css("display", "none");
			$(this).find('.glyphicon').removeClass('glyphicon-menu-up');
		});
		$('#box-fields').append($('#box-field-temp').html());
		var id = generateId(30);
		$('#box-fields .box-field').last().attr('id', id);
		drawStatus = 1;
		/* */
    });

    $(document).on("click", ".btn-set-coordination", function(e){
        drawStatus = 0;
		var rect = {'id': $(this).closest('.box-field').attr('id'), 'rect': currentRect};
        lstRect.push(rect);
        initRect();
    });
	
	$(document).on("click", ".btn-delete-field", function(e){
        drawStatus = 0;
		var id = $(this).closest('.box-field').attr('id');
		lstRect = lstRect.filter(function(item){
			return item.id != id; 
		});
		draw();
		$('#' + id).remove();
        initRect();
    });

    var canToggle = true;
    $(document).on("click", ".box-field-header", function(e){
        if (canToggle) {
            var boxFields = $('.box-field');
            var currentHeader = $(this)[0];
            $('.box-field').each(function () {
                var header = $(this).children('.box-field-header')[0];
                if (currentHeader != header) {
                    $(this).children('.box-field-body').css("display", "none");
                }
                $(this).find('.glyphicon').removeClass('glyphicon-menu-up');
            });
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

    $('.field-name').click(function () {
        canToggle = false;
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



/* ---------------------------------------- Common ---------------------------------------- */
function generateId (len){
        var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOP1234567890";
        var passwordLength = len || 8;
        var Id = "";
        for (var x = 0; x < passwordLength; x++) {
            var i = Math.floor(Math.random() * chars.length);
            Id += chars.charAt(i);
        };
        return Id;
    }