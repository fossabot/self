package com.selfxyz.mrzqrscanner;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;

public class MRZQRScannerModule extends ReactContextBaseJavaModule {
    public MRZQRScannerModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "MRZQRScannerModule";
    }
}
