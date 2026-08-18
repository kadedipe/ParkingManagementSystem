package com.parkingsystem;

import android.os.Bundle;
import android.os.Build;
import android.view.WindowManager;
import android.view.View;
import android.content.Intent;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactActivityDelegate;
import com.facebook.react.modules.core.PermissionListener;

import com.zoontek.rnbootsplash.RNBootSplash;

public class MainActivity extends ReactActivity {

    // Permission listener for handling runtime permissions
    private PermissionListener mPermissionListener;

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "ParkingSystem";
    }

    /**
     * Returns the instance of the {@link ReactActivityDelegate}. Here we use a util class {@link
     * DefaultReactActivityDelegate} which allows you to enable New Architecture with a single
     * boolean flags {@link DefaultNewArchitectureEntryPoint#CONFIG}
     */
    @Override
    protected ReactActivityDelegate createReactActivityDelegate() {
        return new DefaultReactActivityDelegate(
                this,
                getMainComponentName(),
                // If you opted-in for the New Architecture, we enable the Fabric Renderer.
                DefaultNewArchitectureEntryPoint.getFabricEnabled()
        );
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Set status bar and navigation bar colors
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            getWindow().setStatusBarColor(getResources().getColor(R.color.status_bar_color));
            getWindow().setNavigationBarColor(getResources().getColor(R.color.navigation_bar_color));
        }

        // Show splash screen
        RNBootSplash.init(R.drawable.splash_screen, MainActivity.this);

        super.onCreate(savedInstanceState);

        // Check for deep link intent
        Intent intent = getIntent();
        String action = intent.getAction();
        String data = intent.getDataString();

        if (Intent.ACTION_VIEW.equals(action) && data != null) {
            // Handle deep link
            handleDeepLink(data);
        }

        // Full screen mode (optional)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            getWindow().getDecorView().setSystemUiVisibility(
                    View.SYSTEM_UI_FLAG_LAYOUT_STABLE |
                    View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
            );
        }
    }

    @Override
    public void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);

        // Handle deep link from background
        String data = intent.getDataString();
        if (data != null) {
            handleDeepLink(data);
        }
    }

    /**
     * Handle deep link
     */
    private void handleDeepLink(String data) {
        // Send deep link to React Native
        try {
            // You can send this to your React Native module
            // For example: sendDeepLinkToReact(data);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * Set permission listener
     */
    public void setPermissionListener(PermissionListener listener) {
        mPermissionListener = listener;
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        if (mPermissionListener != null) {
            mPermissionListener.onRequestPermissionsResult(requestCode, permissions, grantResults);
        }
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
    }
}