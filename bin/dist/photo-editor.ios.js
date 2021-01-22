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
var image_source_1 = require("image-source");
var frame = require("ui/frame");
var PhotoEditor = /** @class */ (function () {
    function PhotoEditor() {
        this._bundle = NSBundle.bundleForClass(PhotoEditorViewController.class());
    }
    PhotoEditor.prototype.editPhoto = function (options) {
        var _this = this;
        var viewController = PhotoEditorViewController.alloc().initWithNibNameBundle("PhotoEditorViewController", this._bundle);
        var nativeHiddenControls = [1 /* Sticker */, 5 /* Share */, 4 /* Save */];
        options.hiddenControls = options.hiddenControls || [];
        for (var _i = 0, _a = options.hiddenControls; _i < _a.length; _i++) {
            var hiddenControl = _a[_i];
            switch (hiddenControl) {
                case 0 /* Crop */:
                    nativeHiddenControls.push(0 /* Crop */);
                    break;
                case 2 /* Draw */:
                    nativeHiddenControls.push(2 /* Draw */);
                    break;
                case 3 /* Text */:
                    nativeHiddenControls.push(3 /* Text */);
                    break;
                // case PhotoEditorControl.Save:
                //     nativeHiddenControls.push(control.Save);
                //     break;
                case 6 /* Clear */:
                    nativeHiddenControls.push(6 /* Clear */);
                    break;
                default:
                    throw new Error("Unknown control sent: " + hiddenControl + "!");
            }
        }
        return new Promise(function (resolve, reject) {
            _this._delegate = PhotoEditorDelegateImpl.initWithResolveReject(resolve, reject);
            viewController.image = options.imageSource.ios;
            viewController.hiddenControls = nativeHiddenControls;
            viewController.photoEditorDelegate = _this._delegate;
            // @ts-ignore: Por algun motivo no esta en los types
            frame.Frame.topmost().ios.controller.showViewControllerSender(viewController, null);
            // @ts-ignore: Por algun motivo no esta en los types
            frame.Frame.topmost().ios.controller.setNavigationBarHiddenAnimated(viewController, true);
        });
    };
    return PhotoEditor;
}());
exports.PhotoEditor = PhotoEditor;
var PhotoEditorDelegateImpl = /** @class */ (function (_super) {
    __extends(PhotoEditorDelegateImpl, _super);
    function PhotoEditorDelegateImpl() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PhotoEditorDelegateImpl_1 = PhotoEditorDelegateImpl;
    PhotoEditorDelegateImpl.initWithResolveReject = function (resolve, reject) {
        var delegate = PhotoEditorDelegateImpl_1.new();
        delegate._resolve = resolve;
        delegate._reject = reject;
        return delegate;
    };
    PhotoEditorDelegateImpl.prototype.canceledEditing = function () {
        this._reject(new Error("User cancelled edit."));
        // @ts-ignore: Por algun motivo no esta en los types
        frame.Frame.topmost().ios.controller.popViewControllerAnimated(true);
    };
    PhotoEditorDelegateImpl.prototype.doneEditingWithImage = function (image) {
        var result = new image_source_1.ImageSource();
        result.setNativeSource(image);
        this._resolve(result);
        // @ts-ignore: Por algun motivo no esta en los types
        frame.Frame.topmost().ios.controller.popViewControllerAnimated(true);
    };
    var PhotoEditorDelegateImpl_1;
    PhotoEditorDelegateImpl = PhotoEditorDelegateImpl_1 = __decorate([
        ObjCClass(PhotoEditorDelegate)
    ], PhotoEditorDelegateImpl);
    return PhotoEditorDelegateImpl;
}(NSObject));
