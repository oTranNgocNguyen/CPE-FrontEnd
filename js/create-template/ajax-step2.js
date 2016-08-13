var ajaxListOfStep2 = [];

var setPreviewsAjax = function (fieldId, requestId) {
    if (!ajaxListOfStep2[fieldId]) {
        ajaxListOfStep2[fieldId] = [];
    }
    if (!isPreviewsAjaxExist(fieldId, requestId)) {
        var ajaxItem = { id: requestId, isCancelled: false };
        ajaxListOfStep2[fieldId].push(ajaxItem);
    }
};

var isPreviewsAjaxExist = function (fieldId, requestId) {
    for (var i = 0; i < ajaxListOfStep2[fieldId].length; i++) {
        if (ajaxListOfStep2[fieldId][i].id === requestId) {
            return true;
        }
    }
    return false;
};

var cancelPreviewsAjax = function (fieldId) {
    if (ajaxListOfStep2[fieldId]) {
        for (var i = 0; i < ajaxListOfStep2[fieldId].length; i++) {
            ajaxListOfStep2[fieldId][i].isCancelled = true;
        }
    }
};

var isCancelPreviewsAjax = function (fieldId, requestId) {
    if (ajaxListOfStep2[fieldId]) {
        for (var i = 0; i < ajaxListOfStep2[fieldId].length; i++) {
            if (ajaxListOfStep2[fieldId][i].id === requestId) {
                return ajaxListOfStep2[fieldId][i].isCancelled;
            }
        }
    }
    return false;
};