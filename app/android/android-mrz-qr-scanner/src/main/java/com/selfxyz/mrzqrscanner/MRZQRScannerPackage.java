package com.selfxyz.mrzqrscanner;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;
import com.selfxyz.mrzqrscanner.ui.PassportOCRViewManager;
import com.selfxyz.mrzqrscanner.ui.QRCodeScannerViewManager;

import java.util.ArrayList;
import java.util.List;

public class MRZQRScannerPackage implements ReactPackage {
    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        List<ViewManager> viewManagers = new ArrayList<>();
        viewManagers.add(new PassportOCRViewManager(reactContext));
        viewManagers.add(new QRCodeScannerViewManager(reactContext));
        return viewManagers;
    }

    @Override
    public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
        List<NativeModule> modules = new ArrayList<>();
        modules.add(new MRZQRScannerModule(reactContext));
        return modules;
    }
}
