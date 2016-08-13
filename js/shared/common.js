// Check that browser is supported draggable file or not
var isDraggableFile = function () {
    var div = document.createElement('div');
    return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
}();

// Init draggable file feature for an upload box
var initDraggableFileForUploadBox = function (form, inputFile) {
    if (isDraggableFile) {
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
            inputFile.files = droppedFiles;
        });
    }
};