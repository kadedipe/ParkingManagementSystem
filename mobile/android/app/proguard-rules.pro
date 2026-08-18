# ============================================================================
# ProGuard Rules
# ============================================================================

# React Native
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }

# Firebase
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }

# Google Play Services
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.android.gms.**

# React Native Navigation
-keep class com.reactnativenavigation.** { *; }

# React Native Vector Icons
-keep class com.oblador.vectoricons.** { *; }

# React Native Maps
-keep class com.airbnb.android.react.maps.** { *; }

# Glide
-keep public class * implements com.bumptech.glide.module.GlideModule
-keep public enum com.bumptech.glide.load.ImageHeaderParser$** {
  **[] $VALUES;
  public *;
}

# OkHttp
-dontwarn okhttp3.**
-dontwarn okio.**
-dontwarn javax.annotation.**
-dontwarn org.conscrypt.**
-dontwarn org.codehaus.mojo.animal_sniffer.IgnoreJRERequirement

# WebSocket
-keep class org.java_websocket.** { *; }

# Keep all native methods
-keepclasseswithmembers class * {
    native <methods>;
}

# Keep all classes that extend ReactContextBaseJavaModule
-keep public class * extends com.facebook.react.bridge.ReactContextBaseJavaModule {
    public <init>(...);
}

# Keep all classes that extend ReactModule
-keep public class * extends com.facebook.react.bridge.ReactModule {
    public <init>(...);
}

# Keep all React Native UI components
-keep public class * extends com.facebook.react.uimanager.ReactShadowNode {
    public <init>(...);
}

-keep public class * extends com.facebook.react.uimanager.ViewManager {
    public <init>(...);
}

# Keep all JavaScript interfaces
-keep class * extends com.facebook.react.bridge.JavaScriptModule { *; }
-keep class * implements com.facebook.react.bridge.JavaScriptModule { *; }

# Keep all React Native bridge methods
-keepclassmembers class * {
    @com.facebook.react.bridge.ReactMethod *;
}

# Keep all React Native UI manager methods
-keepclassmembers class * {
    @com.facebook.react.uimanager.annotations.ReactProp *;
    @com.facebook.react.uimanager.annotations.ReactPropGroup *;
}

# Keep all React Native module methods
-keepclassmembers class * {
    @com.facebook.react.bridge.ReactModule *;
}