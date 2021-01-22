"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*! *****************************************************************************
Copyright (c) 2019 Tangra Inc.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
***************************************************************************** */
var application = require("application");
var file_system_1 = require("file-system");
var image_source_1 = require("image-source");
var PhotoEditor = /** @class */ (function () {
    function PhotoEditor() {
        var _this = this;
        // NOTE: Intentionally using lambda function we get a "good" this!
        this.onActivityResult = function (args) {
            if (args.requestCode === PhotoEditor.EDIT_PHOTO_REQUEST) {
                switch (args.resultCode) {
                    case android.app.Activity.RESULT_OK:
                        var resultIntent = args.intent;
                        var imagePath = resultIntent.getExtras().getString("imagePath");
                        var imageSource = image_source_1.fromFile(imagePath);
                        // Cleanup target temp file
                        file_system_1.File.fromPath(imagePath).removeSync();
                        _this._currentResolve(imageSource);
                        break;
                    case android.app.Activity.RESULT_CANCELED:
                        _this._currentReject(new Error("User cancelled edit."));
                        break;
                    default:
                        _this._currentReject(new Error("Photo Editor Result was: " + args.resultCode));
                        break;
                }
                // Cleanup source temp file
                if (_this._sourceTempFilePath && file_system_1.File.exists(_this._sourceTempFilePath)) {
                    file_system_1.File.fromPath(_this._sourceTempFilePath).removeSync();
                }
                // Cleanup events & current vars
                _this._sourceTempFilePath = undefined;
                _this._currentResolve = undefined;
                _this._currentReject = undefined;
                application.android.off("activityResult", _this.onActivityResult);
            }
        };
    }
    PhotoEditor.prototype.editPhoto = function (options) {
        var _this = this;
        options.hiddenControls = options.hiddenControls || [];
        application.android.on("activityResult", this.onActivityResult);
        return new Promise(function (resolve, reject) {
            _this._currentResolve = resolve;
            _this._currentReject = reject;
            _this._sourceTempFilePath = file_system_1.path.join(file_system_1.knownFolders.temp().path, (new Date()).getTime() + ".jpg");
            options.imageSource.saveToFile(_this._sourceTempFilePath, "jpg");
            var intent = new android.content.Intent(application.android.foregroundActivity, com.tangrainc.photoeditor.PhotoEditorActivity.class);
            intent.putExtra("selectedImagePath", _this._sourceTempFilePath);
            intent.putExtra("isCropIn", options.hiddenControls.indexOf(0 /* Crop */) === -1);
            intent.putExtra("isDrawIn", options.hiddenControls.indexOf(2 /* Draw */) === -1);
            intent.putExtra("isTextIn", options.hiddenControls.indexOf(3 /* Text */) === -1);
            intent.putExtra("isSaveIn", false);
            intent.putExtra("isClearIn", options.hiddenControls.indexOf(6 /* Clear */) === -1);
            application.android.foregroundActivity.startActivityForResult(intent, PhotoEditor.EDIT_PHOTO_REQUEST);
        });
    };
    PhotoEditor.EDIT_PHOTO_REQUEST = 9090;
    return PhotoEditor;
}());
exports.PhotoEditor = PhotoEditor;
